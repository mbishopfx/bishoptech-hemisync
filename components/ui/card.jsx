export function Card({ children, className = '' }) {
  return (
    <div className={`surface-card rounded-[1.75rem] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)] ${className}`}>{children}</div>
  );
}


