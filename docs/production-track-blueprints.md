# Production-Ready Track Blueprints

Date: 2026-03-28

## Goal

Make the current repo more shippable for polished 15-minute journeys without a giant architecture rewrite.

## What shipped in this pass

- A stronger shared stage blueprint model in `lib/audio/journeys.js`
- Curated 15-minute presets for phased brain-state journeys
- Bundled ambient asset metadata in `lib/audio/assets.js`
- Looping/crossfading ambient asset rendering in `lib/audio/background-layer.js`
- Route-level schema support for `journeyPresetId`, `stageBlueprint`, staged guidance, and ambient asset backgrounds
- Generator UI controls for journey presets, stage editing, guidance mode, and bundled bed selection
- Analytics-aware staged render responses

## Architecture map

### Blueprint resources

- `lib/audio/journeys.js`
  - owns staged preset resources
  - normalizes stage timing to session length
  - derives delta curves for the render engine
  - builds fallback guidance scripts
  - computes analytics-friendly summaries

- `lib/audio/assets.js`
  - owns curated ambient asset metadata and labels

- `lib/audio/background-layer.js`
  - turns background config into renderable stereo buffers
  - supports procedural ocean or bundled asset loops with crossfades

### Render surfaces

- `app/api/audio/generate/route.js`
  - renders staged entrainment beds

- `app/api/audio/combined/route.js`
  - renders staged entrainment + guidance voice + analytics

### Generator UI

- `app/generate/SessionLab.jsx`
  - selects a journey preset
  - edits stage timing, band ramps, and guidance density
  - chooses bundled ambient beds
  - previews, renders, and downloads outputs

## Included 15-minute presets

### `induction-alpha-theta-integration-15`

- Arrival
- Resonance
- Theta Descent
- Theta Hold
- Integration

Best use: balanced daily practice and clear return.

### `focus-15-no-time-15`

- Settling
- Bridge Downward
- No-Time Center
- Observation
- Soft Return

Best use: deeper slow-state exploration.

### `creative-hypnagogia-15`

- Creative Arrival
- Float State
- Hypnagogic Window
- Gather Insight
- Return Clear

Best use: ideation, imagery, liminal creativity.

### `deep-reset-15`

- Unwind
- Descend
- Restore
- Lift Toward Theta
- Coherent Return

Best use: restorative reset and nervous-system downshift.

## Bundled ambient assets

- `Lumina` — airy induction/integration bed
- `Mind's Eyes` — spacious theta bed
- `Nattkatt Slowed` — deeper nocturnal descent
- `Papa` — warm grounded return bed
- `Scatter` — liminal creative shimmer

## 15-minute design heuristics

- Use 4–5 stages, not 1–2 giant ramps
- Give the user at least one real dwell stage in the target band
- Keep the return deliberate instead of snapping back to alpha
- Use lighter guidance once the main descent is established
- Pair lighter voice density with stronger background continuity
- Prefer ambient beds that support the stage narrative, not distract from it

## Suggested next production steps

- Add stem export for voice, entrainment bed, and ambient bed
- Add per-stage carrier curves in the synth engine
- Add offline regression checks for delta curve shape and output duration
- Move long renders to a worker when session length or concurrency grows
