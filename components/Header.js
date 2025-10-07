import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import AuthModal from './AuthModal'

export default function Header() {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuRef = useRef()

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

  // click outside to close profile menu
  useEffect(() => {
    function onDoc(e){
      if (showProfileMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [showProfileMenu])

  const openAuthModal = (mode) => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <>
      <header className="top-nav" role="banner">
        <div className="nav-inner">
          <Link className="nav-brand" href="/">
            <img src="/logo.svg" alt="MyTeachingSheets" className="site-logo" />
          </Link>
          <form action="/search" method="get" className="header-search" role="search" onSubmit={(e)=>{ /* allow native submit to /search?q=... */ }}>
            <input name="q" className="search-input" placeholder="Search worksheets, topics, or grade" aria-label="Search" />
            <button type="submit" className="search-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle>
              </svg>
            </button>
          </form>
          <nav className="nav-actions" aria-label="Main navigation">
            {user ? (
              <div ref={menuRef} style={{position:'relative'}}>
                <button
                  className="nav-btn profile-btn"
                  aria-haspopup="true"
                  aria-expanded={showProfileMenu}
                  onClick={() => setShowProfileMenu((s) => !s)}
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="profile-avatar" />
                  ) : (
                    <div className="profile-avatar profile-initials">{(user.email || '').charAt(0).toUpperCase()}</div>
                  )}
                </button>

                {showProfileMenu && (
                  <div className="profile-dropdown" role="menu">
                    <Link href="/profile" className="profile-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>Profile</Link>
                    <Link href="/ai/generate" className="profile-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>Generate</Link>
                    <button className="profile-item" role="menuitem" onClick={async () => { await supabase.auth.signOut(); window.location.reload() }}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
