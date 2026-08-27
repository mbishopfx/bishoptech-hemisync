import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';

const policyLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/ai-disclosure', label: 'AI Disclosure' },
  { href: '/health-warning', label: 'Health & Safety' },
  { href: '/contact', label: 'Contact' },
];

export function LegalPageShell({ title, summary, activeHref, lastUpdated = 'August 27, 2026', children }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef1ee] font-sans text-[#1d302c] selection:bg-[#b6ddcc]/60">
      <a
        href="#main-content"
        className="sr-only z-[70] rounded-full bg-[#1d302c] px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#548477]"
      >
        Skip to content
      </a>
      <PublicHeader theme="light" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[34rem] bg-[radial-gradient(circle_at_70%_0%,rgba(182,221,204,0.34),transparent_52%),linear-gradient(180deg,rgba(255,255,255,0.38),transparent)]" aria-hidden="true" />

      <main id="main-content" className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-40">
        <section className="grid gap-10 border-b border-[#cbd6cf] pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] lg:items-end lg:gap-24">
          <div className="max-w-4xl">
            <h1 className="max-w-[16ch] text-5xl font-medium leading-[0.98] tracking-[-0.065em] text-[#1d302c] sm:text-7xl">
              {title}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#60716b] sm:text-lg">
              {summary}
            </p>
          </div>
          <div className="border-l border-[#cbd6cf] pl-5 text-sm leading-7 text-[#6c7d76] lg:pb-1">
            <p className="font-medium text-[#315e55]">Last updated</p>
            <p>{lastUpdated}</p>
            <p className="mt-4">
              Need help?{' '}
              <Link href="/contact" className="font-medium text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]">
                Contact Cognistration
              </Link>
            </p>
          </div>
        </section>

        <div className="mt-14 grid gap-14 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-20">
          <nav aria-label="Policy and support pages" className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-medium text-[#315e55]">Cognistration pages</p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#71817a] lg:block lg:space-y-3">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={link.href === activeHref ? 'page' : undefined}
                    className={`transition-colors hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477] ${link.href === activeHref ? 'font-medium text-[#315e55]' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl space-y-12">
            {children}
          </div>
        </div>
      </main>
      <PublicTrustFooter />
    </div>
  );
}
