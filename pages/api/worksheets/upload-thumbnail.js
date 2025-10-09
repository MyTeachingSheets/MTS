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

    // Get user session
    // const { data: { session } } = await supabase.auth.getSession()
    // if (!session) {
    //   return res.status(401).json({ error: 'Unauthorized' })
    // }

    // TODO: Uncomment when Supabase Storage is configured
    // // Convert base64 to buffer
    // const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    // const buffer = Buffer.from(base64Data, 'base64')

    // // Generate unique filename
    // const fileExt = imageData.match(/data:image\/(\w+);/)?.[1] || 'jpg'
    // const fileName = `${worksheetId}_${Date.now()}.${fileExt}`
    // const filePath = `worksheets/${fileName}`

    // // Upload to Supabase Storage
    // const { error: uploadError } = await supabase.storage
    //   .from('worksheet-thumbnails')
    //   .upload(filePath, buffer, {
    //     contentType: `image/${fileExt}`,
    //     cacheControl: '3600',
    //     upsert: true
    //   })

    // if (uploadError) throw uploadError

    // // Get public URL
    // const { data: { publicUrl } } = supabase.storage
    //   .from('worksheet-thumbnails')
    //   .getPublicUrl(filePath)

    // // Update worksheet record
    // const { error: updateError } = await supabase
    //   .from('worksheets')
    //   .update({ 
    //     thumbnail_url: publicUrl,
    //     thumbnail_uploaded: true,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', worksheetId)

    // if (updateError) throw updateError

    // Mock response for now
    const mockPublicUrl = imageData // Return the data URL as mock URL

    return res.status(200).json({
      success: true,
      data: {
        thumbnailUrl: mockPublicUrl,
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
