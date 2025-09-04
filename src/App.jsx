import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { testDatabaseSetup } from './lib/simple-test'
import { supabase } from './lib/supabase'
import { testSupabaseConnection } from './lib/test-connection'
import { useAuthStore } from './stores/authStore'
import { useOtpAuthStore } from './stores/otpAuthStore'

// Layout Components
import EmergencyBanner from './components/common/EmergencyBanner'
import Layout from './components/layout/Layout'

// Public Pages
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import DepartmentsPage from './pages/DepartmentsPage'
import HomePage from './pages/HomePage'
import TestConnectionPage from './pages/TestConnectionPage'
import TestPage from './pages/TestPage'
import TestPatientPortal from './pages/TestPatientPortal'
import AuthChoicePage from './pages/auth/AuthChoicePage'
import AuthErrorPage from './pages/auth/AuthErrorPage'
import LoginPage from './pages/auth/LoginPage'
import PatientLoginPage from './pages/auth/PatientLoginPage'
import PatientSignupPage from './pages/auth/PatientSignupPage'
import SignupPage from './pages/auth/SignupPage'

// Protected Pages
import QRScanner from './components/qr/QRScanner'
import AdminDashboard from './pages/admin/AdminDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import PatientDashboard from './pages/patient/PatientDashboard'
import PatientDetailsPage from './pages/patient/PatientDetailsPage'

import StaffDashboard from './pages/staff/StaffDashboard'

// Loading Component
import LoadingSpinner from './components/common/LoadingSpinner'

// Error handling component
const ErrorHandler = ({ children }) => {
  const location = useLocation()
  
  useEffect(() => {
    // Check for error parameters in URL hash
    if (location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1))
      const error = hashParams.get('error')
      const errorCode = hashParams.get('error_code')
      const errorDescription = hashParams.get('error_description')
      
      if (error) {
        // Redirect to dedicated error page with error parameters
        const errorParams = new URLSearchParams({
          error,
          error_code: errorCode || '',
          error_description: errorDescription || ''
        }).toString()
        
        // Clear the hash and redirect to error page
        window.location.hash = ''
        window.location.href = `/auth-error?${errorParams}`
        return
      }
    }
  }, [location.hash])
  
  return children
}

function App() {
  const { user, setUser, loading, setLoading } = useAuthStore()
  const { user: otpUser, setUser: setOtpUser } = useOtpAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const previousUserRef = useRef(null)

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Test basic connection first
        const basicTest = await testDatabaseSetup()
        if (!basicTest.success) {
          console.error('Basic connection test failed:', basicTest.error)
          toast.error('Supabase connection failed. Please check your environment variables.')
          return
        }
        
        // Test database connection
        const connectionTest = await testSupabaseConnection()
        if (!connectionTest.success) {
          console.error('Database connection test failed:', connectionTest.error)
          toast.error('Database connection failed. Please run the database schema in Supabase.')
          return
        }
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        const initialUser = session?.user || null
        previousUserRef.current = initialUser
        
        // Set user in appropriate store based on user type
        if (initialUser) {
          const userType = initialUser.user_metadata?.user_type
          if (userType === 'patient') {
            setOtpUser(initialUser)
          } else {
            setUser(initialUser)
          }
        }

        // Load profile data if user exists
        if (initialUser) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', initialUser.id)
              .single()
            
            if (profileError) {
              console.error('Profile fetch error:', profileError)
            } else {
              // Update the appropriate auth store with profile data based on user type
              const userType = initialUser.user_metadata?.user_type
              if (userType === 'patient') {
                const { setProfile } = useOtpAuthStore.getState()
                setProfile(profile)
              } else {
                const { setProfile } = useAuthStore.getState()
                setProfile(profile)
              }
            }
          } catch (error) {
            console.error('Error loading profile:', error)
          }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            const newUser = session?.user || null
            const previousUser = previousUserRef.current
            
            // Update the ref before setting state
            previousUserRef.current = newUser
            
            // Set user in appropriate store based on user type
            if (newUser) {
              const userType = newUser.user_metadata?.user_type
              if (userType === 'patient') {
                setOtpUser(newUser)
              } else {
                setUser(newUser)
              }
            } else {
              // Clear both stores on logout
              setUser(null)
              setOtpUser(null)
            }
            
            // Load profile data when user changes
            if (newUser) {
              try {
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', newUser.id)
                  .single()
                
                if (profileError) {
                  console.error('Profile fetch error:', profileError)
                } else {
                  // Update the appropriate auth store with profile data based on user type
                  const userType = newUser.user_metadata?.user_type
                  if (userType === 'patient') {
                    const { setProfile } = useOtpAuthStore.getState()
                    setProfile(profile)
                  } else {
                    const { setProfile } = useAuthStore.getState()
                    setProfile(profile)
                  }
                }
              } catch (error) {
                console.error('Error loading profile:', error)
              }
            } else {
              // Clear profile when user signs out
              const { setProfile: setAuthProfile } = useAuthStore.getState()
              const { setProfile: setOtpProfile } = useOtpAuthStore.getState()
              setAuthProfile(null)
              setOtpProfile(null)
            }
            
            // Only show messages for actual sign out events when there was a previous user
            if (event === 'SIGNED_OUT' && previousUser && !newUser) {
              toast.success('You have been signed out')
            }
          }
        )

        setIsInitialized(true)
        return () => subscription.unsubscribe()
      } catch (error) {
        console.error('Auth initialization error:', error)
        toast.error('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [setUser, setLoading])

  // Show loading spinner while initializing
  if (!isInitialized || loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen gradient-bg">
      <EmergencyBanner />
      <Layout>
        <ErrorHandler>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthChoicePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/patient-login" element={<PatientLoginPage />} />
            <Route path="/patient-signup" element={<PatientSignupPage />} />
            <Route path="/auth-error" element={<AuthErrorPage />} />
                                <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/test-connection" element={<TestConnectionPage />} />
            <Route path="/test-patient-portal" element={<TestPatientPortal />} />
            
            {/* Public Patient View - must come before protected routes */}
            <Route 
              path="/patient/view/:patientId" 
              element={<PatientDetailsPage />} 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/patient/*" 
              element={
                (user?.user_metadata?.user_type === 'patient' || otpUser?.user_metadata?.user_type === 'patient') ? (
                  <PatientDashboard />
                ) : (
                  <Navigate to="/patient-login" replace />
                )
              } 
            />
            
            <Route 
              path="/doctor/*" 
              element={
                user?.user_metadata?.user_type === 'doctor' ? (
                  <DoctorDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            <Route 
              path="/admin/*" 
              element={
                user?.user_metadata?.user_type === 'admin' ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            <Route 
              path="/staff/*" 
              element={
                user?.user_metadata?.user_type === 'staff' ? (
                  <StaffDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* QR Scanner Route */}
            <Route 
              path="/qr-scanner" 
              element={
                user?.user_metadata?.user_type === 'doctor' || 
                user?.user_metadata?.user_type === 'admin' ? (
                  <QRScanner />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorHandler>
      </Layout>
    </div>
  )
}

export default App 