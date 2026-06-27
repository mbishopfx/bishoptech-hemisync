'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Target, Compass, Moon, Wind, Sliders, EyeOff, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { buildAbsoluteUrl } from '@/lib/seo';

const protocols = [
  {
    icon: Compass,
    title: 'Comfortable setup',
    description: 'Use a quiet, comfortable place where you can relax without interruption. A stable posture and fewer distractions make it easier to settle in.',
    accent: 'from-cyan-500/20 to-cyan-500/0'
  },
  {
    icon: Target,
    title: 'Set one intention',
    description: 'Before you start, pick one simple goal: focus, rest, or a calmer evening. A clear intention helps the session feel more purposeful.',
    accent: 'from-purple-500/20 to-purple-500/0'
  },
  {
    icon: Headphones,
    title: 'Use headphones',
    description: 'Headphones usually give the cleanest listening experience. They help keep the audio focused and comfortable.',
    accent: 'from-pink-500/20 to-pink-500/0'
  },
  {
    icon: Moon,
    title: 'Match the time of day',
    description: 'Choose a session that fits your moment: lighter focus sessions for daytime and softer ones for wind-down or rest.',
    accent: 'from-blue-500/20 to-blue-500/0'
  },
  {
    icon: Wind,
    title: 'Slow breathing',
    description: 'A few slow breaths can help you unwind before listening and make the session feel easier to settle into.',
    accent: 'from-teal-500/20 to-teal-500/0'
  },
  {
    icon: Sliders,
    title: 'Keep the volume comfortable',
    description: 'The best setting is usually a moderate, comfortable volume. You should be able to relax, not strain.',
    accent: 'from-indigo-500/20 to-indigo-500/0'
  },
  {
    icon: EyeOff,
    title: 'Let it be simple',
    description: 'Try not to overanalyze the session. Let it play in the background and notice how it feels over time.',
    accent: 'from-emerald-500/20 to-emerald-500/0'
  }
];

function UnicodeCyberBadge({ icon: IconComponent, index }) {
  const [frameChar, setFrameChar] = useState('■');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setFrameChar('■');
      return;
    }

    const chars = ['▖', '▘', '▝', '▗'];
    let idx = 0;
    const interval = setInterval(() => {
      setFrameChar(chars[idx]);
      idx = (idx + 1) % chars.length;
    }, 150);

    return () => clearInterval(interval);
  }, [isHovered]);

  const statusCodes = [
    'ALIGN_HZ',
    'INTENT_SET',
    'ISOLATE_CH',
    'CIRCAD_SYNC',
    'BREATHE_SYS',
    'LEVEL_CTRL',
    'SURRENDER_CMD'
  ];

  return (
    <div 
      className="flex items-center gap-3.5 mb-6 select-none font-mono text-xs"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sharp square terminal box (no rounded border style) */}
      <div className="relative size-11 border border-white/10 bg-zinc-950/60 flex items-center justify-center transition-all duration-300 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-none shrink-0">
        {/* Animated matrix line scanner */}
        <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent top-0 animate-[bounce_2s_infinite] pointer-events-none opacity-0 group-hover:opacity-100" />
        <IconComponent className="size-[18px] text-white/50 group-hover:text-cyan-400 transition-colors duration-300" />
      </div>

      {/* Cyber animated bracket text */}
      <div className="flex flex-col justify-center overflow-hidden">
        <div className="flex items-center gap-1.5 text-zinc-500 group-hover:text-cyan-500/60 transition-colors duration-300 text-[10px]">
          <span className="text-cyan-500/30 group-hover:animate-pulse">▶</span>
          <span>[</span>
          <span className="text-white/80 font-bold group-hover:text-cyan-400 transition-colors">{frameChar}</span>
          <span className="font-semibold tracking-wider">{statusCodes[index] || 'SYS_OK'}</span>
          <span>]</span>
        </div>
        <span className="text-[7.5px] text-zinc-600 tracking-[0.25em] uppercase mt-0.5 group-hover:text-cyan-400/30 transition-colors">
          node_protocol_0{index + 1}
        </span>
      </div>
    </div>
  );
}

export default function TutorialPage() {
  const tutorialJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tutorial | Cognistration',
    url: buildAbsoluteUrl('/tutorial'),
    description: 'A calm setup guide for Cognistration listening sessions.'
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tutorialJsonLd) }}
      />
      <PublicHeader />

      {/* Ambient background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      <main className="pt-40 pb-32 px-6 relative z-10 max-w-6xl mx-auto">
        {/* Page Heading */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-20">
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Listening Protocols</p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-light tracking-tighter text-white"
          >
            Optimal <span className="text-white/20 italic">resonance.</span>
          </motion.h1>
          <p className="text-white/40 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            Follow this simple guide to get the most from a calm, focused listening session.
          </p>
        </div>

        {/* Bento Grid Protocol Layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-24">
          {protocols.map((step, i) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className={`relative overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl p-8 hover:border-cyan-500/20 transition-all duration-300 group flex flex-col justify-between`}
              >
                {/* Accent Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div>
                  <UnicodeCyberBadge icon={IconComponent} index={i} />
                  <h3 className="text-xl font-medium tracking-tight text-white mb-4">
                    <span className="text-white/25 mr-2 font-mono text-sm">0{i + 1}.</span>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/45 font-light">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-[9px] font-mono text-white/20 uppercase tracking-widest group-hover:text-cyan-500/70 transition-colors">
                  <span>Protocol Standard</span>
                  <Check className="size-3" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* State Accelerator Shortcuts */}
        <section className="bg-zinc-900/30 rounded-[3rem] border border-white/5 p-10 md:p-12 relative overflow-hidden mb-24">
          <div className="absolute inset-0 bg-purple-500/5 blur-[80px] pointer-events-none" />
          <div className="relative grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <p className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.4em]">Listening Basics</p>
              <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white">Simple setup helps sessions feel better.</h2>
              <p className="text-sm leading-relaxed text-white/50 font-light">
                A few small habits can make a listening session calmer and more consistent:
              </p>
              <ul className="space-y-4 text-xs font-mono text-white/70 uppercase tracking-wider">
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" /> Use a quiet space with fewer distractions.
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" /> Pick a time of day that matches your goal.
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" /> Set one simple intention before you press play.
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" /> Keep the volume comfortable and easy on the ears.
                </li>
              </ul>
            </div>

            <div className="rounded-[2.5rem] border border-white/5 bg-zinc-950/40 p-8 md:p-10 backdrop-blur-sm space-y-6">
              <h3 className="text-xl font-medium text-white tracking-tight">The idea is simple.</h3>
              <p className="text-sm text-white/40 leading-relaxed font-light">
                Cognistration is designed to make listening feel calm, intentional, and repeatable. The value is in a clear routine, a comfortable setup, and a premium audio experience.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-black hover:bg-zinc-200 px-6 py-3 text-[10px] font-mono uppercase tracking-wider font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  Explore Premium Tiers <ChevronRight className="size-3.5" />
                </Link>
                <Link
                  href="/machine"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3 text-[10px] font-mono uppercase tracking-wider text-white transition-all"
                >
                  Inside the Machine
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="text-center py-20 bg-zinc-900/30 rounded-[4rem] border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-4">Start a quieter session.</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-10 font-light leading-relaxed">
            Begin with a quiet 15-minute slot. Put on your headphones, choose your intention, and see how the session feels.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xs mx-auto">
            <Link 
              href="/signup" 
              className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group text-sm"
            >
              Get Started Free <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>Optimal Protocol Node</span>
            <span>Cognistration Console v1.0.5</span>
          </div>
          <div className="flex gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/ai-disclosure" className="hover:text-white transition-colors">AI Disclosure</Link>
            <Link href="/health-warning" className="hover:text-white transition-colors">Health Warning</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <span>&copy; 2026 Cognistration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
