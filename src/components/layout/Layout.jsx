import {
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    BuildingOfficeIcon,
    HomeIcon,
    InformationCircleIcon,
    PhoneIcon,
    UserCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useOtpAuthStore } from '../../stores/otpAuthStore'

const Layout = ({ children }) => {
  const { user, profile, signOut } = useAuthStore()
  const { user: otpUser, profile: otpProfile, signOut: otpSignOut } = useOtpAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Use user from either store
  const currentUser = user || otpUser
  const currentProfile = profile || otpProfile

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'About', href: '/about', icon: InformationCircleIcon },
    { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon },
    { name: 'Contact', href: '/contact', icon: PhoneIcon },
  ]

  const userNavigation = [
    { name: 'Patient Portal', href: '/patient', userType: 'patient' },
    { name: 'Doctor Portal', href: '/doctor', userType: 'doctor' },
    { name: 'Staff Portal', href: '/staff', userType: 'staff' },
    { name: 'Admin Panel', href: '/admin', userType: 'admin' },
    { name: 'QR Scanner', href: '/qr-scanner', userType: ['doctor', 'admin'] },
  ]

  const handleSignOut = async () => {
    if (user) {
      await signOut()
    } else if (otpUser) {
      await otpSignOut()
    }
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and main navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ESC</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">eScanCare</span>
                </Link>
              </div>
              
              {/* Desktop navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.href
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-1" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* User menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  {/* User-specific navigation */}
                  {userNavigation.map((item) => {
                    const userType = currentUser.user_metadata?.user_type
                    const allowedTypes = Array.isArray(item.userType) 
                      ? item.userType 
                      : [item.userType]
                    
                    if (!allowedTypes.includes(userType)) return null
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                  
                  {/* User dropdown */}
                  <div className="relative">
                    <div className="flex items-center space-x-2">
                      <UserCircleIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {currentProfile?.full_name || currentUser.email}
                      </span>
                      <button
                        onClick={handleSignOut}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    location.pathname === item.href
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 inline mr-2" />
                  {item.name}
                </Link>
              ))}
              
              {currentUser && (
                <>
                  <div className="border-t border-gray-200 pt-4 pb-3">
                    <div className="px-4">
                      <div className="text-base font-medium text-gray-800">
                        {currentProfile?.full_name || currentUser.email}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {currentUser.user_metadata?.user_type}
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {userNavigation.map((item) => {
                        const userType = currentUser.user_metadata?.user_type
                        const allowedTypes = Array.isArray(item.userType) 
                          ? item.userType 
                          : [item.userType]
                        
                        if (!allowedTypes.includes(userType)) return null
                        
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        )
                      })}
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ESC</span>
                </div>
                <span className="text-xl font-bold">eScanCare</span>
              </div>
              <p className="text-gray-300 mb-4">
                Providing exceptional healthcare services with modern technology. 
                Your health is our priority.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/departments" className="text-gray-300 hover:text-white">
                    Departments
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Emergency
              </h3>
              <ul className="space-y-2">
                <li className="text-gray-300">
                  <span className="font-semibold">Ambulance:</span> 108
                </li>
                <li className="text-gray-300">
                  <span className="font-semibold">Emergency:</span> 911
                </li>
                <li className="text-gray-300">
                  <span className="font-semibold">Helpline:</span> 1800-123-4567
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm text-center">
              © 2024 eScanCare Hospital. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout 