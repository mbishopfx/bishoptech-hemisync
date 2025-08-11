'use client';
import { motion } from 'framer-motion';

export function GlitchTitle({ text = 'Bishop HemiSync' }) {
  const glitch = {
    initial: { opacity: 0, y: 8, filter: 'blur(6px)' },
    animate: {
      opacity: [0, 1, 0.9, 1, 0.95, 1],
      y: [8, 0, -1, 0, 1, 0],
      filter: ['blur(6px)', 'blur(0px)', 'blur(1px)', 'blur(0px)'],
      transition: { duration: 1.4, ease: 'easeOut' }
    }
  };

  return (
    <div className="relative mx-auto w-full select-none py-6">
      <motion.h1
        className="text-center text-4xl font-bold tracking-wide text-white md:text-6xl"
        variants={glitch}
        initial="initial"
        animate="animate"
      >
        {text}
      </motion.h1>
      <div className="pointer-events-none absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-cyan-400/10 via-fuchsia-400/10 to-emerald-400/10 blur-3xl" />
    </div>
  );
}




