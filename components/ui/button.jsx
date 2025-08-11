'use client';

export function Button({ className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';
  const styles = variant === 'ghost'
    ? 'bg-transparent hover:bg-white/10 text-white border border-white/10'
    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 focus:ring-cyan-300';
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}



