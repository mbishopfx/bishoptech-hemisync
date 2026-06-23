import { blogPosts } from '@/lib/blog/posts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';

const staticRoutes = [
  '/',
  '/blog',
  '/community',
  '/pricing',
  '/tutorial',
  '/machine',
  '/privacy',
  '/terms',
  '/cookies',
  '/contact',
  '/health-warning',
  '/ai-disclosure',
  '/llms.txt'
];

export default function sitemap() {
  const now = new Date();
  const staticEntries = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${siteUrl}${post.path}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.6
  }));

  return [...staticEntries, ...blogEntries];
}
