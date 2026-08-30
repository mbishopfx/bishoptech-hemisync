'use client';

import { useEffect, useRef, useState } from 'react';
import { createRenderer } from './vgpu-ocean/renderer';

export function OceanSurfaceCanvas({ className = '', seed = null, onProfileChange }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('initializing');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    setStatus('initializing');
    const renderer = createRenderer({
      canvas,
      seed,
      onReady: (nextProfile) => {
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

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} data-testid="science-ocean-canvas" data-webgpu-status={status}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-auto absolute inset-0 block h-full w-full touch-none"
      />
      <span className="sr-only" role="status" aria-live="polite">{status === 'live' ? 'Ocean visual ready' : status === 'fallback' ? 'Ocean visual using a static fallback' : 'Ocean visual loading'}</span>
    </div>
  );
}
