export function PolicyLink({ href, children, className = '', ...props }) {
  return (
    <a href={href} className={`policy-link ${className}`.trim()} {...props}>
      {children}
    </a>
  );
}
