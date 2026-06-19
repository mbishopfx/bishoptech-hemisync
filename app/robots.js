const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/community', '/pricing', '/tutorial', '/machine', '/privacy', '/terms', '/cookies', '/contact', '/health-warning', '/ai-disclosure'],
        disallow: ['/api/', '/dashboard', '/generate', '/login', '/signup']
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
