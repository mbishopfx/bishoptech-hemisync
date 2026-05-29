import Link from "next/link";
import { claustrumAccessPostMeta } from "@/lib/blog/posts-data";

export const claustrumAccessPost = claustrumAccessPostMeta;

const introParagraphs = [
  "The claustrum is one of the most inconvenient structures in the brain for anyone who likes clean categories. It is small, thin, and densely connected, yet it keeps appearing in serious discussions about attention, binding, and consciousness.",
  "That does not make it a mystical switch. It makes it a coordination problem. If a structure sits in the path of many cortical loops and helps keep timing aligned across them, it can influence whether a moment feels unified, interrupted, or unstable.",
  "The right question is not whether the claustrum secretly creates awareness. The right question is what kind of access problem it helps solve, and what happens when that access becomes noisy, delayed, or overcoupled.",
];

const sections = [
  {
    title: "The hook: a small structure can matter if it brokers access",
    paragraphs: [
      "The claustrum keeps attracting attention for one simple reason: it is positioned like a broker. It receives inputs from broad cortical territories and sends outputs back into distributed loops, which makes it look less like a storage site and more like a coordination layer.",
      "That matters because conscious experience is not just a pile of sensations. It is a selected and time-aligned assembly. If the system cannot decide which streams deserve shared access, the result is not just distraction. It is fragmentation.",
      "So the claustrum is interesting not because it is a magic organ of awareness, but because it may help decide what gets bound into a usable moment.",
    ],
    callout: {
      label: "Big idea",
      text: "Conscious access is a routing problem before it is a storytelling problem.",
    },
  },
  {
    title: "Dense connectivity makes the claustrum worth taking seriously",
    paragraphs: [
      "Anatomically, the claustrum has long frustrated neat textbook explanations. It is thin, irregular, and heavily interwoven with association cortex. That combination is exactly what you would expect from a structure that helps coordinate multiple information streams without being the final destination for any of them.",
      "In state terms, that means the claustrum may help stabilize competition across large-scale networks. If one set of signals is winning too aggressively, or if timing across regions is drifting apart, a coordinator can matter more than a content source.",
      "This is one reason the claustrum keeps showing up in work on attention and synchronized states. Coordination is not decorative. It is what keeps a distributed organism from becoming a pile of uncommitted partial updates.",
    ],
    subheading: "Why size is the wrong metric",
    subparagraphs: [
      "A tiny node can matter if it sits at a high-leverage junction.",
      "Connectivity is often more important than bulk.",
      "A coordination layer can change the quality of experience without generating the experience itself.",
    ],
  },
  {
    title: "Attention and binding are related, but they are not the same mechanism",
    paragraphs: [
      "Attention is the selection problem. Binding is the integration problem. Consciousness depends on both, but they are not interchangeable.",
      "The claustrum is often discussed as if it had to choose between those functions. A more careful reading is that it may participate in both by helping the brain keep selected signals temporally coherent long enough to become a coherent scene.",
      "That would also explain why the claustrum is so often discussed alongside synchronized brain states. When timing across networks is cleaner, experience tends to feel more unified. When timing is messy, the system may still be awake, but it feels less integrated.",
    ],
    callout: {
      label: "Important distinction",
      text: "Selection is not the same as synthesis. The brain can attend to a signal without fully integrating it into the moment.",
    },
  },
  {
    title: "What stimulation studies actually show",
    paragraphs: [
      "The strongest reason the claustrum refuses to stay theoretical is the human stimulation literature. In one well-known case, electrical stimulation of a small brain area near the claustrum reversibly disrupted consciousness, which is a striking result even if it does not settle the entire debate.",
      "The correct interpretation is narrow and important. This does not prove the claustrum is the sole seat of awareness. It shows that the region sits close enough to critical coordination machinery that perturbing it can alter conscious state in a measurable way.",
      "That is what real neuroscience looks like: not a crown for a single structure, but a map of leverage points.",
    ],
    subheading: "Why the case matters",
    subparagraphs: [
      "It demonstrates reversibility rather than mythology.",
      "It supports a network view of consciousness instead of a single-center fantasy.",
      "It shows that state can be interrupted by targeted perturbation.",
    ],
  },
  {
    title: "Synchronized states are where the claustrum conversation gets useful",
    paragraphs: [
      "Recent reviews increasingly describe the claustrum in relation to synchronized brain states. That framing is more useful than asking whether the structure is the seat of awareness, because it ties the anatomy to a measurable dynamic: how well the brain is holding itself in phase.",
      "When synchronization is strong, the system may support stable access and coherent perception. When synchronization becomes pathological, as in seizures or certain anesthetic transitions, the same machinery can lose flexibility and become less usable for conscious control.",
      "That gives the claustrum a plausible role in state regulation without asking it to do impossible metaphysical work.",
    ],
  },
  {
    title: "What this means for altered states and session design",
    paragraphs: [
      "If you care about consciousness mechanics, the claustrum is a reminder that state depends on coordination costs. Lower the noise, reduce the number of competing inputs, and the system may synchronize more cleanly.",
      "That is one reason practices built around breath, quiet, rhythm, or sensory reduction can feel so effective. They do not insert meaning into the brain. They reduce the burden on the coordination layer that keeps experience from splintering.",
      "The practical takeaway is not to chase a claustrum hack. It is to respect the fact that conscious access depends on timing, selection, and network coherence all at once.",
    ],
    callout: {
      label: "Practical warning",
      text: "A more synchronized state is not automatically a better one. Coherence can support clarity, but it can also harden into rigidity if the system loses flexibility.",
    },
  },
  {
    title: "Wrap-up: do not crown the claustrum, but do not ignore it",
    paragraphs: [
      "The claustrum remains interesting because it sits at the intersection of attention, binding, and state coordination. That is enough to make it mechanistically important without making it mystical.",
      "The sober conclusion is simple: consciousness is probably distributed, but distributed systems still need brokers. The claustrum may be one of them.",
      "That is a much better claim than saying it explains everything. It is precise enough to be tested and humble enough to survive the test.",
    ],
  },
];

const evidence = [
  {
    title: "The claustrum and consciousness: An update. — PubMed (2023)",
    note:
      "A focused review that revisits the claustrum-consciousness question and summarizes why the structure still matters in contemporary models.",
    href: "https://pubmed.ncbi.nlm.nih.gov/37701759/",
  },
  {
    title: "Attention: the claustrum. — PubMed (2015)",
    note:
      "A classic review arguing that the claustrum is strongly implicated in attentional control and the coordination of salient information.",
    href: "https://pubmed.ncbi.nlm.nih.gov/26116988/",
  },
  {
    title: "The claustrum in review. — PubMed (2014)",
    note:
      "A broad early review of claustral anatomy and function that helps separate connectivity facts from overconfident speculation.",
    href: "https://pubmed.ncbi.nlm.nih.gov/24772070/",
  },
  {
    title: "The claustrum and synchronized brain states. — PubMed (2024)",
    note:
      "A recent review connecting claustral activity to synchronized low-frequency brain states and coordinated network dynamics.",
    href: "https://pubmed.ncbi.nlm.nih.gov/39488479/",
  },
  {
    title: "Electrical stimulation of a small brain area reversibly disrupts consciousness. — PubMed (2014)",
    note:
      "A frequently cited human case report showing that perturbing a small region near the claustrum can reliably alter consciousness.",
    href: "https://pubmed.ncbi.nlm.nih.gov/24967698/",
  },
  {
    title: "The claustrum. — PubMed (2020)",
    note:
      "A concise review that keeps the claustrum discussion grounded in circuit anatomy instead of speculative overreach.",
    href: "https://pubmed.ncbi.nlm.nih.gov/33290700/",
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

export default function ClaustrumAccessPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {claustrumAccessPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {claustrumAccessPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{claustrumAccessPost.category}</span>
            <span>{claustrumAccessPost.readTime}</span>
            <span>{new Date(claustrumAccessPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The claustrum is interesting because access has to be negotiated
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
            A 14-minute synchronization scan
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit in a low-input room and keep the sensory field simple. For 10 minutes, breathe evenly while noticing whether attention feels narrow, diffuse, or repeatedly interrupted. Then spend 4 minutes in silence and record the first change in coherence that you notice across breath, imagery, and bodily location. Do not interpret the result too early.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to notice how selection and binding change under reduced input.</li>
            <li>• You need a cleaner read on whether your state feels coordinated or fragmented.</li>
            <li>• You want a repeatable way to study access without turning the session into a spectacle.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: coordination is the boring word that explains the dramatic effect
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The claustrum remains compelling because it forces a sober conversation about leverage. Consciousness is not just content. It is coordination across systems that have to agree long enough for a moment to feel unified.
          </p>
          <p>
            That does not make the claustrum the source of awareness. It makes it a candidate for an important routing and synchronization role inside a larger architecture.
          </p>
          <p>
            If you want the cleanest lesson, it is this: the brain can only present a coherent moment when its access machinery is working well enough to keep the right signals in step.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
