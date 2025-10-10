// API endpoint for managing hierarchical admin settings (subjects → frameworks → grades → domains)
// Uses Supabase for storage

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // GET requests are public - no authentication required
      const { type, parent_id } = req.query

      // Get subjects (top level)
      if (type === 'subjects' || !type) {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('display_order', { ascending: true })
          .order('name', { ascending: true })
        
        if (error) throw error
        return res.status(200).json({ subjects: data || [] })
      }

      // Get frameworks for a specific subject
      if (type === 'frameworks' && parent_id) {
        const { data, error } = await supabase
          .from('frameworks')
          .select('*')
          .eq('subject_id', parent_id)
          .order('display_order', { ascending: true })
          .order('name', { ascending: true })
        
        if (error) throw error
        return res.status(200).json({ frameworks: data || [] })
      }

      // Get grades for a specific framework
      if (type === 'grades' && parent_id) {
        const { data, error } = await supabase
          .from('grades')
          .select('*')
          .eq('framework_id', parent_id)
          .order('display_order', { ascending: true })
          .order('name', { ascending: true })
        
        if (error) throw error
        return res.status(200).json({ grades: data || [] })
      }

      // Get lessons for a specific grade
      if (type === 'lessons' && parent_id) {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('grade_id', parent_id)
          .order('display_order', { ascending: true })
          .order('name', { ascending: true })
        
        if (error) throw error
        return res.status(200).json({ lessons: data || [] })
      }

      return res.status(400).json({ error: 'Invalid query parameters' })
    }

    if (req.method === 'POST') {
      // Check admin authentication for POST operations (add/delete)
      const token = req.cookies?.['log_admin_token'] || ''
      if (!process.env.LOG_ADMIN_TOKEN || token !== process.env.LOG_ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const { action, type, value, parent_id, display_order, id, description } = req.body

      if (!action || !type) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // ADD operations
      if (action === 'add') {
        if (!value) {
          return res.status(400).json({ error: 'Value is required for add action' })
        }

        let result
        if (type === 'subject') {
          result = await supabase
            .from('subjects')
            .insert({ name: value, display_order: display_order || 0 })
            .select()
        } else if (type === 'framework' && parent_id) {
          result = await supabase
            .from('frameworks')
            .insert({ subject_id: parent_id, name: value, display_order: display_order || 0 })
            .select()
        } else if (type === 'grade' && parent_id) {
          result = await supabase
            .from('grades')
            .insert({ framework_id: parent_id, name: value, display_order: display_order || 0 })
            .select()
        } else if (type === 'lesson' && parent_id) {
          result = await supabase
            .from('lessons')
            .insert({ grade_id: parent_id, name: value, description: description || '', display_order: display_order || 0 })
            .select()
        } else {
          return res.status(400).json({ error: 'Invalid type or missing parent_id' })
        }

        if (result.error) throw result.error
        return res.status(200).json({ success: true, data: result.data })
      }

      // DELETE operations
      if (action === 'delete') {
        if (!id) {
          return res.status(400).json({ error: 'ID is required for delete action' })
        }

        let result
        if (type === 'subject') {
          result = await supabase.from('subjects').delete().eq('id', id)
        } else if (type === 'framework') {
          result = await supabase.from('frameworks').delete().eq('id', id)
        } else if (type === 'grade') {
          result = await supabase.from('grades').delete().eq('id', id)
        } else if (type === 'lesson') {
          result = await supabase.from('lessons').delete().eq('id', id)
        } else {
          return res.status(400).json({ error: 'Invalid type' })
        }

        if (result.error) throw result.error
        return res.status(200).json({ success: true })
      }

      return res.status(400).json({ error: 'Invalid action' })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Settings API error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
