import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ZooMap from '../components/ZooMap';
import MiniZooMap from '../components/MiniZooMap';
import EntryIntro from '../components/EntryIntro';
import { SectionTitle, Reveal, Counter } from '../components/common';
import { ANIMALS, FEEDING_TIMES, ZOO_INFO, zoneById, openStatus, toBnDigits } from '../data/zoo';
import { PHOTOS } from '../data/photos';
import './Home.css';

const SLIDES = ['main-gate', 'lake-flame-trees', 'north-lake', 'path-rain-2', 'lake-panorama', 'lake-trees'];
const GALLERY = ['gate-pillars', 'lake-flame-trees', 'tiger', 'pelican-lake', 'rhino', 'flowering-tree', 'path-rain-1', 'squirrel', 'big-tree', 'lake-reeds', 'visitors', 'gate-sign'];

function seenIntro() {
  try { return sessionStorage.getItem('zoo-intro') === '1'; } catch { return false; }
}

function Hero() {
  const [slide, setSlide] = useState(0);
  const [stop, setStop] = useState(null);
  const status = openStatus();
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, []);
  const onStop = useCallback((z) => setStop(z), []);
  const cur = PHOTOS[SLIDES[slide]];

  return (
    <section className="hero" aria-label="Welcome">
      <div className="hero-bg" aria-hidden>
        {SLIDES.map((k, i) => (
          <div key={k} className={`hero-slide ${i === slide ? 'on' : ''}`} style={{ backgroundImage: `url(${PHOTOS[k].src})` }} />
        ))}
      </div>
      <div className="hero-shade" aria-hidden />

      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="hero-badge">
            <i className={status.open ? 'ok' : 'off'} />
            বাংলাদেশ জাতীয় চিড়িয়াখানা
            <b className={status.open ? 'ok' : 'off'}>{status.open ? '● এখন খোলা' : '● এখন বন্ধ'}</b>
          </span>
          <h1>
            প্রকৃতির কোলে
            <span className="grad">বন্যপ্রাণীর রাজ্যে</span>
            একটি দিন
          </h1>
          <p>
            রয়েল বেঙ্গল টাইগার থেকে জিরাফ — ১৩০+ প্রজাতির প্রাণী, দুটি লেক আর ১৮৬ একর সবুজ।
            রিয়েল ম্যাপে ঘুরে দেখুন, ভার্চুয়াল ট্যুর নিন — বাকিটা চিড়িয়াখানায়!
          </p>
          <p className="hero-en">Explore the real zoo map, take a virtual walk and plan your visit to Mirpur, Dhaka.</p>
          <div className="hero-actions">
            <a href="#zoo-map" className="pill pill-primary">🗺️ ম্যাপে ঘুরে দেখুন</a>
            <Link to="/tour" className="pill pill-ghost">ভার্চুয়াল ট্যুর <span>▶</span></Link>
          </div>
          <div className="hero-stats">
            <div><b><Counter to={186} bn /></b><small>একর আয়তন</small></div>
            <div><b><Counter to={130} suffix="+" bn /></b><small>প্রজাতি</small></div>
            <div><b><Counter to={3000} suffix="+" bn /></b><small>প্রাণী ও পাখি</small></div>
          </div>
        </div>

        <div className="hero-device">
          <div className="phone">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="app-head">
                <span className="app-logo">🐅</span>
                <div><b>Zoo Guide</b><small>চিড়িয়াখানা গাইড</small></div>
                <span className="app-bell">🔔<i /></span>
              </div>
              <div className="app-map">
                <MiniZooMap onStop={onStop} />
                <span className="app-live"><i /> Live map</span>
                <span className="app-where">📍 {stop ? stop.name : 'Bangladesh National Zoo'}</span>
              </div>
              <div className="app-tiles">
                <Link to="/map" className="t green">🗺️<small>Zoo Map</small></Link>
                <Link to="/tour" className="t orange">🚶<small>Virtual Tour</small></Link>
                <Link to="/animals" className="t teal">🦁<small>Animals</small></Link>
                <Link to="/visit#tickets" className="t red">🎟️<small>Tickets</small></Link>
                <Link to="/visit#tickets" className="t-center" aria-label="Buy tickets">🎫</Link>
              </div>
              <div className="app-note"><span>🍖</span><div><b>বাঘের খাবার · বিকেল ৩টা</b><small>Royal Bengal Tiger feeding</small></div></div>
              <div className="app-nav"><span className="on">🏠<small>Home</small></span><span>🗺️<small>Map</small></span><span>🔔<small>Alerts</small></span><span>👤<small>Profile</small></span></div>
            </div>
          </div>
          <span className="chip chip-a">✅ {status.openDay ? `আজ খোলা · ${toBnDigits(9)}টা–${toBnDigits(6)}টা` : 'আজ রবিবার · বন্ধ'}</span>
          <span className="chip chip-b">📍 মিরপুর-১, ঢাকা</span>
          <span className="chip chip-c">🦆 শীতে অতিথি পাখি</span>
        </div>
      </div>

      <div className="hero-foot">
        <a href="#zoo-map" className="hero-scroll">স্ক্রল করুন<i>⌄</i></a>
        <div className="hero-dots">
          {SLIDES.map((k, i) => <button key={k} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} aria-label={`Photo ${i + 1}`} />)}
        </div>
        <small className="hero-credit">Photo: {cur.author} · {cur.license}</small>
      </div>
    </section>
  );
}

function Gallery() {
  const [open, setOpen] = useState(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <section className="section gallery-sec">
      <div className="container">
        <SectionTitle kicker="Real moments" title="Inside the Zoo — ছবিতে চিড়িয়াখানা">
          Real photos from the Bangladesh National Zoo, shared by visitors on Wikimedia Commons.
        </SectionTitle>
        <div className="gallery">
          {GALLERY.map((k, i) => {
            const p = PHOTOS[k];
            return (
              <Reveal key={k} delay={(i % 4) * 60} className={`g-item g${i % 6}`}>
                <button onClick={() => setOpen(p)} aria-label={`Open photo: ${p.title}`}>
                  <img src={p.src} alt={p.title} loading="lazy" />
                  <span>{p.title}</span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.title}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={open.src} alt={open.title} />
            <figcaption>
              <b>{open.title}</b>
              <span>Photo: {open.author} · {open.license} · <a href={open.source} target="_blank" rel="noreferrer">Source</a></span>
            </figcaption>
          </figure>
          <button className="lightbox-close" onClick={() => setOpen(null)} aria-label="Close">✕</button>
        </div>
      )}
    </section>
  );
}

const REVIEWS = [
  { name: 'Nusrat J.', from: 'Dhanmondi', text: 'My kids loved the tiger and the elephants! Walking the tour on the website first helped us plan the route.', stars: 5 },
  { name: 'Rahim U.', from: 'Chattogram', text: 'Seeing thousands of migratory ducks on the North Lake in January was magical. Great place for photography.', stars: 5 },
  { name: 'Sadia A.', from: 'Mirpur', text: 'Lots of shade and space for a picnic. The real map made it easy to find the restrooms and the lakes.', stars: 4 },
];

export default function Home() {
  const [entered, setEntered] = useState(seenIntro);
  const [sound, setSound] = useState(false);
  const featured = ['tiger', 'rhino', 'elephant', 'giraffe', 'hippo', 'lion', 'peacock', 'crocodile'].map((id) => ANIMALS.find((a) => a.id === id));

  const enter = (withSound) => {
    try { sessionStorage.setItem('zoo-intro', '1'); } catch { /* storage unavailable */ }
    setSound(withSound);
    setEntered(true);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {!entered && <EntryIntro onEnter={enter} />}
      <Hero />

      <section className="map-sec" id="zoo-map" aria-label="Real zoo map">
        <div className="map-sec-head">
          <div className="container">
            <span className="kicker light">Real map · রিয়েল ম্যাপ</span>
            <h2>Explore the zoo grounds — every enclosure in its real place</h2>
          </div>
        </div>
        {entered && <ZooMap height="calc(100vh - var(--header-h) - 86px)" initialSound={sound} />}
      </section>

      <section className="quick-info">
        <div className="container quick-grid">
          <div><span>🕘</span><div><b>{ZOO_INFO.hours}</b><small>Closed: {ZOO_INFO.closed}</small></div></div>
          <div><span>🎟️</span><div><b>Tickets from Tk 20</b><small>Adults Tk 50 · Children Tk 20</small></div></div>
          <div><span>📍</span><div><b>Mirpur-1, Dhaka</b><small><a href={ZOO_INFO.googleMaps} target="_blank" rel="noreferrer">Get directions →</a></small></div></div>
          <div><span>🦆</span><div><b>Migratory birds</b><small>November – February on both lakes</small></div></div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SectionTitle kicker="Star residents" title="Meet Our Animals" />
          <div className="animal-strip">
            {featured.map((a, i) => (
              <Reveal key={a.id} delay={i * 60}>
                <Link to={`/map?zone=${a.zone}`} className="animal-mini" style={{ '--g1': a.grad[0], '--g2': a.grad[1] }}>
                  {a.photo
                    ? <img className="animal-mini-photo" src={PHOTOS[a.photo].src} alt={a.name} loading="lazy" />
                    : <span className="animal-mini-emoji">{a.emoji}</span>}
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

      <Gallery />

      <section className="section section-soft">
        <div className="container split">
          <Reveal>
            <SectionTitle kicker="Daily schedule" title="Feeding & Keeper Talks" center={false}>
              Time your walk to catch the animals at their liveliest. Tap a time to see the place on the real map.
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
          <Reveal delay={150} className="tour-promo" >
            <div className="tour-promo-photo" style={{ backgroundImage: `url(${PHOTOS['path-rain-2'].src})` }}>
              <span className="tour-promo-walker">🚶</span>
            </div>
            <h3>Take the Virtual Walk</h3>
            <p>Start at the main gate and follow the zoo’s real roads past 28 stops — the camera follows you on satellite imagery and each stop tells its story.</p>
            <Link to="/tour" className="btn btn-orange">Start walking →</Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
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

      <section className="cta-band" style={{ backgroundImage: `linear-gradient(100deg, rgba(5,40,18,.92), rgba(5,40,18,.55)), url(${PHOTOS['lake-panorama'].src})` }}>
        <div className="container cta-in">
          <div>
            <h2>Ready for a wild day out?</h2>
            <p>Book your tickets online and skip the queue at the main gate.</p>
          </div>
          <Link to="/visit#tickets" className="pill pill-primary">🎟️ Book Tickets Now</Link>
        </div>
      </section>
    </>
  );
}
