import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
              className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.05]"
              href="/blog"
            >
              <ArrowLeft className="size-3.5" /> Back to archive
            </Link>
            <Link
              className="hidden rounded-full border border-slate-800/80 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/[0.05] md:inline-flex"
              href="/"
            >
              Home
            </Link>
          </div>

          <ConsciousnessMechanicsPost />

          <div className="rounded-[28px] border border-slate-800/70 bg-[linear-gradient(180deg,rgba(8,11,16,0.9),rgba(4,6,10,0.86))] p-7 shadow-[0_28px_90px_-54px_rgba(0,0,0,0.96)] md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
              Post metadata
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <span>{consciousnessMechanicsPost.readTime}</span>
              <span>{new Date(consciousnessMechanicsPost.publishedAt).toLocaleDateString()}</span>
              <span>{consciousnessMechanicsPost.category}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
