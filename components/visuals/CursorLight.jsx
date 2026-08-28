'use client';

import { useEffect, useRef } from 'react';

const CURSOR_FLARE_SHADER = /* wgsl */ `
struct CursorParams {
  time: f32,
  pointer: vec2f,
  strength: f32,
  texel: vec2f,
};

@group(0) @binding(0) var<uniform> params: CursorParams;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let aspect = params.texel.y / max(params.texel.x, 0.0001);
  let delta = (uv - params.pointer) * vec2f(1.0, aspect);
  let distance = length(delta);
  let shimmer = 0.5 + 0.5 * sin(params.time * 1.8 + distance * 40.0);
  let glow = exp(-distance * distance / 0.08) * (0.08 + shimmer * 0.025);
  let ringRadius = 0.065 + sin(params.time * 0.9) * 0.004;
  let ring = exp(-abs(distance - ringRadius) * 90.0) * 0.055;
  let tail = exp(-abs(delta.y + sin(delta.x * 18.0 + params.time) * 0.018) * 32.0) * exp(-abs(delta.x) * 2.2) * 0.012;
  let intensity = clamp(params.strength, 0.0, 1.0);
  let color = vec3f(0.44, 0.83, 0.70) * glow
    + vec3f(0.96, 0.53, 0.36) * ring
    + vec3f(0.42, 0.74, 0.68) * tail;
  return vec4f(color * intensity, (glow + ring + tail) * intensity);
}
`;

function getSurface(target) {
  return target instanceof Element ? target.closest('[data-cursor-surface]') : null;
}

export function CursorLight() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0, active: 0 });
  const surfaceRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;

    if (!root || !canvas) return undefined;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = pointerRef.current;
    pointer.x = window.innerWidth * 0.5;
    pointer.y = window.innerHeight * 0.5;

    let rafId = null;
    let disposed = false;
    let gpu = null;
    let loop = null;
    let removeResizeListener = null;

    const paintPointer = () => {
      rafId = null;
      root.style.setProperty('--cursor-x', `${pointer.x}px`);
      root.style.setProperty('--cursor-y', `${pointer.y}px`);
      root.dataset.active = pointer.active ? 'true' : 'false';

      const surfaceElement = surfaceRef.current;
      if (surfaceElement && pointer.active) {
        const bounds = surfaceElement.getBoundingClientRect();
        const width = Math.max(bounds.width, 1);
        const height = Math.max(bounds.height, 1);
        surfaceElement.style.setProperty('--surface-pointer-x', `${((pointer.x - bounds.left) / width) * 100}%`);
        surfaceElement.style.setProperty('--surface-pointer-y', `${((pointer.y - bounds.top) / height) * 100}%`);
        surfaceElement.style.setProperty('--surface-pointer-alpha', '1');
      }
    };

    const requestPaint = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(paintPointer);
    };

    const handlePointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = 1;

      const nextSurface = getSurface(event.target);
      if (surfaceRef.current !== nextSurface) {
        surfaceRef.current?.style.setProperty('--surface-pointer-alpha', '0');
        surfaceRef.current = nextSurface;
      }

      requestPaint();
    };

    const clearPointer = () => {
      pointer.active = 0;
      surfaceRef.current?.style.setProperty('--surface-pointer-alpha', '0');
      surfaceRef.current = null;
      requestPaint();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', clearPointer);
    document.addEventListener('visibilitychange', clearPointer);
    requestPaint();

    const setupGpu = async () => {
      if (reducedMotionQuery.matches || !navigator.gpu) return;

      try {
        const { clock, effect, frameLoop, init, surface } = await import('vgpu');
        if (disposed) return;

        gpu = await init({ powerPreference: 'low-power', label: 'cognistration-cursor-light' });
        if (disposed) {
          gpu.dispose();
          return;
        }

        const canvasSurface = surface(gpu, canvas, {
          alphaMode: 'premultiplied',
          clearColor: [0, 0, 0, 0],
          dpr: [1, 1.5],
          label: 'cognistration-cursor-surface'
        });

        const flare = effect(gpu, CURSOR_FLARE_SHADER, {
          label: 'cognistration-cursor-flare',
          set: {
            params: {
              strength: 0,
              pointer: [0.5, 0.5],
              texel: canvasSurface.texelSize,
              time: 0
            }
          }
        });

        removeResizeListener = canvasSurface.onResize(() => {
          flare.set({ params: { texel: canvasSurface.texelSize } });
        });

        const time = clock(gpu);
        loop = frameLoop(gpu, (frame) => {
          const width = Math.max(window.innerWidth, 1);
          const height = Math.max(window.innerHeight, 1);
          flare.set({
            params: {
              strength: pointer.active,
              pointer: [pointer.x / width, 1 - pointer.y / height],
              texel: canvasSurface.texelSize,
              time: time.time
            }
          });
          frame.pass(canvasSurface, flare);
        });

        root.dataset.gpuActive = 'true';
      } catch {
        root.dataset.gpuActive = 'false';
      }
    };

    setupGpu();

    return () => {
      disposed = true;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', clearPointer);
      document.removeEventListener('visibilitychange', clearPointer);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      removeResizeListener?.();
      loop?.stop();
      if (gpu && !gpu.disposed) gpu.dispose();
      surfaceRef.current?.style.setProperty('--surface-pointer-alpha', '0');
      surfaceRef.current = null;
    };
  }, []);

  return (
    <div ref={rootRef} className="cursor-light-root" aria-hidden="true">
      <div className="cursor-light-fallback" />
      <div className="cursor-light-haze" />
      <canvas ref={canvasRef} className="cursor-light-canvas" />
    </div>
  );
}
