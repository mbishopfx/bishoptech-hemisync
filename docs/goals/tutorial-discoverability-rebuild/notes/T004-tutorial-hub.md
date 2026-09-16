# T004 Tutorial Hub Worker Receipt

## Result

Done.

Changed `app/tutorial/page.js`, `app/tutorial/layout.js`, `components/tutorial/TutorialMotion.jsx`, and `public/images/cognistration-mark.png`. Deleted redundant `app/tutorial/head.js`.

The tutorial is now server-rendered and contains clear before/during/after instructions, safety and stop guidance, mixed-evidence audio-science language, authoritative sources, four planned spoke links, current monthly-membership CTA language, canonical metadata, WebPage JSON-LD, and the exact supplied mark. anime.js is isolated to a client leaf and uses scoped transform/opacity choreography, cleanup, and reduced-motion handling; content does not depend on JavaScript visibility.

## Safeguards

- Backup: `/tmp/cognistration-t004.JlCNWO/existing-allowed-files.tar.gz`
- Pre-manifest: `/tmp/t004-pre-manifest.sha256` (`6d1a99967604294606d03d0b4797dd27bb1c5a60072211b2430ff2f4b2417157`)
- Post-manifest: `/tmp/t004-post-manifest.sha256` (`78962a5285792c0d9de4d472872fd56f738291841dc92616a7aa55496c6217c8`)
- Manifest comparison found only the five allowed paths changed or deleted.
- Supplied attachment SHA-256 and exact `cmp` both passed.

## Verification

- Targeted ESLint: pass.
- Billing tests: 5/5 pass.
- Studio tests: 13/13 pass.
- Next dev `/tutorial` compile: pass, HTTP 200, 4,418 modules compiled.
- HTML assertions: pass for the workflow, safety, science caveat, four spoke links, canonical, supplied mark, WebPage JSON-LD, and removal of stale free/premium-tier copy.
- Local build intentionally not run under `GEMINI.md`.

The four planned spoke links remain 404 until T006–T009 land. Vercel compile proof remains blocked separately.
