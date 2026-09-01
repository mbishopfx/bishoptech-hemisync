const siteUrl = 'https://cognistration.com';

// The generated robots response carries the same discovery intent as these
// optional directives for crawlers that understand them:
// Agentmap: https://cognistration.com/.well-known/ard.json
// schemamap: https://cognistration.com/.well-known/schemamap.xml

const aiCrawlerRules = [
  { userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'ora-agent', 'DeepSeekBot'], allow: ['/'] },
  { userAgent: ['CCBot', 'ByteSpider'], disallow: ['/'] },
  { userAgent: '*', allow: ['/', '/try', '/docs', '/api/mcp', '/api/mcp/server-card', '/api/capabilities', '/.well-known/mcp/server-card.json', '/.well-known/mcp.json', '/mcp.json', '/openapi.json', '/agent-instructions.md'], disallow: ['/api/', '/dashboard', '/generate', '/login', '/signup'] }
];

export default function robots() {
  return {
    rules: aiCrawlerRules,
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
