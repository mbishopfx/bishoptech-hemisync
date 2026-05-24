'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

export function SettingsView({ profile, onUpdateProfile }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || '');
  const [xUrl, setXUrl] = useState(profile?.x_url || '');
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagram_url || '');
  const [youtubeUrl, setYoutubeUrl] = useState(profile?.youtube_url || '');
  const [tiktokUrl, setTiktokUrl] = useState(profile?.tiktok_url || '');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Toggles for active/visible social entry fields
  const [showWebsite, setShowWebsite] = useState(!!profile?.website_url);
  const [showX, setShowX] = useState(!!profile?.x_url);
  const [showInstagram, setShowInstagram] = useState(!!profile?.instagram_url);
  const [showYoutube, setShowYoutube] = useState(!!profile?.youtube_url);
  const [showTiktok, setShowTiktok] = useState(!!profile?.tiktok_url);

  // Privacy states
  const [visibility, setVisibility] = useState(profile?.profile_visibility || 'public');

  // Sync states if updated profile prop has values
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setWebsiteUrl(profile.website_url || '');
      setXUrl(profile.x_url || '');
      setInstagramUrl(profile.instagram_url || '');
      setYoutubeUrl(profile.youtube_url || '');
      setTiktokUrl(profile.tiktok_url || '');
      setVisibility(profile.profile_visibility || 'public');

      if (profile.website_url) setShowWebsite(true);
      if (profile.x_url) setShowX(true);
      if (profile.instagram_url) setShowInstagram(true);
      if (profile.youtube_url) setShowYoutube(true);
      if (profile.tiktok_url) setShowTiktok(true);
    }
  }, [profile]);

  // Image Cropper States
  const [showCropper, setShowCropper] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [cropFileExt, setCropFileExt] = useState('png');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offsetStart, setOffsetStart] = useState({ x: 0, y: 0 });
  const [savingCrop, setSavingCrop] = useState(false);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const supabase = getSupabaseBrowserClient();

  // Draw Canvas whenever image, zoom, or offset changes
  useEffect(() => {
    if (showCropper && imgRef.current) {
      drawCanvas();
    }
  }, [showCropper, zoom, offset]);

  const drawCanvas = () => {
    if (!canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cover calculations to center image initially
    const scaleWidth = canvas.width / img.width;
    const scaleHeight = canvas.height / img.height;
    const minScale = Math.max(scaleWidth, scaleHeight);

    const baseScale = minScale * zoom;
    const sw = img.width * baseScale;
    const sh = img.height * baseScale;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.drawImage(img, cx - sw / 2 + offset.x, cy - sh / 2 + offset.y, sw, sh);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    setDragStart({ x: clientX, y: clientY });
    setOffsetStart({ ...offset });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    setOffset({ x: offsetStart.x + dx, y: offsetStart.y + dy });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        imgRef.current = img;
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setCropFile(file);
        setCropFileExt(file.name.split('.').pop() || 'png');
        setShowCropper(true);
        // Delay drawing slightly so React DOM has time to mount the canvas
        setTimeout(drawCanvas, 100);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCrop = async () => {
    if (!canvasRef.current || !profile?.id) return;
    setSavingCrop(true);
    setError('');
    setMessage('');

    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to generate image block');

        const fileName = `${profile.id}/avatar-${Date.now()}.${cropFileExt}`;

        const { data, error: uploadError } = await supabase.storage
          .from('tone-images')
          .upload(fileName, blob, {
            contentType: `image/${cropFileExt}`,
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('tone-images')
          .getPublicUrl(data.path);

        setAvatarUrl(publicUrl);
        await saveProfilePatch({ avatar_url: publicUrl });
        setMessage('Avatar updated successfully.');
        setShowCropper(false);
      }, `image/${cropFileExt}`);
    } catch (err) {
      console.error('Avatar upload crop error:', err);
      setError(`Failed to save cropped avatar: ${err.message}`);
    } finally {
      setSavingCrop(false);
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setCropFile(null);
  };

  const handleUsernameChange = (e) => {
    // Sanitizing username to lowercase, dots, hyphens, underscores
    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 32);
    setUsername(cleaned);
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
        bio: bio.trim(),
        website_url: websiteUrl.trim(),
        x_url: xUrl.trim(),
        instagram_url: instagramUrl.trim(),
        youtube_url: youtubeUrl.trim(),
        tiktok_url: tiktokUrl.trim()
      };

      await saveProfilePatch(patch);
      setMessage('Profile settings synchronized successfully.');
    } catch (err) {
      console.error('Profile save error:', err);
      setError(err.message || 'Failed to save profile settings');
    } finally {
      setSaving(false);
    }
  };

  const handleVisibilityChange = async (value) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      setVisibility(value);
      await saveProfilePatch({ profile_visibility: value });
      setMessage('Profile privacy protocol updated.');
    } catch (err) {
      console.error('Visibility update error:', err);
      setError(err.message || 'Failed to update visibility settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetOnboarding = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await saveProfilePatch({ onboarding_complete: false });
      setMessage('Onboarding protocol reset. Welcome sequence will start on next reload.');
    } catch (err) {
      console.error('Onboarding reset error:', err);
      setError(err.message || 'Failed to reset onboarding sequence');
    } finally {
      setSaving(false);
    }
  };

  const isFreeTrial = !profile?.subscription_tier || profile?.subscription_tier === 'none' || profile?.subscription_tier === 'free';

  const getTierIcon = () => {
    return isFreeTrial ? 'nature_people' : 'workspace_premium';
  };

  return (
    <div className="space-y-8">
      {/* Bento View - Cyber Mockup Card & Plan Core rollup */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl rounded-3xl p-8 relative overflow-hidden group flex flex-col items-center text-center justify-center min-h-[300px]">
          {/* Subtle Background Glow inside Card */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent pointer-events-none" />
          <div className="absolute -top-24 w-64 h-64 bg-cyan-500/[0.02] blur-[80px] rounded-full pointer-events-none" />

          {/* Profile Picture Upload Container */}
          <div className="relative size-32 rounded-full border-4 border-white/10 bg-zinc-950 shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-visible group/avatar mb-6">
            <div className="size-full rounded-full overflow-hidden">
              <Avatar className="size-full rounded-full">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-cyan-950 text-cyan-300 text-4xl font-black flex items-center justify-center size-full">
                  {displayName?.[0] || 'M'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Floating Upload Avatar Badge */}
            <label 
              htmlFor="avatar-upload-input"
              className="absolute bottom-0 right-0 size-10 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black border-2 border-black flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 z-20"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </label>
            <input 
              id="avatar-upload-input"
              type="file" 
              onChange={handleAvatarSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* User Details */}
          <div className="space-y-2 mb-6">
            <h3 className="text-2xl font-light text-white tracking-tight">{displayName || 'Anonymous Member'}</h3>
            <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">@{username || 'member'}</p>
          </div>

          {/* Profile Bio */}
          <div className="max-w-md mx-auto mb-6 w-full">
            {bio ? (
              <p className="text-sm text-white/70 leading-relaxed font-light italic">&quot;{bio}&quot;</p>
            ) : (
              <p className="text-xs text-white/30 font-light italic uppercase tracking-wider">No neural bio synthesized yet. Outline your journey in the forms below...</p>
            )}
          </div>

          {/* Public Links Badges */}
          <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-white/5 w-full">
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
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-400 uppercase tracking-wider">
                  {(!profile?.subscription_tier || profile?.subscription_tier === 'none' || profile?.subscription_tier === 'free') ? 'Free Trial' : 'Paid Plan'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/40">Total Sync Waves</span>
                <span className="font-mono text-white/80">{profile?.generation_count || 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/40">Active Status</span>
                <span className="font-mono text-cyan-400 uppercase tracking-widest text-[10px]">OPERATIONAL</span>
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

          <label className="block space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Biography</span>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell the collective consciousness about your biohacking, meditation patterns, or binaural targets..." className="bg-black/20 border-white/10" />
          </label>

          {/* Social Links & Web Links Section */}
          <div className="space-y-6 pt-4 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Social Link Matrix</p>
                <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider font-light">Add direct public credentials to your profile</p>
              </div>
              
              {/* Plus Buttons */}
              <div className="flex flex-wrap gap-2">
                {!showWebsite && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowWebsite(true)}
                    className="rounded-full border border-white/5 bg-white/5 hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider py-1.5 px-3"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    Website
                  </Button>
                )}
                {!showX && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowX(true)}
                    className="rounded-full border border-white/5 bg-white/5 hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider py-1.5 px-3"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    X / Twitter
                  </Button>
                )}
                {!showInstagram && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowInstagram(true)}
                    className="rounded-full border border-white/5 bg-white/5 hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider py-1.5 px-3"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    Instagram
                  </Button>
                )}
                {!showYoutube && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowYoutube(true)}
                    className="rounded-full border border-white/5 bg-white/5 hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider py-1.5 px-3"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    YouTube
                  </Button>
                )}
                {!showTiktok && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowTiktok(true)}
                    className="rounded-full border border-white/5 bg-white/5 hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider py-1.5 px-3"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    TikTok
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {showWebsite && (
                <label className="block space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">Personal Website URL</span>
                    <button 
                      type="button" 
                      onClick={() => { setWebsiteUrl(''); setShowWebsite(false); }} 
                      className="text-[9px] font-mono text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[12px]">close</span> Remove
                    </button>
                  </div>
                  <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://myspace.dev" className="bg-black/20 border-white/10 text-xs" />
                </label>
              )}

              {showX && (
                <label className="block space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">X / Twitter Handle URL</span>
                    <button 
                      type="button" 
                      onClick={() => { setXUrl(''); setShowX(false); }} 
                      className="text-[9px] font-mono text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[12px]">close</span> Remove
                    </button>
                  </div>
                  <Input value={xUrl} onChange={(e) => setXUrl(e.target.value)} placeholder="https://x.com/username" className="bg-black/20 border-white/10 text-xs" />
                </label>
              )}

              {showInstagram && (
                <label className="block space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">Instagram Profile URL</span>
                    <button 
                      type="button" 
                      onClick={() => { setInstagramUrl(''); setShowInstagram(false); }} 
                      className="text-[9px] font-mono text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[12px]">close</span> Remove
                    </button>
                  </div>
                  <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/username" className="bg-black/20 border-white/10 text-xs" />
                </label>
              )}

              {showYoutube && (
                <label className="block space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">YouTube Channel URL</span>
                    <button 
                      type="button" 
                      onClick={() => { setYoutubeUrl(''); setShowYoutube(false); }} 
                      className="text-[9px] font-mono text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[12px]">close</span> Remove
                    </button>
                  </div>
                  <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/@channel" className="bg-black/20 border-white/10 text-xs" />
                </label>
              )}

              {showTiktok && (
                <label className="block space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">TikTok Profile URL</span>
                    <button 
                      type="button" 
                      onClick={() => { setTiktokUrl(''); setShowTiktok(false); }} 
                      className="text-[9px] font-mono text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[12px]">close</span> Remove
                    </button>
                  </div>
                  <Input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@username" className="bg-black/20 border-white/10 text-xs" />
                </label>
              )}
            </div>
          </div>

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

      {/* Privacy settings */}
      <Card className="bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/20 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Security protocol</p>
            <h3 className="text-xl font-light text-white mt-1">Profile Privacy Node</h3>
          </div>
          <span className="material-symbols-outlined text-cyan-500 text-2xl">lock</span>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-white/55 leading-relaxed">
            Control who can discover your broadcast timeline, view your saved binaural frequency waves, and check your profile statistics in the global explorer.
          </p>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            {[
              { id: 'public', label: 'Public Broadcast', desc: 'Visible to everyone on the internet' },
              { id: 'members', label: 'Members Only', desc: 'Only registered platform users' },
              { id: 'private', label: 'Isolated Archive', desc: 'Only visible to your own console' }
            ].map((option) => {
              const active = visibility === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVisibilityChange(option.id)}
                  disabled={saving}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    active 
                      ? 'border-cyan-500 bg-cyan-500/[0.03] text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                      : 'border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold">{option.label}</span>
                    {active && <span className="material-symbols-outlined text-cyan-400 text-sm">check_circle</span>}
                  </div>
                  <span className="text-[10px] text-white/35 mt-4 leading-normal font-light">{option.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Neural Entitlements - Plan Details */}
      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[100px] bg-cyan-500/[0.02] blur-[40px] pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-cyan-400 text-2xl">license</span>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Neural Entitlement Details</p>
            </div>
            
            <h3 className="text-2xl font-light text-white">Active Core Allocation</h3>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <span className="material-symbols-outlined">{getTierIcon()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white capitalize">{isFreeTrial ? 'Free Trial' : 'Paid Plan'}</span>
                    <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-mono text-[9px] text-cyan-400 uppercase tracking-widest">Active</span>
                  </div>
                  <p className="text-xs text-white/55 mt-1 leading-relaxed">
                    {isFreeTrial 
                      ? 'Trial allocation. Play all Serenity catalog frequencies, master and export binaural parameters in the Workshop, and archive up to 5 custom sync waves in your neural library. Upgrade to Paid to unlock unlimited library saves, clone community waves, and broadcast on the global feed.'
                      : 'Premium active allocation. Enjoy unlimited custom synthesis renders, full Master audio export specs, and as many neural archive library saves as you need. Clone community waves to your personal archive and broadcast your mental reflections on the global Feed.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs tracking-wider uppercase px-6">
              Synthesize Allocation Upgrade
            </Button>
          </div>
        </Card>

        {/* System Settings & Onboarding Controls */}
        <Card className="md:col-span-4 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[80px] bg-purple-500/[0.02] blur-[30px] pointer-events-none" />
          
          <div className="space-y-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-purple-400">Cognitive Setup</p>
            <h4 className="text-lg font-semibold text-white">System Protocols</h4>
            
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 text-xs">
                <span className="text-white/40">Restore Console Tutorial</span>
                <p className="text-[10px] text-white/30 leading-normal font-light">Re-initialize the onboarding dialogue overlay next time you navigate to the main dashboard.</p>
                <Button 
                  onClick={handleResetOnboarding}
                  disabled={saving}
                  className="w-full mt-1 rounded-full border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500 hover:text-black font-mono text-[9px] uppercase tracking-widest text-purple-300 py-1.5 transition-all"
                >
                  Reset Onboarding Sequence
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 mt-6 text-center">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Operational core</span>
          </div>
        </Card>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 animate-shake">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      {/* Circular Drag-and-Pan Image Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <Card className="max-w-md w-full bg-zinc-950/90 border border-cyan-500/30 p-6 rounded-3xl space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[50px] bg-cyan-500/[0.05] blur-[35px] pointer-events-none" />
            
            <div className="text-center space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Positioning calibration</p>
              <h3 className="text-xl font-light text-white">Adjust Profile Picture</h3>
            </div>
            
            {/* Cropper Viewport */}
            <div className="flex justify-center">
              <div className="relative size-[260px] rounded-full overflow-hidden border-2 border-cyan-500/80 shadow-[0_0_30px_rgba(6,182,212,0.2)] bg-zinc-900 cursor-move select-none">
                <canvas
                  ref={canvasRef}
                  width={260}
                  height={260}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                  className="size-full"
                />
              </div>
            </div>
            
            {/* Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase text-white/40">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <p className="text-[9px] font-mono text-center text-white/30 uppercase tracking-widest">
                DRAG OR TOUCH TO PAN • SLIDE TO SCALE
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelCrop}
                className="rounded-full border border-white/5 hover:bg-white/5 text-white/70"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveCrop}
                disabled={savingCrop}
                className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 flex items-center gap-2"
              >
                {savingCrop ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">crop</span>
                    Save Avatar
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
