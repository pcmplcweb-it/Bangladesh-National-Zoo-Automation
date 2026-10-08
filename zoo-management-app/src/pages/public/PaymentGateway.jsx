// Simulated payment provider screens (stands in for the bKash / Nagad / SSLCommerz hosted page).
import { useEffect, useState } from 'react';
import { PAYMENT_METHODS } from '../../data/master';
import { startPayment, sendOtp, confirmWallet, payByCard, cancelPayment, DEMO_OTP, DEMO_PIN } from '../../services/payments';
import { tk } from '../../lib/format';
import PayLogo from '../../components/PayLogo';

export default function PaymentGateway({ ticket, method, onDone, onClose }) {
  const m = PAYMENT_METHODS.find((x) => x.id === method);
  const [step, setStep] = useState('init'); // init | number | otp | pin | card | done
  const [wallet, setWallet] = useState(ticket.buyer.mobile || '');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: ticket.buyer.name || '' });
  const [masked, setMasked] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    startPayment(ticket, method).then(() => live && setStep(m.kind === 'card' ? 'card' : 'number'));
    return () => { live = false; };
  }, [ticket, method, m.kind]);

  const run = async (fn) => {
    setError('');
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    cancelPayment(ticket);
    onClose();
  };

  const steps = m.kind === 'card' ? ['card'] : ['number', 'otp', 'pin'];
  const idx = steps.indexOf(step);

  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-modal="true" aria-label={`${m.name} payment`} style={{ width: 'min(420px, 100%)' }}>
        <div className="gw-head" style={{ background: m.color }}>
          <div className="row" style={{ gap: 10 }}>
            <PayLogo method={method} size={40} />
            <div>
              <b>{m.kind === 'card' ? 'Secure card payment' : `${m.name} Payment`}</b>
              <div className="small" style={{ opacity: .85 }}>Merchant: Bangladesh National Zoo</div>
            </div>
          </div>
          <div className="right">
            <div className="small" style={{ opacity: .85 }}>Amount</div>
            <div className="gw-amount">{tk(ticket.amount)}</div>
          </div>
        </div>
        <div className="modal-body">
          <div className="notice small" style={{ marginBottom: 14 }}>
            Test mode — no money moves.
            {m.kind === 'card' ? ' Use card 4111 1111 1111 1111, any future expiry, any CVC (ending 0002 = declined).' : ` Code: ${DEMO_OTP}, PIN: ${DEMO_PIN}.`}
          </div>
          {idx >= 0 && steps.length > 1 && <div className="gw-steps">{steps.map((s, i) => <i key={s} className={i <= idx ? 'on' : ''} />)}</div>}
          <p className="small muted" style={{ marginTop: 0 }}>Invoice <span className="mono">{ticket.id}</span> · {ticket.visitors} visitor(s)</p>

          {step === 'init' && <p>Connecting to {m.name}…</p>}

          {step === 'number' && (
            <form className="stack" onSubmit={(e) => { e.preventDefault(); run(async () => { const r = await sendOtp(wallet); setMasked(r.sentTo); setStep('otp'); }); }}>
              <label className="field"><span>Your {m.name} account number</span>
                <input className="input" autoFocus inputMode="numeric" maxLength={11} value={wallet} onChange={(e) => setWallet(e.target.value.replace(/\D/g, ''))} placeholder="01XXXXXXXXX" />
              </label>
              {error && <div className="error">{error}</div>}
              <button className="btn block" style={{ background: m.color }} disabled={busy}>{busy ? 'Sending code…' : 'Confirm'}</button>
            </form>
          )}

          {step === 'otp' && (
            <form className="stack" onSubmit={(e) => { e.preventDefault(); if (otp.length !== 6) return setError('Enter the 6-digit code.'); setError(''); setStep('pin'); }}>
              <label className="field"><span>Verification code sent to {masked}</span>
                <input className="input mono" autoFocus inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="••••••" />
              </label>
              {error && <div className="error">{error}</div>}
              <button className="btn block" style={{ background: m.color }}>Next</button>
            </form>
          )}

          {step === 'pin' && (
            <form className="stack" onSubmit={(e) => { e.preventDefault(); run(async () => { const t = await confirmWallet(ticket, method, { otp, pin }); onDone(t); }); }}>
              <label className="field"><span>Enter your {m.name} PIN</span>
                <input className="input mono" autoFocus type="password" inputMode="numeric" maxLength={5} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="•••••" />
              </label>
              {error && <div className="error">{error}</div>}
              {error === 'Wrong verification code.' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOtp(''); setPin(''); setError(''); setStep('otp'); }}>Re-enter code</button>}
              <button className="btn block" style={{ background: m.color }} disabled={busy}>{busy ? 'Processing…' : `Pay ${tk(ticket.amount)}`}</button>
            </form>
          )}

          {step === 'card' && (
            <form className="stack" onSubmit={(e) => { e.preventDefault(); run(async () => { const t = await payByCard(ticket, card); onDone(t); }); }}>
              <label className="field"><span>Card number</span>
                <input className="input mono" autoFocus inputMode="numeric" autoComplete="cc-number" value={card.number} placeholder="1234 5678 9012 3456"
                  onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ') })} />
              </label>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <label className="field"><span>Expiry</span>
                  <input className="input mono" placeholder="MM/YY" autoComplete="cc-exp" value={card.expiry}
                    onChange={(e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); setCard({ ...card, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }} />
                </label>
                <label className="field"><span>CVC</span>
                  <input className="input mono" placeholder="123" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} />
                </label>
              </div>
              <label className="field"><span>Name on card</span>
                <input className="input" autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
              </label>
              {error && <div className="error">{error}</div>}
              <button className="btn block" style={{ background: m.color }} disabled={busy}>{busy ? 'Authorising…' : `Pay ${tk(ticket.amount)}`}</button>
            </form>
          )}
          <button className="btn btn-ghost block" style={{ marginTop: 10 }} onClick={cancel} disabled={busy}>Cancel payment</button>
        </div>
      </div>
    </div>
  );
}
