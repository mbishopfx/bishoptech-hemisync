# Cognistration agentic commerce readiness

## What is implemented

- Public tone-pack checkout: `create_tone_pack_checkout` resolves a published slug to the server-owned Stripe price, requires explicit confirmation, and returns a Stripe-hosted checkout URL.
- Paid delivery: `get_tone_pack_delivery` verifies the Stripe Checkout Session before returning three user-facing paths: a direct download URL, a protected fallback URL, and the public tone-pack web URL; delivery email remains the additional fallback.
- In-platform tone-pack purchase: `open_tone_pack_checkout` renders a frosted MCP Apps card that collects the delivery email, requires confirmation of the one-time `$5.99` price, opens hosted Checkout, and renders the verified download action after `get_tone_pack_delivery` completes.
- Machine workshop access: the live Stripe product is a one-time `$2.99` pass. A paid session issues an encrypted, hashed, revocable key valid for 24 hours and limits each machine workshop session to 60 minutes. `get_workshop_access` and `/api/agent/commerce/workshop-access` verify the paid Checkout Session and resolve that key idempotently for an agent.
- UCP discovery: `/.well-known/ucp` advertises REST and MCP transports, checkout/order capabilities, and the hosted payment handler; the autonomous-payment extension is advertised only after its provider and key gates are ready.
- UCP checkout lifecycle: create, get, update, complete, cancel, order lookup, server-derived totals, hosted-checkout escalation, idempotency keys, signed order webhooks, and refund/dispute state handling.
- Machine Payments Protocol: `POST /api/machine-payments/session` uses `mppx` and Stripe shared-payment-token verification in the live configured path. It returns a 402 challenge until a compatible agent supplies a provider credential, then issues a durable one-hour grant bound to the verified receipt. `/machine` validates that grant before opening the extended session. The challenge demo uses the separate fixed $0.50 tone-preview endpoint.
- Tone-pack Machine Payments Protocol: `POST /api/machine-payments/tone-pack` uses the same `mppx` challenge/retry pattern for an approved published pack at a fixed `$5.99`. It requires a delivery email and `confirmed: true`, binds the scope to the pack and normalized email, verifies the resulting Stripe PaymentIntent, fulfills the pack, attempts the delivery email, and returns a browser download plus protected fallback. It does not accept a price, product ID, or payment credential from the JSON body.
- AP2-style mandate gate: autonomous completion requires user approval, an agent key identity, a closed cart hash, an amount cap, expiry, merchant verification, and a valid signature. It remains disabled until provider and key-registry requirements are satisfied.

## What must happen before accepting unrestricted autonomous payments

1. [x] Apply `supabase/migrations/202608260001_agentic_commerce.sql`, `supabase/migrations/202608270001_machine_session_grants.sql`, and `supabase/migrations/202608270002_ucp_lifecycle_hardening.sql` to the linked production project. The seven commerce/access tables have been verified with RLS enabled, and all three versions are recorded in the migration ledger.
2. [x] Confirm the production Stripe webhook at `/api/webhooks/stripe` has a live signing secret and subscribes to `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`, `shared_payment.granted_token.used`, and `shared_payment.granted_token.deactivated`.
3. Keep unrestricted autonomous spending disabled. The live demo routes remain fixed to approved products: $0.50 for one tone preview/session and $5.99 for one published tone pack, each with server-verified provider authorization; ordinary Stripe access or a normal Checkout price never authorizes arbitrary agent spending.
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

Public MCP can discover the fixed machine-payment resources, but it never accepts raw card credentials or a payment token as a normal MCP argument. The provider challenge is returned first; only the authorized payment client can retry. The tone-pack card and hosted Checkout remain the reviewable browser fallback. No route accepts raw card numbers, arbitrary prices, arbitrary product IDs, or database access.

## Recommended competition demo

Use the public MCP connection and ask the agent to search for a tone pack, open the machine, explain the $2.99 workshop, and open the $5.99 tone-pack card. Finish with either the fixed $0.50 machine-payment request or, when the approved provider client is available, the fixed $5.99 pack challenge: show the 402 challenge, obtain the user’s explicit approval, let the approved provider client retry, and show only the verified receipt and delivery result. Never simulate a paid receipt or use a different amount/product.
