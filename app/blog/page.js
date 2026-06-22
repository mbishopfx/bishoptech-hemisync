import Link from 'next/link';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { RecentPostsCarousel } from '@/components/blog/recent-posts-carousel';
import { blogPosts, getRecentBlogPosts } from '@/lib/blog/posts';
import { buildAbsoluteUrl, buildPageMetadata } from '@/lib/seo';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';

export const metadata = buildPageMetadata({
  title: 'Blog | Cognistration',
  description: 'Evidence-aware essays and product notes about consciousness mechanics, audio sessions, and the thinking behind Cognistration.',
  path: '/blog'
});

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
      url: buildAbsoluteUrl('/images/logo.png')
    }
  }
};

function BlogCard({ post }) {
  return (
    <article className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-3xl transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
        <span className="text-cyan-400/80">{post.category}</span>
        <span>{post.readTime}</span>
      </div>
      <h2 className="mt-5 text-2xl font-light tracking-tight text-white leading-tight">
        {post.title}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-white/50">{post.excerpt}</p>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
        <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/20">
          {new Date(post.publishedAt).toLocaleDateString()}
        </span>
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-cyan-200 transition-all hover:bg-cyan-500/20 hover:text-white"
          href={post.path}
        >
          Read post <ArrowRight className="size-3" />
        </Link>
      </div>
    </article>
  );
}

export default function BlogArchivePage() {
  const recentPosts = getRecentBlogPosts(6);
  const featuredPosts = blogPosts.slice(0, 12);

  return (
    <main className="landing-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section className="rounded-[2rem] border border-white/5 bg-zinc-900/35 p-8 backdrop-blur-3xl md:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-400">
                Cognistration Blog
              </p>
              <h1 className="text-4xl font-light tracking-tighter text-white md:text-6xl">
                Essays, guides, and product notes with a calmer voice.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/55 md:text-base">
                This archive collects the site&apos;s long-form writing on consciousness mechanics, state changes, and the product thinking behind Cognistration. Each post is written to be direct, evidence-aware, and easy to cite.
              </p>
            </div>

            <div className="grid gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-white/35">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <BookOpen className="size-3.5 text-cyan-300" />
                <span>{blogPosts.length} published posts</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <ShieldCheck className="size-3.5 text-emerald-300" />
                <span>Policy and safety links stay visible</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Back Home
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-200 transition-colors hover:bg-cyan-500/15 hover:text-cyan-100"
            >
              View Pricing
            </Link>
            <Link
              href="/tutorial"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              How It Works
            </Link>
          </div>
        </section>

        <RecentPostsCarousel posts={recentPosts} />

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Archive</p>
              <h2 className="mt-2 text-3xl font-light tracking-tight text-white md:text-4xl">
                All posts, newest first.
              </h2>
            </div>
            <p className="hidden max-w-md text-right text-sm leading-6 text-white/40 md:block">
              Internal links from these posts should land on working archive and article pages.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </div>

      <PublicTrustFooter />
    </main>
  );
}
