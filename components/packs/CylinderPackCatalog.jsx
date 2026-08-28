'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from '@phosphor-icons/react';

const COVER_STYLES = [
  'from-[#294f49] via-[#6f9c87] to-[#d3b37c]',
  'from-[#3c475e] via-[#7d91a9] to-[#d4c8a8]',
  'from-[#5a493f] via-[#b68d68] to-[#e3d3ae]',
  'from-[#304d57] via-[#57928d] to-[#c6d7c5]',
  'from-[#4d3e58] via-[#9a7fb2] to-[#d3c1a2]'
];

function trackId(track) {
  return track?.track_id || track?.trackId || track?.id;
}

function trackName(track) {
  return track?.track_name || track?.trackName || track?.name || 'Cognistration session';
}

function trackUrl(track) {
  return track?.preview_url || track?.previewUrl || track?.download_url || track?.downloadUrl || track?.webm_url || track?.webmUrl || track?.mp3_url || track?.mp3Url;
}

function formatPreviewTime(seconds) {
  return `0:${String(Math.min(30, Math.floor(seconds))).padStart(2, '0')}`;
}

export function CylinderPackCatalog({ packs, loading, selectedSlug, activeTrackKey, previewTime, onPreview, onSelect }) {
  const railRef = useRef(null);
  const cardRefs = useRef([]);
  const scrollFrameRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, packs.length - 1)));
  }, [packs.length]);

  useEffect(() => () => window.cancelAnimationFrame(scrollFrameRef.current), []);

  const updateActiveCard = () => {
    window.cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const rail = railRef.current;
      if (!rail) return;

      const railCenter = rail.scrollLeft + rail.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - railCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    });
  };

  const scrollToCard = (index) => {
    const nextIndex = Math.max(0, Math.min(packs.length - 1, index));
    cardRefs.current[nextIndex]?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  };

  return (
    <section id="catalog" className="relative scroll-mt-20 overflow-hidden border-t border-[#cbd6cf] bg-[#e5ebe6] py-20 text-[#1d302c] md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(84,132,119,0.09),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(63,95,83,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(63,95,83,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#71807b]">The complete collection</p>
            <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-[-0.04em] text-[#1d302c] md:text-5xl">Scroll through every pack.</h2>
            <p className="mt-3 text-xs font-light text-[#71807b]">Swipe on mobile or scroll sideways with your trackpad.</p>
          </div>

          <div className="shrink-0 text-right">
            <p className="whitespace-nowrap text-2xl font-medium tabular-nums text-[#1d302c]">
              {String(activeIndex + 1).padStart(2, '0')}
              <span className="text-[#98a69f]"> / {String(packs.length).padStart(2, '0')}</span>
            </p>
            <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-[#82918b]">{loading ? 'Syncing catalog' : 'Live catalog'}</p>
          </div>
        </div>

        <div className="mt-9 flex items-center justify-between border-t border-[#cbd6cf] pt-4 md:mt-12">
          <p className="text-[9px] uppercase tracking-[0.22em] text-[#82918b]">Drag or swipe to browse</p>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollToCard(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="grid size-10 place-items-center rounded-full border border-[#b7c9bf] text-[#47675c] transition hover:border-[#315e55] hover:bg-[#1d302c] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Previous pack"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToCard(activeIndex + 1)}
              disabled={activeIndex === packs.length - 1}
              className="grid size-10 place-items-center rounded-full border border-[#b7c9bf] text-[#47675c] transition hover:border-[#315e55] hover:bg-[#1d302c] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Next pack"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        onScroll={updateActiveCard}
        className="relative mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-9 pt-8 [scroll-padding-inline:1.25rem] [-webkit-overflow-scrolling:touch] md:mt-7 md:gap-6 md:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] md:[scroll-padding-inline:max(2.5rem,calc((100vw-1400px)/2+2.5rem))]"
        aria-label="Tone pack catalog"
      >
        {packs.map((pack, index) => {
          const previewTrack = pack.tracks?.[0];
          const previewKey = previewTrack ? `${pack.slug}-${trackId(previewTrack)}` : null;
          const isPlaying = previewKey && activeTrackKey === previewKey;
          const isSelected = selectedSlug === pack.slug;
          const trackCount = pack.trackCount || pack.tracks?.length || 0;

          return (
            <article
              key={pack.slug}
              data-cursor-surface
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className={`relative flex min-h-[35rem] w-[min(82vw,360px)] shrink-0 snap-center flex-col rounded-[1.75rem] border bg-white/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_42px_rgba(45,65,59,0.08)] backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-[240ms] sm:w-[360px] ${isSelected ? 'border-[#6b9587] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_24px_68px_rgba(45,65,59,0.16)]' : 'border-[#c7d2cb]'}`}
            >
              <div className={`relative aspect-square overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${COVER_STYLES[index % COVER_STYLES.length]} p-6`}>
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 22% 22%, rgba(255,255,255,.85) 0 1px, transparent 1.5px), radial-gradient(circle at 75% 66%, rgba(255,255,255,.55) 0 1px, transparent 1.5px)',
                    backgroundSize: '23px 23px, 31px 31px'
                  }}
                />
                <div className="relative flex h-full flex-col justify-between text-white">
                  <div className="flex items-start justify-between text-xs font-medium uppercase tracking-[0.16em] text-white/75">
                    <span>cognistration</span>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div>
                    <p className="max-w-[12ch] text-4xl font-medium leading-[0.95] tracking-[-0.06em]">{pack.name}</p>
                    <p className="mt-3 text-xs text-white/70">A finished session for your next chapter.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium tracking-[-0.03em] text-[#1d302c]">{pack.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#66746f]">{pack.summary || pack.description || 'A considered listening session from the Cognistration library.'}</p>
                  </div>
                  <span className="shrink-0 text-lg font-medium text-[#1d302c]">{pack.price || '$5.99'}</span>
                </div>

                <div className="mt-auto pt-6">
                  <div className="flex items-center justify-between border-t border-[#dbe2dd] pt-4 text-xs text-[#788681]">
                    <span>{trackCount || 'Several'} sessions</span>
                    <span>One-time purchase</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={!previewTrack || !trackUrl(previewTrack)}
                      data-track-key={previewKey || undefined}
                      onClick={() => onPreview(pack, previewTrack)}
                      className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-[#bfcfc5] px-4 py-3 text-sm font-medium text-[#315e55] transition hover:border-[#6b9587] hover:bg-[#f0f5f1] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`${isPlaying ? 'Stop' : 'Play'} 30-second preview of ${pack.name}`}
                    >
                      {isPlaying ? <Pause className="size-4" weight="fill" aria-hidden="true" /> : <Play className="size-4" weight="fill" aria-hidden="true" />}
                      <span>{isPlaying ? 'Pause' : 'Preview'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelect(pack.slug)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1d302c] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#315e55] active:scale-[0.98]"
                    >
                      <span>Get the pack</span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        <div className="w-px shrink-0" aria-hidden="true" />
      </div>
    </section>
  );
}
