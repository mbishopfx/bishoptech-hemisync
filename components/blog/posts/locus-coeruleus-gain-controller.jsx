import Link from "next/link";
import { locusCoeruleusGainControllerPostMeta } from "@/lib/blog/posts-data";

export const locusCoeruleusGainControllerPost =
  locusCoeruleusGainControllerPostMeta;

const introParagraphs = [
  "The nervous system does not experience the world at a fixed volume. It continuously adjusts gain, deciding which signals deserve amplification and which should dissolve into the background. That adjustment is not a side effect of consciousness. It is one of the conditions that lets consciousness stay coherent at all.",
  "The locus coeruleus is central to that story because it influences cortical arousal, attentional mobility, and the system’s willingness to treat incoming evidence as urgent. When its output shifts, the whole field of awareness can sharpen, flatten, destabilize, or narrow. The room has not changed, but the brain’s operating margin has.",
  "That makes the locus coeruleus useful for consciousness mechanics. It is not a mystical locus of awakening. It is a precision controller that helps determine whether the present moment feels available, overloaded, vigilant, or nearly transparent.",
];

const sections = [
  {
    title: "The hook: arousal changes the terms of access before thought knows it",
    paragraphs: [
      "People usually notice a conscious change after they can already describe it. In practice, the sequence runs earlier. Arousal reweights the field, the nervous system reassigns precision, and only then does the story catch up with what the body has already decided.",
      "That is why a slight increase in alertness can feel useful in one context and corrosive in another. The same mechanism that helps you notice a relevant signal can also trap the system in over-responsiveness if the baseline is already high.",
      "If consciousness has a control dial, gain is one of the hidden ones. The locus coeruleus helps turn that dial.",
    ],
    callout: {
      label: "Big idea",
      text: "A state shift often starts as a change in gain, not as a change in meaning.",
    },
  },
  {
    title: "The locus coeruleus is an adaptive gain engine",
    paragraphs: [
      "The locus coeruleus supplies norepinephrine broadly across the brain, but the important point is not simply that it activates tissue. The important point is that it adjusts how strongly populations respond to input. That is gain control, and gain control changes what the system treats as worth processing.",
      "In adaptive gain theory, the locus coeruleus supports a balance between exploitation and exploration. When the system is tuned well, it can stay focused long enough to finish a task and flexible enough to update when the environment changes. When the balance breaks, attention becomes either dull or jagged.",
      "This is one reason arousal and consciousness cannot be separated cleanly. They are not identical, but they are entangled through the machinery that decides how much force a signal gets when it arrives.",
    ],
    subheading: "Why this is not just generic stimulation",
    subparagraphs: [
      "More activation is not always better.",
      "The right amount of gain preserves discrimination.",
      "The wrong amount makes every signal feel urgent.",
    ],
  },
  {
    title: "Precision weighting gives arousal its psychological shape",
    paragraphs: [
      "Arousal matters because it does not merely energize behavior. It changes how much confidence the brain assigns to incoming data, which in turn changes perception, action readiness, and the sense of being able to stabilize the present.",
      "That means the locus coeruleus is relevant to predictive coding even though it is not the whole model. It helps set the precision landscape in which prediction error either stays small, gets promoted, or becomes overwhelming enough to force a new frame.",
      "This is one of the least glamorous but most important truths in consciousness mechanics: the brain does not simply see. It weighs. And gain is part of the weighing process.",
    ],
    callout: {
      label: "Important distinction",
      text: "Precision is not truth. Precision is the amount of authority a signal receives inside the current model.",
    },
  },
  {
    title: "Pupils, vigilance, and body tension expose the hidden setting",
    paragraphs: [
      "The body often tells the story before the mind can. Pupil dilation, jaw tension, respiratory shallowness, and the felt urge to scan are all clues that gain has shifted. None of those signs are separate from consciousness. They are part of how consciousness is tuned.",
      "This matters because people often confuse vigilance with clarity. A system can feel highly awake while becoming progressively less discriminating. The subjective intensity is real, but the quality of access may be getting worse.",
      "The practical lesson is uncomfortable: some forms of intensity are just evidence of a nervous system that has turned the amplifier too far to the right.",
    ],
    subheading: "Why body markers matter",
    subparagraphs: [
      "Arousal is measurable before it is narratable.",
      "The body gives away gain shifts through timing and tone.",
      "Ignoring those markers means missing the control layer.",
    ],
  },
  {
    title: "Rhythm can stabilize gain when the environment is not already loud",
    paragraphs: [
      "A steady rhythm, a controlled breath pattern, or a low-drama audio session can help limit unnecessary gain spikes. The effect is not miraculous. It is architectural. The system has a cleaner temporal scaffold and less need to treat every arrival as a threat or surprise.",
      "That is why some people feel better after slow breathing or repetitive auditory input. The practice does not create a special consciousness by itself. It lowers noise enough for the existing system to stop over-interpreting the room.",
      "Used well, rhythm does not force the state. It makes the state easier to hold without overshooting.",
    ],
    callout: {
      label: "Practical warning",
      text: "If the baseline is already overloaded, more stimulation can intensify fragmentation instead of coherence.",
    },
  },
  {
    title: "Low-gain states reveal how much of consciousness is negotiated, not given",
    paragraphs: [
      "Sleep onset, quiet meditation, and certain after-stress collapses show the opposite side of the gain story. When arousal falls and external precision loosens, the system becomes less preoccupied with constant alerting and more open to internally organized material.",
      "That is not because the brain shuts off. It is because the weighting scheme changes. Some signals lose authority, others become more available, and the quality of awareness shifts with that reassignment.",
      "The result can be calm, dreamy, dissociated, or spacious depending on the wider state. The mechanism is the same: the authority map has changed.",
    ],
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "Track gain like a mechanic, not like a mystic. Before and after a session, note pupil feel, breath depth, jaw tension, and the subjective urge to scan the environment. Then compare what changed first.",
      "Repeat the same protocol across multiple baselines: rested, stressed, hungry, caffeinated, and post-exercise. The locus coeruleus does not behave the same way in every context, and your practice should respect that dependency.",
      "The goal is not to become calmer by force. The goal is to learn when the system is overdriven, when it is underpowered, and when it is finally in a range where consciousness can stay precise without getting brittle.",
    ],
  },
];

const evidence = [
  {
    title: "The locus coeruleus-norepinephrine system: adaptive gain and cognition — review",
    note:
      "A core framework for understanding how norepinephrine shapes alertness, flexibility, and the threshold for relevance.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=locus+coeruleus+norepinephrine+adaptive+gain+review",
  },
  {
    title: "Aston-Jones and Cohen adaptive gain theory — foundational review",
    note:
      "Useful for linking LC activity to the balance between focused exploitation and exploratory reset.",
    href: "https://pubmed.ncbi.nlm.nih.gov/16129383/",
  },
  {
    title: "Pupil diameter and locus coeruleus activity — review",
    note:
      "A practical route into using pupil-linked arousal as a window on gain control.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=pupil+diameter+locus+coeruleus+review",
  },
  {
    title: "Noradrenergic modulation of thalamocortical processing — review",
    note:
      "Helps connect arousal chemistry to the routing layer that shapes access and precision.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=noradrenergic+modulation+thalamocortical+processing+review",
  },
  {
    title: "Arousal, attention, and sensory gain — review",
    note:
      "A broader map for understanding why intensity is not the same as clarity.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=arousal+attention+sensory+gain+review",
  },
  {
    title: "Arousal state and conscious access — review",
    note:
      "Useful for tying low-gain and high-gain states to changes in the availability of awareness itself.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=arousal+state+conscious+access+review",
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

export default function LocusCoeruleusGainControllerPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {locusCoeruleusGainControllerPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {locusCoeruleusGainControllerPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{locusCoeruleusGainControllerPost.category}</span>
            <span>{locusCoeruleusGainControllerPost.readTime}</span>
            <span>{new Date(locusCoeruleusGainControllerPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Gain decides how much of the world gets to matter
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
            A grounded 12-minute gain audit
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Spend four minutes sitting quietly and tracking pupil feel, jaw tension, and breath depth. Then spend four minutes with a slow, steady rhythm or breathing cadence and note whether the body becomes more stable or more reactive. Finish with four minutes of silence and write the first three signs that told you the gain setting had changed.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• Attention feels too flat or too jumpy.</li>
            <li>• You want to separate clarity from sheer intensity.</li>
            <li>• The nervous system needs a softer operating margin.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: consciousness needs a gain setting, not a slogan
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The locus coeruleus is not a mythic switch hidden inside the brain. It is part of the machinery that sets the scale on which the world is experienced. That makes it central to any serious account of state change.
          </p>
          <p>
            When gain is too high, the present can become jagged, urgent, and impossible to settle. When gain is too low, the world can feel distant, slow, or under-annotated. The useful range is not a mood. It is a precision problem.
          </p>
          <p>
            That is the invitation here: stop treating arousal as a vague feeling and start treating it like a control parameter. Once you do, consciousness becomes less like a mystery box and more like a system whose settings can be observed, compared, and refined.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
