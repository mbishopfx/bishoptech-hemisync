export function PolicySection({ id, title, children }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-28 border-t border-[#cbd6cf] pt-9 first:border-t-0 first:pt-0"
    >
      <h2
        id={`${id}-title`}
        className="text-2xl font-medium leading-tight tracking-[-0.04em] text-[#1d302c] sm:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-4 max-w-2xl space-y-4 text-[15px] leading-8 text-[#5f706b]">
        {children}
      </div>
    </section>
  );
}
