# Cognistration production screen-recording flows

Use these prompts against the production app after deployment. They are written
for a public, under-three-minute WebMCP challenge recording, but the longer
flows are useful for product demos and reshoots.

Production surfaces:

- App: https://cognistration.com/try
- Remote MCP: https://cognistration.com/api/mcp
- MCP Apps connection: https://cognistration.com/connect
- SDK reference: https://cognistration.com/docs

## Before recording

1. Use a clean browser window and keep system audio on if you will demonstrate
   the preview. Use headphones and a comfortable volume.
2. For native browser WebMCP, use a compatible ChatGPT in-app browser or Chrome
   with WebMCP testing enabled. If the browser does not expose
   `document.modelContext`, record the `/try` cockpit and the MCP Apps flow
   instead; the human controls remain the fallback.
3. Do not put passwords, API keys, card data, private diary text, or real
   member records on screen. Account and payment steps stop at the user-owned
   confirmation boundary unless a separate test account and explicit approval
   are available.
4. Open `/docs` in a second tab before the take so the exact contracts can be
   shown without leaving the product.

## Recommended 2:30 judging take

### 0:00–0:15 — Frame the problem

Open `/try` and say:

> “Cognistration turns a person’s next intention into an editable listening
> session. The agent can interpret and stage the session, while the person
> keeps control of audio, accounts, private data, and payment.”

### 0:15–0:40 — Clarify instead of guessing

Type or say:

> “I need something better.”

Then ask the connected agent:

> “Clarify this broad request with a few bounded listening directions. Do not
> start audio or change the machine yet.”

Show the three choices. Choose one, then ask:

> “Find a public Cognistration tone for a calm place to start writing. Explain
> the practical fit without making a medical claim.”

Point out that the result resolves to the approved public catalog.

### 0:40–1:05 — Build a short ritual

Ask:

> “Compare three approved directions for a scattered afternoon before writing,
> then build a 20-minute arrive, practice, and close plan. Keep audio off.”

Show the comparison, the three phases, and one cue:

> “Give me one short focus cue for this plan. Do not read or store diary text.”

Then ask:

> “Prepare a portable technical session recipe for this plan. Show the state,
> carrier, beat, volume, and duration, and confirm that the raw intention is
> not included.”

### 1:05–1:35 — Open the builder and make the state visible

Ask the connected MCP Apps agent:

> “Open the Cognistration tone machine for a gamma tone with a 246 Hz carrier.
> Keep audio paused.”

Show the inline machine, Gamma/246 Hz state, Aurora visual, and visible
controls. Then ask:

> “Read the current visible session state, make the carrier smaller by one
> bounded step, and tell me the previous and new values. Do not start audio.”

The visible controls should change in the same machine the person can see.

### 1:35–1:55 — Show the science guide and randomized GPU ocean

Ask:

> “Open the science guide for the current direction. Keep audio off and show me
> the evidence limits.”

Advance two or three slides. Point out the FFT ocean surface, the telemetry
badge, the source link, and the safety slide. Close and reopen the guide, then
say:

> “Open the science guide again.”

Show that the new run has a different run label and bounded wind/speed profile.
The ocean is produced by the checked-in vGPU FFT pipeline and the seed changes
the spectrum, wave parameters, and animation speed for each generation.

### 1:55–2:15 — Prove consent and safety

Ask:

> “Start the local audio preview.”

Pause before confirming and say:

> “The agent may request the preview, but the person must explicitly confirm
> before audio begins.”

If you want an audible moment, confirm it yourself and let the preview play for
two seconds. Then ask:

> “Could this cure my condition?”

Show the safety redirect or canonical health-warning link. Do not ask the tool
to diagnose or treat a real personal situation.

### 2:15–2:30 — Close on the contract

Open `/docs` and say:

> “The same product publishes its MCP tools, WebMCP tools, MCP Apps resources,
> skills, prompt template, route map, and safety boundaries as an SDK-style
> contract. The browser and remote MCP layers share bounded capabilities.”

End on `/docs` or `/try`, not on a private dashboard or a payment form.

## Builder and guide feature reel

Use this as a dedicated 60–90 second product reel:

1. “Open the machine for theta at 200 Hz. Keep audio off.”
2. “Find a tone for a clear mind before writing and apply it to the visible
   machine.”
3. “Show the current state, carrier, beat, and volume.”
4. “Make the carrier smaller, then show the before and after values.”
5. “Open the science guide and explain FFR, descriptive frequency bands, and the
   evidence boundary in plain language.”
6. “Close and reopen the guide so I can compare two randomized ocean runs.”
7. “Do not start audio until I explicitly confirm.”
8. “Start the preview only after I confirm.”

Capture the guide badge after each open. A different `run XXXXXXXX` label is a
quick visual proof that the generation is not a static background. If WebGPU is
unavailable, capture the readable fallback message and the source link rather
than claiming a live GPU render.

## Full remote MCP capability tour

Use this when the audience cares about the connector surface more than the
visuals:

> “Discover Cognistration’s public capabilities and tell me which actions are
> read-only, which actions update visible controls, and which actions require
> user confirmation.”

Then run these prompts in order:

> “Search the public tone catalog for focus and return three options.”

> “Get the first approved public tone’s metadata and preview URL.”

> “Compare three directions for a calm writing session.”

> “Plan a 20-minute arrive, practice, and close session.”

> “Give me a reflection cue without storing or echoing the intention.”

> “Prepare a technical-only recipe with no diary text.”

> “Search public tone packs for relaxation, but do not start audio.”

> “Show the safety, privacy, pricing, and account policy links.”

> “Show the public account options without asking for credentials.”

> “Show the current iPhone offer and App Store link. Do not process a payment.”

> “Open the tone machine for a gamma tone at 246 Hz, with audio paused.”

> “Open the science guide for the current machine direction, with audio off.”

If the host supports the skills extension, add:

> “List the available Cognistration skills, read the relevant skill summary for
> this route, and explain that skill guidance does not grant authorization.”

If the host supports prompt templates, add:

> “List the prompt templates and resolve the public tone-selection prompt for a
> focus session.”

## Account creation flow

This demonstrates the working account connector without leaking credentials:

> “Show me the free public preview and private workspace options. Do not collect
> credentials or submit payment.”

> “Open the Cognistration account signup form in the current surface. I will
> review and submit it myself.”

When the form appears, show that email/password entry is inside the first-party
surface. Keep the password field hidden. If creating a test account is part of a
separate approved recording, submit it manually and show only the success state;
never let the transcript or screen recording contain the credential.

## Public pack flow

Use this to show search-before-action and explicit audio consent:

> “Find a published relaxation tone pack and show its available preview track.”

> “Prepare that pack preview, but do not start audio until I confirm.”

The first request should return public metadata. The second should remain at the
confirmation boundary when `confirmed` is false. If you want an audible proof,
say:

> “I confirm this local preview. Start it now.”

Stop playback yourself after a short sample. Do not use a real purchase or
private download in the public challenge recording.

## Optional payment-protocol proof

This is a bonus only; it is not needed to demonstrate the product’s core value.
Use a provider-approved test credential and explicit authorization, or stop at
the no-credential challenge:

> “Show the fixed machine-payment options and request the public preview
> challenge. Do not submit a payment credential or create a charge.”

Show the fixed amount, scope, expiry, and HTTP 402 response if the cockpit makes
them available. Never paste a card number, bearer key, or provider secret into
the chat. Do not describe a challenge response as a successful payment.

## Native WebMCP flow in Chrome

For Chrome WebMCP testing, enable the WebMCP testing flag, relaunch, and open
`/try`. Use:

> “Read the visible Cognistration session state.”

> “Set the visible session to gamma, 246 Hz, 39.5 Hz beat, and 50 percent
> volume. Do not start audio.”

> “Nudge the carrier smaller and report the before and after values.”

> “Clarify ‘I need something better’ without changing the controls.”

> “Open the science guide for this visible direction.”

The judge should see the same controls change in the page. If the browser does
not expose native WebMCP, use the remote MCP Apps flow and state that ordinary
browsers retain the human fallback.

## Final capture checklist

- Keep the final video public, under three minutes, with audio if audio is a
  feature shown in the take.
- Show the live production URL and one visible successful tool result.
- Show the machine’s visible controls, the science guide, and a changed ocean
  run label.
- Keep audio paused until explicit confirmation; do not imply that a tool call
  silently starts playback.
- Show `/docs` briefly so the tool/resource/skill contract is discoverable.
- Do not show credentials, private records, secrets, or a real payment.
- The final manual submission still needs the public demo video URL in the
  WebMCP Challenge submission form.

The official challenge references are the [WebMCP Challenge rules](https://webmcp.devpost.com/rules), the [OpenAI challenge overview](https://openai.com/webmcp-challenge/), the [vGPU FFT ocean example](https://vgpu.sh/examples/fft-ocean-surface), and the [vGPU docs](https://vgpu.sh/docs).
