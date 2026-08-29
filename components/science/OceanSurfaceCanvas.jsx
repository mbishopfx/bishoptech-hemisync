'use client';

import { useEffect, useRef } from 'react';

/**
 * A lightweight, self-contained ocean surface visual for the science guide.
 * It is intentionally decorative: the guide remains readable if canvas is
 * unavailable, and reduced-motion users receive a still frame.
 */
export function OceanSurfaceCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let width = 0;
    let height = 0;
    let devicePixelRatio = 1;
    let animationFrame = 0;
    let disposed = false;
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const draw = (timestamp = 0) => {
      if (disposed || !width || !height) return;

      const time = timestamp * 0.00024;
      const horizon = height * 0.34;
      const sky = context.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#102923');
      sky.addColorStop(0.35, '#1c473d');
      sky.addColorStop(0.56, '#1e594c');
      sky.addColorStop(1, '#0b2421');
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);

      const horizonGlow = context.createRadialGradient(width * 0.52, horizon, 0, width * 0.52, horizon, width * 0.62);
      horizonGlow.addColorStop(0, 'rgba(188, 232, 211, 0.32)');
      horizonGlow.addColorStop(0.35, 'rgba(119, 196, 170, 0.13)');
      horizonGlow.addColorStop(1, 'rgba(119, 196, 170, 0)');
      context.fillStyle = horizonGlow;
      context.fillRect(0, 0, width, height);

      context.save();
      context.globalCompositeOperation = 'screen';
      for (let layer = 0; layer < 9; layer += 1) {
        const depth = layer / 8;
        const baseline = horizon + height * (0.035 + depth * 0.62);
        const amplitude = 3 + (1 - depth) * Math.min(16, height * 0.035);
        const wavelength = 120 + depth * 170;
        const speed = 0.52 + depth * 0.48;

        context.beginPath();
        for (let x = -24; x <= width + 24; x += 10) {
          const primary = Math.sin(x / wavelength + time * speed + layer * 0.72) * amplitude;
          const secondary = Math.sin(x / (wavelength * 0.47) - time * (speed * 0.7) + layer) * amplitude * 0.28;
          const y = baseline + primary + secondary;
          if (x === -24) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = `rgba(190, 235, 216, ${0.2 - depth * 0.012})`;
        context.lineWidth = depth < 0.45 ? 1.15 : 0.75;
        context.stroke();
      }

      for (let shimmer = 0; shimmer < 24; shimmer += 1) {
        const x = ((shimmer * 97) % 113) / 113 * width;
        const drift = Math.sin(time * 0.8 + shimmer * 1.9) * 22;
        const y = horizon + height * (0.12 + ((shimmer * 0.071) % 0.62));
        const length = 5 + ((shimmer * 13) % 18);
        context.beginPath();
        context.moveTo(x + drift, y);
        context.lineTo(x + drift + 2, y + length);
        context.strokeStyle = `rgba(216, 245, 230, ${0.035 + ((shimmer % 4) * 0.012)})`;
        context.lineWidth = 1;
        context.stroke();
      }
      context.restore();

      const vignette = context.createRadialGradient(width * 0.5, height * 0.4, height * 0.12, width * 0.5, height * 0.45, Math.max(width, height) * 0.75);
      vignette.addColorStop(0, 'rgba(5, 18, 15, 0)');
      vignette.addColorStop(1, 'rgba(4, 15, 13, 0.52)');
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);
    };

    const animate = (timestamp) => {
      draw(timestamp);
      if (!disposed && !motionQuery?.matches) animationFrame = window.requestAnimationFrame(animate);
    };

    const restartMotion = () => {
      window.cancelAnimationFrame(animationFrame);
      draw(performance.now());
      if (!disposed && !motionQuery?.matches) animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    restartMotion();
    window.addEventListener('resize', resize);
    if (motionQuery?.addEventListener) motionQuery.addEventListener('change', restartMotion);
    else motionQuery?.addListener?.(restartMotion);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      if (motionQuery?.removeEventListener) motionQuery.removeEventListener('change', restartMotion);
      else motionQuery?.removeListener?.(restartMotion);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="science-ocean-canvas"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
