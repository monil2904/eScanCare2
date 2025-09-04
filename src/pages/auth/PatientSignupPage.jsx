import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useOtpAuthStore } from '../../stores/otpAuthStore'

const PatientSignupPage = () => {
  const { sendOtp, verifyOtp, loading, otpSent, phoneNumber, resetOtpState } = useOtpAuthStore()
  const navigate = useNavigate()
  const [showOtp, setShowOtp] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    otp: ''
  })
  const [errors, setErrors] = useState({})

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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required'
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
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
    
    if (!validateForm()) return
    
    const result = await sendOtp(formData.phone)
    
    if (result.success) {
      // OTP sent successfully, form will show OTP input
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    
    if (!validateOtp()) return
    
    // Update the user metadata with patient information
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          blood_type: formData.blood_type
        }
      })
      
      if (updateError) {
        console.error('Error updating user metadata:', updateError)
      }
    }
    
    const result = await verifyOtp(formData.otp)
    
    if (result.success) {
      // Update the profile with additional patient information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          blood_type: formData.blood_type
        })
        .eq('id', result.user.id)
      
      if (profileError) {
        console.error('Error updating profile:', profileError)
      }
      
      navigate('/patient')
    }
  }

  const handleResendOtp = async () => {
    if (!phoneNumber) return
    
    const result = await sendOtp(phoneNumber)
    
    if (result.success) {
      toast.success('OTP resent successfully!')
    }
  }

  const handleBackToForm = () => {
    resetOtpState()
    setFormData(prev => ({ ...prev, otp: '' }))
    setErrors(prev => ({ ...prev, otp: '' }))
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
            Patient Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {otpSent ? 'Verify your phone number' : 'Create your patient account'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
          {!otpSent ? (
            // Registration form
            <div className="space-y-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`input-field ${
                    errors.full_name ? 'border-danger-500 focus:ring-danger-500' : ''
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.full_name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
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
                {errors.phone && (
                  <p className="mt-1 text-sm text-danger-600">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className={`input-field ${
                    errors.date_of_birth ? 'border-danger-500 focus:ring-danger-500' : ''
                  }`}
                />
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-danger-600">{errors.date_of_birth}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className={`input-field ${
                    errors.gender ? 'border-danger-500 focus:ring-danger-500' : ''
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-danger-600">{errors.gender}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
                  Blood Type (Optional)
                </label>
                <select
                  id="blood_type"
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          ) : (
            // OTP verification
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
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  ← Back to form
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
                'Verify & Create Account'
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
                  Already have an account?{' '}
                  <Link
                    to="/patient-login"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Login here
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

export default PatientSignupPage 