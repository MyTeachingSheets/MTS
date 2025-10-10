// API endpoint for managing admin settings (subjects, grades, standards)
// This example uses a simple JSON file storage approach
// You can replace this with Supabase or your preferred database

import fs from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'admin-settings.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load settings from file
function loadSettings() {
  ensureDataDir()
  
  if (!fs.existsSync(SETTINGS_FILE)) {
    // Initialize with default values
    const defaultSettings = {
      subjects: [
        'Mathematics',
        'English Language Arts',
        'Science',
        'Social Studies',
        'Reading',
        'Writing',
        'Grammar',
        'Vocabulary',
        'Spelling',
        'History',
        'Geography',
        'Biology',
        'Chemistry',
        'Physics',
        'Art',
        'Music',
        'Physical Education'
      ],
      grades: [
        'Pre-K',
        'Kindergarten',
        'Grade 1',
        'Grade 2',
        'Grade 3',
        'Grade 4',
        'Grade 5',
        'Grade 6',
        'Grade 7',
        'Grade 8',
        'Grade 9',
        'Grade 10',
        'Grade 11',
        'Grade 12'
      ],
      standards: [
        'Common Core State Standards (CCSS)',
        'Next Generation Science Standards (NGSS)',
        'State Standards',
        'International Baccalaureate (IB)',
        'Cambridge International',
        'Custom/Other'
      ]
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2))
    return defaultSettings
  }
  
  const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
  return JSON.parse(data)
}

// Save settings to file
function saveSettings(settings) {
  ensureDataDir()
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
}

export default async function handler(req, res) {
  // Check admin authentication using the same cookie as other admin endpoints
  const token = req.cookies?.['log_admin_token'] || ''
  if (!process.env.LOG_ADMIN_TOKEN || token !== process.env.LOG_ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    if (req.method === 'GET') {
      // Return current settings
      const settings = loadSettings()
      return res.status(200).json(settings)
    }

    if (req.method === 'POST') {
      const { action, type, value } = req.body

      if (!action || !type) {
        return res.status(400).json({ error: 'Missing action or type' })
      }

      const settings = loadSettings()

      if (action === 'add') {
        if (!value || !value.trim()) {
          return res.status(400).json({ error: 'Value is required' })
        }

        const trimmedValue = value.trim()

        if (type === 'subject') {
          if (!settings.subjects.includes(trimmedValue)) {
            settings.subjects.push(trimmedValue)
            settings.subjects.sort()
          }
        } else if (type === 'grade') {
          if (!settings.grades.includes(trimmedValue)) {
            settings.grades.push(trimmedValue)
          }
        } else if (type === 'standard') {
          if (!settings.standards.includes(trimmedValue)) {
            settings.standards.push(trimmedValue)
          }
        } else {
          return res.status(400).json({ error: 'Invalid type' })
        }

        saveSettings(settings)
        return res.status(200).json(settings)
      }

      if (action === 'delete') {
        if (!value) {
          return res.status(400).json({ error: 'Value is required' })
        }

        if (type === 'subject') {
          settings.subjects = settings.subjects.filter(s => s !== value)
        } else if (type === 'grade') {
          settings.grades = settings.grades.filter(g => g !== value)
        } else if (type === 'standard') {
          settings.standards = settings.standards.filter(s => s !== value)
        } else {
          return res.status(400).json({ error: 'Invalid type' })
        }

        saveSettings(settings)
        return res.status(200).json(settings)
      }

      return res.status(400).json({ error: 'Invalid action' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin settings error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
