'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Bell,
  BookAudio,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  Edit3,
  Heart,
  Home,
  Library as LibraryIcon,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Radio,
  Search,
  Settings,
  Share2,
  SlidersHorizontal,
  Trash2,
  User
} from 'lucide-react';
import { MetalFx } from 'metal-fx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { authedFetch } from '@/lib/frontend/api';
import { resolveBackendAssetUrl } from '@/lib/frontend/backend-url';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { TechGridBackground } from '@/components/visuals/TechGridBackground';
import { FrequencyBackground } from '@/components/visuals/FrequencyBackground';
import { buildTemplateSessionSpec, consumerTemplateOptions } from '../generate/chatspec';

const navItems = [
  { id: 'studio', label: 'Workshop', icon: Home },
  { id: 'journal', label: 'Intention', icon: Edit3 },
  { id: 'feed', label: 'Explore', icon: Compass },
  { id: 'library', label: 'Archives', icon: LibraryIcon },
  { id: 'sessions', label: 'Activity', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function minutes(seconds) {
  return Number(((seconds || 0) / 60).toFixed(1));
}

function buildDeltaPath(spec) {
  return (spec.stages || []).flatMap((stage) => [
    { at: stage.atSec || 0, hz: stage.deltaHz?.from || spec.deltaHz || 8 },
    { at: (stage.atSec || 0) + (stage.durationSec || 0), hz: stage.deltaHz?.to || spec.deltaHz || 8 }
  ]);
}

function buildRenderPayload(spec) {
  const background = spec.layers?.find((layer) => layer.type === 'background');
  const breath = spec.layers?.find((layer) => layer.type === 'breath');

  return {
    exportProfile: 'premium',
    journeyPresetId: spec.journeyPresetId,
    focusLevel: spec.focusLevel,
    lengthSec: spec.lengthSec,
    baseFreqHz: spec.baseFreqHz,
    stageBlueprint: spec.stages,
    entrainmentModes: { binaural: true, monaural: false, isochronic: false },
    breathGuide: breath
      ? {
          enabled: true,
          pattern: breath.params?.pattern || 'coherent-5.5'
        }
      : undefined,
    background: background
      ? background.params?.sourceType === 'asset'
        ? { type: 'asset', assetId: background.params.assetId, mixDb: background.params.mixDb }
        : { type: 'ocean', mixDb: background.params?.mixDb ?? -24 }
      : undefined
  };
}

function initialToneDraft(template, renderResult, spec) {
  return {
    name: template.title,
    description: template.description || template.useCase || '',
    coverImageUrl: '',
    visibility: 'private',
    targetState: renderResult?.stages?.[Math.floor((renderResult?.stages?.length || 1) / 2)]?.brainState || 'alpha',
    durationSec: spec.lengthSec,
    baseFreqHz: spec.baseFreqHz,
    deltaPath: buildDeltaPath(spec),
    frequencyPlan: {
      journeyPresetId: spec.journeyPresetId,
      focusLevel: spec.focusLevel,
      stages: spec.stages
    },
    wavUrl: renderResult?.wav || null,
    mp3Url: renderResult?.mp3 || null,
    artifactId: renderResult?.artifactId || null
  };
}

function Sidebar({ activeTab, setActiveTab, profile, onGenerate }) {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[275px] flex-col border-r border-white/5 bg-black/20 px-4 py-4 md:flex z-50 backdrop-blur-md">
      <div className="mb-8 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Radio className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tighter text-white">Astral</h2>
            <p className="text-[10px] font-light tracking-[0.2em] uppercase text-neutral-500">Architect</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`group flex w-full items-center gap-4 rounded-full px-4 py-3 text-xl transition-all hover:bg-white/5 ${
                isActive ? 'font-bold text-white' : 'text-neutral-400'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className={`size-7 ${isActive ? 'text-cyan-400' : ''}`} />
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          className="group flex w-full items-center gap-4 rounded-full px-4 py-3 text-xl text-neutral-400 transition-all hover:bg-white/5"
        >
          <MoreHorizontal className="size-7" />
          <span className="hidden lg:inline">More</span>
        </button>
      </nav>

      <div className="mt-4 px-2">
        <MetalFx preset="chromatic" variant="button" strength={1} borderGlow glowDodge glowColor="#06b6d4">
          <Button 
            className="w-full h-14 rounded-full bg-cyan-500 font-bold text-lg text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02]"
            onClick={() => {
              setActiveTab('studio');
              onGenerate();
            }}
          >
            <Plus className="mr-2 size-6" /> 
            <span className="hidden lg:inline">New State</span>
          </Button>
        </MetalFx>
      </div>

      <div className="mt-8">
        <button className="flex w-full items-center gap-3 rounded-full p-3 transition-all hover:bg-white/5">
          <Avatar className="size-10 ring-2 ring-white/5">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-cyan-500/10 text-cyan-400">
              {(profile?.display_name || profile?.email || 'M').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-1 text-left lg:block">
            <p className="font-bold text-white truncate max-w-[120px]">{profile?.display_name || 'Member'}</p>
            <p className="text-sm text-neutral-500 truncate max-w-[120px]">@{profile?.username || 'new-member'}</p>
          </div>
          <MoreHorizontal className="hidden size-5 text-neutral-500 lg:block" />
        </button>
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('studio');
  const [profile, setProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState({});
  const [library, setLibrary] = useState([]);
  const [feed, setFeed] = useState([]);
  const [status, setStatus] = useState('Deep space console ready.');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(consumerTemplateOptions[0].id);
  const [renderResult, setRenderResult] = useState(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [toneDraft, setToneDraft] = useState(null);
  const [postBody, setPostBody] = useState('');
  const [journalText, setJournalText] = useState('');
  const [journalResult, setJournalResult] = useState(null);
  const [analyzingJournal, setAnalyzingJournal] = useState(false);

  const selectedTemplate = useMemo(
    () => consumerTemplateOptions.find((template) => template.id === selectedTemplateId) || consumerTemplateOptions[0],
    [selectedTemplateId]
  );

  const selectedSpec = useMemo(() => buildTemplateSessionSpec(selectedTemplate), [selectedTemplate]);
  const activeAudio = renderResult?.wav || library[0]?.wav_url || library[0]?.mp3_url || null;

  async function refreshWorkspace() {
    const [profileData, libraryData, feedData] = await Promise.all([
      authedFetch('/api/profile'),
      authedFetch('/api/library'),
      authedFetch('/api/feed')
    ]);

    setProfile(profileData.profile);
    setProfileDraft(profileData.profile || {});
    setLibrary(libraryData.tones || []);
    setFeed(feedData.posts || []);
  }

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.push('/login?next=/dashboard');
          return;
        }

        await refreshWorkspace();
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setStatus(error.message);
        }
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogout() {
    await getSupabaseBrowserClient().auth.signOut();
    router.push('/login');
  }

  async function handleGenerate() {
    setRendering(true);
    setStatus(`Synthesizing ${selectedTemplate.title}...`);

    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRenderPayload(selectedSpec))
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Synthesis failed');
      }

      const result = {
        wav: resolveBackendAssetUrl(data.wav),
        mp3: resolveBackendAssetUrl(data.mp3),
        stages: data.stages || [],
        analytics: data.analytics,
        journey: data.journey,
        artifactId: data.artifactId
      };
      setRenderResult(result);
      setToneDraft(initialToneDraft(selectedTemplate, result, selectedSpec));
      setSaveOpen(true);
      setStatus('Synthesis complete. Neural archive updated.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setRendering(false);
    }
  }

  async function handleSaveTone() {
    if (!toneDraft) return;
    const data = await authedFetch('/api/library/tones', {
      method: 'POST',
      body: JSON.stringify(toneDraft)
    });
    setLibrary((prev) => [data.tone, ...prev]);
    setSaveOpen(false);
    setActiveTab('library');
    setStatus('Tone committed to neural archive.');
  }

  async function handleShareTone(tone) {
    const data = await authedFetch(`/api/library/tones/${tone.id}/share`, {
      method: 'POST',
      body: JSON.stringify({ body: tone.description || `Shared ${tone.name}` })
    });
    setFeed((prev) => [data.post, ...prev]);
    setLibrary((prev) => prev.map((item) => (item.id === tone.id ? { ...item, visibility: 'public' } : item)));
    setActiveTab('feed');
    setStatus('Tone broadcast to global feed.');
  }

  async function handleDeleteTone(tone) {
    await authedFetch(`/api/library/tones/${tone.id}`, { method: 'DELETE' });
    setLibrary((prev) => prev.filter((item) => item.id !== tone.id));
    setStatus('Tone purged from archive.');
  }

  async function handleCreatePost() {
    if (!postBody.trim()) return;
    const data = await authedFetch('/api/feed/posts', {
      method: 'POST',
      body: JSON.stringify({ body: postBody.trim() })
    });
    setPostBody('');
    setFeed((prev) => [data.post, ...prev]);
  }

  async function handleAnalyzeJournal() {
    if (!journalText.trim()) return;
    setAnalyzingJournal(true);
    setStatus('Analyzing neural intention...');
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: journalText })
      });
      const data = await response.json();
      setJournalResult(data);
      setStatus('Intention mapped to neural targets.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setAnalyzingJournal(false);
    }
  }

  async function handleApplyJournal() {
    if (!journalResult?.mapping?.focusLevel) return;
    // Find a template that matches the focus level or category
    const template = consumerTemplateOptions.find(t => 
      t.id.includes(journalResult.mapping.focusLevel.toLowerCase()) || 
      t.category.toLowerCase().includes(journalResult.mapping.focusLevel.toLowerCase())
    ) || consumerTemplateOptions[0];
    
    setSelectedTemplateId(template.id);
    setActiveTab('studio');
    setStatus(`Intention applied: ${template.title} selected.`);
  }

  async function handleSaveProfile() {
    const data = await authedFetch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileDraft)
    });
    setProfile(data.profile);
    setStatus('Profile updated.');
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <TechGridBackground />
        <Card className="glass p-12 text-center animate-pulse">
          <Radio className="mx-auto size-12 text-cyan-400 mb-6" />
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Initializing Console...</h1>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <TechGridBackground />
      <FrequencyBackground />
      
      <div className="mx-auto flex max-w-[1500px] justify-center">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
          onGenerate={handleGenerate}
        />

        {/* Main Content Area */}
        <main className="min-h-screen w-full border-r border-white/5 md:ml-[275px] md:max-w-[800px] flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4">
            <h1 className="text-2xl font-bold tracking-tight">
              {navItems.find((item) => item.id === activeTab)?.label || 'Workshop'}
            </h1>
          </header>

          <div className="p-6">
            {activeTab === 'studio' && (
              <div className="space-y-8">
                <Card className="glass overflow-hidden border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                  <div className="bg-cyan-500/5 p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-400">Workshop Console</p>
                      <h2 className="text-2xl font-black text-white">{selectedTemplate.title}</h2>
                    </div>
                    <Badge className="bg-cyan-500 text-black font-bold px-3 py-1">
                      {selectedTemplate.shortLabel}
                    </Badge>
                  </div>

                  <Tabs defaultValue="builder" className="p-0">
                    <TabsList className="w-full justify-start rounded-none border-b border-white/5 bg-transparent p-0">
                      <TabsTrigger value="builder" className="rounded-none border-b-2 border-transparent px-8 py-4 data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500/5">Blueprint</TabsTrigger>
                      <TabsTrigger value="stages" className="rounded-none border-b-2 border-transparent px-8 py-4 data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500/5">Stages</TabsTrigger>
                      <TabsTrigger value="result" className="rounded-none border-b-2 border-transparent px-8 py-4 data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500/5">Player</TabsTrigger>
                    </TabsList>

                    <TabsContent value="builder" className="m-0 p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {consumerTemplateOptions.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all hover:bg-white/5 ${
                              selectedTemplateId === template.id 
                                ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                                : 'border-white/5 bg-white/[0.02]'
                            }`}
                            onClick={() => setSelectedTemplateId(template.id)}
                          >
                            <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400/70">{template.category}</span>
                            <strong className="text-sm font-bold text-white">{template.title}</strong>
                            <small className="text-[10px] text-neutral-500 line-clamp-1">{template.useCase}</small>
                          </button>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="stages" className="m-0 p-6">
                      <div className="space-y-4">
                        {selectedSpec.stages.map((stage) => (
                          <div key={stage.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                            <div>
                              <strong className="block text-white">{stage.name}</strong>
                              <span className="text-xs text-neutral-500">{stage.goal}</span>
                            </div>
                            <Badge variant="outline" className="border-white/10 text-neutral-400">
                              {minutes(stage.durationSec)} min · {stage.deltaHz?.from}→{stage.deltaHz?.to} Hz
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="result" className="m-0 p-6">
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        {activeAudio ? (
                          <div className="w-full space-y-8">
                            <div className="relative mx-auto h-48 w-48 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_60px_rgba(6,182,212,0.1)]">
                              <Radio className="size-20 text-cyan-400 animate-pulse" />
                            </div>
                            <audio controls src={activeAudio} className="w-full" />
                            <div className="flex justify-center gap-4">
                              <Button asChild variant="secondary" className="rounded-full px-8">
                                <a href={renderResult?.wav} download>
                                  <Download className="mr-2 size-4" /> WAV
                                </a>
                              </Button>
                              <Button asChild variant="secondary" className="rounded-full px-8">
                                <a href={renderResult?.mp3} download>
                                  <Download className="mr-2 size-4" /> MP3
                                </a>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Radio className="mx-auto size-16 text-neutral-700" />
                            <p className="text-neutral-500">No active render. Use the Synthesis console to begin.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                <div className="grid sm:grid-cols-2 gap-6">
                  <MetalFx preset="chromatic" variant="button" strength={1} borderGlow glowDodge glowColor="#06b6d4">
                    <Card className="glass p-6 group hover:border-cyan-500/30 transition-all h-full">
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-400">Synthesis Engine</p>
                      <h3 className="mt-2 text-xl font-bold text-white">Render Session</h3>
                      <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                        Deploy the full binaural DSP chain to generate your mastered session artifacts.
                      </p>
                      <Button 
                        className="mt-6 w-full rounded-full bg-white text-black font-bold hover:bg-neutral-200" 
                        onClick={handleGenerate} 
                        disabled={rendering}
                      >
                        {rendering ? <Activity className="mr-2 size-4 animate-spin" /> : <Radio className="mr-2 size-4" />}
                        {rendering ? 'Synthesizing...' : 'Generate Artifacts'}
                      </Button>
                    </Card>
                  </MetalFx>

                  <Card className="glass p-6">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-400">Telemetry</p>
                    <h3 className="mt-2 text-xl font-bold text-white">Session Matrix</h3>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/5">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Length</span>
                        <p className="text-xl font-black text-white">{minutes(selectedSpec.lengthSec)}m</p>
                      </div>
                      <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/5">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Base</span>
                        <p className="text-xl font-black text-white">{selectedSpec.baseFreqHz}Hz</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'journal' && (
              <div className="space-y-6">
                <Card className="glass p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-400">Intention Console</p>
                      <h2 className="text-2xl font-black text-white">Neural Journal</h2>
                      <p className="text-sm text-neutral-500">Capture your current state or desired objective to map your session targets.</p>
                    </div>
                    <Edit3 className="size-8 text-cyan-400/50" />
                  </div>

                  <div className="space-y-6">
                    <Textarea 
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      placeholder="I am feeling... I want to achieve... My goal for this session is..."
                      className="min-h-[200px] glass rounded-2xl border-white/10 p-6 text-lg focus-visible:ring-cyan-500/50"
                    />
                    <div className="flex justify-end">
                      <MetalFx preset="chromatic" variant="button" strength={1} borderGlow glowDodge glowColor="#06b6d4">
                        <Button 
                          onClick={handleAnalyzeJournal} 
                          disabled={analyzingJournal || !journalText.trim()}
                          className="rounded-full bg-cyan-500 px-8 font-bold text-black hover:bg-cyan-400"
                        >
                          {analyzingJournal ? <Activity className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
                          Analyze Intention
                        </Button>
                      </MetalFx>
                    </div>
                  </div>
                </Card>

                {journalResult && (
                  <Card className="glass p-8 border-cyan-500/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-400">Analysis Result</p>
                        <h3 className="text-xl font-bold text-white">Extracted Metadata</h3>
                        <div className="space-y-3">
                          <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Intent</span>
                            <p className="text-white font-medium">{journalResult.intent || 'Stable stabilization'}</p>
                          </div>
                          <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Summary</span>
                            <p className="text-white text-sm leading-relaxed">{journalResult.summary}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-400">Neural Mapping</p>
                        <h3 className="text-xl font-bold text-white">Target Parameters</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center rounded-xl bg-cyan-500/5 p-4 border border-cyan-500/20">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Focus Level</span>
                            <Badge className="bg-cyan-500 text-black font-bold">{journalResult.mapping?.focusLevel || 'F10'}</Badge>
                          </div>
                          <div className="flex justify-between items-center rounded-xl bg-cyan-500/5 p-4 border border-cyan-500/20">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Brain State</span>
                            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 uppercase tracking-widest">{journalResult.mapping?.targetState || 'Alpha'}</Badge>
                          </div>
                        </div>
                        <MetalFx preset="chromatic" variant="button" strength={1} borderGlow glowDodge glowColor="#06b6d4">
                          <Button 
                            onClick={handleApplyJournal}
                            className="w-full mt-4 rounded-full bg-white text-black font-bold hover:bg-neutral-200"
                          >
                            <Radio className="mr-2 size-4" /> Apply to Workshop
                          </Button>
                        </MetalFx>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'library' && (
              <div className="grid gap-6">
                {library.map((tone) => (
                  <Card key={tone.id} className="glass group overflow-hidden border-white/5 hover:border-cyan-500/30 transition-all">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 aspect-square bg-cyan-500/10 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-white/5">
                        {tone.cover_image_url ? (
                          <img src={tone.cover_image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <BookAudio className="size-12 text-cyan-400/50" />
                        )}
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-white">{tone.name}</h3>
                            <p className="mt-1 text-sm text-neutral-500">{tone.description || 'No description yet.'}</p>
                          </div>
                          <Badge variant="outline" className="border-white/10 text-[10px] uppercase tracking-widest">
                            {tone.visibility}
                          </Badge>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                          <Button variant="secondary" size="sm" className="rounded-full bg-white/5 hover:bg-white/10" onClick={() => handleShareTone(tone)}>
                            <Share2 className="mr-2 size-3" /> Share
                          </Button>
                          <Button asChild variant="secondary" size="sm" className="rounded-full bg-white/5 hover:bg-white/10">
                            <a href={tone.wav_url || tone.mp3_url || '#'} download>
                              <Download className="mr-2 size-3" /> Get WAV
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-full text-neutral-500 hover:text-red-400 hover:bg-red-400/10" onClick={() => handleDeleteTone(tone)}>
                            <Trash2 className="mr-2 size-3" /> Purge
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {library.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <LibraryIcon className="size-16 text-neutral-800 mb-6" />
                    <h3 className="text-xl font-bold text-white">Archives Empty</h3>
                    <p className="mt-2 text-neutral-500 max-w-sm">No tones committed yet. Return to the Workshop to synthesize your first brain state.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feed' && (
              <div className="space-y-6">
                <Card className="glass p-6">
                  <div className="flex gap-4">
                    <Avatar className="size-12 ring-2 ring-cyan-500/20">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-cyan-500/10 text-cyan-400">ME</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={postBody}
                        onChange={(event) => setPostBody(event.target.value)}
                        placeholder="Broadcast a listening note or protocol update..."
                        className="min-h-[100px] border-none bg-transparent p-0 text-lg focus-visible:ring-0 placeholder:text-neutral-600"
                      />
                      <div className="mt-4 flex justify-between items-center border-t border-white/5 pt-4">
                        <div className="flex gap-2 text-cyan-400">
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-cyan-500/10"><Compass className="size-5" /></Button>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-cyan-500/10"><Radio className="size-5" /></Button>
                        </div>
                        <Button className="rounded-full bg-cyan-500 px-6 font-bold text-black hover:bg-cyan-400" onClick={handleCreatePost}>
                          Broadcast
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="space-y-px bg-white/5 border-x border-white/5">
                  {feed.map((post) => (
                    <div key={post.id} className="bg-black/40 hover:bg-white/[0.02] transition-colors p-6 border-b border-white/5">
                      <div className="flex gap-4">
                        <Avatar className="size-12">
                          <AvatarImage src={post.profiles?.avatar_url || ''} />
                          <AvatarFallback className="bg-neutral-800 text-neutral-400">M</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-white truncate">{post.profiles?.display_name || 'Member'}</strong>
                            <span className="text-neutral-500 text-sm truncate">@{post.profiles?.username || 'member'}</span>
                            <span className="text-neutral-600 text-sm">· {post.post_type}</span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-neutral-300 leading-relaxed">{post.body}</p>
                          
                          {post.saved_tones && (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden group/tone">
                              <div className="flex">
                                <div className="h-24 w-24 bg-cyan-500/10 flex items-center justify-center border-r border-white/5">
                                  {post.saved_tones.cover_image_url ? 
                                    <img src={post.saved_tones.cover_image_url} alt="" className="h-full w-full object-cover" /> : 
                                    <Play className="size-8 text-cyan-400/30" />
                                  }
                                </div>
                                <div className="flex-1 p-4">
                                  <h4 className="font-bold text-white text-sm">{post.saved_tones.name}</h4>
                                  <p className="text-xs text-neutral-500 line-clamp-1 mt-1">{post.saved_tones.description}</p>
                                  {(post.saved_tones.wav_url || post.saved_tones.mp3_url) && (
                                    <audio className="mt-3 w-full h-8 scale-90 -ml-[5%]" controls src={post.saved_tones.wav_url || post.saved_tones.mp3_url} />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex gap-8 text-neutral-500">
                            <button className="flex items-center gap-2 text-sm hover:text-cyan-400 transition-colors">
                              <MessageCircle className="size-4" /> {post.comment_count}
                            </button>
                            <button className="flex items-center gap-2 text-sm hover:text-pink-500 transition-colors">
                              <Heart className="size-4" /> {post.like_count}
                            </button>
                            <button className="flex items-center gap-2 text-sm hover:text-cyan-400 transition-colors">
                              <Share2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <Card className="glass p-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <Activity className="size-10 text-cyan-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white">Neural Telemetry</h2>
                  <p className="mt-4 mx-auto max-w-md text-neutral-500 leading-relaxed">
                    Real-time session logging and detailed brain-state effectiveness metrics are being calibrated for your profile.
                  </p>
                  <Button variant="outline" className="mt-8 rounded-full border-white/10 hover:bg-white/5">
                    View Raw Logs
                  </Button>
                </Card>
              </div>
            )}

            {activeTab === 'profile' && (
              <Card className="glass p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-white">Member Identity</h2>
                    <p className="text-sm text-neutral-500">Update your presence in the global neural network.</p>
                  </div>
                  <Avatar className="size-20 ring-4 ring-cyan-500/20">
                    <AvatarImage src={profileDraft.avatar_url || ''} />
                    <AvatarFallback className="text-2xl">M</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 ml-1">Display Name</label>
                    <Input className="glass rounded-xl border-white/10 focus:border-cyan-500/50" placeholder="Display name" value={profileDraft.display_name || ''} onChange={(event) => setProfileDraft({ ...profileDraft, display_name: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 ml-1">Handle</label>
                    <Input className="glass rounded-xl border-white/10 focus:border-cyan-500/50" placeholder="Username" value={profileDraft.username || ''} onChange={(event) => setProfileDraft({ ...profileDraft, username: event.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 ml-1">Bio</label>
                    <Textarea className="glass rounded-xl border-white/10 focus:border-cyan-500/50 min-h-[100px]" placeholder="Profile bio..." value={profileDraft.bio || ''} onChange={(event) => setProfileDraft({ ...profileDraft, bio: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 ml-1">Avatar Source</label>
                    <Input className="glass rounded-xl border-white/10 focus:border-cyan-500/50" placeholder="URL" value={profileDraft.avatar_url || ''} onChange={(event) => setProfileDraft({ ...profileDraft, avatar_url: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 ml-1">Neural Node (X)</label>
                    <Input className="glass rounded-xl border-white/10 focus:border-cyan-500/50" placeholder="X URL" value={profileDraft.x_url || ''} onChange={(event) => setProfileDraft({ ...profileDraft, x_url: event.target.value })} />
                  </div>
                </div>
                
                <Button className="mt-10 w-full rounded-full bg-cyan-500 text-black font-bold hover:bg-cyan-400 py-6" onClick={handleSaveProfile}>
                  Commit Changes
                </Button>
              </Card>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card className="glass p-8">
                  <h2 className="text-2xl font-black text-white">Console Configuration</h2>
                  <p className="text-sm text-neutral-500 mb-8">Adjust safety protocols and account defaults.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="font-bold text-white">Profile Visibility</p>
                        <p className="text-xs text-neutral-500">Determine who can see your neural archives.</p>
                      </div>
                      <Select value={profileDraft.profile_visibility || 'public'} className="bg-black border-white/10 text-sm rounded-lg" onChange={(event) => setProfileDraft({ ...profileDraft, profile_visibility: event.target.value })}>
                        <option value="public">Public</option>
                        <option value="members">Members</option>
                        <option value="private">Private</option>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50">
                      <div>
                        <p className="font-bold text-white">Mastering Chain</p>
                        <p className="text-xs text-neutral-500">Enable premium mastering for all renders.</p>
                      </div>
                      <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">Premium Only</Badge>
                    </div>

                    <Separator className="bg-white/5" />

                    <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full" onClick={handleLogout}>
                      <LogOut className="mr-2 size-4" /> Terminate Session
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="fixed right-0 top-0 hidden h-screen w-[350px] flex-col gap-6 p-6 xl:flex border-l border-white/5 bg-black/20 backdrop-blur-md">
          <div className="glass p-6 rounded-3xl border-cyan-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Search className="size-4 text-cyan-400" />
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-400">Status Console</p>
            </div>
            <p className="text-sm text-neutral-400 font-medium leading-relaxed italic">
              &quot;{status}&quot;
            </p>
          </div>

          <Card className="glass p-6 rounded-3xl">
            <h3 className="text-lg font-black text-white mb-4">Trending Tones</h3>
            <div className="space-y-4">
              {[
                { name: 'Ethereal Projection', handle: 'v4.2', users: '1.2k' },
                { name: 'Deep Alpha Drift', handle: 'theta-mix', users: '842' },
                { name: 'Gateway Focus 12', handle: 'official', users: '2.1k' }
              ].map((trend, i) => (
                <div key={i} className="group cursor-pointer">
                  <p className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Protocol · Trending</p>
                  <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">{trend.name}</p>
                  <p className="text-xs text-neutral-500">{trend.users} neural links</p>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-cyan-400 text-xs hover:bg-cyan-400/10 rounded-full">Show More</Button>
          </Card>

          <Card className="glass p-6 rounded-3xl">
            <h3 className="text-lg font-black text-white mb-4">Neural Nodes</h3>
            <div className="space-y-4">
              {[
                { name: 'Dr. Monroe', handle: 'gateway_arch', active: true },
                { name: 'Alpha Entity', handle: 'oscillator', active: false },
                { name: 'Neural Drifter', handle: 'drift_master', active: true }
              ].map((node, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-neutral-800 text-xs">A{i}</AvatarFallback>
                      </Avatar>
                      {node.active && <div className="absolute bottom-0 right-0 size-3 rounded-full bg-cyan-500 border-2 border-black" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[120px]">{node.name}</p>
                      <p className="text-xs text-neutral-500 truncate max-w-[120px]">@{node.handle}</p>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-full bg-white text-black font-bold text-[10px] h-8 px-4 hover:bg-neutral-200">Connect</Button>
                </div>
              ))}
            </div>
          </Card>

          <footer className="mt-auto px-4 pb-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-neutral-600 font-bold uppercase tracking-[0.1em]">
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Safety</a>
              <a href="#" className="hover:underline">© 2027 Astral Architect</a>
            </div>
          </footer>
        </aside>
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="glass border-white/10 bg-black/90 backdrop-blur-2xl text-white sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-cyan-400">Save Neural Artifact</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Commit this synthesized brain state to your neural archives for future deployment.
            </DialogDescription>
          </DialogHeader>
          {toneDraft && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 ml-1">Artifact Name</label>
                <Input className="glass rounded-xl border-white/10" value={toneDraft.name} onChange={(event) => setToneDraft({ ...toneDraft, name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 ml-1">Protocol Description</label>
                <Textarea className="glass rounded-xl border-white/10" value={toneDraft.description} onChange={(event) => setToneDraft({ ...toneDraft, description: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 ml-1">Visibility Protocol</label>
                <Select className="glass w-full rounded-xl border-white/10" value={toneDraft.visibility} onChange={(event) => setToneDraft({ ...toneDraft, visibility: event.target.value })}>
                  <option value="private">Private (Restricted)</option>
                  <option value="unlisted">Unlisted (Neural Link Only)</option>
                  <option value="public">Public (Global Feed)</option>
                </Select>
              </div>
              <Button className="w-full mt-4 rounded-full bg-cyan-500 text-black font-black py-6 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-all" onClick={handleSaveTone}>
                COMMIT TO ARCHIVE
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
