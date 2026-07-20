import Link from 'next/link';
import { ArrowRight, Compass, Eye, PersonArmsSpread, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import { TutorialArticleShell } from '@/components/tutorial/TutorialArticleShell';

const title = 'Astral Projection and Out-of-Body Experiences';
const description = 'A grounded guide to out-of-body reports, related sleep experiences, personal interpretation, and what neurological evidence can—and cannot—establish.';
const canonical = 'https://cognistration.com/tutorial/astral-projection-out-of-body-experiences';
const mark = 'https://cognistration.com/images/cognistration-mark.png';

export const metadata = {
  title: { absolute: `${title} — Cognistration` },
  description,
  alternates: { canonical },
  openGraph: {
    title: `${title} — Cognistration`, description, siteName: 'Cognistration', type: 'website', url: canonical,
    images: [{ url: mark, width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: { card: 'summary_large_image', title: `${title} — Cognistration`, description, images: [mark] },
};

const sources = [
  {
    title: 'Out-of-Body Experience and Autoscopy of Neurological Origin — Blanke et al., Brain (2004)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/14662516/',
    note: 'Clinical evidence connecting some OBE-like and autoscopic experiences with disrupted multisensory integration and temporoparietal processing.',
  },
  {
    title: 'What Happens During Sleep? — NIH NICHD',
    href: 'https://www.nichd.nih.gov/health/topics/sleep/conditioninfo/Pages/what-happens.aspx',
    note: 'An overview of REM and non-REM sleep, dreaming, muscle relaxation, and unresolved questions about dreams.',
  },
  {
    title: 'Meditation and Mindfulness: Effectiveness and Safety — NIH NCCIH',
    href: 'https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety',
    note: 'Evidence and safety context noting variable findings and reported adverse experiences.',
  },
  {
    title: 'Adverse Events in Meditation Practices and Meditation-Based Therapies — Farias et al. (2020)',
    href: 'https://onlinelibrary.wiley.com/doi/10.1111/acps.13225',
    note: 'A systematic review documenting that unwanted effects can occur during contemplative practices.',
  },
  {
    title: 'Safe Listening Devices and Systems — World Health Organization and ITU (2019)',
    href: 'https://www.who.int/publications/i/item/9789241515276',
    note: 'Guidance emphasizing that listening risk depends on sound level and duration.',
  },
];

const comparisons = [
  { term: 'Out-of-body experience (OBE)', meaning: 'A report of experiencing the self or viewpoint as located outside the physical body, sometimes with a view of the body or surroundings.' },
  { term: 'Astral projection', meaning: 'A spiritual or metaphysical interpretation in which a person understands an OBE-like event as consciousness or an “astral body” traveling beyond the physical body.' },
  { term: 'Lucid dream', meaning: 'A dream in which the dreamer becomes aware that they are dreaming. It occurs during sleep and may include some sense of choice or control.' },
  { term: 'Hypnagogia', meaning: 'Images, sounds, thoughts, or bodily sensations that can arise while transitioning from wakefulness into sleep.' },
  { term: 'Sleep paralysis', meaning: 'A temporary inability to move around waking or falling asleep, sometimes accompanied by vivid imagery, sensed presence, pressure, or fear.' },
];

export default function AstralProjectionOutOfBodyExperiencesPage() {
  const webPageJsonLd = {
    '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: canonical, description,
    isPartOf: { '@type': 'WebSite', name: 'Cognistration', url: 'https://cognistration.com' },
  };

  return (
    <TutorialArticleShell eyebrow="Experience and evidence guide" title={title} description={description} canonical={canonical} sources={sources}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

      <section aria-labelledby="language-first" className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Language first</p>
          <h2 id="language-first" className="mt-5 text-3xl font-light leading-tight tracking-[-0.03em] md:text-5xl">A report, an interpretation, and an explanation are not the same thing.</h2>
        </div>
        <div className="space-y-6 text-base font-light leading-8 text-white/58">
          <p>People use “astral projection” and “out-of-body experience” in overlapping ways, but the terms carry different assumptions. An OBE describes what someone reports: a felt viewpoint or sense of self outside the body. Astral projection usually adds a metaphysical interpretation about what occurred.</p>
          <p>A vivid report can be personally important without settling its cause. People may interpret unusual bodily or dreamlike experiences spiritually, psychologically, neurologically, or through more than one lens. Cognistration does not verify a metaphysical explanation or claim to induce astral projection.</p>
        </div>
      </section>

      <section aria-labelledby="experience-comparison" className="mt-24 border-t border-white/10 pt-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Related, not interchangeable</p>
        <h2 id="experience-comparison" className="mt-5 max-w-3xl text-3xl font-light tracking-tight md:text-5xl">Compare the features before choosing a label.</h2>
        <dl className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {comparisons.map(({ term, meaning }, index) => (
            <div key={term} className="grid gap-4 py-8 md:grid-cols-[3rem_0.7fr_1.3fr]">
              <span className="font-mono text-xs text-white/25">0{index + 1}</span>
              <dt className="text-lg font-light text-white/90">{term}</dt>
              <dd className="text-sm leading-7 text-white/52">{meaning}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-7 max-w-3xl text-sm leading-7 text-white/45">These categories can overlap in a person’s account, but one should not automatically be relabeled as another. Note whether you were awake, falling asleep, dreaming, or waking; whether movement was possible; and what you directly noticed before deciding what it meant.</p>
      </section>

      <section aria-labelledby="brain-evidence" className="mt-24 border-y border-white/10 bg-white/[0.025] px-6 py-12 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">What neurological evidence shows</p>
        <h2 id="brain-evidence" className="mt-5 max-w-4xl text-3xl font-light tracking-tight md:text-4xl">The brain builds a sense of body and location from multiple signals.</h2>
        <div className="mt-7 grid gap-7 text-sm leading-7 text-white/55 md:grid-cols-2">
          <p>Blanke and colleagues described neurological OBE and autoscopic cases involving disrupted integration of visual, vestibular, and bodily information, with the temporoparietal junction implicated in aspects of self-location and perspective. This is evidence that altered multisensory processing can contribute to some OBE-like experiences.</p>
          <p>It is not a universal adjudication of every report, and it neither proves nor scientifically validates astral travel. A neurological model and a person’s spiritual meaning answer different questions. The evidence supports careful explanation of some mechanisms, not certainty about every experience or belief.</p>
        </div>
      </section>

      <section aria-labelledby="grounded-reflection" className="mt-24 border-t border-white/10 pt-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Grounded reflection</p>
        <h2 id="grounded-reflection" className="mt-5 max-w-3xl text-3xl font-light tracking-tight md:text-5xl">Record what happened without escalating the claim.</h2>
        <ol className="mt-12 grid gap-px bg-white/10 md:grid-cols-3">
          {[
            { icon: PersonArmsSpread, title: 'Describe sensations', text: 'Write whether you felt floating, vibration, pressure, motion, a shifted viewpoint, immobility, fear, calm, imagery, or a sensed presence.' },
            { icon: Eye, title: 'Name the setting', text: 'Note whether you were awake, meditating, falling asleep, dreaming, or waking. Record what supports that judgment and where uncertainty remains.' },
            { icon: Compass, title: 'Hold multiple readings', text: 'Separate direct observation from personal meaning. Ask what a sleep, attention, body-perception, emotional, or spiritual interpretation adds—and what each leaves unresolved.' },
          ].map(({ icon: Icon, title: itemTitle, text }, index) => (
            <li key={itemTitle} className="bg-[#080b0c] p-7 md:p-9">
              <span className="font-mono text-xs text-white/25">0{index + 1}</span>
              <Icon weight="thin" className="mt-8 size-8 text-cyan-100/65" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-light">{itemTitle}</h3>
              <p className="mt-4 text-sm leading-7 text-white/50">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-7 max-w-3xl text-sm leading-7 text-white/45">Do not use an audio frequency label as proof of a cause. Cognistration provides audio and reflection tools; it does not guarantee an OBE, departure from the body, paranormal perception, or a product-induced state.</p>
      </section>

      <section aria-labelledby="orient-and-stop" className="mt-24 grid gap-8 border-t border-white/10 pt-20 lg:grid-cols-[auto_1fr] lg:gap-10">
        <WarningCircle weight="thin" className="size-9 text-amber-100/70" aria-hidden="true" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-100/60">Orient and stop</p>
          <h2 id="orient-and-stop" className="mt-5 text-3xl font-light tracking-tight md:text-4xl">Return to the room before trying to interpret.</h2>
          <div className="mt-6 space-y-5 text-base font-light leading-8 text-white/55">
            <p>If an experience becomes frightening or disorienting, stop the audio. Remove the headphones, open your eyes, sit up if safe, name five things you can see, feel a stable surface, and notice the current time and place. If you are emerging from sleep paralysis, remind yourself that you are waking and try a small movement such as a finger or toe.</p>
            <p>Pause the practice if experiences cause panic, marked distress, sleep loss, worsening symptoms, unsafe behavior, or difficulty separating an internal experience from waking events. Seek appropriate qualified professional support if effects are severe or persist; use local emergency services if you are in immediate danger.</p>
          </div>
        </div>
      </section>

      <nav aria-label="Continue learning" className="mt-24 border-t border-white/10 pt-16">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Continue learning</p>
        <div className="mt-7 flex flex-wrap gap-4">
          <Link href="/tutorial" className="inline-flex items-center gap-3 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#080b0c]">Session setup guide <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/tutorial/dreamwork-lucid-dreaming" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.16em] transition hover:border-cyan-100 hover:text-cyan-100">Dreamwork guide <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/tutorial/remote-viewing-stargate-documents" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.16em] transition hover:border-cyan-100 hover:text-cyan-100">STAR GATE history <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </nav>
    </TutorialArticleShell>
  );
}
