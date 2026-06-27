import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { blogPosts, getBlogPostBySlug } from '@/lib/blog/posts';
import { getBlogPostComponentBySlug } from '@/components/blog/post-components';
import { buildAbsoluteUrl } from '@/lib/seo';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';

const siteName = 'Cognistration';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';

function buildArticleJsonLd(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: siteName,
      url: buildAbsoluteUrl('/')
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: buildAbsoluteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: buildAbsoluteUrl('/images/logo.png')
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': buildAbsoluteUrl(post.path)
    },
    url: buildAbsoluteUrl(post.path),
    image: buildAbsoluteUrl('/images/og-preview.png')
  };
}

function FallbackBlogPost({ post }) {
  return (
    <article className="space-y-8">
      <header className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
          Cognistration Blog
        </p>
        <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
          {post.title}
        </h1>
        <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
          <span>{post.category}</span>
          <span>{post.readTime}</span>
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>
      </header>

      <section className="space-y-5 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Summary view
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            This post is registered in the blog archive, but the custom article component was not
            available in the current build. The summary view keeps the route live while the post
            metadata and public links remain accessible.
          </p>
          <p>
            The archive, sitemap, and article metadata still point to this page, so the published
            slug stays verifiable even if the bespoke layout needs another pass.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-sm text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white"
          href="/blog"
        >
          Back to the archive
        </Link>
        <Link
          className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-sm text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white"
          href="/tutorial"
        >
          Open the setup guide
        </Link>
      </section>
    </article>
  );
}

export function generateStaticParams() {
  return blogPosts.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: { absolute: 'Blog Post — Cognistration' },
      description: 'Cognistration blog article.',
      alternates: { canonical: `/blog/${params.slug}` },
      openGraph: {
        title: 'Blog Post — Cognistration',
        description: 'Cognistration blog article.',
        siteName: 'Cognistration',
        type: 'article',
        url: `/blog/${params.slug}`,
        images: [{ url: '/images/og-preview.png', width: 886, height: 886, alt: 'Cognistration preview' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Blog Post — Cognistration',
        description: 'Cognistration blog article.',
        images: ['/images/og-preview.png'],
      },
    };
  }

  return {
    title: { absolute: `${post.title} — Cognistration` },
    description: post.excerpt,
    alternates: { canonical: post.path },
    openGraph: {
      title: `${post.title} — Cognistration`,
      description: post.excerpt,
      siteName: 'Cognistration',
      type: 'article',
      url: post.path,
      images: [{ url: '/images/og-preview.png', width: 886, height: 886, alt: 'Cognistration preview' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — Cognistration`,
      description: post.excerpt,
      images: ['/images/og-preview.png'],
    },
  };
}

export default function BlogPostPage({ params }) {
  const PostComponent = getBlogPostComponentBySlug(params.slug);
  const post = getBlogPostBySlug(params.slug);

  if (!PostComponent || !post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      {post ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(post)) }}
        />
      ) : null}
      <PublicHeader />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      <main className="landing-shell pt-40 pb-20 relative z-10">
        <div className="mx-auto w-full max-w-4xl space-y-8 px-6 md:px-10 research-paper-style">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-white transition-colors"
              href="/blog"
            >
              <ArrowLeft className="size-3.5" /> Back to archive
            </Link>
            <Link
              className="hidden rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-white transition-colors md:inline-flex"
              href="/"
            >
              Home
            </Link>
          </div>

          <PostComponent />

          <div className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-6 shadow-2xl metadata-block">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
              Post metadata
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
              <span>Read Time: {post.readTime}</span>
              <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
              <span>Category: {post.category}</span>
              <Link href="/ai-disclosure" className="hover:text-white transition-colors">
                AI Disclosure
              </Link>
            </div>
          </div>
        </div>
      </main>
      <PublicTrustFooter />
    </div>
  );
}
