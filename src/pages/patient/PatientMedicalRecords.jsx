import {
    BuildingOfficeIcon,
    CalendarIcon,
    ClockIcon,
    DocumentTextIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const PatientMedicalRecords = () => {
  const { user } = useAuthStore();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          doctor:profiles!medical_records_doctor_id_fkey(full_name, specialization),
          appointment:appointments(appointment_date, department:departments(name))
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedicalRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderLabInvestigation = (labData, title) => {
    if (!labData) return null;
    
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(labData).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700">
                {key.replace(/_/g, ' ').toUpperCase()}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {value || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDrugTreatments = (drugs) => {
    if (!drugs || drugs.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Drug Treatments</h4>
        <div className="space-y-4">
          {drugs.map((drug, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Generic Name</div>
                  <div className="font-semibold">{drug.generic_name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Brand Name</div>
                  <div className="font-semibold">{drug.brand_name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Dose</div>
                  <div className="font-semibold">{drug.dose}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Route</div>
                  <div className="font-semibold capitalize">{drug.route}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Frequency</div>
                  <div className="font-semibold">{drug.frequency}</div>
                </div>
              </div>
              {drug.days && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Administration Days</div>
                  <div className="flex gap-2">
                    {drug.days.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          day
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {dayIndex + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDailyMonitoring = (monitoring) => {
    if (!monitoring || monitoring.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Daily Monitoring</h4>
        <div className="space-y-4">
          {monitoring.map((day, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium">Day {index + 1}</h5>
                <div className="text-sm text-gray-600">
                  {day.date_time ? formatDate(day.date_time) : 'Date not specified'}
                </div>
              </div>
              
              {/* Vital Signs */}
              <div className="mb-4">
                <h6 className="font-medium text-gray-700 mb-2">Vital Signs</h6>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {day.vital_signs && Object.entries(day.vital_signs).map(([vital, value]) => (
                    <div key={vital}>
                      <div className="text-sm font-medium text-gray-700">
                        {vital.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className="font-semibold">{value || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Systematic Examination */}
              <div className="mb-4">
                <h6 className="font-medium text-gray-700 mb-2">Systematic Examination</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {day.systematic_examination && Object.entries(day.systematic_examination).map(([exam, value]) => (
                    <div key={exam}>
                      <div className="text-sm font-medium text-gray-700">
                        {exam.toUpperCase()}
                      </div>
                      <div className="text-sm">{value || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {day.advice && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Advice</div>
                  <div className="text-sm">{day.advice}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading medical records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Medical Records</h2>
            <p className="text-gray-600">View your complete medical history and treatment records.</p>
          </div>
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-500">Medical Records</span>
          </div>
        </div>

        {/* Medical Records List */}
        {medicalRecords.length > 0 ? (
          <div className="space-y-4">
            {medicalRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {record.appointment?.appointment_date 
                          ? formatDate(record.appointment.appointment_date)
                          : formatDate(record.created_at)
                        }
                      </span>
                      {record.time && (
                        <>
                          <ClockIcon className="w-4 h-4 text-gray-500" />
                          <span>{formatTime(record.time)}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        <span>Dr. {record.doctor?.full_name}</span>
                      </div>
                      {record.appointment?.department && (
                        <div className="flex items-center gap-1">
                          <BuildingOfficeIcon className="w-4 h-4" />
                          <span>{record.appointment.department.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {record.provisional_diagnosis && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Diagnosis:</strong> {record.provisional_diagnosis}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {selectedRecord?.id === record.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Detailed Record View */}
                {selectedRecord?.id === record.id && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    {/* General Information */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">General Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {record.form_no && (
                          <div>
                            <div className="text-sm font-medium text-gray-700">Form No.</div>
                            <div className="font-semibold">{record.form_no}</div>
                          </div>
                        )}
                        {record.bed_no && (
                          <div>
                            <div className="text-sm font-medium text-gray-700">Bed No.</div>
                            <div className="font-semibold">{record.bed_no}</div>
                          </div>
                        )}
                        {record.ip_number && (
                          <div>
                            <div className="text-sm font-medium text-gray-700">IP Number</div>
                            <div className="font-semibold">{record.ip_number}</div>
                          </div>
                        )}
                        {record.unit && (
                          <div>
                            <div className="text-sm font-medium text-gray-700">Unit</div>
                            <div className="font-semibold">{record.unit}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medical History */}
                    {record.medical_history && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Medical History</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(record.medical_history).map(([key, value]) => (
                            value && (
                              <div key={key}>
                                <div className="text-sm font-medium text-gray-700">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                                <div className="text-sm">{value}</div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab Investigations */}
                    {record.lab_investigations && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Lab Investigations</h4>
                        {renderLabInvestigation(record.lab_investigations.hematology, 'Hematology')}
                        {renderLabInvestigation(record.lab_investigations.biochemistry, 'Biochemistry')}
                        {renderLabInvestigation(record.lab_investigations.liver_function, 'Liver Function Tests')}
                        {renderLabInvestigation(record.lab_investigations.electrolytes_renal, 'Electrolytes & Renal Parameters')}
                      </div>
                    )}

                    {/* Drug Treatments */}
                    {renderDrugTreatments(record.drug_treatments)}

                    {/* Daily Monitoring */}
                    {renderDailyMonitoring(record.daily_monitoring)}

                    {/* Discharge Information */}
                    {record.discharge_medications && record.discharge_medications.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Discharge Medications</h4>
                        <div className="space-y-4">
                          {record.discharge_medications.map((med, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Generic Name</div>
                                  <div className="font-semibold">{med.generic_name}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Brand Name</div>
                                  <div className="font-semibold">{med.brand_name}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Dose</div>
                                  <div className="font-semibold">{med.dose}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Route</div>
                                  <div className="font-semibold capitalize">{med.route}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Frequency</div>
                                  <div className="font-semibold">{med.frequency}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Duration</div>
                                  <div className="font-semibold">{med.duration}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Details */}
                    {record.follow_up_details && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Follow-up Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {record.follow_up_details.appointment_date && (
                            <div>
                              <div className="text-sm font-medium text-gray-700">Follow-up Date</div>
                              <div className="font-semibold">{formatDate(record.follow_up_details.appointment_date)}</div>
                            </div>
                          )}
                          {record.follow_up_details.monitoring_required && (
                            <div>
                              <div className="text-sm font-medium text-gray-700">Monitoring Required</div>
                              <div className="font-semibold">{record.follow_up_details.monitoring_required}</div>
                            </div>
                          )}
                          {record.follow_up_details.instructions && (
                            <div className="md:col-span-2">
                              <div className="text-sm font-medium text-gray-700">Instructions</div>
                              <div className="text-sm">{record.follow_up_details.instructions}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No medical records found.</p>
            <p className="text-gray-500 text-sm mt-2">Your medical records will appear here after your first visit.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalRecords; 