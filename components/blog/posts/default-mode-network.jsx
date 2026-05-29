import Link from "next/link";
import { defaultModeNetworkPostMeta } from "@/lib/blog/posts-data";

export const defaultModeNetworkPost = defaultModeNetworkPostMeta;

const introParagraphs = [
  "The default mode network is often described as if the brain has a passive idling state. That description is convenient and wrong in the most interesting way. The network is not idle. It is actively maintaining continuity when the world stops demanding immediate action.",
  "What it maintains is not a single self object. It maintains the conditions for selfhood: autobiographical continuity, internal simulation, narrative order, and a background model of who is acting inside the scene.",
  "That makes the default mode network one of the most important pieces of consciousness mechanics because it shows how a brain can keep a self coherent without needing the outside world to constantly remind it who it is.",
];

const sections = [
  {
    title: "The hook: rest is not the same thing as inactivity",
    paragraphs: [
      "The default mode network emerged as a conceptual problem because the brain kept showing robust activity when people were not doing a task. That was enough to expose a basic misunderstanding: no-demand states are still computational states.",
      "The network is not a blank screen. It is the system that keeps identity, memory, and self-relevant prediction stitched together when external tasks stop taking the stage.",
      "That is why the DMN matters to consciousness. It does not create every aspect of selfhood, but it helps make continuity feel natural instead of assembled.",
    ],
    callout: {
      label: "Big idea",
      text: "A quiet brain is not a stopped brain. It is a brain doing internal maintenance.",
    },
  },
  {
    title: "Autobiographical memory gives the self a timeline",
    paragraphs: [
      "One of the clearest jobs of the DMN is to support autobiographical memory and internal simulation. The brain does not merely remember events. It uses remembered structure to predict what kind of self is present now.",
      "That is why damage or disruption in this network can feel so disorienting. If the system cannot retrieve or organize the continuity of the past, the present loses some of its narrative glue.",
      "In practical terms, the DMN is a temporal integrator. It keeps yesterday, now, and the next imagined minute from collapsing into disconnected fragments.",
    ],
    subheading: "Why memory is not just storage",
    subparagraphs: [
      "Memory is a model update problem.",
      "Autobiography is a stability problem.",
      "The self feels continuous when the model can connect the pieces fast enough.",
    ],
  },
  {
    title: "The DMN is not the self, but it helps the self stay coherent",
    paragraphs: [
      "It is tempting to say the DMN is the self. That is too blunt. The self is larger than one network and narrower than philosophy likes to admit.",
      "A better claim is that the DMN helps maintain narrative ownership and self-referential organization. It supports the feeling that thoughts are happening to or through the same agent over time.",
      "That is why self-absorption, rumination, and introspection are all related to the DMN without being identical to it. The network is part of the machinery that keeps self-reference available.",
    ],
    callout: {
      label: "Important distinction",
      text: "A network that supports self-reference is not the same thing as a metaphysical self.",
    },
  },
  {
    title: "The action system and the DMN are in constant negotiation",
    paragraphs: [
      "The newer literature on action-mode and control networks makes the picture more precise. The brain is not toggling between a self network and a task network. It is managing a negotiation between internal continuity and external demand.",
      "When the situation becomes goal-directed, the brain cannot afford to let the narrative stream dominate everything. When the situation becomes reflective, it can relax that constraint and let internal simulation rise again.",
      "That push and pull is not a bug. It is how a living system stays usable in both worlds at once.",
    ],
  },
  {
    title: "Meditation changes the DMN, but not by turning it off",
    paragraphs: [
      "A serious meditation literature does not support a cartoon version of the DMN as a switch that simply shuts down when a person becomes calm. The network often changes in connectivity, coordination, and coupling with salience and control systems instead.",
      "That is a subtler and more useful result. It suggests that training can change how the system organizes self-referential activity rather than erasing the self altogether.",
      "In other words, practice can alter the cost of narrative production, not just the amount of thought in the head.",
    ],
    subheading: "Why this matters in lived experience",
    subparagraphs: [
      "A quieter narrative is not the same as no narrative.",
      "A less sticky self-model can feel spacious without becoming empty.",
      "The question is not whether the DMN disappears. The question is how it is reconfigured.",
    ],
  },
  {
    title: "Pathology and perturbation make the network visible",
    paragraphs: [
      "If the DMN is hard to see in ordinary life, perturbation makes it obvious. Damage to the network can disrupt autobiographical retrieval. Mood disorders can trap it in recursive self-relevance. Sleep and altered states can loosen the relationship between the network and the ordinary sense of authorship.",
      "That is valuable because it shows the system is not theoretical. It is operational. When its constraints change, the quality of consciousness changes with them.",
      "This is the sort of evidence that keeps the discussion honest. The DMN is not a poetic metaphor. It is a functioning network with measurable consequences.",
    ],
    callout: {
      label: "Practical warning",
      text: "If self-focus becomes sticky, repetitive, and impossible to exit, the issue may be calibration rather than insight.",
    },
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "If you want to study this machinery in yourself, start by tracking transitions. Notice when the narrative stream turns on, when it quiets, and what changes first: imagery, verbal thought, body tension, or the sense of ownership.",
      "Meditation, journaling, low-input sessions, and sleep-adjacent states are useful because they reveal how the brain builds continuity out of internal material. The goal is not to kill the self. The goal is to see how the self is assembled.",
      "That kind of observation is more useful than chasing a mystical conclusion.",
    ],
  },
];

const evidence = [
  {
    title: "20 years of the default mode network: A review and synthesis. — Neuron (2023)",
    note:
      "A major synthesis of DMN history, anatomy, and function that anchors the current scientific picture.",
    href: "https://pubmed.ncbi.nlm.nih.gov/37167968/",
  },
  {
    title: "Damage to the default mode network disrupts autobiographical memory retrieval. — PubMed (2015)",
    note:
      "A useful demonstration that DMN disruption can interfere with the continuity work that supports selfhood.",
    href: "https://pubmed.ncbi.nlm.nih.gov/24795444/",
  },
  {
    title: "Default Mode Network Engagement Beyond Self-Referential Internal Mentation. — PubMed (2018)",
    note:
      "A reminder that the DMN is not limited to self-referential thought; it participates in broader internal simulation.",
    href: "https://pubmed.ncbi.nlm.nih.gov/29366339/",
  },
  {
    title: "Mindfulness meditation increases default mode, salience, and central executive network connectivity. — Scientific Reports (2022)",
    note:
      "Evidence that training can alter how the DMN couples with control and salience systems rather than just turning it off.",
    href: "https://pubmed.ncbi.nlm.nih.gov/35918449/",
  },
  {
    title: "The brain's action-mode network. — Nature Reviews Neuroscience (2025)",
    note:
      "A recent review that sharpens the distinction between internal maintenance and externally directed action.",
    href: "https://pubmed.ncbi.nlm.nih.gov/39743556/",
  },
  {
    title: "Oxytocin and the Default Mode Network: New Insights into Attachment and Self-Referential Processing. — PubMed (2025)",
    note:
      "A newer review linking DMN function to attachment and self-referential processing, useful for thinking about social selfhood.",
    href: "https://pubmed.ncbi.nlm.nih.gov/42038917/",
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

export default function DefaultModeNetworkPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {defaultModeNetworkPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {defaultModeNetworkPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{defaultModeNetworkPost.category}</span>
            <span>{defaultModeNetworkPost.readTime}</span>
            <span>{new Date(defaultModeNetworkPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The DMN is active maintenance, not idle background
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
            A 12-minute narrative reset
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit quietly and let the mind run without forcing a task. For 8 minutes, notice which kind of thought is dominating the stream: planning, remembering, self-evaluation, or imagery. Then spend 4 minutes in silence and write down the first moment when the narrative model loosens, narrows, or becomes more bodily. The point is to observe the transition, not to force one.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to watch how self-reference changes when demand drops.</li>
            <li>• You need a cleaner read on rumination, absorption, or narrative drift.</li>
            <li>• You want to compare a task state with a maintenance state without overinterpreting either one.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the self is maintained, not merely found
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The default mode network is not the whole self, but it is one of the main systems that keeps the self coherent when no one is forcing the issue.
          </p>
          <p>
            That makes it central to consciousness mechanics because it shows how continuity is built, not assumed.
          </p>
          <p>
            If you want the shortest version, it is this: the brain does not become a self when it rests. It keeps managing a self when the outside world goes quiet.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
