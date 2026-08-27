'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function OrchestratorMachineIllustration() {
  const reducedMotion = useReducedMotion();
  const animate = reducedMotion ? undefined : { rotate: [0, 8, -5, 0] };
  const transition = reducedMotion ? undefined : { duration: 8, ease: 'easeInOut', repeat: Infinity };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#202b28] p-5 shadow-[0_24px_80px_rgba(10,20,18,0.22)] sm:p-8">
      <svg viewBox="0 0 680 430" className="h-auto w-full" role="img" aria-labelledby="machine-illustration-title machine-illustration-description">
        <title id="machine-illustration-title">The Cognistration orchestrator machine</title>
        <desc id="machine-illustration-description">A central listening dial connects to a sequence of adjustable controls.</desc>
        <defs>
          <radialGradient id="machine-disc" cx="50%" cy="42%" r="58%">
            <stop offset="0" stopColor="#d7eadf" stopOpacity="0.96" />
            <stop offset="0.56" stopColor="#8ab9a8" stopOpacity="0.72" />
            <stop offset="1" stopColor="#416f66" stopOpacity="0.28" />
          </radialGradient>
          <linearGradient id="machine-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8ab9a8" stopOpacity="0.2" />
            <stop offset="1" stopColor="#d7eadf" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="680" height="430" rx="28" fill="#202b28" />
        <path d="M80 110 H600 M80 215 H600 M80 320 H600" stroke="#d7eadf" strokeOpacity="0.08" strokeWidth="1" />
        <path d="M190 110 C262 110 280 214 338 214 S416 110 492 110 M190 320 C262 320 280 214 338 214 S416 320 492 320" fill="none" stroke="url(#machine-line)" strokeWidth="2" strokeDasharray="5 8" />
        <g fill="#d7eadf" fillOpacity="0.7" fontFamily="var(--font-sans), sans-serif" fontSize="13">
          <text x="82" y="86">Choose a direction</text>
          <text x="82" y="191">Shape the sound</text>
          <text x="82" y="296">Set the return</text>
        </g>
        {[{ y: 110, label: 'state' }, { y: 215, label: 'texture' }, { y: 320, label: 'duration' }].map((item) => (
          <g key={item.label}>
            <rect x="500" y={item.y - 12} width="100" height="24" rx="12" fill="#d7eadf" fillOpacity="0.08" stroke="#d7eadf" strokeOpacity="0.16" />
            <circle cx={item.label === 'state' ? 575 : item.label === 'texture' ? 548 : 585} cy={item.y} r="5" fill="#d7eadf" />
          </g>
        ))}
        <motion.g style={{ transformOrigin: '340px 214px' }} animate={animate} transition={transition}>
          <circle cx="340" cy="214" r="92" fill="url(#machine-disc)" fillOpacity="0.18" stroke="#b6ddcc" strokeOpacity="0.6" strokeWidth="1.5" />
          <circle cx="340" cy="214" r="67" fill="none" stroke="#d7eadf" strokeOpacity="0.24" strokeWidth="1" strokeDasharray="2 9" />
          <path d="M340 214 L383 166" stroke="#d7eadf" strokeWidth="3" strokeLinecap="round" />
          <circle cx="340" cy="214" r="10" fill="#d7eadf" />
          <text x="340" y="238" textAnchor="middle" fill="#d7eadf" fontFamily="var(--font-sans), sans-serif" fontSize="12" fontWeight="600">your session</text>
        </motion.g>
        <path d="M270 214 H190 M410 214 H490" stroke="#b6ddcc" strokeOpacity="0.3" strokeWidth="2" />
        <circle cx="190" cy="214" r="6" fill="#b6ddcc" />
        <circle cx="490" cy="214" r="6" fill="#b6ddcc" />
      </svg>
      <p className="mt-4 max-w-md text-sm leading-6 text-white/65">The point is control: the session can change with the moment instead of asking you to fit your moment into a fixed playlist.</p>
    </div>
  );
}
