'use client';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full min-h-[120px] rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-white placeholder-white/50 shadow-inner shadow-black/10 focus:outline-none focus:ring-2 focus:ring-[rgba(127,213,223,0.45)] ${className}`}
      {...props}
    />
  );
}



