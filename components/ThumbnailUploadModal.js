import { useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ThumbnailUploadModal({ isOpen, worksheet, onClose, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen || !worksheet) return null

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError('')
    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setUploading(true)
    setError('')

    try {
      // TODO: Uncomment when Supabase is configured
      // const fileExt = selectedFile.name.split('.').pop()
      // const fileName = `${worksheet.id}_${Date.now()}.${fileExt}`
      // const filePath = `worksheets/${fileName}`

      // // Upload to Supabase Storage
      // const { error: uploadError } = await supabase.storage
      //   .from('worksheet-thumbnails')
      //   .upload(filePath, selectedFile, {
      //     cacheControl: '3600',
      //     upsert: false
      //   })

      // if (uploadError) throw uploadError

      // // Get public URL
      // const { data: { publicUrl } } = supabase.storage
      //   .from('worksheet-thumbnails')
      //   .getPublicUrl(filePath)

      // // Update worksheet with thumbnail URL
      // const { error: updateError } = await supabase
      //   .from('worksheets')
      //   .update({ 
      //     thumbnail_url: publicUrl,
      //     thumbnail_uploaded: true 
      //   })
      //   .eq('id', worksheet.id)

      // if (updateError) throw updateError

      // Simulate upload for now
      await new Promise(resolve => setTimeout(resolve, 1500))

      onUploadComplete(worksheet.id, previewUrl)
      
      // Reset state
      setSelectedFile(null)
      setPreviewUrl(null)
      
      onClose()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload thumbnail: ' + (err.message || 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container thumbnail-upload-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Upload Worksheet Thumbnail</h2>
          <p>Add an eye-catching thumbnail for your worksheet</p>
        </div>

        <div className="modal-body">
          <div className="upload-section">
            <div className="worksheet-info-card">
              <h4>{worksheet.title}</h4>
              <div className="info-meta">
                <span>{worksheet.subject}</span>
                <span>•</span>
                <span>{worksheet.grade}</span>
                <span>•</span>
                <span>{worksheet.type}</span>
              </div>
            </div>

            {!previewUrl ? (
              <div className="upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="thumbnail-upload"
                />
                <label htmlFor="thumbnail-upload" className="upload-label">
                  <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                    <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                  </svg>
                  <span className="upload-text">Click to upload image</span>
                  <span className="upload-hint">JPG, PNG, GIF up to 5MB</span>
                </label>
              </div>
            ) : (
              <div className="preview-section">
                <div className="preview-container">
                  <img src={previewUrl} alt="Thumbnail preview" />
                </div>
                <button className="btn-remove" onClick={handleRemove}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                  </svg>
                  Remove Image
                </button>
              </div>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}

            <div className="upload-tips">
              <h4>💡 Tips for Great Thumbnails:</h4>
              <ul>
                <li>Use high-quality, clear images</li>
                <li>Recommended size: 1200×630 pixels (16:9 ratio)</li>
                <li>Include relevant educational graphics or subject matter</li>
                <li>Avoid cluttered or text-heavy images</li>
                <li>Make sure the image represents the worksheet content</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button 
            className="btn" 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              'Upload Thumbnail'
            )}
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
        }

        .thumbnail-upload-modal {
          max-width: 600px;
          width: 100%;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
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

        .worksheet-info-card {
          background: var(--bg-light);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          border: 1px solid var(--border-light);
        }

        .worksheet-info-card h4 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .info-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .upload-area {
          margin-bottom: 24px;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          border: 2px dashed var(--border-light);
          border-radius: 12px;
          background: var(--bg-light);
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-label:hover {
          border-color: var(--primary-navy);
          background: white;
        }

        .upload-label svg {
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .upload-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .upload-hint {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .preview-section {
          margin-bottom: 24px;
        }

        .preview-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-light);
          margin-bottom: 16px;
          border: 2px solid var(--border-light);
        }

        .preview-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          background: #fee;
          color: #c00;
          border: 1px solid #fcc;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-remove:hover {
          background: #fcc;
        }

        .error-message {
          background: #fee;
          color: #c00;
          border: 1px solid #fcc;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }

        .upload-tips {
          background: #e8f5e9;
          border: 1px solid #a5d6a7;
          border-radius: 8px;
          padding: 16px;
        }

        .upload-tips h4 {
          margin: 0 0 12px 0;
          color: #2e7d32;
          font-size: 0.95rem;
        }

        .upload-tips ul {
          margin: 0;
          padding-left: 20px;
          color: #2e7d32;
        }

        .upload-tips li {
          font-size: 0.85rem;
          line-height: 1.8;
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

        @media (max-width: 768px) {
          .modal-header,
          .modal-body,
          .modal-footer {
            padding-left: 20px;
            padding-right: 20px;
          }

          .upload-label {
            padding: 32px 16px;
          }
        }
      `}</style>
    </div>
  )
}
