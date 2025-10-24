import toast from 'react-hot-toast'
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  
  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      set({ loading: true })
      
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Supabase auth error:', error)
        throw error
      }
      
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) {
        console.error('Profile fetch error:', profileError)
        // If profile doesn't exist, create a basic one
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || '',
              user_type: data.user.user_metadata?.user_type || 'patient'
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Profile creation error:', createError)
            throw createError
          }
          
          set({ user: data.user, profile: newProfile })
          toast.success('Welcome back!')
          return { success: true, user: data.user, profile: newProfile }
        }
        throw profileError
      }
      
      set({ user: data.user, profile })
      toast.success('Welcome back!')
      
      return { success: true, user: data.user, profile }
    } catch (error) {
      console.error('Sign in error:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to sign in'
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later'
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
  
  // Sign up with email and password
  signUp: async (email, password, userData) => {
    try {
      set({ loading: true })
      

      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userData.user_type,
            full_name: userData.full_name,
          }
        }
      })
      
      if (error) throw error
      
      
      // If user needs email confirmation, sign them in directly
      if (data.user && !data.session) {
        // Sign in immediately after signup to bypass email confirmation
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (signInError) throw signInError
        
        // Use the signed-in user data
        data.user = signInData.user
        data.session = signInData.session
      }
      
      // Ensure we have a valid user ID before creating profile
      if (!data.user || !data.user.id) {
        throw new Error('User ID is missing after signup')
      }
      
      
      // Create the user profile directly (no trigger dependency)
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name,
          phone: userData.phone || null,
          date_of_birth: userData.date_of_birth || null,
          gender: userData.gender || null,
          blood_type: userData.blood_type || null,
          user_type: userData.user_type,
          department_id: userData.department_id || null,
          specialization: userData.specialization || null,
          emergency_contact: userData.emergency_contact || null,
          address: userData.address || null,
        })
        .select()
        .single()
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Try to create a basic profile if the full one fails
        const { data: basicProfile, error: basicError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: userData.full_name || '',
            user_type: userData.user_type || 'patient'
          })
          .select()
          .single()
        
        if (basicError) {
          console.error('Basic profile creation also failed:', basicError)
          // Don't throw error, continue with user creation
        } else {
          set({ user: data.user, profile: basicProfile })
          toast.success('Account created successfully! Welcome to eScanCare Hospital.')
          return { success: true, user: data.user, profile: basicProfile }
        }
      } else {
        set({ user: data.user, profile: newProfile })
        toast.success('Account created successfully! Welcome to eScanCare Hospital.')
        return { success: true, user: data.user, profile: newProfile }
      }
      
      // Create QR code for patients
      if (userData.user_type === 'patient') {
        const { error: qrError } = await supabase
          .from('patient_qr_codes')
          .insert({
            patient_id: data.user.id,
            qr_code: `${window.location.origin}/patient/view/${data.user.id}`,
            is_active: true
          })
        
        if (qrError) console.error('QR code creation error:', qrError)
      }
      
      // Profile creation is handled above, so we can return success here
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Failed to create account')
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
      
      set({ user: null, profile: null })
      
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
  
  // Reset password
  resetPassword: async (email) => {
    try {
      set({ loading: true })
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      
      toast.success('Password reset email sent!')
      return { success: true }
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error(error.message || 'Failed to send reset email')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },

  // Resend email verification
  resendVerification: async (email) => {
    try {
      set({ loading: true })
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      })
      
      if (error) throw error
      
      toast.success('Verification email sent! Please check your inbox.')
      return { success: true }
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error(error.message || 'Failed to send verification email')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },

  // Send email confirmation
  sendEmailConfirmation: async (email) => {
    try {
      set({ loading: true })
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      })
      
      if (error) throw error
      
      toast.success('Confirmation email sent! Please check your inbox.')
      return { success: true }
    } catch (error) {
      console.error('Send confirmation error:', error)
      toast.error(error.message || 'Failed to send confirmation email')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },

  // Check if email exists in Supabase auth users using edge function
  checkEmailExists: async (email) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-email-exists', {
        body: { email }
      })
      
      
      if (error) {
        console.error('Error checking email existence:', error)
        return false
      }
      
      const exists = data?.exists || false
      return exists
    } catch (error) {
      console.error('Error checking email existence:', error)
      return false
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      set({ loading: true })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Failed to sign in with Google')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },

  // Sign up with Google
  signUpWithGoogle: async () => {
    try {
      set({ loading: true })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Google sign up error:', error)
      toast.error('Failed to sign up with Google')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },

  // Handle OAuth callback and create profile if needed
  handleOAuthCallback: async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (data.session?.user) {
        const user = data.session.user
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              user_type: 'patient', // Default to patient for OAuth users
              phone: user.user_metadata?.phone || null,
              address: null,
              emergency_contact: null
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Profile creation error:', createError)
            throw createError
          }
          
          set({ user, profile: newProfile })
          toast.success('Welcome to eScanCare Hospital!')
          return { success: true, user, profile: newProfile }
        } else if (profileError) {
          throw profileError
        } else {
          set({ user, profile })
          toast.success('Welcome back!')
          return { success: true, user, profile }
        }
      }
      
      return { success: false, error: 'No session found' }
    } catch (error) {
      console.error('OAuth callback error:', error)
      toast.error('Failed to complete authentication')
      return { success: false, error }
    }
  },
})) 