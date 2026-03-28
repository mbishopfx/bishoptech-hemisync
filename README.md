# hemisync

Production-focused hemispheric synchronization generator built on Next.js.

## What’s in this repo now

- Stage-based 15-minute journey blueprints with explicit brain-state ramps
- Bundled ambient bed presets that can loop cleanly through full renders
- Guided render pipeline for WAV/MP3 export with analytics
- Generator UI for preset selection, stage editing, preview, and final render

## Key files

- `app/generate/SessionLab.jsx`
- `app/api/audio/combined/route.js`
- `app/api/audio/generate/route.js`
- `lib/audio/journeys.js`
- `lib/audio/assets.js`
- `lib/audio/background-layer.js`
- `docs/production-track-blueprints.md`

## Main routes

- `POST /api/audio/generate` for bed-first staged renders
- `POST /api/audio/combined` for staged renders with guidance voice and analytics

## Notes

- Sessions are for relaxation and meditation exploration, not medical treatment.
- Use headphones, moderate volume, and avoid listening while driving.
