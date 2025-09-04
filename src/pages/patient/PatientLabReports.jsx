import React from 'react';

const PatientLabReports = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lab Reports</h2>
        <p className="text-gray-600 mb-6">View your laboratory test results and reports here.</p>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">No lab reports found.</p>
          <p className="text-yellow-600 text-sm mt-2">Your lab reports will appear here when available from the hospital laboratory.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientLabReports; 