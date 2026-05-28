import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Zap, Cpu, Lock, FileText, Activity, AlertTriangle, Power } from 'lucide-react';

function UnicodeCyberBadge({ icon: IconComponent, index, colorClass }) {
  const [frameChar, setFrameChar] = useState('■');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setFrameChar('■');
      return;
    }

    const chars = ['▖', '▘', '▝', '▗'];
    let idx = 0;
    const interval = setInterval(() => {
      setFrameChar(chars[idx]);
      idx = (idx + 1) % chars.length;
    }, 150);

    return () => clearInterval(interval);
  }, [isHovered]);

  const statusCodes = [
    'STEM_DECODE',
    'HEMI_LOCK',
    'THALA_GATE'
  ];

  return (
    <div 
      className="flex items-center gap-3.5 mb-6 select-none font-mono text-xs"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative size-11 border border-white/10 bg-zinc-950/60 flex items-center justify-center transition-all duration-300 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-none shrink-0">
        <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent top-0 animate-[bounce_2s_infinite] pointer-events-none opacity-0 group-hover:opacity-100" />
        <IconComponent className={`size-[18px] ${colorClass} group-hover:text-cyan-400 transition-colors duration-300`} />
      </div>

      <div className="flex flex-col justify-center overflow-hidden">
        <div className="flex items-center gap-1.5 text-zinc-500 group-hover:text-cyan-500/60 transition-colors duration-300 text-[10px]">
          <span className="text-cyan-500/30 group-hover:animate-pulse">▶</span>
          <span>[</span>
          <span className="text-white/80 font-bold group-hover:text-cyan-400 transition-colors">{frameChar}</span>
          <span className="font-semibold tracking-wider">{statusCodes[index] || 'SYS_OK'}</span>
          <span>]</span>
        </div>
        <span className="text-[7.5px] text-zinc-600 tracking-[0.25em] uppercase mt-0.5 group-hover:text-cyan-400/30 transition-colors">
          core_processor_0{index + 1}
        </span>
      </div>
    </div>
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
  onStartGenerate,
  profile,
  library = []
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [carrierFreq, setCarrierFreq] = useState(200);
  const [beatFreq, setBeatFreq] = useState(6);
  const [volume, setVolume] = useState(80);
  const [time, setTime] = useState(0);

  const audioCtxRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);
  const masterGainRef = useRef(null);

  // Time ticker loop for smooth vector wave animations
  useEffect(() => {
    let frame;
    const tick = () => {
      // Keep ticker going at full speed if playing, else standstill
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

  // Stop active audio nodes cleanly
  const stopAudioNodes = () => {
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
  };

  // Launch live stereophonic Audio nodes
  const startAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        alert("Web Audio API is not supported in this browser.");
        return;
      }

      const ctx = audioCtxRef.current || new AudioContextClass();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
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
      // Linear ramp to avoid audio pop clicks on click
      masterGain.gain.linearRampToValueAtTime(volume / 100, ctx.currentTime + 0.15);

      merger.connect(masterGain);
      masterGain.connect(ctx.destination);

      leftOsc.start();
      rightOsc.start();

      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;
      masterGainRef.current = masterGain;

      setIsPlaying(true);
    } catch (e) {
      console.error("Failed to start sound synth:", e);
    }
  };

  // Shut down synthesis engine cleanly with fade out
  const stopAudio = () => {
    if (audioCtxRef.current && masterGainRef.current) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      try {
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
        masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.15);
      } catch (err) {}
    }
    setTimeout(() => {
      stopAudioNodes();
      setIsPlaying(false);
    }, 200);
  };

  const togglePower = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Keep oscillators dynamically tuned to slider values in real-time
  useEffect(() => {
    if (isPlaying && leftOscRef.current && rightOscRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      // Smooth frequency ramp to prevent auditory digital jitter clicks
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
      stopAudioNodes();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

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
    <div className="space-y-8 pb-12">
      {/* Tab Header Section */}
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Acoustic Console</p>
          <h2 className="mt-2 text-4xl font-light text-white tracking-tight">Hemispheric Sync Workshop</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 font-light font-sans">
            Calibrate stereophonic phase shifts and carrier baselines in real-time. Plug in your stereo headphones, power on the synthesis console, and tune your brain state baselines dynamically.
          </p>
        </div>
      </div>

      {/* Main Glassmorphic Interactive Synthesis Module */}
      <section className="bg-zinc-900/40 border border-white/5 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-[0_0_50px_rgba(6,182,212,0.02)]">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Real-time Oscilloscope Panel */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
            <div>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mb-2">Real-time Auditory Oscillations</p>
              <div className="border border-white/5 bg-black/60 rounded-2xl p-6 space-y-6 relative overflow-hidden">
                
                {/* Left Ear Wave */}
                <div className="space-y-1 relative z-10">
                  <div className="flex justify-between text-[9px] font-mono text-cyan-400 uppercase tracking-widest">
                    <span>Left Ear Carrier (L)</span>
                    <span>{carrierFreq} Hz</span>
                  </div>
                  <svg className="w-full h-12 text-cyan-500/80" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <path d={getSinePath(carrierFreq, isPlaying ? 20 : 0.5, 1.2)} fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Right Ear Wave */}
                <div className="space-y-1 relative z-10">
                  <div className="flex justify-between text-[9px] font-mono text-purple-400 uppercase tracking-widest">
                    <span>Right Ear Carrier (R)</span>
                    <span>{carrierFreq + beatFreq} Hz</span>
                  </div>
                  <svg className="w-full h-12 text-purple-500/80" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <path d={getSinePath(carrierFreq + beatFreq, isPlaying ? 20 : 0.5, 1.3)} fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Center Glowing Differential Entrainment Wave */}
                <div className="space-y-1 pt-4 border-t border-white/5 relative z-10">
                  <div className="flex justify-between text-[9px] font-mono text-cyan-300 uppercase tracking-widest">
                    <span>Binaural Differential Entrainment (R - L)</span>
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
          </div>

          {/* Synth Interface Controllers */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              
              {/* Power Switch Toggle */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Hardware Interface</p>
                <button
                  onClick={togglePower}
                  className={`w-full py-4 px-6 rounded-2xl font-mono text-xs uppercase tracking-[0.2em] font-bold border transition-all flex items-center justify-center gap-3 ${
                    isPlaying
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:bg-cyan-500/20'
                      : 'bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300'
                  }`}
                >
                  <Power className={`size-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                  <span>Power: {isPlaying ? 'ONLINE / TRANSMITTING' : 'OFFLINE'}</span>
                </button>
              </div>

              {/* State presets */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Target Baselines</p>
                <h3 className="text-2xl font-light text-white tracking-tight">Select Target State.</h3>
                <p className="text-xs text-white/40 leading-relaxed font-light font-sans">
                  Choose a preset target baseline or manually adjust the differential slider. Look at how the entrainment wave speeds up or slows down to match your frequency.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'delta', label: 'Delta', hz: 3, range: '0.5 - 4 Hz (Restoration)' },
                  { id: 'theta', label: 'Theta', hz: 6, range: '4 - 8 Hz (Dream/Breakthrough)' },
                  { id: 'alpha', label: 'Alpha', hz: 10, range: '8 - 14 Hz (Calm Flow)' },
                  { id: 'beta', label: 'Beta', hz: 18, range: '14 - 30 Hz (Analytical Focus)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setBeatFreq(s.hz);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      activeBrainState === s.id
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                        : 'bg-zinc-950/60 border-white/5 text-white/50 hover:border-white/10 hover:text-white/80'
                    }`}
                  >
                    <p className="text-sm font-bold tracking-tight">{s.label}</p>
                    <p className="text-[9px] font-mono text-white/30 mt-1 uppercase tracking-wide">{s.range}</p>
                  </button>
                ))}
              </div>

              {/* Sliders Console */}
              <div className="space-y-5 pt-4 border-t border-white/5">
                
                {/* Base Carrier Frequency Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-white/40">
                    <span>Base Carrier Frequency</span>
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
                  <p className="text-[9.5px] font-mono text-white/20 uppercase tracking-widest leading-normal">
                    Low carriers (<span className="text-white/40">200Hz</span>) optimize Theta/Delta entrainment, while higher carriers facilitate logical focus.
                  </p>
                </div>

                {/* Binaural Beat Frequency Slider */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-white/40">
                    <span>Binaural Beat Frequency (Differential)</span>
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
                  <p className="text-[9.5px] font-mono text-white/20 uppercase tracking-widest leading-normal">
                    Tune the exact target brain wave differential speed in real-time.
                  </p>
                </div>

                {/* Master volume slider */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-white/40">
                    <span>Master Output Volume</span>
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

            </div>

            {/* Bottom active spec display */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
              <Activity className="size-5 text-cyan-400 shrink-0" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                R - L DIFFERENCE MATCHES TARGET EEG BASELINE: {beatFreq}Hz
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Science & Declassified Study sections exactly like /machine */}
      <section className="space-y-16 mt-20 pt-10 border-t border-white/5">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Physiological Blueprint</p>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">The Science of Entrainment.</h2>
          <p className="text-white/40 text-sm leading-relaxed font-light">
            How a simple difference in acoustic phase bypasses cognitive blockades and overrides default neural oscillation arrays.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-colors">
            <UnicodeCyberBadge icon={Cpu} index={0} colorClass="text-cyan-400 animate-pulse" />
            <h3 className="text-xl font-medium mb-3">Superior Olivary Complex</h3>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Auditory signals enter the ears and travel up the auditory nerve. They collide in the **Superior Olivary Complex (SOC)** within the brainstem—the first neurological station that processes stereo phase differences. If the phase difference oscillates persistently, the SOC translates it into a rhythmic signal.
            </p>
          </div>

          <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-colors">
            <UnicodeCyberBadge icon={Zap} index={1} colorClass="text-purple-400" />
            <h3 className="text-xl font-medium mb-3">Frequency-Following Response</h3>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              The auditory cortex picks up the rhythmic outputs of the SOC. Via the **Frequency-Following Response (FFR)**, the local sensory neural clusters align their firing frequencies with the external differential beat. The sensory cells synchronize, vibrating in unison with the virtual wave.
            </p>
          </div>

          <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-colors">
            <UnicodeCyberBadge icon={Activity} index={2} colorClass="text-cyan-400" />
            <h3 className="text-xl font-medium mb-3">Thalamocortical Locking</h3>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              The synchronized sensory signals target the **Thalamus**—the brain&apos;s master sensory relay pacemaker. The thalamus locks onto the frequency and propagates it throughout the neocortex, locking global EEG patterns into Alpha, Theta, Delta, or Beta ranges on a macro scale.
            </p>
          </div>
        </div>
      </section>

      {/* Clinical Evidence Deck */}
      <section className="grid md:grid-cols-2 gap-16 items-center mt-20 border-t border-white/5 pt-20">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-white/50 text-[10px] font-mono tracking-widest uppercase">
            <Lock className="size-3" /> Declassified Research
          </div>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">Clinical Evidence & Peer-Reviewed Proof.</h2>
          <p className="text-white/50 leading-relaxed text-sm font-light">
            Entrainment is not esoteric speculation—it is declassified and clinically documented. In 1983, the **CIA** released the **Gateway Process Analysis**, verifying that Hemispheric Synchronization is physically real.
          </p>
          <p className="text-white/50 leading-relaxed text-sm font-light">
            Modern clinical trials in neuroscience databases (such as systematic reviews in **PLOS ONE** and **Frontiers in Human Neuroscience**) have proven that binaural beats induce spectral EEG power spikes in targeted ranges. Studies show a **26% reduction in cognitive anxiety** and statistically significant increases in interhemispheric coherence under delta and theta loads.
          </p>
          <div className="space-y-3">
            <a 
              href="https://www.cia.gov/readingroom/docs/cia-rdp96-00788r001700210023-7.pdf" 
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-xs group uppercase font-mono tracking-wider"
            >
              View CIA-RDP96-00788R Gateway Memo <FileText className="size-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              Source: National Archives & Clinical Trials databases.
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 rounded-[3rem] p-10 md:p-12 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
          <h3 className="text-xl font-medium text-white tracking-tight mb-6">Peer-Reviewed Milestones</h3>
          <div className="space-y-6">
            {[
              { title: 'CIA Gateway Study (1983)', desc: 'Documented that alternate phase-shifted audio alters brain amplitude parameters, locking it into coherent trance states.' },
              { title: 'Frontiers in Human Neuroscience (2018)', desc: 'Confirmed via EEG spectral analytics that targeted theta beat loads significantly boost working memory recall and concentration.' },
              { title: 'PLOS ONE Meta-Analysis (2019)', desc: 'Conducted systematic review proving that binaural beat entrainment reduces pre-operative anxiety scores.' },
              { title: 'Monroe Institute Protocols', desc: 'Over 40 years of EEG data proving that hemispheric balance is achieved within 10 minutes of calibrated phase-shifting audio.' }
            ].map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="size-6 rounded-full bg-white/5 text-[10px] font-mono text-cyan-400 flex items-center justify-center shrink-0 border border-white/10">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-white/95">{item.title}</h4>
                  <p className="text-xs text-white/45 font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Warning Protocols */}
      <section className="bg-zinc-900/30 rounded-[3rem] border border-red-500/20 p-10 md:p-12 relative overflow-hidden mt-20">
        <div className="absolute inset-0 bg-red-500/5 blur-[80px] pointer-events-none" />
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-red-400 uppercase tracking-[0.4em]">Safety Protocol</p>
              <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-white mt-1">Responsible Freq Usage.</h3>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-white/50 font-light">
            Entrainment tools physically alter neural dynamics. To prevent auditory fatigue and protect biological systems, you must strictly follow these safety guidelines:
          </p>

          <div className="grid md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/90">Epilepsy & Seizure History</h4>
              <p className="text-xs text-white/40 leading-relaxed font-light">
                Individuals with a history of epilepsy, clinical seizures, or photic/auditory hyper-sensitivity should consult a neurologist before using HemiSync. Rhythmic acoustic frequencies drive high-amplitude brain waves that may act as sensory triggers.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/90">No Driving / Alert Motor Tasks</h4>
              <p className="text-xs text-white/40 leading-relaxed font-light">
                Delta and Theta frequency ranges induce severe physical relaxation, muscle dilation, and drowsiness (somatic damping). NEVER listen to these frequencies while driving, operating heavy machinery, or performing active motor coordination tasks.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/90">Hearing Conservation & Decibels</h4>
              <p className="text-xs text-white/40 leading-relaxed font-light">
                Entrainment occurs at the auditory pathway level; it does not require high volume. Keep carrier audio below 70-75dB (conversational level). High volume generates ear fatigue, hearing loss, and blocks olivary complex phase-locking.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/90">Gradual Session Baselines</h4>
              <p className="text-xs text-white/40 leading-relaxed font-light">
                Allow your central nervous system to adapt. Begin with shorter sessions (10 to 15 minutes) to let your superior olivary complex normalize the phase shifts. Do not exceed 60 minutes per continuous session to avoid cognitive over-stimulation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
