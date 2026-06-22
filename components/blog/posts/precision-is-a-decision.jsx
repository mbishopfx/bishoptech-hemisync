import Link from "next/link";
import { precisionDecisionPostMeta } from "@/lib/blog/posts-data";

export const precisionDecisionPost = precisionDecisionPostMeta;

const introParagraphs = [
  "Precision is the brain’s decision about how much confidence to assign to a signal. It is not the same as truth. It is not the same as attention. It is the weighting mechanism that determines which error deserves to change the model.",
  "Once you understand that, a lot of consciousness work becomes easier to read. Rhythmic audio, breath, posture, light, and expectation do not add meaning directly. They alter the confidence landscape in which meaning gets assembled.",
  "The practical question is not whether a frequency is sacred. It is whether the nervous system becomes less expensive to run when you lower noise, stabilize timing, and reduce the number of competing hypotheses.",
];

const sections = [
  {
    title: "The hook: precision is a lever, not a feeling",
    paragraphs: [
      "In predictive terms, precision is about reliability. A signal that looks trustworthy gets more influence on the next state of the system. A signal that looks noisy gets demoted. That is how the brain keeps from being bullied by every random fluctuation that passes through the senses.",
      "The important part is that precision is assigned, not discovered in some absolute sense. The same input can carry different weight depending on context, arousal, expectation, and the broader state of the organism.",
      "That means consciousness is partly a negotiation over confidence. Change the negotiation, and the felt world changes with it.",
    ],
    callout: {
      label: "Big idea",
      text: "Precision is the control knob that tells the brain how seriously to take a signal before updating the model.",
    },
  },
  {
    title: "Predictive coding turns perception into arbitration",
    paragraphs: [
      "The predictive-processing view says the brain is not passively receiving reality. It is always comparing incoming data with internal expectations and then deciding how much mismatch to tolerate.",
      "That makes perception look less like a camera and more like an arbitration engine. Sensory data, memory, and prior belief all compete for influence. What you experience as immediate reality is the outcome of that contest.",
      "In altered-state work, that is a very useful frame. If a practice can reduce uncertainty or simplify the contest, the mind may feel clearer without any metaphysical event having occurred.",
    ],
    subheading: "Why this matters inside a session",
    subparagraphs: [
      "A calmer context lowers the cost of updating.",
      "A steadier rhythm lowers the need to keep checking the model.",
      "When the competition quiets down, consciousness often feels more spacious because less energy is spent defending the present interpretation.",
    ],
  },
  {
    title: "The salience system decides what deserves the microphone",
    paragraphs: [
      "Precision is never floating in isolation. It rides on arousal, salience, and the mechanisms that tell the brain what is worthy of interruption.",
      "That is why a nervous system under stress behaves differently from one that is regulated. In one case, nearly every signal gets treated as urgent. In the other, the system can afford to ignore more of its own noise.",
      "The result is not just emotional. It is computational. A different part of the signal stack gets selected for priority, and the subjective world changes accordingly.",
    ],
    callout: {
      label: "Important distinction",
      text: "Salience is emphasis, not truth. The brain can make something feel central without making it accurate.",
    },
  },
  {
    title: "Rhythm and constraint can change precision without changing content",
    paragraphs: [
      "This is where sound, breath, and environmental control become useful. A slow pulse, a narrow frequency band, a dim room, or a steadier exhalation does not inject wisdom into the brain. It changes the cost function under which the system is running.",
      "If the environment is noisy, precision gets spread too thin. If the environment is simple, the system can assign confidence more cleanly. The state feels different because the weighting problem got easier.",
      "That is why the most effective protocols usually look boring from the outside. They are boring on purpose. They reduce the number of signals fighting for ownership of the moment.",
    ],
    subheading: "Why context matters",
    subparagraphs: [
      "A session is never only the audio.",
      "A session is the audio plus the room plus the body plus the expectations already in motion.",
      "When those variables align, the same stimulus can behave like a precision tool instead of background decoration.",
    ],
  },
  {
    title: "When precision is miscalibrated, the state feels like a problem",
    paragraphs: [
      "Too much precision can look like hypervigilance. Too little can look like fog. Both are failures of calibration, not failures of character.",
      "That is why the same architecture that helps a person focus can also amplify anxiety, obsessive checking, or dissociative drift when the confidence landscape gets distorted. The system is not broken in a mystical sense. It is over- or under-weighting the wrong evidence.",
      "A grounded model has to say this plainly: not every vivid state is good, and not every quiet state is healthy. The question is whether the weighting is adaptive for the situation.",
    ],
    callout: {
      label: "Practical warning",
      text: "If a state makes the world feel more certain than it is, that is not insight. That is often a precision error.",
    },
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "The useful move is not to worship the effect. It is to instrument it. Keep the room stable. Keep the protocol repeatable. Notice whether attention, body tension, or thought speed changes in a measurable way across sessions.",
      "If the practice is doing real work, it should alter transitions first. You may notice that the system settles faster, noise feels easier to ignore, or inward focus becomes less expensive to maintain.",
      "That is enough. The goal is not transcendence theater. The goal is a nervous system that can assign precision with less waste and fewer false alarms.",
    ],
  },
];

const evidence = [
  {
    title: "The free-energy principle: a unified brain theory? — Nature Reviews Neuroscience (2010)",
    note:
      "A foundational framing for why brains act like prediction systems that minimize surprise rather than passive receivers of the world.",
    href: "https://www.nature.com/articles/nrn2787",
  },
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "Useful because it shows how mixed the evidence can be when state bias, context, and delivery method all matter.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Frequency-following response effect according to gender using a 10-Hz binaural beat stimulation — PMC (2023)",
    note:
      "A concrete example of rhythm-linked alpha changes, which makes the precision conversation more than a metaphor.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10200219/",
  },
  {
    title: "Analysis of a historical altered-state memo (1983)",
    note:
      "A historical example of serious institutions trying to describe altered states as a systems and timing problem.",
    href: "https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf",
  },
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "Shows that specific stimulation can reopen reflective awareness inside REM, which is a precision shift in another state.",
    href: "https://www.nature.com/articles/nn.3719",
  },
  {
    title: "STAR GATE [Controlled Remote Viewing] — Federation of American Scientists summary",
    note:
      "A reminder that institutional curiosity does not equal validation, but it does tell us where uncertainty was large enough to inspect.",
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

export default function PrecisionDecisionPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {precisionDecisionPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {precisionDecisionPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{precisionDecisionPost.category}</span>
            <span>{precisionDecisionPost.readTime}</span>
            <span>{new Date(precisionDecisionPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Precision is the first hidden adjustment the brain makes
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
            A 15-minute precision reset
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit upright in a dim room. Play a steady, low-detail audio track or a quiet tone for 10 minutes. Keep your exhale slightly longer than your inhale. Then spend 5 minutes in silence and write down which signal got louder first: breath, heartbeat, muscle tension, imagery, or self-talk. Do not interpret immediately. Just log the sequence.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• Attention feels over-allocated and noisy.</li>
            <li>• You want to compare calm states with clearly dysregulated ones.</li>
            <li>• You need a repeatable way to notice how confidence shifts before insight arrives.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the brain changes what it trusts before it changes what it sees
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Precision is one of the quietest and most important mechanisms in consciousness. It decides whether a sensation gets ignored, whether a prediction gets updated, and whether the next state feels stable or chaotic.
          </p>
          <p>
            That is why audio, breath, and environmental design matter. They are not miracle machines. They are ways of changing the confidence architecture of a living system that is already trying to sort signal from noise.
          </p>
          <p>
            If the result is cleaner awareness, great. If the result is only a clearer picture of how messy the system was to begin with, that is also useful. Either way, precision is doing the work.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
