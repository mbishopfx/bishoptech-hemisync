'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarBlank,
  Check,
  CheckCircle,
  Clock,
  Fire,
  Play,
  TrendUp
} from '@phosphor-icons/react';
import { authedFetch } from '@/lib/frontend/api';
import { shiftDateKey, toDateKey } from '@/lib/member/practice';

function formatDay(dateKey, options = {}) {
  if (!dateKey) return '';
  return new Intl.DateTimeFormat(undefined, { timeZone: 'UTC', ...options }).format(new Date(`${dateKey}T12:00:00Z`));
}

function replacePracticeDay(rows, next) {
  const withoutNext = rows.filter((row) => row.entryDate !== next.entryDate);
  return [next, ...withoutNext].sort((a, b) => b.entryDate.localeCompare(a.entryDate));
}

const PROGRESS_RING_RADIUS = 48;
const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS;

function ProgressRing({ progress }) {
  const value = Math.max(0, Math.min(100, Number(progress) || 0));
  const dashOffset = PROGRESS_RING_CIRCUMFERENCE * (1 - value / 100);

  return (
    <div className="daily-progress-ring relative mx-auto h-40 w-40 shrink-0" role="img" aria-label={`${value}% of today's practice target`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="60" cy="60" r={PROGRESS_RING_RADIUS} fill="none" stroke="rgba(84,132,119,.14)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={PROGRESS_RING_RADIUS}
          fill="none"
          stroke="#548477"
          strokeWidth="8"
          strokeDasharray={PROGRESS_RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap={value === 100 ? 'butt' : 'round'}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="daily-progress-ring__inner absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-[#f7f8f5] text-center shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
        <div className="flex items-baseline leading-none">
          <span className="text-[2.75rem] font-medium tracking-[-0.07em] text-[#1d302c]">{value}</span>
          <span className="ml-0.5 text-lg font-medium tracking-[-0.04em] text-[#315e55]">%</span>
        </div>
        <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#87968f]">today</span>
      </div>
    </div>
  );
}

export function DailyView({ onOpenStudio }) {
  const [days, setDays] = useState([]);
  const [summary, setSummary] = useState(null);
  const [targetMinutes, setTargetMinutes] = useState(20);
  const [selectedDate, setSelectedDate] = useState(toDateKey());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTracker = async () => {
    try {
      setError('');
      const data = await authedFetch('/api/member/tracker?days=42');
      setDays(data.practiceDays || []);
      setSummary(data.summary || null);
      if (data.summary?.todayEntry?.targetMinutes) setTargetMinutes(data.summary.todayEntry.targetMinutes);
    } catch (cause) {
      setError(cause.message || 'The practice tracker could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracker();
  }, []);

  const today = summary?.today || toDateKey();
  const todayEntry = summary?.todayEntry || days.find((day) => day.entryDate === today);
  const todayMinutes = Number(todayEntry?.minutes || 0);
  const todayTarget = Number(targetMinutes);
  const progress = Math.min(100, Math.round((todayMinutes / Math.max(1, todayTarget)) * 100));
  const calendar = useMemo(() => Array.from({ length: 14 }, (_, index) => shiftDateKey(today, -13 + index)), [today]);
  const selectedEntry = days.find((day) => day.entryDate === selectedDate);

  const saveToday = async (status, minutes = todayTarget, target = todayTarget) => {
    setSaving(true);
    setError('');
    try {
      const data = await authedFetch('/api/member/tracker', {
        method: 'POST',
        body: JSON.stringify({
          entryDate: today,
          status,
          minutes,
          targetMinutes: target
        })
      });
      const next = data.practiceDay;
      if (next) setDays((current) => replacePracticeDay(current, next));
      await loadTracker();
    } catch (cause) {
      setError(cause.message || 'Today could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const updateTarget = async (minutes) => {
    setTargetMinutes(minutes);
    if (todayEntry?.targetMinutes === minutes) return;
    await saveToday(todayEntry?.status || 'planned', todayMinutes, minutes);
  };

  return (
    <div className="workspace-daily space-y-8 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#548477]">
            <CalendarBlank size={16} weight="duotone" aria-hidden="true" />
            Daily practice
          </div>
          <h2 className="mt-3 text-4xl font-medium tracking-[-0.055em] text-[#1d302c] md:text-5xl">Give the day one clear interval.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#60716b]">Use this space to make the practice visible: set a realistic target, run a session, and keep a record of the days you returned.</p>
        </div>
        <button type="button" onClick={onOpenStudio} className="workspace-glass-button workspace-glass-button--primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium">
          Open 60-minute session <ArrowRight size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>

      {error && <div className="workspace-alert workspace-alert--error" role="alert">{error}</div>}

      <section className="daily-hero-card workspace-glass-card overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:p-9">
        <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr_auto]">
          <ProgressRing progress={progress} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#548477]">
              <CalendarBlank size={16} weight="duotone" aria-hidden="true" />
              {formatDay(today, { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <h3 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-[#1d302c]">{todayEntry?.status === 'completed' ? 'You made the return.' : 'Your listening hour is waiting.'}</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#60716b]">{todayEntry?.status === 'completed' ? 'The important part is consistency, not perfect conditions. Come back tomorrow when you are ready.' : 'A small, repeatable interval gives the room less say over where your attention goes.'}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={onOpenStudio} className="workspace-glass-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium" disabled={saving}>
                <Play size={16} weight="fill" aria-hidden="true" />
                {todayEntry?.status === 'completed' ? 'Open another session' : 'Start a session'}
              </button>
              <button type="button" onClick={() => saveToday('completed')} disabled={saving || todayEntry?.status === 'completed'} className="workspace-glass-button workspace-glass-button--quiet inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium">
                <Check size={16} weight="bold" aria-hidden="true" />
                {saving ? 'Saving…' : todayEntry?.status === 'completed' ? 'Logged for today' : `Log ${todayTarget} minutes`}
              </button>
            </div>
          </div>

          <div className="min-w-[190px] rounded-[1.5rem] border border-[#dbe2dd] bg-white/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#60716b]">Daily target</span>
              <Clock size={16} className="text-[#548477]" aria-hidden="true" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-medium tracking-[-0.05em] text-[#1d302c]">{todayTarget}</span>
              <span className="text-sm text-[#87968f]">minutes</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[15, 20, 30, 60].map((minutes) => (
                <button key={minutes} type="button" onClick={() => updateTarget(minutes)} disabled={saving} className={`rounded-full px-3 py-1.5 text-xs transition disabled:cursor-wait disabled:opacity-60 ${todayTarget === minutes ? 'bg-[#dcece3] text-[#315e55]' : 'bg-[#eef1ee] text-[#87968f] hover:bg-[#e3ebe5] hover:text-[#315e55]'}`}>
                  {minutes}m
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="workspace-glass-card rounded-[2rem] p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="workspace-kicker">Return pattern</p>
              <h3 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#1d302c]">The last two weeks</h3>
            </div>
            <p className="text-sm text-[#60716b]">{summary?.completedDays || 0} completed days total</p>
          </div>

          {loading ? (
            <div className="mt-8 h-28 animate-pulse rounded-2xl bg-[#eef1ee]" aria-label="Loading practice history" />
          ) : (
            <div className="mt-8 grid grid-cols-7 gap-2 sm:gap-3">
              {calendar.map((dateKey) => {
                const entry = days.find((day) => day.entryDate === dateKey);
                const complete = entry?.status === 'completed';
                const isToday = dateKey === today;
                const isSelected = dateKey === selectedDate;
                return (
                  <button key={dateKey} type="button" onClick={() => setSelectedDate(dateKey)} className={`group rounded-2xl border p-2 text-center transition sm:p-3 ${isSelected ? 'border-[#9fbdad] bg-[#edf6f0]' : 'border-[#e1e8e3] bg-white/35 hover:-translate-y-0.5 hover:border-[#b8cbc0] hover:bg-white/70'}`} aria-label={`${formatDay(dateKey, { month: 'long', day: 'numeric' })}${complete ? ', completed' : ', not completed'}`}>
                    <span className={`block text-[10px] uppercase tracking-[0.12em] ${isToday ? 'font-semibold text-[#548477]' : 'text-[#9aa8a1]'}`}>{formatDay(dateKey, { weekday: 'short' })}</span>
                    <span className="mt-2 block text-sm font-medium text-[#60716b]">{formatDay(dateKey, { day: 'numeric' })}</span>
                    <span className={`mx-auto mt-3 flex size-7 items-center justify-center rounded-full border ${complete ? 'border-[#9fbdad] bg-[#dcece3] text-[#315e55]' : 'border-[#dbe2dd] bg-[#f7f8f5] text-[#b5c0ba] group-hover:border-[#b8cbc0]'}`}>
                      {complete ? <Check size={14} weight="bold" aria-hidden="true" /> : <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#e1e8e3] pt-5 text-xs text-[#87968f]">
            <span>{selectedDate === today ? 'Today' : formatDay(selectedDate, { month: 'long', day: 'numeric' })}</span>
            <span>{selectedEntry ? `${selectedEntry.minutes} minutes · ${selectedEntry.status.replace('_', ' ')}` : 'No practice logged'}</span>
          </div>
        </div>

        <div className="workspace-glass-card rounded-[2rem] p-5 sm:p-7">
          <p className="workspace-kicker">Keep the signal visible</p>
          <h3 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#1d302c]">Your rhythm at a glance</h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-[#e1e8e3] bg-white/35 p-4"><span className="flex items-center gap-2 text-sm text-[#60716b]"><Fire size={18} className="text-[#a77d62]" aria-hidden="true" /> Current streak</span><strong className="text-xl font-medium text-[#1d302c]">{summary?.currentStreak || 0} days</strong></div>
            <div className="flex items-center justify-between rounded-2xl border border-[#e1e8e3] bg-white/35 p-4"><span className="flex items-center gap-2 text-sm text-[#60716b]"><TrendUp size={18} className="text-[#548477]" aria-hidden="true" /> Last 7 days</span><strong className="text-xl font-medium text-[#1d302c]">{summary?.lastSevenMinutes || 0} min</strong></div>
            <div className="flex items-center justify-between rounded-2xl border border-[#e1e8e3] bg-white/35 p-4"><span className="flex items-center gap-2 text-sm text-[#60716b]"><CheckCircle size={18} className="text-[#548477]" aria-hidden="true" /> Longest streak</span><strong className="text-xl font-medium text-[#1d302c]">{summary?.longestStreak || 0} days</strong></div>
          </div>
          <div className="mt-6 rounded-2xl bg-[#edf6f0] p-4 text-sm leading-6 text-[#526e64]">Consistency is a gentle record, not a score. Use the journal when you want to capture what changed between sessions.</div>
        </div>
      </section>
    </div>
  );
}
