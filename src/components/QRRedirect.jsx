import { useSearchParams } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import PatientDetailsPage from '../pages/patient/PatientDetailsPage'

const QRRedirect = () => {
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patient')
  
  // If there's a patient query parameter, show the patient details page directly
  if (patientId) {
    return <PatientDetailsPage patientId={patientId} />
  }
  
  // If no patient query parameter, show the home page
  return <HomePage />
}

export default QRRedirect
