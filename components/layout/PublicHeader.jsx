'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Cpu, Info, DollarSign, Zap } from 'lucide-react';

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-[100] bg-black/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative size-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full group-hover:bg-cyan-500/40 transition-colors" />
              <Image 
                src="/images/logo.png" 
                alt="BishopTech Logo" 
                width={40} 
                height={40} 
                className="relative z-10 brightness-110 contrast-125"
              />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-bold tracking-tighter text-white">HemiSync<span className="text-white/40">.sys</span></span>
              <span className="text-[8px] font-mono text-cyan-500/50 uppercase tracking-[0.3em]">Neural_Nodes_v1</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/machine" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Cpu className="size-4" /> Inside the Machine
            </Link>
            <Link href="/learn" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Info className="size-4" /> Learn
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
            className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Get Started <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button 
            className="lg:hidden p-2 text-white/50 hover:text-white"
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
            className="lg:hidden absolute top-20 w-full bg-zinc-900 border-b border-white/10 p-6 flex flex-col gap-6 text-lg font-medium z-[101]"
          >
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/machine" onClick={() => setIsMobileMenuOpen(false)}>Inside the Machine</Link>
            <Link href="/learn" onClick={() => setIsMobileMenuOpen(false)}>Learn More</Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <hr className="border-white/5" />
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-cyan-400">Get Started</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
