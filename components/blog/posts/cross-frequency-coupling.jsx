import Link from "next/link";
import { crossFrequencyCouplingPostMeta } from "@/lib/blog/posts-data";

export const crossFrequencyCouplingPost = crossFrequencyCouplingPostMeta;

const sections = [
  {
    title: "The hook: rhythm is not decoration, it is control architecture",
    paragraphs: [
      "A single frequency label is almost never enough to explain a conscious state. The brain runs on nested rhythms: slow cycles that open and close windows, faster oscillations that carry content, and phase relationships that determine whether communication actually happens.",
      "That is why cross-frequency coupling matters. It is the mechanism by which one timescale constrains another. A theta rhythm can organize gamma bursts. An alpha cycle can suppress or release access. The point is not that rhythm is magical. The point is that timing is a control variable.",
      "When people talk about entrainment, they often flatten the issue into a playlist problem. But what the nervous system is really negotiating is phase, gain, and coordination. Change those, and the same world can feel radically different without changing any external facts.",
    ],
    callout: {
      label: "Big idea",
      text: "Cross-frequency coupling is how the brain turns timing into governance.",
    },
  },
  {
    title: "Phase reset can change state without changing content",
    paragraphs: [
      "Neural oscillations are not just background noise with a nice name. Their phase determines when populations of neurons are most likely to communicate. A phase reset can reorganize that communication quickly, which means the state can shift faster than the content of thought.",
      "That is one reason a person can feel a transition before they can explain it. The system has altered its timing scaffold. The same memory, sensation, or intention is now being processed inside a different window of excitability.",
      "For consciousness research, this is more than a technical footnote. It suggests that state changes often begin as timing changes, and only later become obvious as shifts in mood, focus, dreaminess, or self-location.",
    ],
    subheading: "Why phase matters",
    subparagraphs: [
      "Content tells you what is being represented.",
      "Phase tells you whether the representation can travel.",
      "A system with poor phase coordination may be full of information and still feel incoherent.",
    ],
  },
  {
    title: "Theta, alpha, and gamma each do different jobs in the same conversation",
    paragraphs: [
      "Slow rhythms are not simply slower versions of fast ones. They create windows. Theta often appears when the brain is sequencing, exploring, or holding a transitional state. Alpha often behaves like a gate, limiting what gets through. Gamma often shows up where local processing and feature binding are more active.",
      "Cross-frequency coupling is the relationship between those scales. The slow rhythm sets the frame; the fast rhythm populates it. That is a much better model than pretending consciousness can be explained by one favorite band frequency.",
      "If you want the practical version, think of it like orchestration. The conductor does not play every instrument. It times the ensemble so that the parts can behave as a coherent whole.",
    ],
    callout: {
      label: "Important distinction",
      text: "A fast rhythm is not automatically a better rhythm. Coherence depends on the relationship between scales, not on speed alone.",
    },
  },
  {
    title: "The thalamus helps decide which rhythms get to shape awareness",
    paragraphs: [
      "The thalamus is not just a relay box. It participates in timing, gating, and synchrony across cortex. That matters because conscious access depends on which rhythms are allowed to stabilize across distributed regions.",
      "If thalamocortical loops are well coordinated, the system can bind signals into a usable moment. If they are not, perception becomes fragmented, dreamlike, or overly noisy. The difference is not whether information exists. It is whether the timing makes integration possible.",
      "That is why sleep, drowsiness, meditation, and sensory reduction all expose the architecture so clearly. They loosen the normal pattern of rhythmic coordination and let the underlying mechanics show through.",
    ],
    subheading: "Why this matters to state work",
    subparagraphs: [
      "State is partly a timing agreement between cortex and thalamus.",
      "Break the agreement and the model feels less stable.",
      "Restore it and the same environment can feel more organized immediately.",
    ],
  },
  {
    title: "Binaural beats are interesting because they can nudge timing, not because they create belief",
    paragraphs: [
      "This is where many sound-based practices get overclaimed. A binaural beat does not inject truth. It can, at best, influence a timing bias under the right conditions. The effect depends on attention, state, delivery method, and the broader physiology of the listener.",
      "So the right question is not whether a specific frequency is sacred. The right question is whether the stimulus changes phase coordination enough to matter for a particular nervous system in a particular state.",
      "That is a much narrower claim than the marketing usually makes, but it is also the claim that survives contact with actual neuroscience.",
    ],
    callout: {
      label: "Practical warning",
      text: "If a frequency protocol promises a universal outcome, assume the model has been oversold.",
    },
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "If you want to work with rhythm seriously, track transitions. Notice whether a session changes the speed at which you settle, the stability of attention, the vividness of imagery, or the ease with which the body drops into quiet.",
      "Use the same setup for several sessions before you decide the protocol did anything. Timing effects are subtle. They are visible mostly when the context is controlled and the observation is disciplined.",
      "The goal is not to hear a miracle inside a soundtrack. The goal is to understand how a nervous system moves between coordinated states.",
    ],
  },
];

const evidence = [
  {
    title: "Communication through coherence — Trends in Cognitive Sciences (2005)",
    note:
      "A foundational account of how synchronized timing can enable effective neural communication across distributed regions.",
    href: "https://pubmed.ncbi.nlm.nih.gov/16001099/",
  },
  {
    title: "The functional role of cross-frequency coupling — Trends in Cognitive Sciences (2010)",
    note:
      "A classic review explaining why the relationship between oscillation bands is more informative than any single band alone.",
    href: "https://pubmed.ncbi.nlm.nih.gov/20451381/",
  },
  {
    title: "Neuronal oscillations in cortical networks — Nature Reviews Neuroscience (2004)",
    note:
      "A broad and influential account of oscillations as coordination mechanisms rather than decorative byproducts.",
    href: "https://pubmed.ncbi.nlm.nih.gov/15319739/",
  },
  {
    title: "Alpha-band oscillations, attention, and controlled access to stored information — Trends in Cognitive Sciences (2012)",
    note:
      "Useful for understanding alpha as a gating rhythm that can shape access instead of simply reflecting rest.",
    href: "https://pubmed.ncbi.nlm.nih.gov/22807853/",
  },
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "A reminder that rhythmic stimulation can be interesting while still showing mixed, context-dependent effects.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Analysis of a historical altered-state memo (1983)",
    note:
      "A historical example of an institutional attempt to model altered-state timing, synchronization, and consciousness mechanics.",
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

export default function CrossFrequencyCouplingPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {crossFrequencyCouplingPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {crossFrequencyCouplingPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{crossFrequencyCouplingPost.category}</span>
            <span>{crossFrequencyCouplingPost.readTime}</span>
            <span>{new Date(crossFrequencyCouplingPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Conscious states depend on timing relationships, not single beats
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            People often talk about brain rhythm as if a frequency label is the
            whole story. It is not. The nervous system works through nested
            oscillations, timing windows, and phase relationships that decide
            when communication is possible.
          </p>
          <p>
            That means a conscious state is not just a texture of thought. It is
            an organized timing problem. If the rhythms line up well, the world
            feels integrated. If they do not, experience becomes fragmented,
            dreamlike, or hard to stabilize.
          </p>
          <p>
            Cross-frequency coupling is one of the cleaner ways to describe that
            organization. It tells us how slow and fast rhythms coordinate so
            the brain can bind, gate, and update without losing the plot.
          </p>
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
            A grounded 12-minute timing reset
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Put on headphones or sit in silence. Spend two minutes noticing the
            breath without trying to deepen it. Then use a gentle rhythmic audio
            track or a steady internal count for eight minutes while watching
            whether the body settles into a more predictable tempo. End by
            sitting still for two minutes and writing down whether the session
            changed the speed, clarity, or stability of awareness.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">
            Use this session when:
          </p>
          <ul className="mt-3 space-y-2">
            <li>• Your attention feels scattered across too many scales.</li>
            <li>• You want to observe state change without overclaiming the result.</li>
            <li>• You need a repeatable way to study rhythm, timing, and transition.
            </li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or while expecting a frequency to do your thinking for you.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: when timing gets cleaner, state gets easier to recognize
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Cross-frequency coupling gives consciousness research a more
            disciplined language. It says that slow rhythms set the frame while
            fast rhythms fill it, and that awareness depends on the relationship
            between them rather than on any single band behaving like a magic
            token.
          </p>
          <p>
            That is useful because it lets you look at altered states without
            drifting into fantasy. You can ask whether a protocol is improving
            coordination, changing phase, or simply making the experience feel
            more dramatic than it really is.
          </p>
          <p>
            The question is not whether rhythm matters. It does. The question is
            what kind of timing change actually moves the system, and whether
            the result is coherence, noise reduction, or just a more interesting
            form of confusion.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
