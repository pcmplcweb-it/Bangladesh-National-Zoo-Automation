// Employees, attendance and leave management.
import { getState, mutate, delay } from './db';
import { demoAttendance, allEmployees } from './demo';
import { now } from '../lib/clock';
import { todayKey, eachDay, diffDays, minutesOf, atTime, fromKey } from '../lib/dates';
import { SHIFTS, LATE_GRACE_MIN, LEAVE_TYPES } from '../data/master';

export const employees = () => allEmployees(getState().employees);
export const employeeById = (id) => employees().find((e) => e.id === id);

// Attendance of one employee on day k, as of now.
// status: present | late | absent | leave | off | not-in (shift started, no check-in yet) | upcoming | n/a
export function attendanceOf(k, emp) {
  const today = todayKey();
  const nowMin = k < today ? 24 * 60 : now().getHours() * 60 + now().getMinutes();
  const shift = SHIFTS[emp.shift];
  const real = getState().attendance[`${k}|${emp.id}`];
  let rec;
  if (real) {
    rec = { status: real.status || 'present', inMin: real.in ? minutesOf(real.in) : null, outMin: real.out ? minutesOf(real.out) : null, manual: true, note: real.note };
  } else if (k > today) {
    return { status: 'upcoming' };
  } else {
    const d = demoAttendance(k, emp, getState().leaves);
    rec = { ...d };
    if (d.status === 'present') {
      if (d.inMin > nowMin) rec = { status: nowMin >= shift.start ? 'not-in' : 'upcoming' };
      else if (d.outMin > nowMin) rec.outMin = null;
    } else if (d.status === 'absent' && k === today && nowMin < shift.start + 120) {
      rec = { status: nowMin >= shift.start ? 'not-in' : 'upcoming' };
    }
  }
  if (rec.status === 'present' && rec.inMin != null && rec.inMin > shift.start + LATE_GRACE_MIN) {
    rec.late = true;
    rec.lateBy = Math.round(rec.inMin - shift.start);
  }
  if (rec.inMin != null && rec.outMin != null) rec.hours = (rec.outMin - rec.inMin) / 60;
  return rec;
}

export function attendanceBoard(k = todayKey()) {
  return employees().map((e) => ({ emp: e, ...attendanceOf(k, e) }));
}

export function attendanceSummary(k = todayKey()) {
  const c = { total: 0, present: 0, late: 0, absent: 0, leave: 0, off: 0, notIn: 0, upcoming: 0 };
  for (const r of attendanceBoard(k)) {
    if (r.status === 'n/a') continue;
    c.total++;
    if (r.status === 'present') {
      c.present++;
      if (r.late) c.late++;
    } else if (r.status === 'not-in') c.notIn++;
    else if (c[r.status] !== undefined) c[r.status]++;
  }
  c.onDuty = c.total - c.off - c.leave;
  return c;
}

// Month sheet for one employee.
export function monthSheet(emp, from, to) {
  return eachDay(from, to).map((k) => ({ date: k, ...attendanceOf(k, emp) }));
}

export function monthTotals(emp, from, to) {
  const t = { present: 0, late: 0, absent: 0, leave: 0, off: 0, hours: 0 };
  for (const d of monthSheet(emp, from, to)) {
    if (d.status === 'present') {
      t.present++;
      if (d.late) t.late++;
      t.hours += d.hours || 0;
    } else if (t[d.status] !== undefined) t[d.status]++;
  }
  return t;
}

export async function checkIn(emp, note = '') {
  await delay(250);
  const k = todayKey();
  mutate((s) => {
    const cur = s.attendance[`${k}|${emp.id}`];
    s.attendance = { ...s.attendance, [`${k}|${emp.id}`]: { ...cur, status: 'present', in: now().toISOString(), note } };
  });
}

export async function checkOut(emp) {
  await delay(250);
  const k = todayKey();
  const cur = attendanceOf(k, emp);
  mutate((s) => {
    const prev = s.attendance[`${k}|${emp.id}`] || { status: 'present', in: cur.inMin != null ? atTime(k, cur.inMin) : now().toISOString() };
    s.attendance = { ...s.attendance, [`${k}|${emp.id}`]: { ...prev, out: now().toISOString() } };
  });
}

export function markStatus(k, emp, status) {
  mutate((s) => {
    s.attendance = { ...s.attendance, [`${k}|${emp.id}`]: { status } };
  });
}

// ---- Leave ---------------------------------------------------------------------------------
export const leaves = () => [...getState().leaves].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));

export function leaveBalance(emp, year = todayKey().slice(0, 4)) {
  return LEAVE_TYPES.filter((t) => !t.onlyFor || t.onlyFor === emp.gender).map((t) => {
    const used = getState().leaves
      .filter((l) => l.employeeId === emp.id && l.type === t.id && l.status === 'approved' && l.from.startsWith(year))
      .reduce((s, l) => s + l.days, 0);
    const pending = getState().leaves
      .filter((l) => l.employeeId === emp.id && l.type === t.id && l.status === 'pending')
      .reduce((s, l) => s + l.days, 0);
    return { ...t, used, pending, left: t.perYear ? t.perYear - used : null };
  });
}

export const leaveDays = (from, to) => (to >= from ? diffDays(from, to) + 1 : 0);

export async function applyLeave({ employeeId, type, from, to, reason }) {
  await delay(400);
  const emp = employeeById(employeeId);
  if (!emp) throw new Error('Choose an employee.');
  if (!from || !to || to < from) throw new Error('Choose a valid date range.');
  if (!reason.trim()) throw new Error('Write a short reason.');
  const days = leaveDays(from, to);
  const bal = leaveBalance(emp).find((b) => b.id === type);
  if (bal && bal.perYear && days > bal.left - bal.pending) throw new Error(`Only ${bal.left - bal.pending} day(s) of ${bal.name.toLowerCase()} left.`);
  const overlap = getState().leaves.find((l) => l.employeeId === employeeId && l.status !== 'rejected' && l.from <= to && l.to >= from);
  if (overlap) throw new Error(`Overlaps with leave ${overlap.id} (${overlap.from} → ${overlap.to}).`);
  const lv = {
    id: 'LV-' + (1000 + getState().leaves.length + 1 + Math.floor(Math.random() * 90)),
    employeeId, type, from, to, days, reason, status: 'pending', appliedAt: now().toISOString(), decidedBy: null,
  };
  mutate((s) => {
    s.leaves = [...s.leaves, lv];
  });
  return lv;
}

export function decideLeave(id, status, by) {
  mutate((s) => {
    s.leaves = s.leaves.map((l) => (l.id === id ? { ...l, status, decidedBy: by, decidedAt: now().toISOString() } : l));
  });
}

export async function addEmployee(data) {
  await delay(300);
  const list = employees();
  const id = 'E' + String(Math.max(...list.map((e) => Number(e.id.slice(1)))) + 1).padStart(3, '0');
  const emp = { ...data, id, weeklyOff: Number(data.weeklyOff) };
  mutate((s) => {
    s.employees = [...s.employees, emp];
  });
  return emp;
}

export const weekdayOf = (k) => fromKey(k).getDay();
