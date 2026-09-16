# BishopTech.dev Growth State

Last updated: 2026-07-16

Property
- Domain: bishoptech.dev
- Repo: /Users/matthewbishop/BishopTech.dev/bishoptech-cognistration
- Cadence: every 3 days

Current objective
- Turn Search Console trends into BishopTech.dev service pages and blog posts that attract small businesses and entrepreneurs.
- Focus on builds, prototypes, debugging, hosting, management, and rescue work for abandoned or vibe-coded projects.

Current data status
- A live Search Console query against `sc-domain:bishoptech.dev` failed with `403 PERMISSION_DENIED` because the token is missing `https://www.googleapis.com/auth/webmasters`.
- No verified comparison for the last 3 days vs. the previous 3 days is available this run, so clicks, impressions, CTR, and position should be treated as unknown.
- Keep the watchlist active until real GSC signal returns; do not force publication from inaccessible data.

Watchlist topics
- Rescue work for broken or abandoned websites
- Prototype-to-production cleanup and hardening
- Debugging, hosting, and maintenance retainers
- "My developer vanished" recovery for small-business sites and apps
- Calm, reliable build-partner positioning for founders who need the thing finished

Today’s take
- Top trend summary: no verified Search Console trend signal this run; the data is sparse/inaccessible from the current token.
- Recommended opportunity set: an "Emergency Website Rescue" service page, a "Prototype to Production" page, a "Developer Vanished? We Can Take Over" page, a hosting/maintenance page, and a short FAQ or checklist post for the first 48 hours after a site breaks.
- Social angles: recovering from an abandoned build, moving from prototype to production without starting over, choosing a calmer technical partner, and what a rescue plan should include for a small business.
- Publish next: no — keep the watchlist and rerun once Search Console scope is restored.

Publishing rule
- Only publish when a topic clearly maps to search demand or a strong conversion opportunity.
- After publish, ensure the page is in sitemap.xml and submit it for indexing.

Current next step
- Restore Search Console access with the `webmasters` scope, then rerun the 3-day comparison before drafting anything new.

2026-06-22 run note
- Search Console access is still blocked for bishoptech.dev in this token family: the OAuth token is missing `https://www.googleapis.com/auth/webmasters`, and the live `sc-domain:bishoptech.dev` query returned 403.
- Trend summary: no verified 3-day vs. previous 3-day comparison is available; clicks, impressions, CTR, and position remain unknown from live GSC.
- High-intent opportunity set to keep watching: "Emergency Website Rescue", "Developer Vanished? We'll Take Over", "Prototype to Production", managed hosting / maintenance, rapid debugging, and a short 48-hour rescue FAQ or checklist.
- Social angles worth testing later: rescuing abandoned builds, taking over after a developer disappears, finishing prototypes without starting over, and calm support for broken sites/apps.
- Draft next: not yet. Keep the watchlist and only draft once real GSC demand confirms one of these rescue-focused topics.

2026-06-24 compliance / AI-search audit note
- Policy and trust pages are present and linked from the public footer or legal shell: privacy, terms, cookies, AI disclosure, contact, and health warning.
- `robots.txt`, `sitemap.xml`, and `llms.txt` are live and sensible; sitemap coverage includes the main public pages plus blog posts, and the latest generated lastmod is current.
- Canonical, Open Graph, Twitter card, and JSON-LD metadata are present on the homepage, legal pages, contact, blog archive, blog posts, pricing, tutorial, and machine pages.
- Verified via `npm run build` and live requests on a local 3001 server.
- No blocking compliance or indexability gaps found; keep an eye on cookie-consent/legal review if the analytics or storage footprint changes.
- 2026-06-25 audit: hardened the private utility routes with `X-Robots-Tag: noindex, nofollow, noarchive` for `/dashboard`, `/generate`, `/login`, and `/signup` in middleware, then verified the header on a local 3017 server. Public routes, robots, sitemap, and llms coverage still look healthy.

2026-07-15 BishopTech growth/compliance audit
- The current repo contains a dedicated `/services` lead-generation surface linked from the homepage, public header/footer, sitemap, robots, and `llms.txt`.
- Corrected the rendered services title from `BishopTech Services — Cognistration` to `BishopTech Services | iOS, Web, Voice & Workflow Builds`; aligned Open Graph/Twitter titles and site name to BishopTech; and made the Service JSON-LD provider an explicit BishopTech organization record.
- `npm run lint` passed with one existing pricing `handlePlayTone` dependency warning. `npm run build` passed on Next 15.5.14 with the existing pricing/dashboard hook warnings and stale Browserslist notice.
- Fresh standalone smoke checks on `:3099` returned 200 for the homepage, services, contact, policy, blog, pricing, packs, `llms.txt`, `robots.txt`, and `sitemap.xml`. `/services` emitted the corrected title, canonical, and Service JSON-LD.
- External production verification remained unavailable: the web extraction/search backends failed and direct curl required security approval. No production deployment or indexing submission was attempted.
- High-priority remaining items: reconcile deployed production route drift when access is available, restore Search Console `webmasters` scope before making demand-led content decisions, and obtain business-owner/legal review of entity/address details and final policy language.

2026-07-16 BishopTech growth/compliance audit
- No public code fix was needed in the current tree: the `/services` lead-generation page remains linked from the homepage, public header/footer, sitemap, robots, and `llms.txt`; service metadata and Service JSON-LD identify BishopTech; and the public policy/support surfaces remain present.
- `npm run lint` passed with one existing pricing `handlePlayTone` dependency warning. `npm run build` passed on Next 15.5.14 with that warning plus the two existing dashboard hook warnings and stale Browserslist data notice.
- A fresh standalone runtime on `:3120` returned 200 for the homepage, services, contact, policy pages, blog, pricing, packs, community, `llms.txt`, `robots.txt`, and `sitemap.xml`. Internal-link crawl checked 27 same-origin targets with no failures. Billing tests passed 5/5; `git diff --check` passed.
- Local `/api/health` returned 500 because the Supabase health dependency is unavailable in this environment. External production checks could not be completed because the extraction backend was unavailable and direct curl required security approval; no deployment or indexing submission was attempted.
- Readiness: local repo and public-route surface are ready for continued traffic push, subject to production recheck, Search Console scope restoration, and business-owner/legal review of entity/address details and final policy language.
