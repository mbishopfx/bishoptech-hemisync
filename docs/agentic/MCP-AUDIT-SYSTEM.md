# Cognistration MCP audit system

This is the release audit for Cognistration's public agent surfaces. It compares
the checked-in registries with the canonical production server, exercises every
public MCP tool with bounded fixtures, reads every public resource and skill,
checks the REST and UCP compatibility adapters, and can add a real browser
WebMCP registration smoke test.

The audit is intentionally non-destructive. It never submits credentials,
feedback, a confirmed checkout, a payment credential, or audio playback. It
does exercise safe control-tool responses and provider-gated payment discovery
so the authorization boundaries are tested instead of merely documented.

## Run it

From the repository root:

```bash
npm run audit:mcp
```

The default target is:

```text
https://cognistration.com/api/mcp
```

The run is paced for the public rate limit and writes a redacted JSON report to
`output/audits/mcp-audit-latest.json`. Use the options below when a different
transport or a faster local target is needed:

```bash
# Add the real browser WebMCP registration check when Playwright is available.
npm run audit:mcp:browser

# Audit a preview, edge relay, or local server.
npm run audit:mcp -- --endpoint https://preview.example/api/mcp

# Skip compatibility families while debugging only the MCP contract.
npm run audit:mcp -- --skip-rest --skip-ucp

# Override the pacing/report location for CI or a local server.
npm run audit:mcp -- --pace-ms 50 --retry-429-ms 1000 --report output/audits/preview.json
```

Environment equivalents are available for automation:

- `COGNISTRATION_MCP_ENDPOINT`
- `COGNISTRATION_MCP_ORIGIN`
- `COGNISTRATION_SITE_ORIGIN`
- `COGNISTRATION_MCP_AUDIT_REPORT`
- `COGNISTRATION_MCP_AUDIT_PACE_MS`
- `COGNISTRATION_MCP_AUDIT_RETRY_429_MS`
- `COGNISTRATION_PLAYWRIGHT_MODULE`
- `COGNISTRATION_CHROME_PATH`

## What is covered

| Area | Audit coverage |
| --- | --- |
| Local contract | Registry uniqueness, current counts, protocol versions, UCP binding, strict input objects, output schemas, authorization and side-effect annotations, credential-shaped input rejection, UI CSP/domain metadata, border preference, iframe sandboxing, and public manifest consistency. |
| MCP discovery | HTTP health, modern `server/discover`, modern `tools/list`, `resources/list`, `prompts/list`, `ping`, legacy `initialize`, and legacy tool discovery. |
| Resources | Every canonical `cognistration://` and `ui://` resource, all compatibility widget URIs, MIME type, HTML completeness, viewport, secret leakage, canonical iframe source, sandbox tokens, and host bridge credential boundaries. |
| Skills and prompts | Cursor validation, all five skill pages, SHA-256 digest agreement, prompt resolution, bounded prompt input, and invalid-name behavior. |
| Every public MCP tool | One safe fixture per public tool, output-schema validation, text/structured-content equality, no secret leakage, UI metadata binding, exact payment prices, delivery gating, explicit confirmation, machine-control playback preservation, and user-submission boundaries. |
| Safety | Medical and crisis-shaped intentions route to the health boundary; no tone, audio, diary data, or medical guidance is produced. Invalid and prompt-injection-shaped inputs stay bounded. |
| Protocol failures | Wrong method/name/protocol headers, invalid JSON, invalid JSON-RPC version, oversized body, malformed tool input, unsupported SSE-style negotiation, notifications, unknown methods, and unknown tools. |
| HTTP fallbacks | Capability manifest, OpenAPI paths and registry, agent instructions, public pages, REST intent/session/policy/account adapters, malformed signup/feedback boundaries, and unconfirmed checkout boundaries. |
| Commerce/UCP | Public UCP discovery, standard UCP MCP binding, payment-handler metadata, checkout challenge discovery, fixed `$0.50` and `$5.99` amounts, no credential fields, and safe no-confirmation checkout behavior. No charge is attempted. |
| Native browser | Optional Playwright check that opens the canonical homepage (`/`), verifies `document.modelContext`, confirms the published public tool names, mutates bounded visible controls, verifies the confirmation denial for audio, and opens the science guide without starting audio. |

The checked-in registries are the source of truth for names and schemas:

- `lib/agentic/mcp-contract.js`
- `lib/agentic/webmcp-contract.js`
- `lib/agentic/skill-capability.js`
- `lib/commerce/ucp-contract.mjs`

The public `/docs` page renders those same registries. A count mismatch in a
live report means the deployment is not serving the checked-in contract; it is
not a reason to hand-edit a number in documentation.

## Side-effect policy

The audit uses synthetic `.invalid` addresses and fixed, unique audit IDs. It
does not:

- send a valid signup payload or create an account;
- submit feedback or persist a rating;
- confirm a hosted checkout or request a payment credential;
- retry a 402 challenge with a payment authorization;
- start browser audio or leave a playing preview behind;
- call member tools without an authenticated member context;
- read private diary, Studio, Supabase, Stripe, or bearer-key data.

It does call read-only public tools, safe machine-control calculations, and
unconfirmed commerce tools. Those responses must stop at the published
confirmation or provider boundary. The report therefore records both the
absence of submitted side effects and the fact that each boundary was tested.

## Release gate

A submission-ready run should have no failed checks. A browser check may be
`skip` only when Playwright/Chromium is unavailable and the ordinary `/try`
cockpit has been manually verified. A failed live registry comparison, schema
check, protocol boundary, safety check, or commerce boundary is a release
blocker.

Run the local regression matrix alongside the live audit:

```bash
npm run test:agentic
npm run test:edge
npm run test:billing
npm run test:studio
npm run test:mcp:live
npm run audit:mcp
```

Do not treat a local green run as production proof. After the source is
deployed, rerun the audit against `https://cognistration.com`, inspect the JSON
report, and verify the canonical `/docs`, `/try`, `/api/capabilities`,
`/openapi.json`, `/agent-instructions.md`, and `/api/mcp` routes. A Vercel
deployment being Ready is not enough if the alias still serves an older
registry or widget resource.

## Reading the report

The JSON report includes the target, protocol/server version, pacing mode,
coverage counts, every check with severity and bounded evidence, failures, and
a redacted request log. Its summary distinguishes exercised control and
confirmation/payment boundaries from submitted side effects: control commands,
confirmation gates, and no-credential payment challenges are expected to be
tested, while credentials, payments, feedback, and audio remain false.
`structuredContent` is compared to the JSON text block for every successful tool
call because MCP Apps hosts may consume either form. No report field should
contain a credential, private key, provider secret, or raw user diary content.

For a failed run, fix the first contract/source mismatch, deploy it, and rerun
the full audit. Do not downgrade a failure to a skip merely to produce a green
report. The only intentionally unexecuted actions are real user-owned writes,
real payment authorization, and authenticated member operations.
