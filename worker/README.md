# ALIFLY AI tutor service

This Cloudflare Worker keeps the OpenAI API key on the server. Never put the key in the React app, GitHub source, or a public environment variable.

## Deploy
1. Install Wrangler and authenticate with Cloudflare.
2. From this folder, run `npx wrangler secret put OPENAI_API_KEY` and paste the API key when prompted.
3. The allowed browser origin is configured in `wrangler.toml` as `https://iamaldamov.github.io`. Change it only if the public site origin changes.
4. Optional: set the Worker variable `OPENAI_MODEL` to a model enabled for your API project.
5. Run `npx wrangler deploy`.
6. Set the deployed Worker URL as the build-time variable `VITE_AI_TUTOR_URL` when building the Vite site.

The Worker accepts POST JSON shaped as `{ "messages": [{ "role": "user", "content": "..." }] }` and returns `{ "answer": "..." }`.

OpenAI API usage is billed separately from a ChatGPT subscription. Add rate limiting and usage monitoring before sharing the public tutor widely.
