import { supabase } from './supabase.js'

export async function testSupabaseConnection() {
  try {
    
    // Test basic connection
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    // Test database access
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    
    if (error) {
      console.error('Connection failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Test failed:', error)
    return { success: false, error }
  }
} 