'use client';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-2xl border border-[var(--line-strong)] bg-[var(--glass-bg)] px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)] shadow-inner transition-colors duration-200 ${className}`}
      {...props}
    />
  );
}
