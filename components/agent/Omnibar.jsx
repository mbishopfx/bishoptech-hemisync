'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Play, Pause, X } from 'lucide-react';

export function Omnibar({ onGenerate, isLoading, currentTrack, agentMessage }) {
  const [mood, setMood] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mood.trim() && !isLoading) {
      onGenerate(mood);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative group"
      >
        <div className={`
          relative overflow-hidden transition-all duration-500
          bg-black/40 backdrop-blur-2xl
          border ${isFocused ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]' : 'border-white/10'}
          rounded-2xl p-1
        `}>
          <input
            ref={inputRef}
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="How are you feeling right now?"
            className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl px-6 py-5 text-white placeholder-white/20 font-light tracking-tight"
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="size-6 text-cyan-400 animate-spin" />
                </motion.div>
              ) : (
                <motion.button
                  key="submit"
                  type="submit"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                >
                  <Sparkles className="size-6" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Glowing pulse when thinking */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.form>

      <AnimatePresence>
        {agentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-cyan-400/80 font-mono text-sm uppercase tracking-widest mb-2">Agent Cognition</p>
            <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto italic">
              "{agentMessage}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
