'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Pause, Play } from '@phosphor-icons/react';

const CARD_TINTS = ['#69c8c8', '#8aa6df', '#d59a70', '#b8a56a', '#c9858f', '#79b08a', '#6ba7c4', '#c28db2', '#a7b86d', '#dfad75'];

const THICKNESS_LAYERS = [-5, -3, -1];

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
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const frameRef = useRef(0);
  const scrollProgress = useRef({ current: 0, target: 0 });
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const activeIndexRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const wheelGestureRef = useRef({ locked: false, timer: null });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !packs.length) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wheelGesture = wheelGestureRef.current;

    const updateTarget = () => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
      const sectionProgress = Math.max(0, Math.min(1, (window.scrollY - sectionTop) / scrollRange));
      scrollProgress.current.target = sectionProgress * (packs.length - 1);
    };

    const handleWheel = (event) => {
      if (reduceMotion || packs.length < 2) return;

      const bounds = section.getBoundingClientRect();
      const isPinned = bounds.top <= 1 && bounds.bottom >= window.innerHeight - 1;
      if (!isPinned) return;

      const direction = Math.sign(event.deltaY);
      const currentIndex = Math.max(0, Math.min(packs.length - 1, Math.round(scrollProgress.current.target)));
      const canAdvance = direction > 0 && currentIndex < packs.length - 1;
      const canRewind = direction < 0 && currentIndex > 0;

      if (!canAdvance && !canRewind) return;

      event.preventDefault();
      window.clearTimeout(wheelGesture.timer);
      wheelGesture.timer = window.setTimeout(() => {
        wheelGesture.locked = false;
        wheelDeltaRef.current = 0;
      }, 240);

      if (wheelGesture.locked) return;
      wheelDeltaRef.current += event.deltaY;
      if (Math.abs(wheelDeltaRef.current) < 28) return;

      wheelGesture.locked = true;
      wheelDeltaRef.current = 0;
      const nextIndex = Math.max(0, Math.min(packs.length - 1, currentIndex + direction));
      const sectionTop = bounds.top + window.scrollY;
      const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
      const nextScrollTop = sectionTop + (nextIndex / (packs.length - 1)) * scrollRange;
      window.scrollTo({ top: nextScrollTop, behavior: 'smooth' });
    };

    const handleMouseMove = (event) => {
      mouse.current.targetX = Math.max(-1, Math.min(1, (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2)));
      mouse.current.targetY = Math.max(-1, Math.min(1, (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2)));
    };

    const resetMouse = () => {
      mouse.current.targetX = 0;
      mouse.current.targetY = 0;
    };

    const render = () => {
      const motion = scrollProgress.current;
      motion.current += (motion.target - motion.current) * (reduceMotion ? 1 : 0.105);
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.075;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.075;

      const nextActiveIndex = Math.max(0, Math.min(packs.length - 1, Math.round(motion.current)));
      if (nextActiveIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextActiveIndex;
        setActiveIndex(nextActiveIndex);
      }

      const radius = window.innerWidth < 640 ? Math.max(540, Math.min(600, window.innerHeight * 0.72)) : Math.max(560, Math.min(650, window.innerHeight * 0.82));
      const angleStep = window.innerWidth < 640 ? 42 : 28;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const offset = index - motion.current;
        const absoluteOffset = Math.abs(offset);

        if (absoluteOffset > 3.4) {
          card.style.visibility = 'hidden';
          return;
        }

        const angle = offset * angleStep;
        const radians = (angle * Math.PI) / 180;
        const y = Math.sin(radians) * radius;
        const z = (Math.cos(radians) - 1) * radius;
        const centerFactor = Math.max(0, 1 - absoluteOffset);
        const tiltX = -mouse.current.y * 5 * centerFactor;
        const tiltY = mouse.current.x * 7 * centerFactor;
        const opacity = absoluteOffset > 3 ? Math.max(0, 1 - (absoluteOffset - 3) / 0.4) : Math.max(0.42, 1 - absoluteOffset * 0.18);

        card.style.visibility = 'visible';
        card.style.opacity = opacity.toFixed(3);
        card.style.zIndex = String(100 - Math.round(absoluteOffset * 10));
        card.style.pointerEvents = absoluteOffset < 0.48 ? 'auto' : 'none';
        card.style.transform = `translate3d(-50%, calc(-50% + ${y.toFixed(2)}px), ${z.toFixed(2)}px) rotateX(${(-angle + tiltX).toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotateZ(-1.5deg)`;
      });

      frameRef.current = window.requestAnimationFrame(render);
    };

    updateTarget();
    section.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', resetMouse);
    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(wheelGesture.timer);
      section.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', resetMouse);
    };
  }, [packs]);

  const sectionHeight = `calc(100dvh + ${Math.max(0, packs.length - 1) * 92}dvh)`;

  return (
    <section id="catalog" ref={sectionRef} className="relative scroll-mt-20 border-t border-white/10" style={{ height: sectionHeight }}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-[#06090a]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(116,214,226,0.08),transparent_43%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]" />

        <div className="absolute inset-x-5 top-24 z-[120] flex items-start justify-between gap-6 md:inset-x-10 md:top-28">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-cyan-100/55">The complete collection</p>
            <p className="mt-2 text-xs font-light text-white/35">Ten distinct collections. Preview before choosing.</p>
          </div>
          <div className="text-right">
            <p className="whitespace-nowrap text-2xl font-extralight tabular-nums text-white">
              {String(activeIndex + 1).padStart(2, '0')}
              <span className="text-white/20"> / {String(packs.length).padStart(2, '0')}</span>
            </p>
            <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-white/25">{loading ? 'Syncing catalog' : 'Live catalog'}</p>
          </div>
        </div>

        <div className="absolute inset-0" style={{ perspective: '1350px', perspectiveOrigin: '50% 52%' }}>
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {packs.map((pack, index) => {
              const tint = CARD_TINTS[index % CARD_TINTS.length];
              const previewTrack = pack.tracks?.[0];
              const previewKey = previewTrack ? `${pack.slug}-${trackId(previewTrack)}` : null;
              const isPlaying = previewKey && activeTrackKey === previewKey;
              const isActive = activeIndex === index;
              const isSelected = selectedSlug === pack.slug;

              return (
                <article
                  key={pack.slug}
                  ref={(element) => {
                    cardRefs.current[index] = element;
                  }}
                  aria-hidden={!isActive}
                  className="absolute left-1/2 top-[43%] h-[24rem] w-[calc(100vw-2rem)] max-w-[39rem] transition-opacity duration-150 sm:top-[38%] sm:h-[16rem] sm:w-[min(64vw,39rem)]"
                  style={{
                    transformStyle: 'preserve-3d',
                    willChange: 'transform, opacity'
                  }}
                >
                  {THICKNESS_LAYERS.map((depth) => (
                    <div
                      key={depth}
                      className="absolute inset-0 rounded-[1.8rem] border border-white/10"
                      style={{
                        backgroundColor: `${tint}24`,
                        transform: `translateZ(${depth}px)`,
                        boxShadow: `inset 0 0 0 1px ${tint}10`
                      }}
                    />
                  ))}

                  <div
                    className="absolute inset-0 overflow-hidden rounded-[1.8rem] border p-6 backdrop-blur-3xl sm:p-7"
                    style={{
                      background: `linear-gradient(132deg, ${tint}55 0%, rgba(16,23,25,0.88) 48%, rgba(7,11,12,0.96) 100%)`,
                      borderColor: isSelected ? `${tint}d0` : `${tint}94`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), inset 24px 0 56px ${tint}25, 0 24px 60px -42px rgba(0,0,0,0.88)`,
                      transform: 'translateZ(2px)',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    <div className="pointer-events-none absolute -left-16 -top-28 size-72 rounded-full blur-3xl" style={{ backgroundColor: `${tint}45` }} />
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between gap-5">
                        <span className="text-[10px] tabular-nums tracking-[0.24em] text-white/40">{String(index + 1).padStart(2, '0')}</span>
                        <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-[8px] uppercase tracking-[0.2em] text-white/50">{pack.eyebrow}</span>
                      </div>

                      <div className="mt-8 max-w-xl sm:mt-5">
                        <h2 className="text-3xl font-extralight tracking-[-0.04em] text-white sm:text-4xl">{pack.name}</h2>
                        <p className="mt-4 line-clamp-3 max-w-lg text-sm font-light leading-6 text-white/60 sm:mt-3 sm:line-clamp-2 sm:leading-5">{pack.summary}</p>
                      </div>

                      <div className="mt-auto flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-3">
                        <button
                          type="button"
                          tabIndex={isActive ? 0 : -1}
                          disabled={!previewTrack || !trackUrl(previewTrack)}
                          data-track-key={previewKey || undefined}
                          onClick={() => onPreview(pack, previewTrack)}
                          className="inline-flex min-w-0 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label={`${isPlaying ? 'Stop' : 'Play'} 30-second preview of ${pack.name}`}
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-black/15 text-white transition hover:bg-white hover:text-[#071012]">
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
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => onSelect(pack.slug)}
                          className="inline-flex items-center justify-between gap-5 rounded-full border border-white/15 bg-black/10 px-5 py-3 text-[9px] uppercase tracking-[0.2em] text-white/70 transition hover:bg-white hover:text-[#071012] active:translate-y-px sm:justify-center"
                        >
                          Choose this pack <ArrowRight className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 grid place-items-center overflow-hidden rounded-[1.8rem] border border-white/10 p-8 text-center"
                    style={{
                      background: `linear-gradient(145deg, rgba(7,11,12,0.96), ${tint}50)`,
                      transform: 'rotateX(180deg) translateZ(3px)',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.28em] text-white/35">Cognistration collection</p>
                      <p className="mt-5 text-3xl font-extralight tracking-tight text-white/80">{pack.name}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/30">{pack.durationLabel || 'About 50 minutes'}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
