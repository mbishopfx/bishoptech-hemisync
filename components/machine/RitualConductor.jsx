'use client';

import { ArrowRight, Check } from '@phosphor-icons/react';

const PHASE_IDS = ['arrive', 'practice', 'close'];

export function RitualConductor({ plan, activePhase = null, onSelectPhase }) {
  if (!plan?.phases?.length) return null;

  return (
    <section data-testid="ritual-conductor" aria-labelledby="ritual-conductor-title" className="glass-subpanel space-y-4 rounded-2xl border border-[#b6ddcc]/15 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#b6ddcc]/75">Three-act ritual</p>
          <h3 id="ritual-conductor-title" className="mt-2 text-xl font-medium tracking-[-0.03em] text-white">Arrive → practice → close</h3>
        </div>
        <span className="text-xs text-white/40">{plan.durationMin} min · manual transitions</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {PHASE_IDS.map((phaseId, index) => {
          const phase = plan.phases.find((candidate) => candidate.id === phaseId);
          if (!phase) return null;
          const isActive = activePhase === phaseId;
          return (
            <button
              key={phase.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectPhase?.(phase.id)}
              className={`glass-choice group rounded-xl p-3 text-left ${isActive ? 'is-selected text-white' : 'text-white/60'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="glass-step-number glass-step-number--compact" aria-hidden="true">0{index + 1}</span>
                {isActive ? <Check className="size-4 text-[#b6ddcc]" weight="bold" aria-label="Active phase" /> : <ArrowRight className="size-3 text-white/25 transition group-hover:translate-x-0.5" aria-hidden="true" />}
              </div>
              <p className="mt-3 text-sm font-medium">{phase.label}</p>
              <p className="mt-1 text-xs text-white/35">{Math.round(phase.durationSec / 60)} min · {phase.controls.targetState}</p>
            </button>
          );
        })}
      </div>

      {activePhase && plan.phases.find((phase) => phase.id === activePhase) && (
        <p className="border-t border-white/10 pt-3 text-xs leading-5 text-white/50" aria-live="polite">
          {plan.phases.find((phase) => phase.id === activePhase).instruction} Controls are staged locally; audio remains off until you confirm a preview.
        </p>
      )}
    </section>
  );
}
