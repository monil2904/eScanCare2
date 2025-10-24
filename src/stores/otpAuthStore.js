import toast from 'react-hot-toast'
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useOtpAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  otpSent: false,
  phoneNumber: '',
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setOtpSent: (otpSent) => set({ otpSent }),
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  
  // Send OTP to phone number
  sendOtp: async (phoneNumber) => {
    try {
      set({ loading: true })
      
      console.log('Sending OTP to:', phoneNumber)
      
      // Format phone number to include country code if not present
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
      
      // First, try to sign in with OTP
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
          data: {
            user_type: 'patient',
            phone: formattedPhone
          }
        }
      })
      
      if (error) {
        console.error('OTP send error:', error)
        
        // If phone auth is not enabled, provide helpful error
        if (error.message.includes('Unsupported phone') || error.message.includes('phone auth')) {
          throw new Error('Phone authentication is not enabled. Please contact the administrator or use email login.')
        }
        
        throw error
      }
      
      set({ otpSent: true, phoneNumber: formattedPhone })
      toast.success('OTP sent to your phone number!')
      
      return { success: true, data }
    } catch (error) {
      console.error('Send OTP error:', error)
      
      let errorMessage = 'Failed to send OTP'
      if (error.message) {
        if (error.message.includes('Invalid phone')) {
          errorMessage = 'Please enter a valid phone number'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many attempts. Please try again later'
        } else if (error.message.includes('Unsupported phone') || error.message.includes('phone auth')) {
          errorMessage = 'Phone authentication is not enabled. Please use email login or contact support.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },
  
  // Verify OTP and sign in
  verifyOtp: async (otp) => {
    try {
      set({ loading: true })
      
      console.log('Verifying OTP for:', get().phoneNumber)
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: get().phoneNumber,
        token: otp,
        type: 'sms'
      })
      
      if (error) {
        console.error('OTP verification error:', error)
        throw error
      }
      
      console.log('OTP verified, getting profile...')
      
      // Get or create user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) {
        console.error('Profile fetch error:', profileError)
        // Create profile if it doesn't exist
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              phone: get().phoneNumber,
              full_name: data.user.user_metadata?.full_name || '',
              user_type: 'patient'
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Profile creation error:', createError)
            throw createError
          }
          
          set({ user: data.user, profile: newProfile, otpSent: false })
          toast.success('Welcome to eScanCare Hospital!')
          return { success: true, user: data.user, profile: newProfile }
        }
        throw profileError
      }
      
      set({ user: data.user, profile, otpSent: false })
      toast.success('Welcome back!')
      
      return { success: true, user: data.user, profile }
    } catch (error) {
      console.error('OTP verification error:', error)
      
      let errorMessage = 'Failed to verify OTP'
      if (error.message) {
        if (error.message.includes('Invalid token')) {
          errorMessage = 'Invalid OTP. Please try again'
        } else if (error.message.includes('Token expired')) {
          errorMessage = 'OTP expired. Please request a new one'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },
  
  // Sign out
  signOut: async () => {
    try {
      set({ loading: true })
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ user: null, profile: null, otpSent: false, phoneNumber: '' })
      toast.success('You have been signed out')
      
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },
  
  // Update profile
  updateProfile: async (updates) => {
    try {
      set({ loading: true })
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', get().user.id)
        .select()
        .single()
      
      if (error) throw error
      
      set({ profile: data })
      toast.success('Profile updated successfully')
      
      return { success: true, profile: data }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },
  
  // Refresh profile
  refreshProfile: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', get().user?.id)
        .single()
      
      if (error) throw error
      
      set({ profile: data })
      return data
    } catch (error) {
      console.error('Profile refresh error:', error)
      return null
    }
  },
  
  // Reset OTP state
  resetOtpState: () => {
    set({ otpSent: false, phoneNumber: '' })
  },

  // Handle expired OTP
  handleExpiredOtp: () => {
    set({ otpSent: false, phoneNumber: '' })
    toast.error('OTP has expired. Please request a new one.')
  },

  // Check if OTP is expired (you can call this when user tries to verify)
  isOtpExpired: (sentTime) => {
    if (!sentTime) return true
    const now = Date.now()
    const otpAge = now - sentTime
    // OTP expires after 10 minutes (600,000 ms)
    return otpAge > 600000
  }
})) 