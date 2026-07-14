'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, createScope, stagger } from 'animejs';
import {
  ArrowDown,
  ArrowRight,
  Check,
  EnvelopeSimple,
  Headphones,
  ShieldCheck,
  Sparkle,
  Waveform
} from '@phosphor-icons/react';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';
import { TONE_PACKS, getTonePackPriceId } from '@/lib/audio/tone-packs.db.mjs';
import { CylinderPackCatalog } from '@/components/packs/CylinderPackCatalog';

const PREVIEW_LIMIT_SEC = 30;
const SIGNAL_STATES = [
  ['Delta', '1–4 Hz'],
  ['Theta', '4–8 Hz'],
  ['Alpha', '8–13 Hz'],
  ['Beta', '13–30 Hz'],
  ['Gamma', '30–40 Hz']
];

function trackId(track) {
  return track?.track_id || track?.trackId || track?.id;
}

function trackUrl(track) {
  return track?.preview_url || track?.previewUrl || track?.download_url || track?.downloadUrl || track?.webm_url || track?.webmUrl || track?.mp3_url || track?.mp3Url;
}

function packPriceId(pack) {
  return pack?.priceId || getTonePackPriceId(pack);
}

function displayState(state) {
  return state?.displayName || state?.label || state?.state || state;
}

export function PacksBrowser() {
  const [packs, setPacks] = useState(TONE_PACKS);
  const [selectedSlug, setSelectedSlug] = useState(TONE_PACKS[0]?.slug || '');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [activeTrackKey, setActiveTrackKey] = useState(null);
  const [previewTime, setPreviewTime] = useState(0);
  const rootRef = useRef(null);
  const audioRef = useRef(null);

  const selectedPack = useMemo(
    () => packs.find((pack) => pack.slug === selectedSlug) || packs[0] || null,
    [packs, selectedSlug]
  );

  useEffect(() => {
    const scope = createScope({
      root: rootRef.current,
      mediaQueries: { reduceMotion: '(prefers-reduced-motion: reduce)' }
    }).add((self) => {
      if (self.matches.reduceMotion) {
        rootRef.current?.querySelectorAll('.catalog-reveal').forEach((element) => {
          element.style.opacity = '1';
        });
        return;
      }

      animate('.catalog-reveal', {
        opacity: [0, 1],
        y: [28, 0],
        duration: 900,
        delay: stagger(90),
        ease: 'out(4)'
      });

      animate('.hero-signal-bar', {
        scaleX: stagger([0.35, 1], { from: 'center' }),
        opacity: stagger([0.3, 0.9]),
        duration: 1500,
        delay: stagger(70),
        alternate: true,
        loop: true,
        ease: 'inOut(3)'
      });
    });

    return () => scope.revert();
  }, []);

  useEffect(() => {
    if (!activeTrackKey || !rootRef.current) return undefined;
    const bars = rootRef.current.querySelectorAll(`[data-track-key="${activeTrackKey}"] .catalog-wave-bar`);
    if (!bars.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const waveformAnimation = animate(bars, {
      scaleY: stagger([0.3, 1], { from: 'center' }),
      duration: 540,
      delay: stagger(45),
      alternate: true,
      loop: true,
      ease: 'inOut(3)'
    });

    return () => waveformAnimation.cancel();
  }, [activeTrackKey]);

  useEffect(() => {
    let cancelled = false;
    const previewAudio = audioRef.current;

    fetch('/api/packs')
      .then(async (response) => {
        const text = await response.text();
        const data = response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : null;
        if (!response.ok || !data?.ok) throw new Error(data?.error || 'Failed to load the live catalog.');
        if (!cancelled && data.packs?.length) {
          setPacks(data.packs);
          setSelectedSlug((current) => data.packs.some((pack) => pack.slug === current) ? current : data.packs[0].slug);
        }
      })
      .catch(() => {
        if (!cancelled) setError('The live catalog could not refresh, so we are showing the current collection.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      previewAudio?.pause();
    };
  }, []);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveTrackKey(null);
    setPreviewTime(0);
  };

  const preview = async (pack, track) => {
    const url = trackUrl(track);
    if (!url || !audioRef.current) return;
    const key = `${pack.slug}-${trackId(track)}`;

    if (activeTrackKey === key) {
      stopPreview();
      return;
    }

    stopPreview();
    setError('');
    audioRef.current.src = url;
    audioRef.current.load();

    try {
      await audioRef.current.play();
      setActiveTrackKey(key);
    } catch {
      setError('Your browser blocked audio playback. Tap preview again to start the sample.');
    }
  };

  const selectPack = (slug) => {
    setSelectedSlug(slug);
    setError('');
    window.requestAnimationFrame(() => {
      document.getElementById('pack-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const startPurchase = async (event) => {
    event.preventDefault();
    if (!selectedPack) return;
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email so Stripe and Cognistration can deliver your pack.');
      return;
    }

    setError('');
    setPurchasing(true);
    try {
      await redirectToStripeCheckout({
        planId: selectedPack.slug,
        priceId: packPriceId(selectedPack),
        mode: 'payment',
        email: normalizedEmail,
        fallbackPath: '/packs'
      });
    } catch {
      setError('Checkout could not open. Please try again in a moment.');
      setPurchasing(false);
    }
  };

  const updatePreviewTime = () => {
    const nextTime = audioRef.current?.currentTime || 0;
    if (nextTime >= PREVIEW_LIMIT_SEC) {
      stopPreview();
      return;
    }
    setPreviewTime(nextTime);
  };

  return (
    <div ref={rootRef} className="relative isolate">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[44rem] w-[72rem] -translate-x-1/2 rounded-full bg-cyan-200/[0.045] blur-[140px]" />
        <div className="absolute inset-x-0 top-[46rem] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <section className="mx-auto grid min-h-[92dvh] max-w-[1400px] items-center gap-14 px-5 pb-20 pt-32 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24 lg:pt-36">
        <div className="catalog-reveal opacity-0">
          <h1 className="max-w-4xl text-5xl font-extralight leading-[0.94] tracking-[-0.055em] text-white md:text-7xl lg:text-[5.5rem]">
            Find the frequency for <span className="text-white/35">right now.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-light leading-8 text-white/55 md:text-xl">
            Ten purpose-built collections for the moments when you need to focus, come down, create, sleep, or simply get away from the noise.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-white/45">
            <span className="flex items-center gap-2"><Check weight="bold" className="size-4 text-cyan-200" /> 10 full sessions</span>
            <span className="flex items-center gap-2"><Check weight="bold" className="size-4 text-cyan-200" /> About 50 minutes</span>
            <span className="flex items-center gap-2"><Check weight="bold" className="size-4 text-cyan-200" /> Yours to keep</span>
          </div>
          <a href="#catalog" className="mt-12 inline-flex items-center gap-3 border-b border-white/20 pb-2 text-xs uppercase tracking-[0.24em] text-white transition hover:border-cyan-200 hover:text-cyan-100">
            Browse the collection <ArrowDown className="size-4" />
          </a>
        </div>

        <div className="catalog-reveal relative opacity-0">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1314]/90 p-6 shadow-[0_40px_100px_-55px_rgba(72,211,224,0.45)] md:p-9">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
            <div className="relative">
              <div className="flex items-start justify-between border-b border-white/10 pb-7">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">Frequency map</p>
                  <p className="mt-2 text-2xl font-light tracking-tight">Five states. One library.</p>
                </div>
                <Waveform weight="thin" className="size-8 text-cyan-200/70" />
              </div>
              <div className="mt-8 space-y-5">
                {SIGNAL_STATES.map(([name, range], rowIndex) => (
                  <div key={name} className="grid grid-cols-[4rem_1fr_3.5rem] items-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">{name}</span>
                    <div className="flex h-5 items-center gap-1 overflow-hidden">
                      {Array.from({ length: 15 }).map((_, barIndex) => (
                        <span
                          key={barIndex}
                          className="hero-signal-bar h-px flex-1 origin-left bg-cyan-100/70"
                          style={{ opacity: 0.2 + ((barIndex + rowIndex) % 5) * 0.12 }}
                        />
                      ))}
                    </div>
                    <span className="text-right text-[10px] tabular-nums text-white/30">{range}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-7">
                <div>
                  <p className="text-3xl font-extralight">$5.99</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/30">one time / any pack</p>
                </div>
                <div className="border-l border-white/10 pl-5">
                  <p className="text-3xl font-extralight">30 sec</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/30">preview every pack</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/10 bg-[#121819] px-5 py-4 shadow-2xl md:block">
            <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-100/55">Headphones recommended</p>
          </div>
        </div>
      </section>

      <CylinderPackCatalog
        packs={packs}
        loading={loading}
        selectedSlug={selectedSlug}
        activeTrackKey={activeTrackKey}
        previewTime={previewTime}
        onPreview={preview}
        onSelect={selectPack}
      />

      {selectedPack && (
        <section id="pack-details" className="scroll-mt-24 border-t border-white/10 px-5 py-24 md:px-10 lg:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 md:p-12">
              <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-10 sm:flex-row sm:items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/55">Your selection</p>
                  <h2 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-white md:text-6xl">{selectedPack.name}</h2>
                </div>
                <div className="sm:text-right">
                  <p className="text-4xl font-extralight">{selectedPack.price || '$5.99'}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/30">one-time purchase</p>
                </div>
              </div>

              <p className="mt-10 max-w-3xl text-lg font-light leading-8 text-white/55">{selectedPack.description}</p>

              <div className="mt-10 grid gap-8 border-y border-white/10 py-8 sm:grid-cols-2">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.24em] text-white/30">Built for</p>
                  <ul className="mt-5 space-y-3">
                    {(selectedPack.bestFor || []).map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm capitalize text-white/65"><Check weight="bold" className="size-4 text-cyan-100" />{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.24em] text-white/30">Frequency states</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(selectedPack.states || []).map((state) => (
                      <span key={state.state || state} className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/60">{displayState(state)}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-xs text-white/40">
                <span>{selectedPack.trackCount || selectedPack.tracks?.length || 10} full audio sessions</span>
                <span>{selectedPack.durationLabel || 'About 50 minutes total'}</span>
                <span>Download after payment</span>
              </div>
            </div>

            <form onSubmit={startPurchase} className="relative overflow-hidden rounded-[2rem] border border-cyan-100/20 bg-cyan-100/[0.07] p-7 md:p-10 lg:sticky lg:top-28 lg:self-start">
              <div className="absolute right-0 top-0 size-56 translate-x-1/3 -translate-y-1/3 rounded-full bg-cyan-100/10 blur-3xl" />
              <div className="relative">
                <Sparkle weight="thin" className="size-8 text-cyan-100/70" />
                <h2 className="mt-8 text-3xl font-extralight tracking-[-0.035em] text-white">Make it yours.</h2>
                <p className="mt-4 text-sm font-light leading-7 text-white/50">Enter the email where you want the download link. Stripe handles payment, and your pack is delivered immediately. No account needed.</p>

                <label className="mt-8 block text-[9px] uppercase tracking-[0.24em] text-white/40" htmlFor="pack-email">Delivery email</label>
                <div className="mt-3 flex items-center gap-3 border-b border-white/20 pb-3 transition focus-within:border-cyan-100">
                  <EnvelopeSimple weight="thin" className="size-5 text-white/35" />
                  <input
                    id="pack-email"
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent py-2 text-base font-light text-white outline-none placeholder:text-white/20"
                  />
                </div>

                <button type="submit" disabled={purchasing || loading || !packPriceId(selectedPack)} className="mt-7 inline-flex w-full items-center justify-between rounded-full bg-cyan-100 px-6 py-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#071012] transition hover:bg-white active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50">
                  {purchasing ? 'Opening secure checkout…' : `Buy for ${selectedPack.price || '$5.99'}`}
                  <ArrowRight className="size-4" />
                </button>

                <div className="mt-7 flex items-start gap-3 border-t border-white/10 pt-6 text-xs font-light leading-5 text-white/35">
                  <ShieldCheck weight="thin" className="mt-0.5 size-5 shrink-0 text-cyan-100/60" />
                  One payment. Secure checkout. The audio is an intentional listening tool, not medical treatment or a guaranteed outcome.
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="border-t border-white/10 px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <Headphones weight="thin" className="size-9 text-cyan-100/70" />
            <h2 className="mt-6 text-3xl font-extralight tracking-[-0.035em] md:text-4xl">Preview. Choose. Press play.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ['01', 'Listen', 'Try the embedded 30-second sample on any collection.'],
              ['02', 'Choose', 'Open the pack that matches the state you want to practice.'],
              ['03', 'Download', 'Pay once and receive the full collection by email.']
            ].map(([number, title, copy]) => (
              <div key={number} className="border-l border-white/10 pl-5">
                <p className="text-[9px] tracking-[0.2em] text-cyan-100/50">{number}</p>
                <p className="mt-4 text-sm text-white/75">{title}</p>
                <p className="mt-2 text-xs font-light leading-6 text-white/35">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-amber-200/20 bg-[#171714]/95 px-5 py-4 text-sm text-amber-50 shadow-2xl backdrop-blur-xl" role="status">
          {error}
        </div>
      )}

      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={updatePreviewTime}
        onEnded={stopPreview}
      />
    </div>
  );
}
