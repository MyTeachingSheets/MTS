import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import CustomWorksheetTypeModal from '../../components/CustomWorksheetTypeModal'
import WorksheetEditorModal from '../../components/WorksheetEditorModal'
import ThumbnailUploadModal from '../../components/ThumbnailUploadModal'

export default function AIGeneratePage(){
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Hierarchical selections
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedFramework, setSelectedFramework] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [worksheetType, setWorksheetType] = useState('')

  // Generated worksheets list
  const [worksheets, setWorksheets] = useState([])

  // Modals
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false)
  const [showEditorModal, setShowEditorModal] = useState(false)
  const [showThumbnailModal, setShowThumbnailModal] = useState(false)
  const [selectedWorksheet, setSelectedWorksheet] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  // Preview toggles per worksheet id
  const [previewOpen, setPreviewOpen] = useState({})
  
  // Thumbnail upload states
  const [dragOver, setDragOver] = useState({})
  const [uploadingThumbnail, setUploadingThumbnail] = useState({})
  const thumbnailInputs = useRef({})
  
  // Worksheet types from database
  const [worksheetTypes, setWorksheetTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  // Dynamic dropdown options loaded from admin settings (hierarchical)
  const [subjects, setSubjects] = useState([])
  const [frameworks, setFrameworks] = useState([])
  const [grades, setGrades] = useState([])
  const [lessons, setLessons] = useState([])
  
  const [loadingFrameworks, setLoadingFrameworks] = useState(false)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [loadingLessons, setLoadingLessons] = useState(false)

  // Load worksheet types and subjects on mount
  useEffect(() => {
    loadWorksheetTypes()
    loadSubjects()
    // Load current user session
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      setCurrentUser(data?.session?.user ?? null)
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
    })
    // cleanup listener when component unmounts
    return () => listener?.subscription?.unsubscribe()
  }, [])

  // Load user's worksheets from DB when authenticated
  useEffect(() => {
    if (currentUser) {
      loadWorksheetsFromDB()
    }
  }, [currentUser])

  // Load frameworks when subject changes
  useEffect(() => {
    if (selectedSubject) {
      loadFrameworks(selectedSubject.id)
      setSelectedFramework(null)
      setSelectedGrade(null)
      setSelectedLesson(null)
      setFrameworks([])
      setGrades([])
      setLessons([])
    } else {
      setFrameworks([])
      setSelectedFramework(null)
      setSelectedGrade(null)
      setSelectedLesson(null)
      setGrades([])
      setLessons([])
    }
  }, [selectedSubject])

  // Load grades when framework changes
  useEffect(() => {
    if (selectedFramework) {
      loadGrades(selectedFramework.id)
      setSelectedGrade(null)
      setSelectedLesson(null)
      setGrades([])
      setLessons([])
    } else {
      setGrades([])
      setSelectedGrade(null)
      setSelectedLesson(null)
      setLessons([])
    }
  }, [selectedFramework])

  // Load lessons when grade changes
  useEffect(() => {
    if (selectedGrade) {
      loadLessons(selectedGrade.id)
      setSelectedLesson(null)
      setLessons([])
    } else {
      setLessons([])
      setSelectedLesson(null)
    }
  }, [selectedGrade])

  const loadWorksheetsFromDB = async () => {
    if (!currentUser) return
    
    try {
      const res = await fetch('/api/worksheets/list', {
        headers: {
          'x-user-id': currentUser.id
        }
      })
      
      if (res.ok) {
        const { data } = await res.json()
        // Transform DB records to match the expected format
        const transformedWorksheets = (data || []).map(dbWorksheet => ({
          id: dbWorksheet.id,
          title: dbWorksheet.title,
          subject: dbWorksheet.subject || '—',
          standard: dbWorksheet.framework || '—',
          grade: dbWorksheet.grade || '—',
          domain: dbWorksheet.domain || '—',
          type: dbWorksheet.worksheet_type || '—',
          customInstructions: dbWorksheet.custom_instructions || '',
          status: dbWorksheet.status || 'draft',
          thumbnailUploaded: dbWorksheet.thumbnail_uploaded || false,
          thumbnailUrl: dbWorksheet.thumbnail_url || null,
          isListed: dbWorksheet.is_listed || false,
          createdAt: dbWorksheet.created_at,
          content: dbWorksheet.content
        }))
        setWorksheets(transformedWorksheets)
      }
    } catch (err) {
      console.error('Failed to load worksheets from database:', err)
    }
  }

  const loadSubjects = async () => {
    try {
      const res = await fetch('/api/admin-settings?type=subjects')
      if (res.ok) {
        const data = await res.json()
        setSubjects(data.subjects || [])
      }
    } catch (err) {
      console.error('Failed to load subjects:', err)
    }
  }

  const loadFrameworks = async (subjectId) => {
    setLoadingFrameworks(true)
    try {
      const res = await fetch(`/api/admin-settings?type=frameworks&parent_id=${subjectId}`)
      if (res.ok) {
        const data = await res.json()
        setFrameworks(data.frameworks || [])
      }
    } catch (err) {
      console.error('Failed to load frameworks:', err)
    } finally {
      setLoadingFrameworks(false)
    }
  }

  const loadGrades = async (frameworkId) => {
    setLoadingGrades(true)
    try {
      const res = await fetch(`/api/admin-settings?type=grades&parent_id=${frameworkId}`)
      if (res.ok) {
        const data = await res.json()
        setGrades(data.grades || [])
      }
    } catch (err) {
      console.error('Failed to load grades:', err)
    } finally {
      setLoadingGrades(false)
    }
  }

  const loadLessons = async (gradeId) => {
    setLoadingLessons(true)
    try {
      const res = await fetch(`/api/admin-settings?type=lessons&parent_id=${gradeId}`)
      if (res.ok) {
        const data = await res.json()
        setLessons(data.lessons || [])
      }
    } catch (err) {
      console.error('Failed to load lessons:', err)
    } finally {
      setLoadingLessons(false)
    }
  }

  const loadWorksheetTypes = async () => {
    setLoadingTypes(true)
    try {
      // Default types (always available)
      const defaultTypes = [
        { id: 'practice', name: 'Practice', description: 'Standard practice worksheet', is_custom: false },
        { id: 'assessment', name: 'Assessment', description: 'Formal assessment', is_custom: false },
        { id: 'quiz', name: 'Quiz', description: 'Quick quiz format', is_custom: false },
        { id: 'mixed', name: 'Mixed', description: 'Mixed question types', is_custom: false }
      ]
      
      // Load user's custom types if authenticated
      const { data: { session } } = await supabase.auth.getSession()
      let customTypes = []
      
      if (session?.user) {
        const response = await fetch('/api/worksheet-types/custom', {
          headers: {
            'x-user-id': session.user.id
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          customTypes = result.types.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            is_custom: true,
            question_types: t.question_types,
            json_schema: t.json_schema
          }))
        }
      }
      
      // Merge default and custom types
      setWorksheetTypes([...defaultTypes, ...customTypes])
    } catch (err) {
      console.error('Failed to load worksheet types:', err)
    } finally {
      setLoadingTypes(false)
    }
  }

  const handleSaveCustomType = async (typeData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('You must be signed in to create custom worksheet types')
      }

      // Save to database via API
      const response = await fetch('/api/worksheet-types/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id
        },
        body: JSON.stringify({
          name: typeData.name,
          description: typeData.description,
          questionTypes: typeData.questionTypes,
          jsonSchema: typeData.jsonSchema
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create custom type')
      }

      const result = await response.json()
      const newType = {
        id: result.type.id,
        name: result.type.name,
        description: result.type.description,
        is_custom: true,
        question_types: result.type.question_types,
        json_schema: result.type.json_schema
      }
      
      // Add to local state and select it
      setWorksheetTypes([...worksheetTypes, newType])
      setWorksheetType(newType.id)
      
      setSuccessMessage('Custom worksheet type created successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save custom type:', err)
      setSuccessMessage(err.message || 'Failed to create custom type')
      setTimeout(() => setSuccessMessage(''), 5000)
      throw err
    }
  }

  async function handleGenerate(e){
    e && e.preventDefault()
    
    // Validation
    if (!selectedSubject || !selectedGrade || !worksheetType) {
      console.warn('Please select Subject, Grade, and Worksheet Type')
      return
    }
    
    // Ensure user is signed in
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !session.user) {
      setSuccessMessage('Please sign in to generate worksheets')
      setTimeout(() => setSuccessMessage(''), 3000)
      return
    }

    setGenerating(true)
    try{
      // Call the OpenAI API endpoint
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          , 'x-user-id': session.user.id
        },
        body: JSON.stringify({
          subject: selectedSubject.name,
          framework: selectedFramework?.name,
          grade: selectedGrade.name,
          lesson: selectedLesson?.name,
          lessonDescription: selectedLesson?.description,
          worksheetType: worksheetTypes.find(t => t.id === worksheetType || t.name === worksheetType)?.name || worksheetType,
          customInstructions: prompt,
          promptTemplateName: 'default', // Use default template (will use assistant_id if configured in DB)
          // Include custom JSON schema if custom type selected
          ...((() => {
            const selectedType = worksheetTypes.find(t => t.id === worksheetType)
            if (selectedType?.is_custom && selectedType.json_schema) {
              return {
                customTypeId: selectedType.id,
                jsonSchema: selectedType.json_schema
              }
            }
            return {}
          })())
        })
      })

      // Read response body once as text, then parse
      const rawText = await response.text()
      let data = null
      try {
        data = JSON.parse(rawText)
      } catch (parseErr) {
        // If response is not JSON, log raw text for debugging
        console.error('Non-JSON response from /api/ai/generate:', rawText)
        throw new Error('Non-JSON response from server: ' + rawText)
      }

      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Failed to generate worksheet')
      }

      // Clear prompt after generation
      setPrompt('')

      // Show a transient in-page success message instead of blocking alert
      setSuccessMessage('Worksheet generated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)

      // Reload worksheets from DB to get the newly saved worksheet with its DB ID
      await loadWorksheetsFromDB()
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

  async function removeWorksheet(id){
    if (!confirm('Are you sure you want to delete this worksheet?')) return
    
    try {
      // Delete from database
      if (currentUser) {
        const response = await fetch(`/api/worksheets/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id
          },
          body: JSON.stringify({ id })
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete worksheet from database')
        }
      }
      
      // Remove from local state
      setWorksheets(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      console.error('Failed to delete worksheet:', err)
      alert('Failed to delete worksheet: ' + err.message)
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

  async function listWorksheet(id) {
    const worksheet = worksheets.find(w => w.id === id)
    if (!worksheet.thumbnailUploaded) {
      alert('Please upload a thumbnail before listing the worksheet')
      return
    }
    
    try {
      if (currentUser) {
        // Update database
        await fetch('/api/worksheets/save', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id
          },
          body: JSON.stringify({
            id,
            title: worksheet.title,
            content: worksheet.content,
            status: 'published',
            isListed: true
          })
        })
      }
      
      // Update local state
      setWorksheets(prevWorksheets => 
        prevWorksheets.map(w => 
          w.id === id 
            ? { ...w, status: 'published', isListed: true }
            : w
        )
      )
      
      alert('✅ Worksheet published successfully! It will now appear on the marketplace.')
    } catch (err) {
      console.error('Failed to publish worksheet:', err)
      alert('Failed to publish worksheet: ' + err.message)
    }
  }

  function downloadWorksheet(id) {
    const worksheet = worksheets.find(w => w.id === id)
    if (!worksheet) {
      alert('Worksheet not found')
      return
    }

    // Build printable HTML
    const html = buildPrintableWorksheetHTML(worksheet)

    // Open new window and write HTML
    const win = window.open('', '_blank')
    if (!win) {
      alert('Popup blocked. Please allow popups for this site to download PDFs.')
      return
    }

    win.document.open()
    win.document.write(html)
    win.document.close()

    // Small delay to allow images/styles to load, then trigger print
    setTimeout(() => {
      win.focus()
      try {
        win.print()
      } catch (err) {
        console.error('Print failed', err)
        alert('Failed to open print dialog. You can still copy the page and print manually.')
      }
    }, 500)
  }

  function escapeHtml(str) {
    if (!str) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  function buildPrintableWorksheetHTML(worksheet) {
    // Normalize: some worksheets keep AI output at worksheet.content, others directly on worksheet
    const data = worksheet.content || worksheet

    const header = `
      <html>
      <head>
        <title>${escapeHtml(worksheet.title || 'Worksheet')}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #222 }
          h1 { font-size: 22px; margin-bottom: 4px }
          .meta { color: #555; margin-bottom: 12px }
          .section { margin-top: 18px }
          .question { margin: 8px 0; }
          .options { margin-left: 18px; }
          .footer { margin-top: 24px; color: #666; font-size: 12px }
          @media print { .no-print { display: none } }
        </style>
      </head>
      <body>
    `

    const footer = `</body></html>`

    let body = ''
    body += `<h1>${escapeHtml(data.title || worksheet.title || 'Worksheet')}</h1>`
    body += `<div class="meta">Subject: ${escapeHtml(data.subject || worksheet.subject || '')} · Grade: ${escapeHtml(data.grade || worksheet.grade || '')}</div>`
    if (data.description) {
      body += `<div>${escapeHtml(data.description)}</div>`
    }

    const sections = data.sections || []
    sections.forEach((sec, si) => {
      body += `<div class="section"><h2>${escapeHtml(sec.title || `Section ${si+1}`)}</h2>`
      if (sec.instructions) body += `<div>${escapeHtml(sec.instructions)}</div>`

      const questions = sec.questions || []
      questions.forEach((q, qi) => {
        body += `<div class="question"><strong>${qi+1}.</strong> ${escapeHtml(q.text || '')}`

        // Render by question type
        if (q.type === 'multiple_choice' && Array.isArray(q.options)) {
          body += `<div class="options">`
          q.options.forEach((opt, oi) => {
            // Options may include option labels already (e.g., "A. H2O") — normalize
            const label = String.fromCharCode(65 + oi)
            const text = String(opt).replace(/^\s*[A-Za-z]\.\s*/, '')
            body += `<div>${label}. ${escapeHtml(text)}</div>`
          })
          body += `</div>`
        } else if (q.type === 'true_false') {
          body += `<div class="options"><div>True</div><div>False</div></div>`
        } else if (q.type === 'matching' && Array.isArray(q.pairs)) {
          // pairs: [{left: '', right: ''}]
          body += `<div class="options">`
          q.pairs.forEach((p, idx) => {
            body += `<div>${escapeHtml(p.left || '')} — ${escapeHtml(p.right || '')}</div>`
          })
          body += `</div>`
        } else if (q.type === 'short_answer' || q.type === 'long_answer' || q.type === 'fill_in_blank') {
          // Provide space for students to write
          const lines = q.type === 'short_answer' ? 2 : 6
          body += `<div style="margin-top:8px">`
          for (let i = 0; i < lines; i++) body += `<div style="height:18px;border-bottom:1px solid #ddd;margin-bottom:8px"></div>`
          body += `</div>`
        } else if (q.type === 'calculation') {
          body += `<div class="options"><div>Show your working steps below:</div>`
          for (let i = 0; i < 6; i++) body += `<div style="height:18px;border-bottom:1px solid #ddd;margin-bottom:8px"></div>`
          body += `</div>`
        }

        body += `</div>`
      })

      body += `</div>`
    })

    // Answer Key
    const answerKey = data.answerKey || data.answer_key || {}
    if (answerKey && Object.keys(answerKey).length > 0) {
      body += `<div class="section"><h2>Answer Key</h2>`
      Object.keys(answerKey).forEach((qid) => {
        const ans = answerKey[qid]
        body += `<div class="question"><strong>${escapeHtml(qid)}:</strong> ${escapeHtml(String(ans))}</div>`
      })
      body += `</div>`
    }

    body += `<div class="footer">Generated by MyTeachingSheets • ${new Date().toLocaleString()}</div>`

    return header + body + footer
  }

  const handleWorksheetTypeChange = (value) => {
    if (value === 'CREATE_NEW') {
      setShowCustomTypeModal(true)
      // Don't update worksheetType yet
    } else {
      setWorksheetType(value)
    }
  }

  const handleSaveWorksheet = async (updatedWorksheet) => {
    try {
      if (currentUser) {
        // Save to database
        const response = await fetch('/api/worksheets/save', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id
          },
          body: JSON.stringify({
            id: updatedWorksheet.id,
            title: updatedWorksheet.title,
            subject: updatedWorksheet.subject,
            standard: updatedWorksheet.standard,
            grade: updatedWorksheet.grade,
            domain: updatedWorksheet.domain,
            worksheetType: updatedWorksheet.type,
            customInstructions: updatedWorksheet.customInstructions,
            content: updatedWorksheet.content,
            status: updatedWorksheet.status,
            thumbnailUrl: updatedWorksheet.thumbnailUrl,
            thumbnailUploaded: updatedWorksheet.thumbnailUploaded,
            isListed: updatedWorksheet.isListed
          })
        })

        if (!response.ok) {
          throw new Error('Failed to save worksheet to database')
        }
      }

      // Update local state
      setWorksheets(prevWorksheets =>
        prevWorksheets.map(w =>
          w.id === updatedWorksheet.id ? updatedWorksheet : w
        )
      )
    } catch (err) {
      console.error('Failed to save worksheet:', err)
      alert('Failed to save worksheet: ' + err.message)
    }
  }

  const handleThumbnailUploadComplete = async (worksheetId, thumbnailUrl) => {
    try {
      const worksheet = worksheets.find(w => w.id === worksheetId)
      if (currentUser && worksheet) {
        // Update database
        await fetch('/api/worksheets/save', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id
          },
          body: JSON.stringify({
            id: worksheetId,
            title: worksheet.title,
            content: worksheet.content,
            thumbnailUrl,
            thumbnailUploaded: true
          })
        })
      }

      // Update local state
      setWorksheets(prevWorksheets =>
        prevWorksheets.map(w =>
          w.id === worksheetId
            ? { ...w, thumbnailUrl, thumbnailUploaded: true }
            : w
        )
      )
    } catch (err) {
      console.error('Failed to update thumbnail:', err)
    }
  }

  // Drag and drop handlers for thumbnail
  const handleThumbnailDragOver = (e, worksheetId) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(prev => ({ ...prev, [worksheetId]: true }))
  }

  const handleThumbnailDragLeave = (e, worksheetId) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(prev => ({ ...prev, [worksheetId]: false }))
  }

  const handleThumbnailDrop = async (e, worksheetId) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(prev => ({ ...prev, [worksheetId]: false }))

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      await uploadThumbnailFile(worksheetId, file)
    }
  }

  const handleThumbnailClick = (worksheetId) => {
    if (thumbnailInputs.current[worksheetId]) {
      thumbnailInputs.current[worksheetId].click()
    }
  }

  const handleThumbnailFileSelect = async (e, worksheetId) => {
    const file = e.target.files[0]
    if (file) {
      await uploadThumbnailFile(worksheetId, file)
    }
  }

  const uploadThumbnailFile = async (worksheetId, file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, etc.)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setUploadingThumbnail(prev => ({ ...prev, [worksheetId]: true }))

    // Small helper: show a temporary toast message
    const showToast = (msg, timeout = 3000) => {
      const el = document.createElement('div')
      el.className = 'thumbnail-toast'
      el.textContent = msg
      Object.assign(el.style, {
        position: 'fixed',
        right: '24px',
        top: '84px',
        background: '#222',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        zIndex: 12000,
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
      })
      document.body.appendChild(el)
      setTimeout(() => el.remove(), timeout)
    }

    try {
      // Compress / resize the image client-side before converting to data URL
      const dataUrl = await (async () => {
        // If image is already small, skip compression
        const img = await new Promise((resolve, reject) => {
          const i = new Image()
          i.onload = () => resolve(i)
          i.onerror = () => reject(new Error('Failed to load image for compression'))
          i.src = URL.createObjectURL(file)
        })

        const maxSize = 1200 // max width/height
        let { width, height } = img
        let scale = 1
        if (width > maxSize || height > maxSize) {
          scale = Math.min(maxSize / width, maxSize / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Choose output format based on original mime
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        const quality = 0.8
        const durl = canvas.toDataURL(outputType, quality)
        URL.revokeObjectURL(img.src)
        return durl
      })()

      const response = await fetch('/api/worksheets/upload-thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify({ worksheetId, imageData: dataUrl })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Upload error response body:', errorData)
        const msg = errorData?.details || errorData?.error || 'Upload failed'
        showToast('Thumbnail upload failed', 4000)
        throw new Error(msg)
      }

      const body = await response.json()
      const thumbnailUrl = body?.data?.thumbnailUrl || body?.thumbnailUrl || null
      
  // Update the worksheet in state and database
  await handleThumbnailUploadComplete(worksheetId, thumbnailUrl)

  // Show a small confirmation toast
  showToast('Thumbnail uploaded')
      
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      alert('Failed to upload thumbnail: ' + error.message)
    } finally {
      setUploadingThumbnail(prev => ({ ...prev, [worksheetId]: false }))
    }
  }

  return (
    <>
      <div className="ai-generate-root">
        <aside className="ai-left-panel">
          <div className="ai-form-group">
            <label>Subject *</label>
            <select 
              className="input-text" 
              value={selectedSubject?.id || ''} 
              onChange={e => {
                const subject = subjects.find(s => s.id === e.target.value)
                setSelectedSubject(subject || null)
              }}
            >
              <option value="">Select</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Framework{selectedSubject ? ' *' : ''}</label>
            <select 
              className="input-text" 
              value={selectedFramework?.id || ''} 
              onChange={e => {
                const framework = frameworks.find(f => f.id === e.target.value)
                setSelectedFramework(framework || null)
              }}
              disabled={!selectedSubject || loadingFrameworks}
            >
              <option value="">
                {!selectedSubject ? 'Select subject first' : loadingFrameworks ? 'Loading...' : 'Select'}
              </option>
              {frameworks.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Grade{selectedFramework ? ' *' : ''}</label>
            <select 
              className="input-text" 
              value={selectedGrade?.id || ''} 
              onChange={e => {
                const grade = grades.find(g => g.id === e.target.value)
                setSelectedGrade(grade || null)
              }}
              disabled={!selectedFramework || loadingGrades}
            >
              <option value="">
                {!selectedFramework ? 'Select framework first' : loadingGrades ? 'Loading...' : 'Select'}
              </option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div className="ai-form-group">
            <label>Lesson (optional)</label>
            <select 
              className="input-text" 
              value={selectedLesson?.id || ''} 
              onChange={e => {
                const lesson = lessons.find(l => l.id === e.target.value)
                setSelectedLesson(lesson || null)
              }}
              disabled={!selectedGrade || loadingLessons}
            >
              <option value="">
                {!selectedGrade ? 'Select grade first' : loadingLessons ? 'Loading...' : 'Select (optional)'}
              </option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            {selectedLesson?.description && (
              <div className="lesson-description-box">
                <small>{selectedLesson.description}</small>
              </div>
            )}
          </div>

          <div className="ai-form-group">
            <label>Type *</label>
            <select className="input-text" value={worksheetType} onChange={e=>handleWorksheetTypeChange(e.target.value)} disabled={loadingTypes}>
              <option value="">Select</option>
              {worksheetTypes.map(w => (
                <option key={w.id} value={w.id}>{w.name}{w.is_custom ? ' (Custom)' : ''}</option>
              ))}
              <option value="CREATE_NEW" style={{fontWeight:'bold',color:'var(--primary-navy)'}}>Create new</option>
            </select>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:24}}>
            <button 
              className="btn ai-generate-btn" 
              onClick={handleGenerate} 
              disabled={generating || !selectedSubject || !selectedGrade || !worksheetType}
            >
              {generating ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                'Generate Worksheet'
              )}
            </button>
            <div style={{marginTop:8,fontSize:'0.9rem',color: currentUser ? 'var(--text-primary)' : 'var(--text-secondary)'}}>
              {currentUser ? null : (
                <div>Please sign in (use the Log In button in the header) to generate worksheets</div>
              )}
            </div>
            
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
            {successMessage && (
              <div style={{position:'fixed',right:24,top:84,zIndex:1200,background:'#e6ffed',color:'#0b6b27',padding:'10px 16px',borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,0.08)'}}>
                {successMessage}
              </div>
            )}
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
                {/* Header intentionally removed per UX request: no top summary shown */}
                <div className="worksheets-list">
                  {worksheets.map(w => (
                    <div key={w.id} className="worksheet-raw-item">
                      {/* Thumbnail Placeholder */}
                      <div 
                        className={`worksheet-thumbnail ${dragOver[w.id] ? 'drag-over' : ''} ${uploadingThumbnail[w.id] ? 'uploading' : ''}`}
                        onDragOver={(e) => handleThumbnailDragOver(e, w.id)}
                        onDragLeave={(e) => handleThumbnailDragLeave(e, w.id)}
                        onDrop={(e) => handleThumbnailDrop(e, w.id)}
                        onClick={() => handleThumbnailClick(w.id)}
                        title="Drag and drop an image or click to upload"
                      >
                        {w.thumbnailUrl ? (
                          <img src={w.thumbnailUrl} alt={w.title} />
                        ) : (
                          <div className="thumbnail-placeholder">
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                              <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2.002 3h10a2 2 0 0 1 2 2v8zm-12-1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8l-3.5-3.5-2.5 2.5-3.5-3.5v6z"/>
                            </svg>
                          </div>
                        )}
                        {uploadingThumbnail[w.id] && (
                          <div className="thumbnail-uploading">
                            <div className="spinner"></div>
                          </div>
                        )}
                        <input
                          ref={el => thumbnailInputs.current[w.id] = el}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleThumbnailFileSelect(e, w.id)}
                        />
                      </div>
                      
                      <div className="worksheet-raw-main">
                        <div className="worksheet-raw-header">
                          <div className="worksheet-raw-meta">
                            <span className="meta-badge badge-status" data-status={w.status}>{w.status}</span>
                          </div>
                          <div className="worksheet-raw-actions">
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
                            <button
                              className="btn-action btn-action-secondary"
                              onClick={() => setPreviewOpen(prev => ({ ...prev, [w.id]: !prev[w.id] }))}
                              title={previewOpen[w.id] ? 'Hide preview' : 'Preview worksheet'}
                            >
                              {previewOpen[w.id] ? 'Hide' : 'Preview'}
                            </button>
                          
                          {!w.thumbnailUploaded ? (
                            <button 
                              className="btn-action btn-action-secondary" 
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

                      {/* Raw Worksheet Content - compact by default, full when previewOpen */}
                      <div className="worksheet-raw-content">
                        <div className="worksheet-raw-title-row">
                          <h3 className="worksheet-raw-title">{w.title}</h3>
                          <div className="worksheet-raw-sub">{w.description || ''}</div>
                        </div>

                        {w.content && !previewOpen[w.id] && (
                          <div className="raw-compact">
                            {w.content.framework && <div className="compact-line">Framework: <strong>{w.content.framework}</strong></div>}
                            {w.content.learning_objectives && w.content.learning_objectives.length > 0 && (
                              <div className="compact-line">Learning objectives: {w.content.learning_objectives.slice(0,2).join('; ')}{w.content.learning_objectives.length > 2 ? '…' : ''}</div>
                            )}
                            {w.content.questions && (
                              <div className="compact-line">Questions: <strong>{w.content.questions.length}</strong> • First: {w.content.questions[0]?.text || w.content.questions[0]?.question || '—'}</div>
                            )}
                          </div>
                        )}

                        {w.content && previewOpen[w.id] && (
                          <div className="raw-full">
                            {w.content.framework && (
                              <div className="raw-section">
                                <strong>Framework:</strong> {w.content.framework}
                              </div>
                            )}
                            {w.content.learning_objectives && w.content.learning_objectives.length > 0 && (
                              <div className="raw-section">
                                <strong>Learning Objectives:</strong>
                                <ul>
                                  {w.content.learning_objectives.map((obj, idx) => (
                                    <li key={idx}>{obj}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {w.content.questions && w.content.questions.length > 0 && (
                              <div className="raw-section">
                                <strong>Questions:</strong>
                                {w.content.questions.map((q, idx) => (
                                  <div key={idx} className="question-item">
                                    <div className="question-number">Q{idx + 1}:</div>
                                    <div className="question-content">
                                      <p><strong>{q.text || q.question}</strong></p>
                                      {q.marks && <span className="question-marks">[{q.marks} marks]</span>}
                                      {q.answer && (
                                        <div className="question-answer">
                                          <em>Answer:</em> {q.answer}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {w.content.instructions && (
                              <div className="raw-section">
                                <strong>Instructions:</strong>
                                <p>{w.content.instructions}</p>
                              </div>
                            )}
                          </div>
                        )}
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

        .ai-generate-root {
          display: flex;
          gap: 0;
          max-width: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          position: relative;
        }

        .ai-left-panel {
          /* start below header; set --header-height in your global CSS if needed */
          --_header_h: var(--header-height, 80px);
          position: fixed;
          top: var(--_header_h);
          left: 0;
          width: 320px;
          height: calc(100vh - var(--_header_h));
          overflow-y: auto;
          padding: 24px;
          background: white;
          border-right: 1px solid var(--border-light);
          box-shadow: none;
          border-radius: 0;
          z-index: 100;
        }

        .ai-right-panel {
          margin-left: 320px;
          margin-right: 0;
          flex: 1 1 auto;
          min-width: 0;
          padding: 0;
          width: calc(100% - 320px);
          /* fill remaining vertical space beside sidebar */
          --_header_h: var(--header-height, 80px);
          height: calc(100vh - var(--_header_h));
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 0;
        }

        .ai-results-container {
          width: 100%;
          /* allow the content area to scroll while keeping header/actions sticky */
          flex: 1 1 auto;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 24px;
          box-sizing: border-box;
        }

        .ai-form-group {
          margin-bottom: 20px;
        }

        .ai-form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .lesson-description-box {
          margin-top: 8px;
          padding: 10px 12px;
          background: #f8f9fa;
          border-left: 3px solid var(--primary-color);
          border-radius: 4px;
        }

        .lesson-description-box small {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .ai-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;
        }

        .ai-textarea:focus {
          outline: none;
          border-color: var(--primary-navy);
          box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
        }

        .ai-generate-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
        }

        .ai-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        @media (max-width: 968px) {
          .ai-generate-root {
            flex-direction: column;
          }

          .ai-left-panel {
            position: relative;
            top: 0;
            left: 0;
            width: 100%;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-light);
            background: white;
            padding: 16px;
          }

          .ai-right-panel {
            margin-left: 0;
            width: 100%;
            height: auto;
            padding: 0;
          }

          .ai-results-container {
            padding: 16px;
          }

          .worksheets-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .worksheet-card {
            width: 100%;
            max-width: 100%;
          }

          .worksheet-actions {
            flex-wrap: wrap;
          }

          .btn-action {
            flex: 1 1 calc(50% - 3px);
            min-width: 100px;
            font-size: 0.75rem;
            padding: 8px 6px;
          }
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

        /* Thumbnail toast */
        .thumbnail-toast {
          font-size: 0.9rem;
          opacity: 0.98;
        }

        .worksheets-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .worksheet-raw-item {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
          display: flex;
          gap: 16px;
        }

        .worksheet-raw-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .worksheet-thumbnail {
          position: relative;
          width: 120px;
          min-width: 120px;
          height: 120px;
          background: #f5f5f5;
          border-right: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          overflow: hidden;
        }

        .worksheet-thumbnail:hover {
          background: #ebebeb;
        }

        .worksheet-thumbnail.drag-over {
          background: #e3f2fd;
          border: 2px dashed var(--primary-color);
        }

        .worksheet-thumbnail.uploading {
          pointer-events: none;
          opacity: 0.6;
        }

        .worksheet-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }

        .thumbnail-placeholder svg {
          opacity: 0.5;
        }

        .thumbnail-uploading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .worksheet-raw-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .worksheet-raw-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: var(--bg-light);
          border-bottom: 1px solid var(--border-light);
          flex-wrap: wrap;
          gap: 8px;
        }

        .worksheet-raw-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .worksheet-raw-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .badge-status {
          font-weight: 700;
          text-transform: uppercase;
        }

        .badge-status[data-status="draft"] {
          background: #f5f5f5;
          color: #666;
        }

        .badge-status[data-status="published"] {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .worksheet-raw-content {
          padding: 12px 16px;
        }

        .worksheet-raw-title-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
        }

        .worksheet-raw-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .worksheet-raw-sub {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-left: 12px;
        }

        .raw-section {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-light);
        }

        .raw-section:last-child {
          border-bottom: none;
        }

        .raw-section strong {
          display: block;
          margin-bottom: 8px;
          font-size: 1rem;
          color: var(--primary-navy);
        }

        .raw-section ul {
          margin: 0;
          padding-left: 20px;
          list-style: disc;
        }

        .raw-section li {
          margin-bottom: 8px;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .raw-section p {
          margin: 0;
          line-height: 1.7;
          color: var(--text-primary);
        }

        .question-item {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          padding: 10px;
          background: #fbfcfd;
          border-radius: 6px;
        }

        .question-number {
          flex-shrink: 0;
          font-weight: 700;
          color: var(--primary-navy);
          font-size: 0.95rem;
        }

        .question-content {
          flex: 1;
        }

        .question-content p {
          margin: 0 0 6px 0;
          color: var(--text-primary);
          line-height: 1.5;
        }

        .question-marks {
          display: inline-block;
          padding: 2px 8px;
          background: var(--accent-amber);
          color: white;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-left: 8px;
        }

        .question-answer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #dee2e6;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .question-answer em {
          font-weight: 600;
          color: var(--text-primary);
          font-style: normal;
        }

        .meta-badge {
          font-size: 0.75rem;
          padding: 4px 12px;
          background: var(--bg-light);
          border-radius: 16px;
          color: var(--text-secondary);
          font-weight: 600;
          white-space: nowrap;
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
          .ai-left-panel {
            padding: 12px;
          }

          .ai-results-container {
            padding: 12px;
          }

          .worksheet-thumbnail {
            height: 150px;
          }

          .worksheet-body {
            padding: 12px;
          }

          .worksheet-title {
            font-size: 0.95rem;
          }

          .btn-action {
            flex: 1 1 100%;
            min-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .ai-form-group label {
            font-size: 0.85rem;
          }

          .meta-badge {
            font-size: 0.7rem;
            padding: 3px 6px;
          }

          .worksheet-actions {
            gap: 8px;
          }

          .btn-action {
            padding: 10px 12px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  )
}
