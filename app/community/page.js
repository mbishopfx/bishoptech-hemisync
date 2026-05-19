import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { feedPostSelect } from '@/lib/social/serializers';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Play, ArrowLeft, Heart, MessageSquare, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getCommunityFeed() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('feed_posts')
    .select(feedPostSelect())
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(100);
  return data || [];
}

export default async function CommunityPage() {
  const feed = await getCommunityFeed();
  const creatorRollup = Array.from(
    feed.reduce((map, post) => {
      const profileId = post.profiles?.id;
      if (!profileId) return map;

      const current = map.get(profileId) || {
        profile: post.profiles,
        postCount: 0,
        toneCount: 0,
      };

      current.postCount += 1;
      current.toneCount += post.saved_tones ? 1 : 0;
      map.set(profileId, current);
      return map;
    }, new Map()).values(),
  );
  const creatorHighlights = creatorRollup.sort((a, b) => b.postCount - a.postCount).slice(0, 3);
  const toneStateRollup = Array.from(
    feed.reduce((map, post) => {
      const state = post.saved_tones?.target_state;
      if (!state) return map;

      map.set(state, (map.get(state) || 0) + 1);
      return map;
    }, new Map()).entries(),
  )
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const trendingPosts = [...feed]
    .sort((a, b) => (b.like_count + b.comment_count) - (a.like_count + a.comment_count))
    .slice(0, 3);

  const communityStats = [
    { label: 'Public posts', value: feed.length.toString() },
    { label: 'Active creators', value: creatorRollup.length.toString() },
    { label: 'Tone shares', value: feed.filter((post) => post.saved_tones).length.toString() },
  ];

  return (
    <main className="landing-shell">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label">Community</p>
            <h1 className="mt-2 text-4xl font-display font-normal text-foreground">Global Feed</h1>
            <p className="mt-2 text-muted">Public tones and updates shared by HemiSync members.</p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" /> Back Home
            </Link>
          </Button>
        </div>

        <Card className="p-6 bg-[var(--card-bg)] shadow-premium border-none">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-gold-strong)]">Community Pulse</p>
              <p className="mt-2 text-sm text-muted">A rolling snapshot of the latest public activity and creator momentum.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {communityStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-1)] px-4 py-3">
                  <p className="text-2xl font-display text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-0)] px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-gold-strong)]">Top tone states</p>
                  <p className="mt-1 text-sm text-muted">The most shared emotional targets across public tone posts.</p>
                </div>
                <span className="rounded-full border border-[var(--line-soft)] bg-[var(--bg-1)] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-muted">
                  {toneStateRollup.length} states
                </span>
              </div>

              {toneStateRollup.length === 0 ? (
                <p className="mt-4 text-sm text-muted">State trends will appear once members share public tones.</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {toneStateRollup.map((entry) => (
                    <div key={entry.state} className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-1)] px-4 py-3">
                      <p className="text-lg font-display text-foreground">{entry.state}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted">{entry.count} share{entry.count === 1 ? '' : 's'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-display text-foreground">Creator highlights</h2>
                <span className="text-xs uppercase tracking-[0.25em] text-muted">Latest 100 posts</span>
              </div>

              {creatorHighlights.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Creator highlights will appear once public posts start flowing in.</p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {creatorHighlights.map((creator, index) => (
                    <div key={creator.profile?.id || index} className="flex items-center justify-between rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-0)] px-4 py-3">
                      <div className="min-w-0">
                        <Link href={`/community/${creator.profile?.username || creator.profile?.id}`} className="block truncate font-medium text-foreground hover:underline">
                          {creator.profile?.display_name || 'Member'}
                        </Link>
                        <p className="truncate text-xs text-muted">@{creator.profile?.username || 'member'} • {creator.toneCount} tone share{creator.toneCount === 1 ? '' : 's'}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-lg font-display text-foreground">{creator.postCount}</p>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted">posts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[var(--card-bg)] shadow-premium border-none">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-gold-strong)] flex items-center gap-2">
                <TrendingUp className="size-3.5" /> Trending now
              </p>
              <p className="mt-2 text-sm text-muted">Most resonant posts in the last 100 public shares, ranked by likes and comments.</p>
            </div>
            <span className="rounded-full border border-[var(--line-soft)] bg-[var(--bg-1)] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-muted">
              {trendingPosts.length} posts
            </span>
          </div>

          {trendingPosts.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Trending posts will appear here once members start reacting to public shares.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {trendingPosts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-0)] px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/community/${post.profiles?.username || post.profiles?.id}`} className="truncate font-medium text-foreground hover:underline">
                        {post.profiles?.display_name || 'Member'}
                      </Link>
                      <p className="mt-1 text-xs text-muted line-clamp-2">
                        {post.body || 'Shared a tone update with the community.'}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2 text-[10px] uppercase tracking-[0.25em] text-muted">
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line-soft)] bg-[var(--bg-1)] px-2 py-1">
                        <Heart className="size-3 text-[var(--accent-gold-strong)]" /> {post.like_count}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line-soft)] bg-[var(--bg-1)] px-2 py-1">
                        <MessageSquare className="size-3 text-cyan-300" /> {post.comment_count}
                      </span>
                    </div>
                  </div>
                  {post.saved_tones?.mp3_url && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-cyan-100">
                      <Play className="size-3" /> Audio attached
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          {feed.length === 0 ? (
            <p className="text-muted">No public posts yet. Join the platform and be the first to share a tone!</p>
          ) : (
            feed.map((post) => (
              <Card key={post.id} className="p-6 bg-[var(--card-bg)] shadow-premium">
                <div className="flex gap-4">
                  <Link href={`/community/${post.profiles?.username || post.profiles?.id}`}>
                    <Avatar className="size-12 shadow-premium cursor-pointer transition-transform hover:scale-105">
                      <AvatarImage src={post.profiles?.avatar_url || ''} />
                      <AvatarFallback>{(post.profiles?.display_name || 'M').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <Link href={`/community/${post.profiles?.username || post.profiles?.id}`} className="hover:underline">
                        <strong className="text-foreground">{post.profiles?.display_name || 'Member'}</strong>
                      </Link>
                      <span className="text-xs text-muted">@{post.profiles?.username || 'member'} • {new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {post.body && <p className="mt-3 text-sm leading-relaxed text-foreground/90">{post.body}</p>}
                    
                    {post.saved_tones && (
                      <Card className="mt-4 p-4 bg-[var(--bg-1)] border-none shadow-premium flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-gold-strong)]">Attached Tone • {post.saved_tones.target_state}</span>
                          <strong className="block mt-1 text-foreground">{post.saved_tones.name}</strong>
                          <span className="text-xs text-muted block mt-1">{post.saved_tones.duration_sec ? Math.floor(post.saved_tones.duration_sec / 60) + ' min' : 'Unknown duration'} • {post.saved_tones.base_freq_hz} Hz</span>
                        </div>
                        {post.saved_tones.mp3_url && (
                          <audio controls src={post.saved_tones.mp3_url} className="h-8 w-48" preload="none" />
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
