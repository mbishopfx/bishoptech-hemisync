import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { consumerTemplateOptions } from './generate/chatspec';

const promisePoints = [
  'Expert-grade binaural session generation with premium WAV and MP3 export.',
  'Per-user libraries, session logs, and future community sharing built in.',
  'Designed to grow into an iOS companion app without rebuilding the backend.'
];

const processSteps = [
  {
    step: '01',
    title: 'Choose the outcome',
    body: 'Pick the state you want: focus, calm, sleep prep, recovery, or deeper exploratory sessions.'
  },
  {
    step: '02',
    title: 'Generate the session',
    body: 'Render a polished binaural session with clean carriers, ramps, mastering, and safe playback defaults.'
  },
  {
    step: '03',
    title: 'Track the result',
    body: 'Save it to your library, log the session, and revisit it later from web or iOS.'
  }
];

export default function Page() {
  return (
    <main className="relative space-y-10 pb-16 pt-2 lg:pt-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-glow opacity-35 [mask-image:radial-gradient(circle_at_center,black_38%,transparent_86%)]"
      />
      <section className="relative z-10 glass-emphasis overflow-hidden rounded-[2.25rem]">
        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
          <div className="space-y-7">
            <div className="flex flex-wrap gap-3">
              <span className="signal-chip">HemiSync Studio</span>
              <span className="signal-chip">Premium Binaural Generation</span>
              <span className="signal-chip">Web + iOS Ready</span>
            </div>

            <div className="space-y-5">
              <p className="section-label">Production System</p>
              <h1 className="hero-title max-w-4xl text-[var(--text-primary)]">
                A premium hemisync platform for building, saving, and tracking guided audio sessions.
              </h1>
              <p className="hero-subtitle">
                HemiSync Studio turns session design into a polished workflow: generate expert-grade audio, save your best renders, track your sessions, and grow into community features without changing the foundation.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/generate">Open the Studio</Link>
              </Button>
              <Button asChild variant="secondary">
                <a href="#session-types">Browse Session Types</a>
              </Button>
            </div>
          </div>

          <Card className="p-0">
            <div className="space-y-5 p-6">
              <p className="section-label">Why It Ships</p>
              <div className="lux-divider" />
              <div className="space-y-4">
                {promisePoints.map((point) => (
                  <div key={point} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">{point}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 text-center">
                  <p className="metric-label">Templates</p>
                  <p className="metric-value mt-2 text-2xl text-[var(--text-primary)]">{consumerTemplateOptions.length}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 text-center">
                  <p className="metric-label">Save Rule</p>
                  <p className="metric-value mt-2 text-2xl text-[var(--text-primary)]">1 Free</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 text-center">
                  <p className="metric-label">AI Layer</p>
                  <p className="metric-value mt-2 text-2xl text-[var(--text-primary)]">Gemini</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="session-types" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="section-label">Session Types</p>
            <h2 className="section-title text-4xl text-[var(--text-primary)] sm:text-5xl">
              Built for real use, not demo fluff.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            The library is structured so people can move from quick previews to saved renders, then return to the session later across devices.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {consumerTemplateOptions.slice(0, 8).map((template) => (
            <Card key={template.id} className="overflow-hidden p-0">
              <div className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="section-label">{template.shortLabel}</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-[var(--text-secondary)]">
                    Preview First
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="section-title text-3xl leading-none text-[var(--text-primary)]">{template.title}</h3>
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

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="p-8">
          <p className="section-label">How It Works</p>
          <h2 className="section-title mt-4 text-4xl text-[var(--text-primary)]">
            One calm flow from idea to saved session.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
            The platform is designed so the first experience feels obvious: choose a state, generate a session, save it if you want, and review your listening history later.
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
