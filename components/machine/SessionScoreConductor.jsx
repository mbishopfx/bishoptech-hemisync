'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowCounterClockwise, DownloadSimple, Play, SlidersHorizontal, Stop } from '@phosphor-icons/react';
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

function scoreData(result) {
  return { durationSec: result.durationSec, stages: result.stages.map(({ carrierBehavior, beatBehavior, ...stage }) => stage) };
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
      try { audio.left.stop(); } catch {}
      try { audio.right.stop(); } catch {}
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
    let left = null;
    let right = null;
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
      const gain = context.createGain();
      left = context.createOscillator();
      right = context.createOscillator();
      const durationSec = Math.min(stage.durationSec, SESSION_SCORE_PREVIEW_CAP_SEC);
      const now = context.currentTime;
      const leftFrom = stage.carrierHz - stage.beatHz.from / 2;
      const rightFrom = stage.carrierHz + stage.beatHz.from / 2;
      const leftTo = stage.carrierHz - stage.beatHz.to / 2;
      const rightTo = stage.carrierHz + stage.beatHz.to / 2;
      left.frequency.setValueAtTime(leftFrom, now);
      right.frequency.setValueAtTime(rightFrom, now);
      left.frequency.linearRampToValueAtTime(leftTo, now + durationSec);
      right.frequency.linearRampToValueAtTime(rightTo, now + durationSec);
      gain.gain.setValueAtTime(Math.min(0.18, stage.volume / 100 * 0.18), now);
      left.connect(merger, 0, 0);
      right.connect(merger, 0, 1);
      merger.connect(gain).connect(context.destination);
      left.start();
      right.start();
      const timeout = window.setTimeout(() => stopPreview(), durationSec * 1000);
      audioRef.current = { context, left, right, timeout };
      setAudioReady(true);
      setIsPreviewing(true);
      setSelectedStageId(stage.id);
      selectedRef.current = stage.id;
      setActivity(`${stage.label} preview is ready and playing for up to ${durationSec} seconds.`);
      return toolResult('completed', { selectedStageId: stage.id, audioReady: true, audioStarted: true, previewDurationSec: durationSec, fullScoreRendered: false });
    } catch {
      try { left?.stop(); } catch {}
      try { right?.stop(); } catch {}
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
    cognistration_refine_session_score_stage: async ({ stageId, ...patch } = {}) => {
      try {
        const next = refineSessionScore({ score: scoreData(scoreRef.current), stageId, patch });
        replaceScore(next, `The ${next.stages.find((stage) => stage.id === stageId)?.label || 'selected'} stage was refined. Audio remains off.`);
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

  return (
    <section data-testid="session-score-conductor" data-webmcp-status={webmcpStatus} className="glass-subpanel rounded-[1.75rem] border border-[#b6ddcc]/10 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b6ddcc]/70">Agentic Session Score · browser local</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">A score both you and the agent can inspect.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Carrier stays constant inside each stage. The beat moves linearly from its start to end value. Nothing is saved or rendered.</p>
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
        <label className="text-[10px] uppercase tracking-wider text-white/35">Carrier Hz<input name="carrierHz" type="number" min="100" max="400" step="1" defaultValue={selected.carrierHz} className="glass-input mt-2 w-full rounded-lg px-3 py-2 text-sm text-white" /></label>
        <label className="text-[10px] uppercase tracking-wider text-white/35">Beat from<input name="beatFromHz" type="number" min="0.5" max="40" step="0.5" defaultValue={selected.beatHz.from} className="glass-input mt-2 w-full rounded-lg px-3 py-2 text-sm text-white" /></label>
        <label className="text-[10px] uppercase tracking-wider text-white/35">Beat to<input name="beatToHz" type="number" min="0.5" max="40" step="0.5" defaultValue={selected.beatHz.to} className="glass-input mt-2 w-full rounded-lg px-3 py-2 text-sm text-white" /></label>
        <label className="text-[10px] uppercase tracking-wider text-white/35">Volume %<input name="volume" type="number" min="0" max="100" step="1" defaultValue={selected.volume} className="glass-input mt-2 w-full rounded-lg px-3 py-2 text-sm text-white" /></label>
        <button type="submit" className="glass-action glass-action--secondary self-end rounded-lg px-3 py-2.5 text-xs">Refine selected stage</button>
      </form>
      <p data-testid="session-score-activity" data-audio-ready={String(audioReady)} aria-live="polite" className="mt-4 flex items-center gap-2 text-xs text-white/45"><SlidersHorizontal className="size-4 text-[#b6ddcc]" /> {activity}</p>
    </section>
  );
}
