'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Omnibar } from '@/components/agent/Omnibar';
import { AgenticAuthModal } from '@/components/auth/AgenticAuthModal';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { RecentPostsCarousel } from '@/components/blog/recent-posts-carousel';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [agentMessage, setAgentMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showPreviewToneButton, setShowPreviewToneButton] = useState(true);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [currentPreviewTone, setCurrentPreviewTone] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPreviewTone() {
      try {
        const response = await fetch('/api/audio/preview-tone', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !data.ok || cancelled) return;
        setCurrentPreviewTone(data.tone || null);
      } catch (error) {
        console.error('Failed to load featured preview tone:', error);
      }
    }

    loadPreviewTone();
    return () => {
      cancelled = true;
    };
  }, []);

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
      audioRef.current?.pause();
      setIsPreviewPlaying(false);
      setIsPreviewActive(false);
      setCurrentPreviewTone(data.track || null);
    } catch (err) {
      console.error('Failed to connect to agent:', err);
    } finally {
      setIsLoading(false);
    }
  };



  const handlePreviewTone = async () => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (isPreviewPlaying) {
      audio.pause();
      setIsPreviewPlaying(false);
      setIsPreviewActive(false);
      return;
    }

    const nextTone = currentPreviewTone || null;
    const nextSource = nextTone?.playUrl || nextTone?.webmUrl || nextTone?.wavUrl || nextTone?.mp3Url || nextTone?.mp3_url;
    if (!nextTone || !nextSource) return;

    setCurrentPreviewTone(nextTone);
    setAgentMessage(`Previewing ${nextTone.name}${nextTone.shortLabel ? ` • ${nextTone.shortLabel}` : ''}.`);
    setIsPreviewActive(true);
    audio.src = nextSource;
    audio.load();

    try {
      await audio.play();
      setIsPreviewPlaying(true);
    } catch (error) {
      console.error('Preview tone playback failed:', error);
      setIsPreviewPlaying(false);
      setIsPreviewActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      <PublicHeader />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      {/* Main Content */}
      <main className="pt-40 pb-20 px-6 relative z-10 flex flex-col items-center gap-20">
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

        {/* Omnibar & Player */}
        <div className="w-full flex flex-col items-center gap-12">
          <Omnibar 
            onGenerate={handleGenerate} 
            isLoading={isLoading} 
            agentMessage={agentMessage}
          />

          {showPreviewToneButton && (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handlePreviewTone}
                aria-pressed={isPreviewActive}
                className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-xs font-mono uppercase tracking-[0.3em] transition-colors ${isPreviewActive ? 'border-cyan-300/60 bg-cyan-400 text-black shadow-[0_0_24px_rgba(34,211,238,0.3)]' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 hover:text-white'}`}
              >
                {isPreviewPlaying ? 'Pause Preview Tone' : currentPreviewTone ? 'Resume Preview Tone' : 'Preview Tone'}
              </button>
              <p className="text-center text-[10px] font-mono uppercase tracking-[0.35em] text-white/25">
                Bi-directional stereo preview from our generated binaural HemiSync tones
              </p>
            </div>
          )}

          <audio
            ref={audioRef}
            preload="auto"
            onPlay={() => {
              setIsPreviewActive(true);
              setIsPreviewPlaying(true);
            }}
            onPause={() => setIsPreviewPlaying(false)}
            onEnded={() => {
              setIsPreviewPlaying(false);
              setIsPreviewActive(false);
              setCurrentPreviewTone(null);
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

        <section className="w-full max-w-7xl px-6 md:px-10">
          <RecentPostsCarousel />
        </section>
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
            <span>&copy; 2026 HemiSync.sys</span>
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
