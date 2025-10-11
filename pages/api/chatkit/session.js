import OpenAI from 'openai'

// Small endpoint to create a ChatKit session and return the client_secret
// Expects env vars: OPENAI_API_KEY, OPENAI_WORKFLOW_ID

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  const workflowId = process.env.OPENAI_WORKFLOW_ID

  if (!apiKey || !workflowId) {
    return res.status(500).json({ error: 'Missing OpenAI configuration: OPENAI_API_KEY and OPENAI_WORKFLOW_ID are required' })
  }

  try {
    const client = new OpenAI({ apiKey })

    // Create a session via ChatKit Sessions API
    const resp = await client.request({
      method: 'POST',
      path: '/v1/chatkit/sessions',
      body: {
        workflow: { id: workflowId },
        user: req.body?.user || `user_${Date.now()}`
      }
    })

    // resp should contain client_secret
    return res.status(200).json(resp)
  } catch (err) {
    console.error('ChatKit session error', err)
    return res.status(500).json({ error: err.message || 'ChatKit session failed' })
  }
}
