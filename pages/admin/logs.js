import { useEffect, useState } from 'react'

export default function LogsPage() {
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const token = process.env.NEXT_PUBLIC_LOG_ADMIN_TOKEN || ''
        const res = await fetch('/api/logs', { headers: { 'x-admin-token': token } })
        if (!res.ok) throw new Error('Forbidden or failed')
        const data = await res.json()
        setLogs(data.logs || [])
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [])

  return (
    <div style={{padding:24}}>
      <h1>Logs</h1>
      {error && <div style={{color:'red'}}>Error: {error}</div>}
      <div style={{marginTop:12}}>
        {logs.length === 0 && <div>No logs found</div>}
        {logs.map((l, i) => (
          <div key={i} style={{padding:8,borderBottom:'1px solid #eee'}}>
            <div style={{fontSize:12,color:'#666'}}>{l.ts} • {l.level}</div>
            <div style={{marginTop:4}}>{l.message}</div>
            {l.meta && <pre style={{marginTop:6,background:'#f6f8fa',padding:8,overflow:'auto'}}>{JSON.stringify(l.meta,null,2)}</pre>}
          </div>
        ))}
      </div>
    </div>
  )
}
