# Cognistration Public MCP Server Spec

## Server identity

- Endpoint: `https://cognistration.com/api/mcp`
- Transport: Streamable HTTP JSON-RPC over HTTP POST; dual-era public adapter
- Current discovery protocol: `2026-07-28` `server/discover`
- Legacy initialize compatibility: `2025-11-25`, `2025-06-18`, `2025-03-26`
- Server name/version: `cognistration-agentic-platform` / `0.4.0`
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
| Resources | capability manifest, public catalogs, policy index, account options, iPhone app offer, skill index, skill resources, and the tone-machine, signup, and feedback UIs | private sessions, profiles, saved tones, secrets |
| Tools | bounded tone/pack search, lookup, deterministic recommendation, policy/account reads, and machine rendering | arbitrary SQL, code execution, file access, unrestricted web search |
| Visitor writes | first-party signup/feedback widget submission only after explicit user action | credentials or feedback in MCP arguments, payment, email collection by the agent, library writes |
| Browser WebMCP | visible machine controls and explicit local preview | hidden navigation side effects, silent audio, silent credential/payment submission |
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
| `ui://cognistration/machine-generator/v1.html` | `text/html;profile=mcp-app` | ChatGPT-compatible app host | interactive tone machine with bounded local preview | no |
| `ui://cognistration/account-signup/v1.html` | `text/html;profile=mcp-app` | ChatGPT-compatible app host | user-controlled account capture form | credentials stay in widget |
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
| `get_ios_app_offer` | `public_read` | none | empty object; returns the canonical App Store listing, current one-time price, and why on-device operation keeps the offer lower |
| `open_machine_generator` | `public_read` | none | optional intention, tone ID, state, and bounded controls |
| `open_feedback` | `public_read` render | widget submission only | empty object; rating and note never enter MCP |

The `open_machine_generator` render tool links `_meta.ui.resourceUri` to the
versioned MCP Apps resource. The widget renders from the concise
`structuredContent` snapshot, uses the portable `tools/call` bridge for
`recommend_tone` and `search_public_tone_packs`, and keeps `window.openai` as a
compatibility enhancement. Its Aurora background is the public
`/visuals/aurora-current.html` visual, and its Web Audio preview remains off
until the listener explicitly presses play.

Every tool returns bounded `content` and `structuredContent`. Tool-level failures use `isError: true`; protocol failures use stable JSON-RPC errors. Unknown tool names, private-data requests, and write attempts are denied.

## Compatibility fallback

`/openapi.json` is generated from the same public MCP tool registry and documents the bounded REST recommendation route, public tone-pack metadata, policy/account reads, and the JSON-RPC adapter. It is a compatibility surface for hosts that cannot consume the native MCP transport; it does not add credential-taking, payment, private-workspace, or arbitrary write access. In-platform signup and feedback forms remain the only narrow visitor-write surfaces, and both require the person to press Submit.

## Authenticated member bridge

The public `/api/mcp` endpoint intentionally keeps tool arguments read-only; its signup and feedback render tools mount first-party forms whose submissions are explicit user actions. The signed-in `/dashboard` progressively registers a separate browser bridge with five member tools. The bridge sends the current Supabase bearer token to same-origin member routes and existing Studio render routes; server-side ownership checks are authoritative. Planning is side-effect free. Creating a private session/render record and starting the expensive render each require `confirmed: true`. Generation accepts an idempotency key and never returns another member's records.

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
4. Valid modern `tools/call` for all twenty-six public tools with matching `Mcp-Name` headers, including the signup and feedback render tools.
5. `initialize` and subsequent calls with a supported legacy version.
6. Missing or mismatched modern headers, malformed JSON, oversized body, invalid schema, unknown tool, and write-shaped request denial.
7. Valid pack, policy, account, signup render, feedback render, and skills calls, including skill resource digests.
8. Deterministic recommendation with no provider key and prompt-injection fixture.
9. Machine render returns the versioned UI resource, exact seeded Gamma/246 Hz
   controls, and a readable `text/html;profile=mcp-app` resource with accurate
   UI CSP metadata.
10. The iPhone app offer returns the canonical App Store listing, the bounded
    one-time price, compatibility, on-device pricing context, and no payment side
    effect.
