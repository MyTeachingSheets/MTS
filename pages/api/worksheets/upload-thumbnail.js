// API route to upload worksheet thumbnail
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { worksheetId, imageData } = req.body

    if (!worksheetId || !imageData) {
      return res.status(400).json({ 
        error: 'Missing required fields: worksheetId, imageData' 
      })
    }

    // Convert base64 data URL to buffer
    const matches = imageData.match(/^data:(image\/[-\w+.]+);base64,(.+)$/)
    if (!matches) {
      return res.status(400).json({ error: 'Invalid imageData format' })
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename
    const fileExt = mimeType.split('/')[1] || 'jpg'
    const fileName = `${worksheetId}_${Date.now()}.${fileExt}`
    const filePath = `worksheets/${fileName}`

    // Ensure supabase storage client is available
    if (!supabase || !supabase.storage || typeof supabase.storage.from !== 'function') {
      console.error('Supabase storage client not available on server. Environment variables may be missing.')
      return res.status(500).json({ error: 'Supabase storage not configured on server. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY.' })
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('worksheet-thumbnails')
      .upload(filePath, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: publicUrlData } = await supabase.storage
      .from('worksheet-thumbnails')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData?.publicUrl || null

    // Update worksheet record
    const { error: updateError } = await supabase
      .from('worksheets')
      .update({ 
        thumbnail_url: publicUrl,
        thumbnail_uploaded: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', worksheetId)

    if (updateError) throw updateError

    return res.status(200).json({
      success: true,
      data: {
        thumbnailUrl: publicUrl,
        worksheetId
      }
    })
  } catch (error) {
    console.error('Thumbnail upload error:', error)
    return res.status(500).json({ 
      error: 'Failed to upload thumbnail',
      details: error.message 
    })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}
