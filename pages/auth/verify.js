import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Verify() {
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('Verifying your email...')
  const router = useRouter()

  useEffect(() => {
    // Supabase sends back the verification token in the URL hash
    // Format: #access_token=...&refresh_token=...&type=signup
    const handleEmailVerification = async () => {
      try {
        const hash = window.location.hash
        
        if (!hash) {
          setStatus('error')
          setMessage('No verification token found. Please check your email link.')
          return
        }

        // Parse hash parameters
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (type === 'signup' && accessToken) {
          // Set the session with the tokens from the email link
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            setStatus('error')
            setMessage(`Verification failed: ${error.message}`)
          } else if (data.session) {
            setStatus('success')
            setMessage('Email verified successfully! Redirecting...')
            // Redirect to home or profile after 2 seconds
            setTimeout(() => router.push('/'), 2000)
          }
        } else {
          setStatus('error')
          setMessage('Invalid verification link.')
        }
      } catch (err) {
        setStatus('error')
        setMessage(`Error: ${err.message}`)
      }
    }

    handleEmailVerification()
  }, [router])

  return (
    <div className="auth-root">
      <div className="auth-card">
        <h2>Email Verification</h2>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          {status === 'verifying' && (
            <div>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <p>{message}</p>
            </div>
          )}
          {status === 'success' && (
            <div>
              <div style={{ fontSize: '3rem', color: '#22c55e', marginBottom: '1rem' }}>✓</div>
              <p style={{ color: '#22c55e', fontWeight: 'bold' }}>{message}</p>
            </div>
          )}
          {status === 'error' && (
            <div>
              <div style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}>✗</div>
              <p style={{ color: '#ef4444' }}>{message}</p>
              <a href="/auth/login" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>Go to Login</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
