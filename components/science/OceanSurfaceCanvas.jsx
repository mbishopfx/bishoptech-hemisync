'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createRenderer } from './vgpu-ocean/renderer';

export function OceanSurfaceCanvas({ className = '', seed = null, profile = null, onProfileChange, onStatusChange }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const initialProfileRef = useRef(profile);
  const onProfileChangeRef = useRef(onProfileChange);
  const onStatusChangeRef = useRef(onStatusChange);
  const [status, setStatus] = useState('initializing');

  initialProfileRef.current = profile;
  onProfileChangeRef.current = onProfileChange;
  onStatusChangeRef.current = onStatusChange;

  const updateStatus = useCallback((nextStatus) => {
    setStatus(nextStatus);
    onStatusChangeRef.current?.(nextStatus);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    updateStatus('initializing');
    const renderer = createRenderer({
      canvas,
      seed,
      profile: initialProfileRef.current,
      onReady: (nextProfile) => {
        updateStatus('live');
        onProfileChangeRef.current?.(nextProfile);
      },
      onProfileChange: (nextProfile) => onProfileChangeRef.current?.(nextProfile),
      onError: () => updateStatus('fallback')
    });
    rendererRef.current = renderer;

    return () => {
      rendererRef.current = null;
      renderer.dispose();
    };
  // The seed starts a new ocean run. Callback refs keep parent renders from
  // tearing down the GPU scene while the controls are being adjusted.
  }, [seed, updateStatus]);

  useEffect(() => {
    rendererRef.current?.updateProfile?.(profile);
  }, [profile]);

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
