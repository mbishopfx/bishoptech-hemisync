# Cognistration agent route and skill matrix

Last updated: 2026-08-29

This is the implementation map for the public Cognistration agent surface. Each adapter points to the smallest route that can truthfully complete the user's intent. Render tools remain read-only until a person explicitly submits the in-platform form; local browser actions remain confirmation-aware.

## User intent map

| User request | First route | Follow-up | Completion proof |
|---|---|---|---|
| Generate a tone for a diary session | `recommend_tone` or `cognistration_generate_tone` | Apply returned approved tone to the visible machine | Approved catalog ID and Theta/Alpha direction |
| Clear my mind and relax | `recommend_tone` or `cognistration_generate_tone` | Offer a Delta/Theta preview | Approved catalog ID; no treatment claim |
| Test a relaxation tone pack | `search_public_tone_packs` or `cognistration_search_tone_packs` | `get_public_tone_pack`, then confirm `cognistration_preview_tone_pack` | Published slug, listed preview track, explicit confirmation |
| Buy a complete tone pack | `open_tone_pack_checkout` | Select the pack, enter the delivery email, confirm `$5.99`, then use hosted Checkout; compatible agents may use `get_tone_pack_payment_options` and the fixed MPP route | Server-verified payment, browser download button, and email fallback |
| Gamma with a 246 Hz carrier | `cognistration_set_session_controls` | `cognistration_get_session_state` | State `gamma`, carrier `246` |
| Make the carrier smaller | `cognistration_get_session_state` | Lower absolute value with `cognistration_set_session_controls` | New carrier is lower and remains within 100–400 Hz |
| Free trial account with an email | `get_account_options` | `open_account_signup` | In-platform user-controlled form; credentials never enter MCP and checkout is separate |
| Finished interaction feedback | `open_feedback` | In-platform rating card | Explicit user submission persists only a sanitized anonymous record; no history |
| Safety, terms, privacy, or AI questions | `get_policy_info` | Return canonical URL | Topic, source URL, concise summary |
| Download the iPhone app | `get_ios_app_offer` | Open the returned App Store URL | Canonical listing, current $2.99 one-time price, compatibility, on-device explanation for the lower cost, and no payment action |
| Download the current tone to a phone | `open_phone_download_options` | Choose the fixed $0.50 agent-preview handoff or the full iPhone app; require explicit confirmation before MPP payment | Current bounded tone/settings, exact payment challenge, explicit approval, and server-verified release |
| Open the machine inside ChatGPT | `open_machine_generator` | Use the widget to match an intention, tune controls, browse packs, or request a larger view | Versioned UI resource renders; audio remains off until explicit play |
| Understand the generated signal | `open_science_guide` | Click through the two-channel signal, FFR, descriptive bands, evidence limits, and safety notes; print/save the guide as PDF | Versioned science-guide UI renders with a self-contained animated ocean surface; audio and diary content remain off |

## Public surface

### MCP tools

- `get_agentic_capabilities`
- `search_public_tones`
- `get_public_tone`
- `recommend_tone`
- `search_public_tone_packs`
- `get_public_tone_pack`
- `get_policy_info`
- `get_account_options`
- `open_account_signup` — render the in-platform signup form without receiving credentials in MCP
- `get_ios_app_offer` — render the frosted iPhone offer with real screenshots and a Download Now App Store badge, alongside the public listing and one-time offer details
- `open_phone_download_options` — render the fixed `$0.50` no-account agent-preview handoff and separate `$2.99` iPhone app path; payment remains explicit and user-controlled
- `create_tone_pack_checkout` — after explicit confirmation, create a server-priced hosted checkout for a published pack
- `get_tone_pack_delivery` — verify a completed checkout and return the download/email fallback paths
- `open_tone_pack_checkout` — render the frosted in-platform pack card with email capture, hosted checkout, and verified download state
- `get_tone_pack_payment_options` — discover the fixed `$5.99` agent-to-agent MPP route and delivery contract
- `open_machine_generator` — render the interactive tone machine in an MCP Apps-compatible host
- `open_science_guide` — render the seven-slide educational signal guide with a self-contained animated ocean surface and browser PDF fallback
- `open_feedback` — render one optional done-state feedback card without returning history

### Homepage WebMCP tools

- `cognistration_get_session_state`
- `cognistration_set_session_controls`
- `cognistration_generate_tone`
- `cognistration_search_tone_packs`
- `cognistration_preview_tone_pack`
- `cognistration_get_policy_info`
- `cognistration_get_account_options`
- `cognistration_begin_preview`
- `cognistration_open_account_signup`
- `cognistration_open_science_guide`

### REST fallbacks

- `POST /api/agent` — intention-to-tone matching with optional AI and deterministic catalog fallback.
- `GET /api/packs?agent=1` — safe pack search; `slug` reads one pack.
- `GET /api/agent/policy?topic=safety` — canonical policy summary and URL.
- `GET /api/agent/account` — public preview, workspace, and signup boundaries.
- `POST /api/agent/commerce/tone-pack-checkout` — create the reviewable hosted checkout after confirmation.
- `GET /api/agent/commerce/tone-pack-delivery` — verify paid hosted checkout and resolve the download/email delivery.
- `GET/POST /api/machine-payments/tone-pack` — fixed `$5.99` MPP discovery/payment route for compatible agent payment clients; the credential is header-only and the PaymentIntent is verified before fulfillment.
- `GET /api/capabilities` and `GET /openapi.json` — discovery and compatibility.

### ChatGPT app surface

- Resource: `ui://cognistration/machine-generator/v1.html`
- Resource: `ui://cognistration/science-guide/v2.html`
- Resource: `ui://cognistration/ios-app/v1.html`
- Resource: `ui://cognistration/phone-download/v1.html`
- Resource: `ui://cognistration/tone-pack-checkout/v2.html`
- MIME type: `text/html;profile=mcp-app`
- Host calls: portable `tools/call` for recommendation, pack search, checkout, and verified delivery; optional `window.openai.requestDisplayMode` for a larger view; science-guide PDF and App Store actions use `window.openai.openExternal` with direct-link fallbacks, while phone preview uses `window.openai.sendFollowUpMessage`
- Visuals: the machine uses the supplied Aurora Current artwork; the science guide uses a self-contained animated ocean surface with `https://vgpu.sh/examples/fft-ocean-surface` as a source link, so neither surface depends on an embedded frame
- Commerce UI: the tone-pack card uses frosted surfaces and asks for email/confirmation in-platform; payment credentials remain with the hosted checkout or compatible MPP payment client, and the download link appears only after server verification

## Installed skills

The server advertises the official `io.modelcontextprotocol/skills` extension and serves these static `SKILL.md` resources:

1. `cognistration-agentic-routing` — adapter choice, schemas, safety, confirmation, and retry rules.
2. `cognistration-tone-orchestration` — diary, relaxation, pack, gamma/carrier, and relative-control workflows.
3. `cognistration-account-safety` — pricing, policy, data minimization, safety, and user-controlled signup.
4. `cognistration-agent-evaluation` — golden prompts, failure matrix, release oracle, and production proof.
5. `cognistration-feedback` — optional done-state feedback with explicit submission and no history.

Skills are operating guidance, not authorization. Their resources are hashed and addressable through `skills/list`, `skills/get`, and `resources/read`; changing a skill requires a fresh discovery/import by the consuming host.

## Failure and retry design

- Validation failures return a bounded `needs_input` or protocol `-32602`; repair the input instead of repeating it.
- Provider or network failure falls back to the deterministic approved tone matcher, or returns `retryable: true` for a later safe retry.
- Unknown pack/tone IDs return `NOT_FOUND` and a catalog-search next action.
- Missing audio confirmation returns `CONFIRMATION_REQUIRED` and never starts playback.
- Missing tone-pack confirmation, email, provider credential, or a mismatched PaymentIntent returns a bounded commerce error; no bundle is released until the server verifies the exact approved `$5.99` transaction.
- Preview limits render the user-controlled signup widget; cookies are never reset to bypass access rules.
- Credentials, payment, private records, service keys, and arbitrary writes are not accepted as public MCP arguments. Signup and feedback writes occur only after an explicit user submission in their first-party widgets.

## Challenge fit

The differentiator is an agent-operated but human-visible orchestrator: language chooses a bounded starting direction, the same state machine exposes editable carrier/rhythm/volume controls, and audio only begins after a clear confirmation. The ChatGPT app surface makes that machine a portable interactive artifact instead of a text-only tool result. The normal website remains complete when either app bridge is unavailable.
