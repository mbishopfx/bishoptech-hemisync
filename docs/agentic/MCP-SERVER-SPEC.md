# Cognistration Public MCP Server Spec

## Server identity

- Endpoint: `https://cognistration.com/api/mcp`
- Transport: Streamable HTTP JSON-RPC over HTTP POST; dual-era public adapter
- Current discovery protocol: `2026-07-28` `server/discover`
- Legacy initialize compatibility: `2025-11-25`, `2025-06-18`, `2025-03-26`
- Server name/version: `cognistration-agentic-platform` / `0.14.0`
- Manifest: `https://cognistration.com/api/capabilities`
- REST/OpenAPI fallback: `https://cognistration.com/openapi.json`
- Human/agent instructions: `https://cognistration.com/agent-instructions.md`
- Authentication: none for the approved public read and render tools
- Public writes: no direct MCP argument writes; signup and feedback can write
  only after explicit submission inside their first-party in-platform widgets

The current protocol is stateless per request: modern clients send the protocol
version and client metadata in `params._meta`, together with `MCP-Protocol-Version`
and `Mcp-Method` headers. `Mcp-Name` is required for `tools/call`,
`resources/read`, and `prompts/get`, and must match the request body. Modern
responses include `resultType: complete`, server identity in reserved response
metadata, and cache hints where the result is cacheable. Older clients may still
use the supported `initialize` handshake.

## Boundary declaration

| Surface | Allowed | Not allowed |
|---|---|---|
| Resources | capability manifest, public catalogs, policy index, account options, iPhone app offer, skill index, skill resources, and the tone-machine, science-guide, phone-download, iPhone-app, tone-pack checkout, signup, and feedback UIs | private sessions, profiles, saved tones, secrets |
| Tools | bounded tone/pack search, lookup, deterministic recommendation, policy/account reads, machine rendering, checkout preparation, and payment discovery | arbitrary SQL, code execution, file access, unrestricted web search |
| Visitor writes | first-party signup/feedback widget submission and server-verified hosted/MPP commerce flows only after explicit user action or provider authorization | credentials, payment credentials, or feedback in MCP arguments; arbitrary email/library writes |
| Browser WebMCP | visible machine controls and explicit local preview | hidden navigation side effects, silent audio, silent credential/payment submission |
| Agentic Session Score | visible browser-local compose/refine/undo/select/export and confirmed stage preview; read-only remote MCP composition | public persistence/rendering, arbitrary assets, raw intention echo, unconfirmed or unverified audio |

### Agentic Session Score v1

`compose_session_score` accepts either a complete strict score or a bounded direction/intention and duration. Scores contain 1–6 stages totaling 60–3600 seconds exactly; every stage is at least 15 seconds, carrier is an integer 100–400 Hz and constant inside the stage, beat start/end are 0.5–40 Hz in 0.5 Hz increments with a linear browser preview, and volume is 0–100. Remote MCP and REST only return technical output. `/try` owns ephemeral visible revisions and retains the 120-second preview cap.
| Authenticated dashboard bridge | private planning, owned session/render records, and render status | public access, cross-member reads, silent rendering |

## Resource registry

| URI | Content type | Audience | Source | PII? |
|---|---|---|---|---:|
| `cognistration://manifest` | `application/json` | public | capability contract | no |
| `cognistration://capabilities` | `application/json` | public | approved tool boundary | no |
| `cognistration://tones` | `application/json` | public | filtered homepage catalog | no |
| `cognistration://tone-packs` | `application/json` | public | safe pack catalog with preview links | no |
| `cognistration://policies` | `application/json` | public | canonical policy index | no |
| `cognistration://account-options` | `application/json` | public | preview/workspace access boundary | no |
| `cognistration://ios-app` | `application/json` | public | App Store listing, one-time price, compatibility, feature summary, and on-device pricing context | no |
| `cognistration://skills` | `application/json` | public | skill extension summary | no |
| `ui://cognistration/machine-generator/v3.html` | `text/html;profile=mcp-app` | ChatGPT-compatible app host | interactive tone machine with bounded live controls and explicit local preview | no |
| `ui://cognistration/science-guide/v2.html` | `text/html;profile=mcp-app` | ChatGPT-compatible app host | seven-slide signal, FFR, evidence, and safety guide with a self-contained animated ocean surface and print/save-to-PDF action | no |
| `ui://cognistration/ios-app/v1.html` | `text/html;profile=mcp-app` | ChatGPT-compatible app host | frosted iPhone offer with real screenshots and a Download Now App Store badge | no |
| `ui://cognistration/phone-download/v1.html` | `text/html;profile=mcp-app` | ChatGPT-compatible app host | frosted phone handoff with the fixed `$0.50` agent-preview path and separate `$2.99` iPhone app path | no |
| `ui://cognistration/tone-pack-checkout/v2.html` | `text/html;profile=mcp-app` | ChatGPT-compatible app host | frosted tone-pack purchase card with email capture, explicit $5.99 confirmation, hosted checkout, and verified download action | email stays in widget/provider flow |
| `ui://cognistration/account-signup/v3.html` | `text/html;profile=mcp-app` | ChatGPT-compatible app host | user-controlled account capture form | credentials stay in widget; canonical URI |
| `ui://cognistration/feedback/v1.html` | `text/html;profile=mcp-app` | ChatGPT-compatible app host | optional user-controlled closing feedback | no account or history |
| `skill://cognistration/*/SKILL.md` | `text/markdown` | public | static operating guidance | no |

## Tool registry

| Tool | Authorization | Side effect | Input limit |
|---|---|---|---|
| `get_agentic_capabilities` | `public_read` | none | empty object |
| `search_public_tones` | `public_read` | none | query ≤240 chars, limit ≤50 |
| `get_public_tone` | `public_read` | none | catalog ID ≤120 chars |
| `recommend_tone` | `public_read` | none | intention 1–240 chars |
| `search_public_tone_packs` | `public_read` | none | query ≤240 chars, limit ≤20 |
| `get_public_tone_pack` | `public_read` | none | pack slug ≤120 chars |
| `get_policy_info` | `public_read` | none | one published policy topic |
| `get_account_options` | `public_read` | none | empty object |
| `open_account_signup` | `public_read` render | widget submission only | empty object; credentials never enter MCP |
| `get_ios_app_offer` | `public_read` render | none | empty object; renders real screenshots and a Download Now badge while returning the canonical App Store listing and current one-time price |
| `open_phone_download_options` | `public_read` render | widget handoff only | optional public tone ID and bounded controls; the `$0.50` payment challenge requires explicit approval |
| `create_tone_pack_checkout` | `public_checkout` | creates unpaid hosted checkout | published pack slug, delivery email, confirmation, idempotency key |
| `get_tone_pack_delivery` | `paid_checkout_session` | verifies payment and resolves delivery | published pack slug, completed Checkout Session ID |
| `open_tone_pack_checkout` | `public_read` render | widget submission only | optional published pack slug; email and payment stay in widget/provider flow |
| `get_tone_pack_payment_options` | `public_read` | none | empty object; fixed $5.99 MPP route and delivery contract |
| `get_machine_control_contract` | `public_read` | none | empty object; returns bounds, defaults, semantic directions, and audio boundary |
| `set_machine_controls` | `public_session` | updates visible controls and live audio | one or more bounded absolute controls |
| `adjust_machine_controls` | `public_session` | updates visible controls and live audio | carrier/rhythm/volume plus semantic direction and optional step |
| `set_machine_direction` | `public_session` | updates visible controls and live audio | published state plus optional preset controls |
| `start_machine_preview` | `public_session` | requests local browser audio | `confirmed: true`; result remains pending until widget state reports `audioReady: true`; browser gesture may still be required |
| `stop_machine_preview` | `public_session` | stops local browser audio | empty object |
| `open_machine_fullscreen` | `public_session` | requests larger host display | empty object |
| `open_machine_generator` | `public_read` | none | optional intention, tone ID, state, and bounded controls |
| `open_science_guide` | `public_read` render | none | optional public tone ID, state, carrier, beat, volume, and safe intention label; no audio or diary content |
| `open_feedback` | `public_read` render | widget submission only | empty object; rating and note never enter MCP |

The `open_machine_generator` render tool links `_meta.ui.resourceUri` to
`ui://cognistration/machine-generator/v3.html`. The widget renders from the
concise `structuredContent` snapshot, uses the portable `tools/call` bridge for
recommendation, browsing, exact control, relative adjustment, direction,
playback, and display requests, and keeps `window.openai` as a compatibility
enhancement. `ui/update-model-context` publishes the current controls and
playback state back to the model. Exact setters and relative adjustments update
the existing oscillator and gain nodes without pausing playback. Its Aurora
background is the public `/visuals/aurora-current.html` visual, and its Web
Audio preview remains off until the listener explicitly confirms playback;
browser autoplay may still require a visible user gesture.

The `open_science_guide` render tool links `_meta.ui.resourceUri` to
`ui://cognistration/science-guide/v2.html`. The widget is a seven-slide,
clickable explanation of the two-channel signal, FFR, descriptive frequency
bands, evidence limits, and safe listening. It uses a self-contained animated
ocean surface and keeps the public FFT ocean-surface page at
`https://vgpu.sh/examples/fft-ocean-surface` as a source link rather than an
embedded page. Its PDF button uses the host external-link bridge when available
and leaves a direct first-party link available as a fallback. The export is a
static, server-generated snapshot of the current settings and ocean seed.
It never starts audio, stores a record, or includes diary text.

The `get_ios_app_offer` render tool links `_meta.ui.resourceUri` to
`ui://cognistration/ios-app/v1.html`. The card uses real public app screenshots,
the current `$2.99` one-time price, and an App Store Download Now badge. It does
not process payment.

The `open_phone_download_options` render tool links `_meta.ui.resourceUri` to
`ui://cognistration/phone-download/v1.html`. The card carries the current tone
settings when available and separates a fixed `$0.50` no-account agent-preview
handoff from the full `$2.99` iPhone app. The preview button sends a follow-up
request for the exact Machine Payments Protocol challenge; the connected agent
must obtain explicit confirmation before sending payment credentials, and the
server verifies the provider receipt before releasing a session.

The `open_tone_pack_checkout` render tool links `_meta.ui.resourceUri` to
`ui://cognistration/tone-pack-checkout/v2.html`. The card asks for a delivery
email and explicit confirmation of the fixed `$5.99` one-time price before it
opens hosted Checkout. After `get_tone_pack_delivery` verifies the completed
session, the same card renders a download button and reports the email fallback.
Compatible agent payment clients can instead discover
`/api/machine-payments/tone-pack`, receive an HTTP 402 challenge, retry with
their own `Authorization: Payment <credential>` header, and receive delivery
only after the server verifies the exact Stripe PaymentIntent. The server also
accepts `Payment-Authorization` for clients that reserve `Authorization` for
application authentication.

Every tool returns bounded `content` and `structuredContent`. Tool-level failures use `isError: true`; protocol failures use stable JSON-RPC errors. Unknown tool names, private-data requests, and write attempts are denied.

The previous `ui://cognistration/account-signup/v2.html` and
`ui://cognistration/account-signup/v1.html` resources remain readable as
compatibility aliases for conversations that cached an earlier tool
descriptor. The previous `ui://cognistration/machine-generator/v2.html` and
`ui://cognistration/machine-generator/v1.html` resources are likewise readable
as compatibility aliases; new tool descriptors point at the v3 resource so
hosts refresh the control bridge.

## Compatibility fallback

`/openapi.json` is generated from the same public MCP tool registry and documents the bounded REST recommendation route, public tone-pack metadata, policy/account reads, the provider-gated `$5.99` tone-pack MPP route, and the JSON-RPC adapter. It is a compatibility surface for hosts that cannot consume the native MCP transport; it does not accept card details, arbitrary prices, arbitrary products, private-workspace access, or unrestricted writes. In-platform signup and feedback forms remain user-submission surfaces, and hosted/MPP commerce remains fixed to approved products and server verification.

## Authenticated member bridge

The public `/api/mcp` endpoint intentionally keeps tool arguments read-only; its signup and feedback render tools mount first-party forms whose submissions are explicit user actions. The signed-in `/dashboard` progressively registers a separate browser bridge with eleven member tools. The bridge sends the current Supabase bearer token to same-origin member routes and existing Studio render routes; server-side ownership checks are authoritative. Planning is side-effect free. Creating a private session/render record and starting the expensive render each require `confirmed: true`. Generation accepts an idempotency key and never returns another member's records.

## Security and governance

- Inputs are schema-validated before catalog or classifier work.
- Retrieved content and intention text are treated as untrusted data.
- The catalog is filtered to an approved static ID set before any optional database overlay is returned.
- The public endpoint has a best-effort per-process request limit and a 64 KiB request-body limit.
- Provider calls are not used by the public MCP recommendation tool; this prevents an external client from turning catalog reads into unbounded model spend.
- No public endpoint returns stack traces, environment values, database SQL, authorization internals, or raw provider payloads.
- The homepage browser bridge has separate explicit confirmation for starting local audio and leaves signup/payment submission to the user.

## Protocol tests

The route must pass:

1. Modern `server/discover` with `MCP-Protocol-Version: 2026-07-28` and `Mcp-Method: server/discover`.
2. Modern `tools/list`, `resources/list`, and `prompts/list` with matching body metadata and standard headers.
3. Modern `resources/read` and `prompts/get` with matching `Mcp-Name` headers.
4. Valid modern `tools/call` for all thirty-seven public tools with matching `Mcp-Name` headers, including the science-guide, tone-pack checkout, signup, and feedback render tools.
5. `initialize` and subsequent calls with a supported legacy version.
6. Missing or mismatched modern headers, malformed JSON, oversized body, invalid schema, unknown tool, and write-shaped request denial.
7. Valid pack, policy, account, signup render, feedback render, and skills calls, including skill resource digests.
8. Deterministic recommendation with no provider key and prompt-injection fixture.
9. Machine render returns the versioned UI resource, exact seeded Gamma/246 Hz
   controls, and a readable `text/html;profile=mcp-app` resource with accurate
   UI CSP metadata.
10. Science-guide render returns the versioned UI resource, seven readable
    slides, a self-contained animated ocean surface with a quiet FFT visual
    reference link, print/save-to-PDF controls,
    and explicit audio/diary/medical boundaries.
11. The iPhone app offer returns the canonical App Store listing, the bounded
    one-time price, compatibility, on-device pricing context, and no payment side
    effect.
12. The tone-pack checkout resource renders without a host-added hard border,
    requires the delivery email and explicit `$5.99` confirmation, and only
    reveals a download action from a server-verified delivery result. The
    direct MPP route is fixed to the approved pack price, rejects mismatched
    pack/email/amount metadata, and never treats a client claim as payment.
