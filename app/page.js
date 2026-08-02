'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Omnibar } from '@/components/agent/Omnibar';
import { AgenticAuthModal } from '@/components/auth/AgenticAuthModal';
import { LiquidHeader } from '@/components/layout/LiquidHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { IosAppCarousel } from '@/components/marketing/IosAppCarousel';
import { HomepageTonePacksSection } from '@/components/packs/HomepageTonePacksSection';
import { ProcessingParticleBackground } from '@/components/visuals/ProcessingParticleBackground';
import { isHomepageGeneratedTone, HOMEPAGE_STATE_TONES } from '@/lib/audio/homepage-tones';

const siteUrl = 'https://cognistration.com';
const siteDescription = 'Cognistration offers holistic wellness and binaural frequency sessions for focus, rest, and natural mind healing.';
const homepageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${siteUrl}/#webpage`,
  name: 'Cognistration — Heal Your Mind Naturally',
  url: siteUrl,
  description: siteDescription,
  isPartOf: {
    '@id': `${siteUrl}/#website`,
  },
  about: {
    '@id': `${siteUrl}/#organization`,
  },
};

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [agentMessage, setAgentMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('active-preview-tone');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return isHomepageGeneratedTone(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

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
          setCurrentPreviewTone(HOMEPAGE_STATE_TONES[1]);
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
      accentClass: 'text-purple-300',
      borderClass: 'border-purple-500/30',
      shadowClass: 'shadow-[0_0_50px_rgba(168,85,247,0.15)]',
      waveClass: 'bg-purple-400',
      glowDot: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    },
    alpha: {
      accentClass: 'text-cyan-300',
      borderClass: 'border-cyan-500/30',
      shadowClass: 'shadow-[0_0_50px_rgba(6,182,212,0.15)]',
      waveClass: 'bg-cyan-400',
      glowDot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]',
    },
    delta: {
      accentClass: 'text-blue-300',
      borderClass: 'border-blue-500/30',
      shadowClass: 'shadow-[0_0_50px_rgba(59,130,246,0.15)]',
      waveClass: 'bg-blue-400',
      glowDot: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    },
    beta: {
      accentClass: 'text-rose-300',
      borderClass: 'border-rose-500/30',
      shadowClass: 'shadow-[0_0_50px_rgba(244,63,94,0.15)]',
      waveClass: 'bg-rose-400',
      glowDot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    },
    gamma: {
      accentClass: 'text-emerald-300',
      borderClass: 'border-emerald-500/30',
      shadowClass: 'shadow-[0_0_50px_rgba(16,185,129,0.15)]',
      waveClass: 'bg-emerald-400',
      glowDot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    },
  };

  const currentConfig = stateConfig[activeState] || stateConfig.alpha;

  const handleGenerate = async (mood) => {
    setIsLoading(true);
    setAgentMessage('');

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
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

  const handlePlayTone = (tone) => {
    const url =
      tone?.webmUrl ||
      tone?.wavUrl ||
      tone?.mp3Url ||
      tone?.webm_url ||
      tone?.wav_url ||
      tone?.mp3_url ||
      tone?.playUrl;
    if (!url || !audioRef.current) return;

    const audio = audioRef.current;

    if (playingToneId === tone.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error('Playback failed:', err));
      }
    } else {
      audio.pause();
      audio.src = url;
      audio.load();
      setPlayingToneId(tone.id);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Playback failed:', err);
          setIsPlaying(false);
        });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />

      {/* Header Navigation */}
      <LiquidHeader onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Hero Section with a Processing-inspired particle field */}
      <section id="hero" className="relative w-full min-h-[100dvh] flex flex-col justify-between items-center overflow-hidden z-10 pt-28 pb-16 px-5 sm:px-8 md:px-16 lg:px-20">
        <ProcessingParticleBackground />

        {/* Contrast tint & bottom fade keep the field behind the interface. */}
        <div className="absolute inset-0 bg-black/25 z-[1] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-b from-transparent via-black/60 to-black z-[2] pointer-events-none" />

        {/* Centered Hero Copy */}
        <div className="relative z-10 mt-10 sm:mt-16 md:mt-20 max-w-3xl mx-auto text-center flex flex-col items-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-white tracking-[-0.05em] text-center"
          >
            Heal Your Mind
            <br />
            Naturally
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg font-light text-white/80 max-w-lg mx-auto leading-relaxed text-center"
          >
            Holistic wellness. Transformative results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#tone-packs"
              className="liquid-glass inline-block rounded-full px-6 py-3.5 sm:px-8 sm:py-4 text-sm font-medium text-white transition duration-300 hover:bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            >
              Begin Your Journey
            </a>

            <Link
              href="/pricing"
              className="liquid-glass inline-block rounded-full px-6 py-3.5 text-xs font-mono uppercase tracking-widest text-white/80 transition duration-300 hover:text-white hover:bg-white/10"
            >
              View Pricing
            </Link>
          </motion.div>
        </div>

        {/* AI Omnibar / Interactive Prompt Input & State Player */}
        <div className="relative z-10 w-full max-w-2xl mx-auto mt-12 space-y-8">
          <div className="w-full">
            <Omnibar onGenerate={handleGenerate} isLoading={isLoading} agentMessage={agentMessage} />
          </div>

          {currentPreviewTone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div
                className={`liquid-glass p-6 sm:p-8 rounded-3xl space-y-6 bg-zinc-950/70 border backdrop-blur-2xl transition-all duration-500 ${currentConfig.borderClass} ${currentConfig.shadowClass}`}
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p
                      className={`font-mono text-[9px] uppercase tracking-[0.25em] flex items-center gap-2 ${currentConfig.accentClass}`}
                    >
                      <span className={`animate-pulse size-1.5 rounded-full ${currentConfig.glowDot}`} />
                      {currentPreviewTone.state || 'Stereo'} State Active
                    </p>

                    <select
                      value={currentPreviewTone?.id || ''}
                      onChange={(e) => {
                        const selected = HOMEPAGE_STATE_TONES.find((t) => t.id === e.target.value);
                        if (selected) {
                          setCurrentPreviewTone(selected);
                          localStorage.setItem('active-preview-tone', JSON.stringify(selected));
                          if (playingToneId !== selected.id) {
                            audioRef.current?.pause();
                            setIsPlaying(false);
                          }
                        }
                      }}
                      className="bg-black/60 border border-white/20 text-[10px] font-mono uppercase tracking-widest focus:outline-none cursor-pointer rounded-full px-4 py-1.5 text-white/90 transition-colors"
                    >
                      {HOMEPAGE_STATE_TONES.map((t) => (
                        <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                          {t.name} ({t.state.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-center sm:text-left">
                    <h3 className="text-white text-lg font-medium leading-snug">{currentPreviewTone.name}</h3>
                    <p className="text-white/50 text-xs mt-0.5">
                      {currentPreviewTone.targetHz ? `${currentPreviewTone.targetHz}Hz` : 'Dynamic'} Pure Binaural Tone
                    </p>
                  </div>

                  {/* Audio Wave Visualizer */}
                  {playingToneId === currentPreviewTone.id && isPlaying && (
                    <div className="h-8 flex items-center justify-center gap-1 bg-black/40 rounded-xl px-4 border border-white/10">
                      {Array.from({ length: 16 }).map((_, waveIdx) => (
                        <motion.div
                          key={waveIdx}
                          animate={{ height: [4, 18, 4] }}
                          transition={{
                            duration: 0.5 + Math.random() * 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: waveIdx * 0.04,
                          }}
                          className={`w-1 rounded-full ${currentConfig.waveClass}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
                      <motion.div
                        className={`absolute inset-y-0 left-0 ${currentConfig.waveClass}`}
                        style={{
                          width: `${
                            playingToneId === currentPreviewTone.id
                              ? duration
                                ? (currentTime / duration) * 100
                                : 0
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                      <span>{playingToneId === currentPreviewTone.id ? formatTime(currentTime) : '0:00'}</span>
                      <span>{playingToneId === currentPreviewTone.id ? formatTime(duration) : '0:00'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlayTone(currentPreviewTone)}
                    type="button"
                    className="size-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all"
                  >
                    <span className="material-symbols-outlined text-2xl font-bold">
                      {playingToneId === currentPreviewTone.id && isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Unified single-channel audio player */}
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
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setPlayingToneId(null);
              setCurrentTime(0);
              setDuration(0);
            }}
          />
        </div>
      </section>

      {/* Science section: explain the mechanism without promising a guaranteed outcome. */}
      <section id="how-it-works" aria-labelledby="signal-title" className="relative overflow-hidden border-t border-white/8 bg-zinc-950 py-24 sm:py-32">
        <div className="absolute left-[-14rem] top-1/4 h-[34rem] w-[34rem] rounded-full bg-cyan-400/[0.05] blur-[130px]" />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-200/70">The signal behind the session</p>
            <h2 id="signal-title" className="mt-5 max-w-xl text-4xl font-light leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl">
              Work with your attention, one listening state at a time.
            </h2>
            <p className="mt-6 max-w-xl text-base font-light leading-8 text-white/55 sm:text-lg">
              Cognistration starts with a simple idea: a sound pattern can give the mind a steadier object to follow. Put on headphones, choose the state you want to practice, and make the transition into the moment deliberate.
            </p>
            <a href="#access" className="mt-8 inline-flex items-center gap-2 text-sm text-cyan-200 underline decoration-cyan-200/35 underline-offset-8 transition hover:text-white">
              See the full platform
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {[
              ['01', 'Frequency-following response', 'The auditory system can track periodic structure in sound. Researchers measure this as a frequency-following response (FFR): an EEG signal that helps show how the system encodes temporal regularity.'],
              ['02', 'Stereo patterns, perceived beats', 'With two slightly different tones presented separately to each ear, the brain can perceive a third rhythmic beat. Headphones preserve the left/right separation the pattern depends on.'],
              ['03', 'State practice, not a promise', 'Some studies record a beat-frequency response, while broader evidence for direct brainwave entrainment remains mixed. Cognistration turns that research direction into a repeatable baseline you can test for yourself.']
            ].map(([number, title, copy]) => (
              <article key={number} className="grid gap-4 py-7 sm:grid-cols-[60px_1fr] sm:gap-6">
                <p className="text-[10px] font-mono tracking-[0.24em] text-cyan-200/55">{number}</p>
                <div>
                  <h3 className="text-xl font-light tracking-tight text-white">{title}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="relative mx-auto mt-10 flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-6 text-[10px] font-mono uppercase tracking-[0.18em] text-white/25 sm:px-8">
          <a href="https://pubmed.ncbi.nlm.nih.gov/28123019/" target="_blank" rel="noreferrer" className="transition hover:text-cyan-200">FFR research</a>
          <a href="https://pubmed.ncbi.nlm.nih.gov/15721080/" target="_blank" rel="noreferrer" className="transition hover:text-cyan-200">Auditory steady-state response</a>
          <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10198548/" target="_blank" rel="noreferrer" className="transition hover:text-cyan-200">Systematic review</a>
        </div>
      </section>

      {/* Use-case section: make the platform concrete for cold visitors. */}
      <section aria-labelledby="use-case-title" className="relative bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-200/70">For the moment you want back</p>
            <h2 id="use-case-title" className="mt-5 text-4xl font-light leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl">
              Build a boundary around whatever matters next.
            </h2>
            <p className="mt-6 max-w-2xl text-base font-light leading-8 text-white/55 sm:text-lg">
              There is no single perfect state. Use Cognistration as a baseline tool for choosing a direction, lowering the volume of external noise, and returning to the work of your own mind. It is a way to take back a little more choice over consciousness and thought processes—not a switch that overrides them.
            </p>
          </div>

          <div className="mt-14 grid gap-x-10 sm:grid-cols-2">
            {[
              ['Work and study', 'Start a clear block of concentration when the first step feels harder than it should.'],
              ['Gaming and creative work', 'Create a repeatable pre-session cue that helps you enter the experience on purpose.'],
              ['Meditation and breathwork', 'Give a quiet practice a steady rhythmic anchor without adding another voice to follow.'],
              ['Hunting and fishing', 'Use a calm transition before time outdoors, then let the environment take over.'],
              ['Recovery between tasks', 'Mark the space between meetings, screens, errands, and the next meaningful thing.'],
              ['Your own ritual', 'Build a private pattern around the moments where you want more choice and less drift.']
            ].map(([title, copy], index) => (
              <article key={title} className="grid gap-4 border-t border-white/10 py-7 sm:grid-cols-[60px_1fr] sm:gap-6">
                <p className="text-[10px] font-mono tracking-[0.24em] text-white/25">{String(index + 1).padStart(2, '0')}</p>
                <div>
                  <h3 className="text-lg font-light text-white">{title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-7 text-white/42">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <IosAppCarousel />

      {/* One-time platform offer: make the new price the clearest conversion point. */}
      <section id="access" aria-labelledby="access-title" className="relative overflow-hidden bg-zinc-950 py-24 sm:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-200/70">One clear price</p>
            <h2 id="access-title" className="mt-5 max-w-2xl text-4xl font-light leading-[1.03] tracking-[-0.05em] text-white sm:text-6xl">
              Take back the controls for $20—once.
            </h2>
            <p className="mt-6 max-w-2xl text-base font-light leading-8 text-white/55 sm:text-lg">
              Unlock the full Cognistration platform with one payment. No monthly cost, no recurring charge, and no pressure to keep a subscription alive. Start with a preview, then keep the tools that become part of your practice.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
              {['Sync, Workshop, and Studio access', 'Private session and export library', 'Custom state patterns and guided workflows', 'Lifetime access to the platform'].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-cyan-200">✓</span>
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3.5 text-sm font-medium text-zinc-950 transition duration-300 hover:bg-white active:translate-y-px">
                Unlock Cognistration for $20
                <span aria-hidden="true">→</span>
              </Link>
              <a href="#tone-packs" className="text-sm text-white/45 underline decoration-white/20 underline-offset-8 transition hover:text-white">Explore tone packs</a>
            </div>
            <p className="mt-5 max-w-xl text-[11px] leading-5 text-white/30">Cognistration is an intentional listening and attention tool, not medical treatment and not a guarantee of a particular neurological outcome.</p>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-200/20 bg-white/[0.04] p-8 shadow-[0_20px_80px_rgba(6,182,212,0.08)] sm:p-10">
            <div className="absolute inset-x-10 top-0 h-px bg-cyan-200/70" />
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-cyan-200/70">Lifetime access</p>
            <div className="mt-8 flex items-end gap-3">
              <span className="text-7xl font-light leading-none tracking-[-0.08em] text-white">$20</span>
              <span className="pb-2 text-sm text-white/35">one time</span>
            </div>
            <div className="mt-8 border-t border-white/10 pt-6 text-sm leading-7 text-white/50">
              <p>Pay once. Build a routine. Return whenever you need a clear starting point.</p>
              <p className="mt-4 text-white/30">Secure checkout is handled by Stripe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tone packs stay at the bottom of the lander after the full platform story. */}
      <HomepageTonePacksSection />

      {/* Powered By BishopTech branding */}
      <div className="bg-black py-12 flex flex-col items-center gap-4 group">
        <div className="flex items-center gap-3 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
          <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/40">Powered by</span>
          <Image
            src="/images/cognistration-mark.png"
            alt="Cognistration brainwave mark"
            width={24}
            height={24}
            className="opacity-60"
          />
          <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/70">BishopTech</span>
        </div>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Footer */}
      <PublicTrustFooter />

      {/* Auth Modal */}
      <AgenticAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
