// Central clock. Every "now" in the app goes through here so a demo time can be set
// (e.g. to see the live dashboard at 2 PM when you open the app at night).
const KEY = 'bnz-demo-time';
let offsetMs = 0;
try {
  const saved = localStorage.getItem(KEY);
  if (saved) offsetMs = Number(saved) || 0;
} catch { /* storage unavailable */ }

const listeners = new Set();
export const now = () => new Date(Date.now() + offsetMs);
export const isDemoTime = () => offsetMs !== 0;

// Set today's clock to "HH:MM" (null = back to the real clock).
export function setDemoTime(hhmm) {
  if (!hhmm) offsetMs = 0;
  else {
    const [h, m] = hhmm.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    offsetMs = target - Date.now();
  }
  try {
    if (offsetMs) localStorage.setItem(KEY, String(offsetMs));
    else localStorage.removeItem(KEY);
  } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export const onClockChange = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
