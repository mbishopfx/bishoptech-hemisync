'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Headphones, Pause, Play } from '@phosphor-icons/react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';
import { isHomepageGeneratedTone } from '@/lib/audio/homepage-tones';
import { TONE_PACKS, getTonePackPriceId } from '@/lib/audio/tone-packs.db.mjs';
import { buildAbsoluteUrl } from '@/lib/seo';
import { LIFETIME_PLAN } from '@/lib/billing/plans';

const lifetimeOffer = {
  id: LIFETIME_PLAN.id,
  price: '$20',
  mode: 'payment'
};

const planFeatures = [
  'Full Workshop and Studio access',
  'Private projects and saved sessions',
  'Editable listening journeys',
  'Finished MP3 exports',
  'Secure downloads and email delivery',
  'Lifetime access with no monthly cost'
];

const packColors = [
  'from-[#294f49] via-[#6f9c87] to-[#d3b37c]',
  'from-[#3c475e] via-[#7d91a9] to-[#d4c8a8]',
  'from-[#5a493f] via-[#b68d68] to-[#e3d3ae]',
  'from-[#304d57] via-[#57928d] to-[#c6d7c5]'
];

function trackUrl(track) {
  return track?.preview_url || track?.previewUrl || track?.webmUrl || track?.wavUrl || track?.mp3Url || track?.download_url || track?.downloadUrl || track?.webm_url || track?.wav_url || track?.mp3_url || track?.playUrl || null;
}

function toneId(tone) {
  return tone?.track_id || tone?.trackId || tone?.id || trackUrl(tone);
}

export default function PricingPage() {
  const [previewTracks, setPreviewTracks] = useState(() => TONE_PACKS[0]?.tracks?.slice(0, 6) || []);
  const [activePreviewTone, setActivePreviewTone] = useState(null);
  const [loadingPreviewTracks, setLoadingPreviewTracks] = useState(true);
  const [playingToneId, setPlayingToneId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const audioRef = useRef(null);

  const tonePack = TONE_PACKS[0];
  const tonePackPriceId = getTonePackPriceId(tonePack);

  const handlePlayTone = useCallback((tone) => {
    const url = trackUrl(tone);
    const audio = audioRef.current;
    if (!url || !audio) return;

    const id = toneId(tone);
    if (playingToneId === id && isPlaying) {
      audio.pause();
      return;
    }

    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    setPlayingToneId(id);
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      setIsPlaying(false);
      setPlayingToneId(null);
    });
  }, [isPlaying, playingToneId]);

  useEffect(() => {
    let cancelled = false;
    const previewAudio = audioRef.current;
    const storedPreview = window.localStorage.getItem('active-preview-tone');
    if (storedPreview) {
      try {
        const parsed = JSON.parse(storedPreview);
        if (isHomepageGeneratedTone(parsed) && !cancelled) setActivePreviewTone(parsed);
      } catch {
        window.localStorage.removeItem('active-preview-tone');
      }
    }

    fetch('/api/audio/preview-tone')
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.ok && data.tone && !storedPreview) setActivePreviewTone(data.tone);
      })
      .catch(() => {});

    fetch('/api/packs')
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json();
        return data.ok && Array.isArray(data.packs) ? data.packs[0]?.tracks || [] : null;
      })
      .then((tracks) => {
        if (!cancelled && tracks?.length) setPreviewTracks(tracks.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingPreviewTracks(false);
      });

    return () => {
      cancelled = true;
      previewAudio?.pause();
    };
  }, []);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      await redirectToStripeCheckout({
        planId: lifetimeOffer.id,
        priceId: LIFETIME_PLAN.priceId,
        mode: lifetimeOffer.mode,
        fallbackPath: '/signup'
      });
    } catch {
      window.location.href = '/signup';
    } finally {
      setCheckoutLoading(false);
    }
  };

  const pricingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pricing | Cognistration',
    url: buildAbsoluteUrl('/pricing'),
    description: 'One complete private Cognistration audio studio with lifetime access for a one-time $20 payment.'
  };

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#eef1ee] text-[#1d302c] selection:bg-[#b6ddcc]/60">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }} />
      <PublicHeader />

      <main className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-36">
        <section className="grid items-end gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24">
          <div className="max-w-3xl">
            <h1 className="max-w-[11ch] text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl">One payment. A complete place to practice.</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#60716b] sm:text-lg">Build and keep private listening sessions for focus, rest, reflection, and intentional reset. Your account activates through secure Stripe checkout, with no monthly billing.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button type="button" onClick={handleCheckout} disabled={checkoutLoading} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1d302c] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#315e55] active:translate-y-px disabled:opacity-60">
                {checkoutLoading ? 'Opening checkout…' : 'Unlock the workspace'} <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
              </button>
              <Link href="/signup" className="text-sm font-medium text-[#315e55] underline decoration-[#315e55]/30 underline-offset-8 hover:text-[#1d302c]">Create an account first</Link>
            </div>
          </div>

          <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-[#cbd6cf] bg-white/90 p-7 shadow-[0_24px_70px_rgba(45,65,59,0.1)] backdrop-blur-xl sm:p-9">
            <div className="flex items-start justify-between gap-5 border-b border-[#dbe2dd] pb-7">
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.04em]">Lifetime workspace</h2>
                <p className="mt-2 text-sm text-[#7a8983]">Everything needed to make sessions your own.</p>
              </div>
              <span className="text-4xl font-medium tracking-[-0.06em]">{lifetimeOffer.price}</span>
            </div>
            <ul className="mt-7 space-y-4">
              {planFeatures.map((feature) => <li key={feature} className="flex items-center gap-3 text-sm text-[#4e625b]"><Check className="size-4 shrink-0 text-[#548477]" weight="bold" aria-hidden="true" />{feature}</li>)}
            </ul>
          </motion.aside>
        </section>

        <section id="listen" className="mt-24 border-t border-[#cbd6cf] pt-20 sm:mt-32 sm:pt-28">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div className="max-w-md">
              <Headphones className="size-8 text-[#548477]" weight="duotone" aria-hidden="true" />
              <h2 className="mt-6 text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-5xl">Listen before you choose.</h2>
              <p className="mt-5 text-base leading-7 text-[#60716b]">Start with a short preview, then decide whether a private workspace or a finished tone pack fits the way you want to listen.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[1.75rem] border border-[#cbd6cf] bg-[#f7f8f5] p-6">
                <p className="text-sm font-medium text-[#315e55]">Your current preview</p>
                {activePreviewTone ? (
                  <>
                    <h3 className="mt-8 text-2xl font-medium tracking-[-0.04em]">{activePreviewTone.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#66746f]">{activePreviewTone.description || activePreviewTone.summary}</p>
                    <button type="button" onClick={() => handlePlayTone(activePreviewTone)} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1d302c] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#315e55] active:translate-y-px">
                      {playingToneId === toneId(activePreviewTone) && isPlaying ? <Pause className="size-4" weight="fill" aria-hidden="true" /> : <Play className="size-4" weight="fill" aria-hidden="true" />}
                      {playingToneId === toneId(activePreviewTone) && isPlaying ? 'Pause preview' : 'Play preview'}
                    </button>
                  </>
                ) : <p className="mt-8 text-sm leading-6 text-[#7a8983]">Try an intention on the homepage and your selected session will appear here.</p>}
              </div>

              <div className="rounded-[1.75rem] border border-[#cbd6cf] bg-white/75 p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-[#315e55]">Featured library</p>
                  <span className="text-xs text-[#7a8983]">30-second samples</span>
                </div>
                <div className="mt-6 space-y-3">
                  {loadingPreviewTracks ? <div className="h-12 animate-pulse rounded-xl bg-[#e5ece7]" /> : previewTracks.slice(0, 4).map((tone) => {
                    const id = toneId(tone);
                    return <div key={id} className="flex items-center gap-3 border-b border-[#e1e8e2] pb-3 last:border-b-0 last:pb-0"><button type="button" onClick={() => handlePlayTone(tone)} className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#bfcfc5] text-[#315e55] transition hover:border-[#6b9587] hover:bg-[#edf4ef]" aria-label={`${playingToneId === id && isPlaying ? 'Pause' : 'Play'} ${tone.name}`}><span>{playingToneId === id && isPlaying ? <Pause className="size-4" weight="fill" aria-hidden="true" /> : <Play className="size-4" weight="fill" aria-hidden="true" />}</span></button><div className="min-w-0"><p className="truncate text-sm font-medium text-[#31443e]">{tone.name}</p><p className="truncate text-xs text-[#7a8983]">{tone.summary || tone.description}</p></div></div>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tone-packs" className="mt-24 border-t border-[#cbd6cf] pt-20 sm:mt-32 sm:pt-28">
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl"><h2 className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-5xl">Finished sessions when you want a place to start.</h2><p className="mt-5 text-base leading-7 text-[#60716b]">Tone packs are separate one-time purchases. Browse the full collection when you know what kind of listening practice you want to keep nearby.</p></div>
            <Link href="/packs" className="shrink-0 text-sm font-medium text-[#315e55] underline decoration-[#315e55]/30 underline-offset-8 hover:text-[#1d302c]">Browse tone packs</Link>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {TONE_PACKS.slice(0, 4).map((pack, index) => <Link key={pack.slug} href="/packs" className="group rounded-[1.5rem] border border-[#cbd6cf] bg-white/70 p-3 shadow-[0_14px_36px_rgba(45,65,59,0.06)] transition hover:-translate-y-1 hover:border-[#9db9aa]"><div className={`aspect-[1.15] rounded-[1.1rem] bg-gradient-to-br ${packColors[index]} p-4 text-white`}><div className="flex h-full flex-col justify-between"><span className="text-[10px] uppercase tracking-[0.16em] text-white/75">Cognistration</span><span className="max-w-[11ch] text-2xl font-medium leading-[0.95] tracking-[-0.045em]">{pack.name}</span></div></div><div className="flex items-center justify-between gap-3 p-3"><p className="text-sm font-medium text-[#31443e]">{pack.name}</p><span className="text-sm text-[#66746f]">{pack.price}</span></div></Link>)}
          </div>
        </section>

        <section className="mt-24 rounded-[2rem] bg-[#202b28] px-7 py-10 text-white sm:mt-32 sm:px-12 sm:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div><h2 className="text-3xl font-medium tracking-[-0.045em] sm:text-4xl">Ready to make space for the next moment?</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">Create your account, explore the public library, and unlock the private tools when you are ready to keep building.</p></div>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d7eadf] px-5 py-3.5 text-sm font-medium text-[#17332e] transition hover:bg-white active:translate-y-px">Create your account <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></Link>
          </div>
        </section>
      </main>

      <audio ref={audioRef} preload="none" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => { setIsPlaying(false); setPlayingToneId(null); }} aria-label="Cognistration tone preview" />
      <PublicTrustFooter />
    </div>
  );
}
