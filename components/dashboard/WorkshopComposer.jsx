import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { JourneyPresetOptions, buildJourneyBlueprint } from '@/lib/audio/journeys';
import { BRAIN_STATE_ORDER, getBrainStateMeta, resolveBrainState } from '@/lib/audio/library-groups';

const DEFAULT_PRESET_BY_STATE = {
  delta: 'focus-15-no-time-15',
  theta: 'focus-15-no-time-15',
  alpha: 'induction-alpha-theta-integration-15',
  beta: 'creative-hypnagogia-15',
  gamma: 'creative-hypnagogia-15'
};

const DEFAULT_FOCUS_BY_STATE = {
  delta: 'F15',
  theta: 'F15',
  alpha: 'F12',
  beta: 'F10',
  gamma: 'F10'
};

const DEFAULT_LENGTH_BY_STATE = {
  delta: 18,
  theta: 15,
  alpha: 15,
  beta: 12,
  gamma: 10
};

function formatMinutesLabel(minutes) {
  return `${Math.round(minutes)} min`;
}

function getPresetFallback(state) {
  const presetId = DEFAULT_PRESET_BY_STATE[state] || JourneyPresetOptions[0]?.id;
  return JourneyPresetOptions.find((preset) => preset.id === presetId) || JourneyPresetOptions[0];
}

function StatePill({ state, active, onClick }) {
  const meta = getBrainStateMeta(state);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] transition-all ${active ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-white/10 bg-white/5 text-white/50 hover:text-white'}`}
    >
      {meta.label}
    </button>
  );
}

export function WorkshopComposer({ 
  seedTone, 
  onGenerated,
  generatingStatus = 'idle',
  generatingError = '',
  generatingProgress = '',
  generatingResult = null,
  generatingSavedTone = null,
  onStartGenerate
}) {
  const seedBrainState = seedTone ? resolveBrainState(seedTone) : 'alpha';
  const seedMeta = getBrainStateMeta(seedBrainState);

  const applyBrainStateDefaults = (state) => {
    const preset = getPresetFallback(state);
    setBrainState(state);
    setSelectedPresetId(preset?.id || JourneyPresetOptions[0]?.id);
    setLengthMinutes(DEFAULT_LENGTH_BY_STATE[state] || 15);
    setFocusLevel(DEFAULT_FOCUS_BY_STATE[state] || 'F12');
  };

  const [brainState, setBrainState] = useState(seedBrainState);
  const [selectedPresetId, setSelectedPresetId] = useState(getPresetFallback(seedBrainState)?.id || JourneyPresetOptions[0]?.id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lengthMinutes, setLengthMinutes] = useState(DEFAULT_LENGTH_BY_STATE[seedBrainState] || 15);
  const [baseFreqHz, setBaseFreqHz] = useState(Number(seedTone?.baseFreqHz || seedTone?.base_freq_hz || 220));
  const [focusLevel, setFocusLevel] = useState(DEFAULT_FOCUS_BY_STATE[seedBrainState] || 'F12');
  const [breathEnabled, setBreathEnabled] = useState(true);
  const [breathPattern, setBreathPattern] = useState('coherent-5.5');
  const [backgroundMode, setBackgroundMode] = useState('preset');
  const [visibility, setVisibility] = useState('private');

  const selectedPreset = useMemo(
    () => JourneyPresetOptions.find((preset) => preset.id === selectedPresetId) || JourneyPresetOptions[0],
    [selectedPresetId]
  );

  const journey = useMemo(() => buildJourneyBlueprint({
    journeyPresetId: selectedPresetId,
    totalLengthSec: Math.round(lengthMinutes * 60),
    baseFreqHz: Number(baseFreqHz),
    focusLevel,
    journeyName: name.trim() || selectedPreset?.name
  }), [baseFreqHz, focusLevel, lengthMinutes, name, selectedPreset?.name, selectedPresetId]);

  useEffect(() => {
    if (!seedTone) return;

    const nextBrainState = resolveBrainState(seedTone);
    applyBrainStateDefaults(nextBrainState);
    setBaseFreqHz(Number(seedTone.baseFreqHz || seedTone.base_freq_hz || 220));
    if (!name) {
      setName(`${seedTone.name || seedMeta.label} custom`);
    }
    if (!description) {
      setDescription(seedTone.description || seedTone.summary || `Seeded from ${seedTone.name || seedMeta.label}.`);
    }
  }, [seedTone, name, description, seedMeta.label]);

  useEffect(() => {
    if (!selectedPreset) return;
    if (!name) {
      setName(selectedPreset.name);
    }
    if (!description) {
      setDescription(selectedPreset.summary || '');
    }
  }, [description, name, selectedPreset]);

  const handleGenerate = () => {
    if (!onStartGenerate) return;

    const audioPayload = {
      exportProfile: 'premium',
      journeyPresetId: selectedPresetId,
      focusLevel,
      lengthSec: Math.round(lengthMinutes * 60),
      baseFreqHz: Number(baseFreqHz),
      stageBlueprint: journey.stages,
      targetState: brainState,
      entrainmentModes: { binaural: true, monaural: false, isochronic: false },
      breathGuide: breathEnabled
        ? {
            enabled: true,
            pattern: breathPattern,
            bpm: 5.5
          }
        : undefined,
      background: backgroundMode === 'ocean'
        ? { type: 'ocean', mixDb: -24 }
        : journey.background
    };

    const metadata = {
      name: name.trim() || `${getBrainStateMeta(brainState).label} Workshop`,
      description: description.trim() || `Custom ${getBrainStateMeta(brainState).label} session built from the workshop generator.`,
      brainStateLabel: getBrainStateMeta(brainState).label,
      deltaHzPath: journey.deltaHzPath,
      visibility,
      backgroundMode
    };

    onStartGenerate({ audioPayload, metadata });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <p className="section-label">Workshop</p>
          <h2 className="section-title mt-2 text-4xl text-[var(--text-primary)]">Create your own HemiSync file</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
            Pick a brain state, seed it from a library tone if you want, and render a custom session into the library.
          </p>
        </div>

        {seedTone && (
          <Card className="border-cyan-500/20 bg-cyan-500/10 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">radio</span>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-300/70">Seeded from library</p>
                  <h3 className="mt-1 text-lg font-medium text-white">{seedTone.name}</h3>
                  <p className="mt-1 text-sm text-white/55">{seedMeta.label} · {seedMeta.description}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => applyBrainStateDefaults(seedBrainState)}>
                Use this state
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-6 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Brain state</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {BRAIN_STATE_ORDER.map((state) => (
                  <StatePill key={state} state={state} active={brainState === state} onClick={() => setBrainState(state)} />
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Current</p>
              <p className="mt-1 text-sm text-cyan-300">{getBrainStateMeta(brainState).label}</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Preset</span>
              <select
                value={selectedPresetId}
                onChange={(event) => setSelectedPresetId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              >
                {JourneyPresetOptions.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Session name</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="My custom session" />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Visibility</span>
                <select
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Description</span>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Describe the session and its intended state." />
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Length</span>
                <Input
                  type="number"
                  min={5}
                  step={1}
                  value={lengthMinutes}
                  onChange={(event) => setLengthMinutes(Number(event.target.value || 0))}
                />
                <p className="text-xs text-white/25">{formatMinutesLabel(lengthMinutes)}</p>
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Base frequency</span>
                <Input
                  type="number"
                  min={100}
                  max={1000}
                  step={1}
                  value={baseFreqHz}
                  onChange={(event) => setBaseFreqHz(Number(event.target.value || 0))}
                />
                <p className="text-xs text-white/25">Carrier tone in Hz</p>
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Focus level</span>
                <select
                  value={focusLevel}
                  onChange={(event) => setFocusLevel(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="F10">F10</option>
                  <option value="F12">F12</option>
                  <option value="F15">F15</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-sm text-white">Breath guide</p>
                  <p className="text-xs text-white/30">Gentle pacing for settling</p>
                </div>
                <input type="checkbox" checked={breathEnabled} onChange={(event) => setBreathEnabled(event.target.checked)} />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Breath pattern</span>
                <select
                  value={breathPattern}
                  onChange={(event) => setBreathPattern(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="coherent-5.5">Coherent 5.5</option>
                  <option value="box">Box</option>
                  <option value="4-7-8">4-7-8</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Background</span>
                <select
                  value={backgroundMode}
                  onChange={(event) => setBackgroundMode(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="preset">Preset background</option>
                  <option value="ocean">Ocean bed</option>
                </select>
              </label>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Blueprint</p>
                <p className="mt-2 text-sm text-white/70">{selectedPreset?.name}</p>
                <p className="mt-1 text-xs text-white/35">{selectedPreset?.summary}</p>
              </div>
            </div>
          </div>

          {generatingError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {generatingError}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGenerate} disabled={generatingStatus === 'rendering' || generatingStatus === 'saving'}>
              {generatingStatus === 'rendering' || generatingStatus === 'saving' ? (
                <span className="material-symbols-outlined text-sm animate-spin mr-2">sync</span>
              ) : (
                <span className="material-symbols-outlined text-sm mr-2">sparkles</span>
              )}
              {generatingStatus === 'rendering' ? 'Rendering...' : generatingStatus === 'saving' ? 'Saving...' : 'Generate and save file'}
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Session blueprint</p>
            <div className="space-y-3 text-sm text-white/65">
              <p>Preset: {selectedPreset?.name}</p>
              <p>State: {getBrainStateMeta(brainState).label}</p>
              <p>Length: {Math.round(lengthMinutes)} minutes</p>
              <p>Base frequency: {Number(baseFreqHz || 0)} Hz</p>
              <p>Focus: {focusLevel}</p>
              <p>Breath: {breathEnabled ? breathPattern : 'Off'}</p>
              <p>Background: {backgroundMode}</p>
            </div>
          </Card>

          {generatingResult && (
            <Card className="space-y-4 p-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-300">Rendered file</p>
              <h3 className="text-xl font-medium text-white">{generatingResult.journey?.name || name || 'Custom session'}</h3>
              <p className="text-sm text-white/45">Artifact {generatingResult.artifactId}</p>
              <div className="space-y-2 text-sm text-white/65">
                <p>WAV: {generatingResult.assets?.wav?.url || generatingResult.wav || 'Not available'}</p>
                <p>WebM: {generatingResult.assets?.webm?.url || generatingResult.webm || 'Not available'}</p>
              </div>
              {generatingSavedTone && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  Saved to library as {generatingSavedTone.name}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
