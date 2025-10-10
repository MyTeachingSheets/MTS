import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminSettings({ initialSubjects, initialGrades, initialStandards }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // State for subjects, grades, standards - initialized with server-side props
  const [subjects, setSubjects] = useState(initialSubjects || [])
  const [grades, setGrades] = useState(initialGrades || [])
  const [standards, setStandards] = useState(initialStandards || [])
  
  // State for new items
  const [newSubject, setNewSubject] = useState('')
  const [newGrade, setNewGrade] = useState('')
  const [newStandard, setNewStandard] = useState('')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin-settings')
      if (res.ok) {
        const data = await res.json()
        setSubjects(data.subjects || [])
        setGrades(data.grades || [])
        setStandards(data.standards || [])
      }
    } catch (err) {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (type, value) => {
    if (!value.trim()) return
    
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', type, value: value.trim() })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (type === 'subject') {
          setSubjects(data.subjects)
          setNewSubject('')
        } else if (type === 'grade') {
          setGrades(data.grades)
          setNewGrade('')
        } else if (type === 'standard') {
          setStandards(data.standards)
          setNewStandard('')
        }
        setSuccess(`${type} added successfully`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to add item')
      }
    } catch (err) {
      setError('Error adding item')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (type, value) => {
    if (!confirm(`Delete ${type}: ${value}?`)) return
    
    setSaving(true)
    setError('')
    
    try {
      const res = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', type, value })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (type === 'subject') setSubjects(data.subjects)
        else if (type === 'grade') setGrades(data.grades)
        else if (type === 'standard') setStandards(data.standards)
        setSuccess(`${type} deleted successfully`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to delete item')
      }
    } catch (err) {
      setError('Error deleting item')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-header">
        <h1>Admin Settings</h1>
        <div className="admin-nav">
          <a href="/admin/logs">View Logs</a>
          <button onClick={() => router.push('/')}>Back to Site</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-grid">
        {/* Subjects Section */}
        <div className="settings-section">
          <h2>Subjects</h2>
          <div className="add-item-form">
            <input
              type="text"
              placeholder="New subject name"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('subject', newSubject)}
            />
            <button onClick={() => addItem('subject', newSubject)} disabled={saving || !newSubject.trim()}>
              Add Subject
            </button>
          </div>
          <div className="items-list">
            {subjects.map((subject, idx) => (
              <div key={idx} className="item-row">
                <span>{subject}</span>
                <button className="delete-btn" onClick={() => deleteItem('subject', subject)} disabled={saving}>
                  ×
                </button>
              </div>
            ))}
            {subjects.length === 0 && <p className="empty-state">No subjects yet</p>}
          </div>
        </div>

        {/* Grades Section */}
        <div className="settings-section">
          <h2>Grades</h2>
          <div className="add-item-form">
            <input
              type="text"
              placeholder="New grade level"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('grade', newGrade)}
            />
            <button onClick={() => addItem('grade', newGrade)} disabled={saving || !newGrade.trim()}>
              Add Grade
            </button>
          </div>
          <div className="items-list">
            {grades.map((grade, idx) => (
              <div key={idx} className="item-row">
                <span>{grade}</span>
                <button className="delete-btn" onClick={() => deleteItem('grade', grade)} disabled={saving}>
                  ×
                </button>
              </div>
            ))}
            {grades.length === 0 && <p className="empty-state">No grades yet</p>}
          </div>
        </div>

        {/* Standards Section */}
        <div className="settings-section">
          <h2>Standards</h2>
          <div className="add-item-form">
            <input
              type="text"
              placeholder="New standard"
              value={newStandard}
              onChange={(e) => setNewStandard(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('standard', newStandard)}
            />
            <button onClick={() => addItem('standard', newStandard)} disabled={saving || !newStandard.trim()}>
              Add Standard
            </button>
          </div>
          <div className="items-list">
            {standards.map((standard, idx) => (
              <div key={idx} className="item-row">
                <span>{standard}</span>
                <button className="delete-btn" onClick={() => deleteItem('standard', standard)} disabled={saving}>
                  ×
                </button>
              </div>
            ))}
            {standards.length === 0 && <p className="empty-state">No standards yet</p>}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-settings-page {
          min-height: 100vh;
          background: #f5f5f5;
          padding: 40px 20px;
        }

        .admin-header {
          max-width: 1200px;
          margin: 0 auto 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-header h1 {
          margin: 0;
          color: var(--primary-navy);
        }

        .admin-nav {
          display: flex;
          gap: 12px;
        }

        .admin-nav a,
        .admin-nav button {
          padding: 8px 16px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          text-decoration: none;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .admin-nav a:hover,
        .admin-nav button:hover {
          background: var(--primary-navy);
          color: white;
          border-color: var(--primary-navy);
        }

        .error-message {
          max-width: 1200px;
          margin: 0 auto 20px;
          padding: 12px 16px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 6px;
          color: #c00;
        }

        .success-message {
          max-width: 1200px;
          margin: 0 auto 20px;
          padding: 12px 16px;
          background: #e8f5e9;
          border: 1px solid #a5d6a7;
          border-radius: 6px;
          color: #2e7d32;
        }

        .settings-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 24px;
        }

        .settings-section {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .settings-section h2 {
          margin: 0 0 20px 0;
          color: var(--primary-navy);
          font-size: 1.3rem;
        }

        .add-item-form {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .add-item-form input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .add-item-form input:focus {
          outline: none;
          border-color: var(--primary-navy);
        }

        .add-item-form button {
          padding: 10px 20px;
          background: var(--primary-navy);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-item-form button:hover:not(:disabled) {
          background: var(--primary-navy-dark);
        }

        .add-item-form button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: #f9f9f9;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .item-row:hover {
          background: #f0f0f0;
        }

        .item-row span {
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .delete-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: #d32f2f;
          font-size: 1.5rem;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .delete-btn:hover:not(:disabled) {
          background: #ffebee;
        }

        .delete-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-style: italic;
          padding: 20px;
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const token = ctx.req.cookies?.['log_admin_token'] || ''
  if (!process.env.LOG_ADMIN_TOKEN || token !== process.env.LOG_ADMIN_TOKEN) {
    // redirect to login page when not authenticated
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    }
  }

  // Load settings server-side
  const fs = require('fs')
  const path = require('path')
  const dataDir = path.join(process.cwd(), 'data')
  const settingsPath = path.join(dataDir, 'admin-settings.json')

  let settings = {
    subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'History', 'Geography'],
    grades: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    standards: ['Common Core', 'State Standard', 'IB', 'Cambridge', 'Custom']
  }

  try {
    if (fs.existsSync(settingsPath)) {
      const fileData = fs.readFileSync(settingsPath, 'utf-8')
      settings = JSON.parse(fileData)
    }
  } catch (err) {
    console.error('Error loading settings:', err)
  }

  return {
    props: {
      initialSubjects: settings.subjects || [],
      initialGrades: settings.grades || [],
      initialStandards: settings.standards || []
    }
  }
}
