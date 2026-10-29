'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Audio-derived hairline figures.
 *
 * Every shape here is computed from the two numbers that actually define a
 * binaural session: the carrier frequency and the beat frequency. Nothing is a
 * stock illustration — the geometry is the signal.
 *
 *   binaural      left carrier plotted against right. The curve precesses at
 *                 exactly the beat frequency, so the figure is the phenomenon.
 *   interference  both carriers mirrored across a centre line, plus the
 *                 envelope where they meet.
 *   spectrum      a fundamental and its partials, split into left and right by
 *                 the detune amount.
 *   phase         two arcs running at the two carrier rates; the gap between
 *                 them is the beat.
 *
 * Interaction: moving the pointer across the figure sets the beat (left to
 * right, delta through gamma) and the carrier (bottom to top). Geometry is
 * written straight to the DOM from a rAF loop, so the animation never goes
 * through React state.
 */

const W = 480;
const H = 384;

const DEFAULT_PARAMS = { carrier: 200, beat: 6 };

const BANDS = [
  { max: 4, label: 'Delta' },
  { max: 8, label: 'Theta' },
  { max: 12, label: 'Alpha' },
  { max: 15, label: 'SMR' },
  { max: 30, label: 'Beta' },
  { max: 40, label: 'Gamma' }
];

const PALETTE = {
  hi: '#eef2ee',
  edge: '#8ea79c',
  mid: '#3d5750',
  lo: '#16201d'
};

const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
const bandFor = (beat) => BANDS.find((band) => beat <= band.max)?.label ?? 'Gamma';

function paramsFromPointer(clientX, clientY, rect) {
  const nx = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
  const ny = clamp((clientY - rect.top) / Math.max(rect.height, 1), 0, 1);
  return {
    beat: clamp(2.5 + nx * 35.5, 2.5, 40),
    carrier: clamp(420 - ny * 300, 120, 420)
  };
}

/* ── geometry ────────────────────────────────────────────────────────────── */

function binauralGeometry({ carrier, beat }, phase) {
  const cx = W / 2;
  const cy = H / 2;
  const ax = W * 0.34;
  const ay = H * 0.38;
  const cycles = clamp(Math.round(carrier / 40), 2, 7);
  const drift = clamp(beat / 14, 0.05, 2.6);
  const N = 520;

  const trace = (phaseOffset, scale) => {
    let d = '';
    for (let i = 0; i <= N; i += 1) {
      const t = i / N;
      const x = cx + Math.sin(2 * Math.PI * (cycles * t) + phase + phaseOffset) * ax * scale;
      const y = cy + Math.sin(2 * Math.PI * ((cycles + drift) * t)) * ay * scale;
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return d;
  };

  return {
    trace: trace(0, 1),
    ghostA: trace(Math.PI * 0.5, 1.06),
    ghostB: trace(Math.PI, 0.9)
  };
}

function interferenceGeometry({ carrier, beat }, phase) {
  const mid = H / 2;
  const amp = H * 0.26;
  const cycles = clamp(Math.round(carrier / 40), 2, 7);
  const beatCycles = clamp(beat / 2, 1, 9);
  const N = 480;
  let left = '';
  let right = '';
  let envelopeTop = '';
  let envelopeBottom = '';

  for (let i = 0; i <= N; i += 1) {
    const t = i / N;
    const x = t * W;
    const l = Math.sin(2 * Math.PI * (cycles * t) + phase);
    const r = Math.sin(2 * Math.PI * ((cycles + beatCycles / 20) * t) + phase * 1.04);
    const e = Math.abs(Math.cos(Math.PI * (beatCycles * t + phase)));
    const yl = mid - 16 - (l * 0.5 + 0.5) * amp;
    const yr = mid + 16 + (r * 0.5 + 0.5) * amp;
    const yt = mid - 16 - e * (amp + 12);
    const yb = mid + 16 + e * (amp + 12);
    left += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${yl.toFixed(2)}`;
    right += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${yr.toFixed(2)}`;
    envelopeTop += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${yt.toFixed(2)}`;
    envelopeBottom += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${yb.toFixed(2)}`;
  }

  return { left, right, envelopeTop, envelopeBottom };
}

function spectrumGeometry({ carrier, beat }, phase) {
  const bars = 26;
  const baseY = H - 44;
  const maxH = H * 0.56;
  const split = clamp(beat / 40, 0.03, 0.55);
  const out = {};

  for (let i = 1; i <= bars; i += 1) {
    const x = 34 + ((i - 1) / (bars - 1)) * (W - 68);
    const amp = Math.pow(1 / i, 0.62) * maxH;
    const sway = 0.5 + 0.5 * Math.sin(phase * 2 + i * 0.55);
    const height = amp * (0.55 + 0.45 * sway);
    const gap = split * 26 * (1 + i * 0.06);
    const top = (baseY - height).toFixed(2);
    out[`l${i}`] = `M${(x - gap).toFixed(2)} ${baseY} L${(x - gap).toFixed(2)} ${top}`;
    out[`r${i}`] = `M${(x + gap).toFixed(2)} ${baseY} L${(x + gap).toFixed(2)} ${top}`;
  }

  return out;
}

function polarArc(cx, cy, r, startDeg, lenDeg) {
  const steps = Math.max(12, Math.round(lenDeg / 3));
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const deg = startDeg + (lenDeg * i) / steps;
    const rad = (deg * Math.PI) / 180;
    points.push([cx + Math.cos(rad) * r, cy + Math.sin(rad) * r]);
  }
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
}

function phaseGeometry({ beat }, phase) {
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(W, H) * 0.33;
  const sweep = 232;
  const rotation = phase * 54;
  const gap = clamp(beat * 4.2, 6, 168);

  return {
    arcA: polarArc(cx, cy, r, rotation, sweep),
    arcB: polarArc(cx, cy, r, rotation + gap, sweep - gap * 0.35),
    arcInner: polarArc(cx, cy, r * 0.56, -rotation * 1.4, sweep * 0.8)
  };
}

const GEOMETRY = {
  binaural: binauralGeometry,
  interference: interferenceGeometry,
  spectrum: spectrumGeometry,
  phase: phaseGeometry
};

/* ── static stroke styling per variant ───────────────────────────────────── */

function buildStyles(variant, colors) {
  if (variant === 'binaural') {
    return {
      axisX: { d: `M0 ${H / 2} L${W} ${H / 2}`, stroke: colors.mid, strokeWidth: 0.75, opacity: 0.5 },
      axisY: { d: `M${W / 2} 0 L${W / 2} ${H}`, stroke: colors.mid, strokeWidth: 0.75, opacity: 0.5 },
      ghostB: { stroke: colors.lo, strokeWidth: 0.9, opacity: 0.75 },
      ghostA: { stroke: colors.mid, strokeWidth: 0.9, opacity: 0.9 },
      trace: { stroke: colors.hi, strokeWidth: 1.1, opacity: 1 }
    };
  }
  if (variant === 'interference') {
    return {
      envelopeTop: { stroke: colors.edge, strokeWidth: 0.75, opacity: 0.55 },
      envelopeBottom: { stroke: colors.edge, strokeWidth: 0.75, opacity: 0.55 },
      left: { stroke: colors.hi, strokeWidth: 1.05, opacity: 0.95 },
      right: { stroke: colors.edge, strokeWidth: 1.05, opacity: 0.95 }
    };
  }
  if (variant === 'spectrum') {
    const styles = {};
    for (let i = 1; i <= 26; i += 1) {
      const fade = 0.9 - (i / 26) * 0.45;
      styles[`l${i}`] = { stroke: colors.hi, strokeWidth: 0.9, opacity: fade };
      styles[`r${i}`] = { stroke: colors.edge, strokeWidth: 0.9, opacity: fade * 0.85 };
    }
    return styles;
  }
  return {
    arcInner: { stroke: colors.mid, strokeWidth: 0.9, opacity: 0.8 },
    arcB: { stroke: colors.edge, strokeWidth: 1.05, opacity: 0.95 },
    arcA: { stroke: colors.hi, strokeWidth: 1.15, opacity: 1 }
  };
}

/* ── component ───────────────────────────────────────────────────────────── */

export function AudioFigure({
  variant = 'binaural',
  label,
  readout = true,
  interactive = true,
  palette,
  className = '',
  style
}) {
  const colors = { ...PALETTE, ...palette };
  const builder = GEOMETRY[variant] ?? binauralGeometry;
  const styles = buildStyles(variant, colors);
  const keys = Object.keys(styles);

  const pathRefs = useRef({});
  const paramsRef = useRef({ ...DEFAULT_PARAMS });
  const phaseRef = useRef(0.35);
  const frameRef = useRef(0);
  const hostRef = useRef(null);
  const [display, setDisplay] = useState({ ...DEFAULT_PARAMS });

  // paint one frame straight into the DOM
  const paint = () => {
    const geometry = builder(paramsRef.current, phaseRef.current);
    keys.forEach((key) => {
      const node = pathRefs.current[key];
      if (node && geometry[key]) node.setAttribute('d', geometry[key]);
    });
  };

  useEffect(() => {
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, colors.hi, colors.edge, colors.mid, colors.lo]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return undefined;

    let last = 0;
    const tick = (now) => {
      const previous = last || now;
      const delta = Math.min((now - previous) / 1000, 0.05);
      last = now;
      phaseRef.current = (phaseRef.current + delta * 0.18) % 1;
      paint();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      last = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const handlePointerMove = (event) => {
    if (!interactive) return;
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const host = hostRef.current;
    if (!host) return;
    const next = paramsFromPointer(event.clientX, event.clientY, host.getBoundingClientRect());
    paramsRef.current = next;
    setDisplay(next);
    paint();
  };

  const handlePointerLeave = () => {
    paramsRef.current = { ...DEFAULT_PARAMS };
    setDisplay({ ...DEFAULT_PARAMS });
    paint();
  };

  const beatLabel = bandFor(display.beat);

  return (
    <div
      ref={hostRef}
      className={`relative w-full ${className}`}
      style={{ aspectRatio: '5 / 4', ...style }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {readout && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
          <span className="tabular-nums">
            L {display.carrier.toFixed(1)} · R {(display.carrier + display.beat).toFixed(1)}
          </span>
          <span className="tabular-nums text-[#b6ddcc]">
            {beatLabel} · {display.beat.toFixed(1)} Hz
          </span>
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label || `${variant} figure derived from the carrier and beat frequencies`}
        className="block w-full"
        style={{ height: '100%', touchAction: 'pan-y' }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {keys.map((key) => (
          <path
            key={key}
            ref={(node) => {
              pathRefs.current[key] = node;
            }}
            d={styles[key].d || ''}
            stroke={styles[key].stroke}
            strokeWidth={styles[key].strokeWidth}
            opacity={styles[key].opacity}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}

export default AudioFigure;
