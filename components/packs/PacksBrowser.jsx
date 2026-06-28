'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Download, Play, Pause, ShieldCheck, LockKeyhole } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';
import { TONE_PACKS, getTonePackBySlug, getTonePackPriceId } from '@/lib/audio/tone-packs.mjs';

const PREVIEW_LIMIT_SEC = 30;

export function PacksBrowser() {
  const [packs, setPacks] = useState([]);
  const [ownedPackSlugs, setOwnedPackSlugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const pack = packs[0] || null;
  const ownsPack = pack ? ownedPackSlugs.includes(pack.slug) : false;
  const priceId = getTonePackPriceId(getTonePackBySlug('foundations-pack'));
  const checkoutReady = Boolean(priceId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const supabase = getSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token || null;
        const res = await fetch('/api/packs', {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `Failed to load packs (${res.status})`);
        }
        if (!cancelled) {
          setPacks(data.packs || []);
          setOwnedPackSlugs(data.ownedPackSlugs || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load pack catalog');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const packFeatures = useMemo(() => pack?.features || [], [pack]);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setActiveTrackId(null);
  };

  const previewTrack = async (track) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const nextUrl = track.preview_url || track.download_url;
    if (!nextUrl) return;

    if (activeTrackId === track.track_id && isPlaying) {
      stopPlayback();
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    audio.pause();
    audio.src = nextUrl;
    audio.currentTime = 0;
    audio.load();
    setActiveTrackId(track.track_id);

    try {
      await audio.play();
      setIsPlaying(true);
      timerRef.current = setTimeout(() => {
        stopPlayback();
      }, Math.max(1, (track.preview_seconds || PREVIEW_LIMIT_SEC) * 1000));
    } catch (err) {
      console.error('Preview playback failed', err);
      setIsPlaying(false);
    }
  };

  const startPurchase = async () => {
    if (!checkoutReady || !pack) return;
    await redirectToStripeCheckout({
      planId: pack.slug,
      priceId,
      mode: 'payment',
      fallbackPath: '/signup'
    });
  };

  const requestDownload = async (track) => {
    const supabase = getSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || null;
    if (!accessToken) {
      window.location.href = '/signup?plan=free';
      return;
    }

    const res = await fetch(`/api/packs/${pack.slug}/download?trackId=${encodeURIComponent(track.track_id)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Download unavailable');
    }
    window.location.href = data.url;
  };

  return (
    <div className="space-y-10">
      <section className="rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-8 md:p-12 backdrop-blur-3xl">
        <div className="max-w-3xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-purple-300">Tone Packs</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white">Preview the pack before you buy it.</h1>
          <p className="max-w-2xl text-sm md:text-base leading-7 text-white/55">
            Every pack track can be previewed for 30 seconds. Full downloads unlock only after Stripe completes and the purchase is recorded.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startPurchase}
            disabled={!checkoutReady || !pack}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-200 transition-colors hover:bg-cyan-500/15 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Buy {pack?.name || 'Foundations Pack'} {pack?.price || '$5.99'} <ChevronRight className="size-3" />
          </button>
          <Link
            href="/pricing"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Back to Pricing
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/5 bg-zinc-900/30 p-7 md:p-10 backdrop-blur-3xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-300">Catalog</p>
              <h2 className="mt-2 text-3xl font-light tracking-tight text-white">{pack?.name || 'Foundations Pack'}</h2>
            </div>
            <div className="text-right text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
              <div>{pack?.trackCount || 25} tracks</div>
              <div>{pack?.durationLabel || '30 sec preview / 15–20 min full'}</div>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm leading-7 text-white/55">
            <p>{pack?.summary || 'Five states × five carrier variants. Each session is built to feel distinct.'}</p>
            <p>Preview clips stop at 30 seconds so buyers can quickly judge the tone before checkout.</p>
          </div>

          <div className="mt-8 space-y-3">
            {(packFeatures || []).map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex size-5 items-center justify-center rounded-full bg-white/5 text-white/30">
                  <Check className="size-3" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/5 bg-black/30 p-4 text-xs text-white/40">
            {ownsPack ? (
              <div className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="size-4" />
                Purchase verified. Downloads unlocked.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-200">
                <LockKeyhole className="size-4" />
                Downloads stay locked until Stripe completes and the webhook records ownership.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-zinc-900/30 p-7 md:p-10 backdrop-blur-3xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-purple-300">Tracks</p>
              <h2 className="mt-2 text-3xl font-light tracking-tight text-white">Preview and purchase</h2>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">30 second previews</div>
          </div>

          {loading ? (
            <div className="py-14 text-center text-white/30 text-xs font-mono">
              Loading pack catalog…
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : (
            <div className="mt-6 space-y-3 max-h-[620px] overflow-y-auto pr-2 scrollbar-thin">
              {(pack?.tracks || []).map((track) => {
                const active = activeTrackId === track.track_id && isPlaying;
                return (
                  <div
                    key={track.track_id}
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                      active ? 'border-purple-500/30 bg-purple-500/10' : 'border-white/5 bg-black/20 hover:border-white/10'
                    }`}
                  >
                    <div className="min-w-0 space-y-1 text-left">
                      <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-purple-300">
                        <span>{track.state}</span>
                        <span className="text-white/20">•</span>
                        <span>{track.base_freq_hz}Hz carrier</span>
                        <span className="text-white/20">•</span>
                        <span>{track.preview_seconds || PREVIEW_LIMIT_SEC}s preview</span>
                      </div>
                      <h3 className="text-sm font-medium text-white tracking-tight truncate">{track.track_name}</h3>
                      <p className="text-[10px] text-white/35 font-light leading-normal line-clamp-1">{track.short_label}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => previewTrack(track)}
                        className={`size-10 rounded-full flex items-center justify-center transition-all ${
                          active ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                        }`}
                      >
                        {active ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => requestDownload(track).catch((err) => setError(err?.message || 'Download failed'))}
                        disabled={!ownsPack}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Download className="size-3" />
                        {ownsPack ? 'Download' : 'Locked'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setActiveTrackId(null);
        }}
      />
    </div>
  );
}
