// Ticketing, gate (entry/exit) and visitor statistics.
import { getState, mutate, delay } from './db';
import { demoTickets, dayHistory, ticketCode, isOpen } from './demo';
import { now } from '../lib/clock';
import { todayKey, toKey, eachDay, minutesOf, addDays } from '../lib/dates';
import { rng } from '../lib/rng';
import { PRICE, TYPE_IDS, ZOO } from '../data/master';

const sumItems = (items) => TYPE_IDS.reduce((s, t) => s + (items[t] || 0), 0);
export const priceOf = (items) => TYPE_IDS.reduce((s, t) => s + (items[t] || 0) * PRICE[t], 0);

// What a ticket looks like at the current moment: hides demo events that are still in the future.
function asOfNow(t, nowIso) {
  if (!t.demo || t.touched) return t;
  const log = t.log.filter((e) => e.at <= nowIso);
  return log.length === t.log.length ? t : { ...t, log };
}

export function inside(t) {
  let entered = 0;
  let exited = 0;
  for (const e of t.log) {
    if (e.type === 'in') entered += e.count;
    else exited += e.count;
  }
  return { entered, exited, inside: entered - exited, notEntered: Math.max(0, t.visitors - entered) };
}

// Tickets valid for visit date k (demo + real), as of now.
export function ticketsForVisitDate(k) {
  const nowIso = now().toISOString();
  const stored = getState().tickets;
  const today = todayKey();
  const list = [];
  if (k <= today) {
    for (const t of demoTickets(k)) {
      if (stored[t.id]) continue;
      if (t.createdAt > nowIso) continue;
      list.push(asOfNow(t, nowIso));
    }
  }
  for (const t of Object.values(stored)) if (t.visitDate === k) list.push(t);
  return list;
}

export function findTicket(code) {
  const id = code.trim().toUpperCase();
  const stored = getState().tickets[id];
  if (stored) return stored;
  const m = id.match(/^BNZ-(\d{2})(\d{2})(\d{2})-/);
  if (!m) return null;
  const k = `20${m[1]}-${m[2]}-${m[3]}`;
  if (k > todayKey()) return null;
  const nowIso = now().toISOString();
  const t = demoTickets(k).find((x) => x.id === id);
  return t && t.createdAt <= nowIso ? asOfNow(t, nowIso) : null;
}

// ---- Live numbers for a visit date (normally today) ----------------------------------------
export function liveStats(k = todayKey()) {
  const list = ticketsForVisitDate(k).filter((t) => t.status === 'valid' && t.payment.status === 'paid');
  const s = {
    tickets: list.length, visitors: 0, revenue: 0, entered: 0, exited: 0, inside: 0, notEntered: 0,
    male: 0, female: 0, child: 0, student: 0, onlineTickets: 0, counterTickets: 0, onlineVisitors: 0, counterVisitors: 0,
    byMethod: {}, insideByType: { male: 0, female: 0, child: 0, student: 0 },
  };
  for (const t of list) {
    const io = inside(t);
    s.visitors += t.visitors;
    s.revenue += t.amount;
    s.entered += io.entered;
    s.exited += io.exited;
    s.inside += io.inside;
    s.notEntered += io.notEntered;
    TYPE_IDS.forEach((x) => (s[x] += t.items[x] || 0));
    if (t.channel === 'online') {
      s.onlineTickets++;
      s.onlineVisitors += t.visitors;
    } else {
      s.counterTickets++;
      s.counterVisitors += t.visitors;
    }
    s.byMethod[t.payment.method] = (s.byMethod[t.payment.method] || 0) + t.amount;
  }
  return s;
}

// Entries / exits per hour for a day, plus how many were inside at the end of each hour.
export function hourlyFlow(k = todayKey()) {
  const hours = [];
  for (let h = ZOO.openMin / 60; h < ZOO.closeMin / 60; h++) hours.push({ hour: h, label: `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`, in: 0, out: 0 });
  for (const t of ticketsForVisitDate(k)) {
    for (const e of t.log) {
      const h = Math.floor(minutesOf(e.at) / 60);
      const row = hours.find((x) => x.hour === h) || (h < hours[0].hour ? hours[0] : hours[hours.length - 1]);
      row[e.type] += e.count;
    }
  }
  let occ = 0;
  const nowH = k === todayKey() ? now().getHours() : 99;
  for (const row of hours) {
    occ += row.in - row.out;
    row.inside = row.hour <= nowH ? occ : null;
    if (row.hour > nowH) {
      row.in = null;
      row.out = null;
    }
  }
  return hours;
}

// ---- Reports (any date range) --------------------------------------------------------------
// One row per day. Past days use history + any real bookings; today/future use ticket records.
export function dailyRows(from, to) {
  const today = todayKey();
  const stored = Object.values(getState().tickets).filter((t) => !t.demo && t.status === 'valid' && t.payment.status === 'paid');
  return eachDay(from, to).map((k) => {
    let row;
    if (k < today) {
      row = dayHistory(k);
    } else if (k === today) {
      const s = liveStats(k);
      row = {
        date: k, tickets: s.tickets, visitors: s.visitors, male: s.male, female: s.female, child: s.child, student: s.student,
        revenue: s.revenue, onlineTickets: s.onlineTickets, counterTickets: s.counterTickets,
        onlineRevenue: 0, entered: s.entered, exited: s.exited,
      };
      row.onlineRevenue = ticketsForVisitDate(k).filter((t) => t.channel === 'online' && t.status === 'valid').reduce((a, t) => a + t.amount, 0);
      return { ...row, open: isOpen(k) };
    } else {
      row = { date: k, tickets: 0, visitors: 0, male: 0, female: 0, child: 0, student: 0, revenue: 0, onlineTickets: 0, counterTickets: 0, onlineRevenue: 0, entered: 0, exited: 0 };
    }
    // real bookings for this visit date (history days never include them)
    for (const t of stored) {
      if (t.visitDate !== k || k === today) continue;
      row = { ...row };
      row.tickets++;
      row.visitors += t.visitors;
      TYPE_IDS.forEach((x) => (row[x] += t.items[x] || 0));
      row.revenue += t.amount;
      if (t.channel === 'online') {
        row.onlineTickets++;
        row.onlineRevenue += t.amount;
      } else row.counterTickets++;
      const io = inside(t);
      row.entered += io.entered;
      row.exited += io.exited;
    }
    return { ...row, open: isOpen(k) };
  });
}

export function sumRows(rows) {
  const keys = ['tickets', 'visitors', 'male', 'female', 'child', 'student', 'revenue', 'onlineTickets', 'counterTickets', 'onlineRevenue', 'entered', 'exited'];
  const out = Object.fromEntries(keys.map((x) => [x, 0]));
  for (const r of rows) keys.forEach((x) => (out[x] += r[x]));
  out.days = rows.length;
  out.openDays = rows.filter((r) => r.open).length;
  return out;
}

// ---- Actions --------------------------------------------------------------------------------
export function newTicketId(visitDate) {
  const r = rng(String(Date.now()) + Math.random());
  let id;
  do id = ticketCode(r, visitDate);
  while (findTicket(id));
  return id;
}

// Create a booking. Online bookings start as "pending" until payment succeeds.
export async function createBooking({ visitDate, items, buyer, channel, payment, soldBy }) {
  await delay(400);
  const visitors = sumItems(items);
  if (!visitors) throw new Error('Select at least one visitor.');
  const t = {
    id: newTicketId(visitDate),
    channel,
    createdAt: now().toISOString(),
    visitDate,
    buyer,
    items: { ...items },
    visitors,
    amount: priceOf(items),
    payment,
    status: 'valid',
    log: [],
    ...(soldBy ? { soldBy } : {}),
  };
  mutate((s) => {
    s.tickets = { ...s.tickets, [t.id]: t };
  });
  return t;
}

export function updateTicket(id, patch) {
  return mutate((s) => {
    const cur = findTicket(id);
    if (!cur) throw new Error('Ticket not found');
    const next = { ...cur, ...patch, touched: cur.demo ? true : undefined };
    s.tickets = { ...s.tickets, [id]: next };
    return next;
  });
}

// Validate a scanned ticket at the gate. Returns { ok, reason, ticket }.
export function checkTicket(code, direction) {
  const t = findTicket(code);
  if (!t) return { ok: false, reason: 'Ticket not found. Check the code and try again.' };
  const today = todayKey();
  if (t.status !== 'valid') return { ok: false, reason: 'This ticket has been cancelled.', ticket: t };
  if (t.payment.status !== 'paid') return { ok: false, reason: 'Payment not completed for this ticket.', ticket: t };
  if (t.visitDate !== today) {
    return { ok: false, reason: t.visitDate < today ? `Ticket was valid for ${t.visitDate} only (expired).` : `Ticket is for ${t.visitDate}, not today.`, ticket: t };
  }
  const io = inside(t);
  if (direction === 'in' && io.notEntered === 0) return { ok: false, reason: 'All visitors on this ticket have already entered.', ticket: t };
  if (direction === 'out' && io.inside === 0) return { ok: false, reason: 'Nobody from this ticket is inside the zoo.', ticket: t };
  return { ok: true, ticket: t, io };
}

export async function recordGate(code, direction, count, gate, by) {
  await delay(250);
  const res = checkTicket(code, direction);
  if (!res.ok) throw new Error(res.reason);
  const max = direction === 'in' ? res.io.notEntered : res.io.inside;
  const n = Math.max(1, Math.min(count, max));
  const nowIso = now().toISOString();
  return updateTicket(res.ticket.id, { log: [...res.ticket.log, { type: direction, count: n, at: nowIso, gate, by }] });
}

// Recent gate events across today's tickets (newest first).
export function recentGateEvents(limit = 12) {
  const events = [];
  for (const t of ticketsForVisitDate(todayKey())) for (const e of t.log) events.push({ ...e, ticketId: t.id, ticket: t });
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

export const tomorrowKey = () => addDays(todayKey(), 1);
export const isBookable = (k) => isOpen(k) && k >= todayKey() && !(k === todayKey() && now().getHours() * 60 + now().getMinutes() >= ZOO.lastEntryMin);
export { toKey };
