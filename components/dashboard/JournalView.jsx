'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookmarkSimple,
  CaretDown,
  Check,
  Funnel,
  LockKey,
  MagnifyingGlass,
  PencilSimple,
  Star,
  Tag,
  X
} from '@phosphor-icons/react';
import { authedFetch } from '@/lib/frontend/api';

const DRAFT_KEY = 'cognistration-journal-draft-v2';
const MOODS = [
  { value: 'clear', label: 'Clear' },
  { value: 'steady', label: 'Steady' },
  { value: 'overloaded', label: 'Overloaded' },
  { value: 'tender', label: 'Tender' },
  { value: 'energized', label: 'Energized' },
  { value: 'restless', label: 'Restless' }
];
const FOCUS_AREAS = ['Work', 'Rest', 'Meditation', 'Creative', 'Relationships', 'General'];
const PROMPTS = [
  'What is asking for my attention right now?',
  'What would make the next hour feel chosen?',
  'What can I set down before I begin?'
];

function intentMeta(intent = '') {
  const value = intent.toLowerCase();
  if (value.includes('sleep')) return { label: 'Sleepward', state: 'delta', tone: 'plum' };
  if (value.includes('relax') || value.includes('calm')) return { label: 'Settle', state: 'alpha', tone: 'sage' };
  if (value.includes('focus') || value.includes('alert')) return { label: 'Focus', state: 'beta', tone: 'blue' };
  return { label: 'Reflect', state: 'theta', tone: 'sand' };
}
function formatEntryDate(value) {
  if (!value) return 'Recently';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function insightText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(' · ');
  return value.note || value.summary || '';
}

const EMPTY_FORM = {
  title: '',
  text: '',
  mood: '',
  energy: 3,
  focusArea: '',
  tags: ''
};

export function JournalView({ onInjectToStudio, onDirectGenerate }) {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const fetchEntries = async () => {
    try {
      setError('');
      const data = await authedFetch('/api/journal?limit=100');
      setEntries(data.entries || []);
    } catch (cause) {
      setError(cause.message || 'Your private journal could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    try {
      const draft = window.localStorage.getItem(DRAFT_KEY);
      if (draft) setForm({ ...EMPTY_FORM, ...JSON.parse(draft) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (form.text || form.title) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      else window.localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }, [form]);

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const meta = intentMeta(entry.intent);
      const matchesFilter = filter === 'all' || meta.state === filter || (filter === 'saved' && entry.is_favorite);
      if (!matchesFilter) return false;
      if (!needle) return true;
      return [entry.title, entry.text, entry.summary, entry.intent, entry.focus_area, ...(entry.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [entries, filter, query]);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submitJournal = async (event, analyze) => {
    event?.preventDefault();
    if (!form.text.trim()) return;
    setSaving(true);
    setError('');
    setSavedMessage('');
    try {
      const data = await authedFetch('/api/journal', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          text: form.text.trim(),
          title: form.title.trim() || undefined,
          mood: form.mood || undefined,
          focusArea: form.focusArea || undefined,
          tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          analyze
        })
      });
      const savedEntry = data.journal_entry;
      setEntries((current) => [savedEntry, ...current.filter((entry) => entry.id !== savedEntry.id)]);
      setForm(EMPTY_FORM);
      setSavedMessage(analyze ? 'Saved with a listening-direction suggestion.' : 'Saved privately. No reflection text was sent for analysis.');
      if (analyze && savedEntry) {
        const meta = intentMeta(savedEntry.intent);
        onDirectGenerate?.({ state: meta.state, snippet: savedEntry.text.slice(0, 80), notes: savedEntry.summary || savedEntry.text });
      }
    } catch (cause) {
      setError(cause.message || 'The reflection could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (entry) => {
    setUpdatingId(entry.id);
    try {
      const data = await authedFetch('/api/journal', {
        method: 'PATCH',
        body: JSON.stringify({ id: entry.id, isFavorite: !entry.is_favorite })
      });
      setEntries((current) => current.map((item) => item.id === entry.id ? data.journal_entry : item));
    } catch (cause) {
      setError(cause.message || 'That reflection could not be updated.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="workspace-journal space-y-8 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#548477]"><PencilSimple size={16} weight="duotone" aria-hidden="true" /> Private journal</div>
          <h2 className="mt-3 text-4xl font-medium tracking-[-0.055em] text-[#1d302c] md:text-5xl">Make the inside of the day visible.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#60716b]">A calm place to name what is present, save what you notice, and optionally turn a reflection into a Studio starting point.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#dbe2dd] bg-white/45 px-4 py-2 text-xs text-[#60716b]"><LockKey size={15} weight="duotone" className="text-[#548477]" aria-hidden="true" /> Private to your account</div>
      </div>

      {error && <div className="workspace-alert workspace-alert--error" role="alert">{error}</div>}
      {savedMessage && <div className="workspace-alert workspace-alert--success" role="status"><Check size={16} weight="bold" aria-hidden="true" /> {savedMessage}</div>}

      <section className="workspace-glass-card overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#e1e8e3] pb-6">
          <div>
            <p className="workspace-kicker">New reflection</p>
            <h3 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#1d302c]">Write from the moment</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#87968f]"><BookmarkSimple size={16} weight="duotone" aria-hidden="true" /> Drafts stay in this browser until you save.</div>
        </div>

        <form onSubmit={(event) => submitJournal(event, true)} className="mt-7 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-5">
            <label className="block space-y-2"><span className="workspace-field-label">Title <span className="font-normal normal-case tracking-normal text-[#a3afa8]">(optional)</span></span><input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="A note for this moment" className="workspace-text-input text-lg" maxLength={120} /></label>
            <div className="space-y-3">
              <span className="workspace-field-label">Begin with a prompt</span>
              <div className="flex flex-wrap gap-2">{PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => updateField('text', form.text ? `${form.text}\n\n${prompt} ` : `${prompt} `)} className="rounded-full border border-[#dbe2dd] bg-white/35 px-3 py-2 text-left text-xs text-[#60716b] transition hover:-translate-y-0.5 hover:border-[#b8cbc0] hover:bg-white/70">{prompt}</button>)}</div>
            </div>
            <label className="block space-y-2"><span className="workspace-field-label">Reflection</span><textarea value={form.text} onChange={(event) => updateField('text', event.target.value)} placeholder="What is here right now? You do not need to solve it before you name it." className="workspace-textarea min-h-[210px]" maxLength={5000} /><span className="block text-right text-[11px] text-[#a0aca5]">{form.text.length}/5000</span></label>
          </div>

          <aside className="space-y-6 rounded-[1.5rem] border border-[#e1e8e3] bg-white/35 p-5 sm:p-6">
            <div><p className="workspace-field-label">How are you arriving?</p><div className="mt-3 flex flex-wrap gap-2">{MOODS.map((mood) => <button key={mood.value} type="button" onClick={() => updateField('mood', mood.value)} className={`rounded-full border px-3 py-2 text-xs transition ${form.mood === mood.value ? 'border-[#9fbdad] bg-[#dcece3] text-[#315e55]' : 'border-[#dbe2dd] bg-white/35 text-[#60716b] hover:border-[#b8cbc0] hover:bg-white/70'}`}>{mood.label}</button>)}</div></div>
            <label className="block space-y-3"><span className="flex items-center justify-between workspace-field-label"><span>Energy</span><output className="rounded-full bg-[#edf6f0] px-2.5 py-1 text-xs font-medium normal-case tracking-normal text-[#548477]">{form.energy}/5</output></span><input type="range" min="1" max="5" step="1" value={form.energy} onChange={(event) => updateField('energy', Number(event.target.value))} className="workspace-range w-full" aria-label="Energy level" /><span className="flex justify-between text-[11px] text-[#a0aca5]"><span>Low</span><span>Full</span></span></label>
            <div><p className="workspace-field-label">What is this for?</p><div className="mt-3 grid grid-cols-2 gap-2">{FOCUS_AREAS.map((area) => <button key={area} type="button" onClick={() => updateField('focusArea', area)} className={`rounded-xl border px-3 py-2.5 text-left text-xs transition ${form.focusArea === area ? 'border-[#9fbdad] bg-[#edf6f0] font-medium text-[#315e55]' : 'border-[#e1e8e3] bg-white/35 text-[#60716b] hover:border-[#b8cbc0] hover:bg-white/70'}`}>{area}</button>)}</div></div>
            <label className="block space-y-2"><span className="workspace-field-label">Tags <span className="font-normal normal-case tracking-normal text-[#a3afa8]">(comma separated)</span></span><div className="relative"><Tag size={16} className="absolute left-3 top-3.5 text-[#87968f]" aria-hidden="true" /><input value={form.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="evening, reset" className="workspace-text-input pl-9 text-sm" /></div></label>
          </aside>

          <div className="flex flex-col gap-4 border-t border-[#e1e8e3] pt-6 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
            <p className="max-w-md text-xs leading-5 text-[#87968f]">Save privately to keep the original wording. Shape a session sends the reflection to the optional assistant only to suggest a direction.</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={(event) => submitJournal(event, false)} disabled={saving || !form.text.trim()} className="workspace-glass-button workspace-glass-button--quiet rounded-full px-4 py-2.5 text-sm font-medium">{saving ? 'Saving…' : 'Save privately'}</button>
              <button type="submit" disabled={saving || !form.text.trim()} className="workspace-glass-button workspace-glass-button--primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">{saving ? 'Saving…' : 'Shape a session'} <ArrowRight size={16} weight="bold" aria-hidden="true" /></button>
            </div>
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="workspace-kicker">Your archive</p><h3 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#1d302c]">Reflections worth returning to</h3></div>
        <div className="journal-archive-controls grid w-full gap-3 sm:w-auto sm:grid-cols-[minmax(18rem,1fr)_minmax(12rem,auto)]">
          <label className="workspace-control-field relative block">
            <MagnifyingGlass size={16} className="workspace-control-icon absolute left-4 top-1/2 -translate-y-1/2 text-[#87968f]" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reflections" className="workspace-text-input workspace-leading-input text-sm" />
            <button type="button" onClick={() => setQuery('')} className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#87968f] transition hover:bg-[#eef1ee] ${query ? '' : 'pointer-events-none opacity-0'}`} aria-label="Clear search"><X size={14} /></button>
          </label>
          <label className="workspace-control-field relative block">
            <Funnel size={15} className="workspace-control-icon absolute left-4 top-1/2 -translate-y-1/2 text-[#87968f]" aria-hidden="true" />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="workspace-select workspace-leading-select text-sm"><option value="all">All reflections</option><option value="theta">Reflect</option><option value="alpha">Settle</option><option value="beta">Focus</option><option value="delta">Sleepward</option><option value="saved">Starred</option></select>
            <CaretDown size={14} className="workspace-control-caret absolute right-4 top-1/2 -translate-y-1/2 text-[#87968f]" aria-hidden="true" />
          </label>
        </div>
      </section>

      {loading ? (
        <div className="space-y-4" aria-label="Loading journal"><div className="h-48 animate-pulse rounded-[2rem] bg-[#e5ebe6]" /><div className="h-40 animate-pulse rounded-[2rem] bg-[#e5ebe6]" /></div>
      ) : filteredEntries.length === 0 ? (
        <div className="workspace-glass-card rounded-[2rem] px-6 py-16 text-center"><PencilSimple size={34} weight="duotone" className="mx-auto text-[#9fbdad]" aria-hidden="true" /><h4 className="mt-4 text-xl font-medium text-[#1d302c]">{entries.length ? 'Nothing matches this view.' : 'Your first reflection can start here.'}</h4><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#60716b]">{entries.length ? 'Try another search or filter.' : 'There is no right length or tone. A single honest sentence is enough.'}</p>{entries.length > 0 && <button type="button" onClick={() => { setQuery(''); setFilter('all'); }} className="mt-5 text-sm font-medium text-[#548477] underline underline-offset-4">Clear filters</button>}</div>
      ) : (
        <div className="space-y-5">
          {filteredEntries.map((entry) => {
            const meta = intentMeta(entry.intent);
            const insight = insightText(entry.ai_insights);
            return (
              <article key={entry.id} className={`workspace-glass-card journal-entry-card journal-entry-card--${meta.tone} rounded-[2rem] p-5 sm:p-7`}>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="journal-intent-pill">{meta.label}</span>{entry.focus_area && <span className="rounded-full border border-[#e1e8e3] bg-white/35 px-3 py-1 text-xs text-[#60716b]">{entry.focus_area}</span>}<span className="text-xs text-[#a0aca5]">{formatEntryDate(entry.created_at)}</span></div>
                    <div className="mt-4 flex items-start justify-between gap-4"><div><h4 className="text-xl font-medium tracking-[-0.03em] text-[#1d302c]">{entry.title || 'Reflection'}</h4><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#526e64]">{entry.text}</p></div><button type="button" onClick={() => toggleFavorite(entry)} disabled={updatingId === entry.id} className={`shrink-0 rounded-full p-2.5 transition hover:-translate-y-0.5 ${entry.is_favorite ? 'bg-[#edf6f0] text-[#a77d62]' : 'bg-[#f3f6f3] text-[#a0aca5] hover:bg-[#e8f0ea] hover:text-[#548477]'}`} aria-label={entry.is_favorite ? 'Remove star' : 'Star reflection'}>{entry.is_favorite ? <Star size={18} weight="fill" /> : <Star size={18} />}</button></div>
                    {(entry.summary || insight) && <div className="mt-5 grid gap-3 md:grid-cols-2"><div className="rounded-2xl border border-[#e1e8e3] bg-white/35 p-4"><p className="workspace-field-label">A short mirror</p><p className="mt-2 text-sm leading-6 text-[#60716b]">{entry.summary || 'No summary was requested for this entry.'}</p></div>{insight && <div className="rounded-2xl border border-[#e1e8e3] bg-white/35 p-4"><p className="workspace-field-label">Session note</p><p className="mt-2 text-sm leading-6 text-[#60716b]">{insight}</p></div>}</div>}
                    {(entry.tags || []).length > 0 && <div className="mt-4 flex flex-wrap gap-2">{entry.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#eef1ee] px-2.5 py-1 text-[11px] text-[#87968f]"><Tag size={12} aria-hidden="true" />{tag}</span>)}</div>}
                  </div>
                  <div className="flex w-full shrink-0 flex-col gap-2 rounded-[1.5rem] border border-[#e1e8e3] bg-white/35 p-4 lg:w-56"><p className="workspace-field-label">Use this reflection</p><button type="button" onClick={() => onDirectGenerate?.({ state: meta.state, snippet: entry.text.slice(0, 80), notes: entry.summary || entry.text })} className="workspace-glass-button workspace-glass-button--primary inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium">Shape a session <ArrowRight size={14} weight="bold" aria-hidden="true" /></button><button type="button" onClick={() => onInjectToStudio?.({ state: meta.state, notes: entry.summary || entry.text })} className="workspace-glass-button workspace-glass-button--quiet rounded-xl px-3 py-2.5 text-xs font-medium">Load into Studio</button></div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
