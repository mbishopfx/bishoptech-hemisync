## HemiSync Meditation App — Technical Stack (Gateway-Optimized)

### Overview

Goal: A web app that lets users journal with AI assistance and generates stereo entrainment audio (WAV/MP3) from journal-derived intent/state to guide Hemisync-like focus and consciousness work. Optimized using learnings commonly associated with the Monroe Institute “Gateway Process” and hemispheric synchronization principles (publicly available materials), while ensuring modern safety and reproducibility. Deployed on Vercel using JavaScript, backend-first.

### High-Level Architecture

- **Client (Next.js App Router)**: Journal UI, playback UI, progress dashboard, account management.
- **Server (Vercel Functions)**: AI journaling, intent extraction, DSP synthesis, audio encoding, job orchestration, signed-URL delivery.
- **Database & Storage (Supabase)**: Postgres (journal entries, audio sessions/jobs), Storage (WAV/MP3), RLS for per-user access control.
- **AI Provider**: OpenAI for summarization, intent classification, safety redaction.
- **Queues/Cron**: Vercel Cron for cleanup; serverless job pattern with progress persistence (polling from client).

### Gateway/Governance Principles Incorporated

- Preset library for focus levels and session staging inspired by public Gateway descriptions (e.g., Focus 3/10/12/15/21 progression).
- Multi-layer entrainment: binaural beats + optional monaural/isochronic overlays for stronger perception at low SPL.
- Progressive frequency ramping, amplitude envelopes, and scripting for induction → deepening → exploration → return.
- Breath entrainment and resonance techniques (paced cues) embedded via AM depth curves and optional TTS voice guidance.
- Affirmation block and intention-setting at session start/end (customizable, privacy-safe).
- Safety constraints: conservative SPL targets, gradual transitions, and optional contraindication notices.

### Core Backend Concerns (Focus)

- Deterministic and safe audio synthesis (fixed sample rate, headroom, clickless envelopes).
- Efficient encoding to WAV (PCM) and MP3 (compact delivery) within Vercel limits.
- Idempotent job execution with resumable status and retry.
- Strict input validation, schema versioning, and audit logging.

## Stack Components

### Runtime & Framework

- **Next.js 14 (App Router)** on **Node.js 20** runtime (Vercel). Route Handlers for API.
- **JavaScript-first** codebase with incremental adoption of JSDoc types for safer server code. (Optionally TypeScript if desired later.)

### Audio Synthesis & Encoding (Server)

- PCM Synthesis (custom):
  - Sample rate: 44,100 Hz; bit depth: 16-bit PCM for WAV; stereo interleaved.
  - Two independent carriers (left/right) with differential beat frequency: `f_right = f_left + Δf`.
  - Windowed segments and gentle attack/release envelope (e.g., 80–150 ms) to prevent clicks.
  - Optional shaped noise bed (pink/brown) at low level for immersion and masking.
  - Progressive Δf ramping (e.g., Alpha→Theta) and amplitude modulation synchronized to breath pacing where requested.
  - Optional monaural beats (sum and re-synthesis) and isochronic pulses (gated AM) to enhance perceptual salience at low playback volumes.
- Libraries:
  - `wavefile` — reliable WAV container writer/reader for Node.
  - `lamejs` — MP3 encoding in pure JS (no native/ffmpeg dependency; serverless friendly).
  - Optional: `meyda` for audio feature extraction if we later analyze generated content.

Why not ffmpeg? ffmpeg.wasm is large and slow in serverless cold starts; native ffmpeg requires special packaging. `lamejs` + `wavefile` keep builds small and predictable on Vercel.

### Voice Guidance & Breath Entrainment (Optional)

- TTS Provider: OpenAI TTS (server-side render short guidance cues) or Google Cloud TTS if preferred.
- SSML-like control for pacing, pauses, and gentle phrasing aligned to session stages.
- Simple, short callouts only; primary entrainment remains tonal to avoid cognitive load.

### AI Layer

- Provider: **OpenAI** (Responses tuned for concise summaries, intent classification, and safety).
- Use cases:
  - Journal cleanup/summarization.
  - Intent/state classification → map to target brainwave ranges (delta/theta/alpha/beta/gamma) and session blueprint (length, envelopes, sweeps, focus-level preset).
  - Affirmations or micro-coaching snippets embedded in session metadata.
- Safety: content filtering + redaction pass before storage.

### Data & Storage

- **Supabase Postgres** (managed, scalable, easy local dev):
  - Tables (minimum viable):
    - `users` (user profile, settings, safety flags)
    - `journal_entries` (raw text, ai_summary, ai_intent, sentiment, created_at)
    - `audio_sessions` (user_id, parameters, status, duration_s, bpm, base_freq_hz, focus_level, entrainment_modes, beat_profile, output_urls)
    - `audio_jobs` (session_id, state: queued|processing|done|error, progress_0_100, logs, started_at, finished_at)
  - RLS policies for per-user isolation.
- **Supabase Storage**:
  - Buckets: `audio-generated` (final WAV/MP3), `audio-temp` (intermediate files, auto-clean by Cron).
  - Signed URLs for client download/playback.

### API Surface (Vercel Route Handlers)

- `POST /api/journal`
  - Input: `{ text }`
  - Output: `{ entryId, summary, intent, safety: { redacted, flags } }`
- `POST /api/audio/generate`
  - Input: `{ entryId, programPreset?, targetState?, focusLevel?, lengthSec?, baseFreqHz?, entrainmentModes?: { binaural?: boolean, monaural?: boolean, isochronic?: boolean }, breathGuide?: { enabled: boolean, pattern?: 'box'|'4-7-8'|'coherent-5.5' }, beatPlan? }`
  - Behavior: enqueue job, return `{ sessionId, jobId }`.
- `GET /api/audio/status/:jobId`
  - Output: `{ state, progress, urls?: { wav, mp3 } }`
- `GET /api/audio/session/:sessionId`
  - Output: session metadata + signed URLs.
- `POST /api/audio/cancel/:jobId` (optional)
- `GET /api/health` basic health probe.

### Journal → Beat Mapping (Gateway-Informed Heuristics)

- States and binaural Δf ranges (difference between L/R):
  - Delta (sleep/deep restoration): 1–3 Hz
  - Theta (meditation/creativity): 4–7 Hz
  - Alpha (relaxation/flow): 8–12 Hz
  - Beta (focused cognition): 14–18 Hz
  - Low Gamma (insight): 30–40 Hz (use sparingly)
- Carriers (comfortable range): 200–600 Hz; adjust to user preference.
- Envelope: smooth attack (≥80 ms), gentle release (≥200 ms), periodic depth modulation ≤3 dB to avoid fatigue.
- Optional sweeps: e.g., Theta sweep 7 → 4 Hz over session to deepen state.
- Focus-Level Presets (publicly described constructs):
  - Focus 3/10: Induction to “mind awake, body asleep” → start Alpha (10–12 Hz) then glide to Theta (6–7 Hz).
  - Focus 12: Expanded awareness → Theta center (5–6 Hz), optional gentle Gamma interludes (≤35 Hz, very low amplitude).
  - Focus 15: No-time exploration → deeper Theta (4–5 Hz) with slow AM depth pulsing tied to breath.
  - Focus 21: Boundary conditions → Theta low end (4 Hz) with occasional brief Alpha rises for orientation, then return.
- Mapping strategy:
  - Sentiment/stress → Alpha; if persistent, Alpha→Theta sweep.
  - Anxiety/rumination → extended Alpha stabilization before Theta entry; add breath pacing (coherent breathing ~5.5 BPM).
  - Sleep/insomnia → Delta (with pink/brown noise bed); avoid sudden transitions.
  - Focus/productivity → upper Alpha to low Beta; constrain Δf variance and AM depth.
  - Insight/spiritual exploration → Theta base with rare, brief Gamma micro-bursts at very low level.

### Packages & Versions

Runtime deps:
- `next@14.2.5`
- `react@18.3.1`
- `react-dom@18.3.1`
- `openai@4.55.3`
- `@supabase/supabase-js@2.44.0`
- `zod@3.23.8` (runtime validation for all API inputs)
- `wavefile@12.0.1`
- `lamejs@1.2.1`
- `compromise@14.14.5` (optional lightweight NLP for local hints pre-AI)
- `uuid@9.0.1`
- `pino@9.2.0` (structured logging) or `consola@3.2.3`
- `date-fns@3.6.0`

Dev deps:
- `eslint@9.8.0`, `eslint-config-next@14.2.5`, `prettier@3.3.3`
- `vitest@2.0.5` (unit tests, especially DSP correctness)
- Optional typing: `typescript@5.5.4`, `@types/node@20.14.10`, `@tsconfig/strictest@2.0.5`

### Environment Variables

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; restrict on Vercel)
- `APP_BASE_URL` (used in signed URL callbacks)
- `OPENAI_TTS_VOICE` (optional; voice selection)

### File/Module Layout (Proposed)

- `app/` (Next.js routes)
  - `api/journal/route.js`
  - `api/audio/generate/route.js`
  - `api/audio/status/[jobId]/route.js`
  - `api/audio/session/[sessionId]/route.js`
  - `health/route.js`
- `lib/`
  - `ai/journal.js` (summarize, classify, redact)
  - `audio/synth.js` (PCM generators, envelopes, mixers)
  - `audio/encode.js` (WAV via wavefile, MP3 via lamejs)
  - `audio/presets.js` (focus levels, entrainment modes, state mappings)
  - `audio/breath.js` (breath pacing curves, AM coupling)
  - `audio/scripting.js` (session blueprint DSL → time-parameter curves)
  - `db/supabase.js`
  - `jobs/audio-jobs.js` (orchestrate, progress tracking)
  - `validation/schemas.js` (zod schemas)
  - `logging/logger.js`

### Serverless Job Pattern

- On `POST /api/audio/generate`, create `audio_jobs` row with state=queued and return `jobId`.
- Immediately trigger processing within the same request (short sessions) or via client polling + re-entrant processing endpoint.
- Persist progress every N buffers written to keep UI responsive (e.g., 5–10 updates across session length).
- Store final WAV and MP3 in Supabase Storage; persist signed URLs in `audio_sessions`.

### Observability & Safety

- Logging: `pino` with request IDs; correlate `jobId` through logs.
- Metrics: simple counters (sessions, failures, avg synth time); Vercel Analytics for route latency.
- Safety: redact PII in journals; never echo sensitive data back to client beyond policy. Audio safeguards:
  - Peak limiter with headroom (e.g., -3 dBFS); target short-term loudness well below music norms.
  - Max Δf slew rate and AM depth caps to avoid abrupt perceptual changes.
  - Default high-pass at 30 Hz to prevent very low-frequency headphone stress.
  - Contraindication notice (e.g., epilepsy) and disclaimers in UI.

### Constraints & Performance Notes (Vercel)

- Keep cold start small: avoid heavy native deps; prefer pure JS encoders.
- Chunked synthesis: write PCM in chunks to buffer to limit memory spikes.
- Typical 20–30 min session MP3 is ok; WAV can be large—generate MP3 by default and WAV optionally.

### Session Blueprint DSL (Internal)

- JSON spec describing timed curves and layers, compiled server-side to parameter streams:

```json
{
  "version": 1,
  "lengthSec": 1800,
  "focusLevel": "F10",
  "layers": [
    { "type": "binaural", "baseHzL": 220, "deltaHz": { "curve": "linear", "from": 10, "to": 6 } },
    { "type": "isochronic", "carrierHz": 440, "pulseHz": { "curve": "ease-in", "from": 10, "to": 6 }, "depth": 0.25, "mix": -18 },
    { "type": "noise", "color": "pink", "mix": -24 },
    { "type": "am-breath", "pattern": "coherent-5.5", "depth": 0.1 }
  ],
  "stages": [
    { "name": "induction", "atSec": 0, "durationSec": 300 },
    { "name": "deepening", "atSec": 300, "durationSec": 900 },
    { "name": "exploration", "atSec": 1200, "durationSec": 500 },
    { "name": "return", "atSec": 1700, "durationSec": 100 }
  ]
}
```

### Testing Strategy

- Unit tests for:
  - PCM sine generation correctness (freq accuracy via zero-crossing)
  - Stereo phase/delta frequency validation
  - Envelope application click-less boundaries
  - Encoding round-trip (WAV headers, MP3 frame count)
- Contract tests for API schemas using `zod` and `vitest`.
- Validate DSL compilation determinism and exact duration/transition timings.

### Minimal Security Model

- Supabase RLS: rows scoped to `auth.uid()`.
- Signed URLs with short TTL; do not expose bucket paths directly.
- Server-only keys restricted via Vercel Environment Variables.

### Roadmap (Next)

- Personalization: per-user carrier/Δf comfort profiles learned over time.
- Isochronic/mono beat variants and ambient beds.
- Offline downloads with `Media Session API` metadata.
- In-app markers: AI prompts at key session times (voice overlays later).
- Research mode: A/B test carriers/deltas; collect subjective ratings to tune presets.

### Why This Stack

- All-JS/Node flow is serverless-friendly and portable on Vercel.
- Pure JS audio pipeline avoids native build headaches and cold-start bloat.
- Supabase provides an integrated auth/DB/storage story with RLS.
- Clear separation of concerns: AI intent → DSP plan → PCM synth → encoding → delivery.
- Gateway-informed presets and scripting encode best practices while preserving flexibility, safety, and transparency.


