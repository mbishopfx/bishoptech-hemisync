# T006 Meditation and Self-Exploration Worker Receipt

## Result

Done. Added a reusable server-rendered tutorial article shell, accessible visible breadcrumbs with matching BreadcrumbList JSON-LD, and a substantial meditation/self-exploration guide.

The guide covers sound-supported meditation, intention setting, body awareness, post-session reflection, metaphysical self-inquiry as personal meaning rather than scientific fact, evidence boundaries, when to stop, and sources from NCCIH, Goyal et al., Farias et al., and WHO.

## Changed Files

- `components/tutorial/TutorialArticleShell.jsx`
- `components/tutorial/TutorialBreadcrumbs.jsx`
- `app/tutorial/meditation-self-exploration/page.js`

## Verification

- Targeted ESLint: pass.
- Billing tests: 5/5 pass.
- Studio tests: 13/13 pass.
- Next dev route and hub: HTTP 200.
- HTML assertions: pass for title, canonical, supplied-logo OG/Twitter metadata, visible breadcrumbs, WebPage/BreadcrumbList JSON-LD, sources, disclaimer, distinct intent, and internal links.
- Manifest comparison: exactly three allowed paths changed.
- Backup: `/tmp/cognistration-t006.t7J3IZ`.
- Pre-manifest SHA: `c2f5a319e6c22e9a063a748019079fd679333328aaa770713ff387e85bccbc88`.
- Post-manifest SHA: `6f3162202c06e408cd367d76e76474b020a57fa4b9499173ace36c1ebcb7fa22`.
