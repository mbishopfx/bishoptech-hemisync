import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, FirstAid } from '@phosphor-icons/react/dist/ssr';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { TutorialBreadcrumbs } from '@/components/tutorial/TutorialBreadcrumbs';

export function TutorialArticleShell({ title, description, canonical, sources, children }) {
  return (
    <div className="tutorial-light-theme min-h-[100dvh] overflow-x-hidden bg-[#eef1ee] text-[#1d302c] selection:bg-[#b6ddcc]/60">
      <PublicHeader />
      <main>
        <header className="border-b border-[#cbd6cf] bg-[#eef1ee] px-5 pb-20 pt-32 md:px-10 md:pb-24 md:pt-36">
          <div className="mx-auto max-w-5xl">
            <TutorialBreadcrumbs current={title} currentUrl={canonical} />
            <div className="mt-12 grid gap-10 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <h1 className="max-w-4xl text-4xl font-medium leading-[0.98] tracking-[-0.06em] text-[#1d302c] sm:text-5xl md:text-7xl">{title}</h1>
                <p className="mt-7 max-w-3xl text-lg leading-8 text-[#60716b]">{description}</p>
              </div>
              <Image src="/images/cognistration-mark.png" alt="Cognistration brain and waveform mark" width={1254} height={1254} priority className="h-20 w-20 rounded-2xl border border-[#cbd6cf] object-cover shadow-[0_12px_30px_rgba(45,65,59,0.08)] md:h-28 md:w-28" />
            </div>
          </div>
        </header>

        <article className="px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-5xl">{children}</div>
        </article>

        <aside aria-labelledby="tutorial-safety" className="border-y border-[#caa778]/35 bg-[#fbf5eb] px-5 py-16 md:px-10">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[auto_1fr] md:gap-9">
            <FirstAid weight="duotone" className="size-9 text-[#a87543]" aria-hidden="true" />
            <div>
              <h2 id="tutorial-safety" className="text-2xl font-medium tracking-[-0.035em] text-[#1d302c]">Safety comes before completing a session</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6e5d4d]">Cognistration is a reflection and audio tool, not medical or mental-health treatment. Stop if you experience pain, dizziness, panic, marked distress, disorientation, or worsening symptoms. Remove your headphones, orient to the room, and seek appropriate professional help if symptoms are severe or persist. Do not listen while driving or doing anything that requires full attention.</p>
              <Link href="/health-warning" className="mt-6 inline-flex items-center gap-2 border-b border-[#a87543]/40 pb-1 text-sm font-medium text-[#8b6038] transition hover:border-[#8b6038] hover:text-[#704b2f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a87543]">Full health warning <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </aside>

        <section aria-labelledby="tutorial-sources" className="bg-[#f7f8f5] px-5 py-20 md:px-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-medium text-[#315e55]">Evidence and context</p>
            <h2 id="tutorial-sources" className="mt-5 text-3xl font-medium tracking-[-0.045em] text-[#1d302c]">Sources and further reading</h2>
            <ul className="mt-9 divide-y divide-[#cbd6cf] border-y border-[#cbd6cf]">
              {sources.map((source) => (
                <li key={source.href} className="py-6">
                  <a href={source.href} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-5 rounded-sm text-sm leading-7 text-[#60716b] transition hover:text-[#315e55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]">
                    <span><span className="block text-[#31443e]">{source.title}</span>{source.note && <span className="mt-1 block text-xs text-[#87968f]">{source.note}</span>}</span>
                    <ArrowUpRight className="mt-1 size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/tutorial" className="mt-12 inline-flex items-center gap-3 border-b border-[#315e55]/30 pb-2 text-sm font-medium text-[#315e55] transition hover:border-[#315e55] hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]"><ArrowLeft className="size-4" aria-hidden="true" /> Back to the Cognistration tutorial</Link>
          </div>
        </section>
      </main>
      <PublicTrustFooter />
    </div>
  );
}
