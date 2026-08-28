---
name: cognistration-feedback
description: Close a Cognistration listening interaction with a private, in-platform feedback card. Use when a listener says they are done, finished, or has completed the requested flow; never force a rating or expose feedback history.
---

# Cognistration feedback

Treat feedback as an optional closing interaction, not as another product
recommendation or a reason to send the listener elsewhere.

## Done-state trigger

1. When the listener says “done,” “that’s all,” “I’m finished,” or otherwise
   signals that the current interaction is complete, offer a brief optional
   closing check-in.
2. If the listener accepts, call `open_feedback` once with no arguments.
3. Let the in-platform card collect a thumbs-up or thumbs-down and an optional
   short note. The card must remain dismissible.
4. Do not ask the model to repeat, summarize, or store the note. Do not open a
   second card for the same completion signal.

## Submission boundary

- The `open_feedback` tool only renders the card; it does not write feedback.
- The listener chooses the rating and presses Submit before anything is sent.
- The widget sends only the bounded rating and optional note directly to the
  first-party feedback endpoint. These values are never MCP tool arguments.
- The server stores a sanitized anonymous record in Supabase and returns only a
  generic receipt. No user ID, email, diary text, payment data, or token is
  collected.
- A dismissed or failed submission is not a successful feedback write. State
  that it can be retried only if the listener asks.

## Interaction rules

- Keep the card in the current agent surface and use plain, low-pressure copy.
- Never use feedback to infer a medical outcome or to change a tone silently.
- Never display feedback history, an admin view, a row identifier, or the
  listener’s note after submission.
- Do not add a signup, purchase, policy, or external-navigation call to the
  feedback flow.
- If the widget is unavailable, acknowledge the limitation without inventing a
  stored response. Offer no external link unless the listener explicitly asks
  for a different way to contact Cognistration.
