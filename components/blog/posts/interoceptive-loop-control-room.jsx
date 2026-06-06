import Link from "next/link";
import { interoceptiveLoopControlRoomPostMeta } from "@/lib/blog/posts-data";

export const interoceptiveLoopControlRoomPost = interoceptiveLoopControlRoomPostMeta;

const introParagraphs = [
  "Interoception is not a side channel. It is the body informing the brain about the state of the organism from the inside, which means it participates in the earliest stages of how a conscious state gets assembled.",
  "That makes the body a control room, not just a container. Visceral signals, breath, heartbeat, temperature, muscle tension, and autonomic tone all influence the confidence landscape the brain uses to decide what kind of state it is in.",
  "When those signals shift, the story of experience often changes afterward. The body updates first. The narrative catches up second.",
];

const sections = [
  {
    title: "The hook: the body often updates before the mind explains",
    paragraphs: [
      "A lot of people describe state change as if thought were the first mover. In practice, the nervous system often shifts because a bodily variable changed enough to alter the prediction stack. Breath slows, CO2 shifts, the heart settles, or muscle tone changes, and the felt quality of consciousness reorganizes before the explanation is available.",
      "That is why interoception matters so much. It is not just the sensation of the body. It is the information stream the brain uses to decide whether the organism is safe, mobilized, tired, or ready to enter a different mode of attention.",
      "If the stream changes, the state changes. The story may still talk about focus, insight, or relaxation, but the mechanics are already working below that language.",
    ],
    callout: {
      label: "Big idea",
      text: "The body is not a passenger. It is one of the systems that sets the state of consciousness.",
    },
  },
  {
    title: "The insula is a convergence zone for internal evidence",
    paragraphs: [
      "The insula is often mentioned whenever interoception comes up because it participates in integrating internal bodily signals with broader perceptual context. That is not poetic language. It reflects the fact that the brain has to turn raw visceral data into a usable estimate of how the body feels right now.",
      "This estimate matters because subjective feeling is not just decoration on top of physiology. It is part of the operating system. A change in interoceptive precision can alter emotional tone, body ownership, and the kind of state the brain is willing to call normal.",
      "In that sense, the insula is not the whole story, but it is a very good place to look when the question is why one body state feels coherent and another feels off-center or overdriven.",
    ],
    subheading: "Why the word precision keeps coming back",
    subparagraphs: [
      "Interoceptive signals are always noisy.",
      "The brain has to decide how much trust to assign them.",
      "That trust profile shapes the feeling of being alive in a body.",
    ],
  },
  {
    title: "Breath changes state because it changes the evidence the brain receives",
    paragraphs: [
      "Breathing is not just gas exchange. It is a repeating afferent and efferent signal that interacts with CO2, arousal, vagal tone, and attention. Slow breathing can be calming partly because it reshapes the internal evidence stream, not because it performs a spiritual trick.",
      "The nervous system is sensitive to this because respiration sits at the boundary between automatic regulation and voluntary control. That makes it one of the cleanest levers for changing state without needing to invent any new theory of consciousness.",
      "When the breath settles, the whole body often becomes easier to model. The result can feel like mental quiet, but the more exact description is that the control room is receiving less conflicting input.",
    ],
    callout: {
      label: "Important distinction",
      text: "Breath does not create meaning by itself. It changes the conditions under which meaning becomes stable enough to notice.",
    },
  },
  {
    title: "Emotion often begins as a bodily forecast, not a verbal thought",
    paragraphs: [
      "It is tempting to think emotions arrive as stories. Usually they start as physiology. Tightening in the chest, a change in gut tone, shallow breathing, or a shift in skin conductance can all precede the sentence the mind eventually tells about what is happening.",
      "That sequence matters because it explains why some states feel present before they feel interpretable. The body can update the system faster than the explanatory network can name the shift.",
      "Once you start watching this sequence carefully, a lot of apparently abstract consciousness research becomes concrete. Feeling is not a late ornament. It is part of the signal pipeline.",
    ],
    subheading: "Why this matters for state engineering",
    subparagraphs: [
      "If you can change the body forecast, you can change the next cognitive frame.",
      "That makes emotion a control variable, not just a mood label.",
      "The state often changes because the organism has already re-evaluated the situation.",
    ],
  },
  {
    title: "Low-input practices make the body louder, not quieter",
    paragraphs: [
      "When you reduce external stimulation, interoceptive channels become easier to notice. The body is still producing the same signals, but fewer outside events compete with them. That is why stillness, darkness, and rhythm can make bodily sensations feel unusually vivid.",
      "The effect can be useful, but it can also be misleading. Less input is not automatically more truth. It is simply a better listening condition for internal evidence, which can reveal both genuine stability and exaggerated signal amplification.",
      "That is why disciplined observation matters. A quiet state can expose the machinery without necessarily validating the interpretation that follows.",
    ],
    callout: {
      label: "Practical warning",
      text: "Do not confuse sensory quiet with accuracy. Sometimes the body gets louder just because the room got quieter.",
    },
  },
  {
    title: "The body boundary is where selfhood gets negotiated",
    paragraphs: [
      "The sense of having a self is not just a thought. It depends on a stable relationship between internal signals and the world outside the skin. If that relationship changes, the boundary of selfhood can feel tighter, looser, or strangely distant.",
      "That is why interoception connects so easily with altered states, meditation, panic, depersonalization, and absorption. The same mechanisms that keep the organism oriented can also make the self feel smaller or larger depending on how they are weighted.",
      "The important point is not that the self is fake. The important point is that the self is assembled from evidence, and interoceptive evidence is a major part of the assembly process.",
    ],
    subheading: "Why the body sets the boundary",
    subparagraphs: [
      "A stable body loop supports a stable self loop.",
      "A noisy body loop can make the self feel less contained.",
      "The boundary is a computation, not a wall.",
    ],
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "Choose one breathing pattern and keep it consistent for several sessions. Track three things: the first bodily sensation that changes, the first emotional shift that appears, and the first cognitive interpretation that follows. Write them in that order.",
      "If you want a cleaner read, compare eyes-open and eyes-closed sessions. The contrast often reveals how much of your state is being built from the inside versus how much is being stabilized by the outside world.",
      "The goal is not to chase an altered state for its own sake. The goal is to understand how the body updates the nervous system before the mind turns that update into a story.",
    ],
  },
];

const evidence = [
  {
    title: "The insular cortex and interoception — a core review",
    note:
      "A useful starting point for understanding why the insula keeps appearing in studies of internal feeling and self-awareness.",
    href: "https://pubmed.ncbi.nlm.nih.gov/30041978/",
  },
  {
    title: "Interoception: the sense of the physiological condition of the body — Nature Reviews Neuroscience",
    note:
      "A strong overview of how internal bodily signals contribute to emotion, selfhood, and conscious feeling.",
    href: "https://pubmed.ncbi.nlm.nih.gov/23877363/",
  },
  {
    title: "Respiratory modulation of emotion and cognition — review",
    note:
      "Shows why breath is a practical lever for shifting state without pretending it is magical.",
    href: "https://pubmed.ncbi.nlm.nih.gov/36403741/",
  },
  {
    title: "Predictive processing of interoceptive signals — review",
    note:
      "Useful for understanding the body as a stream of predictions and prediction errors rather than a static object.",
    href: "https://pubmed.ncbi.nlm.nih.gov/32179324/",
  },
  {
    title: "Cardiac interoception and the nervous system — review",
    note:
      "A practical bridge between heartbeat awareness, arousal, and the felt quality of consciousness.",
    href: "https://pubmed.ncbi.nlm.nih.gov/36799341/",
  },
  {
    title: "Breathing, carbon dioxide, and autonomic state — PMC review",
    note:
      "A useful reminder that the body’s chemistry is part of the state machine.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10127320/",
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

export default function InteroceptiveLoopControlRoomPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {interoceptiveLoopControlRoomPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {interoceptiveLoopControlRoomPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{interoceptiveLoopControlRoomPost.category}</span>
            <span>{interoceptiveLoopControlRoomPost.readTime}</span>
            <span>{new Date(interoceptiveLoopControlRoomPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The body updates before the mind explains
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
            A grounded 12-minute interoceptive reset
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit quietly and keep the eyes closed for four minutes while tracking the breath, the heartbeat, and any muscle tension that shows up first. Then breathe slowly for four minutes, noting whether the body feels more contained, more open, or more noisy. End with four minutes of writing in the exact order you noticed changes: body, emotion, thought.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to observe how bodily state shapes consciousness.</li>
            <li>• The mind feels noisy and you want to see what changes first.</li>
            <li>• You need a repeatable protocol for body-based state tracking.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the body is part of the consciousness machine
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Interoception matters because consciousness does not float above the body. It is built through a continuous exchange of internal evidence, prediction, and autonomic regulation.
          </p>
          <p>
            Once you start tracking that exchange carefully, a lot of state change becomes legible. Breath, emotion, arousal, and self-boundary are not separate topics. They are different views of the same control problem.
          </p>
          <p>
            That is the practical lesson. If the body can reweight the state before the story arrives, then disciplined awareness begins with learning how to read the body’s update correctly.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
