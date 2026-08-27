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
    <article className="group flex h-full flex-col rounded-[1.75rem] border border-[#cbd6cf] bg-white/70 p-6 shadow-[0_16px_42px_rgba(45,65,59,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#9db9aa] hover:bg-white">
      <div className="flex items-center justify-between gap-4 text-xs text-[#779187]">
        <span className="font-medium">{post.category}</span>
        <span>{post.readTime}</span>
      </div>
      <h2 className="mt-5 text-2xl font-medium leading-tight tracking-[-0.04em] text-[#1d302c]">
        {post.title}
      </h2>
      <p className="mt-4 flex-1 text-sm leading-7 text-[#60716b]">{post.excerpt}</p>
      <div className="mt-7 flex items-center justify-between gap-3 border-t border-[#dbe2dd] pt-4">
        <span className="text-xs text-[#87968f]">
          {new Date(post.publishedAt).toLocaleDateString()}
        </span>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-[#315e55] transition group-hover:text-[#1d302c]"
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
    <div className="blog-light-theme min-h-[100dvh] overflow-x-hidden bg-[#eef1ee] text-[#1d302c] selection:bg-[#b6ddcc]/60">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <PublicHeader />

      <main className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-20 px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-36">
        <section className="border-b border-[#cbd6cf] pb-16 sm:pb-20">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-24">
            <div className="max-w-4xl">
              <h1 className="max-w-4xl text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl">
                Ideas for making attention feel more deliberate.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-[#60716b] sm:text-lg">
                Clear writing on consciousness mechanics, listening practice, and the choices behind Cognistration. Read at your own pace, then take one useful idea back into the day.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/tutorial" className="inline-flex items-center gap-2 rounded-full bg-[#1d302c] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#315e55] active:translate-y-px">
                  Start with the tutorial <ArrowRight className="size-4" weight="bold" />
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#315e55] underline decoration-[#315e55]/30 underline-offset-8 transition hover:text-[#1d302c]">
                  Explore Cognistration
                </Link>
              </div>
            </div>

            <div className="border-l border-[#cbd6cf] pl-7 lg:pl-10">
              <BookOpenText className="size-9 text-[#548477]" weight="duotone" aria-hidden="true" />
              <p className="mt-7 max-w-sm text-lg leading-8 text-[#4e625b]">
                The archive moves between practical routines and the research questions that make those routines worth examining.
              </p>
              <p className="mt-5 max-w-sm text-sm leading-7 text-[#87968f]">
                Evidence-aware does not mean distant. It means being precise about what a session can support and what it cannot prove.
              </p>
            </div>
          </div>
        </section>

        <RecentPostsCarousel posts={recentPosts} />

        <section className="space-y-8">
          <div className="flex flex-col gap-4 border-b border-[#cbd6cf] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#315e55]">The archive</p>
              <h2 className="mt-2 text-4xl font-medium leading-tight tracking-[-0.055em] text-[#1d302c] sm:text-5xl">All posts, newest first.</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#7a8983] sm:text-right">
              Practical guides, product thinking, and long-form notes about how attention, sensation, and context shape a moment.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section className="border-t border-[#cbd6cf] pt-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="max-w-2xl text-3xl font-medium leading-tight tracking-[-0.045em] sm:text-4xl">Read a little. Listen a little. Keep what helps.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#60716b]">When you are ready to move from an idea into a session, the public tone library is open to explore.</p>
            </div>
            <Link href="/packs" className="inline-flex items-center gap-2 text-sm font-medium text-[#315e55] underline decoration-[#315e55]/30 underline-offset-8 transition hover:text-[#1d302c]">
              Browse the tone library <ArrowRight className="size-4" weight="bold" />
            </Link>
          </div>
        </section>
      </main>

      <PublicTrustFooter />
    </div>
  );
}
