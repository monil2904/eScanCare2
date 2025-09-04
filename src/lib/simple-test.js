import { supabase } from './supabase.js'

export async function testDatabaseSetup() {
  
  try {
    // Test 1: Check if profiles table exists
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError)
      return { success: false, error: profilesError }
    }
    
    // Test 2: Check if departments table exists
    const { data: deptTest, error: deptError } = await supabase
      .from('departments')
      .select('name')
      .limit(1)
    
    if (deptError) {
      console.error('❌ Departments table error:', deptError)
      return { success: false, error: deptError }
    }
    
    // Test 3: Check hospital settings
    const { data: settingsTest, error: settingsError } = await supabase
      .from('hospital_settings')
      .select('hospital_name')
      .limit(1)
    
    if (settingsError) {
      console.error('❌ Hospital settings error:', settingsError)
      return { success: false, error: settingsError }
    }

    return { success: true }
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return { success: false, error }
  }
} 