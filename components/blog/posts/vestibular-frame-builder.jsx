import Link from "next/link";
import { vestibularFrameBuilderPostMeta } from "@/lib/blog/posts-data";

export const vestibularFrameBuilderPost = vestibularFrameBuilderPostMeta;

const introParagraphs = [
  "Gravity is not background noise. It is one of the oldest coordinate systems the nervous system uses to decide where the body begins, where the world sits, and how the self can remain stable while the head and limbs keep moving.",
  "That is why the vestibular system matters far beyond balance. It is a prediction engine for self-location, orientation, and motion. When it is working cleanly, presence feels centered and obvious. When the signals drift, the felt location of the self can move even if the room does not.",
  "This is not mystical by default. It is a control problem. The brain has to combine acceleration, gravity, vision, proprioception, and interoception into a coherent frame or the experience of being here begins to wobble.",
];

const sections = [
  {
    title: "The hook: the body needs a stable frame before consciousness can feel local",
    paragraphs: [
      "People often talk about consciousness as if it were a light that simply illuminates the room. That model skips an important step. The light needs a frame. It needs to know where up is, where down is, and which sensations belong to the body that is doing the perceiving.",
      "The vestibular system supplies a large part of that frame. It does not just tell you that you are moving. It helps the nervous system estimate the geometry of the body in a gravitational field so the rest of perception can stay grounded.",
      "When that estimate is clean, the self feels quietly located. When it is noisy, altered states, dizziness, depersonalization, or out-of-body style experiences can become easier to trigger because the internal map is no longer anchored as firmly as usual.",
    ],
    callout: {
      label: "Big idea",
      text: "The felt location of the self is a computed stability problem, not a fixed property of the skull.",
    },
  },
  {
    title: "Vestibular prediction is the brain solving gravity in real time",
    paragraphs: [
      "The inner ear does not merely detect motion after the fact. The semicircular canals and otolith organs report angular and linear acceleration, and the brain uses those signals to predict how the body is positioned relative to gravity.",
      "That prediction is essential because sensation by itself is incomplete. A head turn, a lift, or a small shift in posture changes the incoming signal immediately, but the nervous system has to interpret that change against a model of what should happen next.",
      "The result is a kind of embodied state estimation. The brain is continually solving a question that sounds simple but is not: given the current motion, where is the body, and how should the rest of the sensory world be interpreted from here?",
    ],
    subheading: "Why gravity is computationally expensive",
    subparagraphs: [
      "Gravity is constant, but the body is not.",
      "That mismatch forces the nervous system to keep recalculating orientation.",
      "If the estimate fails, even a familiar room can feel wrong.",
    ],
  },
  {
    title: "The temporoparietal junction helps convert body signals into a single point of view",
    paragraphs: [
      "The vestibular system does not do the whole job alone. The temporoparietal junction, multisensory cortex, and body representation networks all contribute to the construction of a first-person perspective.",
      "That is why self-location is such a revealing topic. The feeling of being inside a body is not identical to the presence of a body. It is a synthesis created when multiple streams agree well enough to be trusted as one scene.",
      "When those streams fail to align, the point of view can loosen. Some people feel stretched, distant, shifted upward, or placed outside the usual body boundary. The system is still running. It is just solving the coordinate problem differently.",
    ],
    callout: {
      label: "Important distinction",
      text: "A shifted point of view does not require a supernatural explanation. It only requires a changed integration of body, space, and prediction.",
    },
  },
  {
    title: "Motion conflict is where presence starts to drift",
    paragraphs: [
      "Motion sickness is often treated like a nuisance, but it is a valuable clue. The classic problem is mismatch: visual input, vestibular input, and proprioceptive input disagree enough that the brain cannot reconcile them cleanly.",
      "That mismatch can produce nausea, disorientation, derealization, or an eerie sense that the self is no longer sitting in the room in the usual way. The experience is not random. It is what happens when the predictive model of orientation starts losing confidence.",
      "Because of that, the same circuitry that normally keeps you grounded can, under conflict, make the self feel less local. The body is still there, but the brain is no longer fully certain how to place it inside the world.",
    ],
    subheading: "Why altered states often begin with destabilization",
    subparagraphs: [
      "When the frame loosens, the system has to rebuild it.",
      "That rebuilding phase is fertile ground for unusual perception.",
      "The state change is not an accident. It is the consequence of failed consensus across the body map.",
    ],
  },
  {
    title: "Stillness, darkness, and low input can make the frame audible",
    paragraphs: [
      "If you reduce external stimulation, the vestibular frame becomes easier to notice because the usual stream of external correction quiets down. The brain has fewer outside signals to lean on, so internal orientation signals begin to stand out.",
      "This is one reason dark rooms, flotation, meditation, and quiet audio environments can feel so potent. They do not create consciousness from scratch. They reduce competing evidence until the body map is easier to inspect.",
      "That can be useful, but it can also be disorienting. The same lowering of sensory load that supports calm can also expose how much of presence depends on a continuously updated reference frame.",
    ],
    callout: {
      label: "Practical warning",
      text: "If the frame is already unstable, extreme sensory reduction can amplify discomfort rather than insight.",
    },
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "Do not chase a dramatic out-of-body event. Instead, inspect the frame. Sit upright, keep the eyes open, and make three slow head turns. After each turn, pause and note whether the first change is visual lag, body tension, inner stillness, or a subtle shift in location.",
      "Then repeat the same sequence with the eyes closed. Record the difference, not the interpretation. The question is simple: how much does the self rely on vision, motion, and gravity prediction to stay where it feels like it is?",
      "That is the useful version of this work. You are not trying to leave the body. You are trying to understand the machinery that makes the body feel locally owned in the first place.",
    ],
  },
];

const evidence = [
  {
    title: "Vestibular contributions to bodily self-consciousness — PMC review",
    note:
      "A strong overview of how vestibular signals participate in self-location, perspective, and the felt stability of the body in space.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5711291/",
  },
  {
    title: "The vestibular system and the sense of self — Nature Reviews Neuroscience",
    note:
      "A concise discussion of how vestibular input shapes bodily self-consciousness rather than just balance.",
    href: "https://pubmed.ncbi.nlm.nih.gov/19521331/",
  },
  {
    title: "Temporoparietal junction and out-of-body experience research — PMC",
    note:
      "Shows why disruptions in multisensory integration can alter the felt center of perception.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4140112/",
  },
  {
    title: "Vestibular signals and spatial orientation — Frontiers in Neurology",
    note:
      "Useful for understanding how gravity and acceleration are converted into an internal orientation model.",
    href: "https://www.frontiersin.org/articles/10.3389/fneur.2014.00240/full",
  },
  {
    title: "Motion sickness, sensory conflict, and perception — PubMed review",
    note:
      "A practical way to connect sensory mismatch with the feeling that the world or body has stopped making sense.",
    href: "https://pubmed.ncbi.nlm.nih.gov/22682539/",
  },
  {
    title: "Multisensory body representation and self-location — review article",
    note:
      "Explains how vision, proprioception, and vestibular input converge into a usable first-person frame.",
    href: "https://pubmed.ncbi.nlm.nih.gov/30041978/",
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

export default function VestibularFrameBuilderPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {vestibularFrameBuilderPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {vestibularFrameBuilderPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{vestibularFrameBuilderPost.category}</span>
            <span>{vestibularFrameBuilderPost.readTime}</span>
            <span>{new Date(vestibularFrameBuilderPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The body needs a frame before presence can feel local
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
            A 12-minute gravity calibration
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit upright with both feet planted. Keep the room quiet and the lighting even. Turn your head slowly to the left, then to the right, then look down and back to center. After each movement, pause for a few breaths and note whether the first change is visual, vestibular, or bodily. Repeat with your eyes closed if the environment is safe.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to observe how self-location is stabilized.</li>
            <li>• You are studying motion, dizziness, or subtle state drift.</li>
            <li>• You want a grounded way to inspect the body map without chasing a spectacle.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use if you are already dizzy or in a position where imbalance could cause harm.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: presence is built on a moving coordinate system
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The vestibular system is one of the clearest reminders that consciousness is not floating above the body. It is built through the body, with the body, and against the constant problem of maintaining orientation inside gravity.
          </p>
          <p>
            When the frame is stable, presence feels obvious and continuous. When the frame loosens, the self can drift, expand, or feel strangely external because the nervous system is renegotiating where the first-person point of view belongs.
          </p>
          <p>
            That makes vestibular research useful for more than balance disorders. It gives us a concrete way to study how self-location, orientation, and body ownership are assembled from multiple streams that must agree just enough for experience to feel like one coherent place.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
