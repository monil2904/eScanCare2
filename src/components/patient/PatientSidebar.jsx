import {
  ArrowRightOnRectangleIcon,
  BeakerIcon,
  CalendarIcon,
  DocumentTextIcon,
  HomeIcon,
  QrCodeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useOtpAuthStore } from '../../stores/otpAuthStore'

const PatientSidebar = () => {
  const { profile, signOut } = useAuthStore()
  const { profile: otpProfile, signOut: otpSignOut } = useOtpAuthStore()

  // Use profile from either store
  const currentProfile = profile || otpProfile
  
  // Use signOut from the appropriate store
  const handleSignOut = async () => {
    if (profile) {
      await signOut()
    } else if (otpProfile) {
      await otpSignOut()
    }
  }

  const navigation = [
    { name: 'Overview', href: '/patient', icon: HomeIcon },
    { name: 'Appointments', href: '/patient/appointments', icon: CalendarIcon },
    { name: 'Medical Records', href: '/patient/medical-records', icon: DocumentTextIcon },
    { name: 'Prescriptions', href: '/patient/prescriptions', icon: BeakerIcon },
    { name: 'Lab Reports', href: '/patient/lab-reports', icon: BeakerIcon },
    { name: 'QR Code', href: '/patient/qr-code', icon: QrCodeIcon },
    { name: 'Profile', href: '/patient/profile', icon: UserIcon },
  ]

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        {/* User Info */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {currentProfile?.full_name?.charAt(0) || 'P'}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {currentProfile?.full_name || 'Patient'}
            </h2>
            <p className="text-sm text-gray-500">Patient</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default PatientSidebar 