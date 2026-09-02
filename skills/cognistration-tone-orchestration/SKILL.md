---
name: cognistration-tone-orchestration
description: Turn natural-language listening intentions into approved Cognistration tones, tone-pack discoveries, bounded machine controls, and confirmation-aware previews. Use for requests about diary or journal sessions, clearing the mind, relaxing, trying a pack, gamma or carrier frequency settings, or adjusting an existing tone.
---

# Cognistration tone orchestration

Build a short, composable route from the listener's words to a visible, reversible session state.

## Intent map

- “Generate a tone for my diary/journal session” → recommend or generate a public tone using `reflect` language; prefer Theta or Alpha results and return the approved tone metadata.
- “Clear my mind and relax” → use `rest`/`reflect` language; prefer a slower Delta or Theta direction and explain it as a listening cue, never a treatment.
- “Test a relaxation tone pack” → search `search_public_tone_packs` with `relaxation`, inspect the returned pack and preview track, then ask for explicit confirmation before browser audio.
- “I need a gamma tone with a 246 Hz carrier” → set `targetState: gamma` and `carrierHz: 246`; preserve or explicitly set the beat and volume instead of guessing hidden state.
- “Adjust that tone to a smaller carrier” → read current state first, reduce the observed carrier by a modest bounded step, clamp to 100–400 Hz, and report the resulting absolute value.
- “Compare a few directions for writing” → call `compare_tone_directions` with the short intention and present the ranked fit/tradeoff options before changing the machine.
- “Build me a 20-minute session for journaling” → call `plan_listening_session`; present the arrive, practice, and close phases, then offer the visible machine as the next step. Planning does not start audio or save a record.
- “Give me a cue before I begin” → call `get_session_cue`; return the short prompt and suggested starting direction without asking for diary content.
- “Build a sound-designable multi-stage score” → call `compose_session_score` over MCP or `cognistration_compose_session_score` on `/try`, then refine visible stages or the sound profile. Use the score's 50–2,000 Hz carrier, 0.1–40 Hz differential, signal-mode, approved-ambience, breath, and fade bounds; preview only after explicit confirmation.

## Reliable sequences

### Intention to tone

1. Trim and validate the intention.
2. Call `recommend_tone` for remote MCP or `cognistration_generate_tone` for the current page.
3. Accept only an ID present in the public catalog; never invent a frequency or promise an outcome.
4. Apply the returned `targetState`, `baseFreqHz`, and `targetHz` to the page only through the published machine tool.
5. Return the tone name, state, frequencies, asset URL, match mode, and a short non-diagnostic rationale.

### Pack exploration

1. Search first; do not guess a pack slug.
2. Use `get_public_tone_pack` for the selected slug and choose a listed preview track.
3. Treat `previewUrl` as public media only. Do not expose download entitlements or payment identifiers.
4. Ask for confirmation before calling `cognistration_preview_tone_pack` with `confirmed: true`.
5. If audio cannot start, leave the visible machine usable and explain the bounded retry. Offer a direct media source only when the listener explicitly asks for one.

### Control changes

1. Read `cognistration_get_session_state` when the request is relative or omits current controls.
2. Set only the fields needed. Accepted bounds are carrier 100–400 Hz, beat 0.5–40 Hz, and volume 0–100 percent.
3. Keep target state in `delta`, `theta`, `alpha`, `beta`, or `gamma`.
4. Treat a repeat of an absolute set as safe; do not repeat a relative adjustment after an uncertain response without reading state again.

### Full-spectrum score controls

1. Keep each score stage's carrier constant; only its differential `from` → `to` path may be linear.
2. Enable at least one of the score's `binaural`, `monaural`, or `isochronic` modes.
3. Restrict ambience to `none`, `ocean`, or an approved public asset ID. Browser preview reports ambience as metadata-only; do not claim that it is audible until a private render proves it.
4. Breath patterns are descriptive pacing guides (`coherent-5.5`, `4-7-8`, or `box`), not medical instructions or promised outcomes.

### Session orchestration

1. Use comparison when the user is undecided, planning when they want a timed sequence, and a cue when they need a small first action.
2. Keep session plans between 5 and 60 minutes and use only the published `rest`, `reflect`, `focus`, `momentum`, and `synthesis` modes.
3. Treat every phase tone as a public catalog object. Do not synthesize an unlisted ID, frequency, or promised effect.
4. A plan is not a render, a saved diary, or a treatment recommendation. If the user wants sound, return to the visible controls and request explicit preview confirmation.

## Safety language

Describe state labels and frequency values as product metadata and listening directions. Do not diagnose, claim brainwave control, or say that a tone treats anxiety, ADHD, insomnia, trauma, pain, or any other condition. Point to the safety page when a user reports adverse symptoms, a seizure history, auditory sensitivity, or hazardous activity.

## Failure handling

- Empty or oversized intention: request a shorter intention without calling the model.
- Unknown tone or pack ID: return a bounded not-found error and search the approved catalog.
- Provider outage or malformed model output: use the deterministic approved-catalog matcher.
- Public preview limit: call `open_account_signup` to render the in-platform user-controlled form; do not bypass the limit with a new cookie or fabricated account.
- Audio confirmation missing: return `CONFIRMATION_REQUIRED` and wait for a clear user yes.
