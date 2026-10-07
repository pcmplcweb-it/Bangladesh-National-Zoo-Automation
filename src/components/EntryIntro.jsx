import { useState } from 'react';
import { startAmbience } from './ambientSound';
import { PHOTOS } from '../data/photos';
import './EntryIntro.css';

// Full-screen real photo of the zoo gate; entering "walks" the camera through the arch.
export default function EntryIntro({ onEnter }) {
  const [entering, setEntering] = useState(false);
  const [withSound, setWithSound] = useState(true);
  const gate = PHOTOS['gate-pillars'];

  const enter = () => {
    if (entering) return;
    if (withSound) startAmbience(); // must start inside the click for browsers to allow audio
    setEntering(true);
    setTimeout(() => onEnter(withSound), 1900);
  };

  return (
    <div className={`ei ${entering ? 'ei-go' : ''}`} role="dialog" aria-label="Welcome to Bangladesh National Zoo">
      <div className="ei-photo" style={{ backgroundImage: `url(${gate.src})` }} />
      <div className="ei-shade" />
      <div className="ei-leaves" aria-hidden>
        {Array.from({ length: 10 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
      </div>
      <div className="ei-content">
        <span className="ei-badge"><i /> বাংলাদেশ জাতীয় চিড়িয়াখানা · মিরপুর, ঢাকা</span>
        <h1>
          <span>স্বাগতম!</span>
          <em>Welcome to the National Zoo</em>
        </h1>
        <p>১৮৬ একরের সবুজ, দুটি লেক আর ১৩০+ প্রজাতির প্রাণী — ফটক পেরিয়ে ভেতরে চলুন।</p>
        <button className="ei-btn" onClick={enter} autoFocus>
          <span>🎟️</span> প্রবেশ করুন · Enter the Zoo
        </button>
        <label className="ei-sound">
          <input type="checkbox" checked={withSound} onChange={(e) => setWithSound(e.target.checked)} />
          প্রকৃতির শব্দসহ প্রবেশ · with nature sounds 🔊
        </label>
        <button className="ei-skip" onClick={() => onEnter(false)}>Skip intro</button>
      </div>
      <small className="ei-credit">Photo: {gate.author} · {gate.license} · Wikimedia Commons</small>
    </div>
  );
}
