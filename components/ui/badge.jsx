import { cn } from '@/lib/utils';

const variants = {
  default: 'border-white/10 bg-white/[0.08] text-white',
  science: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-50',
  warm: 'border-[rgba(214,183,109,0.28)] bg-[rgba(214,183,109,0.12)] text-[var(--accent-gold-strong)]',
  muted: 'border-white/10 bg-white/[0.04] text-white/60'
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium leading-none',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}
