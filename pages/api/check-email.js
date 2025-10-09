import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.query

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' })
  }

  // Use service role key for admin access
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

    // Query auth.users table to check if email exists
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error('Error fetching users:', error)
      return res.status(500).json({ error: 'Failed to check email', details: error.message })
    }

    // Check if email exists in the list
    const userExists = data.users.some(user => user.email === email.toLowerCase())

    return res.status(200).json({ 
      exists: userExists,
      message: userExists ? 'Email already registered' : 'Email available'
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error', details: err.message })
  }
}
