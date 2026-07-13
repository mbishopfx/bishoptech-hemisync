# Cognistration Tone Pack Commerce + Weekly Catalog Loop

## Objective

Operate a ten-pack, one-time audio storefront built from the existing `agentic_tones` library. Every pack is priced the same and targets about 50 minutes of total listening time.

## Pack lanes

- Deep Rest Pack — Delta
- Dream Threshold Pack — Theta
- Calm Focus Pack — Alpha
- Task Drive Pack — Beta
- Insight Edge Pack — Gamma
- Downshift Pack — Beta → Alpha → Theta
- Creative Current Pack — Alpha ↔ Theta
- Sleep Descent Pack — Theta → Delta
- Full Spectrum Pack — all five states
- Reset & Return Pack — Delta → Alpha → Beta

## Purchase path

1. Visitor selects a pack on `/packs`.
2. Visitor enters an email; no Cognistration account is required.
3. `/api/checkout` creates a Stripe payment-mode Checkout Session using the shared tone-pack price.
4. Stripe returns to `/packs/success`.
5. The success route verifies the paid session server-side, records the purchase, auto-starts the ZIP download, and sends a backup email when `RESEND_API_KEY` is configured.
6. Stripe `checkout.session.completed` is the idempotent backup fulfillment path.

## Weekly job

Run `npm run packs:weekly` from a clean checkout after the multi-pack migration is applied. The builder:

- reads playable rows from `agentic_tones`
- selects tracks deterministically per pack strategy
- fills each pack to at least 90% of the 50-minute target
- copies stable assets into the `tone-packs` bucket
- creates a ZIP bundle per pack
- upserts `tone_packs` and `tone_pack_tracks`
- prints source counts, per-pack track counts, durations, and bundle URLs

The weekly job must stop on missing credentials, an empty tone inventory, or an incomplete pack. It must not commit unrelated working-tree changes.

## Required deployment configuration

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TONE_PACK_PRICE_ID` and/or `NEXT_PUBLIC_TONE_PACK_PRICE_ID`
- `RESEND_API_KEY`
- `PACK_DELIVERY_FROM`
- Supabase URL + service role key

## Verification gates

- Apply `supabase/migrations/202607130001_multi_tone_pack_delivery.sql`.
- Run `npm run packs:dry-run` and confirm ten packs meet the duration threshold.
- Run `npm run packs:weekly` and verify Supabase row counts plus one public ZIP URL with a real HTTP fetch.
- Build the Next app and inspect Vercel build logs before treating a production deployment as healthy.
