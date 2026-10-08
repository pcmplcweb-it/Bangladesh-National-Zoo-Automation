// Deterministic demo data: daily ticket history, today's individual tickets, feeding and attendance.
// Replace with API calls once the backend exists — the shapes here are the shapes the UI expects.
import { rng, between, gauss, pick } from '../lib/rng';
import { addDays, fromKey, toKey, atTime, diffDays, todayKey } from '../lib/dates';
import { ZOO, PRICE, TYPE_IDS, EMPLOYEES, SHIFTS, FEEDING_SCHEDULE, GATES } from '../data/master';

// Public holidays & Eid days get extra visitors (approximate dates).
const BIG_DAYS = {
  '2025-02-21': 2.2, '2025-03-26': 2.4, '2025-04-01': 3.2, '2025-04-02': 2.8, '2025-04-03': 2.2, '2025-04-14': 2.6,
  '2025-06-08': 3.0, '2025-06-09': 2.6, '2025-06-10': 2.0, '2025-12-16': 2.5, '2025-12-25': 1.8,
  '2026-02-21': 2.2, '2026-03-21': 3.2, '2026-03-22': 2.8, '2026-03-23': 2.2, '2026-03-26': 2.4, '2026-04-14': 2.6,
  '2026-05-28': 3.0, '2026-05-29': 2.6, '2026-05-30': 2.0, '2026-12-16': 2.5, '2026-12-25': 1.8,
};
const SEASON = [1.35, 1.3, 1.1, 0.95, 0.8, 0.7, 0.7, 0.8, 0.85, 1.0, 1.15, 1.4];
const WEEKDAY = [0, 1, 0.95, 0.95, 1.05, 2.5, 2.1]; // Sun closed, Fri/Sat weekend

export const isOpen = (k) => ZOO.openDays.includes(fromKey(k).getDay());

// Planned visitor numbers for a date — used for history and to size today's demo tickets.
export function dayPlan(k) {
  const empty = { male: 0, female: 0, child: 0, student: 0, onlineShare: 0 };
  if (!isOpen(k) || k < ZOO.historyFrom) return empty;
  const d = fromKey(k);
  const r = rng('plan' + k);
  const trend = 1 + 0.08 * (diffDays(ZOO.historyFrom, k) / 365);
  const base = 1500 * WEEKDAY[d.getDay()] * SEASON[d.getMonth()] * trend * (BIG_DAYS[k] || 1);
  const visitors = Math.max(80, Math.round(base * (0.85 + r() * 0.3)));
  const weekend = d.getDay() === 5 || d.getDay() === 6;
  const schoolMonth = ![5, 6, 11].includes(d.getMonth());
  const studentShare = weekend || BIG_DAYS[k] ? 0.02 : schoolMonth ? 0.11 : 0.04;
  const childShare = 0.22 + r() * 0.05 + (weekend ? 0.03 : 0);
  const femaleShare = (1 - studentShare - childShare) * (0.44 + r() * 0.06);
  const student = Math.round(visitors * studentShare);
  const child = Math.round(visitors * childShare);
  const female = Math.round(visitors * femaleShare);
  const male = visitors - student - child - female;
  const onlineShare = Math.min(0.45, 0.18 + 0.22 * (diffDays(ZOO.historyFrom, k) / 640) + (weekend ? 0.05 : 0));
  return { male, female, child, student, onlineShare };
}

// Aggregated history for a past day (individual tickets are not generated for history).
export function dayHistory(k) {
  const p = dayPlan(k);
  const visitors = p.male + p.female + p.child + p.student;
  const r = rng('hist' + k);
  const revenue = TYPE_IDS.reduce((s, t) => s + p[t] * PRICE[t], 0);
  const tickets = Math.round(visitors / (3.1 + r() * 0.4));
  const online = Math.round(tickets * p.onlineShare);
  const onlineVisitors = Math.round(visitors * p.onlineShare);
  const noShow = Math.round(onlineVisitors * 0.03);
  return {
    date: k,
    tickets,
    visitors,
    male: p.male, female: p.female, child: p.child, student: p.student,
    revenue,
    onlineTickets: online,
    counterTickets: tickets - online,
    onlineRevenue: Math.round(revenue * p.onlineShare),
    entered: visitors - noShow,
    exited: visitors - noShow,
  };
}

// --- Today's demo tickets -----------------------------------------------------------------

// Arrival time weights per hour 9..16 (peaks late morning and mid afternoon).
const ARRIVAL = [6, 14, 17, 12, 9, 13, 16, 9];
function arrivalMinute(r) {
  const total = ARRIVAL.reduce((a, b) => a + b, 0);
  let x = r() * total;
  for (let i = 0; i < ARRIVAL.length; i++) {
    if ((x -= ARRIVAL[i]) <= 0) return (9 + i) * 60 + r() * 60;
  }
  return 16 * 60 + r() * 60;
}

function group(r, left) {
  const roll = r();
  const g = { male: 0, female: 0, child: 0, student: 0 };
  if (left.student > 15 && roll < 0.04) {
    g.student = Math.min(left.student, between(r, 15, 45));
    g.male = between(r, 0, 2);
    g.female = between(r, 1, 2);
  } else if (roll < 0.55) { // family
    g.male = between(r, 1, 2);
    g.female = between(r, 1, 2);
    g.child = between(r, 1, 3);
  } else if (roll < 0.8) { // couple / friends
    g.male = between(r, 0, 3);
    g.female = between(r, g.male ? 0 : 1, 3);
  } else if (roll < 0.9) { // single adult
    g[r() < 0.65 ? 'male' : 'female'] = 1;
  } else { // a few students without a group letter
    g.student = between(r, 2, 5);
  }
  for (const t of TYPE_IDS) g[t] = Math.max(0, Math.min(g[t], left[t]));
  return g;
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ticketCode = (r, k) =>
  `BNZ-${k.slice(2).replace(/-/g, '')}-${Array.from({ length: 5 }, () => CHARS[Math.floor(r() * CHARS.length)]).join('')}`;

const FIRST = ['Rahim', 'Karim', 'Sumaiya', 'Nusrat', 'Tanvir', 'Mehedi', 'Fahim', 'Sadia', 'Arif', 'Rumana', 'Imran', 'Shirin',
  'Sabbir', 'Jannat', 'Rafi', 'Tania', 'Hasan', 'Mim', 'Shuvo', 'Ritu', 'Nayeem', 'Farhana', 'Rakib', 'Lamia'];
const LAST = ['Ahmed', 'Hossain', 'Islam', 'Rahman', 'Khan', 'Akter', 'Chowdhury', 'Uddin', 'Sarkar', 'Mia', 'Begum', 'Das'];

const cache = new Map();
// All demo tickets for day k, including timestamps later than "now" (views hide those).
export function demoTickets(k) {
  if (cache.has(k)) return cache.get(k);
  const p = dayPlan(k);
  const r = rng('tickets' + k);
  const left = { male: p.male, female: p.female, child: p.child, student: p.student };
  const out = [];
  while (TYPE_IDS.some((t) => left[t] > 0)) {
    const items = group(r, left);
    const count = TYPE_IDS.reduce((s, t) => s + items[t], 0);
    if (!count) {
      const t = TYPE_IDS.find((x) => left[x] > 0);
      items[t] = 1;
    }
    TYPE_IDS.forEach((t) => (left[t] -= items[t]));
    const visitors = TYPE_IDS.reduce((s, t) => s + items[t], 0);
    const amount = TYPE_IDS.reduce((s, t) => s + items[t] * PRICE[t], 0);
    const online = r() < p.onlineShare;
    const arrive = Math.min(arrivalMinute(r), ZOO.lastEntryMin - 1);
    const name = `${pick(r, FIRST)} ${pick(r, LAST)}`;
    const mobile = `01${pick(r, ['3', '5', '6', '7', '8', '9'])}${String(between(r, 10000000, 99999999))}`;
    let createdAt;
    if (online) {
      const daysBefore = r() < 0.6 ? 0 : between(r, 1, 6);
      createdAt = daysBefore === 0
        ? atTime(k, Math.max(6 * 60, arrive - between(r, 20, 240)))
        : atTime(addDays(k, -daysBefore), between(r, 8 * 60, 23 * 60));
    } else {
      createdAt = atTime(k, arrive - between(r, 1, 6));
    }
    const noShow = online && r() < 0.03;
    const log = [];
    const gate = r() < 0.75 ? 'G1' : 'G2';
    if (!noShow) {
      log.push({ type: 'in', count: visitors, at: atTime(k, arrive), gate, by: 'system' });
      const stay = Math.max(50, gauss(r, 170, 50));
      const leave = Math.min(arrive + stay, ZOO.closeMin - between(r, 0, 10));
      log.push({ type: 'out', count: visitors, at: atTime(k, leave), gate: r() < 0.7 ? gate : GATES[0].id, by: 'system' });
    }
    out.push({
      id: ticketCode(r, k),
      demo: true,
      channel: online ? 'online' : 'counter',
      createdAt,
      visitDate: k,
      buyer: { name: online ? name : 'Walk-in visitor', mobile: online ? mobile : '' },
      items,
      visitors,
      amount,
      payment: online
        ? { method: pick(r, ['bkash', 'bkash', 'bkash', 'nagad', 'nagad', 'rocket', 'card']), status: 'paid', trxId: 'TRX' + between(r, 10000000, 99999999) }
        : { method: r() < 0.85 ? 'cash' : 'bkash', status: 'paid', trxId: '' },
      status: 'valid',
      log,
    });
  }
  out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  cache.set(k, out);
  return out;
}

// --- Feeding --------------------------------------------------------------------------------

// Demo outcome of a feeding slot: minutes of delay, or null when it was missed.
export function demoFeedingDelay(k, slotId) {
  if (k < addDays(todayKey(), -400)) return 0;
  const r = rng('feed' + k + slotId);
  const x = r();
  if (x < 0.035) return null; // missed
  if (x < 0.13) return between(r, 18, 55); // late
  return between(r, -8, 12); // on time
}

// --- Attendance -----------------------------------------------------------------------------

// Demo attendance record for an employee on a day: {status, inMin, outMin}.
export function demoAttendance(k, emp, leaves) {
  if (k < emp.joined) return { status: 'n/a' };
  const day = fromKey(k).getDay();
  if (day === emp.weeklyOff) return { status: 'off' };
  const onLeave = leaves.find((l) => l.employeeId === emp.id && l.status === 'approved' && l.from <= k && l.to >= k);
  if (onLeave) return { status: 'leave', leaveType: onLeave.type };
  const r = rng('att' + k + emp.id);
  if (r() < 0.035) return { status: 'absent' };
  const shift = SHIFTS[emp.shift];
  const late = r() < 0.08;
  const inMin = Math.round(shift.start + (late ? between(r, 16, 50) : gauss(r, -6, 5)));
  const outMin = Math.round(shift.end + Math.max(-20, gauss(r, 8, 12)));
  return { status: 'present', inMin, outMin };
}

// A few leave applications so the leave screens are not empty on first run.
export function seedLeaves() {
  const t = toKey(new Date());
  const L = (id, employeeId, type, fromOff, days, status, reason) => ({
    id, employeeId, type, from: addDays(t, fromOff), to: addDays(t, fromOff + days - 1), days, status, reason,
    appliedAt: atTime(addDays(t, fromOff - 5), 10 * 60), decidedBy: status === 'pending' ? null : 'E001',
  });
  return [
    L('LV-1001', 'E013', 'sick', -1, 3, 'approved', 'Fever, doctor advised rest'),
    L('LV-1002', 'E022', 'casual', 0, 1, 'approved', 'Family programme'),
    L('LV-1003', 'E031', 'earned', 3, 5, 'pending', 'Visiting home district'),
    L('LV-1004', 'E027', 'casual', 2, 2, 'pending', 'Personal work'),
    L('LV-1005', 'E008', 'casual', -20, 2, 'approved', 'Sister’s wedding'),
    L('LV-1006', 'E035', 'sick', -12, 2, 'approved', 'Back pain'),
    L('LV-1007', 'E021', 'casual', 7, 1, 'pending', 'Bank & land office work'),
    L('LV-1008', 'E016', 'earned', -40, 6, 'approved', 'Annual leave'),
    L('LV-1009', 'E034', 'casual', -3, 1, 'rejected', 'Overlaps with VIP visit duty'),
  ];
}

export const allEmployees = (extra = []) => [...EMPLOYEES, ...extra];
export { FEEDING_SCHEDULE };
