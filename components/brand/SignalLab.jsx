'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const STATES = [
  { id: 'delta', label: 'Delta', beat: 2.5, note: 'Deep rest' },
  { id: 'theta', label: 'Theta', beat: 6, note: 'Drift and recall' },
  { id: 'alpha', label: 'Alpha', beat: 10, note: 'Calm attention' },
  { id: 'smr', label: 'SMR', beat: 13, note: 'Steady focus' },
  { id: 'beta', label: 'Beta', beat: 18, note: 'Alert work' },
  { id: 'gamma', label: 'Gamma', beat: 38, note: 'Fast binding' }
];

const LANE = { width: 640, height: 74 };
const POINTS = 240;

function wavePath({ phase, cycles, amplitude, y }) {
  const mid = y;
  let d = '';
  for (let i = 0; i <= POINTS; i += 1) {
    const x = (i / POINTS) * LANE.width;
    const t = i / POINTS;
    const value = Math.sin(2 * Math.PI * (cycles * t + phase));
    const yv = mid - value * amplitude;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${yv.toFixed(2)}`;
  }
  return d;
}

function beatPath({ phase, cycles, amplitude, y }) {
  const mid = y;
  let d = '';
  for (let i = 0; i <= POINTS; i += 1) {
    const x = (i / POINTS) * LANE.width;
    const t = i / POINTS;
    const envelope = 0.42 + 0.58 * Math.abs(Math.sin(Math.PI * (cycles * t + phase)));
    const value = Math.sin(2 * Math.PI * (cycles * 3 * t + phase)) * envelope;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${(mid - value * amplitude).toFixed(2)}`;
  }
  return d;
}

export function SignalLab() {
  const [stateId, setStateId] = useState('theta');
  const [carrier, setCarrier] = useState(200);
  const [phase, setPhase] = useState(0);
  const frame = useRef(0);
  const last = useRef(0);

  const active = STATES.find((state) => state.id === stateId) ?? STATES[1];
  const beat = active.beat;
  const right = carrier + beat;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return undefined;

    const tick = (now) => {
      const previous = last.current || now;
      const delta = Math.min((now - previous) / 1000, 0.05);
      last.current = now;
      setPhase((value) => (value + delta * 0.5) % 1);
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame.current);
      last.current = 0;
    };
  }, []);

  const lanes = useMemo(() => {
    const carrierCycles = Math.max(4, Math.min(16, Math.round(carrier / 24)));
    const beatCycles = Math.max(2, Math.min(9, Math.round(beat)));
    return {
      left: wavePath({ phase, cycles: carrierCycles, amplitude: 26, y: LANE.height / 2 }),
      right: wavePath({ phase: phase * 1.04, cycles: carrierCycles, amplitude: 26, y: LANE.height / 2 }),
      beat: beatPath({ phase: phase * 0.5, cycles: beatCycles, amplitude: 24, y: LANE.height / 2 })
    };
  }, [phase, carrier, beat]);

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/12 bg-[#0b1211]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5 sm:px-7">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[#b6ddcc] shadow-[0_0_10px_2px_rgba(182,221,204,0.5)]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">Signal lab · live</span>
        </div>
        <span className="font-mono text-[11px] tracking-[0.14em] text-white/60">headphones required</span>
      </div>

      <div className="grid gap-px bg-white/8 sm:grid-cols-3">
        {[
          { key: 'left', label: 'Left ear', value: `${carrier} Hz`, tone: '#b6ddcc', path: lanes.left },
          { key: 'right', label: 'Right ear', value: `${right} Hz`, tone: '#e8dcc0', path: lanes.right },
          { key: 'beat', label: 'Perceived beat', value: `${beat.toFixed(1)} Hz`, tone: '#d7eadf', path: lanes.beat }
        ].map((lane) => (
          <div key={lane.key} className="bg-[#0b1211] px-4 pb-4 pt-5 sm:px-5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">{lane.label}</span>
              <span className="font-mono text-[13px] tabular-nums" style={{ color: lane.tone }}>{lane.value}</span>
            </div>
            <svg
              viewBox={`0 0 ${LANE.width} ${LANE.height}`}
              className="mt-3 w-full"
              style={{ height: 74 }}
              role="img"
              aria-label={`${lane.label} sine wave at ${lane.value}`}
              preserveAspectRatio="none"
            >
              <line x1="0" y1={LANE.height / 2} x2={LANE.width} y2={LANE.height / 2} stroke="#ffffff" strokeOpacity="0.08" />
              <path d={lane.path} fill="none" stroke={lane.tone} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-5 py-6 sm:px-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Target band</span>
          {STATES.map((state) => {
            const selected = state.id === stateId;
            return (
              <button
                key={state.id}
                type="button"
                onClick={() => setStateId(state.id)}
                aria-pressed={selected}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.06em] transition ${
                  selected
                    ? 'border-[#b6ddcc] bg-[#b6ddcc] text-[#0b1211]'
                    : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
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
              <label htmlFor="carrier" className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                Carrier frequency
              </label>
              <span className="font-mono text-[11px] tabular-nums text-white/50">{carrier} Hz</span>
            </div>
            <input
              id="carrier"
              type="range"
              min="120"
              max="420"
              step="2"
              value={carrier}
              onChange={(event) => setCarrier(Number(event.target.value))}
              className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#b6ddcc]"
            />
          </div>
          <p className="max-w-[15rem] font-mono text-[11px] leading-relaxed text-white/60">
            {active.label} · {active.note}
          </p>
        </div>

        <p className="mt-5 border-t border-white/10 pt-4 text-[13px] leading-relaxed text-white/65">
          Two pure carriers, separated by {beat.toFixed(1)} Hz. The brain hears the difference as a pulse — not the tones.
          That pulse is the rhythm you sit inside.
        </p>
      </div>
    </div>
  );
}
