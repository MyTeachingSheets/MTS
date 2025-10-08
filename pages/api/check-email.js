import { createClient } from '@supabase/supabase-js'

// This endpoint must run server-side only. It uses the Supabase service role
// key (SUPABASE_SERVICE_ROLE_KEY) which must be set in your deployment env.
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  const email = req.method === 'POST' ? req.body?.email : req.query?.email
  if (!email) return res.status(400).json({ error: 'email is required' })

  try {
    // Use the admin API to check if a user exists with that email.
    const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    if (error) {
      // If Supabase returns an error we forward a generic message (no leak)
      return res.status(500).json({ error: 'failed to check email' })
    }

    // If data is not null, the user exists
    return res.status(200).json({ exists: !!data })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'server error' })
  }
}
