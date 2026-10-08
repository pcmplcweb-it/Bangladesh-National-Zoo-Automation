import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { num } from '../lib/format';
import { todayKey, addDays, weekStart, monthStart, yearStart, monthEnd } from '../lib/dates';

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, accent, icon, bar, live }) {
  return (
    <div className={`stat ${accent ? 'accent' : ''}`}>
      <div className="lbl">
        {icon && <span aria-hidden>{icon}</span>}
        {label}
        {live && <span className="live-dot" title="Live" />}
      </div>
      <div className="val" style={typeof value === 'string' && value.length > 9 ? { fontSize: 22, paddingTop: 5 } : undefined}>
        {typeof value === 'number' ? num(value) : value}
      </div>
      {sub && <div className="sub">{sub}</div>}
      {bar != null && (
        <div className="bar" role="presentation">
          <i style={{ width: `${Math.min(100, bar)}%` }} />
        </div>
      )}
    </div>
  );
}

const BADGE = {
  good: 'b-good', warn: 'b-warn', bad: 'b-bad', info: 'b-info', mute: 'b-mute',
};
export const Badge = ({ tone = 'mute', children }) => <span className={`badge ${BADGE[tone]}`}>{children}</span>;

export function Card({ title, sub, actions, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-head">
          <div>
            {title && <h2>{title}</h2>}
            {sub && <p>{sub}</p>}
          </div>
          {actions && <div className="row">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Modal({ title, onClose, children, width }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={width ? { width: `min(${width}px, 100%)` } : undefined}>
        {title && (
          <div className="modal-head">
            <h3>{title}</h3>
            {onClose && <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 500, label }) {
  const set = (v) => onChange(Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0)));
  return (
    <div className="stepper">
      <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Fewer ${label}`}>−</button>
      <input type="number" value={value} min={min} max={max} aria-label={label} onChange={(e) => set(parseInt(e.target.value, 10))} />
      <button type="button" onClick={() => set(value + 1)} disabled={value >= max} aria-label={`More ${label}`}>+</button>
    </div>
  );
}

export function Seg({ options, value, onChange }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Date range presets used by reports.
export function presetRange(p) {
  const t = todayKey();
  switch (p) {
    case 'today': return [t, t];
    case 'yesterday': return [addDays(t, -1), addDays(t, -1)];
    case 'week': return [weekStart(t), t];
    case 'last7': return [addDays(t, -6), t];
    case 'month': return [monthStart(t), t];
    case 'lastMonth': { const s = monthStart(addDays(monthStart(t), -1)); return [s, monthEnd(s)]; }
    case 'last30': return [addDays(t, -29), t];
    case 'year': return [yearStart(t), t];
    case 'last365': return [addDays(t, -364), t];
    default: return null;
  }
}
export const PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom' },
];

export function DateRange({ from, to, onChange }) {
  return (
    <div className="row">
      <label className="field">
        <span>From</span>
        <input className="input" type="date" value={from} max={to} onChange={(e) => e.target.value && onChange(e.target.value, to)} />
      </label>
      <label className="field">
        <span>To</span>
        <input className="input" type="date" value={to} min={from} onChange={(e) => e.target.value && onChange(from, e.target.value)} />
      </label>
    </div>
  );
}

// ---- toasts ----
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((text, tone) => {
    const id = Math.random();
    setItems((x) => [...x, { id, text, tone }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => <div key={t.id} className={`toast ${t.tone === 'bad' ? 'bad' : ''}`}>{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export const initials = (name) => name.replace(/^(Dr\.|Md\.|Mosammat)\s+/g, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
