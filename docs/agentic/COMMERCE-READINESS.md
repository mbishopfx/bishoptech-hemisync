# Cognistration agentic commerce readiness

## What is implemented

- Public tone-pack checkout: `create_tone_pack_checkout` resolves a published slug to the server-owned Stripe price, requires explicit confirmation, and returns a Stripe-hosted checkout URL.
- Paid delivery: `get_tone_pack_delivery` verifies the Stripe Checkout Session before returning the protected pack delivery URL.
- Machine workshop access: the live Stripe product is a one-time `$2.99` pass. A paid session issues an encrypted, hashed, revocable key valid for 24 hours and limits each machine workshop session to 60 minutes.
- UCP discovery: `/.well-known/ucp` advertises REST and MCP transports, checkout/order capabilities, payment handlers, canonical policy links, and the provider-gated autonomous-payment extension.
- UCP checkout lifecycle: create, get, update, complete, cancel, order lookup, server-derived totals, hosted-checkout escalation, idempotency keys, signed order webhooks, and refund/dispute state handling.
- Machine Payments Protocol: `POST /api/machine-payments/session` uses `mppx` and Stripe shared-payment-token verification when enabled. It returns a 402 challenge until a compatible agent supplies a provider credential, then issues a durable one-hour grant bound to the verified receipt. `/machine` validates that grant before opening the extended session.
- AP2-style mandate gate: autonomous completion requires user approval, an agent key identity, a closed cart hash, an amount cap, expiry, merchant verification, and a valid signature. It remains disabled until provider and key-registry requirements are satisfied.

## What must happen before accepting live agent payments

1. Apply `supabase/migrations/202608260001_agentic_commerce.sql` and `supabase/migrations/202608270001_machine_session_grants.sql` to the linked production project. Verify the seven commerce/access tables exist with RLS enabled.
2. Confirm the production Stripe webhook at `/api/webhooks/stripe` has a live signing secret and subscribes to `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`, `shared_payment.granted_token.used`, and `shared_payment.granted_token.deactivated`.
3. Obtain Stripe Machine Payments / Shared Payment Token access and the merchant network ID. Stripe access is not implied by having an ordinary Stripe account or a normal Checkout price.
4. Add production-only environment values in Vercel without committing them:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_WORKSHOP_PRICE_ID` if the default live workshop price is ever rotated
   - `MPP_SECRET_KEY` generated with at least 32 random bytes
   - `STRIPE_NETWORK_ID` supplied by Stripe
   - `MPP_ENABLED=true` only after the previous two machine-payment values are valid
5. For UCP delegated checkout, complete the OpenAI/commerce onboarding and conformance process, then configure `UCP_SHARED_PAYMENT_TOKEN_ENABLED=true` only after the provider grants SPT access. If the partner requires merchant authentication, add `UCP_API_TOKEN` or `UCP_SHARED_SECRET` through the partner’s approved connection flow.
6. Configure `UCP_ORDER_WEBHOOK_URL` and `UCP_WEBHOOK_SECRET` only with the signed endpoint supplied by the commerce partner. The order event payload intentionally excludes email addresses, card data, and access keys.
7. For AP2 autonomous mode, register the agent verification key and set `UCP_SIGNING_PUBLIC_JWK` / `AP2_AGENT_PUBLIC_JWK` from the approved key registry. Do not use a shared mandate secret for a public multi-agent deployment unless the provider explicitly approves that model.
8. Run sandbox conformance tests for: first challenge, credential retry, replay, amount mismatch, expired token, 3DS escalation, refund, dispute, webhook replay, and delivery revocation. Then repeat on live mode with a low-value internal transaction.

## Current safe behavior

Until the provider flags are enabled, public MCP can explain the payment routes and send a user to hosted checkout, but it cannot accept payment credentials or claim that an agent payment succeeded. Hosted Checkout remains the browser fallback. No route accepts raw card numbers, arbitrary prices, arbitrary product IDs, or database access.

## Recommended competition demo

Use the public MCP connection and ask the agent to search for a tone pack, open the machine, and explain the $2.99 workshop. Demonstrate the 402 machine-payment capability as “ready for provider activation” unless Stripe has granted production SPT access; do not simulate a paid receipt in a live judging flow.
