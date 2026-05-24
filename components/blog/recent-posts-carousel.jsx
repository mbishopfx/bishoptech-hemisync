"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPosts, getRecentBlogPosts } from "@/lib/blog/posts";

function BlogCard({ post }) {
  return (
    <article className="group w-[320px] shrink-0 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-5 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.04] md:w-[380px] flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
          <span className="text-cyan-400/80">{post.category}</span>
          <span>{post.readTime}</span>
        </div>
        <h3 className="text-2xl font-light tracking-tight text-white leading-tight">
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed text-white/50">
          {post.excerpt}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-white/5">
        <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/20">
          {new Date(post.publishedAt).toLocaleDateString()}
        </span>
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/20 hover:text-white transition-all"
          href={post.path}
        >
          Read post <ArrowRight className="size-3" />
        </Link>
      </div>
    </article>
  );
}

export function RecentPostsCarousel({ posts = getRecentBlogPosts(6) }) {
  const visiblePosts = posts.length > 0 ? posts : blogPosts;
  const trackPosts = [...visiblePosts, ...visiblePosts];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/25 backdrop-blur-3xl px-6 py-8 shadow-2xl md:px-10 md:py-10">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-black via-black/80 to-transparent" />

      <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div className="max-w-2xl space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Recent reads
          </p>
          <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl">
            The latest deep dives, sliding by like a signal train.
          </h2>
        </div>
        <Link
          className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-white transition-colors md:inline-flex"
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
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-white transition-colors"
          href="/blog"
        >
          View archive
        </Link>
      </div>
    </section>
  );
}
