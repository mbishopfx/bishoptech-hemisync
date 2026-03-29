import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { consumerTemplateOptions } from './generate/chatspec';

const assurancePoints = [
  '30 curated beats-only templates with clean stereo carrier differences and staged frequency arcs.',
  'Headphone-first sessions for focus, reset, creativity, and recovery.',
  '2 minute carrier samples plus premium WAV and MP3 exports when you are ready to keep a session.'
];

const processSteps = [
  {
    step: '01',
    title: 'Choose Your HemiSync',
    body: 'Start with one of 30 curated templates built for focus, creative drift, recovery, sleep prep, and reset.'
  },
  {
    step: '02',
    title: 'Hear the Sample',
    body: 'Open a 2 minute carrier preview to judge the state before you commit to the full render.'
  },
  {
    step: '03',
    title: 'Render and Keep It',
    body: 'Render the full mastered HemiSync session, wait for the download, and keep it for replay.'
  }
];

export default function Page() {
  return (
    <main className="space-y-10 pb-16 pt-6">
      <section className="glass-emphasis overflow-hidden rounded-[2rem] border border-[rgba(214,183,109,0.2)]">
        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
          <div className="space-y-7">
            <div className="flex flex-wrap gap-3">
              <span className="signal-chip">HemiSync Beats</span>
              <span className="signal-chip">Focus, Sleep, Reset</span>
              <span className="signal-chip">Premium WAV + MP3</span>
            </div>

            <div className="space-y-5">
              <p className="section-label">HemiSync</p>
              <h1 className="hero-title max-w-4xl text-[var(--text-primary)]">
                Consumer-friendly HemiSync sessions with 30 curated states and sample-first playback.
              </h1>
              <p className="hero-subtitle">
                Pick the state you want, hear a clean 2 minute carrier sample, then render the full binaural session when you are ready. No file juggling, no engineering setup, no raw signal jargon required.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/generate">Start My HemiSync</Link>
              </Button>
              <Button asChild variant="secondary">
                <a href="#session-types">See Session Types</a>
              </Button>
            </div>
          </div>

          <Card className="border border-white/10 bg-black/20 p-0">
            <div className="space-y-5 p-6">
              <p className="section-label">Why It Feels Different</p>
              <div className="lux-divider" />
              <div className="space-y-4">
                {assurancePoints.map((point) => (
                  <div key={point} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="session-types" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="section-label">Session Types</p>
            <h2 className="display-type text-4xl text-[var(--text-primary)] sm:text-5xl">
              Choose the outcome, not the audio jargon.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            The full library contains {consumerTemplateOptions.length} templates. The homepage shows a smaller cut so people can understand the system quickly before entering the builder.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {consumerTemplateOptions.slice(0, 8).map((template) => (
            <Card key={template.id} className="overflow-hidden p-0">
              <div className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="section-label">{template.shortLabel}</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-[var(--text-secondary)]">
                    2 min sample
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="display-type text-3xl leading-none text-[var(--text-primary)]">{template.title}</h3>
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">{template.description}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold-strong)]">Best For</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{template.bestFor}</p>
                </div>
                <Button asChild className="mt-auto">
                  <Link href="/generate">Build This Session</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-8">
          <p className="section-label">How It Works</p>
          <h2 className="display-type mt-4 text-4xl text-[var(--text-primary)]">
            A to Z in one calm flow.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
            The platform is meant to feel like choosing a guided ritual, not configuring a lab instrument. Start with a clear goal, hear a quick sample, make a few taste-level choices, and render your session.
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-[var(--text-secondary)]">
            Use headphones, keep the volume moderate, and treat sessions as wellness and focus support, not medical treatment.
          </div>
        </Card>

        <Card className="p-8">
          <div className="grid gap-5 md:grid-cols-3">
            {processSteps.map((step) => (
              <div key={step.step} className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
                <p className="mono-type text-xs text-[var(--accent-gold-strong)]">{step.step}</p>
                <p className="mt-3 text-lg text-[var(--text-primary)]">{step.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{step.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
