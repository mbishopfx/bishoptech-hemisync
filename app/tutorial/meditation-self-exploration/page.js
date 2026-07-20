import Link from 'next/link';
import { ArrowRight, Eye, Notebook, PersonSimpleTaiChi, Target } from '@phosphor-icons/react/dist/ssr';
import { TutorialArticleShell } from '@/components/tutorial/TutorialArticleShell';

const title = 'Meditation and Self-Exploration with Cognistration';
const description = 'A grounded guide to sound-supported meditation, body awareness, intention setting, and reflective self-inquiry without forcing an outcome.';
const canonical = 'https://cognistration.com/tutorial/meditation-self-exploration';
const mark = 'https://cognistration.com/images/cognistration-mark.png';

export const metadata = {
  title: { absolute: `${title} — Cognistration` },
  description,
  alternates: { canonical },
  openGraph: {
    title: `${title} — Cognistration`,
    description,
    siteName: 'Cognistration',
    type: 'website',
    url: canonical,
    images: [{ url: mark, width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: { card: 'summary_large_image', title: `${title} — Cognistration`, description, images: [mark] },
};

const sources = [
  {
    title: 'Meditation and Mindfulness: Effectiveness and Safety — NIH NCCIH',
    href: 'https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety',
    note: 'An evidence and safety overview that notes both variable benefits and reported adverse experiences.',
  },
  {
    title: 'Meditation Programs for Psychological Stress and Well-being — Goyal et al., JAMA Internal Medicine (2014)',
    href: 'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/1809754',
    note: 'A systematic review finding small-to-moderate improvements for some outcomes and insufficient evidence for others.',
  },
  {
    title: 'Adverse Events in Meditation Practices and Meditation-Based Therapies — Farias et al. (2020)',
    href: 'https://onlinelibrary.wiley.com/doi/10.1111/acps.13225',
    note: 'A systematic review documenting that unwanted effects can occur and deserve clear safety framing.',
  },
  {
    title: 'Safe Listening Devices and Systems — World Health Organization and ITU (2019)',
    href: 'https://www.who.int/publications/i/item/9789241515276',
    note: 'Guidance emphasizing that listening risk depends on sound level and duration.',
  },
];

const practice = [
  { icon: Target, label: 'Set an intention', text: 'Choose a simple direction such as “notice tension,” “make room for a decision,” or “sit without solving.” Treat it as an anchor, not a required result.' },
  { icon: PersonSimpleTaiChi, label: 'Check the body', text: 'Notice contact with the chair or floor, the temperature of the air, and where breathing is easiest to feel. Let sensations change without needing to name them as energy or a special state.' },
  { icon: Eye, label: 'Listen without chasing', text: 'Keep the volume comfortable. When attention wanders, return to sound, breath, or bodily contact. A frequency label describes an audio design target; it does not guarantee a mental state.' },
  { icon: Notebook, label: 'Reflect after returning', text: 'Open your eyes, look around, and move slowly. Record observations first—sensations, emotions, images, or thoughts—then write possible interpretations separately.' },
];

export default function MeditationSelfExplorationPage() {
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: canonical,
    description,
    isPartOf: { '@type': 'WebSite', name: 'Cognistration', url: 'https://cognistration.com' },
  };

  return (
    <TutorialArticleShell eyebrow="Grounded practice guide" title={title} description={description} canonical={canonical} sources={sources}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

      <section aria-labelledby="sound-supported-meditation" className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Start grounded</p>
          <h2 id="sound-supported-meditation" className="mt-5 text-3xl font-light leading-tight tracking-[-0.03em] md:text-5xl">Use sound to support attention, not to prove an experience.</h2>
        </div>
        <div className="space-y-6 text-base font-light leading-8 text-white/58">
          <p>Sound-supported meditation gives attention something steady to return to. Cognistration can help structure the listening period and the reflection afterward, but the audio is not a test and there is no correct sensation to produce.</p>
          <p>Research on meditation is promising for some stress-related outcomes, yet results vary by practice, population, and study quality. It does not show that every session helps every person, and meditation should not replace appropriate care.</p>
          <p>Before beginning, choose a quiet place and enough unhurried time. Start with low volume, use headphones only when the audio calls for stereo separation, and decide in advance that you may stop at any point.</p>
        </div>
      </section>

      <section aria-labelledby="practice-sequence" className="mt-24 border-t border-white/10 pt-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">A four-part session</p>
        <h2 id="practice-sequence" className="mt-5 max-w-3xl text-3xl font-light tracking-tight md:text-5xl">Intention, body awareness, listening, reflection.</h2>
        <ol className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {practice.map(({ icon: Icon, label, text }, index) => (
            <li key={label} className="grid gap-5 py-9 sm:grid-cols-[3rem_0.7fr_1.3fr] sm:items-start">
              <span className="font-mono text-xs text-white/28">0{index + 1}</span>
              <div><Icon weight="thin" className="mb-4 size-7 text-cyan-100/65" aria-hidden="true" /><h3 className="text-xl font-light">{label}</h3></div>
              <p className="text-sm leading-7 text-white/52">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="reflection-prompts" className="mt-24 grid gap-10 border-t border-white/10 pt-20 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Post-session reflection</p>
          <h2 id="reflection-prompts" className="mt-5 text-3xl font-light tracking-tight md:text-4xl">Describe first. Interpret second.</h2>
          <p className="mt-6 text-base font-light leading-8 text-white/55">This separation helps preserve what actually happened before expectations reshape the memory. Short notes are enough.</p>
        </div>
        <ul className="space-y-4 text-sm leading-7 text-white/60">
          {['What sensations or emotions did I notice?', 'When did attention wander, and what helped it return?', 'What image or idea stayed with me after the sound ended?', 'What meaning am I considering—and what other explanations could fit?', 'Is there one ordinary action I want to take next?'].map((prompt) => <li key={prompt} className="border-l border-cyan-100/25 py-2 pl-5">{prompt}</li>)}
        </ul>
      </section>

      <section aria-labelledby="metaphysical-inquiry" className="mt-24 border-y border-white/10 bg-white/[0.025] px-6 py-12 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Meaning and evidence</p>
        <h2 id="metaphysical-inquiry" className="mt-5 max-w-3xl text-3xl font-light tracking-tight md:text-4xl">Metaphysical self-inquiry can be meaningful without becoming a scientific claim.</h2>
        <div className="mt-7 grid gap-7 text-sm leading-7 text-white/55 md:grid-cols-2">
          <p>You may understand an image, felt presence, intuition, or sense of connection through a spiritual, symbolic, psychological, or everyday lens. Personal meaning can matter even when an experience cannot verify an external metaphysical explanation.</p>
          <p>Try asking, “What does this suggest to me?” rather than “What does this prove?” Cognistration does not claim to open portals, confirm hidden realities, diagnose causes, or guarantee access to a particular state.</p>
        </div>
      </section>

      <section aria-labelledby="when-to-stop" className="mt-24 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-100/60">When to stop</p>
          <h2 id="when-to-stop" className="mt-5 text-3xl font-light tracking-tight md:text-4xl">Do not push through distress.</h2>
        </div>
        <div className="space-y-5 text-base font-light leading-8 text-white/55">
          <p>End the session if you feel panic, marked distress, pain, dizziness, disorientation, worsening symptoms, or a sense that continuing is unsafe. Remove the headphones, open your eyes, name what you see, feel your feet or another point of contact, and return to ordinary activity.</p>
          <p>Adverse experiences have been reported in meditation research. If difficult effects are severe, persist, disrupt daily life, or concern you, contact an appropriate qualified health professional. If you are in immediate danger, use local emergency services.</p>
        </div>
      </section>

      <nav aria-label="Continue learning" className="mt-24 border-t border-white/10 pt-16">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Continue learning</p>
        <div className="mt-7 flex flex-wrap gap-4">
          <Link href="/tutorial" className="inline-flex items-center gap-3 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#080b0c]">Session setup guide <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/tutorial/dreamwork-lucid-dreaming" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.16em] transition hover:border-cyan-100 hover:text-cyan-100">Dreamwork guide <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/tutorial/astral-projection-out-of-body-experiences" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.16em] transition hover:border-cyan-100 hover:text-cyan-100">Experience and evidence <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </nav>
    </TutorialArticleShell>
  );
}
