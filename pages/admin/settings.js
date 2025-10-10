import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminSettings({ initialSubjects }) {
  const router = useRouter()
  
  // Subjects (top level)
  const [subjects, setSubjects] = useState(initialSubjects || [])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [newSubject, setNewSubject] = useState('')
  
  // Frameworks (level 2 - filtered by subject)
  const [frameworks, setFrameworks] = useState([])
  const [selectedFramework, setSelectedFramework] = useState(null)
  const [newFramework, setNewFramework] = useState('')
  
  // Grades (level 3 - filtered by framework)
  const [grades, setGrades] = useState([])
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [newGrade, setNewGrade] = useState('')
  
  // Lessons (level 4 - filtered by grade)
  const [lessons, setLessons] = useState([])
  const [newLesson, setNewLesson] = useState('')
  const [newLessonDescription, setNewLessonDescription] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load frameworks when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      loadFrameworks(selectedSubject.id)
      setSelectedFramework(null)
      setSelectedGrade(null)
      setGrades([])
      setLessons([])
    } else {
      setFrameworks([])
      setSelectedFramework(null)
      setSelectedGrade(null)
      setGrades([])
      setLessons([])
    }
  }, [selectedSubject])

  // Load grades when framework is selected
  useEffect(() => {
    if (selectedFramework) {
      loadGrades(selectedFramework.id)
      setSelectedGrade(null)
      setLessons([])
    } else {
      setGrades([])
      setSelectedGrade(null)
      setLessons([])
    }
  }, [selectedFramework])

  // Load lessons when grade is selected
  useEffect(() => {
    if (selectedGrade) {
      loadLessons(selectedGrade.id)
    } else {
      setLessons([])
    }
  }, [selectedGrade])

  const loadFrameworks = async (subjectId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin-settings?type=frameworks&parent_id=${subjectId}`)
      if (res.ok) {
        const data = await res.json()
        setFrameworks(data.frameworks || [])
      }
    } catch (err) {
      console.error('Failed to load frameworks:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadGrades = async (frameworkId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin-settings?type=grades&parent_id=${frameworkId}`)
      if (res.ok) {
        const data = await res.json()
        setGrades(data.grades || [])
      }
    } catch (err) {
      console.error('Failed to load grades:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadLessons = async (gradeId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin-settings?type=lessons&parent_id=${gradeId}`)
      if (res.ok) {
        const data = await res.json()
        setLessons(data.lessons || [])
      }
    } catch (err) {
      console.error('Failed to load lessons:', err)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (type, value, parentId = null, description = '') => {
    if (!value.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', type, value: value.trim(), parent_id: parentId, description })
      })

      if (res.ok) {
        const data = await res.json()
        setSuccess(`${type} added successfully!`)
        
        // Refresh the appropriate list
        if (type === 'subject') {
          const subjectsRes = await fetch('/api/admin-settings?type=subjects')
          if (subjectsRes.ok) {
            const subjectsData = await subjectsRes.json()
            setSubjects(subjectsData.subjects || [])
          }
          setNewSubject('')
        } else if (type === 'framework' && selectedSubject) {
          loadFrameworks(selectedSubject.id)
          setNewFramework('')
        } else if (type === 'grade' && selectedFramework) {
          loadGrades(selectedFramework.id)
          setNewGrade('')
        } else if (type === 'lesson' && selectedGrade) {
          loadLessons(selectedGrade.id)
          setNewLesson('')
          setNewLessonDescription('')
        }

        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to add item')
      }
    } catch (err) {
      setError('Network error')
      console.error('Add item error:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This will also delete all child items.`)) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', type, id })
      })

      if (res.ok) {
        // Refresh the appropriate list
        if (type === 'subject') {
          const subjectsRes = await fetch('/api/admin-settings?type=subjects')
          if (subjectsRes.ok) {
            const subjectsData = await subjectsRes.json()
            setSubjects(subjectsData.subjects || [])
          }
          if (selectedSubject?.id === id) {
            setSelectedSubject(null)
          }
        } else if (type === 'framework' && selectedSubject) {
          loadFrameworks(selectedSubject.id)
          if (selectedFramework?.id === id) {
            setSelectedFramework(null)
          }
        } else if (type === 'grade' && selectedFramework) {
          loadGrades(selectedFramework.id)
          if (selectedGrade?.id === id) {
            setSelectedGrade(null)
          }
        } else if (type === 'lesson' && selectedGrade) {
          loadLessons(selectedGrade.id)
        }
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete item')
      }
    } catch (err) {
      setError('Network error')
      console.error('Delete item error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-settings">
      <div className="admin-header">
        <h1>Admin Settings</h1>
        <div className="admin-actions">
          <button onClick={() => router.push('/admin/logs')} className="btn-secondary">
            Logs
          </button>
          <button onClick={() => router.push('/')} className="btn-secondary">
            Home
          </button>
        </div>
      </div>

      {error && <div className="message error-message">{error}</div>}
      {success && <div className="message success-message">{success}</div>}

      <div className="hierarchy-container">
        {/* Level 1: Subjects */}
        <div className="hierarchy-level">
          <h2>1. Subjects</h2>
          <div className="add-section">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add new subject"
              onKeyDown={(e) => e.key === 'Enter' && addItem('subject', newSubject)}
            />
            <button onClick={() => addItem('subject', newSubject)} disabled={loading || !newSubject.trim()}>
              Add
            </button>
          </div>
          <div className="items-list">
            {subjects.map((subject) => (
              <div 
                key={subject.id} 
                className={`item ${selectedSubject?.id === subject.id ? 'selected' : ''}`}
                onClick={() => setSelectedSubject(subject)}
              >
                <span>{subject.name}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteItem('subject', subject.id); }} className="delete-btn">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Level 2: Frameworks */}
        {selectedSubject && (
          <div className="hierarchy-level">
            <h2>2. Frameworks for "{selectedSubject.name}"</h2>
            <div className="add-section">
              <input
                type="text"
                value={newFramework}
                onChange={(e) => setNewFramework(e.target.value)}
                placeholder="Add framework"
                onKeyDown={(e) => e.key === 'Enter' && addItem('framework', newFramework, selectedSubject.id)}
              />
              <button onClick={() => addItem('framework', newFramework, selectedSubject.id)} disabled={loading || !newFramework.trim()}>
                Add
              </button>
            </div>
            <div className="items-list">
              {frameworks.map((framework) => (
                <div 
                  key={framework.id} 
                  className={`item ${selectedFramework?.id === framework.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFramework(framework)}
                >
                  <span>{framework.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteItem('framework', framework.id); }} className="delete-btn">×</button>
                </div>
              ))}
              {frameworks.length === 0 && <div className="empty-state">No frameworks yet. Add one above.</div>}
            </div>
          </div>
        )}

        {/* Level 3: Grades */}
        {selectedFramework && (
          <div className="hierarchy-level">
            <h2>3. Grades for "{selectedFramework.name}"</h2>
            <div className="add-section">
              <input
                type="text"
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                placeholder="Add grade"
                onKeyDown={(e) => e.key === 'Enter' && addItem('grade', newGrade, selectedFramework.id)}
              />
              <button onClick={() => addItem('grade', newGrade, selectedFramework.id)} disabled={loading || !newGrade.trim()}>
                Add
              </button>
            </div>
            <div className="items-list">
              {grades.map((grade) => (
                <div 
                  key={grade.id} 
                  className={`item ${selectedGrade?.id === grade.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGrade(grade)}
                >
                  <span>{grade.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteItem('grade', grade.id); }} className="delete-btn">×</button>
                </div>
              ))}
              {grades.length === 0 && <div className="empty-state">No grades yet. Add one above.</div>}
            </div>
          </div>
        )}

        {/* Level 4: Lessons */}
        {selectedGrade && (
          <div className="hierarchy-level">
            <h2>4. Lessons for Grade "{selectedGrade.name}"</h2>
            <div className="add-section-with-description">
              <input
                type="text"
                value={newLesson}
                onChange={(e) => setNewLesson(e.target.value)}
                placeholder="Lesson name"
                className="lesson-name-input"
              />
              <textarea
                value={newLessonDescription}
                onChange={(e) => setNewLessonDescription(e.target.value)}
                placeholder="Lesson description (optional)"
                className="lesson-description-input"
                rows="2"
              />
              <button 
                onClick={() => addItem('lesson', newLesson, selectedGrade.id, newLessonDescription)} 
                disabled={loading || !newLesson.trim()}
                className="add-lesson-btn"
              >
                Add
              </button>
            </div>
            <div className="items-list">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="item lesson-item">
                  <div className="lesson-content">
                    <span className="lesson-name">{lesson.name}</span>
                    {lesson.description && <p className="lesson-description">{lesson.description}</p>}
                  </div>
                  <button onClick={() => deleteItem('lesson', lesson.id)} className="delete-btn">×</button>
                </div>
              ))}
              {lessons.length === 0 && <div className="empty-state">No lessons yet. Add one above.</div>}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-settings {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--border-color);
        }

        .admin-header h1 {
          font-size: 2rem;
          margin: 0;
          color: var(--text-primary);
        }

        .admin-actions {
          display: flex;
          gap: 12px;
        }

        .btn-secondary {
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--bg-hover);
        }

        .message {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ef5350;
        }

        .success-message {
          background: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #66bb6a;
        }

        .hierarchy-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .hierarchy-level {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 20px;
          min-height: 400px;
        }

        .hierarchy-level h2 {
          font-size: 1.1rem;
          margin: 0 0 16px 0;
          color: var(--text-primary);
          font-weight: 600;
        }

        .add-section {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .add-section input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .add-section button {
          padding: 8px 16px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .add-section button:hover:not(:disabled) {
          background: var(--primary-hover);
        }

        .add-section button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .add-section-with-description {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .lesson-name-input {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .lesson-description-input {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 0.85rem;
          font-family: inherit;
          resize: vertical;
        }

        .add-lesson-btn {
          padding: 8px 16px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
          align-self: flex-start;
        }

        .add-lesson-btn:hover:not(:disabled) {
          background: var(--primary-hover);
        }

        .add-lesson-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .item:hover {
          background: var(--bg-hover);
          border-color: var(--primary-color);
        }

        .item.selected {
          background: #e3f2fd;
          border-color: var(--primary-color);
          font-weight: 500;
        }

        .item span {
          flex: 1;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .lesson-item {
          flex-direction: column;
          align-items: flex-start;
          padding: 12px;
          position: relative;
        }

        .lesson-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 30px;
        }

        .lesson-name {
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .lesson-description {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .lesson-item .delete-btn {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .delete-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: #d32f2f;
          font-size: 1.3rem;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .delete-btn:hover {
          background: #ffebee;
        }

        .empty-state {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-style: italic;
          padding: 20px;
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .hierarchy-container {
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
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    }
  }

  // Load initial subjects server-side
  const { createClient } = require('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let subjects = []
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
    
    if (!error && data) {
      subjects = data
    }
  } catch (err) {
    console.error('Error loading subjects:', err)
  }

  return {
    props: {
      initialSubjects: subjects
    }
  }
}
