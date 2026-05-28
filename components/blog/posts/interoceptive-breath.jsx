import Link from "next/link";
import { interoceptiveBreathPostMeta } from "@/lib/blog/posts-data";

export const interoceptiveBreathPost = interoceptiveBreathPostMeta;

const introParagraphs = [
  "Breathing is the rare control surface the nervous system leaves partly in your hands. It is voluntary enough to practice, involuntary enough to keep you alive, and close enough to the machinery of arousal that even small changes can alter the feel of consciousness.",
  "That is why breath work matters in a NeuroSync context. The sound is only one part of the state stack. Respiration changes CO2 tolerance, autonomic tone, interoceptive precision, and the amount of background noise the mind has to solve before attention can settle.",
  "The serious claim is not that breath makes everyone mystical. The serious claim is that breathing can change the confidence level of the body’s predictions, and that shift can make awareness feel steadier, quieter, or more internally spacious.",
];

const sections = [
  {
    title: "The hook: breath is the control signal the body never stops reading",
    paragraphs: [
      "Most people think of breathing as a maintenance task. That is technically true and conceptually incomplete. Every breath also carries timing information that the brain uses to estimate arousal, safety, and readiness.",
      "When breathing becomes slower, smoother, or more deliberate, the autonomic system often follows. Heart rate variability can shift, threat monitoring can soften, and the subjective texture of awareness can become less jagged. This is not a miracle. It is a state transition.",
      "Because breath is so close to arousal, it is one of the cleanest levers for changing how consciousness feels without pretending to bypass biology.",
    ],
    callout: {
      label: "Big idea",
      text: "Respiration is not just air exchange. It is a timing signal that the nervous system uses to estimate state.",
    },
  },
  {
    title: "Why CO2 and cadence matter more than most people realize",
    paragraphs: [
      "The body does not only care about oxygen. It also cares about carbon dioxide, pH, and the pattern by which the system is being ventilated. That is why overbreathing can feel destabilizing and why slow, controlled breathing can feel like the floor got quieter.",
      "At a mechanistic level, respiration interacts with chemoreception, baroreflex dynamics, and the rhythms that help regulate alertness. When the cadence becomes predictable, the control system has less uncertainty to resolve.",
      "In plain language: the body relaxes a little because it can predict the next moment better. That reduction in uncertainty often shows up subjectively as calm, focus, or a less crowded inner field.",
    ],
    subheading: "Why advanced breath work is not just deep breathing",
    subparagraphs: [
      "Depth without control can be noisy.",
      "Cadence without tolerance can be forcing.",
      "The useful variable is not just how much air moves, but how the pattern changes the nervous system’s estimate of safety.",
    ],
  },
  {
    title: "Interoception is where the body becomes conscious",
    paragraphs: [
      "Interoception is the brain’s ability to sense the internal state of the body. It is part of how hunger, heartbeat, breath, tension, and visceral stability enter awareness at all.",
      "This matters because consciousness is not built on external input alone. The self is partly a model of what the body is doing right now, and respiration feeds directly into that model.",
      "When the breath becomes smoother, the body model often becomes less noisy. That can change the felt boundary between observer and observed, which is one reason breath practices can feel unexpectedly profound.",
    ],
    callout: {
      label: "Important distinction",
      text: "A stable interoceptive signal does not erase the self. It can make the self-model easier to coordinate.",
    },
  },
  {
    title: "Why breath can look spiritual even when the mechanism is mechanical",
    paragraphs: [
      "People often use spiritual language when breath work shifts their state because the experience is bigger than everyday narrative. That does not make the explanation less physical. It means the body produced a coherent state change with enough depth to matter.",
      "Slow breathing can reduce noise, narrow attentional scatter, and make internal sensations more legible. When that happens, the listener may feel as though something essential has opened. What actually opened may simply be the coordination loop.",
      "The body is not lying when it feels sacred. It is reporting that a lower-friction state has arrived.",
    ],
    subheading: "The risk of overselling the effect",
    subparagraphs: [
      "Breath work can help, but it is not a cure-all.",
      "If the environment is stressful, the practice is inconsistent, or the nervous system is already overloaded, the same cadence will not produce the same result.",
      "The method matters, but so does the context that receives it.",
    ],
  },
  {
    title: "What a grounded listener can actually expect",
    paragraphs: [
      "A good breath protocol may improve transitions: into meditation, into sleep, into a more stable session with audio entrainment, or out of a jittery work state. That alone is enough to justify the practice.",
      "It may also sharpen the felt contrast between internal noise and internal quiet. That contrast is useful because it gives you a more accurate map of your own baseline state.",
      "What it will not do is grant permanent calm on command. You are training a regulator, not installing a new personality.",
    ],
    subheading: "What changes first",
    subparagraphs: [
      "Attention usually steadies before insight appears.",
      "Arousal often drops before meaning arrives.",
      "The body tends to settle before the mind admits it has settled.",
    ],
  },
  {
    title: "How to use breath as part of a larger state stack",
    paragraphs: [
      "Treat breath as an access point, not the whole system. Combine it with a quiet room, a predictable audio session, low stimulation, and a brief period of post-session silence so the nervous system has time to consolidate the shift.",
      "Track the result. Note whether your pulse, muscle tone, or mental chatter changes. If the practice works, you should be able to see some pattern across repeated sessions, not just one dramatic evening.",
      "That is the difference between ritual and method. Ritual feels impressive. Method makes the mechanism legible.",
    ],
  },
];

const evidence = [
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "Useful because it keeps the overall state-change conversation honest: effects exist in some contexts, but the literature is not uniformly dramatic.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Frequency-following response effect according to gender using a 10-Hz binaural beat stimulation — PMC (2023)",
    note:
      "A measurable example of rhythmic input moving alpha activity, which makes it easier to understand why breath and audio can work together.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10200219/",
  },
  {
    title: "Analysis and Assessment of Gateway Process — U.S. Army/CIA memo (1983)",
    note:
      "A reminder that state-change practices were taken seriously enough to be modeled in systems language, even if the metaphysical claims remained unproven.",
    href: "https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf",
  },
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "Shows that specific stimulation patterns can alter the return of reflective awareness inside another state.",
    href: "https://www.nature.com/articles/nn.3719",
  },
  {
    title: "Linking out-of-body experience and self processing to mental own-body imagery at the temporoparietal junction — University of Bristol",
    note:
      "A useful reminder that self-location is constructed and can be perturbed by body-related neural systems.",
    href: "https://research-information.bris.ac.uk/en/publications/linking-out-of-body-experience-and-self-processing-to-mental-own-/",
  },
  {
    title: "STAR GATE [Controlled Remote Viewing] — Federation of American Scientists summary",
    note:
      "The program history matters because it shows how curiosity, institutional testing, and evidential discipline can coexist.",
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

export default function InteroceptiveBreathPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {interoceptiveBreathPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {interoceptiveBreathPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{interoceptiveBreathPost.category}</span>
            <span>{interoceptiveBreathPost.readTime}</span>
            <span>{new Date(interoceptiveBreathPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The body is not background. It is part of the computation
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
            A 10-minute breath calibration
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit upright and breathe slowly through the nose if that feels comfortable. Aim for a steady cadence that feels easy rather than theatrical. After 8 minutes, stop the practice and sit quietly for 2 minutes. Notice whether your attention feels less scattered, your body feels less urgent, or your state feels unchanged.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to settle before an audio session.</li>
            <li>• Your body feels keyed up and your mind will not downshift.</li>
            <li>• You need a simple repeatable method for measuring state changes.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the breath is small, but the control surface is enormous
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Breath work is worth taking seriously because it changes the body model from the inside out. It can smooth arousal, sharpen interoception, and make the mind easier to coordinate without pretending to override biology.
          </p>
          <p>
            That makes it an ideal companion to rhythmic audio, meditation, and other consciousness mechanics practices. The value is not that breath reveals hidden truth. The value is that it reduces state friction enough for the system to become legible.
          </p>
          <p>
            If the session works, you do not need to inflate it. You just need to notice that the nervous system became easier to inhabit.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
