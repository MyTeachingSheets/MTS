// Endpoint to receive ChatKit widget actions or forwarded actions from self-hosted ChatKit server
// Example: action payload could be { action: { type: 'create_worksheet' }, payload: { subject, grade, ... } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = req.body
    const action = body.action || {}
    const type = action.type

    if (type === 'create_worksheet') {
      // Forward payload to existing AI generate API
      const payload = body.payload || {}
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const text = await response.text()
      return res.status(response.status).send(text)
    }

    return res.status(200).json({ ok: true, action: type })
  } catch (err) {
    console.error('chatkit action error', err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}
