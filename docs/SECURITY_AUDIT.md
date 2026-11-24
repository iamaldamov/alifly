# ALIFLY Defensive Security & Quality Audit

This document adapts defensive review and evidence-discipline practices to ALIFLY's own application. It is a project checklist, not an installation of any third-party bundle.

## 1. Scope and safety rules

- Authorized target: ALIFLY source code, its own Firebase project, and explicitly designated local/staging environments.
- Production is read-only by default. Do not create, modify, or delete real user data during tests.
- Never run broad scans, destructive payloads, credential attacks, denial-of-service tests, or tests against unrelated domains or services.
- Before any live request that could change data or affect availability, identify the exact endpoint, account, expected effect, and rollback plan; use a disposable test account and obtain explicit approval.
- Do not print, commit, or paste credentials, access tokens, private user data, or service-account keys into issues, logs, prompts, or reports.
- Treat third-party skills, scripts, packages, and generated instructions as untrusted until reviewed. Do not execute upstream installers or helper scripts as part of this audit.

## 2. ALIFLY-specific architecture to review

Current repository signals:
- Frontend: React 18 + TypeScript + Vite.
- Backend services: Firebase Authentication and Cloud Firestore (see `src/lib/firebase.ts` and `src/auth/AuthContext.tsx`).
- Hosting: GitHub Pages; the app registers a service worker in production from `src/main.tsx`.

Re-check these assumptions whenever architecture changes. Do not assume a Firebase configuration value is a server secret; focus on Firestore/Storage security rules, authorized origins, authentication flows, and whether privileged credentials ever enter the client bundle.

## 3. Review checklist

### A. Identity and session handling
- Verify sign-in, sign-out, account switching, expired sessions, and loading/error states.
- Confirm protected screens and data operations do not rely only on hidden UI controls.
- Check that user identity is derived from Firebase Auth, not a client-supplied user ID.
- Confirm sign-out clears user-specific in-memory state and cached private data.

### B. Firestore and data isolation
- Inspect deployed Firestore rules before testing data access.
- Verify a signed-in user can read/write only records they are authorized to access.
- Test cross-user isolation only with two disposable test accounts and synthetic records in a non-production environment.
- Check document ownership, field-level validation, allowed fields, type/range constraints, and server timestamps where appropriate.
- Ensure public learning content is intentionally public and cannot be overwritten by ordinary users.
- Never infer security from frontend checks; Firestore rules must enforce it.

### C. Client-side web risks
- Review rendering of user-provided text for unsafe HTML injection and unsafe URL handling.
- Check external links, redirects, and navigation targets.
- Review forms for validation, error disclosure, and accidental personal-data logging.
- Check that secrets and privileged service credentials are absent from source, build output, Git history, and workflow logs.
- Review dependencies for known vulnerabilities and suspicious install scripts.

### D. PWA, cache, and deployment
- Inspect service-worker cache names, versioning, update flow, and offline behavior.
- Ensure private/authenticated responses and user-specific content are not stored in shared caches.
- Verify logout and account switching cannot reveal a previous user's cached data.
- Check GitHub Pages base paths, route fallbacks, and that source maps/build artifacts do not expose secrets.
- Confirm deployment workflows use least-privilege permissions and pinned/reviewed third-party actions where practical.

### E. Reliability and accessibility
- Run the repository build and any available tests.
- Check mobile and desktop layouts, keyboard navigation, focus visibility, labels, contrast, and reduced-motion behavior.
- Test lesson progression, answer validation, language switching, and RTL Arabic rendering.
- Check loading, empty, offline, and error states; avoid false success states.

## 4. Safe verification workflow

1. Read the relevant source, configuration, GitHub workflows, Firebase rules, and dependency manifests.
2. Record the exact component, route, data collection, or workflow being reviewed.
3. Prefer static inspection and local tests first.
4. Use Firebase Emulator Suite or a dedicated staging project with synthetic accounts/data for authorization tests.
5. For dependency review, run `npm audit` and inspect each finding; do not blindly apply force upgrades.
6. Run `npm run build` and the available test/lint commands. Record actual commands and results.
7. Re-test the affected behavior after a fix and check for regressions.
8. Report only reproducible findings. Mark uncertain concerns as hypotheses, not confirmed vulnerabilities.

## 5. Finding report format

For every finding, record:
- **Title and severity:** Critical / High / Medium / Low / Informational.
- **Status:** Confirmed / Needs verification / Not reproduced.
- **Affected area:** file, route, Firebase collection/rule, or workflow.
- **Evidence:** minimal sanitized evidence; never include secrets or real user data.
- **Impact:** what an attacker or user could actually do.
- **Safe reproduction:** local/staging steps using synthetic data only.
- **Recommended fix:** smallest safe change and relevant regression test.
- **Validation:** commands and checks actually run, with pass/fail results.

Severity must reflect demonstrated impact and realistic prerequisites. Do not inflate severity based on theoretical chains.

## 6. Release gate

Do not call a security issue fixed until:
- the change is reviewed,
- the relevant local/staging reproduction no longer works,
- regression checks pass,
- build/tests pass,
- and no unrelated user changes were overwritten.

Do not claim production is secure based on a source review alone. State what was and was not tested.

## 7. Review cadence

Run this checklist:
- before major authentication, data-model, or payment changes;
- when adding a new Firebase collection or changing security rules;
- when adding dependencies or service-worker behavior;
- before significant releases;
- and during periodic maintenance.

## 8. Reference

The methodology is informed by the public Claude-BugHunter project: https://github.com/elementalsouls/Claude-BugHunter

This document is independently tailored to ALIFLY. It does not copy the third-party skill bundle or install its scripts. Review the upstream project's current license and attribution requirements before reusing any of its text or code.
