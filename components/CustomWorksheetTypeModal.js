import { useState } from 'react'

export default function CustomWorksheetTypeModal({ isOpen, onClose, onSave }) {
  const [typeName, setTypeName] = useState('')
  const [description, setDescription] = useState('')
  const [includePassages, setIncludePassages] = useState(false)
  const [passageCount, setPassageCount] = useState(1)
  const [estimatedTime, setEstimatedTime] = useState(30)
  
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
      const worksheetTypeData = {
        name: typeName,
        description: description,
        is_custom: true,
        default_config: {
          question_types: questionTypes.map(qt => ({
            type: qt.type,
            count: qt.count,
            marks: qt.marks,
            ...qt.options
          })),
          include_passages: includePassages,
          passages_count: includePassages ? passageCount : 0,
          total_marks: calculateTotalMarks(),
          estimated_time: estimatedTime
        }
      }

      await onSave(worksheetTypeData)
      
      // Reset form
      setTypeName('')
      setDescription('')
      setIncludePassages(false)
      setPassageCount(1)
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container custom-type-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Create Custom Worksheet Type</h2>
          <p>Define a reusable worksheet template with custom question types and structure</p>
        </div>

        <div className="modal-body">
          {/* Basic Info */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Worksheet Type Name *</label>
              <input
                type="text"
                className="input-text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="e.g., Reading Comprehension Quiz"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="ai-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this worksheet type..."
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Estimated Time (minutes)</label>
              <input
                type="number"
                className="input-text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                min="1"
                max="180"
              />
            </div>
          </div>

          {/* Question Types */}
          <div className="form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Question Types</h3>
              <button className="btn-secondary btn-sm" onClick={addQuestionType}>
                + Add Question Type
              </button>
            </div>

            <div className="question-types-list">
              {questionTypes.map((qt, index) => (
                <div key={qt.id} className="question-type-item">
                  <div className="question-type-header">
                    <span className="question-type-number">{index + 1}</span>
                    <select
                      className="input-text"
                      value={qt.type}
                      onChange={(e) => updateQuestionType(qt.id, 'type', e.target.value)}
                    >
                      {QUESTION_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {questionTypes.length > 1 && (
                      <button 
                        className="btn-icon-small btn-icon-danger" 
                        onClick={() => removeQuestionType(qt.id)}
                        title="Remove"
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="question-type-config">
                    <div className="config-item">
                      <label>Question Count</label>
                      <input
                        type="number"
                        className="input-text input-sm"
                        value={qt.count}
                        onChange={(e) => updateQuestionType(qt.id, 'count', parseInt(e.target.value) || 0)}
                        min="1"
                        max="100"
                      />
                    </div>

                    <div className="config-item">
                      <label>Marks Each</label>
                      <input
                        type="number"
                        className="input-text input-sm"
                        value={qt.marks}
                        onChange={(e) => updateQuestionType(qt.id, 'marks', parseInt(e.target.value) || 1)}
                        min="1"
                        max="20"
                      />
                    </div>

                    {hasOptions(qt.type) && (
                      <div className="config-item">
                        <label>Options Count</label>
                        <input
                          type="number"
                          className="input-text input-sm"
                          value={qt.options?.optionsCount || 4}
                          onChange={(e) => updateQuestionTypeOption(qt.id, 'optionsCount', parseInt(e.target.value) || 4)}
                          min="2"
                          max="10"
                        />
                      </div>
                    )}

                    <div className="config-item config-summary">
                      <span className="summary-label">Subtotal:</span>
                      <span className="summary-value">{qt.count * qt.marks} marks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Passages */}
          <div className="form-section">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includePassages}
                  onChange={(e) => setIncludePassages(e.target.checked)}
                />
                <span>Include Reading Passages</span>
              </label>
            </div>

            {includePassages && (
              <div className="form-group">
                <label>Number of Passages</label>
                <input
                  type="number"
                  className="input-text"
                  value={passageCount}
                  onChange={(e) => setPassageCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max="5"
                />
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="form-section summary-section">
            <h3>Summary</h3>
            <div className="summary-grid">
              <div className="summary-stat">
                <div className="stat-value">{questionTypes.reduce((sum, qt) => sum + qt.count, 0)}</div>
                <div className="stat-label">Total Questions</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">{calculateTotalMarks()}</div>
                <div className="stat-label">Total Marks</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">{estimatedTime}</div>
                <div className="stat-label">Minutes</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Creating...' : 'Create Worksheet Type'}
          </button>
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
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .custom-type-modal {
          max-width: 900px;
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
          padding: 32px 32px 24px;
          border-bottom: 1px solid var(--border-light);
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

        .modal-body {
          padding: 24px 32px;
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
          gap: 12px;
        }

        .question-type-item {
          background: var(--bg-light);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 16px;
        }

        .question-type-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .question-type-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: white;
          border: 2px solid var(--primary-navy);
          border-radius: 50%;
          color: var(--primary-navy);
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .question-type-header select {
          flex: 1;
        }

        .question-type-config {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }

        .config-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .config-item label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
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

        .error-message {
          background: #fee;
          color: #c00;
          border: 1px solid #fcc;
          padding: 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .modal-container {
            max-height: 95vh;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding-left: 20px;
            padding-right: 20px;
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
        }
      `}</style>
    </div>
  )
}
