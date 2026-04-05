# HemiSync Studio

Premium beats-only hemispheric synchronization generator built with Next.js, with Vercel handling the frontend and Railway handling the render backend.

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
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `AI_PROVIDER` (`openai` or `gemini`)
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

## Main routes

- `POST /api/audio/generate`
- `POST /api/audio/combined`
- `POST /api/audio/journey`
- `POST /api/audio/overlay`
- `GET /api/health`

## Notes

- Sessions are for relaxation, meditation, and focus exploration, not medical treatment.
- Use headphones, moderate volume, and never listen while driving.
