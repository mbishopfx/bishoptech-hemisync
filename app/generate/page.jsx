import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TechGridBackground } from '@/components/visuals/TechGridBackground';
import { SessionLab } from './SessionLab';

const guideCards = [
  {
    title: 'Design the Arc',
    body: 'Choose a preset, rebalance to length, and shape the delta path so the session actually travels somewhere.'
  },
  {
    title: 'Tune the Atmosphere',
    body: 'Preview carriers with bundled ambience, set breath pacing, and keep the mix controlled before the full render.'
  },
  {
    title: 'Render for Delivery',
    body: 'Export premium masters with analytics and artifacts ready for web playback or downstream mobile clients.'
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
              <span className="signal-chip">Session Design</span>
              <span className="signal-chip">Premium Mastering</span>
              <span className="signal-chip">Beats-Only Flow</span>
            </div>
            <div className="space-y-4">
              <p className="section-label">Generator</p>
              <h1 className="display-type text-5xl leading-none text-[var(--text-primary)] sm:text-6xl">
                Build the session like a signal engineer, not a prompt toy.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
                The lab keeps the creative controls close to the signal path: stage timing, carrier choices, delta transitions, breath pacing, ambience, analytics, and mastered export.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/">Back to Overview</Link>
              </Button>
            </div>
          </div>

          <Card className="border border-white/10 bg-black/20 p-6">
            <h2 className="display-type text-3xl text-[var(--text-primary)]">Safety and Use</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              Use quality headphones, stay seated, and never listen while driving or operating machinery. Anyone with neurological or psychiatric concerns should use clinical judgment and professional advice first. These sessions are for relaxation and focus exploration, not medical treatment.
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
