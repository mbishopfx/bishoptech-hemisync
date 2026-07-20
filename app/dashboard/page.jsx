'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authedFetch, getAccessToken } from '@/lib/frontend/api';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Omnibar } from '@/components/agent/Omnibar';
import { LibraryPlayer } from '@/components/audio/LibraryPlayer';
import { LibraryBrowser } from '@/components/dashboard/LibraryBrowser';
import { WorkshopComposer } from '@/components/dashboard/WorkshopComposer';
import { StudioView } from '@/components/dashboard/StudioView';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';
import { toBackendUrl } from '@/lib/frontend/backend-url';
import { getSubscriptionStatusLabel } from '@/lib/billing/entitlements';

async function readApiResponse(response, fallbackMessage = 'Request failed') {
  const contentType = response.headers.get('content-type') || '';
  const raw = await response.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return { error: raw || fallbackMessage, parseError: error.message };
    }
  }

  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {
      error: raw?.trim() || fallbackMessage,
      raw
    };
  }
}

const navItems = [
  { id: 'agent', label: 'Sync', icon: 'psychology' },
  { id: 'workshop', label: 'Workshop', icon: 'architecture' },
  { id: 'studio', label: 'Studio', icon: 'graphic_eq' },
  { id: 'library', label: 'Library', icon: 'library_music' }
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('workshop');
  const [profile, setProfile] = useState(null);
  const [library, setLibrary] = useState([]);
  const [studioProjects, setStudioProjects] = useState([]);
  const [studioRenders, setStudioRenders] = useState([]);
  const [selectedStudioProject, setSelectedStudioProject] = useState(null);
  const [selectedStudioRender, setSelectedStudioRender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentTrack, setAgentTrack] = useState(null);
  const [agentMessage, setAgentMessage] = useState('');
  const [selectedSeedTone, setSelectedSeedTone] = useState(null);
  const [workspaceError, setWorkspaceError] = useState('');

  const [savingTrack, setSavingTrack] = useState(false);

  // Parent-managed Background Workshop Generation States
  const [workshopStatus, setWorkshopStatus] = useState('idle'); // 'idle' | 'rendering' | 'saving' | 'completed' | 'failed'
  const [workshopProgress, setWorkshopProgress] = useState('');
  const [workshopError, setWorkshopError] = useState('');
  const [workshopResult, setWorkshopResult] = useState(null);
  const [workshopSavedTone, setWorkshopSavedTone] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  async function refreshWorkspace() {
    try {
      setWorkspaceError('');
      const [profileData, libraryResponse, projectsData, rendersData] = await Promise.all([
        authedFetch('/api/profile').catch(() => ({ profile: null })),
        fetch('/api/library', { cache: 'no-store' }).then((response) => readApiResponse(response, 'Library request failed')).catch(() => ({ tones: [] })),
        authedFetch('/api/studio/projects').catch(() => ({ projects: [] })),
        authedFetch('/api/studio/renders').catch(() => ({ renders: [] }))
      ]);

      setProfile(profileData.profile);
      setLibrary(Array.isArray(libraryResponse?.tones) ? libraryResponse.tones : []);
      setStudioProjects(projectsData.projects || []);
      setStudioRenders(rendersData.renders || []);
      return { projects: projectsData.projects || [], renders: rendersData.renders || [] };
    } catch (error) {
      console.error('Sync failure:', error);
      setWorkspaceError('We could not sync the dashboard right now. Try refreshing the page.');
    }
  }

  useEffect(() => {
    async function boot() {
      let supabase = null;
      try {
        supabase = getSupabaseBrowserClient();
      } catch (err) {
        console.warn('Supabase client unavailable on dashboard boot:', err?.message || err);
      }

      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login?next=/dashboard');
        return;
      }

      const checkoutSessionId = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('session_id')
        : null;

      if (checkoutSessionId) {
        try {
          await authedFetch('/api/checkout/complete', {
            method: 'POST',
            body: JSON.stringify({ sessionId: checkoutSessionId })
          });
        } catch (syncError) {
          console.warn('Checkout completion sync failed:', syncError?.message || syncError);
        }
      }

      const accessData = await authedFetch('/api/account/access').catch(() => ({ access: { granted: false } }));
      if (!accessData.access?.granted) {
        router.replace('/login?subscription=required&next=/dashboard');
        return;
      }

      const workspace = await refreshWorkspace();

      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const requestedTab = params?.get('tab');
      const requestedRender = params?.get('render');
      if (requestedTab && navItems.some((item) => item.id === requestedTab)) setActiveTab(requestedTab);
      if (requestedRender) {
        const matched = workspace?.renders?.find((item) => item.id === requestedRender);
        if (matched) {
          setSelectedStudioRender(matched);
          setSelectedStudioProject(workspace?.projects?.find((item) => item.id === matched.session_id) || null);
        }
      }

      if (checkoutSessionId) {
        router.replace('/dashboard');
      }

      setLoading(false);
    }
    boot();
  }, [router]);

  const handleAgentGenerate = async (mood) => {
    setAgentLoading(true);
    setAgentMessage('');
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ mood })
      });
      const data = await readApiResponse(response, 'Agent request failed');
      if (response.ok) {
        setAgentMessage(data.agentMessage);
        setAgentTrack(data.track);
        await refreshWorkspace();
      } else if (response.status === 403) {
        if (data?.code === 'AUTH_REQUIRED') {
          window.location.href = '/signup';
          return;
        }

        if (['SUBSCRIPTION_REQUIRED', 'LIBRARY_LIMIT_REACHED', 'BROADCAST_BLOCKED'].includes(data?.code)) {
          await redirectToStripeCheckout();
          return;
        }

        throw new Error(data?.error || 'Agent request failed');
      } else {
        throw new Error(data?.error || 'Agent request failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleSyncSave = async () => {
    if (!agentTrack || agentTrack.savedToneId) return;

    setSavingTrack(true);
    setWorkspaceError('');
    try {
      const response = await fetch('/api/library/tones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentTrack.name,
          description: `Matched by Cognistration Agent for mood`,
          target_state: agentTrack.state,
          base_freq_hz: 220,
          duration_sec: 180,
          wav_url: agentTrack.wavUrl,
          mp3_url: agentTrack.webmUrl || agentTrack.wavUrl,
          visibility: 'private',
          frequency_plan: {
            sourceType: 'agentic-match',
            isAgentic: true,
          }
        })
      });

      const data = await readApiResponse(response, 'Save request failed');
      if (!response.ok) {
        if (response.status === 403 && data?.code === 'LIBRARY_LIMIT_REACHED') {
          await redirectToStripeCheckout();
          return;
        }
        throw new Error(data?.message || data?.error || 'Failed to save tone');
      }

      if (data?.savedTone) {
        setAgentTrack(prev => ({ ...prev, savedToneId: data.savedTone.id }));
      }
      await refreshWorkspace();
    } catch (err) {
      console.error(err);
      setWorkspaceError(err.message || 'Failed to save tone');
    } finally {
      setSavingTrack(false);
    }
  };
  const handleWorkshopGenerate = async (composerPayload) => {
    setWorkshopStatus('rendering');
    setWorkshopProgress(composerPayload.isWeave ? 'Weaving neural sequences...' : 'Structuring binaural blueprints...');
    setWorkshopError('');
    setWorkshopResult(null);
    setWorkshopSavedTone(null);

    try {
      if (composerPayload.isWeave) {
        const response = await fetch(toBackendUrl('/api/audio/chain'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(composerPayload.weavePayload)
        });
        const data = await readApiResponse(response, 'Neural sequence weave failed');

        if (!response.ok) {
          throw new Error(data?.error || 'Neural sequence weave failed');
        }

        setWorkshopResult(data);
        setWorkshopSavedTone(data.tone);
        setWorkshopStatus('completed');
        setWorkshopProgress('');
        await refreshWorkspace();
        return;
      }

      const { audioPayload, metadata } = composerPayload;

      // 1. Call standard generate endpoint
      const response = await fetch(toBackendUrl('/api/audio/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audioPayload)
      });
      const data = await readApiResponse(response, 'Generation failed');

      if (!response.ok) {
        throw new Error(data?.error || 'Generation failed');
      }

      setWorkshopResult(data);
      setWorkshopStatus('saving');
      setWorkshopProgress('Archiving custom binaural wave to your neural library...');

      // 2. Save tone in database
      const savePayload = {
        name: metadata.name.trim() || `${metadata.brainStateLabel} Workshop`,
        description: metadata.description.trim() || `Custom ${metadata.brainStateLabel} session built from the workshop generator.`,
        target_state: audioPayload.targetState,
        duration_sec: data.journey?.totalLengthSec || audioPayload.lengthSec,
        base_freq_hz: audioPayload.baseFreqHz,
        delta_path: data.journey?.deltaHzPath || metadata.deltaHzPath,
        wav_url: data.assets?.wav?.url || data.wav || null,
        mp3_url: data.assets?.webm?.url || data.webm || data.assets?.mp3?.url || data.mp3 || null,
        artifact_id: data.artifactId || null,
        visibility: metadata.visibility,
        source_session_id: data.journey?.id || audioPayload.journeyPresetId,
        render_id: data.artifactId || null,
        frequency_plan: {
          ...data.journey,
          selectedPresetId: audioPayload.journeyPresetId,
          targetState: audioPayload.targetState,
          focusLevel: audioPayload.focusLevel,
          breathEnabled: !!audioPayload.breathGuide,
          breathPattern: audioPayload.breathGuide?.pattern || 'coherent-5.5',
          backgroundMode: metadata.backgroundMode
        }
      };

      const saveResponse = await fetch('/api/library/tones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePayload)
      });
      const saveData = await readApiResponse(saveResponse, 'Tone rendered, but saving to the library failed');

      if (!saveResponse.ok) {
        throw new Error(saveData?.error || 'Tone rendered, but saving to the library failed');
      }

      setWorkshopSavedTone(saveData.tone);
      setWorkshopStatus('completed');
      setWorkshopProgress('');
      await refreshWorkspace();
    } catch (err) {
      console.error('Workshop background generate error:', err);
      setWorkshopStatus('failed');
      setWorkshopError(err.message || 'Background generation failed');
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-cyan-500 animate-spin">sync</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-white/5 flex-col p-6 sticky top-0 h-screen bg-black/40 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-3 mb-12 justify-center md:justify-start">
          <Image
            src="/images/cognistration-mark.png"
            alt="Cognistration brain and waveform mark"
            width={40}
            height={40}
            className="brightness-110 contrast-125 animate-pulse"
          />
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                  isActive ? 'bg-white/5 text-white font-medium border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${isActive ? 'text-cyan-400' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="relative mt-auto pt-6 border-t border-white/5">
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen((open) => !open)}
            className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-white/5"
            aria-expanded={isAccountMenuOpen}
          >
            <Avatar className="size-10 border border-white/10">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.display_name?.[0] || 'M'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.display_name || 'Member'}</p>
              <p className="text-[10px] font-mono text-white/40 truncate">{profile?.email || profile?.username || 'Account'}</p>
            </div>
            <span className="material-symbols-outlined text-lg text-white/30">expand_more</span>
          </button>

          <AnimatePresence>
            {isAccountMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-16 left-0 right-0 z-50 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-2xl"
              >
                <p className="truncate px-3 py-2 text-xs text-white/60">{profile?.email || 'Signed-in account'}</p>
                <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-cyan-300">
                  {getSubscriptionStatusLabel(profile)}
                </p>
                <a href="/pricing" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                  <span className="material-symbols-outlined text-base">credit_card</span>
                  Pricing & account
                </a>
                <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-h-screen relative overflow-x-hidden">
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] pointer-events-none" />
        
        <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-6 py-4 md:px-8 md:py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <Image
                src="/images/cognistration-mark.png"
                alt="Cognistration brain and waveform mark"
                width={32}
                height={32}
                className="brightness-110 contrast-125 animate-pulse"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-light tracking-tight text-white/95 border-l border-white/10 pl-2 md:border-l-0 md:pl-0">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          {/* Mobile Menu Dropdown Toggle */}
          <div className="md:hidden relative">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-xl">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            {/* Mobile Dropdown Panel */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  {/* Backdrop overlay */}
                  <div 
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  
                  {/* Menu Dropdown Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 backdrop-blur-2xl shadow-[0_0_30px_rgba(6,182,212,0.15)] z-50 space-y-4"
                  >
                    <nav className="space-y-1">
                      {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${
                              isActive ? 'bg-white/5 text-white font-medium border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className={`material-symbols-outlined text-lg ${isActive ? 'text-cyan-400' : ''}`}>
                              {item.icon}
                            </span>
                            <span className="text-sm">{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>

                    <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3 px-2">
                        <Avatar className="size-8 border border-white/10">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback>{profile?.display_name?.[0] || 'M'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-medium truncate">{profile?.display_name || 'Member'}</p>
                          <p className="text-[9px] font-mono text-white/40 truncate">{profile?.email || profile?.username || 'Account'}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="px-3 py-1 text-[9px] font-mono uppercase tracking-widest text-cyan-300">
                          {getSubscriptionStatusLabel(profile)}
                        </p>
                        <a href="/pricing" className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white">
                          <span className="material-symbols-outlined text-base">credit_card</span>
                          Pricing & account
                        </a>
                        <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white">
                          <span className="material-symbols-outlined text-base">logout</span>
                          Sign out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Global Background Generation Banner */}
        {['rendering', 'saving'].includes(workshopStatus) && (
          <div className="mx-8 mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-cyan-400 text-lg animate-spin">sync</span>
              <span className="text-xs font-mono tracking-widest text-cyan-300 uppercase">
                Workshop Render Active: {workshopProgress || 'Synthesizing neural waves...'}
              </span>
            </div>
            <button 
              onClick={() => setActiveTab('workshop')}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-500/30 px-3 py-1 rounded-full transition-colors"
            >
              Open Console
            </button>
          </div>
        )}

        {/* Global Background Complete Success Banner */}
        {workshopStatus === 'completed' && workshopSavedTone && (
          <div className="mx-8 mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
              <span className="text-xs font-mono tracking-widest text-emerald-300 uppercase">
                Success: Custom tone &quot;{workshopSavedTone.name}&quot; saved to Neural Archive.
              </span>
            </div>
            <button 
              onClick={() => {
                setWorkshopStatus('idle');
                setActiveTab('library');
              }}
              className="text-[10px] font-mono text-emerald-400 hover:text-emerald-200 border border-emerald-500/30 px-3 py-1 rounded-full transition-colors"
            >
              View Library
            </button>
          </div>
        )}

        {workspaceError && (
          <div className="mx-8 mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {workspaceError}
          </div>
        )}

        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'agent' && (
              <motion.div
                key="agent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12 py-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-light tracking-tight">What state do you need?</h2>
                  <p className="text-white/40 text-lg max-w-md mx-auto">Describe your goal or current emotion.</p>
                </div>
                
                <Omnibar 
                  onGenerate={handleAgentGenerate} 
                  isLoading={agentLoading} 
                  agentMessage={agentMessage} 
                />

                {agentTrack && (
                  <div className="space-y-6">
                    <LibraryPlayer track={agentTrack} />
                    
                    <div className="max-w-md mx-auto flex flex-col gap-4">
                      <div className="flex">
                        <button
                          onClick={handleSyncSave}
                          disabled={savingTrack || Boolean(agentTrack.savedToneId)}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-xs font-mono uppercase tracking-wider transition-all ${
                            agentTrack.savedToneId
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 cursor-default'
                              : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {agentTrack.savedToneId ? 'check_circle' : 'library_add'}
                          </span>
                          {agentTrack.savedToneId ? 'Saved to Library' : 'Save to Library'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <LibraryBrowser
                  tones={library}
                  projects={studioProjects}
                  renders={studioRenders}
                  onUseInWorkshop={(tone) => {
                    setSelectedSeedTone(tone);
                    setActiveTab('workshop');
                  }}
                  onEditProject={(project) => {
                    setSelectedStudioProject(project);
                    setSelectedStudioRender(studioRenders.find((render) => render.session_id === project.id) || null);
                    setActiveTab('studio');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'workshop' && (
              <motion.div
                key="workshop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <WorkshopComposer
                  seedTone={selectedSeedTone}
                  onGenerated={(tone) => {
                    setSelectedSeedTone(tone);
                    refreshWorkspace();
                  }}
                  generatingStatus={workshopStatus}
                  generatingError={workshopError}
                  generatingProgress={workshopProgress}
                  generatingResult={workshopResult}
                  generatingSavedTone={workshopSavedTone}
                  onStartGenerate={handleWorkshopGenerate}
                  profile={profile}
                  library={library}
                />
              </motion.div>
            )}

            {activeTab === 'studio' && (
              <motion.div
                key="studio"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <StudioView
                  initialProject={selectedStudioProject}
                  initialRender={selectedStudioRender}
                  onChanged={refreshWorkspace}
                  onOpenLibrary={() => setActiveTab('library')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
