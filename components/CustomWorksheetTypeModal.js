import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

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
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [dragOverPosition, setDragOverPosition] = useState(null) // 'above' | 'below'
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [openCardMenu, setOpenCardMenu] = useState(null)
  const [cardMenuPos, setCardMenuPos] = useState({ x: 0, y: 0, id: null })

  // --- Pagination by real DOM height (measurer) ---
  const [measuredPages, setMeasuredPages] = useState([[]])
  const measureRootRef = useRef(null)

  const MM_PAGE_HEIGHT = 297
  const MM_PAGE_PADDING_TOTAL = 14 * 2 // match your visible page padding (mm)
  const PX_PER_INCH = 96
  const MM_PER_INCH = 25.4
  const pxToMm = (px) => (px * MM_PER_INCH) / PX_PER_INCH

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

  // Close card menu when clicking outside or pressing Escape
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onDocClick = (e) => {
      if (!openCardMenu) return
      const target = e.target
      if (target.closest && (target.closest('.card-menu') || target.closest('.dot-btn'))) return
      setOpenCardMenu(null)
    }

    const onKey = (e) => {
      if (e.key === 'Escape') setOpenCardMenu(null)
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('touchstart', onDocClick)
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('touchstart', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [openCardMenu])

  // Close Add Question Type menu when clicking outside or pressing Escape
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!addMenuOpen) return

    const onDocClick = (e) => {
      const target = e.target
      if (target.closest && (target.closest('.add-menu') || target.closest('.add-question-btn'))) return
      setAddMenuOpen(false)
    }

    const onKey = (e) => {
      if (e.key === 'Escape') setAddMenuOpen(false)
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('touchstart', onDocClick)
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('touchstart', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [addMenuOpen])

  const QUESTION_TYPE_OPTIONS = [
    { value: 'multiple_choice', label: 'Multiple Choice', hasOptions: true },
    { value: 'short_answer', label: 'Short Answer', hasOptions: false },
    { value: 'essay', label: 'Essay', hasOptions: false },
    { value: 'fill_blank', label: 'Fill in the Blank', hasOptions: false },
    { value: 'true_false', label: 'True/False', hasOptions: false },
    { value: 'matching', label: 'Matching', hasOptions: true }
  ]

  // Note: we must not return early here because hooks below must run on every render.
  // The early return will be applied right before the JSX return so hooks remain stable.

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

  const addQuestionItemOfType = (type) => {
    const item = { id: Date.now(), type, marks: 1, count: 1, options: hasOptions(type) ? { optionsCount: 4 } : {} }
    setQuestionItems([...questionItems, item])
    setAddMenuOpen(false)
  }

  const removeQuestionItem = (id) => {
    setQuestionItems(questionItems.filter(q => q.id !== id))
  }

  const updateQuestionItem = (id, field, value) => {
    setQuestionItems(questionItems.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  // Drag-and-drop handlers
  const handleDragStart = (e, item, index) => {
    setDraggedItem(item)
    setDragOverIndex(null)
    setDragOverPosition(null)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, _item, index) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const position = offsetY > rect.height / 2 ? 'below' : 'above'
    setDragOverIndex(index)
    setDragOverPosition(position)
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, _targetItem, targetIndex) => {
    e.preventDefault()
    if (!draggedItem) return

    const draggedIndex = questionItems.findIndex(q => q.id === draggedItem.id)
    if (draggedIndex === -1) return

    // Calculate new index after removing dragged item
    let newItems = [...questionItems]
    // remove dragged
    newItems.splice(draggedIndex, 1)

    // Adjust targetIndex to account for removal if necessary
    let adjTargetIndex = targetIndex
    if (draggedIndex < targetIndex) adjTargetIndex = targetIndex - 1

    const insertIndex = dragOverPosition === 'below' ? adjTargetIndex + 1 : adjTargetIndex

    // Bound insertIndex
    const boundedIndex = Math.max(0, Math.min(newItems.length, insertIndex))

    newItems.splice(boundedIndex, 0, draggedItem)

    setQuestionItems(newItems)
    setDraggedItem(null)
    setDragOverIndex(null)
    setDragOverPosition(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
    setDragOverPosition(null)
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

  // DOM-measured pagination: use a hidden, unscaled measurer to compute real heights
  const recomputePagination = useCallback(() => {
    if (!measureRootRef.current) return

    // Measure header height
    const headerEl = measureRootRef.current.querySelector('.a4-header')
    const headerPx = headerEl ? headerEl.getBoundingClientRect().height : 0
    const headerMm = pxToMm(headerPx)

    // Measure each question height
    const qEls = Array.from(measureRootRef.current.querySelectorAll('.preview-question'))
    const allQuestions = generatePreview()
    const questionsWithHeights = qEls.map((el, idx) => ({
      ...allQuestions[idx],
      _hmm: pxToMm(el.getBoundingClientRect().height)
    }))

    // Read computed gap (row-gap) from the preview-questions container and convert to mm
    const listEl = measureRootRef.current.querySelector('.preview-questions')
    const listStyle = listEl ? window.getComputedStyle(listEl) : null
    const gapPx = listStyle ? parseFloat(listStyle.rowGap || listStyle.gap || '0') : 0
    const gapMm = pxToMm(gapPx)

    // Space per page (add small safety buffer to avoid rounding/scale clipping)
    const RESERVED_BOTTOM = 10 // small safety buffer (mm)
    const SAFETY_BUFFER = 3 // extra rounding buffer (~3mm)
    const availablePerPage = Math.max(
      40,
      MM_PAGE_HEIGHT - MM_PAGE_PADDING_TOTAL - headerMm - RESERVED_BOTTOM - SAFETY_BUFFER
    )

    // Build pages
    const pages = []
    let cur = []
    let used = 0

    for (const q of questionsWithHeights) {
      const h = q._hmm
      const extraGap = cur.length ? gapMm : 0 // gap before every item except the first on a page

      if (h >= availablePerPage) {         // huge block: own page
        if (cur.length) pages.push(cur)
        pages.push([q])
        cur = []
        used = 0
        continue
      }

      if (used + extraGap + h <= availablePerPage) {  // fits current page
        used += extraGap + h
        cur.push(q)
      } else {                             // push to next page
        pages.push(cur)
        cur = [q]
        used = h // first item on a new page has no preceding gap
      }
    }
    if (cur.length) pages.push(cur)

    setMeasuredPages(pages.length ? pages : [[]])
    setCurrentPage((prev) => Math.min(prev, Math.max(0, (pages.length || 1) - 1)))
  }, [typeName, estimatedTime, questionItems, questionTypes, addIndividually])

  useLayoutEffect(() => {
    recomputePagination()
  }, [recomputePagination])

  useEffect(() => {
    const ro = new ResizeObserver(() => recomputePagination())
    if (measureRootRef.current) ro.observe(measureRootRef.current)

    const onResize = () => recomputePagination()
    window.addEventListener('resize', onResize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [recomputePagination])

  const pages = measuredPages
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

  if (!isOpen) return null

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
                <div key={qi.id} className="question-card-wrapper">
                  {dragOverIndex === idx && dragOverPosition === 'above' && (
                    <div className="drop-indicator above" />
                  )}

                  <div
                    className={`question-card ${draggedItem?.id === qi.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, qi, idx)}
                    onDragOver={(e) => handleDragOver(e, qi, idx)}
                    onDrop={(e) => handleDrop(e, qi, idx)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="question-card-header simple">
                      <span className="question-number-badge small">{idx + 1}</span>

                      <div className="question-type-label" aria-hidden>
                        {getQuestionTypeLabel(qi.type)}
                      </div>

                      {/* three-dot menu button aligned right */}
                      <button
                        className="dot-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextOpen = openCardMenu === qi.id ? null : qi.id
                          setOpenCardMenu(nextOpen)
                          if (nextOpen) {
                            const rect = e.currentTarget.getBoundingClientRect()
                            // position menu to the right of the button so it appears outside the card
                            setCardMenuPos({ x: rect.right, y: rect.top, id: qi.id })
                          }
                        }}
                        aria-haspopup="true"
                        aria-expanded={openCardMenu === qi.id}
                        title="Options"
                      >
                        ⋮
                      </button>

                      {/* close button to the right of the three-dot, removes this question type */}
                      <button
                        className="close-btn"
                        onClick={(e) => { e.stopPropagation(); removeQuestionItem(qi.id) }}
                        title="Remove question type"
                        aria-label="Remove question type"
                      >
                        ×
                      </button>

                      {openCardMenu === qi.id && typeof document !== 'undefined' && createPortal(
                        <div
                          className="card-menu"
                          role="menu"
                          onClick={(e) => e.stopPropagation()}
                          style={{ position: 'fixed', top: (cardMenuPos.y || 0) + 8 + 'px', left: (cardMenuPos.x || 0) + 8 + 'px' }}
                        >
                          <label className="card-menu-row">
                            <span>Count</span>
                            <input type="number" min="1" max="100" value={qi.count || 1} onChange={(e) => updateQuestionItem(qi.id, 'count', parseInt(e.target.value) || 1)} />
                          </label>

                          <label className="card-menu-row">
                            <span>Marks</span>
                            <input type="number" min="1" value={qi.marks} onChange={(e) => updateQuestionItem(qi.id, 'marks', parseInt(e.target.value) || 1)} />
                          </label>

                          {hasOptions(qi.type) && (
                            <label className="card-menu-row">
                              <span>Options</span>
                              <input type="number" min="2" max="10" value={qi.options?.optionsCount || 4} onChange={(e) => updateQuestionItem(qi.id, 'options', { optionsCount: parseInt(e.target.value) || 4 })} />
                            </label>
                          )}

                          
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>

                  {dragOverIndex === idx && dragOverPosition === 'below' && (
                    <div className="drop-indicator below" />
                  )}
                </div>
              ))}

              <div className="add-menu-wrapper">
                <button className="add-question-btn" onClick={() => setAddMenuOpen(!addMenuOpen)} aria-haspopup="true" aria-expanded={addMenuOpen}>
                  <span className="plus-icon">+</span>
                  Add question type
                </button>
                {addMenuOpen && (
                  <div className="add-menu" role="menu">
                    {QUESTION_TYPE_OPTIONS.map(opt => (
                      <button key={opt.value} className="add-menu-item" onClick={() => addQuestionItemOfType(opt.value)} role="menuitem">
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

        {/* HIDDEN MEASURER (1:1 scale, invisible) - used to compute real heights for pagination */}
        <div
          ref={measureRootRef}
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            top: 0,
            left: 0,
            width: '210mm',
            height: 'auto',
            padding: '14mm',
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: '11pt',
            lineHeight: 1.5,
            // ensure the measurer uses the same stacking so measurements match
            boxSizing: 'border-box'
          }}
        >
          <div className="a4-header">
            <h4>{typeName || '[Worksheet Name]'}</h4>
            <div className="a4-meta">
              <span>Time: {estimatedTime} min</span>
              <span>Total: {calculateTotalMarks()} marks</span>
            </div>
          </div>

          <div className="preview-questions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {generatePreview().map((q) => (
              <div key={`m-${q.number}`} className="preview-question" style={{ padding: '8px 0' }}>
                <div className="preview-question-header">
                  <span className="preview-q-number">{q.number}.</span>
                  <span className="preview-q-text">{q.text}</span>
                  <span className="preview-q-marks">({q.marks})</span>
                </div>

                {hasOptions(q.type) && (
                  <div className="preview-options">
                    {Array.from({ length: q.optionsCount }).map((_, i) => (
                      <div key={i} className="preview-option">
                        <span className="preview-option-letter">{String.fromCharCode(97 + i)}.</span>
                        <span className="preview-option-text">Option {i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div className="preview-answer-space"><div className="preview-answer-line" /></div>
                )}

                {q.type === 'essay' && (
                  <div className="preview-answer-space">
                    <div className="preview-answer-line" />
                    <div className="preview-answer-line" />
                    <div className="preview-answer-line" />
                  </div>
                )}

                {q.type === 'fill_blank' && (
                  <div className="preview-answer-space"><div className="preview-answer-line short" /></div>
                )}

                {q.type === 'true_false' && (
                  <div className="preview-options">
                    <div className="preview-option"><span className="preview-option-letter">a.</span><span className="preview-option-text">True</span></div>
                    <div className="preview-option"><span className="preview-option-letter">b.</span><span className="preview-option-text">False</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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
          top: 18px;
          right: 28px; /* nudge slightly inward while header reserves space */
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
          padding: 24px 80px 16px 20px; /* reserve right space so close button doesn't overlap actions */
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
          grid-template-columns: 320px 1fr; /* slightly narrower left column */
          height: calc(90vh - 140px);
          overflow: hidden;
        }

        .form-column {
          padding: 8px 14px 20px 14px; /* reduce top and side padding so content starts near header */
          overflow-y: auto;
          border-right: 1px solid rgba(0,0,0,0.06);
          background: linear-gradient(180deg, #f8f9fa, #ffffff);
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
          margin-bottom: 0; /* remove extra top space so preview fills more */
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
          position: absolute; /* float over preview */
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
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
          left: 18px;
        }

        .nav-btn-right {
          right: 18px;
        }

        .a4-preview-container {
          flex: 1;
          display: flex;
          align-items: flex-start; /* align to top so spacing is consistent */
          justify-content: center;
          overflow: hidden;
          padding-top: 18px; /* add gap between header and paper */
        }

        .a4-page {
          width: 210mm;
          height: 297mm;
          background: white;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          padding: 14mm;
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.5;
          overflow: hidden;
          transform: scale(0.58);
          transform-origin: top center; /* keep paper anchored to top when scaled */
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
          margin: 0 0 16px 0; /* remove top margin so sections start immediately */
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
          gap: 10px;
          margin-top: 0; /* ensure list starts at top of section */
        }

        /* Modern minimal question card */
        .question-card {
          background: white;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          cursor: grab;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .question-card:hover {
          border-color: rgba(0,51,102,0.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        .question-card.dragging {
          opacity: 0.6;
          cursor: grabbing;
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .question-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: linear-gradient(180deg, #fafbfc, #ffffff);
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }

        .question-card-header.simple {
          position: relative;
        }

        .drag-handle {
          display: flex;
          align-items: center;
          color: rgba(0,0,0,0.15);
          cursor: grab;
          padding: 2px;
          transition: color 0.2s;
          opacity: 0;
        }

        .question-card:hover .drag-handle {
          opacity: 1;
        }

        .drag-handle:hover {
          color: var(--primary-navy);
        }

        .question-number-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          background: linear-gradient(135deg, var(--primary-navy), #0066cc);
          color: white;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0,51,102,0.15);
        }

        .question-number-badge.small {
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .question-type-select {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          padding: 6px 10px;
          outline: none;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.15s;
        }

        .question-type-select:hover {
          background: rgba(0,0,0,0.02);
        }

        .question-type-select:focus {
          background: rgba(0,51,102,0.04);
          outline: 2px solid rgba(0,51,102,0.1);
        }

        .question-type-label {
          background: rgba(0,0,0,0.03);
          padding: 6px 10px;
          border-radius: 8px;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .remove-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: rgba(0,0,0,0.25);
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.15s;
          padding: 0;
          line-height: 1;
        }

        .remove-btn:hover {
          background: #ffebee;
          color: #d32f2f;
          transform: scale(1.1);
        }

        .question-card-body {
          padding: 14px 16px;
        }

        .compact-controls {
          display: flex;
          gap: 10px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .control-group label {
          font-size: 0.7rem;
          color: rgba(0,0,0,0.5);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .compact-input {
          width: 100%;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 0.95rem;
          text-align: center;
          font-weight: 700;
          outline: none;
          transition: all 0.15s;
          background: #fafbfc;
        }

        .compact-input.inline {
          width: 56px;
          padding: 6px 8px;
          font-size: 0.9rem;
          margin-left: 6px;
        }

        .compact-input.inline.small {
          width: 48px;
          padding: 6px 8px;
          font-size: 0.88rem;
        }

        .inline-controls {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: 8px;
        }

        .question-card-header.simple {
          padding: 10px 12px;
        }

        .compact-input:hover {
          border-color: rgba(0,51,102,0.2);
          background: white;
        }

        .compact-input:focus {
          border-color: var(--primary-navy);
          background: white;
          box-shadow: 0 0 0 3px rgba(0,51,102,0.08);
        }

        .question-card-wrapper {
          position: relative;
        }

        .drop-indicator {
          height: 8px;
          margin: 6px 0;
          transition: all 0.12s ease;
        }

        .drop-indicator.above::after,
        .drop-indicator.below::after {
          content: '';
          display: block;
          height: 2px;
          background: var(--primary-navy);
          width: 100%;
          border-radius: 2px;
          opacity: 0.9;
        }

        .add-question-btn {
          width: 100%;
          padding: 8px 10px;
          border: 1px dashed rgba(0,0,0,0.08);
          background: transparent;
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.12s ease-in-out;
        }

        .add-question-btn:hover {
          border-color: rgba(0,0,0,0.12);
          color: var(--text-primary);
          background: rgba(0,0,0,0.02);
        }

        .plus-icon {
          width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: var(--primary-navy);
          border-radius: 4px;
          font-weight: 700;
        }

        .add-question-btn .chev {
          display: inline-block;
          margin-left: 6px;
          width: 10px;
          height: 10px;
          border-right: 2px solid rgba(0,0,0,0.35);
          border-bottom: 2px solid rgba(0,0,0,0.35);
          transform: rotate(45deg);
          opacity: 0.7;
        }

        .plus-icon {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .add-menu-wrapper {
          position: relative;
          display: inline-block;
        }

        .add-menu {
          position: absolute;
          top: 48px;
          left: 0;
          background: white;
          border: 1px solid rgba(15,23,42,0.06);
          box-shadow: 0 10px 30px rgba(20,30,50,0.08);
          border-radius: 12px;
          padding: 8px;
          z-index: 40;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 200px;
        }

        .add-menu-item {
          background: transparent;
          border: none;
          text-align: left;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .add-menu-item::before {
          content: '';
          display: inline-block;
          width: 10px;
          height: 10px;
          background: rgba(0,0,0,0.06);
          border-radius: 3px;
          flex-shrink: 0;
        }

        .add-menu-item:hover {
          background: rgba(0,51,102,0.06);
          transform: translateX(4px);
        }

        .add-menu-item:focus {
          outline: 2px solid rgba(0,51,102,0.12);
        }

        .dot-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          font-size: 1.1rem;
          color: rgba(0,0,0,0.6);
          cursor: pointer;
          position: absolute;
          right: 8px; /* keep the button close to the card edge */
          top: 50%;
          transform: translateY(-50%);
        }

        .close-btn {
          position: absolute;
          right: 44px; /* place to the left of dot-btn */
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: rgba(200,40,40,0.9);
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(200,40,40,0.06);
        }

        .dot-btn:hover {
          background: rgba(0,0,0,0.03);
          color: rgba(0,0,0,0.8);
        }

        .card-menu {
          background: white;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 10px;
          padding: 8px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 9999;
          min-width: 180px;
        }

        .card-menu-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .card-menu-row input {
          width: 72px;
          padding: 6px 8px;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 6px;
        }

        /* .card-menu-actions removed to avoid extra trailing space in the card menu */

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
            grid-template-columns: 320px 1fr;
          }

          .a4-page {
            transform: scale(0.48);
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
            transform: scale(0.44);
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
