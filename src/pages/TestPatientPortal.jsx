import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useOtpAuthStore } from '../stores/otpAuthStore';

const TestPatientPortal = () => {
  const { user: authUser, profile: authProfile } = useAuthStore();
  const { user: otpUser, profile: otpProfile } = useOtpAuthStore();

  console.log('=== PATIENT PORTAL DEBUG ===');
  console.log('Auth User:', authUser);
  console.log('Auth Profile:', authProfile);
  console.log('OTP User:', otpUser);
  console.log('OTP Profile:', otpProfile);

  const currentUser = authUser || otpUser;
  const currentProfile = authProfile || otpProfile;
  const isPatient = currentUser?.user_metadata?.user_type === 'patient';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Patient Portal Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Auth User Present:</span>
                <span className={authUser ? 'text-green-600' : 'text-red-600'}>
                  {authUser ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">OTP User Present:</span>
                <span className={otpUser ? 'text-green-600' : 'text-red-600'}>
                  {otpUser ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Current User:</span>
                <span className={currentUser ? 'text-green-600' : 'text-red-600'}>
                  {currentUser ? 'Present' : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Is Patient:</span>
                <span className={isPatient ? 'text-green-600' : 'text-red-600'}>
                  {isPatient ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">User ID:</span>
                <span className="text-gray-600">{currentUser?.id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span className="text-gray-600">{currentUser?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">User Type:</span>
                <span className="text-gray-600">{currentUser?.user_metadata?.user_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Profile Name:</span>
                <span className="text-gray-600">{currentProfile?.full_name || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Raw Data */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Raw Data</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Auth User Object:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(authUser, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">OTP User Object:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(otpUser, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Auth Profile Object:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(authProfile, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">OTP Profile Object:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(otpProfile, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Navigation Test */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Navigation Test</h2>
          <div className="space-y-3">
            <a 
              href="/patient" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Patient Portal
            </a>
            <br />
            <a 
              href="/patient-login" 
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go to Patient Login
            </a>
            <br />
            <a 
              href="/" 
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPatientPortal;
