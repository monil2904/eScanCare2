import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useOtpAuthStore } from '../../stores/otpAuthStore';

const PatientOverview = () => {
  const { user: authUser, profile: authProfile } = useAuthStore();
  const { user: otpUser, profile: otpProfile } = useOtpAuthStore();

  const currentUser = authUser || otpUser;
  const currentProfile = authProfile || otpProfile;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Overview</h2>
        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">
              Welcome back, {currentProfile?.full_name || 'Patient'}!
            </h3>
            <p className="text-primary-100">
              Here's your health summary for today.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
                Book Appointment
              </button>
              <button className="w-full text-left p-3 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors">
                View Medical Records
              </button>
              <button className="w-full text-left p-3 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 transition-colors">
                Check Lab Results
              </button>
            </div>
          </div>

          {/* Health Summary */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Visit</span>
                <span className="font-medium">2 weeks ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Appointment</span>
                <span className="font-medium">Next week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Prescriptions</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Appointment Confirmed</p>
                <p className="text-sm text-gray-600">Your appointment with Dr. Smith has been confirmed for next week.</p>
              </div>
              <span className="text-sm text-gray-500 ml-auto">2 days ago</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Lab Results Available</p>
                <p className="text-sm text-gray-600">Your blood test results are now available for review.</p>
              </div>
              <span className="text-sm text-gray-500 ml-auto">1 week ago</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Prescription Renewal</p>
                <p className="text-sm text-gray-600">Your prescription for medication has been renewed.</p>
              </div>
              <span className="text-sm text-gray-500 ml-auto">2 weeks ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientOverview; 