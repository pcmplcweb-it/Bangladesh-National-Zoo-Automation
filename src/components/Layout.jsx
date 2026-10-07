import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ZOO_INFO } from '../data/zoo';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/map', label: 'Zoo Map' },
  { to: '/tour', label: 'Virtual Tour' },
  { to: '/animals', label: 'Animals' },
  { to: '/visit', label: 'Plan Your Visit' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function TopBar() {
  return (
    <div className="topbar">
      <div className="container topbar-in">
        <div className="topbar-info">
          <span>📍 {ZOO_INFO.address}</span>
          <span>🕘 {ZOO_INFO.hours}</span>
          <a href={`tel:${ZOO_INFO.phone.replace(/[^+\d]/g, '')}`}>📞 {ZOO_INFO.phone}</a>
        </div>
        <div className="topbar-social">
          <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
          <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>
          <a href={`mailto:${ZOO_INFO.email}`} aria-label="Email">✉</a>
        </div>
      </div>
    </div>
  );
}

export function Header({ overlay = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''} ${overlay ? 'overlay' : ''} ${overlay && !scrolled && !open ? 'clear' : ''}`}>
      <div className="container header-in">
        <Link to="/" className="brand" aria-label="Bangladesh National Zoo home">
          <span className="brand-logo">🐅</span>
          <span className="brand-text">
            <b>National Zoo</b>
            <small>জাতীয় চিড়িয়াখানা · Dhaka</small>
          </span>
        </Link>
        <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>
          ))}
          <Link to="/visit#tickets" className="btn btn-orange nav-cta">🎟️ Buy Tickets</Link>
        </nav>
        <button className={`burger ${open ? 'x' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          <i /><i /><i />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-wave" aria-hidden />
      <div className="container footer-grid">
        <div>
          <div className="brand light">
            <span className="brand-logo">🐅</span>
            <span className="brand-text"><b>Bangladesh National Zoo</b><small>{ZOO_INFO.nameBn}</small></span>
          </div>
          <p>Home to over 130 species on {ZOO_INFO.areaAcres} green acres in Mirpur, Dhaka — caring for wildlife and inspiring conservation since {ZOO_INFO.established}.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/map">Interactive Zoo Map</Link></li>
            <li><Link to="/tour">Virtual Walk</Link></li>
            <li><Link to="/animals">Meet the Animals</Link></li>
            <li><Link to="/facilities">Facilities</Link></li>
          </ul>
        </div>
        <div>
          <h4>Visit</h4>
          <ul>
            <li><Link to="/visit">Opening Hours</Link></li>
            <li><Link to="/visit#tickets">Tickets & Booking</Link></li>
            <li><Link to="/visit#rules">Visitor Rules</Link></li>
            <li><a href={ZOO_INFO.googleMaps} target="_blank" rel="noreferrer">Get Directions</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li>📍 {ZOO_INFO.address}</li>
            <li>📞 {ZOO_INFO.phone}</li>
            <li>✉ {ZOO_INFO.email}</li>
            <li>🕘 {ZOO_INFO.hours}</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-in">
          <span>© {new Date().getFullYear()} Bangladesh National Zoo, Mirpur, Dhaka.</span>
          <span>
            Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors ·
            Imagery © Esri · Photos: <Link to="/about#credits">Wikimedia Commons contributors (CC BY / BY-SA)</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 120);
    return () => clearTimeout(t);
  }, [pathname, hash]);
  const fullBleed = pathname === '/map' || pathname === '/tour';
  const home = pathname === '/';
  return (
    <>
      {!home && <TopBar />}
      <Header overlay={home} />
      <main>
        <Outlet />
      </main>
      {!fullBleed && <Footer />}
    </>
  );
}
