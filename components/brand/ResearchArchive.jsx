const DOCUMENTS = [
  {
    id: 'RDP96-00788R001700210016-5',
    year: '1983',
    title: 'Analysis and Assessment of the Gateway Process',
    detail:
      'A 29-page technical assessment written for the United States Army and held in CIA records. It describes hemispheric synchronisation, frequency-following behaviour, and the use of differing signals in each ear.',
    href: 'https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf',
    kind: 'PDF',
    meta: '29 pages'
  },
  {
    id: 'CREST 0005511478',
    year: 'Record',
    title: 'CIA Reading Room record',
    detail:
      'The catalogue entry for the Gateway assessment in the CIA declassification library — the record itself, unedited, with its release markings intact.',
    href: 'https://www.cia.gov/readingroom/document/0005511478',
    kind: 'Record',
    meta: 'Release markings intact'
  },
  {
    id: 'STARGATE',
    year: '1972–1995',
    title: 'The STARGATE collection',
    detail:
      'Twenty-three years of federally funded research into altered-state perception, released as a document collection after the programme closed.',
    href: 'https://www.cia.gov/readingroom/collection/stargate',
    kind: 'Collection',
    meta: '23 years of funding'
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
      {/* Ledger header — the archive reads as a record list, not a marketing grid. */}
      <div className="hidden grid-cols-[8.5rem_1fr_9rem] items-center gap-6 border-b border-white/15 pb-3 font-mono text-[9px] uppercase tracking-[0.26em] text-white/40 md:grid">
        <span>Released</span>
        <span>Document</span>
        <span className="text-right">Source</span>
      </div>

      <div className="border-t border-white/10 md:border-t-0">
        {DOCUMENTS.map((doc, index) => (
          <a
            key={doc.id}
            href={doc.href}
            target="_blank"
            rel="noreferrer"
            className="group relative grid grid-cols-1 gap-3 border-b border-white/10 px-1 py-7 transition-colors hover:bg-white/[0.025] md:grid-cols-[8.5rem_1fr_9rem] md:items-start md:gap-6 md:px-2"
          >
            {/* Accent rail on hover — a hairline, not a block */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-px bg-transparent transition-colors group-hover:bg-[#b6ddcc]/70"
            />

            <div className="flex items-baseline gap-3 md:block">
              <span className="font-mono text-[11px] tabular-nums text-[#b6ddcc]/80">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-[13px] tabular-nums tracking-tight text-white/85 md:mt-1 md:block">
                {doc.year}
              </span>
            </div>

            <div className="md:pl-1">
              <h3 className="text-[18px] font-medium leading-snug tracking-[-0.02em] text-white transition-colors group-hover:text-[#d8efe5]">
                {doc.title}
              </h3>
              <p className="mt-2 max-w-[52ch] text-[13.5px] leading-relaxed text-white/55">{doc.detail}</p>
            </div>

            <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{doc.meta}</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#b6ddcc] transition group-hover:translate-x-0.5">
                {doc.kind} <span aria-hidden="true">↗</span>
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Peer-reviewed context</span>
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
