import Link from "next/link";
import { posteriorParietalCoordinateEnginePostMeta } from "@/lib/blog/posts-data";

export const posteriorParietalCoordinateEnginePost =
  posteriorParietalCoordinateEnginePostMeta;

const introParagraphs = [
  "The brain does not experience space as raw geometry. It builds a coordinate frame, then treats that frame as the world it inhabits. The posterior parietal cortex sits near the center of that translation work, converting visual, vestibular, proprioceptive, and motor signals into a usable reference for action.",
  "That makes the posterior parietal cortex less like a picture gallery and more like a coordinate engine. It does not simply show you where things are. It helps decide where you are in relation to them, which is a much more consequential problem for consciousness than people usually admit.",
  "If self-location, body ownership, and spatial attention can shift without the room changing, then the deep issue is not perception in the casual sense. It is the stability of the frame that perception depends on.",
];

const sections = [
  {
    title: "The hook: when the coordinate frame shifts, presence shifts with it",
    paragraphs: [
      "Most people assume that presence is what remains after the brain notices the world. The more accurate picture is that presence is what appears after a coordinate frame has been assembled well enough to support it. That frame is dynamic. It is continuously recalculated.",
      "The posterior parietal cortex matters because it participates in that recalculation. It helps the system answer a deceptively basic question: where is the body relative to objects, motion, and intended action right now? Change that answer and you can change the felt geometry of experience without changing the physical room at all.",
      "That is why high-level consciousness work so often collapses back into body and space. The self is not floating above the coordinate problem. It is built inside it.",
    ],
    callout: {
      label: "Big idea",
      text: "The brain does not first perceive a stable world and then locate the self inside it. It computes a reference frame, and that computation becomes the felt world.",
    },
  },
  {
    title: "The posterior parietal cortex is a transform layer, not a map drawer",
    paragraphs: [
      "The old habit of calling a cortical region a map can be misleading. Maps are static. Coordinate transformations are not. The posterior parietal cortex participates in converting one format of information into another: retinal coordinates into body-centered coordinates, body-centered coordinates into action-centered coordinates, and action-centered coordinates into something the organism can use immediately.",
      "That transform work is computationally expensive, which is why it matters so much. A nervous system that cannot cleanly transform coordinates will struggle with reaching, orienting, tool use, and self-location. It will also struggle with the quiet version of those tasks: knowing where the self seems to be.",
      "Consciousness is affected because the coordinate frame is not just for movement. It is for organizing the scene that movement happens in.",
    ],
    subheading: "Why the same stimulus can land differently",
    subparagraphs: [
      "A sound heard from behind and a sound heard from the side do not merely differ in position. They differ in the action plan they imply.",
      "A body signal judged near the torso is weighted differently than one judged peripherally.",
      "The posterior parietal cortex helps assign those differences a usable frame before awareness tries to narrate them.",
    ],
  },
  {
    title: "Egocentric and allocentric frames are both useful, and neither is the whole story",
    paragraphs: [
      "Egocentric space is body-centered. Allocentric space is world-centered. Consciousness moves between both, sometimes in a single breath. The posterior parietal cortex is one of the places where that switching can be coordinated rather than confused.",
      "This matters because experience feels unitary even though it is assembled from incompatible coordinate systems. The brain has to keep asking whether something is near the hand, near the head, near the horizon, or near the next action. The answer changes what the signal means.",
      "When that translation works, the world feels immediate and centered. When it fails, presence can feel offset, disorganized, or strangely detachable from the body.",
    ],
    callout: {
      label: "Important distinction",
      text: "A reference frame is not the same as a belief. It is the operational geometry the nervous system uses to decide what counts as near, far, reachable, or self-relevant.",
    },
  },
  {
    title: "Body ownership and agency depend on the same coordinate machinery",
    paragraphs: [
      "The posterior parietal cortex is not only about visual space. It also helps organize body ownership and the sense that a movement belongs to the organism that intends it. That is why perturbations here can alter the feel of agency, ownership, and spatial perspective at the same time.",
      "The body is not given as a finished object. It is stabilized by cross-checks among touch, vision, proprioception, vestibular input, and motor prediction. The parietal system is where those cross-checks get integrated into a frame that can support action.",
      "If that integration loosens, the brain can still function, but the confidence of the frame can drop. Subjectively, that can look like derealization, drift, or a difficult-to-name reduction in bodily certainty.",
    ],
    callout: {
      label: "Practical implication",
      text: "Ownership and location are related, but they are not identical. A system can preserve one while destabilizing the other.",
    },
  },
  {
    title: "Low-input states expose the coordinate machine",
    paragraphs: [
      "It is easier to notice coordinate work when the input load drops. Quiet rooms, stillness, rhythmic breathing, sensory reduction, and altered states all reduce the amount of external correction the system receives. When that happens, the reference frame becomes easier to feel because it is less crowded by demand.",
      "That is why meditation, hypnagogia, float tanks, and even carefully structured audio sessions can reveal something subtle but important: the felt location of the self is maintained, not merely observed. When the maintenance relaxes, the frame can wobble.",
      "The wobble is not always bad. Sometimes it is the cleanest evidence that the brain is doing coordinate math all the time and that the math can be tuned.",
    ],
    subheading: "Why reduced input can feel expansive",
    subparagraphs: [
      "Less sensory competition means less immediate correction.",
      "Less correction makes the frame more visible.",
      "What feels like spaciousness may simply be a less tightly clamped coordinate system.",
    ],
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "If you want to study the posterior parietal contribution seriously, do not chase spectacle. Track the first signs that the coordinate frame changes: where the body seems to sit in space, whether the room feels closer or farther away, whether motion feels cleaner or more effortful, and whether the self feels centered or offset.",
      "Keep conditions repeatable. Use the same posture, the same audio, the same duration, and the same notes after each session. Coordinate effects are easy to romanticize and hard to measure unless the protocol stays stable.",
      "The goal is not to prove a metaphysical theory. It is to learn how the brain constructs a reference frame strongly enough that the world can be lived in without falling apart.",
    ],
  },
];

const evidence = [
  {
    title: "Posterior parietal cortex and spatial reference frames — PubMed review entry",
    note:
      "A useful entry point for the literature on egocentric coordinates, transformation rules, and action-centered perception.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=posterior+parietal+cortex+spatial+reference+frames+review",
  },
  {
    title: "Coordinate transformations in the posterior parietal cortex — PMC search entry",
    note:
      "Search results that connect the PPC to the translation between different coordinate systems used by perception and action.",
    href: "https://pmc.ncbi.nlm.nih.gov/?term=posterior+parietal+cortex+coordinate+transformations",
  },
  {
    title: "Body ownership, multisensory integration, and parietal cortex — PubMed search entry",
    note:
      "A practical doorway into work on how ownership depends on cross-modal agreement and parietal mediation.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=body+ownership+multisensory+integration+parietal+cortex",
  },
  {
    title: "Linking out-of-body experience and self processing to mental own-body imagery at the temporoparietal junction — University of Bristol",
    note:
      "Useful because TPJ sits near the parietal boundary where perspective, body ownership, and self-location get negotiated.",
    href: "https://research-information.bris.ac.uk/en/publications/linking-out-of-body-experience-and-self-processing-to-mental-own-/",
  },
  {
    title: "The role of the temporoparietal junction in the body representation — PubMed review record",
    note:
      "A practical review record for the literature tying body representation to parietal-temporal integration.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=temporoparietal+junction+body+representation+review",
  },
  {
    title: "Multisensory body representation and self-location — review article",
    note:
      "A broad review entry for the mechanism that stabilizes self-location through converging sensory evidence.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=multisensory+body+representation+self-location+review",
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

export default function PosteriorParietalCoordinateEnginePost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {posteriorParietalCoordinateEnginePost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {posteriorParietalCoordinateEnginePost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{posteriorParietalCoordinateEnginePost.category}</span>
            <span>{posteriorParietalCoordinateEnginePost.readTime}</span>
            <span>
              {new Date(posteriorParietalCoordinateEnginePost.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Presence starts as a coordinate problem
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
            A grounded 12-minute coordinate reset
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit upright in a quiet room. For four minutes, keep your gaze fixed
            on one object and notice how the body anchors itself in relation to
            that object. For four minutes, close your eyes and track whether the
            sense of left, right, near, or far becomes more or less vivid. For
            the final four minutes, stand slowly and note whether the frame feels
            stable, elastic, or offset before you write anything down.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">
            Use this session when:
          </p>
          <ul className="mt-3 space-y-2">
            <li>• You want to study self-location without chasing spectacle.</li>
            <li>• The room feels familiar but your orientation feels unstable.</li>
            <li>• You need a repeatable way to observe reference-frame drift.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the self is only as stable as the frame that holds it
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The posterior parietal cortex is valuable to consciousness research
            because it shows how much of experience depends on hidden
            transformations. The brain does not merely detect sensation. It
            converts sensation into a coordinate frame, and that frame becomes
            the backdrop for all the things we later call perception, ownership,
            and agency.
          </p>
          <p>
            That is the useful, non-mystical lesson. If reference frames can be
            biased, trained, or destabilized, then the felt location of the self
            is not a metaphysical given. It is a live construction problem. The
            more carefully you study it, the less room there is for hand-waving
            and the more room there is for real mechanism.
          </p>
          <p>
            The invitation is simple: stop treating orientation as background.
            It is part of the machinery that makes a conscious moment possible
            at all.
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
