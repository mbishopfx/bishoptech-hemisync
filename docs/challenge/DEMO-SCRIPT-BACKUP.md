# Cognistration — recording backup and reshoot sheet

This is the operational sheet for a clean reshoot. It is not a third product
flow and should not be read aloud.

## Preflight

- Confirm the fresh ChatGPT conversation is connected to
  `https://cognistration.com/api/mcp`.
- Confirm `https://cognistration.com/try` shows the public machine.
- Confirm the MCP tool list includes `clarify_intention`,
  `calibrate_tone`, `compare_tone_directions`, `plan_listening_session`,
  `prepare_session_recipe`, `open_account_signup`, `open_feedback`, and
  `get_machine_payment_options`.
- Confirm the account widget is visible before typing anything into it.
- Use a neutral synthetic intention such as “a calm writing session.”
- Keep all real email addresses, passwords, payment credentials, private
  session names, and access keys off-screen.
- Prepare the authorized payment client before the final take. The $0.50
  approval must be the last meaningful action in the video.

## If the first MCP response is slow

Say:

> I’m waiting for the public capability discovery; the request is read-only and
> does not create an account, start audio, or spend money.

If the result does not arrive, cut to the `/try` cockpit and continue the public
flow. Do not improvise a claim that the MCP request succeeded.

## If the agent guesses instead of clarifying

Send this exact repair prompt:

```text
Stop and clarify. I said “I need something better.” Give exactly three bounded directions with a one-line tradeoff for each. Do not choose for me yet.
```

## If the signup request tries to navigate away

Do not follow the link on camera. Say:

> The intended path is the in-platform `open_account_signup` widget. I’m
> reopening that render surface so credentials remain user-entered and the
> private-workspace checkout stays separate.

Then ask:

```text
Open the Cognistration account signup form inside this conversation. Do not navigate away or submit credentials.
```

## If the feedback card does not open

Use:

```text
I’m finished. Open the optional Cognistration feedback card in-platform. Do not submit anything.
```

If it still fails, omit the feedback shot rather than showing an external CTA.
The primary judge evidence is the machine, public flow, safety boundary,
signup capture, and payment challenge.

## If payment is unavailable

Show the first request and the real HTTP 402 challenge. Say:

> The merchant has advertised a fixed fifty-cent resource and challenged the
> request before payment. I’m not going to bypass the provider authorization
> boundary on camera.

Do not fabricate a receipt, paste a token, or retry without the approved payment
client. Reshoot the final minute once the same successful payment setup is
available.

## If the live $0.50 retry succeeds

- Show the amount, scope, and verified receipt briefly.
- Do not start audio after the receipt.
- Do not open another page.
- Do not submit signup or feedback after it.
- End the recording on the receipt and the sentence “That was one fixed,
  explicitly approved preview.”

## Suggested pickups

1. Face introduction.
2. Public `/try` intention and comparison.
3. Ritual phases and technical-only recipe.
4. Clarifier and bounded calibration.
5. Safety response.
6. In-platform signup widget.
7. In-platform feedback widget.
8. Explicit audio confirmation.
9. 402 challenge and approved payment receipt.

Use cuts between pickups if a live network wait makes the full take too long.
The story should remain chronological, and the payment receipt must remain the
last visual.
