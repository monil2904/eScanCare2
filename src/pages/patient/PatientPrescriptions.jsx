import React from 'react';

const PatientPrescriptions = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Prescriptions</h2>
        <p className="text-gray-600 mb-6">View your current and past prescriptions.</p>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-purple-700">No prescriptions found.</p>
          <p className="text-purple-600 text-sm mt-2">Your prescriptions will appear here when prescribed by your doctor.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientPrescriptions; 