import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { blogPosts, getBlogPostBySlug } from '@/lib/blog/posts';
import { getBlogPostComponentBySlug } from '@/components/blog/post-components';
import { buildAbsoluteUrl, buildPageMetadata } from '@/lib/seo';
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
    image: buildAbsoluteUrl('/images/logo.png')
  };
}

export function generateStaticParams() {
  return blogPosts.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return buildPageMetadata({
      title: 'Blog Post | Cognistration',
      description: 'Cognistration blog article.',
      path: `/blog/${params.slug}`
    });
  }

  return buildPageMetadata({
    title: `${post.title} | Cognistration`,
    description: post.excerpt,
    path: post.path
  });
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
