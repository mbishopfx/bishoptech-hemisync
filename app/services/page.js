import { ArrowRight, Clock3, Globe2, Mic2, Sparkles, Workflow } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { buildAbsoluteUrl, buildPageMetadata } from '@/lib/seo';

const servicesTitle = 'BishopTech Services | iOS, Web, Voice & Workflow Builds';
const servicesDescription =
  'BishopTech builds iOS apps, full-stack web apps, branded websites, agentic workflows, and natural-sounding inbound voice agents that recover missed leads and hand off cleanly.';

const servicesMetadata = buildPageMetadata({
  title: 'BishopTech Services',
  description: servicesDescription,
  path: '/services',
});

export const metadata = {
  ...servicesMetadata,
  title: { absolute: servicesTitle },
  openGraph: {
    ...servicesMetadata.openGraph,
    title: servicesTitle,
    description: servicesDescription,
    siteName: 'BishopTech',
  },
  twitter: {
    ...servicesMetadata.twitter,
    title: servicesTitle,
    description: servicesDescription,
  },
};

const servicesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': buildAbsoluteUrl('/services#webpage'),
      name: 'BishopTech Services',
      description:
        'BishopTech builds iOS apps, full-stack web apps, branded websites, agentic workflows, and natural-sounding inbound voice agents that recover missed leads and hand off cleanly.',
      url: buildAbsoluteUrl('/services'),
      isPartOf: { '@id': buildAbsoluteUrl('/#website') },
      mainEntity: { '@id': buildAbsoluteUrl('/services#service') },
    },
    {
      '@type': 'Service',
      '@id': buildAbsoluteUrl('/services#service'),
      name: 'BishopTech Services',
      description:
        'BishopTech builds iOS apps, full-stack web apps, branded websites, agentic workflows, and natural-sounding inbound voice agents that recover missed leads and hand off cleanly.',
      url: buildAbsoluteUrl('/services'),
      provider: {
        '@type': 'Organization',
        name: 'BishopTech',
        url: buildAbsoluteUrl('/services'),
        email: 'matt@bishoptech.dev',
      },
      serviceType:
        'iOS app development, full-stack web applications, branded websites, agentic workflows, and inbound voice agents',
    },
  ],
};

const offerings = [
  {
    icon: Sparkles,
    title: 'iOS app builds',
    body:
      'Architecture, feature delivery, release preparation, and the kind of polish that makes an app feel trustworthy instead of fragile.',
  },
  {
    icon: Globe2,
    title: 'Full-stack web apps',
    body:
      'Product dashboards, member experiences, admin tools, and backend-connected web apps built to ship cleanly and stay maintainable.',
  },
  {
    icon: Workflow,
    title: 'Branded websites',
    body:
      'Calm, conversion-ready public sites with clear positioning, policy pages, and AI-search-friendly structure.',
  },
  {
    icon: Mic2,
    title: 'Custom voice agents',
    body:
      'Natural-sounding inbound voice flows that answer missed calls, recover warm leads before they call a competitor, respect privacy concerns, and hand off to a person when it matters.',
  },
  {
    icon: Clock3,
    title: 'Workflow automation',
    body:
      'Agentic workflows for intake, follow-up, support, and repetitive tasks that need consistency more than drama.',
  },
];

const processSteps = [
  'Clarify the outcome, constraints, and what success looks like.',
  'Map the smallest production-safe build path.',
  'Ship the core experience, then tighten the edges that affect trust and conversion.',
  'Leave behind a clean handoff, clear docs, and a plan for the next iteration.',
];

const voiceTrustPoints = [
  {
    title: 'Sound like a steady front desk, not a script',
    body:
      'The voice should answer quickly, stay composed, and keep callers moving without sounding stiff or synthetic.'
  },
  {
    title: 'Recover missed leads without adding friction',
    body:
      'Capture the name, reason for calling, and urgency cleanly so your team can follow up before the lead disappears.'
  },
  {
    title: 'Respect privacy and handoff boundaries',
    body:
      'Use clear disclosure, minimal data collection, and a clean transfer to a person whenever the caller needs human help.'
  }
];

const voiceOutcomes = [
  {
    title: 'Recover warm leads before they move on',
    body:
      'Answer quickly when the office is busy or closed so a real inquiry does not quietly become a competitor win.'
  },
  {
    title: 'Keep privacy and disclosure calm',
    body:
      'Make the AI layer visible, collect only what is needed, and avoid turning the first interaction into a compliance burden.'
  },
  {
    title: 'Hand off cleanly when a person should continue',
    body:
      'Route urgent, sensitive, or high-value calls to a human without making the caller repeat themselves.'
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <PublicHeader theme="dark" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-20 px-6 pb-20 pt-40 md:px-10">
        <section className="max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-cyan-400">BishopTech Services</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-[0.95]">
            Calm build partner for work that needs to ship.
          </h1>
          <p className="max-w-3xl text-lg md:text-xl leading-8 text-white/45 font-light">
            BishopTech helps founders and small teams build iOS apps, full-stack web apps, branded websites,
            agentic workflows, and natural-sounding inbound voice agents. The focus is simple: clear scope,
            production-minded implementation, and a finish that feels trustworthy.
          </p>
          <p className="max-w-2xl text-xs leading-6 text-white/30">
            Specific integrations, response behavior, timelines, and business outcomes depend on project scope,
            existing systems, and implementation approvals. No lead, conversion, or revenue result is guaranteed.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-200 transition-colors hover:bg-cyan-500/15 hover:text-cyan-100"
            >
              Start a project <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              View Pricing
            </Link>
            <Link
              href="/blog"
              className="rounded-full border border-white/10 bg-transparent px-5 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-white/60 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Read the Blog
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {voiceTrustPoints.map((point) => (
            <article
              key={point.title}
              className="rounded-[2rem] border border-white/5 bg-zinc-900/35 p-6 backdrop-blur-3xl"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-400">Voice trust</p>
              <h2 className="mt-4 text-2xl font-light tracking-tight text-white">{point.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/50">{point.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {voiceOutcomes.map((outcome) => (
            <article
              key={outcome.title}
              className="rounded-[2rem] border border-cyan-500/10 bg-cyan-500/5 p-6 backdrop-blur-3xl"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-400">Why it matters</p>
              <h2 className="mt-4 text-2xl font-light tracking-tight text-white">{outcome.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/50">{outcome.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {offerings.map((offering) => {
            const Icon = offering.icon;

            return (
              <article
                key={offering.title}
                className="rounded-[2rem] border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-3xl transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.04]"
              >
                <div className="mb-5 inline-flex size-11 items-center justify-center rounded-2xl border border-cyan-500/15 bg-cyan-500/10 text-cyan-300">
                  <Icon className="size-5" />
                </div>
                <h2 className="text-2xl font-light tracking-tight text-white">{offering.title}</h2>
                <p className="mt-4 text-sm leading-7 text-white/50">{offering.body}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/5 bg-zinc-900/40 p-8 backdrop-blur-3xl">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-400">Working approach</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-light tracking-tight text-white">
              The goal is less friction, more finished product.
            </h2>
            <div className="mt-8 space-y-4">
              {processSteps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
                    0{index + 1}
                  </div>
                  <p className="text-sm leading-7 text-white/55">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/5 bg-zinc-900/40 p-8 backdrop-blur-3xl">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-400">Good fit for</p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-white/55">
              <li>Founders who want a calm technical partner instead of a hype-first agency.</li>
              <li>Businesses that need the website, app, or automation to feel dependable before launch.</li>
              <li>Teams that are missing leads when calls come in after hours or during busy periods.</li>
              <li>Teams that want conversion-friendly messaging, clean handoff, and sensible support paths.</li>
              <li>Projects where trust, clarity, and consistency matter more than flashy claims.</li>
            </ul>

            <div className="mt-8 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Need a direct next step?</p>
              <p className="mt-3 text-sm leading-7 text-white/55">
                Send a short project note and BishopTech will reply through the published contact path.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                Contact BishopTech <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </section>
      </main>

      <PublicTrustFooter />
    </div>
  );
}
