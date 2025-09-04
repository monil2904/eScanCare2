import {
    CalendarIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('today');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      await Promise.all([
        fetchDoctorStats(),
        fetchTodayAppointments(),
        fetchRecentPatients()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Today's appointments for this doctor
      const { count: todayCount, error: todayError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id)
        .gte('appointment_date', `${today}T00:00:00`)
        .lt('appointment_date', `${today}T23:59:59`);

      if (todayError) throw todayError;

      // Pending appointments for this doctor
      const { count: pendingCount, error: pendingError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id)
        .eq('status', 'scheduled');

      if (pendingError) throw pendingError;

      // Completed appointments for this doctor
      const { count: completedCount, error: completedError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id)
        .eq('status', 'completed');

      if (completedError) throw completedError;

      // Total unique patients for this doctor
      const { data: patientsData, error: patientsError } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', user.id);

      if (patientsError) throw patientsError;

      const uniquePatients = new Set(patientsData.map(apt => apt.patient_id)).size;

      setStats({
        totalPatients: uniquePatients,
        todayAppointments: todayCount || 0,
        pendingAppointments: pendingCount || 0,
        completedAppointments: completedCount || 0
      });
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching appointments for date:', today);
      
      // First, let's get all appointments for this doctor to see what dates we have
      const { data: allAppointments, error: allError } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('doctor_id', user.id)
        .limit(10);
      
      console.log('All appointment dates for this doctor:', allAppointments);
      
      // Try multiple date query approaches
      let data, error;
      
      console.log('Trying date query approaches...');
      
      // First try: exact date match
      const result1 = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(full_name, phone, email),
          department:departments(name)
        `)
        .eq('doctor_id', user.id)
        .ilike('appointment_date', `${today}%`);
      
      console.log('Result 1 (exact date match):', result1.data);
      
      if (result1.data && result1.data.length > 0) {
        data = result1.data;
        error = result1.error;
        console.log('Using result 1');
      } else {
        // Second try: date range query
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        
        console.log('Trying date range:', startOfDay.toISOString(), 'to', endOfDay.toISOString());
        
        const result2 = await supabase
          .from('appointments')
          .select(`
            *,
            patient:profiles!appointments_patient_id_fkey(full_name, phone, email),
            department:departments(name)
          `)
          .eq('doctor_id', user.id)
          .gte('appointment_date', startOfDay.toISOString())
          .lte('appointment_date', endOfDay.toISOString());
        
        console.log('Result 2 (date range):', result2.data);
        data = result2.data;
        error = result2.error;
        console.log('Using result 2');
      }
      
      // If still no results, try client-side filtering
      if (!data || data.length === 0) {
        console.log('Trying client-side filtering...');
        const result3 = await supabase
          .from('appointments')
          .select(`
            *,
            patient:profiles!appointments_patient_id_fkey(full_name, phone, email),
            department:departments(name)
          `)
          .eq('doctor_id', user.id);
        
        if (result3.data) {
          // Filter appointments for today on client side
          const todayAppointments = result3.data.filter(appointment => {
            const appointmentDate = new Date(appointment.appointment_date);
            const todayDate = new Date(today);
            return appointmentDate.toDateString() === todayDate.toDateString();
          });
          
          console.log('Client-side filtered appointments:', todayAppointments);
          data = todayAppointments;
          error = result3.error;
        }
      }
      
      data = data || [];
      error = error || null;

      if (error) throw error;
      
      console.log('Raw appointments data:', data);
      
      // Filter out appointments with null patient data
      const validAppointments = (data || []).filter(appointment => 
        appointment.patient && appointment.patient.full_name
      );
      
      console.log('Valid appointments:', validAppointments);
      
      // If no appointments today, show recent appointments from last 7 days
      if (validAppointments.length === 0) {
        console.log('No appointments today, fetching recent appointments...');
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastWeekStr = lastWeek.toISOString().split('T')[0];
        
        const { data: recentData, error: recentError } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:profiles!appointments_patient_id_fkey(full_name, phone, email),
            department:departments(name)
          `)
          .eq('doctor_id', user.id)
          .gte('appointment_date', `${lastWeekStr}T00:00:00`)
          .order('appointment_date', { ascending: false })
          .limit(10);
        
        if (recentError) throw recentError;
        
        const validRecentAppointments = (recentData || []).filter(appointment => 
          appointment.patient && appointment.patient.full_name
        );
        
        console.log('Recent appointments:', validRecentAppointments);
        setTodayAppointments(validRecentAppointments);
      } else {
        setTodayAppointments(validAppointments);
      }
    } catch (error) {
      console.error('Error fetching today appointments:', error);
    }
  };

  const fetchRecentPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          patient:profiles!appointments_patient_id_fkey(id, full_name, phone, email, date_of_birth, gender),
          appointment_date,
          status
        `)
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Get unique patients from recent appointments with null checks
      const uniquePatients = data.reduce((acc, appointment) => {
        // Check if patient data exists and has an id
        if (appointment.patient && appointment.patient.id) {
          const patientId = appointment.patient.id;
          if (!acc.find(p => p.id === patientId)) {
            acc.push(appointment.patient);
          }
        }
        return acc;
      }, []);
      
      setRecentPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching recent patients:', error);
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: action })
        .eq('id', appointmentId)
        .eq('doctor_id', user.id); // Ensure doctor can only update their own appointments

      if (error) throw error;

      toast.success(`Appointment ${action} successfully`);
      
      // Refresh the data
      await Promise.all([
        fetchTodayAppointments(),
        fetchDoctorStats()
      ]);
    } catch (error) {
      console.error(`Error ${action} appointment:`, error);
      toast.error(`Failed to ${action} appointment`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctor dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600">Welcome back, Dr. {user?.user_metadata?.full_name || 'Doctor'}</p>
          </div>
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-500">Medical Portal</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <PlusIcon className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium">Add Medical Record</span>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentTextIcon className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-sm font-medium">Write Prescription</span>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ClipboardDocumentListIcon className="w-5 h-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium">View Patient History</span>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="w-5 h-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium">Analytics</span>
          </button>
        </div>
      </div>

      {/* Today's Schedule and Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <span className="text-sm text-gray-500">
              {todayAppointments.length > 0 && todayAppointments[0]?.appointment_date?.includes(new Date().toISOString().split('T')[0]) 
                ? new Date().toLocaleDateString() 
                : 'Recent Appointments'}
            </span>
          </div>
          
          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                                             <div className="flex items-center gap-2 mb-1">
                         <span className="font-medium">{appointment.patient?.full_name || 'Unknown Patient'}</span>
                         <span className="text-sm text-gray-500">•</span>
                         <span className="text-sm text-gray-600">{appointment.department?.name || 'No Department'}</span>
                       </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>Time: {formatTime(appointment.appointment_time)}</span>
                        <span>•</span>
                        <span>Type: {appointment.type}</span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600">Notes: {appointment.notes}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  {appointment.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'completed')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'cancelled')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments scheduled for today</p>
              <p className="text-sm text-gray-500 mt-2">Check back later or contact the admin to schedule appointments</p>
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h2>
          {recentPatients.length > 0 ? (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="p-3 border border-gray-200 rounded-lg">
                                     <div className="flex items-center justify-between mb-2">
                     <span className="font-medium">{patient.full_name || 'Unknown Patient'}</span>
                     <span className="text-sm text-gray-500">{calculateAge(patient.date_of_birth)}y</span>
                   </div>
                   <div className="text-sm text-gray-600 space-y-1">
                     <p>Phone: {patient.phone || 'N/A'}</p>
                     <p>Gender: {patient.gender || 'N/A'}</p>
                   </div>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                    View History →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent patients</p>
            </div>
          )}
        </div>
      </div>

      {/* Search Patients */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Patients</h2>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients by name, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 