import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { feedPostSelect } from '@/lib/social/serializers';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Play, ArrowLeft } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

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
