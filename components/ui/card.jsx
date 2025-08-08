export function Card({ children, className = '' }) {
  return (
    <div className={`glass-dark rounded-xl p-6 shadow-lg ${className}`}>{children}</div>
  );
}


