'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { consumerTemplateOptions, defaultSessionSpec } from './chatspec';
import { FocusPresets } from '@/lib/audio/presets';
import { AmbientAssetOptions } from '@/lib/audio/assets';
import { JourneyPresetOptions, buildJourneyBlueprint } from '@/lib/audio/journeys';
import { SessionCharts } from '@/components/analytics/SessionCharts';
import { resolveBackendAssetUrl } from '@/lib/frontend/backend-url';

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
  const [spec, setSpec] = useState(defaultSessionSpec);
  const [intent, setIntent] = useState('Build a calm HemiSync reset with a soft descent, gentle middle hold, and a clean clear return.');
  const [status, setStatus] = useState('Idle');
  const [rendering, setRendering] = useState(false);
  const [renderResult, setRenderResult] = useState(null);
  const [chatInput, setChatInput] = useState('Keep this soothing, lower the middle section slightly, and make the return very gentle.');
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  const getLayer = (type) => spec.layers.find((layer) => layer.type === type);

  const stageTotalSec = useMemo(
    () => spec.stages.reduce((sum, stage) => sum + (stage.durationSec || 0), 0),
    [spec.stages]
  );

  const selectedJourney = useMemo(() => {
    return JourneyPresetOptions.find((preset) => preset.id === spec.journeyPresetId) || JourneyPresetOptions[0];
  }, [spec.journeyPresetId]);

  const selectedTemplate = useMemo(() => {
    return (
      consumerTemplateOptions.find((template) => template.journeyPresetId === spec.journeyPresetId) ||
      consumerTemplateOptions[0]
    );
  }, [spec.journeyPresetId]);

  const selectedBackgroundLayer = getLayer('background');
  const selectedBackgroundSource = selectedBackgroundLayer?.params?.sourceType || 'none';
  const selectedAmbientAsset = AmbientAssetOptions.find((asset) => asset.id === selectedBackgroundLayer?.params?.assetId);

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

  const syncJourneyToLength = (nextLengthSec = spec.lengthSec) => {
    const nextJourney = buildJourneyBlueprint({
      journeyPresetId: spec.journeyPresetId,
      totalLengthSec: nextLengthSec,
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

  const rebalanceStages = () => {
    syncJourneyToLength(spec.lengthSec);
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

  const applyConsumerTemplate = (template) => {
    applyJourneyPreset(template.journeyPresetId);
    setIntent(template.intent);
    setChatInput(template.chatPrompt);
    setRenderResult(null);
    setStatus(`${template.title} template ready`);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const prompt = chatInput.trim();
    const promptWithIntent = intent.trim()
      ? `${prompt}\n\nCurrent session intent:\n${intent.trim()}`
      : prompt;
    setChatHistory((prev) => [...prev, { role: 'user', content: prompt }]);
    setChatInput('');

    try {
      setStatus('Adjusting your HemiSync…');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptWithIntent,
          sessionId,
          sessionSpec: spec,
          sessionName: selectedTemplate?.title || selectedJourney?.name || 'HemiSync Session',
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
      setStatus('Session updated');
    } catch (err) {
      console.error(err);
      setStatus(`Chat failed: ${err.message}`);
    }
  };

  const handleGenerate = async () => {
    try {
      setRendering(true);
      setStatus('Rendering your HemiSync…');

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
        wav: resolveBackendAssetUrl(data.wav),
        mp3: resolveBackendAssetUrl(data.mp3),
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
            <h2 className="text-xl font-semibold text-white">Your HemiSync Builder</h2>
            <p className="text-sm text-white/70">
              Choose a template, shape the ritual, and render a clean stereo HemiSync session without getting buried in technical controls.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60">{status}</div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="glass p-6 space-y-6 xl:col-span-2">
          <div className="space-y-2">
            <p className="section-label">Step 1</p>
            <h3 className="text-white font-medium">Choose the HemiSync you want today</h3>
            <p className="text-sm text-white/70">
              Start with a ready-made session type. Templates keep the path simple, while the advanced controls stay available if you want to fine tune the signal.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {consumerTemplateOptions.map((template) => {
              const isActive = selectedTemplate?.id === template.id;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyConsumerTemplate(template)}
                  className={`rounded-[1.5rem] border p-5 text-left transition-all ${
                    isActive
                      ? 'border-[rgba(214,183,109,0.4)] bg-[linear-gradient(180deg,rgba(240,216,157,0.12),rgba(127,213,223,0.07))] shadow-[0_16px_50px_rgba(0,0,0,0.22)]'
                      : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="section-label">{template.shortLabel}</p>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/60">
                      15 min base
                    </span>
                  </div>
                  <h4 className="display-type mt-4 text-3xl leading-none text-[var(--text-primary)]">{template.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{template.useCase}</p>
                  <p className="mt-4 text-xs leading-6 text-[var(--text-muted)]">{template.bestFor}</p>
                </button>
              );
            })}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="section-label">Current Template</p>
                <h4 className="display-type text-3xl text-[var(--text-primary)]">{selectedTemplate?.title}</h4>
                <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                  {selectedTemplate?.description}
                </p>
              </div>
              <Button variant="secondary" onClick={rebalanceStages}>
                Refresh Timing
              </Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold-strong)]">Best For</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{selectedTemplate?.bestFor}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold-strong)]">Ritual</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{selectedTemplate?.ritual}</p>
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
              <h3 className="text-white font-medium">Set the basics</h3>
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
                  onChange={(e) => syncJourneyToLength(Number(e.target.value || 15) * 60)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/60">Depth Mode</label>
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
                  <label className="text-xs uppercase tracking-wide text-white/60">Atmosphere Mix (dB)</label>
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
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wide text-white/60">Session Intention</label>
            <Textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              rows={4}
              placeholder="What do you want this HemiSync session to feel like?"
            />
          </div>

          <details className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-label">Advanced</p>
                  <h4 className="text-white font-medium">Fine tune the signal path</h4>
                </div>
                <span className="text-xs uppercase tracking-[0.14em] text-white/45">Expand</span>
              </div>
            </summary>

            <div className="mt-6 space-y-6">
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

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-white font-medium">Stage Blueprint</h4>
                  <p className="text-xs text-white/60">
                    For advanced users who want to adjust stage timing, brainwave ranges, and carrier movement.
                  </p>
                </div>
                <div className="space-y-4">
                  {spec.stages.map((stage, index) => (
                    <div key={stage.id || index} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {formatClock(stage.atSec)} → {formatClock(stage.atSec + stage.durationSec)}
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
                          <Input value={stage.name} onChange={(e) => updateStage(index, { name: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-white/60">Duration (min)</label>
                          <Input
                            type="number"
                            min={0.25}
                            step="0.25"
                            value={toStageMinutes(stage.durationSec)}
                            onChange={(e) =>
                              updateStage(index, {
                                durationSec: Math.max(15, Math.round(Number(e.target.value || 0.25) * 60))
                              })
                            }
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

              <div className="space-y-4">
                <h4 className="text-white font-medium">Personalize in plain language</h4>
                <div className="space-y-3 max-h-72 overflow-auto rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                  {chatHistory.length === 0 && (
                    <p className="text-white/60">
                      No messages yet. Ask for a softer descent, a deeper middle section, or a gentler return.
                    </p>
                  )}
                  {chatHistory.map((message, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-white/50">{message.role}</p>
                      <p>{message.content}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <Textarea
                    rows={3}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Describe how you want the session to feel…"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleChatSend}>Update My HemiSync</Button>
                  </div>
                </div>
              </div>
            </div>
          </details>
        </Card>

        <div className="space-y-6">
          <Card className="glass p-6 space-y-4">
            <p className="section-label">At a Glance</p>
            <h3 className="display-type text-3xl text-[var(--text-primary)]">{selectedTemplate?.title}</h3>
            <p className="text-sm leading-7 text-[var(--text-secondary)]">{selectedTemplate?.useCase}</p>

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
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold-strong)]">Breath</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {getLayer('breath')?.params?.pattern || 'coherent-5.5'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6 space-y-4">
            <p className="section-label">Step 3</p>
            <h3 className="text-white font-medium">Render and download</h3>
            <p className="text-sm text-white/70">
              When the template feels right, generate the full HemiSync session with premium mastering and downloadable files.
            </p>
            <Button onClick={handleGenerate} disabled={rendering}>
              {rendering ? 'Rendering…' : 'Generate My HemiSync'}
            </Button>

            {renderResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm text-white/70">Now playing</p>
                  <p className="mt-2 text-lg text-white">{renderResult.journey?.name || selectedTemplate?.title}</p>
                </div>
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
        </div>
      </div>

      {renderResult?.analytics && <SessionCharts analytics={renderResult.analytics} />}
    </section>
  );
}
