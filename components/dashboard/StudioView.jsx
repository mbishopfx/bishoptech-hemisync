'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { AmbientAssetOptions } from '@/lib/audio/assets';
import { JourneyPresetOptions } from '@/lib/audio/journeys';
import { authedFetch, getAccessToken } from '@/lib/frontend/api';
import { toBackendUrl } from '@/lib/frontend/backend-url';
import { createStudioSpecFromPreset, STUDIO_MAX_DURATION_SEC, STUDIO_MIN_DURATION_SEC } from '@/lib/studio/spec';

const DURATION_PRESETS = [10, 20, 30, 45, 60];
const STATE_OPTIONS = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
const ACTIVE_PHASES = new Set(['queued', 'rendering', 'uploading', 'validating']);
const STUDIO_STEPS = [
  { id: 1, label: 'Intent', icon: 'flare' },
  { id: 2, label: 'Journey', icon: 'timeline' },
  { id: 3, label: 'Sound', icon: 'tune' },
  { id: 4, label: 'Review & Render', icon: 'graphic_eq' }
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function formatDuration(seconds) {
  const minutes = Math.floor((seconds || 0) / 60);
  const secs = Math.round((seconds || 0) % 60);
  return secs ? `${minutes}m ${secs}s` : `${minutes} min`;
}

function phaseLabel(phase) {
  return ({
    queued: 'Queued',
    rendering: 'Synthesizing',
    uploading: 'Securing files',
    validating: 'Validating audio',
    completed: 'Export ready',
    failed: 'Render failed'
  })[phase] || 'Ready';
}

function StudioSlider({ label, value, min, max, step = 1, unit = '', onChange, tone = 'cyan', compact = false }) {
  const numericValue = Number(value);
  const progress = ((numericValue - min) / Math.max(1, max - min)) * 100;
  const activeColor = tone === 'purple' ? '#a855f7' : '#22d3ee';

  return (
    <label className={`block ${compact ? 'space-y-1.5' : 'space-y-2.5'}`}>
      <span className="flex items-center justify-between gap-3">
        <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-white/35">{label}</span>
        <output className={`rounded-full border px-2.5 py-1 text-[10px] font-mono ${tone === 'purple' ? 'border-purple-500/20 bg-purple-500/10 text-purple-200' : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200'}`}>
          {numericValue}{unit}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numericValue}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="studio-range w-full"
        style={{ background: `linear-gradient(90deg, ${activeColor} 0%, ${activeColor} ${progress}%, rgba(255,255,255,.09) ${progress}%, rgba(255,255,255,.09) 100%)` }}
      />
      {!compact && <span className="flex justify-between text-[8px] font-mono uppercase text-white/20"><span>{min}{unit}</span><span>{max}{unit}</span></span>}
    </label>
  );
}

function StagePath({ stages, totalDuration }) {
  let elapsed = 0;
  const points = stages.map((stage) => {
    const duration = Number(stage.durationSec || 0);
    const x = ((elapsed + duration / 2) / Math.max(1, totalDuration)) * 100;
    const averageDelta = (Number(stage.deltaHz.from) + Number(stage.deltaHz.to)) / 2;
    const y = 36 - (Math.min(40, averageDelta) / 40) * 30;
    elapsed += duration;
    return { id: stage.id, x, y };
  });
  const path = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black/35 p-3">
      <div className="relative h-24 overflow-hidden rounded-xl border border-white/[0.04] bg-[radial-gradient(circle_at_50%_130%,rgba(168,85,247,.17),transparent_62%),linear-gradient(180deg,rgba(34,211,238,.035),transparent)]">
        <svg viewBox="0 0 100 42" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-label="Session frequency curve" role="img">
          <defs>
            <linearGradient id="studioCurve" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stopColor="#22d3ee" /><stop offset="55%" stopColor="#818cf8" /><stop offset="100%" stopColor="#c084fc" /></linearGradient>
          </defs>
          {[10, 20, 30].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,.055)" strokeWidth=".35" />)}
          <polyline points={path} fill="none" stroke="rgba(34,211,238,.22)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={path} fill="none" stroke="url(#studioCurve)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => <circle key={point.id} cx={point.x} cy={point.y} r="1.9" fill="#050505" stroke="#a5f3fc" strokeWidth=".85" />)}
        </svg>
        <div className="absolute inset-x-3 bottom-2 flex justify-between text-[8px] font-mono uppercase tracking-[0.16em] text-white/25"><span>Opening</span><span>Core</span><span>Return</span></div>
      </div>
      <div className="mt-2 flex gap-1.5 overflow-hidden">{stages.map((stage, index) => <span key={stage.id} className="min-w-0 flex-1 truncate rounded-full bg-white/[0.035] px-2 py-1 text-center text-[8px] font-mono text-white/35">{index + 1}. {stage.name}</span>)}</div>
    </div>
  );
}

function SignalVisualizer({ state = 'theta', active = false }) {
  const bars = [18, 34, 52, 76, 46, 88, 62, 38, 70, 92, 58, 82, 44, 66, 30, 54, 78, 48, 86, 64, 40, 72, 96, 56, 80, 36, 68, 50, 84, 42, 60, 26];
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-cyan-500/10 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,.15),transparent_30%),radial-gradient(circle_at_65%_65%,rgba(168,85,247,.12),transparent_36%),rgba(0,0,0,.42)] p-6">
      <div className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15 shadow-[0_0_80px_rgba(34,211,238,.16)]" />
      <div className="relative flex h-32 items-center justify-center gap-1">
        {bars.map((height, index) => <span key={`${height}-${index}`} className={`w-1 rounded-full bg-gradient-to-t from-purple-500/35 to-cyan-300/80 ${active ? 'animate-pulse' : ''}`} style={{ height: `${height}%`, animationDelay: `${index * 35}ms`, animationDuration: '1.4s' }} />)}
      </div>
      <div className="relative mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em]"><span className="text-white/25">Live session signal</span><span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-cyan-200">{state} path</span></div>
    </div>
  );
}

export function StudioView({ initialProject = null, initialRender = null, onChanged, onOpenLibrary }) {
  const [project, setProject] = useState(initialProject);
  const [name, setName] = useState(initialProject?.name || 'My Cognistration Session');
  const [spec, setSpec] = useState(() => initialProject?.spec || createStudioSpecFromPreset({ durationSec: 20 * 60 }));
  const [activeStep, setActiveStep] = useState(1);
  const [activeStageId, setActiveStageId] = useState(() => spec.stages[0]?.id || null);
  const [saving, setSaving] = useState(false);
  const [startingRender, setStartingRender] = useState(false);
  const [render, setRender] = useState(initialRender);
  const [downloads, setDownloads] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailing, setEmailing] = useState(false);
  const [previewingStageId, setPreviewingStageId] = useState(null);
  const audioContextRef = useRef(null);
  const previewNodesRef = useRef([]);
  const previewTimerRef = useRef(null);

  useEffect(() => {
    if (!initialProject) return;
    setProject(initialProject);
    setName(initialProject.name);
    setSpec(initialProject.spec);
    setActiveStageId(initialProject.spec.stages[0]?.id || null);
  }, [initialProject]);

  useEffect(() => {
    if (initialRender) setRender(initialRender);
  }, [initialRender]);

  useEffect(() => {
    if (render?.phase !== 'completed' || downloads) return;
    authedFetch(`/api/studio/renders/${render.id}/downloads`)
      .then((data) => setDownloads(data.downloads))
      .catch((cause) => setError(cause.message || 'Downloads could not be prepared.'));
  }, [downloads, render?.id, render?.phase]);

  const totalDuration = useMemo(
    () => spec.stages.reduce((sum, stage) => sum + Number(stage.durationSec || 0), 0),
    [spec.stages]
  );

  const stopPreview = useCallback(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = null;
    previewNodesRef.current.forEach((node) => {
      try { node.stop?.(); } catch {}
      try { node.disconnect?.(); } catch {}
    });
    previewNodesRef.current = [];
    setPreviewingStageId(null);
  }, []);

  useEffect(() => () => {
    stopPreview();
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
  }, [stopPreview]);

  const previewStage = useCallback((stage) => {
    stopPreview();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setError('This browser does not support Web Audio preview.');
      return;
    }
    const context = audioContextRef.current || new AudioContextClass();
    audioContextRef.current = context;
    void context.resume();
    const duration = 20;
    const carrier = Number(stage.carrierHz || 220);
    const left = context.createOscillator();
    const right = context.createOscillator();
    const merger = context.createChannelMerger(2);
    const gain = context.createGain();
    left.type = 'sine';
    right.type = 'sine';
    left.frequency.setValueAtTime(carrier, context.currentTime);
    right.frequency.setValueAtTime(carrier + stage.deltaHz.from, context.currentTime);
    right.frequency.linearRampToValueAtTime(carrier + stage.deltaHz.to, context.currentTime + duration);
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, context.currentTime + 1);
    gain.gain.setValueAtTime(0.12, context.currentTime + duration - 1);
    gain.gain.linearRampToValueAtTime(0, context.currentTime + duration);
    left.connect(merger, 0, 0);
    right.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(context.destination);
    left.start();
    right.start();
    left.stop(context.currentTime + duration);
    right.stop(context.currentTime + duration);
    previewNodesRef.current = [left, right, merger, gain];
    previewTimerRef.current = setTimeout(stopPreview, duration * 1000);
    setPreviewingStageId(stage.id);
    setError('');
  }, [stopPreview]);

  const previewSession = () => {
    const first = spec.stages[0];
    const last = spec.stages.at(-1) || first;
    if (!first) return;
    previewStage({
      ...first,
      id: 'session-preview',
      deltaHz: { from: first.deltaHz.from, to: last.deltaHz.to }
    });
  };

  const updateStage = (stageId, patch) => {
    setSpec((current) => {
      const stages = current.stages.map((stage) => stage.id === stageId ? { ...stage, ...patch } : stage);
      const durationSec = stages.reduce((sum, stage) => sum + Number(stage.durationSec || 0), 0);
      return { ...current, stages, durationSec };
    });
  };

  const updateStageDelta = (stageId, key, value) => {
    setSpec((current) => ({
      ...current,
      stages: current.stages.map((stage) => stage.id === stageId
        ? { ...stage, deltaHz: { ...stage.deltaHz, [key]: clamp(value, 0.1, 40) } }
        : stage)
    }));
  };

  const updateStageDuration = (stageId, minutes) => {
    setSpec((current) => {
      const index = current.stages.findIndex((stage) => stage.id === stageId);
      if (index < 0 || current.stages.length < 2) return current;
      const neighborIndex = index < current.stages.length - 1 ? index + 1 : index - 1;
      const stage = current.stages[index];
      const neighbor = current.stages[neighborIndex];
      const pairTotal = Number(stage.durationSec) + Number(neighbor.durationSec);
      const nextDuration = clamp(Math.round(Number(minutes) * 60), 15, Math.max(15, pairTotal - 15));
      const nextNeighborDuration = pairTotal - nextDuration;
      const stages = current.stages.map((item, itemIndex) => {
        if (itemIndex === index) return { ...item, durationSec: nextDuration };
        if (itemIndex === neighborIndex) return { ...item, durationSec: nextNeighborDuration };
        return item;
      });
      return { ...current, stages, durationSec: current.durationSec };
    });
  };

  const getStageDurationMax = (index) => {
    if (spec.stages.length < 2) return Math.max(0.25, spec.durationSec / 60);
    const neighborIndex = index < spec.stages.length - 1 ? index + 1 : index - 1;
    return Number(((Number(spec.stages[index].durationSec) + Number(spec.stages[neighborIndex].durationSec) - 15) / 60).toFixed(2));
  };

  const selectPreset = (presetId, durationSec = spec.durationSec) => {
    const nextSpec = createStudioSpecFromPreset({ presetId, durationSec });
    setSpec(nextSpec);
    setActiveStageId(nextSpec.stages[0]?.id || null);
    setDownloads(null);
    setRender(null);
  };

  const setDurationMinutes = (minutes) => {
    const durationSec = clamp(Math.round(minutes * 60), STUDIO_MIN_DURATION_SEC, STUDIO_MAX_DURATION_SEC);
    selectPreset(spec.journeyPresetId, durationSec);
  };

  const saveProject = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = { name: name.trim() || 'Untitled Studio Project', spec: { ...spec, durationSec: totalDuration } };
      const data = project?.id
        ? await authedFetch(`/api/studio/projects/${project.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await authedFetch('/api/studio/projects', { method: 'POST', body: JSON.stringify(payload) });
      setProject(data.project);
      setSpec(data.project.spec);
      setMessage('Project saved privately.');
      await onChanged?.();
      return data.project;
    } catch (cause) {
      setError(cause.message || 'Project could not be saved.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const refreshRender = useCallback(async (renderId) => {
    const data = await authedFetch(`/api/studio/renders/${renderId}`);
    setRender(data.render);
    if (data.render.phase === 'completed') {
      const downloadData = await authedFetch(`/api/studio/renders/${renderId}/downloads`);
      setDownloads(downloadData.downloads);
      await onChanged?.();
    }
    return data.render;
  }, [onChanged]);

  useEffect(() => {
    if (!render?.id || !ACTIVE_PHASES.has(render.phase)) return undefined;
    const interval = setInterval(() => {
      refreshRender(render.id).catch(() => {});
    }, 2500);
    return () => clearInterval(interval);
  }, [render?.id, render?.phase, refreshRender]);

  const runRender = async (renderId) => {
    const token = await getAccessToken();
    const response = await fetch(toBackendUrl(`/api/studio/renders/${renderId}/run`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Railway render failed');
    await refreshRender(renderId);
  };

  const startRender = async () => {
    setError('');
    setMessage('');
    setDownloads(null);
    const saved = await saveProject();
    if (!saved) return;
    let activeRenderId = null;
    try {
      const initialized = await authedFetch('/api/studio/renders', {
        method: 'POST',
        body: JSON.stringify({ projectId: saved.id })
      });
      activeRenderId = initialized.render.id;
      setRender(initialized.render);
      setStartingRender(true);
      await runRender(initialized.render.id);
    } catch (cause) {
      setError(cause.message || 'Render failed.');
      if (activeRenderId) await refreshRender(activeRenderId).catch(() => {});
    } finally {
      setStartingRender(false);
    }
  };

  const resumeQueuedRender = async () => {
    if (!render?.id) return;
    setError('');
    setMessage('');
    setStartingRender(true);
    try {
      await runRender(render.id);
    } catch (cause) {
      setError(cause.message || 'Render could not be resumed.');
      await refreshRender(render.id).catch(() => {});
    } finally {
      setStartingRender(false);
    }
  };

  const duplicateProject = async (mode) => {
    if (!project?.id) return;
    setError('');
    try {
      const data = await authedFetch(`/api/studio/projects/${project.id}/duplicate`, {
        method: 'POST', body: JSON.stringify({ mode })
      });
      setProject(data.project);
      setName(data.project.name);
      setSpec(data.project.spec);
      setActiveStageId(data.project.spec.stages[0]?.id || null);
      setRender(null);
      setDownloads(null);
      setMessage(mode === 'version' ? `Version ${data.project.version} created.` : 'Project duplicated.');
      await onChanged?.();
    } catch (cause) {
      setError(cause.message || 'Project could not be duplicated.');
    }
  };

  const emailCopy = async () => {
    if (!render?.id) return;
    setEmailing(true);
    setError('');
    try {
      const data = await authedFetch(`/api/studio/renders/${render.id}/email`, { method: 'POST' });
      setMessage(`Secure delivery email sent to ${data.sentTo}.`);
      await refreshRender(render.id);
    } catch (cause) {
      setError(cause.message || 'Email delivery failed.');
    } finally {
      setEmailing(false);
    }
  };

  const durationValid = totalDuration >= STUDIO_MIN_DURATION_SEC && totalDuration <= STUDIO_MAX_DURATION_SEC;
  const renderActive = render && ACTIVE_PHASES.has(render.phase);

  const advanceStep = async () => {
    if (activeStep === 1) {
      const saved = await saveProject();
      if (!saved) return;
    }
    setActiveStep((step) => Math.min(4, step + 1));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-400">Private Production Workspace</p>
          <h2 className="mt-2 text-4xl font-light tracking-tight text-white md:text-5xl">Cognistration Studio</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">Build your session one decision at a time. Every adjustment updates the frequency journey before a private master is created.</p>
        </div>
        <button type="button" onClick={saveProject} disabled={saving || renderActive} className="self-start rounded-full border border-white/10 bg-white/[0.035] px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.2em] text-white/55 transition hover:border-cyan-500/25 hover:text-cyan-200 disabled:opacity-40">{saving ? 'Saving…' : project?.id ? 'Save draft' : 'Create draft'}</button>
      </div>

      <nav aria-label="Studio steps" className="grid grid-cols-2 gap-2 rounded-[1.75rem] border border-white/[0.06] bg-black/35 p-2 backdrop-blur-2xl md:grid-cols-4">
        {STUDIO_STEPS.map((step) => <button key={step.id} type="button" onClick={() => setActiveStep(step.id)} className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${activeStep === step.id ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/10 text-white shadow-[inset_0_0_0_1px_rgba(34,211,238,.18)]' : 'text-white/35 hover:bg-white/[0.035] hover:text-white/65'}`}><span className={`flex size-8 items-center justify-center rounded-full border font-mono text-[10px] ${activeStep === step.id ? 'border-cyan-400/35 bg-cyan-500/15 text-cyan-200' : 'border-white/10 text-white/30'}`}>{step.id}</span><span><span className="block text-[9px] font-mono uppercase tracking-[0.2em]">Step {step.id}</span><span className="mt-0.5 block text-xs">{step.label}</span></span></button>)}
      </nav>

      <Card className="overflow-hidden rounded-[2.25rem] border-white/[0.07] bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,.055),transparent_28%),radial-gradient(circle_at_90%_100%,rgba(168,85,247,.06),transparent_30%),rgba(24,24,27,.62)] p-0 backdrop-blur-3xl">
        <div className="min-h-[560px] p-5 md:p-8">
          {activeStep === 1 && <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
            <section className="space-y-6">
              <div><p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">01 · Set your intention</p><h3 className="mt-2 text-3xl font-light text-white">What should this session become?</h3><p className="mt-2 text-sm leading-6 text-white/40">Choose the outcome and length. We will shape an editable starting journey for you.</p></div>
              <label className="block space-y-2"><span className="text-[9px] font-mono uppercase tracking-widest text-white/35">Project name</span><input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-500/35" /></label>
              <div><p className="text-[9px] font-mono uppercase tracking-widest text-white/35">Intended state</p><div className="mt-2 grid grid-cols-5 gap-2">{STATE_OPTIONS.map((state) => <button key={state} type="button" onClick={() => setSpec((current) => ({ ...current, targetState: state }))} className={`rounded-2xl border px-2 py-3 text-[10px] font-mono uppercase transition ${spec.targetState === state ? 'border-cyan-400/30 bg-cyan-500/12 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,.08)]' : 'border-white/[0.06] bg-black/20 text-white/35 hover:text-white/65'}`}>{state}</button>)}</div></div>
              <label className="block space-y-2"><span className="text-[9px] font-mono uppercase tracking-widest text-white/35">Guided journey</span><select value={spec.journeyPresetId} onChange={(event) => selectPreset(event.target.value)} className="w-full rounded-2xl border border-white/[0.08] bg-zinc-950 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/35">{JourneyPresetOptions.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
              <div><div className="flex items-center justify-between"><span className="text-[9px] font-mono uppercase tracking-widest text-white/35">Session duration</span><span className="font-mono text-xs text-cyan-200">{formatDuration(totalDuration)}</span></div><div className="mt-3 flex flex-wrap gap-2">{DURATION_PRESETS.map((minutes) => <button key={minutes} type="button" onClick={() => setDurationMinutes(minutes)} className={`rounded-full border px-4 py-2 text-xs font-mono transition ${Math.round(totalDuration / 60) === minutes ? 'border-cyan-500/35 bg-cyan-500/15 text-cyan-100' : 'border-white/[0.07] bg-black/20 text-white/35 hover:text-white'}`}>{minutes} min</button>)}</div><div className="mt-4 rounded-2xl border border-white/[0.06] bg-black/25 p-4"><StudioSlider label="Custom duration" value={Math.round(totalDuration / 60)} min={5} max={120} unit=" min" onChange={setDurationMinutes} /></div></div>
            </section>
            <section className="space-y-4"><SignalVisualizer state={spec.targetState} active={previewingStageId === 'session-preview'} /><div className="grid grid-cols-2 gap-3">{spec.stages.slice(0, 4).map((stage, index) => <div key={stage.id} className="rounded-2xl border border-white/[0.06] bg-black/25 p-4"><span className="font-mono text-[9px] text-cyan-300/70">0{index + 1}</span><p className="mt-2 text-sm text-white/75">{stage.name}</p><p className="mt-1 font-mono text-[9px] text-purple-300/70">{stage.deltaHz.from} → {stage.deltaHz.to} Hz</p></div>)}</div></section>
          </div>}

          {activeStep === 2 && <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">02 · Shape the journey</p><h3 className="mt-2 text-3xl font-light text-white">Compose the frequency path</h3><p className="mt-2 text-sm text-white/40">Select a stage, then drag its controls. Stage length automatically rebalances the neighboring stage so the total stays {formatDuration(spec.durationSec)}.</p></div><button type="button" onClick={() => previewingStageId === 'session-preview' ? stopPreview() : previewSession()} className="rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-2 text-[10px] font-mono uppercase text-purple-200">{previewingStageId === 'session-preview' ? 'Stop preview' : 'Preview journey'}</button></div>
            <StagePath stages={spec.stages} totalDuration={totalDuration} />
            <div className="flex gap-2 overflow-x-auto pb-1">{spec.stages.map((stage, index) => <button key={stage.id} type="button" onClick={() => setActiveStageId(stage.id)} className={`min-w-[150px] flex-1 rounded-2xl border px-4 py-3 text-left transition ${activeStageId === stage.id ? 'border-cyan-500/25 bg-cyan-500/10' : 'border-white/[0.06] bg-black/20 hover:border-white/15'}`}><span className="font-mono text-[9px] text-cyan-300/60">STAGE 0{index + 1}</span><span className="mt-1 block truncate text-xs text-white/75">{stage.name}</span></button>)}</div>
            {spec.stages.map((stage, index) => activeStageId === stage.id && <div key={stage.id} className="grid gap-6 rounded-[1.75rem] border border-white/[0.07] bg-black/30 p-5 md:grid-cols-[.8fr_1.2fr] md:p-6">
              <div className="space-y-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full border border-cyan-500/25 bg-cyan-500/10 font-mono text-xs text-cyan-200">{index + 1}</span><input value={stage.name} onChange={(event) => updateStage(stage.id, { name: event.target.value })} className="min-w-0 flex-1 bg-transparent text-xl font-light text-white outline-none" /></div><label className="block text-[9px] font-mono uppercase text-white/30">Brain state<select value={stage.brainState} onChange={(event) => updateStage(stage.id, { brainState: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-xs text-white">{STATE_OPTIONS.map((state) => <option key={state}>{state}</option>)}</select></label><button type="button" onClick={() => previewingStageId === stage.id ? stopPreview() : previewStage(stage)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-500/20 bg-purple-500/[0.08] px-4 py-3 text-[10px] font-mono uppercase text-purple-200"><span className="material-symbols-outlined text-base">{previewingStageId === stage.id ? 'stop_circle' : 'play_circle'}</span>{previewingStageId === stage.id ? 'Stop stage' : 'Preview this stage'}</button></div>
              <div className="space-y-5"><StudioSlider label="Stage length · rebalances adjacent stage" value={Number((stage.durationSec / 60).toFixed(2))} min={0.25} max={getStageDurationMax(index)} step={0.01} unit=" min" onChange={(value) => updateStageDuration(stage.id, value)} /><StudioSlider label="Carrier frequency" value={stage.carrierHz} min={50} max={2000} unit=" Hz" onChange={(value) => updateStage(stage.id, { carrierHz: value })} /><div className="grid gap-5 sm:grid-cols-2"><StudioSlider label="Starting differential" value={stage.deltaHz.from} min={0.1} max={40} step={0.1} unit=" Hz" tone="purple" compact onChange={(value) => updateStageDelta(stage.id, 'from', value)} /><StudioSlider label="Ending differential" value={stage.deltaHz.to} min={0.1} max={40} step={0.1} unit=" Hz" tone="purple" compact onChange={(value) => updateStageDelta(stage.id, 'to', value)} /></div></div>
            </div>)}
          </section>}

          {activeStep === 3 && <section className="space-y-6">
            <div><p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">03 · Build the sound</p><h3 className="mt-2 text-3xl font-light text-white">Choose the listening texture</h3><p className="mt-2 text-sm text-white/40">Layer entrainment modes, ambience, breath pacing, and mastering without changing your timeline.</p></div>
            <div className="grid gap-5 lg:grid-cols-2"><div className="rounded-[1.75rem] border border-white/[0.07] bg-black/30 p-5"><SignalVisualizer state={spec.targetState} active={previewingStageId === 'session-preview'} /><div className="mt-4 grid grid-cols-3 gap-2">{Object.entries(spec.entrainmentModes).map(([mode, enabled]) => <button key={mode} type="button" onClick={() => setSpec((current) => ({ ...current, entrainmentModes: { ...current.entrainmentModes, [mode]: !enabled } }))} className={`rounded-2xl border px-3 py-3 text-[10px] font-mono uppercase transition ${enabled ? 'border-cyan-500/30 bg-cyan-500/12 text-cyan-100' : 'border-white/[0.07] text-white/30'}`}>{mode}</button>)}</div></div>
              <div className="space-y-5 rounded-[1.75rem] border border-white/[0.07] bg-black/30 p-5"><label className="block space-y-2"><span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400">Background layer</span><select value={spec.background.type === 'asset' ? spec.background.assetId : spec.background.type} onChange={(event) => { const value = event.target.value; setSpec((current) => ({ ...current, background: value === 'none' ? { type: 'none' } : value === 'ocean' ? { type: 'ocean', mixDb: -24 } : { type: 'asset', assetId: value, mixDb: -25, crossfadeSec: 2.5 } })); }} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-xs text-white"><option value="none">Pure signal</option><option value="ocean">Synthesized ocean</option>{AmbientAssetOptions.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>{spec.background.type !== 'none' && <StudioSlider label="Background mix" value={spec.background.mixDb} min={-60} max={-6} unit=" dB" onChange={(value) => setSpec((current) => ({ ...current, background: { ...current.background, mixDb: value } }))} />}<div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"><div><p className="text-xs text-white/70">Breath modulation</p><p className="mt-1 text-[10px] text-white/30">Gentle amplitude guidance</p></div><button type="button" onClick={() => setSpec((current) => ({ ...current, breathGuide: { ...current.breathGuide, enabled: !current.breathGuide.enabled } }))} className={`h-7 w-12 rounded-full p-1 transition ${spec.breathGuide.enabled ? 'bg-cyan-400' : 'bg-white/10'}`}><span className={`block size-5 rounded-full bg-black transition ${spec.breathGuide.enabled ? 'translate-x-5' : ''}`} /></button></div>{spec.breathGuide.enabled && <select value={spec.breathGuide.pattern} onChange={(event) => setSpec((current) => ({ ...current, breathGuide: { ...current.breathGuide, pattern: event.target.value } }))} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-xs text-white"><option value="coherent-5.5">Coherent 5.5</option><option value="4-7-8">4-7-8</option><option value="box">Box breathing</option></select>}</div>
            </div>
            <div className="grid gap-5 rounded-[1.75rem] border border-white/[0.07] bg-black/25 p-5 md:grid-cols-3"><StudioSlider label="Fade in" value={spec.fades.inSec} min={0} max={60} unit=" sec" onChange={(value) => setSpec((current) => ({ ...current, fades: { ...current.fades, inSec: value } }))} /><StudioSlider label="Fade out" value={spec.fades.outSec} min={0} max={60} unit=" sec" onChange={(value) => setSpec((current) => ({ ...current, fades: { ...current.fades, outSec: value } }))} /><div><p className="text-[9px] font-mono uppercase tracking-widest text-white/35">Export masters</p><div className="mt-3 flex gap-2">{['wav', 'mp3'].map((format) => <button key={format} type="button" onClick={() => setSpec((current) => { const selected = current.exportFormats.includes(format); const formats = selected ? current.exportFormats.filter((item) => item !== format) : [...current.exportFormats, format]; return { ...current, exportFormats: formats.length ? formats : [format] }; })} className={`flex-1 rounded-xl border px-3 py-3 text-[10px] font-mono uppercase ${spec.exportFormats.includes(format) ? 'border-cyan-500/25 bg-cyan-500/10 text-cyan-100' : 'border-white/[0.07] text-white/30'}`}>{format}</button>)}</div></div></div>
          </section>}

          {activeStep === 4 && <section className="space-y-6">
            <div className="text-center"><p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">04 · Review & render</p><h3 className="mt-2 text-3xl font-light text-white">Your private master is ready to build</h3><p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-white/40">Review the journey, then create genuine WAV and MP3 exports. Rendering continues safely while this screen reports each phase.</p></div>
            <SignalVisualizer state={spec.targetState} active={Boolean(renderActive)} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-white/[0.07] bg-black/30 p-4"><span className="text-[9px] font-mono uppercase text-white/30">Duration</span><p className="mt-2 text-lg text-white">{formatDuration(totalDuration)}</p></div><div className="rounded-2xl border border-white/[0.07] bg-black/30 p-4"><span className="text-[9px] font-mono uppercase text-white/30">Target</span><p className="mt-2 text-lg capitalize text-white">{spec.targetState}</p></div><div className="rounded-2xl border border-white/[0.07] bg-black/30 p-4"><span className="text-[9px] font-mono uppercase text-white/30">Journey</span><p className="mt-2 text-lg text-white">{spec.stages.length} stages</p></div><div className="rounded-2xl border border-white/[0.07] bg-black/30 p-4"><span className="text-[9px] font-mono uppercase text-white/30">Master</span><p className="mt-2 text-lg text-white">24-bit / 48 kHz</p></div></div>
            <StagePath stages={spec.stages} totalDuration={totalDuration} />
            <div className="rounded-[1.75rem] border border-cyan-500/15 bg-gradient-to-r from-cyan-500/[0.07] via-black/30 to-purple-500/[0.07] p-5 md:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-3"><span className={`size-3 rounded-full ${render?.phase === 'failed' ? 'bg-red-400' : render?.phase === 'completed' ? 'bg-emerald-400' : renderActive ? 'animate-pulse bg-cyan-400' : 'bg-white/20'}`} /><div><p className="text-[9px] font-mono uppercase tracking-widest text-white/30">Render status</p><p className="mt-1 text-xl font-light text-white">{phaseLabel(render?.phase)}</p></div></div></div><div className="w-full md:max-w-md"><div className="h-2 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${render?.progress || 0}%` }} /></div><p className="mt-2 text-right font-mono text-[9px] text-white/25">{render?.progress || 0}% complete</p></div></div>{render?.error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">{render.error}</p>}</div>
            {render?.phase === 'completed' && <div className="grid gap-3 sm:grid-cols-2">{downloads?.wav && <a href={downloads.wav} className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-mono uppercase text-white/65 hover:border-cyan-500/30 hover:text-cyan-200">Download WAV</a>}{downloads?.mp3 && <a href={downloads.mp3} className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-mono uppercase text-white/65 hover:border-cyan-500/30 hover:text-cyan-200">Download MP3</a>}<button type="button" onClick={emailCopy} disabled={emailing} className="rounded-2xl border border-purple-500/25 bg-purple-500/10 px-4 py-3 text-xs font-mono uppercase text-purple-200 disabled:opacity-40">{emailing ? 'Sending…' : 'Email Me a Copy'}</button><button type="button" onClick={onOpenLibrary} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.07] px-4 py-3 text-xs font-mono uppercase text-cyan-200">View in Library</button><button type="button" onClick={() => duplicateProject('duplicate')} className="rounded-2xl border border-white/10 px-4 py-3 text-[10px] font-mono uppercase text-white/50">Duplicate Project</button><button type="button" onClick={() => duplicateProject('version')} className="rounded-2xl border border-white/10 px-4 py-3 text-[10px] font-mono uppercase text-white/50">Create New Version</button></div>}
            <p className="text-center text-[10px] leading-5 text-white/25">Use stereo headphones at a moderate volume. This is an intentional listening tool, not medical treatment.</p>
          </section>}

          {(error || message) && <div className={`mt-5 rounded-2xl border px-4 py-3 text-xs ${error ? 'border-red-500/20 bg-red-500/10 text-red-200' : 'border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-200'}`} role={error ? 'alert' : 'status'}>{error || message}</div>}
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-white/[0.07] bg-black/75 px-5 py-4 backdrop-blur-2xl md:px-8"><button type="button" onClick={() => setActiveStep((step) => Math.max(1, step - 1))} disabled={activeStep === 1} className="rounded-full border border-white/10 px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest text-white/45 transition hover:text-white disabled:opacity-20">Back</button><span className="hidden text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 sm:block">Step {activeStep} of 4 · {STUDIO_STEPS[activeStep - 1].label}</span>{activeStep < 4 ? <button type="button" onClick={advanceStep} disabled={saving} className="rounded-full bg-cyan-300 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-cyan-200 disabled:opacity-40">{activeStep === 1 && saving ? 'Saving…' : 'Continue'} <span aria-hidden>→</span></button> : <button type="button" onClick={render?.phase === 'queued' ? resumeQueuedRender : startRender} disabled={!durationValid || startingRender || (renderActive && render?.phase !== 'queued') || saving} className="rounded-full bg-cyan-300 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_30px_rgba(34,211,238,.14)] transition hover:bg-cyan-200 disabled:opacity-35">{startingRender ? 'Starting Railway…' : render?.phase === 'queued' ? 'Start queued render' : renderActive ? phaseLabel(render.phase) : render?.phase === 'failed' ? 'Retry render' : 'Render session'}</button>}</div>
      </Card>
    </div>
  );
}
