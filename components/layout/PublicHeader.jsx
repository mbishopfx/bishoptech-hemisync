'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-[100] bg-black/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between lg:justify-center relative">
        
        {/* Left-side Logo (Mobile/Tablet only or hidden on desktop for perfect center) */}
        <div className="lg:absolute lg:left-10">
          <Link href="/" className="flex items-center gap-3">
             <Image 
                src="/images/logo.png" 
                alt="BishopTech Logo" 
                width={32} 
                height={32} 
                className="brightness-110 contrast-125"
              />
          </Link>
        </div>

        {/* Centered Navigation */}
        <nav className="hidden lg:flex items-center gap-12 text-[11px] font-bold tracking-[0.3em] uppercase text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/machine" className="hover:text-white transition-colors">Inside the Machine</Link>
          <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
        </nav>

        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <button 
            className="p-2 text-white/50 hover:text-white"
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
            className="lg:hidden absolute top-20 w-full bg-zinc-900 border-b border-white/10 p-8 flex flex-col items-center gap-8 text-[12px] font-bold tracking-[0.4em] uppercase z-[101]"
          >
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/machine" onClick={() => setIsMobileMenuOpen(false)}>Inside the Machine</Link>
            <Link href="/learn" onClick={() => setIsMobileMenuOpen(false)}>Learn</Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
            <Link 
              href="/signup" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="w-full py-4 rounded-xl bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
