import Link from "next/link";
import { phaseResetCoherentMomentPostMeta } from "@/lib/blog/posts-data";

export const phaseResetCoherentMomentPost = phaseResetCoherentMomentPostMeta;

const introParagraphs = [
  "A phase reset does not look dramatic from the outside. It looks like a timing correction. But that correction can change the way a distributed brain gathers itself into a coherent moment, which is why state shifts often arrive before explanation does.",
  "That is the practical reason rhythm matters in consciousness research. It is not a charm or a slogan. It is a control variable that can bias when populations of neurons are ready to communicate, synchronize, or ignore each other.",
  "If you want to understand why a session feels different, start with timing. The story usually follows the reset.",
];

const sections = [
  {
    title: "The hook: phase reset is the quiet event that makes a moment feel new",
    paragraphs: [
      "Most people think a conscious transition happens when the content changes. In practice, the deeper shift often happens first in timing. A phase reset can reorganize when neurons are most likely to talk to one another, which means the same external world can suddenly feel more coherent, more vivid, or more available to awareness.",
      "That is why rhythm keeps showing up in serious altered-state research. It is not because frequency is a magic key. It is because timing is one of the few levers that can change how a distributed system integrates itself without changing the raw inputs at all.",
      "If consciousness is a negotiated moment, phase reset is one of the negotiations that matters most. It does not create meaning out of nowhere. It changes the conditions under which meaning can stabilize.",
    ],
    callout: {
      label: "Big idea",
      text: "Phase reset does not add information. It changes the window in which information can become organized enough to count as awareness.",
    },
  },
  {
    title: "A reset is not content change. It is timing reorganization.",
    paragraphs: [
      "Neural populations do not communicate at random. They coordinate through oscillatory windows that open and close over time. When those windows shift, communication routes change with them. A signal that was ignored a moment ago can suddenly matter because the system has entered a different phase relation.",
      "This is the part that gets flattened in casual discussions of brainwave entrainment. The effect is not that a tone inserts a thought or implants a belief. The effect, when it appears at all, is far more modest and far more interesting: it nudges the timing scaffold that decides what gets to interact with what.",
      "That is why phase reset is such a useful concept. It explains how the same brain can move from scattered to unified without needing a new stimulus. The system simply starts sampling the world on a different schedule.",
    ],
    subheading: "Why the same input can land differently",
    subparagraphs: [
      "Timing determines whether a signal arrives during receptivity or during suppression.",
      "A phase shift can change the meaning of an input without changing the input itself.",
      "That is enough to alter the subjective feel of a whole session.",
    ],
  },
  {
    title: "The thalamus and cortex negotiate the gate that makes access possible",
    paragraphs: [
      "The thalamus is often described as a relay, but relay is too weak a word for what happens in a living brain. It participates in routing, synchronization, and the coordination of large-scale loops that determine which signals can stabilize long enough to be experienced as a coherent moment.",
      "If cortical activity is the material in the room, thalamocortical timing is the lighting system. It does not create the objects, but it determines which surfaces are visible enough to inspect. That is why a shift in thalamocortical coordination can feel like a change in consciousness rather than a change in thought content.",
      "When the timing is noisy, perception fragments. When the timing is coordinated, the same stream of sensation feels more continuous. The difference is not magical. It is architectural.",
    ],
    callout: {
      label: "Important distinction",
      text: "Access is not the same as content. A brain can hold the same data while changing how available that data is to a conscious moment.",
    },
  },
  {
    title: "Entrainment works by biasing phase, not by commanding belief",
    paragraphs: [
      "A rhythmic stimulus is useful only if it can bias the system toward a particular timing relation. That is a narrow claim. It is also the only claim that stays honest when the evidence gets messy.",
      "The brain does not need to be convinced by a frequency. It needs to be nudged into a state where synchronization becomes easier than disruption. If that happens, people often report easier settling, cleaner imagery, or a more stable inward frame. If it does not happen, nothing interesting should be forced into the result.",
      "That is the right standard. A protocol is not good because it sounds advanced. It is good if it changes the timing conditions in a way that the nervous system can actually use.",
    ],
    subheading: "Why delivery matters",
    subparagraphs: [
      "Stereo separation, volume, context, and attention all change the outcome.",
      "A frequency label without a timing context is just marketing.",
      "The mechanism lives in the interaction, not in the number alone.",
    ],
  },
  {
    title: "Dream transitions show phase mechanics in plain sight",
    paragraphs: [
      "The boundary between waking and dreaming is one of the cleanest places to watch phase mechanics become experience. Hypnagogia, lucid dreaming, and the moments just before sleep all show how a brain can shift state before it has fully changed its story about what is happening.",
      "That is exactly the kind of event phase reset helps explain. The system reconfigures timing first, then perception catches up. A person notices drifting imagery, altered body presence, or a loosening of the usual self-model, and only then does the explanatory narrative arrive.",
      "In other words, the experience is often built after the reset, not before it.",
    ],
    subheading: "Why transitions are so informative",
    subparagraphs: [
      "Transitions expose the machinery that stable waking life tends to hide.",
      "When the model is less defended, timing changes become easier to observe.",
      "That makes the border zone scientifically useful instead of merely strange.",
    ],
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "If you want to study phase reset seriously, do not chase a dramatic peak. Track transitions. Note how long it takes for the body to settle, whether internal imagery changes first, whether external noise becomes less intrusive, and whether attention feels less fragmented after the session than before it started.",
      "Use the same setup several times before deciding anything. Timing effects are often subtle in the moment and obvious only in the pattern across sessions. That is the difference between anecdote and instrumentation.",
      "The goal is not to talk yourself into a mystical conclusion. The goal is to learn what kind of timing shift your nervous system actually responds to.",
    ],
  },
];

const evidence = [
  {
    title: "Communication through coherence — Trends in Cognitive Sciences (2005)",
    note:
      "A foundational account of how coordinated timing enables distributed neural populations to communicate effectively.",
    href: "https://pubmed.ncbi.nlm.nih.gov/16001099/",
  },
  {
    title: "The functional role of cross-frequency coupling — Trends in Cognitive Sciences (2010)",
    note:
      "Useful for thinking about how one rhythmic scale can organize another inside a conscious moment.",
    href: "https://pubmed.ncbi.nlm.nih.gov/20451381/",
  },
  {
    title: "Neuronal oscillations in cortical networks — Nature Reviews Neuroscience (2004)",
    note:
      "A broad review that frames oscillations as coordination mechanisms rather than decorative background activity.",
    href: "https://pubmed.ncbi.nlm.nih.gov/15319739/",
  },
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "A concrete example of altered-state awareness being influenced by a targeted timing intervention.",
    href: "https://www.nature.com/articles/nn.3719",
  },
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "The review is valuable because it keeps the rhythm conversation inside evidence rather than hype.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Analysis and Assessment of Gateway Process — U.S. Army/CIA memo (1983)",
    note:
      "A historical attempt to describe altered-state timing, synchronization, and consciousness mechanics in formal language.",
    href: "https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf",
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

export default function PhaseResetCoherentMomentPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {phaseResetCoherentMomentPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {phaseResetCoherentMomentPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{phaseResetCoherentMomentPost.category}</span>
            <span>{phaseResetCoherentMomentPost.readTime}</span>
            <span>{new Date(phaseResetCoherentMomentPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Timing changes first, explanation arrives later
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
            A grounded 12-minute phase reset protocol
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit still with headphones at a comfortable volume. Spend two minutes
            noticing the breath. Then listen to a steady rhythmic session for
            eight minutes while tracking the exact moment the body feels more
            synchronous, less resistant, or more continuous. End with two
            minutes of silence and write down whether imagery, attention, or the
            sense of time changed first.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to study transition rather than peak intensity.</li>
            <li>• The mind feels noisy and you need a cleaner temporal scaffold.</li>
            <li>• You want to observe whether rhythm changes access before content.
            </li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: when timing stabilizes, consciousness becomes easier to read
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Phase reset gives consciousness research a cleaner language for
            state change. It explains how distributed neural systems can become
            more coherent without needing a new story to go with the shift.
          </p>
          <p>
            That matters because a lot of experience is built on timing before
            it is built on interpretation. If the timing scaffold changes, the
            mind may feel transformed even when the world outside the skull has
            not changed at all.
          </p>
          <p>
            The useful move is to treat that as a mechanism to study, not a myth
            to decorate. Once the timing problem is visible, you can ask better
            questions about which sessions actually move the system and which
            ones only sound profound.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
