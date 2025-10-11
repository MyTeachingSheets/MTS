# Minimal self-hosted ChatKit/Agents server example (FastAPI)
# This is an example only. It uses the openai-chatkit and openai-agents packages.
# You must pip install openai-chatkit openai-agents fastapi uvicorn pydantic

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
import os
import asyncio

# NOTE: The actual ChatKit/Agents SDK APIs and imports may differ depending on OpenAI's packages and versions.
# This example shows architecture and pseudocode for how you'd implement ChatKitServer.

app = FastAPI()

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise RuntimeError('OPENAI_API_KEY required')

@app.get('/health')
async def health():
    return JSONResponse({'ok': True})

@app.post('/process')
async def process(req: Request):
    body = await req.json()
    # body will contain thread metadata and input. In a real ChatKit server, you'd instantiate
    # ChatKitServer and call server.process(body, context)
    # For demo, we simply echo back a message
    async def gen():
        yield 'data: {"type":"response.start"}\n\n'
        await asyncio.sleep(0.2)
        yield 'data: {"type":"message","content":"Hello from self-hosted ChatKit!"}\n\n'
        yield 'data: {"type":"response.end"}\n\n'
    return StreamingResponse(gen(), media_type='text/event-stream')

@app.post('/action')
async def action(req: Request):
    payload = await req.json()
    # Handle widget actions: validate and forward to Next.js endpoint
    action_type = payload.get('action', {}).get('type')
    try:
        if action_type == 'create_worksheet':
            # Example: forward to Next.js API to create worksheet
            import httpx
            res = httpx.post('http://localhost:3000/api/ai/generate', json=payload.get('payload', {}))
            return JSONResponse({'status': 'forwarded', 'status_code': res.status_code, 'resp_text': res.text})
        return JSONResponse({'status': 'ok', 'action': action_type})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn server.chatkit_server:app --reload --port 8000
