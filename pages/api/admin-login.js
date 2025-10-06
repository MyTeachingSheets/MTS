export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }
  const { token } = req.body || {}
  if (!process.env.LOG_ADMIN_TOKEN || token !== process.env.LOG_ADMIN_TOKEN) {
    return res.status(403).json({ error: 'forbidden' })
  }
  // set cookie (HttpOnly) for subsequent server-side requests
  // cookie expires in 1 day
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()
  res.setHeader('Set-Cookie', `log_admin_token=${process.env.LOG_ADMIN_TOKEN}; HttpOnly; Path=/; Expires=${expires}; SameSite=Lax`)
  return res.status(200).json({ ok: true })
}
