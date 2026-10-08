import { useState } from 'react';
import { useLive } from '../../services/db';
import { employees, attendanceOf, leaveBalance, monthTotals, addEmployee } from '../../services/hr';
import { PageHead, Card, Badge, Modal, initials, useToast } from '../../components/ui';
import { DEPARTMENTS, SHIFTS } from '../../data/master';
import { todayKey, fmtDate, DAY_NAMES, monthStart, fmtClock } from '../../lib/dates';
import { attBadge } from './Attendance';

export default function Employees() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const k = todayKey();
  const list = useLive(() => employees()
    .filter((e) => dept === 'all' || e.dept === dept)
    .filter((e) => !q || `${e.name} ${e.id} ${e.designation} ${e.phone}`.toLowerCase().includes(q.toLowerCase()))
    .map((e) => ({ e, att: attendanceOf(k, e) })), [q, dept]);
  const counts = useLive(() => Object.fromEntries(DEPARTMENTS.map((d) => [d, employees().filter((e) => e.dept === d).length])));
  const open = openId ? employees().find((e) => e.id === openId) : null;

  return (
    <>
      <PageHead title="Employees" sub={`${employees().length} staff across ${DEPARTMENTS.length} departments`}>
        <button className="btn btn-orange" onClick={() => setAdding(true)}>+ Add employee</button>
      </PageHead>
      <Card>
        <div className="row" style={{ marginBottom: 12 }}>
          <input className="input grow" style={{ flex: 1, minWidth: 200 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, designation, phone" />
          <select className="input" style={{ width: 'auto' }} value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
            <option value="all">All departments ({employees().length})</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d} ({counts[d]})</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Employee</th><th>Department</th><th>Shift</th><th>Weekly off</th><th>Phone</th><th>Today</th></tr></thead>
            <tbody>
              {list.map(({ e, att }) => (
                <tr key={e.id} onClick={() => setOpenId(e.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
                      <span className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: e.gender === 'F' ? '#a8457a' : 'var(--green)' }}>{initials(e.name)}</span>
                      <span><b>{e.name}</b><div className="small muted">{e.id} · {e.designation}</div></span>
                    </div>
                  </td>
                  <td className="small">{e.dept}</td>
                  <td className="small nowrap">{SHIFTS[e.shift].label}</td>
                  <td className="small">{DAY_NAMES[e.weeklyOff]}</td>
                  <td className="small nowrap">{e.phone}</td>
                  <td>{attBadge(att)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && <Profile e={open} onClose={() => setOpenId(null)} />}
      {adding && <AddDialog onClose={() => setAdding(false)} onDone={(e) => { toast(`${e.name} added as ${e.id}`); setAdding(false); }} />}
    </>
  );
}

function Profile({ e, onClose }) {
  const k = todayKey();
  const att = attendanceOf(k, e);
  const m = monthTotals(e, monthStart(k), k);
  const bal = leaveBalance(e);
  const sh = SHIFTS[e.shift];
  return (
    <Modal title={e.name} onClose={onClose} width={620}>
      <div className="kv" style={{ marginTop: 0 }}>
        <div><small>Employee ID</small><b>{e.id}</b></div>
        <div><small>Designation</small><b>{e.designation}</b></div>
        <div><small>Department</small><b>{e.dept}</b></div>
        <div><small>Joined</small><b>{fmtDate(e.joined)}</b></div>
        <div><small>Shift</small><b>{sh.label} {fmtClock(sh.start)}–{fmtClock(sh.end)}</b></div>
        <div><small>Weekly off</small><b>{DAY_NAMES[e.weeklyOff]}</b></div>
        <div><small>Phone</small><b>{e.phone}</b></div>
        <div><small>Today</small><b>{attBadge(att)}</b></div>
      </div>
      <h4 style={{ margin: '20px 0 8px' }}>This month</h4>
      <div className="row small">
        <Badge tone="good">Present {m.present}</Badge><Badge tone="warn">Late {m.late}</Badge><Badge tone="bad">Absent {m.absent}</Badge><Badge tone="info">Leave {m.leave}</Badge><Badge>{m.hours.toFixed(0)} h worked</Badge>
      </div>
      <h4 style={{ margin: '20px 0 8px' }}>Leave balance</h4>
      <table className="tbl">
        <tbody>{bal.filter((b) => b.perYear).map((b) => <tr key={b.id}><td>{b.name}</td><td className="num">{b.used} used</td><td className="num"><b>{b.left} left</b></td></tr>)}</tbody>
      </table>
    </Modal>
  );
}

function AddDialog({ onClose, onDone }) {
  const [f, setF] = useState({ name: '', gender: 'M', dept: DEPARTMENTS[1], designation: '', shift: 'general', weeklyOff: 5, phone: '', joined: todayKey() });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title="Add employee" onClose={onClose}>
      <form className="stack" onSubmit={async (e) => {
        e.preventDefault();
        if (f.name.trim().length < 3) return setError('Enter the full name.');
        if (!f.designation.trim()) return setError('Enter the designation.');
        if (!/^01[3-9]\d{2}-?\d{6}$/.test(f.phone)) return setError('Enter a valid mobile number.');
        onDone(await addEmployee({ ...f, name: f.name.trim() }));
      }}>
        <label className="field"><span>Full name</span><input className="input" value={f.name} onChange={set('name')} /></label>
        <div className="form-grid">
          <label className="field"><span>Gender</span><select className="input" value={f.gender} onChange={set('gender')}><option value="M">Male</option><option value="F">Female</option></select></label>
          <label className="field"><span>Department</span><select className="input" value={f.dept} onChange={set('dept')}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className="field"><span>Designation</span><input className="input" value={f.designation} onChange={set('designation')} /></label>
          <label className="field"><span>Shift</span><select className="input" value={f.shift} onChange={set('shift')}>{Object.entries(SHIFTS).map(([id, s]) => <option key={id} value={id}>{s.label} ({fmtClock(s.start)}–{fmtClock(s.end)})</option>)}</select></label>
          <label className="field"><span>Weekly off</span><select className="input" value={f.weeklyOff} onChange={set('weeklyOff')}>{DAY_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></label>
          <label className="field"><span>Mobile</span><input className="input" value={f.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" /></label>
          <label className="field"><span>Joining date</span><input className="input" type="date" value={f.joined} onChange={set('joined')} /></label>
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn block">Save employee</button>
      </form>
    </Modal>
  );
}
