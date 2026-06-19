const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';

const staticRoutes = [
  '/',
  '/community',
  '/pricing',
  '/tutorial',
  '/machine',
  '/privacy',
  '/terms',
  '/cookies',
  '/contact',
  '/health-warning',
  '/ai-disclosure'
];

export default function sitemap() {
  const now = new Date();

  return staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7
  }));
}
