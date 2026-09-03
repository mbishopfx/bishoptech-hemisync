# Cognistration by BishopTech

Public BishopTech product site for Cognistration, built with Next.js and deployed with a Vercel frontend plus a Railway render backend.

## WebMCP Challenge build

Cognistration is a human-first audio-session platform with progressive WebMCP and MCP Apps layers. On `/try`, an agent and listener can co-compose a visible, browser-local Agentic Session Score with up to twelve stages, constant 50–2,000 Hz per-stage carriers, truthful 0.1–40 Hz differential paths, selectable binaural/monaural/isochronic modes, breath pacing, approved ambience metadata, targeted refinement, undo, selection, and technical export. Preview remains capped at 120 seconds and requires explicit confirmation plus browser audio readiness. Public MCP can compose or validate the same score without persistence, rendering, or audio side effects. The regular human interface remains complete without either agent bridge.

- Live app: https://cognistration.com
- Challenge brief: `docs/challenge/WEBMCP-SUBMISSION.md`
- Demo script: `docs/challenge/DEMO-SCRIPT.md`
- Human-facing ChatGPT connection address: https://cognistration.com/connect
- REST/OpenAPI compatibility document: https://cognistration.com/openapi.json
- ChatGPT machine render tool: `open_machine_generator` via https://cognistration.com/connect
- Public MCP tools: the typed, bounded catalog published by `https://cognistration.com/api/capabilities`
- Homepage WebMCP tools: the progressive browser contract published by `https://cognistration.com/api/capabilities`
- iPhone app offer tool: `get_ios_app_offer` returns the public App Store listing, current $2.99 one-time price, and the on-device explanation for the lower cost

Agent discovery is available from `/.well-known/agent-card.json`, `/.well-known/ard.json`, `/.well-known/api-catalog`, `/.well-known/mcp/server-card.json`, `/.well-known/agent-skills/index.json`, and `/.well-known/schemamap.xml`. Markdown documentation is available from `/index.md`, `/docs.md`, and `/auth.md`; the read-only documentation MCP server is `/api/docs-mcp`.

## A note to the judges

Thank you for creating this challenge and for making room for people who are building between the rest of life. I’m a single, full-time father and a contractor, and I built Cognistration while continuing to serve my clients and keeping my family at the center. Codex and the efficiency of the OpenAI models have made that balance possible. They help me deliver good contracting work efficiently, then turn the small windows between responsibilities into real building time, without giving up the mornings that matter: getting my kids ready, taking them to school, being there for pickup, and making those moments meaningful.

I give the Codex and OpenAI teams my full gratitude and grace. The value of these tools is not only that they make development faster; they create room for meaningful work alongside meaningful responsibility. This project is my thank-you in code: an attempt to make a calmer, more human relationship between people and their agents. Thank you for the opportunity to participate.

## Operating loops

- `loops/state.md` is the resumable operating memory.
- `loops/morning-loop.md` handles tone growth, blog sync, and build readiness.
- `loops/evening-loop.md` handles backend section audits and verification.
- `loops/backend-rotation.md` defines the section rotation map.

## What the app does

- Designs staged binaural sessions with explicit delta-frequency ramps
- Layers curated ambient beds and breath pacing
- Exports mastered WAV and MP3 artifacts
- Returns analytics for band coverage, bed energy, and stage timing

## Current production shape

- `Next.js 15` with App Router
- Vercel-hosted frontend calling the Railway backend directly
- standalone build output for the Railway backend container
- `ffmpeg-static` for high-quality resampling and MP3 packaging
- file-backed artifact delivery with ranged streaming
- Railway-ready Dockerfile and healthcheck config

## Local development

```bash
npm install
npm run dev
```

## Required environment variables

Copy `.env.example` to `.env.local` and fill in the values you already use:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_ID` (the same project reference encoded in the Supabase URL)
- `AI_GATEWAY_API_KEY`
- `NEXT_PUBLIC_DEMO_USER_ID`

Optional for persistent render storage:

- `RENDER_ARTIFACTS_DIR`
- `BACKEND_ORIGIN`
- `NEXT_PUBLIC_BACKEND_ORIGIN`
- `CORS_ALLOWED_ORIGINS`

If this is unset locally, artifacts are stored under `.cache/audio-renders`.
In Railway, the app defaults to `/app/data/audio-renders`, which should be backed by a mounted volume.

For schema verification and migrations, also set `SUPABASE_DATABASE_URL` to a database connection for the same Supabase project. Run `npm run verify:supabase` before reviewing a `supabase db push --linked --dry-run`; do not apply migrations until the project URL, JWT references, and database reference all agree.

For the Vercel frontend, set:

```bash
NEXT_PUBLIC_BACKEND_ORIGIN=https://bishoptech-hemisync-production.up.railway.app
```

On Railway, allow the frontend origin:

```bash
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

`BACKEND_ORIGIN` remains available as an optional rewrite target, but the production path for long renders should be direct browser-to-Railway requests.

## Railway deployment

This repo now includes:

- `Dockerfile`
- `railway.json`
- `app/api/health/route.js`

Recommended setup:

1. Create or link a Railway project.
2. Add a volume mounted at `/app/data`.
3. Set the env vars from `.env.local`.
4. Deploy with `railway up`.

## Vercel frontend deployment

The Vercel project should be configured with:

1. The same public env vars the UI already uses.
2. `NEXT_PUBLIC_BACKEND_ORIGIN` pointing at the Railway backend.
3. A normal Next.js deployment.

The Railway backend should be configured with:

1. The existing server-side env vars.
2. `CORS_ALLOWED_ORIGINS` including the Vercel production origin.
3. The mounted `/app/data` volume for render artifacts.

## Maintenance snapshot

<!-- maintenance-scan:start -->
Git: dirty: D "../../Desktop/BishopTech HemiSync iOS/BishopTechHemiSync.xcodeproj/project.pbxproj", D "../../Desktop/BishopTech HemiSync iOS/Resources/BishopTechHemiSync.plist", D "../../Desktop/BishopTech HemiSync iOS/Sources/HemiSyncAuthView.swift", D "../../Desktop/BishopTech HemiSync iOS/project.yml", ?? ../../.CFUserTextEncoding, ?? ../../.DS_Store, ?? ../../.Trash/, ?? ../../.adal/
Blog target: ERROR fetching origin/main (fatal: 'origin' does not appear to be a git repository)
Railway status: Project: HEMISYNC
Railway deployments: 2bffb488-4587-4b57-8cbc-44e16a8239a5 | SUCCESS | 2026-07-14 00:01:32 -05:00 | d258d820-c633-4014-905f-7a8ad3dbe419 | FAILED | 2026-07-14 00:01:19 -05:00 | a38a7d58-4925-4462-ac68-afa7363a03a1 | FAILED | 2026-07-13 23:59:27 -05:00
Railway logs: Starting Container
Vercel latest: https://bishoptech-cognistration-muilay0mc-bishoptech.vercel.app
Vercel logs: Ready
YouTube channel: Cognistration | subs 216 | views 12950 | videos 50
YouTube channel published: 2026-06-13T09:31:50.427333Z
YouTube analytics (last 7 completed days): views 3533 | minutes 4456.0 | avg_view_sec 135 | subs +53 / -2
<!-- maintenance-scan:end -->

## Main routes

- `POST /api/audio/generate`
- `POST /api/audio/combined`
- `POST /api/audio/journey`
- `POST /api/audio/overlay`
- `GET /api/health`
- `POST /api/mcp` — public MCP JSON-RPC tools and MCP Apps resource
- `POST /api/docs-mcp` — read-only documentation search and retrieval over JSON-RPC
- `POST /ask` — bounded natural-language JSON or SSE compatibility surface
- `POST /a2a` — stateless agent-to-agent compatibility surface
- `POST /api/batch` — bounded read-only grouped catalog requests
- `GET /api/sandbox` — deterministic integration-test capabilities without account, audio, checkout, or persistence side effects

## Notes

- Sessions are for relaxation, meditation, and focus exploration, not medical treatment.
- Use headphones, moderate volume, and never listen while driving.
