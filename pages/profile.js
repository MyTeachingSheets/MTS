import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [username, setUsername] = useState('')
  const [savingUsername, setSavingUsername] = useState(false)
  const [usernameMessage, setUsernameMessage] = useState(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!mounted) return
  setUser(session?.user ?? null)
  // Pre-fill username from metadata
  setUsername(session?.user?.user_metadata?.username ?? '')
      } catch (err) {
        console.error('Could not get session', err)
        if (!mounted) return
        setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      try {
        data.subscription.unsubscribe()
      } catch (e) {}
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    // Redirect to home page where AuthModal will be available
    window.location.href = '/'
  }

  async function handleAvatarUpload(event) {
    try {
      setUploading(true)
      setUploadError(null)
      setUploadSuccess(false)

      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload an image file')
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setUploadError('Image must be less than 2MB')
        return
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) throw updateError

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)

      // Reload user data to show new avatar
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveUsername() {
    // Basic client-side validation: 3-30 chars, letters, numbers, _, -
    setUsernameMessage(null)
    const trimmed = (username || '').trim()
    if (trimmed.length < 3 || trimmed.length > 30) {
      setUsernameMessage({ type: 'error', text: 'Username must be 3–30 characters long.' })
      return
    }
    if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
      setUsernameMessage({ type: 'error', text: 'Username may only contain letters, numbers, underscores and dashes.' })
      return
    }

    try {
      setSavingUsername(true)
      const { error } = await supabase.auth.updateUser({ data: { username: trimmed } })
      if (error) throw error

      // Refresh session/user info
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      setUsernameMessage({ type: 'success', text: 'Username updated successfully.' })
      setTimeout(() => setUsernameMessage(null), 3000)
    } catch (err) {
      console.error('Update username error', err)
      setUsernameMessage({ type: 'error', text: err.message || 'Failed to update username' })
    } finally {
      setSavingUsername(false)
    }
  }

  if (loading) return (
    <div className="content-section" style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'var(--text-secondary)'}}>Loading profile…</p>
    </div>
  )

  if (!user)
    return (
      <div className="content-section" style={{minHeight:'60vh'}}>
        <div style={{maxWidth:600,margin:'0 auto',textAlign:'center',padding:'40px 20px'}}>
          <h2 style={{fontSize:'2rem',marginBottom:16}}>No user signed in</h2>
          <p style={{color:'var(--text-secondary)',marginBottom:24}}>
            Please log in or create an account to view your profile.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center'}}>
            <a href="/?auth=login" className="btn">Log In</a>
            <a href="/?auth=register" className="btn btn-secondary">Sign Up</a>
          </div>
        </div>
      </div>
    )

  return (
    <div className="content-section" style={{minHeight:'60vh'}}>
      <div style={{maxWidth:800,margin:'0 auto',background:'white',padding:40,borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-md)',border:'1px solid var(--border-light)'}}>
        <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:32}}>
          <div className="profile-avatar-section">
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="profile-avatar-large"
              />
            ) : (
              <div className="profile-avatar-large profile-avatar-placeholder">
                {user.email[0].toUpperCase()}
              </div>
            )}
            <label className="avatar-upload-btn">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                disabled={uploading}
                style={{display:'none'}}
              />
              {uploading ? 'Uploading...' : 'Change Photo'}
            </label>
          </div>
          <div style={{flex:1}}>
            <h2 style={{margin:'0 0 8px 0',fontSize:'1.75rem'}}>My Profile</h2>
            <p style={{margin:0,color:'var(--text-secondary)'}}>Manage your account settings</p>
            
            {uploadError && (
              <div className="upload-message error" style={{marginTop:12}}>
                ❌ {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="upload-message success" style={{marginTop:12}}>
                ✓ Avatar updated successfully!
              </div>
            )}
          </div>
        </div>
        
        <div style={{marginBottom:24}}>
          <label style={{display:'block',fontWeight:600,marginBottom:8,color:'var(--text-primary)'}}>Email</label>
          <div style={{padding:12,background:'var(--bg-light)',borderRadius:'var(--radius-sm)',color:'var(--text-secondary)'}}>{user.email}</div>
        </div>

        <div style={{marginBottom:24}}>
          <label style={{display:'block',fontWeight:600,marginBottom:8,color:'var(--text-primary)'}}>Username</label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-text"
              style={{padding:10,borderRadius:'var(--radius-sm)',border:'1px solid var(--border-light)',flex:1}}
              placeholder="choose-a-username"
            />
            <button onClick={handleSaveUsername} disabled={savingUsername} className="btn" style={{whiteSpace:'nowrap'}}>
              {savingUsername ? 'Saving...' : 'Save'}
            </button>
          </div>
          {usernameMessage && (
            <div className={`upload-message ${usernameMessage.type === 'error' ? 'error' : 'success'}`} style={{marginTop:12}}>
              {usernameMessage.type === 'error' ? '❌ ' : '✓ '}{usernameMessage.text}
            </div>
          )}
        </div>

        <div style={{marginBottom:24}}>
          <label style={{display:'block',fontWeight:600,marginBottom:8,color:'var(--text-primary)'}}>Account Status</label>
          <div style={{padding:12,background:'var(--bg-light)',borderRadius:'var(--radius-sm)',color:'var(--tpt-green)',fontWeight:600}}>✓ Active</div>
        </div>

        <button onClick={handleLogout} className="btn-danger" style={{marginTop:32}}>
          Log Out
        </button>
      </div>
    </div>
  )
}
