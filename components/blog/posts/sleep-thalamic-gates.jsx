import Link from "next/link";
import { sleepGatePostMeta } from "@/lib/blog/posts-data";

export const sleepGatePost = sleepGatePostMeta;

const sections = [
  {
    title: "The hook: sleep is not a shutdown state",
    paragraphs: [
      "Sleep is often described like the brain has gone offline. That is a useful metaphor for people who need to be left alone at 2 a.m., but it is not a good description of what is actually happening. The brain is not off. It is reorganizing.",
      "During REM, the system behaves like a control room with fewer outside inputs and more internal signal. Dreams are not random wallpaper. They are the mind working with a different constraint set.",
      "That is why sleep matters so much in a consciousness blog. It is one of the cleanest places to see that awareness is state-dependent. Change the gate, and the experience changes with it.",
    ],
    callout: {
      label: "Big idea",
      text: "Sleep shows that consciousness is not a fixed beam of light. It is a stack of settings that can be rearranged.",
    },
  },
  {
    title: "REM is what happens when the senses are partially unplugged",
    paragraphs: [
      "In REM, the brain is not receiving the full weight of ordinary sensory correction. That matters because consciousness usually depends on a constant negotiation between prediction and evidence.",
      "Remove some of the evidence, and the model starts to use internal material more heavily. That is part of why dreams feel vivid, strange, and emotionally persuasive. The system is still generating reality; it is just doing it with a different feed.",
      "The thalamus is central here because it helps route sensory traffic. When the gate changes, the character of awareness changes with it.",
    ],
    subheading: "Why the gate matters",
    subparagraphs: [
      "If waking life is a high-bandwidth correction loop, REM is a lower-bandwidth sandbox. Less correction means more room for the system to remix memory, emotion, and expectation.",
      "That remix is not sloppy. It is adaptive. The brain is stress-testing its models without the ordinary external penalties.",
    ],
  },
  {
    title: "Lucidity is what happens when executive awareness re-enters the dream",
    paragraphs: [
      "Lucid dreaming is one of the clearest examples we have of a state boundary getting crossed in real time. The dream continues, but the reflective part of the mind notices that it is dreaming.",
      "That split is important. It means consciousness is not all-or-nothing. Different systems can come online at different times, and the result is a hybrid state: one part experiences, another part observes.",
      "That is why the 2014 gamma stimulation study matters. It suggests that timing and frequency can influence whether the observer function returns while the dream is still running.",
    ],
    callout: {
      label: "Important distinction",
      text: "Lucidity is not the same thing as total control. It is the moment the observing system wakes up inside the dream system.",
    },
  },
  {
    title: "The thalamocortical loop is the hidden machinery behind the vibe",
    paragraphs: [
      "A lot of people talk about dreams as if they happen in some mystical side room. The more grounded view is better: thalamocortical loops, cortical feedback, and state-specific gating produce the experience we call dreaming.",
      "When the loop is tuned one way, the world feels external and stable. When it is tuned another way, the world feels internally generated and symbolically elastic. Same brain. Different gate.",
      "That is why sleep research is so useful for the consciousness conversation. It gives us a place to watch the gate change without needing to invent extra metaphysics first.",
    ],
    subheading: "What the loop teaches",
    subparagraphs: [
      "The loop teaches that self, world, and sensation are assembled outputs, not timeless facts.",
      "If those outputs can change during sleep, then they can also change during waking life under the right conditions.",
    ],
  },
  {
    title: "Out-of-body style shifts are a body-map problem as much as a dream problem",
    paragraphs: [
      "The brain's model of where 'I' am located is not a single object. It is a dynamic construction. That is why OBE-like experiences are so revealing: they show that self-location can be decoupled from the physical body map.",
      "This does not require supernatural explanations to be fascinating. It means the sense of being here is built from neural systems that can be perturbed, and sleep is one of the states where the perturbation becomes easier to notice.",
      "In lucid dreams, that self-location can become a moving target. In deeper sleep, the target may dissolve almost completely and return as a dream body or a floating observer.",
    ],
  },
  {
    title: "Why sleep feels spiritual even when the mechanism is biological",
    paragraphs: [
      "People often reach for spiritual language when they wake from a deep dream because the experience is larger than ordinary narrative. That does not mean the experience is fake. It means the nervous system produced something with enough coherence to feel meaningful.",
      "The biological explanation does not cancel the mystery. It just gives the mystery a mechanism. That is a better deal.",
      "Sleep is a nightly demonstration that consciousness can reorganize itself, redistribute control, and come back looking like a slightly different person.",
    ],
    callout: {
      label: "Practical takeaway",
      text: "If you want to understand consciousness, do not only study waking focus. Study the states where the gate changes and the self starts getting rebuilt.",
    },
  },
  {
    title: "How to work with sleep like a serious practitioner",
    paragraphs: [
      "The most useful work is still boring. Keep the same bedtime. Cut light late at night. Reduce stimulation. Track dream recall. Notice how your body feels when you wake from REM-rich periods.",
      "If you want to explore lucidity, do it methodically. Write dreams down. Wake back to bed. Use gentle intention rather than force. Treat the state like a lab, not a circus.",
      "The reason this matters is simple: if sleep can alter the model of self, then good sleep hygiene is not just health advice. It is consciousness engineering.",
    ],
  },
];

const evidence = [
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "A clean demonstration that stimulation, sleep state, and lucid awareness can interact in measurable ways.",
    href: "https://www.nature.com/articles/nn.3719",
  },
  {
    title: "Linking out-of-body experience and self processing to mental own-body imagery at the temporoparietal junction — University of Bristol",
    note:
      "Shows how self-location and perspective can be perturbed by neural systems tied to body imagery.",
    href: "https://research-information.bris.ac.uk/en/publications/linking-out-of-body-experience-and-self-processing-to-mental-own-/",
  },
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "Useful backdrop for the general state-change conversation: rhythm can matter, but results are context dependent.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Frequency-following response effect according to gender using a 10-Hz binaural beat stimulation — PMC (2023)",
    note:
      "A reminder that measurable brain-state shifts can follow rhythmic auditory input under the right conditions.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10200219/",
  },
  {
    title: "Analysis of a historical altered-state memo (1983)",
    note:
      "The memo's real value is the seriousness of its altered-state framing, not any claim of proof.",
    href: "https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf",
  },
  {
    title: "STAR GATE [Controlled Remote Viewing] — Federation of American Scientists summary",
    note:
      "A sober institutional reminder that curiosity, auditability, and evidence quality all matter.",
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

export default function SleepGatePost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {sleepGatePost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {sleepGatePost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{sleepGatePost.category}</span>
            <span>{sleepGatePost.readTime}</span>
            <span>{new Date(sleepGatePost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Sleep is the cleanest state lab we have
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            We spend a third of our lives inside a state that looks like surrender from the outside and like deep reorganization from the inside. That makes sleep one of the best laboratories for consciousness research.
          </p>
          <p>
            In waking life, the brain constantly checks the external world against its model. In sleep, that loop changes. The gate moves. The rules loosen. The system starts recycling memory, emotion, and body maps into new experiences.
          </p>
          <p>
            The weird part is not that dreams happen. The weird part is how coherent they can feel while the entire sensory basis of that coherence has been partially removed.
          </p>
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
            A lucid-friendly sleep runway
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            For one week, keep the last hour before bed low light, low noise, and low stimulation. Wake up once during the night if your schedule allows, write down any dream fragments, then return to sleep with a single intention: notice whether you are dreaming. Keep the experiment gentle.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to improve dream recall.</li>
            <li>• You want to test whether state changes follow routine changes.</li>
            <li>• You want a serious practice instead of a dramatic claim.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: sleep is not a mystery box, it is a state machine
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            The point of sleep research is not to strip wonder out of experience. It is to show that the wonder has structure. REM, lucidity, body maps, and altered self-location are all clues that the brain can reconfigure the self when the gate changes.
          </p>
          <p>
            If you want to understand consciousness, do not only look at the bright and deliberate moments. Look at the nightly system resets. That is where the machine reveals how it builds the human experience in the first place.
          </p>
          <p>
            The mystery survives. The mechanism becomes more legible. That is the kind of mystery worth keeping.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
