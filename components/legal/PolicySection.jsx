export function PolicySection({ id, title, children }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="policy-section scroll-mt-28 border-t pt-9 first:border-t-0 first:pt-0"
    >
      <h2
        id={`${id}-title`}
        className="policy-section__title text-2xl font-medium leading-tight tracking-[-0.04em] sm:text-3xl"
      >
        {title}
      </h2>
      <div className="policy-section__body mt-4 max-w-2xl space-y-4 text-[15px] leading-8">
        {children}
      </div>
    </section>
  );
}
