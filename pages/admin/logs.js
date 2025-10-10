import { useMemo, useState } from 'react'

function LevelBadge({ level }) {
  const color = level === 'error' ? 'var(--error)' : level === 'warn' ? '#f59e0b' : 'var(--muted)'
  return (
    <span className="log-badge" style={{ borderColor: color, color }}>
      {level.toUpperCase()}
    </span>
  )
}

export default function LogsPage({ logs = [], error = null }) {
  const [q, setQ] = useState('')
  const [level, setLevel] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return logs.filter((l) => {
      if (level && l.level !== level) return false
      if (!term) return true
      return (
        (l.message || '').toLowerCase().includes(term) ||
        JSON.stringify(l.meta || {}).toLowerCase().includes(term)
      )
    })
  }, [logs, q, level])

  function downloadJSON() {
    const data = JSON.stringify(filtered, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin-logout', { method: 'POST' })
      window.location.href = '/admin/login'
    } catch (err) {
      console.error('logout failed', err)
      window.location.href = '/admin/login'
    }
  }

  return (
    <div className="admin-logs-root">
      <div className="admin-logs-inner">
        <div className="admin-logs-header">
          <h1>Logs</h1>
          <div className="admin-logs-actions">
            <button className="btn btn-ghost" onClick={() => (window.location.href = '/admin/settings')}>
              Settings
            </button>
            <button className="btn btn-ghost" onClick={() => (window.location.href = '/')}>
              Home
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && <div className="admin-logs-error">Error: {error}</div>}

        <div className="admin-logs-toolbar">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search message or meta..." />
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All levels</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
          <button className="btn" onClick={downloadJSON}>Export</button>
        </div>

        <div className="admin-logs-list">
          {filtered.length === 0 && <div className="admin-logs-empty">No logs found</div>}
          {filtered.map((l) => (
            <article key={l.id} className="log-row">
              <div className="log-row-left">
                <div className="log-time">{new Date(l.ts).toLocaleString()}</div>
                <LevelBadge level={l.level} />
              </div>
              <div className="log-row-main">
                <div className="log-message">{l.message}</div>
                {l.meta && (
                  <pre className="log-meta">{JSON.stringify(l.meta, null, 2)}</pre>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

// Fetch logs on the server so we don't expose the admin token to the browser.
export async function getServerSideProps(ctx) {
  const token = ctx.req.cookies?.['log_admin_token'] || ''
  if (!process.env.LOG_ADMIN_TOKEN || token !== process.env.LOG_ADMIN_TOKEN) {
    // redirect to login page when not authenticated
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    }
  }

  // call internal API with header (server-side)
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : ''
  const origin = baseUrl || `http://${ctx.req.headers.host}`
  try {
    const res = await fetch(`${origin}/api/logs`, { headers: { 'x-admin-token': process.env.LOG_ADMIN_TOKEN } })
    if (!res.ok) throw new Error('failed to fetch')
    const data = await res.json()
    return { props: { logs: data.logs || [] } }
  } catch (err) {
    return { props: { logs: [], error: err.message } }
  }
}
