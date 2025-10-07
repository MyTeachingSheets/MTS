import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function VerifyPage() {
  const [status, setStatus] = useState('verifying')
  const router = useRouter()

  useEffect(() => {
    // Supabase automatically parses sessions from the URL when the client
    // initializes, but to be safe we attempt to explicitly exchange any
    // PKCE/auth code in the URL for a session. This helps on some setups.
    async function finalize() {
      try {
        // Try to get a session — if Supabase detected it from the URL this
        // will return the session. Otherwise nothing breaks.
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session after email verify:', error)
          setStatus('error')
          return
        }

        // If session exists, consider verification successful.
        if (data?.session) {
          setStatus('success')
          // redirect to profile or homepage after a short delay
          setTimeout(() => router.push('/profile'), 1200)
        } else {
          // No session yet — show a user-facing message and let them go to login
          setStatus('no-session')
        }
      } catch (err) {
        console.error('Verification error', err)
        setStatus('error')
      }
    }
    finalize()
  }, [router])

  return (
    <div style={{padding: 24}}>
      <h1>Email verification</h1>
      {status === 'verifying' && <p>Verifying your email — please wait...</p>}
      {status === 'success' && <p>Success! You are now verified. Redirecting…</p>}
      {status === 'no-session' && (
        <>
          <p>We couldn't find an active session after following the verification link.</p>
          <p>Please try logging in from the <a href="/auth/login">login page</a>.</p>
        </>
      )}
      {status === 'error' && <p>There was an error verifying your email. Check the link or try again.</p>}
    </div>
  )
}
