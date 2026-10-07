import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero, Reveal } from '../components/common';
import { ANIMALS, zoneById } from '../data/zoo';
import { PHOTOS } from '../data/photos';

const GROUPS = ['All', ...new Set(ANIMALS.map((a) => a.group))];

const STATUS_COLOR = {
  Endangered: '#c0392b',
  Vulnerable: '#e67e22',
  'Near Threatened': '#d4ac0d',
  'Least Concern': '#27ae60',
  'Critically Endangered': '#8e0000',
};

export default function Animals() {
  const [group, setGroup] = useState('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const list = useMemo(() => ANIMALS.filter((a) => (group === 'All' || a.group === group)
    && (!q || `${a.name} ${a.bn} ${a.sci}`.toLowerCase().includes(q.toLowerCase()))), [group, q]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <PageHero title="Meet the Animals" subtitle="From the mighty Royal Bengal Tiger to the rare vulture — get to know the residents of the zoo." emoji="🦁🐘🦒" photo={PHOTOS.tiger.src} />
      <section className="section">
        <div className="container">
          <div className="toolbar">
            <div className="tabs" role="tablist">
              {GROUPS.map((g) => (
                <button key={g} role="tab" aria-selected={group === g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>{g}</button>
              ))}
            </div>
            <input className="input" placeholder="Search animals (English or বাংলা)…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="animal-grid">
            {list.map((a, i) => (
              <Reveal key={a.id} delay={(i % 8) * 50}>
                <button className="animal-card" onClick={() => setOpen(a)}>
                  <div className={`animal-card-art ${a.photo ? 'has-photo' : ''}`} style={{ '--g1': a.grad[0], '--g2': a.grad[1] }}>
                    {a.photo ? <img src={PHOTOS[a.photo].src} alt={a.name} loading="lazy" /> : <span>{a.emoji}</span>}
                    <i className="status" style={{ background: STATUS_COLOR[a.status] || '#7f8c8d' }}>{a.status}</i>
                  </div>
                  <div className="animal-card-body">
                    <h3>{a.name}</h3>
                    <small className="bn">{a.bn}</small>
                    <p>{a.fact}</p>
                    <span className="where">📍 {zoneById[a.zone].name}</span>
                  </div>
                </button>
              </Reveal>
            ))}
            {list.length === 0 && <p className="empty">No animals match “{q}”.</p>}
          </div>
        </div>
      </section>

      {open && (
        <div className="modal" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.name}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpen(null)} aria-label="Close">✕</button>
            <div className={`modal-art ${open.photo ? 'has-photo' : ''}`} style={{ '--g1': open.grad[0], '--g2': open.grad[1] }}>
              {open.photo ? <img src={PHOTOS[open.photo].src} alt={open.name} /> : open.emoji}
            </div>
            <div className="modal-body">
              <h2>{open.name} <small className="bn">{open.bn}</small></h2>
              <em>{open.sci}</em>
              <dl>
                <div><dt>Group</dt><dd>{open.group}</dd></div>
                <div><dt>Diet</dt><dd>{open.diet}</dd></div>
                <div><dt>IUCN status</dt><dd style={{ color: STATUS_COLOR[open.status] }}>{open.status}</dd></div>
                <div><dt>Where</dt><dd>{zoneById[open.zone].name}</dd></div>
              </dl>
              <p>💡 {open.fact}</p>
              <p className="muted">{zoneById[open.zone].desc}</p>
              <Link to={`/map?zone=${open.zone}`} className="btn btn-green">🗺️ Show on zoo map</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
