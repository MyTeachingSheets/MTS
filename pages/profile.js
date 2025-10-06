import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!mounted) return
        setUser(session?.user ?? null)
        setAvatarUrl(session?.user?.user_metadata?.avatar_url ?? null)
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
      setAvatarUrl(session?.user?.user_metadata?.avatar_url ?? null)
    })

    return () => {
      mounted = false
      try {
        data.subscription.unsubscribe()
      } catch (e) {}
    }
  }, [])

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setMessage(null)
    setUploading(true)

    try {
      const filename = `${user.id}-${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if (uploadErr) {
        setMessage({ type: 'error', text: uploadErr.message })
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
      const publicUrl = urlData.publicUrl

      const { error: updateErr } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      if (updateErr) {
        setMessage({ type: 'error', text: updateErr.message })
      } else {
        setAvatarUrl(publicUrl)
        setMessage({ type: 'success', text: 'Avatar updated.' })
        // refresh session
        const { data } = await supabase.auth.getSession()
        setUser(data?.session?.user ?? user)
      }
    } catch (err) {
      setMessage({ type: 'error', text: String(err) })
    } finally {
      setUploading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  if (loading)
    return (
      <div className="content-section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading profile…</p>
      </div>
    )

  if (!user)
    return (
      <div className="content-section" style={{ minHeight: '60vh' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>No user signed in</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Please log in or create an account to view your profile.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn" onClick={() => router.push('/')}>Log In</button>
            <button className="btn btn-secondary" onClick={() => router.push('/')}>Sign Up</button>
          </div>
        </div>
      </div>
    )

  return (
    <div className="content-section" style={{ minHeight: '60vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: 'white', padding: 40, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{ width: 120, height: 120 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-navy)', color: 'white', fontSize: 36, fontWeight: 700 }}>{(user.email || '').charAt(0).toUpperCase()}</div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem' }}>My Profile</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage your account settings</p>

            <div style={{ marginTop: 18 }}>
              <label className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>
                {uploading ? 'Uploading...' : 'Upload / Change Avatar'}
                <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
              </label>
              {message && <div style={{ marginTop: 12 }} className={`msg ${message.type === 'error' ? 'error' : ''}`}>{message.text}</div>}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Email</label>
          <div style={{ padding: 12, background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>{user.email}</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Account Status</label>
          <div style={{ padding: 12, background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-amber)', fontWeight: 600 }}>✓ Active</div>
        </div>

        <button onClick={handleLogout} className="btn-danger" style={{ marginTop: 32 }}>Log Out</button>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function ProfilePage(){
  const [user, setUser] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  useEffect(()=>{
    async function load(){
      const { data } = await supabase.auth.getSession()
      const u = data?.session?.user ?? null
      if(!u) return router.push('/')
      setUser(u)
      setAvatarUrl(u.user_metadata?.avatar_url ?? null)
    }
    load()
  },[])

  async function handleUpload(e){
    const file = e.target.files?.[0]
    if(!file) return
    setMessage(null)
    setUploading(true)

    try{
      const filename = `${user.id}-${Date.now()}-${file.name}`
      // upload to avatars bucket
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if(uploadErr){
        // If bucket doesn't exist or upload fails, surface error
        setMessage({type:'error', text: uploadErr.message})
        setUploading(false)
        return
      }

      // get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
      const publicUrl = urlData.publicUrl

      // update user metadata
      const { error: updateErr } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      if(updateErr){
        setMessage({type:'error', text: updateErr.message})
      } else {
        setAvatarUrl(publicUrl)
        setMessage({type:'success', text: 'Avatar updated.'})
        // refresh auth session on client
        const { data } = await supabase.auth.getSession()
        setUser(data?.session?.user ?? user)
      }
    }catch(err){
      setMessage({type:'error', text: String(err)})
    }finally{
      setUploading(false)
    }
  }

  if(!user) return null

  return (
    <div className="content-section">
      <div style={{maxWidth:700,margin:'0 auto',background:'var(--bg-white)',padding:28,borderRadius:12,boxShadow:'var(--shadow-md)'}}>
        <h2 className="section-title">Your Profile</h2>
        <p>Update your profile picture. Images will be stored in Supabase Storage.</p>

        <div style={{display:'flex',gap:24,alignItems:'center',marginTop:20}}>
          <div>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={{width:120,height:120,borderRadius:999,objectFit:'cover'}} />
            ) : (
              <div style={{width:120,height:120,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--primary-navy)',color:'white',fontSize:36,fontWeight:700}}>
                {(user.email||'').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div style={{flex:1}}>
            <label className="btn-secondary" style={{display:'inline-block',cursor:'pointer'}}>
              {uploading ? 'Uploading...' : 'Choose New Avatar'}
              <input type="file" accept="image/*" onChange={handleUpload} style={{display:'none'}} />
            </label>

            {message && (
              <div style={{marginTop:12}} className={`msg ${message.type==='error'?'error':''}`}>{message.text}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!mounted) return
        setUser(session?.user ?? null)
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
            <a href="/auth/login" className="btn">Log In</a>
            <a href="/auth/register" className="btn btn-secondary">Sign Up</a>
          </div>
        </div>
      </div>
    )

  return (
    <div className="content-section" style={{minHeight:'60vh'}}>
      <div style={{maxWidth:800,margin:'0 auto',background:'white',padding:40,borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-md)',border:'1px solid var(--border-light)'}}>
        <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:32}}>
          <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg, var(--tpt-teal), var(--tpt-green))',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'2rem',fontWeight:700}}>
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{margin:'0 0 8px 0',fontSize:'1.75rem'}}>My Profile</h2>
            <p style={{margin:0,color:'var(--text-secondary)'}}>Manage your account settings</p>
          </div>
        </div>
        
        <div style={{marginBottom:24}}>
          <label style={{display:'block',fontWeight:600,marginBottom:8,color:'var(--text-primary)'}}>Email</label>
          <div style={{padding:12,background:'var(--bg-light)',borderRadius:'var(--radius-sm)',color:'var(--text-secondary)'}}>{user.email}</div>
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
