import { z } from 'zod';

export const PRACTICE_STATUSES = ['planned', 'in_progress', 'completed', 'skipped'];

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateKey(value) {
  if (!DATE_KEY_PATTERN.test(String(value || ''))) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toDateKey(value = new Date()) {
  if (typeof value === 'string' && DATE_KEY_PATTERN.test(value)) {
    return value;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function shiftDateKey(value, amount) {
  const date = parseDateKey(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + Number(amount || 0));
  return toDateKey(date);
}

export const PracticeDayInputSchema = z.object({
  entryDate: z.string().regex(DATE_KEY_PATTERN).refine((value) => Boolean(parseDateKey(value)), 'Use a valid calendar date'),
  status: z.enum(PRACTICE_STATUSES),
  minutes: z.coerce.number().int().min(0).max(1440),
  targetMinutes: z.coerce.number().int().min(5).max(60).default(20),
  sessionId: z.string().uuid().nullable().optional(),
  note: z.string().trim().max(240).optional()
}).strict();

function isCompleted(row) {
  return row?.status === 'completed';
}

function publicRow(row) {
  return {
    id: row.id,
    entryDate: row.entry_date || row.entryDate,
    status: row.status,
    minutes: Number(row.minutes || 0),
    targetMinutes: Number(row.target_minutes || row.targetMinutes || 20),
    sessionId: row.session_id || row.sessionId || null,
    note: row.note || '',
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt
  };
}

export function serializePracticeDay(row) {
  return row ? publicRow(row) : null;
}

export function summarizePracticeDays(rows = [], referenceDate = new Date()) {
  const byDate = new Map();
  for (const row of rows) {
    const entryDate = row?.entry_date || row?.entryDate;
    if (!parseDateKey(entryDate)) continue;
    const current = byDate.get(entryDate);
    if (!current || new Date(row.updated_at || row.updatedAt || 0) >= new Date(current.updated_at || current.updatedAt || 0)) {
      byDate.set(entryDate, row);
    }
  }

  const completedKeys = [...byDate.entries()]
    .filter(([, row]) => isCompleted(row))
    .map(([entryDate]) => entryDate)
    .sort();

  let longestStreak = 0;
  let runningStreak = 0;
  let previous = null;
  for (const entryDate of completedKeys) {
    runningStreak = previous && shiftDateKey(previous, 1) === entryDate ? runningStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, runningStreak);
    previous = entryDate;
  }

  const today = toDateKey(referenceDate);
  let currentStreak = 0;
  let cursor = today;
  if (!byDate.has(cursor) || !isCompleted(byDate.get(cursor))) {
    cursor = shiftDateKey(cursor, -1);
  }
  while (cursor && byDate.has(cursor) && isCompleted(byDate.get(cursor))) {
    currentStreak += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  const lastSevenDates = Array.from({ length: 7 }, (_, index) => shiftDateKey(today, -index));
  const lastSevenMinutes = lastSevenDates.reduce((total, entryDate) => total + Number(byDate.get(entryDate)?.minutes || 0), 0);
  const totalMinutes = [...byDate.values()].reduce((total, row) => total + Number(row.minutes || 0), 0);

  return {
    today,
    currentStreak,
    longestStreak,
    completedDays: completedKeys.length,
    totalMinutes,
    lastSevenMinutes,
    todayEntry: serializePracticeDay(byDate.get(today) || null)
  };
}
