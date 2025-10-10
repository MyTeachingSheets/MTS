import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Supabase configuration missing' })
  }

  // GET requests are public - fetch available prompt templates
  if (req.method === 'GET') {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { template } = req.query

    try {
      if (template) {
        // Fetch specific template by name
        const { data, error } = await supabase
          .from('prompt_templates')
          .select('*')
          .eq('name', template)
          .eq('is_active', true)
          .single()

        if (error) {
          console.error('Error fetching template:', error)
          return res.status(404).json({ error: 'Template not found' })
        }

        return res.status(200).json({ template: data })
      } else {
        // Fetch all active templates (for dropdown)
        const { data, error } = await supabase
          .from('active_prompt_templates')
          .select('*')
          .order('is_default', { ascending: false })
          .order('display_name', { ascending: true })

        if (error) {
          console.error('Error fetching templates:', error)
          return res.status(500).json({ error: 'Failed to fetch templates' })
        }

        return res.status(200).json({ templates: data || [] })
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // POST/PUT/DELETE requests require admin authentication
  const token = req.cookies?.['log_admin_token'] || ''
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated as admin' })
  }

  if (!supabaseServiceKey) {
    return res.status(500).json({ error: 'Service role key not configured' })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // CREATE new template
  if (req.method === 'POST') {
    const { name, display_name, description, system_prompt, user_prompt_template, is_default } = req.body

    if (!name || !display_name || !system_prompt) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'name, display_name, and system_prompt are required' 
      })
    }

    try {
      // If setting as default, unset other defaults first
      if (is_default) {
        await supabaseAdmin
          .from('prompt_templates')
          .update({ is_default: false })
          .eq('is_default', true)
      }

      const { data, error } = await supabaseAdmin
        .from('prompt_templates')
        .insert({
          name,
          display_name,
          description,
          system_prompt,
          user_prompt_template,
          is_default: is_default || false,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating template:', error)
        return res.status(500).json({ error: 'Failed to create template', details: error.message })
      }

      return res.status(201).json({ success: true, template: data })
    } catch (err) {
      console.error('Unexpected error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // UPDATE existing template
  if (req.method === 'PUT') {
    const { id, display_name, description, system_prompt, user_prompt_template, is_active, is_default } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Template ID is required' })
    }

    try {
      const updates = {}
      if (display_name !== undefined) updates.display_name = display_name
      if (description !== undefined) updates.description = description
      if (system_prompt !== undefined) updates.system_prompt = system_prompt
      if (user_prompt_template !== undefined) updates.user_prompt_template = user_prompt_template
      if (is_active !== undefined) updates.is_active = is_active
      if (is_default !== undefined) updates.is_default = is_default

      // If setting as default, unset other defaults first
      if (is_default) {
        await supabaseAdmin
          .from('prompt_templates')
          .update({ is_default: false })
          .eq('is_default', true)
          .neq('id', id)
      }

      const { data, error } = await supabaseAdmin
        .from('prompt_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating template:', error)
        return res.status(500).json({ error: 'Failed to update template', details: error.message })
      }

      return res.status(200).json({ success: true, template: data })
    } catch (err) {
      console.error('Unexpected error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // DELETE template
  if (req.method === 'DELETE') {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Template ID is required' })
    }

    try {
      // Don't allow deleting the default template, just deactivate it
      const { data: template } = await supabaseAdmin
        .from('prompt_templates')
        .select('name, is_default')
        .eq('id', id)
        .single()

      if (template?.name === 'default') {
        return res.status(400).json({ 
          error: 'Cannot delete default template',
          details: 'You can deactivate it instead by setting is_active to false' 
        })
      }

      const { error } = await supabaseAdmin
        .from('prompt_templates')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting template:', error)
        return res.status(500).json({ error: 'Failed to delete template', details: error.message })
      }

      return res.status(200).json({ success: true, message: 'Template deleted successfully' })
    } catch (err) {
      console.error('Unexpected error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
