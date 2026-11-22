# ALIFLY — SEO foundation update

Date: 2026-11-22  
Target: GitHub Pages project site — https://iamaldamov.github.io/alifly/

## Changes in this pull request

- Rewrote the HTML title and meta description around real beginner learning intent: Arabic from zero, alphabet, pronunciation, vowel marks and practice.
- Added canonical URL and Russian hreflang declarations.
- Added Open Graph and Twitter summary metadata for link previews.
- Added conservative Schema.org JSON-LD for WebSite and SoftwareApplication. No unverified price, rating, review count or claims are included.
- Added a useful no-JavaScript fallback description.
- Added sitemap.xml with the one confirmed public canonical URL.
- Added robots.txt under the project path and refreshed the PWA manifest description.

## Important GitHub Pages limitation

This is a project site hosted under `/alifly/`, not a custom domain or the account's root site. A `robots.txt` file in this repository is published at `https://iamaldamov.github.io/alifly/robots.txt`, while crawlers conventionally check `https://iamaldamov.github.io/robots.txt` at the origin root. Therefore this repository-level robots file is useful as a project artifact / future custom-domain setup, but it cannot control crawling for the entire GitHub Pages origin. A root-level robots file requires the account's root Pages repository or a custom domain configuration.

## Indexing limitation and next technical step

ALIFLY is a Vite + React client-rendered application. The initial HTML contains metadata and a meaningful no-JavaScript fallback, but the interactive lesson interface is rendered by JavaScript. Google can render JavaScript, but rendering is a separate processing stage and not all crawlers execute it. If organic search becomes a key acquisition channel, consider pre-rendering a public educational landing page and a small set of genuinely useful, crawlable learning guides. Do not expose authenticated or user-specific lesson/progress screens to indexing.

## After merge / deployment

1. Open Google Search Console and add the URL-prefix property `https://iamaldamov.github.io/alifly/`.
2. Verify ownership using the method Search Console provides.
3. Submit `https://iamaldamov.github.io/alifly/sitemap.xml`.
4. Use URL Inspection for the homepage and run a live test after deployment.
5. Confirm the rendered page title, canonical URL, robots directives and structured data.
6. Monitor indexing and search queries over several weeks. Search ranking is not guaranteed by metadata changes.

## Keyword and content direction

Primary intent: `арабский язык с нуля`.

Supporting natural-language topics:
- арабский алфавит для начинающих;
- 28 букв арабского алфавита;
- как произносятся арабские буквы;
- огласовки в арабском языке;
- уроки арабского языка онлайн.

Use these phrases naturally in visible, genuinely useful content. Do not add keyword-stuffed hidden text or create thin duplicate pages.

## Scope / safety

No React learning logic, Firebase Auth, Firestore schema, user progress, lesson identifiers, Arabic source content or deployment workflow was changed. Sitemap intentionally contains only the verified homepage URL; the current app does not expose independent crawlable URLs for individual lessons.
