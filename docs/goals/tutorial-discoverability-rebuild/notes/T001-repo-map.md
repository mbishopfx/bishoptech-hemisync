# T001 Repo Map Receipt

## Result

Done. Cognistration is a Next.js 15 App Router application using npm, React 18, Tailwind, Framer Motion, and animejs 4.5.0. The current `/tutorial` is a 276-line client-only page with fragmented metadata, no breadcrumbs or subroutes, and no tutorial-specific reduced-motion handling.

## Key Evidence

- `app/tutorial/page.js`: client-only tutorial with seven listening cards, Framer Motion reveals, inline WebPage JSON-LD, and stale paid-funnel CTAs.
- `app/tutorial/layout.js` and `app/tutorial/head.js`: duplicate metadata declarations.
- `components/packs/PacksBrowser.jsx`: existing safe anime.js pattern using `createScope`, reduced-motion detection, scoped selectors, and cleanup.
- `components/layout/PublicHeader.jsx`: protected header directly uses `/images/logo.png`; this file and asset must remain unchanged.
- `components/dashboard/WorkshopComposer.jsx` and `app/dashboard/page.jsx`: protected simple Workshop and paid dashboard boundaries.
- `app/layout.js`, `lib/seo.js`, `lib/seo.ts`, `app/robots.js`, `app/sitemap.js`, `app/llms.txt/route.js`, and `middleware.js`: current fragmented brand, schema, metadata, and crawl surfaces.
- The blog registry contains 44 articles with overlapping neuroscience, meditation, dream, and altered-state topics; new tutorial spokes must satisfy distinct intent rather than duplicate them.

## Supplied Logo

`/Users/matthewbishop/.codex/attachments/8ceb77c4-082f-443e-9f1c-f2e31875d00e/image-1.png` is a 1254x1254 RGB PNG without alpha, SHA-256 `5fa96928cd4a5c6002cfceb34b9d6ec45b3fad1f22d5b132a3f3da81d869e382`. It is a near-black square with a white brain/hemisphere outline and cyan sinusoidal center line. It matches the current cyan/black visual system but differs from both `/images/logo.png` and `/images/og-preview.png`.

Add a distinct brand-mark asset and derived icon/social assets. Do not overwrite `/images/logo.png` because that would alter the header.

## Dependency and Verification State

- animejs 4.5.0 is already installed.
- `npm run lint`: passed with one pre-existing `react-hooks/exhaustive-deps` warning in `app/pricing/page.js`.
- `npm run test:billing`: 5/5 passed.
- `npm run test:studio`: 13/13 passed.
- `GEMINI.md` prohibits local builds due memory limits and requires Vercel CI/CD build evidence.
- Rendered verification should use `npm run dev`, browser audits at desktop/mobile/keyboard/reduced-motion modes, and HTML/canonical/JSON-LD/crawl-file curl checks.

## Ownership Risk

`git rev-parse --show-toplevel` resolves to `/Users/matthewbishop`, the app directory has no nested Git repository, and the entire app is untracked. There is no trustworthy diff, remote, or restore baseline. Every Worker must use narrow explicit file scopes and preserve unrelated content; the Judge must explicitly accept this constraint.

## Candidate Slices

1. Brand foundation: add separate supplied-logo and derived social/icon assets; update non-header metadata/schema consumers only.
2. Tutorial hub: server-first content plus isolated anime.js client choreography, reduced-motion support, and corrected paid CTA copy.
3. Research-approved topical spokes: distinct pages, breadcrumb UI/schema, primary sources, and intentional links to existing blog/safety pages.
4. Crawl/metadata consolidation: sitemap, robots, `llms.txt`, canonical metadata, social cards, and supported schema.
5. Rendered and Vercel verification.
