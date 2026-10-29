import Link from 'next/link';
import { ArrowRight, BookOpenText } from '@phosphor-icons/react/dist/ssr';
import { RecentPostsCarousel } from '@/components/blog/recent-posts-carousel';
import { getRecentBlogPosts } from '@/lib/blog/posts';
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

function BlogCard({ post }) {
  return (
    <article className="group flex h-full flex-col rounded-[1.75rem] border border-white/12 bg-white/[0.05] p-6 shadow-[0_16px_42px_rgba(45,65,59,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#9db9aa] hover:bg-white/[0.06]">
      <div className="flex items-center justify-between gap-4 text-xs text-white/50">
        <span className="font-medium">{post.category}</span>
        <span>{post.readTime}</span>
      </div>
      <h2 className="mt-5 text-2xl font-medium leading-tight tracking-[-0.04em] text-[#f2f0ea]">
        {post.title}
      </h2>
      <p className="mt-4 flex-1 text-sm leading-7 text-white/60">{post.excerpt}</p>
      <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="text-xs text-white/50">
          {new Date(post.publishedAt).toLocaleDateString()}
        </span>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-[#b6ddcc] transition group-hover:text-[#f2f0ea]"
          href={post.path}
        >
          Read post <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" weight="bold" />
        </Link>
      </div>
    </article>
  );
}

export default function BlogArchivePage() {
  const recentPosts = getRecentBlogPosts(6);
  const featuredPosts = getRecentBlogPosts(12);

  return (
    <div className="blog-light-theme min-h-[100dvh] overflow-x-hidden bg-[#080c0b] text-[#f2f0ea] selection:bg-[#b6ddcc]/60">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <PublicHeader theme="dark" />

      <main className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-20 px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-36">
        <section className="border-b border-white/12 pb-16 sm:pb-20">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-24">
            <div className="max-w-4xl">
              <h1 className="max-w-4xl text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl">
                Ideas for making attention feel more deliberate.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
                Clear writing on consciousness mechanics, listening practice, and the choices behind Cognistration. Read at your own pace, then take one useful idea back into the day.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/tutorial" className="inline-flex items-center gap-2 rounded-full bg-[#1d302c] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#315e55] active:translate-y-px">
                  Start with the tutorial <ArrowRight className="size-4" weight="bold" />
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#b6ddcc] underline decoration-[#315e55]/30 underline-offset-8 transition hover:text-[#f2f0ea]">
                  Explore Cognistration
                </Link>
              </div>
            </div>

            <div className="border-l border-white/12 pl-7 lg:pl-10">
              <BookOpenText className="size-9 text-[#b6ddcc]" weight="duotone" aria-hidden="true" />
              <p className="mt-7 max-w-sm text-lg leading-8 text-white/70">
                The archive moves between practical routines and the research questions that make those routines worth examining.
              </p>
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">
                Evidence-aware does not mean distant. It means being precise about what a session can support and what it cannot prove.
              </p>
            </div>
          </div>
        </section>

        <RecentPostsCarousel posts={recentPosts} />

        <section className="space-y-8">
          <div className="flex flex-col gap-4 border-b border-white/12 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#b6ddcc]">The archive</p>
              <h2 className="mt-2 text-4xl font-medium leading-tight tracking-[-0.055em] text-[#f2f0ea] sm:text-5xl">All posts, newest first.</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-white/65 sm:text-right">
              Practical guides, product thinking, and long-form notes about how attention, sensation, and context shape a moment.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section className="border-t border-white/12 pt-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="max-w-2xl text-3xl font-medium leading-tight tracking-[-0.045em] sm:text-4xl">Read a little. Listen a little. Keep what helps.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/60">When you are ready to move from an idea into a session, the public tone library is open to explore.</p>
            </div>
            <Link href="/packs" className="inline-flex items-center gap-2 text-sm font-medium text-[#b6ddcc] underline decoration-[#315e55]/30 underline-offset-8 transition hover:text-[#f2f0ea]">
              Browse the tone library <ArrowRight className="size-4" weight="bold" />
            </Link>
          </div>
        </section>
      </main>

      <PublicTrustFooter />
    </div>
  );
}
