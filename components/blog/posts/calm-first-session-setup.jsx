import Link from "next/link";
import { calmFirstSessionSetupPostMeta } from "@/lib/blog/posts-data";

export const calmFirstSessionSetupPost = calmFirstSessionSetupPostMeta;

const introParagraphs = [
  "The easiest way to help a first session feel trustworthy is to make it predictable. That means fewer moving parts, clearer instructions, and a setup that does not ask the listener to guess what happens next.",
  "Cognistration is built around calm audio sessions for focus, rest, and intentional reset. A good first session should feel like a simple routine, not a test.",
  "If the setup is easy to understand, the listening experience can stay where it belongs: quiet, intentional, and repeatable.",
];

const sections = [
  {
    title: "Why the first session should feel ordinary",
    paragraphs: [
      "A new listener does not need a complicated ritual. They need a clear path from curiosity to a comfortable session. The more the process feels like ordinary setup, the easier it is to trust.",
      "That is especially true for calm audio. People usually do better when they know the goal is simple: choose a session, make the environment comfortable, and notice how it feels without trying to force a result.",
      "For Cognistration, that means the first session should establish the rhythm of the product: simple, premium, and easy to return to.",
    ],
    callout: {
      label: "Big idea",
      text: "Trust grows faster when the first session has a clear shape.",
    },
  },
  {
    title: "What to prepare before you press play",
    paragraphs: [
      "Start with a quiet space that feels physically easy to stay in for a while. A stable seat, fewer interruptions, and a little extra time do more for the session than any complicated setup trick.",
      "Headphones are usually the cleanest way to listen. Keep the volume comfortable rather than loud. The goal is to settle in, not to impress yourself with how much you can tolerate.",
      "Then choose one intention for the session. Focus, rest, or a calmer evening is enough. The point is to give the listening session a direction without overloading it with expectations.",
    ],
    subheading: "Simple setup checklist",
    subparagraphs: [
      "Quiet room or low-distraction space.",
      "Headphones ready before you start.",
      "One intention, not five.",
      "Comfortable volume and enough time to settle.",
    ],
  },
  {
    title: "What trust looks like on the site",
    paragraphs: [
      "A trustworthy product does not hide the important pages. The tutorial, privacy, terms, and health warning pages exist so a listener can understand the product before they commit to a routine.",
      "That is a good sign. It means the site is willing to be explicit about what the experience is for, how it is framed, and where the boundaries are.",
      "Cognistration is positioned as entertainment and general wellness audio, not medical care. That framing matters because it keeps the expectations clear and the language grounded.",
    ],
    callout: {
      label: "Trust cue",
      text: "When the policy pages are visible and plain, the product feels easier to approach.",
    },
  },
  {
    title: "How to choose a session without overthinking it",
    paragraphs: [
      "A good first choice is the one that matches the moment. If you are trying to work, pick a focus-oriented session. If the day is winding down, choose something softer and slower.",
      "Do not optimize for novelty on the first pass. Pick the version that feels most likely to be repeatable. A routine that you can actually revisit is more valuable than one that only feels interesting once.",
      "If you are unsure, use the tutorial page first and keep the rest of the setup consistent. Small consistency makes it easier to tell what the session is doing.",
    ],
  },
  {
    title: "What the first 10 minutes are for",
    paragraphs: [
      "The first minutes are not for evaluating the whole product. They are for noticing whether the environment is comfortable, whether the volume feels right, and whether your attention can settle without strain.",
      "That makes the first session more observational than performative. You are learning the shape of the experience, not grading yourself for having the right reaction.",
      "If the session helps you settle a little more easily than the minute before, that is already useful. Repetition will tell you more than intensity.",
    ],
    subheading: "What to notice",
    subparagraphs: [
      "Does the room feel calm enough to stay in?",
      "Does the volume stay comfortable over time?",
      "Does the session feel easy to repeat?",
      "Do you understand what you would do differently next time?",
    ],
  },
  {
    title: "What not to optimize",
    paragraphs: [
      "Do not chase a dramatic reaction. Calm audio usually works best when the setup is modest and the expectation is steady. The product is not asking for spectacle.",
      "Do not change too many variables at once. If you switch the time of day, the room, the headphones, and the session type all at once, you lose the ability to learn anything from the result.",
      "Do not judge the experience by one minute. A routine becomes trustworthy when it can be repeated under similar conditions and still feel clear.",
    ],
  },
  {
    title: "Wrap-up: make the routine easy to return to",
    paragraphs: [
      "A calm first session is successful when it leaves the listener with a simple next step. That might be reading the tutorial, checking the privacy page, or repeating the same setup tomorrow.",
      "The best onboarding is quiet. It gives the person enough clarity to begin and enough confidence to come back.",
      "That is the standard this kind of product should meet: not spectacle, but a routine that feels calm, understandable, and worth repeating.",
    ],
  },
];

const resources = [
  {
    title: "Tutorial",
    note: "A calm setup guide for the core listening basics.",
    href: "/tutorial",
  },
  {
    title: "Privacy",
    note: "The public policy page that explains the site's privacy posture.",
    href: "/privacy",
  },
  {
    title: "Terms",
    note: "The current service framing, including general wellness language.",
    href: "/terms",
  },
  {
    title: "Pricing",
    note: "A simple view of the current plans and upgrade path.",
    href: "/pricing",
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

export default function CalmFirstSessionSetupPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {calmFirstSessionSetupPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {calmFirstSessionSetupPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{calmFirstSessionSetupPost.category}</span>
            <span>{calmFirstSessionSetupPost.readTime}</span>
            <span>{new Date(calmFirstSessionSetupPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          A good first session should feel easy to understand
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
            A 10-minute first-session checklist
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Choose one session, settle into a quiet space, keep the volume comfortable, and give yourself ten minutes without changing the setup. When it ends, write down whether the routine felt clear enough to repeat.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want a calmer start and fewer moving parts.</li>
            <li>• You want to understand the site before building a routine.</li>
            <li>• You prefer a simple first pass over a complicated experiment.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The real goal is a routine you can trust
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            If the first session helps you understand what to expect, the product has already done something valuable. Clarity is part of the experience.
          </p>
          <p>
            That is why the shortest path is usually the best one: read the tutorial, check the privacy and terms pages, choose one intention, and keep the setup consistent for the next session.
          </p>
          <p>
            Quiet onboarding is not a compromise. For a calm audio product, it is the point.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-cyan-500/10 to-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <div className="max-w-3xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-300">
            Next step
          </p>
          <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
            Start with the tutorial, then keep the setup simple.
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            If you want the calmest possible first pass, use the tutorial page as the reference point and the privacy page as the trust check. After that, repeat the same setup once before changing anything.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tutorial"
              className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-200 transition-colors hover:bg-cyan-500/15 hover:text-cyan-100"
            >
              Open Tutorial
            </Link>
            <Link
              href="/privacy"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Review Privacy
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
