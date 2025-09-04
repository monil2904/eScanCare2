import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useOtpAuthStore } from '../../stores/otpAuthStore'
import { usePatientAuthStore } from '../../stores/patientAuthStore'

const PatientLoginPage = () => {
  const { sendOtp, verifyOtp, loading: phoneLoading, otpSent: phoneOtpSent, phoneNumber, resetOtpState } = useOtpAuthStore()
  const { sendEmailOtp, verifyEmailOtp, loading: emailLoading, otpSent: emailOtpSent, email, resetOtpState: resetEmailOtpState } = usePatientAuthStore()
  const navigate = useNavigate()
  const [showOtp, setShowOtp] = useState(false)
  const [useEmail, setUseEmail] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    otp: ''
  })
  const [errors, setErrors] = useState({})
  
  const loading = phoneLoading || emailLoading
  const otpSent = phoneOtpSent || emailOtpSent

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validatePhone = () => {
    const newErrors = {}
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateEmail = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateOtp = () => {
    const newErrors = {}
    
    if (!formData.otp) {
      newErrors.otp = 'OTP is required'
    } else if (!/^[0-9]{6}$/.test(formData.otp)) {
      newErrors.otp = 'Please enter a valid 6-digit OTP'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    
    if (useEmail) {
      if (!validateEmail()) return
      const result = await sendEmailOtp(formData.email)
      if (result.success) {
        // Email OTP sent successfully
      }
    } else {
      if (!validatePhone()) return
      const result = await sendOtp(formData.phone)
      if (result.success) {
        // Phone OTP sent successfully
      }
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    
    if (!validateOtp()) return
    
    if (useEmail) {
      const result = await verifyEmailOtp(formData.otp)
      if (result.success) {
        navigate('/patient')
      }
    } else {
      const result = await verifyOtp(formData.otp)
      if (result.success) {
        navigate('/patient')
      }
    }
  }

  const handleResendOtp = async () => {
    if (useEmail) {
      if (!email) return
      const result = await sendEmailOtp(email)
      if (result.success) {
        toast.success('OTP resent successfully!')
      }
    } else {
      if (!phoneNumber) return
      const result = await sendOtp(phoneNumber)
      if (result.success) {
        toast.success('OTP resent successfully!')
      }
    }
  }

  const handleBackToForm = () => {
    if (useEmail) {
      resetEmailOtpState()
      setFormData({ ...formData, otp: '' })
    } else {
      resetOtpState()
      setFormData({ ...formData, otp: '' })
    }
    setErrors({})
  }

  const toggleAuthMethod = () => {
    setUseEmail(!useEmail)
    setFormData({ phone: '', email: '', otp: '' })
    setErrors({})
    resetOtpState()
    resetEmailOtpState()
  }

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
            Patient Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {otpSent ? `Enter the OTP sent to your ${useEmail ? 'email' : 'phone'}` : `Login with your ${useEmail ? 'email' : 'phone number'}`}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
          {!otpSent ? (
            <>
              {/* Auth method toggle */}
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={toggleAuthMethod}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      !useEmail 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Phone
                  </button>
                  <button
                    type="button"
                    onClick={toggleAuthMethod}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      useEmail 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
              {useEmail ? (
                // Email input
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-field ${
                        errors.email ? 'border-danger-500 focus:ring-danger-500' : ''
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-danger-600">{errors.email}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    We'll send a 6-digit OTP to this email
                  </p>
                </div>
              ) : (
                // Phone number input
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input-field ${
                        errors.phone ? 'border-danger-500 focus:ring-danger-500' : ''
                      }`}
                      placeholder="Enter your 10-digit phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-danger-600">{errors.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    We'll send a 6-digit OTP to this number
                  </p>
                </div>
              )}
            </div>
            </>
          ) : (
            // OTP input
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  OTP Code
                </label>
                <div className="mt-1 relative">
                  <input
                    id="otp"
                    name="otp"
                    type={showOtp ? 'text' : 'password'}
                    autoComplete="one-time-code"
                    required
                    value={formData.otp}
                    onChange={handleChange}
                    className={`input-field pr-10 ${
                      errors.otp ? 'border-danger-500 focus:ring-danger-500' : ''
                    }`}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowOtp(!showOtp)}
                  >
                    {showOtp ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.otp && (
                  <p className="mt-1 text-sm text-danger-600">{errors.otp}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit code sent to {useEmail ? email : phoneNumber}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  ← Back to {useEmail ? 'email' : 'phone number'}
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="spinner w-4 h-4"></div>
              ) : otpSent ? (
                'Verify OTP'
              ) : (
                'Send OTP'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {otpSent ? (
                <>
                  Didn't receive the OTP?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Resend
                  </button>
                </>
              ) : (
                <>
                  For doctors and staff,{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    login here
                  </Link>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientLoginPage 