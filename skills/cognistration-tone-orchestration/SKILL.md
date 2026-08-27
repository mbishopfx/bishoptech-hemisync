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
5. If audio cannot start, return the preview link and leave the visible machine usable.

### Control changes

1. Read `cognistration_get_session_state` when the request is relative or omits current controls.
2. Set only the fields needed. Accepted bounds are carrier 100–400 Hz, beat 0.5–40 Hz, and volume 0–100 percent.
3. Keep target state in `delta`, `theta`, `alpha`, `beta`, or `gamma`.
4. Treat a repeat of an absolute set as safe; do not repeat a relative adjustment after an uncertain response without reading state again.

## Safety language

Describe state labels and frequency values as product metadata and listening directions. Do not diagnose, claim brainwave control, or say that a tone treats anxiety, ADHD, insomnia, trauma, pain, or any other condition. Point to the safety page when a user reports adverse symptoms, a seizure history, auditory sensitivity, or hazardous activity.

## Failure handling

- Empty or oversized intention: request a shorter intention without calling the model.
- Unknown tone or pack ID: return a bounded not-found error and search the approved catalog.
- Provider outage or malformed model output: use the deterministic approved-catalog matcher.
- Public preview limit: route to `/signup`; do not bypass the limit with a new cookie or fabricated account.
- Audio confirmation missing: return `CONFIRMATION_REQUIRED` and wait for a clear user yes.
