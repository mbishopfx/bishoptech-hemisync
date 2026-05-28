import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BRAIN_STATE_ORDER, getBrainStateMeta, groupLibraryTonesByState, normalizeLibraryTone, resolveBrainState } from '@/lib/audio/library-groups';

function ToneCard({ tone, onUseInWorkshop }) {
  const meta = getBrainStateMeta(resolveBrainState(tone));
  const sourceLabel = tone.sourceType === 'generated-pack'
    ? 'Generated pack'
    : tone.sourceType === 'audiotemplate'
      ? 'Preview tone'
      : tone.sourceType === 'serenity'
        ? 'Serenity'
        : 'Saved tone';

  return (
    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl p-5 rounded-3xl group hover:border-cyan-500/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{meta.label}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-white/55">
              {sourceLabel}
            </span>
            {tone.visibility && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-white/55">
                {tone.visibility}
              </span>
            )}
          </div>
          <h3 className="text-lg font-medium truncate">{tone.name}</h3>
          <p className="mt-2 text-sm leading-6 text-white/55 line-clamp-3">{tone.description || tone.summary || 'No description available.'}</p>
        </div>
        <button
          type="button"
          className="size-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shrink-0"
          aria-label={`Play ${tone.name}`}
        >
          <span className="material-symbols-outlined text-black font-bold">play_arrow</span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/40">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
          <p className="font-mono uppercase tracking-widest text-[10px] text-white/25">Duration</p>
          <p className="mt-1 text-white/70">{Math.round((tone.durationSec || tone.duration_sec || 0) / 60)} min</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
          <p className="font-mono uppercase tracking-widest text-[10px] text-white/25">Base</p>
          <p className="mt-1 text-white/70">{tone.baseFreqHz || tone.base_freq_hz || '—'} Hz</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => onUseInWorkshop?.(tone)}
        >
          Use in Workshop
          <span className="material-symbols-outlined text-sm ml-2 font-semibold">arrow_forward</span>
        </Button>
      </div>

      {tone.playUrl && (
        <audio controls src={tone.playUrl} className="mt-4 w-full h-8 opacity-90" preload="none" />
      )}
    </Card>
  );
}

export function LibraryBrowser({ tones = [], onUseInWorkshop }) {
  const [query, setQuery] = useState('');
  const [activeState, setActiveState] = useState('all');

  const normalizedTones = useMemo(() => tones.map(normalizeLibraryTone), [tones]);
  const grouped = useMemo(() => groupLibraryTonesByState(normalizedTones), [normalizedTones]);

  const visibleStates = useMemo(() => (activeState === 'all' ? BRAIN_STATE_ORDER : [activeState]), [activeState]);

  const filteredGroups = useMemo(() => {
    const search = query.trim().toLowerCase();
    const next = {};

    for (const state of visibleStates) {
      const list = grouped[state] || [];
      next[state] = search
        ? list.filter((tone) => {
            const haystack = [
              tone.name,
              tone.description,
              tone.summary,
              tone.shortLabel,
              tone.target_state,
              tone.sourceType,
              tone.modeLabel
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            return haystack.includes(search);
          })
        : list;
    }

    return next;
  }, [grouped, query, visibleStates]);

  const totalVisible = Object.values(filteredGroups).reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">Tone Library</p>
            <h2 className="section-title mt-2 text-4xl text-[var(--text-primary)]">Browse by brain state</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Choose a tone, preview it, and send it straight into the workshop to build your own NeuroSync file.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 p-2">
            <span className="material-symbols-outlined text-white/35 text-base ml-2">search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-[220px] bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/25"
              placeholder="Search tones..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveState('all')}
            className={`rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] transition-all ${activeState === 'all' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-white/10 bg-white/5 text-white/50 hover:text-white'}`}
          >
            All
          </button>
          {BRAIN_STATE_ORDER.map((state) => {
            const meta = getBrainStateMeta(state);
            return (
              <button
                type="button"
                key={state}
                onClick={() => setActiveState(state)}
                className={`rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] transition-all ${activeState === state ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-white/10 bg-white/5 text-white/50 hover:text-white'}`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {totalVisible === 0 ? (
        <Card className="border-white/5 bg-zinc-900/40 p-10 text-center">
          <span className="material-symbols-outlined text-white/15 text-5xl mx-auto block mb-2">library_music</span>
          <h3 className="mt-4 text-xl font-light text-white/70">No tones found</h3>
          <p className="mt-2 text-sm text-white/35">Try another brain state or clear the search term.</p>
        </Card>
      ) : (
        <div className="space-y-10">
          {BRAIN_STATE_ORDER.map((state) => {
            const tonesInState = filteredGroups[state] || [];
            if (tonesInState.length === 0) return null;
            const meta = getBrainStateMeta(state);

            return (
              <section key={state} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-cyan-400 text-base">waves</span>
                      <h3 className="text-2xl font-light text-white">{meta.label}</h3>
                    </div>
                    <p className="mt-1 text-sm text-white/40">{meta.description}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/25">{meta.range} · {tonesInState.length} tones</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {tonesInState.map((tone) => (
                    <ToneCard key={tone.id} tone={tone} onUseInWorkshop={onUseInWorkshop} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
