import Link from "next/link";
import { cerebellumTimingCompilerPostMeta } from "@/lib/blog/posts-data";

export const cerebellumTimingCompilerPost = cerebellumTimingCompilerPostMeta;

const introParagraphs = [
  "The cerebellum is usually introduced as a motor structure, which is true in the same way a metronome is a percussion instrument. It is involved in movement, but the deeper story is timing, prediction, and error correction across many kinds of sequence.",
  "That matters for consciousness because experience unfolds in ordered packets. Sensation arrives, expectation updates, motor plans prepare, and the nervous system estimates what should happen next. The cerebellum helps calibrate that sequence so the world feels continuous instead of mechanically fragmented.",
  "If the superior colliculus decides where to turn, the cerebellum helps decide how the turn should land in time.",
];

const sections = [
  {
    title: "The hook: timing is the hidden grammar of the present",
    paragraphs: [
      "A conscious moment is not just content. It is content arriving with the right cadence. If timing slips, the moment can feel late, off, unstable, or strangely detached from the body that is trying to live it.",
      "The cerebellum contributes to that cadence by refining prediction against incoming evidence. It keeps rechecking whether the next beat, the next motion, the next sensory consequence, or the next phrase is arriving where the system expected it to arrive.",
      "That is why the cerebellum belongs in consciousness mechanics. It helps compile the temporal structure that allows awareness to feel joined up.",
    ],
    callout: {
      label: "Big idea",
      text: "The cerebellum does more than correct movement. It helps preserve the timing architecture that makes experience feel continuous.",
    },
  },
  {
    title: "Forward models are the brain’s quiet prediction engine",
    paragraphs: [
      "The cerebellum is heavily involved in forward modeling. It estimates the sensory consequences of a command before the full feedback arrives. That prediction lets the nervous system compare expectation with outcome and correct the error quickly.",
      "In practice, this means the brain is not waiting passively for reality to happen. It is rehearsing the next instant and checking whether the world matches the rehearsal. The result is smoother action, but also smoother perception of self-generated change.",
      "The felt stability of action depends on those fast internal estimates being tight enough to keep the body from feeling like a collection of delays.",
    ],
    subheading: "Why this feels like consciousness",
    subparagraphs: [
      "Prediction reduces surprise without eliminating reality.",
      "Error correction makes the present feel properly aligned.",
      "A good timing model quietly disappears into the feeling of fluency.",
    ],
  },
  {
    title: "Timing is not decoration. It is control",
    paragraphs: [
      "People tend to think of timing as a secondary feature, something added on top of content. The cerebellum makes a better case: timing is part of the control architecture. If the sequence is misaligned, the output becomes clumsy, effortful, or unstable, even when the intention is clear.",
      "This logic extends beyond hand-eye coordination. Speech, internal rehearsal, predictive listening, and even some forms of attentional stability depend on timing precision. The cerebellum is part of the machinery that keeps those sequences from smearing into one another.",
      "The present moment feels real partly because it arrives on schedule.",
    ],
    callout: {
      label: "Important distinction",
      text: "Timing is not a cosmetic layer over thought. It is part of the mechanism that makes thought coherent enough to experience as one thing.",
    },
  },
  {
    title: "The cerebellum reaches into cognition, not just movement",
    paragraphs: [
      "Modern neuroscience increasingly treats the cerebellum as a domain-general prediction system. It participates in motor learning, yes, but also in language fluency, sequence learning, attention shaping, and aspects of affective regulation. The unifying theme is calibration across time.",
      "That means mental life can inherit cerebellar structure in subtle ways. A sentence can feel smooth or jagged. A decision can feel rehearsed or abrupt. A social exchange can feel on-beat or discordant. Timing is still doing work, even when no one is looking at the motor system.",
      "The cerebellum is one of the reasons cognition is not just a pile of symbols. It is a sequence engine.",
    ],
    subheading: "Why language matters here",
    subparagraphs: [
      "Speech depends on millisecond-level sequencing.",
      "Inner narration inherits the same temporal constraints as vocal output.",
      "If timing becomes unstable, thought can feel less like a line and more like a stutter.",
    ],
  },
  {
    title: "When prediction breaks, the state of self changes with it",
    paragraphs: [
      "Cerebellar dysfunction is a clean reminder that timing is existential. Ataxia, dysmetria, and coordination errors are not just movement issues. They reveal what happens when the system cannot reliably predict the consequences of its own output.",
      "That same principle scales upward. If temporal prediction becomes unreliable, the world can feel delayed, overloaded, or oddly detached. The mind spends more energy compensating for the mismatch, and the felt continuity of presence begins to thin out.",
      "In that sense, the cerebellum is not only correcting motion. It is helping maintain the confidence that the next moment will land where it should.",
    ],
    callout: {
      label: "Mechanistic translation",
      text: "When the timing model degrades, the brain has to spend more attention just keeping the present glued together.",
    },
  },
  {
    title: "Rhythm, repetition, and sensory prediction give the cerebellum something to work with",
    paragraphs: [
      "Regular rhythm is useful because it gives the system a stable reference frame. Breath pacing, walking, repeated movement, drumming, and structured sound all provide timing patterns the cerebellum can model and refine.",
      "This is one reason rhythmic practices can alter state without theatrical language. They change the predictability landscape. They make the body’s next step easier to estimate, which can reduce internal noise and tighten the field of awareness.",
      "The effect is not mystical. It is coordinated predictability.",
    ],
    subheading: "Why repetition can feel so powerful",
    subparagraphs: [
      "Repetition gives the timing system a cleaner target.",
      "Predictable rhythm can reduce the cost of ongoing correction.",
      "A stable cadence can make consciousness feel more available to itself.",
    ],
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "Use a metronome, walking cadence, or breath count for twelve minutes and watch what changes first: muscular tension, speech pacing, attention steadiness, or the felt smoothness of thought. The order of those changes tells you how timing is being budgeted by the nervous system.",
      "Then repeat the same drill after sleep loss, after a long focus block, and after a slow recovery interval. The cerebellum is highly state-sensitive, and those shifts expose how much of the feeling of control depends on temporal prediction.",
      "If you want more coherent consciousness, do not only ask what you are thinking. Ask how the sequence is landing.",
    ],
  },
];

const evidence = [
  {
    title: "Cerebellum as a prediction machine — review",
    note:
      "A core reference for the forward-model framing of cerebellar function.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=cerebellum+prediction+machine+review",
  },
  {
    title: "The cerebellum and timing in cognition — review",
    note:
      "Useful for connecting temporal precision to thought, speech, and attention.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=cerebellum+timing+cognition+review",
  },
  {
    title: "Forward models, efference copy, and sensory prediction — review",
    note:
      "A strong bridge between action commands and the expected sensory result.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=forward+models+efference+copy+sensory+prediction+review",
  },
  {
    title: "Cerebellar contributions to language and sequence learning — review",
    note:
      "Helpful for seeing why the cerebellum influences more than motor output.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=cerebellar+language+sequence+learning+review",
  },
  {
    title: "Cerebellar dysfunction, ataxia, and timing error — review",
    note:
      "A practical entry point for understanding what happens when prediction fails.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=cerebellar+dysfunction+timing+error+review",
  },
  {
    title: "Rhythm, motor learning, and cerebellar adaptation — review",
    note:
      "Useful for grounding repetitive practice in adaptation rather than mythology.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=rhythm+motor+learning+cerebellar+adaptation+review",
  },
];

function Section({ title, paragraphs = [], callout, subheading, subparagraphs = [] }) {
  return (
    <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
      <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-white/50">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {subheading ? (
        <div className="space-y-4 pt-2">
          <h3 className="text-xl font-light tracking-tight text-white leading-tight">
            {subheading}
          </h3>
          <div className="space-y-4 text-sm leading-relaxed text-white/50">
            {subparagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      ) : null}
      {callout ? (
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 px-5 py-4 text-xs leading-relaxed text-white/60">
          <span className="block text-[9px] font-mono uppercase tracking-[0.25em] text-cyan-400">
            {callout.label}
          </span>
          <p className="mt-2">{callout.text}</p>
        </div>
      ) : null}
    </section>
  );
}

function EvidenceCard({ title, note, href }) {
  return (
    <a
      className="group block rounded-2xl border border-white/5 bg-zinc-950/40 p-5 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.04]"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <h4 className="text-base font-light tracking-tight text-white group-hover:text-cyan-300 transition-colors leading-tight">
        {title}
      </h4>
      <p className="mt-4 text-xs leading-relaxed text-white/40">{note}</p>
    </a>
  );
}

export default function CerebellumTimingCompilerPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {cerebellumTimingCompilerPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {cerebellumTimingCompilerPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{cerebellumTimingCompilerPost.category}</span>
            <span>{cerebellumTimingCompilerPost.readTime}</span>
            <span>{new Date(cerebellumTimingCompilerPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The present is compiled, not merely perceived
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          {introParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        {sections.map((section) => (
          <Section key={section.title} {...section} />
        ))}
      </div>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The evidence snapshot
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {evidence.map((item) => (
            <EvidenceCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:grid-cols-[1.2fr_0.8fr] md:p-8">
        <div className="space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Try this
          </p>
          <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
            A grounded 12-minute timing audit
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Set a metronome or silent breath count and keep a simple action sequence for twelve minutes: inhale, exhale, one spoken phrase, one written line, or one slow walk loop. Notice when the timing feels clean and when it begins to drift. Then write down which part of the sequence lost precision first.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• Thought feels jagged, late, or difficult to sequence.</li>
            <li>• You want a concrete read on timing stability.</li>
            <li>• You need a low-drama way to study state change in real time.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: coherence is a timing achievement
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The cerebellum is not a side character in consciousness. It is part of the machinery that keeps prediction, correction, and sequence aligned closely enough for the present to feel continuous.
          </p>
          <p>
            When the timing model is strong, thought, movement, and perception arrive in a shared cadence. When it weakens, the whole field can feel late, fragmented, or effortful. That makes the cerebellum one of the most practical places to study how conscious state is assembled.
          </p>
          <p>
            The larger lesson is simple: awareness is not only about what is being processed. It is about whether the processing lands on time.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
