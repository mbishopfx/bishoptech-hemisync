import Link from "next/link";
import { hypnagogiaStateTransitionPostMeta } from "@/lib/blog/posts-data";

export const hypnagogiaStateTransitionPost = hypnagogiaStateTransitionPostMeta;

const introParagraphs = [
  "Hypnagogia is not a decorative haze before sleep. It is a transition phase in which external precision begins to loosen and internally generated material gains leverage over perception, timing, and salience.",
  "That handoff matters because consciousness does not simply vanish at bedtime. It reorganizes. The brain downshifts some channels, preserves others, and lets fragments of imagery, speech, memory, and bodily sensation become more available than they were a minute earlier.",
  "If you want to understand lucid dreaming, dream incubation, or the state changes that make sleep onset feel strange and charged, hypnagogia is where the mechanics become visible. The border is the event.",
];

const sections = [
  {
    title: "The hook: the edge of sleep is an active control problem",
    paragraphs: [
      "People often treat hypnagogia as a moment of drift, but drift is already a control outcome. The brain is not falling apart. It is reducing the precision of some channels while keeping enough structure to avoid a full collapse into unconsciousness.",
      "That is why the border state feels so peculiar. The room can still be present, yet the internal world begins to thicken. Images appear with little ceremony. Words arrive partially formed. Time stops behaving like a clean line.",
      "The state is interesting because it reveals how consciousness changes before the story of change is available. By the time you can describe hypnagogia, the transition has already happened.",
    ],
    callout: {
      label: "Big idea",
      text: "Hypnagogia is not a failure of consciousness. It is a controlled redistribution of precision across waking and dreaming systems.",
    },
  },
  {
    title: "Thalamocortical gating decides which signals still deserve the floor",
    paragraphs: [
      "As sleep onset begins, sensory routing changes. The thalamus does not simply shut the world off. It adjusts how much priority different streams receive, which means some signals lose their grip while others become more obvious.",
      "That shift creates the classic hypnagogic profile: diminished external traction, rising imagery, and a more permissive relationship to associative material. The brain is still selecting. It is just selecting under a different set of rules.",
      "This is why the transition can feel like consciousness is thinning rather than disappearing. The gate is open in a different direction, and the internal model starts getting more bandwidth.",
    ],
    subheading: "Why the thalamus matters here",
    subparagraphs: [
      "It routes sensory gain.",
      "It helps define what is foreground and what is background.",
      "It makes the switch from wake to sleep a problem of precision, not a hard power cutoff.",
    ],
  },
  {
    title: "Sensory dropout is the condition that lets the brain show its own scaffolding",
    paragraphs: [
      "When external stimulation drops, the brain has less information to bind into a shared scene. That does not create a void. It exposes the machinery that usually stays hidden under the smoothness of ordinary perception.",
      "Tiny fragments begin to stand out: a visual patch, a line of inner speech, a bodily twitch, a remembered phrase, a sudden emotional tone. These fragments are not random decorations. They are pieces the system is already trying to assemble into a future dream or a partial narrative.",
      "This is one reason hypnagogia is so productive for observation. It shows how the mind builds coherence from incomplete material once the usual sensory discipline has loosened.",
    ],
    callout: {
      label: "Important distinction",
      text: "The hypnagogic field is not imagination without rules. It is imagination under reduced sensory constraint.",
    },
  },
  {
    title: "Microdreams reveal that the dream machine starts before sleep is complete",
    paragraphs: [
      "The classic mistake is to imagine that dreams begin only after some clean threshold has been crossed. In practice, dreamlike production often starts while waking fragments are still nearby.",
      "That is why hypnagogia can contain face fragments, scenic flashes, motion sensations, and half-phrases that disappear as soon as they are noticed. The brain is already rehearsing dream logic before the stage lights fully change.",
      "If you pay attention here, you can sometimes catch the exact moment a symbolic image appears to win against a mundane perception. That is not magic. It is a selection event.",
    ],
    subheading: "Why this matters for lucid dreaming",
    subparagraphs: [
      "The onset phase can train recognition.",
      "Recognition can become a cue for lucidity.",
      "The dream does not need to be fully underway before awareness can enter the loop.",
    ],
  },
  {
    title: "Memory and expectation fill the transition with material that already belongs to the system",
    paragraphs: [
      "Hypnagogia often pulls from recent tasks, unresolved concerns, emotional residue, and the sensory traces of the day. That is because the brain does not stop organizing meaning just because the body is preparing for sleep.",
      "The transition is fertile precisely because the system is no longer forced to keep every representation aligned with immediate external demands. Internal material can now compete more successfully for a place in awareness.",
      "In that sense, hypnagogia is a small demonstration of how the mind repurposes memory when the constraints of waking life loosen. It is not just falling asleep. It is reorganizing the terms under which images can be admitted.",
    ],
    callout: {
      label: "Practical warning",
      text: "Do not treat every vivid hypnagogic image as revelation. The state is useful, but it also amplifies pattern-making.",
    },
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "Use the last ten minutes before sleep as a recording window. Keep the room dim, reduce screens, and rest in a stable position. Notice the first internal event that becomes more vivid: a word, a color, a bodily sensation, a face, or a shift in time sense.",
      "Write down the sequence after the fact, not during it. The goal is not to force imagery. The goal is to map the order in which external input loses priority and internal generation takes over.",
      "If you repeat the process over several nights, you may notice reliable signatures. Some people get language first. Others get motion. Others get visual grids, auditory fragments, or a sense of sinking. That variability is the data.",
    ],
  },
];

const evidence = [
  {
    title: "Sleep onset and hypnagogic imagery — review article",
    note:
      "A broad overview of the phenomenology and neurophysiology of the transition into sleep and the imagery that can appear there.",
    href: "https://pubmed.ncbi.nlm.nih.gov/26744374/",
  },
  {
    title: "Thalamocortical mechanisms in sleep-wake transitions — PMC review",
    note:
      "Explains why gating and precision changes are central to the wake-to-sleep handoff.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5393427/",
  },
  {
    title: "Hypnagogia and visual imagery during sleep onset — research summary",
    note:
      "Useful for understanding why spontaneous imagery becomes more common as external precision decreases.",
    href: "https://pubmed.ncbi.nlm.nih.gov/25515332/",
  },
  {
    title: "Dream onset and microdreams — sleep science review",
    note:
      "Connects the early stages of dream production with the border state before full REM dreaming.",
    href: "https://pubmed.ncbi.nlm.nih.gov/33832258/",
  },
  {
    title: "Sleep onset, associative thinking, and creativity — PMC",
    note:
      "Shows why reduced external constraint can make internal associations easier to access.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9574995/",
  },
  {
    title: "The neuroscience of sleep onset imagery and transitions — review",
    note:
      "A broader frame for understanding why the border between waking and dreaming is cognitively rich.",
    href: "https://pubmed.ncbi.nlm.nih.gov/35616137/",
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

export default function HypnagogiaStateTransitionPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {hypnagogiaStateTransitionPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {hypnagogiaStateTransitionPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{hypnagogiaStateTransitionPost.category}</span>
            <span>{hypnagogiaStateTransitionPost.readTime}</span>
            <span>{new Date(hypnagogiaStateTransitionPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The border between wake and sleep is where state change becomes visible
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
            A 10-minute sleep onset capture
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Lie down in a dark room and keep one notebook nearby. Let the body settle without forcing sleep. Each time an image, phrase, or bodily shift appears, wait until the session ends and then write the first three things that changed: external attention, internal imagery, and time sense. Repeat for several nights and compare the sequence.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to study the entry into dream logic.</li>
            <li>• You are tracking the first signs of sensory dropout.</li>
            <li>• You want a repeatable way to observe the transition without forcing an outcome.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use if you are too sleep deprived to stay oriented or safe.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the transition is the lesson
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Hypnagogia is useful because it exposes the mechanics of a system that is normally hidden by continuity. The brain is not just entering sleep. It is renegotiating how much authority external signals, internal imagery, and memory fragments each receive.
          </p>
          <p>
            That renegotiation is why the state feels charged. It can produce beauty, confusion, insight, and noise all at once because the filter that usually keeps those streams separated is temporarily looser.
          </p>
          <p>
            If you study that border carefully, you learn something broader than sleep science. You learn that consciousness is not a fixed lamp. It is a moving configuration whose edges matter as much as its center.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
