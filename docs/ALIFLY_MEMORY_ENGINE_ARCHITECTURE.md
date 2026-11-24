# ALIFLY MEMORY ENGINE — foundation and integration plan

## Scope of this change

This is an additive foundation only. It does not replace the current lesson flow, the existing `Mistake` type, the current Leitner-style scheduler, the `alifly-mistakes` localStorage key, or the existing Firestore progress document.

No Arabic lesson text, transliteration, pronunciation guidance, lesson identifiers, visual components, or production UI are changed.

## Audit of the current implementation

### Existing review model

`src/App.tsx` currently owns a `Mistake` record with:
- a question-derived ID, lesson ID/title, and a full question snapshot;
- `dueAt`, `intervalDays`, `repetitions`, `easeFactor`, `errorCount`, and `lastCorrect`.

The current scheduler uses a fixed successful interval sequence of 1, 3, 7, 14, and 30 days. Incorrect answers return after 10 minutes and reset the successful repetition count. The stored `easeFactor` is not currently used in interval calculation. The same card can be updated after correct and incorrect answers. The weak-review screen includes all cards with an error count, irrespective of due date; scheduled review includes only due cards.

### Browser persistence

- Mistakes: `alifly-mistakes`
- Completed lessons: `alifly-completed-lessons`
- Streak: `alifly-streak`
- Last study date: `alifly-last-study-date`
- Exam state: `alifly-stage-1-exam-passed`
- Theme: `alifly-theme`
- Daily goal/activity use user-scoped keys.

Reads and writes are guarded with try/catch, so the app can continue in memory when browser storage is unavailable. Browser storage is device/browser scoped and can be cleared by the user.

### Firebase / Firestore

Authentication is provided by Firebase Authentication. The app reads and writes the signed-in user's progress document at `users/{uid}/progress/current`. It loads cloud progress before enabling cloud writes, then debounces merged writes by 600 ms. The progress document currently contains completed lesson IDs, mistakes, streak, last study date, exam state, daily goal/activity, and an update timestamp.

The Firebase initialization currently calls `initializeFirestore(app, { ignoreUndefinedProperties: true })` without explicitly enabling persistent Firestore local cache. Therefore the app's own localStorage persistence and Firestore's SDK cache must not be treated as the same storage layer.

The repository contains `firestore.rules`. Its currently tracked version allows an authenticated user to read/write descendants under their own `users/{uid}` path. This source file does not prove which rules are deployed in Firebase. Draft PR #31 proposes a stricter allowlist and denies unlisted nested collections; a new memory collection could be rejected if that ruleset is deployed. Before adding cloud writes, inspect the Firebase Console's deployed rules and verify the exact schema and per-user isolation in the Firestore Emulator. Never assume client-side UID scoping is an authorization boundary.

## New foundation

The new `src/memory/` module is independent of React and the current lesson implementation.

- `types.ts`: versioned memory item, skill, error, grade, event, and state types.
- `engine.ts`: pure functions to create an item, schedule a review, select due items, and append a bounded review event history.
- `storage.ts`: versioned, user-scoped localStorage keys with defensive parsing and graceful failure.

The new model stores stable content references (type + ID), not copied lesson prompts, answer choices, translations, or Arabic text. This avoids duplicating educational content and reduces the risk of stale copies when a lesson is revised.

Review grades are `again`, `hard`, `good`, and `easy`. Error categories are separate from the grade. The initial scheduler is an explainable heuristic: Again = 10-minute retry; Good = 1/3/7/14/30-day ladder; Hard = a modest interval increase; Easy = a larger interval increase. Ease factor is bounded from 1.3 to 3.0. These are product defaults, not a clinically or scientifically validated prediction of forgetting.

## Identity and sync policy

- Guest memory uses a guest-scoped key.
- Signed-in memory uses a distinct UID-scoped key.
- No guest-to-account merge is performed in this foundation.
- No Firestore writes are added in this foundation.
- The existing `alifly-mistakes` key is not deleted, rewritten, or migrated.

Stage 2 adds deterministic IDs by hashing the current legacy question ID. This prevents raw question text from being copied into the new memory record, but the hash is a lightweight identifier, not cryptographic anonymization. When curriculum content receives explicit immutable IDs, the adapter should migrate to those IDs. A reviewed legacy migration and account-switching tests are still required before syncing or migrating existing records.

Before cloud sync is enabled, confirm deployed Firestore rules allow only the authenticated owner to read/write their own memory records. Prefer a dedicated `users/{uid}/memory/{itemId}` path or another explicitly bounded schema, with validated fields and limits. Avoid expanding the current monolithic progress document indefinitely.

## Next implementation steps

1. Add learner-facing Hard / Good / Easy self-assessment and optional error-cause selection without changing lesson prompts.
2. Expand memory items beyond question-level records to letter, vowel-mark, word, reading, and grammar skills using immutable curriculum IDs.
3. Migrate old question cards only when a reviewed ID mapping is available; preserve all unmapped legacy records.
4. Add per-user cloud sync only after deployed Firestore rules are verified and emulator/rules tests pass.
5. Add the learner-facing memory map and daily review session.
6. Validate account switching, offline/online behavior, and mobile browser storage failures.

## Acceptance criteria for this foundation

- Existing lesson and review UI remain unchanged.
- Existing localStorage keys and Firestore document fields remain unchanged.
- New state is schema-versioned and user-scoped.
- Invalid or unsupported saved data does not crash the app.
- Review scheduling is deterministic when a timestamp is supplied.
- Event history is bounded to avoid unbounded local growth.
