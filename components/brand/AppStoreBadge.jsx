const APP_STORE_URL = 'https://apps.apple.com/us/app/cognistration/id6780132617';

const APPLE_PATH =
  'M16.365 1.43c0 1.14-.417 2.2-1.25 3.02-.99.98-2.09 1.55-3.19 1.46-.12-1.1.4-2.25 1.21-3.03.9-.87 2.2-1.48 3.23-1.45zM20.9 17.06c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.02-3.05-1.77-4.04-3.33C-.32 15.7-.62 10.3 1.16 7.4c1.26-2.06 3.25-3.27 5.12-3.27 1.9 0 3.1 1.05 4.67 1.05 1.53 0 2.46-1.05 4.66-1.05 1.67 0 3.44.91 4.7 2.48-4.13 2.26-3.46 8.16.59 10.45z';

export function AppStoreBadge({
  href = APP_STORE_URL,
  label = 'Download Cognistration on the App Store',
  className = ''
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      data-analytics-cta="app_store"
      data-analytics-placement="homepage_ios"
      className={`group inline-flex items-center gap-3 rounded-[14px] border border-white/45 bg-black px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.55)] transition hover:border-white/80 hover:bg-[#0b0b0b] ${className}`}
    >
      <svg viewBox="0 0 22 22" className="size-7 shrink-0 fill-white" aria-hidden="true">
        <path d={APPLE_PATH} />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[10px] font-normal tracking-[0.02em] text-white/70">Download on the</span>
        <span className="mt-1 text-[19px] font-medium leading-none tracking-[-0.02em] text-white">App Store</span>
      </span>
    </a>
  );
}

export { APP_STORE_URL };
