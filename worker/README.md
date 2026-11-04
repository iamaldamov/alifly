# ALIFLY AI tutor service

This Cloudflare Worker keeps the OpenAI API key on the server. Never put the key in the React app, GitHub source, or a public environment variable.

## Deploy
1. Install Wrangler and authenticate with Cloudflare.
2. From this folder, run `npx wrangler secret put OPENAI_API_KEY` and paste the project API key when prompted.
3. Set the allowed site origin: `npx wrangler secret put ALLOWED_ORIGIN` is not appropriate for non-secret config; use `npx wrangler secret put ALLOWED_ORIGIN` only if preferred, or configure it as a Worker variable in the Cloudflare dashboard. Value: `https://iamaldamov.github.io`.
4. Optional: set Worker variable `OPENAI_MODEL` to a model enabled for your API project.
5. Run `npx wrangler deploy`.
6. Set the deployed Worker URL as the build-time variable `VITE_AI_TUTOR_URL` when building the Vite site.

The Worker accepts POST JSON shaped as `{ "messages": [{ "role": "user", "content": "..." }] }` and returns `{ "answer": "..." }`.

OpenAI API usage is billed separately from a ChatGPT subscription. Add rate limiting and usage monitoring before sharing the public tutor widely.
