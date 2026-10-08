// Browser-side store standing in for the backend database. Everything the user creates
// (bookings, gate scans, feeding logs, attendance, leave) is saved in localStorage.
// Demo history is generated on the fly by services/demo.js and is never stored.
import { useMemo, useSyncExternalStore, useEffect, useState } from 'react';
import { onClockChange } from '../lib/clock';
import { seedLeaves } from './demo';

const KEY = 'bnz-mgmt-v1';

function fresh() {
  return {
    tickets: {}, // id -> ticket (bookings, plus demo tickets once staff touch them)
    feedingLogs: {}, // `${date}|${slotId}` -> log
    attendance: {}, // `${date}|${employeeId}` -> record
    leaves: seedLeaves(),
    employees: [], // employees added in the app (in addition to master data)
  };
}

let state;
try {
  state = JSON.parse(localStorage.getItem(KEY)) || fresh();
} catch {
  state = fresh();
}
let version = 0;
const listeners = new Set();

export const getState = () => state;

// mutate(fn): fn may change `state` in place; changes are saved and every view refreshes.
export function mutate(fn) {
  const result = fn(state);
  state = { ...state };
  version++;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* storage full or blocked: keep working in memory */ }
  listeners.forEach((l) => l());
  return result;
}

export function resetDemoData() {
  state = fresh();
  mutate(() => {});
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// Re-render every `ms` so time-based figures (inside now, feeding due…) stay live.
export function useTick(ms = 15000) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), ms);
    const off = onClockChange(() => setT((x) => x + 1));
    return () => {
      clearInterval(id);
      off();
    };
  }, [ms]);
  return t;
}

// useLive(() => compute(), [deps]) — recomputes when the store changes or the clock ticks.
export function useLive(fn, deps = []) {
  const v = useSyncExternalStore(subscribe, () => version);
  const tick = useTick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(fn, [v, tick, ...deps]);
}

// Simulates network latency for write actions so loading states are visible.
export const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
