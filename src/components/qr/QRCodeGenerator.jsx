import {
    ArrowDownTrayIcon,
    ExclamationTriangleIcon,
    QrCodeIcon
} from '@heroicons/react/24/outline'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'

const QRCodeGenerator = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.id) {
      setLoading(false)
    }
  }, [user])

  const downloadQRCode = () => {
    if (!user?.id) return

    const canvas = document.createElement('canvas')
    const svg = document.querySelector('#qr-code svg')
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      
      const link = document.createElement('a')
      link.download = `patient-qr-code-${user.id.slice(0, 8)}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your QR code...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-danger-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading QR Code
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-danger-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            User Not Found
          </h3>
          <p className="text-gray-600">Please log in to generate your QR code.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Your QR Code
          </h2>
          <p className="text-gray-600">
            Show this QR code to healthcare providers for quick access to your medical information
          </p>
        </div>
        <QrCodeIcon className="w-8 h-8 text-primary-600" />
      </div>

      <div className="text-center space-y-6">
        {/* QR Code Display */}
        <div id="qr-code" className="inline-block p-4 bg-white rounded-lg border border-gray-200">
          <QRCodeSVG
            value={user.id}
            size={200}
            level="M"
            includeMargin={true}
            className="mx-auto"
          />
        </div>

        {/* QR Code Information */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Patient ID:</p>
            <p className="font-mono text-sm break-all">{user.id}</p>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>How to use:</strong>
            </p>
            <ul className="text-left space-y-1">
              <li>• Show this QR code to doctors and nurses</li>
              <li>• They can scan it to access your medical records</li>
              <li>• Keep this code secure and private</li>
              <li>• This QR code is unique to your profile</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={downloadQRCode}
            className="btn-primary"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Download QR Code
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-warning-800">
              <p className="font-medium mb-1">Security Notice</p>
              <p>
                This QR code contains your unique patient ID. Keep it secure and only share 
                it with authorized healthcare providers. This code is permanent and linked to your profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeGenerator 