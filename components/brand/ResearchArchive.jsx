const DOCUMENTS = [
  {
    id: 'RDP96-00788R001700210016-5',
    year: '1983',
    title: 'Analysis and Assessment of the Gateway Process',
    detail:
      'A 29-page technical assessment written for the United States Army and held in CIA records. It describes hemispheric synchronisation, frequency-following behaviour, and the use of differing signals in each ear.',
    href: 'https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf',
    kind: 'PDF'
  },
  {
    id: 'CREST 0005511478',
    year: 'Record',
    title: 'CIA Reading Room record',
    detail:
      'The catalogue entry for the Gateway assessment in the CIA declassification library — the record itself, unedited, with its release markings intact.',
    href: 'https://www.cia.gov/readingroom/document/0005511478',
    kind: 'Record'
  },
  {
    id: 'STARGATE',
    year: '1972–1995',
    title: 'The STARGATE collection',
    detail:
      'Twenty-three years of federally funded research into altered-state perception, released as a document collection after the programme closed.',
    href: 'https://www.cia.gov/readingroom/collection/stargate',
    kind: 'Collection'
  }
];

const CITATIONS = [
  {
    label: 'Frequency-following response',
    href: 'https://pubmed.ncbi.nlm.nih.gov/28123019/'
  },
  {
    label: 'Auditory steady-state response',
    href: 'https://pubmed.ncbi.nlm.nih.gov/15721080/'
  },
  {
    label: 'Systematic review of entrainment',
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10198548/'
  }
];

export function ResearchArchive() {
  return (
    <div>
      <div className="grid gap-px bg-white/10 md:grid-cols-3">
        {DOCUMENTS.map((doc, index) => (
          <a
            key={doc.id}
            href={doc.href}
            target="_blank"
            rel="noreferrer"
            className="group relative flex flex-col justify-between gap-8 bg-[#080c0b] px-6 py-8 transition hover:bg-[#0d1412] sm:px-7"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                <span>{String(index + 1).padStart(2, '0')} / {doc.kind}</span>
                <span>{doc.year}</span>
              </div>
              <h3 className="mt-6 text-[19px] font-medium leading-snug tracking-[-0.02em] text-white">
                {doc.title}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-white/65">{doc.detail}</p>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
              <span className="truncate">{doc.id}</span>
              <span className="shrink-0 text-[#b6ddcc] transition group-hover:translate-x-0.5">Open ↗</span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">Peer-reviewed context</span>
        {CITATIONS.map((citation) => (
          <a
            key={citation.href}
            href={citation.href}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] text-white/55 underline decoration-white/20 underline-offset-4 transition hover:text-white"
          >
            {citation.label}
          </a>
        ))}
      </div>
    </div>
  );
}
