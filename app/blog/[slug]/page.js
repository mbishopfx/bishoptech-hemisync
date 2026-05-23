import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Clock3, CalendarDays } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import ConsciousnessMechanicsPost, {
  consciousnessMechanicsPost,
} from "@/components/blog/posts/consciousness-mechanics";
import { blogPosts } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default function BlogPostPage({ params }) {
  if (params.slug !== consciousnessMechanicsPost.slug) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />
      <main className="landing-shell pt-28 md:pt-32">
        <div className="page-shell space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.08]"
              href="/blog"
            >
              <ArrowLeft className="size-3.5" /> Back to archive
            </Link>
            <Link
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.08] md:inline-flex"
              href="/"
            >
              <BookOpen className="size-3.5" /> Home
            </Link>
          </div>

          <ConsciousnessMechanicsPost />

          <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-7 shadow-[0_32px_110px_-58px_rgba(0,0,0,0.96)] md:p-8">
            <p className="section-label">Post metadata</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-zinc-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
                <Clock3 className="size-3.5 text-cyan-200" />
                {consciousnessMechanicsPost.readTime}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
                <CalendarDays className="size-3.5 text-cyan-200" />
                {new Date(consciousnessMechanicsPost.publishedAt).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
                {consciousnessMechanicsPost.category}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              This post is built to sit inside the homepage carousel, so the
              archive can stay alive with fresh long-form pieces while readers
              get a quick hit of the latest deep dive on the front page.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
