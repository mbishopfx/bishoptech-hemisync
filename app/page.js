import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const featureCards = [
  {
    title: 'Stage the Session',
    body: 'Build five-part frequency journeys with explicit alpha, theta, delta, or beta transitions instead of one flat tone.'
  },
  {
    title: 'Master the Export',
    body: 'Render premium 48 kHz masters, produce WAV and MP3 delivery files, and keep analytics attached to each output.'
  },
  {
    title: 'Deploy the Engine',
    body: 'Run the Next service on Railway with a persistent artifact path, containerized build, and healthcheck-ready runtime.'
  }
];

const processSteps = [
  'Choose a journey preset and shape the delta path stage by stage.',
  'Preview carriers and ambience locally, then render the full export on the server.',
  'Download premium masters or hand them to web and mobile playback clients.'
];

export default function Page() {
  return (
    <main className="space-y-10 pb-16 pt-6">
      <section className="glass-emphasis overflow-hidden rounded-[2rem] border border-[rgba(214,183,109,0.2)]">
        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-10 lg:py-12">
          <div className="space-y-7">
            <div className="flex flex-wrap gap-3">
              <span className="signal-chip">Beats-Only Engine</span>
              <span className="signal-chip">48 kHz Premium Render</span>
              <span className="signal-chip">Railway-Ready Service</span>
            </div>

            <div className="space-y-5">
              <p className="section-label">HemiSync Studio</p>
              <h1 className="hero-title max-w-4xl text-[var(--text-primary)]">
                Precision binaural sessions for focus, descent, and clean return.
              </h1>
              <p className="hero-subtitle">
                This platform now centers on premium beats-only entrainment. Design the session arc, tune carrier and delta paths, layer curated ambience, and export mastered sessions from one render pipeline.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/generate">Open Session Lab</Link>
              </Button>
              <Button asChild variant="secondary">
                <a href="#production">See Production Path</a>
              </Button>
            </div>
          </div>

          <Card className="border border-white/10 bg-black/20 p-0">
            <div className="space-y-5 p-6">
              <p className="section-label">Current System</p>
              <div className="lux-divider" />
              <div className="space-y-4">
                <div>
                  <p className="mono-type text-xs uppercase text-[var(--text-muted)]">Render Core</p>
                  <p className="mt-1 text-lg text-[var(--text-primary)]">Binaural, monaural, isochronic, ambient bed</p>
                </div>
                <div>
                  <p className="mono-type text-xs uppercase text-[var(--text-muted)]">Export Ladder</p>
                  <p className="mt-1 text-lg text-[var(--text-primary)]">24-bit WAV master plus MP3 delivery file</p>
                </div>
                <div>
                  <p className="mono-type text-xs uppercase text-[var(--text-muted)]">Deployment Shape</p>
                  <p className="mt-1 text-lg text-[var(--text-primary)]">Next.js standalone container with Railway healthcheck</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {featureCards.map((card) => (
          <Card key={card.title} className="p-7">
            <p className="section-label">Capability</p>
            <h2 className="display-type mt-3 text-3xl leading-none text-[var(--text-primary)]">{card.title}</h2>
            <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">{card.body}</p>
          </Card>
        ))}
      </section>

      <section id="production" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-8">
          <p className="section-label">Production Path</p>
          <h2 className="display-type mt-4 text-4xl text-[var(--text-primary)]">What ships cleanly to web, mobile, and Railway.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
            The right production stack here is a fast web interface, a stable render service, and durable artifact handling. That keeps premium audio quality separate from preview UX and gives the mobile app a clean playback and download surface.
          </p>
        </Card>

        <Card className="p-8">
          <div className="grid gap-5 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <div key={step} className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
                <p className="mono-type text-xs text-[var(--accent-gold-strong)]">0{index + 1}</p>
                <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
