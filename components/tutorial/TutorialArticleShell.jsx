import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, FirstAid } from '@phosphor-icons/react/dist/ssr';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { TutorialBreadcrumbs } from '@/components/tutorial/TutorialBreadcrumbs';

export function TutorialArticleShell({ eyebrow, title, description, canonical, sources, children }) {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#080b0c] text-white selection:bg-cyan-200/25">
      <PublicHeader />
      <main>
        <header className="border-b border-white/10 px-5 pb-20 pt-32 md:px-10 md:pb-24 md:pt-36">
          <div className="mx-auto max-w-5xl">
            <TutorialBreadcrumbs current={title} currentUrl={canonical} />
            <div className="mt-12 grid gap-10 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-cyan-100/55">{eyebrow}</p>
                <h1 className="mt-6 max-w-4xl text-4xl font-extralight leading-[1.02] tracking-[-0.045em] sm:text-5xl md:text-7xl">{title}</h1>
                <p className="mt-7 max-w-3xl text-lg font-light leading-8 text-white/58">{description}</p>
              </div>
              <Image src="/images/cognistration-mark.png" alt="Cognistration brain and waveform mark" width={1254} height={1254} priority className="h-20 w-20 border border-white/10 object-cover md:h-28 md:w-28" />
            </div>
          </div>
        </header>

        <article className="px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-5xl">{children}</div>
        </article>

        <aside aria-labelledby="tutorial-safety" className="border-y border-amber-100/15 bg-amber-100/[0.035] px-5 py-16 md:px-10">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[auto_1fr] md:gap-9">
            <FirstAid weight="thin" className="size-9 text-amber-100/70" aria-hidden="true" />
            <div>
              <h2 id="tutorial-safety" className="text-2xl font-light tracking-tight">Safety comes before completing a session</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">Cognistration is a reflection and audio tool, not medical or mental-health treatment. Stop if you experience pain, dizziness, panic, marked distress, disorientation, or worsening symptoms. Remove your headphones, orient to the room, and seek appropriate professional help if symptoms are severe or persist. Do not listen while driving or doing anything that requires full attention.</p>
              <Link href="/health-warning" className="mt-6 inline-flex items-center gap-2 border-b border-white/25 pb-1 text-xs uppercase tracking-[0.18em] transition hover:border-cyan-100 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100">Full health warning <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </aside>

        <section aria-labelledby="tutorial-sources" className="px-5 py-20 md:px-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/50">Evidence and context</p>
            <h2 id="tutorial-sources" className="mt-5 text-3xl font-light tracking-tight">Sources and further reading</h2>
            <ul className="mt-9 divide-y divide-white/10 border-y border-white/10">
              {sources.map((source) => (
                <li key={source.href} className="py-6">
                  <a href={source.href} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-5 rounded-sm text-sm leading-7 text-white/58 transition hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100">
                    <span><span className="block text-white/85">{source.title}</span>{source.note && <span className="mt-1 block text-xs text-white/38">{source.note}</span>}</span>
                    <ArrowUpRight className="mt-1 size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/tutorial" className="mt-12 inline-flex items-center gap-3 border-b border-white/25 pb-2 text-xs uppercase tracking-[0.2em] transition hover:border-cyan-100 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100"><ArrowLeft className="size-4" aria-hidden="true" /> Back to the Cognistration tutorial</Link>
          </div>
        </section>
      </main>
      <PublicTrustFooter />
    </div>
  );
}
