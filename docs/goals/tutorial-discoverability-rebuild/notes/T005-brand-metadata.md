# T005 Brand and Metadata Worker Receipt

## Result

Done. Replaced `public/images/og-preview.png` with an exact byte copy of the supplied logo and migrated the approved homepage, machine, global layout, blog schema, and shared SEO consumers to `/images/cognistration-mark.png`. Corrected public canonical fallbacks to `https://cognistration.com` while preserving the separate “Powered by BishopTech” attribution and the `bishoptech.dev` support email.

## Changed Files

- `public/images/og-preview.png`
- `app/page.js`
- `app/machine/page.js`
- `app/layout.js`
- `app/blog/page.js`
- `app/blog/[slug]/page.js`
- `lib/seo.js`
- `lib/seo.ts`

## Verification

- Exact attachment comparison: both mark assets pass.
- Social dimensions and schema dimensions: truthful 1254x1254.
- Targeted ESLint: pass.
- Billing tests: 5/5 pass.
- Studio tests: 13/13 pass.
- `components/layout/PublicHeader.jsx` and `public/images/logo.png`: checksum-confirmed unchanged.
- Scope manifest: exactly the eight allowed paths changed.
- Backup: `/tmp/cognistration-t005.FZMhec/files`.
- Pre-manifest SHA: `78962a5285792c0d9de4d472872fd56f738291841dc92616a7aa55496c6217c8`.
- Post-manifest SHA: `f16f08325bfd9e8b8793dfac058a4d1f022e838e837f9cfceb748ec4de4bc1fa`.
- Local build intentionally not run.
