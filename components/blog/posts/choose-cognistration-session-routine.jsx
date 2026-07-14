import Link from "next/link";
import { chooseCognistrationSessionRoutinePostMeta } from "@/lib/blog/posts-data";

export const post = chooseCognistrationSessionRoutinePostMeta;

const introParagraphs = [
  "A session fits your routine when it lowers the effort required to begin and leaves you with a clear next step afterward.",
  "The best choice is usually not the most dramatic one. It is the one you can repeat without having to renegotiate the whole day.",
  "That is the standard Cognistration should meet: calm, premium, and easy to return to when the day gets busy.",
];

const sections = [
  {
    title: "Start with repeatability, not intensity",
    paragraphs: [
      "A useful session does not need to feel impressive. It needs to feel usable twice, then three times, then next week.",
      "If a session seems interesting but creates a lot of setup friction, it may be a poor fit for a regular routine. A quieter option that begins cleanly often works better over time because the decision cost stays low.",
      "That matters because routines are built from repetition. The easier the first step is to repeat, the more likely the habit will survive a busy schedule.",
    ],
    callout: {
      label: "Simple test",
      text: "If you can picture yourself using it again tomorrow without extra planning, that is a strong sign it fits.",
    },
  },
  {
    title: "Let the time of day do some of the work",
    paragraphs: [
      "A session can fit one part of the day better than another. A steady, low-friction option may be best for a morning start, while a softer session may make more sense at the end of the day.",
      "The point is not to over-optimize. It is to match the session to the kind of transition you need. If you want to start, choose something that feels clear and focused. If you want to unwind, choose something that asks less of your attention.",
      "When the session matches the moment, the experience feels less like a task and more like a support structure.",
    ],
    subheading: "A practical matching rule",
    subparagraphs: [
      "Use a focused option when you need a clean start.",
      "Use a calmer option when you need a softer landing.",
      "Use the same general setup so the result stays comparable.",
    ],
  },
  {
    title: "Pay attention to the first minute",
    paragraphs: [
      "The first minute tells you a lot. If the setup feels confusing, if you keep checking instructions, or if you have to make too many decisions before the session starts, the fit may be weaker than it looked on paper.",
      "A good match should feel easy to enter. It should not demand a lot of explanation to become useful.",
      "That is one reason Cognistration should keep its public pages plain and its session flow calm. When the product is easy to understand, the routine is easier to maintain.",
    ],
    callout: {
      label: "What to notice",
      text: "A strong fit often feels ordinary right away. You do not have to convince yourself to keep going.",
    },
  },
  {
    title: "Use three sessions before you decide",
    paragraphs: [
      "One listen is not enough to judge a routine. The first pass can be affected by curiosity, distraction, or the simple fact that you are still learning the shape of the experience.",
      "Try the same session three times under roughly similar conditions. If it still feels clear, usable, and worth returning to, that is a better signal than a single reaction.",
      "This is the kind of judgment that works well for calm audio: not a dramatic verdict, but a steady read on whether the routine stays sensible after the novelty fades.",
    ],
  },
  {
    title: "Know what a bad fit looks like",
    paragraphs: [
      "A weak fit usually shows up as repeated negotiation. If you keep changing the time, the room, the volume, and the session type because the routine never quite lands, the friction may be coming from the choice itself.",
      "That does not mean the product is wrong. It may mean a different session is a better match for the moment.",
      "A good workflow gives you a smaller decision tree next time. If the routine leaves you clearer about what to use tomorrow, it is helping.",
    ],
    subheading: "Signs the session may be too much",
    subparagraphs: [
      "You need a lot of setup to get started.",
      "You feel tempted to change the session every time.",
      "You cannot tell what part of the routine is doing the work.",
      "You would not choose it again without reading the instructions twice.",
    ],
  },
  {
    title: "Wrap-up: choose the version you can return to",
    paragraphs: [
      "The best session for your routine is the one that makes the next use feel easier, not harder. It should be clear enough to understand, calm enough to repeat, and flexible enough to fit an ordinary day.",
      "If the experience lowers friction, respects your attention, and helps you come back without rethinking everything, it is doing its job.",
      "That is the simplest way to think about Cognistration: choose the session that you are most willing to use again.",
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
    title: "Pricing",
    note: "Review the current plans and upgrade path.",
    href: "/pricing",
  },
  {
    title: "Privacy",
    note: "See the public privacy posture and data boundaries.",
    href: "/privacy",
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

export default function ChooseCognistrationSessionRoutinePost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {chooseCognistrationSessionRoutinePostMeta.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {chooseCognistrationSessionRoutinePostMeta.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{chooseCognistrationSessionRoutinePostMeta.category}</span>
            <span>{chooseCognistrationSessionRoutinePostMeta.readTime}</span>
            <span>{new Date(chooseCognistrationSessionRoutinePostMeta.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          A good fit lowers friction before the session even starts
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
            A three-session rule for deciding whether it fits
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Choose one session, keep the setup steady, and use it three times under similar conditions. If it keeps feeling clear, repeatable, and easy to begin, it is probably a good fit for your routine.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want a calm default you can use again tomorrow.</li>
            <li>• You want fewer decisions before you begin.</li>
            <li>• You prefer repeatability over novelty.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything that needs full attention.
          </p>
        </div>
      </section>
    </article>
  );
}
