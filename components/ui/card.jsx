import { cn } from '@/lib/utils';

export function Card({ children, className = '' }) {
  return (
    <div className={cn("premium-card p-8", className)}>
      {children}
    </div>
  );
}
