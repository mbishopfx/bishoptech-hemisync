# Cognistration MCP edge (optional)

This is an optional Cloudflare Workers edge for agent traffic. Vercel remains
the canonical host for the site, REST APIs, MCP implementation, checkout, and
App Store links. This worker does not host the site and does not change
Cognistration DNS.

It proxies only `/mcp` to the canonical Vercel endpoint and exposes a small
`/health` check. It carries MCP protocol headers through, adds CORS headers for
compatible agent hosts, and intentionally stores no sessions, payment
credentials, or user content. It does not enable AP2 or agent-to-agent
payments; those remain provider-gated on the canonical endpoint.

## Validate and deploy

From the repository root:

```bash
npx --yes wrangler@latest deploy --config cloudflare/mcp-edge/wrangler.jsonc --dry-run
npx --yes wrangler@latest deploy --config cloudflare/mcp-edge/wrangler.jsonc
```

The deploy command returns a `workers.dev` URL. Verify it before sharing it
with an agent:

```bash
curl -i https://<worker-subdomain>.workers.dev/health
curl -sS -X POST https://<worker-subdomain>.workers.dev/mcp \
  -H 'content-type: application/json' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: tools/list' \
  --data '{"jsonrpc":"2.0","id":"edge-check","method":"tools/list","params":{}}'
```

Keep `https://cognistration.com/api/mcp` as the primary submission URL unless
an agent host specifically benefits from the edge URL. A custom Cloudflare
domain or DNS route is intentionally out of scope for this integration.
