import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PracticeDayInputSchema,
  shiftDateKey,
  summarizePracticeDays,
  toDateKey
} from '../lib/member/practice.js';

test('practice input validates bounded dates, minutes, and statuses', () => {
  assert.doesNotThrow(() => PracticeDayInputSchema.parse({
    entryDate: '2026-08-30',
    status: 'completed',
    minutes: 60,
    targetMinutes: 60
  }));
  assert.throws(() => PracticeDayInputSchema.parse({ entryDate: '2026-02-30', status: 'completed', minutes: 20 }), /valid calendar date/);
  assert.throws(() => PracticeDayInputSchema.parse({ entryDate: '2026-08-30', status: 'completed', minutes: 1441, targetMinutes: 60 }), /minutes/);
});

test('practice summary calculates current and longest streaks from completed days', () => {
  const rows = [
    { entry_date: '2026-08-30', status: 'completed', minutes: 60, target_minutes: 60, updated_at: '2026-08-30T09:00:00Z' },
    { entry_date: '2026-08-29', status: 'completed', minutes: 30, target_minutes: 20, updated_at: '2026-08-29T09:00:00Z' },
    { entry_date: '2026-08-28', status: 'in_progress', minutes: 20, target_minutes: 20, updated_at: '2026-08-28T09:00:00Z' },
    { entry_date: '2026-08-26', status: 'completed', minutes: 15, target_minutes: 15, updated_at: '2026-08-26T09:00:00Z' }
  ];
  const summary = summarizePracticeDays(rows, new Date('2026-08-30T12:00:00Z'));
  assert.equal(summary.currentStreak, 2);
  assert.equal(summary.longestStreak, 2);
  assert.equal(summary.lastSevenMinutes, 125);
  assert.equal(summary.todayEntry.minutes, 60);
});

test('date helpers are deterministic for the member calendar', () => {
  assert.equal(toDateKey(new Date('2026-08-30T12:00:00Z')), '2026-08-30');
  assert.equal(shiftDateKey('2026-08-01', -1), '2026-07-31');
  assert.equal(shiftDateKey('2026-08-31', 1), '2026-09-01');
});
