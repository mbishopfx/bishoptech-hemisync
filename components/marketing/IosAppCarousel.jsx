'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AppleLogo, ArrowLeft, ArrowRight, ArrowSquareOut, Check } from '@phosphor-icons/react';
import { ScrollRevealHeading } from '@/components/marketing/ScrollRevealHeading';

const APP_STORE_URL = 'https://apps.apple.com/us/app/cognistration/id6780132617';

const APP_SCREENSHOTS = [
  {
    src: '/images/ios-app/take-back-control.png',
    alt: 'Cognistration iOS screen about taking back control',
    label: 'Take back control'
  },
  {
    src: '/images/ios-app/slide1-tune-your-brain-waves.png',
    alt: 'Cognistration iPhone screen for shaping a listening session',
    label: 'Shape your session'
  },
  {
    src: '/images/ios-app/slide2-enter-deep-flow-state.png',
    alt: 'Cognistration iPhone screen for starting a focused session',
    label: 'Start a focused session'
  },
  {
    src: '/images/ios-app/slide3-custom-binaural-beats.png',
    alt: 'Cognistration iPhone screen for custom audio controls',
    label: 'Build your pattern'
  },
  {
    src: '/images/ios-app/slide4-silence-digital-noise.png',
    alt: 'Cognistration iOS screen about silencing digital noise',
    label: 'Silence digital noise'
  },
  {
    src: '/images/ios-app/slide5-build-mindful-habits.png',
    alt: 'Cognistration iPhone screen for building a listening routine',
    label: 'Build the routine'
  },
  {
    src: '/images/ios-app/breathe-relax-recharge.png',
    alt: 'Cognistration iOS screen about breathing, relaxing, and recharging',
    label: 'Breathe and recharge'
  },
  {
    src: '/images/ios-app/detox-for-the-mind.png',
    alt: 'Cognistration iOS screen for a quiet reset',
    label: 'Reset the noise'
  }
];

function wrapIndex(index) {
  return (index + APP_SCREENSHOTS.length) % APP_SCREENSHOTS.length;
}

function relativeIndex(index, activeIndex) {
  let delta = index - activeIndex;
  const half = APP_SCREENSHOTS.length / 2;
  if (delta > half) delta -= APP_SCREENSHOTS.length;
  if (delta < -half) delta += APP_SCREENSHOTS.length;
  return delta;
}

export function IosAppCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  function moveBy(offset) {
    setActiveIndex((current) => wrapIndex(current + offset));
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setShouldReduceMotion(mediaQuery.matches);

    syncMotionPreference();
    mediaQuery.addEventListener?.('change', syncMotionPreference);

    return () => mediaQuery.removeEventListener?.('change', syncMotionPreference);
  }, []);

  useEffect(() => {
    if (isPaused || shouldReduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => wrapIndex(current + 1));
    }, 4800);
    return () => window.clearInterval(timer);
  }, [isPaused, shouldReduceMotion]);

  return (
    <section id="ios-app" aria-labelledby="ios-app-title" className="relative scroll-mt-24 overflow-hidden bg-[#202b28] py-24 text-white sm:py-32">
      <div className="absolute right-[-10rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-[#b6ddcc]/[0.07] blur-[120px]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-20 lg:px-12">
        <div>
          <ScrollRevealHeading id="ios-app-title" className="max-w-xl text-4xl font-medium leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl">
            The full Cognistration app, for $2.99 once.
          </ScrollRevealHeading>
          <p className="mt-7 max-w-xl text-base leading-8 text-white/65 sm:text-lg">
            Download Cognistration for iPhone and keep the complete listening experience close. Custom controls, on-device audio, saved presets, and a private routine—one purchase, no subscription.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/75">
            <div className="flex items-center gap-3"><Check className="size-4 text-[#b6ddcc]" weight="bold" aria-hidden="true" /> Full app access after one purchase</div>
            <div className="flex items-center gap-3"><Check className="size-4 text-[#b6ddcc]" weight="bold" aria-hidden="true" /> Custom controls, presets, and reminders</div>
            <div className="flex items-center gap-3"><Check className="size-4 text-[#b6ddcc]" weight="bold" aria-hidden="true" /> No account, ads, feed, or recurring subscription</div>
          </div>
          <p className="mt-7 max-w-xl border-l border-[#b6ddcc]/30 pl-4 text-sm leading-6 text-white/60">
            The iPhone app runs on-device instead of routing each session through a cloud service. With less infrastructure to maintain, we can offer full access for a one-time $2.99.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href={APP_STORE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#d7eadf] px-5 py-3.5 text-sm font-medium text-[#17332e] transition hover:bg-white active:translate-y-px">
              <AppleLogo className="size-4" weight="fill" aria-hidden="true" /> Download on the App Store <ArrowSquareOut className="size-4" aria-hidden="true" />
            </a>
            <span className="text-sm text-white/45">iPhone · iOS 18 or later</span>
          </div>
          <p className="mt-5 text-xs leading-5 text-white/40">App Store price shown for the United States. Apple controls final availability and regional pricing.</p>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Cognistration iOS app previews"
          className="min-w-0"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') moveBy(-1);
            if (event.key === 'ArrowRight') moveBy(1);
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-4 px-2 sm:px-8">
            <p className="text-xs text-white/40" aria-live="polite">iPhone preview / {String(activeIndex + 1).padStart(2, '0')} of {String(APP_SCREENSHOTS.length).padStart(2, '0')}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveBy(-1)}
                aria-label="Previous iOS app preview"
                className="inline-flex size-10 items-center justify-center rounded-full bg-white/[0.06] text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.12)] transition hover:bg-white/[0.12] hover:text-white"
              >
                <ArrowLeft aria-hidden="true" weight="light" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => moveBy(1)}
                aria-label="Next iOS app preview"
                className="inline-flex size-10 items-center justify-center rounded-full bg-white/[0.06] text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.12)] transition hover:bg-white/[0.12] hover:text-white"
              >
                <ArrowRight aria-hidden="true" weight="light" className="size-4" />
              </button>
            </div>
          </div>

          <div className="ios-carousel-stage" tabIndex={0}>
            {APP_SCREENSHOTS.map((screenshot, index) => {
              const position = relativeIndex(index, activeIndex);
              const slot = position === -1 ? 'left' : position === 0 ? 'center' : position === 1 ? 'right' : 'hidden';

              return (
                <figure key={screenshot.src} className={`ios-carousel-card ios-carousel-card--${slot}`} aria-hidden={slot !== 'center'}>
                  <Image
                    src={screenshot.src}
                    alt={slot === 'center' ? screenshot.alt : ''}
                    width={1290}
                    height={2796}
                    sizes="(max-width: 640px) 168px, 248px"
                    className="block h-auto w-full rounded-[2rem]"
                  />
                  <figcaption className="sr-only">{screenshot.label}</figcaption>
                </figure>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-center gap-2" aria-label="Choose an iOS app preview">
            {APP_SCREENSHOTS.map((screenshot, index) => (
              <button
                key={screenshot.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${screenshot.label}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                className={`h-1 rounded-full transition-all ${activeIndex === index ? 'w-8 bg-[#b6ddcc]' : 'w-2 bg-white/20 hover:bg-white/45'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
