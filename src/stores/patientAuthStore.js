import toast from 'react-hot-toast'
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const usePatientAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  otpSent: false,
  email: '',
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setOtpSent: (otpSent) => set({ otpSent }),
  setEmail: (email) => set({ email }),
  
  // Send OTP to email (fallback for phone)
  sendEmailOtp: async (email) => {
    try {
      set({ loading: true })
      
      console.log('Sending email OTP to:', email)
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          data: {
            user_type: 'patient',
            email: email
          }
        }
      })
      
      if (error) {
        console.error('Email OTP send error:', error)
        throw error
      }
      
      set({ otpSent: true, email: email })
      toast.success('OTP sent to your email!')
      
      return { success: true, data }
    } catch (error) {
      console.error('Send email OTP error:', error)
      
      let errorMessage = 'Failed to send OTP'
      if (error.message) {
        if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many attempts. Please try again later'
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
  
  // Verify email OTP and sign in
  verifyEmailOtp: async (otp) => {
    try {
      set({ loading: true })
      
      console.log('Verifying email OTP for:', get().email)
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: get().email,
        token: otp,
        type: 'email'
      })
      
      if (error) {
        console.error('Email OTP verification error:', error)
        throw error
      }
      
      console.log('Email OTP verified, getting profile...')
      
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
              email: get().email,
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
      console.error('Email OTP verification error:', error)
      
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ user: null, profile: null, otpSent: false, email: '' })
      toast.success('You have been signed out')
      
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
      return { success: false, error }
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
    set({ otpSent: false, email: '' })
  }
})) 