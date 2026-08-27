'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function EntrainmentIllustration() {
  const reducedMotion = useReducedMotion();
  const animate = reducedMotion ? undefined : { pathLength: [0.72, 1, 0.72], opacity: [0.45, 0.95, 0.45] };
  const transition = reducedMotion ? undefined : { duration: 5.5, ease: 'easeInOut', repeat: Infinity };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-300/70 bg-white/70 p-5 shadow-[0_24px_80px_rgba(42,58,55,0.08)] sm:p-8">
      <svg viewBox="0 0 720 420" className="h-auto w-full" role="img" aria-labelledby="entrainment-illustration-title entrainment-illustration-description">
        <title id="entrainment-illustration-title">A simple illustration of two tones meeting as a perceived rhythm</title>
        <desc id="entrainment-illustration-description">Two side-by-side waveforms converge into one slow, repeating pattern.</desc>
        <defs>
          <linearGradient id="entrainment-left" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#84a9a0" stopOpacity="0.12" />
            <stop offset="1" stopColor="#84a9a0" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="entrainment-right" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d0a06b" stopOpacity="0.9" />
            <stop offset="1" stopColor="#d0a06b" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="entrainment-result" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4d7c74" />
            <stop offset="0.5" stopColor="#b78e60" />
            <stop offset="1" stopColor="#4d7c74" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="720" height="420" rx="26" fill="#f7f8f5" />
        <path d="M54 102 H666 M54 210 H666 M54 318 H666" stroke="#1f332f" strokeOpacity="0.08" strokeWidth="1" />
        <path d="M58 102 C80 66 102 138 124 102 S168 66 190 102 S234 138 256 102 S300 66 322 102 S366 138 388 102 S432 66 454 102 S498 138 520 102 S564 66 586 102 S630 138 662 102" fill="none" stroke="url(#entrainment-left)" strokeWidth="4" strokeLinecap="round" />
        <path d="M58 210 C78 186 98 234 118 210 S158 186 178 210 S218 234 238 210 S278 186 298 210 S338 234 358 210 S398 186 418 210 S458 234 478 210 S518 186 538 210 S578 234 598 210 S638 186 662 210" fill="none" stroke="url(#entrainment-right)" strokeWidth="4" strokeLinecap="round" />
        <motion.path d="M58 318 C84 318 90 272 116 272 S148 364 174 364 S206 272 232 272 S264 364 290 364 S322 272 348 272 S380 364 406 364 S438 272 464 272 S496 364 522 364 S554 272 580 272 S612 364 638 364 S654 318 662 318" fill="none" stroke="url(#entrainment-result)" strokeWidth="5" strokeLinecap="round" initial={reducedMotion ? false : { pathLength: 0.76 }} animate={animate} transition={transition} />
        <g fill="#213934" fontFamily="var(--font-sans), sans-serif" fontSize="14">
          <text x="58" y="52" fontWeight="600">Left and right tones</text>
          <text x="58" y="160" fontWeight="600">Perceived difference</text>
          <text x="58" y="388" fontWeight="600">A repeatable listening cue</text>
        </g>
        <circle cx="650" cy="52" r="7" fill="#d0a06b" />
      </svg>
      <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">The picture is a listening model, not a scan of the brain: two tones can create a perceived rhythmic difference that gives attention something steady to follow.</p>
    </div>
  );
}
