import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the email from the request body
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use Supabase Admin API to check if user exists
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    // Get all users and filter by email (the query parameter might not work as expected)
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`Admin API request failed: ${response.status} ${response.statusText}`)
      throw new Error(`Admin API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Admin API response:', JSON.stringify(data, null, 2))
    
    // Check if any users were found with this specific email
    const exists = data.users && data.users.some((user: any) => user.email === email)
    console.log(`Email ${email} exists:`, exists)

    return new Response(
      JSON.stringify({ exists }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error checking email existence:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to check email existence',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
