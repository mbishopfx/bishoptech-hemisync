# T019 Post-Repair Audit

## Result

Partial pass with two runtime-log defects and external proof gaps.

## Direct Passes

- All 19 `PUBLIC_ROUTES` rendered, including routes after `/contact`.
- All five tutorial routes passed at 1440px and 390px: one H1, zero horizontal overflow, footer present, route-correct canonical/metadata, and 1254x1254 social dimensions.
- Browser console: zero errors and zero warnings.
- Homepage has exactly one homepage WebPage; tutorial hub has one route WebPage; each spoke has one route WebPage plus one three-item BreadcrumbList; no duplicate homepage entity.
- Mobile menu exposes correct open/close name, expanded state, controlled element, and Enter-key behavior.
- robots, sitemap, `llms.txt`, and favicon return 200; tutorial cluster and private/API exclusions are correct.
- Supplied mark and OG preview exactly match the attachment. `/images/logo.png` appears only in PublicHeader; dashboard uses supplied mark.
- `/community` returns 200 without the former Supabase helper error; missing profile returns correct 404.
- No HowTo/FAQ schema or unsafe guarantee, treatment, product-induced, or CIA-proof claims.
- Full lint: zero errors, one existing pricing hook warning.
- Billing 5/5 and Studio 13/13 pass.
- Protected header-logo, Workshop, Studio, and dashboard source invariants remain intact.

## Remaining Runtime-Log Defects

1. A missing community profile correctly returns 404 but emits Next 15 synchronous `params.username` errors from `app/community/[username]/page.js`. Narrow fix: await `params` in `generateMetadata` and `PublicProfilePage`.
2. `/packs` renders 200, but `/api/packs` logs `Pack catalog refresh failed; using committed catalog fallback: TypeError: fetch failed`. The committed fallback works; Judge must classify whether upstream local availability is in scope.

## External/Protected Proof Gaps

- Existing safe credentials were attempted without exposure, but login returned `Failed to fetch`; authenticated Workshop/dashboard render remains source/test-proven only.
- No real public profile was discoverable; missing-profile behavior is directly proven.
- Reduced-motion was directly proven in T012 and source-proven now, but not repeated in this shortened pass.
- Vercel compile proof remains blocked under T013 by the missing correct repository/remote.
- The Playwright wrapper remains stale; a `/tmp` compatibility shim was used and no repo/skill files changed.
