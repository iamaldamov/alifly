# ALIFLY — full QA audit

**Date:** 2026-11-23  
**Scope:** repository review on `feature/alifly-smart-review-integration`, including the SMART REVIEW pull request, authentication/progress lifecycle, local storage, CI, PWA shell, SEO artifacts, and current security boundaries.

## Executive result

The latest feature-branch commit passed GitHub Actions unit tests and the TypeScript/Vite production build. Static review also found and corrected account-isolation and review-persistence defects that were not covered by the original unit tests.

This is **not a claim that the deployed website has passed complete end-to-end QA**. The feature branch is not deployed, the live site could not be inspected with the available browser access, and real iPhone/Android interaction has not been performed.

## Findings corrected in this audit

### High — account progress could cross session boundaries

- Guest legacy progress was stored in global localStorage keys and could be overwritten by a signed-in user's progress.
- Signing out did not restore the guest snapshot in React state.
- A first-time account with no Firestore progress document could inherit the guest state because the old reset condition depended on a previously stored account marker.
- A previous account's progress could briefly render while Firebase authentication/progress was still resolving.

**Correction:** legacy progress writes are now guest-only and require the active progress owner to be guest; sign-out reloads guest data; empty/new accounts start with empty progress; the app waits for the active owner before showing the learning screen. A cloud-load failure clears stale in-memory progress rather than exposing another session's data.

### High — memory assessment could be lost or duplicated

- Closing a lesson after answering but before pressing Next could lose the selected memory grade.
- The Escape-key listener could retain an outdated callback from the first render of a lesson.
- Repeated activation of Next/close could save the same assessment more than once.

**Correction:** assessment save is invoked on explicit close and Escape; the Escape handler reads the latest callback through a ref; an assessment key prevents duplicate commits within the same question/session.

### Medium — guest and account memory keys could collide

- A Firebase UID literally equal to `guest` mapped to the guest key.
- A broad namespace change would have broken compatibility with existing signed-in users' v1 keys.

**Correction:** guest and the literal UID `guest` now have separate keys while all other existing signed-in key formats remain unchanged.

### Medium — unreviewed skills appeared as weak

Skills with no review events could appear in the weakest-skill list with a misleading 0% score.

**Correction:** the weak-skill insights list now includes only skills with at least one recorded review attempt.

### CI coverage

- Vitest added for the pure memory engine, storage parser/writer, lesson identity adapter, and analytics.
- The build workflow runs unit tests before the TypeScript/Vite build.
- The Pages deployment workflow also runs unit tests before building the deploy artifact.

## Latest automated validation

Latest branch head at audit time: `0506693405ee579b287b32e1b602d2901f85d399`.

- Push workflow: [45196565402](https://github.com/iamaldamov/alifly/actions/runs/45196565402) — passed.
- Pull-request workflow: [45196579620](https://github.com/iamaldamov/alifly/actions/runs/45196579620) — passed.
- Both runs completed `Install dependencies`, `Run unit tests`, and `Build project` successfully.
- 14 unit tests cover scheduling grades/intervals, due ordering, bounded event history, account storage keys, malformed/oversized storage, stable identity, and memory insights.

## Remaining release blockers / limitations

1. **End-to-end browser and mobile QA:** not performed. Test the actual published build on iPhone Safari and Android Chrome, including touch targets, keyboard/VoiceOver behavior, modal closing, theme contrast, reload, offline and poor-network states.
2. **Authentication integration tests:** account-switching logic was statically reviewed and guarded, but no automated React/Firebase emulator test currently simulates sign-in A → sign-out → guest → sign-in B, a first-time account, and cloud-load failure.
3. **Deployed Firestore rules:** the tracked `firestore.rules` file allows an authenticated user to write any descendant under their own `users/{uid}` path. Draft PR #31 proposes narrower profile/progress rules. Source control does not prove which rules are deployed in Firebase. Do not enable memory cloud sync until deployed rules are inspected and owner-isolation/rules tests pass.
4. **Memory cloud sync:** not implemented. SMART REVIEW data remains local to the browser/device and account UID.
5. **Dependency reproducibility:** the repository currently has no committed `package-lock.json`; workflows use `npm install`. Add and maintain a lockfile before relying on deterministic dependency resolution.
6. **Arabic content sign-off:** the repository's editorial notes explicitly say that the current course still needs final review by a qualified Arabic teacher. This audit did not rewrite or certify Arabic lesson content.
7. **SEO crawling:** the project-path `robots.txt` cannot control the GitHub Pages origin-root robots policy. The sitemap currently lists only the public homepage; the app is client-rendered. A crawlable public learning landing page and root-domain robots strategy remain separate SEO work.
8. **Pull-request structure:** PR #58 adds the foundation to `main`; PR #59 is stacked on the foundation branch; PR #60 targets `main` from the same integration branch and includes the combined work. Review/merge order must be deliberately consolidated to avoid merging overlapping stacked PRs twice.

## Files and boundaries

- No changes were made to `main`.
- No production deployment was triggered.
- No Arabic lesson text, translations, transliterations, or religious content were changed in this audit.
- No Firestore schema or deployed rules were changed.
- Existing legacy progress keys are preserved for guest use; existing signed-in memory key formats are preserved for compatibility.
