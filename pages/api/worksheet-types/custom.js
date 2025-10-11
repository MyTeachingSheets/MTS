import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for server-side operations
)

export default async function handler(req, res) {
  const userId = req.headers['x-user-id']

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    if (req.method === 'GET') {
      // List user's custom worksheet types
      const { data, error } = await supabase
        .from('custom_worksheet_types')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json({ types: data || [] })
    }

    if (req.method === 'POST') {
      // Create new custom worksheet type
      const { name, description, questionTypes, jsonSchema } = req.body

      if (!name || !jsonSchema) {
        return res.status(400).json({ error: 'Name and JSON schema are required' })
      }

      const { data, error } = await supabase
        .from('custom_worksheet_types')
        .insert({
          user_id: userId,
          name,
          description: description || null,
          question_types: questionTypes || [],
          json_schema: jsonSchema,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json({ type: data })
    }

    if (req.method === 'PUT') {
      // Update existing custom worksheet type
      const { id, name, description, questionTypes, jsonSchema } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Type ID is required' })
      }

      const updateData = {
        updated_at: new Date().toISOString()
      }
      if (name) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (questionTypes) updateData.question_types = questionTypes
      if (jsonSchema) updateData.json_schema = jsonSchema

      const { data, error } = await supabase
        .from('custom_worksheet_types')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      if (!data) {
        return res.status(404).json({ error: 'Custom type not found or access denied' })
      }

      return res.status(200).json({ type: data })
    }

    if (req.method === 'DELETE') {
      // Delete custom worksheet type
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'Type ID is required' })
      }

      const { error } = await supabase
        .from('custom_worksheet_types')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Custom worksheet types API error:', error)
    return res.status(500).json({ error: error.message })
  }
}
