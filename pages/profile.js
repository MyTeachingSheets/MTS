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

  if (loading) return <p>Loading profile…</p>

  if (!user)
    return (
      <div style={{ padding: 20 }}>
        <h2>No user signed in</h2>
        <p>
          Use the <a href="/auth/login">login</a> or <a href="/auth/register">register</a>{' '}
          pages.
        </p>
      </div>
    )

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      <p>
        Signed in as: <strong>{user.email}</strong>
      </p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
