'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { blogPosts } from '@/lib/blog/posts';

export default function BlogPage() {
  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <PublicHeader />

      {/* Ambient Cyber Neon Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      <main className="pt-40 pb-32 px-6 relative z-10 max-w-6xl mx-auto">
        {/* De-cluttered, clean section grid */}
        <div className="mb-8 border-b border-white/5 pb-6">
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Published Archives</p>
        </div>

        {/* 3-Column Responsive Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/30 backdrop-blur-xl p-8 hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between min-h-[350px]"
            >
              {/* Card background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div>
                {/* Meta details */}
                <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-[0.25em] text-white/30 mb-6">
                  <span className="text-cyan-400">{post.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="size-2.5" /> {post.readTime}</span>
                </div>

                {/* Post Title */}
                <h3 className="text-2xl font-light tracking-tight text-white leading-snug group-hover:text-cyan-400 transition-colors mb-4">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm leading-relaxed text-white/45 font-light line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              {/* Bottom footer card segment */}
              <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/5 z-10">
                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 px-5 py-2.5 text-[9px] font-mono uppercase tracking-wider text-white hover:text-cyan-200 transition-all"
                  href={post.path}
                >
                  Read Now <ArrowRight className="size-3" />
                </Link>
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/20 flex items-center gap-1">
                  <Calendar className="size-2.5" />
                  {new Date(post.publishedAt).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/50 mt-20">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>Secured Node</span>
            <span>HemiSync Chronicles v1.0.5</span>
          </div>
          <div className="flex gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>&copy; 2026 HemiSync.sys</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
