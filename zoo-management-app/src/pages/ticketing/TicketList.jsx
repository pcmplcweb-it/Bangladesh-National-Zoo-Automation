import { useState } from 'react';
import { useLive } from '../../services/db';
import { useAuth } from '../../services/auth';
import { ticketsForVisitDate, inside, updateTicket, findTicket } from '../../services/tickets';
import { PageHead, Card, Seg, Modal, Badge, useToast } from '../../components/ui';
import TicketView, { ticketState } from '../../components/TicketView';
import { methodName } from '../../data/master';
import { tk, num, downloadCsv } from '../../lib/format';
import { todayKey, fmtTime, fmtDate } from '../../lib/dates';

const PAGE = 60;

export default function TicketList() {
  const { user } = useAuth();
  const toast = useToast();
  const [date, setDate] = useState(todayKey());
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState('all');
  const [state, setState] = useState('all');
  const [limit, setLimit] = useState(PAGE);
  const [openId, setOpenId] = useState(null);

  const list = useLive(() => {
    const needle = q.trim().toLowerCase();
    return ticketsForVisitDate(date)
      .filter((t) => channel === 'all' || t.channel === channel)
      .filter((t) => {
        if (state === 'all') return true;
        const io = inside(t);
        if (state === 'inside') return io.inside > 0;
        if (state === 'unused') return t.payment.status === 'paid' && t.status === 'valid' && io.entered === 0;
        if (state === 'exited') return io.entered > 0 && io.inside === 0;
        if (state === 'problem') return t.status !== 'valid' || t.payment.status !== 'paid';
        return true;
      })
      .filter((t) => !needle || t.id.toLowerCase().includes(needle) || t.buyer.mobile.includes(needle) || t.buyer.name.toLowerCase().includes(needle))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [date, q, channel, state]);
  const open = useLive(() => (openId ? findTicket(openId) : null), [openId]);

  const cancel = (t) => {
    if (!window.confirm(`Cancel ticket ${t.id}? It will no longer be accepted at the gate.`)) return;
    updateTicket(t.id, { status: 'cancelled', cancelledBy: user.username });
    toast(`Ticket ${t.id} cancelled`);
  };

  const exportCsv = () => downloadCsv(`bnz-tickets-${date}.csv`, list.map((t) => {
    const io = inside(t);
    return {
      ticket: t.id, channel: t.channel, booked_at: t.createdAt, visit_date: t.visitDate, name: t.buyer.name, mobile: t.buyer.mobile,
      male: t.items.male, female: t.items.female, children: t.items.child, students: t.items.student, visitors: t.visitors,
      amount_tk: t.amount, payment: t.payment.method, payment_status: t.payment.status, trx: t.payment.trxId, status: t.status,
      entered: io.entered, exited: io.exited,
    };
  }));

  return (
    <>
      <PageHead title="Tickets" sub={`${num(list.length)} ticket(s) for ${fmtDate(date)}`}>
        <button className="btn btn-ghost" onClick={exportCsv} disabled={!list.length}>⬇ Export CSV</button>
      </PageHead>
      <Card>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <label className="field"><span>Visit date</span>
            <input className="input" type="date" value={date} onChange={(e) => { if (e.target.value) { setDate(e.target.value); setLimit(PAGE); } }} />
          </label>
          <label className="field grow" style={{ minWidth: 220 }}><span>Search</span>
            <input className="input" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Ticket code, mobile or name" />
          </label>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <Seg value={channel} onChange={setChannel} options={[{ value: 'all', label: 'All channels' }, { value: 'online', label: 'Online' }, { value: 'counter', label: 'Counter' }]} />
          <Seg value={state} onChange={setState} options={[
            { value: 'all', label: 'Any status' }, { value: 'unused', label: 'Not entered' }, { value: 'inside', label: 'Inside' },
            { value: 'exited', label: 'Exited' }, { value: 'problem', label: 'Cancelled / unpaid' },
          ]} />
        </div>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="tbl">
            <thead>
              <tr><th>Ticket</th><th>Booked</th><th>Channel</th><th>Visitor</th><th className="num">M / F / C / S</th><th className="num">Amount</th><th>Payment</th><th>Status</th></tr>
            </thead>
            <tbody>
              {list.slice(0, limit).map((t) => {
                const st = ticketState(t);
                return (
                  <tr key={t.id} onClick={() => setOpenId(t.id)} style={{ cursor: 'pointer' }}>
                    <td className="mono nowrap">{t.id}</td>
                    <td className="nowrap">{t.createdAt.slice(0, 10) === date ? fmtTime(t.createdAt) : fmtDate(t.createdAt.slice(0, 10))}</td>
                    <td>{t.channel === 'online' ? <Badge tone="info">Online</Badge> : <Badge>Counter</Badge>}</td>
                    <td>{t.buyer.name}<div className="small muted">{t.buyer.mobile}</div></td>
                    <td className="num nowrap">{t.items.male} / {t.items.female} / {t.items.child} / {t.items.student}</td>
                    <td className="num">{tk(t.amount)}</td>
                    <td className="nowrap">{methodName(t.payment.method)}</td>
                    <td><Badge tone={st.tone}>{st.label}</Badge></td>
                  </tr>
                );
              })}
              {!list.length && <tr><td colSpan={8} className="empty">No tickets match.</td></tr>}
            </tbody>
          </table>
        </div>
        {list.length > limit && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setLimit(limit + PAGE * 2)}>Show more ({num(list.length - limit)} left)</button>
          </div>
        )}
      </Card>

      {open && (
        <Modal title={`Ticket ${open.id}`} onClose={() => setOpenId(null)} width={820}>
          <TicketView t={open} />
          {open.log.length > 0 && (
            <>
              <h4 style={{ margin: '18px 0 6px' }}>Gate log</h4>
              <table className="tbl">
                <tbody>
                  {open.log.map((e, i) => (
                    <tr key={i}><td>{e.type === 'in' ? '➡ Entry' : '⬅ Exit'}</td><td>{e.count} visitor(s)</td><td>{e.gate}</td><td>{fmtTime(e.at)}</td><td className="muted">{e.by}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          <div className="row no-print" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
            {user.role === 'admin' && open.status === 'valid' && <button className="btn btn-danger" onClick={() => cancel(open)}>Cancel ticket</button>}
            <button className="btn" onClick={() => window.print()}>🖨 Print</button>
          </div>
        </Modal>
      )}
    </>
  );
}
