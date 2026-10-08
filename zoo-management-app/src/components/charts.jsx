// Chart building blocks (Recharts) sharing one look: thin marks, recessive grid, hover tooltips,
// legends for multi-series charts. Colours come from TYPE_COLORS / FLOW_COLORS (validated palette).
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { num } from '../lib/format';
import { TICKET_TYPES, TYPE_COLORS } from '../data/master';

// Short axis labels: 1,50,000 -> 1.5L, 12,000 -> 12k
export const shortNum = (v) => (Math.abs(v) >= 100000 ? `${+(v / 100000).toFixed(1)}L` : Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(v));

const axis = { stroke: '#9aa79c', fontSize: 12, tickLine: false, axisLine: false };
const grid = <CartesianGrid stroke="#edf2eb" vertical={false} />;

export function Legend({ items }) {
  return (
    <div className="legend">
      {items.map((i) => (
        <span key={i.label}><i style={{ background: i.color }} />{i.label}</span>
      ))}
    </div>
  );
}

function Tip({ active, payload, label, fmt = num, labelFmt }) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => p.value != null);
  if (!rows.length) return null;
  const total = rows.length > 1 && rows.every((p) => p.stackId) ? rows.reduce((s, p) => s + p.value, 0) : null;
  return (
    <div className="tip">
      <b>{labelFmt ? labelFmt(label, payload[0]?.payload) : label}</b>
      {[...rows].reverse().map((p) => (
        <div key={p.dataKey}><span><i style={{ background: p.color }} />{p.name}</span><strong>{fmt(p.value)}</strong></div>
      ))}
      {total != null && <div style={{ borderTop: '1px solid #eee', marginTop: 4, paddingTop: 4 }}><span>Total</span><strong>{fmt(total)}</strong></div>}
    </div>
  );
}

// Stacked bars of visitor categories per period.
export function VisitorMixChart({ data, xKey = 'label', height = 300, labelFmt }) {
  return (
    <>
      <Legend items={TICKET_TYPES.map((t) => ({ label: t.short, color: TYPE_COLORS[t.id] }))} />
      <div className="chart-box" style={{ height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} barCategoryGap="18%">
            {grid}
            <XAxis dataKey={xKey} {...axis} minTickGap={12} />
            <YAxis {...axis} tickFormatter={shortNum} width={48} />
            <Tooltip content={<Tip labelFmt={labelFmt} />} cursor={{ fill: 'rgba(31,122,58,.06)' }} />
            {TICKET_TYPES.map((t, i) => (
              <Bar key={t.id} dataKey={t.id} name={t.short} stackId="v" fill={TYPE_COLORS[t.id]} stroke="#fff" strokeWidth={1}
                radius={i === TICKET_TYPES.length - 1 ? [4, 4, 0, 0] : 0} maxBarSize={46} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export function SingleBarChart({ data, xKey = 'label', yKey, name, color = '#1f7a3a', fmt = num, axisFmt = shortNum, height = 260, labelFmt }) {
  return (
    <div className="chart-box" style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          {grid}
          <XAxis dataKey={xKey} {...axis} minTickGap={12} />
          <YAxis {...axis} tickFormatter={axisFmt} width={48} />
          <Tooltip content={<Tip fmt={fmt} labelFmt={labelFmt} />} cursor={{ fill: 'rgba(31,122,58,.06)' }} />
          <Bar dataKey={yKey} name={name} fill={color} radius={[4, 4, 0, 0]} maxBarSize={46} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FlowChart({ data, series, height = 280, xKey = 'label' }) {
  return (
    <>
      <Legend items={series.map((s) => ({ label: s.name, color: s.color }))} />
      <div className="chart-box" style={{ height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            {grid}
            <XAxis dataKey={xKey} {...axis} />
            <YAxis {...axis} tickFormatter={shortNum} width={48} />
            <Tooltip content={<Tip />} cursor={{ stroke: '#9aa79c', strokeDasharray: '3 3' }} />
            {series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2}
                dot={false} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export function AreaTrend({ data, yKey, name, color = '#1f7a3a', height = 220, xKey = 'label', fmt = num }) {
  return (
    <div className="chart-box" style={{ height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${yKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity={0.25} />
              <stop offset="1" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {grid}
          <XAxis dataKey={xKey} {...axis} minTickGap={16} />
          <YAxis {...axis} tickFormatter={fmt} width={56} />
          <Tooltip content={<Tip fmt={fmt} />} cursor={{ stroke: '#9aa79c', strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey={yKey} name={name} stroke={color} strokeWidth={2} fill={`url(#g-${yKey})`}
            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Proportion bar + labelled list (visitor mix). Always labelled, so colour is never the only cue.
export function MixBreakdown({ values }) {
  const total = TICKET_TYPES.reduce((s, t) => s + (values[t.id] || 0), 0);
  return (
    <div>
      <div className="split-bar" role="img" aria-label="Visitor mix">
        {TICKET_TYPES.map((t) => (values[t.id] ? <i key={t.id} style={{ width: `${(values[t.id] / total) * 100}%`, background: TYPE_COLORS[t.id] }} title={`${t.short}: ${num(values[t.id])}`} /> : null))}
      </div>
      <div className="mix-list">
        {TICKET_TYPES.map((t) => (
          <div key={t.id}>
            <i style={{ background: TYPE_COLORS[t.id] }} />
            <span>{t.short} <small className="muted">· {t.note}</small></span>
            <b>{num(values[t.id] || 0)}</b>
            <span className="muted small" style={{ width: 40, textAlign: 'right' }}>{total ? Math.round(((values[t.id] || 0) / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
