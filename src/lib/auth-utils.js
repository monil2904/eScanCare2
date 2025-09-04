// Authentication utility functions

/**
 * Parse authentication error from URL hash
 * @param {string} hash - URL hash string
 * @returns {Object} Parsed error information
 */
export const parseAuthError = (hash) => {
  if (!hash) return null
  
  try {
    const hashParams = new URLSearchParams(hash.substring(1))
    const error = hashParams.get('error')
    const errorCode = hashParams.get('error_code')
    const errorDescription = hashParams.get('error_description')
    
    if (!error) return null
    
    return {
      error,
      errorCode,
      errorDescription: errorDescription ? decodeURIComponent(errorDescription) : '',
      isExpired: errorCode === 'otp_expired',
      isAccessDenied: errorCode === 'access_denied',
      isInvalidToken: errorCode === 'invalid_token'
    }
  } catch (err) {
    console.error('Error parsing auth error:', err)
    return null
  }
}

/**
 * Get user-friendly error message for authentication errors
 * @param {Object} errorInfo - Parsed error information
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (errorInfo) => {
  if (!errorInfo) return 'An authentication error occurred'
  
  switch (errorInfo.errorCode) {
    case 'otp_expired':
      return 'Your email verification link has expired. Please request a new one.'
    case 'access_denied':
      return 'Access denied. Please try logging in again.'
    case 'invalid_token':
      return 'The verification link is invalid. Please request a new one.'
    case 'email_not_confirmed':
      return 'Please check your email and confirm your account before signing in.'
    case 'invalid_credentials':
      return 'Invalid email or password. Please try again.'
    case 'too_many_requests':
      return 'Too many attempts. Please try again later.'
    default:
      return errorInfo.errorDescription || 'An authentication error occurred. Please try again.'
  }
}

/**
 * Get suggested action for authentication errors
 * @param {Object} errorInfo - Parsed error information
 * @returns {Object} Suggested action information
 */
export const getAuthErrorAction = (errorInfo) => {
  if (!errorInfo) return { action: 'retry', message: 'Please try again' }
  
  switch (errorInfo.errorCode) {
    case 'otp_expired':
      return {
        action: 'resend',
        message: 'Request a new verification email',
        primaryAction: 'Resend Email',
        secondaryAction: 'Back to Login'
      }
    case 'access_denied':
      return {
        action: 'login',
        message: 'Please sign in again',
        primaryAction: 'Sign In',
        secondaryAction: 'Back to Home'
      }
    case 'invalid_token':
      return {
        action: 'resend',
        message: 'Request a new verification email',
        primaryAction: 'Resend Email',
        secondaryAction: 'Back to Login'
      }
    case 'email_not_confirmed':
      return {
        action: 'resend',
        message: 'Resend confirmation email',
        primaryAction: 'Resend Email',
        secondaryAction: 'Back to Login'
      }
    default:
      return {
        action: 'retry',
        message: 'Please try again',
        primaryAction: 'Try Again',
        secondaryAction: 'Back to Home'
      }
  }
}

/**
 * Check if OTP is expired based on timestamp
 * @param {number} sentTime - Timestamp when OTP was sent
 * @param {number} expiryMinutes - Minutes until OTP expires (default: 10)
 * @returns {boolean} True if OTP is expired
 */
export const isOtpExpired = (sentTime, expiryMinutes = 10) => {
  if (!sentTime) return true
  const now = Date.now()
  const otpAge = now - sentTime
  const expiryMs = expiryMinutes * 60 * 1000
  return otpAge > expiryMs
}

/**
 * Format time remaining until OTP expires
 * @param {number} sentTime - Timestamp when OTP was sent
 * @param {number} expiryMinutes - Minutes until OTP expires (default: 10)
 * @returns {string} Formatted time remaining
 */
export const getOtpTimeRemaining = (sentTime, expiryMinutes = 10) => {
  if (!sentTime) return 'Expired'
  
  const now = Date.now()
  const otpAge = now - sentTime
  const expiryMs = expiryMinutes * 60 * 1000
  const remaining = expiryMs - otpAge
  
  if (remaining <= 0) return 'Expired'
  
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
