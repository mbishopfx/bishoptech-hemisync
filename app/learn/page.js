'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Zap, Activity, Brain, Shield, ArrowRight, BookOpen, Microscope, Lock, Eye } from 'lucide-react';
import Link from 'next/link';

export default function LearnPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <PublicHeader />

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-20 left-0 right-0 h-0.5 bg-cyan-500 origin-left z-[110]"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-6 text-center">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="space-y-6 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono tracking-[0.3em] uppercase mb-4">
            Masterclass_Node_01
          </div>
          <h1 className="text-6xl md:text-9xl font-light tracking-tighter leading-none">
            The Science of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500">
              Neural Entrainment
            </span>
          </h1>
          <p className="text-white/40 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed mt-8">
            An advanced breakdown of bi-directional frequency orchestration and the biological response of the human auditory cortex.
          </p>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 text-white/20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">Scroll to Initiate</span>
          <div className="w-px h-12 bg-gradient-to-b from-cyan-500/50 to-transparent" />
        </motion.div>
      </section>

      {/* Section 1: The Physics of Sound */}
      <section className="py-40 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="size-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Microscope className="size-6" />
          </div>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">01. Bi-Directional <br/>Beat Frequencies</h2>
          <p className="text-white/50 text-lg leading-relaxed">
            When two pure tones of slightly different frequencies are presented to each ear separately, the brain does not perceive them as two distinct sounds. Instead, it processes the <strong>arithmetic differential</strong> between them.
          </p>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <p className="font-mono text-xs text-cyan-500 uppercase tracking-widest">Calculated Logic:</p>
            <div className="flex items-center gap-6 font-mono text-2xl">
              <div className="text-white/40">220Hz <span className="text-[10px] block mt-1">Left Ear</span></div>
              <div className="text-cyan-400">-</div>
              <div className="text-white/40">210Hz <span className="text-[10px] block mt-1">Right Ear</span></div>
              <div className="text-cyan-400">=</div>
              <div className="text-white">10Hz <span className="text-[10px] block mt-1 text-cyan-500">Neural Alpha Pulse</span></div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-square flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] rounded-full" />
          {/* Interactive Pulse Visualizer */}
          <div className="relative w-full h-40 flex items-center justify-center gap-1">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-cyan-500/30 rounded-full"
                animate={{ 
                  height: [20, 60 + Math.sin(i * 0.5) * 40, 20],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 1 + Math.random(), 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 2: The Biological Bridge */}
      <section className="py-40 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative aspect-video bg-black/40 rounded-[3rem] border border-white/5 overflow-hidden p-8 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">Signal_Source: Inferior_Colliculus</span>
                <span className="text-cyan-500 font-mono text-xs">ACTIVE</span>
              </div>
              <div className="space-y-4">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                </div>
                <div className="h-2 w-2/3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-purple-500"
                    animate={{ width: ["0%", "80%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                </div>
              </div>
              <p className="font-mono text-[10px] text-white/30 leading-relaxed uppercase tracking-wider">
                Hemispheric phase-lock detected. <br/>
                Subcortical processing unit engaged. <br/>
                Frequency Following Response established.
              </p>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-8">
            <div className="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Brain className="size-6" />
            </div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">02. Superior <br/>Olivary Nucleus</h2>
            <p className="text-white/50 text-lg leading-relaxed">
              The magic happens in the <strong>Superior Olivary Nucleus</strong>—the first part of the brain that receives auditory input from both ears. This neural node is responsible for sound localization and, crucially, for calculating the phase difference between stereo signals.
            </p>
            <p className="text-white/50 text-lg leading-relaxed">
              When it detects a Hz differential, the brain creates a internal <strong>third tone</strong> (the binaural beat) to reconcile the input, effectively &quot;tuning&quot; your neural firing patterns to that specific frequency.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Declassified Evidence */}
      <section className="py-40 px-6 max-w-4xl mx-auto text-center space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-white/50 text-[10px] font-mono tracking-widest uppercase">
            <Lock className="size-3" /> Historical Protocol 96-00788R
          </div>
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter">Declassified Validation</h2>
          <p className="text-white/40 text-xl font-light leading-relaxed">
            The efficacy of hemispheric synchronization isn&apos;t just theory. For decades, it was a subject of high-level interest for intelligence agencies seeking to optimize cognitive performance.
          </p>
        </motion.div>

        <div className="bg-white/5 rounded-[3rem] p-12 border border-white/5 text-left relative group">
          <div className="absolute top-8 right-8 opacity-20 group-hover:opacity-40 transition-opacity">
            <Eye className="size-12" />
          </div>
          <h3 className="text-2xl font-medium mb-6">The CIA Analysis</h3>
          <p className="text-white/60 leading-relaxed mb-8">
            The 1983 CIA report, <em>&quot;Analysis and Assessment of Gateway Process,&quot;</em> concluded that binaural beats could successfully induce states where the human mind could &quot;bypass the normal sensory boundaries.&quot;
          </p>
          <div className="space-y-4 mb-8">
            <div className="flex gap-4 items-start">
              <div className="mt-1.5 size-1.5 rounded-full bg-cyan-500 shrink-0" />
              <p className="text-sm text-white/40 italic">&quot;Achievement of hemispheric synchronization results in a significantly heightened state of focus.&quot;</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1.5 size-1.5 rounded-full bg-cyan-500 shrink-0" />
              <p className="text-sm text-white/40 italic">&quot;FFR facilitates the entry into specific altered states of consciousness on demand.&quot;</p>
            </div>
          </div>
          <Link 
            href="https://www.cia.gov/readingroom/docs/cia-rdp96-00788r001700210023-7.pdf"
            target="_blank"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-mono text-xs uppercase tracking-widest"
          >
            Access Full Document <ArrowRight className="size-3" />
          </Link>
        </div>
      </section>

      {/* Section 4: Use Cases */}
      <section className="py-40 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-20 text-center">Applied Neural Optimization</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Analytical Depth", 
              state: "Beta (15-30Hz)", 
              body: "Ideal for complex problem solving, coding, and logical synthesis. Sharpens the focus window.",
              icon: Cpu 
            },
            { 
              title: "Creative Flow", 
              state: "Alpha (8-14Hz)", 
              body: "Bridges the gap between active work and relaxation. Perfect for brainstorming and design.",
              icon: Zap 
            },
            { 
              title: "Deep Insight", 
              state: "Theta (4-8Hz)", 
              body: "The gateway to the subconscious. Used for meditation, memory work, and vivid visualization.",
              icon: BookOpen 
            },
            { 
              title: "Restorative Reset", 
              state: "Delta (0.5-4Hz)", 
              body: "Deep restorative sleep and physical cellular recovery. Total detachment from environmental noise.",
              icon: Shield 
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-cyan-500/20 transition-all group"
            >
              <item.icon className="size-8 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
              <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">{item.state}</div>
              <h3 className="text-xl font-medium mb-4">{item.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing Masterclass */}
      <section className="py-40 px-6 text-center bg-gradient-to-b from-transparent to-cyan-500/10">
        <div className="max-w-3xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
             <Image 
                src="/images/logo.png" 
                alt="BishopTech Logo" 
                width={80} 
                height={80} 
                className="mx-auto mb-12 animate-pulse"
              />
            <h2 className="text-4xl md:text-7xl font-light tracking-tighter">Knowledge is the <br/> first sequence.</h2>
            <p className="text-white/50 text-xl mt-8 leading-relaxed">
              Now that you understand the mechanics, it&apos;s time to experience the orchestration. Every node in our library is built on these exact declassified principles.
            </p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
            <Link 
              href="/signup" 
              className="px-12 py-5 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group shadow-xl"
            >
              Start Your First Session <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/machine" 
              className="px-12 py-5 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Inside the Machine
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>Cognitive Orchestration</span>
            <span>Est. 2026</span>
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
