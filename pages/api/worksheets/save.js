// API route to create or update a worksheet
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
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
      customInstructions,
      content,
      status
    } = req.body

    // Validate required fields
    if (!title || !subject || !grade || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, subject, grade, content' 
      })
    }

    // Get user session (if authenticated)
    // const { data: { session } } = await supabase.auth.getSession()
    // const userId = session?.user?.id

    if (req.method === 'POST') {
      // Create new worksheet
      // TODO: Uncomment when Supabase is configured
      // const { data, error } = await supabase
      //   .from('worksheets')
      //   .insert([{
      //     title,
      //     description,
      //     subject,
      //     standard,
      //     grade,
      //     domain,
      //     worksheet_type_id: worksheetTypeId,
      //     custom_instructions: customInstructions,
      //     content,
      //     status: status || 'draft',
      //     created_by: userId
      //   }])
      //   .select()
      //   .single()

      // if (error) throw error

      // Mock response for now
      const mockWorksheet = {
        id: Date.now(),
        title,
        description,
        subject,
        standard,
        grade,
        domain,
        worksheetTypeId,
        customInstructions,
        content,
        status: status || 'draft',
        thumbnailUploaded: false,
        createdAt: new Date().toISOString()
      }

      return res.status(201).json({
        success: true,
        data: mockWorksheet
      })
    } else {
      // Update existing worksheet
      if (!id) {
        return res.status(400).json({ error: 'Worksheet ID required for update' })
      }

      // TODO: Uncomment when Supabase is configured
      // const { data, error } = await supabase
      //   .from('worksheets')
      //   .update({
      //     title,
      //     description,
      //     subject,
      //     standard,
      //     grade,
      //     domain,
      //     worksheet_type_id: worksheetTypeId,
      //     custom_instructions: customInstructions,
      //     content,
      //     status,
      //     updated_at: new Date().toISOString()
      //   })
      //   .eq('id', id)
      //   .select()
      //   .single()

      // if (error) throw error

      // Mock response for now
      return res.status(200).json({
        success: true,
        data: { id, ...req.body, updatedAt: new Date().toISOString() }
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
