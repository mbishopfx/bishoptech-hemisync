'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, X } from '@phosphor-icons/react';
import { TONE_PACKS, getTonePackPriceId } from '@/lib/audio/tone-packs.db.mjs';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';
import { ScrollRevealHeading } from '@/components/marketing/ScrollRevealHeading';

const COVER_STYLES = [
  'from-[#294f49] via-[#6f9c87] to-[#d3b37c]',
  'from-[#3c475e] via-[#7d91a9] to-[#d4c8a8]',
  'from-[#5a493f] via-[#b68d68] to-[#e3d3ae]',
  'from-[#304d57] via-[#57928d] to-[#c6d7c5]',
  'from-[#4d3e58] via-[#9a7fb2] to-[#d3c1a2]'
];

function trackUrl(track) {
  return track?.preview_url || track?.previewUrl || track?.download_url || track?.downloadUrl || track?.webm_url || track?.webmUrl || track?.mp3_url || track?.mp3Url || null;
}

export function HomepageTonePacksSection() {
  const [packs, setPacks] = useState(TONE_PACKS);
  const [activePreview, setActivePreview] = useState(null);
  const [checkoutPack, setCheckoutPack] = useState(null);
  const [email, setEmail] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/packs')
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data.ok && data.packs?.length) setPacks(data.packs);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handlePreview = (pack) => {
    const url = trackUrl(pack.tracks?.[0]);
    if (!url) {
      setError(`${pack.name} does not have a preview available yet.`);
      return;
    }

    if (activePreview?.packSlug === pack.slug && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      return;
    }

    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = url;
    audioRef.current.load();
    audioRef.current.play().then(() => {
      setError('');
      setActivePreview({ packSlug: pack.slug });
    }).catch(() => setError('This preview could not be played in the current browser.'));
  };

  const handleStartPurchase = async (event) => {
    event.preventDefault();
    if (!checkoutPack) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address for delivery.');
      return;
    }

    setPurchasing(true);
    setError('');
    try {
      const priceId = checkoutPack.priceId || getTonePackPriceId(checkoutPack) || 'price_1TnAxaDJtpuPVfuFmN7TO2PS';
      await redirectToStripeCheckout({
        planId: checkoutPack.slug,
        priceId,
        mode: 'payment',
        email: normalizedEmail,
        fallbackPath: '/packs'
      });
    } catch {
      setError('Checkout could not be opened. Please try again.');
      setPurchasing(false);
    }
  };

  return (
    <section id="tone-packs" aria-labelledby="tone-packs-title" className="relative overflow-hidden bg-[#eef1ee] py-24 text-[#1d302c] sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <ScrollRevealHeading id="tone-packs-title" className="text-4xl font-medium leading-[1.04] tracking-[-0.055em] sm:text-6xl">A library built around the way you want to feel.</ScrollRevealHeading>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#52635f] sm:text-lg">Explore finished listening sessions for focus, rest, and open-ended thinking. Pick one, press play, and keep the ones that become part of your rhythm.</p>
          </div>
          <a href="/packs" className="shrink-0 text-sm font-medium text-[#315e55] underline decoration-[#315e55]/30 underline-offset-8 transition hover:text-[#1d302c]">Browse the full library</a>
        </div>

        <div className="mt-14 -mx-5 overflow-x-auto px-5 pb-8 pt-8 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12" role="list" aria-label="Tone packs">
          <div className="flex w-max gap-5">
            {packs.map((pack, index) => {
              const isPlaying = activePreview?.packSlug === pack.slug && audioRef.current && !audioRef.current.paused;
              const trackCount = pack.trackCount || pack.tracks?.length || 0;
              return (
                <motion.article key={pack.slug} role="listitem" data-cursor-surface whileHover={{ y: -7, scale: 1.01 }} whileTap={{ scale: 0.995 }} transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.8 }} className="flex w-[min(82vw,360px)] flex-col rounded-[1.75rem] border border-[#c7d2cb] bg-white/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_42px_rgba(45,65,59,0.08)] backdrop-blur-xl sm:w-[360px]">
                  <div className={`relative aspect-square overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${COVER_STYLES[index % COVER_STYLES.length]} p-6`}>
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 22% 22%, rgba(255,255,255,.85) 0 1px, transparent 1.5px), radial-gradient(circle at 75% 66%, rgba(255,255,255,.55) 0 1px, transparent 1.5px)', backgroundSize: '23px 23px, 31px 31px' }} />
                    <div className="relative flex h-full flex-col justify-between text-white">
                      <div className="flex items-start justify-between text-xs font-medium uppercase tracking-[0.16em] text-white/75"><span>cognistration</span><span>{String(index + 1).padStart(2, '0')}</span></div>
                      <div><p className="max-w-[12ch] text-4xl font-medium leading-[0.95] tracking-[-0.06em]">{pack.name}</p><p className="mt-3 text-xs text-white/70">A finished session for your next chapter.</p></div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-medium tracking-[-0.03em]">{pack.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#66746f]">{pack.summary || pack.description || 'A considered listening session from the Cognistration library.'}</p></div><span className="shrink-0 text-lg font-medium">{pack.price || '$5.99'}</span></div>
                    <div className="mt-auto pt-6"><div className="flex items-center justify-between border-t border-[#dbe2dd] pt-4 text-xs text-[#788681]"><span>{trackCount || 'Several'} sessions</span><span>One-time purchase</span></div><div className="mt-4 flex gap-2"><button type="button" onClick={() => handlePreview(pack)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#bfcfc5] px-4 py-3 text-sm font-medium text-[#315e55] transition hover:border-[#6b9587] hover:bg-[#f0f5f1]">{isPlaying ? <Pause className="size-4" weight="fill" aria-hidden="true" /> : <Play className="size-4" weight="fill" aria-hidden="true" />}{isPlaying ? 'Pause' : 'Preview'}</button><button type="button" onClick={() => { setCheckoutPack(pack); setError(''); }} className="flex-1 rounded-full bg-[#1d302c] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#315e55]">Get the pack</button></div></div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between"><p className="text-xs text-[#71807b]">Drag sideways to explore the collection.</p>{error && !checkoutPack && <p role="status" className="text-xs text-[#a55e48]">{error}</p>}</div>
      </div>

      <audio ref={audioRef} preload="none" onEnded={() => setActivePreview(null)} onPause={() => setActivePreview(null)} />

      <AnimatePresence>
        {checkoutPack && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#10201c]/75 p-5 backdrop-blur-md" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckoutPack(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} role="dialog" aria-modal="true" aria-labelledby="pack-checkout-title" className="relative w-full max-w-md rounded-[2rem] bg-[#1d302c] p-7 text-white shadow-2xl sm:p-9">
              <button type="button" onClick={() => setCheckoutPack(null)} className="absolute right-5 top-5 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Close checkout"><X className="size-5" aria-hidden="true" /></button>
              <h3 id="pack-checkout-title" className="text-2xl font-medium">{checkoutPack.name}</h3>
              <p className="mt-2 text-sm text-white/60">{checkoutPack.price || '$5.99'} · one-time purchase</p>
              <form onSubmit={handleStartPurchase} className="mt-7 space-y-4"><div><label htmlFor="checkout-email" className="text-sm text-white/70">Delivery email</label><input id="checkout-email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#b6ddcc]" /></div>{error && <p role="alert" className="text-sm text-[#e8aa91]">{error}</p>}<button type="submit" disabled={purchasing} className="w-full rounded-full bg-[#d7eadf] py-3.5 text-sm font-medium text-[#17332e] transition hover:bg-white disabled:opacity-50">{purchasing ? 'Opening checkout…' : `Continue for ${checkoutPack.price || '$5.99'}`}</button></form><p className="mt-5 text-xs leading-5 text-white/40">Stripe handles payment and sends the download link after purchase.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
