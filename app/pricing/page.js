'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Headphones, Pause, Play } from '@phosphor-icons/react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { HairlineFigure } from '@/components/brand/HairlineFigure';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';
import { isHomepageGeneratedTone } from '@/lib/audio/homepage-tones';
import { TONE_PACKS, getTonePackPriceId } from '@/lib/audio/tone-packs.db.mjs';
import { buildAbsoluteUrl } from '@/lib/seo';
import { LIFETIME_PLAN, WORKSHOP_PLAN } from '@/lib/billing/plans';

const lifetimeOffer = {
  id: LIFETIME_PLAN.id,
  price: LIFETIME_PLAN.priceLabel,
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

const STATE_LABELS = {
  delta: 'Delta',
  theta: 'Theta',
  alpha: 'Alpha',
  beta: 'Beta',
  gamma: 'Gamma'
};

function previewTrackName(tone) {
  return tone?.name
    || tone?.track_name
    || tone?.trackName
    || tone?.short_label
    || tone?.shortLabel
    || tone?.metadata?.sourceToneName
    || 'Featured tone preview';
}

function previewTrackSummary(tone) {
  return tone?.summary
    || tone?.description
    || tone?.metadata?.sourceToneSummary
    || 'A finished listening session from the Cognistration library.';
}

function previewTrackMeta(tone) {
  const state = String(tone?.state || tone?.target_state || tone?.targetState || '').trim().toLowerCase();
  const targetHz = Number(tone?.target_hz ?? tone?.targetHz);
  const previewSeconds = Number(tone?.preview_seconds ?? tone?.previewSeconds ?? 30);
  const meta = [];
  if (STATE_LABELS[state]) meta.push(STATE_LABELS[state]);
  if (Number.isFinite(targetHz) && targetHz > 0) meta.push(`${targetHz} Hz beat`);
  if (Number.isFinite(previewSeconds) && previewSeconds > 0) meta.push(`${previewSeconds}-second sample`);
  return meta.join(' · ') || '30-second sample';
}

export default function PricingPage() {
  const [previewTracks, setPreviewTracks] = useState(() => TONE_PACKS[0]?.tracks?.slice(0, 6) || []);
  const [activePreviewTone, setActivePreviewTone] = useState(null);
  const [loadingPreviewTracks, setLoadingPreviewTracks] = useState(true);
  const [playingToneId, setPlayingToneId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [workshopEmail, setWorkshopEmail] = useState('');
  const [workshopCheckoutLoading, setWorkshopCheckoutLoading] = useState(false);
  const [workshopCheckoutError, setWorkshopCheckoutError] = useState('');
  const audioRef = useRef(null);

  const tonePack = TONE_PACKS[0];
  const tonePackPriceId = getTonePackPriceId(tonePack);

  const handlePlayTone = useCallback((tone) => {
    const url = trackUrl(tone);
    const audio = audioRef.current;
    if (!url || !audio) {
      setPreviewError(`${previewTrackName(tone)} is not available for preview yet.`);
      return;
    }

    const id = toneId(tone);
    if (playingToneId === id && isPlaying) {
      audio.pause();
      setPreviewError('');
      return;
    }

    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    audio.load();
    setPreviewError('');
    setPlayingToneId(id);
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      setIsPlaying(false);
      setPlayingToneId(null);
      setPreviewError('This preview could not be played in the current browser.');
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

  const handleWorkshopCheckout = async (event) => {
    event.preventDefault();
    setWorkshopCheckoutError('');
    setWorkshopCheckoutLoading(true);
    try {
      const response = await fetch('/api/agent/commerce/workshop-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: workshopEmail,
          confirmed: true,
          idempotencyKey: `workshop-${window.crypto?.randomUUID?.() || Date.now()}`
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || 'Workshop checkout is temporarily unavailable.');
      window.location.href = result.checkoutUrl;
    } catch (error) {
      setWorkshopCheckoutError(error?.message || 'Workshop checkout is temporarily unavailable.');
      setWorkshopCheckoutLoading(false);
    }
  };

  const pricingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pricing | Cognistration',
    url: buildAbsoluteUrl('/pricing'),
    description: `One complete private Cognistration audio studio with lifetime access for a one-time ${LIFETIME_PLAN.priceLabel} payment.`
  };

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }
  });

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#080c0b] text-[#f2f0ea] selection:bg-[#b6ddcc]/25">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }} />
      <PublicHeader theme="dark" />

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden border-b border-white/10 pt-32 sm:pt-36 lg:pt-40">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(120,170,150,0.16),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-[1400px] px-5 pb-20 sm:px-8 lg:px-12">
            <motion.div
              {...fade(0)}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/60"
            >
              <span className="text-[#b6ddcc]">Pricing</span>
              <span aria-hidden="true">/</span>
              <span>One payment</span>
              <span aria-hidden="true">/</span>
              <span>No membership</span>
            </motion.div>

            <div className="mt-10 grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-20">
              <div className="max-w-2xl">
                <motion.h1
                  {...fade(0.06)}
                  className="max-w-[15ch] text-[clamp(2.5rem,5.5vw,4.75rem)] font-medium leading-[0.96] tracking-[-0.055em]"
                >
                  One payment. A complete place to practice.
                </motion.h1>
                <motion.p {...fade(0.12)} className="mt-8 max-w-xl text-[17px] leading-8 text-white/55 sm:text-lg">
                  Build and keep private listening sessions for focus, rest, reflection, and intentional reset. Your
                  account activates through secure Stripe checkout, with no monthly billing and nothing to cancel.
                </motion.p>
                <motion.div {...fade(0.18)} className="mt-10 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    data-analytics-cta="unlock_workspace"
                    data-analytics-placement="pricing_primary"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#b6ddcc] px-6 py-3.5 text-sm font-medium text-[#0a1211] transition hover:bg-[#d5ece2] active:translate-y-px disabled:opacity-60"
                  >
                    {checkoutLoading ? 'Opening checkout…' : 'Unlock the workspace'} <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                  </button>
                  <Link
                    href="/signup"
                    className="text-sm text-white/50 underline decoration-white/20 underline-offset-8 transition hover:text-white"
                  >
                    Create an account first
                  </Link>
                </motion.div>

                <motion.div
                  {...fade(0.24)}
                  className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60"
                >
                  <Headphones className="size-4 text-[#b6ddcc]" aria-hidden="true" />
                  Stereo headphones required — the effect only exists in separation
                </motion.div>
              </div>

              <motion.aside
                {...fade(0.14)}
                className="relative rounded-[28px] border border-white/12 bg-[#0b1211] p-8 sm:p-10"
              >
                <div className="pointer-events-none absolute -inset-6 rounded-[40px] bg-[#b6ddcc]/5 blur-3xl" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-7">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#b6ddcc]">Cognistration platform</p>
                      <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">Lifetime workspace</h2>
                      <p className="mt-2 text-sm leading-6 text-white/65">Everything needed to make sessions your own.</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[clamp(2.5rem,4vw,3.25rem)] font-medium leading-none tracking-[-0.06em] text-white">
                        {lifetimeOffer.price}
                      </span>
                      <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">once</span>
                    </div>
                  </div>
                  <ul className="mt-7 space-y-4">
                    {planFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-[14px] leading-6 text-white/60">
                        <Check className="mt-0.5 size-4 shrink-0 text-[#b6ddcc]" weight="bold" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-7 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
                    Secure checkout handled by Stripe
                  </p>
                </div>
              </motion.aside>
            </div>
          </div>
        </section>

        {/* ── Mechanism strip ──────────────────────────────────── */}
        <section className="border-b border-white/10 bg-[#0a100e] py-20 sm:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1fr] lg:items-center lg:gap-20 lg:px-12">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-[#b6ddcc]/5 blur-3xl" aria-hidden="true" />
              <HairlineFigure
                figure="vault"
                label="A vault door whose locking bolts retract as the pointer crosses it"
                intensity={0.55}
              />
              <p className="mt-4 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
                One unlock — the pointer opens the mechanism
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ddcc]">What you are buying</span>
              <h2 className="mt-6 max-w-[17ch] text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.045em]">
                A signal generator, not a content subscription.
              </h2>
              <p className="mt-7 max-w-lg text-[16px] leading-8 text-white/55">
                You are paying once for the engine: both carriers, the beat offset, the duration control, and the export.
                There is no catalogue to keep paying for, no tier above this one, and no renewal date.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
                {[
                  ['Beat range', '1 – 40 Hz'],
                  ['Narrators', 'None'],
                  ['Billing', 'Once']
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#0a100e] px-1 py-5 sm:px-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">{label}</p>
                    <p className="mt-2 text-lg font-medium tracking-[-0.02em] text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Workshop ─────────────────────────────────────────── */}
        <section id="machine-workshop" className="border-b border-white/10 py-20 sm:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20 lg:px-12">
            <div className="max-w-xl">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ddcc]">The machine</span>
              <h2 className="mt-6 text-[clamp(2rem,3.6vw,3rem)] font-medium leading-[1.02] tracking-[-0.05em]">
                A full hour in the machine, whenever you need a deeper session.
              </h2>
              <p className="mt-6 text-[16px] leading-8 text-white/55">
                The 24-hour workshop pass unlocks sessions up to 60 minutes, with the carrier, rhythm, state, and volume
                controls open for your own listening practice.
              </p>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
                {WORKSHOP_PLAN.priceLabel} one time · no membership
              </p>
            </div>
            <form
              data-analytics-form="workshop_checkout"
              onSubmit={handleWorkshopCheckout}
              className="rounded-[24px] border border-white/12 bg-[#0b1211] p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <h3 className="text-xl font-medium tracking-[-0.03em] text-white">Machine workshop</h3>
                  <p className="mt-1 text-[13px] text-white/65">24-hour access · up to 60 minutes per session</p>
                </div>
                <span className="text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-none tracking-[-0.05em] text-white">
                  {WORKSHOP_PLAN.priceLabel}
                </span>
              </div>
              <label
                htmlFor="workshop-email"
                className="mt-6 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/60"
              >
                Delivery email
              </label>
              <input
                id="workshop-email"
                type="email"
                value={workshopEmail}
                onChange={(event) => setWorkshopEmail(event.target.value)}
                required
                maxLength={254}
                placeholder="you@example.com"
                className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/55 focus:border-[#b6ddcc]/60 focus:ring-2 focus:ring-[#b6ddcc]/20"
              />
              {workshopCheckoutError && (
                <p className="mt-3 text-sm text-[#e5a894]" role="alert">{workshopCheckoutError}</p>
              )}
              <button
                type="submit"
                disabled={workshopCheckoutLoading}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#b6ddcc] px-5 py-3.5 text-sm font-medium text-[#0a1211] transition hover:bg-[#d5ece2] active:translate-y-px disabled:opacity-60"
              >
                {workshopCheckoutLoading ? 'Opening checkout…' : 'Unlock the workshop'} <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
              </button>
              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
                Secure payment and access delivery through Stripe
              </p>
            </form>
          </div>
        </section>

        {/* ── Listen ───────────────────────────────────────────── */}
        <section id="listen" className="border-b border-white/10 py-20 sm:py-24">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div className="min-w-0 max-w-md">
                <Headphones className="size-8 text-[#b6ddcc]" weight="duotone" aria-hidden="true" />
                <h2 className="mt-6 text-[clamp(2rem,3.6vw,3rem)] font-medium leading-[1.02] tracking-[-0.05em]">
                  Listen before you choose.
                </h2>
                <p className="mt-5 text-[16px] leading-8 text-white/55">
                  Start with a short preview, then decide whether a private workspace or a finished tone pack fits the way
                  you want to listen.
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-[22px] border border-white/12 bg-[#0b1211] p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#b6ddcc]">Your current preview</p>
                  {activePreviewTone ? (
                    <>
                      <h3 className="mt-8 text-2xl font-medium tracking-[-0.04em] text-white">{activePreviewTone.name}</h3>
                      <p className="mt-3 text-[14px] leading-6 text-white/65">{activePreviewTone.description || activePreviewTone.summary}</p>
                      <button
                        type="button"
                        onClick={() => handlePlayTone(activePreviewTone)}
                        className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#b6ddcc]/40 bg-[#b6ddcc]/10 px-4 py-3 text-sm font-medium text-[#d5ece2] transition hover:border-[#b6ddcc]/70 hover:bg-[#b6ddcc]/20 active:translate-y-px"
                      >
                        {playingToneId === toneId(activePreviewTone) && isPlaying
                          ? <Pause className="size-4" weight="fill" aria-hidden="true" />
                          : <Play className="size-4" weight="fill" aria-hidden="true" />}
                        {playingToneId === toneId(activePreviewTone) && isPlaying ? 'Pause preview' : 'Play preview'}
                      </button>
                    </>
                  ) : (
                    <p className="mt-8 text-[14px] leading-6 text-white/60">
                      Try an intention on the homepage and your selected session will appear here.
                    </p>
                  )}
                </div>

                <div className="rounded-[22px] border border-white/12 bg-white/[0.02] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#b6ddcc]">Featured library</p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">30-second samples</span>
                  </div>
                  <div className="mt-5 space-y-1">
                    {loadingPreviewTracks ? (
                      <div className="h-12 animate-pulse rounded-xl bg-white/5" />
                    ) : previewTracks.slice(0, 4).map((tone) => {
                      const id = toneId(tone);
                      const isTonePlaying = playingToneId === id && isPlaying;
                      return (
                        <div key={id} className="flex min-h-[4.25rem] items-center gap-3 border-b border-white/10 py-3 last:border-b-0">
                          <button
                            type="button"
                            onClick={() => handlePlayTone(tone)}
                            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-[#b6ddcc] transition hover:border-[#b6ddcc]/60 hover:bg-[#b6ddcc]/10 active:translate-y-px active:scale-[0.98]"
                            aria-label={`${isTonePlaying ? 'Pause' : 'Play'} ${previewTrackName(tone)}`}
                            aria-pressed={isTonePlaying}
                          >
                            <span>
                              {isTonePlaying
                                ? <Pause className="size-4" weight="fill" aria-hidden="true" />
                                : <Play className="size-4" weight="fill" aria-hidden="true" />}
                            </span>
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-sm font-medium text-white">{previewTrackName(tone)}</p>
                              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-white/60">
                                {String(tone?.state || tone?.target_state || tone?.targetState || 'preview')}
                              </span>
                            </div>
                            <p className="truncate text-xs leading-5 text-white/60">{previewTrackSummary(tone)}</p>
                            <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-white/55">
                              {previewTrackMeta(tone)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {previewError && (
                    <p className="mt-4 text-xs leading-5 text-[#e5a894]" role="status">{previewError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tone packs ───────────────────────────────────────── */}
        <section id="tone-packs" className="border-b border-white/10 bg-[#0a100e] py-20 sm:py-24">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ddcc]">Tone packs</span>
                <h2 className="mt-6 text-[clamp(2rem,3.6vw,3rem)] font-medium leading-[1.02] tracking-[-0.05em]">
                  Finished sessions when you want a place to start.
                </h2>
                <p className="mt-5 text-[16px] leading-8 text-white/55">
                  Tone packs are separate one-time purchases. Browse the full collection when you know what kind of
                  listening practice you want to keep nearby.
                </p>
              </div>
              <Link
                href="/packs"
                className="shrink-0 text-sm text-[#b6ddcc] underline decoration-[#b6ddcc]/30 underline-offset-8 transition hover:text-white"
              >
                Browse tone packs
              </Link>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {TONE_PACKS.slice(0, 4).map((pack, index) => (
                <Link
                  key={pack.slug}
                  href="/packs"
                  className="group overflow-hidden rounded-[22px] border border-white/12 bg-[#0b1211] transition hover:-translate-y-1 hover:border-[#b6ddcc]/40"
                >
                  <div className={`aspect-[1.15] bg-gradient-to-br ${packColors[index]} p-4 text-white`}>
                    <div className="flex h-full flex-col justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/75">Cognistration</span>
                      <span className="max-w-[11ch] text-2xl font-medium leading-[0.95] tracking-[-0.045em]">{pack.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <p className="text-sm font-medium text-white">{pack.name}</p>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">{pack.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Close ────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="rounded-[28px] border border-white/12 bg-[#0b1211] px-7 py-12 sm:px-12 sm:py-16">
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="max-w-[20ch] text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.04] tracking-[-0.045em] text-white">
                    Ready to make space for the next moment?
                  </h2>
                  <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/50">
                    Create your account, explore the public library, and unlock the private tools when you are ready to
                    keep building. {LIFETIME_PLAN.priceLabel} once, on web and on iOS.
                  </p>
                </div>
                <Link
                  href="/signup"
                  data-analytics-cta="create_account"
                  data-analytics-placement="pricing_close"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b6ddcc] px-6 py-3.5 text-sm font-medium text-[#0a1211] transition hover:bg-[#d5ece2] active:translate-y-px"
                >
                  Create your account <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { setIsPlaying(false); setPlayingToneId(null); }}
        onError={() => { setIsPlaying(false); setPlayingToneId(null); setPreviewError('This preview could not be loaded. Please try another sample.'); }}
        aria-label="Cognistration tone preview"
      />
      <PublicTrustFooter />
    </div>
  );
}
