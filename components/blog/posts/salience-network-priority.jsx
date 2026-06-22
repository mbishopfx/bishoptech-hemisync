import Link from "next/link";
import { salienceNetworkPriorityPostMeta } from "@/lib/blog/posts-data";

export const salienceNetworkPriorityPost = salienceNetworkPriorityPostMeta;

const sections = [
  {
    title: "The hook: urgency is not the same thing as truth",
    paragraphs: [
      "The salience network does not hand out wisdom. It decides what deserves an interrupt. That is a very different job. In practice, it means the brain is constantly sorting signals by relevance, bodily urgency, novelty, and expected consequence before the rest of cognition even gets a vote.",
      "That distinction matters because urgency feels like importance. A signal that lands hard in the nervous system can feel self-evidently real even when it is only computationally loud. Consciousness inherits that mistake easily. It confuses priority with accuracy.",
      "Once you see the salience system as a priority engine, a lot of altered-state work becomes more legible. Breath, silence, sensory reduction, rhythm, and expectation do not magically reveal hidden truths. They change which signals are allowed to dominate the frame.",
    ],
    callout: {
      label: "Big idea",
      text: "Salience is a weighting problem. The brain can make a thing feel central without making it correct.",
    },
  },
  {
    title: "The anterior insula and dorsal ACC coordinate the interruption loop",
    paragraphs: [
      "In the canonical salience network, the anterior insula and dorsal anterior cingulate cortex are the structures people keep returning to because they sit at the intersection of interoception, action readiness, and attentional switching. They are not the whole story, but they are a very good place to start.",
      "The anterior insula helps translate internal bodily state into a usable signal about what is happening now. The dorsal ACC helps evaluate whether a change in control is needed. Together they behave less like a meaning machine and more like a command center for re-prioritizing the system when evidence crosses a threshold.",
      "That makes the salience network especially important in consciousness mechanics. It helps determine when the brain should stay in the current model and when it should spend energy updating it. Conscious access often begins with that switch.",
    ],
    subheading: "Why this is more than attention",
    subparagraphs: [
      "Attention is where the spotlight lands.",
      "Salience is why the spotlight moved.",
      "If you confuse the two, you miss the control logic underneath conscious access.",
    ],
  },
  {
    title: "Noradrenaline turns priority into physiological readiness",
    paragraphs: [
      "The salience system does not work alone. The locus coeruleus-norepinephrine system shapes gain across the brain, which means it helps determine how strongly a signal will be amplified once the salience network flags it as worth checking.",
      "This is why alertness, arousal, and interruptability matter so much. The same external input can be processed calmly in one state and as a mini emergency in another. The signal did not change. The gain did.",
      "That difference is one of the most important things to understand if you are trying to reason about consciousness scientifically. A state can feel revelatory when the nervous system is merely running a higher-gain configuration of the same underlying world.",
    ],
    callout: {
      label: "Important distinction",
      text: "High salience is not high truth. It is often just high readiness to act.",
    },
  },
  {
    title: "Stress can make the world feel personally addressed",
    paragraphs: [
      "Under stress, the salience system becomes biased toward threat and self-reference. That is adaptive in the short term because a nervous system that misses danger does not stay alive very long. But it is expensive when the threat model does not fit the environment.",
      "In that state, neutral data can start to feel charged. Bodily sensations become suspicious. Random timing feels meaningful. Every interruption looks like a signal from reality itself. The system is still doing its job; it is just working with a narrower and more defensive prior.",
      "This is where many people accidentally turn miscalibration into philosophy. They conclude that intensity equals insight. Sometimes intensity is only the nervous system announcing that it has moved into protective mode.",
    ],
    subheading: "Why over-salience feels profound",
    subparagraphs: [
      "When everything is flagged, nothing can be ignored.",
      "When nothing can be ignored, the mind feels flooded with significance.",
      "Flooding is not illumination.",
    ],
  },
  {
    title: "Low-input states reduce interrupts without guaranteeing clarity",
    paragraphs: [
      "A quiet room, a long exhale, reduced sensory clutter, or a stable rhythmic stimulus can all lower the number of competing interrupts the salience network has to resolve. That often makes the internal signal landscape easier to read.",
      "But easier to read is not the same as more accurate. Lower noise can expose what the system was already doing, and sometimes that means you notice bias more clearly rather than less. The benefit is diagnostic, not mystical.",
      "That is why serious consciousness work should be treated as instrumentation. You are not chasing a special state. You are checking how the machine behaves when you lower the load and strip away needless interruption.",
    ],
    callout: {
      label: "Practical warning",
      text: "If every quiet state feels like a revelation, the salience network may simply be over-weighting whatever appears next.",
    },
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "If you want to study salience rather than mythologize it, build repeatability first. Keep the room stable. Keep the timing stable. Track what changes in the first minute, not just at the peak of the session.",
      "Notice whether the body becomes less jumpy, whether background sounds stop stealing attention, whether the same thought still feels urgent after a few breaths, and whether the transition into stillness gets cheaper across sessions.",
      "That is the practical target: not transcendence theater, but a nervous system that can assign priority more cleanly and with fewer false alarms.",
    ],
  },
];

const evidence = [
  {
    title: "Dissociable intrinsic connectivity networks for salience processing and executive control — PNAS (2007)",
    note:
      "A foundational paper identifying the salience network as distinct from executive control and linking it to switching behavior.",
    href: "https://www.pnas.org/doi/10.1073/pnas.0706515104",
  },
  {
    title: "An integrative theory of locus coeruleus-norepinephrine function: adaptive gain and optimal performance — Annual Review of Neuroscience (2005)",
    note:
      "A classic model for understanding how noradrenaline changes the gain on signal processing and state readiness.",
    href: "https://www.annualreviews.org/content/journals/10.1146/annurev.neuro.28.061604.135709",
  },
  {
    title: "Viscerosensory influences on brain and behavior — Nature Reviews Neuroscience (2010)",
    note:
      "A useful bridge between interoception, bodily urgency, and the kind of signal weighting that feels like salience.",
    href: "https://www.nature.com/articles/nrn2789",
  },
  {
    title: "The insular cortex and salience processing — PubMed review record",
    note:
      "The insula is repeatedly linked to detection of bodily relevance, error, and switching between modes of attention.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=insula+salience+processing+review",
  },
  {
    title: "Interoceptive awareness and the salience network — PubMed review record",
    note:
      "A good place to look when asking why internal bodily signals can feel as urgent as external events.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=interoceptive+awareness+salience+network+review",
  },
  {
    title: "The salience network in psychiatric and neurological disease — PubMed review record",
    note:
      "Useful because it shows what happens when priority assignment becomes too sticky, too weak, or too threat-biased.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=salience+network+psychiatric+neurological+disease+review",
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

export default function SalienceNetworkPriorityPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {salienceNetworkPriorityPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {salienceNetworkPriorityPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{salienceNetworkPriorityPost.category}</span>
            <span>{salienceNetworkPriorityPost.readTime}</span>
            <span>{new Date(salienceNetworkPriorityPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The salience network is a priority engine, not a truth oracle
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The strange thing about salience is that it can make almost anything
            feel more important than it really is. A body sensation, a sound, a
            memory fragment, or a passing threat can seize attention simply
            because the system decided it mattered now.
          </p>
          <p>
            That is useful for survival, but it is also the reason urgency can
            be mistaken for insight. The nervous system does not always explain
            why it raised the alarm. It only raises it. Consciousness then
            inherits the alert and builds a story around it.
          </p>
          <p>
            A serious model has to keep those layers separate. Priority is not
            accuracy. Interruptibility is not wisdom. And the loudest signal in
            the room is often just the one that won the competition for the next
            update.
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
            A grounded 10-minute salience audit
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit in a low-distraction room. Keep the eyes softly open for one
            minute, then closed for three. Notice the first thing that tries to
            steal priority: a body cue, a sound, a memory, or a planning loop.
            Label it once, then return to the breath for a slow 4-in, 6-out
            cycle. Repeat for ten minutes and record whether the interrupt
            traffic changed.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">
            Use this session when:
          </p>
          <ul className="mt-3 space-y-2">
            <li>• Your attention feels over-alert and sticky.</li>
            <li>• Small sensations keep hijacking the whole frame.</li>
            <li>• You want a repeatable way to study priority shifts without drama.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use this as a substitute for sleep, medical care, or common sense.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: when priority gets cleaner, consciousness gets easier to study
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The salience network is not a mystical gatekeeper. It is a
            selection system that helps the brain decide what deserves a
            response before the rest of the model has time to settle. That is
            why it matters so much to state changes, anxiety, meditation, and
            the feeling that the world has suddenly become more vivid.
          </p>
          <p>
            If you understand salience mechanically, a lot of subjective
            intensity becomes less confusing. You stop treating urgency as
            revelation and start asking what kind of weighting problem the
            nervous system is solving in that moment.
          </p>
          <p>
            That is the useful move. Not to flatten the experience, but to read
            it with enough precision that you can tell the difference between a
            real update and a very convincing alarm.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
