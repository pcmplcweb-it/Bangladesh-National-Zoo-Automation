import { useState } from 'react';
import { useLive } from '../../services/db';
import { attendanceBoard, attendanceSummary, checkIn, checkOut, markStatus, employees, monthSheet, monthTotals } from '../../services/hr';
import { PageHead, Card, Stat, Badge, Seg, initials, useToast } from '../../components/ui';
import { DEPARTMENTS, SHIFTS, leaveTypeName } from '../../data/master';
import { todayKey, fmtClock, monthStart, monthEnd, fromKey, fmtMonth, DAY_NAMES } from '../../lib/dates';
import { downloadCsv } from '../../lib/format';

export function attBadge(r) {
  switch (r.status) {
    case 'present': return r.late ? <Badge tone="warn">⚠ Late {r.lateBy}m</Badge> : <Badge tone="good">✓ Present</Badge>;
    case 'absent': return <Badge tone="bad">✕ Absent</Badge>;
    case 'not-in': return <Badge tone="bad">✕ Not checked in</Badge>;
    case 'leave': return <Badge tone="info">On leave{r.leaveType ? ` · ${leaveTypeName(r.leaveType).replace(' leave', '')}` : ''}</Badge>;
    case 'off': return <Badge>Weekly off</Badge>;
    case 'upcoming': return <Badge>Shift not started</Badge>;
    default: return <Badge>—</Badge>;
  }
}

export default function Attendance() {
  const [tab, setTab] = useState('today');
  return (
    <>
      <PageHead title="Attendance" sub="Daily check-in / check-out (biometric or app), late arrivals and monthly sheets.">
        <Seg value={tab} onChange={setTab} options={[{ value: 'today', label: 'Today' }, { value: 'month', label: 'Monthly summary' }, { value: 'sheet', label: 'Employee sheet' }]} />
      </PageHead>
      {tab === 'today' && <Today />}
      {tab === 'month' && <MonthSummary />}
      {tab === 'sheet' && <Sheet />}
    </>
  );
}

function Today() {
  const toast = useToast();
  const [dept, setDept] = useState('all');
  const [status, setStatus] = useState('all');
  const k = todayKey();
  const d = useLive(() => ({ rows: attendanceBoard(k), sum: attendanceSummary(k) }));
  const rows = d.rows.filter((r) => r.status !== 'n/a')
    .filter((r) => dept === 'all' || r.emp.dept === dept)
    .filter((r) => status === 'all' || (status === 'late' ? r.late : status === 'absent' ? ['absent', 'not-in'].includes(r.status) : r.status === status));

  return (
    <>
      <div className="kpis">
        <Stat label="Present" value={d.sum.present} accent sub={`of ${d.sum.onDuty} on duty today`} bar={(d.sum.present / Math.max(1, d.sum.onDuty)) * 100} />
        <Stat label="Late arrivals" value={d.sum.late} />
        <Stat label="Absent / not in" value={d.sum.absent + d.sum.notIn} />
        <Stat label="On leave" value={d.sum.leave} />
        <Stat label="Weekly off" value={d.sum.off} />
        <Stat label="Shift not started" value={d.sum.upcoming} />
      </div>
      <div style={{ marginTop: 16 }}>
        <Card actions={
          <>
            <select className="input" style={{ width: 'auto' }} value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
              <option value="all">All departments</option>
              {DEPARTMENTS.map((x) => <option key={x}>{x}</option>)}
            </select>
            <Seg value={status} onChange={setStatus} options={[{ value: 'all', label: 'All' }, { value: 'present', label: 'Present' }, { value: 'late', label: 'Late' }, { value: 'absent', label: 'Absent' }, { value: 'leave', label: 'Leave' }]} />
          </>
        } title="Today’s board">
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Employee</th><th>Department</th><th>Shift</th><th>In</th><th>Out</th><th>Status</th><th className="right">Action</th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const sh = SHIFTS[r.emp.shift];
                  return (
                    <tr key={r.emp.id}>
                      <td>
                        <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
                          <span className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: r.emp.gender === 'F' ? '#a8457a' : 'var(--green)' }}>{initials(r.emp.name)}</span>
                          <span><b>{r.emp.name}</b><div className="small muted">{r.emp.designation}</div></span>
                        </div>
                      </td>
                      <td className="small">{r.emp.dept}</td>
                      <td className="small nowrap">{sh.label} {fmtClock(sh.start)}–{fmtClock(sh.end)}</td>
                      <td className="nowrap">{r.inMin != null ? fmtClock(r.inMin) : '—'}</td>
                      <td className="nowrap">{r.outMin != null ? fmtClock(r.outMin) : '—'}</td>
                      <td>{attBadge(r)}{r.manual && <span className="small muted"> · manual</span>}</td>
                      <td className="right nowrap">
                        {['not-in', 'upcoming', 'absent'].includes(r.status) && <button className="btn btn-sm" onClick={async () => { await checkIn(r.emp); toast(`${r.emp.name} checked in`); }}>Check in</button>}
                        {r.status === 'present' && r.outMin == null && <button className="btn btn-ghost btn-sm" onClick={async () => { await checkOut(r.emp); toast(`${r.emp.name} checked out`); }}>Check out</button>}
                        {r.status === 'not-in' && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 6 }} onClick={() => { markStatus(k, r.emp, 'absent'); toast(`${r.emp.name} marked absent`); }}>Mark absent</button>}
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && <tr><td colSpan={7} className="empty">No one matches.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

function monthRange(m) {
  const from = `${m}-01`;
  const end = monthEnd(from);
  const t = todayKey();
  return [from, end > t ? t : end];
}

function MonthSummary() {
  const [m, setM] = useState(todayKey().slice(0, 7));
  const [from, to] = monthRange(m);
  const rows = useLive(() => employees().map((e) => ({ emp: e, ...monthTotals(e, from, to) })), [from, to]);
  const exportCsv = () => downloadCsv(`bnz-attendance-${m}.csv`, rows.map((r) => ({
    id: r.emp.id, name: r.emp.name, department: r.emp.dept, present: r.present, late: r.late, absent: r.absent, leave: r.leave, weekly_off: r.off, hours: r.hours.toFixed(1),
  })));
  return (
    <Card title={`Monthly summary — ${fmtMonth(from)}`} sub={`${from} to ${to}`} actions={
      <>
        <input className="input" type="month" value={m} max={todayKey().slice(0, 7)} onChange={(e) => e.target.value && setM(e.target.value)} style={{ width: 'auto' }} />
        <button className="btn btn-ghost" onClick={exportCsv}>⬇ CSV</button>
      </>
    }>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Employee</th><th>Department</th><th className="num">Present</th><th className="num">Late</th><th className="num">Absent</th><th className="num">Leave</th><th className="num">Off</th><th className="num">Hours</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.emp.id}>
                <td><b>{r.emp.name}</b><div className="small muted">{r.emp.id} · {r.emp.designation}</div></td>
                <td className="small">{r.emp.dept}</td>
                <td className="num">{r.present}</td>
                <td className="num" style={r.late >= 3 ? { color: 'var(--warn)', fontWeight: 700 } : undefined}>{r.late}</td>
                <td className="num" style={r.absent ? { color: 'var(--bad)', fontWeight: 700 } : undefined}>{r.absent}</td>
                <td className="num">{r.leave}</td>
                <td className="num">{r.off}</td>
                <td className="num">{r.hours.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Sheet() {
  const all = employees();
  const [id, setId] = useState(all[0].id);
  const [m, setM] = useState(todayKey().slice(0, 7));
  const emp = all.find((e) => e.id === id);
  const from = `${m}-01`;
  const to = monthEnd(from);
  const d = useLive(() => ({ days: monthSheet(emp, from, to), tot: monthTotals(emp, ...monthRange(m)) }), [id, m]);
  const lead = (fromKey(monthStart(from)).getDay() + 1) % 7; // weeks start Saturday
  const names = [6, 0, 1, 2, 3, 4, 5].map((x) => DAY_NAMES[x]);
  return (
    <div className="grid g-2-1">
      <Card title={`${emp.name} — ${fmtMonth(from)}`} sub={`${emp.designation} · ${SHIFTS[emp.shift].label} shift · weekly off ${DAY_NAMES[emp.weeklyOff]}`} actions={
        <>
          <select className="input" style={{ width: 'auto' }} value={id} onChange={(e) => setId(e.target.value)} aria-label="Employee">
            {all.map((e) => <option key={e.id} value={e.id}>{e.id} · {e.name}</option>)}
          </select>
          <input className="input" type="month" value={m} max={todayKey().slice(0, 7)} onChange={(e) => e.target.value && setM(e.target.value)} style={{ width: 'auto' }} />
        </>
      }>
        <div className="att-cal">
          {names.map((n) => <div key={n} className="dname">{n}</div>)}
          {Array.from({ length: lead }, (_, i) => <div key={`x${i}`} />)}
          {d.days.map((x) => {
            const cls = x.status === 'present' ? (x.late ? 'late' : 'present') : x.status === 'not-in' ? 'absent' : x.status;
            return (
              <div key={x.date} className={`att-day ${cls}`} title={x.status}>
                <b>{Number(x.date.slice(8))}</b>
                <div>
                  {x.status === 'present' && <>{fmtClock(x.inMin)}{x.outMin != null && <><br />{fmtClock(x.outMin)}</>}</>}
                  {x.status === 'absent' && 'Absent'}
                  {x.status === 'not-in' && 'Not in'}
                  {x.status === 'leave' && 'Leave'}
                  {x.status === 'off' && 'Off'}
                </div>
              </div>
            );
          })}
        </div>
        <div className="legend" style={{ marginTop: 12 }}>
          <span><i style={{ background: 'var(--good-bg)', border: '1px solid #cfe9d6' }} />Present</span>
          <span><i style={{ background: 'var(--warn-bg)', border: '1px solid #f2dfa6' }} />Late</span>
          <span><i style={{ background: 'var(--bad-bg)', border: '1px solid #f3c4bf' }} />Absent</span>
          <span><i style={{ background: 'var(--info-bg)', border: '1px solid #c9daf6' }} />Leave</span>
          <span><i style={{ background: '#f2f4f1', border: '1px solid var(--line)' }} />Weekly off</span>
        </div>
      </Card>
      <div className="kpis" style={{ gridTemplateColumns: '1fr 1fr', alignContent: 'start' }}>
        <Stat label="Days present" value={d.tot.present} accent />
        <Stat label="Late arrivals" value={d.tot.late} />
        <Stat label="Absent" value={d.tot.absent} />
        <Stat label="Leave days" value={d.tot.leave} />
        <Stat label="Hours worked" value={d.tot.hours.toFixed(1)} sub={`Avg ${(d.tot.hours / Math.max(1, d.tot.present)).toFixed(1)} h/day`} />
        <Stat label="Weekly off" value={d.tot.off} />
      </div>
    </div>
  );
}
