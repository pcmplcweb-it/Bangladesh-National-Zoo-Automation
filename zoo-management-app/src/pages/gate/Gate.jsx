import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../services/auth';
import { useLive } from '../../services/db';
import { checkTicket, recordGate, liveStats, recentGateEvents, ticketsForVisitDate, inside } from '../../services/tickets';
import { PageHead, Card, Seg, Stat, Badge, Stepper, useToast } from '../../components/ui';
import { GATES, TICKET_TYPES } from '../../data/master';
import { todayKey, fmtTime } from '../../lib/dates';

const hasDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

export default function Gate() {
  const { user } = useAuth();
  const toast = useToast();
  const [dir, setDir] = useState('in');
  const [gate, setGate] = useState('G1');
  const [code, setCode] = useState('');
  const [res, setRes] = useState(null);
  const [count, setCount] = useState(1);
  const [auto, setAuto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const inputRef = useRef(null);

  const live = useLive(() => ({ s: liveStats(todayKey()), events: recentGateEvents(10) }));

  const focus = () => setTimeout(() => inputRef.current?.focus(), 30);

  const confirm = async (r = res, n = count) => {
    setBusy(true);
    try {
      const t = await recordGate(r.ticket.id, dir, n, gate, user.username);
      toast(`${dir === 'in' ? 'Admitted' : 'Exit recorded for'} ${n} visitor(s) · ${t.id}`);
      setRes({ ok: true, done: true, ticket: t, io: inside(t), n });
      setCode('');
    } catch (e) {
      setRes({ ok: false, reason: e.message });
    } finally {
      setBusy(false);
      focus();
    }
  };

  const scan = (raw) => {
    const value = (raw ?? code).trim();
    if (!value) return;
    // QR codes may hold a URL like https://…/ticket/BNZ-…; take the code part.
    const id = (value.match(/BNZ-\d{6}-[A-Z0-9]+/i) || [value])[0].toUpperCase();
    const r = checkTicket(id, dir);
    setCode(id);
    if (!r.ok) {
      setRes(r);
      focus();
      return;
    }
    const n = dir === 'in' ? r.io.notEntered : r.io.inside;
    setCount(n);
    setRes(r);
    if (auto) confirm(r, n);
  };

  const sample = () => {
    const list = ticketsForVisitDate(todayKey()).filter((t) => t.payment.status === 'paid' && t.status === 'valid');
    const pool = list.filter((t) => (dir === 'in' ? inside(t).notEntered > 0 : inside(t).inside > 0));
    if (!pool.length) return toast('No suitable ticket right now', 'bad');
    const t = pool[Math.floor(Math.random() * pool.length)];
    setCode(t.id);
    scan(t.id);
  };

  useEffect(() => { setRes(null); focus(); }, [dir]);

  const max = res?.ok && !res.done ? (dir === 'in' ? res.io.notEntered : res.io.inside) : 1;
  const t = res?.ticket;

  return (
    <>
      <PageHead title="Gate entry / exit" sub="Scan the QR code on the e-ticket or counter ticket. A USB / Bluetooth QR scanner types the code and presses Enter.">
        <select className="input" style={{ width: 'auto' }} value={gate} onChange={(e) => setGate(e.target.value)} aria-label="Gate">
          {GATES.map((g) => <option key={g.id} value={g.id}>{g.id} · {g.name}</option>)}
        </select>
      </PageHead>

      <div className="kpis" style={{ marginBottom: 16 }}>
        <Stat label="Inside now" value={live.s.inside} accent live />
        <Stat label="Entered today" value={live.s.entered} />
        <Stat label="Exited today" value={live.s.exited} />
        <Stat label="Yet to enter" value={live.s.notEntered} />
      </div>

      <div className="gate-panel">
        <Card>
          <div className="spread" style={{ marginBottom: 14 }}>
            <Seg value={dir} onChange={setDir} options={[{ value: 'in', label: '➡ Entry' }, { value: 'out', label: '⬅ Exit' }]} />
            <label className="row small" style={{ gap: 6 }}>
              <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto-confirm whole ticket
            </label>
          </div>
          <div className="scan-box">
            <form className="row" onSubmit={(e) => { e.preventDefault(); scan(); }}>
              <input ref={inputRef} className="input scan-input grow" style={{ flex: 1, minWidth: 0 }} autoFocus value={code} onChange={(e) => setCode(e.target.value)} placeholder="Scan ticket QR" aria-label="Ticket code" />
              <button className="btn" disabled={busy}>Check</button>
            </form>
            <div className="row" style={{ marginTop: 10 }}>
              {hasDetector && <button className="btn btn-ghost btn-sm" type="button" onClick={() => setCamera(!camera)}>{camera ? 'Stop camera' : '📷 Use camera'}</button>}
              <button className="btn btn-ghost btn-sm" type="button" onClick={sample}>🎲 Try a sample ticket</button>
            </div>
            {camera && <CameraScanner onCode={(c) => { setCamera(false); scan(c); }} />}
          </div>

          {res && (
            <div className={`result ${res.ok ? 'ok' : 'bad'}`} style={{ marginTop: 16 }} role="status">
              {!res.ok && (
                <>
                  <h3>✕ Not allowed</h3>
                  <p style={{ margin: '6px 0 0' }}>{res.reason}</p>
                  {t && <p className="small mono" style={{ marginBottom: 0 }}>{t.id} · {t.visitors} visitor(s) · {t.buyer.name}</p>}
                </>
              )}
              {res.ok && (
                <>
                  <div className="spread">
                    <h3>{res.done ? `✓ ${dir === 'in' ? 'Entry' : 'Exit'} recorded` : dir === 'in' ? '✓ Valid ticket' : '✓ Ticket found'}</h3>
                    <Badge tone={t.channel === 'online' ? 'info' : 'mute'}>{t.channel}</Badge>
                  </div>
                  <p className="mono small" style={{ margin: '4px 0 10px' }}>{t.id} · {t.buyer.name}</p>
                  <div className="row small" style={{ gap: 8 }}>
                    {TICKET_TYPES.filter((x) => t.items[x.id]).map((x) => <Badge key={x.id}>{x.short}: {t.items[x.id]}</Badge>)}
                  </div>
                  <div className="big-count" style={{ marginTop: 12 }}>
                    <div><b>{t.visitors}</b><small>On ticket</small></div>
                    <div><b>{res.io.entered}</b><small>Entered</small></div>
                    <div><b>{res.io.inside}</b><small>Inside</small></div>
                  </div>
                  {!res.done && (
                    <div className="row" style={{ marginTop: 14 }}>
                      <span className="small"><b>{dir === 'in' ? 'Admit' : 'Exit'}</b></span>
                      <Stepper label="visitors" value={count} onChange={setCount} min={1} max={max} />
                      <span className="small muted">of {max}</span>
                      <button className="btn btn-orange grow" onClick={() => confirm()} disabled={busy}>{busy ? 'Saving…' : `Confirm ${dir === 'in' ? 'entry' : 'exit'}`}</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Card>

        <Card title="Recent scans" sub="All gates, newest first">
          {live.events.length === 0 && <p className="muted small">Nothing yet today.</p>}
          <div className="table-wrap">
            <table className="tbl">
              <tbody>
                {live.events.map((e, i) => (
                  <tr key={i}>
                    <td>{e.type === 'in' ? <Badge tone="good">➡ In</Badge> : <Badge tone="warn">⬅ Out</Badge>}</td>
                    <td className="mono small">{e.ticketId}</td>
                    <td className="num">{e.count}</td>
                    <td className="small">{e.gate}</td>
                    <td className="small muted nowrap">{fmtTime(e.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

// Camera QR scanning with the browser's BarcodeDetector (Chrome / Edge / Android).
function CameraScanner({ onCode }) {
  const video = useRef(null);
  const cb = useRef(onCode);
  cb.current = onCode;
  const [err, setErr] = useState('');
  useEffect(() => {
    let stream;
    let stop = false;
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.current.srcObject = stream;
        await video.current.play();
        while (!stop) {
          const codes = await detector.detect(video.current).catch(() => []);
          if (codes[0]?.rawValue) {
            cb.current(codes[0].rawValue);
            break;
          }
          await new Promise((r) => setTimeout(r, 250));
        }
      } catch (e) {
        setErr(e.name === 'NotAllowedError' ? 'Camera permission was denied.' : 'Could not start the camera.');
      }
    })();
    return () => {
      stop = true;
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);
  return (
    <div style={{ marginTop: 12 }}>
      {err ? <div className="error">{err}</div> : <video ref={video} className="video" muted playsInline />}
    </div>
  );
}
