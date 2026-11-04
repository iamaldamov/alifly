# ALIFLY AI tutor service

The React app continues to call the same Worker contract:
- Request: `POST { "messages": [{ "role": "user" | "assistant", "content": "..." }] }`
- Response: `{ "answer": "..." }`

The Cloudflare Worker calls the Gemini Developer API. The Gemini key is a server-side secret and must never be placed in React code, a `VITE_*` variable, GitHub source, or a public file.

## Free setup

1. Open Google AI Studio: https://aistudio.google.com/app/apikey
2. Create a Gemini API key. Select/use the free tier and review Google's current terms and quota for your account.
3. In Cloudflare, open **Workers & Pages → alifly-ai → Settings → Variables and Secrets**.
4. Add a secret named `GEMINI_API_KEY` and paste the key directly into Cloudflare. Do not send the key in ChatGPT or commit it to GitHub.
5. In the Worker settings, add a plain-text variable `GEMINI_MODEL` with value `gemini-2.5-flash` only if you want to override the default. The default is already `gemini-2.5-flash`.
6. Keep `ALLOWED_ORIGIN` set to `https://iamaldamov.github.io` unless the site domain changes.
7. Deploy the Worker from the `worker` directory using Wrangler: `npx wrangler deploy`.
8. Copy the deployed Worker URL. It will be needed later as the build-time variable `VITE_AI_TUTOR_URL` for the Vite site.

## Protection and limits

- The Worker checks the browser Origin, limits request body size, keeps only the last 10 messages, limits message length and caps answer length.
- Cloudflare's Rate Limiting binding is configured for approximately 10 requests per minute per client IP and edge location. Cloudflare documents that this limit is approximate and not a strict global quota. Origin/CORS checks are not authentication; a public endpoint can still be called by non-browser clients.
- Gemini free-tier quotas are limited and can change by model, account and region. The free tier may use submitted content to improve Google's products. Do not send passwords, private personal information, or sensitive learner data.
- The free tier is not an unlimited guarantee. If its quota is exhausted, the tutor may temporarily return an error; this setup does not intentionally enable paid billing.

## Important

This change only prepares the Worker integration. It does not deploy the Worker, create a Gemini key, change GitHub Pages, or publish the site. The front-end already reads `VITE_AI_TUTOR_URL`; no API key belongs in that variable.
