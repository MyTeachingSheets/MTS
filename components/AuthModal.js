import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function AuthModal({ isOpen, onClose, initialMode = 'register' }) {
  const [mode, setMode] = useState(initialMode) // 'login' or 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setMessage(null)
    setEmail('')
    setPassword('')
    setName('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) setMessage({ type: 'error', text: error.message })
      else {
        setMessage({ type: 'success', text: 'Logged in!' })
        setTimeout(() => {
          onClose()
          router.push('/')
        }, 800)
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) setMessage({ type: 'error', text: error.message })
      else {
        setMessage({ type: 'success', text: 'Account created! Check your email.' })
        setTimeout(() => {
          setMode('login')
          setMessage(null)
        }, 2000)
      }
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className={`auth-modal-container ${mode === 'login' ? 'login-mode' : 'register-mode'}`}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Left Panel - Decorative side with toggle */}
        <div className="auth-panel-left">
          <div className="auth-panel-content">
            {mode === 'register' ? (
              <>
                <h2>Welcome Back!</h2>
                <p>To keep connected with us please login with your personal info</p>
                <button className="auth-toggle-btn" onClick={toggleMode}>
                  SIGN IN
                </button>
              </>
            ) : (
              <>
                <h2>Hello, Friend!</h2>
                <p>Enter your personal details and start your journey with us</p>
                <button className="auth-toggle-btn" onClick={toggleMode}>
                  SIGN UP
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Form side */}
        <div className="auth-panel-right">
          <div className="auth-form-wrapper">
            <h2 className="auth-form-title">
              {mode === 'register' ? 'Create Account' : 'Sign In'}
            </h2>

            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="auth-input-group">
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input"
                  />
                </div>
              )}

              <div className="auth-input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <div className="auth-input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'register' ? 'SIGN UP' : 'SIGN IN'}
              </button>

              {message && (
                <div className={`auth-message ${message.type === 'error' ? 'error' : 'success'}`}>
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
