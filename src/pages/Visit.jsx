import { useEffect, useMemo, useState } from 'react';
import { PageHero, SectionTitle, Reveal } from '../components/common';
import { TICKETS, ZOO_INFO, FEEDING_TIMES, zoneById } from '../data/zoo';

const RULES = [
  ['🚭', 'No smoking anywhere inside the zoo.'],
  ['🍪', 'Please do not feed or tease the animals.'],
  ['🗑️', 'Use the bins — keep the zoo clean and plastic-free.'],
  ['📢', 'Keep noise low; loud music and horns stress the animals.'],
  ['🚸', 'Children must stay with an adult at all times.'],
  ['🐕', 'Pets are not allowed inside the zoo.'],
];

const TRAVEL = [
  ['🚇', 'Metro Rail', 'Take MRT Line-6 to Mirpur-10 station, then a short bus or rickshaw ride to Mirpur-1 / Zoo Road.'],
  ['🚌', 'Bus', 'Many city buses stop at Mirpur-1. Walk 5–10 minutes along Zoo Road to the main gate.'],
  ['🚗', 'Car / Ride-share', 'Search “Bangladesh National Zoo” in your maps app. Paid parking is available near the main gate.'],
];

// A deterministic decorative "QR" so each booking reference gets its own pattern.
function TicketCode({ code }) {
  const cells = useMemo(() => {
    let h = 0;
    for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return Array.from({ length: 121 }, (_, i) => {
      h = (h * 1103515245 + 12345) >>> 0;
      const x = i % 11;
      const y = Math.floor(i / 11);
      const corner = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
      return corner || (h >> 16) % 2 === 0;
    });
  }, [code]);
  return (
    <svg viewBox="0 0 11 11" className="ticket-code" aria-label={`Ticket code ${code}`}>
      {cells.map((on, i) => on && <rect key={i} x={i % 11} y={Math.floor(i / 11)} width="1" height="1" />)}
    </svg>
  );
}

function nextOpenDate() {
  const d = new Date();
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // closed on Sunday
  return d.toISOString().slice(0, 10);
}

export default function Visit() {
  const [qty, setQty] = useState({ adult: 2, child: 1, student: 0, aquarium: 0 });
  const [form, setForm] = useState({ name: '', phone: '', date: nextOpenDate() });
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const total = TICKETS.reduce((s, t) => s + t.price * (qty[t.id] || 0), 0);
  const people = qty.adult + qty.child + qty.student;
  const setQ = (id, d) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(50, (q[id] || 0) + d)) }));

  const book = (e) => {
    e.preventDefault();
    if (people === 0) return setError('Please add at least one visitor.');
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(form.phone.replace(/[\s-]/g, ''))) return setError('Please enter a valid Bangladeshi mobile number (e.g. 01712345678).');
    if (new Date(`${form.date}T00:00`).getDay() === 0) return setError('The zoo is closed on Sundays — please choose another date.');
    setError('');
    const ref = `BNZ-${form.date.replace(/-/g, '').slice(2)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setTicket({ ref, ...form, qty: { ...qty }, total });
    return undefined;
  };

  return (
    <>
      <PageHero title="Plan Your Visit" subtitle="Opening hours, tickets, getting here and everything you need for a perfect day." emoji="🎟️🗺️" />

      <section className="section">
        <div className="container card-grid three">
          <Reveal className="info-card">
            <span>🕘</span>
            <h3>Opening Hours</h3>
            <p><b>{ZOO_INFO.hours}</b></p>
            <p>Closed: {ZOO_INFO.closed}. Last entry 4:00 PM. Hours may change on public holidays — check official notices.</p>
          </Reveal>
          <Reveal className="info-card" delay={100}>
            <span>🍽️</span>
            <h3>Feeding Times</h3>
            <ul className="mini-list">
              {FEEDING_TIMES.map((f) => <li key={f.time}><b>{f.time}</b> {f.what} <small>({zoneById[f.zone].name})</small></li>)}
            </ul>
          </Reveal>
          <Reveal className="info-card" delay={200}>
            <span>☀️</span>
            <h3>Best Time to Visit</h3>
            <p>Mornings (9–11 AM) when animals are most active. November–February brings migratory birds to the lakes and pleasant weather.</p>
          </Reveal>
        </div>
      </section>

      <section className="section section-soft" id="tickets">
        <div className="container">
          <SectionTitle kicker="Tickets" title="Book Your Tickets Online">
            Prices shown are indicative — please confirm current rates at the ticket counter.
          </SectionTitle>

          {!ticket ? (
            <form className="booking" onSubmit={book}>
              <div className="booking-tickets">
                {TICKETS.map((t) => (
                  <div className="ticket-row" key={t.id}>
                    <div>
                      <b>{t.label}</b>
                      <small>{t.note}</small>
                    </div>
                    <span className="price">Tk {t.price}</span>
                    <div className="stepper">
                      <button type="button" onClick={() => setQ(t.id, -1)} aria-label={`Fewer ${t.label}`}>−</button>
                      <output>{qty[t.id]}</output>
                      <button type="button" onClick={() => setQ(t.id, 1)} aria-label={`More ${t.label}`}>+</button>
                    </div>
                  </div>
                ))}
                <div className="ticket-total">
                  <span>Total ({people} visitor{people === 1 ? '' : 's'})</span>
                  <b>Tk {total}</b>
                </div>
              </div>
              <div className="booking-form">
                <label>Full name<input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
                <label>Mobile number<input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" inputMode="tel" /></label>
                <label>Visit date<input className="input" type="date" min={nextOpenDate()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
                {error && <p className="error" role="alert">{error}</p>}
                <button className="btn btn-orange block" type="submit">Confirm booking · Tk {total}</button>
                <small className="muted">Payment is collected at the gate (bKash / Nagad / cash). Show your e-ticket at the counter.</small>
              </div>
            </form>
          ) : (
            <div className="eticket">
              <div className="eticket-main">
                <span className="eticket-brand">🐅 Bangladesh National Zoo</span>
                <h3>E-Ticket</h3>
                <dl>
                  <div><dt>Booking ref</dt><dd>{ticket.ref}</dd></div>
                  <div><dt>Name</dt><dd>{ticket.name}</dd></div>
                  <div><dt>Date</dt><dd>{new Date(`${ticket.date}T00:00`).toDateString()}</dd></div>
                  <div><dt>Mobile</dt><dd>{ticket.phone}</dd></div>
                </dl>
                <ul>
                  {TICKETS.filter((t) => ticket.qty[t.id]).map((t) => <li key={t.id}>{ticket.qty[t.id]} × {t.label} — Tk {t.price * ticket.qty[t.id]}</li>)}
                </ul>
                <b className="eticket-total">Total payable: Tk {ticket.total}</b>
              </div>
              <div className="eticket-stub">
                <TicketCode code={ticket.ref} />
                <small>{ticket.ref}</small>
                <button className="btn btn-green" onClick={() => window.print()}>🖨️ Print</button>
                <button className="btn btn-ghost" onClick={() => setTicket(null)}>New booking</button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section" id="rules">
        <div className="container split">
          <div>
            <SectionTitle kicker="Getting here" title="How to Reach the Zoo" center={false} />
            <div className="travel">
              {TRAVEL.map(([e, t, d]) => (
                <Reveal key={t} className="travel-item"><span>{e}</span><div><b>{t}</b><p>{d}</p></div></Reveal>
              ))}
              <a className="btn btn-green" href={ZOO_INFO.googleMaps} target="_blank" rel="noreferrer">📍 Open in Google Maps</a>
            </div>
          </div>
          <div>
            <SectionTitle kicker="Be a good visitor" title="Zoo Rules" center={false} />
            <ul className="rules">
              {RULES.map(([e, r]) => <li key={r}><span>{e}</span>{r}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
