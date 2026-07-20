import Image from 'next/image';
import Link from 'next/link';
import {
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
    eyebrow: 'Grounded practice',
    title: 'Meditation and self-exploration',
    description: 'Build a sound-supported reflection practice without chasing a prescribed outcome.',
  },
  {
    href: '/tutorial/dreamwork-lucid-dreaming',
    eyebrow: 'Sleep-respecting',
    title: 'Dreamwork and lucid dreaming',
    description: 'Work with dream recall, journaling, hypnagogia, and lucid-dream research while protecting sleep.',
  },
  {
    href: '/tutorial/astral-projection-out-of-body-experiences',
    eyebrow: 'Experience and evidence',
    title: 'Astral projection and out-of-body experiences',
    description: 'Separate personal interpretation from what neurological research can and cannot establish.',
  },
  {
    href: '/tutorial/remote-viewing-stargate-documents',
    eyebrow: 'Primary-source history',
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
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#080b0c] text-white selection:bg-cyan-200/25">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tutorialJsonLd) }} />
      <PublicHeader />

      <TutorialMotion>
        <main>
          <section className="relative border-b border-white/10 px-5 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute left-[58%] top-10 h-[34rem] w-[34rem] rounded-full bg-cyan-200/[0.045] blur-[120px]" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent" />
            </div>
            <div className="relative mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-24">
              <div data-tutorial-reveal>
                <p className="text-[10px] uppercase tracking-[0.34em] text-cyan-100/55">Cognistration field guide</p>
                <h1 className="mt-7 max-w-4xl text-5xl font-extralight leading-[0.95] tracking-[-0.055em] md:text-7xl lg:text-[5.25rem]">
                  Listen with a purpose. <span className="text-white/32">Return with perspective.</span>
                </h1>
                <p className="mt-8 max-w-2xl text-lg font-light leading-8 text-white/58 md:text-xl">
                  Use this tutorial to prepare a safe audio session, stay oriented while listening, and reflect on the experience without forcing a result.
                </p>
                <a href="#workflow" className="mt-10 inline-flex items-center gap-3 border-b border-white/25 pb-2 text-xs uppercase tracking-[0.22em] text-white transition hover:border-cyan-100 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100">
                  Start with the routine <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>

              <div data-tutorial-reveal className="relative border-l border-white/10 pl-7 md:pl-10">
                <Image src="/images/cognistration-mark.png" alt="Cognistration brain and waveform mark" width={1254} height={1254} priority className="h-24 w-24 border border-white/10 object-cover md:h-32 md:w-32" />
                <div className="mt-10 flex h-20 items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 24 }).map((_, index) => (
                    <span key={index} data-signal-bar className="h-10 w-px origin-center bg-cyan-100/65" style={{ opacity: 0.2 + (index % 6) * 0.1 }} />
                  ))}
                </div>
                <p className="mt-5 max-w-sm text-sm leading-6 text-white/45">The audio is a support for attention and reflection, not a test you can pass or fail.</p>
              </div>
            </div>
          </section>

          <section id="workflow" className="scroll-mt-24 px-5 py-24 md:px-10 lg:py-32">
            <div className="mx-auto max-w-[1400px]">
              <div data-tutorial-reveal className="grid gap-6 border-b border-white/10 pb-12 lg:grid-cols-[0.7fr_1.3fr]">
                <p className="text-[10px] uppercase tracking-[0.34em] text-cyan-100/55">The listening routine</p>
                <h2 className="max-w-3xl text-3xl font-light leading-tight tracking-[-0.035em] md:text-5xl">A clear before, during, and after makes the session easier to use.</h2>
              </div>
              <ol className="divide-y divide-white/10">
                {workflow.map(({ phase, title, body, icon: Icon }, index) => (
                  <li key={phase} data-tutorial-reveal className="grid gap-6 py-10 md:grid-cols-[5rem_0.7fr_1.3fr] md:items-start md:py-14">
                    <span className="font-mono text-xs tabular-nums text-white/30">0{index + 1}</span>
                    <div>
                      <Icon weight="thin" className="mb-5 size-7 text-cyan-100/70" aria-hidden="true" />
                      <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">{phase}</p>
                      <h3 className="mt-3 text-2xl font-light tracking-tight">{title}</h3>
                    </div>
                    <p className="max-w-2xl text-base font-light leading-8 text-white/52">{body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="border-y border-white/10 bg-[#0c1112] px-5 py-24 md:px-10 lg:py-32">
            <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
              <div data-tutorial-reveal>
                <p className="text-[10px] uppercase tracking-[0.34em] text-cyan-100/55">What the audio can do</p>
                <h2 className="mt-6 text-3xl font-light leading-tight tracking-[-0.035em] md:text-5xl">A useful tool, with mixed evidence behind the mechanism.</h2>
              </div>
              <div data-tutorial-reveal className="space-y-7 text-base font-light leading-8 text-white/55">
                <p>Binaural beats are heard when each ear receives a slightly different tone and the listener perceives a rhythmic difference between them. Some studies report changes in anxiety, attention, pain, or brain activity, but results vary. A 2023 systematic review found EEG evidence for reliable brainwave entrainment was inconsistent.</p>
                <p>Cognistration provides intentional audio and reflection tools. It does not guarantee a frequency-specific state, diagnose a condition, or replace medical or mental-health care.</p>
                <div className="flex flex-wrap gap-x-7 gap-y-3 pt-2 text-xs">
                  <a href="https://pubmed.ncbi.nlm.nih.gov/37205669/" rel="noreferrer" target="_blank" className="border-b border-white/20 pb-1 text-white/65 hover:border-cyan-100 hover:text-cyan-100">2023 EEG systematic review</a>
                  <a href="https://pubmed.ncbi.nlm.nih.gov/30073406/" rel="noreferrer" target="_blank" className="border-b border-white/20 pb-1 text-white/65 hover:border-cyan-100 hover:text-cyan-100">2019 meta-analysis</a>
                  <a href="https://www.who.int/publications/i/item/9789241515276" rel="noreferrer" target="_blank" className="border-b border-white/20 pb-1 text-white/65 hover:border-cyan-100 hover:text-cyan-100">WHO safe-listening guidance</a>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-24 md:px-10 lg:py-32">
            <div className="mx-auto max-w-[1400px]">
              <div data-tutorial-reveal className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <Pause weight="thin" className="size-8 text-cyan-100/70" aria-hidden="true" />
                  <p className="mt-6 text-[10px] uppercase tracking-[0.34em] text-cyan-100/55">Know when to stop</p>
                </div>
                <div>
                  <h2 className="text-3xl font-light tracking-[-0.035em] md:text-5xl">Comfort and orientation come first.</h2>
                  <p className="mt-7 max-w-3xl text-base font-light leading-8 text-white/55">Stop the audio if you feel pain, dizziness, panic, marked distress, disorientation, or worsening symptoms. Remove the headphones, open your eyes, notice the room, and return to ordinary activity. Seek appropriate professional help if symptoms are severe or persist. Do not use a session as a substitute for care.</p>
                  <Link href="/health-warning" className="mt-8 inline-flex items-center gap-3 border-b border-white/25 pb-2 text-xs uppercase tracking-[0.22em] hover:border-cyan-100 hover:text-cyan-100">Read the health warning <ArrowRight className="size-4" aria-hidden="true" /></Link>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-white/10 px-5 py-24 md:px-10 lg:py-32">
            <div className="mx-auto max-w-[1400px]">
              <div data-tutorial-reveal className="max-w-3xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-cyan-100/55">Continue by intention</p>
                <h2 className="mt-6 text-3xl font-light tracking-[-0.035em] md:text-5xl">Four deeper guides, each with a different question.</h2>
              </div>
              <nav aria-label="Tutorial topic guides" className="mt-14 divide-y divide-white/10 border-y border-white/10">
                {guides.map((guide, index) => (
                  <Link key={guide.href} href={guide.href} data-tutorial-reveal className="group grid gap-5 py-9 transition hover:bg-white/[0.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-100 md:grid-cols-[4rem_0.75fr_1.25fr_2rem] md:items-center md:px-4">
                    <span className="font-mono text-xs text-white/25">0{index + 1}</span>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.26em] text-cyan-100/45">{guide.eyebrow}</p>
                      <h3 className="mt-2 text-xl font-light tracking-tight text-white">{guide.title}</h3>
                    </div>
                    <p className="max-w-xl text-sm leading-7 text-white/45">{guide.description}</p>
                    <ArrowRight className="size-5 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-cyan-100" aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </div>
          </section>

          <section className="border-t border-white/10 bg-[#0c1112] px-5 py-20 md:px-10">
            <div data-tutorial-reveal className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <SlidersHorizontal weight="thin" className="size-8 text-cyan-100/70" aria-hidden="true" />
                <h2 className="mt-6 text-3xl font-light tracking-tight md:text-4xl">Ready to build a private listening practice?</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">Cognistration is one $9 monthly membership with access to the private audio Studio, Workshop, and listening tools.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/pricing" className="inline-flex items-center gap-3 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#080b0c] transition active:scale-[0.98]">View membership <ArrowRight className="size-4" aria-hidden="true" /></Link>
                <Link href="/machine" className="inline-flex items-center gap-3 border border-white/15 px-6 py-3 text-xs uppercase tracking-[0.16em] text-white transition hover:border-white/35 active:scale-[0.98]">Explore the platform</Link>
              </div>
            </div>
          </section>
        </main>
      </TutorialMotion>
      <PublicTrustFooter />
    </div>
  );
}
