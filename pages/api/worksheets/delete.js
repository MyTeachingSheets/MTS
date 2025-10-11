// API route to delete a worksheet
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Require authentication
  const userId = req.headers['x-user-id']
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Worksheet ID required' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Delete the worksheet (RLS policy ensures user can only delete their own)
    const { error } = await supabase
      .from('worksheets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return res.status(200).json({
      success: true,
      message: 'Worksheet deleted successfully'
    })
  } catch (error) {
    console.error('Delete worksheet error:', error)
    return res.status(500).json({ 
      error: 'Failed to delete worksheet',
      details: error.message 
    })
  }
}
