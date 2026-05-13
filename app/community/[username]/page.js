import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { feedPostSelect, profileSelect, savedToneSelect } from '@/lib/social/serializers';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Instagram, X, Youtube, CheckCircle } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

async function getProfileData(username) {
  const supabase = getSupabaseAdmin();
  
  // Try to find by username first, fallback to id if it's a UUID
  let query = supabase.from('profiles').select(profileSelect()).eq('profile_visibility', 'public');
  if (username.length === 36 && username.includes('-')) {
    query = query.eq('id', username);
  } else {
    query = query.eq('username', username);
  }
  
  const { data: profile } = await query.single();
  
  if (!profile) return null;

  const [{ data: posts }, { data: tones }] = await Promise.all([
    supabase.from('feed_posts').select(feedPostSelect()).eq('user_id', profile.id).eq('visibility', 'public').order('created_at', { ascending: false }).limit(20),
    supabase.from('saved_tones').select(savedToneSelect()).eq('user_id', profile.id).eq('visibility', 'public').order('created_at', { ascending: false }).limit(20)
  ]);

  return { profile, posts: posts || [], tones: tones || [] };
}

export default async function PublicProfilePage({ params }) {
  const data = await getProfileData(params.username);
  
  if (!data) {
    notFound();
  }

  const { profile, posts, tones } = data;

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
        <Card className="relative overflow-hidden border-none shadow-premium bg-[var(--card-bg)]">
          {profile.cover_url ? (
            <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.cover_url})` }} />
          ) : (
            <div className="h-48 w-full bg-gradient-to-r from-[var(--bg-1)] to-[var(--bg-2)] opacity-50" />
          )}
          
          <div className="px-8 pb-8 pt-0 relative">
            <div className="flex justify-between items-end -mt-12 mb-4">
              <Avatar className="size-24 border-4 border-[var(--bg-0)] shadow-premium bg-[var(--bg-1)]">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-2xl">{(profile.display_name || 'M').slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-display text-foreground flex items-center gap-2">
                {profile.display_name || 'Member'}
                {profile.plan === 'premium' && <CheckCircle className="size-5 text-[var(--accent-gold-strong)]" />}
              </h1>
              <span className="text-muted">@{profile.username || profile.id.split('-')[0]}</span>
            </div>

            {profile.bio && (
              <p className="mt-4 text-foreground/90 leading-relaxed max-w-2xl">{profile.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
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
                  <Instagram className="size-5" />
                </a>
              )}
              {profile.youtube_url && (
                <a href={profile.youtube_url} target="_blank" rel="noreferrer" className="text-muted hover:text-foreground transition-colors">
                  <Youtube className="size-5" />
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
