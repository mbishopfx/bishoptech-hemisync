'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const STATES = [
  { id: 'delta', label: 'Delta', beat: 2.5, note: 'Deep rest' },
  { id: 'theta', label: 'Theta', beat: 6, note: 'Drift and recall' },
  { id: 'alpha', label: 'Alpha', beat: 10, note: 'Calm attention' },
  { id: 'smr', label: 'SMR', beat: 13, note: 'Steady focus' },
  { id: 'beta', label: 'Beta', beat: 18, note: 'Alert work' },
  { id: 'gamma', label: 'Gamma', beat: 38, note: 'Fast binding' }
];

const LEFT_TONE = [182, 221, 204];
const RIGHT_TONE = [232, 220, 192];

const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));

/**
 * Stereo oscilloscope for the hero.
 *
 * Two carriers are drawn on top of each other, left in mint and right in warm
 * cream. Because the right carrier runs a few hertz fast, the two traces drift
 * in and out of phase and the beat appears as a widening and closing envelope
 * rather than as a decorative wave. A Lissajous inset in the corner plots left
 * against right, which is the same relationship rotated ninety degrees.
 *
 * Everything is painted to canvas so the trace can carry a phosphor trail and
 * a glow without thousands of DOM nodes. The animation loop writes to a ref and
 * never triggers a React render.
 */
export function SignalLab() {
  const [stateId, setStateId] = useState('theta');
  const [carrier, setCarrier] = useState(200);

  const canvasRef = useRef(null);
  const hostRef = useRef(null);
  const paramsRef = useRef({ carrier: 200, beat: 6 });
  const phaseRef = useRef(0);
  const frameRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  // assigning canvas.width clears the bitmap, so resizing has to repaint
  const repaintRef = useRef(() => {});

  const active = STATES.find((state) => state.id === stateId) ?? STATES[1];
  const beat = active.beat;
  const right = carrier + beat;

  // keep the render loop's copy of the params current without re-subscribing rAF
  useEffect(() => {
    paramsRef.current = { carrier, beat };
  }, [carrier, beat]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = host.getBoundingClientRect();
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);
    sizeRef.current = { w, h, dpr };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    repaintRef.current();
  }, []);

  useEffect(() => {
    resize();
    const observer = new ResizeObserver(resize);
    if (hostRef.current) observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const clear = () => {
      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
    };

    const paintGrid = () => {
      const { w, h } = sizeRef.current;
      ctx.save();
      ctx.lineWidth = 1;

      // horizontal divisions
      for (let i = 1; i < 4; i += 1) {
        const y = (h / 4) * i;
        ctx.strokeStyle = i === 2 ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // vertical divisions
      for (let i = 1; i < 12; i += 1) {
        const x = (w / 12) * i;
        ctx.strokeStyle = 'rgba(255,255,255,0.035)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // centre tick marks along the middle rail
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      for (let i = 0; i <= 24; i += 1) {
        const x = (w / 24) * i;
        const tall = i % 6 === 0;
        ctx.beginPath();
        ctx.moveTo(x, h / 2 - (tall ? 5 : 2.5));
        ctx.lineTo(x, h / 2 + (tall ? 5 : 2.5));
        ctx.stroke();
      }
      ctx.restore();
    };

    const traceCarrier = ({ colour, cycles, phase, amp, glow }) => {
      const { w, h } = sizeRef.current;
      const mid = h / 2;
      const steps = Math.min(720, Math.max(280, Math.round(w / 2)));

      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const x = t * w;
        const y = mid - Math.sin(2 * Math.PI * (cycles * t + phase)) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = glow;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    };

    const paintEnvelope = ({ beatHz, phase }) => {
      const { w, h } = sizeRef.current;
      const mid = h / 2;
      const amp = h * 0.3;
      const steps = Math.min(600, Math.max(220, Math.round(w / 2)));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, mid);
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const x = t * w;
        const e = Math.abs(Math.cos(Math.PI * (beatHz * t + phase)));
        ctx.lineTo(x, mid - e * amp);
      }
      ctx.lineTo(w, mid);
      ctx.closePath();
      ctx.fillStyle = 'rgba(182, 221, 204, 0.055)';
      ctx.fill();

      ctx.beginPath();
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const x = t * w;
        const e = Math.abs(Math.cos(Math.PI * (beatHz * t + phase)));
        const y = mid - e * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(182, 221, 204, 0.32)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    const paintLissajous = ({ beatHz, phase }) => {
      const { w, h } = sizeRef.current;
      const radius = Math.min(w, h) * 0.16;
      const cx = w - radius - 22;
      const cy = h - radius - 20;
      const drift = beatHz / 14;

      ctx.save();
      // Opaque backing plate: the carriers sweep through this corner, and
      // without it the inset reads as noise on top of the trace rather than as
      // a separate instrument.
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(5, 14, 12, 0.94)';
      ctx.fill();

      // frame
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(182,221,204,0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      const steps = 360;
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const x = cx + Math.sin(2 * Math.PI * (3 * t) + phase) * radius * 0.82;
        const y = cy + Math.sin(2 * Math.PI * ((3 + drift) * t)) * radius * 0.82;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(233,245,238,0.75)';
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(182,221,204,0.55)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    };

    const paintCursor = ({ phase }) => {
      const { w, h } = sizeRef.current;
      const x = ((phase * 2.2) % 1) * w;
      ctx.save();
      const grad = ctx.createLinearGradient(x, 0, x, h);
      grad.addColorStop(0, 'rgba(182,221,204,0)');
      grad.addColorStop(0.5, 'rgba(182,221,204,0.28)');
      grad.addColorStop(1, 'rgba(182,221,204,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;
      const { carrier: hz, beat: bHz } = paramsRef.current;
      const phase = phaseRef.current;

      clear();
      paintGrid();
      paintEnvelope({ beatHz: bHz, phase: phase * 0.5 });

      // visual cycles: keep the trace readable, scaled from the real carrier
      const cycles = clamp(Math.round(hz / 26), 3, 11);
      const amp = h * 0.3;

      traceCarrier({
        colour: `rgba(${LEFT_TONE.join(',')},0.95)`,
        cycles,
        phase,
        amp,
        glow: 'rgba(182,221,204,0.55)'
      });
      traceCarrier({
        colour: `rgba(${RIGHT_TONE.join(',')},0.8)`,
        cycles: cycles + bHz / 26,
        phase: phase * 1.04,
        amp: amp * 0.92,
        glow: 'rgba(232,220,192,0.4)'
      });

      // cursor first so the inset's backing plate stays clean on top of it
      paintCursor({ phase });
      paintLissajous({ beatHz: bHz, phase });
    };

    repaintRef.current = draw;

    // Paint the first frame synchronously. Waiting for requestAnimationFrame
    // leaves the scope empty whenever the frame clock is throttled — offscreen
    // tabs, some headless renderers, and print/PDF all show a blank box until
    // the first tick, which can be seconds or never.
    draw();

    if (reduced.matches) {
      return undefined;
    }

    let lastTime = 0;
    const tick = (now) => {
      const previous = lastTime || now;
      const delta = Math.min((now - previous) / 1000, 0.05);
      lastTime = now;
      phaseRef.current = (phaseRef.current + delta * 0.22) % 1;
      draw();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      lastTime = 0;
    };
  }, []);

  return (
    <div className="liquid-glass relative overflow-hidden rounded-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-4 sm:px-7">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-[#b6ddcc] shadow-[0_0_10px_2px_rgba(182,221,204,0.5)]"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">Signal lab · live</span>
        </div>
        <span className="font-mono text-[11px] tracking-[0.14em] text-white/50">headphones required</span>
      </div>

      <div
        ref={hostRef}
        className="relative mx-3 h-[168px] overflow-hidden rounded-[16px] bg-[#07100e] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-22px_44px_rgba(0,0,0,0.38)] sm:mx-5 sm:h-[190px]"
      >
        <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
        {/* The readout row below carries the values; keeping text off the glass
            stops the carriers from striking through the labels. */}
        <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
          2 ch · 1 diff
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px px-3 pt-3 sm:px-5">
        {[
          { key: 'left', label: 'Left', value: `${carrier} Hz`, tone: '#b6ddcc' },
          { key: 'right', label: 'Right', value: `${right} Hz`, tone: '#e8dcc0' },
          { key: 'beat', label: 'Beat', value: `${beat.toFixed(1)} Hz`, tone: '#d7eadf' }
        ].map((lane) => (
          <div key={lane.key} className="px-2 py-1.5">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">{lane.label}</div>
            <div className="mt-1 font-mono text-[13px] tabular-nums" style={{ color: lane.tone }}>
              {lane.value}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-6 pt-4 sm:px-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Target band</span>
          {STATES.map((state) => {
            const selected = state.id === stateId;
            return (
              <button
                key={state.id}
                type="button"
                onClick={() => setStateId(state.id)}
                aria-pressed={selected}
                className={`rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] transition ${
                  selected
                    ? 'border-[#b6ddcc]/70 bg-[#b6ddcc]/90 text-[#06100d]'
                    : 'border-white/10 text-white/55 hover:border-[#b6ddcc]/40 hover:text-white'
                }`}
              >
                {state.label} · {state.beat}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="carrier" className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                Carrier frequency
              </label>
              <span className="font-mono text-[11px] tabular-nums text-white/40">{carrier} Hz</span>
            </div>
            <input
              id="carrier"
              type="range"
              min="120"
              max="420"
              step="2"
              value={carrier}
              onChange={(event) => setCarrier(Number(event.target.value))}
              className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/12 accent-[#b6ddcc]"
            />
          </div>
          <p className="max-w-[15rem] font-mono text-[11px] leading-relaxed text-white/50">
            {active.label} · {active.note}
          </p>
        </div>

        <p className="mt-5 border-t border-white/[0.07] pt-4 text-[13px] leading-relaxed text-white/55">
          Two pure carriers, separated by {beat.toFixed(1)} Hz. The brain hears the difference as a pulse — not the tones.
          That pulse is the rhythm you sit inside.
        </p>
      </div>
    </div>
  );
}
