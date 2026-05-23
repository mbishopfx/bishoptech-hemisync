import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Clock3, Sparkles } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RecentPostsCarousel } from "@/components/blog/recent-posts-carousel";
import { blogPosts } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";

export default function BlogPage() {
  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
  );
  const featured = posts[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />
      <main className="landing-shell pt-28 md:pt-32">
        <section className="page-shell space-y-10">
          <div className="max-w-4xl space-y-6">
            <p className="section-label">HemiSync Blog</p>
            <h1 className="section-title text-5xl md:text-7xl">
              Daily deep dives into brainwaves, altered states, and the weird
              edge of consciousness.
            </h1>
            <p className="hero-subtitle">
              Every post is built to be readable, research-backed, and weirdly
              fun. We translate the declassified stuff, the lab studies, and the
              practical biohacking angles into plain language you can actually
              use.
            </p>
          </div>

          {featured ? (
            <article className="relative overflow-hidden rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(12,15,24,0.96),rgba(5,7,12,0.95))] p-7 shadow-[0_40px_140px_-70px_rgba(0,0,0,1)] md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%)]" />
              <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <div className="space-y-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200/80">
                    Featured post
                  </p>
                  <h2 className="text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl md:leading-[0.95]">
                    {featured.title}
                  </h2>
                  <p className="max-w-3xl text-lg leading-8 text-zinc-300 md:text-xl md:leading-9">
                    {featured.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-zinc-400">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
                      <Sparkles className="size-3.5 text-cyan-200" />
                      {featured.category}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
                      <Clock3 className="size-3.5 text-cyan-200" />
                      {featured.readTime}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
                      <CalendarDays className="size-3.5 text-cyan-200" />
                      {new Date(featured.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 shadow-[0_24px_80px_-52px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
                    What you&apos;ll get
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                    <li>• Real studies, not just vibes.</li>
                    <li>• CIA documents explained without the tinfoil hat tax.</li>
                    <li>• Practical biohacking steps you can actually test.</li>
                    <li>• A clear distinction between evidence and speculation.</li>
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
                      href={featured.path}
                    >
                      Read featured post <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
                      href="/"
                    >
                      Back home <BookOpen className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ) : null}

          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-label">Archive</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
                  All published posts
                </h2>
              </div>
              <Link
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.08] md:inline-flex"
                href="#recent-posts"
              >
                Jump to carousel <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {posts.map((post) => (
                <article
                  className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,12,18,0.9),rgba(5,7,12,0.8))] p-6 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.95)]"
                  key={post.slug}
                >
                  <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                    <span>•</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-white">
                    {post.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {post.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Link
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.08]"
                      href={post.path}
                    >
                      Read now <ArrowRight className="size-3.5" />
                    </Link>
                    <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                      Long form
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div id="recent-posts">
            <RecentPostsCarousel posts={posts} />
          </div>
        </section>
      </main>
    </div>
  );
}
