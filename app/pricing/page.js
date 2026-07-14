'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Zap, Shield, Cpu, Info, DollarSign, X } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';
import { isHomepageGeneratedTone } from '@/lib/audio/homepage-tones';
import { TONE_PACKS, getTonePackPriceId } from '@/lib/audio/tone-packs.db.mjs';
import { buildAbsoluteUrl } from '@/lib/seo';
import { MONTHLY_PLAN } from '@/lib/billing/plans';

const plans = [{
    name: 'Cognistration Membership',
    id: MONTHLY_PLAN.id,
    price: '$9',
    priceId: MONTHLY_PLAN.priceId,
    description: 'One private workspace for building, rendering, saving, and downloading custom audio sessions.',
    features: [
      { text: 'Full Sync, Workshop, and Studio access', allowed: true },
      { text: 'Private 192 kbps MP3 exports', allowed: true },
      { text: 'Editable staged frequency journeys', allowed: true },
      { text: 'Private project and export library', allowed: true },
      { text: 'Secure downloads and email delivery', allowed: true },
      { text: 'Cancel anytime through Stripe', allowed: true }
    ],
    highlight: true,
    cta: 'Create account & subscribe',
    mode: 'subscription'
  }];

const tonePack = TONE_PACKS[0];

export default function PricingPage() {
  const [previewTracks, setPreviewTracks] = useState(() => TONE_PACKS[0]?.tracks?.slice(0, 6) || []);
  const [loadingPreviewTracks, setLoadingPreviewTracks] = useState(false);
  const [activePreviewTone, setActivePreviewTone] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingToneId, setPlayingToneId] = useState(null);

  const audioRef = useRef(null);
  const previewListRef = useRef(null);
  const tonePackPriceId = getTonePackPriceId(tonePack);
  const tonePackCheckoutReady = Boolean(tonePackPriceId);

  const pricingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pricing | Cognistration',
    url: buildAbsoluteUrl('/pricing'),
    description: 'One complete private Cognistration audio studio membership for $9 per month.'
  };

  // Load preview data and featured pack preview tones
  useEffect(() => {
    const listRoot = previewListRef.current;
    const delegatedClick = (event) => {
      const button = event.target.closest('button[data-preview-url]');
      if (!button || !listRoot?.contains(button)) return;
      const url = button.dataset.previewUrl;
      const trackId = button.dataset.previewTrackId || url;
      const previewSeconds = Number(button.dataset.previewSeconds || 30);
      if (!url || !audioRef.current) return;
      const tone = {
        preview_url: url,
        track_id: trackId,
        preview_seconds: previewSeconds
      };
      handlePlayTone(tone);
    };
    listRoot?.addEventListener('click', delegatedClick);

    // 1. Retrieve active preview tone generated from the homepage
    const saved = localStorage.getItem('active-preview-tone');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isHomepageGeneratedTone(parsed)) {
          setActivePreviewTone(parsed);
          return;
        }
      } catch (error) {
        console.warn('Invalid saved preview tone on pricing page:', error);
      }
    }

    // Fallback: Fetch featured tone
    fetch('/api/audio/preview-tone')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.tone) {
          setActivePreviewTone(data.tone);
        }
      })
      .catch(err => console.error('Failed to load featured active preview tone:', err));

    // 2. Refresh featured pack preview tones if the API is available
    async function loadPreviewTracks() {
      try {
        const res = await fetch('/api/packs');
        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();
        let data = null;
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(text);
          } catch (err) {
            data = null;
          }
        }
        if (res.ok && data?.ok && Array.isArray(data.packs) && data.packs.length > 0) {
          setPreviewTracks((data.packs[0].tracks || []).slice(0, 6));
        }
      } catch (err) {
        console.warn('Preview pack refresh failed; using bundled catalog:', err?.message || err);
      }
    }
    loadPreviewTracks();

    return () => {
      listRoot?.removeEventListener('click', delegatedClick);
    };
  }, []);

  // Audio Playback Pipeline
  const handlePlayTone = (tone) => {
    const url = tone.preview_url || tone.previewUrl || tone.webmUrl || tone.wavUrl || tone.mp3Url || tone.download_url || tone.downloadUrl || tone.webm_url || tone.wav_url || tone.mp3_url || tone.playUrl;
    if (!url || !audioRef.current) return;

    const audio = audioRef.current;
    const trackId = tone.track_id || tone.id || url;
    const previewSeconds = Number(tone.preview_seconds || 30);

    if (playingToneId === trackId) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error('Acoustic playback failed:', err));
      }
      return;
    }

    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    audio.load();
    setPlayingToneId(trackId);
    audio.play()
      .then(() => {
        setIsPlaying(true);
        if (audio.dataset.previewTimer) {
          window.clearTimeout(Number(audio.dataset.previewTimer));
        }
        audio.dataset.previewTimer = String(window.setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          setIsPlaying(false);
          setPlayingToneId(null);
        }, Math.max(1, previewSeconds * 1000)));
      })
      .catch(err => {
        console.error('Acoustic playback failed:', err);
        setIsPlaying(false);
      });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <PublicHeader />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      <main className="pt-40 pb-20 px-6 relative z-10 flex flex-col items-center max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl leading-[0.95] sm:text-5xl md:text-7xl font-light tracking-tighter text-white"
          >
            One membership. <span className="text-white/20 italic">The complete studio.</span>
          </motion.h1>
          <p className="text-white/40 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            Build and keep private audio sessions for $9 per month. Your account activates after secure Stripe checkout.
          </p>
        </div>

        <div className="grid gap-8 w-full max-w-xl mb-32">
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
                  Most Complete
                </div>
              )}

              <div>
                <div className="mb-8">
                  <h3 className="text-2xl font-medium mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-white/30 text-sm">
                      /month
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
                    await redirectToStripeCheckout({
                      planId: plan.id,
                      priceId: plan.priceId,
                      mode: plan.mode,
                      fallbackPath: '/signup'
                    });
                  } catch (err) {
                    console.error('Checkout redirect failed', err);
                    window.location.href = '/signup';
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
              Calibrate your headphones and preview our high-fidelity audio side-by-side. Test either your active session preview or the live Foundations Pack tracks below.
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
                          {activePreviewTone.description || `Custom matched ${activePreviewTone.targetHz || activePreviewTone.target_hz || '8'}Hz listening session.`}
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
                        Go back to the Home page and let the Cognistration Agent parse your current listening goal to synthesize a custom beat.
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
                      Try a Tone <ChevronRight className="size-3" />
                    </Link>
                  )}
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/20">
                    Carrier: {activePreviewTone?.baseFreqHz || activePreviewTone?.base_freq_hz || 220}Hz
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Preview Tones */}
            <div className="md:col-span-7 flex flex-col">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/30 backdrop-blur-3xl p-8 flex flex-col justify-between h-full min-h-[320px]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-mono text-purple-400 uppercase tracking-[0.25em]">Featured Preview Tones</p>
                    <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">Preview Catalog</span>
                  </div>

                  {loadingPreviewTracks ? (
                    <div className="space-y-4 py-12 text-center text-white/30 text-xs font-mono">
                      <span className="animate-spin inline-block size-4 border-t border-cyan-400 rounded-full mr-2" />
                      Loading preview catalog...
                    </div>
                  ) : previewTracks.length > 0 ? (
                    <div ref={previewListRef} className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                      {previewTracks.slice(0, 6).map((tone) => {
                        const previewUrl = tone.preview_url || tone.previewUrl || tone.webmUrl || tone.wavUrl || tone.mp3Url || tone.download_url || tone.downloadUrl || tone.webm_url || tone.wav_url || tone.mp3_url || tone.playUrl;
                        const trackId = tone.track_id || tone.id || previewUrl;
                        const previewSeconds = Number(tone.preview_seconds || 30);
                        const active = playingToneId === trackId && isPlaying;

                        return (
                          <div
                            key={trackId}
                            className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                              active ? 'border-purple-500/30 bg-purple-500/10 text-white shadow-[0_0_20px_rgba(168,85,247,0.05)]' : 'border-white/5 bg-zinc-950/60 text-white/60 hover:border-white/10 hover:text-white/80'
                            }`}
                          >
                            <div className="space-y-1 text-left max-w-[75%]">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono uppercase tracking-widest text-purple-400">{tone.target_state_label || tone.state || 'Theta'}</span>
                                <span className="text-white/25 text-[8px]">•</span>
                                <span className="text-white/40 text-[9px] font-mono">{tone.base_freq_hz}Hz Carrier</span>
                                <span className="text-white/25 text-[8px]">•</span>
                                <span className="text-white/40 text-[9px] font-mono">{previewSeconds}s preview</span>
                              </div>
                              <h4 className="text-sm font-medium text-white tracking-tight">{tone.name}</h4>
                              <p className="text-[10px] text-white/35 font-light leading-normal line-clamp-1">{tone.summary || tone.description}</p>
                            </div>

                            <audio
                              controls
                              preload="none"
                              src={previewUrl || undefined}
                              className="h-10 w-32 shrink-0 rounded-full bg-black/30"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-white/35 text-xs font-light leading-relaxed">
                      No preview tones loaded yet. Check the <Link href="/packs" className="text-purple-300 hover:text-purple-200">Packs</Link> page for the live Foundations Pack.
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 text-[9px] font-mono uppercase tracking-widest text-white/25 flex items-center justify-between">
                  <span>Binaural-style Preview</span>
                  <span className="text-purple-400 font-bold uppercase tracking-widest">{previewTracks.length} premium tracks loaded</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Available Tone Packs */}
        <section className="w-full max-w-5xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <p className="text-[10px] font-mono text-purple-300 uppercase tracking-[0.4em]">Tone Packs</p>
              <h2 className="text-3xl font-light tracking-tight mt-2">Ten tone packs</h2>
            </div>
            <p className="max-w-xl text-left md:text-right text-sm text-white/40 font-light leading-relaxed">
              The tone-pack storefront now offers ten state-focused collections at the same one-time price. Preview them, enter your email, and complete delivery on the Packs page.
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-10 rounded-[3rem] border bg-zinc-900/50 border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.08)]"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-500 text-black text-[10px] font-bold uppercase tracking-widest">
                Live pack
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
                disabled={!tonePackCheckoutReady}
                type="button"
                onClick={() => {
                  window.location.href = '/packs';
                }}
                className="w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 bg-purple-500 text-black hover:bg-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.12)]"
              >
                {tonePackCheckoutReady ? 'Choose your pack' : 'Packs are being prepared'} <ChevronRight className="size-4" />
              </button>
            </motion.div>
          </div>
        </section>

      </main>

      <footer className="py-12 border-t border-white/5 bg-black/50 mt-20">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>Billing Options</span>
            <span>Privacy, Terms, and Cookies Linked Below</span>
          </div>
          <div className="flex flex-wrap gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/ai-disclosure" className="hover:text-white transition-colors">AI Disclosure</Link>
            <Link href="/health-warning" className="hover:text-white transition-colors">Health Warning</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <span>&copy; 2026 Cognistration</span>
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
