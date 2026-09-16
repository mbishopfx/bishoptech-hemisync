# T006: Current Platform, Synthesis, and Challenge Research

Task: `T006`
Kind: `scout`
Status: `current`

## Summary

Production already exposes a substantial MCP/WebMCP platform, but the richer Studio synthesis controls are not agent-authorable. The strongest extension is a public, ephemeral Agentic Session Score: the agent composes a visible multi-stage carrier/rhythm path, the listener refines or undoes it, and audio starts only after explicit confirmation. Saving and full rendering remain authenticated member operations.

## Current Capability Truth

- Production reports MCP server `0.13.0`, 37 public MCP tools, 17 resources, 23 top-level WebMCP tools, and 11 member WebMCP tools.
- Public live controls cover state, carrier `100–400 Hz`, beat `0.5–40 Hz`, and volume `0–100`.
- Studio truth covers `300–3600` seconds, `1–12` stages of at least `15` seconds, carrier `50–2000 Hz`, beat paths from/to `0.1–40 Hz`, at least one of binaural/monaural/isochronic, approved backgrounds at `-60..-6 dB`, breath pacing `2–12 bpm`, and fades `0–60` seconds.
- Existing member agent planning maps intention to presets. It does not accept exact stages, modes, background, breath, or fade controls. Member WebMCP also caps duration at 1200 seconds while the server capability supports 3600.
- `/try` already renders a catalog-derived three-phase ritual with manual transitions, but it has no arbitrary score, targeted refinement, history, or undo.

## Renderer Constraints

- Current Studio FFmpeg rendering supports linear beat-frequency sweeps inside a stage.
- Carrier frequency is constant within a stage and changes between stages; do not call this a continuous carrier sweep.
- Monaural parity needs proof; isochronic pacing currently derives one middle-stage rate; named breath patterns collapse through a floor in the FFmpeg path; `crossfadeSec` is not honored there.
- Fades and background mix are honored.
- State labels are descriptive metadata and are not numeric guarantees.

The first extension must expose only behavior the active browser or renderer can truthfully honor. Continuous carrier ramps, exact monaural/isochronic parity, distinct breath patterns, and background crossfade stay deferred unless their render paths and tests are fixed first.

## Challenge Evidence

- The official judging criteria are equally weighted: WebMCP leverage, execution, potential impact, and creativity/ambition.
- OpenAI's current site-tools guidance emphasizes page-scoped shared state, narrow schemas, existing application permissions, enough returned state to verify results, and graceful fallback when WebMCP is absent.
- The challenge requires a working live URL, a public licensed repository, a public demo video under three minutes, and clear evidence distinguishing meaningful WebMCP work added during the submission period.
- Primary sources: https://openai.com/webmcp-challenge/, https://webmcp.devpost.com/, https://webmcp.devpost.com/rules, https://learn.chatgpt.com/docs/webmcp, https://developer.chrome.com/docs/ai/webmcp.

## Ranked Feature Candidates

1. Agentic Session Score with visible timeline, stage refinement, undo, and confirmed selected-stage or sequence preview.
2. Live A/B calibration with visible history and undo.
3. Portable technical recipe v2 handoff/resume.
4. Explainable score linter for channel math and label/rhythm mismatches.

The Session Score ranks first because it turns high-dimensional synthesis controls into a shared human-agent artifact rather than another catalog query.

## Recommended Safe Slice

Implement public ephemeral Session Score v1 with strict shared validation, carrier steps between stages, true beat sweeps, a visible top-level `/try` timeline, targeted refine/undo, technical export, and confirmation-gated preview. Expose the same composition result through public MCP as read-only structured output and through WebMCP as visible page state. Keep persistence, durable rendering, account data, arbitrary assets, and payment behind existing authenticated or user-controlled boundaries.

Candidate owning files are `lib/agentic/session-score-capability.js`, `app/api/agent/session-score/route.js`, `components/machine/SessionScoreConductor.jsx`, `lib/agentic/webmcp-contract.js`, `lib/agentic/mcp-contract.js`, `lib/agentic/openapi-contract.js`, `components/machine/ToneMachineDemo.jsx`, `components/challenge/TryCockpit.jsx`, member bridge/plan files only if the authenticated handoff is in this slice, `tests/agentic-capability.test.mjs`, MCP audit scripts, and challenge documentation.

Verification should cover valid compose/refine/undo, duration-sum rejection, range rejection, no-enabled-mode rejection, unknown-asset rejection, preview confirmation denial, public persistence/render denial, WebMCP discovery and visible-state execution, MCP tool discovery/call, the agentic and Studio-spec suites, browser audit, remote Vercel build, and canonical live operations.

## Stop Conditions

- Public persistence or rendering would expose private member authority.
- Arbitrary assets, raw diary text, secrets, credentials, or private records enter the public contract.
- Audio can start without explicit confirmation.
- A public claim depends on unproven renderer parity.
- Required edits leave the Judge-approved file scope.

## Board Receipt Snippet

```yaml
receipt:
  result: done
  note: notes/T006-platform-research.md
  summary: "Mapped production, local synthesis truth, contract gaps, challenge criteria, and ranked a visible Agentic Session Score as the strongest safe extension."
```
