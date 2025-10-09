// API route to create custom worksheet type
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, description, defaultConfig } = req.body

    if (!name || !defaultConfig) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, defaultConfig' 
      })
    }

    // Get user session
    // const { data: { session } } = await supabase.auth.getSession()
    // if (!session) {
    //   return res.status(401).json({ error: 'Unauthorized' })
    // }
    // const userId = session.user.id

    // TODO: Uncomment when Supabase is configured
    // const { data, error } = await supabase
    //   .from('worksheet_types')
    //   .insert([{
    //     name,
    //     description,
    //     default_config: defaultConfig,
    //     is_custom: true,
    //     created_by: userId
    //   }])
    //   .select()
    //   .single()

    // if (error) throw error

    // Mock response for now
    const mockWorksheetType = {
      id: `custom_${Date.now()}`,
      name,
      description,
      defaultConfig,
      isCustom: true,
      createdAt: new Date().toISOString()
    }

    return res.status(201).json({
      success: true,
      data: mockWorksheetType
    })
  } catch (error) {
    console.error('Create worksheet type error:', error)
    return res.status(500).json({ 
      error: 'Failed to create worksheet type',
      details: error.message 
    })
  }
}
