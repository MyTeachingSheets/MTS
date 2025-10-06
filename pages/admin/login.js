import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const [token, setToken] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) throw new Error('invalid token')
      router.push('/admin/logs')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin login</h1>
      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Admin token</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div>
          <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </div>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  )
}
