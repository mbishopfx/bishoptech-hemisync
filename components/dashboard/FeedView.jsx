'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

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

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    setFeed(initialFeed);
  }, [initialFeed]);

  // Load user liked posts to show active states
  useEffect(() => {
    if (!profile?.id || feed.length === 0) return;

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

  return (
    <div className="space-y-8">
      {/* Feed Broadcast Console / Composer */}
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

      {/* Feed Timeline */}
      {feed.length === 0 ? (
        <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-xl p-16 text-center rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />
          
          {/* Animated radar circle */}
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
              <Card key={post.id} className="bg-zinc-900/40 border-white/5 backdrop-blur-3xl p-6 rounded-3xl hover:border-white/10 transition-all">
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
                        
                        {post.saved_tones.mp3_url || post.saved_tones.wav_url ? (
                          <button 
                            onClick={() => {
                              // Play audio logic (hooked to parent's active player if desired)
                              const audio = new Audio(post.saved_tones.mp3_url || post.saved_tones.wav_url);
                              audio.play().catch(e => console.log('Playback blocked or failed', e));
                            }}
                            className="size-10 rounded-full bg-white hover:scale-105 hover:bg-cyan-400 transition-all text-black flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined font-semibold">play_arrow</span>
                          </button>
                        ) : null}
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
  );
}
