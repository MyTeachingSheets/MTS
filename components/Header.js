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

  const handleSearch = (e) => {
    e.preventDefault()
    const q = e.target.elements.search?.value?.trim()
    if (!q) return
    // Navigate to search page with query
    window.location.href = `/search?q=${encodeURIComponent(q)}`
  }

  return (
    <>
      <header className="top-nav" role="banner">
        <div className="nav-inner">
          <Link className="nav-brand" href="/">MyTeachingSheets</Link>
          <form className="nav-search" onSubmit={handleSearch} role="search">
            <input name="search" className="nav-search-input" placeholder="Search resources, grades, topics..." aria-label="Search" />
            <button className="nav-search-btn" type="submit">🔍</button>
          </form>
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
