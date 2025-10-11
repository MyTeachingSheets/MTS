# ChatKit / Agents Integration Guide for MyTeachingSheets

This guide shows how to replace the current single-step AI flow with an agent-driven workflow using OpenAI Agents + ChatKit. It includes server and frontend examples for embedding ChatKit and creating ChatKit sessions.

High-level options
------------------
1. Use OpenAI-hosted Agent Builder + ChatKit (recommended for fastest integration).
2. Self-host Agents SDK + ChatKit (advanced; full control).

Requirements
------------
- An OpenAI account with access to Agents/ChatKit features.
- `OPENAI_API_KEY` set in environment (on Vercel: set in Project → Environment Variables).
- `OPENAI_WORKFLOW_ID` (the published Agent Builder workflow ID you create).

Server: ChatKit session endpoint
--------------------------------
Create an endpoint that creates ChatKit sessions and returns `client_secret` to the frontend.
I added `pages/api/chatkit/session.js` which expects `OPENAI_API_KEY` and `OPENAI_WORKFLOW_ID`.

Frontend: Embed ChatKit
-----------------------
1. Install the React bindings (optional):

```bash
npm install @openai/chatkit-react
```

2. Add the ChatKit script into your page (you can also use the React bindings):

```html
<script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async></script>
```

3. Small React example (in `components/ChatKitEmbed.js`):

```jsx
import React from 'react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'

export default function ChatKitEmbed() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        const res = await fetch('/api/chatkit/session', { method: 'POST' })
        const json = await res.json()
        return json.client_secret
      }
    },
    options: {
      initialThread: null,
      theme: { colorScheme: 'light' }
    }
  })

  return <ChatKit control={control} className="h-[600px] w-[320px]" />
}
```

Agent Builder → Publish → Workflow ID
-------------------------------------
1. Use Agent Builder (https://platform.openai.com/agent-builder) to create a workflow.
2. When you publish, you get a `workflow id` (e.g., `wf_...`).
3. Set `OPENAI_WORKFLOW_ID` in your environment.

Security & best practices
-------------------------
- Keep `OPENAI_API_KEY` secret; only create sessions server-side.
- Use `user` identifiers when creating sessions.
- Add guardrails and human approval nodes to unsafe actions.

Testing locally
---------------
- Add `OPENAI_API_KEY` and `OPENAI_WORKFLOW_ID` to `.env.local` for local testing.
- Start dev server: `npm run dev`
- Visit the page where you embed ChatKit and verify it connects.

Advanced: Self-host ChatKit and Agents SDK
-----------------------------------------
See the docs in the repo: use `chatkit-python` or `chatkit-js` to self-host and connect to your resources.

Next steps
----------
- Add `components/ChatKitEmbed.js` (optional) and a sample `/ai/agent.js` page to embed it.
- Optionally, wire agent actions to your application (e.g., create worksheets, export PDFs) via ChatKit actions.
