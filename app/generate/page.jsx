import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TechGridBackground } from '@/components/visuals/TechGridBackground';
import { SessionLab } from './SessionLab';

const guideCards = [
  {
    title: 'Pick From 30 Templates',
    body: 'Start with a curated state library built for focus, reset, sleep prep, creativity, clarity, and recovery.'
  },
  {
    title: 'Hear the Carrier Sample',
    body: 'Each card can open into a 2 minute stereo sample so people can judge the state before rendering.'
  },
  {
    title: 'Render, Download, Replay',
    body: 'Render the full mastered HemiSync session, stay on screen, and download the finished file when it lands.'
  }
];

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-[1420px] space-y-8 pb-16 pt-4">
      <TechGridBackground />

      <section className="glass-emphasis overflow-hidden rounded-[2rem]">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="signal-chip">Consumer HemiSync Flow</span>
              <span className="signal-chip">Template-First Builder</span>
              <span className="signal-chip">Premium Beat Sessions</span>
            </div>
            <div className="space-y-4">
              <p className="section-label">Build Your Session</p>
              <h1 className="display-type text-5xl leading-none text-[var(--text-primary)] sm:text-6xl">
                Start with the state you want, hear the carrier, then render the full journey.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
                This builder is designed to get someone from idea to finished session quickly. The first move is the template library, the second is the 2 minute sample, and only then do we ask for full-session choices.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/">Back to Overview</Link>
              </Button>
            </div>
          </div>

          <Card className="border border-white/10 bg-black/20 p-6">
            <h2 className="display-type text-3xl text-[var(--text-primary)]">Simple Flow</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
              <p>1. Choose one of 30 HemiSync templates.</p>
              <p>2. Hear a 2 minute clean carrier sample.</p>
              <p>3. Render and download the full session.</p>
            </div>
            <p className="mt-5 text-xs leading-6 text-[var(--text-muted)]">
              Headphones recommended. These sessions are for relaxation, focus, and recovery support, not medical treatment.
            </p>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {guideCards.map((card) => (
          <Card key={card.title} className="p-7">
            <p className="section-label">Workflow</p>
            <h2 className="display-type mt-3 text-3xl text-[var(--text-primary)]">{card.title}</h2>
            <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">{card.body}</p>
          </Card>
        ))}
      </section>

      <SessionLab />
    </main>
  );
}
