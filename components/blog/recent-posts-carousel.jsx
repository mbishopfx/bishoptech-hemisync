"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { blogPosts, getRecentBlogPosts } from "@/lib/blog/posts";

function BlogCard({ post }) {
  return (
    <article className="group flex w-[320px] shrink-0 flex-col justify-between rounded-[1.5rem] border border-white/12 bg-[#0b1211] p-5 shadow-[0_14px_36px_rgba(45,65,59,0.05)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:border-[#9db9aa] hover:bg-white/[0.06] md:w-[380px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 text-xs text-white/50">
          <span className="font-medium text-[#b6ddcc]">{post.category}</span>
          <span>{post.readTime}</span>
        </div>
        <h3 className="text-2xl font-medium leading-tight tracking-[-0.04em] text-[#f2f0ea]">
          {post.title}
        </h3>
        <p className="text-sm leading-7 text-white/60">
          {post.excerpt}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="text-xs text-white/50">
          {new Date(post.publishedAt).toLocaleDateString()}
        </span>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-[#b6ddcc] transition-colors hover:text-[#f2f0ea]"
          href={post.path}
        >
          Read post <ArrowRight className="size-4" weight="bold" />
        </Link>
      </div>
    </article>
  );
}

export function RecentPostsCarousel({ posts = getRecentBlogPosts(6) }) {
  const visiblePosts = posts.length > 0 ? posts : blogPosts;
  const trackPosts = [...visiblePosts, ...visiblePosts];

  return (
    <section className="relative w-full max-w-full overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.04] px-5 py-8 shadow-[0_20px_50px_rgba(45,65,59,0.05)] backdrop-blur-xl md:px-10 md:py-10">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#f7f8f5] via-[#f7f8f5]/85 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#f7f8f5] via-[#f7f8f5]/85 to-transparent" />

      <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-medium text-[#b6ddcc]">
            Recent reads
          </p>
          <h2 className="text-3xl font-medium leading-tight tracking-[-0.045em] text-[#f2f0ea] md:text-4xl">
            The latest notes, ready when you have a little room to read.
          </h2>
        </div>
        <Link
          className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-4 py-2 text-sm font-medium text-[#b6ddcc] transition-colors hover:border-[#7fa594] hover:bg-white/[0.06] md:inline-flex"
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
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-4 py-2 text-sm font-medium text-[#b6ddcc] transition-colors hover:border-[#7fa594] hover:bg-white/[0.06]"
          href="/blog"
        >
          View archive
        </Link>
      </div>
    </section>
  );
}
