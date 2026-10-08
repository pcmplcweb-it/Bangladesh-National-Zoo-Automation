import { useState } from 'react';
import { useAuth } from '../../services/auth';
import { useLive } from '../../services/db';
import { createBooking, priceOf, recordGate, ticketsForVisitDate, isBookable } from '../../services/tickets';
import { PageHead, Card, Stepper, Modal, Stat, useToast } from '../../components/ui';
import TicketView from '../../components/TicketView';
import PayLogo from '../../components/PayLogo';
import { TICKET_TYPES, GATES, methodName } from '../../data/master';
import { tk, num } from '../../lib/format';
import { todayKey, fmtTime } from '../../lib/dates';

const EMPTY = { male: 0, female: 0, child: 0, student: 0 };
const METHODS = ['cash', 'bkash', 'nagad', 'rocket', 'card'];

export default function CounterSale() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(EMPTY);
  const [method, setMethod] = useState('cash');
  const [received, setReceived] = useState('');
  const [trx, setTrx] = useState('');
  const [mobile, setMobile] = useState('');
  const [admit, setAdmit] = useState(true);
  const [gate, setGate] = useState('G1');
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState(null);
  const [error, setError] = useState('');

  const visitors = Object.values(items).reduce((a, b) => a + b, 0);
  const total = priceOf(items);
  const change = Number(received || 0) - total;
  const open = isBookable(todayKey());

  const mine = useLive(() => {
    const list = ticketsForVisitDate(todayKey()).filter((t) => t.channel === 'counter' && t.soldBy === user.username);
    return {
      count: list.length,
      visitors: list.reduce((s, t) => s + t.visitors, 0),
      cash: list.filter((t) => t.payment.method === 'cash').reduce((s, t) => s + t.amount, 0),
      digital: list.filter((t) => t.payment.method !== 'cash').reduce((s, t) => s + t.amount, 0),
      recent: list.slice(-6).reverse(),
    };
  }, [user.username]);

  const sell = async () => {
    setError('');
    if (!visitors) return setError('Add at least one visitor.');
    if (method === 'cash' && received !== '' && change < 0) return setError('Cash received is less than the total.');
    if (method !== 'cash' && trx.trim().length < 6) return setError('Enter the transaction ID shown on the customer’s phone / POS slip.');
    setBusy(true);
    try {
      let t = await createBooking({
        visitDate: todayKey(), items, channel: 'counter',
        buyer: { name: 'Walk-in visitor', mobile },
        payment: { method, status: 'paid', trxId: method === 'cash' ? '' : trx.trim().toUpperCase() },
        soldBy: user.username,
      });
      if (admit) t = await recordGate(t.id, 'in', t.visitors, gate, user.username);
      setIssued(t);
      toast(`Ticket ${t.id} issued · ${tk(t.amount)}`);
      setItems(EMPTY);
      setReceived('');
      setTrx('');
      setMobile('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHead title="Counter sale" sub="Sell walk-in tickets at the counter. The ticket prints with a QR code for the gate." />
      {!open && <div className="notice" style={{ marginBottom: 16 }}>Ticket sales for today are closed (Sunday or after last entry at 5:00 PM). You can still record a sale for testing.</div>}

      <div className="grid g-2-1">
        <Card title="New sale">
          {TICKET_TYPES.map((t) => (
            <div className="ticket-row" key={t.id}>
              <div className="t-name"><b>{t.label}</b><small>{t.note}</small></div>
              <span className="price">Tk {t.price}</span>
              <Stepper label={t.label} value={items[t.id]} onChange={(v) => setItems({ ...items, [t.id]: v })} max={300} />
            </div>
          ))}
          <div className="total-row"><span>Total · {visitors} visitor(s)</span><b>{tk(total)}</b></div>

          <div className="stack" style={{ marginTop: 18 }}>
            <div className="field"><span>Payment</span>
              <div className="row" style={{ gap: 8 }}>
                {METHODS.map((m) => (
                  <button key={m} type="button" className={`pay-opt ${method === m ? 'on' : ''}`} style={{ padding: '8px 12px' }} onClick={() => setMethod(m)} aria-pressed={method === m}>
                    <PayLogo method={m} size={26} />{m === 'card' ? 'Card (POS)' : methodName(m)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-grid">
              {method === 'cash' ? (
                <label className="field"><span>Cash received (Tk)</span>
                  <input className="input" inputMode="numeric" value={received} onChange={(e) => setReceived(e.target.value.replace(/\D/g, ''))} placeholder={String(total)} />
                  {received !== '' && <small style={{ color: change < 0 ? 'var(--bad)' : 'var(--good)', fontWeight: 600 }}>{change < 0 ? `Short by ${tk(-change)}` : `Change to return: ${tk(change)}`}</small>}
                </label>
              ) : (
                <label className="field"><span>Transaction ID</span>
                  <input className="input mono" value={trx} onChange={(e) => setTrx(e.target.value)} placeholder="e.g. 9JK4ABCD12" />
                </label>
              )}
              <label className="field"><span>Visitor mobile (optional, for SMS ticket)</span>
                <input className="input" inputMode="numeric" maxLength={11} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} placeholder="01XXXXXXXXX" />
              </label>
            </div>
            <div className="row">
              <label className="row small" style={{ gap: 6 }}>
                <input type="checkbox" checked={admit} onChange={(e) => setAdmit(e.target.checked)} /> Admit now through
              </label>
              <select className="input" style={{ width: 'auto' }} value={gate} onChange={(e) => setGate(e.target.value)} disabled={!admit}>
                {GATES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            {error && <div className="error" role="alert">{error}</div>}
            <button className="btn btn-orange btn-lg block" onClick={sell} disabled={busy || !visitors}>{busy ? 'Issuing…' : `Issue ticket · ${tk(total)}`}</button>
          </div>
        </Card>

        <div className="stack">
          <div className="kpis" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Stat label="My tickets today" value={mine.count} sub={`${num(mine.visitors)} visitors`} />
            <Stat label="Cash in drawer" value={tk(mine.cash)} sub={`Digital ${tk(mine.digital)}`} accent />
          </div>
          <Card title="My recent sales">
            {mine.recent.length === 0 && <p className="muted small">No sales from your counter yet today.</p>}
            {mine.recent.map((t) => (
              <button key={t.id} className="spread small" onClick={() => setIssued(t)} style={{ width: '100%', border: 0, background: 'none', padding: '8px 0', borderTop: '1px solid var(--line)', cursor: 'pointer', textAlign: 'left' }}>
                <span><span className="mono">{t.id}</span><br /><span className="muted">{fmtTime(t.createdAt)} · {t.visitors} pax · {methodName(t.payment.method)}</span></span>
                <b>{tk(t.amount)}</b>
              </button>
            ))}
          </Card>
        </div>
      </div>

      {issued && (
        <Modal title="Ticket issued" onClose={() => setIssued(null)} width={820}>
          <TicketView t={issued} />
          <div className="row no-print" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setIssued(null)}>Close</button>
            <button className="btn" onClick={() => window.print()}>🖨 Print ticket</button>
          </div>
        </Modal>
      )}
    </>
  );
}
