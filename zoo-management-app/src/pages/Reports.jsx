import { useMemo, useState } from 'react';
import { useLive } from '../services/db';
import { dailyRows, sumRows } from '../services/tickets';
import { PageHead, Stat, Card, Seg, DateRange, PRESETS, presetRange } from '../components/ui';
import { VisitorMixChart, SingleBarChart, MixBreakdown, shortNum } from '../components/charts';
import { num, tk, pct, downloadCsv } from '../lib/format';
import { diffDays, addDays, weekStart, monthStart, yearStart, fmtShort, fmtMonth, fmtDate, dayName, todayKey } from '../lib/dates';
import { TICKET_TYPES, ZOO } from '../data/master';

const GROUPS = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];
const autoGroup = (days) => (days <= 45 ? 'day' : days <= 200 ? 'week' : days <= 1100 ? 'month' : 'year');

function bucket(rows, group) {
  const keyOf = { day: (k) => k, week: weekStart, month: monthStart, year: yearStart }[group];
  const map = new Map();
  for (const r of rows) {
    const key = keyOf(r.date);
    if (!map.has(key)) map.set(key, { key, rows: [] });
    map.get(key).rows.push(r);
  }
  return [...map.values()].map(({ key, rows: rs }) => {
    const s = sumRows(rs);
    const last = rs[rs.length - 1].date;
    const label = group === 'day' ? fmtShort(key) : group === 'week' ? `${fmtShort(rs[0].date)}–${fmtShort(last)}` : group === 'month' ? fmtMonth(key) : key.slice(0, 4);
    const full = group === 'day' ? `${dayName(key)}, ${fmtDate(key)}` : group === 'week' ? `Week ${fmtDate(rs[0].date)} – ${fmtDate(last)}` : label;
    return { ...s, key, label, full, from: rs[0].date, to: last };
  });
}

function Delta({ cur, prev }) {
  if (!prev) return null;
  const d = Math.round(((cur - prev) / prev) * 100);
  const tone = d > 0 ? 'var(--good)' : d < 0 ? 'var(--bad)' : 'var(--muted)';
  return <span style={{ color: tone, fontWeight: 600 }}>{d > 0 ? '▲' : d < 0 ? '▼' : '■'} {Math.abs(d)}% vs previous period</span>;
}

export default function Reports() {
  const [preset, setPreset] = useState('month');
  const [range, setRange] = useState(presetRange('month'));
  const [groupSel, setGroupSel] = useState(null);
  const [from, to] = range;
  const days = diffDays(from, to) + 1;
  const group = groupSel || autoGroup(days);

  const choosePreset = (p) => {
    setPreset(p);
    setGroupSel(null);
    if (p !== 'custom') setRange(presetRange(p));
  };

  const data = useLive(() => {
    const safeFrom = from < ZOO.historyFrom ? ZOO.historyFrom : from;
    const rows = dailyRows(safeFrom, to);
    const prevTo = addDays(safeFrom, -1);
    const prevFrom = addDays(prevTo, -(diffDays(safeFrom, to)));
    const prev = prevTo >= ZOO.historyFrom ? sumRows(dailyRows(prevFrom < ZOO.historyFrom ? ZOO.historyFrom : prevFrom, prevTo)) : null;
    return { rows, total: sumRows(rows), prev };
  }, [from, to]);

  const periods = useMemo(() => bucket(data.rows, group), [data.rows, group]);
  const t = data.total;
  const p = data.prev;
  const tooMany = periods.length > 120;

  const exportCsv = () => downloadCsv(`bnz-report-${from}-to-${to}-${group}.csv`, periods.map((r) => ({
    period: r.full, from: r.from, to: r.to, open_days: r.openDays, tickets: r.tickets, visitors: r.visitors,
    male: r.male, female: r.female, children: r.child, students: r.student, entered: r.entered,
    online_tickets: r.onlineTickets, counter_tickets: r.counterTickets, revenue_tk: r.revenue, online_revenue_tk: r.onlineRevenue,
  })));

  return (
    <>
      <PageHead title="Sales & visitor reports" sub={`${fmtDate(from)} – ${fmtDate(to)} · ${days} day(s), ${t.openDays} open · by visit date`}>
        <button className="btn btn-ghost" onClick={() => window.print()}>🖨 Print</button>
        <button className="btn" onClick={exportCsv}>⬇ Export CSV</button>
      </PageHead>

      <Card>
        <div className="spread" style={{ alignItems: 'flex-end' }}>
          <div className="stack" style={{ minWidth: 0 }}>
            <Seg options={PRESETS} value={preset} onChange={choosePreset} />
            {preset === 'custom' && (
              <DateRange from={from} to={to} onChange={(a, b) => { setRange([a, b]); setGroupSel(null); }} />
            )}
          </div>
          <div className="row">
            <span className="small muted">Group by</span>
            <Seg options={GROUPS} value={group} onChange={setGroupSel} />
          </div>
        </div>
        {from < ZOO.historyFrom && <p className="small muted" style={{ marginBottom: 0 }}>Demo history starts on {fmtDate(ZOO.historyFrom)}.</p>}
        {to > todayKey() && <p className="small muted" style={{ marginBottom: 0 }}>Future dates show advance online bookings only.</p>}
      </Card>

      <div className="kpis" style={{ marginTop: 16 }}>
        <Stat label="Tickets sold" value={t.tickets} sub={<Delta cur={t.tickets} prev={p?.tickets} />} />
        <Stat label="Total visitors" value={t.visitors} accent sub={`Avg ${num(t.visitors / Math.max(1, t.openDays))} per open day`} />
        <Stat label="Revenue" value={tk(t.revenue)} sub={<Delta cur={t.revenue} prev={p?.revenue} />} />
        <Stat label="Male (adult)" value={t.male} sub={`${pct(t.male, t.visitors)}% of visitors`} />
        <Stat label="Female (adult)" value={t.female} sub={`${pct(t.female, t.visitors)}% of visitors`} />
        <Stat label="Children" value={t.child} sub={`${pct(t.child, t.visitors)}% of visitors`} />
        <Stat label="Students" value={t.student} sub={`${pct(t.student, t.visitors)}% of visitors`} />
        <Stat label="Sold online" value={`${pct(t.onlineTickets, t.tickets)}%`} sub={`${num(t.onlineTickets)} online · ${num(t.counterTickets)} counter`} />
      </div>

      <div className="grid g-2-1" style={{ marginTop: 16 }}>
        <Card title={`Visitors by category — ${GROUPS.find((g) => g.value === group).label.toLowerCase()}`}>
          {tooMany ? <p className="muted">Too many periods to chart — choose a larger grouping.</p> : (
            <VisitorMixChart data={periods} labelFmt={(l, row) => row?.full ?? l} />
          )}
        </Card>
        <Card title="Visitor mix" sub="Whole period">
          <MixBreakdown values={t} />
          <p className="small muted" style={{ marginBottom: 0 }}>Entered through the gates: {num(t.entered)} ({pct(t.entered, t.visitors)}% of ticket holders)</p>
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="Revenue" sub="Ticket sales collected (Tk)">
          {tooMany ? <p className="muted">Too many periods to chart — choose a larger grouping.</p> : (
            <SingleBarChart data={periods} yKey="revenue" name="Revenue" fmt={tk} axisFmt={(v) => `Tk ${shortNum(v)}`} labelFmt={(l, row) => row?.full ?? l} />
          )}
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="Detail table" sub="Every number in the charts above">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Period</th><th className="num">Tickets</th><th className="num">Visitors</th>
                  {TICKET_TYPES.map((x) => <th key={x.id} className="num">{x.short}</th>)}
                  <th className="num">Entered</th><th className="num">Online</th><th className="num">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((r) => (
                  <tr key={r.key} style={r.openDays === 0 ? { color: 'var(--muted)' } : undefined}>
                    <td className="nowrap">{r.full}{r.openDays === 0 && ' · closed'}</td>
                    <td className="num">{num(r.tickets)}</td>
                    <td className="num"><b>{num(r.visitors)}</b></td>
                    {TICKET_TYPES.map((x) => <td key={x.id} className="num">{num(r[x.id])}</td>)}
                    <td className="num">{num(r.entered)}</td>
                    <td className="num">{num(r.onlineTickets)}</td>
                    <td className="num">{tk(r.revenue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td><td className="num">{num(t.tickets)}</td><td className="num">{num(t.visitors)}</td>
                  {TICKET_TYPES.map((x) => <td key={x.id} className="num">{num(t[x.id])}</td>)}
                  <td className="num">{num(t.entered)}</td><td className="num">{num(t.onlineTickets)}</td><td className="num">{tk(t.revenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
