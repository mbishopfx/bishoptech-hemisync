'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, Mail, Play, ShieldCheck, Sparkles } from 'lucide-react';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';
import { TONE_PACKS, getTonePackPriceId } from '@/lib/audio/tone-packs.db.mjs';

const PREVIEW_LIMIT_SEC = 30;

function trackId(track) {
  return track.track_id || track.trackId || track.id;
}

function trackName(track) {
  return track.track_name || track.trackName || track.name || 'Cognistration session';
}

function trackUrl(track) {
  return track.preview_url || track.previewUrl || track.download_url || track.downloadUrl || track.webm_url || track.webmUrl || track.mp3_url || track.mp3Url;
}

function packPriceId(pack) {
  return pack.priceId || getTonePackPriceId(pack);
}

export function PacksBrowser() {
  const [packs, setPacks] = useState(TONE_PACKS);
  const [selectedSlug, setSelectedSlug] = useState(TONE_PACKS[0]?.slug || '');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [activeTrackId, setActiveTrackId] = useState(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const selectedPack = useMemo(
    () => packs.find((pack) => pack.slug === selectedSlug) || packs[0] || null,
    [packs, selectedSlug]
  );

  useEffect(() => {
    let cancelled = false;
    const previewAudio = audioRef.current;
    fetch('/api/packs')
      .then(async (res) => {
        const text = await res.text();
        const data = res.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : null;
        if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to load pack catalog');
        if (!cancelled && data.packs?.length) {
          setPacks(data.packs);
          setSelectedSlug((current) => data.packs.some((pack) => pack.slug === current) ? current : data.packs[0].slug);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'The catalog could not be refreshed.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      previewAudio?.pause();
    };
  }, []);

  const stopPreview = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveTrackId(null);
  };

  const preview = async (track) => {
    const url = trackUrl(track);
    if (!url || !audioRef.current) return;
    const id = trackId(track);
    if (activeTrackId === id) {
      stopPreview();
      return;
    }

    stopPreview();
    audioRef.current.src = url;
    audioRef.current.load();
    try {
      await audioRef.current.play();
      setActiveTrackId(id);
      timerRef.current = setTimeout(stopPreview, PREVIEW_LIMIT_SEC * 1000);
    } catch (err) {
      setError('Preview playback was blocked. Use the native player on the track card instead.');
    }
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
    await redirectToStripeCheckout({
      planId: selectedPack.slug,
      priceId: packPriceId(selectedPack),
      mode: 'payment',
      email: normalizedEmail,
      fallbackPath: '/packs'
    });
  };

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/10 bg-zinc-950/70 p-8 md:p-14">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative max-w-4xl space-y-7">
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-300">Cognistration tone packs</p>
          <h1 className="max-w-4xl text-4xl font-light tracking-tighter text-white md:text-7xl">Pick the state you want to practice.</h1>
          <p className="max-w-3xl text-base leading-8 text-white/65 md:text-lg">
            Ten focused audio collections built from the Cognistration tone library. Preview the direction, choose the pack that matches your moment, pay once, and receive about 50 minutes of downloadable audio.
          </p>
          <div className="grid gap-3 text-sm text-white/75 sm:grid-cols-3">
            {[
              ['01', 'Choose a pack', 'Start with the state or routine you want to support.'],
              ['02', 'Enter your email', 'No account is required. Your email is only used for delivery.'],
              ['03', 'Pay and download', 'Stripe confirms payment, then the pack download starts automatically.']
            ].map(([number, title, copy]) => (
              <div key={number} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-mono tracking-[0.25em] text-cyan-300">{number}</p>
                <p className="mt-3 font-medium text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-white/45">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-purple-300">The catalog</p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-white md:text-4xl">Ten ways into the library.</h2>
          </div>
          <p className="max-w-md text-right text-sm leading-6 text-white/45">Every pack is the same one-time price. Choose by the state or use-case that sounds most like the session you need today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packs.map((pack) => {
            const selected = selectedPack?.slug === pack.slug;
            return (
              <button
                key={pack.slug}
                type="button"
                onClick={() => { setSelectedSlug(pack.slug); setError(''); }}
                className={`group text-left rounded-[1.75rem] border p-6 transition-all ${selected ? 'border-cyan-300/35 bg-cyan-300/[0.08] shadow-[0_0_40px_rgba(34,211,238,0.08)]' : 'border-white/10 bg-zinc-950/45 hover:border-white/20 hover:bg-white/[0.04]'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.22em] text-white/50">{pack.eyebrow}</span>
                  {selected && <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-200">Selected</span>}
                </div>
                <h3 className="mt-6 text-2xl font-light tracking-tight text-white">{pack.name}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{pack.summary}</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
                  <span>{pack.price || '$5.99'} one time</span>
                  <span>{pack.durationLabel || 'About 50 min'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedPack && (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-zinc-950/55 p-7 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-300">Selected pack</p>
                <h2 className="mt-3 text-3xl font-light tracking-tight text-white">{selectedPack.name}</h2>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-right">
                <p className="text-2xl font-light text-white">{selectedPack.price || '$5.99'}</p>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-100/70">one-time</p>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/60">{selectedPack.description}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {(selectedPack.bestFor || []).map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-white/70"><Check className="size-4 text-cyan-300" />{item}</div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-purple-300"><Sparkles className="size-3" /> Brain-state guide</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(selectedPack.states || []).map((state) => (
                  <span key={state.state || state} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/65">{state.displayName || state.label || state}</span>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={startPurchase} className="rounded-[2rem] border border-cyan-300/15 bg-cyan-300/[0.05] p-7 md:p-10">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-300">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-light tracking-tight text-white">Get the full pack.</h2>
            <p className="mt-4 text-sm leading-6 text-white/55">Enter your email once. Stripe handles payment, then Cognistration starts the download and emails you a backup link. No account, password, or follow-up form.</p>
            <label className="mt-7 block text-[10px] font-mono uppercase tracking-[0.25em] text-white/50" htmlFor="pack-email">Delivery email</label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/25 px-4 focus-within:border-cyan-300/50">
              <Mail className="size-4 text-white/35" />
              <input id="pack-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-white/25" />
            </div>
            <button type="submit" disabled={purchasing || loading || !packPriceId(selectedPack)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-4 text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
              {purchasing ? 'Opening Stripe…' : `Buy ${selectedPack.name}`} <ChevronRight className="size-4" />
            </button>
            <div className="mt-5 flex items-start gap-3 text-xs leading-5 text-white/40"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />One-time purchase. Your email is used for receipt and pack delivery. Audio is an intentional listening tool, not medical treatment or a guaranteed outcome.</div>
          </form>
        </section>
      )}

      <section className="rounded-[2rem] border border-white/10 bg-zinc-950/45 p-7 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-purple-300">Preview the selected pack</p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-white">Hear the direction before you buy.</h2>
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/35">30-second previews</p>
        </div>
        {selectedPack?.tracks?.length ? (
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {selectedPack.tracks.map((track) => (
              <div key={trackId(track)} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{trackName(track)}</p>
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">{track.state || 'Cognistration'} · {track.duration_sec ? `${Math.round(track.duration_sec / 60)} min` : 'full session'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => preview(track)} className="inline-flex size-9 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-200" aria-label={`Preview ${trackName(track)}`}><Play className="size-3" /></button>
                  <audio controls preload="none" src={trackUrl(track) || undefined} className="h-9 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm leading-6 text-white/45">The weekly pack builder is refreshing the full track manifests. The pack selections above are live now; previews appear as each bundle is published.</div>
        )}
      </section>

      {error && <div className="rounded-2xl border border-red-300/20 bg-red-300/10 px-5 py-4 text-sm text-red-100">{error}</div>}
      <audio ref={audioRef} preload="none" onEnded={() => setActiveTrackId(null)} />
    </div>
  );
}
