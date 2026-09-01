'use client';

import { useEffect, useMemo, useState } from 'react';
import { OceanSurfaceCanvas } from '@/components/science/OceanSurfaceCanvas';
import { createOceanProfileFromControls } from '@/components/science/vgpu-ocean/ocean-profile';

const DEFAULT_CONTROLS = Object.freeze({
  carrierFreq: 200,
  beatFreq: 6,
  volume: 80,
  brainState: 'theta'
});

export function ImmersiveOceanMode({ open, controls = DEFAULT_CONTROLS, seed = 0, onClose }) {
  const [renderStatus, setRenderStatus] = useState('initializing');
  const incomingControls = controls || DEFAULT_CONTROLS;
  const carrierFreq = incomingControls.carrierFreq ?? DEFAULT_CONTROLS.carrierFreq;
  const beatFreq = incomingControls.beatFreq ?? DEFAULT_CONTROLS.beatFreq;
  const volume = incomingControls.volume ?? DEFAULT_CONTROLS.volume;
  const brainState = incomingControls.brainState ?? DEFAULT_CONTROLS.brainState;
  const activeControls = useMemo(
    () => ({ carrierFreq, beatFreq, volume, brainState }),
    [beatFreq, brainState, carrierFreq, volume]
  );
  const profile = useMemo(
    () => createOceanProfileFromControls(seed, activeControls),
    [activeControls, seed]
  );

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="immersive-ocean-mode fixed inset-0 z-[70] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="immersive-ocean-title"
      data-testid="immersive-ocean-mode"
    >
      <OceanSurfaceCanvas
        className="absolute inset-0"
        seed={seed}
        profile={profile}
        onStatusChange={setRenderStatus}
      />
      <div className="immersive-ocean-mode__veil" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-between gap-8 p-5 sm:p-8 lg:p-10">
        <header className="flex items-start justify-between gap-4">
          <div className="immersive-ocean-glass max-w-xl rounded-[1.75rem] p-5 sm:p-6">
            <p className="immersive-ocean-kicker">Immersive mode</p>
            <h2 id="immersive-ocean-title" className="mt-2 text-3xl font-medium tracking-[-0.05em] sm:text-5xl">
              Let the session breathe.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6">
              The ocean follows your live listening controls while the tone keeps running underneath.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="immersive-ocean-close immersive-ocean-glass inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-xs font-medium"
            aria-label="Close immersive mode"
          >
            Close
            <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
          </button>
        </header>

        <div className="flex items-end justify-between gap-6">
          <div className="immersive-ocean-glass max-w-md rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="immersive-ocean-kicker">Live visual sync</p>
              <span className="immersive-ocean-status" data-render-status={renderStatus}>
                {renderStatus === 'live' ? 'Ready' : renderStatus === 'fallback' ? 'Fallback' : 'Loading'}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 sm:gap-x-5">
              <div>
                <dt>Carrier</dt>
                <dd>{activeControls.carrierFreq} Hz</dd>
              </div>
              <div>
                <dt>Rhythm</dt>
                <dd>{activeControls.beatFreq} Hz</dd>
              </div>
              <div>
                <dt>Volume</dt>
                <dd>{activeControls.volume}%</dd>
              </div>
              <div>
                <dt>Run</dt>
                <dd>{profile.runLabel}</dd>
              </div>
            </dl>

            <p className="mt-5 text-xs leading-5">
              Adjust the Studio controls at any time. The waves update without pausing the tone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
