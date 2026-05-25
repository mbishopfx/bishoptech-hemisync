import Link from "next/link";
import { salienceGatePostMeta } from "@/lib/blog/posts-data";

export const salienceGatePost = salienceGatePostMeta;

const introParagraphs = [
  "Sensory withdrawal does not create consciousness out of nothing. It removes competing input, which means the system has less external material to solve and more internal material to notice. That distinction is everything.",
  "When the noise floor drops, the brain’s own control signals get louder. Breathing, heartbeat, proprioception, intrusive thought, imagery, and memory fragments all become easier to hear. That is not automatically spiritual. It is a change in salience allocation.",
  "The reason this matters to HemiSync is simple: if sound can bias state, then sensory reduction can amplify the effect by stripping away the distractions that keep the system busy. The real question is how much of the experience comes from the audio and how much comes from the brain becoming more transparent to itself.",
];

const sections = [
  {
    title: "The hook: silence is not empty, it is unmasked",
    paragraphs: [
      "People often assume that a quiet room creates quiet awareness. In practice, the opposite can happen. Once the environment stops demanding attention, the nervous system starts presenting its own signals more clearly.",
      "That is why dark rooms, float tanks, low-stimulation environments, and rhythmic audio often overlap in advanced consciousness work. They all reduce external competition. Once competition drops, the brain can reallocate salience toward the body, the internal stream, and the model of self that is being maintained underneath the surface.",
      "The experience may feel intense precisely because it is no longer being diluted by the ordinary flood of objects, screens, and urgent tasks.",
    ],
    callout: {
      label: "Big idea",
      text: "Sensory reduction does not add signal. It lowers the threshold for the signal the brain was already making.",
    },
  },
  {
    title: "Why the salience network sits at the center of the problem",
    paragraphs: [
      "The salience network helps the brain decide what matters enough to interrupt ongoing processing. That makes it a gatekeeper between background noise and conscious priority. When that gate is wide open, the system can feel flooded. When it narrows, awareness can feel more coherent.",
      "This is one reason subtle practices sometimes feel stronger than dramatic ones. If you remove enough distraction, the nervous system does not have to keep defending the foreground from the background. The body becomes easier to notice. The inner narrative becomes easier to detect. The whole system becomes more legible.",
      "The important point is that salience is not truth. It is emphasis. The brain can make something feel important without making it accurate.",
    ],
    subheading: "Why advanced users should care",
    subparagraphs: [
      "If you want reliable state work, you need to know what is being amplified.",
      "A louder body signal can reveal a deeper pattern, or it can just reveal a tired nervous system.",
    ],
  },
  {
    title: "Why withdrawal can intensify interoception without making the self smaller",
    paragraphs: [
      "Interoception is often described like a soft background channel, but when external input is reduced it can move to the front of the stage. Heartbeat, gut tension, breath rhythm, muscle tone, and temperature drift all become more obvious.",
      "That can create the feeling that the self has gotten larger or more detailed. In reality, the self model is just receiving less interference. The system is not discovering a new soul. It is hearing the operating system more clearly.",
      "Once you understand that, the intensity makes sense. Sensory withdrawal can make ordinary bodily control loops feel almost ceremonial because they are usually buried under distraction.",
    ],
    callout: {
      label: "Important distinction",
      text: "More salient does not mean more real. It means more available to awareness.",
    },
  },
  {
    title: "Darkness, floatation, and rhythmic audio all target the same bottleneck",
    paragraphs: [
      "Different practices can look unrelated on the surface. A float tank, a dark retreat, a binaural session, and a breath protocol are not the same method. But they converge on the same bottleneck: reducing the number of competing predictions the brain has to maintain at once.",
      "When the bottleneck is cleared, consciousness often becomes simpler and stranger at the same time. Simpler because fewer inputs are fighting for dominance. Stranger because the brain starts generating more of the experience from within.",
      "That is the advanced insight. The mind is not waiting in silence for enlightenment to arrive. It is actively constructing whatever consciousness it can support under the new constraints.",
    ],
    subheading: "Why the bottleneck matters",
    subparagraphs: [
      "If input drops, internal modeling rises.",
      "If internal modeling rises, the felt boundary of self can shift.",
      "If the boundary shifts, the state may feel deeper without becoming more objective.",
    ],
  },
  {
    title: "What the literature lets us say without getting silly",
    paragraphs: [
      "The science of sensory gating, attention, and altered states supports a conservative conclusion: when external noise falls, internal processing becomes more noticeable and sometimes more coherent. That is useful, but it is not a supernatural shortcut.",
      "The mistake is to confuse intensity with revelation. A state can be vivid, emotionally charged, and deeply interesting without carrying any special metaphysical guarantee. The nervous system is capable of producing convincing experiences on its own.",
      "Still, that does not make sensory withdrawal trivial. It gives us one of the clearest tools for observing how the brain prioritizes reality when the outside world stops shouting.",
    ],
    callout: {
      label: "Practical translation",
      text: "Use sensory reduction to expose the nervous system’s priorities, not to force a spiritual conclusion.",
    },
  },
  {
    title: "How a disciplined practitioner should use low-input states",
    paragraphs: [
      "Keep the protocol simple. Reduce light, reduce noise, reduce task switching, and track whether the body becomes more noticeable before the mind becomes more coherent. That sequence tells you a lot about how your system works.",
      "If the state becomes too intense, back off. The goal is not deprivation for its own sake. The goal is to identify the conditions under which the brain can rest its attentional machinery without falling into confusion.",
      "That makes sensory withdrawal a precision instrument. It can reveal the architecture of salience, but only if you treat it like a measurement environment rather than a dare.",
    ],
  },
];

const evidence = [
  {
    title: "Analysis and Assessment of Gateway Process — U.S. Army/CIA memo (1983)",
    note:
      "A useful map of how serious analysts thought about altered states, hemispheric synchronization, and structured attention.",
    href: "https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf",
  },
  {
    title: "STAR GATE [Controlled Remote Viewing] — Federation of American Scientists summary",
    note:
      "Shows the difference between institutional curiosity and validated operational utility.",
    href: "https://irp.fas.org/program/collect/stargate.htm",
  },
  {
    title: "Binaural beats to entrain the brain? — PLOS ONE systematic review (2023)",
    note:
      "A mixed literature that still supports a real conversation about context, attention, and state bias.",
    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023",
  },
  {
    title: "Frequency-following response effect according to gender using a 10-Hz binaural beat stimulation — PMC (2023)",
    note:
      "Useful when thinking about how structured audio can move brain-state markers under controlled conditions.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10200219/",
  },
  {
    title: "Linking out-of-body experience and self processing to mental own-body imagery at the temporoparietal junction — University of Bristol",
    note:
      "A reminder that perspective and body ownership are constructed and can be perturbed in measured ways.",
    href: "https://research-information.bris.ac.uk/en/publications/linking-out-of-body-experience-and-self-processing-to-mental-own-/",
  },
  {
    title: "Induction of self awareness in dreams through frontal low current stimulation of gamma activity — Nature Neuroscience (2014)",
    note:
      "A clean example of a changed state allowing reflective awareness to appear inside a constrained environment.",
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

export default function SalienceGatePost() {
  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            HemiSync Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {salienceGatePost.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {salienceGatePost.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{salienceGatePost.category}</span>
            <span>{salienceGatePost.readTime}</span>
            <span>{new Date(salienceGatePost.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          The brain gets louder when the room gets quieter
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
            A 12-minute salience reset
          </h2>
          <p className="text-sm leading-relaxed text-white/50">
            Sit in a dim room and remove obvious distractions. If you use audio, keep it steady and low. Spend 8 minutes letting the external field shrink, then 4 minutes in silence noticing whether heartbeat, breath, or body tension has become more vivid. Record what rose first.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-xs leading-relaxed text-white/60">
          <p className="font-mono uppercase tracking-wider text-cyan-400">Use this session when:</p>
          <ul className="mt-3 space-y-2">
            <li>• You want to observe how the body becomes more noticeable under reduced input.</li>
            <li>• You want to pair sensory reduction with a rhythmic session.</li>
            <li>• You need a clean baseline for comparing internal noise across days.</li>
          </ul>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            Do not use while driving or operating anything expensive.
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Wrap-up: the salience gate explains why quiet can feel so intense
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            Sensory withdrawal is powerful because it changes what the brain has to prioritize. When the outside world stops dominating the channel, the body and the self-model become easier to inspect. That is a mechanical shift before it is a philosophical one.
          </p>
          <p>
            The best takeaway is not that silence reveals ultimate truth. The best takeaway is that the brain’s prioritization system is visible if you know how to reduce the noise around it. That makes low-input practice a serious tool, not a novelty.
          </p>
          <p>
            If the state becomes clearer, use that clarity carefully. Precision is more valuable than intensity, and coherence is more useful than drama.
          </p>
        </div>
        <div className="pt-4 text-xs font-mono uppercase tracking-wider border-t border-white/5 text-white/30">
          Want the archive? Visit the <Link className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-400/25 underline-offset-4" href="/blog">blog host page</Link> for the full list of posts.
        </div>
      </section>
    </article>
  );
}
