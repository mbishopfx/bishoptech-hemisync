'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check, Headphones, Warning } from '@phosphor-icons/react';
import { Omnibar } from '@/components/agent/Omnibar';
import { AgenticAuthModal } from '@/components/auth/AgenticAuthModal';
import { LiquidHeader } from '@/components/layout/LiquidHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { ScrollRevealHeading } from '@/components/marketing/ScrollRevealHeading';
import { AppStoreBadge } from '@/components/brand/AppStoreBadge';
import { HairlineFigure } from '@/components/brand/HairlineFigure';
import { IosAppSection } from '@/components/brand/IosAppSection';
import { ResearchArchive } from '@/components/brand/ResearchArchive';
import { SignalLab } from '@/components/brand/SignalLab';
import { LIFETIME_PLAN } from '@/lib/billing/plans';

const siteUrl = 'https://cognistration.com';
const siteDescription =
  'Cognistration is a frequency training platform. Two pure carriers, one in each ear, and the difference between them is the beat you sit inside. No narrator, no guidance track, no subscription.';

const homepageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${siteUrl}/#webpage`,
  name: 'Cognistration — Frequency training without a narrator',
  url: siteUrl,
  description: siteDescription,
  isPartOf: { '@id': `${siteUrl}/#website` },
  about: { '@id': `${siteUrl}/#organization` }
};

const METHOD = [
  {
    index: '01',
    title: 'Choose the band',
    body:
      'Delta, theta, alpha, SMR, beta, gamma. Each one is a beat frequency between 1 and 40 Hz — a rate, not a mood. Pick the rate you want to sit inside.'
  },
  {
    index: '02',
    title: 'Set the carriers',
    body:
      'One pure tone goes to the left ear. A second, offset by the beat, goes to the right. Neither side is a recording of anything. Both are generated exactly.'
  },
  {
    index: '03',
    title: 'Sit inside the difference',
    body:
      'The brain receives two steady signals and resolves the offset as a pulse. That pulse is the session. You control how long it runs, at what volume, and when it ends.'
  }
];

const LIMITS = [
  'It does not diagnose, treat, or replace professional care.',
  'It does not cancel HVAC, radio, power-line, EV, or other environmental energy.',
  'It does not promise a specific brainwave state or a guaranteed outcome.',
  'It does not use a narrator, a guidance track, or a subscription.'
];

const SPECS = [
  ['Beat range', '1 – 40 Hz'],
  ['Narrators', 'None'],
  ['Session length', 'Up to 60 min'],
  ['Access', `${LIFETIME_PLAN.priceLabel} once`]
];

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [agentMessage, setAgentMessage] = useState('');
  const [agentTone, setAgentTone] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleGenerate = async (intention) => {
    setIsLoading(true);
    setAgentMessage('');

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intention })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.code === 'AUTH_REQUIRED') setIsAuthModalOpen(true);
        return;
      }

      const selectedTone = data.track || null;
      setAgentTone(selectedTone);
      setAgentMessage(
        selectedTone ? `${selectedTone.name} is ready to preview.` : 'A session is ready to preview.'
      );
    } catch (error) {
      console.error('Failed to connect to session matcher:', error);
      setAgentMessage('The library is taking a moment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fade = (delay = 0) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }
        };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#080c0b] text-[#f2f0ea] selection:bg-[#b6ddcc]/25">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }} />
      <LiquidHeader onOpenAuth={() => setIsAuthModalOpen(true)} />

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          id="hero"
          aria-labelledby="hero-title"
          className="relative isolate overflow-hidden border-b border-white/10 pt-32 sm:pt-36 lg:pt-40"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(120,170,150,0.18),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-[1400px] px-5 pb-16 sm:px-8 lg:px-12">
            <motion.div
              {...fade(0)}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/60"
            >
              <span className="text-[#b6ddcc]">Cognistration</span>
              <span aria-hidden="true">/</span>
              <span>Frequency training</span>
              <span aria-hidden="true">/</span>
              <span>No narrator</span>
            </motion.div>

            <div className="mt-8 grid gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-16">
              <div className="max-w-2xl">
                <motion.h1
                  id="hero-title"
                  {...fade(0.06)}
                  className="text-[clamp(2.75rem,6vw,5.25rem)] font-medium leading-[0.95] tracking-[-0.055em] lg:max-w-[18ch]"
                >
                  Two signals. One difference. That is the whole method.
                </motion.h1>

                <motion.p {...fade(0.12)} className="mt-8 max-w-xl text-[17px] leading-8 text-white/60 sm:text-lg">
                  A pure carrier tone in the left ear, a different one in the right. The offset between them becomes a beat,
                  and the beat is what you listen to. No narration, no guidance track, no subscription — just a signal you
                  set, at a pace you choose.
                </motion.p>

                <motion.div {...fade(0.18)} className="mt-10 flex flex-wrap items-center gap-3">
                  <a
                    href="#method"
                    data-analytics-cta="open_signal_lab"
                    data-analytics-placement="homepage_hero"
                    className="inline-flex items-center gap-2 rounded-full bg-[#b6ddcc] px-6 py-3.5 text-sm font-medium text-[#0a1211] transition hover:bg-[#d5ece2]"
                  >
                    Open the signal lab <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                  </a>
                  <a
                    href="#record"
                    data-analytics-cta="read_record"
                    data-analytics-placement="homepage_hero"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm text-white/80 transition hover:border-white/45 hover:text-white"
                  >
                    Read the declassified record
                  </a>
                </motion.div>

                <motion.div
                  {...fade(0.24)}
                  className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60"
                >
                  <Headphones className="size-4 text-[#b6ddcc]" aria-hidden="true" />
                  Stereo headphones required — the effect only exists in separation
                </motion.div>

                {/* Agent console — keeps the natural-language entry point */}
                <motion.div
                  id="session"
                  data-cursor-surface
                  {...fade(0.3)}
                  className="hero-session-shell mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
                >
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                    Or describe the moment and let it pick a band
                  </p>
                  <Omnibar onGenerate={handleGenerate} isLoading={isLoading} agentMessage={agentMessage} />
                  {agentTone && (
                    <div className="mt-5 border-t border-white/10 pt-5">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#b6ddcc]">Ready to preview</p>
                          <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-white">{agentTone.name}</h2>
                          <p className="mt-2 text-sm leading-6 text-white/50">
                            {agentTone.summary || 'A public Cognistration session.'}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/65">
                          {agentTone.state || 'session'}
                        </span>
                      </div>
                      {(agentTone.wavUrl || agentTone.webmUrl || agentTone.mp3Url) && (
                        <audio
                          className="mt-4 h-10 w-full"
                          controls
                          preload="none"
                          src={agentTone.wavUrl || agentTone.webmUrl || agentTone.mp3Url}
                          aria-label={`Preview ${agentTone.name}`}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              <motion.div {...fade(0.14)} className="lg:sticky lg:top-28">
                <SignalLab />
              </motion.div>
            </div>

            <motion.dl
              {...fade(0.34)}
              className="mt-16 grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-4"
            >
              {SPECS.map(([label, value]) => (
                <div key={label} className="bg-[#080c0b] px-1 py-5 sm:px-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">{label}</dt>
                  <dd className="mt-2 text-lg font-medium tracking-[-0.02em] text-white">{value}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </section>

        {/* ── The method ───────────────────────────────────────── */}
        <section id="method" aria-labelledby="method-title" className="border-b border-white/10 py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-24 lg:px-12">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ddcc]">01 — The method</span>
              <ScrollRevealHeading
                id="method-title"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.045em]"
              >
                A controlled signal, not a guided experience.
              </ScrollRevealHeading>
              <p className="mt-7 max-w-lg text-[17px] leading-8 text-white/55">
                Most audio libraries hand you a voice and a mood. Cognistration hands you a frequency pair and a duration
                control. Three decisions, then silence you can hear.
              </p>

              <div className="mt-12 border-t border-white/10">
                {METHOD.map((step) => (
                  <div key={step.index} className="grid gap-3 border-b border-white/10 py-7 sm:grid-cols-[44px_1fr] sm:gap-6">
                    <span className="font-mono text-[11px] tabular-nums text-white/55">{step.index}</span>
                    <div>
                      <h3 className="text-xl font-medium tracking-[-0.025em] text-white">{step.title}</h3>
                      <p className="mt-2.5 max-w-lg text-[14px] leading-relaxed text-white/50">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-[#b6ddcc]/5 blur-3xl" aria-hidden="true" />
              <HairlineFigure
                figure="terrain"
                label="An interactive field of eighty-one pillars rising and falling around the pointer"
                intensity={0.55}
              />
              <p className="mt-4 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
                Move the pointer across the field — each pillar is a rate you can hold
              </p>
            </div>
          </div>
        </section>

        {/* ── The mechanism ────────────────────────────────────── */}
        <section
          id="mechanism"
          aria-labelledby="mechanism-title"
          className="border-b border-white/10 bg-[#0a100e] py-24 sm:py-32"
        >
          <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1fr] lg:items-center lg:gap-24 lg:px-12">
            <div className="order-2 relative lg:order-1">
              <HairlineFigure
                figure="phosphor"
                label="A dot matrix that plays a repeating loop and fades where the pointer paints it"
                intensity={0.6}
                palette={{
                  '--hairline-hi': '#d7eadf',
                  '--hairline-edge': '#7fa596',
                  '--hairline-mid': '#2f4a43',
                  '--hairline-lo': '#101a17'
                }}
              />
              <p className="mt-4 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
                A repeating signal, drawn as a trace — paint it with the pointer
              </p>
            </div>

            <div className="order-1 lg:order-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ddcc]">02 — The mechanism</span>
              <ScrollRevealHeading
                id="mechanism-title"
                className="mt-6 max-w-[17ch] text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.045em]"
              >
                Hemispheric synchronisation, stated without decoration.
              </ScrollRevealHeading>
              <p className="mt-7 max-w-lg text-[16px] leading-8 text-white/55">
                When the two ears receive carriers that differ by a small, steady offset, the auditory system encodes that
                offset as periodic timing. Researchers study the related responses directly — the frequency-following
                response and the auditory steady-state response.
              </p>
              <p className="mt-5 max-w-lg text-[16px] leading-8 text-white/55">
                What that does <em className="not-italic text-white">not</em> mean is that a tone can force a brain state.
                The entrainment literature is mixed, and we say so. What you get is a repeatable signal, exact to the hertz,
                that you can return to and measure against your own experience.
              </p>

              <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/28123019/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#b6ddcc] underline decoration-[#b6ddcc]/30 underline-offset-4 hover:decoration-[#b6ddcc]"
                >
                  Frequency-following response
                </a>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/15721080/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#b6ddcc] underline decoration-[#b6ddcc]/30 underline-offset-4 hover:decoration-[#b6ddcc]"
                >
                  Steady-state response
                </a>
                <a
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10198548/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#b6ddcc] underline decoration-[#b6ddcc]/30 underline-offset-4 hover:decoration-[#b6ddcc]"
                >
                  Systematic review
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── The record ───────────────────────────────────────── */}
        <section id="record" aria-labelledby="record-title" className="border-b border-white/10 py-24 sm:py-32">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-20">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ddcc]">03 — The record</span>
                <ScrollRevealHeading
                  id="record-title"
                  className="mt-6 max-w-[15ch] text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.045em]"
                >
                  The government classified this, then paid to study it.
                </ScrollRevealHeading>
                <p className="mt-7 max-w-lg text-[16px] leading-8 text-white/55">
                  For roughly two decades, agencies of the United States government funded research into altered-state
                  perception and hemispheric synchronisation, filed it under classification, and only released it years
                  later. Millions of dollars went into programmes the public was not told about.
                </p>
                <p className="mt-5 max-w-lg text-[16px] leading-8 text-white/55">
                  Those files are public now. We have changed nothing in them — no summary, no reinterpretation, no
                  marketing language. Our only addition is a tool that lets you run the signal yourself, at home, for a few
                  dollars.
                </p>
              </div>

              <div className="lg:pt-14">
                <ResearchArchive />
              </div>
            </div>
          </div>
        </section>

        {/* ── The machine ──────────────────────────────────────── */}
        <section
          id="machine"
          aria-labelledby="machine-title"
          className="border-b border-white/10 bg-[#0a100e] py-24 sm:py-32"
        >
          <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-24 lg:px-12">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ddcc]">04 — The machine</span>
              <ScrollRevealHeading
                id="machine-title"
                className="mt-6 max-w-[17ch] text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.045em]"
              >
                Build the hour. Keep the file.
              </ScrollRevealHeading>
              <p className="mt-7 max-w-lg text-[17px] leading-8 text-white/55">
                The workshop is a full session builder: choose the band, set both carriers, add texture if you want it, fix
                the duration, and render one uninterrupted master. Up to sixty minutes, exported as an MP3 you own — no
                session that expires mid-listen.
              </p>

              <div className="mt-9 space-y-3.5 text-[14px] text-white/60">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#b6ddcc]" weight="bold" aria-hidden="true" />
                  Independent carrier and beat control, adjustable while it plays
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#b6ddcc]" weight="bold" aria-hidden="true" />
                  Sixty-minute private masters with downloadable MP3 delivery
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#b6ddcc]" weight="bold" aria-hidden="true" />
                  Saved projects you can reopen, retune, and re-render
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  href="/machine"
                  data-analytics-cta="machine_overview"
                  data-analytics-placement="homepage"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#b6ddcc] underline decoration-[#b6ddcc]/30 underline-offset-8 transition hover:text-white"
                >
                  See the machine <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                </Link>
                <Link
                  href="/try"
                  data-analytics-cta="agent_demo"
                  data-analytics-placement="homepage"
                  className="inline-flex items-center gap-2 text-sm text-white/65 underline decoration-white/15 underline-offset-8 transition hover:text-white"
                >
                  Run the agent demo
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-[#b6ddcc]/5 blur-3xl" aria-hidden="true" />
              <HairlineFigure
                figure="exploded"
                label="An app window separated into four layers that open as the pointer crosses them"
                intensity={0.5}
              />
              <p className="mt-4 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
                Four layers, opened by the pointer — carrier, beat, texture, master
              </p>
            </div>
          </div>
        </section>

        {/* ── iOS ──────────────────────────────────────────────── */}
        <section id="ios" aria-labelledby="ios-title" className="border-b border-white/10 py-24 sm:py-32">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ddcc]">05 — In your pocket</span>
                <ScrollRevealHeading
                  id="ios-title"
                  className="mt-6 max-w-[18ch] text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.045em]"
                >
                  The same signal, generated on your phone.
                </ScrollRevealHeading>
              </div>
              <p className="max-w-sm text-[15px] leading-7 text-white/50">
                A native engine, not a stream of pre-made tracks. Change the frequency mid-session and hear it move.
              </p>
            </div>

            <div className="mt-16">
              <IosAppSection />
            </div>
          </div>
        </section>

        {/* ── Access ───────────────────────────────────────────── */}
        <section id="access" aria-labelledby="access-title" className="py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_0.7fr] lg:items-center lg:gap-24 lg:px-12">
            <div className="max-w-xl">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ddcc]">06 — Access</span>
              <ScrollRevealHeading
                id="access-title"
                className="mt-6 text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.045em]"
              >
                One price. No membership.
              </ScrollRevealHeading>
              <p className="mt-7 text-[17px] leading-8 text-white/55">
                {LIFETIME_PLAN.priceLabel} unlocks the private workspace once: the workshop, the studio, saved projects, and
                sixty-minute exports. No renewal, no tier to upgrade out of, no membership to cancel. The iOS app is the same
                price, purchased separately.
              </p>

              <div className="mt-8 space-y-3 text-[14px] text-white/60">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#b6ddcc]" weight="bold" aria-hidden="true" />
                  Workshop, Studio, and the full session builder
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#b6ddcc]" weight="bold" aria-hidden="true" />
                  Private projects with saved, re-editable sessions
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#b6ddcc]" weight="bold" aria-hidden="true" />
                  Sixty-minute MP3 exports and secure email delivery
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  data-analytics-cta="create_account"
                  data-analytics-placement="homepage_access"
                  className="inline-flex items-center gap-2 rounded-full bg-[#b6ddcc] px-6 py-3.5 text-sm font-medium text-[#0a1211] transition hover:bg-[#d5ece2]"
                >
                  Create your account <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                </Link>
                <Link
                  href="/pricing"
                  data-analytics-cta="view_pricing"
                  data-analytics-placement="homepage_access"
                  className="text-sm text-white/50 underline decoration-white/20 underline-offset-8 transition hover:text-white"
                >
                  See full pricing
                </Link>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/12 bg-[#0b1211] p-8 sm:p-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#b6ddcc]">Cognistration platform</p>
              <div className="mt-6 flex items-end gap-3">
                <span className="text-[clamp(3.5rem,6vw,5rem)] font-medium leading-none tracking-[-0.06em] text-white">
                  {LIFETIME_PLAN.priceLabel}
                </span>
                <span className="pb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">once</span>
              </div>
              <div className="mt-7 space-y-3 border-t border-white/10 pt-6 text-[13px] leading-relaxed text-white/65">
                <p>Full workspace access, no recurring charge.</p>
                <p className="flex items-start gap-2 text-white/55">
                  <Warning className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  Secure checkout is handled by Stripe.
                </p>
              </div>
              <AppStoreBadge className="mt-7" />
            </div>
          </div>
        </section>

        {/* ── Limits ───────────────────────────────────────────── */}
        <section aria-labelledby="limits-title" className="border-t border-white/10 bg-[#0a100e] py-24 sm:py-28">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1fr] lg:gap-24 lg:px-12">
            <div>
              <ScrollRevealHeading
                id="limits-title"
                className="max-w-[13ch] text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.04] tracking-[-0.04em]"
              >
                A useful tool states its limits.
              </ScrollRevealHeading>
              <p className="mt-6 max-w-md text-[15px] leading-7 text-white/65">
                Cognistration supports attention and personal practice. It never asks you to hand over your judgement, and a
                listening session is not a diagnosis.
              </p>
            </div>
            <div className="border-t border-white/10">
              {LIMITS.map((limit) => (
                <div key={limit} className="flex gap-4 border-b border-white/10 py-5 text-[15px] leading-7 text-white/55">
                  <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 rounded-full bg-[#b6ddcc]/60" />
                  <span>{limit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicTrustFooter />
      <AgenticAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
