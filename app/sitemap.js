import { blogPosts } from '@/lib/blog/posts';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';
const hasSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

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

export default async function sitemap() {
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

  const profileEntries = [];

  if (hasSupabaseConfig) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('profile_visibility', 'public')
          .limit(1000);

        for (const profile of profiles || []) {
          const profilePath = profile.username
            ? `/community/${profile.username}`
            : `/community/${profile.id}`;

          profileEntries.push({
            url: `${siteUrl}${profilePath}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.6
          });
        }
      } catch (error) {
        console.warn('Failed to load public community profiles for sitemap:', error);
      }
    }
  }

  return [...staticEntries, ...profileEntries, ...blogEntries];
}
