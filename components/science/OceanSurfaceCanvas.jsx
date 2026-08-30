'use client';

import { useEffect, useRef, useState } from 'react';
import { createRenderer } from './vgpu-ocean/renderer';

export function OceanSurfaceCanvas({ className = '', seed = null, onProfileChange }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('initializing');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    setStatus('initializing');
    setProfile(null);
    const renderer = createRenderer({
      canvas,
      seed,
      onReady: (nextProfile) => {
        setProfile(nextProfile);
        setStatus('live');
        onProfileChange?.(nextProfile);
      },
      onProfileChange,
      onError: () => setStatus('fallback')
    });

    return () => {
      renderer.dispose();
    };
  }, [onProfileChange, seed]);

  const statusLabel = status === 'live' ? 'live' : status === 'fallback' ? 'static fallback' : 'starting';

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} data-testid="science-ocean-canvas" data-webgpu-status={status}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-auto absolute inset-0 block h-full w-full touch-none"
      />
      <div className="pointer-events-none absolute left-5 top-5 z-[2] rounded-full border border-[#b6ddcc]/15 bg-[#10221d]/55 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/55 backdrop-blur-md" aria-live="polite">
        <span className="text-[#b6ddcc]">FFT ocean</span>
        <span className="mx-1.5 text-white/25">/</span>
        {statusLabel}
        {profile ? <span className="ml-2 text-white/35">run {profile.runLabel} · {profile.windSpeed.toFixed(1)} m/s · {profile.timeScale.toFixed(2)}×</span> : null}
      </div>
    </div>
  );
}
