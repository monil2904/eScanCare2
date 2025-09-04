import { PhoneIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const EmergencyBanner = () => {
  return (
    <div className="emergency-banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-4">
          <ExclamationTriangleIcon className="w-5 h-5 animate-pulse" />
          <span className="font-semibold">EMERGENCY CONTACTS:</span>
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1">
              <PhoneIcon className="w-4 h-4" />
              <span>Ambulance: 108</span>
            </span>
            <span className="flex items-center space-x-1">
              <PhoneIcon className="w-4 h-4" />
              <span>Emergency: 911</span>
            </span>
            <span className="flex items-center space-x-1">
              <PhoneIcon className="w-4 h-4" />
              <span>Helpline: 1800-123-4567</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyBanner 