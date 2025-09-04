import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { getAuthErrorAction, getAuthErrorMessage } from '../../lib/auth-utils';
import { useAuthStore } from '../../stores/authStore';

const AuthErrorPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');
  const { resendVerification } = useAuthStore();

  // Use utility functions to get error information
  const errorInfo = {
    error,
    errorCode,
    errorDescription: errorDescription ? decodeURIComponent(errorDescription) : ''
  };
  
  const errorMessage = getAuthErrorMessage(errorInfo);
  const errorAction = getAuthErrorAction(errorInfo);

  const getErrorTitle = () => {
    switch (errorCode) {
      case 'otp_expired':
        return 'Link Expired';
      case 'access_denied':
        return 'Access Denied';
      case 'invalid_token':
        return 'Invalid Link';
      default:
        return 'Authentication Error';
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const result = await resendVerification(email);
      if (result.success) {
        setEmail('');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handlePrimaryAction = () => {
    if (errorAction.action === 'resend') {
      // Focus on email input for resend action
      document.getElementById('email')?.focus();
    } else if (errorAction.action === 'login') {
      // Redirect to login
      window.location.href = '/login';
    } else {
      // Default retry action
      window.location.reload();
    }
  };

  const handleSecondaryAction = () => {
    if (errorAction.action === 'resend') {
      // Go back to login
      window.location.href = '/login';
    } else {
      // Go to home
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {getErrorTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {errorMessage}
          </p>
          {errorAction.message && (
            <p className="mt-2 text-sm text-indigo-600">
              {errorAction.message}
            </p>
          )}
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {errorAction.action === 'resend' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter your email address below to receive a new verification link.
              </p>
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isResending}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={handlePrimaryAction}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {errorAction.primaryAction}
            </button>
            
            <button
              onClick={handleSecondaryAction}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {errorAction.secondaryAction}
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            If you continue to experience issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorPage;
