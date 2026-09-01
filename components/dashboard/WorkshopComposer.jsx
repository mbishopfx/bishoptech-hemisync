import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, Power, Zap } from 'lucide-react';
import { ImmersiveOceanMode } from '@/components/dashboard/ImmersiveOceanMode';
import { normalizeOceanSeed } from '@/components/science/vgpu-ocean/ocean-profile';

export function WorkshopComposer({ 
  seedTone, 
  onGenerated,
  generatingStatus = 'idle',
  generatingError = '',
  generatingProgress = '',
  generatingResult = null,
  generatingSavedTone = null,
  onStartGenerate,
  profile,
  library = []
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [carrierFreq, setCarrierFreq] = useState(200);
  const [beatFreq, setBeatFreq] = useState(6);
  const [volume, setVolume] = useState(80);
  const [time, setTime] = useState(0);
  const [audioError, setAudioError] = useState('');
  const [isImmersiveOpen, setIsImmersiveOpen] = useState(false);
  const [immersiveSeed, setImmersiveSeed] = useState(null);

  // Session access & countdown
  const maxDurationSec = 3600; // 1 hour for all signed-in users
  const [sessionTime, setSessionTime] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const audioCtxRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);
  const masterGainRef = useRef(null);
  const stopTimerRef = useRef(null);

  // Time ticker loop for smooth vector wave animations
  useEffect(() => {
    let frame;
    const tick = () => {
      setTime((prev) => prev + (isPlaying ? 0.08 : 0));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  // Support incoming seed tones from Journal or Library injections
  useEffect(() => {
    if (seedTone) {
      const baseFreq = Number(seedTone.baseFreqHz || seedTone.base_freq_hz || 200);
      const targetState = seedTone.target_state || seedTone.state || 'theta';
      
      let targetHz = 6;
      if (seedTone.target_hz || seedTone.targetHz) {
        targetHz = Number(seedTone.target_hz || seedTone.targetHz);
      } else {
        const stateDefaults = { delta: 3, theta: 6, alpha: 10, beta: 18 };
        targetHz = stateDefaults[targetState] || 6;
      }

      setCarrierFreq(baseFreq);
      setBeatFreq(targetHz);
    }
  }, [seedTone]);

  // Get active brain state classification from Hz
  const getBrainStateFromHz = (hz) => {
    if (hz >= 0.5 && hz <= 4) return 'delta';
    if (hz > 4 && hz <= 8) return 'theta';
    if (hz > 8 && hz <= 14) return 'alpha';
    if (hz > 14 && hz <= 30) return 'beta';
    return 'custom';
  };

  const activeBrainState = getBrainStateFromHz(beatFreq);

  const openImmersive = () => {
    setImmersiveSeed(normalizeOceanSeed());
    setIsImmersiveOpen(true);
  };
  const closeImmersive = useCallback(() => setIsImmersiveOpen(false), []);

  // Stop active audio nodes cleanly
  const stopAudioNodes = useCallback(() => {
    if (leftOscRef.current) {
      try { leftOscRef.current.stop(); } catch (err) {}
      try { leftOscRef.current.disconnect(); } catch (err) {}
      leftOscRef.current = null;
    }
    if (rightOscRef.current) {
      try { rightOscRef.current.stop(); } catch (err) {}
      try { rightOscRef.current.disconnect(); } catch (err) {}
      rightOscRef.current = null;
    }
    if (masterGainRef.current) {
      try { masterGainRef.current.disconnect(); } catch (err) {}
      masterGainRef.current = null;
    }
  }, []);

  // Launch live stereophonic Audio nodes
  const startAudio = async () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        setAudioError('Web Audio is not supported in this browser.');
        return;
      }

      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      const ctx = audioCtxRef.current && audioCtxRef.current.state !== 'closed'
        ? audioCtxRef.current
        : new AudioContextClass();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      if (ctx.state !== 'running') {
        throw new Error('The browser did not allow the audio context to start. Press Start preview again.');
      }

      stopAudioNodes();

      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      rightOsc.type = 'sine';

      leftOsc.frequency.setValueAtTime(carrierFreq, ctx.currentTime);
      rightOsc.frequency.setValueAtTime(carrierFreq + beatFreq, ctx.currentTime);

      // Stereo isolation channel merger
      const merger = ctx.createChannelMerger(2);
      leftOsc.connect(merger, 0, 0); // Route left oscillator to Left output
      rightOsc.connect(merger, 0, 1); // Route right oscillator to Right output

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

      setAudioError('');
      setIsPlaying(true);
    } catch (e) {
      console.error("Failed to start sound synth:", e);
      setIsPlaying(false);
      setAudioError(e.message || 'Preview could not start.');
    }
  };

  // Shut down synthesis engine cleanly with fade out
  const stopAudio = useCallback(() => {
    if (audioCtxRef.current && masterGainRef.current) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      try {
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
        masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.15);
      } catch (err) {}
    }
    stopTimerRef.current = setTimeout(() => {
      stopAudioNodes();
      setIsPlaying(false);
      stopTimerRef.current = null;
    }, 200);
  }, [stopAudioNodes]);

  const togglePower = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Track session timer ticks when online
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Monitor for session duration limits
  useEffect(() => {
    if (sessionTime >= maxDurationSec) {
      stopAudio();
      setShowLimitModal(true);
      setSessionTime(0);
    }
  }, [sessionTime, maxDurationSec, stopAudio]);

  // Keep oscillators dynamically tuned to slider values in real-time
  useEffect(() => {
    if (isPlaying && leftOscRef.current && rightOscRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      leftOscRef.current.frequency.linearRampToValueAtTime(carrierFreq, now + 0.05);
      rightOscRef.current.frequency.linearRampToValueAtTime(carrierFreq + beatFreq, now + 0.05);
    }
  }, [carrierFreq, beatFreq, isPlaying]);

  // Keep synth gain matching volume slider in real-time
  useEffect(() => {
    if (isPlaying && masterGainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      masterGainRef.current.gain.linearRampToValueAtTime(volume / 100, now + 0.05);
    }
  }, [volume, isPlaying]);

  // Make sure we stop everything on component unmount
  useEffect(() => {
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      stopAudioNodes();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, [stopAudioNodes]);

  // Format time (MM:SS) helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG mathematical sine wave generators
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
    <div className="workspace-live-controls space-y-6">
      {/* Tab Header Section */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Live control deck</p>
        <h2 className="text-3xl font-light text-white tracking-tight">Tune the moment in real time.</h2>
        <p className="max-w-3xl text-xs leading-relaxed text-zinc-400 font-light font-sans">
          Adjust the carrier, rhythm, and volume while the preview is running. Changes are applied continuously, so the listening cue does not need to pause.
        </p>
      </div>

      {/* Main Glassmorphic Interactive Synthesis Module */}
      <section className="bg-zinc-900/40 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.02)]">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Visualizer panel + Calibration sliders underneath */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Real-time Oscilloscope Panel */}
            <div className="space-y-4">
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Session pattern</p>
              <div className="border border-white/5 bg-black/60 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                
                {/* Left Ear Wave */}
                <div className="space-y-1 relative z-10">
                  <div className="flex justify-between text-[9px] font-mono text-cyan-400 uppercase tracking-widest">
                    <span>Left channel</span>
                    <span>{carrierFreq} Hz</span>
                  </div>
                  <svg className="w-full h-12 text-cyan-500/80" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <path d={getSinePath(carrierFreq, isPlaying ? 20 : 0.5, 1.2)} fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Right Ear Wave */}
                <div className="space-y-1 relative z-10">
                  <div className="flex justify-between text-[9px] font-mono text-purple-400 uppercase tracking-widest">
                    <span>Right channel</span>
                    <span>{carrierFreq + beatFreq} Hz</span>
                  </div>
                  <svg className="w-full h-12 text-purple-500/80" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <path d={getSinePath(carrierFreq + beatFreq, isPlaying ? 20 : 0.5, 1.3)} fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Center Glowing Differential Entrainment Wave */}
                <div className="space-y-1 pt-4 border-t border-white/5 relative z-10">
                  <div className="flex justify-between text-[9px] font-mono text-cyan-300 uppercase tracking-widest">
                    <span>Perceived rhythm</span>
                    <span className="font-bold">{beatFreq} Hz ({activeBrainState.toUpperCase()})</span>
                  </div>
                  <svg className="w-full h-16 text-cyan-300" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <filter id="glow-wave-workshop">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <path d={getEntrainmentPath(beatFreq, isPlaying ? 30 : 0, 0.4)} fill="none" stroke="currentColor" strokeWidth="2.5" filter="url(#glow-wave-workshop)" />
                  </svg>
                </div>

                {/* Ambient glow mesh */}
                <div className="absolute inset-0 bg-cyan-500/5 blur-[80px] pointer-events-none" />
              </div>
            </div>

            {/* Sliders Console (Under Visualizer UX) */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Session controls</p>
              
              {/* Base Carrier Frequency Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono uppercase text-white/40">
                  <span>Shared tone</span>
                  <span>{carrierFreq} Hz</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="400"
                  value={carrierFreq}
                  onChange={(e) => setCarrierFreq(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Binaural Beat Frequency Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono uppercase text-white/40">
                  <span>Rhythm</span>
                  <span>{beatFreq} Hz</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={beatFreq}
                  onChange={(e) => setBeatFreq(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Master volume slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono uppercase text-white/40">
                  <span>Master Volume</span>
                  <span>{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

            </div>

            {/* Active spec display under sliders */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
              <Activity className="size-4 text-cyan-400 shrink-0" />
              <p className="text-[9px] font-mono uppercase tracking-wider text-white/60">
                Current listening cue: {beatFreq} Hz
              </p>
            </div>

          </div>

          {/* Right Column: Hardware toggle + state baseline presets */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Power Switch Toggle */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Preview</p>
              <button
                onClick={() => void togglePower()}
                className={`w-full py-3.5 px-6 rounded-2xl font-mono text-xs uppercase tracking-[0.2em] font-bold border transition-all flex items-center justify-center gap-3 ${
                  isPlaying
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:bg-cyan-500/20'
                    : 'bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300'
                }`}
              >
                <Power className={`size-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                <span>{isPlaying ? 'Stop preview' : 'Start preview'}</span>
              </button>
              {audioError && <p className="mt-2 rounded-xl border border-[#d7b6a8] bg-[#fbf1ed] px-3 py-2 text-xs text-[#8a5f4b]" role="alert">{audioError}</p>}
            </div>

            <div className="workspace-glass-card rounded-2xl p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Change the scene</p>
              <p className="mt-2 text-xs leading-5 text-white/55">Open a seeded ocean that follows these controls while your tone keeps playing.</p>
              <button
                type="button"
                onClick={openImmersive}
                data-testid="immersive-mode-button"
                className="workspace-glass-button workspace-glass-button--primary mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-medium"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">waves</span>
                Immersive mode
              </button>
            </div>

            {/* Dynamic Countdown Clock */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2 select-none">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                <span className="text-zinc-500">Session time</span>
                <span className={isPlaying ? "text-cyan-400 font-bold animate-pulse text-[9px]" : "text-zinc-600 text-[9px]"}>
                  {isPlaying ? "PLAYING" : "READY"}
                </span>
              </div>
              
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-mono font-bold tracking-tight text-white">
                  {formatTime(maxDurationSec - sessionTime)}
                </span>
                <span className="text-zinc-600 font-mono text-[9px] uppercase tracking-wide">
                  / 1h limit
                </span>
              </div>

              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 bg-purple-500"
                  style={{ width: `${(sessionTime / maxDurationSec) * 100}%` }}
                />
              </div>
            </div>

            {/* State presets */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Listening directions</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'delta', label: 'Delta', hz: 3, range: '0.5 - 4 Hz' },
                  { id: 'theta', label: 'Theta', hz: 6, range: '4 - 8 Hz' },
                  { id: 'alpha', label: 'Alpha', hz: 10, range: '8 - 14 Hz' },
                  { id: 'beta', label: 'Beta', hz: 18, range: '14 - 30 Hz' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setBeatFreq(s.hz);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeBrainState === s.id
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                        : 'bg-zinc-950/60 border-white/5 text-white/50 hover:border-white/10 hover:text-white/80'
                    }`}
                  >
                    <p className="text-xs font-bold tracking-tight">{s.label}</p>
                    <p className="text-[8px] font-mono text-white/30 mt-0.5 uppercase tracking-wide">{s.range}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Session Limit Modal */}
      {showLimitModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <Card className="relative max-w-md w-full bg-zinc-900/90 border border-white/10 rounded-[2.5rem] p-8 space-y-6 text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
      <div className="absolute top-0 right-0 w-[150px] h-[80px] bg-cyan-500/10 blur-[30px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[120px] h-[80px] bg-purple-500/10 blur-[30px] pointer-events-none" />
            
      <div className="mx-auto size-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
        <Zap className="size-6 animate-pulse" />
      </div>

      <div className="space-y-3 text-left">
        <h3 className="text-2xl font-light text-white tracking-tight text-center">Session complete</h3>
        <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">
          You have completed a full 60-minute session. Take a short rest before starting another one.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => setShowLimitModal(false)}
          className="w-full py-3.5 px-4 rounded-xl bg-white/10 border border-white/10 text-white font-mono text-[10px] uppercase tracking-wider hover:bg-white/20 transition-all"
        >
          Close
        </button>
      </div>
      </Card>
      </div>
      )}

      <ImmersiveOceanMode
        open={isImmersiveOpen}
        seed={immersiveSeed}
        controls={{ carrierFreq, beatFreq, volume, brainState: activeBrainState }}
        onClose={closeImmersive}
      />
    </div>
  );
}
