const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/community', '/pricing', '/tutorial', '/machine', '/privacy', '/terms', '/cookies', '/contact', '/health-warning', '/ai-disclosure', '/llms.txt'],
        disallow: ['/api/', '/dashboard', '/generate', '/login', '/signup']
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
