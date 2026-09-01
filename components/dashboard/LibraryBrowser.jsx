import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BRAIN_STATE_ORDER, getBrainStateMeta, groupLibraryTonesByState, normalizeLibraryTone, resolveBrainState } from '@/lib/audio/library-groups';
import { authedFetch } from '@/lib/frontend/api';

function ToneCard({ tone, onUseInStudio }) {
  const meta = getBrainStateMeta(resolveBrainState(tone));
  const sourceLabel = tone.sourceType === 'generated-pack'
    ? 'Generated pack'
    : tone.sourceType === 'audiotemplate'
      ? 'Preview tone'
      : tone.sourceType === 'serenity'
        ? 'Serenity'
        : 'Saved tone';

  return (
    <Card className="workspace-library-card group rounded-[2rem] p-5 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">{meta.label}</span>
            <span className="workspace-library-inset rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-white/55">
              {sourceLabel}
            </span>
          </div>
          <h3 className="text-lg font-medium truncate">{tone.name}</h3>
          <p className="mt-2 text-sm leading-6 text-white/55 line-clamp-3">{tone.description || tone.summary || 'No description available.'}</p>
        </div>
        <button
          type="button"
          className="workspace-glass-button workspace-glass-button--primary workspace-library-play flex size-10 shrink-0 items-center justify-center rounded-full"
          aria-label={`Play ${tone.name}`}
        >
          <span className="material-symbols-outlined font-bold text-white">play_arrow</span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/40">
        <div className="workspace-library-inset rounded-2xl border p-3">
          <p className="font-mono uppercase tracking-widest text-[10px] text-white/25">Duration</p>
          <p className="mt-1 text-white/70">{Math.round((tone.durationSec || tone.duration_sec || 0) / 60)} min</p>
        </div>
        <div className="workspace-library-inset rounded-2xl border p-3">
          <p className="font-mono uppercase tracking-widest text-[10px] text-white/25">Base</p>
          <p className="mt-1 text-white/70">{tone.baseFreqHz || tone.base_freq_hz || '—'} Hz</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          className="workspace-glass-button workspace-glass-button--quiet flex-1"
          onClick={() => onUseInStudio?.(tone)}
        >
          Use in Studio
          <span className="material-symbols-outlined text-sm ml-2 font-semibold">arrow_forward</span>
        </Button>
      </div>

      {tone.playUrl && (
        <audio controls src={tone.playUrl} className="mt-4 w-full h-8 opacity-90" preload="none" />
      )}
    </Card>
  );
}

function ProjectCard({ project, onEdit }) {
  const duration = Math.round((project.spec?.durationSec || 0) / 60);
  return (
    <Card className="workspace-library-card rounded-[2rem] p-5">
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">Private project · v{project.version}</p>
      <h3 className="mt-2 text-lg font-medium text-white">{project.name}</h3>
      <p className="mt-2 text-sm leading-6 text-white/45">{project.spec?.description || 'Editable staged Cognistration session.'}</p>
      <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase text-white/30"><span>{duration} min</span><span>{project.spec?.stages?.length || 0} stages</span></div>
      <button type="button" onClick={() => onEdit?.(project)} className="workspace-glass-button workspace-library-action mt-4 w-full rounded-xl px-4 py-2.5 text-xs font-mono uppercase">Open in Studio</button>
    </Card>
  );
}

function RenderCard({ render, onEditProject }) {
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const project = render.session_specs;
  const download = async (format) => {
    setBusy(format);
    setNotice('');
    try {
      const data = await authedFetch(`/api/studio/renders/${render.id}/downloads`);
      const url = data.downloads?.[format];
      if (!url) throw new Error(`${format.toUpperCase()} is unavailable`);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.rel = 'noopener';
      anchor.click();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy('');
    }
  };
  const email = async () => {
    setBusy('email');
    setNotice('');
    try {
      const data = await authedFetch(`/api/studio/renders/${render.id}/email`, { method: 'POST' });
      setNotice(`Sent to ${data.sentTo}`);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy('');
    }
  };
  return (
    <Card className="workspace-library-card rounded-[2rem] p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-mono uppercase tracking-[0.25em] text-purple-300">Private export</p><h3 className="mt-2 text-lg font-medium text-white">{project?.name || 'Studio Render'}</h3></div><span className={`rounded-full border px-2.5 py-1 text-[9px] font-mono uppercase ${render.phase === 'completed' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' : render.phase === 'failed' ? 'border-red-500/25 bg-red-500/10 text-red-300' : 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300'}`}>{render.phase}</span></div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono uppercase text-white/30"><div className="workspace-library-inset rounded-xl border p-3">Duration<p className="mt-1 text-white/65">{Math.round((render.metadata?.durationSec || project?.spec?.durationSec || 0) / 60)} min</p></div><div className="workspace-library-inset rounded-xl border p-3">Quality<p className="mt-1 text-white/65">192 kbps / 48 kHz</p></div></div>
      {render.phase === 'completed' && <div className="mt-4 grid grid-cols-2 gap-2">{render.wav_path && <button type="button" onClick={() => download('wav')} disabled={busy} className="workspace-glass-button workspace-library-action rounded-xl px-3 py-2 text-[10px] font-mono uppercase">{busy === 'wav' ? 'Opening…' : 'Legacy WAV'}</button>}{render.mp3_path && <button type="button" onClick={() => download('mp3')} disabled={busy} className={`${render.wav_path ? '' : 'col-span-2'} workspace-glass-button workspace-library-action rounded-xl px-3 py-2 text-[10px] font-mono uppercase`}>{busy === 'mp3' ? 'Opening…' : 'Download MP3'}</button>}<button type="button" onClick={email} disabled={busy} className="workspace-glass-button workspace-library-action col-span-2 rounded-xl px-3 py-2 text-[10px] font-mono uppercase">{busy === 'email' ? 'Sending…' : 'Email Me a Copy'}</button></div>}
      {project && <button type="button" onClick={() => onEditProject?.(project)} className="mt-3 w-full text-[10px] font-mono uppercase tracking-widest text-cyan-300/70">Open project →</button>}
      {notice && <p className="mt-3 text-xs text-white/45">{notice}</p>}
    </Card>
  );
}

export function LibraryBrowser({ tones = [], projects = [], renders = [], onUseInStudio, onEditProject }) {
  const [query, setQuery] = useState('');
  const [activeState, setActiveState] = useState('all');
  const [section, setSection] = useState('catalog');

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
    <div className="workspace-library space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">Private Audio Library</p>
            <h2 className="section-title mt-2 text-4xl text-[var(--text-primary)]">Projects, exports, and curated tones</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Reopen editable Studio projects, retrieve private masters, or choose a curated tone for Studio.
            </p>
          </div>
          <div className="workspace-library-search flex items-center gap-2 rounded-full border p-2">
            <span className="material-symbols-outlined text-white/35 text-base ml-2">search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-[220px] bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/25"
              placeholder="Search tones..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
          {[['catalog', 'Curated Tones'], ['projects', `My Projects (${projects.length})`], ['exports', `My Exports (${renders.length})`]].map(([id, label]) => <button type="button" key={id} data-active={section === id} onClick={() => setSection(id)} className="workspace-library-tab rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-[0.18em]">{label}</button>)}
        </div>

        {section === 'catalog' && <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveState('all')}
            data-active={activeState === 'all'}
            className="workspace-library-tab rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-[0.2em]"
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
                data-active={activeState === state}
                className="workspace-library-tab rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-[0.2em]"
              >
                {meta.label}
              </button>
            );
          })}
        </div>}
      </div>

      {section === 'projects' && (projects.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((item) => <ProjectCard key={item.id} project={item} onEdit={onEditProject} />)}</div> : <Card className="workspace-library-card p-10 text-center"><h3 className="text-xl font-light text-white/70">No Studio projects yet</h3><p className="mt-2 text-sm text-white/35">Create your first private session in Cognistration Studio.</p></Card>)}

      {section === 'exports' && (renders.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{renders.map((item) => <RenderCard key={item.id} render={item} onEditProject={onEditProject} />)}</div> : <Card className="workspace-library-card p-10 text-center"><h3 className="text-xl font-light text-white/70">No exports yet</h3><p className="mt-2 text-sm text-white/35">Completed Railway renders will appear here.</p></Card>)}

      {section === 'catalog' && (totalVisible === 0 ? (
        <Card className="workspace-library-card p-10 text-center">
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
                    <ToneCard key={tone.id} tone={tone} onUseInStudio={onUseInStudio} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ))}
    </div>
  );
}
