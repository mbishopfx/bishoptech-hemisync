'use client';

import { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;
const GROUPS = [
  {
    fill: 'rgba(105, 231, 255, 0.72)',
    stroke: 'rgba(214, 251, 255, 0.88)',
  },
  {
    fill: 'rgba(177, 132, 255, 0.62)',
    stroke: 'rgba(235, 221, 255, 0.82)',
  },
  {
    fill: 'rgba(255, 125, 196, 0.56)',
    stroke: 'rgba(255, 218, 239, 0.78)',
  },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Small deterministic helpers keep the field stable between resizes and avoid
// introducing a dependency just for a smooth noise vector.
const seeded = (seed) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const noise2d = (x, y) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const top = seeded(x0 + y0 * 57) * (1 - sx) + seeded(x0 + 1 + y0 * 57) * sx;
  const bottom = seeded(x0 + (y0 + 1) * 57) * (1 - sx) + seeded(x0 + 1 + (y0 + 1) * 57) * sx;
  return top * (1 - sy) + bottom * sy;
};

export function ProcessingParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return undefined;

    let width = 0;
    let height = 0;
    let devicePixelRatio = 1;
    let particles = [];
    let animationFrame = 0;
    let elapsed = 0;
    let lastTimestamp = 0;
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pointer = { x: 0.5, y: 0.5 };

    const particleCount = () => clamp(Math.round((width * height) / 2400), 280, 540);

    const createParticles = () => {
      const count = particleCount();
      const halfWidth = width / 2;
      const halfHeight = height / 2;

      particles = Array.from({ length: count }, (_, index) => {
        const mass = 0.42 + seeded(index * 2.31 + 0.7) * 0.9;
        return {
          x: (seeded(index * 4.17 + 1.1) * 2 - 1) * halfWidth,
          y: (seeded(index * 5.37 + 2.2) * 2 - 1) * halfHeight,
          vx: 0,
          vy: 0,
          fx: 0,
          fy: 0,
          mass,
          group: index % GROUPS.length,
          noiseOffset: seeded(index * 7.13 + 3.4) * 100,
        };
      });
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width || window.innerWidth;
      height = bounds.height || window.innerHeight;
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      createParticles();
      drawFrame(0);
    };

    const drawFrame = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = Math.min((timestamp - lastTimestamp) / 1000 || 0.016, 0.05);
      lastTimestamp = timestamp;
      elapsed += reducedMotion.matches ? 0 : delta;

      const centerX = width / 2 + (pointer.x - 0.5) * 16;
      const centerY = height / 2 + (pointer.y - 0.5) * 12;
      const scale = Math.min(width, height) / 800;
      const influenceRadius = (200 + 150 * Math.sin(elapsed * 1.2)) * scale;
      const influenceRadiusSquared = influenceRadius * influenceRadius;
      const halfWidth = width / 2 - 8;
      const halfHeight = height / 2 - 8;

      // A translucent wash leaves short trails behind the points, matching the
      // Processing sketch while keeping the background deep enough for copy.
      context.fillStyle = reducedMotion.matches ? 'rgba(3, 6, 13, 0.96)' : 'rgba(3, 6, 13, 0.18)';
      context.fillRect(0, 0, width, height);

      const halo = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.72);
      halo.addColorStop(0, 'rgba(14, 47, 66, 0.24)');
      halo.addColorStop(0.45, 'rgba(10, 21, 38, 0.08)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = halo;
      context.fillRect(0, 0, width, height);

      if (!reducedMotion.matches) {
        // Pairwise updates retain the attraction/repulsion behavior of the
        // original sketch while doing half as many distance calculations.
        for (let index = 0; index < particles.length; index += 1) {
          particles[index].fx = 0;
          particles[index].fy = 0;
        }

        for (let index = 0; index < particles.length; index += 1) {
          const particle = particles[index];
          for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
            const other = particles[otherIndex];
            if (particle.group === other.group) continue;

            const dx = other.x - particle.x;
            const dy = other.y - particle.y;
            const distanceSquared = dx * dx + dy * dy + 60;
            const direction = distanceSquared > influenceRadiusSquared ? 1 : -1;
            const force = direction * 650 * particle.mass * other.mass / distanceSquared;
            const forceX = dx * force;
            const forceY = dy * force;

            particle.fx += forceX;
            particle.fy += forceY;
            other.fx -= forceX;
            other.fy -= forceY;
          }
        }

        const noiseScale = Math.max(90, 128 * scale);
        for (const particle of particles) {
          const angle = noise2d(
            particle.x / noiseScale + particle.noiseOffset + elapsed * 0.08,
            particle.y / noiseScale - particle.noiseOffset - elapsed * 0.05,
          ) * TAU;
          particle.vx = particle.vx * 0.9 + particle.fx * 0.00035 + Math.cos(angle) * 0.035;
          particle.vy = particle.vy * 0.9 + particle.fy * 0.00035 + Math.sin(angle) * 0.035;
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < -halfWidth) {
            particle.x = -halfWidth;
            particle.vx = Math.abs(particle.vx) * 0.7;
          } else if (particle.x > halfWidth) {
            particle.x = halfWidth;
            particle.vx = -Math.abs(particle.vx) * 0.7;
          }
          if (particle.y < -halfHeight) {
            particle.y = -halfHeight;
            particle.vy = Math.abs(particle.vy) * 0.7;
          } else if (particle.y > halfHeight) {
            particle.y = halfHeight;
            particle.vy = -Math.abs(particle.vy) * 0.7;
          }
        }
      }

      context.lineWidth = 0.45;
      for (const particle of particles) {
        const group = GROUPS[particle.group];
        const radius = 0.7 + particle.mass * 2.3;
        const x = centerX + particle.x;
        const y = centerY + particle.y;

        context.beginPath();
        context.arc(x, y, radius, 0, TAU);
        context.fillStyle = group.fill;
        context.fill();
        context.strokeStyle = group.stroke;
        context.stroke();

        if (particle.mass > 1.05) {
          context.beginPath();
          context.arc(x, y, radius * 2.35, 0, TAU);
          context.strokeStyle = group.fill.replace(/0\.\d+\)/, '0.12)');
          context.stroke();
        }
      }
    };

    const animate = (timestamp) => {
      drawFrame(timestamp);
      if (!reducedMotion.matches) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const handlePointerMove = (event) => {
      pointer = {
        x: event.clientX / Math.max(window.innerWidth, 1),
        y: event.clientY / Math.max(window.innerHeight, 1),
      };
    };

    const handleMotionPreference = () => {
      window.cancelAnimationFrame(animationFrame);
      lastTimestamp = 0;
      drawFrame(0);
      if (!reducedMotion.matches) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener('change', handleMotionPreference);
    } else {
      reducedMotion.addListener(handleMotionPreference);
    }
    if (!reducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      if (reducedMotion.removeEventListener) {
        reducedMotion.removeEventListener('change', handleMotionPreference);
      } else {
        reducedMotion.removeListener(handleMotionPreference);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 h-full w-full pointer-events-none"
    />
  );
}
