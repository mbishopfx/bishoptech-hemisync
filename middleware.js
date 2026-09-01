import { NextResponse } from 'next/server';
import { applyCors } from '@/lib/http/cors';

const MARKDOWN_TWINS = new Map([
  ['/', '/index.md'],
  ['/about', '/about.md'],
  ['/pricing', '/pricing.md'],
  ['/docs', '/docs.md'],
  ['/packs', '/packs.md'],
  ['/machine', '/machine.md'],
  ['/try', '/try.md'],
  ['/tutorial', '/tutorial.md'],
  ['/contact', '/contact.md'],
  ['/privacy', '/privacy.md'],
  ['/terms', '/terms.md'],
  ['/cookies', '/cookies.md'],
  ['/health-warning', '/health-warning.md'],
  ['/ai-disclosure', '/ai-disclosure.md']
]);

const AI_AGENT_USER_AGENT = /GPTBot|ClaudeBot|ChatGPT-User|PerplexityBot|OAI-SearchBot|Google-Extended|Applebot-Extended|ora-agent|DeepSeekBot/i;
const KNOWN_MARKDOWN_PATHS = new Set([
  '/', '/about', '/pricing', '/packs', '/machine', '/try', '/docs', '/tutorial', '/contact', '/privacy', '/terms', '/cookies', '/health-warning', '/ai-disclosure',
  '/index.md', '/about.md', '/pricing.md', '/packs.md', '/machine.md', '/try.md', '/docs.md', '/tutorial.md', '/contact.md', '/privacy.md', '/terms.md', '/cookies.md', '/health-warning.md', '/ai-disclosure.md',
  '/login', '/signup', '/dashboard', '/generate', '/blog', '/community', '/services', '/api', '/openapi.json', '/llms.txt', '/agent-instructions.md', '/auth.md', '/connect', '/ask', '/a2a'
]);

function appendVary(response, ...values) {
  const current = new Set(
    String(response.headers.get('Vary') || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  );
  values.flatMap((value) => String(value).split(',')).map((value) => value.trim()).filter(Boolean).forEach((value) => current.add(value));
  response.headers.set('Vary', [...current].join(', '));
}

function discoveryLinkHeader(pathname) {
  const markdown = MARKDOWN_TWINS.get(pathname) || '/index.md';
  return [
    '<https://cognistration.com/sitemap.xml>; rel="sitemap"',
    `<https://cognistration.com${markdown}>; rel="alternate"; type="text/markdown"`,
    '<https://cognistration.com/.well-known/api-catalog>; rel="api-catalog"',
    '<https://cognistration.com/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
    '<https://cognistration.com/.well-known/ard.json>; rel="ard"'
  ].join(', ');
}

function addDiscoveryHeaders(request, response) {
  const { pathname } = request.nextUrl;
  if (isApiPath(pathname)) {
    response.headers.set('API-Supported-Versions', 'v1');
    response.headers.set('API-Version', pathname === '/api/v1' || pathname.startsWith('/api/v1/') ? 'v1' : 'unversioned-compatible');
    response.headers.set('RateLimit-Policy', '120;w=60');
    response.headers.set('RateLimit-Limit', '120');
    response.headers.set('RateLimit-Remaining', '119');
    response.headers.set('RateLimit-Reset', '60');
    if (response.status === 429) response.headers.set('Retry-After', '60');
  }

  if (!pathname.startsWith('/_next/') && !pathname.includes('.')) {
    response.headers.set('Link', discoveryLinkHeader(pathname));
    appendVary(response, 'Accept', 'Accept-Encoding', 'User-Agent');
  }

  return response;
}

function isApiPath(pathname) {
  return pathname === '/api' || pathname.startsWith('/api/');
}

function isKnownMarkdownPath(pathname) {
  return KNOWN_MARKDOWN_PATHS.has(pathname)
    || pathname.startsWith('/api/')
    || pathname.startsWith('/blog/')
    || pathname.startsWith('/community/')
    || pathname.startsWith('/tutorial/')
    || pathname.startsWith('/checkout/')
    || pathname.startsWith('/packs/')
    || pathname.startsWith('/ucp/')
    || pathname.startsWith('/skills/')
    || pathname.startsWith('/.well-known/');
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const acceptsMarkdown = String(request.headers.get('accept') || '').toLowerCase().includes('text/markdown');
  const botRequestsMarkdown = AI_AGENT_USER_AGENT.test(String(request.headers.get('user-agent') || ''));
  const markdownRequest = acceptsMarkdown || botRequestsMarkdown;

  if (pathname.startsWith('/_next/') || pathname === '/favicon.ico' || (pathname.match(/\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|css|js|map|md)$/i) && !(markdownRequest && pathname.endsWith('.md')))) {
    return NextResponse.next();
  }

  if (pathname === '/' && request.nextUrl.searchParams.get('mode') === 'agent') {
    const target = request.nextUrl.clone();
    target.pathname = '/agent-mode';
    target.search = '';
    return addDiscoveryHeaders(request, NextResponse.rewrite(target));
  }

  if (pathname === '/robots.txt') {
    const target = request.nextUrl.clone();
    target.pathname = '/robots-agent-policy';
    target.search = '';
    return NextResponse.rewrite(target);
  }

  const markdownTwin = MARKDOWN_TWINS.get(pathname);
  if (markdownTwin && (acceptsMarkdown || botRequestsMarkdown)) {
    const target = request.nextUrl.clone();
    target.pathname = markdownTwin;
    target.search = '';
    return addDiscoveryHeaders(request, NextResponse.rewrite(target));
  }

  if ((acceptsMarkdown || botRequestsMarkdown) && !isKnownMarkdownPath(pathname) && pathname !== '/404.md') {
    const target = request.nextUrl.clone();
    target.pathname = '/404.md';
    target.search = '';
    return addDiscoveryHeaders(request, NextResponse.rewrite(target));
  }

  if (pathname === '/dashboard' || pathname === '/generate' || pathname === '/login' || pathname === '/signup') {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  if (request.method === 'OPTIONS' && isApiPath(pathname)) {
    return addDiscoveryHeaders(request, applyCors(request, new NextResponse(null, { status: 204 })));
  }

  const response = NextResponse.next();
  if (isApiPath(pathname)) applyCors(request, response);
  return addDiscoveryHeaders(request, response);
}

export const config = {
  matcher: ['/:path*']
};
