import {
    BeakerIcon,
    CheckIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const PrescriptionView = ({ isOpen, onClose, appointmentId, patientId, doctorId, onPrescriptionUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchPrescription();
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId]);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No prescription found
          setPrescription(null);
        } else {
          throw error;
        }
      } else {
        setPrescription(data);
      }
    } catch (error) {
      console.error('Error fetching prescription:', error);
      toast.error('Failed to load prescription');
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

  const handleInputChange = (field, value) => {
    setPrescription(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const addMedication = () => {
    setPrescription(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          generic_name: '',
          dosage: '',
          frequency: '',
          quantity: '',
          duration: '',
          timing: 'after_food',
          instructions: '',
          side_effects: ''
        }
      ]
    }));
  };

  const removeMedication = (index) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('prescriptions')
        .update(prescription)
        .eq('id', prescription.id);

      if (error) throw error;

      toast.success('Prescription updated successfully!');
      setIsEditing(false);
      if (onPrescriptionUpdated) {
        onPrescriptionUpdated();
      }
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast.error('Failed to update prescription');
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

  const getTimingLabel = (timing) => {
    switch (timing) {
      case 'after_food': return 'After Food';
      case 'before_food': return 'Before Food';
      case 'empty_stomach': return 'Empty Stomach';
      case 'anytime': return 'Anytime';
      default: return timing;
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prescription...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prescription Found</h3>
            <p className="text-gray-600 mb-4">No prescription has been created for this appointment yet.</p>
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
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Prescription View</h3>
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

          {/* Prescription Details */}
          <div className="card mb-6">
            <h4 className="font-semibold mb-4">Prescription Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={prescription.prescription_date || ''}
                    onChange={(e) => handleInputChange('prescription_date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="font-semibold">{prescription.prescription_date ? formatDate(prescription.prescription_date) : 'N/A'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed By</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={prescription.prescribed_by || ''}
                    onChange={(e) => handleInputChange('prescribed_by', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="font-semibold">{prescription.prescribed_by || 'N/A'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={prescription.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="font-semibold">{prescription.notes || 'N/A'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Medications</h4>
              {isEditing && (
                <button
                  type="button"
                  onClick={addMedication}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Medication
                </button>
              )}
            </div>

            {(!prescription.medications || prescription.medications.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <BeakerIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No medications prescribed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescription.medications.map((medication, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">Medication {index + 1}</h5>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={medication.name || ''}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <div className="font-semibold">{medication.name || 'N/A'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={medication.generic_name || ''}
                            onChange={(e) => updateMedication(index, 'generic_name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <div className="font-semibold">{medication.generic_name || 'N/A'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={medication.dosage || ''}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <div className="font-semibold">{medication.dosage || 'N/A'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={medication.frequency || ''}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <div className="font-semibold">{medication.frequency || 'N/A'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={medication.quantity || ''}
                            onChange={(e) => updateMedication(index, 'quantity', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <div className="font-semibold">{medication.quantity || 'N/A'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={medication.duration || ''}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <div className="font-semibold">{medication.duration || 'N/A'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timing</label>
                        {isEditing ? (
                          <select
                            value={medication.timing || 'after_food'}
                            onChange={(e) => updateMedication(index, 'timing', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="after_food">After Food</option>
                            <option value="before_food">Before Food</option>
                            <option value="empty_stomach">Empty Stomach</option>
                            <option value="anytime">Anytime</option>
                          </select>
                        ) : (
                          <div className="font-semibold">{getTimingLabel(medication.timing)}</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                      {isEditing ? (
                        <textarea
                          value={medication.instructions || ''}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows="2"
                        />
                      ) : (
                        <div className="text-sm">{medication.instructions || 'N/A'}</div>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Side Effects</label>
                      {isEditing ? (
                        <textarea
                          value={medication.side_effects || ''}
                          onChange={(e) => updateMedication(index, 'side_effects', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows="2"
                        />
                      ) : (
                        <div className="text-sm">{medication.side_effects || 'N/A'}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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

export default PrescriptionView; 