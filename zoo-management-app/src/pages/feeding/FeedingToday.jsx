import { useState } from 'react';
import { useAuth } from '../../services/auth';
import { useLive } from '../../services/db';
import { dayFeeding, feedingSummary, feedingHistory, logFeeding, undoFeeding } from '../../services/feeding';
import { employeeById } from '../../services/hr';
import { PageHead, Card, Stat, Badge, Modal, Seg, useToast } from '../../components/ui';
import { SingleBarChart } from '../../components/charts';
import { todayKey, addDays, fmtDate, fmtShort, fmtTime, dayName, toMinutes, atTime, minutesNow, hm } from '../../lib/dates';
import { FEED_ON_TIME_MIN, FEED_MISSED_AFTER_MIN } from '../../data/master';

const STATUS = {
  ontime: { tone: 'good', label: '✓ Fed on time' },
  late: { tone: 'warn', label: '⚠ Fed late' },
  'very-late': { tone: 'warn', label: '⚠ Fed very late' },
  early: { tone: 'warn', label: '⚠ Fed too early' },
  missed: { tone: 'bad', label: '✕ Missed' },
  due: { tone: 'info', label: '● Due now' },
  upcoming: { tone: 'mute', label: 'Upcoming' },
};

export default function FeedingToday() {
  const { user } = useAuth();
  const toast = useToast();
  const [date, setDate] = useState(todayKey());
  const [filter, setFilter] = useState('all');
  const [logSlot, setLogSlot] = useState(null);
  const isToday = date === todayKey();

  const d = useLive(() => ({
    rows: dayFeeding(date),
    sum: feedingSummary(date),
    hist: feedingHistory(addDays(todayKey(), -29), todayKey()).map((r) => ({ ...r, label: fmtShort(r.date) })),
  }), [date]);

  const rows = d.rows.filter((r) => filter === 'all' || (filter === 'attention' ? ['due', 'missed', 'late', 'very-late', 'early'].includes(r.status) : r.status === filter));

  return (
    <>
      <PageHead title="Animal feeding" sub={`Meals within ±${FEED_ON_TIME_MIN} min of schedule are on time; not fed ${FEED_MISSED_AFTER_MIN} min after the scheduled time counts as missed.`}>
        <button className="btn btn-ghost btn-sm" onClick={() => setDate(addDays(date, -1))}>‹ Prev day</button>
        <input className="input" type="date" value={date} max={todayKey()} onChange={(e) => e.target.value && setDate(e.target.value)} style={{ width: 'auto' }} />
        <button className="btn btn-ghost btn-sm" onClick={() => setDate(addDays(date, 1))} disabled={isToday}>Next day ›</button>
      </PageHead>

      <div className="kpis">
        <Stat label="On-time rate" value={`${d.sum.compliance}%`} accent sub={`${dayName(date)}, ${fmtDate(date)}`} />
        <Stat label="Fed on time" value={d.sum.ontime} sub={`of ${d.sum.total} meals scheduled`} />
        <Stat label="Fed late / too early" value={d.sum.late} />
        <Stat label="Missed" value={d.sum.missed} />
        <Stat label="Due now" value={d.sum.due} live={isToday} />
        <Stat label="Upcoming" value={d.sum.upcoming} />
      </div>

      <div className="grid g-2-1" style={{ marginTop: 16 }}>
        <Card title="Meal timeline" actions={
          <Seg value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'attention', label: 'Needs attention' }, { value: 'upcoming', label: 'Upcoming' }]} />
        }>
          <div className="timeline">
            {rows.map((r) => {
              const keeper = employeeById(r.slot.keeperId);
              const st = STATUS[r.status];
              return (
                <div key={r.slot.id} className={`feed-item ${r.status}`}>
                  <div className="feed-time">{r.slot.time}</div>
                  <div className="feed-emoji" aria-hidden>{r.slot.emoji}</div>
                  <div style={{ minWidth: 0 }}>
                    <b>{r.slot.animal}</b> <span className="muted small">· {r.slot.enclosure}</span>
                    <div className="small muted">{r.slot.food} · {r.slot.qty} · Keeper: {keeper?.name ?? r.slot.keeperId}</div>
                    {r.log && (
                      <div className="small" style={{ marginTop: 2 }}>
                        Fed at <b>{fmtTime(r.log.fedAt)}</b> ({r.delayMin > 0 ? `${r.delayMin} min after` : r.delayMin < 0 ? `${-r.delayMin} min before` : 'exactly at'} schedule)
                        {r.log.qty && r.log.qty !== r.slot.qty ? ` · qty ${r.log.qty}` : ''}{r.log.note ? ` · “${r.log.note}”` : ''}
                      </div>
                    )}
                    {r.status === 'due' && r.overdueMin > 0 && <div className="small" style={{ color: 'var(--info)' }}>{r.overdueMin} min past scheduled time</div>}
                  </div>
                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    <Badge tone={st.tone}>{st.label}</Badge>
                    {!r.log && r.status !== 'upcoming' && <button className="btn btn-sm" onClick={() => setLogSlot(r.slot)}>Mark fed</button>}
                    {!r.log && r.status === 'upcoming' && isToday && <button className="btn btn-ghost btn-sm" onClick={() => setLogSlot(r.slot)}>Mark fed</button>}
                    {r.log && !r.log.demo && isToday && <button className="btn btn-ghost btn-sm" onClick={() => { undoFeeding(date, r.slot); toast('Feeding entry removed'); }}>Undo</button>}
                  </div>
                </div>
              );
            })}
            {!rows.length && <p className="muted">Nothing to show.</p>}
          </div>
        </Card>
        <Card title="On-time rate — last 30 days" sub="% of served-or-missed meals that were on time">
          <SingleBarChart data={d.hist} yKey="compliance" name="On time" fmt={(v) => `${v}%`} axisFmt={(v) => `${v}%`} height={240} labelFmt={(l, row) => `${l} · ${row?.missed ?? 0} missed, ${row?.late ?? 0} late`} />
          <p className="small muted">Missed meals in 30 days: <b>{d.hist.reduce((s, r) => s + r.missed, 0)}</b> · late: <b>{d.hist.reduce((s, r) => s + r.late, 0)}</b></p>
        </Card>
      </div>

      {logSlot && (
        <FeedDialog slot={logSlot} date={date} onClose={() => setLogSlot(null)} onSave={async (v) => {
          await logFeeding(date, logSlot, { ...v, by: user.employeeId });
          toast(`${logSlot.animal} marked as fed`);
          setLogSlot(null);
        }} />
      )}
    </>
  );
}

function FeedDialog({ slot, date, onClose, onSave }) {
  const isToday = date === todayKey();
  const [time, setTime] = useState(isToday ? hm(minutesNow()) : slot.time);
  const [qty, setQty] = useState(slot.qty);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const late = toMinutes(time) - toMinutes(slot.time);
  return (
    <Modal title={`Log feeding — ${slot.emoji} ${slot.animal}`} onClose={onClose}>
      <form className="stack" onSubmit={async (e) => { e.preventDefault(); setBusy(true); await onSave({ fedAt: atTime(date, toMinutes(time)), qty, note }); }}>
        <p className="muted small" style={{ margin: 0 }}>Scheduled {slot.time} · {slot.food} · {slot.qty} · {slot.enclosure}</p>
        <div className="form-grid">
          <label className="field"><span>Fed at</span><input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></label>
          <label className="field"><span>Quantity given</span><input className="input" value={qty} onChange={(e) => setQty(e.target.value)} /></label>
        </div>
        <label className="field"><span>Note (appetite, refused food, health)</span><textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></label>
        {late > FEED_ON_TIME_MIN && <div className="notice">This will be recorded as late by {late} minutes.</div>}
        {late < -FEED_ON_TIME_MIN && <div className="notice">This is {-late} minutes before the scheduled time and will be recorded as too early.</div>}
        <button className="btn block" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
      </form>
    </Modal>
  );
}
