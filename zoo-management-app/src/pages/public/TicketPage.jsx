import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLive } from '../../services/db';
import { findTicket } from '../../services/tickets';
import TicketView from '../../components/TicketView';

export default function TicketPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [code, setCode] = useState('');
  const t = useLive(() => (id ? findTicket(id) : null), [id]);

  return (
    <div className="public">
      <div className="wrap">
        <header className="public-head">
          <Link to="/book" className="brand" style={{ color: 'var(--green-dark)' }}>
            <span className="brand-logo" aria-hidden>🐯</span>
            <span><b>Bangladesh National Zoo</b><small style={{ color: 'var(--muted)' }}>Online tickets</small></span>
          </Link>
          <Link to="/book" className="btn btn-ghost btn-sm">Book tickets</Link>
        </header>

        {id && t && (
          <>
            {t.payment.status === 'paid' && (
              <div style={{ textAlign: 'center', margin: '10px 0 22px' }}>
                <div style={{ fontSize: 44 }} aria-hidden>🎉</div>
                <h1 className="hero-title" style={{ fontSize: 30 }}>Your tickets are ready</h1>
                <p className="muted">A copy was sent by SMS to {t.buyer.mobile || 'your phone'}. Save or print this page.</p>
              </div>
            )}
            <TicketView t={t} />
            <div className="row no-print" style={{ justifyContent: 'center', margin: '22px 0 40px' }}>
              <button className="btn" onClick={() => window.print()}>🖨 Print / Save as PDF</button>
              {t.payment.status !== 'paid' && <Link className="btn btn-orange" to="/book">Try booking again</Link>}
            </div>
          </>
        )}

        {(!id || !t) && (
          <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}>
            <h2>Find your ticket</h2>
            {id && !t && <div className="error" style={{ marginTop: 12 }}>No ticket found with code {id}.</div>}
            <form className="row" style={{ marginTop: 14 }} onSubmit={(e) => { e.preventDefault(); if (code.trim()) nav(`/ticket/${code.trim().toUpperCase()}`); }}>
              <input className="input mono grow" value={code} onChange={(e) => setCode(e.target.value)} placeholder="BNZ-261008-ABCDE" style={{ flex: 1 }} />
              <button className="btn">Show</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
