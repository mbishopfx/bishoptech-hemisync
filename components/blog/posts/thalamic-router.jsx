import Link from "next/link";
import { thalamicRouterPostMeta } from "@/lib/blog/posts-data";

export const thalamicRouterPost = thalamicRouterPostMeta;

const introParagraphs = [
  "The thalamus is often described as a relay station, but that phrase is too thin for the job it actually performs. It does not simply pass information along. It regulates what gets through, when it gets through, and how strongly the cortex should care once it arrives.",
  "That makes the thalamus a control problem disguised as anatomy. If consciousness depends on stable access to a world model, then thalamic gating, gain control, and timing become central instead of incidental. Cognistration matters here because neural bi-directional acoustic frequencies are not just entertainment. They form a way of probing the routing logic of the nervous system.",
  "The deeper claim is simple enough to say and hard enough to earn: perception is not just about signal. It is about precision. The brain is always deciding which inputs deserve to become reality.",
];

const sections = [
  {
    title: "The hook: the thalamus is a router, not a spotlight",
    paragraphs: [
      "A spotlight illuminates whatever it hits. A router does something more selective. It checks the packet, reads the destination, and decides what priority the packet should receive. The thalamus behaves much more like the second model than the first.",
      "That is why thalamocortical loops matter so much in consciousness research. They help determine whether a sensory event remains background noise, becomes a salient object, or gets folded into the active scene of awareness.",
      "If that sounds abstract, keep it concrete: the difference between a passing sensation and a coherent percept is often a difference in routing, not raw intensity.",
    ],
    callout: {
      label: "Big idea",
      text: "Consciousness changes when the routing policy changes, not just when the input gets louder.",
    },
  },
  {
    title: "Why thalamocortical loops set the cadence of awareness",
    paragraphs: [
      "The thalamus and cortex do not work in isolation. They form a loop that continuously updates the status of incoming data, predicted data, and data that does not fit. That loop matters because awareness is a live negotiation between expectation and evidence.",
      "When the loop is stable, experience can feel coherent. When the loop is noisy, perception can fragment. That is one reason sleep, sedation, sensory deprivation, and rhythmic stimulation can all produce such different subjective textures while still touching related circuitry.",
      "The advanced point is that consciousness is not a static light switch. It is a coordinated timing problem spanning relay nuclei, cortical columns, and the rhythms that keep them synchronized.",
    ],
    subheading: "Why advanced users should care",
    subparagraphs: [
      "If the loop is unstable, the mind will try to stabilize it with stories.",
      "If the loop is too rigid, the mind will mistake prediction for reality.",
    ],
  },
  {
    title: "Precision weighting decides what feels real",
    paragraphs: [
      "Predictive processing gives us a useful vocabulary here. The brain is not merely receiving data. It is assigning precision, which is a way of saying it is deciding how much confidence to place in a given signal.",
      "The thalamus helps regulate that confidence by shaping which streams deserve amplification and which should be suppressed or delayed. That is not the same as censorship. It is resource allocation under uncertainty.",
      "In practical terms, a state can feel meditative because the system reduces its confidence in noisy input, or it can feel unstable because the system starts over-weighting internal signals. The mechanism is similar. The result is not.",
    ],
    callout: {
      label: "Important distinction",
      text: "Gating is not censorship. It is resource allocation under uncertainty.",
    },
  },
  {
    title: "Rhythmic input can move the system without forcing a belief",
    paragraphs: [
      "This is where binaural beats, isochronic pulses, breath cadence, and other rhythmic tools become interesting. They do not insert a belief into the mind. They can bias timing, and timing bias can alter the state in which belief is constructed.",
      "That is a subtle but crucial distinction. If the thalamocortical system is already sensitive to oscillatory coordination, then rhythmic input may help pull the loop toward a different operating range.",
      "The honest version of that claim is not mystical. It is conditional. Rhythm can nudge the system, but the effect depends on baseline arousal, attention, fatigue, and how much noise the rest of the nervous system is carrying.",
    ],
    subheading: "Why entrainment is easy to overstate",
    subparagraphs: [
      "A state shift is not proof of a universal mechanism.",
      "A repeatable effect in one context can disappear in another.",
      "The method is real even when the mythology is not.",
    ],
  },
  {
    title: "Sleep and dream formation expose the same routing logic",
    paragraphs: [
      "Sleep is useful here because it shows what happens when the brain changes the rules for accessing sensory data. External input is reduced, internal generation rises, and the sense of being awake is replaced by a different form of coherence.",
      "Dreaming is not random noise. It is structured simulation operating under altered control parameters. The thalamus does not vanish from the story. It helps change how input, memory, and self-modeling are woven together.",
      "That is why the border between wakefulness and dream logic matters so much. It reveals that consciousness can keep running while the routing rules are rewritten.",
    ],
    callout: {
      label: "Practical translation",
      text: "If the thalamic gate changes, the felt structure of reality can change with it.",
    },
  },
  {
    title: "What a disciplined practitioner can actually test",
    paragraphs: [
      "If you want to work with this material without getting lost in speculation, keep the experiment small. Pick one audio protocol, one breathing cadence, one lighting condition, and one journal prompt. Then look for repeatable changes in attention, body tension, and the texture of thought.",
      "Do not hunt for fireworks. Hunt for stable differences. A quieter prediction stream, a cleaner transition into stillness, or a more consistent dream recall pattern tells you more than a dramatic one-off experience.",
      "That is the serious use case. Not to convince yourself that consciousness is mysterious. It already is. The real goal is to learn which variables make it more coherent, more noisy, or more available to observation.",
    ],
  },
];

const evidence = [
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "Useful for understanding why rhythm sometimes nudges state without producing a universal effect across subjects or sessions.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "The thalamus and consciousness literature — PubMed search",
    note:
      "A direct way into reviews and primary papers on thalamocortical gating, conscious access, and relay dynamics.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=thalamus+consciousness+review",
  },
  {
    title: "Frequency-following response effect according to gender using a 10-Hz binaural beat stimulation — PMC (2023)",
    note:
      "A measurable example of rhythmic input moving alpha activity, which helps explain why timing bias matters.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10200219/",
  },
  {
    title: "Analysis of a historical altered-state memo (1983)",
    note:
      "A historical example of serious institutions trying to frame altered states in systems language.",
    href: "https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf",
  },
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "A reminder that changing state parameters can alter reflective awareness inside sleep rather than outside it.",
    href: "https://www.nature.com/articles/nn.3719",
  },
  {
    title: "Linking out-of-body experience and self processing to mental own-body imagery at the temporoparietal junction — University of Bristol",
    note:
      "A useful bridge between self-location, body ownership, and the mechanisms that make experience feel centered.",
    href: "https://research-information.bris.ac.uk/en/publications/linking-out-of-body-experience-and-self-processing-to-mental-own-/",
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

export default function ThalamicRouterPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {thalamicRouterPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {thalamicRouterPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{thalamicRouterPost.category}</span>
            <span>{thalamicRouterPost.readTime}</span>
            <span>{new Date(thalamicRouterPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The thalamus is a router, not a spotlight
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
            A 12-minute thalamic reset
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Put on headphones and choose a steady rhythmic session at a low, comfortable volume. Sit upright for 8 minutes and keep your attention on whether the room feels more cohesive or more distant. Then sit in silence for 4 minutes and note whether perception feels sharper, flatter, or unchanged.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to compare rhythmic input against quiet baseline state.</li>
            <li>• Your attention feels overdriven and you need a cleaner boundary.</li>
            <li>• You want to observe whether body awareness shifts before thought does.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the thalamus shapes access before awareness ever gets a vote
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The thalamus matters because it helps decide what gets to count as a live signal. That means consciousness is partly a routing outcome, not just a passive receipt of data.
          </p>
          <p>
            Once you see that, a lot of advanced state work becomes easier to interpret. Rhythm, breath, sleep, and sensory reduction are not mystical additives. They are ways of changing the conditions under which the brain decides what to emphasize.
          </p>
          <p>
            The practical conclusion is not to worship the thalamus. It is to respect the fact that awareness depends on a control surface that can be trained, biased, and observed with more precision than most people assume.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
