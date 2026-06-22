'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Cpu, Lock, Eye, ArrowRight, FileText, Activity, AlertTriangle, Play, HelpCircle, Check, Power } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { buildAbsoluteUrl } from '@/lib/seo';

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
      {/* Sharp square terminal box (no rounded border style) */}
      <div className="relative size-11 border border-white/10 bg-zinc-950/60 flex items-center justify-center transition-all duration-300 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-none shrink-0">
        {/* Animated matrix line scanner */}
        <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent top-0 animate-[bounce_2s_infinite] pointer-events-none opacity-0 group-hover:opacity-100" />
        <IconComponent className={`size-[18px] ${colorClass} group-hover:text-cyan-400 transition-colors duration-300`} />
      </div>

      {/* Cyber animated bracket text */}
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

export default function MachinePage() {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  // Real-time Synthesizer States
  const [isPlaying, setIsPlaying] = useState(false);
  const [carrierFreq, setCarrierFreq] = useState(200);
  const [targetState, setTargetState] = useState('theta'); // delta, theta, alpha, beta
  const [beatFreq, setBeatFreq] = useState(6);
  const [volume, setVolume] = useState(80);
  const [time, setTime] = useState(0);

  // Demo Limits
  const maxDurationSec = 120; // 2 minutes trial limit
  const [sessionTime, setSessionTime] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const audioCtxRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);
  const masterGainRef = useRef(null);

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

  const handleStateSelect = (state, hz) => {
    setTargetState(state);
    setBeatFreq(hz);
  };

  // Clean up active sound synthesis nodes
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

  // Start sound synthesis
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

      // Stereo isolated merger
      const merger = ctx.createChannelMerger(2);
      leftOsc.connect(merger, 0, 0); // Left channel
      rightOsc.connect(merger, 0, 1); // Right channel

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
    } catch (e) {
      console.error("Failed to start demonstration synthesizer:", e);
    }
  };

  // Fade out and stop synthesizer
  const stopAudio = useCallback(() => {
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
  }, []);

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

  // Monitor for session duration limits (2-minute trial limit)
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
      stopAudioNodes();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const machineJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Inside the Machine | Cognistration',
    url: buildAbsoluteUrl('/machine'),
    description: 'A product and system overview for Cognistration’s listening and generation workflow.'
  };

  // Mathematical sine generator for drawing vector waves in real time
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
      const envelope = Math.sin(x * 0.015); // visual envelope
      const y = height / 2 + Math.sin((x * freq * 0.08) - (time * speedMultiplier * 1.2)) * amp * envelope;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(machineJsonLd) }}
      />
      <PublicHeader />

      {/* Background Cyber-Grid Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 cyber-grid opacity-20" />
      </div>

      {/* Easter Egg Overlay */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black flex items-center justify-center p-10 cursor-pointer"
            onClick={() => setShowEasterEgg(false)}
          >
            <div className="text-center space-y-8 max-w-2xl">
              <motion.h2 
              animate={{ 
                color: ['#06B6D4', '#ffffff', '#06B6D4'],
                textShadow: ['0 0 20px #06B6D4', '0 0 0px #ffffff', '0 0 20px #06B6D4']
              }}
              transition={{ duration: 0.1, repeat: Infinity }}
              className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic"
              >
              CONCEPTUAL DEMO
              </motion.h2>
              <p className="text-white/40 font-mono text-sm leading-relaxed">
              This page visualizes a binaural-style listening setup and a set of control surfaces for the product experience. It is an illustrative demo, not a medical or neurological claim.
              </p>
              <div className="flex justify-center gap-4 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                <span>[ REDACTED ]</span>
                <span>[ DECLASSIFIED ]</span>
                <span>[ DEPLOYED ]</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-40 pb-40 px-6 relative z-10 max-w-6xl mx-auto">
        {/* Title and Intro */}
        <section className="text-center space-y-6 max-w-3xl mx-auto mb-20">
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Neuro-Acoustic Engine</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter">Inside the Machine.</h1>
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light font-sans">
            This page presents a visual explanation of the audio experience and the controls that shape it. It is designed to stay clear, calm, and easy to understand.
          </p>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.35em] text-white/25">
            Illustrative only — not medical advice, diagnosis, or a guaranteed outcome.
          </p>
        </section>

        <section className="bg-zinc-900/40 border border-white/5 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 mb-32 shadow-[0_0_50px_rgba(6,182,212,0.02)]">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* Visualizer Waves & Sliders Console (Left Column) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Visualizer Oscilloscope */}
              <div className="space-y-4">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Real-time Auditory Oscillations</p>
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

                  {/* Center Entrained Wave */}
                  <div className="space-y-1 pt-4 border-t border-white/5 relative z-10">
                    <div className="flex justify-between text-[9px] font-mono text-cyan-300 uppercase tracking-widest">
                      <span>Binaural Differential Entrainment (R - L)</span>
                      <span className="font-bold">{beatFreq} Hz ({targetState.toUpperCase()})</span>
                    </div>
                    <svg className="w-full h-16 text-cyan-300" viewBox="0 0 400 100" preserveAspectRatio="none">
                      <defs>
                        <filter id="glow-wave">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <path d={getEntrainmentPath(beatFreq, isPlaying ? 30 : 0, 0.4)} fill="none" stroke="currentColor" strokeWidth="2.5" filter="url(#glow-wave)" />
                    </svg>
                  </div>

                  {/* Ambient static blur */}
                  <div className="absolute inset-0 bg-cyan-500/5 blur-[80px] pointer-events-none" />
                </div>
              </div>

              {/* Sliders Console (Under Visualizer UX) */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Signal Calibration Controls</p>

                {/* Carrier Slider */}
                <div className="space-y-1">
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
                  <p className="text-[9.5px] font-mono text-white/20 uppercase tracking-widest leading-normal mt-1">
                  Lower carriers can feel softer and more relaxed, while higher carriers may feel more active and crisp. The labels are descriptive, not clinical.
                  </p>
                </div>

                {/* Master volume slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-white/40">
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

              {/* Bottom active spec display */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <Activity className="size-5 text-cyan-400 shrink-0" />
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                  R - L DIFFERENCE REFLECTS THE SELECTED DEMO STATE: {beatFreq}Hz
                </p>
              </div>

            </div>

            {/* Controller Controls (Right Column) */}
            <div className="lg:col-span-5 space-y-6">
              
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
                  <span>Power: {isPlaying ? 'ONLINE' : 'OFFLINE'}</span>
                </button>
              </div>

              {/* Countdown Progress Card */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2 select-none">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                  <span className="text-zinc-500">Demo Calibration Session</span>
                  <span className={isPlaying ? "text-cyan-400 font-bold animate-pulse text-[9px]" : "text-zinc-600 text-[9px]"}>
                    {isPlaying ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
                
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-mono font-bold tracking-tight text-white">
                    {formatTime(maxDurationSec - sessionTime)}
                  </span>
                  <span className="text-zinc-600 font-mono text-[9px] uppercase tracking-wide">
                    / 2m limit
                  </span>
                </div>

                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-1000"
                    style={{ width: `${(sessionTime / maxDurationSec) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-6 pt-2">
                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Target Demo States</p>
                  <h3 className="text-3xl font-light text-white tracking-tight">Select Target State.</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-light">
                    Adjust the target frequency below to see how the visual state changes. The controls are for demonstration and exploration, not diagnosis or treatment.
                  </p>
                </div>

                {/* State selector buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'delta', label: 'Delta', hz: 3, range: '0.5 - 4 Hz (Restoration)' },
                    { id: 'theta', label: 'Theta', hz: 6, range: '4 - 8 Hz (Dream/Breakthrough)' },
                    { id: 'alpha', label: 'Alpha', hz: 10, range: '8 - 14 Hz (Calm Flow)' },
                    { id: 'beta', label: 'Beta', hz: 18, range: '14 - 30 Hz (Analytical Focus)' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStateSelect(s.id, s.hz)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        targetState === s.id
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                          : 'bg-zinc-950/60 border-white/5 text-white/50 hover:border-white/10 hover:text-white/80'
                      }`}
                    >
                      <p className="text-sm font-bold tracking-tight">{s.label}</p>
                      <p className="text-[9px] font-mono text-white/30 mt-1 uppercase tracking-wide">{s.range}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Demo Limit Modal */}
        {showLimitModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="relative max-w-md w-full bg-zinc-900/90 border border-white/10 rounded-[2.5rem] p-8 space-y-6 text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[80px] bg-cyan-500/10 blur-[30px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[120px] h-[80px] bg-purple-500/10 blur-[30px] pointer-events-none" />
              
              <div className="mx-auto size-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Zap className="size-6 animate-pulse" />
              </div>

              <div className="space-y-3 text-left">
                <h3 className="text-2xl font-light text-white tracking-tight text-center">2-Minute Trial Complete</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">
                  <strong>Cognistration</strong> trial calibration. Sign up for a free account to unlock <strong>5-minute sessions</strong>, or get a Premium membership for <strong>unrestricted 1-hour sessions</strong> and custom blueprints!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/signup"
                  className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 text-black font-mono text-[10px] uppercase tracking-wider font-bold hover:bg-cyan-400 transition-all text-center block"
                >
                  Initialize Free Account
                </Link>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/5 text-zinc-400 font-mono text-[10px] uppercase tracking-wider hover:text-white hover:bg-white/10 transition-all"
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Anatomical Science Section */}
        <section className="space-y-16 mb-40">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Listening Model</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight">How the audio experience is organized.</h2>
            <p className="text-white/40 text-sm leading-relaxed font-light">
              How careful timing, comfort, and repetition shape the listening experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-colors">
              <UnicodeCyberBadge icon={Cpu} index={0} colorClass="text-cyan-400 animate-pulse" />
              <h3 className="text-xl font-medium mb-3">Stereo Timing Model</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                This card shows how two channels can be compared side by side. It is a visual explanation of the listening setup, not a scientific claim.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-colors">
              <UnicodeCyberBadge icon={Zap} index={1} colorClass="text-purple-400" />
              <h3 className="text-xl font-medium mb-3">Rhythm Visualization</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                The visual rhythm helps illustrate how the experience feels over time. The wording is descriptive and intentionally non-clinical.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-colors">
              <UnicodeCyberBadge icon={Activity} index={2} colorClass="text-cyan-400" />
              <h3 className="text-xl font-medium mb-3">Pattern Overview</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                The control labels group the demo into familiar listening states. They help orient the interface without making medical or performance claims.
              </p>
            </div>
          </div>
        </section>

        {/* Research and Documentation */}
        <section className="grid md:grid-cols-2 gap-16 items-center mb-40 border-t border-white/5 pt-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-white/50 text-[10px] font-mono tracking-widest uppercase">
              <Lock className="size-3" /> Background Reading
            </div>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight">Public research and practical context.</h2>
            <p className="text-white/50 leading-relaxed text-sm font-light">
              This product is informed by public research on rhythm, perception, and listening habits. It is meant to stay clear, useful, and easy to understand.
            </p>
            <p className="text-white/50 leading-relaxed text-sm font-light">
              We keep the framing conservative: calm sessions can support a steadier routine, but the experience varies by person, setting, and use case.
            </p>
            <div className="space-y-3">
              <a 
                href="https://www.cia.gov/readingroom/docs/cia-rdp96-00788r001700210023-7.pdf" 
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-xs group uppercase font-mono tracking-wider"
              >
                View background reading <FileText className="size-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                Source: public research and product documentation.
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/30 rounded-[3rem] p-10 md:p-12 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <h3 className="text-xl font-medium text-white tracking-tight mb-6">Reference Points</h3>
            <div className="space-y-6">
              {[
                { title: 'Rhythm and attention', desc: 'Rhythmic audio is often used to create a steadier listening environment and a more intentional routine.' },
                { title: 'Comfort and consistency', desc: 'Short, repeatable sessions tend to feel easier to return to than noisy, overcomplicated rituals.' },
                { title: 'Listening context', desc: 'Volume, timing, and environment matter a lot in how any audio session is experienced.' },
                { title: 'Careful framing', desc: 'The best product copy stays specific, calm, and honest about what a session can and cannot do.' }
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

        {/* Responsibility and Safety Deck */}
        <section className="bg-zinc-900/30 rounded-[3rem] border border-red-500/20 p-10 md:p-12 relative overflow-hidden mb-32">
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
              Audio tools should be used thoughtfully. To keep the experience comfortable and predictable, follow these simple safety guidelines:
            </p>

            <div className="grid md:grid-cols-2 gap-8 pt-4">
              
              {/* Warning 1 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/90">Epilepsy & seizure history</h4>
                <p className="text-xs text-white/40 leading-relaxed font-light">
                  If you have a history of seizures or sound sensitivity, check with a clinician before using the product.
                </p>
              </div>

              {/* Warning 2 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/90">Avoid driving or demanding tasks</h4>
                <p className="text-xs text-white/40 leading-relaxed font-light">
                  Listen only when you can relax and pay attention to the session. Do not use it while driving or doing anything that needs full focus.
                </p>
              </div>

              {/* Warning 3 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/90">Keep the volume comfortable</h4>
                <p className="text-xs text-white/40 leading-relaxed font-light">
                  The audio should be easy to listen to. If it feels loud or tiring, turn it down.
                </p>
              </div>

              {/* Warning 4 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/90">Start with shorter sessions</h4>
                <p className="text-xs text-white/40 leading-relaxed font-light">
                  Start with short sessions and build from there. It is usually easier to learn what works when you keep the first few runs simple.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Secret Easter Egg Link */}
        <div className="flex justify-center mb-40">
           <button 
              onClick={() => setShowEasterEgg(true)}
              className="px-6 py-2 rounded-full border border-white/5 text-[10px] font-mono text-white/10 hover:text-cyan-500/50 hover:border-cyan-500/20 transition-all uppercase tracking-[0.4em]"
            >
              Access_Protocol_96
            </button>
        </div>

        {/* Closing CTA */}
        <section className="text-center py-20 bg-zinc-900/30 rounded-[4rem] border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Image 
              src="/images/logo.png" 
              alt="Cognistration Logo" 
              width={80} 
              height={80} 
              className="mx-auto animate-pulse"
            />
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter">Explore the demo gently.</h2>
            <p className="text-white/40 text-sm max-w-sm mx-auto font-light leading-relaxed">
              Set your headphones, choose a comfortable volume, and use the controls at your own pace.
            </p>
          </motion.div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10 max-w-xs mx-auto sm:max-w-none">
            <Link 
              href="/signup" 
              className="px-10 py-4 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group text-sm"
            >
              Initialize Sequence <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/pricing" 
              className="px-10 py-4 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center text-sm"
            >
              Explore Tiers
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>Secured Node</span>
            <span>Cognistration Console v1.0.5</span>
          </div>
          <div className="flex flex-wrap gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/health-warning" className="hover:text-white transition-colors">Health Warning</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <span>&copy; 2026 Cognistration.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
