# ALIFLY Firestore rules

## Client-accessible documents

The current React application uses only these Firestore paths:

- `users/{uid}` for the learner's email, selected avatar, and creation/update timestamps.
- `users/{uid}/progress/current` for learning progress.

The rules allow a signed-in learner to read only their own profile and current progress document.

## Profile protection

The root profile document has an explicit field allowlist. `avatarId` is an optional legacy field; the current `AuthPanel.tsx` sign-up flow creates the profile with `createdAt` and `updatedAt` only:

- `email` (optional; when present it must match the authenticated token)
- `avatarId` (optional; when present, one of the six supported IDs)
- `createdAt` (optional for legacy/minimal profile creation; immutable after creation)
- `updatedAt` (must be the server request time)

Clients cannot add or edit trial, subscription, entitlement, payment, role, or other unlisted fields.

## Progress protection

Only `users/{uid}/progress/current` is client-accessible. The rule validates the exact fields currently written by `src/App.tsx`, their basic types, the daily-goal range, the daily-activity shape, and the server timestamp. The optional `starting_level` field accepts `null` before placement or an integer from 1 to 4; it is optional so older progress documents and clients remain compatible.

Clients cannot delete the progress document. Other nested collections are denied by default.

## Trial and future billing data

Do not add `trialStartedAt`, `trialEndsAt`, subscription status, premium entitlements, or payment-provider fields to the client-writable profile allowlist. When the seven-day trial is implemented in Firebase, its authoritative start/end timestamps must be created and maintained by trusted server-side code (for example, a callable/triggered Cloud Function using the Admin SDK), not by the browser.

## Local emulator tests

The tests use the Firebase Emulator Suite with a demo project ID. They do not connect to the production Firebase project.

```bash
npx firebase-tools@15.37.0 emulators:exec --only firestore --project demo-alifly-rules "node --test firestore.rules.test.mjs"
```

The CI workflow runs the same command for this branch and its pull request.

## Deployment status

These rules are proposed in a draft PR only. They have not been deployed to Firebase. Keep the production rules unchanged until the emulator suite passes and the app's email sign-up, avatar selection, and progress synchronization are manually verified against a staging Firebase project.
