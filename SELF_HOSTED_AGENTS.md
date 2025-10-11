# Self-hosted Agents + ChatKit Architecture for MyTeachingSheets

This doc explains how to run a self-hosted Agents SDK backend with ChatKit, integrate it with your Next.js frontend, and wire actions (e.g., generate a worksheet) into your existing APIs.

Overview
--------
We'll run a Python-based ChatKit/Agents server alongside your Next.js app. High-level flow:

1. Frontend (Next.js) embeds ChatKit client
2. ChatKit client talks to your ChatKit server (self-hosted)
3. ChatKit server runs Agents SDK workflows, invokes tools or actions, and streams responses back
4. When user requests a worksheet, the agent calls your Next.js API (`/api/ai/generate`) or a new action endpoint (`/api/chatkit/action`) to create the worksheet

Components
----------
- Next.js frontend (already in repo)
  - `components/ChatKitEmbed.js` - mounts ChatKit and calls `/api/chatkit/session` (serverless session creation)
  - `pages/api/chatkit/session.js` - currently creates sessions via OpenAI-hosted ChatKit (can be adapted)
  - `pages/api/chatkit/action.js` - (we will add) endpoint to receive action webhooks from self-hosted ChatKit server or client

- Self-hosted ChatKit/Agents server (Python)
  - Uses `openai-chatkit` and `openai-agents` packages
  - Exposes endpoints: `/process` (ChatKit server protocol), `/health`, and optional admin routes
  - Implements `ChatKitServer` subclass to handle `respond` and `action`

Env variables
-------------
- OPENAI_API_KEY - your OpenAI API key (server)
- CHATKIT_SERVER_HOST - base URL where your ChatKit server will run (e.g., http://localhost:8000)
- NEXT_PUBLIC_CHATKIT_API - client-side URL to your Next.js session endpoint (if using hosted sessions)

Security
--------
- Use HTTPS in production and protect ChatKit server endpoints with authentication (JWT, IP allowlisting, or reverse proxy)
- Validate and sanitize action payloads; treat them as untrusted
- Keep OPENAI_API_KEY secret on the server only

When to self-host
-----------------
Self-host if you need:
- Full control over storage (store traces, threads locally)
- Custom tools that require internal network access
- Private deployments behind firewalls or custom infra

Next steps
----------
1. Add the Python ChatKit server example (`server/chatkit_server.py`) and dependency list
2. Add `pages/api/chatkit/action.js` to accept actions from the ChatKit server
3. Provide run instructions and a small demo script to trigger an action

