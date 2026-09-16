# T010 Crawl and Discovery Worker Receipt

## Result

Done. Added all four substantial tutorial spokes to robots, sitemap, `llms.txt`, and shared public-route discovery. Consolidated approved public fallbacks on `https://cognistration.com`, preserved private/API crawler blocks and BishopTech contact/parent-brand references, avoided fabricated dates and crawler-specific ranking claims, and safely removed duplicate pricing/machine head metadata already covered by route layouts.

## Changed Files

- `app/robots.js`
- `app/sitemap.js`
- `app/llms.txt/route.js`
- `lib/seo.ts`
- Deleted `app/pricing/head.js`
- Deleted `app/machine/head.js`

## Verification

- Targeted ESLint: pass.
- Billing tests: 5/5 pass.
- Studio tests: 13/13 pass.
- Next dev compile: pass for robots, sitemap, `llms.txt`, hub, four spokes, pricing, and machine.
- HTTP checks: all affected endpoints returned 200.
- Crawl assertions: pass for Cognistration origin, five tutorial routes, private/API exclusions, and no fabricated tutorial `lastModified`.
- `llms.txt` assertions: factual navigation, all tutorial routes, no ranking claims.
- Pricing/machine pages: exactly one canonical each.
- Scope manifest: exactly six allowed paths changed.
- Backup: `/tmp/cognistration-t010.SRcUA9`.
- Pre-manifest SHA: `2af3017163f3dc92a1dbcad902a6c2d9f2c51d63b2ee83c99bde4aafc6f2e954`.
- Post-manifest SHA: `e02eb5a457e29acfc1488bd0c83c543277b7696ea6a2dcb4b4113c622445f722`.
