# T012 Render and Discoverability Audit

## Decision

Not complete. All five tutorial routes render successfully with strong core UX, metadata, schema, crawl, motion, and safety evidence, but direct defects remain.

## Proven Passes

- All five tutorial routes compile and return 200 at 1440px and 390px.
- One H1 per route; no horizontal overflow.
- Critical content exists in server HTML and remains visible after hydration.
- Hub has exactly four canonical spoke links.
- All spokes have visible breadcrumbs and parseable BreadcrumbList JSON-LD.
- Unique rendered title, description, canonical, Open Graph, and Twitter metadata on spokes.
- Four or five visible authoritative sources per spoke.
- Logical keyboard order, `:focus-visible`, and visible outlines on sampled targets.
- Reduced motion leaves zero hidden reveals or animation-injected reveal styles; normal motion animates 15 reveal targets and 24 signal bars.
- anime.js is isolated, scoped, and cleaned up with `scope.revert()`.
- `/images/logo.png` appears only in PublicHeader. Both public supplied-mark files exactly match attachment SHA-256 `5fa96928cd4a5c6002cfceb34b9d6ec45b3fad1f22d5b132a3f3da81d869e382`.
- robots, sitemap, and `llms.txt` return 200, include the tutorial cluster, and preserve private/API exclusions.
- No HowTo/FAQ schema or unsafe guarantee language.
- Full lint: 0 errors, one pre-existing pricing hook warning.
- Billing 5/5 and Studio 13/13 pass.

## Direct Failures

1. `/tutorial` has no shared footer; all four spokes render `PublicTrustFooter`.
2. Initial browser load requests `/favicon.ico` and receives 404.
3. `app/layout.js` injects a homepage WebPage JSON-LD node on every route, creating duplicate/conflicting page entities with route-level WebPage markup.
4. Eleven existing metadata surfaces declare the exact supplied 1254x1254 social asset as 886x886.
5. The protected PublicHeader mobile-menu toggle has no accessible name, `aria-expanded`, or `aria-controls`.
6. `/community` masks `createServerClient is not a function` from `lib/supabase/server.js` while returning 200.

## Evidence Gaps

- Authenticated Workshop/dashboard UI behavior is supported by source inspection and tests but not a browser session with safe credentials.
- The extended internal-route crawl stopped after `/contact`; tutorial routes and major public routes through contact passed.
- The Playwright wrapper is stale; the audit used the required wrapper with a `/tmp`-only compatibility shim and did not change repo/skill files.

## Proposed Repairs

- Add `PublicTrustFooter` to the tutorial hub.
- Remove global homepage-only WebPage schema, add a supplied-mark favicon, and correct all stale social-image dimensions.
- Allow a minimal non-logo PublicHeader accessibility repair after Judge approval.
- Judge whether the `/community` runtime defect belongs in this discoverability tranche or should be isolated.
- Repeat the rendered/schema/crawl audit after repairs.
