'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, LockKeyhole, Mail, Play, ShieldCheck } from 'lucide-react';
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

export function PacksBrowser() {
  const [packs, setPacks] = useState(TONE_PACKS);
  const [selectedSlug, setSelectedSlug] = useState(TONE_PACKS[0]?.slug || '');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const pack = useMemo(
    () => packs.find((item) => item.slug === selectedSlug) || packs[0] || null,
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
          setSelectedSlug((current) => data.packs.some((item) => item.slug === current) ? current : data.packs[0].slug);
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

  const previewTrack = async (track) => {
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
    } catch {
      setError('Preview playback was blocked. Use the native player on the track card instead.');
    }
  };

  const startPurchase = async (event) => {
    event.preventDefault();
    if (!pack) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email so Stripe and Cognistration can deliver your pack.');
      return;
    }

    setError('');
    setPurchasing(true);
    await redirectToStripeCheckout({
      planId: pack.slug,
      priceId: pack.priceId || getTonePackPriceId(pack),
      mode: 'payment',
      email: normalizedEmail,
      fallbackPath: '/packs'
    });
  };

  return (
    <div className="space-y-10">
      <section className="rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-8 backdrop-blur-3xl md:p-12">
        <div className="max-w-3xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-purple-300">Tone Packs</p>
          <h1 className="text-4xl font-light tracking-tighter text-white md:text-6xl">Preview the pack before you buy it.</h1>
          <p className="max-w-2xl text-sm leading-7 text-white/55 md:text-base">
            Choose a brain-state lane or a transition routine, preview the direction, enter your email, and complete the one-time Stripe checkout. Each pack is built for about 50 minutes of listening, with no account required.
          </p>
        </div>
        <div className="mt-8 grid gap-3 text-xs leading-5 text-white/55 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-black/20 p-4"><span className="font-mono text-cyan-300">01</span><p className="mt-2 text-white">Choose your state</p><p className="mt-1">Rest, dream, focus, task drive, insight, or a guided transition.</p></div>
          <div className="rounded-2xl border border-white/5 bg-black/20 p-4"><span className="font-mono text-cyan-300">02</span><p className="mt-2 text-white">Enter your email</p><p className="mt-1">Used for Stripe receipt and a backup download link. No password.</p></div>
          <div className="rounded-2xl border border-white/5 bg-black/20 p-4"><span className="font-mono text-cyan-300">03</span><p className="mt-2 text-white">Download instantly</p><p className="mt-1">After payment, the ZIP download starts and the pack is emailed.</p></div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/5 bg-zinc-900/30 p-7 backdrop-blur-3xl md:p-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-300">Catalog</p>
              <h2 className="mt-2 text-3xl font-light tracking-tight text-white">Choose a pack</h2>
            </div>
            <div className="text-right text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">{packs.length} collections</div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {packs.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => { setSelectedSlug(item.slug); setError(''); }}
                className={`rounded-xl border px-3 py-3 text-left transition-colors ${item.slug === pack?.slug ? 'border-cyan-300/30 bg-cyan-300/10 text-white' : 'border-white/5 bg-black/20 text-white/55 hover:border-white/15 hover:text-white'}`}
              >
                <span className="block text-[9px] font-mono uppercase tracking-[0.16em] text-white/35">{item.eyebrow}</span>
                <span className="mt-1 block text-sm">{item.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-7 border-t border-white/5 pt-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-purple-300">Selected</p>
                <h2 className="mt-2 text-3xl font-light tracking-tight text-white">{pack?.name || 'Tone Pack'}</h2>
              </div>
              <div className="text-right"><p className="text-2xl font-light text-white">{pack?.price || '$5.99'}</p><p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">one-time</p></div>
            </div>
            <p className="mt-5 text-sm leading-7 text-white/55">{pack?.description || pack?.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {(pack?.states || []).map((state) => <span key={state.state || state} className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-white/55">{state.displayName || state.label || state}</span>)}
            </div>
            <div className="mt-7 space-y-3">
              {(pack?.features || []).map((feature) => <div key={feature} className="flex items-center gap-3 text-sm text-white/65"><Check className="size-4 text-cyan-300" />{feature}</div>)}
            </div>
          </div>

          <form onSubmit={startPurchase} className="mt-8 border-t border-white/5 pt-7">
            <label htmlFor="pack-email" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/45"><Mail className="size-3" /> Delivery email</label>
            <input id="pack-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-300/40" />
            <button type="submit" disabled={loading || purchasing || !pack} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-4 text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-200 transition-colors hover:bg-cyan-500/15 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60">{purchasing ? 'Opening Stripe…' : `Buy ${pack?.name || 'Tone Pack'}`} <ChevronRight className="size-3" /></button>
            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-white/35"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />Secure one-time checkout. Your email is used for receipt and delivery only.</div>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-zinc-900/30 p-7 backdrop-blur-3xl md:p-10">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-[10px] font-mono uppercase tracking-[0.35em] text-purple-300">Tracks</p><h2 className="mt-2 text-3xl font-light tracking-tight text-white">Preview and listen</h2></div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">30 second clips</div>
          </div>
          <p className="mt-5 text-sm leading-6 text-white/45">{pack?.summary}</p>
          {pack?.tracks?.length ? <div className="mt-6 max-h-[680px] space-y-3 overflow-y-auto pr-2 scrollbar-thin">{pack.tracks.map((track) => { const id = trackId(track); const active = id === activeTrackId; return <div key={id} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${active ? 'border-purple-500/30 bg-purple-500/10' : 'border-white/5 bg-black/20 hover:border-white/10'}`}><div className="min-w-0"><div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-purple-300"><span>{track.state || 'state'}</span><span className="text-white/20">•</span><span>{track.preview_seconds || PREVIEW_LIMIT_SEC}s preview</span></div><h3 className="mt-1 truncate text-sm text-white">{trackName(track)}</h3><p className="mt-1 text-[10px] text-white/35">{track.short_label || 'Binaural-style preview'}</p></div><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => previewTrack(track)} className="inline-flex size-9 items-center justify-center rounded-full border border-purple-300/20 bg-purple-300/10 text-purple-200" aria-label={`Preview ${trackName(track)}`}><Play className="size-3" /></button><audio controls preload="none" src={trackUrl(track) || undefined} className="h-9 w-28" /></div></div>; })}</div> : <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm leading-6 text-white/45"><LockKeyhole className="mx-auto mb-3 size-5 text-white/25" />The live pack manifest is still syncing. The preview fallback will remain available while the weekly builder refreshes Supabase.</div>}
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-300/20 bg-red-300/10 px-5 py-4 text-sm text-red-100">{error}</div>}
      <audio ref={audioRef} preload="none" onEnded={() => setActiveTrackId(null)} />
    </div>
  );
}
