import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const variants = {
  primary:
    'premium-button font-medium text-foreground bg-[var(--bg-0)]',
  secondary:
    'premium-button font-medium text-foreground opacity-80',
  subtle:
    'premium-button font-medium text-foreground opacity-70',
  dark:
    'premium-button font-medium bg-[var(--bg-2)] text-foreground',
  ghost:
    'hover:bg-[var(--bg-2)] text-foreground bg-transparent transition-colors duration-200'
};

export const Button = React.forwardRef(function Button(
  { className = '', variant = 'primary', asChild = false, children, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button';
  const base = 'inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50';
  const styles = variants[variant] || variants.primary;
  return (
    <Comp ref={ref} className={cn(base, styles, className)} {...props}>
      {children}
    </Comp>
  );
});
