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
import { DailyView } from '@/components/dashboard/DailyView';
import { JournalView } from '@/components/dashboard/JournalView';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';
import { getSubscriptionStatusLabel } from '@/lib/billing/entitlements';
import { MemberWebMcpBridge } from '@/components/agent/MemberWebMcpBridge';

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
  { id: 'today', label: 'Today', icon: 'calendar_today' },
  { id: 'journal', label: 'Journal', icon: 'edit_note' },
  { id: 'agent', label: 'Sync', icon: 'psychology' },
  { id: 'studio', label: 'Studio', icon: 'graphic_eq' },
  { id: 'library', label: 'Library', icon: 'library_music' }
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('today');
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
      const resolvedTab = requestedTab === 'workshop' ? 'studio' : requestedTab;
      if (resolvedTab && navItems.some((item) => item.id === resolvedTab)) setActiveTab(resolvedTab);
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
  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const openStudioFromReflection = ({ state = 'theta', notes = '', snippet = '' } = {}) => {
    const baseByState = { delta: 216, theta: 228, alpha: 238, beta: 246, gamma: 252 };
    const targetByState = { delta: 3, theta: 6, alpha: 10, beta: 18, gamma: 32 };
    setSelectedSeedTone({
      state,
      target_state: state,
      baseFreqHz: baseByState[state] || baseByState.theta,
      targetHz: targetByState[state] || targetByState.theta,
      notes: notes || snippet
    });
    setSelectedStudioProject(null);
    setSelectedStudioRender(null);
    setActiveTab('studio');
  };

  const openFreshStudio = () => {
    setSelectedSeedTone(null);
    setSelectedStudioProject(null);
    setSelectedStudioRender(null);
    setActiveTab('studio');
  };

  const handleTabChange = (tab) => {
    if (tab === 'studio') openFreshStudio();
    else setActiveTab(tab);
  };


  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#eef1ee] text-[#1d302c] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-[#548477] animate-spin">sync</span>
      </div>
    );
  }

  return (
    <div className="workspace-theme min-h-[100dvh] bg-[#eef1ee] text-[#1d302c] flex">
      {/* Sidebar */}
      <aside className="hidden min-h-[100dvh] w-72 flex-col border-r border-[#cbd6cf] bg-[#f7f8f5]/90 p-6 backdrop-blur-xl md:sticky md:top-0 md:flex">
        <div className="mb-12 flex items-center gap-3 justify-center md:justify-start">
          <Image
            src="/images/cognistration-mark.png"
            alt="Cognistration brain and waveform mark"
            width={40}
            height={40}
            className="rounded-xl border border-[#cbd6cf] shadow-[0_8px_20px_rgba(45,65,59,0.08)]"
          />
          <div>
            <p className="text-sm font-semibold tracking-[-0.02em] text-[#1d302c]">Cognistration</p>
            <p className="mt-1 text-xs text-[#87968f]">Private listening workspace</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all ${
                  isActive ? 'border-[#b8cbc0] bg-white text-[#1d302c] font-medium shadow-[0_8px_20px_rgba(45,65,59,0.05)]' : 'border-transparent text-[#7a8983] hover:bg-white/70 hover:text-[#315e55]'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${isActive ? 'text-[#548477]' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="relative mt-auto border-t border-[#cbd6cf] pt-6">
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen((open) => !open)}
            className="flex w-full items-center gap-3.5 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/70"
            aria-expanded={isAccountMenuOpen}
          >
            <Avatar className="h-11 w-11 shrink-0 border border-[#cbd6cf]">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.display_name?.[0] || 'M'}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
              <p className="truncate text-sm font-medium leading-tight">{profile?.display_name || 'Member'}</p>
              <p className="truncate text-xs leading-tight text-[#87968f]">{profile?.email || profile?.username || 'Account'}</p>
            </div>
            <span className="material-symbols-outlined shrink-0 text-lg text-[#87968f]" aria-hidden="true">expand_more</span>
          </button>

          <AnimatePresence>
            {isAccountMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-16 left-0 right-0 z-50 rounded-2xl border border-[#cbd6cf] bg-white/95 p-3 shadow-[0_20px_45px_rgba(45,65,59,0.12)] backdrop-blur-xl"
              >
                <p className="truncate px-3 py-2 text-sm text-[#60716b]">{profile?.email || 'Signed-in account'}</p>
                <p className="px-3 pb-2 text-xs font-medium text-[#548477]">
                  {getSubscriptionStatusLabel(profile)}
                </p>
                <a href="/pricing" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#60716b] hover:bg-[#eef1ee] hover:text-[#1d302c]">
                  <span className="material-symbols-outlined text-base">credit_card</span>
                  Pricing & account
                </a>
                <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#60716b] hover:bg-[#eef1ee] hover:text-[#1d302c]">
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative min-h-[100dvh] w-full flex-1 overflow-x-hidden bg-gradient-to-b from-[#eef1ee] via-[#f7f8f5] to-[#e6eee8]">
        <div className="sr-only" aria-live="polite">
          Private workspace controls are available when supported.
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[800px] bg-[#dbece2]/55 blur-[120px]" />
        
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#cbd6cf]/80 bg-[#eef1ee]/88 px-6 py-4 backdrop-blur-xl md:px-10 md:py-5">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <Image
                src="/images/cognistration-mark.png"
                alt="Cognistration brain and waveform mark"
                width={32}
                height={32}
                className="rounded-lg border border-[#cbd6cf]"
              />
            </div>
            <h1 className="border-l border-[#cbd6cf] pl-2 text-xl font-medium tracking-[-0.035em] text-[#1d302c] md:border-l-0 md:pl-0 md:text-2xl">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          {/* Mobile Menu Dropdown Toggle */}
          <div className="md:hidden relative">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center rounded-xl border border-[#b8cbc0] bg-white/70 p-2 text-[#60716b] transition-all hover:bg-white hover:text-[#1d302c]"
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
                    className="fixed inset-0 z-40 bg-[#1d302c]/20 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  
                  {/* Menu Dropdown Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-3 w-64 space-y-4 rounded-2xl border border-[#cbd6cf] bg-white/95 p-4 shadow-[0_18px_40px_rgba(45,65,59,0.12)] backdrop-blur-xl"
                  >
                    <nav className="space-y-1">
                      {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              handleTabChange(item.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${
                              isActive ? 'border border-[#b8cbc0] bg-[#eef1ee] text-[#1d302c] font-medium' : 'border border-transparent text-[#7a8983] hover:bg-[#f7f8f5] hover:text-[#315e55]'
                            }`}
                          >
                            <span className={`material-symbols-outlined text-lg ${isActive ? 'text-[#548477]' : ''}`}>
                              {item.icon}
                            </span>
                            <span className="text-sm">{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>

                    <div className="border-t border-[#dbe2dd] pt-4">
                      <div className="flex items-center gap-3 px-2">
                        <Avatar className="h-9 w-9 shrink-0 border border-[#cbd6cf]">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback>{profile?.display_name?.[0] || 'M'}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
                          <p className="truncate text-xs font-medium leading-tight">{profile?.display_name || 'Member'}</p>
                          <p className="truncate text-xs leading-tight text-[#87968f]">{profile?.email || profile?.username || 'Account'}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="px-3 py-1 text-xs font-medium text-[#548477]">
                          {getSubscriptionStatusLabel(profile)}
                        </p>
                        <a href="/pricing" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#60716b] hover:bg-[#eef1ee] hover:text-[#1d302c]">
                          <span className="material-symbols-outlined text-base">credit_card</span>
                          Pricing & account
                        </a>
                        <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#60716b] hover:bg-[#eef1ee] hover:text-[#1d302c]">
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

        {workspaceError && (
          <div className="mx-5 mt-6 rounded-2xl border border-[#caa778]/45 bg-[#fbf5eb] px-4 py-3 text-sm text-[#8b6038] md:mx-10">
            {workspaceError}
          </div>
        )}

        <div className="mx-auto w-full max-w-6xl px-5 pb-5 pt-4 md:px-10 md:pb-10 md:pt-6">
          <div className="mb-5 flex w-full justify-end md:mb-6">
            <MemberWebMcpBridge />
          </div>
          <AnimatePresence mode="wait">
            {activeTab === 'agent' && (
              <motion.div
                key="agent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10 py-8"
              >
                <div className="max-w-2xl space-y-4">
                  <h2 className="text-4xl font-medium tracking-[-0.055em] text-[#1d302c] md:text-5xl">What state do you need?</h2>
                  <p className="max-w-md text-lg text-[#60716b]">Describe your goal or current emotion.</p>
                </div>
                
                <Omnibar 
                  onGenerate={handleAgentGenerate} 
                  isLoading={agentLoading} 
                  agentMessage={agentMessage} 
                  theme="light"
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
                  onUseInStudio={(tone) => {
                    setSelectedSeedTone(tone);
                    setSelectedStudioProject(null);
                    setSelectedStudioRender(null);
                    setActiveTab('studio');
                  }}
                  onEditProject={(project) => {
                    setSelectedStudioProject(project);
                    setSelectedStudioRender(studioRenders.find((render) => render.session_id === project.id) || null);
                    setActiveTab('studio');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'today' && (
              <motion.div
                key="today"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DailyView onOpenStudio={openFreshStudio} />
              </motion.div>
            )}

            {activeTab === 'journal' && (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <JournalView
                  onDirectGenerate={openStudioFromReflection}
                  onInjectToStudio={openStudioFromReflection}
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
                <div className="space-y-10">
                  <div className="max-w-2xl"><p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#548477]">Live control deck</p><h2 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-[#1d302c] md:text-4xl">Tune a session in real time.</h2><p className="mt-3 text-sm leading-6 text-[#60716b]">Adjust carrier, rhythm, and volume while the preview is running. When the tone feels right, open Immersive mode and let the ocean follow the same settings.</p></div>
                  <WorkshopComposer seedTone={selectedSeedTone} profile={profile} library={library} />
                  <div className="border-t border-[#dbe2dd] pt-10">
                    <div className="mb-6 max-w-2xl"><p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#548477]">Long-form Studio</p><h3 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-[#1d302c]">Build a private listening session.</h3><p className="mt-3 text-sm leading-6 text-[#60716b]">Shape a staged session, save a draft, or render a high-quality master when you are ready.</p></div>
                    <StudioView
                      mode="studio"
                      seedTone={selectedSeedTone}
                      initialProject={selectedStudioProject}
                      initialRender={selectedStudioRender}
                      onChanged={refreshWorkspace}
                      onOpenLibrary={() => setActiveTab('library')}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
