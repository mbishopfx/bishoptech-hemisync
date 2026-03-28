# Premium HemiSync Platform Plan

Date: 2026-03-28

## Short-Term Repo Layer

This repo now has a more production-ready short-term layer for polished 15-minute track generation before any larger Rust/worker migration.

Shipped in this pass:

- shared staged journey blueprints
- curated phased presets for alpha/theta/deep-reset style sessions
- bundled ambient asset resources with loop/crossfade support
- clearer generator UI for staged renders
- stronger route/schema support for expressive session generation

See `docs/production-track-blueprints.md` for the repo-level design that now sits underneath the broader premium platform direction.

## Goal

Build a premium binaural and entrainment platform that:

- works as a web app and a mobile app,
- supports deep customization,
- exports high-quality audio in multiple formats,
- can scale to long-form sessions without fragile browser-only rendering,
- keeps the user experience calming and polished without making unsupported medical claims.

## Executive Call

Use JavaScript and React for product UI, but do not keep the final render engine as a pure Next.js serverless pipeline.

Recommended production architecture:

1. Keep `Next.js` for the web app.
2. Add a dedicated mobile app with `React Native` plus Expo dev builds.
3. Move premium audio rendering into a shared `Rust` DSP core.
4. Use `Python` as the research and QA lab, not as the production render engine.
5. Run final audio export in a dedicated worker service, not in a Vercel route returning base64 blobs.

## What The Current Repo Already Has

The current project is a good prototype, not a dead end.

Strong foundations already present:

- `Next.js` product shell
- preset-driven session model
- browser preview work with `Tone.js`
- server-side synthesis and export flow
- optional guidance voice generation
- Supabase-friendly architecture

Current ceiling that should be removed:

- base64 audio returned directly from API routes
- fixed `44.1 kHz` and `16-bit` output path
- pure JS render loop for long sessions
- no real separation between preview rendering and master export
- no dedicated mastering, QC, stem export, or long-job orchestration layer

## Recommended Library Stack

### 1. Web App

Use these for browser playback, preview, and fast UI iteration:

- `Web Audio API`
  - Native foundation for oscillators, filters, gains, channel routing, offline rendering, and custom DSP nodes.
  - Use it directly for the parts where timing and stereo routing matter.
- `Tone.js`
  - Keep it for session preview, transport, automation, and rapid iteration in the browser.
  - Do not make it the source of truth for the master export engine.
- `AudioWorklet`
  - Use for low-jitter browser preview DSP when the default graph nodes are not enough.
- `OfflineAudioContext`
  - Use for short preview bounces and waveform generation in-browser.

### 2. Shared Production DSP Core

Build the real engine in Rust and share it across render worker, web preview WASM, and future native mobile synthesis.

Core crates to evaluate first:

- `fundsp`
  - Best fit for composable synthesis graphs, modulation, filters, envelopes, and layered signal chains.
- `rubato`
  - High-quality sample-rate conversion for imports, stems, and export targets.
- `symphonia`
  - Strong audio decoding/import path for user beds and ambient assets.
- `hound`
  - Clean WAV read and write support.
- `cpal`
  - Useful if you later want the same engine to drive real-time native audio I/O on desktop, iOS, Android, or WebAssembly.

Why Rust for the core:

- deterministic renders,
- fast enough for long sessions and stem export,
- portable to WebAssembly,
- much better long-term than duplicating DSP logic in JS, Swift, Kotlin, and Python.

### 3. Render And Export Service

Use a dedicated worker service for final output and storage.

Recommended tools:

- Rust render worker using the shared DSP core
- `FFmpeg` for final packaging and codec conversion

Export targets:

- master WAV: `24-bit`, `48 kHz` minimum
- optional high-res WAV: `24-bit`, `96 kHz`
- `FLAC` for lossless delivery
- `AAC/M4A` for Apple-friendly mobile downloads
- `Opus` for efficient streaming and previews
- `MP3` only for broad compatibility

### 4. Mobile App

For product velocity and code reuse, use React Native for the app shell.

Recommended stack:

- `React Native` with Expo dev builds
- `react-native-track-player`
  - best fit for premium session playback, lock-screen controls, queueing, downloads, and background audio
- optional `expo-audio`
  - use only if you want a simpler cross-platform playback or recording helper inside the Expo ecosystem

Native escape hatches for phase two:

- iOS: `AVAudioEngine` plus `AVAudioSourceNode`
  - use if you want true on-device synthesis or offline native rendering later
- Android: `Oboe` and `AAudio`
  - use if you need low-latency native synthesis or tighter DSP control later

### 5. Python Research And QA Layer

Python is still valuable, just not as the main customer-facing engine.

Use Python for:

- preset experiments
- spectral analysis
- loudness and masking experiments
- randomized listening test generation
- regression QA on exported files

Recommended Python stack:

- `numpy`
- `scipy`
- `soundfile`
- `soxr`
- `librosa`
- `pedalboard`

Use `pydub` only as convenience glue if needed. Do not build the premium renderer around it.

## Product Architecture

### Proposed Platform Split

- `apps/web`
  - Next.js web app
- `apps/mobile`
  - React Native app
- `packages/session-blueprint`
  - shared TypeScript schema for presets, ramps, stages, exports, safety flags
- `packages/ui`
  - shared React primitives and design tokens where practical
- `packages/dsp-core`
  - Rust core compiled for worker first, then optionally to WASM
- `services/render-worker`
  - job processor for premium export, imports, mastering, and storage delivery
- `tools/research-lab`
  - Python analysis notebooks and QA scripts

### Why This Split

- web and mobile share session definitions without forcing shared audio runtime code,
- the DSP core stays single-source,
- previews stay fast,
- exports stay deterministic,
- long sessions do not depend on browser memory or serverless request limits.

## Session Model To Support

The session blueprint should become much more expressive than the current preset object.

Required capabilities:

- independent left and right carrier control
- arbitrary delta-frequency automation curves
- stage-based session timelines
- multiple entrainment modes per stage
- background ambience stems
- breath-linked modulation maps
- voice guidance markers and ducking rules
- loudness target and headroom policy
- export profile selection
- optional stem export
- analytics metadata for later personalization

## Premium Quality Requirements

These are the features that separate a prototype from a premium audio platform:

- clickless envelopes and parameter smoothing everywhere
- high-quality resampling
- proper dithering when reducing bit depth
- limiter and headroom policy instead of naive clipping
- per-layer stem rendering
- deterministic render hashes for cache reuse
- waveform and spectral QC
- loudness normalization by export target
- streamed file output to storage instead of base64 API payloads

## Recommended Delivery Model

### Preview

Use browser or device-side preview for:

- 15 to 120 second audition clips
- quick parameter tweaking
- instant feedback in the session lab

### Master Render

Use the worker for:

- full-length sessions
- premium downloads
- voice-guided final mixes
- multi-format export
- batch stem generation
- future marketplace or preset pack generation

## Data And Infra Plan

Keep `Supabase` for auth, Postgres, and storage metadata if you want to preserve the current repo direction.

But change the audio job path:

- web and mobile create a render job
- render worker writes progress updates
- final assets go to object storage
- clients stream or download signed URLs

Do not keep long render jobs inside standard Next.js request handlers.

## Brand, Safety, And Product Risk

Three platform risks should be handled early:

1. Claim risk
   - Your research file is product inspiration, not engineering evidence.
   - Market the product around guided focus, relaxation, ritual, immersion, and audio personalization.
   - Avoid hard neuroscience, medical, or consciousness claims unless you are prepared to substantiate them.
2. Naming risk
   - Review trademark exposure before shipping the exact `HemiSync` brand publicly.
3. Audio safety
   - Keep conservative defaults, headphone warnings, and clear contraindication messaging.

## Phased Build Plan

### Phase 1. Stabilize The Existing Prototype

- keep the current Next.js app,
- replace base64 response payloads with stored assets,
- add tests for frequency ramps, envelopes, render duration, and export integrity,
- separate preview audio from master export code paths.

### Phase 2. Introduce Shared Session Schemas

- create a typed session blueprint package,
- migrate current focus presets into versioned schemas,
- make web and future mobile clients consume the same blueprint contract.

### Phase 3. Build The Rust Core

- implement oscillators, binaural routing, monaural and isochronic layers,
- add modulation, noise beds, envelopes, and stage compilation,
- render WAV masters first,
- add import, resample, and background bed mixing,
- then add codec packaging through FFmpeg.

### Phase 4. Add Worker-Based Rendering

- move long renders to a dedicated service,
- persist progress and render logs,
- store masters and delivery copies,
- cache identical renders by blueprint hash.

### Phase 5. Launch The Mobile App

- ship playback-first mobile apps,
- support offline downloads and background audio,
- reuse the same backend render jobs and session library,
- add on-device preview only after backend rendering is stable.

### Phase 6. Advanced Personalization

- user comfort profiles for carrier ranges,
- subjective response scoring,
- A/B testing on ramps, ambience, and voice cadence,
- adaptive recommendations over time.

## Recommended First Build Order

If I were driving the next implementation cycle, I would do this in order:

1. Freeze the current JS prototype as the reference implementation.
2. Create a real session blueprint schema package.
3. Replace base64 audio responses with stored file delivery.
4. Stand up a Rust render worker that can reproduce one existing preset exactly.
5. Add export profiles: preview MP3, mobile AAC, master WAV, lossless FLAC.
6. Start the mobile app as a playback client, not a synthesis client.

## Bottom Line

Best long-term stack for this product:

- Web UI: `Next.js`
- Mobile UI: `React Native` plus Expo dev builds
- Playback: `react-native-track-player`
- Browser preview: `Web Audio API` plus `Tone.js`
- Core DSP: `Rust`
- Worker export: Rust plus `FFmpeg`
- Research and QA: `Python`

That stack gives you the best balance of:

- premium audio quality,
- deep customization,
- web and mobile coverage,
- realistic maintenance,
- and a path to scale without rewriting the engine twice.
