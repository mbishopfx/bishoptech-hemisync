# Cognistration — primary WebMCP challenge video script

> The current captured sequence has its own time-aligned narration in
> `DEMO-SCRIPT-RECORDED-TIMELINE.md`. This file remains the complete challenge
> flow with the explicit $0.50 payment coda; use it when reshooting that
> sequence rather than the shorter purchase/iPhone recording.

Target runtime: about 3 minutes. The final action in the recording is the
single, fixed $0.50 agent-to-agent preview. Do not click anything after the
receipt appears.

## Before recording

- Connect the live Cognistration MCP endpoint in a fresh ChatGPT conversation.
- Have `https://cognistration.com/try` open in another tab for the public
  cockpit.
- Use system audio, a clean browser profile, and a visible face camera for the
  opening and closing.
- Do not type real signup credentials into the recording. Show the in-platform
  form, then leave it untouched.
- Keep audio paused until the deliberate preview confirmation.
- The $0.50 step is a real financial action. Run it only with the same
  user-approved payment client that has already completed the successful demo;
  never paste a payment token or card data into ChatGPT.

## 0:00–0:22 — Face introduction

Look at the camera and say:

> Hi, I’m Matthew Bishop. I use OpenAI and Codex as a practical engineering
> partner: I can move from an idea to a tested, deployed product without
> waiting for a large team. I used to work full-time shifts as a single father
> while coordinating pickup from two different schools. With OpenAI and Codex,
> I replaced that job with freelance technology contracting at roughly twice
> the income, gained a schedule that lets me handle pickup and drop-off, and can
> now keep working on the go with Codex Remote.

## 0:22–0:40 — Why Cognistration exists

Show the Cognistration page and say:

> I built Cognistration first for myself. Crowded public places can make it
> difficult for me to settle, so I started making short personal listening
> tones. I came across the idea of brain entrainment and frequency-based
> listening and wanted to explore what a carefully bounded session felt like.
> The tones have felt helpful to me, and I realized the structured process
> could be useful to share. This is a listening and software experiment, not a
> diagnosis, treatment, or promise about the brain.

## 0:40–1:02 — Public, free starting point

Open `https://cognistration.com/try` and submit:

> I need a calm, clear place to start writing this afternoon.

Point to the selected public tone, the comparison, and the visible machine.
Say:

> The public path is free and does not require an account. The agent is
> selecting from an approved tone catalog, not inventing a medical answer.

Use the cockpit controls to show, quickly:

1. `arrive → practice → close` in a 20-minute plan.
2. One cue for the current phase.
3. A technical-only recipe with state, carrier, beat, volume, duration, and an
   intention label, with no diary text.
4. A bounded “too intense” or “slower” adjustment. Point out the exact change
   and leave audio paused.

## 1:02–1:42 — Fresh-chat MCP orchestration

Switch to the fresh connected ChatGPT conversation. Use this as the first
prompt:

```text
Use the Cognistration MCP server.

I need a calm, clear place to start writing this afternoon. Please:

1. Recommend one approved public tone.
2. Compare it with two alternatives and explain the tradeoffs.
3. Build a 20-minute arrive → practice → close plan.
4. Open the interactive Cognistration tone machine seeded to the selected tone.
5. Keep audio paused until I explicitly confirm.

Do not create an account, save a session, or spend money.
```

Let the result render. Then use these short follow-ups, waiting for the result
after each one:

```text
I need something better. Give me exactly three bounded directions instead of guessing.
```

```text
This feels too intense. Apply one bounded calibration and explain exactly what changed. Keep audio paused.
```

```text
Prepare a technical-only session recipe and confirm that it contains no diary content or account data.
```

Say:

> This is the part I wanted from an agentic interface: the agent can explain a
> choice, compare alternatives, and edit the same visible session machine. It
> does not silently start audio or save private content.

## 1:42–2:12 — Safety, signup, and feedback stay in the surface

In the connected conversation, ask:

```text
Could this treat my insomnia?
```

Show the safety-aware response and `/health-warning` route. Say:

> A medical-shaped request is routed to the safety boundary instead of getting
> improvised treatment advice.

Then ask:

```text
Can I make a free account? I like this platform.
```

Show `open_account_signup` rendering the capture form inside the MCP surface.
Do not submit it. Say:

> This is the correction to a common agent failure: the visitor gets a real
> capture form in-platform. Credentials never become MCP arguments, and the
> one-time private-workspace checkout is a separate user-reviewed step.

Next say:

```text
That’s all — I’m done.
```

Show `open_feedback` rendering the optional thumbs-up/down card. Do not submit
production feedback during the recording unless you intentionally want one
anonymous test row. Say:

> The closing check-in is also in-platform. Nothing is stored until the person
> chooses a rating and presses Submit, and there is no feedback history in the
> widget.

## 2:12–2:20 — Explicit preview

Say:

```text
Start the explicit preview now.
```

Press the visible confirmation/play control yourself. Let the audience see
the machine respond. Do not start another action after this preview.

## 2:20–3:00 — Final agent-to-agent payment coda

With the public tone already selected, say this exactly:

```text
As a final optional step, request one fixed $0.50 preview for the selected public tone. First discover the payment options, show me the 402 challenge, and only retry after I explicitly approve the charge. Do not submit payment without my confirmation.
```

Show the fixed amount and the HTTP 402 challenge. Then say:

```text
I explicitly approve this one fixed $0.50 preview and nothing else.
```

Let the authorized payment client retry the same bounded request. Show the
verified receipt/resource and the fixed amount. Do not click play, navigate, or
submit anything else after the receipt.

Close to camera:

> That last step is the extra layer: the agent can request a narrowly scoped
> machine preview, the server challenges before payment, and the retry is
> authorized for exactly fifty cents. The main experience remains free,
> human-visible, and human-controlled. Cognistration turns an intention into a
> small editable ritual without pretending to diagnose anyone.

## Editor’s shot checklist

- Face intro with Matthew on camera.
- `/try`: intention, comparison, three phases, recipe, calibration.
- Fresh ChatGPT: first prompt and inline machine widget with audio paused.
- Clarifier choices and one bounded adjustment.
- `/health-warning` safety boundary.
- Inline account capture form; no real credentials visible.
- Inline feedback card; no history and no automatic submission.
- Explicit preview confirmation.
- Final 402 challenge, explicit approval, verified $0.50 receipt.
- End immediately after the receipt.

## Claims and privacy guardrails

Describe the tones as a personal listening experience and software exploration.
Do not say they treat anxiety, insomnia, ADHD, stress, or any neurological
condition. Do not reveal a password, payment credential, account email, diary
text, private session, access key, or database record on camera.
