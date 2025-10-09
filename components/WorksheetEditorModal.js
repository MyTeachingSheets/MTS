import { useState } from 'react'

export default function WorksheetEditorModal({ isOpen, worksheet, onClose, onSave }) {
  const [editedWorksheet, setEditedWorksheet] = useState(worksheet)
  const [activeTab, setActiveTab] = useState('preview') // preview, edit
  const [saving, setSaving] = useState(false)

  if (!isOpen || !worksheet) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(editedWorksheet)
      onClose()
    } catch (err) {
      alert('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateTitle = (title) => {
    setEditedWorksheet({ ...editedWorksheet, title })
  }

  const updateDescription = (description) => {
    setEditedWorksheet({ ...editedWorksheet, description })
  }

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    const newWorksheet = { ...editedWorksheet }
    const content = { ...newWorksheet.content }
    const sections = [...content.sections]
    const section = { ...sections[sectionIndex] }
    const questions = [...section.questions]
    questions[questionIndex] = { ...questions[questionIndex], [field]: value }
    section.questions = questions
    sections[sectionIndex] = section
    content.sections = sections
    newWorksheet.content = content
    setEditedWorksheet(newWorksheet)
  }

  const addQuestion = (sectionIndex) => {
    const newWorksheet = { ...editedWorksheet }
    const content = { ...newWorksheet.content }
    const sections = [...content.sections]
    const section = { ...sections[sectionIndex] }
    const questions = [...section.questions]
    
    const newQuestion = {
      id: `q${Date.now()}`,
      number: questions.length + 1,
      type: 'multiple_choice',
      text: 'New question...',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      marks: 1
    }
    
    questions.push(newQuestion)
    section.questions = questions
    sections[sectionIndex] = section
    content.sections = sections
    newWorksheet.content = content
    setEditedWorksheet(newWorksheet)
  }

  const removeQuestion = (sectionIndex, questionIndex) => {
    if (!confirm('Remove this question?')) return
    
    const newWorksheet = { ...editedWorksheet }
    const content = { ...newWorksheet.content }
    const sections = [...content.sections]
    const section = { ...sections[sectionIndex] }
    const questions = [...section.questions]
    questions.splice(questionIndex, 1)
    
    // Renumber questions
    questions.forEach((q, i) => {
      q.number = i + 1
    })
    
    section.questions = questions
    sections[sectionIndex] = section
    content.sections = sections
    newWorksheet.content = content
    setEditedWorksheet(newWorksheet)
  }

  const renderPreview = () => {
    return (
      <div className="worksheet-preview">
        <div className="preview-header">
          <h2>{editedWorksheet.title}</h2>
          <div className="preview-meta">
            <span><strong>Subject:</strong> {editedWorksheet.subject}</span>
            <span><strong>Grade:</strong> {editedWorksheet.grade}</span>
            {editedWorksheet.domain && <span><strong>Domain:</strong> {editedWorksheet.domain}</span>}
            <span><strong>Type:</strong> {editedWorksheet.type}</span>
          </div>
          <div className="preview-info">
            <span>⏱️ {editedWorksheet.content.estimatedTime} minutes</span>
            <span>📊 Total Marks: {editedWorksheet.content.totalMarks}</span>
          </div>
        </div>

        <div className="preview-instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Read all questions carefully before answering</li>
            <li>Write your answers clearly</li>
            <li>Time limit: {editedWorksheet.content.estimatedTime} minutes</li>
            <li>Total marks: {editedWorksheet.content.totalMarks}</li>
          </ul>
        </div>

        {editedWorksheet.content.sections.map((section, sectionIndex) => (
          <div key={section.id} className="preview-section">
            {section.type === 'questions' && (
              <>
                <h3>{section.title}</h3>
                <div className="questions-list">
                  {section.questions.map((question) => (
                    <div key={question.id} className="question-item">
                      <div className="question-header">
                        <span className="question-number">Q{question.number}.</span>
                        <span className="question-marks">({question.marks} {question.marks === 1 ? 'mark' : 'marks'})</span>
                      </div>
                      <div className="question-text">{question.text}</div>
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="question-options">
                          {question.options.map((option, idx) => (
                            <div key={idx} className="option-item">
                              <span className="option-letter">{String.fromCharCode(65 + idx)})</span>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'short_answer' && (
                        <div className="answer-space">
                          <p>_____________________________________________</p>
                          <p>_____________________________________________</p>
                        </div>
                      )}
                      
                      {question.type === 'essay' && (
                        <div className="answer-space essay-space">
                          {Array(8).fill(0).map((_, i) => (
                            <p key={i}>_____________________________________________</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {section.type === 'passage' && (
              <>
                <h3>Reading Passage: {section.title}</h3>
                <div className="passage-content">
                  {section.content}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderEditor = () => {
    return (
      <div className="worksheet-editor">
        <div className="editor-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              className="input-text"
              value={editedWorksheet.title}
              onChange={(e) => updateTitle(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              className="ai-textarea"
              value={editedWorksheet.description || ''}
              onChange={(e) => updateDescription(e.target.value)}
              rows="2"
            />
          </div>
        </div>

        {editedWorksheet.content.sections.map((section, sectionIndex) => (
          <div key={section.id} className="editor-section">
            {section.type === 'questions' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{section.title}</h3>
                  <button 
                    className="btn-secondary btn-sm" 
                    onClick={() => addQuestion(sectionIndex)}
                  >
                    + Add Question
                  </button>
                </div>
                
                <div className="questions-editor-list">
                  {section.questions.map((question, questionIndex) => (
                    <div key={question.id} className="question-editor-item">
                      <div className="question-editor-header">
                        <span className="question-number">Q{question.number}</span>
                        <button 
                          className="btn-icon-small btn-icon-danger"
                          onClick={() => removeQuestion(sectionIndex, questionIndex)}
                          title="Remove question"
                        >
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="form-group">
                        <label>Question Text</label>
                        <textarea
                          className="input-text"
                          value={question.text}
                          onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'text', e.target.value)}
                          rows="2"
                        />
                      </div>
                      
                      <div className="question-editor-meta">
                        <div className="form-group">
                          <label>Type</label>
                          <select
                            className="input-text input-sm"
                            value={question.type}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="short_answer">Short Answer</option>
                            <option value="essay">Essay</option>
                            <option value="fill_blank">Fill in the Blank</option>
                            <option value="true_false">True/False</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label>Marks</label>
                          <input
                            type="number"
                            className="input-text input-sm"
                            value={question.marks}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'marks', parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </div>
                      </div>
                      
                      {question.type === 'multiple_choice' && (
                        <div className="form-group">
                          <label>Options (one per line)</label>
                          <textarea
                            className="input-text"
                            value={question.options?.join('\n') || ''}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'options', e.target.value.split('\n').filter(o => o.trim()))}
                            rows="4"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container worksheet-editor-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Worksheet Editor</h2>
          <div className="editor-tabs">
            <button 
              className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
              </svg>
              Preview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
              </svg>
              Edit
            </button>
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'preview' ? renderPreview() : renderEditor()}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
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

        .worksheet-editor-modal {
          max-width: 1000px;
          width: 100%;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          display: flex;
          flex-direction: column;
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
          padding: 32px 32px 20px;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          color: var(--primary-navy);
          font-size: 1.75rem;
        }

        .editor-tabs {
          display: flex;
          gap: 8px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid var(--border-light);
          background: white;
          color: var(--text-secondary);
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          background: var(--bg-light);
          border-color: var(--primary-navy);
          color: var(--primary-navy);
        }

        .tab-btn.active {
          background: var(--primary-navy);
          color: white;
          border-color: var(--primary-navy);
        }

        .modal-body {
          padding: 24px 32px;
          flex: 1;
          overflow-y: auto;
        }

        .modal-footer {
          padding: 20px 32px;
          border-top: 1px solid var(--border-light);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        /* Preview Styles */
        .worksheet-preview {
          font-family: 'Times New Roman', Times, serif;
          max-width: 800px;
          margin: 0 auto;
        }

        .preview-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #000;
        }

        .preview-header h2 {
          margin: 0 0 16px 0;
          font-size: 1.8rem;
          color: #000;
        }

        .preview-meta {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 12px;
          font-size: 0.95rem;
        }

        .preview-info {
          display: flex;
          justify-content: center;
          gap: 24px;
          font-size: 0.9rem;
          color: #666;
        }

        .preview-instructions {
          background: #f9f9f9;
          padding: 16px;
          margin-bottom: 24px;
          border-left: 4px solid var(--primary-navy);
        }

        .preview-instructions h3 {
          margin: 0 0 12px 0;
          font-size: 1.1rem;
        }

        .preview-instructions ul {
          margin: 0;
          padding-left: 24px;
        }

        .preview-instructions li {
          margin-bottom: 6px;
        }

        .preview-section {
          margin-bottom: 32px;
        }

        .preview-section h3 {
          margin: 0 0 16px 0;
          font-size: 1.3rem;
          color: var(--primary-navy);
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .question-item {
          page-break-inside: avoid;
        }

        .question-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .question-number {
          font-weight: 700;
          font-size: 1rem;
        }

        .question-marks {
          font-size: 0.85rem;
          color: #666;
          font-style: italic;
        }

        .question-text {
          margin-bottom: 12px;
          font-size: 1rem;
          line-height: 1.6;
        }

        .question-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-left: 24px;
        }

        .option-item {
          display: flex;
          gap: 8px;
        }

        .option-letter {
          font-weight: 600;
          min-width: 24px;
        }

        .answer-space {
          margin-top: 12px;
        }

        .answer-space p {
          margin: 6px 0;
          color: #ccc;
        }

        .essay-space p {
          margin: 10px 0;
        }

        .passage-content {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          line-height: 1.8;
          font-size: 1rem;
        }

        /* Editor Styles */
        .worksheet-editor {
          max-width: 800px;
          margin: 0 auto;
        }

        .editor-section {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-light);
        }

        .editor-section:last-child {
          border-bottom: none;
        }

        .editor-section h3 {
          margin: 0 0 16px 0;
          color: var(--primary-navy);
          font-size: 1.2rem;
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

        .btn-sm {
          padding: 8px 16px;
          font-size: 0.85rem;
        }

        .questions-editor-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .question-editor-item {
          background: var(--bg-light);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 16px;
        }

        .question-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .question-editor-meta {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 12px;
        }

        .input-sm {
          padding: 8px 12px;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .modal-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .editor-tabs {
            width: 100%;
          }

          .tab-btn {
            flex: 1;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding-left: 20px;
            padding-right: 20px;
          }

          .preview-meta {
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .question-editor-meta {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
