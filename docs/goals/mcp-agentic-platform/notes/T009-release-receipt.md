# T009: Canonical Release Receipt

Task: `T009`
Kind: `worker`
Status: `done`

## Release

- Scoped product commit: `9e0d26b` (`Add agentic session score WebMCP flow`).
- Public documentation sync commit: `6553adf` (`Sync agentic registry documentation`).
- Remote branch push: `origin/cognistration/youtube-clips-source-watermark` succeeded without staging unrelated dirty files.
- Vercel preview deployment: `dpl_6fp5ovHtfJz396mF1xSRZJriQRxp`, URL `https://bishoptech-cognistration-78kvz02jg-bishoptech.vercel.app`, status `Ready`.
- Promoted production deployment: `dpl_26E8zcfdcYZzJdx3WAWaDt2kQzRi`, URL `https://bishoptech-cognistration-1clpph9vo-bishoptech.vercel.app`, status `Ready`, aliases include `https://cognistration.com` and `https://bishoptech-cognistration.app`.
- Latest promoted production deployment after documentation sync: `dpl_A62UQucuimgExs8PaGL8LPHzPWUJ`, URL `https://bishoptech-cognistration-j584z1j32-bishoptech.vercel.app`, status `Ready`, aliases include `https://cognistration.com` and `https://bishoptech-cognistration.app`.

## Canonical Proof

- `npm run test:mcp:live` — pass against the latest `https://cognistration.com/api/mcp`: 38 tools, five skills, existing widgets, machine controls, and fixed 50-cent/599-cent payment discovery all verified without payment or audio.
- `npm run audit:mcp -- --pace-ms 5 --timeout 20000` — pass against the latest canonical deployment: 127 checks, 126 pass, one documented Playwright browser skip; no server writes, credentials, payments, feedback, or audio.
- Canonical `/api/capabilities` — 38 MCP tools, 28 public WebMCP tools, 11 member WebMCP tools, and the session-score REST fallback.
- Canonical `/openapi.json` — OpenAPI 3.1, 38-tool registry, `/api/agent/session-score`, and `SessionScore` schema present.
- Canonical REST `POST /api/agent/session-score` — synthesis score duration `601`, three stages, exact total `601`, `persisted: false`, `rendered: false`.
- Canonical MCP `tools/call compose_session_score` — focus score duration `601`, three stages, exact total `601`, `persisted: false`, `rendered: false`, `engine: browser-binaural-sine`.
- Canonical MCP safety fixture — medical-shaped intention returns `safety_redirect` to `/health-warning`, with audio and record boundaries false and no intention echo.
- Canonical `/try` — current 28/38 counts and Agentic Session Score visible in the rendered HTML.
- Canonical `agent-browser` compatibility proof with injected `document.modelContext` — all 28 tools registered; compose, select, refine to `222 Hz` and `10→14 Hz`, undo, and unconfirmed preview denial (`CONFIRMATION_REQUIRED`) passed; visible timeline present and no page errors.

## Release Caveat

The repository's optional Playwright browser audit remains a documented skip because the local Playwright module is unavailable. The deployed page was independently exercised through `agent-browser` with the same WebMCP registration contract and no audio start. Native WebMCP support remains host/flag dependent; this does not block the canonical HTTP, MCP, REST, or rendered-page proof.
