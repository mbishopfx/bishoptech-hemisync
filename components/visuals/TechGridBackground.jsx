'use client';
import { useEffect, useRef, useState } from 'react';

// Fullscreen animated tech grid with subtle mouse parallax
export function TechGridBackground() {
  const canvasRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = 0, height = 0, dpr = 1;
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let t = 0;
    const spacing = 48; // px grid spacing

    const draw = () => {
      t += 0.006; // slow drift
      ctx.clearRect(0, 0, width, height);

      // Background gradient
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, 'rgba(2, 6, 23, 0.95)');
      g.addColorStop(1, 'rgba(11, 19, 43, 0.98)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      const offsetX = Math.sin(t) * 16 + (pointer.x - 0.5) * 20;
      const offsetY = Math.cos(t * 0.9) * 16 + (pointer.y - 0.5) * 20;

      // Grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)'; // sky-400 alpha
      ctx.beginPath();
      for (let x = (offsetX % spacing) - spacing; x < width + spacing; x += spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = (offsetY % spacing) - spacing; y < height + spacing; y += spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Pulsing nodes on intersections
      const pulse = (Math.sin(t * 2) + 1) * 0.5; // 0..1
      ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
      for (let x = (offsetX % spacing); x < width; x += spacing * 4) {
        for (let y = (offsetY % spacing); y < height; y += spacing * 4) {
          ctx.beginPath();
          ctx.arc(x, y, 2 + pulse * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Vignette
      const rad = Math.max(width, height);
      const vg = ctx.createRadialGradient(width/2, height/2, rad*0.2, width/2, height/2, rad*0.9);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, width, height);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onMove = (e) => {
      const x = e.clientX / width; const y = e.clientY / height;
      setPointer({ x, y });
    };
    window.addEventListener('mousemove', onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10" />
  );
}


