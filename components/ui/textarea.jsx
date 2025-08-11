'use client';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full min-h-[120px] rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`}
      {...props}
    />
  );
}



