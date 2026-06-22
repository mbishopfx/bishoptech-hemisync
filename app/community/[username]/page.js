import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { feedPostSelect, profileSelect, savedToneSelect } from '@/lib/social/serializers';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FollowButton } from '@/components/social/follow-button';
import { ShareProfileButton } from '@/components/social/share-profile-button';
import { ArrowLeft, Globe, X, CheckCircle, ExternalLink } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const hasSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export function generateMetadata({ params }) {
  return buildPageMetadata({
    title: 'Community Profile | Cognistration',
    description: `Public community profile for ${params.username} on Cognistration.`,
    path: `/community/${params.username}`
  });
}

async function getProfileData(username) {
  if (!hasSupabaseConfig) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const supabaseServer = getSupabaseServerClient();
  const { data: sessionData } = await supabaseServer.auth.getUser();
  const currentUser = sessionData?.user || null;

  // Try to find by username first, fallback to id if it's a UUID
  let query = supabase.from('profiles').select(profileSelect()).eq('profile_visibility', 'public');
  if (username.length === 36 && username.includes('-')) {
    query = query.eq('id', username);
  } else {
    query = query.eq('username', username);
  }
  
  const { data: profile } = await query.single();
  
  if (!profile) return null;

  const [postsResult, tonesResult, followResult, followerCountResult, followingCountResult] = await Promise.all([
    supabase.from('feed_posts').select(feedPostSelect()).eq('user_id', profile.id).eq('visibility', 'public').order('created_at', { ascending: false }).limit(20),
    supabase.from('saved_tones').select(savedToneSelect()).eq('user_id', profile.id).eq('visibility', 'public').order('created_at', { ascending: false }).limit(20),
    currentUser && currentUser.id !== profile.id
      ? supabase.from('follows').select('id').eq('follower_id', currentUser.id).eq('following_id', profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', profile.id)
  ]);

  return {
    profile,
    posts: postsResult.data || [],
    tones: tonesResult.data || [],
    followerCount: followerCountResult.count || 0,
    followingCount: followingCountResult.count || 0,
    canFollow: Boolean(currentUser && currentUser.id !== profile.id),
    initialFollowing: Boolean(followResult.data)
  };
}

export default async function PublicProfilePage({ params }) {
  if (!hasSupabaseConfig) {
    return (
      <main className="landing-shell">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-10">
          <Card className="relative overflow-hidden border-none shadow-premium bg-[var(--card-bg)] p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-gold-strong)]">
              Community profile unavailable
            </p>
            <h1 className="mt-2 text-3xl font-display text-foreground">
              Public profile data is offline in this environment.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              The route stays live so search engines and visitors can reach it,
              but profile data requires the production Supabase environment.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const data = await getProfileData(params.username);
  
  if (!data) {
    notFound();
  }

  const { profile, posts, tones, canFollow, initialFollowing, followerCount, followingCount } = data;

  return (
    <main className="landing-shell">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-10">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button asChild variant="secondary">
            <Link href="/community">
              <ArrowLeft className="mr-2 size-4" /> Community Feed
            </Link>
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="relative overflow-hidden border-none shadow-premium bg-[var(--card-bg)] p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-24 border border-white/10 shadow-premium bg-[var(--bg-1)]">
                <AvatarImage src={profile.avatar_url || ''} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold flex items-center justify-center bg-cyan-950 text-cyan-300">
                  {(profile.display_name || 'M').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-display text-foreground flex items-center gap-2">
                  {profile.display_name || 'Member'}
                  {profile.subscription_tier && profile.subscription_tier !== 'none' && profile.subscription_tier !== 'free' && (
                    <CheckCircle className="size-5 text-[var(--accent-gold-strong)]" />
                  )}
                </h1>
                <span className="text-muted text-sm">@{profile.username || profile.id.split('-')[0]}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {canFollow && <FollowButton profileId={profile.id} initialFollowing={initialFollowing} />}
              <ShareProfileButton profilePath={`/community/${profile.username || profile.id}`} />
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 text-foreground/90 leading-relaxed max-w-2xl font-light italic">&quot;{profile.bio}&quot;</p>
          )}

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
            <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg-1)]/80 px-4 py-3 backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Followers</div>
              <div className="mt-1 text-xl font-display text-foreground">{followerCount.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg-1)]/80 px-4 py-3 backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Following</div>
              <div className="mt-1 text-xl font-display text-foreground">{followingCount.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg-1)]/80 px-4 py-3 backdrop-blur-sm sm:col-span-1 col-span-2">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Status</div>
              <div className="mt-1 text-sm font-medium text-[var(--accent-gold-strong)]">Open to community follows</div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-[var(--line-soft)]">
            <div className="flex gap-4">
              {profile.website_url && (
                <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-muted hover:text-foreground transition-colors">
                  <Globe className="size-5" />
                </a>
              )}
              {profile.x_url && (
                <a href={profile.x_url} target="_blank" rel="noreferrer" className="text-muted hover:text-foreground transition-colors">
                  <X className="size-5" />
                </a>
              )}
              {profile.instagram_url && (
                <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-muted hover:text-foreground transition-colors">
                  <ExternalLink className="size-5" />
                </a>
              )}
              {profile.youtube_url && (
                <a href={profile.youtube_url} target="_blank" rel="noreferrer" className="text-muted hover:text-foreground transition-colors">
                  <ExternalLink className="size-5" />
                </a>
              )}
            </div>
          </div>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Public Tones Library */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-display text-foreground">Tone Library</h2>
            {tones.length === 0 ? (
              <p className="text-muted text-sm">No public tones available.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {tones.map(tone => (
                  <Card key={tone.id} className="p-5 bg-[var(--bg-1)] shadow-premium">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <strong className="block text-foreground text-lg">{tone.name}</strong>
                        <span className="text-xs uppercase tracking-wider text-[var(--accent-gold-strong)] font-semibold mt-1 block">
                          {tone.target_state} State
                        </span>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-[var(--bg-0)] rounded-md text-muted border border-[var(--line-soft)]">
                        {tone.base_freq_hz} Hz
                      </span>
                    </div>
                    {tone.description && <p className="text-sm text-muted mt-2">{tone.description}</p>}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted font-medium">{Math.floor((tone.duration_sec || 0) / 60)} min</span>
                      {tone.mp3_url && (
                        <audio controls src={tone.mp3_url} className="h-8 w-40 opacity-80" preload="none" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Feed Posts */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-display text-foreground">Recent Activity</h2>
            {posts.length === 0 ? (
              <p className="text-muted text-sm">No recent activity.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map(post => (
                  <Card key={post.id} className="p-5 bg-[var(--card-bg)] shadow-premium">
                    <span className="text-xs text-muted block mb-3">{new Date(post.created_at).toLocaleDateString()}</span>
                    {post.body && <p className="text-sm text-foreground/90 leading-relaxed mb-4">{post.body}</p>}
                    {post.saved_tones && (
                      <div className="p-3 bg-[var(--bg-1)] rounded-lg text-sm border border-[var(--line-soft)]">
                        <strong className="block text-[var(--accent-gold-strong)] text-xs mb-1">ATTACHED TONE</strong>
                        {post.saved_tones.name}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
