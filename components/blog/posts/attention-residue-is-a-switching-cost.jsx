import Link from "next/link";
import { AttentionResidueIsASwitchingCostPostMeta } from "@/lib/blog/posts-data";

export const post = AttentionResidueIsASwitchingCostPostMeta;

const introParagraphs = [
  "You close the document, switch to a new tab, and start reading the brief for your next project. But a part of your mind is still lingering on the email you did not finish drafting. You are trying to move forward, but your focus feels thin, divided, and frustratingly out of reach.",
  "This is not a failure of discipline or a lack of willpower. It is a known cognitive phenomenon called attention residue. When you leave a task incomplete, the brain does not simply erase it from your working memory just because you opened a different window.",
  "Understanding the mechanics of attention residue changes how we approach productivity. Instead of treating the brain like a machine that can pivot instantly, we have to start building deliberate boundaries that give the nervous system permission to close the loop."
];
const sections = [
  {
    "title": "The architecture of an incomplete loop",
    "paragraphs": [
      "In 2009, business researcher Sophie Leroy identified that transitioning between tasks carries a hidden cognitive cost. She found that people rarely move from one project to the next with all of their attentional resources intact. A portion of their focus remains anchored to the previous, unfinished task.",
      "The brain is fundamentally predictive; it likes to resolve uncertainty. When a process is left hanging, the nervous system flags it as an open threat to future stability. It keeps the details active in the background, continuously rehearsing them so you do not forget where you left off.",
      "This background processing consumes working memory. You might be staring at a new spreadsheet, but your neural architecture is still quietly allocating resources to the unfinished conversation from an hour ago. The cognitive load does not disappear; it just goes underground.",
      "As a result, you arrive at your new priority operating at a deficit. Information processing slows down, decision-making becomes harder, and the effort required to stay on task spikes. The residue of the past task acts as friction in the present moment."
    ],
    "callout": {
      "label": "The Core Mechanism",
      "text": "Attention residue occurs because the predictive brain keeps unresolved tasks active in working memory, treating them as open priorities that need future attention."
    }
  },
  {
    "title": "Why closure requires more than just stopping",
    "paragraphs": [
      "We often treat task-switching as a simple mechanical action. We assume that clicking away, closing a laptop, or walking into a different room is enough to initiate a clean break. But the nervous system does not operate like a light switch.",
      "If the brain does not receive a clear, unambiguous signal that it is safe to let go of the previous context, it holds onto the tension of the unfinished loop. It requires evidence that the previous priority is no longer an immediate concern.",
      "This is why simply deciding to focus on something else rarely works. The transition itself has to be actively managed. Without a dedicated signal of closure, the boundary between tasks remains porous, and attention continues to leak across it."
    ],
    "subheading": "The illusion of the instant pivot",
    "subparagraphs": [
      "Many workflows assume that shifting attention is instantaneous.",
      "Without an active transition, the nervous system remains partially anchored to the previous context."
    ]
  },
  {
    "title": "The ready-to-resume protocol and cognitive offloading",
    "paragraphs": [
      "Mitigating attention residue requires a deliberate transition protocol. Leroy and her colleague Theresa Glomb found that one of the most effective ways to clear the cognitive buffer is to create a 'ready-to-resume' plan before switching tasks.",
      "By taking thirty seconds to write down exactly where you left off and what the next step will be, you are offloading the mental burden of remembering. You are giving the brain a secure external hard drive for the open loop.",
      "This behavioral cue provides the nervous system with a sense of cognitive closure. It recognizes that the unfinished work has been safely documented, allowing it to release the lingering priority and fully reallocate resources to the present moment.",
      "However, behavioral offloading is often only half of the equation. To truly downshift and recalibrate, the brain also relies on environmental and sensory cues to confirm that the state has actually changed and a new context has begun."
    ],
    "callout": {
      "label": "Research Insight",
      "text": "Documenting exactly where a task was paused provides the brain with cognitive closure, signaling that it is safe to release those working memory resources."
    }
  },
  {
    "title": "Establishing an acoustic boundary",
    "paragraphs": [
      "This is where a predictable audio environment becomes a critical tool for focus. Sound is one of the fastest and most primitive ways to signal a context shift to the nervous system, bypassing the slower, analytical parts of the brain.",
      "When you start a Cognistration session at the boundary of a new task, you are not just masking background office noise. You are providing a consistent, recognizable sensory cue that the previous state has ended and a new, protected state has begun.",
      "The brain quickly learns to associate this specific audio architecture with a clean break. Over time, the predictable acoustic environment reduces the friction required to pull your attention away from the lingering residue, helping you anchor firmly in the current task."
    ],
    "subheading": "Sound as a state transition",
    "subparagraphs": [
      "Predictable audio bypasses analytical processing to signal a direct context shift.",
      "Cognistration sessions provide the consistent, sensory evidence the brain needs to confirm that a new work state has begun."
    ]
  },
  {
    "title": "Reclaiming your capacity for deep work",
    "paragraphs": [
      "Protecting your work state is not about avoiding interruptions entirely, which is rarely possible in a modern workflow. It is about learning how to recover from them cleanly, without dragging the cognitive weight of the entire day with you.",
      "By acknowledging the reality of attention residue and using a consistent sensory anchor, you stop fighting your own cognitive architecture. You start giving the brain the transition signals it actually needs to let go.",
      "A calm, premium audio ritual gives you a dependable way to close the loop, clear the buffer, and arrive fully at whatever you need to do next. It turns the chaotic pivot into a steady, intentional choice."
    ],
    "callout": {
      "label": "Practical Takeaway",
      "text": "A reliable audio ritual turns a chaotic pivot into a steady, intentional choice, clearing the cognitive buffer for whatever comes next."
    }
  }
];
const evidence = [
  {
    "title": "Why is it so hard to do my work? The challenge of attention residue when switching between work tasks (Leroy, 2009)",
    "note": "The original organizational behavior study defining attention residue and demonstrating how unfinished tasks impair cognitive capacity on subsequent tasks.",
    "href": "https://doi.org/10.1016/j.obhdp.2009.04.002"
  },
  {
    "title": "Cognitive closure and the ready-to-resume plan (Leroy & Glomb, 2018)",
    "note": "Research showing that documenting where you left off helps the brain secure cognitive closure and release attention residue before transitioning to a new task.",
    "href": "https://doi.org/10.1287/orsc.2017.1164"
  },
  {
    "title": "The cost of interrupted work: more speed and stress (Mark, Gudith, & Klocke, 2008)",
    "note": "A foundational study on how task switching and constant interruptions increase cognitive load, frustration, and the effort required to refocus.",
    "href": "https://dl.acm.org/doi/10.1145/1357054.1357072"
  },
  {
    "title": "Memory for completed and incompleted tasks (Zeigarnik, 1927)",
    "note": "The underlying psychological principle that the brain remembers interrupted or incomplete tasks better than completed ones, driving the persistence of cognitive residue.",
    "href": "https://doi.org/10.1037/h0073238"
  },
  {
    "title": "Environmental context-dependent memory (Smith & Vela, 2001)",
    "note": "Research on how consistent background sensory cues, including audio, help the brain compartmentalize tasks and retrieve the appropriate cognitive state for specific contexts.",
    "href": "https://doi.org/10.1037/0033-2909.127.2.203"
  }
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

export default function AttentionResidueIsASwitchingCostPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {post.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{post.category}</span>
            <span>{post.readTime}</span>
            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          A calm reset starts before the first sentence
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
          Evidence and references
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {evidence.map((item) => (
            <EvidenceCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-7 backdrop-blur-3xl md:p-8">
        <p className="text-sm leading-relaxed text-cyan-50/90">
          If you want a steadier routine, explore the rest of the archive or start with a simple plan on the pricing page.
        </p>
        <div className="mt-5">
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-cyan-100 transition-all hover:bg-cyan-400/20 hover:text-white"
            href="/pricing"
          >
            See plans
          </Link>
        </div>
      </section>
    </article>
  );
}
