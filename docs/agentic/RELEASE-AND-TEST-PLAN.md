# Release and Test Plan: Cognistration Agentic Platform

## Change identity

- Repository/workspace: `/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration`
- Git repository reality: target app is nested in the parent `/Users/matthewbishop` checkout; preserve unrelated dirty files
- Deployment: Vercel team `bishoptech`, project `bishoptech-cognistration`
- Environment: local implementation → Vercel production route verification when deployment is explicitly exercised
- Canonical domain: `https://cognistration.com`
- Production deployment proof: Vercel `dpl_E8aJx42qdoL38EZddnhS28zw7Zoc` is `READY` with the `cognistration.com` alias and commit `25c40fa`
- Authorized production actions: user requested full implementation control and reported authenticated Vercel/Supabase CLIs; record exact deploy/DB actions when performed
- Test marker: `AGENTIC-20260828-06`

## Repository checks

| Check | Command | Result |
|---|---|---|
| diff whitespace | `git diff --check` | pass |
| agentic fixtures | `npm run test:agentic` | pass; 46 tests |
| existing billing fixtures | `npm run test:billing` | pass; 6 tests |
| existing Studio fixtures | `npm run test:studio` | pass; 13 tests |
| lint | `npm run lint` | pass; 0 errors and two pre-existing warnings |
| build | Vercel production build | pass remotely for `dpl_DQx9mSUuHNomD7yE62YTnReuaAgd`; local build intentionally not run per repository instructions |

## Agent and UX tests

- [x] A compatible in-app browser main-page context exposes `document.modelContext`; live discovery returns all nine homepage WebMCP tools.
- [x] A normal browser still renders and operates human controls without `document.modelContext`.
- [x] Agent can read state, set gamma plus a 246 Hz carrier, and see the same controls reflected in the live page state.
- [x] Intention matching updates the same machine the human sees.
- [x] AI outage or malformed model output falls back deterministically.
- [x] Audio cannot start through the tool without `confirmed: true`.
- [x] Signup navigation does not submit credentials or payment.
- [x] Pack search returns published metadata and a confirmed-false pack preview stops at `CONFIRMATION_REQUIRED`.
- [x] Policy and account reads return canonical links, public preview pricing, and the user-submission boundary.
- [x] Five hashed operating skills are discoverable through the MCP skills extension and readable by their `skill://` resources.
- [x] Prompt-injection text is bounded and never echoed into the safe rationale.
- [x] Member planning is bounded, tenant-scoped, and does not echo raw intention text.
- [x] Member creation and render start require explicit confirmation and use an idempotency key when supplied.
- [x] Local MCP Apps widget contract renders a versioned machine UI resource with bridge calls, exact CSP metadata, supplied Aurora visual, and explicit local audio start.
- [x] The iPhone app offer is a bounded read-only App Store handoff with no payment side effect and explains the lower price through on-device operation and reduced hosted maintenance overhead.
- [x] Account signup and done-state feedback render in-platform widgets; credentials, notes, and feedback ratings stay outside MCP arguments and require explicit user submission.
- [x] The ChatGPT connection helper copies a setup prompt with the canonical remote endpoint, explicitly prevents Git/marketplace installation, and opens the main ChatGPT chat.
- [x] The homepage uses scroll-revealed section titles, a shorter/wider hero lockup, a borderless frosted listening shell, and a three-card infinite iPhone preview carousel with reduced-motion behavior.

## MCP tests

- [x] Modern `server/discover` responds with the declared 2026-07-28 stateless behavior; legacy `initialize` remains compatible.
- [x] Modern `tools/list`, `resources/list`, and `prompts/list` contain only approved public surfaces and include required cache/server metadata.
- [x] Valid read/recommend calls return structured public data.
- [x] Malformed input, unknown tools, oversized body, and write-shaped requests fail safely.
- [x] No private/admin data or provider payload appears in output.
- [x] Response and request limits are observed.
- [x] Production `/connect` accepts standards-compliant modern stateless Streamable HTTP requests, validates header/body agreement, returns `405` for unsupported SSE GET negotiation, returns `202` for notifications, and rejects untrusted origins.

## Production route proof

| Route/operation | Status | Post-condition |
|---|---:|---|
| `https://cognistration.com/` | pass | homepage is 200, shows the human platform story, contains one hero Aurora background, has the available-now iPhone offer with the canonical App Store CTA and on-device pricing explanation, uses the refined hero/chat presentation, and exposes the live fan carousel |
| `https://cognistration.com/api/capabilities` | pass | live public manifest returns the bounded 26-tool MCP contract, five skills, account options, and signup/feedback capability references |
| `https://cognistration.com/openapi.json` | pass | generated REST compatibility document mirrors the approved public registry and exposes no write credentials |
| `https://cognistration.com/agent-instructions.md` | pass | public instructions include the public browser bridge, pack preview confirmation, policy reads, and authenticated member workflow |
| `https://cognistration.com/api/mcp` | pass | `2026-07-28` discovery responds with the skills extension, twenty-six public tools, thirteen resources, and five readable skills; the tone, signup, and feedback UI templates are addressable |
| `https://cognistration.com/connect` | pass | connection endpoint serves the same bounded contract; live ChatGPT-origin `tools/list` returns twenty-six public tools; human setup is routed through the header prompt and main ChatGPT chat rather than a Git/marketplace installer |
| `POST /api/mcp` `open_machine_generator` + `resources/read` | pass | production render returns Gamma/246 Hz with `isPlaying: false`; the widget resource is `text/html;profile=mcp-app`, loads the canonical Aurora visual, and advertises exact connect/resource/frame domains |
| `POST /api/mcp` `get_ios_app_offer` + `resources/read` | pass | production returns the canonical App Store URL, `$2.99` one-time iPhone offer, compatibility, feature summary, and on-device pricing context without processing payment |
| `POST /api/mcp` `open_account_signup` + `resources/read` | pass | render-only account form is returned in-platform; credentials and checkout are user-controlled |
| `POST /api/mcp` `open_feedback` + `resources/read` | pass | render-only closing card is returned in-platform; submission is explicit and feedback history is not exposed |
| `POST https://cognistration.com/api/agent/account/signup` | pass (boundary) | strict first-party signup adapter has origin/CORS guards; production preflight and malformed-input checks pass; no session, token, password, or payment result is returned |
| `POST https://cognistration.com/api/agent/feedback` | pass (schema live) | first-party feedback adapter is origin/CORS guarded; `agent_feedback` exists in production with RLS enabled and zero rows before any user submission |
| `POST https://cognistration.com/api/agent` | pass | `clear mind and calm reset` resolves to an approved Theta tone with live `matchMode: ai`; deterministic fallback remains covered by tests |
| `GET https://cognistration.com/api/packs?agent=1` | pass | public pack search/lookup returns preview-safe metadata and strips private price IDs, downloads, and provider metadata |
| `GET https://cognistration.com/api/agent/policy?topic=safety` | pass | policy route returns the canonical safety URL and bounded summary |
| `GET https://cognistration.com/api/agent/account` | pass | account route explains free public previews and the one-time workspace without receiving credentials or payment |
| `https://cognistration.com/signup` | pass | semantic form remains user-submission controlled |
| `https://cognistration.com/login` | pass | live entitlement gate presents platform-only sign-in and membership-required copy |
| `https://cognistration.com/pricing` | pass | live pricing presents the one-time $20 workspace offer, previews, tone-pack entry point, and account CTA |
| `GET/POST https://cognistration.com/api/member/*` without auth | pass | private routes return safe auth/confirmation boundaries and no stack traces |
| authenticated member fixture | pass | temporary lifetime member received workspace access, a bounded plan, a private project/render, an idempotent replay, a completed 48 kHz stereo render, and a signed MP3 range response; all fixture data was removed |

## Release state

Current state after the MCP Apps machine, frequency-wave visual, iPhone offer, ChatGPT connection helper, homepage presentation, five-skill catalog, in-platform account capture, and in-platform done-state feedback deployment: `production-public-authenticated-member-native-webmcp-mcpapps-ios-offer-chatgpt-setup-helper-homepage-polish-frequency-wave-verified`. Production Vercel deployment `dpl_E8aJx42qdoL38EZddnhS28zw7Zoc` is ready on commit `25c40fa`. The live canonical endpoint, `/connect`, and Cloudflare relay are verified with 26 MCP tools, 13 resources, 18 homepage WebMCP tools, five readable skills, origin-guarded first-party submission routes, and the fixed $0.50 payment coda. The real production Supabase project is `lmzzkrcbcucosypiminc`; the workspace `.env` points at a different stale project and the current CLI account cannot access the linked database login-role endpoint. The production SQL editor applied `202608270003_agent_feedback.sql`, and a read-only production check confirms `public.agent_feedback` exists with RLS enabled and zero rows before any user submission. No synthetic feedback row was created. The payment coda remains the fixed $0.50 path and must be shown only with the existing user-approved provider client.

## Challenge handoff

- Public code mirror: https://github.com/mbishopfx/cognistration-webmcp-challenge (latest sync commit `b0d1efa`)
- Submission brief: `docs/challenge/WEBMCP-SUBMISSION.md`
- Recording script: `docs/challenge/DEMO-SCRIPT.md`
- Public demo video: https://github.com/mbishopfx/cognistration-webmcp-challenge/raw/refs/heads/main/assets/cognistration-webmcp-demo-final.webm
- License: top-level `LICENSE` (MIT)
- The public mirror excludes environment files, credentials, internal planning state, and private raw source beds; it includes the public homepage tone previews and supplied Aurora visual.

## Rollback and residual risk

- Rollback: previous Vercel production deployment or revert only the bounded agentic files listed in the capability spec.
- Data rollback: none required for public MCP/WebMCP slice; authenticated API retains existing record semantics.
- Feature disable: remove/guard the WebMCP registration and return the existing human-only machine.
- Residual risks: browser WebMCP is experimental and the final ChatGPT account connection remains user-controlled; the current connected Chrome profile did not have the WebMCP testing flag enabled, so the live native call proof used the compatible in-app browser context; target app is nested in a dirty parent checkout; process-local MCP rate limit is best effort on serverless instances.
- Next safe slice: connect the production endpoint in ChatGPT Developer Mode, verify the widget renders in the target account, then submit the final challenge materials and complete the judge audit.
