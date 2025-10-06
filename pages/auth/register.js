import { useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const router = useRouter()

  async function submit(e) {
    e.preventDefault()
    setMessage(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else {
      setMessage('Check your email for confirmation (if enabled).')
      setTimeout(() => router.push('/auth/login'), 1500)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Register</h1>
      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <button type="submit">Register</button>
        {message && <div style={{ marginTop: 12 }}>{message}</div>}
      </form>
    </div>
  )
}
