'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function ScrollRevealHeading({ children, className, ...props }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.h2
      {...props}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.h2>
  );
}
