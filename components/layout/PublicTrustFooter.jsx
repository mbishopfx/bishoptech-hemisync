import Link from 'next/link';

const trustLinks = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/ai-disclosure', label: 'AI Disclosure' },
  { href: '/health-warning', label: 'Health Warning' },
  { href: '/llms.txt', label: 'llms.txt' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' }
];

export function PublicTrustFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#17221f] py-12 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-6 md:px-10 md:flex-row">
        <div className="flex flex-col gap-2 text-xs text-white/45">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>Cognistration</span>
            <span>Personal audio sessions</span>
            <span>Headphones recommended</span>
          </div>
          <span className="text-white/30">
            Support: matt@bishoptech.dev
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/40 md:justify-end">
          {trustLinks.filter((link) => link.href !== '/llms.txt').map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
          <a
            href="https://apps.apple.com/us/app/cognistration/id6780132617"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center border-b border-white/20 pb-1 text-xs text-white/60 transition-colors hover:border-white/60 hover:text-white"
          >
            Available on iOS
          </a>
          <span>&copy; 2026 Cognistration</span>
        </div>
      </div>
    </footer>
  );
}
