import Image from 'next/image';
import { AppStoreBadge } from '@/components/brand/AppStoreBadge';

const FEATURES = [
  {
    title: 'The full engine, in your pocket',
    detail:
      'Generate a carrier and a beat pair from scratch, then change either one while it plays. Nothing is locked to a preset.'
  },
  {
    title: 'Widgets that start the session',
    detail:
      'Put your frequencies on the home screen and lock screen. One tap begins the exact signal you saved — no browsing.'
  },
  {
    title: 'A journal that stays private',
    detail:
      'Record what each session did for you, tied to the frequencies you used. It lives on your device, not in a feed.'
  },
  {
    title: 'One purchase. No membership.',
    detail:
      'Two dollars and ninety-nine cents, once. No subscription, no renewal, no account required to listen.'
  }
];

export function IosAppSection() {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-20">
      <div>
        <div className="relative mx-auto w-full max-w-[260px] lg:mx-0">
          <div className="absolute -inset-6 rounded-[38px] bg-[#6f8ff0]/12 blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[30px] border border-white/20 shadow-[0_28px_70px_rgba(0,0,0,0.55)]">
            <Image
              src="/images/brand/cognistration-icon.png"
              alt="The Cognistration iOS app icon"
              width={1024}
              height={1024}
              sizes="(max-width: 1024px) 220px, 260px"
              className="h-auto w-full"
              priority={false}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-5 lg:items-start">
          <AppStoreBadge />
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
            iPhone &amp; iPad · iOS 17+ · $2.99 once
          </div>
        </div>
      </div>

      <div>
        <div className="border-t border-white/12">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="grid gap-2 border-b border-white/12 py-6 sm:grid-cols-[42px_1fr] sm:gap-7"
            >
              <span className="font-mono text-[11px] tabular-nums text-[#b6ddcc]/70">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h4 className="text-[17px] font-medium tracking-[-0.02em] text-white">{feature.title}</h4>
                <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-white/50">{feature.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-7 max-w-lg text-[13px] leading-relaxed text-white/60">
          The app is a separate purchase from the web workspace. If you already own it, it does not expire, and it is not
          tied to a subscription you have to cancel.
        </p>
      </div>
    </div>
  );
}
