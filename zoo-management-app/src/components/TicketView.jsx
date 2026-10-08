// E-ticket card (used on the public ticket page and inside staff screens).
import { QRCodeSVG } from 'qrcode.react';
import { TICKET_TYPES, methodName } from '../data/master';
import { inside } from '../services/tickets';
import { fmtDate, dayName, fmtTime } from '../lib/dates';
import { tk } from '../lib/format';
import { Badge } from './ui';

export function ticketState(t) {
  if (t.status === 'cancelled') return { tone: 'bad', label: 'Cancelled' };
  if (t.payment.status === 'pending') return { tone: 'warn', label: 'Payment pending' };
  if (t.payment.status === 'failed') return { tone: 'bad', label: 'Payment failed' };
  const io = inside(t);
  if (io.entered === 0) return { tone: 'info', label: 'Not used yet' };
  if (io.inside > 0) return { tone: 'good', label: `${io.inside} inside` };
  if (io.notEntered > 0) return { tone: 'warn', label: `${io.notEntered} not entered` };
  return { tone: 'mute', label: 'Visited (exited)' };
}

export default function TicketView({ t }) {
  const st = ticketState(t);
  const io = inside(t);
  return (
    <div className="eticket">
      <div className="eticket-head">
        <div>
          <b style={{ fontSize: 18 }}>🐯 Bangladesh National Zoo</b>
          <div className="small" style={{ opacity: .85 }}>E-ticket · Zoo Road, Mirpur-1, Dhaka</div>
        </div>
        <Badge tone={st.tone}>{st.label}</Badge>
      </div>
      <div className="eticket-main">
        <div className="kv">
          <div><small>Visit date</small><b>{dayName(t.visitDate)}, {fmtDate(t.visitDate)}</b></div>
          <div><small>Name</small><b>{t.buyer.name || '—'}</b></div>
          <div><small>Mobile</small><b>{t.buyer.mobile || '—'}</b></div>
          <div><small>Booked</small><b>{fmtDate(t.createdAt.slice(0, 10))} {fmtTime(t.createdAt)}</b></div>
          <div><small>Payment</small><b>{methodName(t.payment.method)} · {t.payment.status}</b></div>
          <div><small>Transaction</small><b className="mono">{t.payment.trxId || '—'}</b></div>
        </div>
        <table className="tbl" style={{ marginTop: 16 }}>
          <tbody>
            {TICKET_TYPES.filter((x) => t.items[x.id]).map((x) => (
              <tr key={x.id}><td>{x.label}</td><td className="num">{t.items[x.id]} × Tk {x.price}</td><td className="num">{tk(t.items[x.id] * x.price)}</td></tr>
            ))}
          </tbody>
          <tfoot><tr><td>Total · {t.visitors} visitor(s)</td><td /><td className="num">{tk(t.amount)}</td></tr></tfoot>
        </table>
        {t.log.length > 0 && (
          <p className="small muted" style={{ marginBottom: 0 }}>
            Gate: {io.entered} entered · {io.exited} exited{t.log.length ? ` · last scan ${fmtTime(t.log[t.log.length - 1].at)}` : ''}
          </p>
        )}
      </div>
      <div className="eticket-side">
        <QRCodeSVG value={t.id} size={168} level="M" marginSize={1} />
        <b className="mono" style={{ fontSize: 15 }}>{t.id}</b>
        <small className="muted">Show this QR code at the gate. Valid for one entry on the visit date.</small>
      </div>
    </div>
  );
}
