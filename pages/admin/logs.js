export default function LogsPage({ logs = [], error = null }) {
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
    <div style={{ padding: 24, background: '#fff', color: '#111', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Logs</h1>
        <div>
          <button onClick={() => (window.location.href = '/')} style={{ marginRight: 8 }}>Home</button>
          <button onClick={handleLogout} style={{ background: '#e53e3e', color: '#fff', border: 'none', padding: '6px 10px' }}>Logout</button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginTop: 12 }}>Error: {error}</div>}

      <div style={{ marginTop: 12 }}>
        {logs.length === 0 && <div style={{ color: '#444' }}>No logs found</div>}
        {logs.map((l) => (
          <div key={l.id} style={{ padding: 12, borderBottom: '1px solid #eee', background: '#fafafa', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(l.ts).toLocaleString()} • {l.level}</div>
            <div style={{ marginTop: 6, color: '#111' }}>{l.message}</div>
            {l.meta && <pre style={{ marginTop: 6, background: '#fff', padding: 8, overflow: 'auto' }}>{JSON.stringify(l.meta, null, 2)}</pre>}
          </div>
        ))}
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
