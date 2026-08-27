# Cognistration MCP edge (optional)

This is an optional Cloudflare Workers edge for agent traffic. Vercel remains
the canonical host for the site, REST APIs, MCP implementation, checkout, and
App Store links. This worker does not host the site and does not change
Cognistration DNS.

It proxies only `/mcp` to the canonical Vercel endpoint and exposes a small
`/health` check. It carries MCP protocol headers through, adds CORS headers for
compatible agent hosts from an explicit origin allowlist, and intentionally stores no sessions, payment
credentials, or user content. It does not enable AP2 or agent-to-agent
payments; the live $0.50 machine-payment challenge remains on the canonical
endpoint. The worker is stateless by design: Durable Objects are not enabled
because the current MCP route has no edge-owned session state to coordinate.

The default allowlist is `cognistration.com`, `www.cognistration.com`,
`chatgpt.com`, `www.chatgpt.com`, and `chat.openai.com`. Add any deliberate
additional origins through the comma-separated `CORS_ALLOWED_ORIGINS` Worker
variable; arbitrary `Origin` reflection is not allowed.

## Validate and deploy

From the repository root:

```bash
npx --yes wrangler@latest deploy --config cloudflare/mcp-edge/wrangler.jsonc --dry-run
npx --yes wrangler@latest deploy --config cloudflare/mcp-edge/wrangler.jsonc
```

Run the edge unit checks from the repository root with `npm run test:edge`.

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
