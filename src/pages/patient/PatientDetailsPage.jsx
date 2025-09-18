import {
  CalendarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const PatientDetailsPage = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient profile
      const { data: patientData, error: patientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patientId)
        .eq('user_type', 'patient')
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch prescriptions
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name),
          appointment:appointments(appointment_date, department:departments(name))
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;
      setPrescriptions(prescriptionsData || []);

      // Fetch medical records
      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select(`
          *,
          doctor:profiles!medical_records_doctor_id_fkey(full_name),
          appointment:appointments(appointment_date, department:departments(name))
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;
      setMedicalRecords(recordsData || []);

    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient information');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Not Found</h2>
          <p className="text-gray-600">The patient information could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
                <p className="text-gray-600">Patient ID: {patient.id.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Age: {calculateAge(patient.date_of_birth)} years</p>
              <p className="text-sm text-gray-500">{patient.gender}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{patient.phone || 'No phone number'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{patient.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">
                DOB: {patient.date_of_birth ? formatDate(patient.date_of_birth) : 'Not provided'}
              </span>
            </div>
            {patient.blood_type && (
              <div className="flex items-center space-x-3">
                <HeartIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Blood Type: {patient.blood_type}</span>
              </div>
            )}
          </div>

          {patient.address && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Address</h3>
              <p className="text-gray-700">
                {patient.address}
              </p>
            </div>
          )}

          {patient.emergency_contact && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h3>
              <p className="text-gray-700">
                {patient.emergency_contact.name}
                {patient.emergency_contact.relationship && ` (${patient.emergency_contact.relationship})`}
                {patient.emergency_contact.phone && ` - ${patient.emergency_contact.phone}`}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'prescriptions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Prescriptions ({prescriptions.length})
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'records'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Medical Records ({medicalRecords.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-900">Total Prescriptions</p>
                        <p className="text-2xl font-bold text-blue-600">{prescriptions.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <DocumentTextIcon className="w-8 h-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-900">Medical Records</p>
                        <p className="text-2xl font-bold text-green-600">{medicalRecords.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CalendarIcon className="w-8 h-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-900">Last Updated</p>
                        <p className="text-sm font-bold text-purple-600">
                          {patient.updated_at ? formatDate(patient.updated_at) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
                  {prescriptions.length === 0 && medicalRecords.length === 0 ? (
                    <p className="text-gray-600">No recent activity found.</p>
                  ) : (
                    <div className="space-y-3">
                                             {prescriptions.slice(0, 3).map((prescription) => (
                         <div key={prescription.id} className="flex items-center space-x-3">
                           <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                           <span className="text-sm text-gray-700">
                             Prescription by Dr. {prescription.doctor?.full_name} - {formatDate(prescription.created_at)}
                           </span>
                         </div>
                       ))}
                      {medicalRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="flex items-center space-x-3">
                          <DocumentTextIcon className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-700">
                            Medical record by Dr. {record.doctor?.full_name} - {formatDate(record.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                {prescriptions.length > 0 ? (
                  prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Prescription by Dr. {prescription.doctor?.full_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {prescription.appointment?.appointment_date && 
                              `Appointment: ${formatDate(prescription.appointment.appointment_date)}`
                            }
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(prescription.created_at)}
                        </span>
                      </div>
                      
                      {prescription.medications && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Medications:</h5>
                          <div className="text-sm text-gray-600">
                            {Array.isArray(prescription.medications) ? (
                              prescription.medications.map((med, index) => (
                                <div key={index} className="mb-1">
                                  • {med.name} - {med.dosage}
                                </div>
                              ))
                            ) : (
                              <p>{prescription.medications}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {prescription.dosage_instructions && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Instructions:</h5>
                          <p className="text-sm text-gray-600">{prescription.dosage_instructions}</p>
                        </div>
                      )}
                      
                      {prescription.duration && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Duration:</h5>
                          <p className="text-sm text-gray-600">{prescription.duration}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No prescriptions found.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'records' && (
              <div className="space-y-4">
                {medicalRecords.length > 0 ? (
                  medicalRecords.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Medical Record by Dr. {record.doctor?.full_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {record.appointment?.appointment_date && 
                              `Appointment: ${formatDate(record.appointment.appointment_date)}`
                            }
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(record.created_at)}
                        </span>
                      </div>
                      
                      {record.diagnosis && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Diagnosis:</h5>
                          <p className="text-sm text-gray-600">{record.diagnosis}</p>
                        </div>
                      )}
                      
                      {record.symptoms && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Symptoms:</h5>
                          <p className="text-sm text-gray-600">{record.symptoms}</p>
                        </div>
                      )}
                      
                      {record.notes && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Notes:</h5>
                          <p className="text-sm text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No medical records found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPage; 