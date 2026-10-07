import { useState } from 'react';
import { startAmbience } from './ambientSound';
import './GateIntro.css';

export default function GateIntro({ onEnter }) {
  const [opening, setOpening] = useState(false);
  const [withSound, setWithSound] = useState(true);

  const enter = () => {
    if (opening) return;
    if (withSound) startAmbience(); // must start inside the click for browsers to allow audio
    setOpening(true);
    setTimeout(() => onEnter(withSound), 2300);
  };

  return (
    <div className={`gi ${opening ? 'gi-open' : ''}`} role="dialog" aria-label="Welcome to Bangladesh National Zoo">
      <div className="gi-sky">
        <div className="gi-sun" />
        <div className="gi-cloud c1" />
        <div className="gi-cloud c2" />
        <div className="gi-cloud c3" />
        <span className="gi-bird b1">🕊️</span>
        <span className="gi-bird b2">🐦</span>
      </div>
      <div className="gi-scene">
        <div className="gi-hills" />
        <div className="gi-trees">
          {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ '--i': i }}>🌳</span>)}
        </div>
        <div className="gi-peek giraffe">🦒</div>
        <div className="gi-peek elephant">🐘</div>
        <div className="gi-peek monkey">🐒</div>
        <div className="gi-wall left" />
        <div className="gi-wall right" />

        <div className="gi-gate">
          <div className="gi-sign">
            <span className="bn">বাংলাদেশ জাতীয় চিড়িয়াখানা</span>
            <span className="en">BANGLADESH NATIONAL ZOO</span>
            <span className="sub">Mirpur · Dhaka · Since 1974</span>
          </div>
          <div className="gi-pillar l"><span>🐅</span></div>
          <div className="gi-pillar r"><span>🦁</span></div>
          <div className="gi-doors">
            <div className="gi-door l" />
            <div className="gi-door r" />
            <div className="gi-inside">
              <span>🌴</span><span>🦚</span><span>🌴</span>
            </div>
          </div>
        </div>
        <div className="gi-road" />
      </div>

      <div className="gi-cta">
        <h1>Welcome to the Zoo!</h1>
        <p>Step through the gates and explore 186 acres of wildlife — right from your screen.</p>
        <button onClick={enter} className="gi-btn" autoFocus>🎟️ Enter the Zoo</button>
        <label className="gi-sound">
          <input type="checkbox" checked={withSound} onChange={(e) => setWithSound(e.target.checked)} />
          Enter with nature sounds 🔊
        </label>
        <button className="gi-skip" onClick={() => onEnter(false)}>Skip intro</button>
      </div>
    </div>
  );
}
