export default function LogsPage({ logs = [], error = null }) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Logs</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <div style={{ marginTop: 12 }}>
        {logs.length === 0 && <div>No logs found</div>}
        {logs.map((l) => (
          <div key={l.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: 12, color: '#666' }}>{l.ts} • {l.level}</div>
            <div style={{ marginTop: 4 }}>{l.message}</div>
            {l.meta && <pre style={{ marginTop: 6, background: '#f6f8fa', padding: 8, overflow: 'auto' }}>{JSON.stringify(l.meta, null, 2)}</pre>}
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
