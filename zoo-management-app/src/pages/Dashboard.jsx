import { Link } from 'react-router-dom';
import { useLive } from '../services/db';
import { liveStats, hourlyFlow, dailyRows, recentGateEvents } from '../services/tickets';
import { isOpen } from '../services/demo';
import { feedingSummary, dayFeeding } from '../services/feeding';
import { attendanceSummary, leaves } from '../services/hr';
import { PageHead, Stat, Card, Badge } from '../components/ui';
import { FlowChart, MixBreakdown, VisitorMixChart } from '../components/charts';
import { num, tk, pct } from '../lib/format';
import { todayKey, addDays, fmtShort, dayName, fmtTime, minutesNow } from '../lib/dates';
import { FLOW_COLORS, methodName, ZOO } from '../data/master';
import PayLogo from '../components/PayLogo';

export default function Dashboard() {
  const d = useLive(() => {
    const k = todayKey();
    return {
      k,
      open: isOpen(k),
      s: liveStats(k),
      flow: hourlyFlow(k),
      week: dailyRows(addDays(k, -13), k).map((r) => ({ ...r, label: fmtShort(r.date), day: dayName(r.date) })),
      feed: feedingSummary(k),
      feedList: dayFeeding(k).filter((x) => x.status === 'due' || x.status === 'missed'),
      staff: attendanceSummary(k),
      pendingLeave: leaves().filter((l) => l.status === 'pending').length,
      gate: recentGateEvents(8),
    };
  });
  const { s } = d;
  const mins = minutesNow();
  const phase = !d.open ? 'Closed today (weekly closing day)' : mins < ZOO.openMin ? 'Opens at 9:00 AM' : mins >= ZOO.closeMin ? 'Closed for the day' : 'Open now';

  return (
    <>
      <PageHead title="Live dashboard" sub={`Today at the zoo · ${phase} · figures refresh automatically`}>
        <Link className="btn btn-ghost" to="/app/reports">Open reports →</Link>
      </PageHead>

      {!d.open && <div className="notice" style={{ marginBottom: 16 }}>The zoo is closed to visitors today. Animal feeding and staff attendance continue as normal.</div>}

      <div className="kpis">
        <Stat label="Inside the zoo now" value={s.inside} accent live icon="🟢" sub={`${num(s.entered)} entered − ${num(s.exited)} exited`} />
        <Stat label="Entered since opening" value={s.entered} icon="➡️" sub={`${pct(s.entered, s.visitors)}% of today’s ticket holders`} bar={pct(s.entered, s.visitors)} />
        <Stat label="Exited" value={s.exited} icon="⬅️" sub={`${pct(s.exited, s.entered)}% of those who entered`} />
        <Stat label="Yet to enter" value={s.notEntered} icon="⏳" sub="Valid tickets for today not used yet" />
        <Stat label="Tickets sold" value={s.tickets} icon="🎟️" sub={`${num(s.onlineTickets)} online · ${num(s.counterTickets)} counter`} />
        <Stat label="Visitors on tickets" value={s.visitors} icon="👨‍👩‍👧" sub={`Revenue ${tk(s.revenue)}`} />
      </div>

      <div className="grid g-2-1" style={{ marginTop: 16 }}>
        <Card title="Visitor flow by hour" sub="People entering and leaving each hour, and how many were inside at the end of the hour">
          <FlowChart
            data={d.flow}
            series={[
              { key: 'in', name: 'Entries', color: FLOW_COLORS.in },
              { key: 'out', name: 'Exits', color: FLOW_COLORS.out },
              { key: 'inside', name: 'Inside', color: FLOW_COLORS.inside },
            ]}
          />
        </Card>
        <Card title="Today’s visitors" sub="By ticket category">
          <MixBreakdown values={s} />
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '18px 0' }} />
          <h4 style={{ fontSize: 14, marginBottom: 8 }}>Collection by payment method</h4>
          <div className="mix-list" style={{ marginTop: 0 }}>
            {Object.entries(s.byMethod).sort((a, b) => b[1] - a[1]).map(([m, v]) => (
              <div key={m} style={{ gridTemplateColumns: '26px 1fr auto' }}>
                <PayLogo method={m} size={22} />
                <span>{methodName(m)}</span>
                <b>{tk(v)}</b>
              </div>
            ))}
            {!Object.keys(s.byMethod).length && <span className="muted small">No sales yet today.</span>}
          </div>
        </Card>
      </div>

      <div className="grid g3" style={{ marginTop: 16 }}>
        <Card title="Animal feeding" sub="Today’s meals" actions={<Link className="btn btn-ghost btn-sm" to="/app/feeding">Open</Link>}>
          <div className="big-count">
            <div><b style={{ color: 'var(--good)' }}>{d.feed.ontime}</b><small>✓ On time</small></div>
            <div><b style={{ color: 'var(--warn)' }}>{d.feed.late}</b><small>⚠ Late</small></div>
            <div><b style={{ color: 'var(--bad)' }}>{d.feed.missed}</b><small>✕ Missed</small></div>
          </div>
          <p className="small muted">{d.feed.done} of {d.feed.total} meals served · {d.feed.upcoming} upcoming · on-time rate {d.feed.compliance}%</p>
          {d.feedList.map((x) => (
            <div key={x.slot.id} className="spread small" style={{ padding: '6px 0', borderTop: '1px solid var(--line)' }}>
              <span>{x.slot.emoji} {x.slot.animal} · {x.slot.time}</span>
              {x.status === 'missed' ? <Badge tone="bad">✕ Missed</Badge> : <Badge tone="info">● Due now</Badge>}
            </div>
          ))}
        </Card>
        <Card title="Staff today" actions={<Link className="btn btn-ghost btn-sm" to="/app/attendance">Open</Link>}>
          <div className="big-count">
            <div><b>{d.staff.present}</b><small>Present</small></div>
            <div><b style={{ color: 'var(--warn)' }}>{d.staff.late}</b><small>Late</small></div>
            <div><b style={{ color: 'var(--bad)' }}>{d.staff.absent + d.staff.notIn}</b><small>Absent / not in</small></div>
          </div>
          <p className="small muted">{d.staff.leave} on leave · {d.staff.off} weekly off · {d.staff.upcoming} shift not started</p>
          <Link to="/app/leave" className="spread small" style={{ textDecoration: 'none', color: 'inherit', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
            <span>Leave requests waiting for approval</span>
            <Badge tone={d.pendingLeave ? 'warn' : 'good'}>{d.pendingLeave}</Badge>
          </Link>
        </Card>
        <Card title="Latest gate scans" actions={<Link className="btn btn-ghost btn-sm" to="/app/gate">Gate</Link>}>
          {d.gate.length === 0 && <p className="muted small">No scans yet today.</p>}
          {d.gate.map((e, i) => (
            <div key={i} className="spread small" style={{ padding: '6px 0', borderTop: i ? '1px solid var(--line)' : 0 }}>
              <span>{e.type === 'in' ? <Badge tone="good">➡ In</Badge> : <Badge tone="warn">⬅ Out</Badge>} <span className="mono">{e.ticketId.slice(-5)}</span> · {e.count} pax</span>
              <span className="muted">{e.gate} · {fmtTime(e.at)}</span>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="Last 14 days" sub="Visitors per day by category (Sundays closed)" actions={<Link className="btn btn-ghost btn-sm" to="/app/reports">Full report</Link>}>
          <VisitorMixChart data={d.week} labelFmt={(l, p) => `${p?.day}, ${l}`} height={260} />
        </Card>
      </div>
    </>
  );
}
