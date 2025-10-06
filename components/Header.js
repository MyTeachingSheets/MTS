import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Header() {
  const [user, setUser] = useState(null)

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

  return (
    <header className="top-nav" role="banner">
      <div className="nav-inner">
        <Link className="nav-brand" href="/">MyTeachingSheets</Link>
        <nav className="nav-actions" aria-label="Main navigation">
          {user ? (
            <>
              <Link className="nav-btn" href="/profile">Profile</Link>
              <button className="nav-btn" onClick={async () => { await supabase.auth.signOut(); window.location.reload() }}>Logout</button>
            </>
          ) : (
            <>
              <Link className="nav-btn" href="/auth/login">Login</Link>
              <Link className="nav-btn" href="/auth/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
