import Link from "next/link";
import { precuneusContinuityBrokerPostMeta } from "@/lib/blog/posts-data";

export const precuneusContinuityBrokerPost = precuneusContinuityBrokerPostMeta;

const introParagraphs = [
  "Continuity is not something the mind receives for free. It is maintained. The precuneus and neighboring posterior midline systems help keep that maintenance running by integrating self-related context, scene construction, and temporal continuity into a single usable frame.",
  "That makes the precuneus a continuity broker rather than a decorative default-mode node. It helps the brain preserve the felt fact that the same observer is here now, was here a moment ago, and will still be here after the next update arrives.",
  "When the self feels stable across time, there is usually a hidden amount of work underneath that stability. The precuneus is one of the places where that work can be glimpsed.",
];

const sections = [
  {
    title: "The hook: continuity is built, not assumed",
    paragraphs: [
      "The experience of being the same person across moments feels obvious until it falters. Then it becomes clear that continuity was being constructed all along. The brain is constantly stitching together perspective, memory, and anticipated next state so the present does not collapse into unrelated fragments.",
      "The precuneus is deeply involved in that stitching. It sits in the posterior medial cortex where self-relevant imagery, perspective taking, episodic integration, and scene construction all converge. That makes it unusually important for understanding how consciousness keeps its narrative center of gravity.",
      "If the posterior parietal cortex helps answer where the body is, the precuneus helps answer which version of the self is currently occupying the scene.",
    ],
    callout: {
      label: "Big idea",
      text: "Continuity feels like a property of the self, but it is often the result of a control system keeping memory, perspective, and expectation aligned.",
    },
  },
  {
    title: "The precuneus helps assemble the scene before the story arrives",
    paragraphs: [
      "The precuneus is often discussed as if it were a passive hub inside the default mode network. That framing misses the real point. It is part of the machinery that assembles a scene in which self-referential thought can even make sense. The story comes later.",
      "This matters because continuity is not just autobiographical narration. It is the pre-narrative sense that the present belongs to the same life. The brain has to keep a coordinate of identity alive long enough for the next thought to inherit it.",
      "That inheritance is not trivial. Without it, memory would feel detached from ownership, and perspective would feel less like a stable viewpoint and more like a sequence of unrelated snapshots.",
    ],
    subheading: "Why scene construction matters",
    subparagraphs: [
      "A self does not appear in a vacuum.",
      "It appears in a scene that has already been organized enough to host it.",
      "The precuneus helps hold that scene together.",
    ],
  },
  {
    title: "Autobiographical memory and future simulation use the same infrastructure",
    paragraphs: [
      "The mind rarely remembers the past without also borrowing from it to imagine what comes next. That is not a bug. It is a feature of how the brain creates a continuous self across time. The precuneus participates in the integration of memory, self-projection, and perspective shifting that makes this possible.",
      "When the system is healthy, you do not feel every remembered fact as a separate object. You feel a coherent owner of those facts. That ownership depends on more than storage. It depends on the ability to project the self into a remembered scene and then return without losing the thread.",
      "This is why the same neural territory becomes interesting in both memory research and consciousness research. It is not only about recall. It is about temporal continuity.",
    ],
    callout: {
      label: "Important distinction",
      text: "Memory content can be accurate while continuity still feels broken. The issue is not only what is remembered, but whether the remembered material stays attached to the same experiencing subject.",
    },
  },
  {
    title: "The default mode network is not idle when it protects continuity",
    paragraphs: [
      "The default mode network is often described as resting or idling, but the better interpretation is that it is maintaining internal organization when the environment stops demanding immediate action. The precuneus is one of the network’s most active continuity nodes.",
      "This is why so many altered states expose default-mode dynamics so clearly. When external demand drops, the system has to decide how strongly to preserve narrative identity, how much to loosen self-model constraints, and how to distribute attention across internal content.",
      "The result can feel like expanded awareness, derealization, dreaminess, or simply a softer sense of personal boundary. Different states, same machinery.",
    ],
    subheading: "Why continuity can loosen without disappearing",
    subparagraphs: [
      "The self is not erased just because the narrative becomes less insistent.",
      "It is being held with different precision.",
      "The precuneus helps regulate that precision.",
    ],
  },
  {
    title: "Altered states reveal the continuity machine in plain sight",
    paragraphs: [
      "Meditation, hypnagogia, dream lucidity, fatigue, and sensory reduction can all expose the construction of continuity because they loosen the usual grip on narrative coordination. The present can remain vivid while the owner of the present becomes less rigid.",
      "That is not a mystical event by itself. It is a mechanistic clue. The brain can maintain a self-model, relax it, or recompile it depending on state demands. The precuneus helps mediate that control problem.",
      "If you want to understand why some states feel like deep rest and others feel like identity drift, you have to pay attention to how continuity is being managed.",
    ],
    callout: {
      label: "Practical implication",
      text: "A quieter mind is not the same as a weaker self. Sometimes it is simply a self that is being held with less narrative friction.",
    },
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "If you want to study continuity seriously, observe the sequence instead of the headline. Track whether the sense of self feels narrow or broad, whether the scene feels owned or merely witnessed, whether time feels compressed or extended, and whether memory appears as fact or as living context.",
      "Keep the conditions stable across sessions. The precuneus is easy to romanticize because its effects are subtle and state-dependent. The only way to learn from it is to reduce the noise around it and notice what changes first.",
      "The goal is not to dissolve identity. It is to understand how the brain keeps identity coherent enough that a life can remain continuous across change.",
    ],
  },
];

const evidence = [
  {
    title: "20 years of the default mode network: A review and synthesis. — Neuron (2023)",
    note:
      "A strong modern overview of the network that keeps internal continuity organized when task demand drops.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=20+years+of+the+default+mode+network+a+review+and+synthesis",
  },
  {
    title: "Precuneus, self-referential processing, and autobiographical memory — PubMed search entry",
    note:
      "A practical entry point into the literature linking the precuneus to self-related thought and memory integration.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=precuneus+self-referential+processing+autobiographical+memory",
  },
  {
    title: "Scene construction and the posterior medial cortex — PMC search entry",
    note:
      "Useful for understanding how the brain builds a usable scene before the self narrates it.",
    href: "https://pmc.ncbi.nlm.nih.gov/?term=posterior+medial+cortex+scene+construction",
  },
  {
    title: "Damage to the default mode network disrupts autobiographical memory retrieval. — PubMed (2015)",
    note:
      "A reminder that continuity is not just philosophical phrasing; it depends on specific network integrity.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=Damage+to+the+default+mode+network+disrupts+autobiographical+memory+retrieval",
  },
  {
    title: "The brain’s default mode network and consciousness — review search entry",
    note:
      "A broad entry into why internally organized activity matters when external demand falls away.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=default+mode+network+consciousness+review",
  },
  {
    title: "Meditation and default mode network activity — PMC search entry",
    note:
      "Useful for connecting reduced narrative friction to altered self-reference and continuity.",
    href: "https://pmc.ncbi.nlm.nih.gov/?term=meditation+default+mode+network+activity",
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

export default function PrecuneusContinuityBrokerPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {precuneusContinuityBrokerPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {precuneusContinuityBrokerPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{precuneusContinuityBrokerPost.category}</span>
            <span>{precuneusContinuityBrokerPost.readTime}</span>
            <span>{new Date(precuneusContinuityBrokerPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Continuity is maintained, not inherited
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
            A grounded 12-minute continuity check
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit quietly for four minutes and notice whether the present feels
            like a sequence or a slice. Then spend four minutes recalling a very
            ordinary memory and track whether it feels like data, imagery, or a
            lived context. Finish with four minutes of silence and write down
            whether your sense of self felt narrower, broader, or unchanged.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">
            Use this session when:
          </p>
          <ul className="mt-3 space-y-2">
            <li>• You want to observe continuity instead of chasing intensity.</li>
            <li>• Memory feels detached from the person who is remembering it.</li>
            <li>• You want a repeatable way to study narrative friction.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the self persists because a network keeps reauthorizing it
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The precuneus is useful because it makes continuity visible as a
            function instead of a philosophical assumption. It helps organize
            perspective, scene construction, and temporal inheritance so the
            mind can keep treating experience as belonging to the same ongoing
            life.
          </p>
          <p>
            That is the practical lesson. When continuity wobbles, it is not
            proof that the self has disappeared. It is evidence that the system
            responsible for preserving identity is changing how tightly it holds
            the frame. Consciousness is not less real because that frame can be
            tuned. It is more interesting.
          </p>
          <p>
            If you want to work with altered states seriously, start by studying
            how continuity is maintained, relaxed, and restored. The precuneus is
            one of the best places to watch that machinery in motion.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the{" "}
          <Link
            className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4"
            href="/blog"
          >
            blog host page
          </Link>{" "}
          for the full list of posts.
        </div>
      </section>
    </article>
  );
}
