import { useState } from 'react';
import { Link } from 'react-router-dom';
import ZooMap from '../components/ZooMap';
import GateIntro from '../components/GateIntro';
import { SectionTitle, Reveal, Counter } from '../components/common';
import { ANIMALS, FEEDING_TIMES, ZOO_INFO, zoneById } from '../data/zoo';

function seenIntro() {
  try { return sessionStorage.getItem('zoo-intro') === '1'; } catch { return false; }
}

const HIGHLIGHTS = [
  { emoji: '🗺️', title: 'Interactive Zoo Map', text: 'Zoom, drag and tap every enclosure. Switch to real satellite view of the zoo grounds.', to: '/map' },
  { emoji: '🚶', title: 'Virtual Walk', text: 'Take a guided walk from the main gate past 17 stops with live narration cards.', to: '/tour' },
  { emoji: '🐅', title: 'Meet the Animals', text: 'Royal Bengal tigers, elephants, giraffes, hippos, crocodiles and over 130 species.', to: '/animals' },
  { emoji: '🎟️', title: 'Book Tickets', text: 'Check prices, calculate your family ticket and get an e-ticket in seconds.', to: '/visit#tickets' },
  { emoji: '🦆', title: 'Migratory Birds', text: 'Every winter thousands of migratory ducks visit our lakes — a sight to remember.', to: '/map?zone=lake' },
  { emoji: '🧺', title: 'Family & Picnic', text: "Children's park, picnic lawns, food court and clean facilities for a full day out.", to: '/facilities' },
];

const REVIEWS = [
  { name: 'Nusrat J.', from: 'Dhanmondi', text: 'My kids loved the tiger and the elephant bath! The virtual tour helped us plan the route before going.', stars: 5 },
  { name: 'Rahim U.', from: 'Chattogram', text: 'Seeing thousands of migratory ducks on the lake in January was magical. Great place for photography.', stars: 5 },
  { name: 'Sadia A.', from: 'Mirpur', text: 'Lots of shade and space for a picnic. The map made it so easy to find the restrooms and food court.', stars: 4 },
];

export default function Home() {
  const [entered, setEntered] = useState(seenIntro);
  const [sound, setSound] = useState(false);
  const featured = ['tiger', 'elephant', 'giraffe', 'hippo', 'lion', 'peacock', 'crocodile', 'deer'].map((id) => ANIMALS.find((a) => a.id === id));

  const enter = (withSound) => {
    try { sessionStorage.setItem('zoo-intro', '1'); } catch { /* storage unavailable */ }
    setSound(withSound);
    setEntered(true);
  };

  return (
    <>
      {!entered && <GateIntro onEnter={enter} />}

      <section className="home-map" aria-label="Zoo map">
        {entered && <ZooMap height="calc(100vh - var(--header-h) - var(--topbar-h))" initialSound={sound} />}
        <a href="#discover" className="scroll-cue" aria-label="Scroll to discover more">
          <span>Discover more</span>
          <i>⌄</i>
        </a>
      </section>

      <section className="quick-info" id="discover">
        <div className="container quick-grid">
          <div><span>🕘</span><div><b>Open Today</b><small>{ZOO_INFO.hours}</small></div></div>
          <div><span>🎟️</span><div><b>Tickets from Tk 20</b><small>Adults Tk 50 · Children Tk 20</small></div></div>
          <div><span>📍</span><div><b>Mirpur-1, Dhaka</b><small><a href={ZOO_INFO.googleMaps} target="_blank" rel="noreferrer">Get directions →</a></small></div></div>
          <div><span>🚫</span><div><b>Weekly Closing</b><small>{ZOO_INFO.closed}</small></div></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle kicker="What awaits you" title="Experience the Zoo Like Never Before">
            Plan, explore and enjoy — everything you need for an unforgettable day at the Bangladesh National Zoo.
          </SectionTitle>
          <div className="card-grid">
            {HIGHLIGHTS.map((h, i) => (
              <Reveal key={h.title} delay={i * 80}>
                <Link to={h.to} className="feature-card">
                  <span className="feature-icon">{h.emoji}</span>
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                  <span className="more">Explore →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container stats-grid">
          <div><b><Counter to={186} /></b><span>Acres of green</span></div>
          <div><b><Counter to={130} suffix="+" /></b><span>Animal species</span></div>
          <div><b><Counter to={3000} suffix="+" /></b><span>Animals & birds</span></div>
          <div><b><Counter to={50} suffix="+" /></b><span>Years of care</span></div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SectionTitle kicker="Star residents" title="Meet Our Animals" />
          <div className="animal-strip">
            {featured.map((a, i) => (
              <Reveal key={a.id} delay={i * 60}>
                <Link to={`/map?zone=${a.zone}`} className="animal-mini" style={{ '--g1': a.grad[0], '--g2': a.grad[1] }}>
                  <span className="animal-mini-emoji">{a.emoji}</span>
                  <b>{a.name}</b>
                  <small>{a.bn}</small>
                  <em>📍 {zoneById[a.zone].name}</em>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="center mt"><Link to="/animals" className="btn btn-green">See all animals</Link></div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <Reveal>
            <SectionTitle kicker="Daily schedule" title="Feeding & Keeper Talks" center={false}>
              Time your walk to catch the animals at their liveliest. Tap a time to see where it happens on the map.
            </SectionTitle>
            <ul className="schedule">
              {FEEDING_TIMES.map((f) => (
                <li key={f.time}>
                  <Link to={`/map?zone=${f.zone}`}>
                    <time>{f.time}</time>
                    <span>{f.what}</span>
                    <em>{zoneById[f.zone].emoji}</em>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={150} className="tour-promo">
            <div className="tour-promo-art" aria-hidden>
              <span>🌳</span><span>🚶</span><span>🦒</span><span>🌴</span>
            </div>
            <h3>Take the Virtual Walk</h3>
            <p>Start at the main gate and stroll the full loop — the camera follows you, each stop pops up with stories about the animals living there.</p>
            <Link to="/tour" className="btn btn-orange">Start walking →</Link>
          </Reveal>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SectionTitle kicker="Visitor stories" title="What Our Visitors Say" />
          <div className="card-grid three">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name} delay={i * 100} className="review">
                <div className="stars">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
                <p>“{r.text}”</p>
                <b>{r.name}</b> <small>· {r.from}</small>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-in">
          <div>
            <h2>Ready for a wild day out?</h2>
            <p>Book your tickets online and skip the queue at the main gate.</p>
          </div>
          <Link to="/visit#tickets" className="btn btn-white">🎟️ Book Tickets Now</Link>
        </div>
      </section>
    </>
  );
}
