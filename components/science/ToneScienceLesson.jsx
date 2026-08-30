'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, DownloadSimple, Printer, X } from '@phosphor-icons/react';
import {
  SCIENCE_GUIDE_SLIDES,
  SCIENCE_GUIDE_SOURCES
} from '@/lib/agentic/science-content';
import { OceanSurfaceCanvas } from './OceanSurfaceCanvas';

const PUBLIC_STATES = new Set(['delta', 'theta', 'alpha', 'beta', 'gamma']);

function boundedNumber(value, fallback, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
}

export function ToneScienceLesson({
  id = 'tone-science-guide',
  tone = null,
  controls = {},
  generationKey = null,
  open: controlledOpen,
  onOpenChange
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [oceanProfile, setOceanProfile] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfMessage, setPdfMessage] = useState('');
  const isControlled = typeof controlledOpen === 'boolean';
  const isOpen = isControlled ? controlledOpen : localOpen;

  const setOpen = useCallback((nextOpen) => {
    if (!isControlled) setLocalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [isControlled, onOpenChange]);

  const safeControls = useMemo(() => {
    const state = PUBLIC_STATES.has(controls.targetState)
      ? controls.targetState
      : PUBLIC_STATES.has(tone?.state)
        ? tone.state
        : 'theta';
    return {
      targetState: state,
      carrierHz: Math.round(boundedNumber(controls.carrierHz ?? tone?.baseFreqHz, 200, 100, 400)),
      beatHz: Math.round(boundedNumber(controls.beatHz ?? tone?.targetHz, 6, 0.5, 40) * 10) / 10,
      volume: Math.round(boundedNumber(controls.volume, 72, 0, 100))
    };
  }, [controls.beatHz, controls.carrierHz, controls.targetState, controls.volume, tone?.baseFreqHz, tone?.state, tone?.targetHz]);

  const sourceById = useMemo(() => new Map(SCIENCE_GUIDE_SOURCES.map((source) => [source.id, source])), []);
  const slide = SCIENCE_GUIDE_SLIDES[slideIndex] || SCIENCE_GUIDE_SLIDES[0];
  const sourceLinks = (slide.sourceIds || []).map((sourceId) => sourceById.get(sourceId)).filter(Boolean);

  useEffect(() => {
    if (isOpen) setSlideIndex(0);
  }, [isOpen]);

  useEffect(() => {
    setOceanProfile(null);
    setPdfMessage('');
  }, [generationKey]);

  const handleOceanProfile = useCallback((profile) => {
    setOceanProfile(profile);
  }, []);

  const downloadScienceGuidePdf = useCallback(async () => {
    setIsDownloadingPdf(true);
    setPdfMessage('Preparing a static guide snapshot...');

    try {
      const response = await fetch('/api/science-guide/pdf', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          toneId: tone?.id || null,
          controls: safeControls,
          ocean: oceanProfile ? { seed: oceanProfile.seed } : null
        })
      });
      if (!response.ok) throw new Error('The PDF export request failed.');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const runLabel = oceanProfile?.runLabel || 'snapshot';
      link.href = downloadUrl;
      link.download = `cognistration-science-guide-${runLabel}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      setPdfMessage(`PDF downloaded. Ocean run ${runLabel} is recorded in the file.`);
    } catch (error) {
      console.error('Science guide PDF export failed:', error);
      setPdfMessage('PDF download was unavailable, so the browser print dialog was opened instead.');
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [oceanProfile, safeControls, tone?.id]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft') setSlideIndex((current) => Math.max(0, current - 1));
      if (event.key === 'ArrowRight') setSlideIndex((current) => Math.min(SCIENCE_GUIDE_SLIDES.length - 1, current + 1));
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setOpen]);

  return (
    <section id={id} data-testid="tone-science-lesson" aria-label="Cognistration science guide" className="glass-subpanel mt-8 rounded-[2rem] border border-[#b6ddcc]/10 shadow-[0_24px_90px_rgba(0,0,0,0.2)]">
      {!isOpen ? (
        <div className="relative isolate overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -left-16 top-1/2 size-64 -translate-y-1/2 rounded-full bg-[#b6ddcc]/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-16 bottom-[-5rem] size-64 rounded-full bg-[#e0b493]/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="max-w-xl text-3xl font-medium tracking-[-0.055em] text-white sm:text-4xl">Understand the signal</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">A short, click-through guide to the two-channel signal, FFR, frequency-band shorthand, evidence limits, and safe listening.</p>
            </div>
            <button type="button" onClick={() => setOpen(true)} className="glass-action glass-action--primary inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#b6ddcc] focus:ring-offset-2 focus:ring-offset-[#10221d]">
              Open guide
              <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative isolate min-h-[42rem] overflow-hidden bg-[#10221d] p-3 sm:p-5">
          <OceanSurfaceCanvas key={generationKey ?? 'science-ocean'} onProfileChange={handleOceanProfile} />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,22,18,0.25),rgba(7,22,18,0.72))]" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(182,221,204,0.18),transparent_30%),radial-gradient(circle_at_82%_80%,rgba(224,180,147,0.13),transparent_32%)]" aria-hidden="true" />

          <div className="glass-panel relative flex min-h-[39rem] flex-col rounded-[1.65rem] border border-[#b6ddcc]/10 p-4 shadow-[0_28px_100px_rgba(0,0,0,0.28)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#b6ddcc]/10 pb-4">
              <div>
                <h2 className="text-lg font-medium tracking-[-0.03em] text-white">Understand the signal</h2>
                <p className="mt-1 text-xs text-white/45">Audio is off. Move through the guide at your pace.</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={downloadScienceGuidePdf} disabled={isDownloadingPdf} aria-busy={isDownloadingPdf} className="glass-action glass-action--secondary inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs">
                  {isDownloadingPdf ? <Printer className="size-4 animate-pulse" aria-hidden="true" /> : <DownloadSimple className="size-4" aria-hidden="true" />}
                  {isDownloadingPdf ? 'Preparing PDF...' : 'Download PDF'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="glass-action glass-action--secondary inline-flex size-9 items-center justify-center rounded-full text-white/65" aria-label="Close science guide">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              {pdfMessage && <p className="basis-full text-right text-[11px] text-[#b6ddcc]/75" aria-live="polite">{pdfMessage}</p>}
            </div>

            <div className="mx-auto mt-5 flex w-full max-w-4xl flex-wrap items-center justify-center gap-x-5 gap-y-2 border-y border-[#b6ddcc]/10 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
              <span>Direction <strong className="text-[#b6ddcc]">{safeControls.targetState}</strong></span>
              <span>Carrier <strong className="text-white/75">{safeControls.carrierHz} Hz</strong></span>
              <span>Difference <strong className="text-white/75">{safeControls.beatHz.toFixed(1)} Hz</strong></span>
              <span className="text-[#b6ddcc]/75">Audio off</span>
            </div>

            <article id={`${id}-slide`} data-testid="tone-science-slideshow" tabIndex={-1} className="glass-subpanel mx-auto my-auto w-full max-w-4xl rounded-[1.7rem] border border-[#b6ddcc]/10 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.25)] outline-none sm:p-10" aria-live="polite" aria-label={`Slide ${slideIndex + 1} of ${SCIENCE_GUIDE_SLIDES.length}: ${slide.title}`}>
              <h3 className="max-w-3xl text-3xl font-medium leading-[1.04] tracking-[-0.055em] text-white sm:text-5xl">{slide.title}</h3>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">{slide.body}</p>

              {slide.bands?.length > 0 && (
                <div className="mt-7 overflow-hidden border-y border-[#b6ddcc]/10" role="table" aria-label="Descriptive frequency bands">
                  {slide.bands.map((band) => (
                    <div key={band.label} className="grid gap-2 border-b border-[#b6ddcc]/10 px-1 py-3 last:border-b-0 sm:grid-cols-[0.55fr_0.9fr_1fr] sm:gap-4" role="row">
                      <strong className="text-xs text-white" role="cell">{band.label}</strong>
                      <span className="text-xs text-white/55" role="cell">{band.range}</span>
                      <span className="text-xs text-[#b6ddcc]" role="cell">{band.direction}</span>
                    </div>
                  ))}
                </div>
              )}

              {slide.facts?.length > 0 && (
                <div className="mt-7 space-y-0 border-t border-[#b6ddcc]/10">
                  {slide.facts.map((fact) => (
                    <div key={fact.label} className="grid gap-2 border-b border-[#b6ddcc]/10 py-3 sm:grid-cols-[0.34fr_1fr] sm:gap-5">
                      <strong className="text-xs text-white/90">{fact.label}</strong>
                      <span className="text-xs leading-5 text-white/55">{fact.detail}</span>
                    </div>
                  ))}
                </div>
              )}

              {sourceLinks.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#b6ddcc]/10 pt-4">
                  {sourceLinks.map((source) => (
                    <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="text-xs text-white/45 underline decoration-[#b6ddcc]/20 underline-offset-4 transition hover:text-[#b6ddcc]">
                      {source.label}
                    </a>
                  ))}
                </div>
              )}
            </article>

            <div className="mx-auto mt-4 flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 border-t border-[#b6ddcc]/10 px-1 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">Slide {String(slideIndex + 1).padStart(2, '0')} / {String(SCIENCE_GUIDE_SLIDES.length).padStart(2, '0')}</span>
              <div className="flex items-center gap-2" role="tablist" aria-label="Science guide slides">
                {SCIENCE_GUIDE_SLIDES.map((candidate, index) => (
                  <button key={candidate.id} type="button" role="tab" aria-selected={slideIndex === index} aria-label={`Go to slide ${index + 1}: ${candidate.title}`} onClick={() => setSlideIndex(index)} className={`size-2 rounded-full transition ${slideIndex === index ? 'bg-[#b6ddcc] shadow-[0_0_0_4px_rgba(182,221,204,0.15)]' : 'bg-white/25 hover:bg-white/55'}`} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setSlideIndex((current) => Math.max(0, current - 1))} disabled={slideIndex === 0} className="glass-action glass-action--secondary inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs">
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  Previous
                </button>
                <button type="button" onClick={() => setSlideIndex((current) => Math.min(SCIENCE_GUIDE_SLIDES.length - 1, current + 1))} disabled={slideIndex === SCIENCE_GUIDE_SLIDES.length - 1} className="glass-action glass-action--primary inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs">
                  Next
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
