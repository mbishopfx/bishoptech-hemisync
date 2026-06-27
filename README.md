# Cognistration by BishopTech

Public BishopTech product site for Cognistration, built with Next.js and deployed with a Vercel frontend plus a Railway render backend.

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
- `AI_GATEWAY_API_KEY`
- `NEXT_PUBLIC_DEMO_USER_ID`

Optional for persistent render storage:

- `RENDER_ARTIFACTS_DIR`
- `BACKEND_ORIGIN`
- `NEXT_PUBLIC_BACKEND_ORIGIN`
- `CORS_ALLOWED_ORIGINS`

If this is unset locally, artifacts are stored under `.cache/audio-renders`.
In Railway, the app defaults to `/app/data/audio-renders`, which should be backed by a mounted volume.

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
Git: dirty: M README.md, M antigravity_loops/bidirectional-ffr/build_video.py, M antigravity_loops/bidirectional-ffr/copy_downloads.py, M antigravity_loops/bidirectional-ffr/output_2026_06_22/frame_01.mp4, M antigravity_loops/bidirectional-ffr/output_2026_06_22/frame_01.png, M antigravity_loops/bidirectional-ffr/output_2026_06_22/frame_02.png, M antigravity_loops/bidirectional-ffr/output_2026_06_22/frame_03.png, M antigravity_loops/bidirectional-ffr/output_2026_06_22/frame_04.mp4
Railway status: Project: Cognistration
Railway deployments: da504159-9d37-49fd-9b09-4bdaeeaf7683 | SUCCESS | 2026-05-13 19:58:05 -05:00 | 31db0d0a-3ee9-4a70-844c-b0fca0bc92fb | FAILED | 2026-05-13 19:57:31 -05:00 | dad19fd7-24b7-4411-853f-30aeb7b1c968 | REMOVED | 2026-05-13 19:26:46 -05:00
Railway logs: no recent output
Vercel latest: https://bishoptech-cognistration-mpis7hu6s-bishoptech.vercel.app
Vercel logs: Ready
YouTube channel: Cognistration | subs 4 | views 322 | videos 17
YouTube channel published: 2026-06-13T09:31:50.427333Z
YouTube analytics (last 7 completed days): views 256 | minutes 95.0 | avg_view_sec 38 | subs +4 / -0
<!-- maintenance-scan:end -->

## Main routes

- `POST /api/audio/generate`
- `POST /api/audio/combined`
- `POST /api/audio/journey`
- `POST /api/audio/overlay`
- `GET /api/health`

## Notes

- Sessions are for relaxation, meditation, and focus exploration, not medical treatment.
- Use headphones, moderate volume, and never listen while driving.
