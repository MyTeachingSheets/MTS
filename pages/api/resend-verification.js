import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    // Supabase resend confirmation using the resend method
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify`
      }
    })

    if (error) {
      console.error('Resend verification error:', error)
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Confirmation email sent successfully' 
    })
  } catch (err) {
    console.error('Resend verification exception:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
