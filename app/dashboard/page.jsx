'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  User,
  Sparkles,
  Loader2,
  Hammer
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { authedFetch } from '@/lib/frontend/api';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Omnibar } from '@/components/agent/Omnibar';
import { LibraryPlayer } from '@/components/audio/LibraryPlayer';

const navItems = [
  { id: 'agent', label: 'Agentic', icon: Sparkles },
  { id: 'library', label: 'Library', icon: LibraryIcon },
  { id: 'workshop', label: 'Workshop', icon: Hammer },
  { id: 'feed', label: 'Feed', icon: Compass },
  { id: 'journal', label: 'Journal', icon: Edit3 },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings }
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

  async function refreshWorkspace() {
    try {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="size-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 sticky top-0 h-screen bg-black/40 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="size-10 rounded-xl bg-white flex items-center justify-center text-black font-black">H</div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">HemiSync</h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Agentic v1.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                  isActive ? 'bg-white/5 text-white font-medium border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`size-5 ${isActive ? 'text-cyan-400' : ''}`} />
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
            <button className="text-white/20 hover:text-white transition-colors">
              <Settings className="size-4" />
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
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {library.map((tone) => (
                  <Card key={tone.id} className="bg-zinc-900/40 border-white/5 backdrop-blur-xl p-6 rounded-3xl group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{tone.target_state}</p>
                          {tone.source_type === 'audiotemplate' && (
                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-300">
                              Preview
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium">{tone.name}</h3>
                      </div>
                      <button className="text-white/20 group-hover:text-white transition-colors">
                        <MoreHorizontal className="size-5" />
                      </button>
                    </div>
                    <div className="mt-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-white/40">{Math.floor((tone.duration_sec || 0) / 60)}m · {tone.base_freq_hz}Hz</span>
                          {tone.mode_label && (
                            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/20 mt-1">{tone.mode_label}</span>
                          )}
                          {profile?.subscription_tier !== 'none' && (
                              <button className="text-[10px] text-cyan-400 hover:text-cyan-300 mt-1 flex items-center gap-1">
                                  <Download className="size-3" /> Export Audio
                              </button>
                          )}
                        </div>
                        <button className="size-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">
                          <Play className="size-4 fill-current" />
                        </button>
                      </div>

                      {tone.mp3_url && (
                        <audio controls src={tone.mp3_url} className="w-full h-8 opacity-90" preload="none" />
                      )}
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}

            {activeTab === 'feed' && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {feed.map((post) => (
                  <Card key={post.id} className="bg-zinc-900/40 border-white/5 backdrop-blur-xl p-6 rounded-3xl">
                    <div className="flex gap-4">
                      <Avatar className="size-10">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>M</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{post.profiles?.display_name || 'Member'}</span>
                          <span className="text-[10px] font-mono text-white/40">@{post.profiles?.username || 'user'}</span>
                        </div>
                        <p className="mt-2 text-white/70 text-sm leading-relaxed">{post.body}</p>
                        
                        {post.saved_tones && (
                          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                            <div className="size-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                              <Radio className="size-6" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium">{post.saved_tones.name}</p>
                              <p className="text-[10px] text-white/40">{post.saved_tones.target_state}</p>
                            </div>
                            <button className="size-8 rounded-full bg-white text-black flex items-center justify-center">
                              <Play className="size-4 fill-current" />
                            </button>
                          </div>
                        )}

                        <div className="mt-4 flex gap-6 text-white/20">
                          <button className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">
                            <MessageCircle className="size-4" /> {post.comment_count}
                          </button>
                          <button className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">
                            <Heart className="size-4" /> {post.like_count}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}

            {/* Placeholder for other tabs */}
            {['workshop', 'journal', 'profile', 'settings'].includes(activeTab) && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <Activity className="size-12 text-white/10 mb-6" />
                <h3 className="text-xl font-light text-white/60">Module calibration in progress</h3>
                <p className="text-sm text-white/30 mt-2">The agentic redesign is being applied to this neural node.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
