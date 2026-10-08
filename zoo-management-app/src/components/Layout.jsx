import { Suspense, useState } from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { useLive } from '../services/db';
import { leaves } from '../services/hr';
import { feedingSummary } from '../services/feeding';
import { now, isDemoTime, setDemoTime } from '../lib/clock';
import { fmtDate, todayKey, dayName } from '../lib/dates';
import { ROLES } from '../data/master';
import { initials, Modal } from './ui';

const NAV = [
  { group: 'Overview' },
  { to: '/app', label: 'Live dashboard', ico: '📊', mod: 'dashboard', end: true },
  { to: '/app/reports', label: 'Reports', ico: '📈', mod: 'reports' },
  { group: 'Visitors' },
  { to: '/app/counter', label: 'Counter sale', ico: '🎟️', mod: 'counter' },
  { to: '/app/tickets', label: 'Tickets', ico: '🧾', mod: 'tickets' },
  { to: '/app/gate', label: 'Gate entry / exit', ico: '🚪', mod: 'gate' },
  { group: 'Animals' },
  { to: '/app/feeding', label: 'Feeding today', ico: '🍖', mod: 'feeding', badge: 'feed' },
  { to: '/app/feeding/schedule', label: 'Meal schedule', ico: '🗓️', mod: 'feedingSchedule' },
  { group: 'Staff' },
  { to: '/app/employees', label: 'Employees', ico: '👥', mod: 'employees' },
  { to: '/app/attendance', label: 'Attendance', ico: '🕘', mod: 'attendance' },
  { to: '/app/leave', label: 'Leave', ico: '🌴', mod: 'leave', badge: 'leave' },
];

export default function Layout() {
  const { user, logout, can } = useAuth();
  const [open, setOpen] = useState(false);
  const [timeDlg, setTimeDlg] = useState(false);
  const loc = useLocation();
  const badges = useLive(() => {
    const f = feedingSummary();
    return { feed: f.due + f.missed, leave: leaves().filter((l) => l.status === 'pending').length };
  });
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;

  // Keep only the links this role may open, and drop groups left empty.
  const items = [];
  let group = null;
  for (const n of NAV) {
    if (n.group) group = n;
    else if (can(n.mod)) {
      if (group) items.push(group);
      group = null;
      items.push(n);
    }
  }
  const t = now();

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <NavLink to={ROLES[user.role].home} className="brand">
          <span className="brand-logo" aria-hidden>🐯</span>
          <span><b>BNZ Management</b><small className="bn">জাতীয় চিড়িয়াখানা, মিরপুর</small></span>
        </NavLink>
        <nav className="nav">
          {items.map((n) =>
            n.group ? <div key={n.group} className="nav-group">{n.group}</div> : (
              <NavLink key={n.to} to={n.to} end={n.end}>
                <span className="ico" aria-hidden>{n.ico}</span>
                {n.label}
                {n.badge && badges[n.badge] > 0 && <span className="pill">{badges[n.badge]}</span>}
              </NavLink>
            ),
          )}
        </nav>
        <div className="sidebar-foot">
          <a href="/book" target="_blank" rel="noreferrer" style={{ color: '#cfe8d4' }}>↗ Public booking page</a>
          <div style={{ marginTop: 8 }}>Frontend prototype · demo data</div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <div className="clock">
            {t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            <small>{dayName(todayKey())}, {fmtDate(todayKey())}</small>
          </div>
          <button className={isDemoTime() ? 'demo-time' : 'btn btn-ghost btn-sm'} style={isDemoTime() ? { border: 0, cursor: 'pointer' } : undefined} onClick={() => setTimeDlg(true)}>
            {isDemoTime() ? <>⏱ Demo time<span className="hide-sm"> — change</span></> : <>⏱<span className="hide-sm"> Set demo time</span></>}
          </button>
          <div className="user-chip">
            <span className="avatar">{initials(user.name)}</span>
            <span className="who"><b>{user.name}</b><small>{ROLES[user.role].label}</small></span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
          </div>
        </header>
        <main className="content" key={loc.pathname}>
          <Suspense fallback={<p className="muted">Loading…</p>}><Outlet /></Suspense>
        </main>
      </div>
      {timeDlg && <DemoTime onClose={() => setTimeDlg(false)} />}
    </div>
  );
}

function DemoTime({ onClose }) {
  const [v, setV] = useState('14:30');
  return (
    <Modal title="Demo time" onClose={onClose}>
      <p className="muted small" style={{ marginTop: 0 }}>
        Move today’s clock to see the live screens at another time of day (for example 2:30 PM when the zoo is busy).
        Only affects this browser.
      </p>
      <div className="row">
        <input className="input" type="time" value={v} onChange={(e) => setV(e.target.value)} style={{ width: 160 }} />
        <button className="btn" onClick={() => { setDemoTime(v); onClose(); }}>Use this time</button>
        <button className="btn btn-ghost" onClick={() => { setDemoTime(null); onClose(); }}>Real clock</button>
      </div>
    </Modal>
  );
}
