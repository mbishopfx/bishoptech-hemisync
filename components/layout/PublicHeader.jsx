'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-[100] bg-black/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between lg:justify-center relative">
        
        {/* Left-side Logo (Mobile/Tablet only or hidden on desktop for perfect center) */}
        <div className="lg:absolute lg:left-10">
          <Link href="/" className="flex items-center gap-3">
             <Image 
                src="/images/logo.png" 
                alt="Cognistration Logo" 
                width={32} 
                height={32} 
                className="brightness-110 contrast-125"
              />
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3 absolute right-10">
          {/* Menu Dropdown Container */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-3 z-50 w-64 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col gap-1 text-[11px] font-mono tracking-[0.2em] uppercase"
                  >
                    <Link href="/" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 rounded-xl text-white/60 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all duration-200 border border-transparent hover:border-cyan-500/10">Home</Link>
                    <Link href="/blog" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 rounded-xl text-white/60 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all duration-200 border border-transparent hover:border-cyan-500/10">Blog</Link>
                    <Link href="/machine" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 rounded-xl text-white/60 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all duration-200 border border-transparent hover:border-cyan-500/10">Inside the Machine</Link>
                    <Link href="/tutorial" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 rounded-xl text-white/60 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all duration-200 border border-transparent hover:border-cyan-500/10">Tutorial</Link>
                    <Link href="/pricing" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 rounded-xl text-white/60 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all duration-200 border border-transparent hover:border-cyan-500/10">Pricing</Link>
                    <Link href="/contact" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 rounded-xl text-white/60 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all duration-200 border border-transparent hover:border-cyan-500/10">Contact</Link>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/login"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-black transition-colors hover:bg-zinc-200"
          >
            Get Started
          </Link>
        </div>

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
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
            <Link href="/machine" onClick={() => setIsMobileMenuOpen(false)}>Inside the Machine</Link>
            <Link href="/tutorial" onClick={() => setIsMobileMenuOpen(false)}>Tutorial</Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
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
