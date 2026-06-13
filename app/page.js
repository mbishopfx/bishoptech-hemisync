'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Omnibar } from '@/components/agent/Omnibar';
import { AgenticAuthModal } from '@/components/auth/AgenticAuthModal';
import { PublicHeader } from '@/components/layout/PublicHeader';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { isHomepageGeneratedTone, HOMEPAGE_STATE_TONES } from '@/lib/audio/homepage-tones';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [agentMessage, setAgentMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showPreviewToneButton, setShowPreviewToneButton] = useState(true);
  const [currentPreviewTone, setCurrentPreviewTone] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const [playingToneId, setPlayingToneId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadSavedHomepageTone = () => {
    const saved = localStorage.getItem('active-preview-tone');
    if (!saved) {
      return null;
    }

    try {
      const parsed = JSON.parse(saved);
      return isHomepageGeneratedTone(parsed) ? parsed : null;
    } catch (error) {
      return null;
    }
  };

  // Load preview data on homepage mount
  useEffect(() => {
    let cancelled = false;

    async function loadPreviewTone() {
      try {
        const response = await fetch('/api/audio/preview-tone', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !data.ok || cancelled) {
          const savedTone = loadSavedHomepageTone();
          if (savedTone && !cancelled) {
            setCurrentPreviewTone(savedTone);
          } else if (!cancelled) {
            setCurrentPreviewTone(HOMEPAGE_STATE_TONES[1]); // Default to Alpha Focus
          }
          return;
        }
        if (data.tone && !cancelled) {
          setCurrentPreviewTone(data.tone);
          localStorage.setItem('active-preview-tone', JSON.stringify(data.tone));
        }
      } catch (error) {
        console.error('Failed to load featured preview tone:', error);
        const savedTone = loadSavedHomepageTone();
        if (savedTone && !cancelled) {
          setCurrentPreviewTone(savedTone);
        } else if (!cancelled) {
          setCurrentPreviewTone(HOMEPAGE_STATE_TONES[1]); // Default to Alpha Focus
        }
      }
    }

    loadPreviewTone();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeState = currentPreviewTone?.state || 'alpha';

  const stateConfig = {
    theta: {
      accentClass: 'text-purple-400',
      borderClass: 'border-purple-500/20',
      shadowClass: 'shadow-[0_0_50px_rgba(168,85,247,0.05)]',
      waveClass: 'bg-purple-500',
      glowDot: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
    },
    alpha: {
      accentClass: 'text-cyan-400',
      borderClass: 'border-cyan-500/20',
      shadowClass: 'shadow-[0_0_50px_rgba(6,182,212,0.05)]',
      waveClass: 'bg-cyan-500',
      glowDot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
    },
    delta: {
      accentClass: 'text-blue-400',
      borderClass: 'border-blue-500/20',
      shadowClass: 'shadow-[0_0_50px_rgba(59,130,246,0.05)]',
      waveClass: 'bg-blue-500',
      glowDot: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
    },
    beta: {
      accentClass: 'text-rose-400',
      borderClass: 'border-rose-500/20',
      shadowClass: 'shadow-[0_0_50px_rgba(244,63,94,0.05)]',
      waveClass: 'bg-rose-500',
      glowDot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
    },
    gamma: {
      accentClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/20',
      shadowClass: 'shadow-[0_0_50px_rgba(16,185,129,0.05)]',
      waveClass: 'bg-emerald-500',
      glowDot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
    }
  };

  const currentConfig = stateConfig[activeState] || stateConfig.alpha;

  // Mood generation handler
  const handleGenerate = async (mood) => {
    setIsLoading(true);
    setAgentMessage('');
    
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'AUTH_REQUIRED') {
          setIsAuthModalOpen(true);
        } else {
          console.error(data.error);
        }
        return;
      }

      setAgentMessage(data.agentMessage);
      setShowPreviewToneButton(true);
      
      // Reset active playback
      audioRef.current?.pause();
      setIsPlaying(false);
      
      const track = data.track || null;
      setCurrentPreviewTone(track);
      if (track) {
        localStorage.setItem('active-preview-tone', JSON.stringify(track));
      }
    } catch (err) {
      console.error('Failed to connect to agent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Symmetrical Playback Coordinator
  const handlePlayTone = (tone) => {
    const url = tone?.webmUrl || tone?.wavUrl || tone?.mp3Url || tone?.webm_url || tone?.wav_url || tone?.mp3_url || tone?.playUrl;
    if (!url) return;

    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (playingToneId === tone.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error('Acoustic playback failed:', err));
      }
    } else {
      audio.pause();
      audio.src = url;
      audio.load();
      setPlayingToneId(tone.id);
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Acoustic playback failed:', err);
          setIsPlaying(false);
        });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <PublicHeader />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      {/* Main Content */}
      <main className="pt-40 pb-20 px-6 relative z-10 flex flex-col items-center gap-20 max-w-7xl mx-auto">
        {/* Hero Copy */}
        <div className="text-center space-y-6 max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-white"
          >
            Cognitive <span className="text-white/20 italic">Orchestration</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/40 text-xl md:text-2xl font-light tracking-tight max-w-xl mx-auto leading-relaxed"
          >
            Describe your current state. Our agent will match you to a precision frequency to shift your cognitive baseline.
          </motion.p>
        </div>

        {/* Omnibar & Player Panel */}
        <div className="w-full flex flex-col items-center gap-12">
          <Omnibar 
            onGenerate={handleGenerate} 
            isLoading={isLoading} 
            agentMessage={agentMessage}
          />

          {currentPreviewTone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xl mx-auto z-10 relative"
            >
              <div className={`w-full bg-zinc-900/40 border backdrop-blur-3xl p-8 rounded-3xl space-y-6 flex flex-col justify-between transition-all duration-500 ${currentConfig.borderClass} ${currentConfig.shadowClass}`}>
                <div className="space-y-6">
                  {/* Dropdown selector & Status */}
                  <div className="text-center space-y-4">
                    <div className="flex flex-col items-center gap-3">
                      <p className={`font-mono text-[9px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 ${currentConfig.accentClass}`}>
                        <span className={`animate-pulse size-1.5 rounded-full ${currentConfig.glowDot}`} />
                        {currentPreviewTone.state || 'Stereo'} State Active
                      </p>
                      
                      <select
                        value={currentPreviewTone?.id || ''}
                        onChange={(e) => {
                          const selected = HOMEPAGE_STATE_TONES.find(t => t.id === e.target.value);
                          if (selected) {
                            setCurrentPreviewTone(selected);
                            // Save to localStorage
                            localStorage.setItem('active-preview-tone', JSON.stringify(selected));
                            // Reset playback if switching
                            if (playingToneId !== selected.id) {
                              audioRef.current?.pause();
                              setIsPlaying(false);
                            }
                          }
                        }}
                        className={`bg-zinc-950/80 border text-[10px] font-mono uppercase tracking-widest focus:outline-none cursor-pointer rounded-full px-4 py-2 transition-colors ${
                          activeState === 'theta' ? 'border-purple-500/30 text-purple-300' :
                          activeState === 'alpha' ? 'border-cyan-500/30 text-cyan-300' :
                          activeState === 'delta' ? 'border-blue-500/30 text-blue-300' :
                          activeState === 'beta' ? 'border-rose-500/30 text-rose-300' :
                          'border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {HOMEPAGE_STATE_TONES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.state.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h3 className="text-white text-xl font-medium leading-snug">{currentPreviewTone.name}</h3>
                      <p className="text-white/40 text-xs mt-1">
                        {currentPreviewTone.targetHz ? `${currentPreviewTone.targetHz}Hz` : 'Dynamic'} Pure Binaural Tone
                      </p>
                      <p className="mt-2 text-[9px] font-mono uppercase tracking-[0.35em] text-white/25">
                        {currentPreviewTone.summary || 'Pure entrainment state tone'}
                      </p>
                    </div>
                  </div>

                  {/* Audio Wave Visualizer */}
                  {playingToneId === currentPreviewTone.id && isPlaying && (
                    <div className="h-10 flex items-center justify-center gap-1 bg-black/40 rounded-xl px-4 border border-white/5">
                      {Array.from({ length: 16 }).map((_, waveIdx) => (
                        <motion.div
                          key={waveIdx}
                          animate={{ height: [6, 24, 6] }}
                          transition={{ 
                            duration: 0.5 + Math.random() * 0.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: waveIdx * 0.04
                          }}
                          className={`w-1 rounded-full ${currentConfig.waveClass}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Progress bar updates */}
                  <div className="flex flex-col gap-2">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                      <motion.div 
                        className={`absolute inset-y-0 left-0 shadow-[0_0_10px_rgba(255,255,255,0.5)] ${currentConfig.waveClass}`}
                        style={{ width: `${playingToneId === currentPreviewTone.id ? (duration ? (currentTime / duration) * 100 : 0) : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-white/30 uppercase tracking-widest">
                      <span>{playingToneId === currentPreviewTone.id ? formatTime(currentTime) : '0:00'}</span>
                      <span>{playingToneId === currentPreviewTone.id ? formatTime(duration) : '0:00'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlayTone(currentPreviewTone)}
                      type="button"
                      className="size-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all"
                    >
                      <span className="material-symbols-outlined text-2xl font-bold">
                        {playingToneId === currentPreviewTone.id && isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </motion.button>
                  </div>

                  <div className="w-full h-px bg-white/5" />

                  {/* Auth redirection actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className={`flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 py-3 text-[10px] font-mono uppercase tracking-widest transition-all font-semibold ${currentConfig.accentClass}`}
                    >
                      <span className="material-symbols-outlined text-sm">library_add</span>
                      Save
                    </button>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className={`flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 py-3 text-[10px] font-mono uppercase tracking-widest transition-all font-semibold ${currentConfig.accentClass}`}
                    >
                      <span className="material-symbols-outlined text-sm">sensors</span>
                      Broadcast
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Unified single-channel player */}
          <audio
            ref={audioRef}
            preload="auto"
            onTimeUpdate={() => {
              if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
              }
            }}
            onPlay={() => {
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setPlayingToneId(null);
              setCurrentTime(0);
              setDuration(0);
            }}
          />
        </div>

        {/* Powered By BishopTech */}
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           className="mt-20 flex flex-col items-center gap-4 group"
        >
          <div className="flex items-center gap-3 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/40">Powered by</span>
            <Image 
              src="/images/logo.png" 
              alt="BishopTech" 
              width={24} 
              height={24} 
              className="opacity-50"
            />
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/60">BishopTech</span>
          </div>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>

      </main>

      <footer className="py-12 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>System Status: Optimal</span>
            <span>100+ Frequencies Online</span>
            <span>Binaural Phase Lock: Active</span>
          </div>
          <div className="flex gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>&copy; 2026 NeuroSync.sys</span>
          </div>
        </div>
      </footer>

      <AgenticAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
