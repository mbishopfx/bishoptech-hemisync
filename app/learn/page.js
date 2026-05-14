'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useSpring } from 'framer-motion';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Zap, Activity, Brain, Shield, ArrowRight, BookOpen, Microscope, Lock, Eye, Cpu, Database, Network, Binary, FlaskConical, Target } from 'lucide-react';
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
          className="space-y-6 max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono tracking-[0.4em] uppercase mb-4">
            Masterclass // Session_Protocol_01
          </div>
          <h1 className="text-6xl md:text-[10rem] font-light tracking-tighter leading-none">
            The Science of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500">
              Neural Entrainment
            </span>
          </h1>
          <p className="text-white/40 text-xl md:text-3xl font-light max-w-3xl mx-auto leading-relaxed mt-12">
            An exhaustive technical breakdown of bi-directional frequency orchestration and the subcortical biological response.
          </p>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 text-white/20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Initialize Deep Dive</span>
          <div className="w-px h-12 bg-gradient-to-b from-cyan-500/50 to-transparent" />
        </motion.div>
      </section>

      {/* Section 1: The Physics of Sound */}
      <section className="py-60 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          <div className="size-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Microscope className="size-8" />
          </div>
          <h2 className="text-5xl md:text-7xl font-light tracking-tight">01. Bi-Directional <br/>Beat Logic</h2>
          <p className="text-white/50 text-xl leading-relaxed">
            The fundamental unit of HemiSync technology is the <strong>Binaural Beat</strong>. Unlike standard audio, these are not heard in the traditional sense; they are <strong>calculated</strong> within the subcortical brainstem.
          </p>
          <p className="text-white/40 text-lg leading-relaxed">
             By presenting two pure sine waves of slightly different frequencies to each ear, the brain attempts to reconcile the phase difference. This creates a perceived pulse—the phantom tone—that forces neural clusters to fire in synchrony with the differential.
          </p>
          <div className="p-10 rounded-[3rem] bg-white/5 border border-white/5 space-y-6">
            <p className="font-mono text-[10px] text-cyan-500 uppercase tracking-[0.4em]">Operational Example:</p>
            <div className="flex items-center gap-8 font-mono text-3xl md:text-5xl">
              <div className="text-white/30 tracking-tighter">220Hz</div>
              <div className="text-cyan-400 opacity-50">-</div>
              <div className="text-white/30 tracking-tighter">210Hz</div>
              <div className="text-cyan-400">=</div>
              <div className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">10Hz</div>
            </div>
            <div className="pt-4 flex gap-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                <span>Left_Node</span>
                <span>Right_Node</span>
                <span className="text-cyan-500">Calculated_Alpha</span>
            </div>
          </div>
        </motion.div>
        
        <div className="relative aspect-square flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[120px] rounded-full" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-white/5 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute inset-10 border border-cyan-500/10 rounded-full border-dashed"
          />
          <div className="relative w-full h-64 flex items-center justify-center gap-1.5">
            {Array.from({ length: 60 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-cyan-500/40 rounded-full"
                animate={{ 
                  height: [20, 100 + Math.sin(i * 0.3) * 80, 20],
                  opacity: [0.2, 1, 0.2]
                }}
                transition={{ 
                  duration: 1.5 + Math.random(), 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: The Biological Bridge */}
      <section className="py-60 bg-zinc-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-32 items-center">
          <div className="order-2 lg:order-1 relative aspect-video bg-black/60 rounded-[4rem] border border-white/10 overflow-hidden p-12 flex flex-col justify-center shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute inset-0 bg-repeat bg-center opacity-10" style={{ backgroundImage: 'url("/images/logo.png")', backgroundSize: '100px' }} />
             </div>
             <div className="relative space-y-10">
              <div className="flex justify-between items-end border-b border-white/10 pb-6">
                <div className="space-y-1">
                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.4em]">Subcortical_Source</span>
                    <h4 className="text-xl font-medium tracking-tight">Superior Olivary Nucleus</h4>
                </div>
                <span className="text-cyan-500 font-mono text-xs animate-pulse">LOCKED_ON_SIGNAL</span>
              </div>
              <div className="space-y-6">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <p className="font-mono text-[10px] text-white/40 leading-relaxed uppercase tracking-[0.3em]">
                   Inter-hemispheric phase-lock initiated. <br/>
                   Processing Hz differential at sub-millisecond precision. <br/>
                   Biometric state shift detected: [ THETA_BAND ].
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 {[1,2,3].map(i => (
                     <div key={i} className="h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                        <Activity className="size-6 text-white/10" />
                     </div>
                 ))}
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-10">
            <div className="size-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Brain className="size-8" />
            </div>
            <h2 className="text-5xl md:text-7xl font-light tracking-tight">02. Hemispheric <br/>Synchronization</h2>
            <p className="text-white/50 text-xl leading-relaxed">
              Standard brain activity is asymmetric—different regions fire at different frequencies based on localized tasks. <strong>Hemi-Sync</strong> overrides this fragmentation.
            </p>
            <p className="text-white/40 text-lg leading-relaxed">
              By providing the brain with a single frequency to reconcile, we induce a state where both the left and right hemispheres move in a single, coherent rhythm. This is the biological foundation for peak performance, lucid dreaming, and deep meditative insight.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: The Gateway Process Expansion */}
      <section className="py-60 px-6 max-w-5xl mx-auto text-center space-y-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-zinc-900 border border-white/10 text-white/50 text-[10px] font-mono tracking-[0.4em] uppercase">
            <Lock className="size-3" /> Declassified // Protocol_96-00788R
          </div>
          <h2 className="text-5xl md:text-8xl font-light tracking-tighter leading-tight">Evidence of the <br/>Hidden Mechanism</h2>
          <p className="text-white/40 text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto">
            The 1983 CIA assessment remains the gold standard for understanding how these frequencies bypass sensory boundaries.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
            {[
                { label: "FFR", desc: "Frequency Following Response. The brain's involuntary tendency to mimic external rhythmic pulses.", icon: Target },
                { label: "Binaural", desc: "Stereo-differential tone generation requiring precise phase-locked headphones.", icon: FlaskConical },
                { label: "Entrainment", desc: "The process of moving neural oscillators from a state of chaos to specific Hz coherence.", icon: Network }
            ].map((stat, i) => (
                <div key={i} className="p-10 rounded-[3rem] bg-white/5 border border-white/5 text-left group hover:border-cyan-500/30 transition-all">
                    <stat.icon className="size-8 text-cyan-400 mb-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                    <h4 className="text-xl font-bold font-mono tracking-widest uppercase mb-4">{stat.label}</h4>
                    <p className="text-white/30 text-sm leading-relaxed">{stat.desc}</p>
                </div>
            ))}
        </div>

        <div className="bg-white/5 rounded-[4rem] p-16 border border-white/5 text-left relative group overflow-hidden">
          <div className="absolute -top-20 -right-20 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Image src="/images/logo.png" alt="" width={400} height={400} />
          </div>
          <div className="relative space-y-8">
            <div className="size-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <FileText className="size-6" />
            </div>
            <h3 className="text-3xl md:text-5xl font-light tracking-tight">The 1983 Intelligence Assessment</h3>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
              &quot;The Hemi-Sync process utilizes binaural beats to achieve a state of hemispheric synchronization... effectively establishing a gateway to altered states of consciousness where the linear constraints of time and space are fundamentally recalculated.&quot;
            </p>
            <div className="flex flex-wrap gap-8 pt-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Document_ID</p>
                    <p className="text-sm font-medium">CIA-RDP96-00788R</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Classification</p>
                    <p className="text-sm font-medium text-cyan-400">DECLASSIFIED_10.03.03</p>
                 </div>
            </div>
            <Link 
              href="https://www.cia.gov/readingroom/docs/cia-rdp96-00788r001700210023-7.pdf"
              target="_blank"
              className="mt-8 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm inline-flex items-center gap-3 hover:bg-white/10 transition-all uppercase tracking-widest"
            >
              Verify Documentation <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: Use Cases Master List */}
      <section className="py-60 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32">
            <div className="max-w-2xl space-y-6">
                <p className="text-cyan-500 font-mono text-xs tracking-[0.4em] uppercase">Applied_Neuroscience</p>
                <h2 className="text-5xl md:text-7xl font-light tracking-tight leading-none">Protocols for <br/>Neural Dominance</h2>
            </div>
            <p className="text-white/30 text-xl font-light max-w-sm">
                Each node in our library is mapped to a specific cognitive outcome based on these protocols.
            </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {[
            { 
              title: "The Beta Protocol", 
              hz: "14-30Hz",
              use: "High-Alert Synthesis", 
              body: "Utilized for complex logic processing, software architecture, and competitive strategic environments. Beta spikes the brain's focus window into a high-intensity narrow aperture.",
              icon: Binary 
            },
            { 
              title: "The Alpha Protocol", 
              hz: "8-14Hz",
              use: "Fluid Productivity", 
              body: "The bridge between rest and work. Ideal for creative writing, design, and entering a 'Flow State' where the inner critic is silenced and execution becomes effortless.",
              icon: Zap 
            },
            { 
              title: "The Theta Protocol", 
              hz: "4-8Hz",
              use: "Deep Insight Retrieval", 
              body: "The hypnagogic gateway. Theta access allows for the retrieval of subconscious patterns and creative breakthroughs that occur during the border of sleep and wakefulness.",
              icon: Database 
            },
            { 
              title: "The Delta Protocol", 
              hz: "0.5-4Hz",
              use: "Cellular Restoration", 
              body: "Maximum hemispheric synchronization. Delta states trigger the release of regenerative hormones and facilitate deep physical recovery beyond standard sleep cycles.",
              icon: Shield 
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-12 rounded-[3.5rem] bg-zinc-900/30 border border-white/5 hover:border-cyan-500/20 transition-all group flex flex-col justify-between h-full"
            >
              <div>
                  <div className="flex justify-between items-start mb-12">
                    <item.icon className="size-10 text-cyan-400 opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
                    <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono tracking-widest uppercase text-white/40">{item.hz}</span>
                  </div>
                  <h3 className="text-3xl font-medium mb-4">{item.title}</h3>
                  <p className="text-cyan-500/80 font-mono text-[10px] uppercase tracking-[0.4em] mb-6">{item.use}</p>
                  <p className="text-white/40 text-lg leading-relaxed">{item.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing Masterclass */}
      <section className="py-60 px-6 text-center bg-gradient-to-b from-transparent to-cyan-500/10 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
             <div className="relative size-32 mx-auto">
                <div className="absolute inset-0 bg-cyan-500/20 blur-[40px] rounded-full animate-pulse" />
                <Image 
                    src="/images/logo.png" 
                    alt="BishopTech Logo" 
                    width={128} 
                    height={128} 
                    className="relative z-10 brightness-110"
                />
             </div>
            <h2 className="text-5xl md:text-9xl font-light tracking-tighter leading-none">Begin the <br/> Synchronization.</h2>
            <p className="text-white/50 text-xl md:text-3xl font-light max-w-3xl mx-auto leading-relaxed">
              Knowledge was the first sequence. Activation is the second. Your neural baseline is now a parameter within your control.
            </p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
            <Link 
              href="/signup" 
              className="px-16 py-6 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 group shadow-2xl text-lg uppercase tracking-widest"
            >
              Access Platform <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/pricing" 
              className="px-16 py-6 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center text-lg uppercase tracking-widest"
            >
              View Tiers
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
             <Image src="/images/logo.png" alt="BishopTech" width={40} height={40} className="grayscale opacity-20" />
             <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">
                <span>Neural Engineering</span>
                <span>Est. 2026</span>
             </div>
          </div>
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors uppercase tracking-[0.3em]">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors uppercase tracking-[0.3em]">Privacy</Link>
            <span className="uppercase tracking-[0.3em]">&copy; HemiSync.sys</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
