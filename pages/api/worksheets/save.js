// API route to create or update a worksheet
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Require authentication
  const userId = req.headers['x-user-id']
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const {
      id,
      title,
      description,
      subject,
      standard,
      grade,
      domain,
      worksheetTypeId,
      worksheetType,
      customInstructions,
      content,
      status,
      thumbnailUrl,
      thumbnailUploaded,
      isListed
    } = req.body

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, content' 
      })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    if (req.method === 'POST') {
      // Create new worksheet
      const { data, error } = await supabase
        .from('worksheets')
        .insert([{
          user_id: userId,
          title,
          subject: subject || null,
          grade: grade || null,
          framework: standard || null,
          domain: domain || null,
          worksheet_type: worksheetType || worksheetTypeId || null,
          custom_instructions: customInstructions || null,
          content,
          status: status || 'draft',
          thumbnail_url: thumbnailUrl || null,
          thumbnail_uploaded: thumbnailUploaded || false,
          is_listed: isListed || false
        }])
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({
        success: true,
        data: data
      })
    } else {
      // Update existing worksheet
      if (!id) {
        return res.status(400).json({ error: 'Worksheet ID required for update' })
      }

      const { data, error } = await supabase
        .from('worksheets')
        .update({
          title,
          subject: subject || null,
          grade: grade || null,
          framework: standard || null,
          domain: domain || null,
          worksheet_type: worksheetType || worksheetTypeId || null,
          custom_instructions: customInstructions || null,
          content,
          status,
          thumbnail_url: thumbnailUrl || null,
          thumbnail_uploaded: thumbnailUploaded || false,
          is_listed: isListed || false
        })
        .eq('id', id)
        .eq('user_id', userId) // Ensure user can only update their own worksheets
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({
        success: true,
        data: data
      })
    }
  } catch (error) {
    console.error('Worksheet save error:', error)
    return res.status(500).json({ 
      error: 'Failed to save worksheet',
      details: error.message 
    })
  }
}
