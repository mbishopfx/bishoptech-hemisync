import Link from "next/link";
import { memoryReconsolidationPostMeta } from "@/lib/blog/posts-data";

export const memoryReconsolidationPost = memoryReconsolidationPostMeta;

const introParagraphs = [
  "Memory is often described as storage, but storage is the wrong metaphor for a living nervous system. Retrieval does not simply open a file. It reconstructs a model, and every reconstruction is vulnerable to revision.",
  "That matters in consciousness mechanics because altered states are not just experiences. They are contexts. When attention, arousal, and sensory weighting change, the system can retrieve the same event under different rules and then write a different version back down.",
  "The serious claim is not that memory is false. The serious claim is that memory is dynamic enough to be edited by state, prediction error, and timing. That makes it powerful, fragile, and useful all at once.",
];

const sections = [
  {
    title: "The hook: memory is compiled, not archived",
    paragraphs: [
      "A hard drive stores data. A brain stores patterns that have to be reassembled each time they are used. That distinction matters because the act of remembering is already an act of construction.",
      "Once a memory is reactivated, it is not locked in place. It becomes plastic for a period of time, which means the system can update associations, emotional tone, and contextual details before the trace stabilizes again.",
      "If consciousness is partly a prediction engine, memory is one of the training datasets that engine keeps rewriting. The past is not only recalled. It is reprocessed.",
    ],
    callout: {
      label: "Big idea",
      text: "Retrieval can turn storage into editing.",
    },
  },
  {
    title: "Why prediction error opens the file",
    paragraphs: [
      "The brain does not reopen memory for fun. It tends to reopen it when incoming evidence deviates enough from expectation. That mismatch, or prediction error, is the signal that says the current model may need revision.",
      "This is where consciousness and memory meet. When the world fails to match the expected script, attention sharpens, salience rises, and the system becomes more willing to update the internal model.",
      "In practice, that means surprise is not just an emotion. It is a computational event with editing rights.",
    ],
    subheading: "Why advanced users should care",
    subparagraphs: [
      "No prediction error, no compelling reason to revise.",
      "Too much prediction error, and the system may destabilize instead of updating.",
    ],
  },
  {
    title: "Reconsolidation is a write window, not a metaphor",
    paragraphs: [
      "The reconsolidation literature is interesting because it gives the old memory theory a mechanism. Once reactivated, a trace can become labile and then restabilize. That makes memory less like a snapshot and more like a repeatedly saved project file.",
      "This is also why emotionally charged memories can change under the right conditions. The state of the system at retrieval matters. So does the presence of new information. So does whether the body feels safe enough to let the update happen.",
      "The key point is mechanical, not poetic: reactivation changes the state of the trace, and state changes create a window for modification.",
    ],
    callout: {
      label: "Important distinction",
      text: "A labile memory is not erased. It is temporarily editable.",
    },
  },
  {
    title: "Why state changes can alter what gets written back",
    paragraphs: [
      "If the nervous system is calmer, the memory may be reprocessed with less threat weighting. If the system is more aroused, the same event may be stored with a stronger defensive frame. The facts can remain similar while the felt meaning shifts.",
      "That is one reason breath, sensory reduction, and rhythmic audio are not trivial accessories. They alter the background conditions in which retrieval happens. Change the context, and you change the quality of the write window.",
      "This does not mean any state is equally good for editing. It means the editing process is sensitive to arousal, attention, and the amount of uncertainty the organism can tolerate without turning defensive.",
    ],
    subheading: "Why the context matters",
    subparagraphs: [
      "A stable state can support clearer recall.",
      "A noisy state can amplify distortions.",
      "A good protocol controls the context before it trusts the memory.",
    ],
  },
  {
    title: "Sleep and dream logic expose the same mechanism",
    paragraphs: [
      "Sleep is a privileged environment for memory reorganization because external demands drop and internal replay becomes more available. The brain is not sitting idle. It is sorting, stabilizing, and reweighting traces.",
      "Dreams can make this process visible because they combine memory fragments with current concerns and altered self-modeling. The result is not a clean replay. It is a synthesis engine at work.",
      "That is one reason advanced consciousness practice keeps returning to sleep, hypnagogia, and dream recall. These states show how memory and identity can be recombined under different control rules.",
    ],
    callout: {
      label: "Practical translation",
      text: "If state changes can alter dream structure, they can also alter how memories are contextualized.",
    },
  },
  {
    title: "What a disciplined practitioner can actually test",
    paragraphs: [
      "The practical approach is not to chase perfect recall or dramatic catharsis. It is to build a repeatable environment for reactivation: low distraction, steady timing, and a clear post-session journal.",
      "Then compare what changed. Did the emotional tone shift? Did the sequence of events become cleaner? Did the memory feel less fused to the body? Those are meaningful questions because they reveal whether the system is writing back a different version.",
      "This is where biohacking becomes serious. You are not trying to erase the past. You are learning how the nervous system decides what the past means the next time it is summoned.",
    ],
  },
];

const evidence = [
  {
    title: "Memory reconsolidation literature — PubMed search",
    note:
      "A direct entry point for reviews and primary papers on lability, restabilization, and update windows.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=memory+reconsolidation+review",
  },
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "Useful for thinking about how rhythmic input can change the state in which memory is reactivated.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Sleep and memory consolidation literature — PubMed search",
    note:
      "A useful portal into the broad evidence base linking sleep states with stabilization and reorganization of traces.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=sleep+memory+consolidation+review",
  },
  {
    title: "Analysis of a historical altered-state memo (1983)",
    note:
      "A reminder that altered states were framed as a systems problem long before the current wave of biohacking language.",
    href: "https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf",
  },
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "Dream awareness is a useful example of a state in which reflective access and memory content can coexist under altered rules.",
    href: "https://www.nature.com/articles/nn.3719",
  },
  {
    title: "Frequency-following response effect according to gender using a 10-Hz binaural beat stimulation — PMC (2023)",
    note:
      "Helpful because it shows that rhythmic stimulation can alter measurable state markers before interpretation gets involved.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10200219/",
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

export default function MemoryReconsolidationPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {memoryReconsolidationPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {memoryReconsolidationPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{memoryReconsolidationPost.category}</span>
            <span>{memoryReconsolidationPost.readTime}</span>
            <span>{new Date(memoryReconsolidationPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Memory is compiled, not archived
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
            A 15-minute memory reconsolidation check
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Select one emotionally loaded memory and write a few factual bullets about it before the session. Then spend 8 minutes in a quiet rhythmic protocol and 7 minutes in silence. Afterward, write the memory again and compare tone, sequence, and body sensation instead of looking only for exact wording.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to observe whether state changes alter emotional tone.</li>
            <li>• You are tracking whether recall becomes more coherent after a reset.</li>
            <li>• You need a repeatable protocol for comparing memory before and after state work.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the self is partly the history of its edits
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Memory matters because it is one of the places where consciousness becomes durable. What you remember is not only information. It is also the scaffolding that tells the self who it has been.
          </p>
          <p>
            If reconsolidation is real, then a state change is never just a state change. It can also be an opportunity to rewrite the tone, structure, and salience of what gets carried forward.
          </p>
          <p>
            That is the practical invitation here. Use the mechanism carefully, track the result honestly, and treat the nervous system like a system that can be trained without being bullied into compliance.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
