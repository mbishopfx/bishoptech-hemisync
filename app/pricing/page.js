'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Zap, Shield, Cpu, Info, DollarSign, X } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

const plans = [
  {
    name: 'Free Trial',
    id: 'free',
    price: '$0',
    priceId: 'free',
    description: 'Explore foundational binaural dynamics and synchronization.',
    features: [
      { text: 'Generate up to 5 tones per month', allowed: true },
      { text: 'Access to full soundwave library', allowed: true },
      { text: 'Cannot export master WAV/MP3 files', allowed: false },
      { text: 'Cannot broadcast to global feed', allowed: false },
      { text: 'Cannot listen to collective feeds', allowed: false }
    ],
    highlight: false,
    cta: 'Access Free Console',
    mode: 'free'
  },
  {
    name: 'Premium Console',
    id: 'premium',
    price: '$9',
    priceId: 'price_1TWlb7DJtpuPVfuFfSVEXPYU',
    description: 'Complete auditory synchronization and master broadcasting.',
    features: [
      { text: 'Unlimited AI Tone Generation', allowed: true },
      { text: 'High-Fidelity WAV/MP3 Master Exports', allowed: true },
      { text: 'Broadcast to Collective Waves Feed', allowed: true },
      { text: 'Access Public Collective Waves Stream', allowed: true },
      { text: 'Advanced Bio-Acoustic Metrics', allowed: true },
      { text: '7-Day Full Access Trial Included', allowed: true }
    ],
    highlight: true,
    cta: 'Ascend to Premium',
    mode: 'subscription'
  },
  {
    name: 'Lifetime Access',
    id: 'lifetime',
    price: '$50',
    priceId: 'price_1TWlbTDJtpuPVfuFG5ejsTAG',
    description: 'Permanent founding license with zero recurring costs.',
    features: [
      { text: 'All Premium Console privileges permanently', allowed: true },
      { text: 'Never pay recurring monthly fees', allowed: true },
      { text: 'Exclusive Founding Member Badge', allowed: true },
      { text: 'Priority Agent Cognition & Core Nodes', allowed: true },
      { text: 'Lifetime System updates & nodes', allowed: true }
    ],
    highlight: false,
    cta: 'Secure Lifetime License',
    mode: 'payment'
  }
];

const tonePack = {
  name: 'Tone Pack 01',
  id: 'tone-pack-01',
  price: 'TBD',
  priceId: 'price_tone_pack_pending',
  mode: 'payment',
  description: 'A one-time 16-tone pack built from the first HemiSync sample collection.',
  features: [
    '16 Generated HemiSync-style preview tones',
    'One-time purchase on Stripe',
    'Includes the first launch pack',
    'Public MP3 downloads'
  ],
  highlight: false,
  cta: 'Pack Coming Soon',
  disabled: true
};

export default function PricingPage() {
  const [serenityTones, setSerenityTones] = useState([]);
  const [loadingSerenity, setLoadingSerenity] = useState(false);
  const [activePreviewTone, setActivePreviewTone] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingToneId, setPlayingToneId] = useState(null);

  const audioRef = useRef(null);
  const [supabase, setSupabase] = useState(null);

  // Load preview data and query database serenity pack
  useEffect(() => {
    try {
      setSupabase(getSupabaseBrowserClient());
    } catch (err) {
      console.warn('Supabase client unavailable on pricing page:', err?.message || err);
    }
  }, []);

  useEffect(() => {
    // 1. Retrieve active preview tone generated from the homepage
    const saved = localStorage.getItem('active-preview-tone');
    if (saved) {
      setActivePreviewTone(JSON.parse(saved));
    } else {
      // Fallback: Fetch featured tone
      fetch('/api/audio/preview-tone')
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.tone) {
            setActivePreviewTone(data.tone);
          }
        })
        .catch(err => console.error('Failed to load featured active preview tone:', err));
    }

    // 2. Fetch Serenity Catalog Tones from Supabase
    async function loadSerenity() {
      try {
        setLoadingSerenity(true);
        if (!supabase) return;
        const { data, error } = await supabase
          .from('saved_tones')
          .select('*')
          .eq('is_serenity', true)
          .order('created_at', { ascending: true });
        
        if (!error && data) {
          setSerenityTones(data);
        }
      } catch (err) {
        console.error('Failed to query serenity tracks:', err);
      } finally {
        setLoadingSerenity(false);
      }
    }
    loadSerenity();
  }, [supabase]);

  // Audio Playback Pipeline
  const handlePlayTone = (tone) => {
    const url = tone.webmUrl || tone.wavUrl || tone.mp3Url || tone.webm_url || tone.wav_url || tone.mp3_url || tone.playUrl;
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

      <main className="pt-40 pb-20 px-6 relative z-10 flex flex-col items-center max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mb-20">
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Subscription Nodes</p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-light tracking-tighter text-white"
          >
            Upgrade your <span className="text-white/20 italic">frequency.</span>
          </motion.h1>
          <p className="text-white/40 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            Choose the synchronization tier that aligns with your cognitive goals. Subscription plans include a 7-day trial. Lifetime access is a one-time purchase.
          </p>
        </div>

        {/* 3-Column Plan Grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl mb-32">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`
                relative p-10 rounded-[3rem] border transition-all duration-500 group flex flex-col justify-between
                ${plan.highlight ? 'bg-white/5 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)]' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-widest">
                  Most Calibrated
                </div>
              )}

              <div>
                <div className="mb-8">
                  <h3 className="text-2xl font-medium mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-white/30 text-sm">
                      {plan.id === 'lifetime' ? ' /one-time' : plan.id === 'free' ? '' : '/month'}
                    </span>
                  </div>
                  <p className="text-white/40 text-sm mt-4 leading-relaxed min-h-[40px]">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, j) => (
                    <div key={j} className={`flex items-start gap-3 text-sm ${feature.allowed ? 'text-white/70' : 'text-white/25 line-through'}`}>
                      <div className={`size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5
                        ${!feature.allowed 
                          ? 'bg-red-500/10 text-red-400/50' 
                          : plan.highlight 
                            ? 'bg-cyan-500/10 text-cyan-400' 
                            : 'bg-white/5 text-white/30'
                        }
                      `}>
                        {feature.allowed ? <Check className="size-3" /> : <X className="size-3" />}
                      </div>
                      <span className="leading-tight">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('supabase-auth-token');
                    
                    if (plan.id === 'free') {
                      if (token) {
                        window.location.href = '/dashboard';
                      } else {
                        window.location.href = '/signup?plan=free';
                      }
                      return;
                    }

                    if (!token) {
                      window.location.href = `/signup?plan=${plan.id}&priceId=${plan.priceId}&mode=${plan.mode}`;
                      return;
                    }

                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${JSON.parse(token).access_token}`
                      },
                      body: JSON.stringify({ 
                        priceId: plan.priceId, 
                        planId: plan.id, 
                        mode: plan.mode 
                      })
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch (err) {
                    console.error('Checkout redirect failed', err);
                    window.location.href = `/signup?plan=${plan.id}&priceId=${plan.priceId}&mode=${plan.mode}`;
                  }
                }}
                className={`
                  w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mt-auto
                  ${plan.highlight ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}
                `}
              >
                {plan.cta} <ChevronRight className="size-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Binaural Calibration Sound Room */}
        <section className="w-full max-w-5xl mb-32 border-t border-white/5 pt-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Calibration & Sound Room</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight">Stereo Sound Preview Room.</h2>
            <p className="text-white/40 text-sm font-light leading-relaxed">
              Calibrate your headphones and preview our high-fidelity HemiSync waves side-by-side. Test either your active session preview or any of the premium Serenity seed tracks.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Active Session Preview */}
            <div className="md:col-span-5 flex flex-col">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-500/20 bg-zinc-900/40 backdrop-blur-3xl p-8 flex flex-col justify-between h-full shadow-[0_0_50px_rgba(6,182,212,0.03)] min-h-[320px]">
                {/* Visual Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <div className="absolute inset-0 bg-cyan-500/5 blur-[80px] pointer-events-none animate-pulse" />

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-2 text-[9px] font-mono text-cyan-400 uppercase tracking-[0.25em]">
                    <span className="animate-pulse size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    Active Sync Preview
                  </div>

                  {activePreviewTone ? (
                    <div className="space-y-4">
                      <div>
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[9px] font-mono uppercase tracking-widest">
                          {activePreviewTone.state || activePreviewTone.targetState || 'Theta'} State
                        </span>
                        <h3 className="text-2xl font-light tracking-tight text-white mt-3 leading-snug">
                          {activePreviewTone.name}
                        </h3>
                        <p className="text-xs text-white/40 mt-2 font-light leading-relaxed">
                          {activePreviewTone.description || `Custom matched ${activePreviewTone.targetHz || activePreviewTone.target_hz || '8'}Hz binaural frequency session.`}
                        </p>
                      </div>

                      {/* Custom active audio wave animation */}
                      {playingToneId === activePreviewTone.id && isPlaying && (
                        <div className="h-10 flex items-center justify-center gap-1.5 bg-black/40 rounded-xl px-4 border border-white/5">
                          {Array.from({ length: 15 }).map((_, waveIdx) => (
                            <motion.div
                              key={waveIdx}
                              animate={{ 
                                height: [8, 32, 8],
                              }}
                              transition={{ 
                                duration: 0.6 + Math.random() * 0.4, 
                                repeat: Infinity, 
                                ease: "easeInOut",
                                delay: waveIdx * 0.05
                              }}
                              className="w-1 bg-cyan-500 rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-lg font-light text-white/50">No Active Session</h3>
                      <p className="text-xs text-white/30 font-light leading-relaxed">
                        Go back to the Home page and let the HemiSync Agent parse your current cognitive mood to synthesize a custom beat.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 relative z-10 pt-6 border-t border-white/5 flex items-center justify-between">
                  {activePreviewTone ? (
                    <button
                      onClick={() => handlePlayTone(activePreviewTone)}
                      className="size-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105 transition-all"
                    >
                      <span className="material-symbols-outlined text-2xl font-bold">
                        {playingToneId === activePreviewTone.id && isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[9px] font-mono uppercase tracking-wider text-white hover:bg-white/10 transition-all"
                    >
                      Go Sync a Tone <ChevronRight className="size-3" />
                    </Link>
                  )}
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/20">
                    Carrier: {activePreviewTone?.baseFreqHz || activePreviewTone?.base_freq_hz || 220}Hz
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Serenity Pack Tones */}
            <div className="md:col-span-7 flex flex-col">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/30 backdrop-blur-3xl p-8 flex flex-col justify-between h-full min-h-[320px]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-mono text-purple-400 uppercase tracking-[0.25em]">Premium Serenity Pack Tones</p>
                    <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">Seeded Catalog</span>
                  </div>

                  {loadingSerenity ? (
                    <div className="space-y-4 py-12 text-center text-white/30 text-xs font-mono">
                      <span className="animate-spin inline-block size-4 border-t border-cyan-400 rounded-full mr-2" />
                      Loading Serenity Catalog...
                    </div>
                  ) : serenityTones.length > 0 ? (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                      {serenityTones.map((tone) => (
                        <div 
                          key={tone.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            playingToneId === tone.id && isPlaying
                              ? 'bg-purple-500/10 border-purple-500/30 text-white shadow-[0_0_20px_rgba(168,85,247,0.05)]' 
                              : 'bg-zinc-950/60 border-white/5 text-white/60 hover:border-white/10 hover:text-white/80'
                          }`}
                        >
                          <div className="space-y-1 text-left max-w-[75%]">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-purple-400">{tone.target_state || 'Theta'}</span>
                              <span className="text-white/25 text-[8px]">•</span>
                              <span className="text-white/40 text-[9px] font-mono">{tone.base_freq_hz}Hz Carrier</span>
                            </div>
                            <h4 className="text-sm font-medium text-white tracking-tight">{tone.name}</h4>
                            <p className="text-[10px] text-white/35 font-light leading-normal line-clamp-1">{tone.description}</p>
                          </div>

                          <button
                            onClick={() => handlePlayTone(tone)}
                            className={`size-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              playingToneId === tone.id && isPlaying
                                ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-105'
                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:scale-105'
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {playingToneId === tone.id && isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-white/35 text-xs font-light leading-relaxed">
                      No public Serenity tracks registered. Run `node scripts/seed-serenity.mjs` inside your workspace to populate.
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 text-[9px] font-mono uppercase tracking-widest text-white/25 flex items-center justify-between">
                  <span>True Binaural Phase Lock</span>
                  <span className="text-purple-400 font-bold uppercase tracking-widest">{serenityTones.length} premium tracks loaded</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Muted Tone Pack details */}
        <section className="w-full max-w-5xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">Alternative Node</p>
              <h2 className="text-3xl font-light tracking-tight mt-2">HemiSync Sample Pack Seeding</h2>
            </div>
            <p className="max-w-xl text-left md:text-right text-sm text-white/40 font-light leading-relaxed">
              We&apos;ll activate Stripe checkout one-time packs on the dashboard once cataloging is locked. For now, the pack card acts as a system placeholder.
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-10 rounded-[3rem] border bg-zinc-900/50 border-white/5"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                One-time pack
              </div>

              <div className="mb-8 text-left">
                <h3 className="text-2xl font-medium mb-2">{tonePack.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">{tonePack.price}</span>
                  <span className="text-white/30 text-sm">/one time</span>
                </div>
                <p className="text-white/40 text-sm mt-4 leading-relaxed">{tonePack.description}</p>
              </div>

              <div className="space-y-4 mb-10">
                {tonePack.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <div className="size-5 rounded-full flex items-center justify-center bg-white/5 text-white/30">
                      <Check className="size-3" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <button
                disabled
                type="button"
                className="w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 bg-white/5 text-white/40 border border-white/10 cursor-not-allowed"
              >
                {tonePack.cta} <ChevronRight className="size-4" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Stats segment */}
        <section className="mt-32 w-full max-w-4xl text-center">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] mb-12">System Architecture</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Latency', value: '< 150ms' },
              { label: 'Uptime', value: '99.99%' },
              { label: 'Frequencies', value: '100+' },
              { label: 'Encryption', value: 'AES-256' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-white/20 text-[10px] uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-medium tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/50 mt-20">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>Secured by Stripe</span>
            <span>7-Day Trial Refund policy</span>
          </div>
          <div className="flex gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>&copy; 2026 HemiSync.sys</span>
          </div>
        </div>
      </footer>

      {/* Global Hidden Audio pipeline element */}
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setPlayingToneId(null);
        }}
      />
    </div>
  );
}
