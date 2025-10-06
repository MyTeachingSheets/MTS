import fs from 'fs'
import path from 'path'

const LOG_DIR = path.resolve(process.cwd(), '.logs')
const LOG_FILE = path.join(LOG_DIR, 'logs.json')

function ensureLogFile() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]')
}

export default async function handler(req, res) {
  ensureLogFile()

  if (req.method === 'POST') {
    try {
      const { level = 'info', message = '', meta = null } = req.body || {}
      const entry = { level, message, meta, ts: new Date().toISOString() }
      const raw = fs.readFileSync(LOG_FILE, 'utf8')
      const arr = JSON.parse(raw || '[]')
      arr.push(entry)
      // keep last 1000 entries to avoid unbounded growth
      const keep = arr.slice(-1000)
      fs.writeFileSync(LOG_FILE, JSON.stringify(keep, null, 2))
      return res.status(201).json({ ok: true })
    } catch (err) {
      console.error('Write log error', err)
      return res.status(500).json({ error: 'failed to write log' })
    }
  }

  // GET: protected log retrieval
  if (req.method === 'GET') {
    // simple protection by token (required in `x-admin-token` header)
    const token = req.headers['x-admin-token'] || ''
    if (!process.env.LOG_ADMIN_TOKEN || token !== process.env.LOG_ADMIN_TOKEN) {
      return res.status(403).json({ error: 'forbidden' })
    }
    try {
      const raw = fs.readFileSync(LOG_FILE, 'utf8')
      const arr = JSON.parse(raw || '[]')
      return res.status(200).json({ logs: arr })
    } catch (err) {
      console.error('Read log error', err)
      return res.status(500).json({ error: 'failed to read logs' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  res.status(405).end('Method Not Allowed')
}
