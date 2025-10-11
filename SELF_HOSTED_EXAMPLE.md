# Self-hosted Agents + ChatKit Example (Run locally)

This guide walks through running the minimal self-hosted ChatKit server (Python) and wiring it to your Next.js app.

Prerequisites
-------------
- Python 3.10+
- Node.js (for Next.js)
- `pip install fastapi uvicorn httpx openai-chatkit openai-agents` (package names may vary)

Steps
-----
1. Start Next.js dev server:

```bash
npm run dev
```

2. Run the Python ChatKit server in a separate terminal:

```bash
cd server
uvicorn chatkit_server:app --reload --port 8000
```

3. In the ChatKit UI (client), set API URL to your self-hosted server (e.g., `http://localhost:8000/process`) or use the client to call your Next.js session endpoint depending on your setup.

4. Test an action: send a POST to the server action endpoint:

```bash
curl -X POST http://localhost:3000/api/chatkit/action \
  -H 'Content-Type: application/json' \
  -d '{ "action": { "type": "create_worksheet" }, "payload": { "subject": "Science", "grade": "6", "worksheetType": "quiz" } }'
```

You should see the Next.js `/api/ai/generate` response forwarded back.

Notes
-----
- The Python server is illustrative only. For production, implement ChatKitServer from `openai-chatkit` package.
- Secure the endpoints with auth for production.
- Update workflow-specific logic in the Python server to orchestrate agents and tools.
