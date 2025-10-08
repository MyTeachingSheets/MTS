import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [resending, setResending] = useState(false)
  const router = useRouter()

  async function submit(e) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    
    if (error) {
      // Check if error is due to email already being registered
      if (error.message.toLowerCase().includes('already registered') || 
          error.message.toLowerCase().includes('user already exists') ||
          error.message.toLowerCase().includes('already been registered')) {
        setMessage({ type: 'error', text: 'This email is already registered. Please use a different email or try logging in.' })
      } else {
        setMessage({ type: 'error', text: error.message })
      }
    } else {
      // Note: Supabase may return success even if user exists (depends on settings)
      // Check if the user was actually created
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        // User already exists but Supabase returned success (email confirmation disabled scenario)
        setMessage({ type: 'error', text: 'This email is already registered. Please use a different email or try logging in.' })
      } else {
        setMessage({ type: 'success', text: 'Check your email for confirmation (if enabled).' })
        setRegistered(true)
        // Don't auto-redirect, let user resend if needed
      }
    }
  }

  async function resendEmail() {
    if (!email) {
      setMessage({ type: 'error', text: 'Email address is required.' })
      return
    }
    setResending(true)
    setMessage(null)
    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const result = await res.json()
      setResending(false)
      if (res.ok) {
        setMessage({ type: 'success', text: 'Confirmation email sent! Please check your inbox.' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send confirmation email.' })
      }
    } catch (err) {
      setResending(false)
      setMessage({ type: 'error', text: 'Error sending confirmation email.' })
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="lead">Start your free account</p>
        <form onSubmit={submit}>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={registered} />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a strong password" disabled={registered} />
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading || registered}>{loading ? 'Creating...' : 'Create account'}</button>
            <a className="small-link" href="/auth/login">Already have an account?</a>
          </div>
          {message && <div className={"msg " + (message.type === 'error' ? 'error' : '')}>{message.text}</div>}
          {registered && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <p style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                Didn't receive the email?
              </p>
              <button 
                type="button" 
                onClick={resendEmail} 
                disabled={resending}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                {resending ? 'Sending...' : 'Resend Confirmation Email'}
              </button>
              <p style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <a href="/auth/login" className="small-link">Go to Login</a>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
