import Link from 'next/link';

const trustLinks = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/services', label: 'Services' },
  { href: '/ai-disclosure', label: 'AI Disclosure' },
  { href: '/health-warning', label: 'Health Warning' },
  { href: '/llms.txt', label: 'llms.txt' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' }
];

export function PublicTrustFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/50 py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-6 md:px-10 md:flex-row">
        <div className="flex flex-col gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">
          <div className="flex flex-wrap gap-6">
            <span>BishopTech / Cognistration</span>
            <span>Calm Audio Sessions</span>
            <span>Headphones Recommended</span>
          </div>
          <span className="tracking-[0.22em] text-white/15 normal-case uppercase">
            Support: matt@bishoptech.dev
          </span>
        </div>
        <div className="flex flex-wrap gap-6 text-[10px] font-mono uppercase tracking-widest text-white/20">
          {trustLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
          <a
            href="https://apps.apple.com/us/app/cognistration/id6780132617"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-white/65 transition-colors hover:border-cyan-200/40 hover:text-white"
          >
            Available on iOS
          </a>
          <span>&copy; 2026 Cognistration</span>
        </div>
      </div>
    </footer>
  );
}
