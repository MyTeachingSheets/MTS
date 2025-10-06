import { useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const router = useRouter()

  async function submit(e) {
    e.preventDefault()
    setMessage(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else {
      setMessage('Logged in')
      router.push('/')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <button type="submit">Login</button>
        {message && <div style={{ marginTop: 12 }}>{message}</div>}
      </form>
    </div>
  )
}
