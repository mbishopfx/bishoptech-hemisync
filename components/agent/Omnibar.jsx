'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, CircleNotch } from '@phosphor-icons/react';

const QUICK_INTENTIONS = [
  'Start focused work',
  'Unwind after the day',
  'Make space to think'
];

export function Omnibar({ onGenerate, isLoading, agentMessage, theme = 'dark' }) {
  const [intention, setIntention] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const isLight = theme === 'light';

  const submitIntention = (value) => {
    const nextIntention = String(value || '').trim();
    if (nextIntention && !isLoading) onGenerate(nextIntention);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitIntention(intention);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-5">
      <div className="space-y-2">
        <p className={`text-sm font-medium ${isLight ? 'text-[#31443e]' : 'text-white/70'}`}>Tell us what the next moment needs.</p>
        <p className={`max-w-lg text-sm leading-6 ${isLight ? 'text-[#60716b]' : 'text-white/50'}`}>Cognistration will choose a starting tone from the public library for you to preview.</p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative"
      >
        <div data-cursor-surface className={`omnibar-glass-shell relative flex items-center overflow-hidden rounded-[1.35rem] p-1 transition-colors ${isLight ? 'is-light' : ''} ${isFocused ? 'is-focused' : ''}`}>
          <input
            type="text"
            name="intention"
            value={intention}
            onChange={(event) => setIntention(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={240}
            autoComplete="off"
            placeholder="I need a calm place to start writing…"
            aria-label="Describe what you want from your next listening session"
            className={`min-w-0 flex-1 bg-transparent px-5 py-5 text-base outline-none sm:text-lg ${isLight ? 'text-[#1d302c] placeholder:text-[#87968f]' : 'text-white placeholder:text-white/35'}`}
          />
          <div className="pr-2">
            <button
              type="submit"
              disabled={isLoading || !intention.trim()}
              aria-label="Find a session"
              className="flex size-11 items-center justify-center rounded-full bg-[#d7eadf] text-[#17332e] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? <CircleNotch className="size-5 animate-spin" aria-hidden="true" /> : <ArrowUp className="size-5" weight="bold" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </motion.form>

      <div className="flex flex-wrap gap-2" aria-label="Quick starting points">
        {QUICK_INTENTIONS.map((quickIntention) => (
          <button
            key={quickIntention}
            type="button"
            onClick={() => {
              setIntention(quickIntention);
              submitIntention(quickIntention);
            }}
            disabled={isLoading}
            className={`rounded-full px-3.5 py-2 text-xs transition disabled:opacity-40 ${isLight ? 'border border-[#cbd6cf] bg-white/75 text-[#60716b] shadow-[0_8px_20px_rgba(45,65,59,0.04)] hover:bg-white hover:text-[#1d302c]' : 'bg-white/[0.055] text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.12)] hover:bg-white/[0.1] hover:text-white'}`}
          >
            {quickIntention}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {agentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            className={`rounded-2xl px-5 py-4 ${isLight ? 'border border-[#cbd6cf] bg-white/70 shadow-[0_12px_28px_rgba(45,65,59,0.05)]' : 'bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.12)]'}`}
          >
            <p className={`text-xs font-medium ${isLight ? 'text-[#548477]' : 'text-[#b6ddcc]'}`}>Your session direction</p>
            <p className={`mt-2 max-w-xl text-sm leading-6 ${isLight ? 'text-[#4e625b]' : 'text-white/80'}`}>{agentMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
