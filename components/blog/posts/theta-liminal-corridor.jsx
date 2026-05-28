import Link from "next/link";
import { thetaLiminalCorridorPostMeta } from "@/lib/blog/posts-data";

export const thetaLiminalCorridorPost = thetaLiminalCorridorPostMeta;

const introParagraphs = [
  "Theta is one of those words that gets used too loosely. In serious neuroscience, it is not a mystical frequency badge and it is not a magic doorway. It is a timing regime associated with memory coordination, navigation, meditative drift, and the thin zone where waking cognition starts to loosen its grip.",
  "That makes theta useful to anyone studying consciousness mechanics because it gives us a clean boundary problem. When the rhythm of the system changes, the content of awareness often changes with it. Not always dramatically. Not always in a way that looks good on a chart. But often enough to show that the state itself is doing real work.",
  "The advanced question is not whether theta makes people transcend matter. The advanced question is whether theta helps the brain reduce competition between predictive models, memory fragments, and body-based orientation long enough for a different kind of awareness to stabilize.",
];

const sections = [
  {
    title: "The hook: theta is the corridor, not the destination",
    paragraphs: [
      "Theta sits in a strange place in the consciousness stack. It appears in drowsiness, focused inward attention, memory replay, meditative absorption, and the edge of dream onset. That overlap is the clue. Theta is less a state than a corridor that different states pass through.",
      "When the brain starts moving through that corridor, the usual hard edges of self and world can soften. The outside world is not gone, but its influence is reduced. Internal signal gains leverage. That is why the transition can feel like sliding from a bright office into a dim archive room where the files are still there, just easier to shuffle.",
      "If that sounds poetic, fine. It is still a mechanism. Rhythm changes the cost of maintaining a model, and the model changes the feel of being conscious.",
    ],
    callout: {
      label: "Big idea",
      text: "Theta is best understood as a transition band that reduces friction between waking control and dreamlike recombination.",
    },
  },
  {
    title: "Why theta matters to memory, navigation, and self-model stability",
    paragraphs: [
      "A lot of theta research comes from the hippocampal system, where timing helps bind memory, sequence, and context. That matters because consciousness is not just raw sensation. It is sensation organized into a story about where you are, what happened, and what should happen next.",
      "When theta coupling is strong and well-timed, the brain can integrate distributed information more efficiently. When it is weak or chaotic, the system can feel noisy, fragmented, or cognitively expensive. The subjective result may be restlessness, mental clutter, or difficulty entering a stable inward focus.",
      "This is why advanced practitioners pay attention to the difference between mere relaxation and actual state reorganization. Relaxation can be a byproduct. Reorganization is the point.",
    ],
    subheading: "Why the hippocampus matters here",
    subparagraphs: [
      "The hippocampus is not a memory filing cabinet. It is part of a live sequencing system that helps the brain decide what belongs together.",
      "That sequencing role makes theta especially interesting because consciousness is partly a sequencing problem.",
    ],
  },
  {
    title: "Hypnagogia is theta’s most revealing neighborhood",
    paragraphs: [
      "Hypnagogia is the border zone before sleep where fragments, images, words, body sensations, and half-formed narratives start arriving without the full editorial discipline of waking cognition. People often describe it as strange because the system is generating material before it can fully police it.",
      "That is exactly why the state is useful. It exposes the raw feed. When theta rises and the system begins to loosen its external grip, the mind becomes more willing to remix memory, expectation, and bodily sensation into composite impressions.",
      "Nothing supernatural is required. The brain is simply becoming less defensive about internal material and more permissive about transitional forms of awareness.",
    ],
    callout: {
      label: "Important distinction",
      text: "Hypnagogia is not proof of hidden dimensions. It is proof that the brain can generate rich experience while external certainty is fading.",
    },
  },
  {
    title: "Why theta and meditation are related but not identical",
    paragraphs: [
      "Meditation is a practice. Theta is a timing regime. They overlap, but they are not interchangeable. A person can sit still and remain mentally noisy. Another person can enter theta-like drift during fatigue, prayer, or absorption without any formal practice at all.",
      "What links them is not ideology. It is a reduction in competing control signals. If the system gets quieter enough, theta can become more likely. If theta appears, attention may become easier to sustain inwardly. That feedback loop is part of why the state can feel so clean when it works.",
      "The best way to think about it is as a reversible coupling between rhythmic stability and attentional narrowing.",
    ],
    subheading: "Why advanced users should care",
    subparagraphs: [
      "If you want reliable state entry, you need to know which part of the stack you are actually changing.",
      "A quiet body does not guarantee theta. A theta-like state does not guarantee insight. The variables interact, but they are not the same variable.",
    ],
  },
  {
    title: "The literature suggests bias, not a permanent upgrade",
    paragraphs: [
      "The sober reading of the data is not glamorous. Theta-related phenomena show up in sleep research, memory research, meditation studies, and altered-state work, but the results are context-sensitive and often messy. That is not a flaw in the concept. That is how living systems behave.",
      "When people overclaim theta, they usually turn a transitional timing pattern into a supernatural achievement. That move should be resisted. A useful rhythm can still be a useful rhythm even if it never becomes a permanent badge of spiritual status.",
      "The real claim is narrower and stronger: theta can help the brain move into a mode where internal recombination, imagery, and reduced external grip become more likely.",
    ],
    callout: {
      label: "Practical translation",
      text: "Theta does not give you truth. It changes the conditions under which truth, memory, and imagination get sorted.",
    },
  },
  {
    title: "How a disciplined listener should work with theta",
    paragraphs: [
      "Do not chase theta as if it were a prize. Treat it as a state boundary you can approach with consistency. Keep the room dim, the volume conservative, and the session long enough for the nervous system to stop negotiating every second.",
      "Track what happens before and after. If theta work matters, it should show up as a repeatable shift in transition quality, dream vividness, or the ability to stay present while the mind goes inward. If it does nothing, that is also data.",
      "The advanced move is not intensity. It is precision. Make the corridor easier to notice, and the system will tell you what it can do.",
    ],
  },
];

const evidence = [
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "A useful reminder that rhythmic and state-dependent stimulation can alter whether reflective awareness reappears inside REM.",
    href: "https://www.nature.com/articles/nn.3719",
  },
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "Mixed results, which is exactly why the conversation should stay grounded in context rather than in frequency mythology.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Frequency-following response effect according to gender using a 10-Hz binaural beat stimulation — PMC (2023)",
    note:
      "A concrete example of a rhythmic auditory input moving alpha activity under laboratory conditions.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10200219/",
  },
  {
    title: "Analysis and Assessment of Gateway Process — U.S. Army/CIA memo (1983)",
    note:
      "Important because it treats altered states as a systems problem and not as a cartoon mystery.",
    href: "https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf",
  },
  {
    title: "Linking out-of-body experience and self processing to mental own-body imagery at the temporoparietal junction — University of Bristol",
    note:
      "Shows that self-location and perspective are built features that can be experimentally perturbed.",
    href: "https://research-information.bris.ac.uk/en/publications/linking-out-of-body-experience-and-self-processing-to-mental-own-/",
  },
  {
    title: "STAR GATE [Controlled Remote Viewing] — Federation of American Scientists summary",
    note:
      "A reminder that institutional curiosity is not the same as validation, but it still tells us what questions were worth asking.",
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

export default function ThetaLiminalCorridorPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            NeuroSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {thetaLiminalCorridorPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {thetaLiminalCorridorPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{thetaLiminalCorridorPost.category}</span>
            <span>{thetaLiminalCorridorPost.readTime}</span>
            <span>{new Date(thetaLiminalCorridorPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The brain is always negotiating thresholds
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
            A 14-minute theta descent
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Use headphones, keep the room dim, and play a steady session at a comfortable volume. Let the first 10 minutes be passive. Then spend 4 minutes in silence and write down whether imagery, body drift, or internal speech became more prominent. Do not chase visions. Track transitions.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to explore the edge of sleep without fully surrendering to it.</li>
            <li>• You want a cleaner transition into journaling or meditation.</li>
            <li>• You need a repeatable way to observe your own threshold dynamics.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: theta is useful because it reveals the mechanics of transition
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Theta is not a magic frequency and it is not a promise. It is a timing regime that becomes interesting when you care about how the nervous system moves between control and drift. That movement is where consciousness starts to show its seams.
          </p>
          <p>
            The value of the theta corridor is practical. It helps explain why memory, imagery, attention, and body orientation can loosen at the same time. Once that happens, the mind becomes easier to study and easier to train.
          </p>
          <p>
            So the serious stance is simple: follow the transitions, respect the context, and let the evidence decide how much mystery survives.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
