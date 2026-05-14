'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Cpu, Lock, Eye, ArrowRight, FileText, Activity } from 'lucide-react';
import Link from 'next/link';

export default function MachinePage() {
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Glitch Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 cyber-grid opacity-20" />
      </div>

      {/* Easter Egg Overlay */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-10 cursor-pointer"
            onClick={() => setShowEasterEgg(false)}
          >
            <div className="text-center space-y-8 max-w-2xl">
              <motion.h2 
                animate={{ 
                  color: ['#06B6D4', '#ffffff', '#06B6D4'],
                  textShadow: ['0 0 20px #06B6D4', '0 0 0px #ffffff', '0 0 20px #06B6D4']
                }}
                transition={{ duration: 0.1, repeat: Infinity }}
                className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic"
              >
                THEY TRIED TO HIDE THIS
              </motion.h2>
              <p className="text-white/40 font-mono text-sm leading-relaxed">
                Declassified protocol 96-00788R. The frequency following response is the key to the gateway.
                Your baseline is a choice, not a constraint.
              </p>
              <div className="flex justify-center gap-4 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                <span>[ REDACTED ]</span>
                <span>[ DECLASSIFIED ]</span>
                <span>[ DEPLOYED ]</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 rounded-lg bg-white flex items-center justify-center text-black font-bold group-hover:scale-110 transition-transform">H</div>
            <span className="text-xl font-bold tracking-tighter">HemiSync<span className="text-white/40">.sys</span></span>
          </Link>
          <nav className="flex items-center gap-8 text-sm font-medium text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <button 
              onClick={() => setShowEasterEgg(true)}
              className="text-[10px] font-mono text-white/10 hover:text-cyan-500/50 transition-colors uppercase tracking-[0.2em]"
            >
              Protocol_96
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-40 pb-40 px-6 relative z-10 max-w-6xl mx-auto">
        {/* Abstract Brain Visualization Container */}
        <section className="relative flex flex-col items-center mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative size-[300px] md:size-[500px]"
          >
            {/* Pulsing Core */}
            <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full animate-pulse" />
            
            {/* SVG Brain Map (Stylized) */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400 opacity-60">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {/* Simplified Neural Paths */}
              <motion.path 
                d="M50 20 C 70 20, 85 40, 85 60 C 85 80, 70 85, 50 85 C 30 85, 15 80, 15 60 C 15 40, 30 20, 50 20"
                fill="none" stroke="currentColor" strokeWidth="0.5" filter="url(#glow)"
                animate={{ strokeDasharray: ["0 100", "100 0"] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              {/* Inner Synaptic Web */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.circle 
                  key={i}
                  cx={30 + Math.random() * 40}
                  cy={30 + Math.random() * 40}
                  r="0.8"
                  fill="currentColor"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                />
              ))}
            </svg>

            {/* FFR Overlay Labels */}
            <div className="absolute top-0 left-0 p-4 border-l border-t border-cyan-500/30 font-mono text-[10px] text-cyan-500/50 uppercase tracking-widest">
              L_CHANNEL: 220Hz
            </div>
            <div className="absolute bottom-0 right-0 p-4 border-r border-b border-purple-500/30 font-mono text-[10px] text-purple-500/50 uppercase tracking-widest">
              R_CHANNEL: 228Hz
            </div>
          </motion.div>

          <div className="text-center mt-12 space-y-6">
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter">Inside the Machine.</h1>
            <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              We leverage the **Frequency Following Response (FFR)**—a biological hack that synchronizes your brain&apos;s electrical activity with precision-tuned stereo audio.
            </p>
          </div>
        </section>

        {/* The CIA Reference */}
        <section className="grid md:grid-cols-2 gap-16 items-center mb-40">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-white/50 text-[10px] font-mono tracking-widest uppercase">
              <Lock className="size-3" /> Declassified Research
            </div>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight">The Gateway Process.</h2>
            <p className="text-white/50 leading-relaxed">
              In 1983, the CIA authored a landmark analysis of the **Hemi-Sync** process. They discovered that by alternating the phase of signals between hemispheres, the brain could be induced into states of profound focus and expanded awareness. 
            </p>
            <p className="text-white/50 leading-relaxed italic border-l-2 border-cyan-500/30 pl-6 py-2">
              &quot;The Hemi-Sync process utilizes binaural beats to achieve a state of hemispheric synchronization, resulting in a significantly heightened state of consciousness.&quot;
            </p>
            <a 
              href="https://www.cia.gov/readingroom/docs/cia-rdp96-00788r001700210023-7.pdf" 
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-sm group"
            >
              View CIA-RDP96-00788R <FileText className="size-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <div className="bg-white/5 rounded-[3rem] p-12 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <Activity className="size-12 text-cyan-400 mb-8 opacity-50" />
            <h3 className="text-2xl font-medium mb-4">Neural Hacking.</h3>
            <p className="text-white/30 text-sm leading-relaxed mb-6">
              Feeling is a calculation. Stress, joy, focus, and sleep are all readable biometric patterns. By injecting precise Hz differentials into the auditory cortex, we override the default noise of your environment.
            </p>
            <ul className="space-y-4 text-xs font-mono text-cyan-400/60 uppercase tracking-widest">
              <li className="flex items-center gap-3"><Zap className="size-4" /> Beta: 14-30Hz | Analytical Synthesis</li>
              <li className="flex items-center gap-3"><Zap className="size-4" /> Alpha: 8-14Hz | Calm Productivity</li>
              <li className="flex items-center gap-3"><Zap className="size-4" /> Theta: 4-8Hz | Creative Breakthrough</li>
              <li className="flex items-center gap-3"><Zap className="size-4" /> Delta: 0.5-4Hz | Deep Restoration</li>
            </ul>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="text-center py-20 bg-zinc-900/30 rounded-[4rem] border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-8">Ready to shift your baseline?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/signup" 
              className="px-10 py-4 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
            >
              Initialize Sequence <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/pricing" 
              className="px-10 py-4 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Explore Tiers
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>Secured Node</span>
            <span>Agentic v1.0.4</span>
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
