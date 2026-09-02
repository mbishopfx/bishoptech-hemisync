'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowCounterClockwise, DownloadSimple, Play, SlidersHorizontal, Stop } from '@phosphor-icons/react';
import { AmbientAssetOptions } from '@/lib/audio/assets';
import {
  SESSION_SCORE_CAPABILITY_ID,
  SESSION_SCORE_CAPABILITY_VERSION,
  SESSION_SCORE_PREVIEW_CAP_SEC,
  composeSessionScore,
  refineSessionScore,
  sessionScoreTechnicalExport
} from '@/lib/agentic/session-score-capability';
import { nativeWebMcpTool, WEBMCP_TOOL_DEFINITIONS } from '@/lib/agentic/webmcp-contract';

const SCORE_TOOL_NAMES = new Set([
  'cognistration_compose_session_score',
  'cognistration_refine_session_score_stage',
  'cognistration_undo_session_score',
  'cognistration_select_session_score_stage',
  'cognistration_preview_session_score'
]);

const DEFAULT_SOUND = {
  entrainmentModes: { binaural: true, monaural: false, isochronic: false },
  background: { type: 'none' },
  breathGuide: { enabled: false, pattern: 'coherent-5.5', bpm: 5.5 },
  fades: { inSec: 8, outSec: 12 }
};

function scoreData(result) {
  return {
    durationSec: result.durationSec,
    stages: result.stages.map(({ carrierBehavior, beatBehavior, ...stage }) => stage),
    sound: result.sound || DEFAULT_SOUND
  };
}

function toolResult(status, data = {}) {
  return { capabilityId: SESSION_SCORE_CAPABILITY_ID, version: SESSION_SCORE_CAPABILITY_VERSION, correlationId: browserCorrelationId(), status, ...data };
}

function browserCorrelationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `score-browser-${Date.now()}`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

export function SessionScoreConductor({ intention = 'I need a focused writing block' }) {
  const initialRef = useRef(null);
  if (!initialRef.current) {
    try {
      const candidate = composeSessionScore({ intention: intention?.trim() || undefined, durationSec: 600 });
      initialRef.current = candidate.status === 'completed'
        ? candidate
        : composeSessionScore({ direction: 'focus', durationSec: 600 });
    } catch {
      initialRef.current = composeSessionScore({ direction: 'focus', durationSec: 600 });
    }
  }
  const initial = initialRef.current;
  const [score, setScore] = useState(initial);
  const [history, setHistory] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState(initial.stages[0].id);
  const [activity, setActivity] = useState('A browser-local score is ready. Audio is off.');
  const [webmcpStatus, setWebmcpStatus] = useState('checking');
  const [audioReady, setAudioReady] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const scoreRef = useRef(score);
  const selectedRef = useRef(selectedStageId);
  const historyRef = useRef(history);
  const audioRef = useRef(null);
  const handlersRef = useRef({});

  scoreRef.current = score;
  selectedRef.current = selectedStageId;
  historyRef.current = history;

  const replaceScore = useCallback((next, message) => {
    const nextHistory = [...historyRef.current, scoreData(scoreRef.current)].slice(-20);
    historyRef.current = nextHistory;
    setHistory(nextHistory);
    setScore(next);
    scoreRef.current = next;
    if (!next.stages.some((stage) => stage.id === selectedRef.current)) {
      setSelectedStageId(next.stages[0].id);
      selectedRef.current = next.stages[0].id;
    }
    setActivity(message);
  }, []);

  const stopPreview = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      for (const node of audio.nodes || []) {
        try { node.stop?.(); } catch {}
      }
      window.clearTimeout(audio.timeout);
      audio.context.close().catch(() => {});
      audioRef.current = null;
    }
    setIsPreviewing(false);
    setAudioReady(false);
  }, []);

  const startPreview = useCallback(async ({ confirmed, stageId } = {}) => {
    if (confirmed !== true) {
      return toolResult('needs_input', { error: { code: 'CONFIRMATION_REQUIRED', safeMessage: 'Explicit confirmation is required before browser audio starts.', retryable: false }, audioReady: false });
    }
    const stage = scoreRef.current.stages.find((candidate) => candidate.id === (stageId || selectedRef.current));
    if (!stage) return toolResult('failed', { error: { code: 'STAGE_NOT_FOUND', safeMessage: 'Select a visible score stage first.', retryable: false }, audioReady: false });

    stopPreview();
    let context = null;
    const nodes = [];
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('AudioContext is unavailable.');
      context = new AudioContextClass();
      await context.resume();
      if (context.state !== 'running') {
        await context.close();
        return toolResult('failed', { error: { code: 'AUDIO_NOT_READY', safeMessage: 'The browser requires a visible playback gesture.', retryable: true }, audioReady: false });
      }
      const merger = context.createChannelMerger(2);
      const leftBus = context.createGain();
      const rightBus = context.createGain();
      leftBus.gain.setValueAtTime(0.54, context.currentTime);
      rightBus.gain.setValueAtTime(0.54, context.currentTime);
      const durationSec = Math.min(stage.durationSec, SESSION_SCORE_PREVIEW_CAP_SEC);
      const now = context.currentTime;
      const from = Number(stage.beatHz.from);
      const to = Number(stage.beatHz.to);
      const carrier = Number(stage.carrierHz);
      const frequencyPath = (start, end, bus) => {
        const oscillator = context.createOscillator();
        oscillator.frequency.setValueAtTime(start, now);
        oscillator.frequency.linearRampToValueAtTime(end, now + durationSec);
        oscillator.connect(bus);
        oscillator.start(now);
        nodes.push(oscillator);
        return oscillator;
      };
      const modes = scoreRef.current.sound?.entrainmentModes || DEFAULT_SOUND.entrainmentModes;
      if (modes.binaural) {
        frequencyPath(carrier - from / 2, carrier - to / 2, leftBus);
        frequencyPath(carrier + from / 2, carrier + to / 2, rightBus);
      }
      if (modes.monaural) {
        const monoBus = context.createGain();
        monoBus.gain.setValueAtTime(0.34, now);
        frequencyPath(carrier - from / 2, carrier - to / 2, monoBus);
        frequencyPath(carrier + from / 2, carrier + to / 2, monoBus);
        monoBus.connect(leftBus);
        monoBus.connect(rightBus);
      }
      if (!modes.binaural && !modes.monaural) {
        frequencyPath(carrier, carrier, leftBus);
        frequencyPath(carrier, carrier, rightBus);
      }

      let leftOutput = leftBus;
      let rightOutput = rightBus;
      if (modes.isochronic) {
        const isoLeft = context.createGain();
        const isoRight = context.createGain();
        isoLeft.gain.setValueAtTime(0.72, now);
        isoRight.gain.setValueAtTime(0.72, now);
        leftBus.connect(isoLeft);
        rightBus.connect(isoRight);
        const pulse = context.createOscillator();
        const pulseDepth = context.createGain();
        pulse.frequency.setValueAtTime(from, now);
        pulse.frequency.linearRampToValueAtTime(to, now + durationSec);
        pulseDepth.gain.setValueAtTime(0.28, now);
        pulse.connect(pulseDepth);
        pulseDepth.connect(isoLeft.gain);
        pulseDepth.connect(isoRight.gain);
        pulse.start(now);
        nodes.push(pulse);
        leftOutput = isoLeft;
        rightOutput = isoRight;
      }

      leftOutput.connect(merger, 0, 0);
      rightOutput.connect(merger, 0, 1);
      const breathGain = context.createGain();
      let finalSignal = breathGain;
      const breath = scoreRef.current.sound?.breathGuide || DEFAULT_SOUND.breathGuide;
      if (breath.enabled) {
        const breathLfo = context.createOscillator();
        const breathDepth = context.createGain();
        const breathHz = breath.pattern === '4-7-8' ? 1 / 19 : breath.pattern === 'box' ? 1 / 16 : Number(breath.bpm || 5.5) / 60;
        breathGain.gain.setValueAtTime(0.9, now);
        breathLfo.frequency.setValueAtTime(Math.max(0.01, breathHz), now);
        breathDepth.gain.setValueAtTime(0.1, now);
        breathLfo.connect(breathDepth).connect(breathGain.gain);
        breathLfo.start(now);
        nodes.push(breathLfo);
      } else {
        breathGain.gain.setValueAtTime(1, now);
      }
      merger.connect(finalSignal);

      const gain = context.createGain();
      const targetGain = Math.min(0.18, Math.max(0, Number(stage.volume) / 100) * 0.18);
      const fades = scoreRef.current.sound?.fades || DEFAULT_SOUND.fades;
      const fadeIn = Math.min(Number(fades.inSec) || 0, durationSec);
      const fadeOut = Math.min(Number(fades.outSec) || 0, durationSec);
      gain.gain.setValueAtTime(fadeIn > 0 ? 0 : targetGain, now);
      if (fadeIn > 0) gain.gain.linearRampToValueAtTime(targetGain, now + fadeIn);
      if (fadeOut > 0) {
        const fadeOutStart = Math.max(now + fadeIn, now + durationSec - fadeOut);
        gain.gain.setValueAtTime(targetGain, fadeOutStart);
        gain.gain.linearRampToValueAtTime(0, now + durationSec);
      }
      finalSignal.connect(gain).connect(context.destination);
      const timeout = window.setTimeout(() => stopPreview(), durationSec * 1000);
      audioRef.current = { context, nodes, timeout };
      setAudioReady(true);
      setIsPreviewing(true);
      setSelectedStageId(stage.id);
      selectedRef.current = stage.id;
      setActivity(`${stage.label} preview is ready and playing for up to ${durationSec} seconds.`);
      return toolResult('completed', {
        selectedStageId: stage.id,
        audioReady: true,
        audioStarted: true,
        previewDurationSec: durationSec,
        fullScoreRendered: false,
        previewModes: modes,
        backgroundApplied: false
      });
    } catch {
      for (const node of nodes) {
        try { node.stop?.(); } catch {}
      }
      try { await context?.close(); } catch {}
      setAudioReady(false);
      setIsPreviewing(false);
      return toolResult('failed', { error: { code: 'AUDIO_UNAVAILABLE', safeMessage: 'The browser could not start the local preview.', retryable: true }, audioReady: false });
    }
  }, [stopPreview]);

  handlersRef.current = {
    cognistration_compose_session_score: async (input = {}) => {
      try {
        const next = composeSessionScore(input);
        if (next.status === 'safety_redirect') {
          setActivity('This request belongs on the health and safety route. No score or audio was created.');
          return next;
        }
        replaceScore(next, 'The agent composed a new visible, browser-local score. Audio remains off.');
        return next;
      } catch {
        return toolResult('failed', { error: { code: 'INVALID_SCORE', safeMessage: 'Use the published stage, duration, and frequency bounds.', retryable: false } });
      }
    },
    cognistration_refine_session_score_stage: async ({ stageId, soundPatch, ...patch } = {}) => {
      try {
        const next = refineSessionScore({ score: scoreData(scoreRef.current), stageId, patch: { ...patch, ...(soundPatch ? { soundPatch } : {}) } });
        const label = next.stages.find((stage) => stage.id === stageId)?.label || 'selected';
        replaceScore(next, soundPatch ? `The ${label} stage sound profile was refined. Audio remains off.` : `The ${label} stage was refined. Audio remains off.`);
        return next;
      } catch (error) {
        setActivity(error?.code === 'STAGE_NOT_FOUND' ? 'Select a visible stage before refining it.' : 'Use bounded technical settings for the selected stage.');
        return toolResult('failed', { error: { code: error?.code || 'INVALID_REFINEMENT', safeMessage: 'Choose a visible stage and bounded technical settings.', retryable: false } });
      }
    },
    cognistration_undo_session_score: async ({ steps = 1 } = {}) => {
      const count = Math.max(1, Math.min(20, Number(steps) || 1));
      const currentHistory = historyRef.current;
      if (!currentHistory.length) return toolResult('failed', { error: { code: 'NOTHING_TO_UNDO', safeMessage: 'There is no visible score revision to undo.', retryable: false } });
      const index = Math.max(0, currentHistory.length - count);
      const restored = composeSessionScore({ score: currentHistory[index] });
      const remaining = currentHistory.slice(0, index);
      setHistory(remaining);
      historyRef.current = remaining;
      setScore(restored);
      scoreRef.current = restored;
      setActivity('The visible score revision was undone. Audio remains off.');
      return restored;
    },
    cognistration_select_session_score_stage: async ({ stageId } = {}) => {
      const stage = scoreRef.current.stages.find((candidate) => candidate.id === stageId);
      if (!stage) return toolResult('failed', { error: { code: 'STAGE_NOT_FOUND', safeMessage: 'Select a stage in the visible score.', retryable: false } });
      setSelectedStageId(stage.id);
      selectedRef.current = stage.id;
      setActivity(`${stage.label} is selected. Audio remains off.`);
      return toolResult('completed', { selectedStageId: stage.id, stage, audioStarted: false });
    },
    cognistration_preview_session_score: startPreview
  };

  useEffect(() => {
    const modelContext = document.modelContext || (typeof navigator !== 'undefined' ? navigator.modelContext : null);
    if (!modelContext || typeof modelContext.registerTool !== 'function') {
      setWebmcpStatus('unsupported');
      return undefined;
    }
    const controller = new AbortController();
    const tools = WEBMCP_TOOL_DEFINITIONS
      .filter((definition) => SCORE_TOOL_NAMES.has(definition.name))
      .map((definition) => nativeWebMcpTool(definition, (input, context) => handlersRef.current[definition.name]?.(input, context)));
    Promise.all(tools.map((tool) => modelContext.registerTool(tool, { signal: controller.signal })))
      .then(() => setWebmcpStatus('ready'))
      .catch(() => { if (!controller.signal.aborted) setWebmcpStatus('error'); });
    return () => controller.abort();
  }, []);

  useEffect(() => () => stopPreview(), [stopPreview]);

  const selected = score.stages.find((stage) => stage.id === selectedStageId) || score.stages[0];
  const exportScore = () => {
    const payload = sessionScoreTechnicalExport(scoreData(score));
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cognistration-session-score.json';
    link.click();
    URL.revokeObjectURL(url);
    setActivity('Technical settings exported without intention or account data.');
  };

  const refineSelected = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    handlersRef.current.cognistration_refine_session_score_stage({
      stageId: selected.id,
      carrierHz: Number(data.get('carrierHz')),
      beatFromHz: Number(data.get('beatFromHz')),
      beatToHz: Number(data.get('beatToHz')),
      volume: Number(data.get('volume'))
    });
  };

  const updateSound = (soundPatch) => {
    handlersRef.current.cognistration_refine_session_score_stage({ stageId: selected.id, soundPatch });
  };

  const sound = score.sound || DEFAULT_SOUND;
  const modes = sound.entrainmentModes || DEFAULT_SOUND.entrainmentModes;
  const background = sound.background || DEFAULT_SOUND.background;
  const breath = sound.breathGuide || DEFAULT_SOUND.breathGuide;
  const fades = sound.fades || DEFAULT_SOUND.fades;

  return (
    <section data-testid="session-score-conductor" data-webmcp-status={webmcpStatus} className="glass-subpanel rounded-[1.75rem] border border-[#b6ddcc]/10 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b6ddcc]/70">Agentic Session Score · browser local</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">A score both you and the agent can inspect.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Carrier stays constant inside each stage while the differential can move linearly. Choose the Studio signal modes, breath pace, ambience metadata, and fades; nothing is saved or rendered.</p>
        </div>
        <span className="glass-pill rounded-full px-3 py-2 text-xs text-white/50">{formatTime(score.durationSec)} planned · {SESSION_SCORE_PREVIEW_CAP_SEC}s preview cap</span>
      </div>

      <div data-testid="session-score-timeline" className="mt-6 flex min-h-16 overflow-hidden rounded-2xl border border-white/10">
        {score.stages.map((stage) => (
          <button key={stage.id} type="button" data-stage-id={stage.id} aria-pressed={stage.id === selected.id} onClick={() => handlersRef.current.cognistration_select_session_score_stage({ stageId: stage.id })} style={{ flexGrow: stage.durationSec }} className={`min-w-0 border-r border-white/10 px-3 py-4 text-left transition last:border-r-0 ${stage.id === selected.id ? 'bg-[#b6ddcc]/20' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}>
            <span className="block truncate text-xs font-medium text-white/85">{stage.label}</span>
            <span className="mt-1 block text-[10px] text-white/40">{formatTime(stage.durationSec)}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 sm:grid-cols-5">
          <div><p className="text-[10px] uppercase tracking-wider text-white/35">Stage</p><p className="mt-1 text-sm text-white/80">{selected.label} · {selected.state}</p></div>
          <div><p className="text-[10px] uppercase tracking-wider text-white/35">Carrier</p><p className="mt-1 text-sm text-white/80">{selected.carrierHz} Hz constant</p></div>
          <div><p className="text-[10px] uppercase tracking-wider text-white/35">Beat</p><p className="mt-1 text-sm text-white/80">{selected.beatHz.from} → {selected.beatHz.to} Hz linear</p></div>
          <div><p className="text-[10px] uppercase tracking-wider text-white/35">Channels start</p><p className="mt-1 text-sm text-white/80">{selected.carrierHz - selected.beatHz.from / 2} / {selected.carrierHz + selected.beatHz.from / 2} Hz</p></div>
          <div><p className="text-[10px] uppercase tracking-wider text-white/35">Volume</p><p className="mt-1 text-sm text-white/80">{selected.volume}%</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:max-w-xs lg:justify-end">
          <button type="button" onClick={() => handlersRef.current.cognistration_undo_session_score({ steps: 1 })} disabled={!history.length} className="glass-action glass-action--secondary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs disabled:opacity-35"><ArrowCounterClockwise className="size-4" /> Undo</button>
          <button type="button" onClick={exportScore} className="glass-action glass-action--secondary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs"><DownloadSimple className="size-4" /> Export</button>
          {isPreviewing ? <button type="button" onClick={() => { stopPreview(); setActivity('Preview stopped.'); }} className="glass-action glass-action--primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs"><Stop className="size-4" /> Stop</button> : <button type="button" onClick={() => startPreview({ confirmed: true })} className="glass-action glass-action--primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs"><Play className="size-4" /> Confirm & preview stage</button>}
        </div>
      </div>
      <form key={selected.id} onSubmit={refineSelected} data-testid="session-score-refine-form" className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 sm:grid-cols-5">
        <label className="text-[10px] uppercase tracking-wider text-white/35">Carrier Hz<input name="carrierHz" type="number" min="50" max="2000" step="1" defaultValue={selected.carrierHz} className="glass-input mt-2 w-full rounded-lg px-3 py-2 text-sm text-white" /></label>
        <label className="text-[10px] uppercase tracking-wider text-white/35">Differential from<input name="beatFromHz" type="number" min="0.1" max="40" step="0.1" defaultValue={selected.beatHz.from} className="glass-input mt-2 w-full rounded-lg px-3 py-2 text-sm text-white" /></label>
        <label className="text-[10px] uppercase tracking-wider text-white/35">Differential to<input name="beatToHz" type="number" min="0.1" max="40" step="0.1" defaultValue={selected.beatHz.to} className="glass-input mt-2 w-full rounded-lg px-3 py-2 text-sm text-white" /></label>
        <label className="text-[10px] uppercase tracking-wider text-white/35">Volume %<input name="volume" type="number" min="0" max="100" step="1" defaultValue={selected.volume} className="glass-input mt-2 w-full rounded-lg px-3 py-2 text-sm text-white" /></label>
        <button type="submit" className="glass-action glass-action--secondary self-end rounded-lg px-3 py-2.5 text-xs">Refine selected stage</button>
      </form>
      <div data-testid="session-score-sound-controls" className="mt-4 grid gap-4 rounded-2xl border border-[#b6ddcc]/15 bg-black/10 p-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#b6ddcc]/70">Full-spectrum modes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(modes).map(([mode, enabled]) => (
              <button key={mode} type="button" aria-pressed={enabled} disabled={enabled && Object.values(modes).filter(Boolean).length === 1} onClick={() => updateSound({ entrainmentModes: { [mode]: !enabled } })} className={`rounded-full border px-3 py-2 text-xs capitalize transition disabled:cursor-not-allowed disabled:opacity-45 ${enabled ? 'border-[#b6ddcc]/35 bg-[#b6ddcc]/15 text-[#d7eadf]' : 'border-white/10 text-white/35 hover:text-white/65'}`}>{mode}</button>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-5 text-white/35">Carrier: 50–2,000 Hz · differential: 0.1–40 Hz. At least one mode stays enabled.</p>
        </div>
        <label className="text-[10px] uppercase tracking-[0.18em] text-[#b6ddcc]/70">Ambience
          <select value={background.type === 'asset' ? background.assetId : background.type} onChange={(event) => { const value = event.target.value; updateSound({ background: value === 'none' ? { type: 'none' } : value === 'ocean' ? { type: 'ocean', mixDb: -24 } : { type: 'asset', assetId: value, mixDb: -25, crossfadeSec: 2.5 } }); }} className="glass-input mt-2 w-full rounded-lg px-3 py-2 text-xs text-white"><option value="none">None</option><option value="ocean">Synthesized ocean</option>{AmbientAssetOptions.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select>
          {background.type !== 'none' && <>
            <span className="mt-2 block text-[10px] normal-case tracking-normal text-white/35">{background.mixDb} dB mix{background.type === 'asset' ? ` · ${background.crossfadeSec}s crossfade` : ''}</span>
            <input aria-label="Ambience mix" type="range" min="-60" max="-6" step="1" value={background.mixDb} onChange={(event) => updateSound({ background: { ...background, mixDb: Number(event.target.value) } })} className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[#b6ddcc]" />
          </>}
        </label>
        <div>
          <label className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-[#b6ddcc]/70">Breath guide <input type="checkbox" checked={breath.enabled} onChange={(event) => updateSound({ breathGuide: { enabled: event.target.checked } })} className="accent-[#b6ddcc]" /></label>
          {breath.enabled && <select value={breath.pattern} onChange={(event) => updateSound({ breathGuide: { pattern: event.target.value } })} className="glass-input mt-2 w-full rounded-lg px-3 py-2 text-xs text-white"><option value="coherent-5.5">Coherent 5.5</option><option value="4-7-8">4–7–8</option><option value="box">Box</option></select>}
          {breath.enabled && breath.pattern === 'coherent-5.5' && <input aria-label="Breath guide pace" type="range" min="2" max="12" step="0.5" value={breath.bpm} onChange={(event) => updateSound({ breathGuide: { bpm: Number(event.target.value) } })} className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[#b6ddcc]" />}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-[9px] normal-case tracking-normal text-white/35">Fade in {fades.inSec}s<input aria-label="Fade in" type="range" min="0" max="60" step="1" value={fades.inSec} onChange={(event) => updateSound({ fades: { inSec: Number(event.target.value) } })} className="mt-1 h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[#b6ddcc]" /></label>
            <label className="text-[9px] normal-case tracking-normal text-white/35">Fade out {fades.outSec}s<input aria-label="Fade out" type="range" min="0" max="60" step="1" value={fades.outSec} onChange={(event) => updateSound({ fades: { outSec: Number(event.target.value) } })} className="mt-1 h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[#b6ddcc]" /></label>
          </div>
          <p className="mt-3 text-[10px] leading-5 text-white/35">Ambience stays metadata-only in this browser preview; a later private render can honor the approved asset.</p>
        </div>
      </div>
      <p data-testid="session-score-activity" data-audio-ready={String(audioReady)} aria-live="polite" className="mt-4 flex items-center gap-2 text-xs text-white/45"><SlidersHorizontal className="size-4 text-[#b6ddcc]" /> {activity}</p>
    </section>
  );
}
