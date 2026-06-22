import Link from "next/link";
import { whyCognistrationFeelsPrivatePostMeta } from "@/lib/blog/posts-data";

export const whyCognistrationFeelsPrivatePost = whyCognistrationFeelsPrivatePostMeta;

const introParagraphs = [
  "Cognistration should feel private in the ordinary, everyday sense of the word. Not hidden. Not confusing. Just calm, contained, and clear about what happens when you use it.",
  "That feeling matters because trust is not only a policy page. Trust is also the shape of the interface, the tone of the writing, the number of decisions a person has to make, and whether the experience feels like it respects their attention.",
  "When a product is built for focus, rest, and reset, the first job is to make the environment feel safe enough to settle into. That is the design standard this post is about.",
];

const sections = [
  {
    title: "Privacy starts before the session begins",
    paragraphs: [
      "A lot of apps treat privacy like a legal footer. Cognistration treats it more like a product principle. That means the experience should be understandable before the listener commits to a session, and the public pages should make the framing explicit.",
      "If a person can tell what the product is for, what kind of experience it offers, and where the boundaries are, they do not have to spend energy guessing. Less guessing makes the whole thing feel more private, because the user stays in control.",
      "The result is simple: the product feels like a quiet tool rather than a noisy platform.",
    ],
    callout: {
      label: "Trust cue",
      text: "People relax faster when they can understand the product before they hear the first tone.",
    },
  },
  {
    title: "A calm interface is a privacy feature",
    paragraphs: [
      "Too many products ask for attention they do not need. That can make even a good experience feel invasive. Cognistration should do the opposite. It should move gently, use plain language, and keep the number of visible choices low enough that the listener can focus on the actual session.",
      "This is not just aesthetics. It is a privacy posture. When the interface is calm, the user is less likely to feel observed, rushed, or manipulated.",
      "In practice that means clear labels, predictable session flow, and no performance around how serious the experience is supposed to feel.",
    ],
    subheading: "What calm looks like",
    subparagraphs: [
      "Short, plain instructions.",
      "Visible policy and support pages.",
      "No clutter competing with the session itself.",
      "A layout that lets the user settle before the audio starts.",
    ],
  },
  {
    title: "What the app is for, and what it is not",
    paragraphs: [
      "Cognistration is for focus, rest, and intentional reset. That is the lane. It is not pretending to be a cure-all, and it should never read like a product that needs exaggeration to justify itself.",
      "That boundary is good for users. It keeps the promise honest. A private-feeling product does not overreach, because overreach is one of the fastest ways to make people feel like their attention is being harvested instead of respected.",
      "So the most trustworthy version of the product is also the simplest: a calm tool with clear use cases and a steady tone.",
    ],
    callout: {
      label: "Boundary",
      text: "Clarity about purpose is part of what makes the experience feel safe.",
    },
  },
  {
    title: "Why simple setup matters for trust",
    paragraphs: [
      "A first session should not feel like onboarding to a complicated platform. It should feel like a routine you can understand in a minute and repeat tomorrow without relearning it.",
      "That is why setup, tutorial content, and the core policy pages should all point in the same direction. The listener should not have to reconcile three different voices just to begin.",
      "When setup is simple, the product stops asking for cognitive effort and starts feeling like a stable place to return to.",
    ],
    subheading: "The practical test",
    subparagraphs: [
      "Could someone understand the flow in one read-through?",
      "Do the pages answer the obvious questions up front?",
      "Does the first session feel repeatable instead of performative?",
    ],
  },
  {
    title: "Why descriptive content helps the product",
    paragraphs: [
      "Good blog posts do more than attract search traffic. They explain the product in a voice that feels true to the product. A descriptive article can make the brand feel more grounded because it gives the reader a clean way to understand the experience before they sign up.",
      "That is especially useful for a product like Cognistration, where the value is in the feel of the routine as much as the features behind it. If the content is calm, specific, and useful, it reinforces the product itself.",
      "In other words, the blog should not just talk about Cognistration. It should behave like Cognistration: clear, calm, and trustworthy.",
    ],
  },
  {
    title: "Wrap-up: privacy is part of the promise",
    paragraphs: [
      "The best way to make Cognistration feel private is to make the whole experience coherent. The language should match the product. The product should match the promise. And the promise should be easy to understand without having to decode anything.",
      "That is what trust-first design looks like in practice. It is not dramatic. It is not loud. It is simply reliable.",
      "When the next post is written in that same voice, the site gets easier to believe in and easier to return to.",
    ],
  },
];

const resources = [
  {
    title: "Privacy",
    note: "Read the public privacy posture and data handling boundaries.",
    href: "/privacy",
  },
  {
    title: "Tutorial",
    note: "A simple setup page for getting started without friction.",
    href: "/tutorial",
  },
  {
    title: "Terms",
    note: "The current service framing and usage boundaries.",
    href: "/terms",
  },
  {
    title: "Calm First Session",
    note: "A practical guide for a predictable first listen.",
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

export default function WhyCognistrationFeelsPrivatePost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {whyCognistrationFeelsPrivatePostMeta.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {whyCognistrationFeelsPrivatePostMeta.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{whyCognistrationFeelsPrivatePostMeta.category}</span>
            <span>{whyCognistrationFeelsPrivatePostMeta.readTime}</span>
            <span>{new Date(whyCognistrationFeelsPrivatePostMeta.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Privacy is not just policy. It is product shape.
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
          Pages that reinforce the trust story
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
            A simple test for whether the product feels private
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Ask yourself whether the site answers the obvious questions before
            it asks you to do anything: what it is, what it is for, what the
            rules are, and where to read more if you want to be sure.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/50">
          <p>
            If the answer is yes, the product already feels more trustworthy.
            If the answer is no, the interface still has work to do.
          </p>
          <p className="mt-4">
            Cognistration should pass that test with ease.
          </p>
        </div>
      </section>
    </article>
  );
}
