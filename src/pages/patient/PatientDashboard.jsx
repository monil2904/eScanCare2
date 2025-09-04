import { Navigate, Route, Routes } from 'react-router-dom'
import PatientSidebar from '../../components/patient/PatientSidebar'
import QRCodeGenerator from '../../components/qr/QRCodeGenerator'
import { useAuthStore } from '../../stores/authStore'
import { useOtpAuthStore } from '../../stores/otpAuthStore'
import PatientAppointments from './PatientAppointments'
import PatientLabReports from './PatientLabReports'
import PatientMedicalHistory from './PatientMedicalHistory'
import PatientMedicalRecords from './PatientMedicalRecords'
import PatientOverview from './PatientOverview'
import PatientPrescriptions from './PatientPrescriptions'
import PatientProfile from './PatientProfile'

const PatientDashboard = () => {
  const { user, profile } = useAuthStore()
  const { user: otpUser, profile: otpProfile } = useOtpAuthStore()

  // Check if user is authenticated as a patient from either store
  const isPatient = (user?.user_metadata?.user_type === 'patient') || 
                   (otpUser?.user_metadata?.user_type === 'patient')
  
  const currentUser = user || otpUser
  const currentProfile = profile || otpProfile

  if (!isPatient) {
    return <Navigate to="/patient-login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <PatientSidebar />
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<PatientOverview />} />
              <Route path="/appointments" element={<PatientAppointments />} />
              <Route path="/medical-history" element={<PatientMedicalHistory />} />
              <Route path="/medical-records" element={<PatientMedicalRecords />} />
              <Route path="/prescriptions" element={<PatientPrescriptions />} />
              <Route path="/lab-reports" element={<PatientLabReports />} />
              <Route path="/qr-code" element={<QRCodeGenerator />} />
              <Route path="/profile" element={<PatientProfile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard 