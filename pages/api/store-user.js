import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, email, metadata } = req.body

  if (!userId || !email) {
    return res.status(400).json({ error: 'userId and email are required' })
  }

  // Use service role key for admin access to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // First, get user data from auth.users to ensure it exists
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authError) {
      console.error('Error fetching auth user:', authError)
      return res.status(404).json({ error: 'User not found in auth', details: authError.message })
    }

    // Upsert user data into the users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email: email.toLowerCase(),
        metadata: metadata || authUser.user_metadata || {},
        last_sign_in_at: authUser.last_sign_in_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()

    if (error) {
      console.error('Error upserting user:', error)
      return res.status(500).json({ error: 'Failed to store user', details: error.message })
    }

    return res.status(200).json({ 
      success: true,
      message: 'User stored successfully',
      user: data?.[0] || { id: userId, email }
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error', details: err.message })
  }
}
