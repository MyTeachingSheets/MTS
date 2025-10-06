export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }
  // Clear the cookie by setting it to empty and expired
  const expires = new Date(0).toUTCString()
  res.setHeader('Set-Cookie', `log_admin_token=; HttpOnly; Path=/; Expires=${expires}; SameSite=Lax`)
  return res.status(200).json({ ok: true })
}
