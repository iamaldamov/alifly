# ALIFLY MEMORY ENGINE — Stage 2: Smart Review integration

## Scope

Stage 2 connects the versioned memory foundation to the existing lesson-answer flow. It is intentionally additive and does not change lesson content, Arabic text, transliteration, visual design, authentication, or the legacy mistake record format.

## Implemented

### Stable lesson identity

`src/memory/lessonAdapter.ts` converts the existing lesson/question identity into an opaque deterministic ID. The source question prompt is hashed; prompt text, answer options, correct answers, explanations, and translations are not copied into the new memory record.

### Answer capture

`src/App.tsx` now records each non-exam lesson answer in MEMORY ENGINE:
- Correct answer -> `good`
- Incorrect answer -> `again`
- Question mode `recall` -> skill `recall`
- Other existing question modes -> skill `recognition`
- Incorrect answer cause -> `unknown` until the learner-facing error diagnosis is introduced.

The existing Mistake card update continues to run unchanged alongside the new memory event.

### Per-user local persistence

Memory state is stored with the versioned key `alifly-memory:v1:{scope}`. Guest and signed-in accounts have separate local keys. When the auth UID changes, the in-memory state is reloaded from that UID's local key; the save effect is guarded by the active owner ID to prevent the previous account's state from being written under the new account's key.

### Smart due queue

The existing "Тренировка памяти" screen now chooses due dates from MEMORY ENGINE for cards that have a new memory record. Legacy cards without a memory record continue to use their original `dueAt` value. This preserves old users' progress while gradually moving new answers to the new scheduler.

## Intentionally deferred

### Firestore sync

The new memory state is not yet written to Firestore. The repository search did not find a checked-in Firestore rules file, and deployed rules cannot be verified from source code alone. Before adding a cloud field or subcollection, inspect the actual deployed rules and confirm per-user read/write access and field-size constraints. Firebase documents that security rules—not client-side UID scoping—are the authorization boundary (https://firebase.google.com/docs/firestore/security/rules-conditions).

The existing progress document is already used for other progress fields, but adding a new field may still be rejected by strict field allowlists. No assumption is made about the deployed rule set.

### Learner rating UI and error diagnosis

At this stage existing correct/incorrect outcomes map to Good/Again. Hard/Easy ratings and specific error causes (shape, dots, pronunciation, meaning, etc.) require a deliberate learner-facing interaction and should be introduced separately without changing lesson questions.

## Manual QA checklist

- [ ] Open a lesson and answer a question correctly; confirm a v1 memory item is created.
- [ ] Answer a question incorrectly; confirm a retry is scheduled after 10 minutes and an error event is recorded.
- [ ] Reload the page; confirm guest memory is restored.
- [ ] Sign in; confirm the signed-in UID uses a separate local storage key.
- [ ] Sign out; confirm guest memory is restored rather than the previous account's memory.
- [ ] Start the existing review session; confirm new cards follow MEMORY ENGINE due dates.
- [ ] Confirm legacy cards without a v1 memory item still follow their original due dates.
- [ ] Confirm exam answers are excluded, matching the existing mistake-tracking behavior.
- [ ] Confirm the original lessons, Arabic content, transliteration, and UI are unchanged.
- [ ] Run `npm run build` and verify GitHub Actions.

## Current limitation

Local persistence is implemented; cross-device/account cloud sync is not. The memory engine is connected to real lesson answers and the due-review queue, but learner-facing difficulty ratings and error diagnosis remain future work.
