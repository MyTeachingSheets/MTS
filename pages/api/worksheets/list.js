// API route to get worksheets (with filters)
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get user ID from header (set by authenticated client)
  const userId = req.headers['x-user-id']
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const { 
      subject, 
      grade, 
      status, 
      isListed,
      limit = 50,
      offset = 0 
    } = req.query

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Build query for user's worksheets
    let query = supabase
      .from('worksheets')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (subject) query = query.eq('subject', subject)
    if (grade) query = query.eq('grade', grade)
    if (status) query = query.eq('status', status)
    if (isListed !== undefined) query = query.eq('is_listed', isListed === 'true')

    // Pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    const { data, error, count } = await query

    if (error) throw error
    
    return res.status(200).json({
      success: true,
      data: data || [],
      count: count || 0,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    })
  } catch (error) {
    console.error('Fetch worksheets error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch worksheets',
      details: error.message 
    })
  }
}
