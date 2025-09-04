import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseHelpers } from '../../lib/supabase'
import QrScanner from 'react-qr-scanner'
import { 
  CameraIcon, 
  UserIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const QRScanner = () => {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const [patientData, setPatientData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

                const handleScan = async (result) => {
                if (result && result.text) {
                  setScanning(false)
                  setScannedData(result.text)
      
      try {
        setLoading(true)
        setError(null)
        
        // Extract QR code from the scanned result
        const qrCode = result.text
        
        // Get patient data from QR code
        const patient = await supabaseHelpers.getUserByQRCode(qrCode)
        
        if (patient) {
          setPatientData(patient)
          toast.success('Patient data retrieved successfully')
        } else {
          setError('Invalid QR code or patient not found')
          toast.error('Invalid QR code')
        }
      } catch (err) {
        console.error('QR scan error:', err)
        setError('Failed to retrieve patient data')
        toast.error('Failed to retrieve patient data')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleError = (err) => {
    console.error('QR Scanner error:', err)
    setError('Failed to access camera')
    toast.error('Camera access denied')
  }

  const resetScanner = () => {
    setScanning(false)
    setScannedData(null)
    setPatientData(null)
    setError(null)
  }

  const viewPatientDetails = () => {
    if (patientData) {
      // Navigate to patient details page with patient ID
      navigate(`/doctor/patient/${patientData.id}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          QR Code Scanner
        </h1>
        <p className="text-gray-600">
          Scan patient QR codes to access their medical information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Scanner
              </h2>
              {!scanning && (
                <button
                  onClick={() => setScanning(true)}
                  className="btn-primary"
                >
                  <CameraIcon className="w-5 h-5 mr-2" />
                  Start Scanning
                </button>
              )}
            </div>

            {scanning ? (
              <div className="space-y-4">
                <div className="relative">
                                                <QrScanner
                                onScan={handleScan}
                                onError={handleError}
                                style={{
                                  width: '100%',
                                  maxWidth: '400px',
                                  margin: '0 auto'
                                }}
                                constraints={{
                                  video: {
                                    facingMode: 'environment'
                                  }
                                }}
                              />
                  <div className="absolute inset-0 border-2 border-primary-500 border-dashed pointer-events-none"></div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Position the QR code within the frame
                  </p>
                  <button
                    onClick={() => setScanning(false)}
                    className="btn-secondary"
                  >
                    Stop Scanning
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Click "Start Scanning" to begin scanning patient QR codes
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-danger-600 mr-2" />
                  <p className="text-danger-600">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Scanned Data */}
          {scannedData && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Scanned QR Code
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">QR Code Data:</p>
                <p className="font-mono text-sm break-all">{scannedData}</p>
              </div>
              <button
                onClick={resetScanner}
                className="mt-4 btn-secondary"
              >
                Scan Another Code
              </button>
            </div>
          )}
        </div>

        {/* Patient Information */}
        <div className="space-y-6">
          {loading ? (
            <div className="card">
              <div className="text-center py-8">
                <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                <p className="text-gray-600">Retrieving patient information...</p>
              </div>
            </div>
          ) : patientData ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Patient Information
                </h2>
                <CheckCircleIcon className="w-6 h-6 text-success-600" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-8 h-8 text-primary-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {patientData.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">Patient ID: {patientData.id.slice(0, 8)}...</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{patientData.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{patientData.phone}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-gray-900">
                      {patientData.date_of_birth ? new Date(patientData.date_of_birth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900">{patientData.gender || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <p className="text-gray-900">{patientData.blood_type || 'N/A'}</p>
                  </div>
                </div>

                {patientData.emergency_contact && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Name</label>
                        <p className="text-gray-900">{patientData.emergency_contact.name}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Phone</label>
                        <p className="text-gray-900">{patientData.emergency_contact.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={viewPatientDetails}
                    className="btn-primary flex-1"
                  >
                    View Full Details
                  </button>
                  <button
                    onClick={resetScanner}
                    className="btn-secondary"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-8">
                <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Patient Data
                </h3>
                <p className="text-gray-600">
                  Scan a patient QR code to view their information here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How to Use the QR Scanner
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Start Scanning</h4>
            <p className="text-sm text-gray-600">
              Click "Start Scanning" to activate the camera
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Position QR Code</h4>
            <p className="text-sm text-gray-600">
              Hold the patient's QR code within the scanning frame
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">View Information</h4>
            <p className="text-sm text-gray-600">
              Patient information will appear automatically after scanning
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner 