import Link from 'next/link';
import { ArrowRight, BookOpenText, MoonStars, SunHorizon, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import { TutorialArticleShell } from '@/components/tutorial/TutorialArticleShell';

const title = 'Dreamwork and Lucid Dreaming with Cognistration';
const description = 'A sleep-respecting guide to dream recall, journaling, hypnagogic imagery, and lucid-dream research without sacrificing rest or promising an outcome.';
const canonical = 'https://cognistration.com/tutorial/dreamwork-lucid-dreaming';
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
    title: 'What Happens During Sleep? — NIH NICHD',
    href: 'https://www.nichd.nih.gov/health/topics/sleep/conditioninfo/Pages/what-happens.aspx',
    note: 'A plain-language overview of REM and non-REM sleep, dreaming, and unresolved questions about why humans dream.',
  },
  {
    title: 'Real-time Dialogue Between Experimenters and Dreamers During REM Sleep — Konkoly et al. (2021)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/33607035/',
    note: 'A laboratory study showing limited two-way communication with some polysomnographically verified lucid dreamers.',
  },
  {
    title: 'Induction of Lucid Dreams: A Systematic Review — Stumbrys et al. (2012)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/22841958/',
    note: 'A review finding that the evidence for lucid-dream induction methods was limited and uneven.',
  },
  {
    title: 'Adverse Events in Meditation Practices and Meditation-Based Therapies — Farias et al. (2020)',
    href: 'https://onlinelibrary.wiley.com/doi/10.1111/acps.13225',
    note: 'Safety context for contemplative practices: unwanted experiences can occur and should not be dismissed.',
  },
  {
    title: 'Safe Listening Devices and Systems — World Health Organization and ITU (2019)',
    href: 'https://www.who.int/publications/i/item/9789241515276',
    note: 'Guidance emphasizing that listening risk depends on sound level and duration.',
  },
];

const recallRoutine = [
  { icon: MoonStars, title: 'Protect the night', text: 'Set a normal bedtime and let sleep remain the priority. If you use audio before bed, keep it comfortable and use a timer so it does not wake you later.' },
  { icon: SunHorizon, title: 'Pause on waking', text: 'Before reaching for a screen, stay still for a moment. Notice the last image, feeling, place, person, or action you remember—even if it is only a fragment.' },
  { icon: BookOpenText, title: 'Record before interpreting', text: 'Write a few concrete details in the present tense. Add possible meanings afterward, clearly separated from the remembered dream.' },
];

export default function DreamworkLucidDreamingPage() {
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: canonical,
    description,
    isPartOf: { '@type': 'WebSite', name: 'Cognistration', url: 'https://cognistration.com' },
  };

  return (
    <TutorialArticleShell eyebrow="Sleep-respecting practice guide" title={title} description={description} canonical={canonical} sources={sources}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

      <section aria-labelledby="sleep-first" className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Sleep comes first</p>
          <h2 id="sleep-first" className="mt-5 text-3xl font-light leading-tight tracking-[-0.03em] md:text-5xl">Dreamwork should not cost you the rest it depends on.</h2>
        </div>
        <div className="space-y-6 text-base font-light leading-8 text-white/58">
          <p>Use Cognistration as an optional wind-down or reflection aid, not as a reason to repeatedly interrupt sleep. A useful dream practice begins with a stable sleep opportunity, a gentle recall routine, and permission to remember nothing on some mornings.</p>
          <p>Dreaming is often vivid during rapid eye movement (REM) sleep, but dreams also occur during non-REM sleep. Scientists continue to study why humans dream. “Deep dreaming” is informal audience language, not a defined sleep stage or a state that an audio track can guarantee.</p>
          <p>If headphones are uncomfortable in bed, do not sleep in them. Keep playback quiet, follow a timer, and never increase volume in pursuit of a stronger experience.</p>
        </div>
      </section>

      <section aria-labelledby="recall-routine" className="mt-24 border-t border-white/10 pt-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Dream recall routine</p>
        <h2 id="recall-routine" className="mt-5 max-w-3xl text-3xl font-light tracking-tight md:text-5xl">Make remembering easier without forcing yourself awake.</h2>
        <ol className="mt-12 grid gap-px bg-white/10 md:grid-cols-3">
          {recallRoutine.map(({ icon: Icon, title: itemTitle, text }, index) => (
            <li key={itemTitle} className="bg-[#080b0c] p-7 md:p-9">
              <span className="font-mono text-xs text-white/25">0{index + 1}</span>
              <Icon weight="thin" className="mt-8 size-8 text-cyan-100/65" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-light">{itemTitle}</h3>
              <p className="mt-4 text-sm leading-7 text-white/50">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="journal-prompts" className="mt-24 grid gap-10 border-t border-white/10 pt-20 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Optional journal prompts</p>
          <h2 id="journal-prompts" className="mt-5 text-3xl font-light tracking-tight md:text-4xl">Keep the record small enough to sustain.</h2>
          <p className="mt-6 text-base font-light leading-8 text-white/55">A title and three details can be enough. Dream journaling is reflection, not diagnosis or a decoding system with fixed meanings.</p>
        </div>
        <ul className="space-y-4 text-sm leading-7 text-white/60">
          {['What is the earliest or latest fragment I remember?', 'What setting, person, object, or action stood out?', 'What emotion was present in the dream and on waking?', 'What changed abruptly or did not follow waking logic?', 'What personal association comes to mind—and what other reading could fit?'].map((prompt) => <li key={prompt} className="border-l border-cyan-100/25 py-2 pl-5">{prompt}</li>)}
        </ul>
      </section>

      <section aria-labelledby="hypnagogia" className="mt-24 border-y border-white/10 bg-white/[0.025] px-6 py-12 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">At the edge of sleep</p>
        <h2 id="hypnagogia" className="mt-5 max-w-3xl text-3xl font-light tracking-tight md:text-4xl">Hypnagogic imagery can feel vivid without being a message or a lucid dream.</h2>
        <div className="mt-7 grid gap-7 text-sm leading-7 text-white/55 md:grid-cols-2">
          <p>As wakefulness gives way to sleep, brief images, sounds, sensations, or drifting thoughts may arise. Notice them lightly if you want, but let sleep happen rather than trying to hold the experience in place.</p>
          <p>You may interpret an image personally or symbolically. Cognistration does not claim that hypnagogic content predicts events, reveals an external realm, or proves a metaphysical explanation.</p>
        </div>
      </section>

      <section aria-labelledby="lucid-evidence" className="mt-24 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Lucid dreaming evidence</p>
          <h2 id="lucid-evidence" className="mt-5 text-3xl font-light tracking-tight md:text-4xl">Documented phenomenon, limited induction evidence.</h2>
        </div>
        <div className="space-y-5 text-base font-light leading-8 text-white/55">
          <p>Lucid dreaming—becoming aware that one is dreaming while the dream continues—is an empirically documented sleep phenomenon. In laboratory work, researchers have communicated in real time with some lucid dreamers whose REM sleep was verified with sleep recordings.</p>
          <p>That finding does not mean lucidity is reliably controllable. A systematic review found the evidence for induction techniques limited and uneven. Cognistration does not guarantee lucid dreams, dream control, a specific benefit, or any product-induced outcome.</p>
          <p>If an experiment requires alarms, repeated awakenings, or shortened sleep, weigh the cost honestly. Preserving sleep continuity is more important than achieving lucidity.</p>
        </div>
      </section>

      <section aria-labelledby="sleep-paralysis" className="mt-24 border-t border-white/10 pt-20">
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-10">
          <WarningCircle weight="thin" className="size-9 text-amber-100/70" aria-hidden="true" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-100/60">Sleep paralysis and unusual experiences</p>
            <h2 id="sleep-paralysis" className="mt-5 text-3xl font-light tracking-tight md:text-4xl">Orient first; interpret later.</h2>
            <div className="mt-6 space-y-5 text-base font-light leading-8 text-white/55">
              <p>Waking without being able to move, sensing a presence, or experiencing vivid dreamlike imagery can be frightening. Remind yourself that you are waking, focus on slow breathing, and try a small movement such as a finger or toe. When movement returns, sit up, turn on a light, and name familiar features of the room.</p>
              <p>People may understand unusual sleep experiences spiritually, psychologically, or neurologically. Personal meaning does not establish a universal cause. If episodes are frequent, dangerous, severely distressing, or interfere with sleep and daily life, pause the practice and speak with an appropriate qualified health professional.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="when-to-stop-dreamwork" className="mt-24 border-t border-white/10 pt-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-amber-100/60">When to stop</p>
        <h2 id="when-to-stop-dreamwork" className="mt-5 max-w-3xl text-3xl font-light tracking-tight md:text-4xl">Pause when the practice makes sleep or waking life harder.</h2>
        <p className="mt-6 max-w-3xl text-base font-light leading-8 text-white/55">Stop the audio or dream practice if it causes sleep loss, panic, marked distress, disorientation, worsening symptoms, or difficulty separating a dream memory from waking events. Return to ordinary sleep habits and grounding routines. Seek appropriate professional support if effects are severe or persist; use local emergency services if you are in immediate danger.</p>
      </section>

      <nav aria-label="Continue learning" className="mt-24 border-t border-white/10 pt-16">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Continue learning</p>
        <div className="mt-7 flex flex-wrap gap-4">
          <Link href="/tutorial" className="inline-flex items-center gap-3 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#080b0c]">Session setup guide <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/tutorial/meditation-self-exploration" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.16em] transition hover:border-cyan-100 hover:text-cyan-100">Meditation guide <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/tutorial/astral-projection-out-of-body-experiences" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.16em] transition hover:border-cyan-100 hover:text-cyan-100">Unusual experience guide <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </nav>
    </TutorialArticleShell>
  );
}
