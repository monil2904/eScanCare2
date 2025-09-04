import {
    CheckIcon,
    PencilIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const MedicalReportView = ({ isOpen, onClose, appointmentId, patientId, doctorId, onReportUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchMedicalRecord();
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId]);

  const fetchMedicalRecord = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No medical record found
          setMedicalRecord(null);
        } else {
          throw error;
        }
      } else {
        setMedicalRecord(data);
      }
    } catch (error) {
      console.error('Error fetching medical record:', error);
      toast.error('Failed to load medical record');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(full_name, email, phone, date_of_birth),
          doctor:profiles!appointments_doctor_id_fkey(full_name, specialization),
          department:departments(name)
        `)
        .eq('id', appointmentId)
        .single();

      if (error) throw error;
      
      setAppointment(data);
      setPatient(data.patient);
      setDoctor(data.doctor);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast.error('Failed to load appointment details');
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setMedicalRecord(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setMedicalRecord(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for update, handling empty time field
      const dataToUpdate = { ...medicalRecord };
      
      // Remove empty time field to avoid database error
      if (!dataToUpdate.time || dataToUpdate.time === '') {
        delete dataToUpdate.time;
      }
      
      const { error } = await supabase
        .from('medical_records')
        .update(dataToUpdate)
        .eq('id', medicalRecord.id);

      if (error) throw error;

      toast.success('Medical report updated successfully!');
      setIsEditing(false);
      if (onReportUpdated) {
        onReportUpdated();
      }
    } catch (error) {
      console.error('Error updating medical report:', error);
      toast.error('Failed to update medical report');
    } finally {
      setSaving(false);
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
    if (!timeString) return 'N/A';
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

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading medical report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!medicalRecord) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Medical Report Found</h3>
            <p className="text-gray-600 mb-4">No medical report has been created for this appointment yet.</p>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Medical Report View</h3>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Patient Information */}
          {patient && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Patient Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Name:</strong> {patient.full_name}</div>
                <div><strong>Email:</strong> {patient.email}</div>
                <div><strong>Phone:</strong> {patient.phone}</div>
              </div>
            </div>
          )}

          {/* General Information */}
          <div className="card mb-6">
            <h4 className="font-semibold mb-4">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form No.</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={medicalRecord.form_no || ''}
                    onChange={(e) => handleInputChange(null, 'form_no', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="font-semibold">{medicalRecord.form_no || 'N/A'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed No.</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={medicalRecord.bed_no || ''}
                    onChange={(e) => handleInputChange(null, 'bed_no', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="font-semibold">{medicalRecord.bed_no || 'N/A'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                {isEditing ? (
                  <input
                    type="time"
                    value={medicalRecord.time || ''}
                    onChange={(e) => handleInputChange(null, 'time', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="font-semibold">{formatTime(medicalRecord.time)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                {isEditing ? (
                  <select
                    value={medicalRecord.shift || 'morning'}
                    onChange={(e) => handleInputChange(null, 'shift', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                  </select>
                ) : (
                  <div className="font-semibold capitalize">{medicalRecord.shift || 'N/A'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={medicalRecord.ip_number || ''}
                    onChange={(e) => handleInputChange(null, 'ip_number', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="font-semibold">{medicalRecord.ip_number || 'N/A'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={medicalRecord.unit || ''}
                    onChange={(e) => handleInputChange(null, 'unit', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="font-semibold">{medicalRecord.unit || 'N/A'}</div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Provisional Diagnosis</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={medicalRecord.provisional_diagnosis || ''}
                    onChange={(e) => handleInputChange(null, 'provisional_diagnosis', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="font-semibold">{medicalRecord.provisional_diagnosis || 'N/A'}</div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Attending Staff Signature</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={medicalRecord.attending_staff_signature || ''}
                    onChange={(e) => handleInputChange(null, 'attending_staff_signature', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="font-semibold">{medicalRecord.attending_staff_signature || 'N/A'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Medical History */}
          {medicalRecord.medical_history && (
            <div className="card mb-6">
              <h4 className="font-semibold mb-4">Medical History</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(medicalRecord.medical_history).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    {isEditing ? (
                      <textarea
                        value={value || ''}
                        onChange={(e) => handleInputChange('medical_history', key, e.target.value)}
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <div className="text-sm">{value || 'N/A'}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Investigations */}
          {medicalRecord.lab_investigations && (
            <div className="card mb-6">
              <h4 className="font-semibold mb-4">Lab Investigations</h4>
              {renderLabInvestigation(medicalRecord.lab_investigations.hematology, 'Hematology')}
              {renderLabInvestigation(medicalRecord.lab_investigations.biochemistry, 'Biochemistry')}
              {renderLabInvestigation(medicalRecord.lab_investigations.liver_function, 'Liver Function Tests')}
              {renderLabInvestigation(medicalRecord.lab_investigations.electrolytes_renal, 'Electrolytes & Renal Parameters')}
            </div>
          )}

          {/* Drug Treatments */}
          {renderDrugTreatments(medicalRecord.drug_treatments)}

          {/* Daily Monitoring */}
          {renderDailyMonitoring(medicalRecord.daily_monitoring)}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalReportView; 