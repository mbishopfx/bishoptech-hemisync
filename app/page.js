'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Omnibar } from '@/components/agent/Omnibar';
import { LibraryPlayer } from '@/components/audio/LibraryPlayer';
import { AgenticAuthModal } from '@/components/auth/AgenticAuthModal';
import Link from 'next/link';
import { Menu, X, ChevronRight, Zap, Shield, Cpu, Info, DollarSign } from 'lucide-react';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [agentMessage, setAgentMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleGenerate = async (mood) => {
    setIsLoading(true);
    setAgentMessage('');
    
    try {
      // Direct call to our API, bypassing any potential proxy loops
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'AUTH_REQUIRED') {
          setIsAuthModalOpen(true);
        } else {
          console.error(data.error);
        }
        return;
      }

      setAgentMessage(data.agentMessage);
      setCurrentTrack(data.track);
    } catch (err) {
      console.error('Failed to connect to agent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      {/* Header Navigation */}
      <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="size-8 rounded-lg bg-white flex items-center justify-center text-black font-bold group-hover:scale-110 transition-transform">H</div>
              <span className="text-xl font-bold tracking-tighter">HemiSync<span className="text-white/40">.sys</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/machine" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Cpu className="size-4" /> Inside the Machine
              </Link>
              <Link href="/learn" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Info className="size-4" /> Learn More
              </Link>
              <Link href="/pricing" className="hover:text-white transition-colors flex items-center gap-1.5">
                <DollarSign className="size-4" /> Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-white/50 hover:text-white transition-colors">Sign In</Link>
            <Link 
              href="/signup" 
              className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 group"
            >
              Get Started <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button 
              className="md:hidden p-2 text-white/50 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-20 w-full bg-zinc-900 border-b border-white/10 p-6 flex flex-col gap-6 text-lg font-medium"
            >
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link href="/machine" onClick={() => setIsMobileMenuOpen(false)}>Inside the Machine</Link>
              <Link href="/learn" onClick={() => setIsMobileMenuOpen(false)}>Learn More</Link>
              <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
              <hr className="border-white/5" />
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-40 pb-20 px-6 relative z-10 flex flex-col items-center gap-20">
        {/* Hero Copy */}
        <div className="text-center space-y-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4"
          >
            <Zap className="size-3 fill-current" /> Free 7-Day Trial Active
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-white"
          >
            Cognitive <span className="text-white/20 italic">Orchestration</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/40 text-xl md:text-2xl font-light tracking-tight max-w-xl mx-auto leading-relaxed"
          >
            Describe your current state. Our agent will match you to a precision frequency to shift your cognitive baseline.
          </motion.p>
        </div>

        {/* Omnibar & Player */}
        <div className="w-full flex flex-col items-center gap-12">
          <Omnibar 
            onGenerate={handleGenerate} 
            isLoading={isLoading} 
            agentMessage={agentMessage}
          />

          <AnimatePresence mode="wait">
            {currentTrack && (
              <LibraryPlayer 
                track={currentTrack} 
                onFinished={() => console.log('Session complete')}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Value Props / Machine Preview */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 w-full max-w-6xl mt-20"
        >
          {[
            { icon: Zap, title: "7 Sessions Free", body: "Experience full neural alignment with 7 generation credits over 7 days." },
            { icon: Shield, title: "Stripe Secured", body: "Enterprise-grade subscription management with transparent auto-renewal." },
            { icon: Cpu, title: "100+ Nodes", body: "Access a vast library of pre-calculated brain states for instant switching." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <item.icon className="size-8 text-cyan-400 mb-6" />
              <h3 className="text-xl font-medium mb-3">{item.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm">{item.body}</p>
            </div>
          ))}
        </motion.section>
      </main>

      {/* Footer Status */}
      <footer className="py-12 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>System Status: Optimal</span>
            <span>100+ Frequencies Online</span>
            <span>Binaural Phase Lock: Active</span>
          </div>
          <div className="flex gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>&copy; 2026 HemiSync.sys</span>
          </div>
        </div>
      </footer>

      <AgenticAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
