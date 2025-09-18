import {
  CheckIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const MedicalReportForm = ({ isOpen, onClose, appointmentId, patientId, doctorId, onReportCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // General Information
    form_no: '',
    bed_no: '',
    time: '',
    shift: 'morning',
    attending_staff_signature: '',
    provisional_diagnosis: '',
    ip_number: '',
    unit: '',
    
    // Patient History
    medical_history: {
      past_illnesses: '',
      surgeries: '',
      chronic_conditions: '',
      allergies: '',
      family_history: '',
      social_history: ''
    },
    
    // Lab Investigations
    lab_investigations: {
      hematology: {
        hemoglobin: '',
        red_blood_cells: '',
        white_blood_cells: '',
        neutrophils: '',
        lymphocytes: '',
        monocytes: '',
        eosinophils: '',
        basophils: '',
        erythrocyte_sedimentation_rate: '',
        platelets_thrombocytes: '',
        mean_corpuscular_hemoglobin: '',
        mean_corpuscular_hemoglobin_concentration: '',
        mean_corpuscular_volume: '',
        packed_cell_volume: ''
      },
      biochemistry: {
        bsl_random: '',
        bsl_fasting: '',
        hba1c: ''
      },
      liver_function: {
        ast_sgot: '',
        alt_sgpt: '',
        alp: '',
        bilirubin_total: '',
        bilirubin_direct: '',
        bilirubin_indirect: '',
        total_protein: '',
        albumin: ''
      },
      electrolytes_renal: {
        sodium_ion: '',
        potassium_ion: '',
        blood_urea: '',
        calcium: '',
        chloride: '',
        phosphate: '',
        uric_acid: '',
        serum_creatinine: ''
      }
    },
    
    // Diagnostic Tests
    diagnostic_tests: [],
    
    // Drug Treatments
    drug_treatments: [],
    
    // Daily Monitoring
    daily_monitoring: [],
    
    // Discharge Information
    discharge_medications: [],
    follow_up_details: {
      medications: '',
      appointment_date: '',
      instructions: '',
      monitoring_required: ''
    },
    
    // Legacy fields
    diagnosis: '',
    symptoms: '',
    prescription: {},
    lab_results: {},
    notes: ''
  });

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);

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
      
      // Set default form number
      setFormData(prev => ({
        ...prev,
        form_no: `MR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      }));
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast.error('Failed to load appointment details');
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      // Handle nested dot notation like 'lab_investigations.hematology'
      if (section.includes('.')) {
        const [parentSection, childSection] = section.split('.');
        setFormData(prev => ({
          ...prev,
          [parentSection]: {
            ...prev[parentSection],
            [childSection]: {
              ...prev[parentSection][childSection],
              [field]: value
            }
          }
        }));
      } else {
        // Handle single level sections
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addDiagnosticTest = () => {
    setFormData(prev => ({
      ...prev,
      diagnostic_tests: [
        ...prev.diagnostic_tests,
        { name: '', date: '', result: '' }
      ]
    }));
  };

  const updateDiagnosticTest = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      diagnostic_tests: prev.diagnostic_tests.map((test, i) =>
        i === index ? { ...test, [field]: value } : test
      )
    }));
  };

  const removeDiagnosticTest = (index) => {
    setFormData(prev => ({
      ...prev,
      diagnostic_tests: prev.diagnostic_tests.filter((_, i) => i !== index)
    }));
  };

  const addDrugTreatment = () => {
    setFormData(prev => ({
      ...prev,
      drug_treatments: [
        ...prev.drug_treatments,
        {
          generic_name: '',
          brand_name: '',
          dose: '',
          route: 'oral',
          frequency: '',
          days: Array(11).fill(false)
        }
      ]
    }));
  };

  const updateDrugTreatment = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      drug_treatments: prev.drug_treatments.map((drug, i) =>
        i === index ? { ...drug, [field]: value } : drug
      )
    }));
  };

  const updateDrugDays = (drugIndex, dayIndex, checked) => {
    setFormData(prev => ({
      ...prev,
      drug_treatments: prev.drug_treatments.map((drug, i) =>
        i === drugIndex
          ? {
              ...drug,
              days: drug.days.map((day, j) => j === dayIndex ? checked : day)
            }
          : drug
      )
    }));
  };

  const removeDrugTreatment = (index) => {
    setFormData(prev => ({
      ...prev,
      drug_treatments: prev.drug_treatments.filter((_, i) => i !== index)
    }));
  };

  const addDailyMonitoring = () => {
    setFormData(prev => ({
      ...prev,
      daily_monitoring: [
        ...prev.daily_monitoring,
        {
          date_time: '',
          vital_signs: {
            temperature: '',
            pulse: '',
            respiration: '',
            blood_pressure: '',
            spo2: ''
          },
          systematic_examination: {
            cvs: '',
            rs: '',
            git: '',
            cns: ''
          },
          advice: ''
        }
      ]
    }));
  };

  const updateDailyMonitoring = (index, section, field, value) => {
    setFormData(prev => ({
      ...prev,
      daily_monitoring: prev.daily_monitoring.map((day, i) =>
        i === index
          ? {
              ...day,
              [section]: {
                ...day[section],
                [field]: value
              }
            }
          : day
      )
    }));
  };

  const removeDailyMonitoring = (index) => {
    setFormData(prev => ({
      ...prev,
      daily_monitoring: prev.daily_monitoring.filter((_, i) => i !== index)
    }));
  };

  const addDischargeMedication = () => {
    setFormData(prev => ({
      ...prev,
      discharge_medications: [
        ...prev.discharge_medications,
        {
          generic_name: '',
          brand_name: '',
          dose: '',
          route: 'oral',
          frequency: '',
          duration: ''
        }
      ]
    }));
  };

  const updateDischargeMedication = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      discharge_medications: prev.discharge_medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeDischargeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      discharge_medications: prev.discharge_medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for insertion, handling empty time field
      const dataToInsert = {
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_id: appointmentId,
        ...formData
      };
      
      // Remove empty time field to avoid database error
      if (!dataToInsert.time || dataToInsert.time === '') {
        delete dataToInsert.time;
      }
      
      // Create medical record
      const { error: medicalRecordError } = await supabase
        .from('medical_records')
        .insert(dataToInsert);

      if (medicalRecordError) throw medicalRecordError;

      // Update appointment status to completed
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (appointmentError) throw appointmentError;

      toast.success('Medical report created successfully and appointment marked as completed!');
      onClose();
      if (onReportCreated) {
        onReportCreated();
      }
    } catch (error) {
      console.error('Error creating medical report:', error);
      toast.error('Failed to create medical report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Medical Report Form</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
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
              <h4 className="font-semibold mb-4">General Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Form No.</label>
                  <input
                    type="text"
                    value={formData.form_no}
                    onChange={(e) => handleInputChange(null, 'form_no', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bed No.</label>
                  <input
                    type="text"
                    value={formData.bed_no}
                    onChange={(e) => handleInputChange(null, 'bed_no', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange(null, 'time', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Select time if applicable"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => handleInputChange(null, 'shift', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Number</label>
                  <input
                    type="text"
                    value={formData.ip_number}
                    onChange={(e) => handleInputChange(null, 'ip_number', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleInputChange(null, 'unit', e.target.value)}
                    placeholder="e.g., ICU, General ward"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provisional Diagnosis</label>
                  <input
                    type="text"
                    value={formData.provisional_diagnosis}
                    onChange={(e) => handleInputChange(null, 'provisional_diagnosis', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attending Staff Signature</label>
                  <input
                    type="text"
                    value={formData.attending_staff_signature}
                    onChange={(e) => handleInputChange(null, 'attending_staff_signature', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Patient History */}
            <div className="card">
              <h4 className="font-semibold mb-4">Patient History</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Past Illnesses</label>
                  <textarea
                    value={formData.medical_history.past_illnesses}
                    onChange={(e) => handleInputChange('medical_history', 'past_illnesses', e.target.value)}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surgeries</label>
                  <textarea
                    value={formData.medical_history.surgeries}
                    onChange={(e) => handleInputChange('medical_history', 'surgeries', e.target.value)}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
                  <textarea
                    value={formData.medical_history.chronic_conditions}
                    onChange={(e) => handleInputChange('medical_history', 'chronic_conditions', e.target.value)}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <textarea
                    value={formData.medical_history.allergies}
                    onChange={(e) => handleInputChange('medical_history', 'allergies', e.target.value)}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Family History</label>
                  <textarea
                    value={formData.medical_history.family_history}
                    onChange={(e) => handleInputChange('medical_history', 'family_history', e.target.value)}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Social History</label>
                  <textarea
                    value={formData.medical_history.social_history}
                    onChange={(e) => handleInputChange('medical_history', 'social_history', e.target.value)}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Lab Investigations */}
            <div className="card">
              <h4 className="font-semibold mb-4">Lab Investigations</h4>
              
              {/* Hematology */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-800 mb-3">Hematology</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(formData.lab_investigations.hematology).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.replace(/_/g, ' ').toUpperCase().replace(' COUNT', '').replace(' PERCENT', '')}
                      </label>
                      <input
                        type="text"
                        value={formData.lab_investigations.hematology[field]}
                        onChange={(e) => handleInputChange('lab_investigations.hematology', field, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Biochemistry */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-800 mb-3">Biochemistry</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(formData.lab_investigations.biochemistry).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.replace(/_/g, ' ').toUpperCase()}
                      </label>
                      <input
                        type="text"
                        value={formData.lab_investigations.biochemistry[field]}
                        onChange={(e) => handleInputChange('lab_investigations.biochemistry', field, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Liver Function Tests */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-800 mb-3">Liver Function Tests</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(formData.lab_investigations.liver_function).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.replace(/_/g, ' ').toUpperCase()}
                      </label>
                      <input
                        type="text"
                        value={formData.lab_investigations.liver_function[field]}
                        onChange={(e) => handleInputChange('lab_investigations.liver_function', field, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Electrolytes & Renal Parameters */}
              <div>
                <h5 className="font-medium text-gray-800 mb-3">Electrolytes & Renal Parameters</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(formData.lab_investigations.electrolytes_renal).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.replace(/_/g, ' ').toUpperCase()}
                      </label>
                      <input
                        type="text"
                        value={formData.lab_investigations.electrolytes_renal[field]}
                        onChange={(e) => handleInputChange('lab_investigations.electrolytes_renal', field, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Specialized Diagnostic Tests */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Specialized Diagnostic Tests</h4>
                <button
                  type="button"
                  onClick={addDiagnosticTest}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Test
                </button>
              </div>
              
              {formData.diagnostic_tests.map((test, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium">Test {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeDiagnosticTest(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                      <input
                        type="text"
                        value={test.name}
                        onChange={(e) => updateDiagnosticTest(index, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={test.date}
                        onChange={(e) => updateDiagnosticTest(index, 'date', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                      <input
                        type="text"
                        value={test.result}
                        onChange={(e) => updateDiagnosticTest(index, 'result', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drug Treatment Chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Drug Treatment Chart</h4>
                <button
                  type="button"
                  onClick={addDrugTreatment}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Drug
                </button>
              </div>
              
              {formData.drug_treatments.map((drug, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium">Drug {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeDrugTreatment(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                      <input
                        type="text"
                        value={drug.generic_name}
                        onChange={(e) => updateDrugTreatment(index, 'generic_name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={drug.brand_name}
                        onChange={(e) => updateDrugTreatment(index, 'brand_name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dose</label>
                      <input
                        type="text"
                        value={drug.dose}
                        onChange={(e) => updateDrugTreatment(index, 'dose', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                      <select
                        value={drug.route}
                        onChange={(e) => updateDrugTreatment(index, 'route', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="oral">Oral</option>
                        <option value="iv">IV</option>
                        <option value="im">IM</option>
                        <option value="sc">SC</option>
                        <option value="topical">Topical</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <input
                      type="text"
                      value={drug.frequency}
                      onChange={(e) => updateDrugTreatment(index, 'frequency', e.target.value)}
                      placeholder="e.g., 3 times daily"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Days (1-11)</label>
                    <div className="grid grid-cols-11 gap-2">
                      {drug.days.map((day, dayIndex) => (
                        <label key={dayIndex} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={day}
                            onChange={(e) => updateDrugDays(index, dayIndex, e.target.checked)}
                            className="mr-1"
                          />
                          <span className="text-sm">{dayIndex + 1}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Monitoring/Observation Chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Daily Monitoring/Observation Chart</h4>
                <button
                  type="button"
                  onClick={addDailyMonitoring}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Day
                </button>
              </div>
              
              {formData.daily_monitoring.map((day, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium">Day {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeDailyMonitoring(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={day.date_time}
                        onChange={(e) => updateDailyMonitoring(index, null, 'date_time', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Vital Signs */}
                  <div className="mb-4">
                    <h6 className="font-medium text-gray-700 mb-2">Vital Signs</h6>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Object.keys(day.vital_signs).map((vital) => (
                        <div key={vital}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {vital.replace(/_/g, ' ').toUpperCase()}
                          </label>
                          <input
                            type="text"
                            value={day.vital_signs[vital]}
                            onChange={(e) => updateDailyMonitoring(index, 'vital_signs', vital, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Systematic Examination */}
                  <div className="mb-4">
                    <h6 className="font-medium text-gray-700 mb-2">Systematic Examination</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(day.systematic_examination).map((exam) => (
                        <div key={exam}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {exam.toUpperCase()}
                          </label>
                          <textarea
                            value={day.systematic_examination[exam]}
                            onChange={(e) => updateDailyMonitoring(index, 'systematic_examination', exam, e.target.value)}
                            rows="2"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advice for the Day</label>
                    <textarea
                      value={day.advice}
                      onChange={(e) => updateDailyMonitoring(index, null, 'advice', e.target.value)}
                      rows="2"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Discharge Medications & Follow-up */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Discharge Medications & Follow-up</h4>
                <button
                  type="button"
                  onClick={addDischargeMedication}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Medication
                </button>
              </div>
              
              {formData.discharge_medications.map((med, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium">Medication {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeDischargeMedication(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                      <input
                        type="text"
                        value={med.generic_name}
                        onChange={(e) => updateDischargeMedication(index, 'generic_name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={med.brand_name}
                        onChange={(e) => updateDischargeMedication(index, 'brand_name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dose</label>
                      <input
                        type="text"
                        value={med.dose}
                        onChange={(e) => updateDischargeMedication(index, 'dose', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                      <select
                        value={med.route}
                        onChange={(e) => updateDischargeMedication(index, 'route', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="oral">Oral</option>
                        <option value="iv">IV</option>
                        <option value="im">IM</option>
                        <option value="sc">SC</option>
                        <option value="topical">Topical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => updateDischargeMedication(index, 'frequency', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => updateDischargeMedication(index, 'duration', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Appointment Date</label>
                  <input
                    type="date"
                    value={formData.follow_up_details.appointment_date}
                    onChange={(e) => handleInputChange('follow_up_details', 'appointment_date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring Required</label>
                  <input
                    type="text"
                    value={formData.follow_up_details.monitoring_required}
                    onChange={(e) => handleInputChange('follow_up_details', 'monitoring_required', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea
                    value={formData.follow_up_details.instructions}
                    onChange={(e) => handleInputChange('follow_up_details', 'instructions', e.target.value)}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
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
                    Creating Report...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Create Medical Report
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

export default MedicalReportForm; 