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
