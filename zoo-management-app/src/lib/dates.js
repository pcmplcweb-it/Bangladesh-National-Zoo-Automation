import { now } from './clock';

// All dates are handled as local "YYYY-MM-DD" strings (the zoo runs on Asia/Dhaka time).
const pad = (n) => String(n).padStart(2, '0');

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const todayKey = () => toKey(now());
export const addDays = (k, n) => {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
};
export const diffDays = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);
export const eachDay = (from, to) => {
  const out = [];
  for (let k = from; k <= to; k = addDays(k, 1)) out.push(k);
  return out;
};

// Week starts on Saturday in Bangladesh.
export const weekStart = (k) => {
  const d = fromKey(k);
  const back = (d.getDay() + 1) % 7;
  return addDays(k, -back);
};
export const monthStart = (k) => k.slice(0, 8) + '01';
export const monthEnd = (k) => {
  const d = fromKey(monthStart(k));
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return toKey(d);
};
export const yearStart = (k) => k.slice(0, 4) + '-01-01';

// Minutes since midnight <-> "HH:MM"
export const minutesNow = () => {
  const d = now();
  return d.getHours() * 60 + d.getMinutes();
};
export const hm = (min) => `${pad(Math.floor(min / 60))}:${pad(Math.round(min % 60))}`;
export const toMinutes = (s) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};
export const atTime = (k, min) => {
  const d = fromKey(k);
  d.setMinutes(min);
  return d.toISOString();
};
export const minutesOf = (iso) => {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const fmtDate = (k) => {
  const d = fromKey(k);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const fmtShort = (k) => {
  const d = fromKey(k);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const fmtMonth = (k) => {
  const d = fromKey(k);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const dayName = (k) => DAYS[fromKey(k).getDay()];
export const fmtTime = (iso) => {
  const d = new Date(iso);
  let h = d.getHours();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${pad(d.getMinutes())} ${ap}`;
};
export const fmtClock = (min) => {
  let h = Math.floor(min / 60);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${pad(Math.round(min % 60))} ${ap}`;
};
export const DAY_NAMES = DAYS;
