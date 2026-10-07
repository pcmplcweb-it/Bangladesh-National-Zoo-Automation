import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero, SectionTitle, Reveal, Counter } from '../components/common';
import { ZONES, ZOO_INFO } from '../data/zoo';
import { PHOTOS } from '../data/photos';
import { zonePhoto } from '../data/media';

export function Facilities() {
  const items = ZONES.filter((z) => z.cat === 'facility' || z.cat === 'attraction');
  const extras = [
    ['♿', 'Accessibility', 'Wheelchairs available at the Visitor Centre; main walkways are paved and step-free.'],
    ['🅿️', 'Parking', 'Paid parking for cars and motorbikes beside the main gate on Zoo Road.'],
    ['🩹', 'First Aid', 'First-aid post at the Visitor Centre with trained staff during opening hours.'],
    ['📸', 'Photography', 'Personal photography is welcome. Please no flash near animals.'],
  ];
  return (
    <>
      <PageHero title="Facilities & Attractions" subtitle="Everything that makes a comfortable, fun family day at the zoo." emoji="🎠🍲" photo={PHOTOS['path-rain-1'].src} />
      <section className="section">
        <div className="container card-grid">
          {items.map((z, i) => (
            <Reveal key={z.id} delay={(i % 6) * 70}>
              <Link to={`/map?zone=${z.id}`} className={`feature-card ${zonePhoto(z) ? 'with-photo' : ''}`}>
                {zonePhoto(z)
                  ? <img className="feature-photo" src={zonePhoto(z).src} alt={z.name} loading="lazy" />
                  : <span className="feature-icon">{z.emoji}</span>}
                <h3>{z.name}</h3>
                <p>{z.desc}</p>
                <span className="more">Show on map →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section section-soft">
        <div className="container card-grid four">
          {extras.map(([e, t, d]) => (
            <Reveal key={t} className="info-card"><span>{e}</span><h3>{t}</h3><p>{d}</p></Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function About() {
  return (
    <>
      <PageHero title="About the Zoo" subtitle="Caring for wildlife and inspiring Bangladesh to protect nature." emoji="🌿🐅" photo={PHOTOS['lake-flame-trees'].src} />
      <section className="section">
        <div className="container split">
          <Reveal>
            <SectionTitle kicker="Our story" title="A Green Heart in Mirpur" center={false} />
            <p>The Bangladesh National Zoo (formerly Dhaka Zoo) opened to the public at Mirpur in {ZOO_INFO.established}. Spread over about {ZOO_INFO.areaAcres} acres beside the National Botanical Garden, it is the largest zoo in the country and welcomes millions of visitors every year.</p>
            <p>The zoo is home to more than 130 species — from the Royal Bengal Tiger, the national animal, to Asian elephants, giraffes, hippos, crocodiles and a rich collection of native and exotic birds. Its two lakes attract thousands of migratory birds every winter.</p>
            <p>Today the zoo focuses on animal welfare, conservation breeding, and education — helping children and adults understand why protecting the Sundarbans and Bangladesh's forests matters.</p>
          </Reveal>
          <Reveal delay={150} className="about-card">
            <div><b>{ZOO_INFO.established}</b><span>Opened</span></div>
            <div><b><Counter to={ZOO_INFO.areaAcres} /></b><span>Acres</span></div>
            <div><b><Counter to={130} suffix="+" /></b><span>Species</span></div>
            <div><b>2</b><span>Lakes</span></div>
          </Reveal>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <SectionTitle kicker="What we do" title="Our Mission" />
          <div className="card-grid three">
            {[['🩺', 'Animal Welfare', 'Veterinary care, balanced diets and enriched enclosures for every resident.'],
              ['🧬', 'Conservation', 'Breeding programmes for threatened native species like the Bengal tiger and spotted deer.'],
              ['📚', 'Education', 'School programmes, keeper talks and signage that turn visits into learning.']].map(([e, t, d], i) => (
              <Reveal key={t} delay={i * 100} className="info-card"><span>{e}</span><h3>{t}</h3><p>{d}</p></Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="credits">
        <div className="container">
          <SectionTitle kicker="Thank you" title="Photo & Map Credits">
            Photos are by visitors who shared them on Wikimedia Commons under Creative Commons licences.
            Zoo boundary, lakes, roads and enclosures come from OpenStreetMap (© OpenStreetMap contributors, ODbL); satellite imagery © Esri.
          </SectionTitle>
          <ul className="credits">
            {Object.values(PHOTOS).map((p) => (
              <li key={p.src}>
                <img src={p.src} alt="" loading="lazy" />
                <div>
                  <b>{p.title}</b>
                  <small>{p.author} · {p.license} · <a href={p.source} target="_blank" rel="noreferrer">source</a></small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'General enquiry', message: '' });
  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };
  const [lat, lng] = ZOO_INFO.center;
  return (
    <>
      <PageHero title="Contact Us" subtitle="Questions about your visit, group bookings or volunteering? We're happy to help." emoji="📞✉️" photo={PHOTOS['gate-sign'].src} />
      <section className="section">
        <div className="container split">
          <div>
            <SectionTitle kicker="Get in touch" title="We'd Love to Hear From You" center={false} />
            <ul className="contact-list">
              <li><span>📍</span><div><b>Address</b><p>{ZOO_INFO.address}</p></div></li>
              <li><span>📞</span><div><b>Phone</b><p>{ZOO_INFO.phone}</p></div></li>
              <li><span>✉️</span><div><b>Email</b><p>{ZOO_INFO.email}</p></div></li>
              <li><span>🕘</span><div><b>Hours</b><p>{ZOO_INFO.hours} · Closed {ZOO_INFO.closed}</p></div></li>
            </ul>
          </div>
          <div className="contact-form">
            {sent ? (
              <div className="sent">
                <span>✅</span>
                <h3>Thank you, {form.name || 'friend'}!</h3>
                <p>Your message has been received. Our team will reply to {form.email || 'you'} soon.</p>
                <button className="btn btn-ghost" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: 'General enquiry', message: '' }); }}>Send another</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label>Your name<input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                <label>Email<input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                <label>Subject
                  <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    <option>General enquiry</option>
                    <option>Group / school booking</option>
                    <option>Volunteering</option>
                    <option>Feedback</option>
                  </select>
                </label>
                <label>Message<textarea className="input" rows="5" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
                <button className="btn btn-orange block" type="submit">Send message</button>
              </form>
            )}
          </div>
        </div>
      </section>
      <section className="map-embed">
        <iframe
          title="Bangladesh National Zoo on Google Maps"
          src={`https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <section className="section center notfound">
      <div className="container">
        <span>🙈</span>
        <h1>This path leads nowhere</h1>
        <p>Looks like this enclosure is empty. Let's get you back on the trail.</p>
        <Link to="/" className="btn btn-green">Back to the zoo map</Link>
      </div>
    </section>
  );
}
