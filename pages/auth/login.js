import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resending, setResending] = useState(false)
  const router = useRouter()

  async function submit(e) {
    e.preventDefault()
    setMessage(null)
    setShowResend(false)
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      // Check if error is due to unconfirmed email
      const errorMsg = error.message.toLowerCase()
      if (errorMsg.includes('email not confirmed') || 
          errorMsg.includes('not confirmed') ||
          errorMsg.includes('email confirmation') ||
          errorMsg.includes('confirm your email')) {
        setMessage({ type: 'error', text: error.message })
        setShowResend(true)
      } else {
        setMessage({ type: 'error', text: error.message })
      }
    } else {
      setMessage({ type: 'success', text: 'Logged in' })
      router.push('/')
    }
  }

  async function resendConfirmation() {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address.' })
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
        setShowResend(false)
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
        <h2>Welcome back</h2>
        <p className="lead">Sign in to access your account</p>
        <form onSubmit={submit}>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            <a className="small-link" href="/auth/register">Create account</a>
          </div>
          {message && <div className={"msg " + (message.type === 'error' ? 'error' : '')}>{message.text}</div>}
          {showResend && (
            <button 
              type="button" 
              onClick={resendConfirmation} 
              disabled={resending}
              className="btn btn-secondary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {resending ? 'Sending...' : 'Resend Confirmation Email'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
