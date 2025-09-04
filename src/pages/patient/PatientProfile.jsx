import React from 'react';

const PatientProfile = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Profile</h2>
        <p className="text-gray-600 mb-6">View and update your personal information.</p>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-indigo-700">Profile management coming soon.</p>
          <p className="text-indigo-600 text-sm mt-2">You'll be able to update your personal information, emergency contacts, and preferences here.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile; 