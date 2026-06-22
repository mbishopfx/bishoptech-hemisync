import { notFound } from 'next/navigation';
import { blogPosts, getBlogPostBySlug } from '@/lib/blog/posts';
import { getBlogPostComponentBySlug } from '@/components/blog/post-components';
import { buildAbsoluteUrl, buildPageMetadata } from '@/lib/seo';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';

const siteName = 'Cognistration';

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

  if (!PostComponent) {
    notFound();
  }

  return (
    <>
      {post ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(post)) }}
        />
      ) : null}
      <PostComponent />
      <PublicTrustFooter note="Article readers can review policy, safety, and contact details below." />
    </>
  );
}
