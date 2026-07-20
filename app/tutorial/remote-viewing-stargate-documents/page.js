import Link from 'next/link';
import { ArrowRight, FileMagnifyingGlass, Files, Scales, SealWarning } from '@phosphor-icons/react/dist/ssr';
import { TutorialArticleShell } from '@/components/tutorial/TutorialArticleShell';

const title = 'Remote Viewing and the STAR GATE Documents';
const description = 'A primary-source guide to the U.S. government remote-viewing archive, its changing project names, the 1995 evaluation, and the difference between program history and proof.';
const canonical = 'https://cognistration.com/tutorial/remote-viewing-stargate-documents';
const mark = 'https://cognistration.com/images/cognistration-mark.png';

export const metadata = {
  title: { absolute: `${title} — Cognistration` },
  description,
  alternates: { canonical },
  openGraph: {
    title: `${title} — Cognistration`, description, siteName: 'Cognistration', type: 'website', url: canonical,
    images: [{ url: mark, width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: { card: 'summary_large_image', title: `${title} — Cognistration`, description, images: [mark] },
};

const ciaUrls = {
  collection: 'https://www.cia.gov/readingroom/collection/stargate',
  air: 'https://www.cia.gov/readingroom/docs/CIA-RDP96-00791R000200180006-4.pdf',
  management: 'https://www.cia.gov/readingroom/docs/CIA-RDP96-00791R000100150004-8.pdf',
  operational: 'https://www.cia.gov/readingroom/docs/CIA-RDP96-00791R000200300002-2.pdf',
  foia: 'https://www.cia.gov/readingroom/docs/DOC_0001299750.pdf',
};

const sources = [
  { title: 'CIA STAR GATE Collection', href: ciaUrls.collection, note: 'The CIA Reading Room entry point for the declassified archive.' },
  { title: 'An Evaluation of Remote Viewing: Research and Applications (1995 AIR evaluation)', href: ciaUrls.air, note: 'The review containing competing expert assessments and conclusions about research and intelligence use.' },
  { title: 'Proposed Management Strategy for STAR GATE', href: ciaUrls.management, note: 'A management record recommending termination and describing problems with vague or ambiguous output.' },
  { title: 'Evaluation of Remote Viewing Operational Tasking', href: ciaUrls.operational, note: 'A record useful for separating laboratory arguments from the practical value of intelligence tasking.' },
  { title: 'CIA FOIA Letter About the STAR GATE Collection (2006)', href: ciaUrls.foia, note: 'A CIA letter explaining STAR GATE as an archive umbrella for records associated with several project names.' },
];

const names = [
  { name: 'SCANATE', context: 'An early project label found in the historical record.' },
  { name: 'GRILL FLAME', context: 'A later Army-associated program name represented in the archive.' },
  { name: 'CENTER LANE', context: 'A subsequent name used for related Army activity.' },
  { name: 'SUN STREAK', context: 'Another successor label used before the final STAR GATE period.' },
  { name: 'STAR GATE', context: 'A later program name and, in the CIA Reading Room, an umbrella collection for related records.' },
];

export default function RemoteViewingStargateDocumentsPage() {
  const webPageJsonLd = {
    '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: canonical, description,
    isPartOf: { '@type': 'WebSite', name: 'Cognistration', url: 'https://cognistration.com' },
  };

  return (
    <TutorialArticleShell eyebrow="Primary-source history guide" title={title} description={description} canonical={canonical} sources={sources}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

      <section aria-labelledby="record-exists" className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Start with what is established</p>
          <h2 id="record-exists" className="mt-5 text-3xl font-light leading-tight tracking-[-0.03em] md:text-5xl">The program history is real. That does not settle the efficacy question.</h2>
        </div>
        <div className="space-y-6 text-base font-light leading-8 text-white/58">
          <p>U.S. intelligence agencies funded and evaluated remote-viewing research and operational trials. Declassified records document that history, including tasking, research reviews, management debates, and the program’s eventual evaluation.</p>
          <p>The existence and declassification of those records is not proof that remote viewing is paranormal, reliable, or operationally useful. Government interest proves that a subject was investigated; it does not by itself validate the proposed mechanism or the resulting claims.</p>
          <p>This guide treats STAR GATE as an archival subject. Cognistration does not claim to teach scientifically proven remote viewing, produce paranormal perception, or guarantee information about a distant target.</p>
        </div>
      </section>

      <section aria-labelledby="program-names" className="mt-24 border-t border-white/10 pt-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Why the names change</p>
        <h2 id="program-names" className="mt-5 max-w-4xl text-3xl font-light tracking-tight md:text-5xl">STAR GATE is both a program-era name and an archive umbrella.</h2>
        <p className="mt-6 max-w-3xl text-base font-light leading-8 text-white/55">The 2006 CIA FOIA letter describes the STAR GATE collection as records associated with a series of related efforts. That is why searches may surface several code names rather than one continuous label.</p>
        <dl className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {names.map(({ name, context }, index) => (
            <div key={name} className="grid gap-4 py-7 sm:grid-cols-[3rem_0.6fr_1.4fr]">
              <span className="font-mono text-xs text-white/25">0{index + 1}</span>
              <dt className="text-lg font-light text-white/90">{name}</dt>
              <dd className="text-sm leading-7 text-white/52">{context}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-7 max-w-3xl text-sm leading-7 text-white/45">A code name identifies an administrative or historical context. It is not an evidentiary rating, and a document’s presence under the umbrella does not mean the CIA endorsed every statement inside it.</p>
      </section>

      <section aria-labelledby="air-evaluation" className="mt-24 border-y border-white/10 bg-white/[0.025] px-6 py-12 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">The 1995 AIR evaluation</p>
        <h2 id="air-evaluation" className="mt-5 max-w-4xl text-3xl font-light tracking-tight md:text-4xl">Expert disagreement did not become proof of a paranormal mechanism.</h2>
        <div className="mt-8 grid gap-8 text-sm leading-7 text-white/55 md:grid-cols-2">
          <div>
            <Scales weight="thin" className="size-8 text-cyan-100/65" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-light text-white/85">Competing readings</h3>
            <p className="mt-4">The AIR materials record disagreement over how to interpret experimental statistics and methodology. One expert saw evidence beyond chance in laboratory results; another challenged the methods and whether the findings established the claimed phenomenon. Reading only one position hides the evaluation’s central dispute.</p>
          </div>
          <div>
            <SealWarning weight="thin" className="size-8 text-amber-100/65" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-light text-white/85">Operational conclusion</h3>
            <p className="mt-4">The evaluation did not establish paranormal causation or dependable intelligence value. Its operational assessment found the information too vague and ambiguous for actionable intelligence use. A statistical argument in a laboratory setting and usefulness to an analyst are separate questions.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="operations-management" className="mt-24 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Management and tasking records</p>
          <h2 id="operations-management" className="mt-5 text-3xl font-light tracking-tight md:text-4xl">Ask whether output could guide a real decision.</h2>
        </div>
        <div className="space-y-5 text-base font-light leading-8 text-white/55">
          <p>The proposed management strategy recommended terminating operations and research, describing reported output as vague or ambiguous. The operational-tasking evaluation likewise helps show why an interesting correspondence, a laboratory result, and useful intelligence are not equivalent.</p>
          <p>Fair reading means preserving both the arguments that interested evaluators and the documented problems with specificity, verification, and decision value. The archival record supports the conclusion that the work was funded and assessed; it does not support saying “the CIA proved remote viewing.”</p>
        </div>
      </section>

      <section aria-labelledby="read-primary-sources" className="mt-24 border-t border-white/10 pt-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Critical source reading</p>
        <h2 id="read-primary-sources" className="mt-5 max-w-3xl text-3xl font-light tracking-tight md:text-5xl">Evaluate the document before repeating the claim.</h2>
        <ol className="mt-12 grid gap-px bg-white/10 md:grid-cols-3">
          {[
            { icon: Files, title: 'Identify provenance', text: 'Record the agency, document identifier, date shown in the record, document type, and whether you are reading a report, memo, evaluation, attachment, or later FOIA correspondence.' },
            { icon: FileMagnifyingGlass, title: 'Read beyond the excerpt', text: 'Check the surrounding pages, definitions, task conditions, controls, missing data, stated limitations, and whether a quotation belongs to an author, reviewer, or source being summarized.' },
            { icon: Scales, title: 'Match claim to evidence', text: 'Separate program existence, experimental statistics, proposed explanations, replication, and operational usefulness. Evidence for one does not automatically establish the others.' },
          ].map(({ icon: Icon, title: itemTitle, text }, index) => (
            <li key={itemTitle} className="bg-[#080b0c] p-7 md:p-9">
              <span className="font-mono text-xs text-white/25">0{index + 1}</span>
              <Icon weight="thin" className="mt-8 size-8 text-cyan-100/65" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-light">{itemTitle}</h3>
              <p className="mt-4 text-sm leading-7 text-white/50">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="reflection-not-training" className="mt-24 border-t border-white/10 pt-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Optional reflection</p>
        <h2 id="reflection-not-training" className="mt-5 max-w-3xl text-3xl font-light tracking-tight md:text-4xl">Use the archive to practice source criticism, not remote-viewing technique.</h2>
        <div className="mt-8 grid gap-5 text-sm leading-7 text-white/55 md:grid-cols-2">
          <p className="border-l border-cyan-100/25 pl-5">What does this document directly establish about funding, administration, research, or use?</p>
          <p className="border-l border-cyan-100/25 pl-5">Which sentence is observation, which is interpretation, and which is a recommendation?</p>
          <p className="border-l border-cyan-100/25 pl-5">Does the evidence address laboratory performance, paranormal causation, or operational usefulness—and are those being conflated?</p>
          <p className="border-l border-cyan-100/25 pl-5">What conclusion remains justified after reading the limitations and competing assessment?</p>
        </div>
      </section>

      <nav aria-label="Continue learning" className="mt-24 border-t border-white/10 pt-16">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Continue learning</p>
        <div className="mt-7 flex flex-wrap gap-4">
          <Link href="/tutorial" className="inline-flex items-center gap-3 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#080b0c]">Tutorial hub <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/tutorial/astral-projection-out-of-body-experiences" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.16em] transition hover:border-cyan-100 hover:text-cyan-100">Experience and evidence <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/tutorial/meditation-self-exploration" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.16em] transition hover:border-cyan-100 hover:text-cyan-100">Grounded reflection <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </nav>
    </TutorialArticleShell>
  );
}
