'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Headphones, SlidersHorizontal } from '@phosphor-icons/react';
import { AgenticAuthModal } from '@/components/auth/AgenticAuthModal';
import { LiquidHeader } from '@/components/layout/LiquidHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { WorkshopMachineExperience } from '@/components/machine/WorkshopMachineExperience';
import { EntrainmentIllustration } from '@/components/visuals/EntrainmentIllustration';
import { OrchestratorMachineIllustration } from '@/components/visuals/OrchestratorMachineIllustration';

const machineJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'The Cognistration machine',
  url: 'https://cognistration.com/machine',
  description: 'A clear look at how Cognistration shapes personal listening sessions from intention, sound, rhythm, and pacing.'
};

const principles = [
  ['Start with intention', 'A session begins with the moment you are actually in, not a category you have to search through.'],
  ['Shape the sound', 'Choose a direction, then adjust the tone, rhythm, volume, and pacing until the session feels usable.'],
  ['Return with context', 'Save the combinations that help and build a practice you can revisit instead of starting over every time.']
];

export default function MachinePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef1ee] text-[#1d302c] selection:bg-[#b6ddcc]/60">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(machineJsonLd) }} />
      <LiquidHeader onOpenAuth={() => setIsAuthModalOpen(true)} scrollAware />

      <main>
        <section className="bg-[#13201d] px-5 pb-20 pt-36 text-white sm:px-8 sm:pb-28 sm:pt-44 lg:px-12">
          <div className="mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <div className="max-w-2xl">
              <h1 className="max-w-[11ch] text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl">The machine behind your listening practice.</h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-white/68 sm:text-lg">Cognistration turns a feeling into a session you can hear, understand, and make your own. This is the editable layer beneath the experience.</p>
              <div className="mt-9 flex flex-wrap gap-4">
                <a href="#controls" className="inline-flex items-center gap-2 rounded-full bg-[#d7eadf] px-5 py-3.5 text-sm font-medium text-[#17332e] transition hover:bg-white">Try the machine <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></a>
                <Link href="/#access" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3.5 text-sm text-white transition hover:border-white/55 hover:bg-white/[0.08]">See the platform</Link>
              </div>
            </div>
            <OrchestratorMachineIllustration />
          </div>
        </section>

        <section id="controls" aria-labelledby="controls-title" className="bg-[#eef1ee] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="max-w-2xl">
              <h2 id="controls-title" className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">Shape the session around the moment.</h2>
              <p className="mt-7 text-base leading-8 text-[#5f706b] sm:text-lg">Use the controls below to hear how a shared tone and a small rhythmic difference change the character of a session. Start gently, keep the volume comfortable, and notice what works for you.</p>
            </div>
            <div className="mt-12 rounded-[2rem] bg-[#202b28] p-3 shadow-[0_24px_80px_rgba(42,58,55,0.14)] sm:p-5 lg:p-7">
              <WorkshopMachineExperience />
            </div>
          </div>
        </section>

        <section aria-labelledby="model-title" className="bg-[#f7f8f5] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24">
            <EntrainmentIllustration />
            <div className="max-w-xl">
              <h2 id="model-title" className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">A simple model for a complex experience.</h2>
              <p className="mt-7 text-base leading-8 text-[#5f706b] sm:text-lg">Two slightly different tones, separated left and right, can create a perceived rhythmic difference. That regularity gives attention something steady to follow while you work, rest, reflect, or transition.</p>
              <p className="mt-5 text-base leading-8 text-[#5f706b] sm:text-lg">It is a listening model, not a scan of the brain. The experience varies by person and context, so Cognistration keeps the language practical and the controls visible.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="principles-title" className="bg-gradient-to-b from-[#eef1ee] to-[#e1eae4] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-28">
            <div className="max-w-xl">
              <h2 id="principles-title" className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">Why the machine matters.</h2>
              <p className="mt-7 text-base leading-8 text-[#60716b] sm:text-lg">Most meditation apps give you a finished track. Cognistration gives you a finished starting point and enough control to make it fit your actual life.</p>
            </div>
            <div className="border-t border-[#c4d3c8]">
              {principles.map(([title, copy], index) => (
                <article key={title} className="grid gap-5 border-b border-[#c4d3c8] py-7 sm:grid-cols-[52px_1fr] sm:gap-8">
                  <span className="text-sm font-medium text-[#779187]">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-2xl font-medium tracking-[-0.035em]">{title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[#63736e] sm:text-base">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="limits-title" className="bg-[#f7f8f5] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div className="max-w-xl">
              <h2 id="limits-title" className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">Useful tools need clear limits.</h2>
              <p className="mt-7 text-base leading-8 text-[#60716b] sm:text-lg">Cognistration supports a personal listening ritual. It does not diagnose, treat, or promise a particular brain state.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                'Keep the volume comfortable and stop if listening feels tiring.',
                'Do not listen while driving or doing anything that needs full awareness.',
                'If you have a seizure history or sound sensitivity, ask a clinician first.',
                'Use the session as a cue for attention, not as a replacement for care.'
              ].map((copy) => (
                <div key={copy} className="flex gap-4 border-t border-[#cbd6cf] pt-5 text-sm leading-7 text-[#4e625b] sm:text-base">
                  <Check className="mt-1 size-5 shrink-0 text-[#548477]" weight="bold" aria-hidden="true" />
                  <span>{copy}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#202b28] px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-12">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[1fr_0.65fr] lg:gap-24">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">Make a practice you can return to.</h2>
              <p className="mt-7 text-base leading-8 text-white/65 sm:text-lg">Start with a preview, then keep the combinations that help you move into focus, rest, creative space, or a more intentional reset.</p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[#d7eadf] px-5 py-3.5 text-sm font-medium text-[#17332e] transition hover:bg-white">Create your account <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></Link>
                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3.5 text-sm text-white transition hover:border-white/55 hover:bg-white/[0.08]">See pricing</Link>
              </div>
            </div>
            <div className="space-y-5 border-t border-white/15 pt-6 text-sm leading-7 text-white/65 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="flex gap-3"><SlidersHorizontal className="mt-1 size-5 shrink-0 text-[#b6ddcc]" aria-hidden="true" /><span>Adjust the controls instead of settling for a fixed track.</span></div>
              <div className="flex gap-3"><Headphones className="mt-1 size-5 shrink-0 text-[#b6ddcc]" aria-hidden="true" /><span>Preview the sound before you commit to a longer session.</span></div>
            </div>
          </div>
        </section>
      </main>

      <PublicTrustFooter />
      <AgenticAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
