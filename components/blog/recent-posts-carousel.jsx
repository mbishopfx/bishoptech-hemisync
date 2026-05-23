"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPosts, getRecentBlogPosts } from "@/lib/blog/posts";

function BlogCard({ post }) {
  return (
    <article className="group w-[320px] shrink-0 rounded-[24px] border border-slate-800/70 bg-[linear-gradient(180deg,rgba(9,12,16,0.92),rgba(4,6,10,0.92))] p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.94)] transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.04] md:w-[380px]">
      <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
        <span>{post.category}</span>
        <span>{post.readTime}</span>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-white">
        {post.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-zinc-400">
        {post.excerpt}
      </p>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
          {new Date(post.publishedAt).toLocaleDateString()}
        </span>
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.08]"
          href={post.path}
        >
          Read post <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function RecentPostsCarousel({ posts = getRecentBlogPosts(6) }) {
  const visiblePosts = posts.length > 0 ? posts : blogPosts;
  const trackPosts = [...visiblePosts, ...visiblePosts];

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-slate-800/70 bg-[linear-gradient(180deg,rgba(9,12,16,0.9),rgba(4,6,10,0.9))] px-6 py-8 shadow-[0_28px_90px_-54px_rgba(0,0,0,0.96)] md:px-10 md:py-10">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#040404] via-[#040404]/90 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#040404] via-[#040404]/90 to-transparent" />

      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
            Recent reads
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
            The latest deep dives, sliding by like a signal train.
          </h2>
        </div>
        <Link
          className="hidden items-center gap-2 rounded-full border border-slate-800/80 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.05] md:inline-flex"
          href="/blog"
        >
          View archive
        </Link>
      </div>

      <div className="overflow-hidden">
        <div className="flex min-w-max gap-5 animate-[blog-marquee_44s_linear_infinite] hover:[animation-play-state:paused]">
          {trackPosts.map((post, index) => (
            <BlogCard key={`${post.slug}-${index}`} post={post} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex md:hidden">
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.05]"
          href="/blog"
        >
          View archive
        </Link>
      </div>
    </section>
  );
}
