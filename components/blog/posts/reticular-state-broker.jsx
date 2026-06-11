import Link from "next/link";
import { reticularStateBrokerPostMeta } from "@/lib/blog/posts-data";

export const reticularStateBrokerPost = reticularStateBrokerPostMeta;

const introParagraphs = [
  "The reticular formation matters because consciousness is not just content. It is state. Before the brain can build a coherent scene, it has to decide whether the organism is awake enough, stable enough, and energized enough to turn sensation into lived presence.",
  "That decision does not sit in a single mystical switch. It emerges from brainstem and neuromodulatory systems that regulate arousal, readiness, and the basic permission for experience to become organized.",
  "If the cortex is where the story gets written, the reticular formation helps decide whether the page is online.",
];

const sections = [
  {
    title: "The hook: wakefulness is an operating condition, not a binary",
    paragraphs: [
      "People often talk about waking up as if it were a simple on-off event. Biology is less theatrical. Arousal is graded, state-dependent, and exquisitely sensitive to internal and external conditions. The difference between a coherent world and a foggy one can hinge on how much brainstem gain is being provided at the moment.",
      "The reticular formation sits near the core of that regulation. It contributes to the ascending systems that keep the cortex responsive, alert, and able to assemble a stable present. When the state changes, the same sensory input can feel either richly available or strangely unreachable.",
      "This is why consciousness research keeps returning to state before content. If the system is not sufficiently online, there is no clean platform for content to land on.",
    ],
    callout: {
      label: "Big idea",
      text: "Awareness is not only what arrives. It is whether the organism is in the right state to use what arrives.",
    },
  },
  {
    title: "The reticular formation coordinates arousal across the whole system",
    paragraphs: [
      "The reticular formation is not the same thing as the entire ascending arousal system, but it is part of the larger machinery that includes noradrenergic, cholinergic, serotonergic, and dopaminergic influences. Together these systems change how excitable the cortex is, how likely a signal is to dominate, and how quickly a state can be shifted.",
      "That means arousal is not just energy. It is a policy about readiness. The brain is deciding how much surprise it can tolerate, how sharply it should sample, and how expensive it will be to stay engaged with the field.",
      "The reticular formation is interesting because it helps turn a diffuse body-wide condition into a usable level of conscious access.",
    ],
    subheading: "Why this matters for experience",
    subparagraphs: [
      "Low arousal can make the world feel remote, flat, or slow to resolve.",
      "High arousal can make the world feel urgent, noisy, and hard to unify.",
      "A useful state sits in the narrow zone where the system is awake without being overloaded.",
    ],
  },
  {
    title: "Sleep, anesthesia, and collapse show how state gates content",
    paragraphs: [
      "One of the clearest ways to understand a system is to watch what happens when it fails. During sleep or anesthesia, the stream of consciousness changes because the background conditions for integration change. The brain is not simply losing content. It is losing the state architecture that lets content remain coherent.",
      "That is why a person can be present enough to respond in fragments yet absent from the ordinary continuity of waking. The reticular and thalamic systems no longer support the same level of global coordination, so the scene is not assembled in the usual way.",
      "This is also why people coming out of anesthesia often describe a return that feels gradual rather than sudden. The world comes back as the state stabilizes.",
    ],
    callout: {
      label: "Important distinction",
      text: "Loss of consciousness is often a loss of coordinated state, not a loss of all input.",
    },
  },
  {
    title: "Arousal shapes what counts as signal and what collapses into noise",
    paragraphs: [
      "In a high-functioning state, the cortex can differentiate and prioritize. In a poorly regulated state, the same system either overreacts or underresponds. That is not just a performance problem. It is a way of changing what the organism can treat as meaningful.",
      "The reticular formation matters because it feeds into that differentiation. By helping regulate arousal, it changes how strongly the brain pursues one interpretation versus another, and how quickly the system abandons an explanation that is no longer working.",
      "When the arousal level is wrong, the world becomes expensive to parse. Every cue needs more work. Every update costs more energy. Consciousness itself feels like friction.",
    ],
  },
  {
    title: "State drift can look like attention drift, but the mechanism is deeper",
    paragraphs: [
      "A person may think they are just unfocused when the real issue is a state mismatch. If the brainstem is not supporting enough wakeful stability, attention does not merely wander. It loses the conditions that make sustained selection possible.",
      "The reverse is also true. If arousal is too high, the system can lock onto too many candidates at once, which looks like vigilance, but functions more like a failure to down-select. The world becomes overtagged with urgency.",
      "That is why a serious model of consciousness cannot stop at attention. Attention depends on state, and state depends on a larger control architecture that begins below conscious narration.",
    ],
    subheading: "The body feels state before the story does",
    subparagraphs: [
      "Posture, heartbeat, breathing, and muscle tone often change before a person can name the shift.",
      "Arousal is felt as readiness or depletion long before it is explained.",
      "The reticular formation helps set that baseline in the background.",
    ],
  },
  {
    title: "Why altered states are state experiments first and experiences second",
    paragraphs: [
      "Meditation, breath pacing, sensory reduction, stimulation, and sleep deprivation all matter partly because they alter the conditions under which arousal is stabilized. The interesting question is not whether an experience feels unusual. The interesting question is which control variable moved first.",
      "If the reticular formation and its partners shift the state envelope, then the content that follows is downstream. That is true for dreaminess, hyperclarity, dissociation, and the peculiar hush that can appear when the system lowers its own gain.",
      "State is the stage. Experience is what the stage makes possible.",
    ],
    callout: {
      label: "Mechanistic translation",
      text: "A shift in arousal changes the space in which consciousness can organize itself.",
    },
  },
  {
    title: "What disciplined testing looks like",
    paragraphs: [
      "A useful experiment is simple. Spend twelve minutes comparing three conditions: eyes open in daylight, eyes closed with slow breathing, and low-input quiet after a brief walk. Track which condition makes the world feel most coherent and which one makes the self feel most stable.",
      "Do not chase dramatic effects. Track the threshold where the present becomes easier or harder to maintain. That threshold is a practical proxy for how well your state machinery is doing its job.",
      "The value is not in the ritual. The value is in learning how state changes before you call it mood, focus, or presence.",
    ],
  },
];

const evidence = [
  {
    title: "Reticular formation and arousal systems — PubMed review search",
    note:
      "A useful starting point for the brainstem circuits that keep wakefulness and responsiveness online.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=reticular+formation+arousal+systems+review",
  },
  {
    title: "Ascending reticular activating system and consciousness — review search",
    note:
      "Helpful for placing the reticular formation inside the broader wakefulness architecture.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=ascending+reticular+activating+system+consciousness+review",
  },
  {
    title: "Brainstem arousal and anesthesia — review search",
    note:
      "A strong entry point for understanding how state collapses when arousal support is reduced.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=brainstem+arousal+anesthesia+review",
  },
  {
    title: "Arousal, gain control, and cortical responsiveness — review search",
    note:
      "Useful for connecting wakefulness to the way the cortex amplifies or suppresses incoming data.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=arousal+gain+control+cortical+responsiveness+review",
  },
  {
    title: "Reticular formation, sleep-wake transitions, and consciousness — review search",
    note:
      "Places the brainstem in the transition zone where state becomes visible as experience.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=reticular+formation+sleep-wake+transitions+consciousness+review",
  },
  {
    title: "Brainstem control of attention and alertness — review search",
    note:
      "A bridge between arousal regulation and the ability to sustain a coherent scene.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=brainstem+control+attention+alertness+review",
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

export default function ReticularStateBrokerPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {reticularStateBrokerPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {reticularStateBrokerPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{reticularStateBrokerPost.category}</span>
            <span>{reticularStateBrokerPost.readTime}</span>
            <span>{new Date(reticularStateBrokerPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The brain makes a state before it makes a story
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
            A grounded 12-minute arousal audit
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Spend four minutes with eyes open and slow breathing, four minutes with eyes closed and no added task, and four minutes after a brief stretch or short walk. Track which condition produces the clearest sense of presence, the easiest attention, and the least friction in the world around you.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to distinguish arousal drift from simple distraction.</li>
            <li>• The world feels either flat, noisy, or difficult to stabilize.</li>
            <li>• You need a repeatable baseline for attention or meditation work.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: state is the hidden governor of conscious access
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The reticular formation is valuable precisely because it keeps the state problem visible. Consciousness is not only about what content appears. It is about whether the brain is organized in a way that can host content without losing coherence.
          </p>
          <p>
            That makes arousal a serious control variable, not just a feeling. When the state is well tuned, the world becomes usable. When it drifts, the world becomes either too thin or too intense to handle cleanly.
          </p>
          <p>
            If you want to understand awareness with any seriousness at all, study the state that makes awareness possible. That is where the machinery hides.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
