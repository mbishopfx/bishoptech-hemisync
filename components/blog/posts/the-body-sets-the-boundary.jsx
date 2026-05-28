import Link from "next/link";
import { bodyBoundaryPostMeta } from "@/lib/blog/posts-data";

export const bodyBoundaryPost = bodyBoundaryPostMeta;

const introParagraphs = [
  "The body is not a vessel carrying consciousness around from place to place. It is part of the mechanism that produces the feeling of being a self in the first place. The boundary is computed, not merely inhabited.",
  "Interoception, autonomic tone, posture, and visceral prediction all contribute to that computation. When those variables shift, the felt location of the self can shift with them.",
  "That is why serious state work cannot treat the body as an accessory. The body is the inside of the model, and the model is what awareness has to pass through before it feels like anything at all.",
];

const sections = [
  {
    title: "The hook: the self begins as a boundary estimate",
    paragraphs: [
      "The brain does not wait for a philosophy seminar before deciding where you end and the world begins. It continuously integrates signals from the body, the senses, and the environment to maintain a usable boundary.",
      "That boundary can feel solid during ordinary life, then wobble under fatigue, panic, meditative absorption, illness, or altered state. The wobble is not proof that the self is fake. It is proof that the self is a managed construction.",
      "Once you see that, a lot of the mystery around consciousness changes shape. The question is no longer whether the self exists. The question is how the system keeps generating the experience of being here.",
    ],
    callout: {
      label: "Big idea",
      text: "Selfhood is not a static object. It is a boundary condition the nervous system keeps refreshing.",
    },
  },
  {
    title: "Interoception tells the brain what the body is doing right now",
    paragraphs: [
      "Interoception is the channel through which heartbeat, breath, visceral tension, temperature, hunger, and other internal signals become meaningful to awareness. It is not a side feature. It is one of the inputs that makes a self-model possible.",
      "When interoceptive precision is stable, the system gets a cleaner read on internal state. When it is unstable, the body can feel alien, too loud, or strangely distant. Both extremes matter because they change what the brain can safely predict.",
      "The felt self is therefore partly a forecast about the body. That forecast can be accurate, noisy, overconfident, or underweighted. Consciousness inherits the result.",
    ],
    subheading: "Why the insula and brainstem matter",
    subparagraphs: [
      "The point is not anatomical trivia. The point is that selfhood depends on circuits that monitor visceral state and relay that information into awareness.",
      "If the body report changes, the identity report changes with it.",
      "That is not metaphor. It is architecture.",
    ],
  },
  {
    title: "Autonomic prediction changes the feel of ownership and agency",
    paragraphs: [
      "A body that predicts threat will feel different from a body that predicts safety. Heart rate, breathing, muscle tone, and gut tension all feed back into the model of what kind of situation this is.",
      "This is why a person can feel hyper-present during anxiety and oddly detached during depletion. The nervous system is not just managing chemistry. It is also assigning meaning to internal state.",
      "Ownership and agency are part of that assignment. If the system trusts the body less, the self can feel less anchored. If it trusts the body more, the world can feel easier to inhabit.",
    ],
    callout: {
      label: "Important distinction",
      text: "A louder body signal is not automatically a better signal. Sometimes it is just a more urgent one.",
    },
  },
  {
    title: "Why boundary changes show up in altered states first",
    paragraphs: [
      "Meditation, sleep transition, sensory withdrawal, breath work, and dream states all reduce the usual burden on the body model. With less external competition, internal signals can become more prominent.",
      "That is when people start reporting floating, expansion, dissolution, heaviness, distance, or a sharp sense of location without a stable anchor. The brain is still doing its job. It is just doing it under a different set of constraints.",
      "The interesting part is that these states can feel both less ordinary and more mechanically legible at the same time. That is where consciousness research gets useful.",
    ],
    subheading: "Why this matters to practitioners",
    subparagraphs: [
      "If you work with audio or silence, the body is always in the loop.",
      "If you want a stable altered state, you need a stable enough body model to hold it.",
      "If the model becomes too unstable, the experience stops being insight and starts becoming drift.",
    ],
  },
  {
    title: "When the body model destabilizes, the self can feel too near or too far",
    paragraphs: [
      "In panic, depersonalization, insomnia, or overtraining, the body can stop feeling like a reliable coordinate system. That can produce a frightening sense that reality has moved or that the self has become thin.",
      "In deep absorption, the same architecture can produce a less frightening version of the shift: the boundary softens, the inner stream becomes more continuous, and the outside world stops dominating the frame.",
      "The mechanism is related even when the interpretation is different. The system is reweighting internal and external evidence to answer a simple question: what is happening to me right now?",
    ],
    callout: {
      label: "Practical warning",
      text: "Do not mistake boundary instability for depth. Sometimes it is just a nervous system with poor calibration.",
    },
  },
  {
    title: "What disciplined body-based practice actually looks like",
    paragraphs: [
      "A serious practice does not begin with dramatic claims. It begins with repeatable observation. Note posture, breath depth, pulse, temperature, tension, and the first shift in felt location before and after a session.",
      "If the protocol is useful, the body should become easier to read and the state should become easier to enter or exit. That is a much better measure than trying to crown the experience with mystical language.",
      "The body will tell you what the state is doing if you are patient enough to listen to the mechanics instead of the drama.",
    ],
  },
];

const evidence = [
  {
    title: "Linking out-of-body experience and self processing to mental own-body imagery at the temporoparietal junction — University of Bristol",
    note:
      "A strong reminder that self-location and body ownership are constructed and can be experimentally perturbed.",
    href: "https://research-information.bris.ac.uk/en/publications/linking-out-of-body-experience-and-self-processing-to-mental-own-/",
  },
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "Shows that a change in stimulation and state can bring reflective awareness online inside REM, where body-boundary rules already shift.",
    href: "https://www.nature.com/articles/nn.3719",
  },
  {
    title: "Analysis and Assessment of Gateway Process — U.S. Army/CIA memo (1983)",
    note:
      "Useful because it treats altered states as an engineering problem involving synchronization, attention, and perception.",
    href: "https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf",
  },
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "A mixed but relevant literature when thinking about how state bias can be nudged without any metaphysical garnish.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Frequency-following response effect according to gender using a 10-Hz binaural beat stimulation — PMC (2023)",
    note:
      "A concrete example of rhythmic input moving a measurable state marker.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10200219/",
  },
  {
    title: "STAR GATE [Controlled Remote Viewing] — Federation of American Scientists summary",
    note:
      "A reminder that institutional curiosity can outgrow certainty while still remaining subject to audit.",
    href: "https://irp.fas.org/program/collect/stargate.htm",
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

export default function BodyBoundaryPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {bodyBoundaryPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {bodyBoundaryPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{bodyBoundaryPost.category}</span>
            <span>{bodyBoundaryPost.readTime}</span>
            <span>{new Date(bodyBoundaryPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The self is a boundary condition, not a container
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
            A 12-minute boundary scan
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit still and reduce input. Spend 6 minutes noticing breath, heartbeat, and posture without changing them. Spend 4 minutes noticing where the body feels most present and where it feels least present. Finish with 2 minutes of silence and note whether the sense of location, ownership, or agency changed first.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to observe how the body model changes under low stimulation.</li>
            <li>• You need a cleaner read on anxiety, depletion, or dissociation.</li>
            <li>• You want to compare ordinary selfhood with more altered states of awareness.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the body is the instrument that makes the self audible
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Consciousness does not float above embodiment. The body contributes timing, confidence, and boundary information to every moment of being aware.
          </p>
          <p>
            That is why changes in breath, posture, arousal, and interoception can reshape the felt self so quickly. They do not add a story after the fact. They modify the machinery that tells the story.
          </p>
          <p>
            If you want to work with consciousness mechanically, this is one of the most useful truths available: the self is easier to understand when you treat the body as part of the model rather than as a passenger.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
