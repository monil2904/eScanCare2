import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database schema types for TypeScript-like documentation
export const DatabaseSchema = {
  // Users table (extends Supabase auth.users)
  profiles: {
    id: 'uuid references auth.users',
    email: 'text',
    full_name: 'text',
    phone: 'text',
    date_of_birth: 'date',
    gender: 'text',
    blood_type: 'text',
    emergency_contact: 'jsonb',
    address: 'jsonb',
    user_type: 'text', // 'patient', 'doctor', 'staff', 'admin'
    department_id: 'uuid references departments',
    specialization: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  // Departments
  departments: {
    id: 'uuid primary key',
    name: 'text',
    description: 'text',
    head_doctor_id: 'uuid references profiles',
    contact_number: 'text',
    location: 'text',
    is_active: 'boolean',
    created_at: 'timestamp'
  },
  
  // Patient QR Codes
  patient_qr_codes: {
    id: 'uuid primary key',
    patient_id: 'uuid references profiles',
    qr_code: 'text unique',
    is_active: 'boolean',
    created_at: 'timestamp',
    last_accessed: 'timestamp'
  },
  
  // Appointments
  appointments: {
    id: 'uuid primary key',
    patient_id: 'uuid references profiles',
    doctor_id: 'uuid references profiles',
    department_id: 'uuid references departments',
    appointment_date: 'timestamp',
    appointment_time: 'time',
    status: 'text', // 'scheduled', 'confirmed', 'completed', 'cancelled'
    type: 'text', // 'consultation', 'follow-up', 'emergency'
    notes: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  // Medical Records
  medical_records: {
    id: 'uuid primary key',
    patient_id: 'uuid references profiles',
    doctor_id: 'uuid references profiles',
    appointment_id: 'uuid references appointments',
    diagnosis: 'text',
    symptoms: 'text',
    prescription: 'jsonb',
    lab_results: 'jsonb',
    notes: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  // Prescriptions
  prescriptions: {
    id: 'uuid primary key',
    patient_id: 'uuid references profiles',
    doctor_id: 'uuid references profiles',
    appointment_id: 'uuid references appointments',
    medications: 'jsonb',
    dosage_instructions: 'text',
    duration: 'text',
    side_effects: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  // Lab Reports
  lab_reports: {
    id: 'uuid primary key',
    patient_id: 'uuid references profiles',
    doctor_id: 'uuid references profiles',
    appointment_id: 'uuid references appointments',
    test_name: 'text',
    test_results: 'jsonb',
    reference_range: 'jsonb',
    status: 'text', // 'pending', 'completed', 'abnormal'
    report_file: 'text', // file URL
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  // Notifications
  notifications: {
    id: 'uuid primary key',
    user_id: 'uuid references profiles',
    title: 'text',
    message: 'text',
    type: 'text', // 'appointment', 'medication', 'lab_result', 'general'
    is_read: 'boolean',
    action_url: 'text',
    created_at: 'timestamp'
  },
  
  // Hospital Settings
  hospital_settings: {
    id: 'uuid primary key',
    hospital_name: 'text',
    mission_statement: 'text',
    emergency_contacts: 'jsonb',
    operating_hours: 'jsonb',
    address: 'jsonb',
    contact_info: 'jsonb',
    social_media: 'jsonb',
    updated_at: 'timestamp'
  }
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Test database connection
  async testConnection() {
    try {
      
      // First test if we can connect to Supabase
      const { data: authData, error: authError } = await supabase.auth.getSession()

      
      // Test if profiles table exists and is accessible
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('Database connection test failed:', error)
        
        // Check if it's a table not found error
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          return { 
            success: false, 
            error,
            details: {
              message: 'Profiles table does not exist. Please run the database schema in Supabase SQL Editor.',
              code: 'TABLE_NOT_FOUND',
              hint: 'Run the database-schema.sql in your Supabase project'
            }
          }
        }
        
        return { 
          success: false, 
          error,
          details: {
            message: error.message,
            code: error.code,
            hint: error.hint
          }
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Database connection test error:', error)
      return { 
        success: false, 
        error,
        details: {
          message: error.message,
          type: 'connection_error'
        }
      }
    }
  },

  // Get current user profile
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return profile
  },
  
  // Get user by QR code
  async getUserByQRCode(qrCode) {
    const { data: qrData } = await supabase
      .from('patient_qr_codes')
      .select('patient_id')
      .eq('qr_code', qrCode)
      .eq('is_active', true)
      .single()
    
    if (!qrData) return null
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', qrData.patient_id)
      .single()
    
    return profile
  },
  
  // Create QR code for patient
  async createQRCode(patientId) {
    const qrCode = `ESC-${patientId.slice(0, 8)}-${Date.now().toString(36)}`
    
    const { data, error } = await supabase
      .from('patient_qr_codes')
      .insert({
        patient_id: patientId,
        qr_code: qrCode,
        is_active: true
      })
      .select()
      .single()
    
    return { data, error, qrCode }
  },
  
  // Get patient appointments
  async getPatientAppointments(patientId) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!appointments_doctor_id_fkey(full_name, specialization),
        department:departments(name)
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true })
    
    return { data, error }
  },
  
  // Get doctor appointments
  async getDoctorAppointments(doctorId) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(full_name, phone),
        department:departments(name)
      `)
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: true })
    
    return { data, error }
  }
} 