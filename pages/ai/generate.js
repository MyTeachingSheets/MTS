import Link from 'next/link'
import { useState } from 'react'

export default function AIGeneratePage(){
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)

  const [subject, setSubject] = useState('')
  const [standard, setStandard] = useState('')
  const [grade, setGrade] = useState('')
  const [domain, setDomain] = useState('')
  const [worksheetType, setWorksheetType] = useState('')

  // Generated lessons list
  const [lessons, setLessons] = useState([])

  // Example dropdown options (replace with real lookups later)
  const SUBJECTS = ['Mathematics','English','Science','Social Studies']
  const STANDARDS = ['Standard A','Standard B','Standard C']
  const GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5']
  const DOMAINS = ['Numbers','Algebra','Geometry','Measurement']
  const WORKSHEET_TYPES = ['Practice','Assessment','Mixed']

  async function handleGenerate(e){
    e && e.preventDefault()
    setGenerating(true)
    try{
      // Simulate AI generation delay
      await new Promise(r=>setTimeout(r,800))

      // Create a mock lesson entry based on selections and prompt
      const id = Date.now()
      const titleParts = []
      if (grade) titleParts.push(grade)
      if (domain) titleParts.push(domain)
      if (worksheetType) titleParts.push(worksheetType)
      const title = (titleParts.join(' • ') || 'AI Worksheet') + ` (${lessons.length + 1})`

      const newLesson = {
        id,
        title,
        subject: subject || '—',
        standard: standard || '—',
        grade: grade || '—',
        domain: domain || '—',
        type: worksheetType || '—',
        prompt: prompt || '',
        createdAt: new Date().toISOString()
      }

      setLessons(prev => [newLesson, ...prev])
      // optionally clear prompt
      // setPrompt('')
    }catch(err){
      console.error('Generate failed', err)
      alert('Failed to generate: ' + (err?.message || err))
    }finally{
      setGenerating(false)
    }
  }

  function removeLesson(id){
    setLessons(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="content-section">
      <div className="ai-generate-root" style={{maxWidth:1280,margin:'0 auto',display:'flex',gap:24}}>
        <aside className="ai-left-panel">
          <div style={{marginBottom:20}}>
            <h3 style={{margin:'0 0 8px 0',fontSize:'1.25rem',color:'var(--primary-navy)'}}>📝 Worksheet Settings</h3>
            <p style={{margin:0,fontSize:'0.9rem',color:'var(--text-secondary)',lineHeight:1.5}}>Configure your worksheet parameters below</p>
          </div>

          <div className="ai-form-group">
            <label>Subject</label>
            <select className="input-text" value={subject} onChange={e=>setSubject(e.target.value)}>
              <option value="">Choose a subject...</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Standard</label>
            <select className="input-text" value={standard} onChange={e=>setStandard(e.target.value)}>
              <option value="">Choose a standard...</option>
              {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Grade Level</label>
            <select className="input-text" value={grade} onChange={e=>setGrade(e.target.value)}>
              <option value="">Choose grade level...</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Domain</label>
            <select className="input-text" value={domain} onChange={e=>setDomain(e.target.value)}>
              <option value="">Choose a domain...</option>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Worksheet Type</label>
            <select className="input-text" value={worksheetType} onChange={e=>setWorksheetType(e.target.value)}>
              <option value="">Choose type...</option>
              {WORKSHEET_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Custom Instructions (Optional)</label>
            <textarea 
              value={prompt} 
              onChange={e=>setPrompt(e.target.value)} 
              placeholder="Add any specific requirements or notes here..." 
              className="ai-textarea"
            />
          </div>

          <div style={{display:'flex',gap:10,marginTop:20}}>
            <button className="btn ai-generate-btn" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Worksheet'}
            </button>
          </div>
          
          <button 
            className="btn btn-secondary" 
            style={{width:'100%',marginTop:8}} 
            onClick={()=>{setPrompt(''); setSubject(''); setStandard(''); setGrade(''); setDomain(''); setWorksheetType('')}}
          >
            Clear All
          </button>
        </aside>

        <section className="ai-right-panel">
          <div className="ai-results-container">
            {lessons.length === 0 ? (
              <div className="ai-empty-state">
                <div style={{fontSize:'3rem',marginBottom:12}}>📚</div>
                <h3 style={{margin:'0 0 8px 0',color:'var(--text-primary)'}}>No Worksheets Yet</h3>
                <p style={{margin:0,color:'var(--text-secondary)',lineHeight:1.6}}>
                  Fill in the settings on the left and click <strong>Generate Worksheet</strong> to create your first AI-powered lesson.
                </p>
              </div>
            ) : (
              <>
                <div style={{marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <h3 style={{margin:0,fontSize:'1.1rem',color:'var(--primary-navy)'}}>Generated Worksheets ({lessons.length})</h3>
                </div>
                <div className="ai-lessons-list">
                  {lessons.map(l => (
                    <div key={l.id} className="ai-lesson-card">
                      <div className="ai-lesson-header">
                        <h4 style={{margin:0,fontSize:'1rem',color:'var(--text-primary)'}}>{l.title}</h4>
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn-icon-small" title="Export" onClick={()=>alert('Export feature coming soon!')}>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 12a.5.5 0 0 0 .5-.5V4.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 4.707V11.5a.5.5 0 0 0 .5.5z"/><path d="M2 13.5V13a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5z"/></svg>
                          </button>
                          <button className="btn-icon-small btn-icon-danger" title="Delete" onClick={()=>removeLesson(l.id)}>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                          </button>
                        </div>
                      </div>
                      <div className="ai-lesson-meta">
                        <span className="ai-badge">{l.grade}</span>
                        <span className="ai-badge">{l.domain}</span>
                        <span className="ai-badge">{l.type}</span>
                      </div>
                      {l.prompt && (
                        <p style={{margin:'8px 0 0 0',fontSize:'0.85rem',color:'var(--text-secondary)',lineHeight:1.5}}>
                          {l.prompt.length > 150 ? l.prompt.slice(0,150) + '...' : l.prompt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
