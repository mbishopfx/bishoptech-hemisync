import Link from "next/link";
import { cancellationSignalPostMeta } from "@/lib/blog/posts-data";

export const cancellationSignalPost = cancellationSignalPostMeta;

const introParagraphs = [
  "The brain stays sane in motion because it does not treat every self-generated change as a surprise. It predicts the consequences of movement, subtracts what it expects to create, and preserves enough stability for the world to remain usable while the body keeps shifting its coordinates.",
  "That subtraction is the quiet work of corollary discharge and reafference cancellation. You move the eyes, turn the head, shift the jaw, or speak a sentence, and the nervous system has already prepared a reference signal that says, in effect, this part is mine.",
  "Without that reference, perception would be flooded by the consequences of your own action. With it, the world holds together. That is not a metaphor about sanity. It is one of the core mechanisms by which consciousness can remain anchored inside a moving organism.",
];

const sections = [
  {
    title: "The hook: stability is an active achievement, not a default state",
    paragraphs: [
      "A still world is an illusion created by a system that keeps removing its own motion from the evidence stream. The retinal image shifts every time the eyes saccade. The inner ear reports acceleration whenever the head turns. Muscles and joints flood the system with feedback whenever the body moves.",
      "Yet the room does not flicker into a new reality every time you blink. That is because the brain has mechanisms for predicting which sensory changes are self-made and which ones deserve to count as new information.",
      "The result is a remarkable kind of continuity. Consciousness does not have to freeze the body in order to experience a stable world. It simply has to keep the cancellation signal reliable enough to tell motion from intrusion.",
    ],
    callout: {
      label: "Big idea",
      text: "Perceptual stability is maintained by prediction, subtraction, and timing, not by a static sensory feed.",
    },
  },
  {
    title: "Corollary discharge is the copy that protects perception",
    paragraphs: [
      "Corollary discharge is easiest to understand as a message sent in parallel with action. The motor command goes out, and a predictive copy goes to other circuits so they can prepare for the sensory consequence. That is how the system keeps self-generated change from being misread as external change.",
      "This logic appears all over neuroscience. It shapes how we see during saccades, how we hear our own speech, and how we maintain a coherent body image while the body is in motion. The copy is not extra decoration. It is the part that makes action survivable for perception.",
      "If the copy is delayed, weakened, or mismatched, the world can feel unstable or oddly alien. The brain has lost some of its ability to cancel its own output before the sensory evidence is interpreted.",
    ],
    subheading: "Why the copy matters",
    subparagraphs: [
      "The system needs a prediction before the feedback arrives.",
      "The prediction lets the brain ignore what it already caused.",
      "What remains is the part that still deserves attention.",
    ],
  },
  {
    title: "Reafference is not noise to be eliminated. It is information with a source tag",
    paragraphs: [
      "The sensory consequences of action are often called reafference. That includes the visual sweep produced by eye movement, the tactile shift produced by self-touch, the vestibular report of turning, and the auditory trace of your own voice.",
      "The system does not simply silence all of that. It tags what it expects and compares the result against the prediction. The brain is less interested in erasing sensation than in sorting sensation by source.",
      "That source tagging is one reason the same movement can feel wildly different depending on context. A motion made in a low-noise state can be almost invisible to the self, while the same motion in a distorted state can feel amplified, strange, or too vivid to ignore.",
    ],
    callout: {
      label: "Important distinction",
      text: "Cancellation does not mean suppression of reality. It means source attribution is being done on time.",
    },
  },
  {
    title: "Eye movements are the cleanest demonstration that perception is edited on the fly",
    paragraphs: [
      "Saccades are a perfect example because the eyes are moving all the time, yet the world normally appears continuous. The visual system does not let every retinal shift become a story about a new room. It uses timing, suppression, and predictive updating to hide the seams.",
      "That hidden seam matters for consciousness because it reveals how much of seeing is reconstruction. You do not simply record the world. You sample it, interrupt it, and then rebuild continuity from fragments that were kept stable enough to trust.",
      "In that sense, every glance is a small technical miracle. The brain blurs out its own input changes so that a stable object can exist long enough to become a meaningful object.",
    ],
    subheading: "Why motion is not the enemy of vision",
    subparagraphs: [
      "Motion would destroy perception if it were not predicted.",
      "Prediction lets the brain keep its reference frame intact.",
      "A stable world is the result, not the starting condition.",
    ],
  },
  {
    title: "Speech and breath reveal how the body learns its own timing",
    paragraphs: [
      "Speaking is another place where the mechanism becomes obvious. Your own voice is both action and sound, which means the brain has to know in advance what will arrive at the ear. If it did not, every syllable would arrive like a foreign event.",
      "Breath matters for a similar reason. The diaphragm, chest wall, and laryngeal system are not just mechanical parts. They are timing devices that continuously tell the brain how much self-generated change is happening inside the body.",
      "That is why slow breathing, deliberate speech, and low-input practices can make consciousness feel more centered. They reduce timing ambiguity. When the body becomes easier to predict, the mind becomes easier to hold together.",
    ],
    callout: {
      label: "Practical warning",
      text: "If you make the body too quiet for too long without skill or context, the brain may not get less noisy. It may simply get less anchored.",
    },
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "Do not chase a dramatic state. Instead, test the cancellation system. Move your eyes quickly between two points, then pause. Turn your head slightly, then freeze. Speak one sentence, then hold silence. Notice what changes first: vision, balance, inner speech, or body tension.",
      "Write down the order of events. Order matters because the nervous system is a temporal machine. If the sequence changes across sessions, you have learned something about how source tagging is being negotiated in the moment.",
      "The goal is not to abolish motion. The goal is to see how the brain protects a stable world while motion keeps happening all around it.",
    ],
  },
];

const evidence = [
  {
    title: "Corollary discharge and reafference in sensory systems — Annual Review of Neuroscience",
    note:
      "A broad overview of the predictive copy that helps distinguish self-generated sensory consequences from external input.",
    href: "https://pubmed.ncbi.nlm.nih.gov/32916097/",
  },
  {
    title: "Saccadic suppression and visual stability — Nature Reviews Neuroscience",
    note:
      "Explains why rapid eye movements do not make the visual world feel like it is constantly tearing apart.",
    href: "https://pubmed.ncbi.nlm.nih.gov/29773822/",
  },
  {
    title: "Auditory suppression of self-generated speech sounds — PMC review",
    note:
      "Shows how the auditory system attenuates expected self-produced sound so it does not dominate perception.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4042054/",
  },
  {
    title: "Vestibular contributions to spatial stability and self-motion — PubMed",
    note:
      "Useful for understanding how motion signals support a stable world instead of destabilizing it.",
    href: "https://pubmed.ncbi.nlm.nih.gov/30589487/",
  },
  {
    title: "Forward models and state estimation in motor control — review article",
    note:
      "A motor-control framing of how the brain predicts the sensory consequences of movement before they arrive.",
    href: "https://pubmed.ncbi.nlm.nih.gov/22056894/",
  },
  {
    title: "Efference copy in speech and action monitoring — PMC",
    note:
      "A concrete look at how the brain checks its own output to keep self-generated events from being misclassified.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5310408/",
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

export default function CancellationSignalPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {cancellationSignalPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {cancellationSignalPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{cancellationSignalPost.category}</span>
            <span>{cancellationSignalPost.readTime}</span>
            <span>{new Date(cancellationSignalPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The world stays stable because the brain keeps canceling its own motion
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
            A 12-minute reafference reset
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit in a quiet room and alternate between three actions: a slow eye shift, a gentle head turn,
            and a single spoken word. After each action, pause for a few seconds and write down what changed first:
            vision, balance, inner speech, or body tension. Repeat the cycle three times and record only the order.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to see how self-generated motion is canceled.</li>
            <li>• You need a cleaner read on visual or vestibular stability.</li>
            <li>• You want to study the boundary between action and perception without adding noise.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: a stable world is an engineered one
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Perceptual continuity depends on the brain being able to predict and discount its own output.
            That is why motion does not automatically destroy the feeling of a stable room.
          </p>
          <p>
            Corollary discharge and reafference cancellation are not side notes. They are core mechanics
            of consciousness because they let a moving organism keep a coherent world online long enough
            to think, speak, and act inside it.
          </p>
          <p>
            If you want the shortest version, it is this: the world feels still because the brain is very good
            at noticing what it already caused.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
