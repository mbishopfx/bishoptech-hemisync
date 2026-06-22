'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { authedFetch } from '@/lib/frontend/api';

export function JournalView({ onInjectToWorkshop, onDirectGenerate }) {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const fetchEntries = async () => {
    try {
      const data = await authedFetch('/api/journal');
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmitJournal = async (e, shouldGenerateBeat = false) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setAnalyzing(true);
    setError('');
    try {
      const data = await authedFetch('/api/journal', {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() })
      });
      
      const savedEntry = data.journal_entry;
      const originalText = text.trim();
      setText('');
      await fetchEntries();

      if (shouldGenerateBeat && savedEntry) {
        const intentMeta = getIntentBadgeMeta(savedEntry.intent);
        if (onDirectGenerate) {
          onDirectGenerate({
            state: intentMeta.state,
            snippet: originalText.slice(0, 60)
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper to get intent color mapping for badges
  const getIntentBadgeMeta = (intent = '') => {
    const raw = intent.toLowerCase();
    if (raw.includes('sleep')) return { label: 'Delta / Sleep Prep', color: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300', state: 'delta' };
    if (raw.includes('relax') || raw.includes('calm')) return { label: 'Alpha / Calm Flow', color: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300', state: 'alpha' };
    if (raw.includes('focus') || raw.includes('alert')) return { label: 'Beta / Task Focus', color: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300', state: 'beta' };
    return { label: 'Theta / Meditation', color: 'border-purple-500/20 bg-purple-500/10 text-purple-300', state: 'theta' };
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Journal Reflection Editor */}
      <Card className="bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/20 transition-all">
        <div className="absolute top-0 right-0 w-[450px] h-[150px] bg-cyan-500/[0.03] blur-[60px] pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Reflection Terminal</p>
            <h3 className="text-xl font-light text-white mt-1">Record Consciousness State</h3>
          </div>
          <span className="material-symbols-outlined text-cyan-500 text-2xl">edit_note</span>
        </div>

        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={analyzing}
            placeholder="Write down your current feelings, mental focus, meditation insights, or physical sensations. The deconstruction node will automatically synthesize the optimal brain state frequency..."
            className="w-full bg-black/20 border-white/10 focus:border-cyan-500/30 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 outline-none resize-none focus:ring-0 min-h-[140px] leading-relaxed font-light"
          />

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/5">
            <span className="text-[10px] font-mono text-white/30 tracking-wider">Supports real-time neuro-intent analysis</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={(e) => handleSubmitJournal(e, false)}
                disabled={analyzing || !text.trim()}
                variant="ghost"
                className="rounded-full text-white/60 hover:text-white border border-white/5 hover:bg-white/5"
              >
                Save Reflection Only
              </Button>
              
              <Button
                type="button"
                onClick={(e) => handleSubmitJournal(e, true)}
                disabled={analyzing || !text.trim()}
                className="rounded-full bg-cyan-500 text-black hover:bg-cyan-400 font-semibold px-6 transition-all flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Analyzing Intent...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">sensors</span>
                    Analyze & Generate Beat
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Cyber-neon laser scanning overlay during analysis */}
        {analyzing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 z-50">
            {/* Pulsing circular scanner */}
            <div className="relative size-20 rounded-full border border-cyan-500 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
              <div className="absolute inset-1 rounded-full border border-dashed border-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="material-symbols-outlined text-cyan-400 text-2xl animate-pulse">psychology</span>
            </div>
            
            {/* Scanning line animation */}
            <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-0 animate-[bounce_2s_infinite]" />

            <div className="text-center">
              <p className="text-sm font-mono tracking-widest text-cyan-300 uppercase animate-pulse">Deconstructing Neuro-Intent...</p>
              <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Generating resonance parameters</p>
            </div>
          </div>
        )}
      </Card>

      {/* Timeline of past Journal Entries */}
      <div className="space-y-6">
        <div className="border-b border-white/5 pb-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Chronicle Timeline</p>
          <h3 className="text-2xl font-light text-white mt-1">Consciousness Archive</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-cyan-500 text-3xl">sync</span>
            <p className="text-xs text-white/35 font-mono uppercase tracking-widest mt-4">Accessing Archive...</p>
          </div>
        ) : entries.length === 0 ? (
          <Card className="border-white/5 bg-zinc-900/40 p-16 text-center rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent pointer-events-none" />
            <span className="material-symbols-outlined text-white/10 text-5xl mb-4">border_color</span>
            <h4 className="text-lg font-light text-white/70">Archive is currently blank</h4>
            <p className="text-sm text-white/30 mt-2 max-w-md mx-auto leading-relaxed">
              No entries committed yet. Begin journaling to log your mental focus sessions, meditation paths, and synthesize custom Cognistration files.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => {
              const intentMeta = getIntentBadgeMeta(entry.intent);

              return (
                <Card key={entry.id} className="bg-zinc-900/40 border-white/5 backdrop-blur-3xl p-6 rounded-3xl hover:border-white/10 transition-all relative overflow-hidden group">
                  {/* Subtle hover background glow matching intent */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-cyan-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Top Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-widest ${intentMeta.color}`}>
                            {intentMeta.label}
                          </span>
                          {entry.sentiment && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/60">
                              {entry.sentiment}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-white/30 font-mono">
                          {new Date(entry.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      {/* Original Reflection */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Original Entry</p>
                        <p className="text-sm text-white/80 leading-relaxed font-light italic">&quot;{entry.text}&quot;</p>
                      </div>

                      {/* AI Summary */}
                      {entry.summary && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Resonance Analysis</p>
                          <p className="text-sm text-cyan-100/70 leading-relaxed font-light">{entry.summary}</p>
                        </div>
                      )}

                      {/* Shifts and Insights */}
                      <div className="grid gap-4 sm:grid-cols-2 pt-2">
                        {entry.cognitive_shifts && (
                          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">Cognitive Shifts</p>
                            <p className="text-xs text-white/60 leading-relaxed mt-2">{entry.cognitive_shifts}</p>
                          </div>
                        )}
                        {entry.ai_insights && (
                          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-400">Neural Insights</p>
                            <p className="text-xs text-white/60 leading-relaxed mt-2">
                              {typeof entry.ai_insights === 'string' 
                                ? entry.ai_insights 
                                : Array.isArray(entry.ai_insights)
                                  ? entry.ai_insights.join(', ')
                                  : JSON.stringify(entry.ai_insights)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mapped Cognistration CTA card */}
                    <div className="md:w-72 flex flex-col justify-between p-5 bg-cyan-500/[0.02] border border-cyan-500/10 rounded-2xl shrink-0 relative overflow-hidden group/cta hover:border-cyan-500/30 transition-all">
                      <div className="absolute top-0 right-0 w-[150px] h-[80px] bg-cyan-500/5 blur-[30px] pointer-events-none" />
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-cyan-400">
                          <span className="material-symbols-outlined text-lg animate-pulse">radio</span>
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Binaural Synthesis</span>
                        </div>
                        <h4 className="text-base font-semibold text-white">Inject Matched Plan</h4>
                        <p className="text-xs text-white/55 leading-relaxed">
                          Automatically configure the audio workshop with target parameters matched to this reflection&apos;s intent.
                        </p>
                      </div>

                      <div className="mt-6 space-y-2">
                        <Button
                          onClick={() => onDirectGenerate?.({
                            state: intentMeta.state,
                            snippet: entry.text.slice(0, 60)
                          })}
                          className="w-full rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold tracking-wider text-[10px] font-mono uppercase transition-all py-2.5 flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                        >
                          Generate Now
                          <span className="material-symbols-outlined text-xs">bolt</span>
                        </Button>
                        <Button
                          onClick={() => onInjectToWorkshop?.({
                            state: intentMeta.state,
                            notes: entry.summary || entry.text
                          })}
                          variant="ghost"
                          className="w-full rounded-full border border-white/5 text-white/60 hover:text-white text-[10px] font-mono uppercase transition-all py-2.5 flex items-center justify-center gap-2"
                        >
                          Load in Composer
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

