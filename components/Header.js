import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import AuthModal from './AuthModal'

export default function Header() {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession()
      setUser(data?.session?.user ?? null)
    }
    load()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener?.subscription?.unsubscribe()
  }, [])

  const openAuthModal = (mode) => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <>
      <header className="top-nav" role="banner">
        <div className="nav-inner">
          <Link className="nav-brand" href="/">MyTeachingSheets</Link>
          <nav className="nav-actions" aria-label="Main navigation">
            {user ? (
              <>
                <Link className="nav-btn" href="/profile">
                  <span style={{marginRight:6}}>👤</span> Profile
                </Link>
                <button className="nav-btn" onClick={async () => { await supabase.auth.signOut(); window.location.reload() }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="nav-btn" onClick={() => openAuthModal('login')}>Log In</button>
                <button className="nav-btn primary" onClick={() => openAuthModal('register')}>Sign Up</button>
              </>
            )}
          </nav>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode}
      />
    </>
  )
}
