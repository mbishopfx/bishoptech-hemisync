'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lightning, Power, Pulse } from '@phosphor-icons/react';

const MAX_DURATION_SEC = 120;

const STATE_OPTIONS = [
  { id: 'delta', label: 'Delta', hz: 3, range: '0.5 - 4 Hz (Restoration)' },
  { id: 'theta', label: 'Theta', hz: 6, range: '4 - 8 Hz (Dream / Breakthrough)' },
  { id: 'alpha', label: 'Alpha', hz: 10, range: '8 - 14 Hz (Calm Flow)' },
  { id: 'beta', label: 'Beta', hz: 18, range: '14 - 30 Hz (Analytical Focus)' }
];

const STATE_VISUALS = {
  delta: {
    accent: 'text-blue-300',
    border: 'border-blue-500/30',
    shadow: 'shadow-[0_0_50px_rgba(59,130,246,0.12)]',
    wave: 'bg-blue-400',
    glow: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
  },
  theta: {
    accent: 'text-purple-300',
    border: 'border-purple-500/30',
    shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.15)]',
    wave: 'bg-purple-400',
    glow: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
  },
  alpha: {
    accent: 'text-cyan-300',
    border: 'border-cyan-500/30',
    shadow: 'shadow-[0_0_50px_rgba(6,182,212,0.15)]',
    wave: 'bg-cyan-400',
    glow: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
  },
  beta: {
    accent: 'text-rose-300',
    border: 'border-rose-500/30',
    shadow: 'shadow-[0_0_50px_rgba(244,63,94,0.12)]',
    wave: 'bg-rose-400',
    glow: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
  }
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function ToneMachineDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [carrierFreq, setCarrierFreq] = useState(200);
  const [targetState, setTargetState] = useState('theta');
  const [beatFreq, setBeatFreq] = useState(6);
  const [volume, setVolume] = useState(80);
  const [time, setTime] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const audioCtxRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);
  const masterGainRef = useRef(null);
  const visual = STATE_VISUALS[targetState] || STATE_VISUALS.theta;

  const stopAudioNodes = useCallback(() => {
    if (leftOscRef.current) {
      try { leftOscRef.current.stop(); } catch {}
      try { leftOscRef.current.disconnect(); } catch {}
      leftOscRef.current = null;
    }
    if (rightOscRef.current) {
      try { rightOscRef.current.stop(); } catch {}
      try { rightOscRef.current.disconnect(); } catch {}
      rightOscRef.current = null;
    }
    if (masterGainRef.current) {
      try { masterGainRef.current.disconnect(); } catch {}
      masterGainRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioCtxRef.current && masterGainRef.current) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      try {
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
        masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.15);
      } catch {}
    }

    window.setTimeout(() => {
      stopAudioNodes();
      setIsPlaying(false);
    }, 200);
  }, [stopAudioNodes]);

  const startAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        window.alert('Web Audio API is not supported in this browser.');
        return;
      }

      const ctx = audioCtxRef.current || new AudioContextClass();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') ctx.resume();
      stopAudioNodes();

      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      rightOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(carrierFreq, ctx.currentTime);
      rightOsc.frequency.setValueAtTime(carrierFreq + beatFreq, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      leftOsc.connect(merger, 0, 0);
      rightOsc.connect(merger, 0, 1);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(volume / 100, ctx.currentTime + 0.15);
      merger.connect(masterGain);
      masterGain.connect(ctx.destination);

      leftOsc.start();
      rightOsc.start();
      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;
      masterGainRef.current = masterGain;
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start demonstration synthesizer:', error);
    }
  };

  const togglePower = () => {
    if (isPlaying) stopAudio();
    else startAudio();
  };

  const handleStateSelect = (state, hz) => {
    setTargetState(state);
    setBeatFreq(hz);
  };

  useEffect(() => {
    let frame;
    const tick = () => {
      setTime((previous) => previous + (isPlaying ? 0.08 : 0));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setSessionTime((previous) => previous + 1);
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (sessionTime >= MAX_DURATION_SEC) {
      stopAudio();
      setShowLimitModal(true);
      setSessionTime(0);
    }
  }, [sessionTime, stopAudio]);

  useEffect(() => {
    if (isPlaying && leftOscRef.current && rightOscRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      leftOscRef.current.frequency.linearRampToValueAtTime(carrierFreq, now + 0.05);
      rightOscRef.current.frequency.linearRampToValueAtTime(carrierFreq + beatFreq, now + 0.05);
    }
  }, [carrierFreq, beatFreq, isPlaying]);

  useEffect(() => {
    if (isPlaying && masterGainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      masterGainRef.current.gain.linearRampToValueAtTime(volume / 100, ctx.currentTime + 0.05);
    }
  }, [volume, isPlaying]);

  useEffect(() => () => {
    stopAudioNodes();
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
    }
  }, [stopAudioNodes]);

  const getSinePath = (freq, amp, speedMultiplier = 1) => {
    const points = [];
    const width = 400;
    const height = 80;
    const visualFreq = freq * 0.05;
    for (let x = 0; x <= width; x += 4) {
      const y = height / 2 + Math.sin((x * visualFreq * 0.5) - (time * speedMultiplier * 1.5)) * amp;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const getEntrainmentPath = (freq, amp, speedMultiplier = 1) => {
    const points = [];
    const width = 400;
    const height = 100;
    for (let x = 0; x <= width; x += 4) {
      const envelope = Math.sin(x * 0.015);
      const y = height / 2 + Math.sin((x * freq * 0.08) - (time * speedMultiplier * 1.2)) * amp * envelope;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <section
      id="tone-machine-demo"
      aria-label="Cognistration tone machine demo"
      className={`liquid-glass w-full rounded-3xl border bg-zinc-950/70 p-6 backdrop-blur-2xl transition-all duration-500 sm:p-8 ${visual.border} ${visual.shadow}`}
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/25">Real-time auditory oscillations</p>
            <div className="relative space-y-6 overflow-hidden rounded-2xl border border-white/5 bg-black/60 p-5 sm:p-6">
              <div className="relative z-10 space-y-1">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-cyan-400">
                  <span>Left ear carrier (L)</span>
                  <span>{carrierFreq} Hz</span>
                </div>
                <svg className="h-12 w-full text-cyan-500/80" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
                  <path d={getSinePath(carrierFreq, isPlaying ? 20 : 0.5, 1.2)} fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="relative z-10 space-y-1">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-purple-400">
                  <span>Right ear carrier (R)</span>
                  <span>{carrierFreq + beatFreq} Hz</span>
                </div>
                <svg className="h-12 w-full text-purple-500/80" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
                  <path d={getSinePath(carrierFreq + beatFreq, isPlaying ? 20 : 0.5, 1.3)} fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="relative z-10 space-y-1 border-t border-white/5 pt-4">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-cyan-300">
                  <span>Binaural differential (R - L)</span>
                  <span className="font-bold">{beatFreq.toFixed(1)} Hz ({targetState.toUpperCase()})</span>
                </div>
                <svg className="h-16 w-full text-cyan-300" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <filter id="homepage-glow-wave">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path d={getEntrainmentPath(beatFreq, isPlaying ? 30 : 0, 0.4)} fill="none" stroke="currentColor" strokeWidth="2.5" filter="url(#homepage-glow-wave)" />
                </svg>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-cyan-500/5 blur-[80px]" />
            </div>
          </div>

          <div className="space-y-5 border-t border-white/5 pt-5">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/25">Signal calibration controls</p>

            <label className="block space-y-2">
              <span className="flex justify-between text-[10px] font-mono uppercase text-white/45">
                <span>Base carrier frequency</span>
                <span>{carrierFreq} Hz</span>
              </span>
              <input aria-label="Base carrier frequency" type="range" min="100" max="400" value={carrierFreq} onChange={(event) => setCarrierFreq(Number(event.target.value))} className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-400" />
              <span className="block text-[9.5px] font-mono uppercase leading-normal tracking-widest text-white/20">Set the underlying tone that both ears receive.</span>
            </label>

            <label className="block space-y-2">
              <span className="flex justify-between text-[10px] font-mono uppercase text-white/45">
                <span>Beat frequency</span>
                <span>{beatFreq.toFixed(1)} Hz</span>
              </span>
              <input aria-label="Beat frequency" type="range" min="0.5" max="40" step="0.5" value={beatFreq} onChange={(event) => setBeatFreq(Number(event.target.value))} className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-400" />
              <span className="block text-[9.5px] font-mono uppercase leading-normal tracking-widest text-white/20">Fine-tune the left/right difference independently from the presets.</span>
            </label>

            <label className="block space-y-2">
              <span className="flex justify-between text-[10px] font-mono uppercase text-white/45">
                <span>Master volume</span>
                <span>{volume}%</span>
              </span>
              <input aria-label="Master volume" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-400" />
            </label>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
            <Pulse aria-hidden="true" className={`size-5 shrink-0 ${visual.accent}`} weight="light" />
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/60">R - L difference: {beatFreq.toFixed(1)} Hz</p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-cyan-400">Hardware interface</p>
            <button
              type="button"
              onClick={togglePower}
              className={`flex w-full items-center justify-center gap-3 rounded-2xl border px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all ${isPlaying ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20' : 'border-red-500/20 bg-red-500/5 text-red-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300'}`}
            >
              <Power aria-hidden="true" weight="light" className={`size-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              Power: {isPlaying ? 'Online' : 'Offline'}
            </button>
          </div>

          <div className="select-none space-y-2 rounded-2xl border border-white/5 bg-zinc-950/60 p-4">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
              <span className="text-zinc-500">Demo calibration session</span>
              <span className={isPlaying ? 'animate-pulse text-[9px] font-bold text-cyan-400' : 'text-[9px] text-zinc-600'}>{isPlaying ? 'Active' : 'Standby'}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-mono font-bold tracking-tight text-white">{formatTime(MAX_DURATION_SEC - sessionTime)}</span>
              <span className="text-[9px] font-mono uppercase tracking-wide text-zinc-600">/ 2m limit</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${(sessionTime / MAX_DURATION_SEC) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-cyan-400">Target demo states</p>
              <h3 className="text-3xl font-light tracking-tight text-white">Select target state.</h3>
              <p className="text-xs font-light leading-relaxed text-white/40">Choose a starting pattern, then use the sliders to shape the carrier, beat, and volume for this session.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {STATE_OPTIONS.map((state) => (
                <button
                  key={state.id}
                  type="button"
                  aria-pressed={targetState === state.id}
                  onClick={() => handleStateSelect(state.id, state.hz)}
                  className={`rounded-2xl border p-4 text-left transition-all ${targetState === state.id ? 'border-cyan-500/40 bg-cyan-500/10 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-white/5 bg-zinc-950/60 text-white/50 hover:border-white/10 hover:text-white/80'}`}
                >
                  <p className="text-sm font-bold tracking-tight">{state.label}</p>
                  <p className="mt-1 text-[9px] font-mono uppercase tracking-wide text-white/30">{state.range}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div className="relative w-full max-w-md space-y-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/90 p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.15)]">
            <div className="pointer-events-none absolute inset-0 bg-cyan-500/5 blur-[80px]" />
            <div className="relative space-y-6">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                <Lightning aria-hidden="true" className="size-6" weight="light" />
              </div>
              <div className="space-y-3 text-left">
                <h3 className="text-center text-2xl font-light tracking-tight text-white">Two-minute demo complete</h3>
                <p className="text-xs font-light leading-relaxed text-zinc-400">Your calibration session has reached its two-minute limit. Create an account to keep exploring the full Cognistration platform.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/signup" className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3.5 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-black transition-colors hover:bg-cyan-300">
                  Unlock the full platform <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                </Link>
                <button type="button" onClick={() => setShowLimitModal(false)} className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-all hover:bg-white/10 hover:text-white">Close demo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
