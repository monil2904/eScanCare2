import React, { useState } from 'react';
import AppointmentScheduler from './AppointmentScheduler';

const AppointmentSchedulerTest = () => {
  const [showScheduler, setShowScheduler] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Appointment Scheduler Test
        </h1>

        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Staff Appointment Scheduling
            </h2>
            <p className="text-blue-700 mb-4">
              This test allows you to verify the appointment scheduling functionality for staff members.
              The scheduler includes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Patient search and selection</li>
              <li>Department and doctor selection</li>
              <li>Date and time scheduling</li>
              <li>Appointment type and status management</li>
              <li>Notes and additional information</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowScheduler(true)}
              className="btn-primary flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Open Appointment Scheduler
            </button>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              ✅ Features Implemented
            </h3>
            <ul className="space-y-1 text-green-700">
              <li>• Patient search with real-time filtering</li>
              <li>• Department-based doctor selection</li>
              <li>• Date and time validation</li>
              <li>• Appointment status management</li>
              <li>• Form validation and error handling</li>
              <li>• Success notifications and form reset</li>
              <li>• Responsive design for all screen sizes</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              📋 Test Instructions
            </h3>
            <ol className="space-y-2 text-yellow-700">
              <li>1. Click "Open Appointment Scheduler" to launch the modal</li>
              <li>2. Search for a patient by name, email, or phone</li>
              <li>3. Select a department to load available doctors</li>
              <li>4. Choose a doctor from the department</li>
              <li>5. Set the appointment date and time</li>
              <li>6. Select appointment type and status</li>
              <li>7. Add any notes or additional information</li>
              <li>8. Submit the appointment to test the creation</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Appointment Scheduler Modal */}
      <AppointmentScheduler
        isOpen={showScheduler}
        onClose={() => setShowScheduler(false)}
        onAppointmentCreated={() => {
          console.log('Appointment created successfully!');
        }}
      />
    </div>
  );
};

export default AppointmentSchedulerTest; 