import Link from "next/link";
import { hemisphericCoherencePostMeta } from "@/lib/blog/posts-data";

export const hemisphericCoherencePost = hemisphericCoherencePostMeta;

const introParagraphs = [
  "The phrase hemispheric coherence sounds larger than it is. In most serious neuroscience contexts, it does not mean that the brain becomes a single humming crystal. It means that timing relationships across distributed networks become more orderly for a while, and that order can change what consciousness feels like from the inside.",
  "That distinction matters because Cognistration, binaural stimulation, and related rhythm practices are easy to oversell. The effects, when they appear, are usually about coordination, not transformation into a different species. Coherence is not enlightenment. It is a temporary reduction in internal conflict that can make attention feel cleaner, quieter, and easier to direct.",
  "If you keep the mechanism honest, the material gets more interesting. The useful question is not whether synchrony makes people transcend the body. The useful question is whether synchronized timing can reduce neural friction enough to alter the stability of self-experience.",
];

const sections = [
  {
    title: "The hook: coherence is a coordination problem, not a mystic badge",
    paragraphs: [
      "A brain that feels coherent is not necessarily a brain that knows more. It is often just a brain that is wasting less energy fighting itself. That is a different claim, and it is the one the data can actually support.",
      "When rhythms line up across regions, the system can pass information with less delay and less ambiguity. The subjective result may be better focus, less mental noise, or a strange feeling of inward spaciousness. None of that requires supernatural explanations. It requires timing.",
      "This is why people keep returning to binaural beats, hemispheric synchronization, and historical altered-state research. They are all variations on the same hope: if the signal is cleaner, maybe the state becomes more tractable.",
    ],
    callout: {
      label: "Big idea",
      text: "Coherence is best understood as a temporary alignment of timing constraints, not as proof that consciousness has left the nervous system.",
    },
  },
  {
    title: "What hemispheric synchronization actually means in practice",
    paragraphs: [
      "The left and right hemispheres are not two separate minds sitting in adjacent rooms. They are specialized processing systems that constantly exchange information through shared pathways, especially the corpus callosum and distributed cortical loops.",
      "Synchronization, in this context, is about phase relationships, coupling, and reduced timing mismatch. If two systems are trying to coordinate a task, cleaner phase relationships can improve the reliability of the handoff. That is true in music, in motor control, and in neural processing.",
      "The point is not that the hemispheres must become identical. The point is that coordinated difference is often better than chaotic separation. The brain likes division of labor, but it still needs a clock.",
    ],
    subheading: "Why the metaphor gets abused",
    subparagraphs: [
      "Marketing language loves to turn synchronization into a cosmic merger. That story sells better than the truth, but the truth is more actionable: better timing can make a state easier to enter and easier to sustain.",
      "If you strip out the exaggeration, you are left with a practical neuroscience claim: phase alignment can change how much internal effort it takes to keep attention organized.",
    ],
  },
  {
    title: "Why phase timing can change the texture of awareness",
    paragraphs: [
      "Consciousness is not built from one switch. It is built from a stack of control variables: sensory gain, prediction error, attentional stability, self-location, and the nervous system’s estimate of what matters right now.",
      "Rhythm can influence that stack because timing is one of the brain’s core organizational principles. If the system can predict the next pulse, it spends less energy resolving uncertainty. That frees up capacity for maintaining a steadier frame of awareness.",
      "This is one reason rhythmic input sometimes feels as if it creates a narrow tunnel into stillness. What actually changes may be the amount of internal arbitration happening behind the scenes.",
    ],
    callout: {
      label: "Important distinction",
      text: "A quieter mind is not the same thing as a truer mind. It is a less contested one.",
    },
  },
  {
    title: "The literature supports bias, not miracle",
    paragraphs: [
      "The advanced reading of the evidence is conservative. Some studies find measurable rhythm-following effects, some show alpha-band changes, and some do not reproduce cleanly. That is not a failure of curiosity. It is the normal shape of a tool that depends on context.",
      "A session can be useful without being universal. A protocol can reduce noise without becoming a permanent upgrade. The mistake is to treat a modest state shift like proof of a hidden faculty that works on demand.",
      "The best way to frame the data is this: rhythmic stimulation can bias a nervous system toward particular timing patterns, especially when the environment, expectations, and baseline state already support the shift.",
    ],
    subheading: "Why advanced users still get it wrong",
    subparagraphs: [
      "People often focus on the frequency label and ignore the rest of the stack: volume, duration, context, sleep debt, stress load, and what the listener was already doing before the session started.",
      "The signal is only half the story. The other half is the nervous system that receives it.",
    ],
  },
  {
    title: "What coherence can plausibly change in day-to-day consciousness",
    paragraphs: [
      "At the practical level, better timing may help with attentional steadiness, sensory quieting, and the transition into meditation or sleep preparation. That is a real effect if it happens, and it is useful even if it never becomes dramatic.",
      "It may also make certain inner images or body sensations stand out more clearly because the background chatter has been reduced. That is not a paranormal event. It is a redistribution of salience.",
      "The experience can still feel profound because a system that is usually fragmented suddenly feels more integrated. Humans are very good at mistaking integration for revelation.",
    ],
    subheading: "What it does not prove",
    subparagraphs: [
      "It does not prove that the brain has tapped a hidden dimension.",
      "It does not prove that synchrony equals spiritual attainment.",
      "It does not prove that altered state equals objective truth.",
    ],
  },
  {
    title: "How a disciplined listener should work with the signal",
    paragraphs: [
      "The right practice is boring in the best possible way. Keep the setup consistent. Use the same volume. Keep the room simple. Track your sleep, stress, and baseline attention so you can tell the difference between a real effect and a pleasant story.",
      "If a session reduces friction, that is enough. If it does nothing, that is also useful. You are building a map of how your own system responds to rhythmic constraint, not trying to please a theory.",
      "That is the actual advanced move: treat the practice like controlled engineering for state entry, not like a ritual whose value depends on whether it produces a cinematic experience.",
    ],
  },
];

const evidence = [
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "A mixed literature. Some studies aligned with entrainment, many did not, which makes the case for context and caution instead of hype.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Frequency-following response effect according to gender using a 10-Hz binaural beat stimulation — PMC (2023)",
    note:
      "Reported increased alpha power after 10-Hz binaural stimulation, a useful example of rhythmic input moving a measurable brain-state marker.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10200219/",
  },
  {
    title: "Analysis of a historical altered-state memo (1983)",
    note:
      "The memo is valuable because it treats altered states as a systems problem, not because it proves any paranormal claim.",
    href: "https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf",
  },
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "A reminder that brain state, timing, and awareness can interact in ways that are measurable without becoming mystical by default.",
    href: "https://www.nature.com/articles/nn.3719",
  },
  {
    title: "Linking out-of-body experience and self processing to mental own-body imagery at the temporoparietal junction — University of Bristol",
    note:
      "Shows that self-location and perspective are constructed and can be perturbed through specific neural systems.",
    href: "https://research-information.bris.ac.uk/en/publications/linking-out-of-body-experience-and-self-processing-to-mental-own-/",
  },
  {
    title: "STAR GATE [Controlled Remote Viewing] — Federation of American Scientists summary",
    note:
      "A sober reminder that institutions can study extraordinary claims without validating them. Curiosity is not evidence quality.",
    href: "https://irp.fas.org/program/collect/stargate.htm",
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

export default function HemisphericCoherencePost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {hemisphericCoherencePost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {hemisphericCoherencePost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{hemisphericCoherencePost.category}</span>
            <span>{hemisphericCoherencePost.readTime}</span>
            <span>{new Date(hemisphericCoherencePost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The brain is a timing machine before it is a thinking machine
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
            A coherence check in 12 minutes
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Put on headphones and play a steady low-level rhythmic session at a comfortable volume. Keep the room dim and the task list out of reach. Breathe slowly for 8 to 10 minutes, then sit in silence for 2 minutes and write down whether your mind feels more integrated, more spacious, or exactly the same.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• Your attention feels noisy but not fully exhausted.</li>
            <li>• You want a cleaner transition into meditation or journaling.</li>
            <li>• You need a repeatable way to compare state before and after rhythm.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: coherence is useful because it reduces friction, not because it solves the mystery
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The most honest view is also the most useful one. Hemispheric synchronization can help explain why certain rhythmic protocols feel stabilizing, but it does not justify mystical inflation. It is a state-engineering concept, not a miracle claim.
          </p>
          <p>
            Once you separate timing from mythology, the signal becomes usable. You can ask whether a session makes attention cleaner, whether it reduces internal conflict, and whether the effect survives when the room, the body, and the expectation all change.
          </p>
          <p>
            That is how serious consciousness work should feel: less like chasing a prophecy, more like learning the conditions under which the mind becomes easier to steer.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
