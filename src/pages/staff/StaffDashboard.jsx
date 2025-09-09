import {
    BellIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    PhoneIcon,
    PlusIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AppointmentScheduler from '../../components/staff/AppointmentScheduler';
import MedicalReportForm from '../../components/staff/MedicalReportForm';
import MedicalReportView from '../../components/staff/MedicalReportView';
import PatientRegistrationForm from '../../components/staff/PatientRegistrationForm';
import PatientSearch from '../../components/staff/PatientSearch';
import PrescriptionForm from '../../components/staff/PrescriptionForm';
import PrescriptionView from '../../components/staff/PrescriptionView';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const StaffDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    activeDepartments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('recent');
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);
  const [showMedicalReportForm, setShowMedicalReportForm] = useState(false);
  const [showMedicalReportView, setShowMedicalReportView] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showPrescriptionView, setShowPrescriptionView] = useState(false);
  const [showPatientRegistration, setShowPatientRegistration] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionExists, setPrescriptionExists] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      await Promise.all([
        fetchPatientStats(),
        fetchAppointmentStats(),
        fetchRecentAppointments(),
        fetchPendingAppointments()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientStats = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'patient');

      if (error) throw error;
      setStats(prev => ({ ...prev, totalPatients: count || 0 }));
    } catch (error) {
      console.error('Error fetching patient stats:', error);
    }
  };

  const fetchAppointmentStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Today's appointments
      const { count: todayCount, error: todayError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', `${today}T00:00:00`)
        .lt('appointment_date', `${today}T23:59:59`);

      if (todayError) throw todayError;

      // Pending appointments
      const { count: pendingCount, error: pendingError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled');

      if (pendingError) throw pendingError;

      // Active departments
      const { count: deptCount, error: deptError } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (deptError) throw deptError;

      setStats(prev => ({
        ...prev,
        todayAppointments: todayCount || 0,
        pendingAppointments: pendingCount || 0,
        activeDepartments: deptCount || 0
      }));
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
    }
  };

  const fetchRecentAppointments = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(full_name, phone),
          doctor:profiles!appointments_doctor_id_fkey(full_name),
          department:departments(name)
        `)
        .gte('appointment_date', today.toISOString())
        .order('appointment_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      setRecentAppointments(data || []);
      
      // Check which appointments have prescriptions
      await checkPrescriptionExists(data || []);
    } catch (error) {
      console.error('Error fetching recent appointments:', error);
    }
  };

  const fetchPendingAppointments = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(full_name, phone, email),
          doctor:profiles!appointments_doctor_id_fkey(full_name),
          department:departments(name)
        `)
        .eq('status', 'scheduled')
        .gte('appointment_date', today.toISOString())
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setPendingAppointments(data || []);
      
      // Check which appointments have prescriptions
      await checkPrescriptionExists(data || []);
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: action })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success(`Appointment ${action} successfully`);
      
      // Refresh the data
      await Promise.all([
        fetchPendingAppointments(),
        fetchRecentAppointments(),
        fetchAppointmentStats()
      ]);
    } catch (error) {
      console.error(`Error ${action} appointment:`, error);
      toast.error(`Failed to ${action} appointment`);
    }
  };

  const handleAppointmentCreated = () => {
    // Refresh dashboard data when a new appointment is created
    fetchDashboardData();
  };

  const handleMedicalReportCreated = () => {
    // Refresh dashboard data when a new medical report is created
    fetchDashboardData();
  };

  const handlePrescriptionCreated = () => {
    // Refresh dashboard data when a new prescription is created
    fetchDashboardData();
  };

  const handlePatientRegistered = () => {
    // Refresh dashboard data when a new patient is registered
    fetchDashboardData();
  };

  const handlePatientSelected = (patient) => {
    setSelectedPatient(patient);
    // You can add additional logic here, like opening a patient details modal
  };

  const openMedicalReportForm = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMedicalReportForm(true);
  };

  const openMedicalReportView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMedicalReportView(true);
  };

  const openPrescriptionForm = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionForm(true);
  };

  const openPrescriptionView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionView(true);
  };

  const checkPrescriptionExists = async (appointments) => {
    try {
      const appointmentIds = appointments.map(apt => apt.id);
      
      if (appointmentIds.length === 0) return;
      
      const { data, error } = await supabase
        .from('prescriptions')
        .select('appointment_id')
        .in('appointment_id', appointmentIds);

      if (error) throw error;
      
      const prescriptionMap = {};
      data.forEach(prescription => {
        prescriptionMap[prescription.appointment_id] = true;
      });
      
      setPrescriptionExists(prescriptionMap);
    } catch (error) {
      console.error('Error checking prescription existence:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading staff dashboard...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.user_metadata?.full_name || 'Staff Member'}</p>
          </div>
          <div className="flex items-center gap-2">
            <BellIcon className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500">Staff Portal</span>
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
              <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Departments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDepartments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowPatientRegistration(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium">Register Patient</span>
          </button>
          
          <button 
            onClick={() => setShowAppointmentScheduler(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CalendarIcon className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-sm font-medium">Schedule Appointment</span>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <PhoneIcon className="w-5 h-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium">Contact Patient</span>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ClipboardDocumentListIcon className="w-5 h-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium">View Reports</span>
          </button>
        </div>
      </div>

      {/* Search and Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Patients</h2>
          <PatientSearch onPatientSelected={handlePatientSelected} />
        </div>

        {/* Appointments Management */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedTab('recent')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'recent' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSelectedTab('pending')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'pending' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending ({pendingAppointments.length})
              </button>
            </div>
          </div>

          {selectedTab === 'recent' ? (
            // Recent Appointments
            recentAppointments.length > 0 ? (
              <div className="space-y-3">
                {recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{appointment.patient?.full_name}</span>
                          <span className="text-sm text-gray-500">with</span>
                          <span className="font-medium">Dr. {appointment.doctor?.full_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>{appointment.department?.name}</span>
                          <span>•</span>
                          <span>{formatDate(appointment.appointment_date)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Phone: {appointment.patient?.phone}</p>
                          <p>Notes: {appointment.notes || 'No notes'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === 'completed' ? (
                        <>
                          <button
                            onClick={() => openMedicalReportView(appointment)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          >
                            View Medical Report
                          </button>
                          <button
                            onClick={() => prescriptionExists[appointment.id] ? openPrescriptionView(appointment) : openPrescriptionForm(appointment)}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                          >
                            {prescriptionExists[appointment.id] ? 'View Prescription' : 'Prescription'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openMedicalReportForm(appointment)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Medical Report
                          </button>
                          <button
                            onClick={() => prescriptionExists[appointment.id] ? openPrescriptionView(appointment) : openPrescriptionForm(appointment)}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                          >
                            {prescriptionExists[appointment.id] ? 'View Prescription' : 'Prescription'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent appointments</p>
              </div>
            )
          ) : (
            // Pending Appointments with Actions
            pendingAppointments.length > 0 ? (
              <div className="space-y-3">
                {pendingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{appointment.patient?.full_name}</span>
                          <span className="text-sm text-gray-500">with</span>
                          <span className="font-medium">Dr. {appointment.doctor?.full_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>{appointment.department?.name}</span>
                          <span>•</span>
                          <span>{formatDate(appointment.appointment_date)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Phone: {appointment.patient?.phone}</p>
                          <p>Notes: {appointment.notes || 'No notes'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'cancelled')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                      {appointment.status === 'completed' ? (
                        <>
                          <button
                            onClick={() => openMedicalReportView(appointment)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          >
                            View Medical Report
                          </button>
                          <button
                            onClick={() => prescriptionExists[appointment.id] ? openPrescriptionView(appointment) : openPrescriptionForm(appointment)}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                          >
                            {prescriptionExists[appointment.id] ? 'View Prescription' : 'Prescription'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openMedicalReportForm(appointment)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Medical Report
                          </button>
                          <button
                            onClick={() => prescriptionExists[appointment.id] ? openPrescriptionView(appointment) : openPrescriptionForm(appointment)}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                          >
                            {prescriptionExists[appointment.id] ? 'View Prescription' : 'Prescription'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending appointments</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Department Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Cardiology</h3>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <p className="text-sm text-gray-600">3 doctors • 12 appointments today</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Neurology</h3>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <p className="text-sm text-gray-600">2 doctors • 8 appointments today</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Emergency</h3>
              <span className="text-sm text-red-600">Busy</span>
            </div>
            <p className="text-sm text-gray-600">4 doctors • 25 appointments today</p>
          </div>
        </div>
      </div>

      {/* Appointment Scheduler Modal */}
      <AppointmentScheduler
        isOpen={showAppointmentScheduler}
        onClose={() => setShowAppointmentScheduler(false)}
        onAppointmentCreated={handleAppointmentCreated}
      />

      {/* Medical Report Form Modal */}
      {selectedAppointment && (
        <MedicalReportForm
          isOpen={showMedicalReportForm}
          onClose={() => {
            setShowMedicalReportForm(false);
            setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment.id}
          patientId={selectedAppointment.patient_id}
          doctorId={selectedAppointment.doctor_id}
          onReportCreated={handleMedicalReportCreated}
        />
      )}

      {/* Medical Report View Modal */}
      {selectedAppointment && (
        <MedicalReportView
          isOpen={showMedicalReportView}
          onClose={() => {
            setShowMedicalReportView(false);
            setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment.id}
          patientId={selectedAppointment.patient_id}
          doctorId={selectedAppointment.doctor_id}
          onReportUpdated={handleMedicalReportCreated}
        />
      )}

      {/* Prescription Form Modal */}
      {selectedAppointment && (
        <PrescriptionForm
          isOpen={showPrescriptionForm}
          onClose={() => {
            setShowPrescriptionForm(false);
            setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment.id}
          patientId={selectedAppointment.patient_id}
          doctorId={selectedAppointment.doctor_id}
          onPrescriptionCreated={handlePrescriptionCreated}
        />
      )}

      {/* Prescription View Modal */}
      {selectedAppointment && (
        <PrescriptionView
          isOpen={showPrescriptionView}
          onClose={() => {
            setShowPrescriptionView(false);
            setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment.id}
          patientId={selectedAppointment.patient_id}
          doctorId={selectedAppointment.doctor_id}
          onPrescriptionUpdated={handlePrescriptionCreated}
        />
      )}

      {/* Patient Registration Modal */}
      <PatientRegistrationForm
        isOpen={showPatientRegistration}
        onClose={() => setShowPatientRegistration(false)}
        onPatientRegistered={handlePatientRegistered}
      />
    </div>
  );
};

export default StaffDashboard; 