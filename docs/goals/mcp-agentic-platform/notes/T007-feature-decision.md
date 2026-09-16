# T007: Agentic Session Score Decision

Task: `T007`
Kind: `judge`
Status: `current`

## Decision

Build **Agentic Session Score v1** as the distinctive challenge feature.

The score is a public, ephemeral, top-level `/try` artifact that an agent can compose and refine while the listener sees every stage. It exposes the full trustworthy frequency vocabulary of the current public binaural preview: state, carrier, beat start/end, volume, stage duration, and ordered multi-stage progression. The listener can select a stage, inspect channel math, undo an agent refinement, export technical settings, and explicitly confirm audio preview. Public tools never persist or render the score.

## Why This Wins

- It turns the existing single-tone tool surface into genuine human-agent co-creation rather than adding another lookup.
- It is visible and inspectable on the same page, matching current WebMCP guidance and the challenge's WebMCP-leverage criterion.
- It solves a real product problem: a listener should not need to manually coordinate several frequency controls and transitions to create a useful staged session.
- It is demonstrable in under three minutes without account credentials or payment.
- It reuses deterministic product logic and preserves user control over playback.

## V1 Semantics

- Score duration: `60–3600` seconds.
- Stages: `1–6`; each stage is at least `15` seconds; durations must sum exactly to the score total.
- Stage fields: stable ID, short label, descriptive state, integer carrier `100–400 Hz`, beat from/to `0.5–40 Hz` in `0.5 Hz` increments, and volume `0–100`.
- Carrier behavior: constant within a stage and allowed to step between stages. Do not describe it as a continuous sweep.
- Beat behavior: a linear within-stage sweep from `beatHz.from` to `beatHz.to`.
- Engine: public binaural sine preview only. Monaural, isochronic, background, breath, crossfade, and durable Studio rendering are not claimed by this v1.
- Public MCP `compose_session_score` validates or deterministically composes structured technical output and has no side effect.
- WebMCP tools compose the visible score, refine one stage, undo one or more visible revisions, select a stage, and start only a confirmed preview.
- The existing 120-second public preview cap remains authoritative. A longer score may be planned/exported, but the page must not claim an unauthenticated full render.
- Safety redirects happen before intention-derived composition. Free-form intention is never copied into the technical score or persisted.
- Public score state is browser-local and ephemeral. Saving/rendering stays behind the existing authenticated member boundary and is not part of this Worker slice.

## Worker Objective

Implement the shared Session Score validator/composer, public REST and MCP read-only composition, top-level WebMCP compose/refine/undo/select/confirmed-preview actions, visible score conductor on `/try`, technical export, strict regression coverage, and challenge/public documentation updates.

## Allowed Files

- `lib/agentic/session-score-capability.js` (new)
- `app/api/agent/session-score/route.js` (new)
- `components/machine/SessionScoreConductor.jsx` (new)
- `lib/agentic/webmcp-contract.js`
- `lib/agentic/mcp-contract.js`
- `app/api/mcp/route.js`
- `lib/agentic/openapi-contract.js`
- `lib/agentic/discovery-contract.js`
- `app/api/capabilities/route.js`
- `app/agent-instructions.md/route.js`
- `components/challenge/TryCockpit.jsx`
- `components/machine/ToneMachineDemo.jsx`
- `app/try/page.js`
- `tests/agentic-capability.test.mjs`
- `scripts/audit-mcp.mjs`
- `scripts/test-mcp-live.mjs`
- `docs/agentic/MCP-SERVER-SPEC.md`
- `docs/agentic/RELEASE-AND-TEST-PLAN.md`
- `docs/challenge/WEBMCP-SUBMISSION.md`
- `docs/challenge/DEMO-SCRIPT.md`
- `README.md`
- `docs/goals/mcp-agentic-platform/state.yaml`
- `docs/goals/mcp-agentic-platform/notes/T008-worker-receipt.md`

## Verification

- `npm run test:agentic`
- `node --experimental-default-type=module --test tests/studio-spec.test.mjs`
- `npm run lint`
- `git diff --check` on the exact Worker files
- Local dev HTTP checks for the score REST route and MCP tools/list + tools/call
- Local WebMCP mock/browser checks for compose, refine, undo, select, unconfirmed preview denial, and visible timeline state
- No local `npm run build`; Vercel must supply production build proof

## Stop Conditions

- A required edit is outside the allowed file list.
- Public composition would persist, render, expose private member data, accept arbitrary assets, or include diary text.
- Audio could start without `confirmed: true` or without the visible engine reporting readiness.
- The feature would claim continuous carrier sweeps or exact renderer modes that current parity evidence does not prove.
- The same verification failure repeats twice for the same cause.

## Deferred Alternatives

- Continuous carrier ramps in durable Studio output.
- Exact monaural/isochronic parity, distinct breath-pattern rendering, and background crossfade.
- Authenticated exact-score save/render handoff.
- A/B calibration built on score history.

A separate release Worker remains required for Vercel build, canonical route/operation proof, compatible-browser WebMCP proof, public mirror synchronization, and challenge artifact updates.

## Board Receipt Snippet

```yaml
receipt:
  result: done
  decision: "Build public ephemeral Agentic Session Score v1 with visible multi-stage composition, refine/undo, and confirmed preview."
  note: notes/T007-feature-decision.md
  next_allowed_task: T008
```
