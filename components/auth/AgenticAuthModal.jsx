'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function AgenticAuthModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-white/40"
            >
              <X className="size-5" />
            </button>

            <div className="flex flex-col items-center text-center gap-6">
              <div className="size-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="size-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-medium text-white">Continue your journey</h2>
                <p className="text-white/40 text-sm leading-relaxed">
                  You've used your free session. Join the community to unlock 100+ specialized frequencies and persistent session tracking.
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 mt-4">
                <Link 
                  href="/signup"
                  className="w-full py-4 rounded-2xl bg-white text-black font-medium flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                >
                  Create Account <ArrowRight className="size-4" />
                </Link>
                <Link 
                  href="/login"
                  className="w-full py-4 rounded-2xl bg-white/5 text-white font-medium border border-white/5 hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
              </div>

              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2">
                Secured by HemiSync.sys
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
