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

export function StudioView({ initialProject = null, initialRender = null, onChanged, onOpenLibrary }) {
  const [project, setProject] = useState(initialProject);
  const [name, setName] = useState(initialProject?.name || 'My Cognistration Session');
  const [spec, setSpec] = useState(() => initialProject?.spec || createStudioSpecFromPreset({ durationSec: 20 * 60 }));
  const [showPro, setShowPro] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const selectPreset = (presetId, durationSec = spec.durationSec) => {
    setSpec(createStudioSpecFromPreset({ presetId, durationSec }));
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
      const token = await getAccessToken();
      const response = await fetch(toBackendUrl(`/api/studio/renders/${initialized.render.id}/run`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Railway render failed');
      await refreshRender(initialized.render.id);
    } catch (cause) {
      setError(cause.message || 'Render failed.');
      if (activeRenderId) await refreshRender(activeRenderId).catch(() => {});
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-400">Private Production Workspace</p>
          <h2 className="mt-2 text-4xl font-light tracking-tight text-white">Cognistration Studio</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">Design staged binaural and frequency-following audio, preview it safely, then render private WAV and MP3 masters through Railway.</p>
        </div>
        <button type="button" onClick={saveProject} disabled={saving || renderActive} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-xs font-mono uppercase tracking-[0.2em] text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-40">
          {saving ? 'Saving…' : project?.id ? 'Save Project' : 'Create Project'}
        </button>
      </div>

      <Card className="rounded-[2rem] border-white/5 bg-zinc-900/40 p-5 md:p-7 backdrop-blur-3xl">
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2"><span className="text-[10px] font-mono uppercase tracking-widest text-white/35">Project name</span><input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40" /></label>
              <label className="space-y-2"><span className="text-[10px] font-mono uppercase tracking-widest text-white/35">Intended state</span><select value={spec.targetState} onChange={(event) => setSpec((current) => ({ ...current, targetState: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm capitalize text-white outline-none focus:border-cyan-500/40">{STATE_OPTIONS.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
              <label className="space-y-2"><span className="text-[10px] font-mono uppercase tracking-widest text-white/35">Session design</span><select value={spec.journeyPresetId} onChange={(event) => selectPreset(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40">{JourneyPresetOptions.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
            </div>

            <div>
              <div className="flex items-center justify-between"><span className="text-[10px] font-mono uppercase tracking-widest text-white/35">Duration</span><span className={`text-xs font-mono ${durationValid ? 'text-cyan-300' : 'text-amber-300'}`}>{formatDuration(totalDuration)}</span></div>
              <div className="mt-3 flex flex-wrap gap-2">{DURATION_PRESETS.map((minutes) => <button key={minutes} type="button" onClick={() => setDurationMinutes(minutes)} className={`rounded-full border px-4 py-2 text-xs font-mono ${Math.round(totalDuration / 60) === minutes ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200' : 'border-white/10 bg-white/5 text-white/45 hover:text-white'}`}>{minutes} min</button>)}<label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3"><span className="text-[10px] font-mono uppercase text-white/30">Custom</span><input type="number" min="5" max="120" value={Math.round(totalDuration / 60)} onChange={(event) => setDurationMinutes(event.target.value)} className="w-14 bg-transparent py-2 text-xs text-white outline-none" /><span className="text-[10px] text-white/30">min</span></label></div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">Stage Timeline</p><p className="mt-1 text-xs text-white/35">Each stage becomes a smooth frequency path in the final render.</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => previewingStageId === 'session-preview' ? stopPreview() : previewSession()} className="rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-[10px] font-mono uppercase text-purple-200">{previewingStageId === 'session-preview' ? 'Stop preview' : 'Preview session'}</button><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-mono text-white/35">{spec.stages.length} stages</span></div></div>
              <div className="grid gap-3">{spec.stages.map((stage, index) => (
                <div key={stage.id} className="rounded-2xl border border-white/8 bg-black/30 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-cyan-500/25 bg-cyan-500/10 text-xs font-mono text-cyan-300">{index + 1}</span><input value={stage.name} onChange={(event) => updateStage(stage.id, { name: event.target.value })} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white outline-none" /></div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-[10px] font-mono uppercase text-white/30">Minutes <input type="number" min="0.25" step="0.25" value={Number((stage.durationSec / 60).toFixed(2))} onChange={(event) => updateStage(stage.id, { durationSec: Math.max(15, Math.round(Number(event.target.value) * 60)) })} className="ml-2 w-16 rounded-lg border border-white/10 bg-zinc-950 px-2 py-1.5 text-white" /></label>
                      <span className="text-[10px] font-mono uppercase text-purple-300">{stage.deltaHz.from} → {stage.deltaHz.to} Hz</span>
                      <button type="button" onClick={() => previewingStageId === stage.id ? stopPreview() : previewStage(stage)} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-mono uppercase text-white/55 hover:border-cyan-500/30 hover:text-cyan-200">{previewingStageId === stage.id ? 'Stop' : 'Preview'}</button>
                    </div>
                  </div>
                  {showPro && <div className="mt-4 grid gap-3 border-t border-white/5 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-[9px] font-mono uppercase text-white/30">State<select value={stage.brainState} onChange={(event) => updateStage(stage.id, { brainState: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white">{STATE_OPTIONS.map((state) => <option key={state}>{state}</option>)}</select></label>
                    <label className="text-[9px] font-mono uppercase text-white/30">Carrier Hz<input type="number" min="50" max="2000" value={stage.carrierHz} onChange={(event) => updateStage(stage.id, { carrierHz: clamp(event.target.value, 50, 2000) })} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white" /></label>
                    <label className="text-[9px] font-mono uppercase text-white/30">Start differential<input type="number" min="0.1" max="40" step="0.1" value={stage.deltaHz.from} onChange={(event) => updateStageDelta(stage.id, 'from', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white" /></label>
                    <label className="text-[9px] font-mono uppercase text-white/30">End differential<input type="number" min="0.1" max="40" step="0.1" value={stage.deltaHz.to} onChange={(event) => updateStageDelta(stage.id, 'to', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white" /></label>
                  </div>}
                </div>
              ))}</div>
            </div>

            <button type="button" onClick={() => setShowPro((value) => !value)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-white/55 hover:text-white"><span>Professional Controls</span><span className="material-symbols-outlined text-base">{showPro ? 'expand_less' : 'expand_more'}</span></button>

            {showPro && <div className="grid gap-4 rounded-2xl border border-white/8 bg-black/25 p-5 md:grid-cols-2">
              <div className="space-y-3"><p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Entrainment modes</p>{Object.entries(spec.entrainmentModes).map(([mode, enabled]) => <label key={mode} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs capitalize text-white/60"><span>{mode}</span><input type="checkbox" checked={enabled} onChange={(event) => setSpec((current) => ({ ...current, entrainmentModes: { ...current.entrainmentModes, [mode]: event.target.checked } }))} className="accent-cyan-500" /></label>)}</div>
              <div className="space-y-3"><p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Background layer</p><select value={spec.background.type === 'asset' ? spec.background.assetId : spec.background.type} onChange={(event) => { const value = event.target.value; setSpec((current) => ({ ...current, background: value === 'none' ? { type: 'none' } : value === 'ocean' ? { type: 'ocean', mixDb: -24 } : { type: 'asset', assetId: value, mixDb: -25, crossfadeSec: 2.5 } })); }} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white"><option value="none">Pure signal</option><option value="ocean">Synthesized ocean</option>{AmbientAssetOptions.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select>{spec.background.type !== 'none' && <label className="block text-[9px] font-mono uppercase text-white/30">Mix {spec.background.mixDb} dB<input type="range" min="-60" max="-6" value={spec.background.mixDb} onChange={(event) => setSpec((current) => ({ ...current, background: { ...current.background, mixDb: Number(event.target.value) } }))} className="mt-2 w-full accent-cyan-500" /></label>}</div>
              <div className="space-y-3"><p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Breath modulation</p><label className="flex items-center justify-between text-xs text-white/55"><span>Enable gentle modulation</span><input type="checkbox" checked={spec.breathGuide.enabled} onChange={(event) => setSpec((current) => ({ ...current, breathGuide: { ...current.breathGuide, enabled: event.target.checked } }))} className="accent-cyan-500" /></label><select value={spec.breathGuide.pattern} onChange={(event) => setSpec((current) => ({ ...current, breathGuide: { ...current.breathGuide, pattern: event.target.value } }))} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white"><option value="coherent-5.5">Coherent 5.5</option><option value="4-7-8">4-7-8</option><option value="box">Box</option></select></div>
              <div className="space-y-3"><p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Master and delivery</p><div className="grid grid-cols-2 gap-2"><label className="text-[9px] font-mono uppercase text-white/30">Fade in<input type="number" min="0" max="60" value={spec.fades.inSec} onChange={(event) => setSpec((current) => ({ ...current, fades: { ...current.fades, inSec: clamp(event.target.value, 0, 60) } }))} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white" /></label><label className="text-[9px] font-mono uppercase text-white/30">Fade out<input type="number" min="0" max="60" value={spec.fades.outSec} onChange={(event) => setSpec((current) => ({ ...current, fades: { ...current.fades, outSec: clamp(event.target.value, 0, 60) } }))} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white" /></label></div><div className="flex gap-4">{['wav', 'mp3'].map((format) => <label key={format} className="flex items-center gap-2 text-xs uppercase text-white/55"><input type="checkbox" checked={spec.exportFormats.includes(format)} onChange={(event) => setSpec((current) => { const formats = event.target.checked ? [...new Set([...current.exportFormats, format])] : current.exportFormats.filter((item) => item !== format); return { ...current, exportFormats: formats.length ? formats : [format] }; })} className="accent-cyan-500" />{format}</label>)}</div></div>
            </div>}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-4 rounded-[1.75rem] border border-cyan-500/15 bg-black/45 p-5 shadow-[0_0_45px_rgba(6,182,212,.06)]">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">Render</p><h3 className="mt-1 text-xl font-light text-white">Private master</h3></div><span className={`size-3 rounded-full ${render?.phase === 'failed' ? 'bg-red-400' : render?.phase === 'completed' ? 'bg-emerald-400' : renderActive ? 'animate-pulse bg-cyan-400' : 'bg-white/20'}`} /></div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"><div className="flex justify-between text-[10px] font-mono uppercase tracking-widest"><span className="text-white/35">Status</span><span className="text-cyan-300">{phaseLabel(render?.phase)}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all" style={{ width: `${render?.progress || 0}%` }} /></div>{render?.error && <p className="mt-3 text-xs leading-5 text-red-300">{render.error}</p>}</div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono uppercase text-white/35"><div className="rounded-xl border border-white/5 p-3"><span>Duration</span><p className="mt-1 text-white/70">{formatDuration(totalDuration)}</p></div><div className="rounded-xl border border-white/5 p-3"><span>Master</span><p className="mt-1 text-white/70">24-bit / 48 kHz</p></div></div>
              <button type="button" onClick={startRender} disabled={!durationValid || renderActive || saving} className="w-full rounded-2xl bg-cyan-300 px-4 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-35">{renderActive ? phaseLabel(render.phase) : render?.phase === 'failed' ? 'Retry Render' : 'Render Session'}</button>
              <p className="text-[10px] leading-5 text-white/30">Use stereo headphones at a moderate volume. This is an intentional listening tool, not medical treatment.</p>
              {render?.phase === 'completed' && <div className="space-y-2 border-t border-white/5 pt-4">{downloads?.wav && <a href={downloads.wav} className="flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-xs font-mono uppercase text-white/65 hover:border-cyan-500/30 hover:text-cyan-200">Download WAV</a>}{downloads?.mp3 && <a href={downloads.mp3} className="flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-xs font-mono uppercase text-white/65 hover:border-cyan-500/30 hover:text-cyan-200">Download MP3</a>}<button type="button" onClick={emailCopy} disabled={emailing} className="w-full rounded-xl border border-purple-500/25 bg-purple-500/10 px-4 py-2.5 text-xs font-mono uppercase text-purple-200 disabled:opacity-40">{emailing ? 'Sending…' : 'Email Me a Copy'}</button><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => duplicateProject('duplicate')} className="rounded-xl border border-white/10 px-3 py-2 text-[9px] font-mono uppercase text-white/50 hover:text-white">Duplicate Project</button><button type="button" onClick={() => duplicateProject('version')} className="rounded-xl border border-white/10 px-3 py-2 text-[9px] font-mono uppercase text-white/50 hover:text-white">Create New Version</button></div><button type="button" onClick={onOpenLibrary} className="w-full text-[10px] font-mono uppercase tracking-widest text-cyan-300/70 hover:text-cyan-200">View in Library →</button></div>}
            </div>
          </aside>
        </div>
      </Card>

      {(message || error) && <div className={`rounded-2xl border px-4 py-3 text-sm ${error ? 'border-red-500/20 bg-red-500/10 text-red-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'}`}>{error || message}</div>}
    </div>
  );
}
