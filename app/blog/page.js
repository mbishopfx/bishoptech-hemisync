import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      <PublicHeader />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      <main className="landing-shell pt-40 pb-20 px-6 relative z-10">
        <section className="page-shell space-y-16 max-w-5xl mx-auto">
          {featured ? (
            <article className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-2xl md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_32%)] pointer-events-none" />
              <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <div className="space-y-5">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
                    Featured post
                  </p>
                  <h2 className="text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
                    {featured.title}
                  </h2>
                  <p className="max-w-3xl text-sm leading-relaxed text-white/50">
                    {featured.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
                    <span>{featured.category}</span>
                    <span>{featured.readTime}</span>
                    <span>{new Date(featured.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-6 backdrop-blur-sm">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
                    What you&apos;ll get
                  </p>
                  <ul className="mt-4 space-y-3 text-xs font-mono uppercase tracking-wider text-white/60">
                    <li>• Real studies, not just vibes.</li>
                    <li>• CIA documents explained clearly.</li>
                    <li>• Practical biohacking steps you can test.</li>
                    <li>• Distinction between evidence & speculation.</li>
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      className="inline-flex items-center gap-2 rounded-full bg-white text-black hover:bg-zinc-200 px-5 py-2.5 text-[10px] font-mono uppercase tracking-wider font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                      href={featured.path}
                    >
                      Read featured post <ArrowRight className="size-3.5" />
                    </Link>
                    <Link
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-[10px] font-mono uppercase tracking-wider text-white transition-all"
                      href="/"
                    >
                      Back home
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ) : null}

          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Archive</p>
                <h2 className="mt-2 text-3xl font-light tracking-tight text-white md:text-4xl">
                  All published posts
                </h2>
              </div>
              <Link
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-white transition-colors md:inline-flex"
                href="#recent-posts"
              >
                Jump to carousel <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <article
                  className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-6 shadow-lg flex flex-col justify-between"
                  key={post.slug}
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-light tracking-tight text-white leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/50">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-white/5">
                    <Link
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/20 hover:text-white transition-all"
                      href={post.path}
                    >
                      Read now <ArrowRight className="size-3" />
                    </Link>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/20">
                      Long form
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div id="recent-posts" className="pt-8">
            <RecentPostsCarousel posts={posts} />
          </div>
        </section>
      </main>
    </div>
  );
}
