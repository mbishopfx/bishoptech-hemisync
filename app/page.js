'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowDown, ArrowRight, Check, Headphones, SlidersHorizontal } from '@phosphor-icons/react';
import { Omnibar } from '@/components/agent/Omnibar';
import { AgenticAuthModal } from '@/components/auth/AgenticAuthModal';
import { LiquidHeader } from '@/components/layout/LiquidHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { IosAppCarousel } from '@/components/marketing/IosAppCarousel';
import { ScrollRevealHeading } from '@/components/marketing/ScrollRevealHeading';
import { ToneMachineDemo } from '@/components/machine/ToneMachineDemo';
import { HomepageTonePacksSection } from '@/components/packs/HomepageTonePacksSection';
import { AuroraCurrentBackground } from '@/components/visuals/AuroraCurrentBackground';
import { EntrainmentIllustration } from '@/components/visuals/EntrainmentIllustration';
import { OrchestratorMachineIllustration } from '@/components/visuals/OrchestratorMachineIllustration';
import { YouTubeEmbed } from '@/components/media/YouTubeEmbed';

const siteUrl = 'https://cognistration.com';
const siteDescription = 'Cognistration turns a simple intention into a personal listening session for focus, rest, and intentional reset.';
const homepageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${siteUrl}/#webpage`,
  name: 'Cognistration — Personal audio sessions for focus, rest, and intentional reset',
  url: siteUrl,
  description: siteDescription,
  isPartOf: { '@id': `${siteUrl}/#website` },
  about: { '@id': `${siteUrl}/#organization` }
};

const intentRows = [
  ['01', 'Name the moment', 'Start with one sentence about what you want from the next hour. The platform gives you a clear place to begin.'],
  ['02', 'Choose a direction', 'Move toward focus, rest, creative space, reflection, or a transition between tasks.'],
  ['03', 'Make it yours', 'Adjust the sound, pacing, layers, and return point until the session fits your actual day.']
];

const audienceRows = [
  ['Work and study', 'Create a repeatable opening cue for writing, reading, planning, and deep work.'],
  ['Meditation and breathwork', 'Give quiet practice a steady rhythmic anchor without adding another voice to follow.'],
  ['Creative work and play', 'Make a doorway into ideation, music, design, gaming, or any practice that benefits from a deliberate start.'],
  ['Transitions and recovery', 'Mark the space between meetings, screens, errands, and the next meaningful thing.']
];

const boundaries = [
  'It does not diagnose, treat, or replace professional care.',
  'It does not promise a specific brainwave state or guaranteed result.',
  'It does not force a mood or override your judgment.',
  'It does not keep you scrolling; the session is the destination.'
];

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [agentMessage, setAgentMessage] = useState('');
  const [agentTone, setAgentTone] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
      setAgentMessage(selectedTone
        ? `${selectedTone.name} is ready to preview. Adjust the session until it feels like the right starting point.`
        : 'A session is ready to preview.');
    } catch (error) {
      console.error('Failed to connect to session matcher:', error);
      setAgentMessage('The library is taking a moment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#eef1ee] text-[#1d302c] selection:bg-[#b6ddcc]/60">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }} />
      <LiquidHeader onOpenAuth={() => setIsAuthModalOpen(true)} scrollAware />

      <main>
        <section id="hero" aria-labelledby="hero-title" className="relative isolate min-h-[100dvh] overflow-hidden bg-[#13201d] text-white">
          <AuroraCurrentBackground />
          <div className="absolute inset-0 bg-gradient-to-br from-[#101b19]/65 via-[#13201d]/30 to-[#101b19]/90" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-[#13201d]" aria-hidden="true" />

          <div className="relative z-10 mx-auto grid min-h-[100dvh] max-w-[1400px] grid-cols-1 gap-12 px-5 pb-14 pt-32 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:px-12 lg:pb-20 lg:pt-40">
            <div className="max-w-2xl self-center">
              <motion.h1 id="hero-title" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-[17ch] text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl lg:max-w-[18ch] lg:text-[clamp(4.1rem,5.8vw,6.25rem)]">
                A clearer way to enter the next moment.
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                When everything around you competes for attention, Cognistration gives you one steady sound to return to—so you can focus, rest, create, or reset on your own terms.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-9 flex flex-wrap gap-3">
                <a href="#session" className="inline-flex items-center gap-2 rounded-full bg-[#d7eadf] px-5 py-3.5 text-sm font-medium text-[#17332e] transition hover:bg-white">Try a session <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></a>
                <a href="#platform" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3.5 text-sm text-white transition hover:border-white/55 hover:bg-white/[0.08]">Explore the platform</a>
              </motion.div>
              <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/45"><span>Focus</span><span>Rest</span><span>Creative space</span><span>Intentional reset</span></div>
            </div>

            <div id="session" data-cursor-surface className="hero-session-shell w-full max-w-xl justify-self-end rounded-[2rem] p-5 sm:p-7">
              <Omnibar onGenerate={handleGenerate} isLoading={isLoading} agentMessage={agentMessage} />
              {agentTone && (
                <div className="mt-8 border-t border-white/10 pt-8">
                  <div className="flex items-start justify-between gap-5">
                    <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#b6ddcc]">Ready to preview</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-white">{agentTone.name}</h2><p className="mt-2 text-sm leading-6 text-white/55">{agentTone.summary || 'A public Cognistration listening session.'}</p></div>
                    <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/55">{agentTone.state || 'session'}</span>
                  </div>
                  {(agentTone.wavUrl || agentTone.webmUrl || agentTone.mp3Url) && <audio className="mt-6 h-10 w-full" controls preload="none" src={agentTone.wavUrl || agentTone.webmUrl || agentTone.mp3Url} aria-label={`Preview ${agentTone.name}`} />}
                </div>
              )}
            </div>
          </div>

          <a href="#platform" className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 text-xs text-white/45 transition hover:text-white md:flex">Scroll to see how it works <ArrowDown className="size-4" aria-hidden="true" /></a>
        </section>

        <section id="platform" aria-labelledby="platform-title" className="bg-[#eef1ee] py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-16 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-28 lg:px-12">
            <div className="max-w-xl"><ScrollRevealHeading id="platform-title" className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">Built around intention, not playlists.</ScrollRevealHeading><p className="mt-7 text-base leading-8 text-[#5f706b] sm:text-lg">Most audio apps ask you to browse until something feels close. Cognistration starts with the moment in front of you and turns it into a session you can understand, adjust, and return to.</p></div>
            <div className="border-t border-[#cbd6cf]">{intentRows.map(([number, title, copy]) => <article key={number} className="grid gap-5 border-b border-[#cbd6cf] py-7 sm:grid-cols-[52px_1fr] sm:gap-8"><span className="text-xs font-medium tracking-[0.16em] text-[#779187]">{number}</span><div><h3 className="text-2xl font-medium tracking-[-0.035em]">{title}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-[#63736e] sm:text-base">{copy}</p></div></article>)}</div>
          </div>
        </section>

        <section id="machine" aria-labelledby="machine-title" className="bg-[#202b28] py-24 text-white sm:py-32">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
            <div className="order-2 lg:order-1"><OrchestratorMachineIllustration /></div>
            <div className="order-1 max-w-xl lg:order-2"><ScrollRevealHeading id="machine-title" className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">A machine you can tune to the moment.</ScrollRevealHeading><p className="mt-7 text-base leading-8 text-white/65 sm:text-lg">The orchestrator is the reason Cognistration feels different from a fixed meditation catalog. You can choose the direction, adjust the underlying tone and rhythm, add texture, set the duration, and decide how you want the session to return you to the day.</p><div className="mt-9 space-y-4 text-sm text-white/75"><div className="flex items-center gap-3"><SlidersHorizontal className="size-5 text-[#b6ddcc]" aria-hidden="true" /> Adjustable controls for state, sound, pacing, and duration.</div><div className="flex items-center gap-3"><Headphones className="size-5 text-[#b6ddcc]" aria-hidden="true" /> A browser preview before you commit to a full session.</div></div><div className="mt-10 flex flex-wrap gap-5"><Link href="/machine" className="inline-flex items-center gap-2 text-sm font-medium text-[#d7eadf] underline decoration-white/20 underline-offset-8 transition hover:text-white">See the machine <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></Link><Link href="/try" className="inline-flex items-center gap-2 text-sm font-medium text-white/60 underline decoration-white/15 underline-offset-8 transition hover:text-white">Run the agent demo <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></Link></div></div>
            </div>
            <div className="mt-16"><ToneMachineDemo agentTone={agentTone} /></div>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="science-title" className="bg-[#f7f8f5] py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-24 lg:px-12">
            <EntrainmentIllustration />
            <div className="max-w-xl"><ScrollRevealHeading id="science-title" className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">The science is useful when it stays honest.</ScrollRevealHeading><p className="mt-7 text-base leading-8 text-[#5f706b] sm:text-lg">Cognistration uses sound patterns as an attention cue. Two slightly different tones, separated left and right, can produce a perceived rhythmic difference. The auditory system can encode regular timing in sound; researchers study related responses such as the frequency-following response and auditory steady-state response.</p><p className="mt-5 text-base leading-8 text-[#5f706b] sm:text-lg">That is not the same as proving that a session can force a brainwave state. Evidence for direct brainwave entrainment is mixed, so the platform makes a repeatable listening practice—not a medical promise.</p><div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm"><a href="https://pubmed.ncbi.nlm.nih.gov/28123019/" target="_blank" rel="noreferrer" className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4">FFR research</a><a href="https://pubmed.ncbi.nlm.nih.gov/15721080/" target="_blank" rel="noreferrer" className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4">Steady-state response</a><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10198548/" target="_blank" rel="noreferrer" className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4">Systematic review</a></div></div>
          </div>
        </section>

        <section id="for-you" aria-labelledby="audience-title" className="bg-gradient-to-b from-[#eef1ee] to-[#e1eae4] py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-28 lg:px-12"><div className="max-w-xl"><ScrollRevealHeading id="audience-title" className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">For people who want a deliberate transition.</ScrollRevealHeading><p className="mt-7 text-base leading-8 text-[#60716b] sm:text-lg">You do not need another feed of content. You need a way to make the next step feel chosen.</p></div><div className="border-t border-[#c4d3c8]">{audienceRows.map(([title, copy]) => <article key={title} className="grid gap-4 border-b border-[#c4d3c8] py-6 sm:grid-cols-[minmax(180px,0.7fr)_1.3fr] sm:gap-8"><h3 className="text-lg font-medium tracking-[-0.02em]">{title}</h3><p className="text-sm leading-7 text-[#64756e] sm:text-base">{copy}</p></article>)}</div></div>
        </section>

        <section aria-labelledby="boundaries-title" className="bg-[#f7f8f5] py-24 sm:py-32"><div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-28 lg:px-12"><div className="max-w-xl"><ScrollRevealHeading id="boundaries-title" className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">A useful tool knows its limits.</ScrollRevealHeading><p className="mt-7 text-base leading-8 text-[#60716b] sm:text-lg">Cognistration is built to support attention and personal ritual. It should never ask you to hand over your agency or treat a listening session as a diagnosis.</p></div><div className="border-t border-[#cbd6cf]">{boundaries.map((boundary, index) => <div key={boundary} className="flex gap-5 border-b border-[#cbd6cf] py-6 text-base leading-7 text-[#4e625b] sm:text-lg"><Check className="mt-1 size-5 shrink-0 text-[#548477]" weight="bold" aria-hidden="true" /><span>{boundary}</span></div>)}</div></div></section>

        <section id="video-feature" aria-labelledby="video-title" className="bg-[#e7eee9] py-24 sm:py-32"><div className="mx-auto grid max-w-[1200px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-center lg:px-12"><div><ScrollRevealHeading id="video-title" className="text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">See the idea in motion.</ScrollRevealHeading><p className="mt-5 text-base leading-7 text-[#60716b]">A short introduction to the listening approach behind Cognistration.</p></div><YouTubeEmbed src="https://www.youtube.com/embed/ent5GbBVubk?si=6m3yK2iZ7ehx47Ph" title="Cognistration introduction" /></div></section>

        <HomepageTonePacksSection />

        <IosAppCarousel />

        <section id="access" aria-labelledby="access-title" className="bg-[#202b28] py-24 text-white sm:py-32"><div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_0.75fr] lg:items-center lg:gap-24 lg:px-12"><div className="max-w-2xl"><ScrollRevealHeading id="access-title" className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">Your listening practice, with room to grow.</ScrollRevealHeading><p className="mt-7 text-base leading-8 text-white/65 sm:text-lg">Unlock the private workspace for a one-time $20 platform payment. Build, adjust, save, and download the sessions that fit your life. Tone packs are available separately when you want a finished library to start from.</p><div className="mt-8 space-y-3 text-sm text-white/75"><div className="flex items-center gap-3"><Check className="size-4 text-[#b6ddcc]" weight="bold" aria-hidden="true" /> Sync, Workshop, and Studio access</div><div className="flex items-center gap-3"><Check className="size-4 text-[#b6ddcc]" weight="bold" aria-hidden="true" /> Private projects and exports</div><div className="flex items-center gap-3"><Check className="size-4 text-[#b6ddcc]" weight="bold" aria-hidden="true" /> Controls you can revisit and refine</div></div><div className="mt-10 flex flex-wrap items-center gap-4"><Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[#d7eadf] px-5 py-3.5 text-sm font-medium text-[#17332e] transition hover:bg-white">Create your account <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></Link><Link href="/pricing" className="text-sm text-white/60 underline decoration-white/20 underline-offset-8 transition hover:text-white">See pricing</Link></div></div><div className="rounded-[2rem] bg-white/[0.05] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_90px_rgba(0,0,0,0.18)] sm:p-9"><p className="text-sm text-[#b6ddcc]">Cognistration platform</p><div className="mt-6 flex items-end gap-3"><span className="text-7xl font-medium leading-none tracking-[-0.08em]">$20</span><span className="pb-2 text-sm text-white/45">one time</span></div><div className="mt-7 border-t border-white/10 pt-6 text-sm leading-7 text-white/55"><p>Start with a preview, then keep the tools that become part of your practice.</p><p className="mt-4 text-white/35">Secure checkout is handled by Stripe.</p></div></div></div></section>
      </main>

      <PublicTrustFooter />
      <AgenticAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
