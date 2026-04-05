'use client';

import React from 'react';

const variants = {
  primary:
    'border border-[rgba(214,183,109,0.35)] bg-[linear-gradient(135deg,rgba(240,216,157,0.95),rgba(127,213,223,0.92))] text-slate-950 shadow-[0_12px_40px_rgba(127,213,223,0.18)] hover:brightness-105 focus:ring-[rgba(214,183,109,0.45)]',
  secondary:
    'border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.12] focus:ring-white/30',
  subtle:
    'border border-white/10 bg-white/[0.03] text-white/90 hover:bg-white/[0.08] focus:ring-white/25',
  dark:
    'border border-white/10 bg-[rgba(10,16,24,0.8)] text-white hover:bg-[rgba(16,24,35,0.9)] focus:ring-white/20',
  ghost:
    'border border-white/10 bg-transparent text-white hover:bg-white/[0.08]'
};

export const Button = React.forwardRef(function Button(
  { className = '', variant = 'primary', asChild = false, children, ...props },
  ref
) {
  const Comp = asChild ? 'span' : 'button';
  const base = 'inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-medium tracking-[0.02em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-60';
  const styles = variants[variant] || variants.primary;
  return (
    <Comp ref={ref} className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </Comp>
  );
});


