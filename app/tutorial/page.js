'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Target, Compass, Moon, Wind, Sliders, EyeOff, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';

const protocols = [
  {
    icon: Compass,
    title: 'Horizontal Alignment',
    description: 'Lay down flat on a bed or a highly supportive recliner. Eliminate physical motor tension. Restricting somatic feedback minimizes motor cortex signals, freeing up maximum neural bandwidth for auditory phase-locking.',
    accent: 'from-cyan-500/20 to-cyan-500/0'
  },
  {
    icon: Target,
    title: 'Intentional Lock',
    description: 'Before booting the frequency, formulate a single, clear intention. Hold it in your mind for 60 seconds (e.g., "I will sink into deep theta rest," or "I will lock in analytical synthesis"). Intention acts as an anchor for the entrained state.',
    accent: 'from-purple-500/20 to-purple-500/0'
  },
  {
    icon: Headphones,
    title: 'Stereo Isolation',
    description: 'True binaural synchronization requires absolute channel isolation. Use high-quality over-ear noise-canceling headphones. Standard speakers blend the frequencies in the air, neutralizing the phase-following response before it reaches your ears.',
    accent: 'from-pink-500/20 to-pink-500/0'
  },
  {
    icon: Moon,
    title: 'Circadian Syncing',
    description: 'Frequencies are highly sensitive to biological clocks. Use Delta/Theta waves immediately before sleeping or upon waking to catch natural hypnagogic pathways. Reserve Alpha/Beta waves for mid-day focus windows.',
    accent: 'from-blue-500/20 to-blue-500/0'
  },
  {
    icon: Wind,
    title: 'Diaphragmatic Respiration',
    description: 'Engage in slow, deep box breathing (4s inhale, 4s hold, 4s exhale, 4s hold). Lowering your heart rate reduces autonomic nervous system background static, allowing your auditory pathway to lock onto the binaural difference waves significantly faster.',
    accent: 'from-teal-500/20 to-teal-500/0'
  },
  {
    icon: Sliders,
    title: 'Carrier Level Control',
    description: 'Maintain low, comfortable volume thresholds (around 60-65dB). Binaural beats are carrier waves; they do not need to be loud to entrain the brain. High volume generates auditory stress and ear fatigue, blocking synchronization.',
    accent: 'from-indigo-500/20 to-indigo-500/0'
  },
  {
    icon: EyeOff,
    title: 'Surrender Analytical Control',
    description: 'Do not actively listen for or analyze the pitch difference. Let the sound wash over your auditory cortex. The superior olivary complex calculates the phase differences autonomously. Intellectual effort blocks the shift by firing active beta waves.',
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
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
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
            Follow this calibrated guide to synchronize your brain hemispheres and unlock deep declassified states of consciousness.
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
              <p className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.4em]">Fast-Track Entrainment</p>
              <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white">Hemispheric Alignment accelerators.</h2>
              <p className="text-sm leading-relaxed text-white/50 font-light">
                To sink into target brainwave baselines even faster, combine audio frequencies with these physical and environmental practices:
              </p>
              <ul className="space-y-4 text-xs font-mono text-white/70 uppercase tracking-wider">
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" /> Use a sleep mask or completely darken the room.
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" /> Avoid listening within 60 minutes of large meals.
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" /> Set your goal or intention out loud before the session.
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" /> Hydrate with water prior to listening to aid neural conductivity.
                </li>
              </ul>
            </div>

            <div className="rounded-[2.5rem] border border-white/5 bg-zinc-950/40 p-8 md:p-10 backdrop-blur-sm space-y-6">
              <h3 className="text-xl font-medium text-white tracking-tight">The Science is Simple.</h3>
              <p className="text-sm text-white/40 leading-relaxed font-light">
                Our frequency generator isolates phase structures. Your auditory nerve acts as a bridge, and your neural pathways adapt via the Frequency-Following Response. There is no magic—only declassified neuro-acoustics.
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
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-4">Start your synchronization sequence.</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-10 font-light leading-relaxed">
            Begin with a quiet, undisturbed 15-minute slot. Choose your state, put on your headphones, and align your consciousness.
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
            <span>NeuroSync Console v1.0.5</span>
          </div>
          <div className="flex gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>&copy; 2026 NeuroSync.sys</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
