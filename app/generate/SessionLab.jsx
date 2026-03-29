'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { consumerTemplateOptions, defaultSessionSpec, buildTemplateSessionSpec } from './chatspec';
import { FocusPresets } from '@/lib/audio/presets';
import { AmbientAssetOptions } from '@/lib/audio/assets';
import { buildJourneyBlueprint } from '@/lib/audio/journeys';
import { SessionCharts } from '@/components/analytics/SessionCharts';
import { resolveBackendAssetUrl } from '@/lib/frontend/backend-url';

const STOIC_RENDER_MESSAGES = [
  'Hold steady. Precision takes time.',
  'The signal is being shaped with care.',
  'Stillness belongs to the process.',
  'Remain here. The session is still forming.',
  'Clean output favors patience over haste.'
];

const TEMPLATE_ACCENTS = {
  gold: {
    border: 'rgba(214,183,109,0.45)',
    glow: 'rgba(214,183,109,0.18)',
    surface: 'linear-gradient(180deg, rgba(240,216,157,0.14), rgba(127,213,223,0.06))',
    bar: 'linear-gradient(180deg, #f0d89d, #f8efcf)',
    pillBg: 'rgba(214,183,109,0.12)',
    pillBorder: 'rgba(214,183,109,0.22)'
  },
  ice: {
    border: 'rgba(127,213,223,0.45)',
    glow: 'rgba(127,213,223,0.18)',
    surface: 'linear-gradient(180deg, rgba(127,213,223,0.14), rgba(255,255,255,0.04))',
    bar: 'linear-gradient(180deg, #7fd5df, #d9fcff)',
    pillBg: 'rgba(127,213,223,0.12)',
    pillBorder: 'rgba(127,213,223,0.22)'
  },
  emerald: {
    border: 'rgba(134,207,160,0.45)',
    glow: 'rgba(134,207,160,0.16)',
    surface: 'linear-gradient(180deg, rgba(134,207,160,0.14), rgba(255,255,255,0.04))',
    bar: 'linear-gradient(180deg, #86cfa0, #dffae8)',
    pillBg: 'rgba(134,207,160,0.12)',
    pillBorder: 'rgba(134,207,160,0.2)'
  },
  copper: {
    border: 'rgba(206,150,112,0.45)',
    glow: 'rgba(206,150,112,0.16)',
    surface: 'linear-gradient(180deg, rgba(206,150,112,0.14), rgba(255,255,255,0.04))',
    bar: 'linear-gradient(180deg, #ce9670, #f0c9b0)',
    pillBg: 'rgba(206,150,112,0.12)',
    pillBorder: 'rgba(206,150,112,0.2)'
  },
  rose: {
    border: 'rgba(221,147,180,0.45)',
    glow: 'rgba(221,147,180,0.16)',
    surface: 'linear-gradient(180deg, rgba(221,147,180,0.14), rgba(255,255,255,0.04))',
    bar: 'linear-gradient(180deg, #dd93b4, #ffe0ed)',
    pillBg: 'rgba(221,147,180,0.12)',
    pillBorder: 'rgba(221,147,180,0.2)'
  }
};

function formatClock(seconds) {
  const total = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function minutesFromSeconds(seconds) {
  return Number(((seconds || 0) / 60).toFixed(2));
}

function toStageMinutes(seconds) {
  return Number(Math.max(0.25, ((seconds || 0) / 60)).toFixed(2));
}

function getLayer(spec, type) {
  return spec.layers.find((layer) => layer.type === type);
}

function buildRenderPayload(sessionSpec, options = {}) {
  const breath = getLayer(sessionSpec, 'breath');
  const background = getLayer(sessionSpec, 'background');
  const withBreath = options.withBreath ?? true;
  const withBackground = options.withBackground ?? true;

  const backgroundPayload = withBackground && background
    ? background.params.sourceType === 'asset'
      ? { type: 'asset', assetId: background.params.assetId, mixDb: background.params.mixDb }
      : { type: 'ocean', mixDb: background.params.mixDb }
    : undefined;

  return {
    exportProfile: options.exportProfile || 'premium',
    journeyPresetId: sessionSpec.journeyPresetId,
    focusLevel: sessionSpec.focusLevel,
    lengthSec: sessionSpec.lengthSec,
    baseFreqHz: sessionSpec.baseFreqHz,
    stageBlueprint: sessionSpec.stages,
    entrainmentModes: { binaural: true, monaural: false, isochronic: false },
    breathGuide: withBreath && breath
      ? {
          enabled: true,
          pattern: breath.params.pattern || 'coherent-5.5',
          bpm: sessionSpec.breathRate ? Number((sessionSpec.breathRate * 60).toFixed(2)) : undefined
        }
      : undefined,
    background: backgroundPayload
  };
}

function SignalBars({ active, gradient, count = 16, compact = false }) {
  return (
    <div className={`flex items-end gap-1 ${compact ? 'h-12' : 'h-16'}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.span
          key={index}
          className="block flex-1 rounded-full"
          style={{
            background: gradient,
            minHeight: compact ? 10 : 14,
            transformOrigin: 'bottom center'
          }}
          animate={active ? { scaleY: [0.35, 1, 0.45] } : { scaleY: 0.35, opacity: 0.45 }}
          transition={
            active
              ? {
                  duration: 1.1 + (index % 4) * 0.1,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: index * 0.05
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}

export function SessionLab() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(consumerTemplateOptions[0].id);
  const [spec, setSpec] = useState(defaultSessionSpec);
  const [status, setStatus] = useState('30 curated HemiSync templates are ready.');
  const [rendering, setRendering] = useState(false);
  const [renderMessageIndex, setRenderMessageIndex] = useState(0);
  const [renderResult, setRenderResult] = useState(null);
  const [sampleCache, setSampleCache] = useState({});
  const [sampleLoadingId, setSampleLoadingId] = useState(null);
  const [sampleState, setSampleState] = useState({
    activeId: null,
    playing: false,
    currentTime: 0,
    duration: 0
  });
  const audioRef = useRef(null);

  const selectedTemplate = useMemo(() => {
    return consumerTemplateOptions.find((template) => template.id === selectedTemplateId) || consumerTemplateOptions[0];
  }, [selectedTemplateId]);

  const selectedJourney = useMemo(() => {
    return buildJourneyBlueprint({
      journeyPresetId: spec.journeyPresetId,
      totalLengthSec: spec.lengthSec,
      baseFreqHz: spec.baseFreqHz,
      focusLevel: spec.focusLevel,
      stages: spec.stages
    });
  }, [spec.baseFreqHz, spec.focusLevel, spec.journeyPresetId, spec.lengthSec, spec.stages]);

  const selectedBackgroundLayer = getLayer(spec, 'background');
  const selectedBackgroundSource = selectedBackgroundLayer?.params?.sourceType || 'none';
  const selectedAmbientAsset = AmbientAssetOptions.find((asset) => asset.id === selectedBackgroundLayer?.params?.assetId);
  const activeSample = sampleState.activeId ? sampleCache[sampleState.activeId] : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return undefined;
    }

    const handleTimeUpdate = () => {
      setSampleState((prev) => ({
        ...prev,
        currentTime: audio.currentTime || 0,
        duration: audio.duration || prev.duration
      }));
    };

    const handlePlay = () => {
      setSampleState((prev) => ({
        ...prev,
        playing: true,
        duration: audio.duration || prev.duration
      }));
    };

    const handlePause = () => {
      setSampleState((prev) => ({ ...prev, playing: false }));
    };

    const handleEnded = () => {
      setSampleState((prev) => ({
        ...prev,
        playing: false,
        currentTime: 0
      }));
      audio.currentTime = 0;
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTemplateSamples() {
      try {
        const response = await fetch('/api/template-samples', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !data.ok || cancelled) {
          return;
        }

        const nextCache = Object.fromEntries(
          Object.entries(data.samples || {}).map(([templateId, sample]) => [
            templateId,
            {
              wav: sample.wavUrl || sample.wav || null,
              mp3: sample.mp3Url || sample.mp3 || null,
              durationSec: sample.sampleLengthSec || sample.durationSec || 120,
              preRendered: true
            }
          ])
        );

        setSampleCache((prev) => ({ ...nextCache, ...prev }));
      } catch (error) {
        console.warn('Template sample manifest unavailable', error);
      }
    }

    loadTemplateSamples();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!rendering) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRenderMessageIndex((prev) => (prev + 1) % STOIC_RENDER_MESSAGES.length);
    }, 2600);

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [rendering]);

  const updateLayerParams = (type, partial) => {
    setSpec((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.type === type ? { ...layer, params: { ...layer.params, ...partial } } : layer
      )
    }));
  };

  const setBackgroundSource = (sourceType) => {
    if (sourceType === 'none') {
      setSpec((prev) => ({
        ...prev,
        layers: prev.layers.filter((layer) => layer.type !== 'background')
      }));
      return;
    }

    const defaultAsset = selectedTemplate.background?.assetId || selectedJourney.background?.assetId || 'lumina';
    const nextParams = sourceType === 'asset'
      ? { sourceType: 'asset', assetId: defaultAsset, mixDb: selectedJourney.background?.mixDb ?? -24 }
      : { sourceType: 'ocean', mixDb: -24 };

    if (selectedBackgroundLayer) {
      updateLayerParams('background', nextParams);
      return;
    }

    setSpec((prev) => ({
      ...prev,
      layers: [...prev.layers, { id: 'layer-background', type: 'background', params: nextParams }]
    }));
  };

  const updateStage = (index, partial) => {
    setSpec((prev) => ({
      ...prev,
      stages: prev.stages.map((stage, stageIndex) => {
        if (stageIndex !== index) {
          return stage;
        }

        return {
          ...stage,
          ...partial,
          deltaHz: partial.deltaHz ? { ...(stage.deltaHz || {}), ...partial.deltaHz } : stage.deltaHz
        };
      })
    }));
  };

  const syncJourneyToLength = (nextLengthSec = spec.lengthSec) => {
    const nextJourney = buildJourneyBlueprint({
      journeyPresetId: spec.journeyPresetId,
      totalLengthSec: nextLengthSec,
      baseFreqHz: spec.baseFreqHz,
      focusLevel: spec.focusLevel,
      stages: spec.stages,
      journeyName: selectedTemplate.title
    });

    setSpec((prev) => ({
      ...prev,
      focusLevel: nextJourney.focusLevel,
      lengthSec: nextJourney.totalLengthSec,
      baseFreqHz: nextJourney.baseFreqHz,
      deltaHz: nextJourney.stages[0]?.deltaHz?.from ?? prev.deltaHz,
      stages: nextJourney.stages,
      layers: prev.layers.map((layer) => {
        if (layer.type !== 'binaural') {
          return layer;
        }

        return {
          ...layer,
          params: {
            ...layer.params,
            baseFreqHz: nextJourney.baseFreqHz,
            delta: {
              from: nextJourney.stages[0]?.deltaHz?.from ?? layer.params.delta?.from ?? prev.deltaHz,
              to: nextJourney.stages[nextJourney.stages.length - 1]?.deltaHz?.to ?? layer.params.delta?.to ?? prev.deltaHz
            }
          }
        };
      })
    }));
  };

  const rebalanceStages = () => {
    syncJourneyToLength(spec.lengthSec);
    setStatus('Stage timing refreshed.');
  };

  const applyConsumerTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setSpec(buildTemplateSessionSpec(template));
    setRenderResult(null);
    setStatus(`${template.title} selected.`);
  };

  const playCachedSample = async (templateId, sample) => {
    const audio = audioRef.current;
    if (!audio || !sample) {
      return;
    }

    const source = sample.mp3 || sample.wav;
    if (!source) {
      throw new Error('Sample audio is unavailable.');
    }

    if (audio.src !== source) {
      audio.src = source;
      audio.currentTime = 0;
    }

    await audio.play();
    setSampleState({
      activeId: templateId,
      playing: true,
      currentTime: audio.currentTime || 0,
      duration: audio.duration || sample.durationSec || 120
    });
  };

  const handleSampleToggle = async (template) => {
    const audio = audioRef.current;
    const cachedSample = sampleCache[template.id];

    if (selectedTemplateId !== template.id) {
      applyConsumerTemplate(template);
    }

    if (sampleState.activeId === template.id && sampleState.playing && audio) {
      audio.pause();
      setStatus(`${template.title} sample paused.`);
      return;
    }

    if (sampleState.activeId === template.id && cachedSample) {
      try {
        await playCachedSample(template.id, cachedSample);
        setStatus(`${template.title} sample playing.`);
      } catch (error) {
        setStatus(`Sample failed: ${error.message}`);
      }
      return;
    }

    if (cachedSample) {
      try {
        await playCachedSample(template.id, cachedSample);
        setStatus(`${template.title} sample playing.`);
      } catch (error) {
        setStatus(`Sample failed: ${error.message}`);
      }
      return;
    }

    try {
      setSampleLoadingId(template.id);
      setSampleState({
        activeId: template.id,
        playing: false,
        currentTime: 0,
        duration: template.sampleLengthSec
      });
      setStatus(`Generating a 2 minute carrier sample for ${template.title}…`);

      const previewSpec = buildTemplateSessionSpec(template, { lengthSec: template.sampleLengthSec });
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildRenderPayload(previewSpec, {
            exportProfile: 'standard',
            withBreath: false,
            withBackground: false
          })
        )
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Sample render failed');
      }

      const nextSample = {
        wav: resolveBackendAssetUrl(data.wav),
        mp3: resolveBackendAssetUrl(data.mp3),
        durationSec: template.sampleLengthSec
      };

      setSampleCache((prev) => ({
        ...prev,
        [template.id]: nextSample
      }));

      await playCachedSample(template.id, nextSample);
      setStatus(`${template.title} sample ready.`);
    } catch (error) {
      console.error(error);
      setStatus(`Sample failed: ${error.message}`);
    } finally {
      setSampleLoadingId(null);
    }
  };

  const handleGenerate = async () => {
    try {
      setRendering(true);
      setRenderMessageIndex(0);
      setStatus(`Rendering the full ${selectedTemplate.title} session…`);

      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRenderPayload(spec, { exportProfile: 'premium' }))
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Render failed');
      }

      setRenderResult({
        wav: resolveBackendAssetUrl(data.wav),
        mp3: resolveBackendAssetUrl(data.mp3),
        analytics: data.analytics,
        stages: data.stages,
        journey: data.journey
      });
      setStatus('Render complete. Your full session is ready.');
    } catch (error) {
      console.error(error);
      setStatus(`Render failed: ${error.message}`);
    } finally {
      setRendering(false);
    }
  };

  return (
    <section className="mt-10 space-y-8">
      <audio ref={audioRef} hidden preload="none" />

      <AnimatePresence>
        {rendering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,10,14,0.88)] px-6 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(240,216,157,0.08),rgba(127,213,223,0.05))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
            >
              <div className="space-y-3">
                <p className="section-label">Rendering Full Session</p>
                <h2 className="display-type text-4xl text-[var(--text-primary)] sm:text-5xl">
                  Do not leave this screen.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                  We are mastering your full binaural session and preparing the download files. Staying here avoids
                  broken renders and incomplete artifacts.
                </p>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                <SignalBars active gradient={TEMPLATE_ACCENTS.gold.bar} />
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: TEMPLATE_ACCENTS.ice.bar }}
                    animate={{ x: ['-12%', '108%'] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="block h-full w-20 rounded-full bg-white/55 blur-[2px]" />
                  </motion.div>
                </div>
              </div>

              <div className="mt-6 min-h-14">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={renderMessageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="text-lg text-white/82"
                  >
                    {STOIC_RENDER_MESSAGES[renderMessageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="glass-emphasis border border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Your HemiSync Builder</h2>
            <p className="text-sm text-white/70">
              Choose from {consumerTemplateOptions.length} curated templates, hear a clean 2 minute carrier sample,
              then render the full stereo session.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60">{status}</div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="glass p-6 space-y-6 xl:col-span-2">
          <div className="space-y-2">
            <p className="section-label">Step 1</p>
            <h3 className="text-white font-medium">Hear the template before you commit</h3>
            <p className="text-sm text-white/70">
              Every card can open into a 2 minute stereo carrier sample. Samples stay clean and beat-forward so the
              hemispheric rhythm is easy to judge.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {consumerTemplateOptions.map((template) => {
              const isActive = selectedTemplate?.id === template.id;
              const accent = TEMPLATE_ACCENTS[template.accent] || TEMPLATE_ACCENTS.gold;
              const isSampleCardActive = sampleState.activeId === template.id;
              const isLoadingSample = sampleLoadingId === template.id;
              const progressPercent = isSampleCardActive && sampleState.duration
                ? Math.min(100, (sampleState.currentTime / sampleState.duration) * 100)
                : 0;

              return (
                <motion.div
                  key={template.id}
                  layout
                  className="rounded-[1.5rem] border p-5 text-left"
                  style={
                    isActive
                      ? {
                          borderColor: accent.border,
                          backgroundImage: accent.surface,
                          boxShadow: `0 16px 56px ${accent.glow}`
                        }
                      : undefined
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70"
                          style={{ backgroundColor: accent.pillBg, borderColor: accent.pillBorder }}
                        >
                          {template.category}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/60">
                          2 min sample
                        </span>
                      </div>
                      <div>
                        <h4 className="display-type text-3xl leading-none text-[var(--text-primary)]">{template.title}</h4>
                        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{template.useCase}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSampleToggle(template)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/70 transition-colors hover:bg-white/[0.1]"
                    >
                      {isLoadingSample ? 'Loading' : isSampleCardActive && sampleState.playing ? 'Pause' : 'Play'}
                    </button>
                  </div>

                  <p className="mt-4 text-xs leading-6 text-[var(--text-muted)]">{template.bestFor}</p>

                  <div className="mt-5 flex items-center gap-3">
                    <Button
                      variant={isActive ? 'default' : 'secondary'}
                      onClick={() => applyConsumerTemplate(template)}
                    >
                      {isActive ? 'Selected' : 'Use Template'}
                    </Button>
                    <span className="text-xs uppercase tracking-[0.14em] text-white/45">{template.shortLabel}</span>
                  </div>

                  <AnimatePresence initial={false}>
                    {(isSampleCardActive || isLoadingSample) && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20"
                      >
                        <div className="space-y-4 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Signal Deck</p>
                              <p className="mt-1 text-sm text-white/80">Pure stereo carrier sample. No ambience.</p>
                            </div>
                            <span
                              className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70"
                              style={{ backgroundColor: accent.pillBg, borderColor: accent.pillBorder }}
                            >
                              {isLoadingSample ? 'Generating' : sampleState.playing ? 'Playing' : 'Ready'}
                            </span>
                          </div>

                          <motion.div layout className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
                            <SignalBars
                              active={isLoadingSample || (isSampleCardActive && sampleState.playing)}
                              gradient={accent.bar}
                              compact
                            />
                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.max(progressPercent, isLoadingSample ? 12 : 0)}%`,
                                  background: accent.bar
                                }}
                              />
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/55">
                              <span>Beat-focused preview for {template.title.toLowerCase()}.</span>
                              <span>{formatClock(sampleState.currentTime)} / {formatClock(sampleState.duration || template.sampleLengthSec)}</span>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="section-label">Current Template</p>
                <h4 className="display-type text-3xl text-[var(--text-primary)]">{selectedTemplate.title}</h4>
                <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{selectedTemplate.description}</p>
              </div>
              <Button variant="secondary" onClick={rebalanceStages}>
                Refresh Timing
              </Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold-strong)]">Best For</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{selectedTemplate.bestFor}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold-strong)]">Ritual</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{selectedTemplate.ritual}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold-strong)]">Flow</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  {spec.stages.length} stages across {minutesFromSeconds(spec.lengthSec)} minutes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="section-label">Step 2</p>
              <h3 className="text-white font-medium">Set the full-session basics</h3>
              <p className="text-sm text-white/70">
                Samples stay pure and beat-first. These controls shape the full render you keep.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[10, 15, 20, 30].map((minutes) => {
                const isActive = Math.round(spec.lengthSec / 60) === minutes;
                return (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => syncJourneyToLength(minutes * 60)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${
                      isActive
                        ? 'border-[rgba(214,183,109,0.35)] bg-[rgba(214,183,109,0.14)] text-[var(--text-primary)]'
                        : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    {minutes} min
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-wide text-white/60">Session Length (minutes)</label>
                <Input
                  type="number"
                  min={5}
                  max={30}
                  value={Math.round(spec.lengthSec / 60)}
                  onChange={(event) => syncJourneyToLength(Number(event.target.value || 15) * 60)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/60">Depth Mode</label>
                <Select
                  value={spec.focusLevel}
                  onChange={(event) => setSpec((prev) => ({ ...prev, focusLevel: event.target.value }))}
                >
                  {Object.keys(FocusPresets).map((focusLevel) => (
                    <option key={focusLevel} value={focusLevel}>
                      {focusLevel} - {FocusPresets[focusLevel].description}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/60">Breath Pattern</label>
                <Select
                  value={getLayer(spec, 'breath')?.params?.pattern || 'coherent-5.5'}
                  onChange={(event) => updateLayerParams('breath', { pattern: event.target.value })}
                >
                  <option value="coherent-5.5">Coherent 5.5</option>
                  <option value="box">Box 4-4-4-4</option>
                  <option value="4-7-8">4-7-8</option>
                </Select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/60">Full-Session Atmosphere</label>
                <Select value={selectedBackgroundSource} onChange={(event) => setBackgroundSource(event.target.value)}>
                  <option value="none">Pure carrier only</option>
                  <option value="asset">Bundled atmosphere</option>
                  <option value="ocean">Procedural ocean</option>
                </Select>
              </div>
            </div>

            {selectedBackgroundSource === 'asset' && selectedBackgroundLayer && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/60">Included Atmosphere</label>
                  <Select
                    value={selectedBackgroundLayer.params.assetId || 'lumina'}
                    onChange={(event) => updateLayerParams('background', { assetId: event.target.value })}
                  >
                    {AmbientAssetOptions.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} - {asset.summary}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/60">Atmosphere Mix (dB)</label>
                  <Input
                    type="number"
                    value={selectedBackgroundLayer.params.mixDb ?? -24}
                    onChange={(event) => updateLayerParams('background', { mixDb: Number(event.target.value) })}
                  />
                </div>
              </div>
            )}

            {selectedBackgroundSource === 'ocean' && selectedBackgroundLayer && (
              <div>
                <label className="text-xs uppercase tracking-wide text-white/60">Ocean Mix (dB)</label>
                <Input
                  type="number"
                  value={selectedBackgroundLayer.params.mixDb ?? -24}
                  onChange={(event) => updateLayerParams('background', { mixDb: Number(event.target.value) })}
                />
              </div>
            )}
          </div>

          <details className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-label">Advanced</p>
                  <h4 className="text-white font-medium">Fine tune the stereo signal path</h4>
                </div>
                <span className="text-xs uppercase tracking-[0.14em] text-white/45">Expand</span>
              </div>
            </summary>

            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/60">Carrier Frequency</label>
                  <Input
                    type="number"
                    min={100}
                    max={500}
                    value={spec.baseFreqHz}
                    onChange={(event) => {
                      const value = Number(event.target.value || spec.baseFreqHz);
                      setSpec((prev) => ({ ...prev, baseFreqHz: value }));
                      updateLayerParams('binaural', { baseFreqHz: value });
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-white/60">Journey Focus Level</label>
                  <Select
                    value={spec.focusLevel}
                    onChange={(event) => setSpec((prev) => ({ ...prev, focusLevel: event.target.value }))}
                  >
                    <option value="F10">F10</option>
                    <option value="F12">F12</option>
                    <option value="F15">F15</option>
                    <option value="F21">F21</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-white font-medium">Stage Blueprint</h4>
                  <p className="text-xs text-white/60">
                    Adjust timing, delta ramps, and carrier movement without leaving binaural mode.
                  </p>
                </div>
                <div className="space-y-4">
                  {spec.stages.map((stage, index) => (
                    <div key={stage.id || index} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {formatClock(stage.atSec)} to {formatClock(stage.atSec + stage.durationSec)}
                          </p>
                          <p className="text-xs text-white/55">Stage {index + 1}</p>
                        </div>
                        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                          {stage.focusLevel} · {stage.brainState}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="xl:col-span-2">
                          <label className="text-xs uppercase tracking-wide text-white/60">Stage Name</label>
                          <Input value={stage.name} onChange={(event) => updateStage(index, { name: event.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-white/60">Duration (min)</label>
                          <Input
                            type="number"
                            min={0.25}
                            step="0.25"
                            value={toStageMinutes(stage.durationSec)}
                            onChange={(event) =>
                              updateStage(index, {
                                durationSec: Math.max(15, Math.round(Number(event.target.value || 0.25) * 60))
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-white/60">Brain State</label>
                          <Select value={stage.brainState} onChange={(event) => updateStage(index, { brainState: event.target.value })}>
                            <option value="alpha">alpha</option>
                            <option value="theta">theta</option>
                            <option value="delta">delta</option>
                            <option value="beta">beta</option>
                            <option value="gamma">gamma</option>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <label className="text-xs uppercase tracking-wide text-white/60">Stage Focus</label>
                          <Select value={stage.focusLevel} onChange={(event) => updateStage(index, { focusLevel: event.target.value })}>
                            <option value="F10">F10</option>
                            <option value="F12">F12</option>
                            <option value="F15">F15</option>
                            <option value="F21">F21</option>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-white/60">Df Start</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={stage.deltaHz?.from ?? ''}
                            onChange={(event) => updateStage(index, { deltaHz: { from: Number(event.target.value) } })}
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-white/60">Df End</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={stage.deltaHz?.to ?? ''}
                            onChange={(event) => updateStage(index, { deltaHz: { to: Number(event.target.value) } })}
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-white/60">Carrier (Hz)</label>
                          <Input
                            type="number"
                            value={stage.carrierHz ?? spec.baseFreqHz}
                            onChange={(event) => updateStage(index, { carrierHz: Number(event.target.value) })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-wide text-white/60">Stage Goal</label>
                        <Input value={stage.goal || ''} onChange={(event) => updateStage(index, { goal: event.target.value })} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </Card>

        <div className="space-y-6">
          <Card className="glass p-6 space-y-4">
            <p className="section-label">At a Glance</p>
            <h3 className="display-type text-3xl text-[var(--text-primary)]">{selectedTemplate.title}</h3>
            <p className="text-sm leading-7 text-[var(--text-secondary)]">{selectedTemplate.useCase}</p>

            <div className="grid gap-3">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold-strong)]">Length</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{minutesFromSeconds(spec.lengthSec)} minutes</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold-strong)]">Atmosphere</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {selectedBackgroundSource === 'asset'
                    ? selectedAmbientAsset?.name || 'Bundled atmosphere'
                    : selectedBackgroundSource === 'ocean'
                      ? 'Procedural ocean'
                      : 'Pure carrier only'}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold-strong)]">Preview Mode</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">2 minute clean stereo carrier sample</p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6 space-y-4">
            <p className="section-label">Step 3</p>
            <h3 className="text-white font-medium">Render the full session</h3>
            <p className="text-sm text-white/70">
              Full renders stay binaural-only for a cleaner hemispheric difference path. Atmosphere and breath are only
              applied to the finished session, not the card samples.
            </p>
            <Button onClick={handleGenerate} disabled={rendering}>
              {rendering ? 'Rendering…' : 'Render Full Session'}
            </Button>
            <p className="text-xs leading-6 text-white/45">
              Rendering opens a full-screen mastering state and asks the user to remain on screen until files are ready.
            </p>

            {renderResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm text-white/70">Full session ready</p>
                  <p className="mt-2 text-lg text-white">{renderResult.journey?.name || selectedTemplate.title}</p>
                </div>
                <audio controls className="w-full" src={renderResult.wav} />
                <div className="flex flex-wrap gap-3">
                  <a
                    href={renderResult.wav}
                    download="hemisync-session.wav"
                    className="rounded-md bg-sky-400/90 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-sky-300"
                  >
                    Download WAV
                  </a>
                  {renderResult.mp3 && (
                    <a
                      href={renderResult.mp3}
                      download="hemisync-session.mp3"
                      className="rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
                    >
                      Download MP3
                    </a>
                  )}
                </div>
                {renderResult.stages?.length > 0 && (
                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <h4 className="text-white font-medium">Rendered Stage Plan</h4>
                    <div className="space-y-2">
                      {renderResult.stages.map((stage) => (
                        <div
                          key={stage.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-sm text-white/85"
                        >
                          <span>{stage.name}</span>
                          <span className="text-white/60">
                            {formatClock(stage.atSec)} · {minutesFromSeconds(stage.durationSec)} min · {stage.brainState}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </Card>

          <Card className="glass p-6 space-y-4">
            <h3 className="text-white font-medium">Included atmospheres</h3>
            <div className="space-y-3">
              {AmbientAssetOptions.map((asset) => (
                <div key={asset.id} className="rounded-lg border border-white/10 bg-black/10 p-3">
                  <p className="text-sm font-medium text-white">{asset.name}</p>
                  <p className="text-xs text-white/60">{asset.summary}</p>
                </div>
              ))}
            </div>
          </Card>

          {activeSample && (
            <Card className="glass p-6 space-y-4">
              <p className="section-label">Sample Status</p>
              <h3 className="text-white font-medium">{selectedTemplate.title} sample</h3>
              <p className="text-sm text-white/70">
                {sampleState.playing ? 'The active carrier sample is playing now.' : 'The current sample is ready to resume.'}
              </p>
              <div className="rounded-[1rem] border border-white/10 bg-black/20 p-4">
                <SignalBars active={sampleState.playing} gradient={TEMPLATE_ACCENTS[selectedTemplate.accent]?.bar || TEMPLATE_ACCENTS.gold.bar} compact />
                <div className="mt-3 text-xs text-white/55">
                  {formatClock(sampleState.currentTime)} / {formatClock(sampleState.duration || activeSample.durationSec)}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {renderResult?.analytics && <SessionCharts analytics={renderResult.analytics} />}
    </section>
  );
}
