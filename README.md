# HemiSync Studio

Premium beats-only hemispheric synchronization generator built with Next.js and prepared for Railway deployment.

## What the app does

- Designs staged binaural sessions with explicit delta-frequency ramps
- Layers curated ambient beds and breath pacing
- Exports mastered WAV and MP3 artifacts
- Returns analytics for band coverage, bed energy, and stage timing

## Current production shape

- `Next.js 14` with Node runtime
- standalone build output for container deployment
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
- `NEXT_PUBLIC_DEMO_USER_ID`

Optional for persistent render storage:

- `RENDER_ARTIFACTS_DIR`

If this is unset locally, artifacts are stored under `.cache/audio-renders`.
In Railway, the app defaults to `/app/data/audio-renders`, which should be backed by a mounted volume.

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

## Main routes

- `POST /api/audio/generate`
- `POST /api/audio/combined`
- `POST /api/audio/journey`
- `POST /api/audio/overlay`
- `GET /api/health`

## Notes

- Sessions are for relaxation, meditation, and focus exploration, not medical treatment.
- Use headphones, moderate volume, and never listen while driving.
