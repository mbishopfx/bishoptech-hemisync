import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { blogPosts, getBlogPostBySlug } from '@/lib/blog/posts';
import { getBlogPostComponentBySlug } from '@/components/blog/post-components';
import { buildAbsoluteUrl } from '@/lib/seo';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';

const siteName = 'Cognistration';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';

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
        url: buildAbsoluteUrl('/images/cognistration-mark.png')
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
      <header className="space-y-5 rounded-[1.75rem] border border-[#cbd6cf] bg-white/70 px-7 py-10 shadow-[0_16px_42px_rgba(45,65,59,0.05)] backdrop-blur-xl md:px-10 md:py-12">
        <h1 className="text-balance text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-[#1d302c] md:text-6xl">
          {post.title}
        </h1>
        <p className="max-w-3xl text-balance text-base leading-7 text-[#60716b]">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#779187]">
          <span>{post.category}</span>
          <span>{post.readTime}</span>
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>
      </header>

      <section className="space-y-5 rounded-[1.75rem] border border-[#cbd6cf] bg-white/70 p-7 shadow-[0_16px_42px_rgba(45,65,59,0.05)] backdrop-blur-xl md:p-8">
        <h2 className="text-3xl font-medium leading-tight tracking-[-0.045em] text-[#1d302c] md:text-4xl">
          Summary view
        </h2>
        <div className="space-y-4 text-sm leading-7 text-[#60716b]">
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
          className="rounded-[1.5rem] border border-[#cbd6cf] bg-white/60 p-5 text-sm font-medium text-[#315e55] transition-colors hover:border-[#9db9aa] hover:bg-white hover:text-[#1d302c]"
          href="/blog"
        >
          Back to the archive
        </Link>
        <Link
          className="rounded-[1.5rem] border border-[#cbd6cf] bg-white/60 p-5 text-sm font-medium text-[#315e55] transition-colors hover:border-[#9db9aa] hover:bg-white hover:text-[#1d302c]"
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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: { absolute: 'Blog Post — Cognistration' },
      description: 'Cognistration blog article.',
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: 'Blog Post — Cognistration',
        description: 'Cognistration blog article.',
        siteName: 'Cognistration',
        type: 'article',
        url: `/blog/${slug}`,
        images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brainwave mark' }],
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
      images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brainwave mark' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — Cognistration`,
      description: post.excerpt,
      images: ['/images/og-preview.png'],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const PostComponent = getBlogPostComponentBySlug(slug);
  const post = getBlogPostBySlug(slug);

  if (!PostComponent || !post) {
    notFound();
  }

  return (
    <div className="blog-light-theme min-h-[100dvh] overflow-x-hidden bg-[#eef1ee] text-[#1d302c] font-sans selection:bg-[#b6ddcc]/60">
      {post ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(post)) }}
        />
      ) : null}
      <PublicHeader />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-36">
        <div className="mx-auto w-full max-w-5xl space-y-8 research-paper-style">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#cbd6cf] pb-4">
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-[#b8cbc0] bg-white/70 px-4 py-2 text-sm font-medium text-[#315e55] transition-colors hover:border-[#7fa594] hover:bg-white"
              href="/blog"
            >
              <ArrowLeft className="size-3.5" /> Back to archive
            </Link>
            <Link
              className="hidden rounded-full border border-[#b8cbc0] bg-white/70 px-4 py-2 text-sm font-medium text-[#315e55] transition-colors hover:border-[#7fa594] hover:bg-white md:inline-flex"
              href="/"
            >
              Home
            </Link>
          </div>

          <div className="blog-article-body">
            <PostComponent />
          </div>

          <div className="metadata-block rounded-[1.75rem] border border-[#cbd6cf] bg-white/60 p-6 shadow-[0_16px_42px_rgba(45,65,59,0.05)] backdrop-blur-xl">
            <p className="text-sm font-medium text-[#315e55]">
              Post metadata
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#779187]">
              <span>Read Time: {post.readTime}</span>
              <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
              <span>Category: {post.category}</span>
                <Link href="/ai-disclosure" className="transition-colors hover:text-[#1d302c]">
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
