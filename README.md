# Simple Next.js One-Page Site

This is a minimal Next.js starter for a one-page website. It includes a simple hero section and contact anchor.

Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Deployment and domain

- To deploy, you can use Vercel (recommended for Next.js). After deploying, point your Namecheap domain to the Vercel project using their domain settings.
- Alternatively, deploy to any host that supports Node.js and configure your domain's DNS to point to the host.

Next steps

- Add meta tags and SEO
- Replace placeholder email and content
- Add analytics and contact form
- (Optional) integrate Tailwind CSS for faster styling

Logging

This project includes a simple logging API at `pages/api/logs.js`.

- POST `/api/logs` with JSON { level, message, meta } to append a log entry. Stored in `.logs/logs.json` locally.
- GET `/api/logs` returns the logs but is protected by the `LOG_ADMIN_TOKEN` environment variable — the request must include the header `x-admin-token` with the token value.

Notes:
- Writing to the local filesystem works for development but is not persistent on serverless platforms. For production, use an external log store (Datadog, Logflare, or a DB).

