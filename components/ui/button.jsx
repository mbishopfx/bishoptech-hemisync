'use client';

import React from 'react';

const variants = {
  primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 focus:ring-cyan-300',
  secondary: 'bg-white/10 hover:bg-white/20 text-white focus:ring-white/40 border border-white/10',
  ghost: 'bg-transparent hover:bg-white/10 text-white border border-white/10'
};

export const Button = React.forwardRef(function Button(
  { className = '', variant = 'primary', asChild = false, children, ...props },
  ref
) {
  const Comp = asChild ? 'span' : 'button';
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';
  const styles = variants[variant] || variants.primary;
  return (
    <Comp ref={ref} className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </Comp>
  );
});



