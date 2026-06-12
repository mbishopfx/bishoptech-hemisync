'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';

export function FeedView({ profile, tones = [], initialFeed = [], onRefresh }) {
  const [feed, setFeed] = useState(initialFeed);
  const [body, setBody] = useState('');
  const [selectedToneId, setSelectedToneId] = useState('');
  const [composing, setComposing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userLikes, setUserLikes] = useState({}); // { [postId]: boolean }
  const [commentsMap, setCommentsMap] = useState({}); // { [postId]: comment_array }
  const [openComments, setOpenComments] = useState({}); // { [postId]: boolean }
  const [newCommentText, setNewCommentText] = useState({}); // { [postId]: string }
  const [loadingComments, setLoadingComments] = useState({}); // { [postId]: boolean }

  // Collective Waves & Serenity States
  const [feedTab, setFeedTab] = useState('resonance');
  const [publicTones, setPublicTones] = useState([]);
  const [loadingPublicTones, setLoadingPublicTones] = useState(false);
  const [serenityTones, setSerenityTones] = useState([]);
  const [playingToneId, setPlayingToneId] = useState(null);
  const [activeAudio, setActiveAudio] = useState(null);
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    try {
      setSupabase(getSupabaseBrowserClient());
    } catch (err) {
      console.warn('Supabase client unavailable in FeedView:', err?.message || err);
      setSupabase(null);
    }
  }, []);

  useEffect(() => {
    setFeed(initialFeed);
  }, [initialFeed]);

  // Load user liked posts to show active states
  useEffect(() => {
    if (!profile?.id || feed.length === 0) return;
    if (!supabase) return;

    async function loadLikes() {
      try {
        const postIds = feed.map(p => p.id);
        const { data, error } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', profile.id)
          .in('post_id', postIds);

        if (!error && data) {
          const likes = {};
          data.forEach(like => {
            likes[like.post_id] = true;
          });
          setUserLikes(likes);
        }
      } catch (err) {
        console.error('Failed to load likes:', err);
      }
    }
    loadLikes();
  }, [feed, profile?.id, supabase]);

  // Fetch Serenity catalog and Collective Waves
  useEffect(() => {
    if (!supabase) return;

    async function loadData() {
      try {
        setLoadingPublicTones(true);
        
        // 1. Fetch Serenity Seeded Catalog
        const { data: serenity, error: serenityErr } = await supabase
          .from('saved_tones')
          .select('*, profiles:profiles!saved_tones_user_id_fkey(id, username, display_name, avatar_url)')
          .eq('is_serenity', true)
          .order('created_at', { ascending: true });

        if (!serenityErr && serenity) {
          setSerenityTones(serenity);
        }

        // 2. Fetch Collective Waves (most recent 50 public generated custom tones)
        const { data: collective, error: collectiveErr } = await supabase
          .from('saved_tones')
          .select('*, profiles:profiles!saved_tones_user_id_fkey(id, username, display_name, avatar_url)')
          .eq('visibility', 'public')
          .eq('is_serenity', false)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!collectiveErr && collective) {
          setPublicTones(collective);
        }
      } catch (err) {
        console.error('Failed to load public tones:', err);
      } finally {
        setLoadingPublicTones(false);
      }
    }
    loadData();
  }, [supabase]);

  // Dynamic Audio player helper
  const handlePlayTone = (tone) => {
    const url = tone.mp3_url || tone.wav_url;
    if (!url) return;

    if (activeAudio) {
      activeAudio.pause();
      if (playingToneId === tone.id) {
        setPlayingToneId(null);
        setActiveAudio(null);
        return;
      }
    }

    const audio = new Audio(url);
    audio.play().catch(e => console.log('Playback blocked or failed', e));
    setPlayingToneId(tone.id);
    setActiveAudio(audio);

    audio.onended = () => {
      setPlayingToneId(null);
      setActiveAudio(null);
    };
  };

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      if (activeAudio) {
        activeAudio.pause();
      }
    };
  }, [activeAudio]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!body.trim() && !selectedToneId) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: body.trim(),
          toneId: selectedToneId || null,
          visibility: 'public'
        })
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        setBody('');
        setSelectedToneId('');
        setComposing(false);
        if (onRefresh) {
          await onRefresh();
        } else {
          setFeed([data.post, ...feed]);
        }
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (post) => {
    const isLiked = !!userLikes[post.id];
    
    // Optimistic UI update
    setUserLikes(prev => ({ ...prev, [post.id]: !isLiked }));
    setFeed(prev => prev.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          like_count: Math.max(0, p.like_count + (isLiked ? -1 : 1))
        };
      }
      return p;
    }));

    try {
      const response = await fetch(`/api/feed/posts/${post.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST'
      });
      if (!response.ok) {
        // Revert on failure
        setUserLikes(prev => ({ ...prev, [post.id]: isLiked }));
        setFeed(prev => prev.map(p => {
          if (p.id === post.id) {
            return {
              ...p,
              like_count: post.like_count
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleSaveToneToLibrary = async (tone) => {
    const isFreeTrial = profile?.subscription_tier === 'none' || profile?.subscription_tier === 'free';
    if (isFreeTrial) {
      await redirectToStripeCheckout();
      return;
    }

    try {
      const response = await fetch('/api/library/tones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${tone.name} (Saved)`,
          description: tone.description || `Saved from the NeuroSync Collective feed.`,
          target_state: tone.target_state,
          duration_sec: tone.duration_sec,
          base_freq_hz: tone.base_freq_hz,
          wav_url: tone.wav_url,
          mp3_url: tone.mp3_url || tone.wav_url,
          delta_path: tone.delta_path || [],
          frequency_plan: tone.frequency_plan || {},
          visibility: 'private'
        })
      });

      const errorData = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 403 && errorData?.code === 'LIBRARY_LIMIT_REACHED') {
          await redirectToStripeCheckout();
          return;
        }
        throw new Error(errorData.message || 'Clone request failed');
      }

      alert(`Successfully saved "${tone.name}" to your neural library archive!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to save tone. Make sure your library is not full.');
    }
  };

  const handleToggleComments = async (postId) => {
    const isOpen = !!openComments[postId];
    setOpenComments(prev => ({ ...prev, [postId]: !isOpen }));

    if (!isOpen && !commentsMap[postId]) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      try {
        const { data, error } = await supabase
          .from('post_comments')
          .select('*, profiles(id, username, display_name, avatar_url)')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setCommentsMap(prev => ({ ...prev, [postId]: data }));
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingComments(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const commentText = newCommentText[postId] || '';
    if (!commentText.trim()) return;

    // Reset input
    setNewCommentText(prev => ({ ...prev, [postId]: '' }));

    try {
      const response = await fetch(`/api/feed/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentText.trim() })
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        // Append comment locally
        setCommentsMap(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }));
        // Update feed comment count
        setFeed(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, comment_count: (p.comment_count || 0) + 1 };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    }
  };

  const selectedToneDetails = tones.find(t => t.id === selectedToneId);

  const activeToneDetails = tones.find(t => t.id === playingToneId);

  return (
    <div className="space-y-8 pb-12">
      {/* Serenity Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 animate-pulse text-xl">spa</span>
            <h3 className="text-xs font-semibold tracking-wider font-mono uppercase text-cyan-300">Serenity Catalog</h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono tracking-wider">Dynamic Database Tracks</span>
        </div>
        
        {serenityTones.length === 0 ? (
          <div className="py-6 text-center text-xs text-white/30 border border-white/5 rounded-2xl bg-zinc-950/20">
            Initializing serenity audio pathways...
          </div>
        ) : (
          <div className="flex flex-row flex-nowrap overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {serenityTones.map((tone) => {
              const isPlaying = playingToneId === tone.id;
              return (
                <div 
                  key={tone.id} 
                  className={`relative group bg-zinc-950/60 border rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[140px] w-64 shrink-0 overflow-hidden ${
                    isPlaying ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)] bg-cyan-950/20' : 'border-white/5 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-cyan-500/[0.03] blur-[20px] pointer-events-none group-hover:bg-cyan-500/[0.08] transition-all" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        isPlaying ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300' : 'bg-white/5 border-white/5 text-zinc-400'
                      }`}>
                        {tone.target_state || 'SERENITY'}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">{tone.duration_sec ? `${Math.round(tone.duration_sec)}s` : 'WAV'}</span>
                    </div>
                    
                    <h4 className="text-xs font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">{tone.name}</h4>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{tone.description || 'Premium relaxation frequency'}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <span className="text-[9px] font-mono text-cyan-400/70">{tone.base_freq_hz ? `${tone.base_freq_hz} Hz` : 'Ambient'}</span>
                    <button
                      onClick={() => handlePlayTone(tone)}
                      className={`size-8 rounded-full flex items-center justify-center transition-all ${
                        isPlaying ? 'bg-cyan-500 text-black scale-105 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-white/10 hover:bg-white text-white hover:text-black'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base leading-none font-semibold">
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-2xl border border-white/5 max-w-sm w-full sm:w-auto">
          <button
            onClick={() => setFeedTab('resonance')}
            className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              feedTab === 'resonance' 
                ? 'bg-zinc-800 text-white border border-white/10 shadow-lg font-bold' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">sensors</span>
            Resonance Updates
          </button>
          <button
            onClick={() => setFeedTab('collective')}
            className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              feedTab === 'collective' 
                ? 'bg-zinc-800 text-white border border-white/10 shadow-lg font-bold' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">waves</span>
            Collective Waves
          </button>
        </div>

        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
          {feedTab === 'resonance' ? 'Synchronized User Broadcasts' : 'Global Custom Soundwaves'}
        </span>
      </div>

      {/* Conditional Timeline Render */}
      {feedTab === 'resonance' ? (
        <div className="space-y-6">
          {/* Feed Broadcast Console / Composer */}
          {profile?.subscription_tier === 'none' || profile?.subscription_tier === 'free' ? (
            <Card className="bg-zinc-900/20 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl relative overflow-hidden text-center space-y-4">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.01] to-transparent pointer-events-none" />
              <span className="material-symbols-outlined text-cyan-400/40 text-3xl animate-pulse">lock</span>
              <h4 className="text-sm font-semibold text-white">Broadcast Protocol Restricted</h4>
              <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
                Free trial members can explore public frequencies, but cannot broadcast posts or attach public waves. Upgrade to a paid plan to activate global broadcasting.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => redirectToStripeCheckout()}
                  className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-[10px] tracking-wider uppercase px-5 py-2 transition-colors"
                >
                  Upgrade to Lifetime Access
                </button>
              </div>
            </Card>
          ) : (

            <Card className="bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/20 transition-all">
              <div className="absolute top-0 right-0 w-[400px] h-[100px] bg-cyan-500/5 blur-[50px] pointer-events-none" />
              
              {!composing ? (
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setComposing(true)}>
                  <Avatar className="size-10 border border-white/10">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.display_name?.[0] || 'M'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl px-5 py-3 text-sm text-white/40 font-light transition-all flex items-center justify-between">
                    <span>Broadcast a resonance update or share a tone...</span>
                    <span className="material-symbols-outlined text-cyan-400 text-lg">sensors</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="size-10 border border-white/10">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>{profile?.display_name?.[0] || 'M'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Share a reflection, insight, or broadcast your current state..."
                        className="w-full bg-black/20 border-white/10 focus:border-cyan-500/30 rounded-2xl p-4 text-sm text-white placeholder:text-white/30 outline-none resize-none focus:ring-0 min-h-[100px]"
                      />
                    </div>
                  </div>

                  {/* Attached Tone Preview */}
                  {selectedToneId && selectedToneDetails && (
                    <div className="ml-14 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-cyan-400 text-2xl animate-pulse">radio</span>
                        <div>
                          <p className="text-xs font-semibold text-white">{selectedToneDetails.name}</p>
                          <p className="text-[10px] text-cyan-300 font-mono uppercase tracking-widest">{selectedToneDetails.target_state || 'Alpha'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedToneId('')}
                        className="text-white/40 hover:text-white flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 ml-14 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mr-2">Attach Wave</label>
                      <select
                        value={selectedToneId}
                        onChange={(e) => setSelectedToneId(e.target.value)}
                        className="rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs text-white outline-none cursor-pointer hover:border-cyan-500/30 transition-all max-w-[200px]"
                      >
                        <option value="">-- No tone --</option>
                        {tones.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => {
                          setComposing(false);
                          setBody('');
                          setSelectedToneId('');
                        }}
                        className="rounded-full text-white/40 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submitting || (!body.trim() && !selectedToneId)}
                        className="rounded-full bg-cyan-500 text-black hover:bg-cyan-400 font-semibold px-6"
                      >
                        {submitting ? 'Broadcasting...' : 'Broadcast'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </Card>
          )}

          {feed.length === 0 ? (
            <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-xl p-16 text-center rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />
              
              <div className="mx-auto size-20 rounded-full border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-20" />
                <span className="material-symbols-outlined text-cyan-400 text-3xl">sensors</span>
              </div>

              <h3 className="text-xl font-light text-white">Collective Resonance is Quiet</h3>
              <p className="text-sm text-white/40 mt-2 max-w-md mx-auto leading-relaxed">
                No active frequencies broadcasting. Be the first to share your binaural creations or journal reflections with the collective database.
              </p>
              <Button 
                onClick={() => setComposing(true)}
                className="mt-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono tracking-widest text-xs uppercase"
              >
                Broadcast Wave
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {feed.map((post) => {
                const isLiked = !!userLikes[post.id];
                const showComments = !!openComments[post.id];
                const comments = commentsMap[post.id] || [];
                const isLoading = !!loadingComments[post.id];

                return (
                  <Card key={post.id} className="bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl hover:border-white/10 transition-all">
                    <div className="flex gap-4">
                      <Avatar className="size-10 border border-white/10">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>{post.profiles?.display_name?.[0] || 'M'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">{post.profiles?.display_name || 'Member'}</span>
                          <span className="text-[10px] font-mono text-white/30">@{post.profiles?.username || 'user'}</span>
                          <span className="text-[10px] text-white/20 font-mono ml-auto">
                            {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        
                        <p className="mt-2 text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>
                        
                        {post.saved_tones && (
                          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="size-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                <span className="material-symbols-outlined text-2xl">radio</span>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-white">{post.saved_tones.name}</p>
                                <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{post.saved_tones.target_state}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {post.saved_tones.user_id !== profile?.id && (
                                <button
                                  onClick={() => handleSaveToneToLibrary(post.saved_tones)}
                                  className="size-10 rounded-full bg-white/5 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-all"
                                  title="Save to Library"
                                >
                                  <span className="material-symbols-outlined font-semibold">library_add</span>
                                </button>
                              )}
                              {post.saved_tones.mp3_url || post.saved_tones.wav_url ? (
                                <button 
                                  onClick={() => handlePlayTone(post.saved_tones)}
                                  className={`size-10 rounded-full flex items-center justify-center transition-all ${
                                    playingToneId === post.saved_tones.id
                                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                      : 'bg-white hover:bg-cyan-400 text-black hover:scale-105'
                                  }`}
                                >
                                  <span className="material-symbols-outlined font-semibold">
                                    {playingToneId === post.saved_tones.id ? 'pause' : 'play_arrow'}
                                  </span>
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )}

                        {/* Interactions Toolbar */}
                        <div className="mt-4 flex gap-6 text-white/20 border-t border-white/5 pt-3">
                          <button 
                            onClick={() => handleToggleLike(post)}
                            className={`flex items-center gap-2 text-xs hover:text-white transition-colors ${isLiked ? 'text-red-400 hover:text-red-300' : ''}`}
                          >
                            <span className={`material-symbols-outlined text-lg leading-none ${isLiked ? 'fill-current' : ''}`}>
                              favorite
                            </span> 
                            <span className="font-mono">{post.like_count || 0}</span>
                          </button>

                          <button 
                            onClick={() => handleToggleComments(post.id)}
                            className={`flex items-center gap-2 text-xs hover:text-white transition-colors ${showComments ? 'text-cyan-400' : ''}`}
                          >
                            <span className="material-symbols-outlined text-lg leading-none">
                              chat_bubble
                            </span> 
                            <span className="font-mono">{post.comment_count || 0}</span>
                          </button>
                        </div>

                        {/* Comments Drawer Expansion */}
                        {showComments && (
                          <div className="mt-6 border-t border-white/5 pt-4 space-y-4">
                            {isLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <span className="material-symbols-outlined animate-spin text-cyan-500 text-lg">sync</span>
                              </div>
                            ) : (
                              <>
                                {comments.length > 0 && (
                                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                    {comments.map((comment) => (
                                      <div key={comment.id} className="flex gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                                        <Avatar className="size-8 border border-white/10">
                                          <AvatarImage src={comment.profiles?.avatar_url} />
                                          <AvatarFallback>{comment.profiles?.display_name?.[0] || 'M'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-xs text-white">{comment.profiles?.display_name || 'Member'}</span>
                                            <span className="text-[9px] font-mono text-white/30">@{comment.profiles?.username || 'user'}</span>
                                          </div>
                                          <p className="mt-1 text-white/70 text-xs leading-relaxed">{comment.body}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Comment Input */}
                                <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex items-center gap-3">
                                  <Avatar className="size-8 border border-white/10">
                                    <AvatarImage src={profile?.avatar_url} />
                                    <AvatarFallback>{profile?.display_name?.[0] || 'M'}</AvatarFallback>
                                  </Avatar>
                                  <input
                                    type="text"
                                    value={newCommentText[post.id] || ''}
                                    onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-black/40 border border-white/10 focus:border-cyan-500/30 rounded-full px-4 py-2 text-xs text-white placeholder:text-white/20 outline-none transition-all"
                                  />
                                  <button 
                                    type="submit" 
                                    disabled={!(newCommentText[post.id] || '').trim()}
                                    className="size-8 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/5 disabled:text-white/20 text-black flex items-center justify-center transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-sm font-semibold">arrow_upward</span>
                                  </button>
                                </form>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Collective Waves Grid */
        <div className="space-y-6">
          {loadingPublicTones ? (
            <div className="flex items-center justify-center py-20 bg-zinc-950/20 border border-white/5 rounded-3xl">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-cyan-500 text-3xl">sync</span>
                <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Connecting to global resonance database...</span>
              </div>
            </div>
          ) : publicTones.length === 0 ? (
            <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-xl p-16 text-center rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />
              <span className="material-symbols-outlined text-cyan-400/40 text-4xl mb-4 animate-pulse">waves</span>
              <h3 className="text-xl font-light text-white">No Public Custom Waves</h3>
              <p className="text-sm text-white/40 mt-2 max-w-md mx-auto leading-relaxed">
                Generate custom delta or theta soundscapes in the Workshop, toggle visibility to Public, and showcase them on this collective billboard!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publicTones.map((tone) => {
                const isPlaying = playingToneId === tone.id;
                return (
                  <Card 
                    key={tone.id} 
                    className={`bg-zinc-900/40 border backdrop-blur-3xl p-6 rounded-3xl transition-all duration-300 hover:border-cyan-500/20 relative overflow-hidden ${
                      isPlaying ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-cyan-950/5' : 'border-white/5'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-[100px] h-[50px] bg-cyan-500/[0.01] blur-[30px] pointer-events-none" />
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-white/10">
                          <AvatarImage src={tone.profiles?.avatar_url} />
                          <AvatarFallback>{tone.profiles?.display_name?.[0] || 'M'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-white">{tone.profiles?.display_name || 'Anonymous'}</p>
                          <p className="text-[10px] font-mono text-zinc-500">@{tone.profiles?.username || 'member'}</p>
                        </div>
                      </div>
                      
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(tone.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="size-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0 border border-cyan-500/20">
                          <span className="material-symbols-outlined text-2xl">radio</span>
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-white truncate">{tone.name}</h4>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{tone.description || 'Custom generated audio waveform'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-cyan-300 font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/30 border border-cyan-500/20">{tone.target_state || 'Alpha'}</span>
                            {tone.base_freq_hz && (
                              <>
                                <span className="text-zinc-700">•</span>
                                <span className="text-[9px] text-zinc-500 font-mono">{tone.base_freq_hz} Hz</span>
                              </>
                            )}
                            {tone.duration_sec && (
                              <>
                                <span className="text-zinc-700">•</span>
                                <span className="text-[9px] text-zinc-500 font-mono">{Math.round(tone.duration_sec)}s</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {tone.user_id !== profile?.id && (
                          <button
                            onClick={() => handleSaveToneToLibrary(tone)}
                            className="size-10 rounded-full bg-white/5 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-all"
                            title="Save to Library"
                          >
                            <span className="material-symbols-outlined font-semibold">library_add</span>
                          </button>
                        )}
                        <button
                          onClick={() => handlePlayTone(tone)}
                          className={`size-10 rounded-full flex items-center justify-center transition-all ${
                            isPlaying 
                              ? 'bg-cyan-500 text-black scale-105 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                              : 'bg-white hover:bg-cyan-400 text-black hover:scale-105'
                          }`}
                        >
                          <span className="material-symbols-outlined font-semibold">
                            {isPlaying ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
