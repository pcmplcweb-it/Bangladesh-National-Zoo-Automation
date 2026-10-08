// Animal feeding schedule and compliance (was each meal served on time?).
import { getState, mutate, delay } from './db';
import { demoFeedingDelay } from './demo';
import { now } from '../lib/clock';
import { todayKey, toMinutes, atTime, minutesOf, fromKey, eachDay } from '../lib/dates';
import { FEEDING_SCHEDULE, FEED_ON_TIME_MIN, FEED_MISSED_AFTER_MIN, ZOO } from '../data/master';

export const slotsForDay = (k) => FEEDING_SCHEDULE.filter((s) => s.days.includes(fromKey(k).getDay()));

// Status of one slot on day k:
// upcoming | due (window open, not fed yet) | ontime | early | late | very-late | missed (not fed)
export function slotStatus(k, slot) {
  const today = todayKey();
  const nowMin = k < today ? 24 * 60 : k > today ? -1 : now().getHours() * 60 + now().getMinutes();
  const due = toMinutes(slot.time);
  const real = getState().feedingLogs[`${k}|${slot.id}`];
  let log = real;
  if (!log && k >= ZOO.historyFrom) {
    const d = demoFeedingDelay(k, slot.id);
    if (d !== null && due + d <= nowMin && k <= today) {
      log = { fedAt: atTime(k, due + d), by: slot.keeperId, qty: slot.qty, note: '', demo: true };
    }
  }
  if (log) {
    const delayMin = Math.round(minutesOf(log.fedAt) - due);
    const status = delayMin < -FEED_ON_TIME_MIN ? 'early'
      : delayMin <= FEED_ON_TIME_MIN ? 'ontime' : delayMin <= FEED_MISSED_AFTER_MIN ? 'late' : 'very-late';
    return { slot, status, log, delayMin };
  }
  if (nowMin < due - FEED_ON_TIME_MIN) return { slot, status: 'upcoming' };
  if (nowMin <= due + FEED_MISSED_AFTER_MIN) return { slot, status: 'due', overdueMin: Math.max(0, nowMin - due) };
  return { slot, status: 'missed', overdueMin: nowMin - due };
}

export const dayFeeding = (k = todayKey()) => slotsForDay(k).map((s) => slotStatus(k, s));

export function feedingSummary(k = todayKey()) {
  const rows = dayFeeding(k);
  const c = { total: rows.length, ontime: 0, late: 0, missed: 0, due: 0, upcoming: 0 };
  for (const r of rows) {
    if (r.status === 'very-late' || r.status === 'early') c.late++; // off schedule
    else c[r.status]++;
  }
  c.done = c.ontime + c.late;
  c.compliance = c.done + c.missed ? Math.round((c.ontime / (c.done + c.missed)) * 100) : 100;
  return c;
}

export function feedingHistory(from, to) {
  return eachDay(from, to).map((k) => ({ date: k, ...feedingSummary(k) }));
}

export async function logFeeding(k, slot, { by, qty, note, fedAt }) {
  await delay(300);
  mutate((s) => {
    s.feedingLogs = { ...s.feedingLogs, [`${k}|${slot.id}`]: { fedAt: fedAt || now().toISOString(), by, qty, note } };
  });
}

export function undoFeeding(k, slot) {
  mutate((s) => {
    const next = { ...s.feedingLogs };
    delete next[`${k}|${slot.id}`];
    s.feedingLogs = next;
  });
}
