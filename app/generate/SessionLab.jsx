'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { defaultSessionSpec } from './chatspec';
import { FocusPresets } from '@/lib/audio/presets';
import { AmbientAssetOptions, buildAmbientAssetUrl } from '@/lib/audio/assets';
import { JourneyPresetOptions, buildJourneyBlueprint } from '@/lib/audio/journeys';
import { SessionCharts } from '@/components/analytics/SessionCharts';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID;
const RENDER_BUCKET = DEMO_USER_ID ? `renders-${DEMO_USER_ID}` : null;

let toneModulePromise;
function loadToneModule() {
  if (!toneModulePromise) {
    toneModulePromise = import('tone');
  }
  return toneModulePromise;
}

let pizzicatoModulePromise;
function loadPizzicatoModule() {
  if (!pizzicatoModulePromise) {
    pizzicatoModulePromise = import('pizzicato').then((mod) => mod.default || mod);
  }
  return pizzicatoModulePromise;
}

function useToneReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadToneModule()
      .then(() => mounted && setReady(true))
      .catch(() => mounted && setReady(false));

    return () => {
      mounted = false;
    };
  }, []);

  return ready;
}

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

export function SessionLab() {
  const toneReady = useToneReady();
  const [spec, setSpec] = useState(defaultSessionSpec);
  const [intent, setIntent] = useState('Build a polished alpha-to-theta session with a soft middle hold and a clean, steady return.');
  const [status, setStatus] = useState('Idle');
  const [playing, setPlaying] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderResult, setRenderResult] = useState(null);
  const [chatInput, setChatInput] = useState('Keep this at 15 minutes, make the theta hold softer, and smooth the return back into alpha.');
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const stopHandlesRef = useRef([]);

  const supabase = useMemo(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }, []);

  const getLayer = (type) => spec.layers.find((layer) => layer.type === type);

  const stageTotalSec = useMemo(
    () => spec.stages.reduce((sum, stage) => sum + (stage.durationSec || 0), 0),
    [spec.stages]
  );

  const selectedJourney = useMemo(() => {
    return JourneyPresetOptions.find((preset) => preset.id === spec.journeyPresetId) || JourneyPresetOptions[0];
  }, [spec.journeyPresetId]);

  const selectedBackgroundLayer = getLayer('background');
  const selectedBackgroundSource = selectedBackgroundLayer?.params?.sourceType || 'none';

  useEffect(() => {
    return () => {
      stopPreviewInternal();
    };
  }, []);

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

    const defaultAsset = selectedJourney?.background?.assetId || 'lumina';
    const nextParams = sourceType === 'asset'
      ? { sourceType: 'asset', assetId: defaultAsset, mixDb: selectedJourney?.background?.mixDb ?? -24 }
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
        if (stageIndex !== index) return stage;
        return {
          ...stage,
          ...partial,
          deltaHz: partial.deltaHz ? { ...(stage.deltaHz || {}), ...partial.deltaHz } : stage.deltaHz
        };
      })
    }));
  };

  const rebalanceStages = () => {
    const nextJourney = buildJourneyBlueprint({
      journeyPresetId: spec.journeyPresetId,
      totalLengthSec: spec.lengthSec,
      baseFreqHz: spec.baseFreqHz,
      focusLevel: spec.focusLevel,
      stages: spec.stages,
      journeyName: selectedJourney?.name
    });

    setSpec((prev) => ({
      ...prev,
      focusLevel: nextJourney.focusLevel,
      lengthSec: nextJourney.totalLengthSec,
      baseFreqHz: nextJourney.baseFreqHz,
      deltaHz: nextJourney.stages[0]?.deltaHz?.from ?? prev.deltaHz,
      stages: nextJourney.stages,
      layers: prev.layers.map((layer) => {
        if (layer.type === 'binaural') {
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
        }
        return layer;
      })
    }));
  };

  const applyJourneyPreset = (journeyPresetId, preserveDuration = false) => {
    const nextJourney = buildJourneyBlueprint({
      journeyPresetId,
      totalLengthSec: preserveDuration ? spec.lengthSec : undefined,
      baseFreqHz: spec.baseFreqHz,
      focusLevel: spec.focusLevel
    });

    setSpec((prev) => {
      const nextLayers = prev.layers.map((layer) => {
        if (layer.type === 'binaural') {
          return {
            ...layer,
            params: {
              ...layer.params,
              baseFreqHz: nextJourney.baseFreqHz,
              delta: {
                from: nextJourney.stages[0]?.deltaHz?.from ?? prev.deltaHz,
                to: nextJourney.stages[nextJourney.stages.length - 1]?.deltaHz?.to ?? prev.deltaHz
              }
            }
          };
        }
        if (layer.type === 'background') {
          return {
            ...layer,
            params: {
              ...layer.params,
              sourceType: nextJourney.background?.type || layer.params.sourceType,
              assetId: nextJourney.background?.assetId || layer.params.assetId,
              mixDb: nextJourney.background?.mixDb ?? layer.params.mixDb ?? -24
            }
          };
        }
        if (layer.type === 'breath') {
          return {
            ...layer,
            params: {
              ...layer.params,
              pattern: nextJourney.breathPattern || layer.params.pattern
            }
          };
        }
        return layer;
      });

      if (!nextLayers.find((layer) => layer.type === 'background') && nextJourney.background) {
        nextLayers.push({
          id: 'layer-background',
          type: 'background',
          params: {
            sourceType: nextJourney.background.type,
            assetId: nextJourney.background.assetId,
            mixDb: nextJourney.background.mixDb ?? -24
          }
        });
      }

      return {
        ...prev,
        journeyPresetId: nextJourney.journeyPresetId,
        focusLevel: nextJourney.focusLevel,
        lengthSec: nextJourney.totalLengthSec,
        baseFreqHz: nextJourney.baseFreqHz,
        deltaHz: nextJourney.stages[0]?.deltaHz?.from ?? prev.deltaHz,
        stages: nextJourney.stages,
        layers: nextLayers
      };
    });
  };

  const startPreview = async () => {
    if (!toneReady) {
      setStatus('Tone engine not ready yet');
      return;
    }

    try {
      setStatus('Starting preview…');
      const ToneLib = await loadToneModule();
      const PizzicatoLib = await loadPizzicatoModule();

      if (typeof ToneLib.start === 'function') {
        await ToneLib.start();
      }

      stopPreviewInternal();

      const master = ToneLib.getDestination();
      master.volume.value = spec.volumeDb ?? -12;

      const binaural = getLayer('binaural');
      if (binaural) {
        const carrier = binaural.params.baseFreqHz || spec.baseFreqHz;
        const deltaFrom = binaural.params.delta?.from || spec.deltaHz;
        const deltaTo = binaural.params.delta?.to || spec.deltaHz;
        const durationSec = 30;
        const startTime = ToneLib.now();
        const freqDiff = deltaTo - deltaFrom;

        const left = new PizzicatoLib.Sound({ source: 'wave', options: { frequency: carrier } });
        const right = new PizzicatoLib.Sound({ source: 'wave', options: { frequency: carrier + deltaFrom } });
        left.volume = 0.45;
        right.volume = 0.45;
        left.addEffect(new PizzicatoLib.Effects.StereoPanner({ pan: -1 }));
        right.addEffect(new PizzicatoLib.Effects.StereoPanner({ pan: 1 }));
        left.play();
        right.play();

        const interval = setInterval(() => {
          const elapsed = ToneLib.now() - startTime;
          const progress = Math.min(1, elapsed / durationSec);
          right.frequency = carrier + deltaFrom + freqDiff * progress;
        }, 200);

        stopHandlesRef.current.push(() => {
          clearInterval(interval);
          try {
            left.stop();
          } catch {}
          try {
            right.stop();
          } catch {}
        });
      }

      const background = getLayer('background');
      if (background?.params?.sourceType === 'ocean') {
        const noise = new ToneLib.Noise('pink');
        const volume = new ToneLib.Volume(background.params.mixDb ?? -24).connect(ToneLib.getDestination());
        const filter = new ToneLib.Filter(800, 'lowpass').connect(volume);
        const lfo = new ToneLib.LFO({ frequency: 0.08, min: 200, max: 1200 }).start();
        lfo.connect(filter.frequency);
        noise.connect(filter);
        noise.start();

        stopHandlesRef.current.push(() => {
          try {
            noise.stop();
          } catch {}
          noise.dispose();
          filter.dispose();
          volume.dispose();
          lfo.dispose();
        });
      }

      if (background?.params?.sourceType === 'asset') {
        const ambientUrl = buildAmbientAssetUrl(background.params.assetId);
        if (ambientUrl) {
          const ambient = new ToneLib.Player({ url: ambientUrl, autostart: false, loop: true });
          await ambient.load();
          ambient.volume.value = background.params.mixDb ?? -24;
          ambient.fadeIn = 2;
          ambient.fadeOut = 2;
          ambient.connect(ToneLib.getDestination());
          ambient.start();

          stopHandlesRef.current.push(() => {
            try {
              ambient.stop();
            } catch {}
            ambient.dispose();
          });
        }
      }

      setStatus('Previewing');
      setPlaying(true);
    } catch (err) {
      console.error(err);
      setStatus(`Preview error: ${err.message}`);
      stopPreviewInternal();
    }
  };

  const stopPreviewInternal = () => {
    stopHandlesRef.current.forEach((stopFn) => {
      try {
        stopFn?.();
      } catch (error) {
        console.warn('Preview stop handler failed', error);
      }
    });
    stopHandlesRef.current = [];
    setStatus('Stopped');
    setPlaying(false);
  };

  const stopPreview = () => {
    stopPreviewInternal();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!supabase || !RENDER_BUCKET) {
      setStatus('Supabase client missing; check environment keys.');
      return;
    }

    setStatus('Uploading file…');
    const path = `uploads/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(RENDER_BUCKET).upload(path, file, { upsert: true });
    if (error) {
      setStatus(`Upload failed: ${error.message}`);
      return;
    }

    const { data: signed } = await supabase.storage.from(RENDER_BUCKET).createSignedUrl(path, 3600);
    setUploadedFiles((prev) => [{ name: file.name, path, url: signed?.signedUrl }, ...prev]);
    setStatus('File uploaded');
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const prompt = chatInput.trim();
    setChatHistory((prev) => [...prev, { role: 'user', content: prompt }]);
    setChatInput('');

    try {
      setStatus('Contacting Session Architect…');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sessionId,
          sessionSpec: spec,
          sessionName: selectedJourney?.name || 'Session Lab Journey',
          email: 'demo@tahoeos.local'
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Chat request failed');
      }
      setSessionId(data.sessionId);
      if (data.spec) setSpec(data.spec);
      if (data.reply) {
        setChatHistory((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
      setStatus('Session Architect updated the plan');
    } catch (err) {
      console.error(err);
      setStatus(`Chat failed: ${err.message}`);
    }
  };

  const handleGenerate = async () => {
    try {
      setRendering(true);
      setStatus('Rendering premium beats…');

      const breath = getLayer('breath');
      const background = getLayer('background');

      const backgroundPayload = background
        ? background.params.sourceType === 'asset'
          ? { type: 'asset', assetId: background.params.assetId, mixDb: background.params.mixDb }
          : { type: 'ocean', mixDb: background.params.mixDb }
        : undefined;

      const body = {
        journeyPresetId: spec.journeyPresetId,
        focusLevel: spec.focusLevel,
        lengthSec: spec.lengthSec,
        baseFreqHz: spec.baseFreqHz,
        stageBlueprint: spec.stages,
        entrainmentModes: { binaural: true, monaural: true, isochronic: true },
        breathGuide: breath
          ? {
              enabled: true,
              pattern: breath.params.pattern || 'coherent-5.5',
              bpm: spec.breathRate ? Number((spec.breathRate * 60).toFixed(2)) : undefined
            }
          : undefined,
        background: backgroundPayload
      };

      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Render failed');
      }

      setRenderResult({
        wav: data.wav,
        mp3: data.mp3,
        analytics: data.analytics,
        stages: data.stages,
        journey: data.journey
      });
      setStatus('Render complete');
    } catch (err) {
      console.error(err);
      setStatus(`Render failed: ${err.message}`);
    } finally {
      setRendering(false);
    }
  };

  return (
    <section className="mt-10 space-y-8">
      <Card className="glass-emphasis border border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Session Lab</h2>
            <p className="text-sm text-white/70">
              Build polished 15-minute phased journeys with stronger blueprints, bundled ambient beds, and stage-aware analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={playing ? stopPreview : startPreview} disabled={!toneReady}>
              {toneReady ? (playing ? 'Stop Preview' : 'Play Preview') : 'Loading Audio Engine…'}
            </Button>
            <span className="text-sm text-white/60">{status}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="glass p-6 space-y-6 xl:col-span-2">
          <div className="space-y-2">
            <h3 className="text-white font-medium">Track Blueprint</h3>
            <p className="text-sm text-white/70">
              Start from a preset journey, then tune stage lengths, delta targets, breath pacing, and ambient layers for a production-ready render.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Journey Preset</label>
              <Select value={spec.journeyPresetId} onChange={(e) => applyJourneyPreset(e.target.value)}>
                {JourneyPresetOptions.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Focus Level</label>
              <Select
                value={spec.focusLevel}
                onChange={(e) => setSpec((prev) => ({ ...prev, focusLevel: e.target.value }))}
              >
                {Object.keys(FocusPresets).map((focusLevel) => (
                  <option key={focusLevel} value={focusLevel}>
                    {focusLevel} – {FocusPresets[focusLevel].description}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Session Length (minutes)</label>
              <Input
                type="number"
                min={5}
                max={30}
                value={Math.round(spec.lengthSec / 60)}
                onChange={(e) => setSpec((prev) => ({ ...prev, lengthSec: Number(e.target.value || 15) * 60 }))}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Carrier Frequency</label>
              <Input
                type="number"
                min={100}
                max={500}
                value={spec.baseFreqHz}
                onChange={(e) => {
                  const value = Number(e.target.value || spec.baseFreqHz);
                  setSpec((prev) => ({ ...prev, baseFreqHz: value }));
                  updateLayerParams('binaural', { baseFreqHz: value });
                }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{selectedJourney?.name}</p>
                <p className="text-sm text-white/65">{selectedJourney?.summary}</p>
              </div>
              <Button variant="secondary" onClick={rebalanceStages}>
                Rebalance to {Math.round(spec.lengthSec / 60)} min
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/60">
              <span>Stage total: {minutesFromSeconds(stageTotalSec)} min</span>
              <span>Target: {minutesFromSeconds(spec.lengthSec)} min</span>
              <span>Breath: {getLayer('breath')?.params?.pattern || 'coherent-5.5'}</span>
              <span>Default bed: {selectedJourney?.background?.type === 'asset' ? selectedJourney?.background?.assetId : 'ocean'}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Breath Pattern</label>
              <Select
                value={getLayer('breath')?.params?.pattern || 'coherent-5.5'}
                onChange={(e) => updateLayerParams('breath', { pattern: e.target.value })}
              >
                <option value="coherent-5.5">Coherent 5.5</option>
                <option value="box">Box 4-4-4-4</option>
                <option value="4-7-8">4-7-8</option>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Background Source</label>
              <Select value={selectedBackgroundSource} onChange={(e) => setBackgroundSource(e.target.value)}>
                <option value="none">None</option>
                <option value="asset">Bundled ambient asset</option>
                <option value="ocean">Procedural ocean</option>
              </Select>
            </div>
          </div>

          {selectedBackgroundSource === 'asset' && selectedBackgroundLayer && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-wide text-white/60">Ambient Asset</label>
                <Select
                  value={selectedBackgroundLayer.params.assetId || 'lumina'}
                  onChange={(e) => updateLayerParams('background', { assetId: e.target.value })}
                >
                  {AmbientAssetOptions.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} — {asset.summary}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/60">Background Mix (dB)</label>
                <Input
                  type="number"
                  value={selectedBackgroundLayer.params.mixDb ?? -24}
                  onChange={(e) => updateLayerParams('background', { mixDb: Number(e.target.value) })}
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
                onChange={(e) => updateLayerParams('background', { mixDb: Number(e.target.value) })}
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-white font-medium">Stage Blueprint</h4>
              <p className="text-xs text-white/60">Each stage drives timing, band intent, and how the frequency path evolves.</p>
            </div>
            <div className="space-y-4">
              {spec.stages.map((stage, index) => (
                <div key={stage.id || index} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{formatClock(stage.atSec)} → {formatClock(stage.atSec + stage.durationSec)}</p>
                      <p className="text-xs text-white/55">Stage {index + 1}</p>
                    </div>
                    <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                      {stage.focusLevel} · {stage.brainState}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="xl:col-span-2">
                      <label className="text-xs uppercase tracking-wide text-white/60">Stage Name</label>
                      <Input value={stage.name} onChange={(e) => updateStage(index, { name: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-white/60">Duration (min)</label>
                      <Input
                        type="number"
                        min={0.25}
                        step="0.25"
                        value={toStageMinutes(stage.durationSec)}
                        onChange={(e) => updateStage(index, { durationSec: Math.max(15, Math.round(Number(e.target.value || 0.25) * 60)) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-white/60">Brain State</label>
                      <Select value={stage.brainState} onChange={(e) => updateStage(index, { brainState: e.target.value })}>
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
                      <Select value={stage.focusLevel} onChange={(e) => updateStage(index, { focusLevel: e.target.value })}>
                        <option value="F10">F10</option>
                        <option value="F12">F12</option>
                        <option value="F15">F15</option>
                        <option value="F21">F21</option>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-white/60">Δf Start</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={stage.deltaHz?.from ?? ''}
                        onChange={(e) => updateStage(index, { deltaHz: { from: Number(e.target.value) } })}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-white/60">Δf End</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={stage.deltaHz?.to ?? ''}
                        onChange={(e) => updateStage(index, { deltaHz: { to: Number(e.target.value) } })}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-white/60">Carrier (Hz)</label>
                      <Input
                        type="number"
                        value={stage.carrierHz ?? spec.baseFreqHz}
                        onChange={(e) => updateStage(index, { carrierHz: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wide text-white/60">Stage Goal</label>
                    <Input value={stage.goal || ''} onChange={(e) => updateStage(index, { goal: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="glass p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-white font-medium">Resources & Notes</h3>
            <Button asChild variant="secondary" className="w-full justify-center">
              <label className="cursor-pointer">
                Upload MP3 / WAV
                <input type="file" accept="audio/mpeg,audio/wav" className="hidden" onChange={handleFileUpload} />
              </label>
            </Button>
            <p className="text-xs text-white/60">
              Uploaded sources stay in your private Supabase bucket. Use them as reference beds or external material while keeping the final session focused on pure entrainment.
            </p>
            <div className="space-y-2 max-h-40 overflow-auto">
              {uploadedFiles.length === 0 && <p className="text-sm text-white/50">No custom sources yet.</p>}
              {uploadedFiles.map((file) => (
                <div key={file.path} className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                  <p className="font-medium">{file.name}</p>
                  {file.url && (
                    <a href={file.url} target="_blank" rel="noreferrer" className="text-xs text-sky-300 underline">
                      Preview / Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wide text-white/60">Session Intent / Sound Design Notes</label>
            <Textarea value={intent} onChange={(e) => setIntent(e.target.value)} rows={5} placeholder="How should this session feel and progress?" />
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 className="text-white font-medium">Bundled Ambient Beds</h4>
            <div className="space-y-3">
              {AmbientAssetOptions.map((asset) => (
                <div key={asset.id} className="rounded-lg border border-white/10 bg-black/10 p-3">
                  <p className="text-sm font-medium text-white">{asset.name}</p>
                  <p className="text-xs text-white/60">{asset.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass p-6 space-y-4">
          <h3 className="text-white font-medium">Session Architect Chat</h3>
          <div className="space-y-3 max-h-72 overflow-auto rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/80">
            {chatHistory.length === 0 && (
              <p className="text-white/60">No messages yet. Ask for blueprint adjustments and the AI architect will patch the session spec.</p>
            )}
            {chatHistory.map((message, index) => (
              <div key={index} className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-white/50">{message.role}</p>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Textarea rows={3} value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask for stage, delta, or ambience adjustments…" />
            <div className="flex justify-end">
              <Button onClick={handleChatSend}>Send to Session Architect</Button>
            </div>
          </div>
        </Card>

        <Card className="glass p-6 space-y-4">
          <h3 className="text-white font-medium">Render & Download</h3>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <p className="text-sm text-white/70">
              Render the full staged beats session with high-quality mastering, delta analytics, and downloadable artifacts.
            </p>
            <Button onClick={handleGenerate} disabled={rendering}>
              {rendering ? 'Rendering…' : 'Generate Journey'}
            </Button>
            {renderResult && (
              <div className="space-y-4">
                <audio controls className="w-full" src={renderResult.wav} />
                <div className="flex flex-wrap gap-3">
                  <a
                    href={renderResult.wav}
                    download="hemisync-journey.wav"
                    className="rounded-md bg-sky-400/90 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-sky-300"
                  >
                    Download WAV
                  </a>
                  {renderResult.mp3 && (
                    <a
                      href={renderResult.mp3}
                      download="hemisync-journey.mp3"
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
                        <div key={stage.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-sm text-white/85">
                          <span>{stage.name}</span>
                          <span className="text-white/60">{formatClock(stage.atSec)} · {minutesFromSeconds(stage.durationSec)} min · {stage.brainState}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </Card>
      </div>

      {renderResult?.analytics && <SessionCharts analytics={renderResult.analytics} />}
    </section>
  );
}
