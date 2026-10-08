import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TICKET_TYPES, PAYMENT_METHODS, ZOO } from '../../data/master';
import { createBooking, priceOf, isBookable } from '../../services/tickets';
import { Stepper } from '../../components/ui';
import { tk } from '../../lib/format';
import { todayKey, addDays, fmtDate, dayName } from '../../lib/dates';
import PaymentGateway from './PaymentGateway';
import PayLogo from '../../components/PayLogo';

const firstBookable = () => {
  let k = todayKey();
  for (let i = 0; i < 8 && !isBookable(k); i++) k = addDays(k, 1);
  return k;
};

export default function BookTickets() {
  const nav = useNavigate();
  const [items, setItems] = useState({ male: 1, female: 1, child: 0, student: 0 });
  const [buyer, setBuyer] = useState({ name: '', mobile: '', email: '' });
  const [visitDate, setVisitDate] = useState(firstBookable);
  const [method, setMethod] = useState('bkash');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(null);

  const visitors = Object.values(items).reduce((a, b) => a + b, 0);
  const total = priceOf(items);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!visitors) return setError('Add at least one visitor.');
    if (items.student && items.student < 10) return setError('Student tickets are for groups of 10 or more with an institution letter.');
    if (buyer.name.trim().length < 3) return setError('Enter your full name.');
    if (!/^01[3-9]\d{8}$/.test(buyer.mobile)) return setError('Enter a valid 11-digit mobile number (01XXXXXXXXX).');
    if (!isBookable(visitDate)) return setError('The zoo is closed on that date (weekly closing day is Sunday) or it is past last entry time.');
    if (!agree) return setError('Please accept the visitor rules.');
    setBusy(true);
    try {
      const t = await createBooking({
        visitDate, items, buyer: { ...buyer, name: buyer.name.trim() }, channel: 'online',
        payment: { method, status: 'pending', trxId: '' },
      });
      setPaying(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="public">
      <div className="wrap">
        <header className="public-head">
          <Link to="/book" className="brand" style={{ color: 'var(--green-dark)' }}>
            <span className="brand-logo" aria-hidden>🐯</span>
            <span><b>Bangladesh National Zoo</b><small className="bn" style={{ color: 'var(--muted)' }}>{ZOO.bn}</small></span>
          </Link>
          <Link to="/ticket" className="btn btn-ghost btn-sm">Find my ticket</Link>
        </header>

        <div style={{ textAlign: 'center', margin: '18px 0 26px' }}>
          <div className="eyebrow">🐾 Tickets 🐾</div>
          <h1 className="hero-title">Book Your Tickets Online</h1>
          <p className="muted">Pay with bKash, Nagad, Rocket or card and skip the queue — show the QR code at the gate.</p>
        </div>

        <form className="book-card" onSubmit={submit} noValidate>
          <div>
            {TICKET_TYPES.map((t) => (
              <div className="ticket-row" key={t.id}>
                <div className="t-name"><b>{t.label}</b><small>{t.note}</small></div>
                <span className="price">Tk {t.price}</span>
                <Stepper label={t.label} value={items[t.id]} onChange={(v) => setItems({ ...items, [t.id]: v })} max={t.id === 'student' ? 300 : 30} />
              </div>
            ))}
            <div className="total-row">
              <span>Total ({visitors} visitor{visitors === 1 ? '' : 's'})</span>
              <b>{tk(total)}</b>
            </div>
            <p className="muted small">Children under 3 enter free and do not need a ticket. A ticket is valid for one entry on the chosen date, until closing ({ZOO.closeMin / 60 - 12}:00 PM).</p>
          </div>

          <div className="stack">
            <label className="field"><span>Full name</span>
              <input className="input" value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} placeholder="Your name" autoComplete="name" />
            </label>
            <div className="form-grid">
              <label className="field"><span>Mobile number</span>
                <input className="input" value={buyer.mobile} inputMode="numeric" maxLength={11} onChange={(e) => setBuyer({ ...buyer, mobile: e.target.value.replace(/\D/g, '') })} placeholder="01XXXXXXXXX" autoComplete="tel" />
              </label>
              <label className="field"><span>Email (optional)</span>
                <input className="input" type="email" value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} placeholder="you@example.com" />
              </label>
            </div>
            <label className="field"><span>Visit date</span>
              <input className="input" type="date" value={visitDate} min={todayKey()} max={addDays(todayKey(), 30)} onChange={(e) => setVisitDate(e.target.value)} />
              <small className={isBookable(visitDate) ? 'muted' : ''} style={isBookable(visitDate) ? undefined : { color: 'var(--bad)' }}>
                {dayName(visitDate)}, {fmtDate(visitDate)} {isBookable(visitDate) ? '· Open 9:00 AM – 6:00 PM' : '· Closed / not bookable'}
              </small>
            </label>
            <div className="field"><span>Pay with</span>
              <div className="pay-grid">
                {PAYMENT_METHODS.map((m) => (
                  <button type="button" key={m.id} className={`pay-opt ${method === m.id ? 'on' : ''}`} onClick={() => setMethod(m.id)} aria-pressed={method === m.id}>
                    <PayLogo method={m.id} />{m.id === 'card' ? 'Card' : m.name}
                  </button>
                ))}
              </div>
            </div>
            <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 4 }} />
              <span>I agree to the zoo rules (no feeding or teasing animals, no plastic bags, tickets are non-refundable after the visit date).</span>
            </label>
            {error && <div className="error" role="alert">{error}</div>}
            <button className="btn btn-orange btn-lg block" disabled={busy || !visitors}>
              {busy ? 'Creating booking…' : `Pay ${tk(total)}`}
            </button>
            <p className="muted small" style={{ margin: 0 }}>🔒 Payments are processed by the payment provider. The zoo never sees your PIN or card number.</p>
          </div>
        </form>
        <p className="center muted small" style={{ textAlign: 'center', margin: '28px 0' }}>Staff? <Link to="/login">Sign in to the management system</Link></p>
      </div>
      {paying && (
        <PaymentGateway
          ticket={paying}
          method={method}
          onDone={(t) => nav(`/ticket/${t.id}`)}
          onClose={() => setPaying(null)}
        />
      )}
    </div>
  );
}
