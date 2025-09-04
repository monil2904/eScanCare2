import React from 'react';

const PatientMedicalHistory = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical History</h2>
        <p className="text-gray-600 mb-6">View your complete medical records and history.</p>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-700">No medical records found.</p>
          <p className="text-green-600 text-sm mt-2">Your medical records will appear here after your first visit.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientMedicalHistory; 