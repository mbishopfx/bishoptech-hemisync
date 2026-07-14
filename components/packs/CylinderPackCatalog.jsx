'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from '@phosphor-icons/react';

const CARD_TINTS = ['#69c8c8', '#8aa6df', '#d59a70', '#b8a56a', '#c9858f', '#79b08a', '#6ba7c4', '#c28db2', '#a7b86d', '#dfad75'];

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
    <section id="catalog" className="relative scroll-mt-20 overflow-hidden border-t border-white/10 bg-[#06090a] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(116,214,226,0.08),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-cyan-100/55">The complete collection</p>
            <h2 className="mt-3 max-w-xl text-3xl font-extralight tracking-[-0.04em] text-white md:text-5xl">Scroll through every pack.</h2>
            <p className="mt-3 text-xs font-light text-white/40">Swipe on mobile or scroll sideways with your trackpad.</p>
          </div>

          <div className="shrink-0 text-right">
            <p className="whitespace-nowrap text-2xl font-extralight tabular-nums text-white">
              {String(activeIndex + 1).padStart(2, '0')}
              <span className="text-white/20"> / {String(packs.length).padStart(2, '0')}</span>
            </p>
            <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-white/25">{loading ? 'Syncing catalog' : 'Live catalog'}</p>
          </div>
        </div>

        <div className="mt-9 flex items-center justify-between border-t border-white/10 pt-4 md:mt-12">
          <p className="text-[9px] uppercase tracking-[0.22em] text-white/30">Drag or swipe to browse</p>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollToCard(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white/65 transition hover:border-white/30 hover:bg-white hover:text-[#071012] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Previous pack"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToCard(activeIndex + 1)}
              disabled={activeIndex === packs.length - 1}
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white/65 transition hover:border-white/30 hover:bg-white hover:text-[#071012] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-25"
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
        className="relative mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-7 pt-2 [scroll-padding-inline:1.25rem] [-webkit-overflow-scrolling:touch] md:mt-7 md:gap-6 md:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] md:[scroll-padding-inline:max(2.5rem,calc((100vw-1400px)/2+2.5rem))]"
        aria-label="Tone pack catalog"
      >
        {packs.map((pack, index) => {
          const tint = CARD_TINTS[index % CARD_TINTS.length];
          const previewTrack = pack.tracks?.[0];
          const previewKey = previewTrack ? `${pack.slug}-${trackId(previewTrack)}` : null;
          const isPlaying = previewKey && activeTrackKey === previewKey;
          const isSelected = selectedSlug === pack.slug;

          return (
            <article
              key={pack.slug}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className="relative min-h-[28rem] w-[calc(100vw-2.5rem)] shrink-0 snap-center overflow-hidden rounded-[1.75rem] border p-6 shadow-[0_28px_70px_-48px_rgba(0,0,0,0.9)] sm:min-h-[25rem] sm:w-[min(76vw,42rem)] sm:p-8 lg:w-[min(58vw,42rem)]"
              style={{
                background: `linear-gradient(132deg, ${tint}55 0%, rgba(16,23,25,0.92) 48%, rgba(7,11,12,0.98) 100%)`,
                borderColor: isSelected ? `${tint}d0` : `${tint}7d`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), inset 24px 0 56px ${tint}20, 0 28px 70px -48px rgba(0,0,0,0.9)`
              }}
            >
              <div className="pointer-events-none absolute -left-16 -top-28 size-72 rounded-full blur-3xl" style={{ backgroundColor: `${tint}40` }} />
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

              <div className="relative flex h-full min-h-[25rem] flex-col sm:min-h-[21rem]">
                <div className="flex items-start justify-between gap-5">
                  <span className="text-[10px] tabular-nums tracking-[0.24em] text-white/40">{String(index + 1).padStart(2, '0')}</span>
                  <span className="max-w-[55%] rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-right text-[8px] uppercase tracking-[0.18em] text-white/50">{pack.eyebrow}</span>
                </div>

                <div className="mt-9 max-w-xl">
                  <h3 className="text-3xl font-extralight tracking-[-0.04em] text-white sm:text-4xl">{pack.name}</h3>
                  <p className="mt-4 line-clamp-4 max-w-lg text-sm font-light leading-6 text-white/60 sm:line-clamp-3">{pack.summary}</p>
                </div>

                <div className="mt-auto flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    disabled={!previewTrack || !trackUrl(previewTrack)}
                    data-track-key={previewKey || undefined}
                    onClick={() => onPreview(pack, previewTrack)}
                    className="inline-flex min-w-0 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={`${isPlaying ? 'Stop' : 'Play'} 30-second preview of ${pack.name}`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-black/15 text-white transition hover:bg-white hover:text-[#071012] active:scale-[0.98]">
                      {isPlaying ? <Pause weight="fill" className="size-3.5" /> : <Play weight="fill" className="ml-0.5 size-3.5" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-48 truncate text-xs text-white/75">{previewTrack ? trackName(previewTrack) : 'Preview publishing soon'}</span>
                      <span className="mt-1 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-white/35">
                        {isPlaying ? formatPreviewTime(previewTime) : 'Play 30 sec'}
                        {isPlaying && (
                          <span className="flex h-3 items-center gap-0.5" aria-hidden="true">
                            {Array.from({ length: 6 }).map((_, barIndex) => (
                              <span key={barIndex} className="catalog-wave-bar h-full w-px bg-white" />
                            ))}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelect(pack.slug)}
                    className="inline-flex items-center justify-between gap-5 rounded-full border border-white/15 bg-black/10 px-5 py-3 text-[9px] uppercase tracking-[0.2em] text-white/70 transition hover:bg-white hover:text-[#071012] active:scale-[0.98] sm:justify-center"
                  >
                    Choose this pack <ArrowRight className="size-3.5" />
                  </button>
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
