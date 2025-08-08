'use client';
import { motion, useAnimationFrame } from 'framer-motion';
import { useRef, useState } from 'react';

// Fullscreen, low-CPU animated frequency waves (SVG paths) with parallax
export function FrequencyBackground() {
  const [t, setT] = useState(0);
  useAnimationFrame((time) => {
    setT(time / 1000);
  });

  const makePath = (phase, amp = 28, freq = 0.004) => {
    const w = 1440;
    const h = 320;
    const points = [];
    for (let x = 0; x <= w; x += 24) {
      const y = h/2 + Math.sin((x + phase) * freq + t) * amp * Math.cos(t * 0.7);
      points.push(`${x},${y.toFixed(2)}`);
    }
    return `M0,${h} L ${points.join(' ')} L ${w},${h} Z`;
  };

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      <svg className="absolute bottom-[-4vh] left-0 right-0 h-[28vh] w-[200vw] opacity-60 blur-[1px]" viewBox="0 0 1440 320">
        <motion.path d={makePath(0, 30, 0.006)} fill="#06b6d4" fillOpacity="0.10" />
        <motion.path d={makePath(240, 26, 0.005)} fill="#8b5cf6" fillOpacity="0.10" />
        <motion.path d={makePath(480, 22, 0.004)} fill="#22d3ee" fillOpacity="0.08" />
      </svg>
      <svg className="absolute bottom-[-6vh] left-0 right-0 h-[22vh] w-[200vw] opacity-50 blur-[2px]" viewBox="0 0 1440 320">
        <motion.path d={makePath(120, 18, 0.006)} fill="#10b981" fillOpacity="0.08" />
        <motion.path d={makePath(360, 16, 0.005)} fill="#a78bfa" fillOpacity="0.08" />
      </svg>
    </div>
  );
}



