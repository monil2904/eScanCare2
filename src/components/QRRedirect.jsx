import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import HomePage from '../pages/HomePage'

const QRRedirect = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  useEffect(() => {
    const patientId = searchParams.get('patient')
    if (patientId) {
      // Redirect to the patient profile page
      navigate(`/patient-profile/${patientId}`, { replace: true })
    }
  }, [searchParams, navigate])
  
  // If there's a patient query parameter, show loading
  const patientId = searchParams.get('patient')
  if (patientId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }
  
  // If no patient query parameter, show the home page
  return <HomePage />
}

export default QRRedirect
