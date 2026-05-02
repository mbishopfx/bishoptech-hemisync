'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({ className, align = 'end', ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align}
        className={cn('z-50 min-w-48 rounded-2xl border border-white/10 bg-[var(--bg-1)] p-2 text-white shadow-2xl', className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn('flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/72 outline-none hover:bg-white/[0.08] hover:text-white', className)}
      {...props}
    />
  );
}
