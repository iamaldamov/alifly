# ALIFLY Firestore rules

## Client-accessible documents

The current React application uses these Firestore paths:

- `users/{uid}` for the learner's email and creation/update timestamps.
- `users/{uid}/progress/current` for learning progress, including the optional `starting_level` (null or an integer from 1 to 4).
- `lessonReports/{reportId}` for learner-submitted lesson issue reports.

A signed-in learner can read only their own profile and current progress. Lesson reports are create-only from the client: authenticated users may submit a validated report, but client reads, updates, and deletes are denied.

## Profile protection

The root profile document has an explicit field allowlist. The current `AuthPanel.tsx` sign-up flow creates a profile with `email`, `createdAt`, and `updatedAt` only.

- `email` is optional; when present it must match the authenticated token.
- `createdAt` is optional for legacy/minimal profile creation and immutable after creation.
- `updatedAt` must equal the server request time.
- `avatarId` is not an allowed field. New and updated profile documents must use only the neutral person-icon interface and the approved profile fields.
- Legacy profile documents that still contain `avatarId` will fail client timestamp updates under this strict allowlist. They must be migrated by a trusted administrative process before normal profile updates can resume.

Clients cannot add or edit trial, subscription, entitlement, payment, role, or other unlisted fields.

## Progress protection

Only `users/{uid}/progress/current` is client-accessible. The rule validates the exact fields currently written by `src/App.tsx`, their basic types, the daily-goal range, the daily-activity shape, and the server timestamp.

The optional `starting_level` field accepts `null` before placement or an integer from 1 to 4. It remains optional so older progress documents and clients stay compatible.

Clients cannot delete the progress document. Other nested collections are denied by default.

## Lesson issue reports

The `lessonReports/{reportId}` rule permits authenticated creation only. It validates the allowed category, bounded text fields, lesson/question identifiers, reporter UID, source, initial status, and server timestamp. Client reads, updates, and deletes are denied.

The current guest reporting flow uses Firebase Anonymous Authentication. The `Anonymous` provider must be enabled in Firebase Console for guest reports to work. This provider setting is not changed by GitHub code or emulator tests. An administrative review interface and notifications are not included yet.

## Trial and future billing data

Do not add `trialStartedAt`, `trialEndsAt`, subscription status, premium entitlements, or payment-provider fields to the client-writable profile allowlist. When a trial is implemented in Firebase, authoritative start/end timestamps must be created and maintained by trusted server-side code (for example, a callable or triggered Cloud Function using the Admin SDK), not by the browser.

## Local emulator tests

The tests use the Firebase Emulator Suite with a demo project ID. They do not connect to the production Firebase project.

```bash
npx firebase-tools@15.37.0 emulators:exec --only firestore --project demo-alifly-rules "node --test firestore.rules.test.mjs"
```

The dedicated Firestore Rules workflow runs the same command for pull requests and pushes.

## Deployment status

The current rules source is merged into `main` in commit [`c719a24`](https://github.com/iamaldamov/alifly/commit/c719a24bfc059da969a20b47e06a925a601428f9). The Firestore Emulator CI passes.

**These rules have not been deployed to production Firebase.** GitHub Pages deployment does not publish Firestore rules. Before deployment, inspect the currently deployed rules and verify email registration, sign-in, password recovery, progress sync, legacy profile timestamp updates, and lesson-report submission against a staging Firebase project. Enable Anonymous Authentication separately if guest reporting is required. Only then deploy the reviewed rules intentionally.
