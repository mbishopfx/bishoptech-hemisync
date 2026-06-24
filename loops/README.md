# Cognistration Loop System

This folder is the operating memory for the Cognistration platform.

Purpose
- Keep the website/runtime, tone generation, and iOS surfacing aligned.
- Preserve a resumable state file so each loop session knows what changed last.
- Make the platform improve continuously without relying on chat context.

Core rules
- Do not store secrets here.
- Use the state file for goals, current focus, open questions, and last-run notes.
- Every loop session should:
  - check what changed since the last run
  - verify the site/runtime still builds
  - verify content sync rules still hold
  - generate at least 2 tone variants when tone work is touched
  - record findings back into state.md

Loop cadence
- Morning loop: content, tone, sync, and build readiness.
- Evening loop: backend section audit, bug sweep, and build verification.
- SEO growth loop: every 3 days, inspect Search Console trends, turn query/page gaps into candidate pages and social angles, and re-ping the sitemap after publish.
- BishopTech.dev growth loop: every 3 days, inspect bishoptech.dev Search Console trends and convert service-intent gaps into new pages that speak to builds, prototypes, debugging, hosting, and rescue work.
- Section rotation: one backend area gets a deeper pass each session so the whole app is covered over time.

Related docs
- state.md: current operating memory
- morning-loop.md: morning routine
- evening-loop.md: evening routine
- backend-rotation.md: section-by-section audit map
- seo-growth-loop.md: 3-day Search Console and content-growth workflow
- seo-growth-state.md: current SEO growth notes
- bishoptech-growth-loop.md: bishoptech.dev service-page and blog-growth workflow
- bishoptech-growth-state.md: current bishoptech.dev growth notes
