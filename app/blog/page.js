import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { blogPosts } from '@/lib/blog/posts';
import { buildAbsoluteUrl } from '@/lib/seo';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';

export const metadata = {
  title: { absolute: 'Blog — Cognistration' },
  description: 'Evidence-aware essays and product notes about consciousness mechanics, audio sessions, and the thinking behind Cognistration.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog — Cognistration',
    description: 'Evidence-aware essays and product notes about consciousness mechanics, audio sessions, and the thinking behind Cognistration.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/blog',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brainwave mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Cognistration',
    description: 'Evidence-aware essays and product notes about consciousness mechanics, audio sessions, and the thinking behind Cognistration.',
    images: ['/images/og-preview.png'],
  },
};

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Cognistration Blog',
  description: 'Evidence-aware essays and product notes about consciousness mechanics, audio sessions, and the thinking behind Cognistration.',
  url: buildAbsoluteUrl('/blog'),
  publisher: {
    '@type': 'Organization',
    name: 'Cognistration',
    url: buildAbsoluteUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: buildAbsoluteUrl('/images/cognistration-mark.png')
    }
  }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Deterministic formatting so the server and client never disagree on locale.
function formatDate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  if (!year || !month || !day) return '';
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export default function BlogArchivePage() {
  const posts = [...blogPosts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return (
    <div className="blog-light-theme min-h-[100dvh] overflow-x-hidden bg-[#080c0b] text-[#f2f0ea] selection:bg-[#b6ddcc]/60">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <PublicHeader theme="dark" />

      <main className="relative mx-auto w-full max-w-[1400px] px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-36">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/12 pb-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b6ddcc]">The archive</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
            {posts.length} articles · newest first
          </p>
        </div>

        <table className="w-full border-collapse text-left">
          <caption className="sr-only">All Cognistration articles, newest first</caption>
          <thead>
            <tr className="border-b border-white/12">
              <th
                scope="col"
                className="py-4 pr-6 text-left font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-white/40"
              >
                Article
              </th>
              <th
                scope="col"
                className="hidden py-4 pr-6 text-left font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-white/40 md:table-cell"
              >
                Category
              </th>
              <th
                scope="col"
                className="hidden py-4 pr-6 text-left font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-white/40 sm:table-cell"
              >
                Read
              </th>
              <th
                scope="col"
                className="py-4 text-right font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-white/40"
              >
                Published
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.slug}
                className="group border-b border-white/[0.08] align-top transition-colors hover:bg-white/[0.03]"
              >
                <td className="py-5 pr-6">
                  <Link
                    href={post.path}
                    className="inline-flex items-start gap-2 text-[15px] font-medium leading-snug text-[#f2f0ea] transition-colors group-hover:text-[#b6ddcc] sm:text-base"
                  >
                    <span>{post.title}</span>
                    <ArrowRight
                      className="mt-1 size-3.5 shrink-0 -translate-x-1 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      weight="bold"
                      aria-hidden="true"
                    />
                  </Link>
                  <p className="mt-1.5 max-w-[68ch] text-[13px] leading-6 text-white/40">{post.excerpt}</p>
                </td>
                <td className="hidden py-5 pr-6 md:table-cell">
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/45">{post.category}</span>
                </td>
                <td className="hidden whitespace-nowrap py-5 pr-6 font-mono text-[11px] tabular-nums text-white/45 sm:table-cell">
                  {post.readTime}
                </td>
                <td className="whitespace-nowrap py-5 text-right font-mono text-[11px] tabular-nums text-white/45">
                  {formatDate(post.publishedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/12 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
          <span>Read at your own pace</span>
          <Link
            href="/tutorial"
            className="text-[#b6ddcc] underline decoration-[#b6ddcc]/30 underline-offset-4 transition hover:decoration-[#b6ddcc]"
          >
            Start with the tutorial
          </Link>
          <Link
            href="/packs"
            className="text-[#b6ddcc] underline decoration-[#b6ddcc]/30 underline-offset-4 transition hover:decoration-[#b6ddcc]"
          >
            Browse the tone library
          </Link>
        </div>
      </main>

      <PublicTrustFooter />
    </div>
  );
}
