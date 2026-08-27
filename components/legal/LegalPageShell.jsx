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

export function LegalPageShell({
  title,
  summary,
  activeHref,
  lastUpdated = 'August 27, 2026',
  lastUpdatedDate = '2026-08-27',
  children
}) {
  return (
    <div className="policy-page min-h-[100dvh] overflow-x-hidden selection:bg-[#b6ddcc]/60">
      <a
        href="#main-content"
        className="policy-skip-link sr-only z-[70] rounded-full px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <PublicHeader theme="light" />

      <div className="policy-page__wash pointer-events-none absolute inset-x-0 top-0 z-0" aria-hidden="true" />

      <main id="main-content" className="policy-page__main relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-24 sm:px-8 lg:px-12">
        <section aria-labelledby="policy-page-title" className="policy-page__hero grid gap-10 pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] lg:items-end lg:gap-24">
          <div className="max-w-4xl">
            <h1 id="policy-page-title" className="policy-page__title max-w-[16ch] text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl">
              {title}
            </h1>
            <p className="policy-page__summary mt-7 max-w-2xl text-base leading-8 sm:text-lg">
              {summary}
            </p>
          </div>
          <aside className="policy-page__meta border-l pl-5 text-sm leading-7 lg:pb-1" aria-label="Page information">
            <dl>
              <div>
                <dt className="font-medium">Last updated</dt>
                <dd><time dateTime={lastUpdatedDate}>{lastUpdated}</time></dd>
              </div>
            </dl>
            <p className="mt-4">
              Need help?{' '}
              <Link href="/contact" className="policy-link font-medium">
                Contact Cognistration
              </Link>
            </p>
          </aside>
        </section>

        <div className="policy-page__layout mt-14 grid gap-14 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-20">
          <nav aria-label="Policy and support pages" className="policy-page__nav lg:sticky lg:top-28 lg:self-start">
            <p className="policy-page__nav-title text-sm font-medium">Cognistration pages</p>
            <ul className="policy-page__nav-list mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm lg:block lg:space-y-3">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={link.href === activeHref ? 'page' : undefined}
                    className={`policy-page__nav-link ${link.href === activeHref ? 'policy-page__nav-link--active font-medium' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="policy-page__content max-w-3xl space-y-12">
            {children}
          </div>
        </div>
      </main>
      <PublicTrustFooter />
    </div>
  );
}
