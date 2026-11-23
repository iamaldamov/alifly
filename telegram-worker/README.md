# ALIFLY Telegram Worker

Cloudflare Worker for the ALIFLY Telegram bot webhook and Telegram Mini App session validation.

## Current functionality
- `GET /health` health check.
- `POST /telegram/webhook` accepts Telegram updates only when `X-Telegram-Bot-Api-Secret-Token` matches the configured webhook secret.
- `/start`, `/help`, and `/progress` bot commands.
- D1 learner profile and basic progress storage.
- Telegram Mini App `initData` HMAC validation on `POST /api/telegram/session` (24-hour maximum age).
- Duplicate Telegram update protection using `processed_updates`.

## Setup
1. Create a bot with [@BotFather](https://t.me/BotFather). Keep the bot token private.
2. Create a Cloudflare D1 database named `alifly-telegram` and put its ID into `wrangler.toml`.
3. Set `APP_URL` in `wrangler.toml` to the final HTTPS Mini App URL.
4. From this directory run `npm install`.
5. Run `npx wrangler d1 execute alifly-telegram --remote --file=./schema.sql`.
6. Set secrets: `npx wrangler secret put TELEGRAM_BOT_TOKEN` and `npx wrangler secret put TELEGRAM_WEBHOOK_SECRET`.
7. Run `npm run typecheck`, then `npm run deploy`.
8. Register the webhook using Telegram's `setWebhook` API with the deployed `/telegram/webhook` URL and the same `secret_token` value.
9. Configure the Mini App domain with BotFather after the HTTPS app is deployed.

Never commit bot tokens, webhook secrets, Cloudflare API tokens, or service-account keys. Do not send them in chat.

## Mini App session
Send the raw `Telegram.WebApp.initData` string to `POST /api/telegram/session` as `{ "initData": "..." }`. The Worker verifies the Telegram signature and freshness before returning the learner profile and progress. Do not trust `initDataUnsafe` or a client-supplied user ID for authentication.

## Important current limitation
The Worker currently provides the Telegram onboarding shell and identity/progress foundation. It does not yet deliver the complete lesson curriculum. The next migration task is to extract the existing lessons from `src/App.tsx` into a shared, typed curriculum package consumed by both the website and Mini App.

## Deployment note
The D1 database binding in `wrangler.toml` is intentionally a placeholder until the database is created in the owner's Cloudflare account. The Worker is not deployed and the bot is not live yet.
