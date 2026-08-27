# Cognistration — WebMCP Challenge submission brief

## One-line description

Cognistration turns a person’s next intention into a personal listening session, then lets a browser agent help shape the session while the person keeps control of every meaningful action.

## Live app

- https://cognistration.com
- Human-facing ChatGPT connection address: https://cognistration.com/connect
- REST/OpenAPI compatibility fallback: https://cognistration.com/openapi.json

## Pre-existing product and challenge-period delta

Cognistration and its underlying audio-session product existed before the WebMCP
Challenge. The pre-existing product, editorial content, and native listening
engine are not being presented as new challenge work. The challenge-period
delta is documented in the public `main` history beginning August 25, 2026:
the public WebMCP bridge and machine contracts, the MCP Apps machine render,
hashed operating skills, policy/account discovery, confirmation-aware pack
previews, and the bounded session-planning journeys were added or materially
extended for this submission. The dated commit history is the source of truth
for the prior-versus-new boundary.

## Demo video

Submission video: add the final public YouTube URL to the Devpost submission before submitting. A local reference render may be kept in the working tree for review, but a raw video download is not a substitute for the required public YouTube link.

## Optional ChatGPT connection

On an eligible ChatGPT web account, click **Connect ChatGPT** in the Cognistration header, copy the setup prompt, and click **Open ChatGPT chat**. Paste the prompt into a new chat. It points ChatGPT at the canonical remote app endpoint, tells it not to treat the address as a Git repository, and guides the user through the one-time Developer mode/app connection step. If ChatGPT cannot change account settings from the conversation, it provides the exact user-controlled clicks instead. The endpoint is stateless and public by default; it does not expose accounts, private sessions, payment credentials, or arbitrary writes. Narrow checkout/access operations remain confirmation-gated and server-verified.

The same connection now includes an MCP Apps render surface. Ask the connected
app to “open the Cognistration tone machine,” or ask for a specific starting
point such as “open the machine for a gamma tone with a 246 Hz carrier.” The
`open_machine_generator` tool returns an interactive widget with the Aurora
visual, intention matching, bounded controls, public pack browsing, and an
explicit local preview button.

The public `get_ios_app_offer` tool returns the canonical Cognistration iPhone
App Store listing, the current $2.99 one-time offer, compatibility, and feature
summary. It also explains that the iPhone app does its audio work on-device
instead of routing each session through a deployed cloud engine, reducing hosted
infrastructure and maintenance overhead. It never processes payment; the user
completes the purchase in Apple’s store.

## Why this is a strong WebMCP fit

Most audio and meditation products make a person search, compare, configure, and start a session through a sequence of controls. Cognistration lets a person say what the next moment needs, gives an agent structured ways to understand the visible session machine, and turns the result into a tangible preview the person can hear and adjust.

The agent is useful because it handles interpretation and control selection; the human experience remains the source of truth. The site keeps the normal form, sliders, preview controls, and confirmation step available when a compatible agent surface is absent. It can also search the finished pack library, hand back canonical safety and pricing sources, and explain the account path without taking credentials.

## What people and agents do together

1. The person describes a need such as “I need a calm place to write.”
2. The agent can read the visible session state and choose a bounded public tone from the approved library.
3. The site updates the same controls the person can see: state, carrier, beat, and volume.
4. The agent may request a preview, but audio starts only after explicit confirmation.
5. The person can listen, change the controls, continue manually, or open the account flow. Credentials and payment are never submitted by an agent.

In a ChatGPT app host, the machine can also stay mounted while the person
repeats those interactions. The widget calls the public recommendation and
pack tools through the MCP Apps bridge, so the model does not need to rerun the
render tool for every slider or direction change.

For the pack route, the agent searches first, presents a published pack and track, then requests an explicit confirmation before local preview audio starts. For “gamma at 246 Hz,” it sets the visible state and carrier exactly. For “make the carrier smaller,” it reads the current state before choosing a lower bounded value.

Signed-in members can additionally use the private workspace tools to prepare a longer session, create a private project with an idempotency key, start a render after confirmation, and retrieve signed downloads. Public discovery and planning remain read-only; public commerce actions are narrow, hosted, and confirmation-gated.

## Implementation map

- `components/machine/ToneMachineDemo.jsx` registers the fifteen homepage tools with `document.modelContext.registerTool`.
- `lib/agentic/webmcp-contract.js` defines the bounded input/output contracts, relative carrier nudge, session planning, and confirmation annotations.
- `lib/agentic/tone-capability.js` owns catalog validation, intention matching, AI-first classification, and deterministic fallback.
- `app/api/agent/route.js` provides the public REST fallback used by the hero and browser bridge.
- `app/api/mcp/route.js` exposes the public JSON-RPC catalog, policy, account, iPhone app offer, session guidance, narrow hosted-commerce operations, and skill surface.
- `lib/agentic/session-capability.js` provides deterministic comparisons, timed plans, cues, and explicit no-save/no-audio boundaries.
- `app/api/agent/intent-guidance`, `app/api/agent/tone-calibrate`, `app/api/agent/tone-compare`, `app/api/agent/session-plan`, and `app/api/agent/session-cue` provide REST fallbacks for the same intent and session journeys.
- `lib/agentic/machine-capability.js` defines the versioned MCP Apps render contract and submission-safe CSP metadata.
- `lib/agentic/machine-widget.js` serves the self-contained ChatGPT machine widget with the Aurora visual, bridge calls, and explicit local audio preview.
- `lib/agentic/skill-capability.js` serves four hashed, static operating skills through the MCP skills extension.
- `lib/agentic/openapi-contract.js` generates the REST compatibility document from the same public registry.
- `components/agent/MemberWebMcpBridge.jsx` progressively adds private member tools on the signed-in dashboard.
- `next.config.js` includes the Linux `ffmpeg-static` binary in the Vercel render trace.

## Safety and trust boundaries

- Public tools can inspect and shape only the public session machine.
- Audio playback, account creation, payment, private record creation, and render starts require human confirmation or user submission.
- Private member routes require Supabase Auth and paid platform entitlement, and every query is scoped to the authenticated user.
- Model output is treated as untrusted classification data and must resolve to an approved catalog ID.
- The product describes listening cues and routines; it does not diagnose, treat, or guarantee a neurological outcome.

## Judge walkthrough

Use a compatible ChatGPT in-app browser or Chrome with WebMCP enabled. For a reproducible local Chrome run, open `chrome://flags/#enable-webmcp-testing`, set the flag to Enabled, relaunch Chrome, and visit the live homepage. The homepage should expose fifteen browser tools: state, absolute controls, relative carrier nudge, intention matching, intent clarification, sensory calibration, direction comparison, session planning, session cues, pack search, pack preview, policy, account options, generic preview, and signup navigation. The public MCP endpoint should expose twenty-three tools, including `get_ios_app_offer`, `clarify_intention`, `calibrate_tone`, `compare_tone_directions`, `plan_listening_session`, and `get_session_cue`. Confirm that the iPhone offer returns the App Store URL and $2.99 one-time price without a payment side effect. Confirm that intention matching selects a public tone, a vague request returns three bounded directions, a `too_bright` calibration lowers the carrier without crossing the published floor, a relaxation search returns a published pack, an unconfirmed pack preview returns `CONFIRMATION_REQUIRED`, a 20-minute plan returns arrive/practice/close phases, a cue does not echo diary content, and a gamma/246 Hz control call is reflected in the visible state. In the connected ChatGPT app, ask “open the tone machine for gamma at 246 Hz” and verify that the `text/html;profile=mcp-app` widget renders the Aurora visual, shows Gamma/246 Hz, offers the session guidance and calibration actions, and leaves audio off until the play button is pressed. Start at the live homepage and follow the short recording script in `DEMO-SCRIPT.md`. A normal browser should still provide the complete human controls without either agent surface.

## Judging-fit summary

- WebMCP leverage: structured state, absolute and relative bounded controls, public tone and pack selection, session comparison/planning/cues, canonical policy reads, explicit preview confirmation, and user-controlled signup.
- Execution: responsive landing page, audible public preview, private member render path, signed delivery, and progressive fallback.
- Potential impact: a specific workflow for focus, rest, creative space, and intentional reset rather than a generic chatbot wrapper.
- Creativity and ambition: an editable orchestrator machine connects language, audio design, visible controls, pack discovery, an in-ChatGPT visual workspace, safety-aware handoff, and a private export workflow.

## Local verification

```bash
npm install
npm run test:agentic
npm run test:billing
npm run test:studio
npm run build
```

Production environment variables are required for authenticated Supabase and server-side model operations. Never commit `.env*` files or provider keys.
