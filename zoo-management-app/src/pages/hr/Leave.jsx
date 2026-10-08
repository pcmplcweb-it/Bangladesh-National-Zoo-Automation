import { useState } from 'react';
import { useAuth } from '../../services/auth';
import { useLive } from '../../services/db';
import { leaves, leaveBalance, applyLeave, decideLeave, employees, employeeById, leaveDays } from '../../services/hr';
import { PageHead, Card, Badge, Seg, Modal, useToast } from '../../components/ui';
import { LEAVE_TYPES, leaveTypeName } from '../../data/master';
import { todayKey, addDays, fmtDate } from '../../lib/dates';

const TONE = { pending: 'warn', approved: 'good', rejected: 'bad', cancelled: 'mute' };
const LABEL = { pending: '● Pending', approved: '✓ Approved', rejected: '✕ Rejected', cancelled: 'Cancelled' };

export default function Leave() {
  const { user } = useAuth();
  const toast = useToast();
  const manager = user.role === 'admin' || user.role === 'hr';
  const [filter, setFilter] = useState(manager ? 'pending' : 'all');
  const [applying, setApplying] = useState(false);
  const [balFor, setBalFor] = useState(user.employeeId);

  const d = useLive(() => {
    const all = leaves().filter((l) => manager || l.employeeId === user.employeeId);
    return {
      list: all.filter((l) => filter === 'all' || l.status === filter),
      counts: Object.fromEntries(['pending', 'approved', 'rejected'].map((s) => [s, all.filter((l) => l.status === s).length])),
      onLeaveToday: leaves().filter((l) => l.status === 'approved' && l.from <= todayKey() && l.to >= todayKey()),
      balance: leaveBalance(employeeById(balFor)),
    };
  }, [filter, balFor, manager]);

  const decide = (l, status) => {
    decideLeave(l.id, status, user.employeeId);
    toast(`${l.id} ${status}`);
  };

  return (
    <>
      <PageHead title="Leave management" sub={manager ? 'Approve requests, see who is away and check balances.' : 'Apply for leave and follow your requests.'}>
        <button className="btn btn-orange" onClick={() => setApplying(true)}>+ Apply for leave</button>
      </PageHead>

      <div className="grid g-2-1">
        <Card title="Requests" actions={
          <Seg value={filter} onChange={setFilter} options={[
            { value: 'pending', label: `Pending (${d.counts.pending})` }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'all', label: 'All' },
          ]} />
        }>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Request</th><th>Employee</th><th>Type</th><th>Dates</th><th className="num">Days</th><th>Status</th>{manager && <th />}</tr></thead>
              <tbody>
                {d.list.map((l) => {
                  const e = employeeById(l.employeeId);
                  return (
                    <tr key={l.id}>
                      <td className="mono small">{l.id}</td>
                      <td><b>{e?.name}</b><div className="small muted">{e?.dept}</div></td>
                      <td className="small">{leaveTypeName(l.type)}<div className="muted">“{l.reason}”</div></td>
                      <td className="small nowrap">{fmtDate(l.from)}{l.to !== l.from && <><br />→ {fmtDate(l.to)}</>}</td>
                      <td className="num">{l.days}</td>
                      <td><Badge tone={TONE[l.status]}>{LABEL[l.status]}</Badge>{l.decidedBy && <div className="small muted">by {employeeById(l.decidedBy)?.name.split(' ').slice(-1)}</div>}</td>
                      {manager && (
                        <td className="nowrap right">
                          {l.status === 'pending' && l.employeeId !== user.employeeId && (
                            <>
                              <button className="btn btn-sm" onClick={() => decide(l, 'approved')}>Approve</button>{' '}
                              <button className="btn btn-ghost btn-sm" onClick={() => decide(l, 'rejected')}>Reject</button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {!d.list.length && <tr><td colSpan={7} className="empty">No requests.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="stack">
          <Card title="Away today" sub={fmtDate(todayKey())}>
            {d.onLeaveToday.length === 0 && <p className="muted small">Nobody is on leave today.</p>}
            {d.onLeaveToday.map((l) => (
              <div key={l.id} className="spread small" style={{ padding: '6px 0', borderTop: '1px solid var(--line)' }}>
                <span><b>{employeeById(l.employeeId)?.name}</b><br /><span className="muted">{leaveTypeName(l.type)} · back {fmtDate(addDays(l.to, 1))}</span></span>
              </div>
            ))}
          </Card>
          <Card title="Leave balance" sub={`Year ${todayKey().slice(0, 4)}`} actions={manager && (
            <select className="input" style={{ width: 180 }} value={balFor} onChange={(e) => setBalFor(e.target.value)} aria-label="Employee">
              {employees().map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}>
            <table className="tbl">
              <thead><tr><th>Type</th><th className="num">Entitled</th><th className="num">Used</th><th className="num">Left</th></tr></thead>
              <tbody>
                {d.balance.map((b) => (
                  <tr key={b.id}><td className="small">{b.name}{b.pending ? <div className="muted">{b.pending} pending</div> : null}</td><td className="num">{b.perYear || '—'}</td><td className="num">{b.used}</td><td className="num"><b>{b.left ?? '—'}</b></td></tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {applying && <ApplyDialog manager={manager} me={user.employeeId} onClose={() => setApplying(false)} onDone={(lv) => { toast(`Leave request ${lv.id} submitted`); setApplying(false); setFilter('pending'); }} />}
    </>
  );
}

function ApplyDialog({ manager, me, onClose, onDone }) {
  const [f, setF] = useState({ employeeId: me, type: 'casual', from: addDays(todayKey(), 1), to: addDays(todayKey(), 1), reason: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const emp = employeeById(f.employeeId);
  const types = LEAVE_TYPES.filter((t) => !t.onlyFor || t.onlyFor === emp?.gender);
  return (
    <Modal title="Apply for leave" onClose={onClose}>
      <form className="stack" onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try { onDone(await applyLeave(f)); } catch (err) { setError(err.message); } finally { setBusy(false); }
      }}>
        {manager && (
          <label className="field"><span>Employee</span>
            <select className="input" value={f.employeeId} onChange={(e) => setF({ ...f, employeeId: e.target.value })}>
              {employees().map((x) => <option key={x.id} value={x.id}>{x.id} · {x.name}</option>)}
            </select>
          </label>
        )}
        <label className="field"><span>Leave type</span>
          <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <div className="form-grid">
          <label className="field"><span>From</span><input className="input" type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value, to: f.to < e.target.value ? e.target.value : f.to })} /></label>
          <label className="field"><span>To</span><input className="input" type="date" value={f.to} min={f.from} onChange={(e) => setF({ ...f, to: e.target.value })} /></label>
        </div>
        <p className="small muted" style={{ margin: 0 }}>{leaveDays(f.from, f.to)} day(s)</p>
        <label className="field"><span>Reason</span><textarea className="input" rows={3} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></label>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="btn block" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button>
      </form>
    </Modal>
  );
}
