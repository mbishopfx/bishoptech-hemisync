'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TONE_PACKS, getTonePackPriceId } from '@/lib/audio/tone-packs.db.mjs';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';

function trackUrl(track) {
  return (
    track?.preview_url ||
    track?.previewUrl ||
    track?.download_url ||
    track?.downloadUrl ||
    track?.webm_url ||
    track?.webmUrl ||
    track?.mp3_url ||
    track?.mp3Url
  );
}

export function HomepageTonePacksSection() {
  const [packs, setPacks] = useState(TONE_PACKS);
  const [activePreview, setActivePreview] = useState(null); // { packSlug, trackUrl }
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkoutPack, setCheckoutPack] = useState(null); // pack being purchased in modal
  const [email, setEmail] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/packs')
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.ok && data.packs?.length) {
          setPacks(data.packs);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePreview = (pack) => {
    const sampleTrack = pack.tracks?.[0];
    const url = trackUrl(sampleTrack) || 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_082433_69699cf8-444b-4484-93cc-053e57896dfd.mp4';

    if (activePreview?.packSlug === pack.slug && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setActivePreview({ packSlug: pack.slug, url });
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const handleOpenCheckout = (pack) => {
    setCheckoutPack(pack);
    setError('');
  };

  const handleStartPurchase = async (e) => {
    e.preventDefault();
    if (!checkoutPack) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address for delivery.');
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
    } catch (err) {
      setError('Checkout failed to initialize. Please try again.');
      setPurchasing(false);
    }
  };

  return (
    <section id="tone-packs" className="relative w-full bg-black text-white pt-24 pb-32 px-6 overflow-hidden">
      {/* Background ambient dark glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-[10px] font-mono uppercase tracking-[0.25em]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Curated Neuromodulation
          </div>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-white leading-tight">
            Select Your <span className="text-white/40 italic">Tone Pack.</span>
          </h2>
          <p className="text-white/50 text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed">
            Downloadable 50-minute binaural frequency sessions. Pay once ($5.99), keep forever, no account required.
          </p>
        </div>

        {/* Tone Packs Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => {
            const price = pack.price || '$5.99';
            const isCurrentlyPlaying = activePreview?.packSlug === pack.slug && isPlaying;

            return (
              <motion.div
                key={pack.slug}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="liquid-glass rounded-3xl p-7 border border-white/10 bg-zinc-950/60 backdrop-blur-2xl flex flex-col justify-between gap-6 hover:border-cyan-500/30 transition-all duration-300 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="space-y-4">
                  {/* Eyebrow & Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-400/90 font-medium">
                      {pack.eyebrow || 'Frequency Pack'}
                    </span>
                    <span className="text-xl font-light text-white tracking-tight">{price}</span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-2xl font-medium text-white group-hover:text-cyan-200 transition-colors">
                      {pack.name}
                    </h3>
                    <p className="text-white/60 text-sm font-light mt-2 leading-relaxed">
                      {pack.summary || pack.description}
                    </p>
                  </div>

                  {/* Best For Tags */}
                  {pack.bestFor && pack.bestFor.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {pack.bestFor.map((item) => (
                        <span
                          key={item}
                          className="text-[10px] font-mono text-white/50 bg-white/5 border border-white/10 rounded-full px-3 py-1 capitalize"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => handlePreview(pack)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/80 text-[10px] font-mono uppercase tracking-widest py-3 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm text-cyan-400">
                        {isCurrentlyPlaying ? 'pause' : 'play_arrow'}
                      </span>
                      {isCurrentlyPlaying ? 'Playing' : 'Preview'}
                    </button>

                    {/* Quick Action CTA Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(pack)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 text-black font-semibold text-[10px] font-mono uppercase tracking-widest py-3 hover:bg-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    >
                      Buy Pack
                    </button>
                  </div>

                  <p className="text-center text-[9px] font-mono text-white/30 uppercase tracking-widest">
                    About 50 min • MP3/WebM Audio
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Global Preview Audio Player */}
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Quick Purchase Email Modal Overlay */}
      <AnimatePresence>
        {checkoutPack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="liquid-glass w-full max-w-md rounded-3xl border border-cyan-500/30 bg-zinc-950 p-8 text-white space-y-6 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setCheckoutPack(null)}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
                  Instant Download Checkout
                </span>
                <h3 className="text-2xl font-medium mt-1 text-white">{checkoutPack.name}</h3>
                <p className="text-white/50 text-xs mt-1">
                  {checkoutPack.price || '$5.99'} • One-time payment
                </p>
              </div>

              <form onSubmit={handleStartPurchase} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="checkout-email" className="text-xs font-mono text-white/60 uppercase tracking-wider block">
                    Your Delivery Email
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-white/30"
                  />
                  <p className="text-[10px] text-white/40">
                    Your audio download link will be emailed immediately after Stripe checkout.
                  </p>
                </div>

                {error && <p className="text-xs text-rose-400">{error}</p>}

                <button
                  type="submit"
                  disabled={purchasing}
                  className="w-full rounded-2xl bg-cyan-400 text-black font-semibold text-xs font-mono uppercase tracking-widest py-4 hover:bg-white transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)] disabled:opacity-50"
                >
                  {purchasing ? 'Opening Checkout...' : `Proceed to Pay ${checkoutPack.price || '$5.99'}`}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                  🔒 Encrypted Stripe Checkout • No Account Required
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
