import Link from "next/link";
import { bodyMapPresenceDriftPostMeta } from "@/lib/blog/posts-data";

export const bodyMapPresenceDriftPost = bodyMapPresenceDriftPostMeta;

const introParagraphs = [
  "The body map is not a photograph of the self. It is a continuously updated model that tells the brain where the body seems to be, how it is oriented, and how much confidence to assign to that location. When that model shifts, presence can feel strangely elastic.",
  "That is why vestibular signals, proprioception, and interoception matter so much in consciousness mechanics. They do not just support balance. They help determine the geometry of being here at all.",
  "If the sense of self can drift, then self-location is not a mystery word. It is a construction problem. That makes it scientifically interesting instead of merely uncanny.",
];

const sections = [
  {
    title: "The hook: the self feels stable because the model is being refreshed",
    paragraphs: [
      "Most people experience presence as if it were obvious. In reality, the brain is constantly recomputing where the body is, what counts as inside or outside, and which signals belong to the organism rather than to the environment. The feeling of being located is built from that work.",
      "That is why the body can feel anchored in ordinary waking life and strangely unmoored in meditation, hypnagogia, sensory reduction, or threat. The system has not lost reality. It has changed the precision of the cues that define reality from the first-person point of view.",
      "Once you see that, body ownership stops looking like a philosophical primitive. It starts looking like an inference that can be stabilized, weakened, or temporarily rerouted.",
    ],
    callout: {
      label: "Big idea",
      text: "Presence is not a thing the brain receives. It is a location estimate the brain keeps checking and correcting.",
    },
  },
  {
    title: "Vestibular input gives the self its gravity",
    paragraphs: [
      "The vestibular system does more than keep you upright. It supplies the nervous system with a constant stream of orientation data about acceleration, head position, and motion. That stream helps anchor the body map to something stable enough to trust.",
      "When vestibular cues are consistent, the brain can keep the self-model centered. When they are ambiguous, conflicting, or experimentally perturbed, the model becomes easier to distort. That is one reason disorientation can feel so existential. Gravity stops behaving like background information and starts behaving like an inference problem.",
      "This is also why self-location research keeps returning to the same basic principle: you do not just live inside a body. You live inside a model that keeps deciding where the body is.",
    ],
    subheading: "Why gravity matters for consciousness",
    subparagraphs: [
      "Orientation is not a side issue. It is part of the frame that lets experience feel owned.",
      "When the frame changes, the same room can feel farther away, closer, or unrealistically expanded.",
      "That is a geometry change, not a philosophical one.",
    ],
  },
  {
    title: "The temporoparietal junction helps assemble own-body perspective",
    paragraphs: [
      "The temporoparietal junction, or TPJ, keeps appearing in studies of out-of-body experiences because it sits at the crossroads of multisensory integration, spatial perspective, and body ownership. If the brain needs to decide where the self is in relation to the world, TPJ is one of the places where that decision gets negotiated.",
      "The important point is not that TPJ is a magic consciousness switch. It is that this region helps reconcile signals from vision, touch, vestibular input, and internal body maps. When that reconciliation is perturbed, perspective can shift without any change in the external room.",
      "That is a very specific kind of evidence. It tells us that the feeling of being somewhere is an engineered result, not an unbreakable fact.",
    ],
    callout: {
      label: "Important distinction",
      text: "A change in perspective is not a hallucination by default. It can be the visible result of a body-model update.",
    },
  },
  {
    title: "Interoception sets the inner boundary line",
    paragraphs: [
      "Vestibular cues tell the brain where the body is in space. Interoceptive cues tell the brain what the body is doing from the inside. Heartbeat, breath, visceral tension, temperature, and gut activity all help define what feels like me versus what feels like the surrounding world.",
      "If interoceptive precision is too high, the body can feel hyper-real and intrusive. If it is too low, the body can feel distant or unreal. Either way, the self-model is reacting to how much confidence the brain assigns to internal signals.",
      "This is why altered states are so revealing. They do not just change imagery. They show how the boundary of selfhood is assembled from inside the loop.",
    ],
    subheading: "Why inward signals can dominate",
    subparagraphs: [
      "The body is the first environment the brain has to explain.",
      "If those signals become noisy or over-weighted, the map of selfhood changes with them.",
      "That is why breath work, threat, and deep stillness can all change presence so quickly.",
    ],
  },
  {
    title: "Out-of-body reports are useful because they expose the boundary conditions",
    paragraphs: [
      "The serious value of out-of-body research is not that it proves anything paranormal. Its value is that it shows how perspective can detach from the usual body location when the underlying multisensory model is perturbed.",
      "That matters because the experience of being located is normally so seamless that people assume it must be simple. It is not simple. It is an ongoing integration task. When the task fails or shifts, the self can seem to move, lift, split, or observe from a different angle.",
      "That is why these reports remain scientifically important even when the folklore around them gets exaggerated. They are edge cases that reveal the structure of ordinary embodiment.",
    ],
    subheading: "Why edge cases matter",
    subparagraphs: [
      "A system tells on itself when it is near a boundary.",
      "Out-of-body style reports mark one of those boundaries.",
      "The signal is not proof of a fantasy. It is proof that the body model is editable.",
    ],
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "If you want to study presence seriously, do not chase strangeness. Keep the room quiet. Keep your head still. Notice how the body feels in space before and after a session. Track whether the edges of the body get sharper, blurrier, heavier, lighter, closer, or more distant.",
      "Use the same protocol several times. State work is easy to romanticize and hard to measure, which is why repeatability matters. The point is not to induce drama. The point is to learn what changes the location estimate in a reliable way.",
      "That gives you something practical: a cleaner sense of how the self-model responds when the system is given less noise and more time to recompute.",
    ],
  },
];

const evidence = [
  {
    title: "Linking out-of-body experience and self processing to mental own-body imagery at the temporoparietal junction — University of Bristol",
    note:
      "A key study connecting OBE-like perspective shifts to TPJ activity and body-transformation tasks.",
    href: "https://research-information.bris.ac.uk/en/publications/linking-out-of-body-experience-and-self-processing-to-mental-own-/",
  },
  {
    title: "Vestibular contributions to self location and self motion perception — PubMed review record",
    note:
      "A useful review search for work showing how vestibular input anchors the location estimate that feels like presence.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=vestibular+contributions+to+self+location+self+motion+perception+review",
  },
  {
    title: "The role of the temporoparietal junction in the body representation — PubMed review record",
    note:
      "A convenient way to trace research linking TPJ to body ownership, perspective, and multisensory integration.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=temporoparietal+junction+body+representation+review",
  },
  {
    title: "Interoceptive awareness and the salience network — PubMed review record",
    note:
      "Helpful for understanding how internal bodily signals can become central enough to shape selfhood.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=interoceptive+awareness+salience+network+review",
  },
  {
    title: "Viscerosensory influences on brain and behavior — Nature Reviews Neuroscience (2010)",
    note:
      "A broad review of how bodily signals influence perception, affect, and the felt organization of self.",
    href: "https://www.nature.com/articles/nrn2789",
  },
  {
    title: "The body schema and the body image — PubMed review record",
    note:
      "A good search starting point for separating spatial body modeling from explicit self-description.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=body+schema+body+image+review",
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

export default function BodyMapPresenceDriftPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {bodyMapPresenceDriftPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {bodyMapPresenceDriftPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{bodyMapPresenceDriftPost.category}</span>
            <span>{bodyMapPresenceDriftPost.readTime}</span>
            <span>{new Date(bodyMapPresenceDriftPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The body feels obvious because the model is constantly correcting itself
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
            A grounded 10-minute body-location audit
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit in a quiet room and keep the head still. Close the eyes for one
            minute and notice whether the body feels centered, tall, compressed,
            or oddly distant. Then spend eight minutes following the breath
            while observing any changes in weight, orientation, or boundary. End
            with one minute of stillness and write down which cue changed first.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• The body feels vague, heavy, or strangely far away.</li>
            <li>• You want to study self-location without chasing spectacle.</li>
            <li>• You want to see whether breath and stillness change the map.
            </li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the self is a location estimate, not a fixed object
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The body map is useful because it lets the brain keep track of where
            it seems to be. But it is still a model. That means it can be tuned,
            destabilized, or made unusually vivid by changing the signals that
            support it.
          </p>
          <p>
            Vestibular cues, interoception, and multisensory binding work
            together to produce the felt stability of presence. When those cues
            shift, the self can feel lighter, farther away, closer, or split
            from the normal point of view.
          </p>
          <p>
            That is not a reason to panic. It is a reason to pay attention. If
            you can see how the location estimate is assembled, you can start to
            tell the difference between a clean state shift and a system that is
            simply losing its bearings.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
