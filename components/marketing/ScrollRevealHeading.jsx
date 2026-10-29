'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Motion is transform-only on purpose. An opacity-0 start leaves the heading
// invisible whenever the in-view trigger does not fire (still hydrating, a
// headless capture, a browser that never reports intersection), and a heading
// that carries the explanation of the method must never be unreadable.
export function ScrollRevealHeading({ children, className, ...props }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.h2
      {...props}
      initial={reducedMotion ? false : { y: 18 }}
      whileInView={reducedMotion ? undefined : { y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.h2>
  );
}
