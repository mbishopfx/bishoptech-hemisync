const siteUrl = 'https://cognistration.com';

const publicRoutes = [
  '/',
  '/blog',
  '/community',
  '/pricing',
  '/tutorial',
  '/tutorial/meditation-self-exploration',
  '/tutorial/dreamwork-lucid-dreaming',
  '/tutorial/astral-projection-out-of-body-experiences',
  '/tutorial/remote-viewing-stargate-documents',
  '/machine',
  '/privacy',
  '/terms',
  '/cookies',
  '/contact',
  '/health-warning',
  '/ai-disclosure',
  '/llms.txt',
];

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: publicRoutes,
        disallow: ['/api/', '/dashboard', '/generate', '/login', '/signup'],
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
