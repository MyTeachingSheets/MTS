import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function checkEmailExists(emailToCheck) {
    if (!emailToCheck) return false
    try {
      const res = await fetch('/api/check-email?email=' + encodeURIComponent(emailToCheck))
      if (!res.ok) return false
      const json = await res.json()
      return !!json.exists
    } catch (e) {
      return false
    }
  }

  async function submit(e) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    // Double-check email isn't already registered
    const exists = await checkEmailExists(email)
    if (exists) {
      setLoading(false)
      setMessage({ type: 'error', text: 'This email is already registered. Please use a different email or log in.' })
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setMessage({ type: 'error', text: error.message })
    else {
      setMessage({ type: 'success', text: 'Check your email for confirmation (if enabled).' })
      setTimeout(() => router.push('/auth/login'), 1500)
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
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={async (ev) => {
              const val = ev.target.value
              if (!val) return
              const exists = await checkEmailExists(val)
              if (exists) setMessage({ type: 'error', text: 'This email is already registered. Please use a different email or log in.' })
            }} placeholder="you@example.com" />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a strong password" />
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
            <a className="small-link" href="/auth/login">Already have an account?</a>
          </div>
          {message && <div className={"msg " + (message.type === 'error' ? 'error' : '')}>{message.text}</div>}
        </form>
      </div>
    </div>
  )
}
