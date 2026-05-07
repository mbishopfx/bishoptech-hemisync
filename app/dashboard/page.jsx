'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BookAudio,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Heart,
  Library,
  LogOut,
  MessageCircle,
  Play,
  Plus,
  Radio,
  Rss,
  Settings,
  Share2,
  SlidersHorizontal,
  Trash2,
  User
} from 'lucide-react';
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
import { buildTemplateSessionSpec, consumerTemplateOptions } from '../generate/chatspec';
import { TonePlayer } from '@/components/audio/TonePlayer';

const navItems = [
  { id: 'studio', label: 'Studio', icon: SlidersHorizontal },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'feed', label: 'Feed', icon: Rss },
  { id: 'sessions', label: 'Sessions', icon: Activity },
  { id: 'journal', label: 'Journal', icon: Edit3 },
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

function Sidebar({ activeTab, collapsed, setActiveTab, setCollapsed, profile }) {
  return (
    <aside className={`platform-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="platform-sidebar__brand">
        <div className="brand-mark">HS</div>
        {!collapsed && (
          <div>
            <strong>HemiSync</strong>
            <span>Member Platform</span>
          </div>
        )}
      </div>

      <TooltipProvider delayDuration={120}>
        <nav className="platform-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const button = (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? 'active' : ''}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="size-5" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );

            return collapsed ? (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              button
            );
          })}
        </nav>
      </TooltipProvider>

      <div className="mt-auto flex flex-col gap-3">
        <button type="button" className="sidebar-collapse" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <div className="platform-sidebar__profile">
          <Avatar>
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback>{(profile?.display_name || profile?.email || 'M').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div>
              <strong>{profile?.display_name || 'Member'}</strong>
              <span>@{profile?.username || 'new-member'}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('studio');
  const [profile, setProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState({});
  const [library, setLibrary] = useState([]);
  const [feed, setFeed] = useState([]);
  const [journals, setJournals] = useState([]);
  const [status, setStatus] = useState('Loading member workspace...');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(consumerTemplateOptions[0].id);
  const [renderResult, setRenderResult] = useState(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [toneDraft, setToneDraft] = useState(null);
  const [postBody, setPostBody] = useState('');
  const [journalBody, setJournalBody] = useState('');

  const selectedTemplate = useMemo(
    () => consumerTemplateOptions.find((template) => template.id === selectedTemplateId) || consumerTemplateOptions[0],
    [selectedTemplateId]
  );

  const selectedSpec = useMemo(() => buildTemplateSessionSpec(selectedTemplate), [selectedTemplate]);
  const activeAudio = renderResult?.webm || renderResult?.wav || library[0]?.webm_url || library[0]?.mp3_url || library[0]?.wav_url || null;

  async function refreshWorkspace() {
    const [profileData, libraryData, feedData, journalData] = await Promise.all([
      authedFetch('/api/profile'),
      authedFetch('/api/library'),
      authedFetch('/api/feed'),
      authedFetch('/api/journal')
    ]);

    setProfile(profileData.profile);
    setProfileDraft(profileData.profile || {});
    setLibrary(libraryData.tones || []);
    setFeed(feedData.posts || []);
    setJournals(journalData.entries || []);
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
          setStatus('Workspace ready.');
        }
      } catch (error) {
        if (mounted) {
          setStatus(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
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
    setStatus(`Rendering ${selectedTemplate.title}...`);

    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRenderPayload(selectedSpec))
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Render failed');
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
      setStatus('Render complete. Save it to your library or download it now.');
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
    setStatus('Tone saved to your library.');
  }

  async function handleShareTone(tone) {
    const data = await authedFetch(`/api/library/tones/${tone.id}/share`, {
      method: 'POST',
      body: JSON.stringify({ body: tone.description || `Shared ${tone.name}` })
    });
    setFeed((prev) => [data.post, ...prev]);
    setLibrary((prev) => prev.map((item) => (item.id === tone.id ? { ...item, visibility: 'public' } : item)));
    setActiveTab('feed');
    setStatus('Tone shared to the Feed.');
  }

  async function handleDeleteTone(tone) {
    await authedFetch(`/api/library/tones/${tone.id}`, { method: 'DELETE' });
    setLibrary((prev) => prev.filter((item) => item.id !== tone.id));
    setStatus('Tone removed from your library.');
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

  async function handleCreateJournal() {
    if (!journalBody.trim()) return;
    setStatus('Analyzing journal entry...');
    try {
      const data = await authedFetch('/api/journal', {
        method: 'POST',
        body: JSON.stringify({ text: journalBody.trim() })
      });
      setJournalBody('');
      setJournals((prev) => [data.journal_entry, ...prev]);
      setStatus('Journal entry saved and analyzed.');
    } catch (error) {
      setStatus('Failed to save journal: ' + error.message);
    }
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
      <main className="platform-loading">
        <Card className="p-8">
          <p className="section-label">Loading</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Preparing the member backend...</h1>
        </Card>
      </main>
    );
  }

  return (
    <main className="platform-shell">
      <Sidebar
        activeTab={activeTab}
        collapsed={collapsed}
        setActiveTab={setActiveTab}
        setCollapsed={setCollapsed}
        profile={profile}
      />

      <section className="platform-main">
        <header className="platform-topbar">
          <div>
            <p className="section-label">{activeTab}</p>
            <h1>{navItems.find((item) => item.id === activeTab)?.label || 'Studio'}</h1>
          </div>
          <div className="platform-status">
            <span>{status}</span>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 size-4" /> Log Out
            </Button>
          </div>
        </header>

        {activeTab === 'studio' && (
          <div className="dashboard-grid">
            <Card className="workspace-panel p-0">
              <div className="workspace-panel__header">
                <div>
                  <p className="section-label">Active Session Window</p>
                  <h2>{selectedTemplate.title}</h2>
                </div>
                <Badge variant="science">{selectedTemplate.shortLabel}</Badge>
              </div>

              <Tabs defaultValue="builder" className="p-5">
                <TabsList>
                  <TabsTrigger value="builder">Builder</TabsTrigger>
                  <TabsTrigger value="stages">Stages</TabsTrigger>
                  <TabsTrigger value="result">Player</TabsTrigger>
                </TabsList>

                <TabsContent value="builder">
                  <div className="studio-template-grid">
                    {consumerTemplateOptions.slice(0, 12).map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        className={selectedTemplateId === template.id ? 'active' : ''}
                        onClick={() => setSelectedTemplateId(template.id)}
                      >
                        <span>{template.category}</span>
                        <strong>{template.title}</strong>
                        <small>{template.useCase}</small>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="stages">
                  <div className="stage-list">
                    {selectedSpec.stages.map((stage) => (
                      <div key={stage.id} className="stage-row">
                        <div>
                          <strong>{stage.name}</strong>
                          <span>{stage.goal}</span>
                        </div>
                        <Badge variant="muted">
                          {minutes(stage.durationSec)} min · {stage.deltaHz?.from}→{stage.deltaHz?.to} Hz
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="result">
                  <div className="player-window">
                    {activeAudio ? (
                      <>
                        <audio controls src={activeAudio} className="w-full" />
                        <TonePlayer spec={selectedSpec} />
                      </>
                    ) : (
                      <p>No render loaded yet. Generate a full session to open the player.</p>
                    )}
                    {renderResult && (
                      <div className="flex flex-wrap gap-3">
                        <Button asChild variant="secondary">
                          <a href={renderResult.wav} download>
                            <Download className="mr-2 size-4" /> WAV
                          </a>
                        </Button>
                        {renderResult.webm && (
                          <Button asChild variant="secondary">
                            <a href={renderResult.webm} download>
                              <Download className="mr-2 size-4" /> WEBM
                            </a>
                          </Button>
                        )}
                        {renderResult.mp3 && (
                          <Button asChild variant="secondary">
                            <a href={renderResult.mp3} download>
                              <Download className="mr-2 size-4" /> MP3
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            <div className="side-stack">
              <Card className="p-6">
                <p className="section-label">Render Control</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Mastered stereo output</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  Full render uses the existing binaural engine, stage blueprint, breath layer, background, and mastering chain.
                </p>
                <Button className="mt-5 w-full" onClick={handleGenerate} disabled={rendering}>
                  <Radio className="mr-2 size-4" /> {rendering ? 'Rendering...' : 'Render Full Session'}
                </Button>
              </Card>

              <Card className="p-6">
                <p className="section-label">Tone Effectiveness</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Deterministic v1 score</h3>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="metric-tile">
                    <span>Duration</span>
                    <strong>{minutes(selectedSpec.lengthSec)}m</strong>
                  </div>
                  <div className="metric-tile">
                    <span>Carrier</span>
                    <strong>{selectedSpec.baseFreqHz}Hz</strong>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="content-grid">
            {library.map((tone) => (
              <Card key={tone.id} className="tone-card p-0">
                <div className="tone-cover">
                  {tone.cover_image_url ? <img src={tone.cover_image_url} alt="" /> : <BookAudio className="size-10" />}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3>{tone.name}</h3>
                      <p>{tone.description || 'No description yet.'}</p>
                    </div>
                    <Badge variant={tone.visibility === 'public' ? 'science' : 'muted'}>{tone.visibility}</Badge>
                  </div>
                  {(tone.webm_url || tone.wav_url || tone.mp3_url) && <audio controls className="mt-4 w-full" src={tone.webm_url || tone.wav_url || tone.mp3_url} />}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => handleShareTone(tone)}>
                      <Share2 className="mr-2 size-4" /> Share
                    </Button>
                    <Button asChild variant="secondary">
                      <a href={tone.webm_url || tone.wav_url || tone.mp3_url || '#'} download>
                        <Download className="mr-2 size-4" /> Download
                      </a>
                    </Button>
                    <Button variant="ghost" onClick={() => handleDeleteTone(tone)}>
                      <Trash2 className="mr-2 size-4" /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {library.length === 0 && (
              <Card className="empty-panel">
                <Library className="size-8" />
                <h3>No saved tones yet</h3>
                <p>Render a full session in Studio, then save it with a name, image, and description.</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="feed-layout">
            <Card className="p-5">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>{(profile?.display_name || 'ME').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={postBody}
                    onChange={(event) => setPostBody(event.target.value)}
                    placeholder="Post an update, listening note, or protocol idea..."
                  />
                  <div className="mt-3 flex justify-end">
                    <Button onClick={handleCreatePost}>
                      <Plus className="mr-2 size-4" /> Post
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {feed.map((post) => (
              <Card key={post.id} className="feed-post p-5">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={post.profiles?.avatar_url || ''} />
                    <AvatarFallback>{(post.profiles?.display_name || 'M').slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong>{post.profiles?.display_name || 'Member'}</strong>
                      <span>@{post.profiles?.username || 'member'}</span>
                      <Badge variant="muted">{post.post_type}</Badge>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/72">{post.body}</p>
                    {post.saved_tones && (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="flex gap-4">
                          <div className="tone-thumb">
                            {post.saved_tones.cover_image_url ? <img src={post.saved_tones.cover_image_url} alt="" /> : <Play className="size-5" />}
                          </div>
                          <div className="flex-1">
                            <h4>{post.saved_tones.name}</h4>
                            <p>{post.saved_tones.description}</p>
                            {(post.saved_tones.webm_url || post.saved_tones.wav_url || post.saved_tones.mp3_url) && (
                              <audio className="mt-3 w-full" controls src={post.saved_tones.webm_url || post.saved_tones.wav_url || post.saved_tones.mp3_url} />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex gap-4 text-sm text-white/52">
                      <span className="inline-flex items-center gap-1"><Heart className="size-4" /> {post.like_count}</span>
                      <span className="inline-flex items-center gap-1"><MessageCircle className="size-4" /> {post.comment_count}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'sessions' && (
          <Card className="p-7">
            <p className="section-label">Session Log</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Active session history is ready for expansion.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
              The backend already records `session_logs`, generated renders, saved tones, and feed shares. This tab is the operator surface for detailed listening history and future analytics.
            </p>
          </Card>
        )}

        {activeTab === 'journal' && (
          <div className="feed-layout">
            <Card className="p-5">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>{(profile?.display_name || 'ME').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={journalBody}
                    onChange={(event) => setJournalBody(event.target.value)}
                    placeholder="Log your thoughts, emotional state, or experiences after a session..."
                  />
                  <div className="mt-3 flex justify-end">
                    <Button onClick={handleCreateJournal}>
                      <Edit3 className="mr-2 size-4" /> Save Journal
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {journals.map((journal) => (
              <Card key={journal.id} className="feed-post p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{new Date(journal.created_at).toLocaleDateString()}</strong>
                    <Badge variant="muted">{journal.intent}</Badge>
                    <Badge variant={journal.sentiment?.includes('positive') ? 'science' : 'muted'}>{journal.sentiment}</Badge>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/72">{journal.text}</p>
                  
                  {(journal.cognitive_shifts || journal.ai_insights) && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                      <div className="flex flex-col gap-2">
                        {journal.cognitive_shifts && (
                          <div>
                            <span className="text-xs font-semibold text-white/50 uppercase">Cognitive Shifts</span>
                            <p className="text-sm text-white/80">{journal.cognitive_shifts}</p>
                          </div>
                        )}
                        {journal.ai_insights && (
                          <div className={journal.cognitive_shifts ? "mt-2" : ""}>
                            <span className="text-xs font-semibold text-white/50 uppercase">AI Insights</span>
                            <p className="text-sm text-white/80">
                              {typeof journal.ai_insights === 'string' ? journal.ai_insights : JSON.stringify(journal.ai_insights)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {journal.summary && (
                    <div className="mt-4 flex gap-4 text-sm text-white/52 italic">
                      &quot; {journal.summary} &quot;
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <Card className="profile-editor p-7">
            <div>
              <p className="section-label">Profile</p>
              <h2>Edit member profile</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Display name" value={profileDraft.display_name || ''} onChange={(event) => setProfileDraft({ ...profileDraft, display_name: event.target.value })} />
              <Input placeholder="Username" value={profileDraft.username || ''} onChange={(event) => setProfileDraft({ ...profileDraft, username: event.target.value })} />
              <Input placeholder="Avatar URL" value={profileDraft.avatar_url || ''} onChange={(event) => setProfileDraft({ ...profileDraft, avatar_url: event.target.value })} />
              <Input placeholder="Website URL" value={profileDraft.website_url || ''} onChange={(event) => setProfileDraft({ ...profileDraft, website_url: event.target.value })} />
              <Input placeholder="X URL" value={profileDraft.x_url || ''} onChange={(event) => setProfileDraft({ ...profileDraft, x_url: event.target.value })} />
              <Input placeholder="Instagram URL" value={profileDraft.instagram_url || ''} onChange={(event) => setProfileDraft({ ...profileDraft, instagram_url: event.target.value })} />
            </div>
            <Textarea placeholder="Bio" value={profileDraft.bio || ''} onChange={(event) => setProfileDraft({ ...profileDraft, bio: event.target.value })} />
            <Button onClick={handleSaveProfile}>
              <Edit3 className="mr-2 size-4" /> Save Profile
            </Button>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className="p-7">
            <p className="section-label">Settings</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Safety and account defaults</h2>
            <Separator className="my-5" />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Profile visibility
                <Select value={profileDraft.profile_visibility || 'public'} onChange={(event) => setProfileDraft({ ...profileDraft, profile_visibility: event.target.value })}>
                  <option value="public">Public</option>
                  <option value="members">Members</option>
                  <option value="private">Private</option>
                </Select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Default tone visibility
                <Select disabled value="private">
                  <option value="private">Private until shared</option>
                </Select>
              </label>
            </div>
          </Card>
        )}
      </section>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save generated tone</DialogTitle>
            <DialogDescription>
              Add member-facing metadata before storing this render in your library.
            </DialogDescription>
          </DialogHeader>
          {toneDraft && (
            <div className="mt-5 flex flex-col gap-4">
              <Input value={toneDraft.name} onChange={(event) => setToneDraft({ ...toneDraft, name: event.target.value })} />
              <Textarea value={toneDraft.description} onChange={(event) => setToneDraft({ ...toneDraft, description: event.target.value })} />
              <Input
                placeholder="Cover image URL"
                value={toneDraft.coverImageUrl}
                onChange={(event) => setToneDraft({ ...toneDraft, coverImageUrl: event.target.value })}
              />
              <Select value={toneDraft.visibility} onChange={(event) => setToneDraft({ ...toneDraft, visibility: event.target.value })}>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="public">Public</option>
              </Select>
              <Button onClick={handleSaveTone}>Save to Library</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
