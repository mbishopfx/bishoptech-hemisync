import Link from "next/link";
import { calmEveningWindDownPostMeta } from "@/lib/blog/posts-data";

export const post = calmEveningWindDownPostMeta;

const introParagraphs = [
  "Evenings tend to collect leftover decisions. You finish work, check your phone, answer one last message, and then wonder why the day still feels open. A calm Cognistration session can help close that loop without asking for a big performance.",
  "The goal is not to force sleep or promise a perfect mood. The goal is to make the transition from an active day to a quieter evening feel more deliberate, more repeatable, and less crowded.",
  "A good wind-down routine stays small. If it needs a lot of explanation, it usually arrives too late in the day to be useful.",
];

const sections = [
  {
    title: "Mark the end of the workday",
    paragraphs: [
      "The first job of an evening routine is to make the handoff obvious. Put the phone down, dim the room a little, and choose the same place to sit if you can.",
      "That matters because the brain responds well to repeatable cues. When the setup stays familiar, the session starts feeling like a clear boundary instead of one more task competing for attention.",
      "You do not need ceremony. You need a signal that says the day is changing shape.",
    ],
    callout: {
      label: "End-of-day cue",
      text: "Pick one small action that always means work is over. The routine gets easier when the cue is simple enough to repeat on tired days.",
    },
  },
  {
    title: "Choose a softer session than you would use at midday",
    paragraphs: [
      "Evening is usually not the time for the most demanding option. A softer session often fits better because the day has already used up a lot of decision energy.",
      "When you are tired, the best experience is often the one that asks least of you. A calm track, a familiar length, and a quiet room can be enough to make the transition feel cleaner.",
      "Think of the session as a landing, not a test. If it helps the room feel less noisy and the next step feel more manageable, it is doing its job.",
    ],
    subheading: "A practical rule",
    subparagraphs: [
      "Use the shorter option when you want a low-friction close to the day.",
      "Use the softer option when you want less mental effort before the session begins.",
      "Keep the setup the same for a few evenings before you decide what actually helps.",
    ],
  },
  {
    title: "Leave a little silence after the session",
    paragraphs: [
      "A wind-down works better when you do not rush to fill the next minute. Give the experience a small amount of space so the shift has time to settle.",
      "That might mean sitting quietly for two minutes, writing one line about what changed, or simply leaving the room quieter than you found it.",
      "The point is to let the session end cleanly. If you immediately swap it for another source of input, the evening never fully changes pace.",
    ],
    callout: {
      label: "What to notice",
      text: "After a good session, the evening often feels less crowded. You may not feel dramatic change. You may just feel less pressure to keep deciding.",
    },
  },
  {
    title: "Repeat the same structure for a week",
    paragraphs: [
      "The routine becomes trustworthy when it survives repetition. One good evening does not prove much. Three or four similar evenings tell you more about whether the pattern is worth keeping.",
      "Consistency also makes the session easier to judge. If the room, length, and intention stay similar, you can tell whether the experience is actually helping or just feeling novel.",
      "That is usually the cleanest way to use Cognistration at the end of the day: keep the setup calm, keep the decision tree small, and return to the same shape tomorrow if it still feels right.",
    ],
  },
];

const resources = [
  {
    title: "Tutorial",
    note: "A calm setup guide for the basic listening flow.",
    href: "/tutorial",
  },
  {
    title: "Privacy",
    note: "See the public privacy posture and data boundaries.",
    href: "/privacy",
  },
  {
    title: "Pricing",
    note: "Review the current plans and upgrade path.",
    href: "/pricing",
  },
  {
    title: "Ten-Minute Reset",
    note: "A short guide if you want a simple daily reference session.",
    href: "/blog/quiet-ten-minute-reset",
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

function ResourceCard({ title, note, href }) {
  return (
    <Link
      className="group block rounded-2xl border border-white/5 bg-zinc-950/40 p-5 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.04]"
      href={href}
    >
      <h4 className="text-base font-light tracking-tight text-white group-hover:text-cyan-300 transition-colors leading-tight">
        {title}
      </h4>
      <p className="mt-4 text-xs leading-relaxed text-white/40">{note}</p>
    </Link>
  );
}

export default function CalmEveningWindDownPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {calmEveningWindDownPostMeta.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {calmEveningWindDownPostMeta.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{calmEveningWindDownPostMeta.category}</span>
            <span>{calmEveningWindDownPostMeta.readTime}</span>
            <span>{new Date(calmEveningWindDownPostMeta.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          An evening routine should lower friction, not add one more choice
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
          Useful pages to keep nearby
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {resources.map((item) => (
            <ResourceCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:grid-cols-[1.2fr_0.8fr] md:p-8">
        <div className="space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Try this
          </p>
          <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
            Use the same evening setup three times before you judge it
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Pick one session, keep the room and timing steady, and run the same shape on three similar evenings. If it keeps feeling clear and easy to return to, you have something worth keeping.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• The day feels noisy and you want a calmer close.</li>
            <li>• You need fewer decisions before the evening starts.</li>
            <li>• You want a repeatable routine you can trust tomorrow.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything that needs full attention.
          </p>
        </div>
      </section>
    </article>
  );
}
