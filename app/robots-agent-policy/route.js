const siteUrl = 'https://cognistration.com';

const body = `User-Agent: GPTBot
Allow: /

User-Agent: ChatGPT-User
Allow: /

User-Agent: OAI-SearchBot
Allow: /

User-Agent: ClaudeBot
Allow: /

User-Agent: PerplexityBot
Allow: /

User-Agent: Google-Extended
Allow: /

User-Agent: Applebot-Extended
Allow: /

User-Agent: ora-agent
Allow: /

User-Agent: DeepSeekBot
Allow: /

User-Agent: CCBot
Disallow: /

User-Agent: ByteSpider
Disallow: /

User-Agent: *
Allow: /
Allow: /try
Allow: /docs
Allow: /api/mcp
Allow: /api/capabilities
Allow: /openapi.json
Allow: /agent-instructions.md
Disallow: /api/
Disallow: /dashboard
Disallow: /generate
Disallow: /login
Disallow: /signup

# Content-Signal: search=yes, ai-train=no
Content-Signal: search=yes, ai-train=no
Agentmap: ${siteUrl}/.well-known/ard.json
schemamap: ${siteUrl}/.well-known/schemamap.xml
Host: ${siteUrl}
Sitemap: ${siteUrl}/sitemap.xml
`;

export const dynamic = 'force-static';

export function GET() {
  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
}
