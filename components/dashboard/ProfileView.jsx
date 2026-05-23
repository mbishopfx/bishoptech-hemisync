'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

export function ProfileView({ profile, onUpdateProfile }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [coverUrl, setCoverUrl] = useState(profile?.cover_url || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || '');
  const [xUrl, setXUrl] = useState(profile?.x_url || '');
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagram_url || '');
  const [youtubeUrl, setYoutubeUrl] = useState(profile?.youtube_url || '');
  const [tiktokUrl, setTiktokUrl] = useState(profile?.tiktok_url || '');

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const supabase = getSupabaseBrowserClient();

  const handleUsernameChange = (e) => {
    // Sanitizing username to match DB standards (lowercase, allowed special chars)
    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 32);
    setUsername(cleaned);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    if (type === 'avatar') setUploadingAvatar(true);
    if (type === 'cover') setUploadingCover(true);
    setError('');
    setMessage('');

    try {
      // Must start with profile.id to comply with tone-images bucket RLS policies
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${type}-${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('tone-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tone-images')
        .getPublicUrl(data.path);

      if (type === 'avatar') {
        setAvatarUrl(publicUrl);
        // Instantly patch avatar_url
        await saveProfilePatch({ avatar_url: publicUrl });
        setMessage('Avatar updated successfully.');
      } else {
        setCoverUrl(publicUrl);
        // Instantly patch cover_url
        await saveProfilePatch({ cover_url: publicUrl });
        setMessage('Cover photo updated successfully.');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setError(`Failed to upload ${type}: ${err.message || err.error_description}`);
    } finally {
      setUploadingAvatar(false);
      setUploadingCover(false);
    }
  };

  const saveProfilePatch = async (patch) => {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data?.error || 'Database sync failure');
    }
    if (onUpdateProfile) {
      onUpdateProfile(data.profile);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const patch = {
        display_name: displayName.trim(),
        username: username.trim(),
        full_name: fullName.trim(),
        bio: bio.trim(),
        website_url: websiteUrl.trim(),
        x_url: xUrl.trim(),
        instagram_url: instagramUrl.trim(),
        youtube_url: youtubeUrl.trim(),
        tiktok_url: tiktokUrl.trim()
      };

      await saveProfilePatch(patch);
      setMessage('Profile synthesized successfully.');
    } catch (err) {
      console.error('Profile save error:', err);
      setError(err.message || 'Failed to save profile settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Bento View - Cyber Mockup Card */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden relative group">
          {/* Cover Image Area */}
          <div className="h-44 w-full bg-zinc-950 relative overflow-hidden">
            {coverUrl ? (
              <img src={coverUrl} alt="Profile Cover" className="w-full h-full object-cover opacity-60" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 cyber-grid opacity-30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
            
            {/* Upload Cover Trigger */}
            <label className="absolute right-4 bottom-4 size-10 rounded-full bg-black/60 hover:bg-cyan-500/80 hover:text-black border border-white/10 hover:scale-105 flex items-center justify-center cursor-pointer transition-all">
              {uploadingCover ? (
                <span className="material-symbols-outlined text-base animate-spin">sync</span>
              ) : (
                <span className="material-symbols-outlined text-base">photo_camera</span>
              )}
              <input type="file" onChange={(e) => handleFileUpload(e, 'cover')} accept="image/*" className="hidden" disabled={uploadingCover} />
            </label>
          </div>

          {/* User Meta Panel */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-6">
              <div className="relative size-24 sm:size-32 rounded-3xl border-4 border-black bg-zinc-900 overflow-hidden group/avatar">
                <Avatar className="size-full rounded-2xl">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-cyan-950 text-cyan-300 text-3xl font-black">
                    {displayName?.[0] || 'M'}
                  </AvatarFallback>
                </Avatar>

                {/* Upload Avatar Trigger */}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  {uploadingAvatar ? (
                    <span className="material-symbols-outlined text-white animate-spin text-xl">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                  )}
                  <input type="file" onChange={(e) => handleFileUpload(e, 'avatar')} accept="image/*" className="hidden" disabled={uploadingAvatar} />
                </label>
              </div>

              <div className="flex-1 min-w-0 sm:pt-4">
                <h3 className="text-2xl font-bold truncate text-white leading-tight">{displayName || 'Anonymous Member'}</h3>
                <p className="text-xs font-mono text-cyan-400 mt-1 uppercase tracking-widest">@{username || 'member'}</p>
              </div>
            </div>

            {/* Profile Bio */}
            {bio ? (
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Biography</p>
                <p className="text-sm text-white/80 leading-relaxed font-light">{bio}</p>
              </div>
            ) : (
              <p className="text-sm text-white/30 font-light italic">No neural bio synthesized yet. Outline your journey in the forms below...</p>
            )}

            {/* Public Links Badges */}
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/5">
              {websiteUrl && (
                <a href={websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1 text-xs text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all">
                  <span className="material-symbols-outlined text-sm">language</span>
                  Website
                </a>
              )}
              {xUrl && (
                <a href={xUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white/70 hover:bg-white hover:text-black transition-all">
                  <span className="material-symbols-outlined text-sm">alternate_email</span>
                  X / Twitter
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1 text-xs text-purple-300 hover:bg-purple-500 hover:text-black transition-all">
                  <span className="material-symbols-outlined text-sm">photo_library</span>
                  Instagram
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border-red-500/20 bg-red-500/5 px-4 py-1 text-xs text-red-300 hover:bg-red-500 hover:text-black transition-all">
                  <span className="material-symbols-outlined text-sm">video_library</span>
                  YouTube
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border-pink-500/20 bg-pink-500/5 px-4 py-1 text-xs text-pink-300 hover:bg-pink-500 hover:text-black transition-all">
                  <span className="material-symbols-outlined text-sm">music_note</span>
                  TikTok
                </a>
              )}
            </div>
          </div>
        </Card>

        {/* Neural Stats Bento Card */}
        <Card className="lg:col-span-4 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[80px] bg-cyan-500/[0.02] blur-[30px] pointer-events-none" />
          
          <div className="space-y-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Sync Status</p>
            <h4 className="text-lg font-semibold text-white">Neural Synthesizer Core</h4>
            
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/40">Membership Plan</span>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-400 uppercase tracking-wider">{profile?.plan || 'Free'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/40">Total Sessions Created</span>
                <span className="font-mono text-white/80">{profile?.session_count || 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/40">Library Generations Used</span>
                <span className="font-mono text-white/80">{profile?.free_saved_generations_used || 0} / {profile?.free_saved_generations_limit || 1}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 mt-6 text-center">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Sync operational v1.0</span>
          </div>
        </Card>
      </div>

      {/* Profile Settings Editor Form */}
      <Card className="bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/20 transition-all">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Settings console</p>
            <h3 className="text-2xl font-light text-white mt-1">Profile Customizer</h3>
          </div>
          <span className="material-symbols-outlined text-cyan-500 text-2xl">tune</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Display Name</span>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Astral Architect" className="bg-black/20 border-white/10" required />
            </label>
            <label className="block space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Username (Unique handle)</span>
              <Input value={username} onChange={handleUsernameChange} placeholder="e.g. astral_arch" className="bg-black/20 border-white/10" required />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Full Name</span>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Matthew Bishop" className="bg-black/20 border-white/10" />
            </label>
            <label className="block space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Personal Website URL</span>
              <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://myspace.dev" className="bg-black/20 border-white/10" />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Biography</span>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell the collective consciousness about your biohacking, meditation patterns, or binaural targets..." className="bg-black/20 border-white/10" />
          </label>

          {/* Social Links Sub-Section */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Social Link Matrix</p>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">X / Twitter Handle URL</span>
                <Input value={xUrl} onChange={(e) => setXUrl(e.target.value)} placeholder="https://x.com/username" className="bg-black/20 border-white/10 text-xs" />
              </label>
              <label className="block space-y-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">Instagram Profile URL</span>
                <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/username" className="bg-black/20 border-white/10 text-xs" />
              </label>
              <label className="block space-y-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">YouTube Channel URL</span>
                <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/@channel" className="bg-black/20 border-white/10 text-xs" />
              </label>
              <label className="block space-y-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">TikTok Profile URL</span>
                <Input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@username" className="bg-black/20 border-white/10 text-xs" />
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-8 py-3 transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Synthesizing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">dns</span>
                  Save Profile Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
