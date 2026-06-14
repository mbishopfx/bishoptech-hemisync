# Cognistration State

Last updated: 2026-06-14

Platform facts
- Product name: Cognistration
- Domain: cognistration.com
- Website/runtime repo: /Users/matthewbishop/BishopTech.dev/bishoptech-cognistration
- iOS app: separate app; no shared account or sign-in with the website
- Monetization split:
  - iOS: Apple paywall
  - Website: Stripe
- Stripe webhook endpoint: https://cognistration.com/api/webhooks/stripe

Operating goals
- Keep the website, tone library, and iOS surface in sync.
- Keep Stripe checkout, webhook delivery, and billing state healthy.
- Expand the tone library over time with at least 2 new tone variants per loop session when tone work is touched.
- Keep the backend healthy and buildable after tone or blog additions.
- Audit one backend section per loop so coverage rotates over time.

Monitoring checklist
- Site build passes
- Runtime health route responds
- Stripe webhook endpoint responds and verifies signatures
- Checkout sessions can be created with current env vars
- Payments, refunds, invoices, and subscription events are flowing
- Tone generation path still works
- Blog sharing path still works
- iOS sync assumptions still hold
- Stripe/Apple paywall assumptions still hold

Open questions
- Where the iOS app repo will move next
- Which exact backend sections should get the highest priority
- Which blog-to-iOS sync path is currently authoritative
- Whether tone generation should be fully automated or gated by a manual review step

Current loop focus
- Morning: tone variants + content sync + quick build check
- Evening: backend section audit + bug sweep + build verification
- Rotation: auth/paywall, tone generation, blog publish/share, app sync, analytics, Stripe health/webhooks, admin/ops

Loop note
- 2026-06-13 morning: added theta-liminal-settle and alpha-clear-window tone variants, regenerated homepage wavs, confirmed `npm run build`, and verified `GET /api/health` returns healthy on the running runtime.
