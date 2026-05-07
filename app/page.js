import Link from 'next/link';
import { ArrowRight, Brain, Gauge, Headphones, Library, RadioTower, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const scienceCards = [
  {
    icon: Headphones,
    title: 'Stereo carrier tones',
    body: 'Each ear receives a clean carrier tone. The left/right difference creates a perceived beat frequency when heard through headphones.'
  },
  {
    icon: RadioTower,
    title: 'Stage-based ramps',
    body: 'Sessions move through explicit delta-frequency stages instead of holding a single static tone for the entire render.'
  },
  {
    icon: Gauge,
    title: 'Effectiveness scoring',
    body: 'The planner checks target band fit, duration, carrier range, stage count, breath pacing, and safety warnings before a tone is saved.'
  }
];

const platformCards = [
  'Save tones with a name, image, description, frequency plan, and visibility.',
  'Share public tones to a member Feed for others to play, download, and reuse.',
  'Build a profile with social links, bio, followers, and a library of published tones.'
];

export default function Page() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="px-3 py-1 font-medium tracking-wide uppercase text-xs text-[var(--accent-gold-strong)] shadow-premium bg-[var(--bg-1)]">Auditory Beat Stimulation</Badge>
            <Badge variant="secondary" className="px-3 py-1 font-medium tracking-wide uppercase text-xs shadow-premium bg-[var(--bg-1)] text-muted">Member Tone Network</Badge>
          </div>
          <h1 className="hero-title">Scientific stereo entrainment tools for building and sharing focused audio states.</h1>
          <p className="hero-subtitle">
            HemiSync Studio creates headphone-based binaural sessions with controlled carrier tones, left/right
            frequency differentials, staged ramps, and durable tone libraries. It is designed to support focus,
            relaxation, meditation, and careful self-experimentation.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Button asChild>
              <Link href="/signup">
                Create Account <ArrowRight data-icon="inline-end" className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="landing-signal__top">
            <div>
              <p className="section-label">Active Tone</p>
              <h2 className="mt-2 text-2xl font-display text-foreground">Alpha to Theta Descent</h2>
            </div>
            <div className="flex items-center justify-center rounded-full bg-[var(--bg-1)] px-4 py-1.5 shadow-premium">
              <span className="text-sm font-semibold tracking-wide text-foreground">Score 86</span>
            </div>
          </div>
          <div className="signal-visual" aria-hidden="true">
            {Array.from({ length: 34 }).map((_, index) => (
              <span key={index} style={{ '--bar': `${28 + ((index * 19) % 64)}%` }} />
            ))}
          </div>
          <div className="landing-signal__grid">
            <div className="shadow-none border-none">
              <span>Carrier</span>
              <strong>236 Hz</strong>
            </div>
            <div className="shadow-none border-none">
              <span>Delta Path</span>
              <strong>10 → 5.2 Hz</strong>
            </div>
            <div className="shadow-none border-none">
              <span>Duration</span>
              <strong>15 min</strong>
            </div>
          </div>
        </Card>
      </section>

      <section className="landing-section">
        <div className="landing-section__intro">
          <p className="section-label">How It Works</p>
          <h2 className="font-display">Built around explainable signal design.</h2>
          <p className="section-copy">
            The system keeps the audio engine deterministic: choose a target state, inspect the frequency plan, render a
            mastered WAV/MP3, then save or share the tone with its technical metadata.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {scienceCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="p-8">
                <Icon className="size-8 text-[var(--accent-cyan)]" strokeWidth={1.5} />
                <h3 className="mt-6 text-xl font-medium text-foreground">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{card.body}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="landing-section landing-two-col">
        <Card className="p-10">
          <Brain className="size-8 text-[var(--accent-gold-strong)]" strokeWidth={1.5} />
          <h2 className="mt-6 text-3xl font-display font-normal text-foreground">Science-forward, claim-careful wording.</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Research on binaural beats and brainwave entrainment is promising in some outcomes and mixed in others,
            especially when measured through EEG entrainment. HemiSync Studio presents tones as wellness and focus
            support, not diagnosis, treatment, cure, or guaranteed brain-state control.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-foreground/80">
            <a className="transition-opacity hover:opacity-70" href="https://pubmed.ncbi.nlm.nih.gov/30073406/">
              Meta-analysis
            </a>
            <a className="transition-opacity hover:opacity-70" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10198548/">
              Systematic review
            </a>
            <a className="transition-opacity hover:opacity-70" href="https://github.com/facebookresearch/tribev2">
              TRIBE v2 reference
            </a>
          </div>
        </Card>

        <Card className="p-10">
          <Users className="size-8 text-[var(--accent-cyan)]" strokeWidth={1.5} />
          <h2 className="mt-6 text-3xl font-display font-normal text-foreground">A lightweight social platform for tones.</h2>
          <div className="mt-6 flex flex-col gap-4">
            {platformCards.map((item) => (
              <div key={item} className="flex gap-4 items-start rounded-2xl p-4 shadow-premium bg-[var(--bg-0)]">
                <ShieldCheck className="mt-1 size-5 shrink-0 text-[var(--accent-gold-strong)]" strokeWidth={1.5} />
                <span className="text-sm leading-relaxed text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="landing-section landing-cta">
        <div>
          <Library className="size-8 text-[var(--accent-cyan)] mb-4" strokeWidth={1.5} />
          <h2 className="font-display">Generate, save, publish, reuse.</h2>
          <p className="mt-4">
            The platform backend stores profiles, follows, feed posts, saved tones, likes, comments, and library
            metadata behind Supabase Auth and row-level security.
          </p>
        </div>
        <Button asChild className="shrink-0 whitespace-nowrap">
          <Link href="/signup">Open the Platform</Link>
        </Button>
      </section>
    </main>
  );
}