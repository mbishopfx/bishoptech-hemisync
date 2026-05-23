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

  // Interactive console mixer states
  const [binauralVol, setBinauralVol] = useState(80);
  const [breathVol, setBreathVol] = useState(70);
  const [ambientVol, setAmbientVol] = useState(50);

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

  // Knob rotation degree math (maps 100-1000 Hz to -135deg to +135deg)
  const rotateDegree = ((baseFreqHz - 100) / 900) * 270 - 135;

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Synthesis Workshop</p>
          <h2 className="mt-2 text-4xl font-light text-white tracking-tight">Create your own HemiSync file</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 font-light">
            Select a target brain wave profile, map customized respiration patterns, and trigger background server synthesis.
          </p>
        </div>

        {seedTone && (
          <Card className="border-cyan-500/20 bg-cyan-500/10 p-5 rounded-3xl backdrop-blur-md">
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
              <Button variant="secondary" className="rounded-full font-mono text-[10px] uppercase tracking-wider bg-white/15 text-white hover:bg-white hover:text-black border border-white/5 transition-all" onClick={() => applyBrainStateDefaults(seedBrainState)}>
                Use this state
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Configuration Parameters */}
        <Card className="space-y-6 p-6 bg-zinc-900/40 border-white/5 backdrop-blur-3xl rounded-3xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Brain state</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {BRAIN_STATE_ORDER.map((state) => (
                  <StatePill key={state} state={state} active={brainState === state} onClick={() => setBrainState(state)} />
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Current Profile</p>
              <p className="mt-1 text-xs font-mono tracking-wider font-bold text-cyan-300 uppercase">{getBrainStateMeta(brainState).label}</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Target Preset Blueprint</span>
              <select
                value={selectedPresetId}
                onChange={(event) => setSelectedPresetId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none cursor-pointer focus:border-cyan-500/30 transition-all"
              >
                {JourneyPresetOptions.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Session name</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="My custom session" className="bg-black/20 border-white/10 rounded-2xl" />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Visibility</span>
                <select
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none cursor-pointer focus:border-cyan-500/30 transition-all"
                >
                  <option value="private">Private (Library Only)</option>
                  <option value="public">Public (Show on Global Feed)</option>
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Description</span>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Describe the session and its intended state." className="bg-black/20 border-white/10 rounded-2xl" />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Length</span>
                <Input
                  type="number"
                  min={5}
                  step={1}
                  value={lengthMinutes}
                  onChange={(event) => setLengthMinutes(Number(event.target.value || 0))}
                  className="bg-black/20 border-white/10 rounded-2xl"
                />
                <p className="text-[10px] text-zinc-500 font-mono">{formatMinutesLabel(lengthMinutes)}</p>
              </label>
              
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Focus level</span>
                <select
                  value={focusLevel}
                  onChange={(event) => setFocusLevel(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none cursor-pointer focus:border-cyan-500/30 transition-all"
                >
                  <option value="F10">Focus 10 (Mind Awake / Body Asleep)</option>
                  <option value="F12">Focus 12 (Expanded Awareness)</option>
                  <option value="F15">Focus 15 (No-Time / Pure Meditation)</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 cursor-pointer hover:border-cyan-500/20 transition-all">
                <div>
                  <p className="text-sm text-white">Breath guide pacing</p>
                  <p className="text-xs text-white/30 font-light mt-0.5">Tactile pacing guide for target brain wave settling</p>
                </div>
                <input type="checkbox" checked={breathEnabled} onChange={(event) => setBreathEnabled(event.target.checked)} className="size-4 accent-cyan-400 cursor-pointer" />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Breath pattern</span>
                <select
                  value={breathPattern}
                  onChange={(event) => setBreathPattern(event.target.value)}
                  disabled={!breathEnabled}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none cursor-pointer focus:border-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="coherent-5.5">Coherent (5.5s In / 5.5s Out)</option>
                  <option value="box">Box (4s In / 4s Hold / 4s Out / 4s Hold)</option>
                  <option value="4-7-8">4-7-8 Restful Pattern</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Background Environment</span>
                <select
                  value={backgroundMode}
                  onChange={(event) => setBackgroundMode(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none cursor-pointer focus:border-cyan-500/30 transition-all"
                >
                  <option value="preset">Preset Ambient Blueprint</option>
                  <option value="ocean">Ocean Tide Bed</option>
                </select>
              </label>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Active Blueprint</p>
                <p className="mt-2 text-xs font-semibold text-white/70">{selectedPreset?.name}</p>
                <p className="mt-1 text-[10px] text-white/35 font-light leading-relaxed">{selectedPreset?.summary}</p>
              </div>
            </div>
          </div>

          {generatingError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {generatingError}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button 
              onClick={handleGenerate} 
              disabled={generatingStatus === 'rendering' || generatingStatus === 'saving'}
              className="rounded-full bg-cyan-500 text-black hover:bg-cyan-400 font-semibold px-6 py-5 tracking-wider text-xs uppercase"
            >
              {generatingStatus === 'rendering' || generatingStatus === 'saving' ? (
                <span className="material-symbols-outlined text-sm animate-spin mr-2">sync</span>
              ) : (
                <span className="material-symbols-outlined text-sm mr-2 font-bold">sparkles</span>
              )}
              {generatingStatus === 'rendering' ? 'Synthesizing...' : generatingStatus === 'saving' ? 'Saving Wave...' : 'Initiate Background Render'}
            </Button>
          </div>
        </Card>

        {/* Right Column: Tactical Sound Desk & Specs */}
        <div className="space-y-6">
          {/* Base Frequency Rotary Knob Card */}
          <Card className="p-6 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[150px] h-[80px] bg-cyan-500/[0.02] blur-[30px] pointer-events-none" />
            
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-6">Base Frequency Dial</span>
            
            <div className="relative size-32 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-cyan-500/30 transition-colors">
              {/* Inner Rotating Dial Pointer */}
              <div 
                className="absolute size-28 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform"
                style={{ transform: `rotate(${rotateDegree}deg)` }}
              >
                {/* Pointer marker dot */}
                <div className="absolute top-2.5 size-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              </div>
              
              {/* Value Indicator Screen */}
              <div className="absolute pointer-events-none text-center">
                <span className="text-xl font-mono font-bold text-white tracking-tighter">{baseFreqHz}</span>
                <span className="block text-[8px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">Hz</span>
              </div>
            </div>

            {/* Slider to shift dials */}
            <div className="w-full mt-6 space-y-2">
              <input 
                type="range"
                min={100}
                max={1000}
                value={baseFreqHz}
                onChange={(e) => setBaseFreqHz(Number(e.target.value))}
                className="w-full h-1.5 bg-black/60 accent-cyan-400 rounded-lg outline-none cursor-pointer"
              />
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-widest px-1">
                <span>100 Hz</span>
                <span>Carrier Tone</span>
                <span>1000 Hz</span>
              </div>
            </div>
          </Card>

          {/* Premium Vertical Mixer Console */}
          <Card className="p-6 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl rounded-3xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-[200px] h-[80px] bg-cyan-500/[0.02] blur-[40px] pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Audio Desk</p>
                <h3 className="text-base font-semibold text-white mt-0.5">Frequency Mixer</h3>
              </div>
              <span className="material-symbols-outlined text-cyan-400 text-xl animate-pulse">tune</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Channel 1: Binaural Wave */}
              <div className="flex flex-col items-center p-3 bg-zinc-950/40 border border-white/5 rounded-2xl">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">BINAURAL</span>
                <div className="h-36 flex items-center justify-center my-4">
                  <input 
                    type="range"
                    min={0}
                    max={100}
                    value={binauralVol}
                    onChange={(e) => setBinauralVol(Number(e.target.value))}
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    className="h-28 accent-cyan-400 cursor-pointer bg-zinc-800 rounded-lg outline-none"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">{binauralVol}%</span>
                  <span className="block text-[8px] text-zinc-500 font-mono mt-0.5">Carrier</span>
                </div>
              </div>

              {/* Channel 2: Respiration */}
              <div className={`flex flex-col items-center p-3 border rounded-2xl transition-all ${
                breathEnabled ? 'bg-zinc-950/40 border-white/5' : 'bg-zinc-950/10 border-white/5 opacity-40'
              }`}>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">BREATH</span>
                  <input 
                    type="checkbox" 
                    checked={breathEnabled} 
                    onChange={(e) => setBreathEnabled(e.target.checked)} 
                    className="size-3 accent-cyan-400 cursor-pointer"
                  />
                </div>
                <div className="h-36 flex items-center justify-center my-4">
                  <input 
                    type="range"
                    min={0}
                    max={100}
                    disabled={!breathEnabled}
                    value={breathVol}
                    onChange={(e) => setBreathVol(Number(e.target.value))}
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    className="h-28 accent-cyan-400 cursor-pointer bg-zinc-800 rounded-lg outline-none disabled:opacity-30"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">{breathVol}%</span>
                  <span className="block text-[8px] text-zinc-500 font-mono mt-0.5 truncate max-w-[50px]">{breathPattern.split('-')[0].toUpperCase()}</span>
                </div>
              </div>

              {/* Channel 3: Ambient */}
              <div className="flex flex-col items-center p-3 bg-zinc-950/40 border border-white/5 rounded-2xl">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">AMBIENT</span>
                <div className="h-36 flex items-center justify-center my-4">
                  <input 
                    type="range"
                    min={0}
                    max={100}
                    value={ambientVol}
                    onChange={(e) => setAmbientVol(Number(e.target.value))}
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    className="h-28 accent-cyan-400 cursor-pointer bg-zinc-800 rounded-lg outline-none"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">{ambientVol}%</span>
                  <span className="block text-[8px] text-zinc-500 font-mono mt-0.5 truncate max-w-[50px]">{backgroundMode === 'ocean' ? 'OCEAN' : 'PRESET'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Specifications Output Panel */}
          <Card className="space-y-4 p-6 bg-zinc-900/40 border-white/5 backdrop-blur-3xl rounded-3xl">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Session Blueprint Specifications</p>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-light text-zinc-300">
              <div>
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Target Profile</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedPreset?.name}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Carrier Mode</span>
                <span className="font-semibold text-cyan-300 mt-0.5 block uppercase">{getBrainStateMeta(brainState).label}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Carrier Base</span>
                <span className="font-semibold text-white mt-0.5 block">{baseFreqHz} Hz</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Duration length</span>
                <span className="font-semibold text-white mt-0.5 block">{lengthMinutes} Minutes</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Entrainment Pacing</span>
                <span className="font-semibold text-white mt-0.5 block">{breathEnabled ? breathPattern : 'Off'}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Focus Threshold</span>
                <span className="font-semibold text-white mt-0.5 block">{focusLevel}</span>
              </div>
            </div>
          </Card>

          {generatingResult && (
            <Card className="space-y-4 p-6 bg-zinc-900/40 border-emerald-500/20 backdrop-blur-3xl rounded-3xl relative overflow-hidden animate-pulse">
              <div className="absolute top-0 right-0 w-[150px] h-[80px] bg-emerald-500/[0.01] blur-[30px] pointer-events-none" />
              
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Compiled Wave</span>
              </div>
              <h3 className="text-base font-semibold text-white mt-1">{generatingResult.journey?.name || name || 'Custom session'}</h3>
              
              <div className="space-y-2 text-xs font-light text-zinc-400 border-t border-white/5 pt-3">
                <p className="flex justify-between"><span className="text-zinc-500">Asset File:</span> <span className="font-mono text-white text-[10px] truncate max-w-[180px]">{generatingResult.assets?.wav?.url || generatingResult.wav || 'Not available'}</span></p>
                <p className="flex justify-between"><span className="text-zinc-500">Format Profile:</span> <span className="text-white">WAV Stereophonic HemiSync</span></p>
              </div>
              {generatingSavedTone && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[10px] font-mono uppercase tracking-widest text-emerald-300 text-center">
                  Successfully stored in Neural Archive
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

