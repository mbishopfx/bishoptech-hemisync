# NeuroSync Community + Monetization Goal

> **For Hermes:** Treat this as the standing goal for NeuroSync feature work.

**Goal:** Turn NeuroSync into a community-driven tone platform where the product ships one small community feature per day and the monetization model centers on tone packs plus a starter subscription that includes monthly tone drops.

**Architecture:** Keep the web app and Supabase as the system of record. Community features should stay lightweight, visually quiet, and aligned with the existing premium/meditative design language. Monetization should evolve toward bundled tone packs, tiered subscriptions, and automated tone generation so the catalog grows continuously without manual bottlenecks.

**Tech Stack:** Next.js App Router, Supabase, Stripe, Vercel, the current audio rendering pipeline, and the existing tone library generator.

---

## Standing product direction

- One meaningful community feature shipped per day, committed to `main` when green.
- Tone packs become the core retail product.
- The starter subscription becomes the entry bundle at $9 and includes monthly tone pack access.
- A new Stripe price ID will be required before wiring the final subscription flow.
- Automated tone generation should target at least 100 fresh tones per day where the pipeline can support it.
- New tone experiences must preserve the scientific core: stereo-fed tones, precise frequencies, entrainment logic, and calm/ambient layering when appropriate.

## Near-term feature themes

- Community profiles and identity
- Session sharing and reactions
- Comments or lightweight discussion under sessions
- Creator/community highlights
- Moderation and safety tooling
- Tone pack storefront and subscription onboarding
- Library organization for packs, bundles, and monthly drops

## Guardrails

- Do not replace the entrainment model with generic ambient music.
- Keep all audio features grounded in frequency logic and stereo separation.
- Avoid cluttered UI patterns or loud SaaS styling.
- Keep monetization simple enough to explain in one sentence.
