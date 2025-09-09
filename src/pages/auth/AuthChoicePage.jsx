import { Link } from 'react-router-dom'

const AuthChoicePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ESC</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to eScanCare Hospital
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your login method
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Patient Login */}
          <Link
            to="/login"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Patient Login (OTP)</span>
            </div>
          </Link>
          
          {/* Staff/Doctor Login */}
          <Link
            to="/login"
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Staff/Doctor Login</span>
            </div>
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            New patient?{' '}
            <Link
              to="/patient-signup"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthChoicePage 