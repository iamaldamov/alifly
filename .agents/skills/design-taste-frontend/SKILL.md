---
name: design-taste-frontend
description: Project-adapted Taste Skill for ALIFLY. Use when auditing, designing, implementing, or polishing ALIFLY interface screens, components, responsive layouts, typography, and motion.
---

# ALIFLY — Taste Skill design standard

Use these instructions whenever changing ALIFLY's visual interface. The goal is a distinctive, calm, premium Arabic-learning product—not a generic landing page and not a copy of Duolingo.

## 1. Protect the product before changing it

- Start by inspecting the existing screen, components, styles, routes, and current Git diff.
- Audit first; state the specific usability or visual problems before editing.
- Make the smallest coherent change that solves the problem. Do not redesign unrelated screens.
- Preserve working learning flows, authentication, progress, audio, routing, SEO, and data behavior.
- Never replace or invent Arabic text, transliteration, pronunciation guidance, Qur'anic material, or translations. Flag uncertain educational/religious content for human verification.
- Do not remove existing motion or interaction without checking what depends on it.

## 2. ALIFLY visual direction

- Keep the established **Lime Noir** identity and current approved palette. Do not introduce a new theme or random accent colors.
- Aim for clear, warm, focused, premium educational UI: strong hierarchy, deliberate whitespace, readable type, restrained surfaces, and tactile controls.
- Avoid generic AI patterns: repeated glass cards, excessive gradients, arbitrary blobs, decorative dashboards, needless badges, and oversized empty hero sections.
- Use real product UI and purposeful learning visuals. Do not add stock photos or illustrations merely to fill space.
- Keep Arabic glyphs legible and correctly shaped. Use appropriate Arabic font fallbacks and test mixed Arabic/Russian text direction.

## 3. Layout and typography

- Establish a consistent spacing scale, alignment system, content width, and component rhythm.
- Make the primary learning action obvious on every screen.
- Use concise interface copy. Keep headings, instructions, labels, and helper text visually distinct.
- Prevent clipping, awkward wrapping, overflow, and text collisions—especially in Arabic and on narrow phones.
- Use consistent button, card, input, progress, and navigation patterns. Prefer rounded tactile controls already established by ALIFLY.

## 4. Motion and interaction

- Restore and preserve ALIFLY's smooth motion where appropriate; do not make the interface static.
- Use short, purposeful transitions for navigation, feedback, selection, progress, and lesson completion.
- Buttons should have clear hover/focus/pressed/disabled states; touch targets must be comfortable on phones.
- Avoid motion that delays learning, distracts from Arabic text, or causes layout shifts.
- Respect `prefers-reduced-motion`; provide a reduced-motion experience without breaking functionality.
- Do not add autoplay audio, flashing effects, parallax, or heavy WebGL effects to ordinary lesson screens.

## 5. Responsive and accessible quality

Review at minimum these viewport widths: **390, 768, 1024, and 1440 px**.
- Prioritize the iPhone/mobile experience; no horizontal scrolling or tiny controls.
- Keep navigation, lesson actions, audio controls, and progress visible and easy to reach.
- Check light and dark themes independently for contrast and legibility.
- Preserve semantic HTML, keyboard access, visible focus, labels, and accessible names.
- Check RTL and mixed-direction content, including punctuation and numbers.

## 6. Required review before calling a design task complete

- Inspect the changed screens in a real browser when browser tooling is available.
- Check all four viewport widths and both themes where relevant.
- Verify no console errors, broken images, missing fonts, clipped content, or dead controls.
- Run the repository's available checks: `npm test` and `npm run build` when the environment permits.
- Report what changed, what was actually tested, and anything not verified. Never claim a browser check or test passed if it was not run.

## 7. Scope and safety

This skill is a design and frontend quality standard. It does not authorize:
- changes to Firebase/Supabase credentials, secrets, auth providers, database rules, or deployment settings;
- destructive edits, direct force-pushes, or merging unrelated branches;
- changes to verified Arabic learning content;
- adding paid services, API keys, or dependencies without a clear need.

Prefer a focused feature branch and reviewable pull request. Keep ALIFLY's existing functionality intact while raising the quality of its interface.
