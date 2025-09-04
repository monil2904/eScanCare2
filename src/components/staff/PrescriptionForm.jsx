import {
    BeakerIcon,
    CheckIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const PrescriptionForm = ({ isOpen, onClose, appointmentId, patientId, doctorId, onPrescriptionCreated }) => {
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({
    prescription_date: new Date().toISOString().split('T')[0],
    prescribed_by: '',
    notes: '',
    medications: []
  });

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId]);

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
      
      // Set prescribed by to current doctor
      setFormData(prev => ({
        ...prev,
        prescribed_by: data.doctor?.full_name || ''
      }));
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast.error('Failed to load appointment details');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
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
          timing: 'after_food', // before_food, after_food, empty_stomach
          instructions: '',
          side_effects: ''
        }
      ]
    }));
  };

  const updateMedication = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.medications.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    // Validate medications
    const hasEmptyFields = formData.medications.some(med => 
      !med.name || !med.frequency
    );
    
    if (hasEmptyFields) {
      toast.error('Please fill in all required medication fields (Brand Name and Frequency)');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          appointment_id: appointmentId,
          ...formData
        });

      if (error) throw error;

      toast.success('Prescription created successfully!');
      onClose();
      if (onPrescriptionCreated) {
        onPrescriptionCreated();
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Create Prescription</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            {patient && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Patient Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><strong>Name:</strong> {patient.full_name}</div>
                  <div><strong>Email:</strong> {patient.email}</div>
                  <div><strong>Phone:</strong> {patient.phone}</div>
                </div>
              </div>
            )}

            {/* General Information */}
            <div className="card">
              <h4 className="font-semibold mb-4">Prescription Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Date</label>
                  <input
                    type="date"
                    value={formData.prescription_date}
                    onChange={(e) => handleInputChange('prescription_date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed By</label>
                  <input
                    type="text"
                    value={formData.prescribed_by}
                    onChange={(e) => handleInputChange('prescribed_by', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Doctor's name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            </div>

            {/* Medications */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Medications</h4>
                <button
                  type="button"
                  onClick={addMedication}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Medication
                </button>
              </div>

              {formData.medications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BeakerIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No medications added yet.</p>
                  <p className="text-sm">Click "Add Medication" to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.medications.map((medication, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">Medication {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Brand Name *
                          </label>
                          <input
                            type="text"
                            value={medication.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., Paracetamol"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Generic Name
                          </label>
                          <input
                            type="text"
                            value={medication.generic_name}
                            onChange={(e) => updateMedication(index, 'generic_name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., Acetaminophen"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frequency *
                          </label>
                          <input
                            type="text"
                            value={medication.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., 3 times daily"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="text"
                            value={medication.quantity}
                            onChange={(e) => updateMedication(index, 'quantity', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., 30 tablets"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={medication.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., 7 days"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Timing
                          </label>
                          <select
                            value={medication.timing}
                            onChange={(e) => updateMedication(index, 'timing', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="after_food">After Food</option>
                            <option value="before_food">Before Food</option>
                            <option value="empty_stomach">Empty Stomach</option>
                            <option value="anytime">Anytime</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instructions
                        </label>
                        <textarea
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows="2"
                          placeholder="Special instructions for this medication..."
                        />
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Side Effects
                        </label>
                        <textarea
                          value={medication.side_effects}
                          onChange={(e) => updateMedication(index, 'side_effects', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows="2"
                          placeholder="Known side effects to watch for..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Creating Prescription...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Create Prescription
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm; 