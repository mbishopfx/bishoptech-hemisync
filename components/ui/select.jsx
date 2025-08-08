'use client';

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}


