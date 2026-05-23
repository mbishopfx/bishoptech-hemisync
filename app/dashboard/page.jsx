'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authedFetch } from '@/lib/frontend/api';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Omnibar } from '@/components/agent/Omnibar';
import { LibraryPlayer } from '@/components/audio/LibraryPlayer';
import { LibraryBrowser } from '@/components/dashboard/LibraryBrowser';
import { WorkshopComposer } from '@/components/dashboard/WorkshopComposer';

// New high-fidelity modular tab components
import { FeedView } from '@/components/dashboard/FeedView';
import { JournalView } from '@/components/dashboard/JournalView';
import { ProfileView } from '@/components/dashboard/ProfileView';
import { SettingsView } from '@/components/dashboard/SettingsView';

const navItems = [
  { id: 'agent', label: 'Agentic', icon: 'psychology' },
  { id: 'library', label: 'Library', icon: 'library_music' },
  { id: 'workshop', label: 'Workshop', icon: 'architecture' },
  { id: 'feed', label: 'Feed', icon: 'sensors' },
  { id: 'journal', label: 'Journal', icon: 'edit_note' },
  { id: 'profile', label: 'Profile', icon: 'account_circle' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('agent');
  const [profile, setProfile] = useState(null);
  const [library, setLibrary] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentTrack, setAgentTrack] = useState(null);
  const [agentMessage, setAgentMessage] = useState('');
  const [selectedSeedTone, setSelectedSeedTone] = useState(null);
  const [workspaceError, setWorkspaceError] = useState('');

  // Parent-managed Background Workshop Generation States
  const [workshopStatus, setWorkshopStatus] = useState('idle'); // 'idle' | 'rendering' | 'saving' | 'completed' | 'failed'
  const [workshopProgress, setWorkshopProgress] = useState('');
  const [workshopError, setWorkshopError] = useState('');
  const [workshopResult, setWorkshopResult] = useState(null);
  const [workshopSavedTone, setWorkshopSavedTone] = useState(null);

  async function refreshWorkspace() {
    try {
      setWorkspaceError('');
      const [profileData, libraryData, feedData] = await Promise.all([
        authedFetch('/api/profile').catch(() => ({ profile: null })),
        authedFetch('/api/library').catch(() => ({ tones: [] })),
        authedFetch('/api/feed').catch(() => ({ posts: [] }))
      ]);

      setProfile(profileData.profile);
      setLibrary(libraryData.tones || []);
      setFeed(feedData.posts || []);
    } catch (error) {
      console.error('Sync failure:', error);
      setWorkspaceError('We could not sync the dashboard right now. Try refreshing the page.');
    }
  }

  useEffect(() => {
    async function boot() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login?next=/dashboard');
        return;
      }
      await refreshWorkspace();
      setLoading(false);
    }
    boot();
  }, [router]);

  const handleAgentGenerate = async (mood) => {
    setAgentLoading(true);
    setAgentMessage('');
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
      });
      const data = await response.json();
      if (response.ok) {
        setAgentMessage(data.agentMessage);
        setAgentTrack(data.track);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleWorkshopGenerate = async (composerPayload) => {
    setWorkshopStatus('rendering');
    setWorkshopProgress('Structuring binaural blueprints...');
    setWorkshopError('');
    setWorkshopResult(null);
    setWorkshopSavedTone(null);

    try {
      const { audioPayload, metadata } = composerPayload;

      // 1. Call standard generate endpoint
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audioPayload)
      });
      const data = await response.json();

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
        mp3_url: data.assets?.mp3?.url || data.mp3 || null,
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
      const saveData = await saveResponse.json();

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

  const handleDirectJournalGenerate = async ({ state, snippet }) => {
    const composerPayload = {
      audioPayload: {
        targetState: state,
        lengthSec: 600,
        baseFreqHz: state === 'delta' ? 150 : 220,
        focusLevel: 5,
        breathGuide: { pattern: 'coherent-5.5' }
      },
      metadata: {
        name: `Journal Wave (${state.toUpperCase()})`,
        description: `Binaural wave generated from conscious reflection: "${snippet}..."`,
        visibility: 'private',
        backgroundMode: 'none'
      }
    };
    await handleWorkshopGenerate(composerPayload);
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
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 sticky top-0 h-screen bg-black/40 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="size-10 rounded-xl bg-white flex items-center justify-center text-black font-black">B</div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">BishopTech</h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Agentic v1.0</p>
          </div>
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

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-white/10">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.display_name?.[0] || 'M'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.display_name || 'Member'}</p>
              <p className="text-[10px] font-mono text-white/40 truncate">@{profile?.username || 'user'}</p>
            </div>
            <button 
              onClick={() => setActiveTab('settings')}
              className="text-white/20 hover:text-white transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen relative">
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] pointer-events-none" />
        
        <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-light tracking-tight">
            {navItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
              Status: Operational
            </div>
          </div>
        </header>

        {/* Global Background Generation Banner */}
        {['rendering', 'saving'].includes(workshopStatus) && (
          <div className="mx-8 mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-cyan-400 text-lg animate-spin">sync</span>
              <span className="text-xs font-mono tracking-widest text-cyan-300 uppercase">
                Broadcast Node Active: {workshopProgress || 'Synthesizing neural waves...'}
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

        <div className="p-8 max-w-5xl mx-auto">
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
                  <LibraryPlayer track={agentTrack} />
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
                  onUseInWorkshop={(tone) => {
                    setSelectedSeedTone(tone);
                    setActiveTab('workshop');
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
                />
              </motion.div>
            )}

            {activeTab === 'feed' && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <FeedView
                  profile={profile}
                  tones={library}
                  initialFeed={feed}
                  onRefresh={refreshWorkspace}
                />
              </motion.div>
            )}

            {activeTab === 'journal' && (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <JournalView
                  onDirectGenerate={handleDirectJournalGenerate}
                  onInjectToWorkshop={(params) => {
                    setSelectedSeedTone({
                      name: `Journal Matched Resonance`,
                      target_state: params.state,
                      description: params.notes,
                      baseFreqHz: 220
                    });
                    setActiveTab('workshop');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ProfileView
                  profile={profile}
                  onUpdateProfile={(updated) => {
                    setProfile(updated);
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SettingsView
                  profile={profile}
                  onUpdateProfile={(updated) => {
                    setProfile(updated);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
