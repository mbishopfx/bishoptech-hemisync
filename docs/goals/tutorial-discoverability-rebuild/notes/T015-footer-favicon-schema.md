# T015 Footer, Favicon, and Schema Worker Receipt

## Result

Done. Added `PublicTrustFooter` after tutorial motion, created a 64x64 32-bit favicon derived solely from the checksum-verified supplied mark, moved homepage-only WebPage JSON-LD out of the global layout and into the homepage, and preserved global Organization/WebSite entities.

## Verification

- Supplied attachment SHA-256: pass.
- Favicon conversion/type: pass; derived solely from supplied mark.
- Targeted ESLint: pass.
- Billing 5/5 and Studio 13/13: pass.
- `/`, `/tutorial`, a spoke, pricing, and `/favicon.ico`: HTTP 200.
- Tutorial footer: rendered.
- JSON-LD: exactly one correct homepage WebPage on `/`; one route-correct WebPage on tutorial routes; no homepage entity on spokes/pricing; Organization/WebSite preserved.
- PublicHeader and legacy header logo: checksum-confirmed unchanged.
- Exactly four allowed paths changed.
- Backup: `/tmp/cognistration-t015.oEFHs5`.
- Favicon SHA: `30411cccaa9bee54ed548e5dc09fe91b6ac6a30995e5849cde1f78843e4d44ba`.
- Pre-manifest SHA: `2bfec62f0ac14388ba0f4ac6f98fa064ed9bfce16845eb63cb09f79a21ce22e1`.
- Post-manifest SHA: `4e3f626c361de31b633a7640a9bb03a7be934a6ab5b3e79bf9d490ace4cfe2e7`.
