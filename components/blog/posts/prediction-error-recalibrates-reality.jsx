import Link from "next/link";
import { predictionErrorRecalibratesRealityPostMeta } from "@/lib/blog/posts-data";

export const predictionErrorRecalibratesRealityPost =
  predictionErrorRecalibratesRealityPostMeta;

const introParagraphs = [
  "Prediction error is the cleanest way to understand why a conscious state changes. The nervous system keeps comparing what it expected with what actually arrived, and when the gap gets large enough, the system has to revise its confidence landscape.",
  "That revision is not abstract. It alters attention, body feel, salience, and the sense that the present is either stable or unsettled. In other words, a prediction failure is not just a cognitive event. It is a state event.",
  "This is why consciousness mechanics keeps circling the same machinery: predictive coding, precision weighting, thalamocortical routing, rhythm, and sensory gain. The model is simple to say and difficult to inhabit. The brain is always trying to decide what deserves to count as reality right now.",
];

const sections = [
  {
    title: "The hook: the model fails before the story changes",
    paragraphs: [
      "People like to imagine that awareness shifts after interpretation. In practice, the underlying model usually changes first. The nervous system notices that a prediction is no longer earning its keep, and only then does the conscious story reorganize around the mismatch.",
      "That is why a tiny error can feel huge. If the system has been relying on a stable expectation, then a small deviation can trigger a disproportionate recalibration. The result can feel like clarity, anxiety, absorption, or a strange new stillness, depending on the wider state.",
      "The important point is not that prediction error is mysterious. The point is that it is the mechanism by which the brain decides whether to keep the current frame or open a new one.",
    ],
    callout: {
      label: "Big idea",
      text: "A conscious transition often begins as a confidence failure, not as a new insight.",
    },
  },
  {
    title: "Predictive coding turns perception into a negotiation",
    paragraphs: [
      "Predictive coding gives the brain a very practical job description. It tries to minimize surprise by continuously forecasting incoming data and updating the model when reality refuses to cooperate. That is not a metaphor. It is a working description of perception as inference.",
      "In that framework, sensation is not the whole event. Sensation is the evidence stream, while the model is the machine trying to explain it. Consciousness lives at the interface between those two systems, where top-down expectation and bottom-up evidence keep renegotiating the terms.",
      "This is why a state can feel coherent or fragmented without the raw sensory world changing much at all. The interpretation stack has changed, and the feeling of reality changed with it.",
    ],
    subheading: "Why precision matters more than raw input",
    subparagraphs: [
      "Prediction error becomes influential only when the system trusts it.",
      "Precision weighting decides whether the error gets ignored, amplified, or used.",
      "Consciousness is shaped by that decision more than by loudness alone.",
    ],
  },
  {
    title: "The thalamus helps decide which error deserves the system’s attention",
    paragraphs: [
      "The thalamus matters because it does more than forward signals. It participates in routing, gain control, and state-dependent selection. That means some errors can be promoted into conscious relevance while others remain background noise.",
      "This is where a lot of state change becomes legible. When sensory gain drops, the system may become less reactive to external noise and more open to internally generated material. When gain rises, the same input can feel invasive and impossible to ignore.",
      "The thalamus does not create truth. It helps regulate which discrepancies get enough precision to alter the current model of the world.",
    ],
    callout: {
      label: "Important distinction",
      text: "The gate does not decide what is true. It decides what gets enough weight to matter.",
    },
  },
  {
    title: "Rhythm matters because timing is where prediction becomes visible",
    paragraphs: [
      "Rhythmic input is interesting because it gives the nervous system a clean temporal scaffold. If a beat is steady enough, the system can lock onto timing, compare prediction with arrival, and reduce ambiguity in how it samples the world.",
      "That is the sober version of why binaural beats, isochronic tones, and slow respiratory cadence can influence state. They are not belief machines. They are timing tools, and timing tools can change how much error the system experiences as relevant.",
      "If the rhythm does not land, the effect should be modest or absent. If it does land, the user may feel a more coherent transition because the model has less work to do in the moment.",
    ],
    subheading: "Why delivery method changes the result",
    subparagraphs: [
      "Stereo separation changes what the ear-brain system computes.",
      "Attention changes how much precision the signal receives.",
      "Context changes whether the same rhythm feels calming, mechanical, or irrelevant.",
    ],
  },
  {
    title: "Dreaming shows what happens when the prediction engine runs with different rules",
    paragraphs: [
      "Dreams are not random neural static. They are structured simulations operating under a different precision regime. External evidence is muted, internal generation is promoted, and the model is allowed to explore states that waking cognition usually suppresses.",
      "That is why hypnagogia and lucid dreaming are so valuable for consciousness research. They reveal that the brain can maintain a coherent world while loosening the usual grip of external sensory correction.",
      "Once you see that, the line between altered state and ordinary perception looks less like a wall and more like a recalibration threshold.",
    ],
    callout: {
      label: "Practical warning",
      text: "A vivid state is not automatically a better model. Sometimes it is only a model with looser error correction.",
    },
  },
  {
    title: "What disciplined practice actually looks like",
    paragraphs: [
      "Treat each session like a prediction experiment. Keep the input stable, record the first mismatch you notice, and write down whether the shift shows up first as body sensation, attention change, or emotional tone.",
      "Repeat the same setup several times before deciding what it does. The nervous system can be noisy on a single pass and highly informative across a pattern of sessions.",
      "The goal is not to collect impressive experiences. The goal is to learn how your system revises its model when prediction fails and how quickly that revision becomes conscious.",
    ],
  },
];

const evidence = [
  {
    title: "Predictive coding in the brain: a review of theory and evidence",
    note:
      "A strong entry point for understanding perception as inference rather than passive reception.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=predictive+coding+brain+review",
  },
  {
    title: "Precision weighting and active inference — review",
    note:
      "Useful for seeing how confidence assignment changes which signals become conscious relevant.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=precision+weighting+active+inference+review",
  },
  {
    title: "Thalamocortical loops and conscious access — review",
    note:
      "A practical bridge between routing, gain control, and state-dependent awareness.",
    href: "https://pubmed.ncbi.nlm.nih.gov/?term=thalamocortical+loops+conscious+access+review",
  },
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "A useful caution that rhythm can nudge state without becoming a universal mechanism.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Frequency-following response effect according to gender using a 10-Hz binaural beat stimulation — PMC (2023)",
    note:
      "A measurable example of rhythm moving alpha power without requiring mystical claims.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10200219/",
  },
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "A concrete reminder that state parameters can alter reflective awareness during sleep.",
    href: "https://www.nature.com/articles/nn.3719",
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

export default function PredictionErrorRecalibratesRealityPost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {predictionErrorRecalibratesRealityPost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {predictionErrorRecalibratesRealityPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{predictionErrorRecalibratesRealityPost.category}</span>
            <span>{predictionErrorRecalibratesRealityPost.readTime}</span>
            <span>{new Date(predictionErrorRecalibratesRealityPost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The model fails before the story changes
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
            A grounded 12-minute prediction reset
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Put on headphones and play a steady, low-drama rhythmic session at a comfortable volume. Spend four minutes noticing the first mismatch between expectation and sensation, four minutes tracking whether the body feels more certain or more ambiguous, and four minutes in silence writing the first three prediction failures you noticed. Do not interpret them yet. Just document the order.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to study model change rather than chase a peak.</li>
            <li>• Attention feels sticky and you need a cleaner error signal.</li>
            <li>• You want a repeatable practice that stays grounded in mechanism.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: prediction error is the engine of transition
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Consciousness looks less like a fixed lamp and more like an ongoing negotiation between what the brain expected and what the world returned. The more forcefully that gap is weighted, the more likely the system is to reorganize its state.
          </p>
          <p>
            That is why prediction error deserves attention in any serious model of altered state. It explains why the same stimulus can feel ordinary in one context and deeply reorganizing in another. The difference is not just the input. It is the confidence architecture holding the input together.
          </p>
          <p>
            If you want to work with state changes seriously, stop chasing the language of miracle and start tracking the mechanics of mismatch. The nervous system is always updating. The question is whether you are observant enough to notice the update before it becomes a story.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
