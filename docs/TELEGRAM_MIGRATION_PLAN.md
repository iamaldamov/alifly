# ALIFLY Telegram Edition — Migration Plan

## Goal
Turn ALIFLY into a complete Arabic-learning experience inside Telegram. The bot handles conversational learning and notifications; a Telegram Mini App provides rich interactive screens. The existing website remains available during migration. Bot and Mini App must use the same curriculum source.

## Verified repository state (2026-11-23)
- Repository: iamaldamov/alifly; default branch: main.
- Stack: React 18, TypeScript, Vite.
- Existing persistence/auth: Firebase Authentication + Firestore.
- Main lesson definitions currently live in src/App.tsx.
- Existing visible curriculum: 3 stages — Arabic alphabet (9 micro-lessons), short vowels/fatha-kasra-damma (3 lessons), introductory MSA dialogues (5 lessons).
- Lesson types support explanations, Arabic letter cards, study cards, multiple-choice and recall questions, accepted answer variants, immediate feedback and explanations.
- The agreed target curriculum has 6 stages: alphabet; vowel marks and reading; first words; grammar; conversation; reading and comprehension. Stages 4–6 and missing content in stages 2–3 must be developed and reviewed, not represented as already complete.

## Product principles
- Primary teaching language: Russian.
- Target Arabic: Modern Standard Arabic (الفصحى), not dialect mixing and not a Qur'anic-recitation course.
- Short lessons, explanation followed by practice inside the same lesson, immediate feedback, review of mistakes, progress and gentle motivation.
- No separate practice section.
- Preserve existing material; do not silently rewrite linguistic content.
- Use vowel marks where pedagogically appropriate. Transliteration supports but does not replace Arabic script.
- Use verified pronunciation audio; do not present questionable synthesized pronunciation as authoritative.

## Telegram-native architecture
### Bot
- /start onboarding, course introduction and main navigation.
- Lesson selection, lesson messages, inline answer buttons and free-text recall.
- Immediate feedback, explanations and next-step navigation.
- Progress, XP, streaks, achievements, daily goal and opt-in reminders.
- Resume lesson, help, settings and privacy controls.

### Telegram Mini App
- Interactive lesson cards and richer lesson screens.
- Arabic letter/word display, pronunciation diagrams and Arabic input.
- Complex exercises, progress map, profile, statistics and settings.
- Mobile-first ALIFLY visual system, Telegram theme variables, safe-area and back-button behavior.
- Open from bot menu and lesson links. Do not simply embed the current website unchanged.

## Data and backend strategy
- Extract curriculum into versioned, UI-independent structured content with TypeScript schemas.
- Bot and Mini App consume the same lesson content.
- Keep the existing website running throughout migration.
- Proposed Telegram backend: Telegram Bot API webhook on Cloudflare Workers; secrets stored only as Worker secrets.
- Reuse Firestore for Telegram profiles/progress through a narrowly scoped server-side integration if validated. Never expose privileged credentials to the browser.
- Validate Telegram webhook secret headers. Validate Mini App initData server-side; never trust a client-supplied Telegram user ID alone.
- Map Telegram identity to an internal user record. Do not silently merge with email accounts; use explicit account linking if cross-platform sync is implemented.
- Do not require email/password registration as the first step in Telegram.

## Suggested Firestore data model
- telegramUsers/{telegramUserId}: Telegram identity metadata and internal profile reference.
- users/{internalUserId}/progress/current: stage, lesson, completed lessons, XP, streak, daily goal and timestamps.
- users/{internalUserId}/reviewQueue/{itemId}: mistakes and scheduled review metadata.
- Optional learning events only when needed; minimize collected data.
- Never store bot tokens, service-account JSON or other secrets in client-accessible documents.

## Migration phases
1. Inventory current lesson content, question types, progress fields and Firebase rules. Work on telegram-edition; do not overwrite main.
2. Extract current lessons and shared types from src/App.tsx into a canonical curriculum package. Add tests for counts, IDs, accepted answers and RTL content.
3. Build webhook, /start, navigation, lesson delivery, answer handling, progress persistence and update-idempotency.
4. Build Mini App foundation, Telegram WebApp integration, safe initData validation and mobile layouts.
5. Reproduce all current lessons and feedback; add remaining curriculum only after linguistic review.
6. Test bot flows, Telegram clients, retries, duplicate updates, privacy, accessibility, build and deployment. Release gradually without disabling the website.

## Required external setup
- Telegram bot token from BotFather, stored only as a Cloudflare Worker secret.
- Cloudflare account and Worker deployment access.
- HTTPS webhook URL and random webhook secret.
- Mini App domain configured with BotFather after HTTPS deployment.
- Never paste credentials into source files, commits, screenshots or chat messages.

## Definition of done
- New learner can start in Telegram without email/password registration.
- Full agreed curriculum is navigable in Telegram.
- Every current lesson and question is preserved or intentionally reviewed.
- Answers, feedback, completion and progress survive restarts.
- Bot and Mini App use the same curriculum and progress model.
- Reminders are opt-in and can be disabled.
- Telegram identity is validated server-side and secrets are not exposed.
- Existing website still builds and works.
- Build, tests, security checks and end-to-end Telegram checks pass before production rollout.

## Implementation status

Completed on the `telegram-edition` branch:
- Created a protected work branch; `main` remains untouched.
- Added this migration plan and a BotFather setup guide.
- Extracted the current stages, lessons, question types, accepted-answer logic and exam question builder from `src/App.tsx` into `src/data/curriculum.ts`.
- Updated the website to import the shared curriculum module, preserving its existing UI and learning behavior.
- Added an initial Cloudflare Worker with Telegram webhook handling, `/start`, `/help`, `/progress`, D1 profile storage, duplicate-update protection and server-side Telegram Mini App `initData` validation.
- Added D1 schema, Worker configuration, setup instructions and a GitHub Actions TypeScript-check workflow.

Not yet completed:
- Worker is not deployed; D1 database ID and domain are placeholders.
- No Telegram bot has been created yet; BotFather username and token are not configured.
- Mini App UI and lesson delivery from the shared curriculum are still to be implemented.
- The current curriculum has three stages; the full six-stage target remains unfinished.
- Typecheck/build results must be confirmed from CI before release.
