'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { AppleLogo, ArrowLeft, ArrowRight, Check, EnvelopeSimple } from '@phosphor-icons/react';

const APP_SCREENSHOTS = [
  {
    src: '/images/ios-app/take-back-control.png',
    alt: 'Cognistration iOS screen about taking back control',
    label: 'Take back control'
  },
  {
    src: '/images/ios-app/slide1-tune-your-brain-waves.png',
    alt: 'Cognistration iOS screen for tuning brain waves',
    label: 'Tune your brain waves'
  },
  {
    src: '/images/ios-app/slide2-enter-deep-flow-state.png',
    alt: 'Cognistration iOS screen for entering a deep flow state',
    label: 'Enter deep flow'
  },
  {
    src: '/images/ios-app/slide3-custom-binaural-beats.png',
    alt: 'Cognistration iOS screen for custom binaural beats',
    label: 'Build your pattern'
  },
  {
    src: '/images/ios-app/slide4-silence-digital-noise.png',
    alt: 'Cognistration iOS screen about silencing digital noise',
    label: 'Silence digital noise'
  },
  {
    src: '/images/ios-app/slide5-build-mindful-habits.png',
    alt: 'Cognistration iOS screen about building mindful habits',
    label: 'Build the habit'
  },
  {
    src: '/images/ios-app/breathe-relax-recharge.png',
    alt: 'Cognistration iOS screen about breathing, relaxing, and recharging',
    label: 'Breathe and recharge'
  },
  {
    src: '/images/ios-app/detox-for-the-mind.png',
    alt: 'Cognistration iOS screen about a digital detox for the mind',
    label: 'Reset the noise'
  }
];

const MANUAL_JOIN_HREF = `mailto:matt@bishoptech.dev?subject=${encodeURIComponent('Cognistration iOS waitlist')}&body=${encodeURIComponent('Please add me to the Cognistration iOS waitlist. My email is: ')}`;

function IosWaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/ios-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website: '' })
      });

      if (!response.ok) {
        throw new Error('Waitlist request failed');
      }

      setEmail('');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="ios-waitlist-email" className="mb-2 block text-[10px] font-mono uppercase tracking-[0.22em] text-white/45">
            Email for iOS updates
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 transition-colors focus-within:border-cyan-300/60">
            <EnvelopeSimple aria-hidden="true" weight="light" className="size-5 shrink-0 text-cyan-200/70" />
            <input
              id="ios-waitlist-email"
              type="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              placeholder="you@example.com"
              autoComplete="email"
              className="min-w-0 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            />
          </div>
        </div>
        <input
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          name="website"
          className="absolute -left-[9999px] h-px w-px opacity-0"
          value=""
          readOnly
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 text-sm font-medium text-zinc-950 transition duration-300 hover:bg-white active:translate-y-px disabled:cursor-wait disabled:opacity-60"
        >
          {status === 'loading' ? 'Saving…' : 'Join the waitlist'}
          <ArrowRight aria-hidden="true" weight="bold" className="size-4" />
        </button>
      </form>

      {status === 'success' && (
        <p className="mt-3 flex items-center gap-2 text-xs text-cyan-200">
          <Check aria-hidden="true" weight="bold" className="size-4" />
          You are on the list. We will email you when the iOS app is ready.
        </p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-xs leading-5 text-white/55">
          We could not save that online.{' '}
          <a href={MANUAL_JOIN_HREF} className="text-cyan-200 underline decoration-cyan-200/40 underline-offset-4 hover:text-white">
            Email us to join manually.
          </a>
        </p>
      )}
      {status === 'idle' && <p className="mt-3 text-[11px] leading-5 text-white/35">Coming soon. No recurring email campaign—just a release note when it is ready.</p>}
    </div>
  );
}

export function IosAppCarousel() {
  const scrollerRef = useRef(null);
  const slideRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  function setIndexFromScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const progress = scroller.scrollWidth - scroller.clientWidth;
    const nextIndex = progress > 0
      ? Math.round((scroller.scrollLeft / progress) * (APP_SCREENSHOTS.length - 1))
      : 0;
    setActiveIndex(Math.max(0, Math.min(APP_SCREENSHOTS.length - 1, nextIndex)));
  }

  function scrollToIndex(index) {
    const safeIndex = Math.max(0, Math.min(APP_SCREENSHOTS.length - 1, index));
    slideRefs.current[safeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    setActiveIndex(safeIndex);
  }

  return (
    <section id="ios-app" aria-labelledby="ios-app-title" className="relative overflow-hidden border-y border-white/8 bg-zinc-950/80 py-24 sm:py-32">
      <div className="absolute right-[-10rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-cyan-400/[0.07] blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-20">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-cyan-200/70">
            <AppleLogo aria-hidden="true" weight="thin" className="size-4" />
            Cognistration for iOS
          </div>
          <h2 id="ios-app-title" className="mt-5 max-w-xl text-4xl font-light leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl">
            Your baseline, in your pocket.
          </h2>
          <p className="mt-6 max-w-xl text-base font-light leading-8 text-white/55 sm:text-lg">
            The coming iOS app makes it easier to start a session before the noise takes over. Set a pattern, watch the state move, and build a private ritual you can carry into the rest of your day.
          </p>
          <IosWaitlistForm />
        </div>

        <div role="region" aria-roledescription="carousel" aria-label="Cognistration iOS app previews" className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-xs text-white/35">App preview / {String(activeIndex + 1).padStart(2, '0')} of {String(APP_SCREENSHOTS.length).padStart(2, '0')}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex - 1)}
                disabled={activeIndex === 0}
                aria-label="Previous iOS app preview"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-white/65 transition hover:border-cyan-200/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ArrowLeft aria-hidden="true" weight="light" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex + 1)}
                disabled={activeIndex === APP_SCREENSHOTS.length - 1}
                aria-label="Next iOS app preview"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-white/65 transition hover:border-cyan-200/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ArrowRight aria-hidden="true" weight="light" className="size-4" />
              </button>
            </div>
          </div>

          <div ref={scrollerRef} onScroll={setIndexFromScroll} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {APP_SCREENSHOTS.map((screenshot, index) => (
              <figure
                key={screenshot.src}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                className="w-[78vw] max-w-[270px] shrink-0 snap-center overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/80 shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
              >
                <Image src={screenshot.src} alt={screenshot.alt} width={1290} height={2796} sizes="(max-width: 640px) 78vw, 270px" className="h-auto w-full" />
                <figcaption className="border-t border-white/8 px-5 py-4 text-xs text-white/50">{screenshot.label}</figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-2 flex gap-2" aria-label="Choose an iOS app preview">
            {APP_SCREENSHOTS.map((screenshot, index) => (
              <button
                key={screenshot.src}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Show ${screenshot.label}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                className={`h-1 rounded-full transition-all ${activeIndex === index ? 'w-8 bg-cyan-200' : 'w-2 bg-white/20 hover:bg-white/45'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
