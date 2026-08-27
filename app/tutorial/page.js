import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  BookOpenText,
  Headphones,
  MoonStars,
  Notebook,
  Pause,
  SlidersHorizontal,
} from '@phosphor-icons/react/dist/ssr';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { TutorialMotion } from '@/components/tutorial/TutorialMotion';
import { ElectricKelpBackground } from '@/components/visuals/ElectricKelpBackground';

const workflow = [
  {
    phase: 'Before',
    title: 'Choose one reason to listen',
    body: 'Decide whether this session is for settling down, focused reflection, creative work, or sleep preparation. Pick a quiet place, allow enough unhurried time, and avoid listening while driving or doing anything that needs your full attention.',
    icon: Notebook,
  },
  {
    phase: 'During',
    title: 'Keep the setup comfortable',
    body: 'Use headphones when the session calls for stereo separation. Start at a low volume, raise it only to a comfortable level, and let breathing stay natural. A frequency label describes the audio design; it does not guarantee a mental state.',
    icon: Headphones,
  },
  {
    phase: 'After',
    title: 'Return before you interpret',
    body: 'Pause for a moment, look around the room, move slowly, and note what you actually noticed. Record sensations, thoughts, or dream fragments before deciding what they mean. Individual experiences vary.',
    icon: BookOpenText,
  },
];

const guides = [
  {
    href: '/tutorial/meditation-self-exploration',
    title: 'Meditation and self-exploration',
    description: 'Build a sound-supported reflection practice without chasing a prescribed outcome.',
  },
  {
    href: '/tutorial/dreamwork-lucid-dreaming',
    title: 'Dreamwork and lucid dreaming',
    description: 'Work with dream recall, journaling, hypnagogia, and lucid-dream research while protecting sleep.',
  },
  {
    href: '/tutorial/astral-projection-out-of-body-experiences',
    title: 'Astral projection and out-of-body experiences',
    description: 'Separate personal interpretation from what neurological research can and cannot establish.',
  },
  {
    href: '/tutorial/remote-viewing-stargate-documents',
    title: 'Remote viewing and STAR GATE documents',
    description: 'Read the declassified program record without treating its existence as proof of paranormal ability.',
  },
];

export default function TutorialPage() {
  const tutorialJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'How to Use Cognistration Safely and Intentionally',
    url: 'https://cognistration.com/tutorial',
    description: 'A practical guide to preparing for, listening to, and reflecting after a Cognistration audio session.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Cognistration',
      url: 'https://cognistration.com',
    },
  };

  return (
    <div className="tutorial-light-theme min-h-[100dvh] overflow-x-hidden bg-[#eef1ee] text-[#1d302c] selection:bg-[#b6ddcc]/60">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tutorialJsonLd) }} />
      <PublicHeader />

      <TutorialMotion>
        <main>
          <section className="tutorial-dark-section relative isolate min-h-[78dvh] overflow-hidden bg-[#13201d] px-5 pb-20 pt-32 text-white sm:px-8 sm:pb-28 sm:pt-40 lg:px-12">
            <ElectricKelpBackground />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#101b19]/70 via-[#13201d]/30 to-[#101b19]/95" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#13201d]" aria-hidden="true" />

            <div className="relative z-10 mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-24">
              <div data-tutorial-reveal className="max-w-4xl">
                <h1 className="max-w-4xl text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl lg:text-[clamp(4.1rem,5.8vw,6.25rem)]">
                  Listen with a purpose. <span className="text-white/50">Return with perspective.</span>
                </h1>
                <p className="mt-8 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                  A practical guide to preparing a session, staying oriented while you listen, and reflecting on the experience without forcing a result.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a href="#workflow" className="inline-flex items-center gap-2 rounded-full bg-[#d7eadf] px-5 py-3.5 text-sm font-medium text-[#17332e] transition hover:bg-white active:translate-y-px">
                    Start with the routine <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                  </a>
                  <Link href="/machine" className="inline-flex items-center gap-2 text-sm text-white/70 underline decoration-white/25 underline-offset-8 transition hover:text-white">
                    See the machine
                  </Link>
                </div>
              </div>

              <div data-tutorial-reveal className="relative border-l border-white/20 pl-7 md:pl-10">
                <MoonStars className="size-9 text-[#d7eadf]" weight="duotone" aria-hidden="true" />
                <div className="mt-10 flex h-20 items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 24 }).map((_, index) => (
                    <span key={index} data-signal-bar className="h-10 w-px origin-center bg-[#d7eadf]" style={{ opacity: 0.2 + (index % 6) * 0.1 }} />
                  ))}
                </div>
                <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">The audio is a support for attention and reflection, not a test you can pass or fail.</p>
              </div>
            </div>

            <a href="#workflow" className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 text-xs text-white/50 transition hover:text-white md:flex">
              Read the routine <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          </section>

          <section id="workflow" className="scroll-mt-24 bg-[#eef1ee] px-5 py-24 sm:px-8 lg:py-32 lg:px-12">
            <div className="mx-auto max-w-[1400px]">
              <div data-tutorial-reveal className="grid gap-6 border-b border-[#cbd6cf] pb-12 lg:grid-cols-[0.7fr_1.3fr]">
                <p className="text-sm font-medium text-[#315e55]">The listening routine</p>
                <h2 className="max-w-3xl text-3xl font-medium leading-tight tracking-[-0.045em] text-[#1d302c] md:text-5xl">A clear before, during, and after makes the session easier to use.</h2>
              </div>
              <ol className="divide-y divide-[#cbd6cf]">
                {workflow.map(({ phase, title, body, icon: Icon }, index) => (
                  <li key={phase} data-tutorial-reveal className="grid gap-6 py-10 md:grid-cols-[5rem_0.7fr_1.3fr] md:items-start md:py-14">
                    <span className="text-xs font-medium tabular-nums text-[#87968f]">0{index + 1}</span>
                    <div>
                      <Icon weight="duotone" className="mb-5 size-7 text-[#548477]" aria-hidden="true" />
                      <p className="text-sm font-medium text-[#548477]">{phase}</p>
                      <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-[#1d302c]">{title}</h3>
                    </div>
                    <p className="max-w-2xl text-base leading-8 text-[#60716b]">{body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="bg-[#f7f8f5] px-5 py-24 sm:px-8 lg:py-32 lg:px-12">
            <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
              <div data-tutorial-reveal>
                <p className="text-sm font-medium text-[#315e55]">What the audio can do</p>
                <h2 className="mt-6 text-3xl font-medium leading-tight tracking-[-0.045em] text-[#1d302c] md:text-5xl">A useful tool, with mixed evidence behind the mechanism.</h2>
              </div>
              <div data-tutorial-reveal className="space-y-7 text-base leading-8 text-[#60716b]">
                <p>Binaural beats are heard when each ear receives a slightly different tone and the listener perceives a rhythmic difference between them. Some studies report changes in anxiety, attention, pain, or brain activity, but results vary. A 2023 systematic review found EEG evidence for reliable brainwave entrainment was inconsistent.</p>
                <p>Cognistration provides intentional audio and reflection tools. It does not guarantee a frequency-specific state, diagnose a condition, or replace medical or mental-health care.</p>
                <div className="flex flex-wrap gap-x-7 gap-y-3 pt-2 text-sm">
                  <a href="https://pubmed.ncbi.nlm.nih.gov/37205669/" rel="noreferrer" target="_blank" className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4">2023 EEG systematic review</a>
                  <a href="https://pubmed.ncbi.nlm.nih.gov/30073406/" rel="noreferrer" target="_blank" className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4">2019 meta-analysis</a>
                  <a href="https://www.who.int/publications/i/item/9789241515276" rel="noreferrer" target="_blank" className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4">WHO safe-listening guidance</a>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-b from-[#eef1ee] to-[#e1eae4] px-5 py-24 sm:px-8 lg:py-32 lg:px-12">
            <div className="mx-auto max-w-[1400px]">
              <div data-tutorial-reveal className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <Pause weight="duotone" className="size-8 text-[#548477]" aria-hidden="true" />
                  <p className="mt-6 text-sm font-medium text-[#315e55]">Know when to stop</p>
                </div>
                <div>
                  <h2 className="text-3xl font-medium tracking-[-0.045em] text-[#1d302c] md:text-5xl">Comfort and orientation come first.</h2>
                  <p className="mt-7 max-w-3xl text-base leading-8 text-[#60716b]">Stop the audio if you feel pain, dizziness, panic, marked distress, disorientation, or worsening symptoms. Remove the headphones, open your eyes, notice the room, and return to ordinary activity. Seek appropriate professional help if symptoms are severe or persist. Do not use a session as a substitute for care.</p>
                  <Link href="/health-warning" className="mt-8 inline-flex items-center gap-3 text-sm font-medium text-[#315e55] underline decoration-[#315e55]/30 underline-offset-8">Read the health warning <ArrowRight className="size-4" aria-hidden="true" /></Link>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#f7f8f5] px-5 py-24 sm:px-8 lg:py-32 lg:px-12">
            <div className="mx-auto max-w-[1400px]">
              <div data-tutorial-reveal className="max-w-3xl">
                <p className="text-sm font-medium text-[#315e55]">Continue by intention</p>
                <h2 className="mt-6 text-3xl font-medium tracking-[-0.045em] text-[#1d302c] md:text-5xl">Four deeper guides, each with a different question.</h2>
              </div>
              <nav aria-label="Tutorial topic guides" className="mt-14 divide-y divide-[#cbd6cf] border-y border-[#cbd6cf]">
                {guides.map((guide, index) => (
                  <Link key={guide.href} href={guide.href} data-tutorial-reveal className="group grid gap-5 py-9 transition hover:bg-[#eef1ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#548477] md:grid-cols-[4rem_0.9fr_1.1fr_2rem] md:items-center md:px-4">
                    <span className="text-xs font-medium text-[#87968f]">0{index + 1}</span>
                    <h3 className="text-xl font-medium tracking-[-0.025em] text-[#1d302c]">{guide.title}</h3>
                    <p className="max-w-xl text-sm leading-7 text-[#60716b]">{guide.description}</p>
                    <ArrowRight className="size-5 text-[#87968f] transition-transform group-hover:translate-x-1 group-hover:text-[#315e55]" aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </div>
          </section>

          <section className="tutorial-dark-section bg-[#202b28] px-5 py-20 text-white sm:px-8 md:py-24 lg:px-12">
            <div data-tutorial-reveal className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <SlidersHorizontal weight="duotone" className="size-8 text-[#b6ddcc]" aria-hidden="true" />
                <h2 className="mt-6 text-3xl font-medium tracking-[-0.045em] md:text-4xl">Ready to build a private listening practice?</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Cognistration is a one-time $20 platform purchase with access to the private Studio, Workshop, and listening tools.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/pricing" className="inline-flex items-center gap-3 rounded-full bg-[#d7eadf] px-6 py-3 text-sm font-medium text-[#17332e] transition hover:bg-white active:scale-[0.98]">View membership <ArrowRight className="size-4" aria-hidden="true" /></Link>
                <Link href="/machine" className="inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm text-white transition hover:border-white/40 hover:bg-white/[0.08] active:scale-[0.98]">Explore the platform</Link>
              </div>
            </div>
          </section>
        </main>
      </TutorialMotion>
      <PublicTrustFooter />
    </div>
  );
}
