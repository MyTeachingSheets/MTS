import { useState, useEffect } from 'react'

export default function CustomWorksheetTypeModal({ isOpen, onClose, onSave }) {
  const [typeName, setTypeName] = useState('')
  // passages feature removed to keep UI minimal
  const [estimatedTime, setEstimatedTime] = useState(30)
  const [addIndividually, setAddIndividually] = useState(true)
  const [questionItems, setQuestionItems] = useState([])
  
  const [questionTypes, setQuestionTypes] = useState([
    { 
      id: Date.now(), 
      type: 'multiple_choice', 
      count: 10, 
      marks: 1,
      options: { optionsCount: 4 }
    }
  ])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [draggedItem, setDraggedItem] = useState(null)

  // Keep currentPage in range when questions change
  useEffect(() => {
    if (!isOpen) return
    
    const totalQuestions = questionItems.reduce((sum, q) => sum + (parseInt(q.count) || 1), 0)
    const QUESTIONS_PER_PAGE = 8
    const totalPages = Math.max(1, Math.ceil(totalQuestions / QUESTIONS_PER_PAGE))
    
    setCurrentPage((prev) => {
      if (prev >= totalPages) return totalPages - 1
      return prev
    })
  }, [questionItems, questionTypes, isOpen])

  const QUESTION_TYPE_OPTIONS = [
    { value: 'multiple_choice', label: 'Multiple Choice', hasOptions: true },
    { value: 'short_answer', label: 'Short Answer', hasOptions: false },
    { value: 'essay', label: 'Essay', hasOptions: false },
    { value: 'fill_blank', label: 'Fill in the Blank', hasOptions: false },
    { value: 'true_false', label: 'True/False', hasOptions: false },
    { value: 'matching', label: 'Matching', hasOptions: true }
  ]

  if (!isOpen) return null

  const addQuestionType = () => {
    setQuestionTypes([
      ...questionTypes,
      { 
        id: Date.now(), 
        type: 'multiple_choice', 
        count: 5, 
        marks: 1,
        options: { optionsCount: 4 }
      }
    ])
  }

  const addQuestionItem = () => {
    setQuestionItems([
      ...questionItems,
      { id: Date.now(), type: 'multiple_choice', marks: 1, count: 1, options: { optionsCount: 4 } }
    ])
  }

  const removeQuestionItem = (id) => {
    setQuestionItems(questionItems.filter(q => q.id !== id))
  }

  const updateQuestionItem = (id, field, value) => {
    setQuestionItems(questionItems.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  // Drag-and-drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetItem) => {
    e.preventDefault()
    if (!draggedItem || draggedItem.id === targetItem.id) return

    const draggedIndex = questionItems.findIndex(q => q.id === draggedItem.id)
    const targetIndex = questionItems.findIndex(q => q.id === targetItem.id)

    const newItems = [...questionItems]
    newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    setQuestionItems(newItems)
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const removeQuestionType = (id) => {
    setQuestionTypes(questionTypes.filter(qt => qt.id !== id))
  }

  const updateQuestionType = (id, field, value) => {
    setQuestionTypes(questionTypes.map(qt => 
      qt.id === id ? { ...qt, [field]: value } : qt
    ))
  }

  const updateQuestionTypeOption = (id, optionKey, value) => {
    setQuestionTypes(questionTypes.map(qt => 
      qt.id === id 
        ? { ...qt, options: { ...qt.options, [optionKey]: value } }
        : qt
    ))
  }

  const calculateTotalMarks = () => {
    if (addIndividually) {
      return questionItems.reduce((sum, q) => sum + ((parseInt(q.count) || 1) * (parseInt(q.marks) || 1)), 0)
    }
    return questionTypes.reduce((sum, qt) => sum + (qt.count * qt.marks), 0)
  }

  const handleSave = async () => {
    setError('')
    
    // Validation
    if (!typeName.trim()) {
      setError('Worksheet type name is required')
      return
    }
    
    if (questionTypes.length === 0) {
      setError('At least one question type is required')
      return
    }

    const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0)
    if (totalQuestions === 0) {
      setError('Total question count must be greater than 0')
      return
    }

    setSaving(true)
    try {
      // If user added questions individually, convert them into question type summary
      let finalQuestionTypes = questionTypes
      if (addIndividually) {
        const grouped = {}
        questionItems.forEach(q => {
          if (!grouped[q.type]) grouped[q.type] = { type: q.type, count: 0, marksSum: 0, options: { optionsCount: q.options?.optionsCount || 4 } }
          grouped[q.type].count += 1
          grouped[q.type].marksSum += (parseInt(q.marks) || 1)
        })
        finalQuestionTypes = Object.values(grouped).map(g => ({
          type: g.type,
          count: g.count,
          marks: Math.max(1, Math.round(g.marksSum / g.count)),
          options: g.options
        }))
      }

      const worksheetTypeData = {
        name: typeName,
        is_custom: true,
        default_config: {
              question_types: finalQuestionTypes.map(qt => ({ type: qt.type, count: qt.count, marks: qt.marks, ...qt.options })),
              total_marks: finalQuestionTypes.reduce((s, q) => s + (q.count * q.marks), 0),
              estimated_time: estimatedTime
            }
      }

      await onSave(worksheetTypeData)
      
  // Reset form
  setTypeName('')
  // passages removed
      setEstimatedTime(30)
      setQuestionTypes([
        { 
          id: Date.now(), 
          type: 'multiple_choice', 
          count: 10, 
          marks: 1,
          options: { optionsCount: 4 }
        }
      ])
  setAddIndividually(false)
  setQuestionItems([])
      
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save worksheet type')
    } finally {
      setSaving(false)
    }
  }

  const getQuestionTypeLabel = (value) => {
    return QUESTION_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value
  }

  const hasOptions = (type) => {
    return QUESTION_TYPE_OPTIONS.find(opt => opt.value === type)?.hasOptions || false
  }

  // Generate worksheet preview structure
  const generatePreview = () => {
    const preview = []
    let questionNumber = 1

    if (!addIndividually) {
      // Bulk mode: expand question types into individual questions
      questionTypes.forEach(qt => {
        for (let i = 0; i < qt.count; i++) {
          preview.push({
            number: questionNumber++,
            type: qt.type,
            text: `[${getQuestionTypeLabel(qt.type)} question]`,
            marks: qt.marks,
            optionsCount: qt.options?.optionsCount || 4
          })
        }
      })
    } else {
      // Individual mode: expand based on count for each question item
      questionItems.forEach(qi => {
        const count = parseInt(qi.count) || 1
        for (let i = 0; i < count; i++) {
          preview.push({
            number: questionNumber++,
            type: qi.type,
            text: `[${getQuestionTypeLabel(qi.type)} question]`,
            marks: qi.marks,
            optionsCount: qi.options?.optionsCount || 4
          })
        }
      })
    }

    return preview
  }

  const optionLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

  // Pagination logic for A4 pages
  const QUESTIONS_PER_PAGE = 8 // Realistic estimate for A4 page with multiple choice questions
  
  const paginatePreview = () => {
    const allQuestions = generatePreview()
    const pages = []
    
    // Split questions into pages
    for (let i = 0; i < allQuestions.length; i += QUESTIONS_PER_PAGE) {
      pages.push(allQuestions.slice(i, i + QUESTIONS_PER_PAGE))
    }
    
    return pages.length > 0 ? pages : [[]] // At least one empty page
  }

  const pages = paginatePreview()
  const totalPages = pages.length
  const currentQuestions = pages[currentPage] || []

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container custom-type-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="header-left">
            <input
              className="header-input"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="New Worksheet Type"
            />
          </div>
          <div className="header-right">
            <div className="time-pill">
              <input
                type="number"
                className="time-input"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                min="1"
                max="180"
              />
              <span className="time-unit">min</span>
            </div>

            <div className="header-actions">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>

        <div className="modal-body two-column-layout">
          {/* LEFT COLUMN: Form inputs */}
          <div className="form-column">
            {/* Basic Info */}
            <div className="form-section">
            
            {/* title edited inline in header */}

            {/* Description removed per request */}

            {/* Est. time moved to header */}
          </div>

          {/* Question Types */}
          <div className="form-section">
            <div className="question-types-list">
              {questionItems.map((qi, idx) => (
                <div 
                  key={qi.id} 
                  className={`question-card ${draggedItem?.id === qi.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, qi)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, qi)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="question-card-header">
                    <div className="drag-handle" title="Drag to reorder">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="4" cy="4" r="1.5"/>
                        <circle cx="4" cy="8" r="1.5"/>
                        <circle cx="4" cy="12" r="1.5"/>
                        <circle cx="12" cy="4" r="1.5"/>
                        <circle cx="12" cy="8" r="1.5"/>
                        <circle cx="12" cy="12" r="1.5"/>
                      </svg>
                    </div>
                    <span className="question-number-badge">{idx + 1}</span>
                    <select 
                      className="question-type-select" 
                      value={qi.type} 
                      onChange={(e) => updateQuestionItem(qi.id, 'type', e.target.value)}
                    >
                      {QUESTION_TYPE_OPTIONS.map(opt => 
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      )}
                    </select>
                    <button 
                      className="remove-btn" 
                      onClick={() => removeQuestionItem(qi.id)} 
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="question-card-body">
                    <div className="compact-controls">
                      <div className="control-group">
                        <label>Count</label>
                        <input 
                          type="number" 
                          className="compact-input" 
                          value={qi.count || 1} 
                          onChange={(e) => updateQuestionItem(qi.id, 'count', parseInt(e.target.value) || 1)} 
                          min="1"
                          max="100"
                        />
                      </div>
                      
                      <div className="control-group">
                        <label>Marks</label>
                        <input 
                          type="number" 
                          className="compact-input" 
                          value={qi.marks} 
                          onChange={(e) => updateQuestionItem(qi.id, 'marks', parseInt(e.target.value) || 1)} 
                          min="1"
                        />
                      </div>
                      
                      {hasOptions(qi.type) && (
                        <div className="control-group">
                          <label>Options</label>
                          <input 
                            type="number" 
                            className="compact-input" 
                            value={qi.options?.optionsCount || 4} 
                            onChange={(e) => updateQuestionItem(qi.id, 'options', { optionsCount: parseInt(e.target.value) || 4 })} 
                            min="2"
                            max="10"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button className="add-question-btn" onClick={addQuestionItem}>
                <span className="plus-icon">+</span>
                Add question type
              </button>
            </div>
          </div>

          {/* Passages and summary removed to keep UI minimal */}

            {error && (
              <div className="error-message">{error}</div>
            )}
          </div>

          {/* RIGHT COLUMN: A4 Worksheet Preview */}
          <div className="preview-column">
            <div className="preview-header">
              <button 
                className="nav-btn nav-btn-left" 
                onClick={goToPrevPage} 
                disabled={currentPage === 0}
                title="Previous page"
              >
                ‹
              </button>
              <div className="preview-title"></div>
              <button 
                className="nav-btn nav-btn-right" 
                onClick={goToNextPage} 
                disabled={currentPage >= totalPages - 1}
                title="Next page"
              >
                ›
              </button>
            </div>

            <div className="a4-preview-container">
              <div className="a4-page">
                <div className="a4-header">
                  <h4>{typeName || '[Worksheet Name]'}</h4>
                  <div className="a4-meta">
                    <span>Time: {estimatedTime} min</span>
                    <span>Total: {calculateTotalMarks()} marks</span>
                  </div>
                </div>

                {/* passages removed */}

                <div className="preview-questions">
                  {currentQuestions.map((q) => (
                    <div key={q.number} className="preview-question">
                      <div className="preview-question-header">
                        <span className="preview-q-number">{q.number}.</span>
                        <span className="preview-q-text">{q.text}</span>
                        <span className="preview-q-marks">({q.marks})</span>
                      </div>
                      
                      {hasOptions(q.type) && (
                        <div className="preview-options">
                          {Array.from({ length: q.optionsCount }).map((_, optIdx) => (
                            <div key={optIdx} className="preview-option">
                              <span className="preview-option-letter">{optionLetters[optIdx]}.</span>
                              <span className="preview-option-text">Option {optIdx + 1}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'short_answer' && (
                        <div className="preview-answer-space">
                          <div className="preview-answer-line"></div>
                        </div>
                      )}

                      {q.type === 'essay' && (
                        <div className="preview-answer-space">
                          <div className="preview-answer-line"></div>
                          <div className="preview-answer-line"></div>
                          <div className="preview-answer-line"></div>
                        </div>
                      )}

                      {q.type === 'fill_blank' && (
                        <div className="preview-answer-space">
                          <div className="preview-answer-line short"></div>
                        </div>
                      )}

                      {q.type === 'true_false' && (
                        <div className="preview-options">
                          <div className="preview-option">
                            <span className="preview-option-letter">a.</span>
                            <span className="preview-option-text">True</span>
                          </div>
                          <div className="preview-option">
                            <span className="preview-option-letter">b.</span>
                            <span className="preview-option-text">False</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="preview-bottom-indicator">Page {currentPage + 1} of {totalPages}</div>
          </div>
        </div>

        {/* footer removed - actions moved to header */}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          overflow-y: auto;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .custom-type-modal {
          max-width: 1400px;
        }

        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-light);
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 10;
        }

        .modal-close-btn:hover {
          background: var(--border-light);
          transform: rotate(90deg);
        }

        .modal-header {
          padding: 32px 70px 24px 32px;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .modal-header h2 {
          margin: 0 0 8px 0;
          color: var(--primary-navy);
          font-size: 1.75rem;
        }

        .modal-header p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .header-left {
          flex: 1;
        }

        .header-right {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-input {
          width: 100%;
          border: none;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-navy);
          padding: 8px 0;
          outline: none;
          background: transparent;
        }

        .time-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          padding: 4px 8px;
          border-radius: 14px;
          border: 1px solid var(--border-light);
        }

        .time-input {
          width: 64px;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 6px 8px;
          border-radius: 8px;
          outline: none;
          text-align: center;
        }

        .time-input:focus {
          box-shadow: none;
          border: none;
          background: rgba(0,0,0,0.02);
        }

        .time-unit {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-light);
          background: white;
          cursor: pointer;
          font-weight: 600;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--primary-navy);
          color: white;
          border-color: var(--primary-navy);
        }

        .btn-secondary {
          background: transparent;
          color: var(--text-primary);
        }

        .modal-body {
          padding: 0;
          flex: 1;
          overflow: hidden;
        }

        .two-column-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          height: calc(90vh - 140px);
          overflow: hidden;
        }

        .form-column {
          padding: 24px;
          overflow-y: auto;
          border-right: 1px solid var(--border-light);
          background: #fafafa;
        }

        .preview-column {
          padding: 12px;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .preview-header {
          display: grid;
          grid-template-columns: 40px 1fr 40px;
          align-items: center;
          margin-bottom: 8px;
          gap: 12px;
        }

        .preview-title {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .page-indicator {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .nav-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          background: white;
          color: var(--text-primary);
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .nav-btn:hover:not(:disabled) {
          background: var(--primary-navy);
          color: white;
          border-color: var(--primary-navy);
          transform: scale(1.05);
        }

        .nav-btn:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .nav-btn-left {
          justify-self: start;
        }

        .nav-btn-right {
          justify-self: end;
        }

        .a4-preview-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 12px;
        }

        .a4-page {
          width: 210mm;
          height: 297mm;
          background: white;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
          padding: 20mm;
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.5;
          overflow: hidden;
          transform: scale(0.5);
          transform-origin: center;
          border-radius: 4px;
        }

        .preview-bottom-indicator {
          position: absolute;
          right: 32px;
          bottom: 24px;
          background: rgba(0,0,0,0.04);
          color: var(--text-secondary);
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .a4-header {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #000;
        }

        .a4-header h4 {
          margin: 0 0 8px 0;
          font-size: 16pt;
          font-weight: 700;
          text-align: center;
        }

        .a4-meta {
          display: flex;
          justify-content: space-between;
          font-size: 9pt;
          color: #555;
        }

        .modal-footer {
          padding: 20px 32px;
          border-top: 1px solid var(--border-light);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .form-section {
          margin-bottom: 32px;
        }

        .form-section h3 {
          margin: 0 0 16px 0;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .question-types-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Modern minimal question card */
        .question-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
          transition: all 0.2s ease;
          cursor: grab;
        }

        .question-card:hover {
          border-color: var(--primary-navy);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .question-card.dragging {
          opacity: 0.5;
          cursor: grabbing;
        }

        .question-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #fafafa;
          border-bottom: 1px solid #e0e0e0;
        }

        .drag-handle {
          display: flex;
          align-items: center;
          color: #999;
          cursor: grab;
          padding: 2px;
        }

        .drag-handle:hover {
          color: var(--primary-navy);
        }

        .question-number-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 6px;
          background: var(--primary-navy);
          color: white;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .question-type-select {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
          padding: 4px 8px;
          outline: none;
          cursor: pointer;
        }

        .question-type-select:focus {
          background: white;
          border-radius: 4px;
        }

        .remove-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: #999;
          font-size: 1.4rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
          padding: 0;
          line-height: 1;
        }

        .remove-btn:hover {
          background: #fee;
          color: #c00;
        }

        .question-card-body {
          padding: 12px;
        }

        .compact-controls {
          display: flex;
          gap: 8px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .control-group label {
          font-size: 0.75rem;
          color: #666;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .compact-input {
          width: 100%;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 6px 8px;
          font-size: 0.9rem;
          text-align: center;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s;
        }

        .compact-input:focus {
          border-color: var(--primary-navy);
        }

        .add-question-btn {
          width: 100%;
          padding: 12px;
          border: 2px dashed #d0d0d0;
          background: transparent;
          border-radius: 6px;
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .add-question-btn:hover {
          border-color: var(--primary-navy);
          color: var(--primary-navy);
          background: rgba(0, 51, 102, 0.02);
        }

        .plus-icon {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .input-sm {
          padding: 8px 12px;
          font-size: 0.9rem;
        }

        .config-summary {
          background: white;
          padding: 8px 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .summary-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .summary-value {
          font-size: 0.9rem;
          color: var(--primary-navy);
          font-weight: 700;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 0.85rem;
        }

        .summary-section {
          background: linear-gradient(135deg, var(--bg-light), white);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid var(--border-light);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .summary-stat {
          text-align: center;
          padding: 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid var(--border-light);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary-navy);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* Minimal summary styles */
        .summary-section.minimal {
          padding: 12px;
          background: transparent;
          border: none;
        }

        .summary-row {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: flex-start;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          min-width: 72px;
        }

        .summary-body .stat-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary-navy);
        }

        .summary-body .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin-top: 2px;
        }

        .preview-passages {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #999;
        }

        .preview-passage {
          margin-bottom: 12px;
        }

        .preview-passage strong {
          display: block;
          margin-bottom: 4px;
          font-size: 11pt;
          font-weight: 700;
        }

        .preview-placeholder {
          color: #888;
          font-style: italic;
          font-size: 9pt;
          padding: 6px;
          background: #fafafa;
          border-left: 2px solid #ccc;
          margin: 0;
        }

        .preview-questions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preview-question {
          padding: 8px 0;
          page-break-inside: avoid;
        }

        .preview-question-header {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 6px;
        }

        .preview-q-number {
          font-weight: 700;
          color: #000;
          font-size: 11pt;
          min-width: 20px;
        }

        .preview-q-text {
          flex: 1;
          color: #222;
          font-size: 10pt;
        }

        .preview-q-marks {
          font-size: 9pt;
          color: #666;
          font-style: italic;
          white-space: nowrap;
        }

        .preview-options {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-left: 24px;
          margin-top: 4px;
        }

        .preview-option {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .preview-option-letter {
          font-weight: 600;
          color: #000;
          min-width: 16px;
          font-size: 10pt;
        }

        .preview-option-text {
          color: #444;
          font-size: 10pt;
        }

        .preview-answer-space {
          margin-left: 24px;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .preview-answer-line {
          height: 1px;
          background: #000;
          width: 100%;
        }

        .preview-answer-line.short {
          width: 60%;
        }

        .error-message {
          background: #fee;
          color: #c00;
          border: 1px solid #fcc;
          padding: 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          margin-top: 16px;
        }

        .btn-icon-danger {
          color: #c00;
          border-color: #fcc;
        }

        .btn-icon-danger:hover:not(:disabled) {
          background: #c00;
          color: white;
          border-color: #c00;
        }

        @media (max-width: 1200px) {
          .two-column-layout {
            grid-template-columns: 350px 1fr;
          }

          .a4-page {
            transform: scale(0.4);
          }
        }

        @media (max-width: 968px) {
          .two-column-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }

          .form-column {
            max-height: 40vh;
            border-right: none;
            border-bottom: 1px solid var(--border-light);
          }

          .preview-column {
            max-height: 50vh;
          }

          .a4-page {
            transform: scale(0.35);
          }
        }

        @media (max-width: 768px) {
          .modal-container {
            max-height: 95vh;
          }

          .modal-header {
            padding: 20px;
          }

          .form-column {
            padding: 16px;
          }

          .preview-column {
            padding: 16px;
          }

          .question-type-config {
            grid-template-columns: 1fr 1fr;
          }

          .summary-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .config-summary {
            grid-column: 1 / -1;
          }

          .a4-page {
            transform: scale(0.3);
          }
        }
      `}</style>
    </div>
  )
}
