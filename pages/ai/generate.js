import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import CustomWorksheetTypeModal from '../../components/CustomWorksheetTypeModal'
import WorksheetEditorModal from '../../components/WorksheetEditorModal'
import ThumbnailUploadModal from '../../components/ThumbnailUploadModal'

export default function AIGeneratePage(){
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)

  const [subject, setSubject] = useState('')
  const [standard, setStandard] = useState('')
  const [grade, setGrade] = useState('')
  const [domain, setDomain] = useState('')
  const [worksheetType, setWorksheetType] = useState('')

  // Generated worksheets list
  const [worksheets, setWorksheets] = useState([])

  // Modals
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false)
  const [showEditorModal, setShowEditorModal] = useState(false)
  const [showThumbnailModal, setShowThumbnailModal] = useState(false)
  const [selectedWorksheet, setSelectedWorksheet] = useState(null)
  
  // Worksheet types from database
  const [worksheetTypes, setWorksheetTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  // Expanded dropdown options
  const SUBJECTS = [
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
  ]
  
  const STANDARDS = [
    'Common Core State Standards (CCSS)',
    'Next Generation Science Standards (NGSS)',
    'State Standards',
    'International Baccalaureate (IB)',
    'Cambridge International',
    'Custom/Other'
  ]
  
  const GRADES = [
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
  ]
  
  const DOMAINS = {
    'Mathematics': ['Numbers & Operations', 'Algebra', 'Geometry', 'Measurement', 'Data Analysis', 'Probability'],
    'English Language Arts': ['Reading', 'Writing', 'Speaking & Listening', 'Language'],
    'Science': ['Life Science', 'Physical Science', 'Earth Science', 'Space Science'],
    'Social Studies': ['History', 'Geography', 'Economics', 'Civics', 'Culture'],
    'Reading': ['Comprehension', 'Vocabulary', 'Fluency', 'Phonics'],
    'default': ['General']
  }

  // Load worksheet types from database
  useEffect(() => {
    loadWorksheetTypes()
  }, [])

  const loadWorksheetTypes = async () => {
    setLoadingTypes(true)
    try {
      // For now, use default types until database is set up
      const defaultTypes = [
        { id: 'practice', name: 'Practice', description: 'Standard practice worksheet' },
        { id: 'assessment', name: 'Assessment', description: 'Formal assessment' },
        { id: 'quiz', name: 'Quiz', description: 'Quick quiz format' },
        { id: 'mixed', name: 'Mixed', description: 'Mixed question types' }
      ]
      setWorksheetTypes(defaultTypes)
      
      // TODO: Uncomment when database is set up
      // const { data, error } = await supabase
      //   .from('worksheet_types')
      //   .select('*')
      //   .eq('is_active', true)
      //   .order('name')
      // 
      // if (error) throw error
      // setWorksheetTypes(data || [])
    } catch (err) {
      console.error('Failed to load worksheet types:', err)
    } finally {
      setLoadingTypes(false)
    }
  }

  const handleSaveCustomType = async (typeData) => {
    try {
      // TODO: Save to database when set up
      // const { data, error } = await supabase
      //   .from('worksheet_types')
      //   .insert([typeData])
      //   .select()
      // 
      // if (error) throw error
      
      // For now, add to local state
      const newType = {
        id: `custom_${Date.now()}`,
        name: typeData.name,
        description: typeData.description,
        is_custom: true
      }
      
      setWorksheetTypes([...worksheetTypes, newType])
      setWorksheetType(newType.id)
      
      alert('Custom worksheet type created successfully!')
    } catch (err) {
      console.error('Failed to save custom type:', err)
      throw err
    }
  }

  const getCurrentDomains = () => {
    return DOMAINS[subject] || DOMAINS['default']
  }

  async function handleGenerate(e){
    e && e.preventDefault()
    
    // Validation
    if (!subject || !grade || !worksheetType) {
      alert('Please select Subject, Grade, and Worksheet Type')
      return
    }
    
    setGenerating(true)
    try{
      // Simulate AI generation delay
      await new Promise(r=>setTimeout(r,1500))

      // Create a mock worksheet entry based on selections and prompt
      const id = Date.now()
      const titleParts = []
      if (grade) titleParts.push(grade)
      if (subject) titleParts.push(subject)
      if (domain) titleParts.push(domain)
      const title = titleParts.join(' - ') + ` Worksheet`

      const selectedType = worksheetTypes.find(t => t.id === worksheetType || t.name === worksheetType)

      const newWorksheet = {
        id,
        title,
        subject: subject || '—',
        standard: standard || '—',
        grade: grade || '—',
        domain: domain || '—',
        type: selectedType?.name || worksheetType || '—',
        customInstructions: prompt || '',
        status: 'draft',
        thumbnailUploaded: false,
        createdAt: new Date().toISOString(),
        // Mock content - in real implementation, this would come from AI
        content: {
          version: '1.0',
          sections: [
            {
              id: 'section_1',
              title: 'Section 1',
              type: 'questions',
              questions: generateMockQuestions(10)
            }
          ],
          totalMarks: 20,
          estimatedTime: 30
        }
      }

      setWorksheets(prev => [newWorksheet, ...prev])
      
      // Clear prompt after generation
      setPrompt('')
    }catch(err){
      console.error('Generate failed', err)
      alert('Failed to generate: ' + (err?.message || err))
    }finally{
      setGenerating(false)
    }
  }

  function generateMockQuestions(count) {
    const questions = []
    for (let i = 1; i <= count; i++) {
      questions.push({
        id: `q${i}`,
        number: i,
        type: 'multiple_choice',
        text: `Question ${i} will be generated here based on your selections.`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        marks: 2
      })
    }
    return questions
  }

  function removeWorksheet(id){
    if (confirm('Are you sure you want to delete this worksheet?')) {
      setWorksheets(prev => prev.filter(w => w.id !== id))
    }
  }

  function viewWorksheet(id) {
    const worksheet = worksheets.find(w => w.id === id)
    setSelectedWorksheet(worksheet)
    setShowEditorModal(true)
  }

  function uploadThumbnail(id) {
    const worksheet = worksheets.find(w => w.id === id)
    setSelectedWorksheet(worksheet)
    setShowThumbnailModal(true)
  }

  function listWorksheet(id) {
    const worksheet = worksheets.find(w => w.id === id)
    if (!worksheet.thumbnailUploaded) {
      alert('Please upload a thumbnail before listing the worksheet')
      return
    }
    
    // Update worksheet status to published
    setWorksheets(prevWorksheets => 
      prevWorksheets.map(w => 
        w.id === id 
          ? { ...w, status: 'published', isListed: true }
          : w
      )
    )
    
    alert('✅ Worksheet published successfully! It will now appear on the marketplace.')
  }

  function downloadWorksheet(id) {
    // TODO: Implement PDF generation
    alert('📥 PDF download feature coming soon!\n\nThis will generate a professionally formatted PDF of your worksheet.')
  }

  const handleWorksheetTypeChange = (value) => {
    if (value === 'CREATE_NEW') {
      setShowCustomTypeModal(true)
      // Don't update worksheetType yet
    } else {
      setWorksheetType(value)
    }
  }

  const handleSaveWorksheet = (updatedWorksheet) => {
    setWorksheets(prevWorksheets =>
      prevWorksheets.map(w =>
        w.id === updatedWorksheet.id ? updatedWorksheet : w
      )
    )
  }

  const handleThumbnailUploadComplete = (worksheetId, thumbnailUrl) => {
    setWorksheets(prevWorksheets =>
      prevWorksheets.map(w =>
        w.id === worksheetId
          ? { ...w, thumbnailUrl, thumbnailUploaded: true }
          : w
      )
    )
  }

  return (
    <div className="content-section">
      <div style={{maxWidth:1280,margin:'0 auto',marginBottom:24}}>
        <div className="page-header">
          <div>
            <h1 style={{margin:'0 0 8px 0',fontSize:'2rem',color:'var(--primary-navy)'}}>
              📝 Worksheet Generator
            </h1>
            <p style={{margin:0,fontSize:'1rem',color:'var(--text-secondary)',lineHeight:1.6}}>
              Create custom worksheets with AI. Configure your settings, generate, upload a thumbnail, and list on our marketplace.
            </p>
          </div>
        </div>
      </div>

      <div className="ai-generate-root" style={{maxWidth:1280,margin:'0 auto',display:'flex',gap:24}}>
        <aside className="ai-left-panel">
          <div style={{marginBottom:20}}>
            <h3 style={{margin:'0 0 8px 0',fontSize:'1.15rem',color:'var(--primary-navy)'}}>⚙️ Configuration</h3>
            <p style={{margin:0,fontSize:'0.85rem',color:'var(--text-secondary)',lineHeight:1.5}}>
              Select your worksheet parameters
            </p>
          </div>

          <div className="ai-form-group">
            <label>Subject *</label>
            <select 
              className="input-text" 
              value={subject} 
              onChange={e => {
                setSubject(e.target.value)
                setDomain('') // Reset domain when subject changes
              }}
            >
              <option value="">Choose a subject...</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Grade Level *</label>
            <select className="input-text" value={grade} onChange={e=>setGrade(e.target.value)}>
              <option value="">Choose grade level...</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Domain</label>
            <select 
              className="input-text" 
              value={domain} 
              onChange={e=>setDomain(e.target.value)}
              disabled={!subject}
            >
              <option value="">Choose a domain...</option>
              {getCurrentDomains().map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {!subject && (
              <small style={{fontSize:'0.75rem',color:'var(--text-secondary)',marginTop:4,display:'block'}}>
                Select a subject first
              </small>
            )}
          </div>

          <div className="ai-form-group">
            <label>Standard</label>
            <select className="input-text" value={standard} onChange={e=>setStandard(e.target.value)}>
              <option value="">Choose a standard...</option>
              {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Worksheet Type *</label>
            <select 
              className="input-text" 
              value={worksheetType} 
              onChange={e=>handleWorksheetTypeChange(e.target.value)}
              disabled={loadingTypes}
            >
              <option value="">Choose type...</option>
              {worksheetTypes.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} {w.is_custom ? '(Custom)' : ''}
                </option>
              ))}
              <option value="CREATE_NEW" style={{fontWeight:'bold',color:'var(--primary-navy)'}}>
                + Create Custom Type...
              </option>
            </select>
          </div>

          <div className="ai-form-group">
            <label>Custom Instructions (Optional)</label>
            <textarea 
              value={prompt} 
              onChange={e=>setPrompt(e.target.value)} 
              placeholder="Add specific requirements, topics, difficulty level, or special instructions..." 
              className="ai-textarea"
              rows="4"
            />
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:24}}>
            <button 
              className="btn ai-generate-btn" 
              onClick={handleGenerate} 
              disabled={generating || !subject || !grade || !worksheetType}
            >
              {generating ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  Generate Worksheet
                </>
              )}
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={()=>{
                setPrompt('')
                setSubject('')
                setStandard('')
                setGrade('')
                setDomain('')
                setWorksheetType('')
              }}
            >
              Clear All
            </button>
          </div>
        </aside>

        <section className="ai-right-panel">
          <div className="ai-results-container">
            {worksheets.length === 0 ? (
              <div className="ai-empty-state">
                <div style={{fontSize:'4rem',marginBottom:16,opacity:0.8}}>�</div>
                <h3 style={{margin:'0 0 8px 0',color:'var(--text-primary)',fontSize:'1.3rem'}}>
                  No Worksheets Yet
                </h3>
                <p style={{margin:0,color:'var(--text-secondary)',lineHeight:1.7,maxWidth:400}}>
                  Configure your worksheet settings on the left and click <strong>Generate Worksheet</strong> to create your first AI-powered educational resource.
                </p>
                <div style={{marginTop:24,padding:20,background:'var(--bg-light)',borderRadius:8,maxWidth:400}}>
                  <h4 style={{margin:'0 0 12px 0',fontSize:'0.95rem',color:'var(--primary-navy)'}}>
                    💡 Quick Tips:
                  </h4>
                  <ul style={{margin:0,paddingLeft:20,fontSize:'0.85rem',color:'var(--text-secondary)',lineHeight:1.8}}>
                    <li>Select Subject, Grade, and Type (required)</li>
                    <li>Add custom instructions for specific topics</li>
                    <li>Create custom worksheet types for reuse</li>
                    <li>Upload thumbnails before listing</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div style={{marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <h3 style={{margin:0,fontSize:'1.15rem',color:'var(--primary-navy)'}}>
                    Generated Worksheets ({worksheets.length})
                  </h3>
                  <div style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>
                    {worksheets.filter(w => w.status === 'draft').length} draft · {worksheets.filter(w => w.thumbnailUploaded).length} ready
                  </div>
                </div>
                <div className="worksheets-grid">
                  {worksheets.map(w => (
                    <div key={w.id} className="worksheet-card">
                      <div className="worksheet-thumbnail">
                        {w.thumbnailUploaded ? (
                          <div className="thumbnail-preview">
                            <span style={{fontSize:'2rem'}}>🖼️</span>
                          </div>
                        ) : (
                          <div className="thumbnail-placeholder">
                            <svg width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                              <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                            </svg>
                            <span>No Thumbnail</span>
                          </div>
                        )}
                        <div className="worksheet-status-badge" data-status={w.status}>
                          {w.status}
                        </div>
                      </div>
                      
                      <div className="worksheet-body">
                        <h4 className="worksheet-title">{w.title}</h4>
                        
                        <div className="worksheet-meta">
                          <span className="meta-badge">📚 {w.subject}</span>
                          <span className="meta-badge">🎓 {w.grade}</span>
                          {w.domain && <span className="meta-badge">📖 {w.domain}</span>}
                        </div>

                        <div className="worksheet-info">
                          <span className="info-item">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                            </svg>
                            {w.content.estimatedTime} min
                          </span>
                          <span className="info-item">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                            </svg>
                            {w.content.totalMarks} marks
                          </span>
                          <span className="info-item">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                            </svg>
                            {w.type}
                          </span>
                        </div>

                        {w.customInstructions && (
                          <p className="worksheet-instructions">
                            {w.customInstructions.length > 100 
                              ? w.customInstructions.slice(0,100) + '...' 
                              : w.customInstructions
                            }
                          </p>
                        )}

                        <div className="worksheet-actions">
                          <button 
                            className="btn-action btn-action-primary" 
                            onClick={() => viewWorksheet(w.id)}
                            title="Edit worksheet"
                          >
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                            </svg>
                            Edit
                          </button>
                          
                          {!w.thumbnailUploaded ? (
                            <button 
                              className="btn-action btn-action-warning" 
                              onClick={() => uploadThumbnail(w.id)}
                              title="Upload thumbnail"
                            >
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                              </svg>
                              Thumbnail
                            </button>
                          ) : (
                            <button 
                              className="btn-action btn-action-success" 
                              onClick={() => listWorksheet(w.id)}
                              title="Publish to marketplace"
                            >
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                              </svg>
                              Publish
                            </button>
                          )}
                          
                          <button 
                            className="btn-action" 
                            onClick={() => downloadWorksheet(w.id)}
                            title="Download PDF"
                          >
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                          </button>
                          
                          <button 
                            className="btn-action btn-action-danger" 
                            onClick={() => removeWorksheet(w.id)}
                            title="Delete worksheet"
                          >
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Custom Worksheet Type Modal */}
      <CustomWorksheetTypeModal
        isOpen={showCustomTypeModal}
        onClose={() => setShowCustomTypeModal(false)}
        onSave={handleSaveCustomType}
      />

      {/* Worksheet Editor Modal */}
      <WorksheetEditorModal
        isOpen={showEditorModal}
        worksheet={selectedWorksheet}
        onClose={() => {
          setShowEditorModal(false)
          setSelectedWorksheet(null)
        }}
        onSave={handleSaveWorksheet}
      />

      {/* Thumbnail Upload Modal */}
      <ThumbnailUploadModal
        isOpen={showThumbnailModal}
        worksheet={selectedWorksheet}
        onClose={() => {
          setShowThumbnailModal(false)
          setSelectedWorksheet(null)
        }}
        onUploadComplete={handleThumbnailUploadComplete}
      />

      <style jsx>{`
        .page-header {
          margin-bottom: 24px;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .worksheets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .worksheet-card {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .worksheet-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .worksheet-thumbnail {
          position: relative;
          width: 100%;
          height: 180px;
          background: linear-gradient(135deg, var(--bg-light), white);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .thumbnail-preview {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--muted-teal), var(--accent-amber));
          color: white;
        }

        .thumbnail-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          opacity: 0.5;
        }

        .thumbnail-placeholder span {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .worksheet-status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          background: white;
          color: var(--text-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .worksheet-status-badge[data-status="published"] {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .worksheet-body {
          padding: 16px;
        }

        .worksheet-title {
          margin: 0 0 12px 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .worksheet-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .meta-badge {
          font-size: 0.75rem;
          padding: 4px 8px;
          background: var(--bg-light);
          border-radius: 4px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .worksheet-info {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
          padding: 10px 0;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .info-item svg {
          opacity: 0.7;
        }

        .worksheet-instructions {
          margin: 0 0 12px 0;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          font-style: italic;
        }

        .worksheet-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .btn-action {
          flex: 1;
          min-width: 70px;
          padding: 8px 12px;
          border: 1px solid var(--border-light);
          background: white;
          color: var(--text-secondary);
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .btn-action:hover {
          background: var(--bg-light);
          border-color: var(--primary-navy);
          color: var(--primary-navy);
        }

        .btn-action-primary {
          background: var(--primary-navy);
          color: white;
          border-color: var(--primary-navy);
        }

        .btn-action-primary:hover {
          background: var(--primary-navy-dark);
          border-color: var(--primary-navy-dark);
          color: white;
        }

        .btn-action-success {
          background: #e8f5e9;
          color: #2e7d32;
          border-color: #a5d6a7;
        }

        .btn-action-success:hover {
          background: #2e7d32;
          border-color: #2e7d32;
          color: white;
        }

        .btn-action-warning {
          background: #fff3e0;
          color: #e65100;
          border-color: #ffb74d;
        }

        .btn-action-warning:hover {
          background: #e65100;
          border-color: #e65100;
          color: white;
        }

        .btn-action-danger:hover {
          background: #dc3545;
          border-color: #dc3545;
          color: white;
        }

        @media (max-width: 768px) {
          .worksheets-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
