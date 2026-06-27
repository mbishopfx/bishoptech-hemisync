import Link from "next/link";
import { quietTenMinuteResetPostMeta } from "@/lib/blog/posts-data";

export const quietTenMinuteResetPost = quietTenMinuteResetPostMeta;

const introParagraphs = [
  "A short reset works best when the shape is obvious. If you only have ten minutes, the session should feel easy to begin, easy to repeat, and easy to understand after it ends.",
  "That is the point of this guide: make a calm Cognistration session practical enough for a busy day without turning it into a performance.",
  "Cognistration is built for focus, rest, and intentional reset. A short session is not there to force a dramatic reaction. It is there to give the day a cleaner edge so the next choice feels more usable.",
];

const sections = [
  {
    title: "Why a ten-minute reset earns its place",
    paragraphs: [
      "A short session only matters if it fits into real life. On a busy day, that usually means a between-meetings gap, a quiet moment after a commute, or the small window before evening work starts to spill everywhere.",
      "The value is not in making the experience bigger. The value is in making it repeatable. When a routine can be used without negotiation, it becomes easier to trust.",
      "That is why the best reset is often the smallest one that still changes the tone of the next hour.",
    ],
    callout: {
      label: "Trust cue",
      text: "A useful reset is one you can do again tomorrow without having to relearn it.",
    },
  },
  {
    title: "Set the room once before you press play",
    paragraphs: [
      "Keep the setup simple. Quiet the notifications, get your headphones ready, and choose a seat that does not ask your body to keep adjusting itself every thirty seconds.",
      "You do not need a ritual with many steps. You need a room that lets the session hold your attention without competing with it.",
      "If you want the result to be easier to compare from one day to the next, keep the setup consistent. Small consistency makes the experience easier to learn from.",
    ],
    subheading: "Small setup checklist",
    subparagraphs: [
      "Headphones ready before you start.",
      "Phone on silent or out of reach.",
      "One intention for the session.",
      "Comfortable volume, not loud volume.",
    ],
  },
  {
    title: "A simple ten-minute flow",
    paragraphs: [
      "Use the first couple of minutes to settle in. Sit down, let the audio begin, and stop trying to decide whether anything is happening yet. The job at the start is just to arrive.",
      "In the middle of the session, let attention widen a little. You are not trying to control the experience. You are just noticing whether the session makes it easier to stay with one thing at a time.",
      "By the end, give yourself a clean transition out of the session. The point is to leave with a steadier next step, not to keep the experience hanging in the air all afternoon.",
    ],
    subheading: "Minute-by-minute shape",
    subparagraphs: [
      "Minutes 0-2: get comfortable and start the session.",
      "Minutes 2-5: let the sound do the work without checking it constantly.",
      "Minutes 5-8: notice breath, posture, and attention without steering hard.",
      "Minutes 8-10: decide what the next practical step is.",
    ],
  },
  {
    title: "What not to optimize",
    paragraphs: [
      "Do not chase a dramatic change. Calm audio usually works best when the expectation is modest and the environment is steady.",
      "Do not change every variable at once. If you switch the time, the room, the headphones, and the session type all together, you lose the ability to tell what helped.",
      "Do not judge the whole routine by one pass. A short reset becomes trustworthy when it can be repeated under similar conditions.",
    ],
    callout: {
      label: "Good rule",
      text: "Repeatability matters more than intensity when the goal is a steadier day.",
    },
  },
  {
    title: "When this kind of session is useful",
    paragraphs: [
      "A short reset fits best when the day is starting to feel noisy, but you still need to function well. It can be a bridge between work blocks, a transition after travel, or a quiet way to move from alertness into evening.",
      "It is also useful when you want to keep the routine small. If the larger session feels like too much to start, the ten-minute version keeps the habit alive without asking for a bigger commitment.",
      "That makes the session less like a one-off event and more like a practical tool you can keep in reach.",
    ],
  },
  {
    title: "Wrap-up: keep the routine easy to return to",
    paragraphs: [
      "The best short reset does not need to prove anything. It only needs to be clear, calm, and easy to repeat.",
      "If the session helped the day settle even a little, that is enough to make it worth keeping. The next time, use the same setup and learn what changes when you remove friction.",
      "That is the quiet strength of a well-made routine: it becomes easier to trust because it stays simple enough to use when life is not.",
    ],
  },
];

const resources = [
  {
    title: "Tutorial",
    note: "A simple setup guide for the core listening basics.",
    href: "/tutorial",
  },
  {
    title: "Privacy",
    note: "The public policy page that explains the site's privacy posture.",
    href: "/privacy",
  },
  {
    title: "Pricing",
    note: "A clear look at the current plans and upgrade path.",
    href: "/pricing",
  },
  {
    title: "Calm First Session",
    note: "A related guide for people who want a predictable first listen.",
    href: "/blog/calm-first-session-setup",
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

export default function QuietTenMinuteResetPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {quietTenMinuteResetPostMeta.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {quietTenMinuteResetPostMeta.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{quietTenMinuteResetPostMeta.category}</span>
            <span>{quietTenMinuteResetPostMeta.readTime}</span>
            <span>{new Date(quietTenMinuteResetPostMeta.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Keep the reset small enough to use on an ordinary day
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
          Keep the useful pages nearby
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
            Make the next run feel like a repeat, not a reset from scratch
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Choose the same time of day, the same seat, and the same volume range for three sessions in a row. Keep the structure identical and note what changes in your ability to settle. That is usually a better signal than chasing novelty.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You only have a short window between tasks.</li>
            <li>• The day feels noisy and you want a calmer next step.</li>
            <li>• You need a routine that is easy to repeat tomorrow.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Not medical advice. Designed for focus, rest, and routine support.
          </p>
        </div>
      </section>
    </article>
  );
}
