import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TechGridBackground } from '@/components/visuals/TechGridBackground';
import { SessionLab } from './SessionLab';

const guideCards = [
  {
    title: 'Pick a state',
    body: 'Start with a curated session direction built for focus, reset, sleep prep, creativity, and recovery.'
  },
  {
    title: 'Render the audio',
    body: 'Generate clean binaural audio with mastered output, safe defaults, and a preview-first flow.'
  },
  {
    title: 'Save and track',
    body: 'Store the session in your bucket, log the listen, and revisit it later from web or iOS.'
  }
];

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-[1600px] space-y-8 pb-16 pt-4">
      <TechGridBackground />

      <section className="glass-emphasis overflow-hidden rounded-[2.25rem]">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="signal-chip">Studio Dashboard</span>
              <span className="signal-chip">Preview First</span>
              <span className="signal-chip">Save + Track</span>
            </div>
            <div className="space-y-4">
              <p className="section-label">Builder</p>
              <h1 className="section-title text-5xl leading-none text-[var(--text-primary)] sm:text-6xl">
                Design a session, preview it, and ship the render.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
                This dashboard is the working surface of HemiSync Studio. It is built to keep the audio workflow calm and professional: start with the goal, hear a sample, save your best render, and review it later.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="#session-lab">Jump to Builder</Link>
              </Button>
            </div>
          </div>

          <Card className="border border-white/10 bg-black/20 p-6">
            <h2 className="section-title text-3xl text-[var(--text-primary)]">Current Model</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
              <p>1. Choose a template or state direction.</p>
              <p>2. Render a clean session with Gemini-assisted guidance.</p>
              <p>3. Save to your personal bucket and log the result.</p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.035] p-4 text-center">
                <p className="metric-label">Tier</p>
                <p className="metric-value mt-2 text-xl text-[var(--text-primary)]">Free / Pro</p>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.035] p-4 text-center">
                <p className="metric-label">Save</p>
                <p className="metric-value mt-2 text-xl text-[var(--text-primary)]">1 Free</p>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.035] p-4 text-center">
                <p className="metric-label">AI</p>
                <p className="metric-value mt-2 text-xl text-[var(--text-primary)]">Gemini</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {guideCards.map((card) => (
          <Card key={card.title} className="p-7">
            <p className="section-label">Workflow</p>
            <h2 className="section-title mt-3 text-3xl text-[var(--text-primary)]">{card.title}</h2>
            <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">{card.body}</p>
          </Card>
        ))}
      </section>

      <section id="session-lab">
        <SessionLab />
      </section>
    </main>
  );
}
