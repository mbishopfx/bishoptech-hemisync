'use client';

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-white shadow-inner shadow-black/10 focus:outline-none focus:ring-2 focus:ring-[rgba(127,213,223,0.45)] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}



