import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import {
  ZONES, LAKES, BOUNDARY_PATH, CATEGORIES, TOUR_STOPS, zoneById, animalById,
} from '../data/zoo';
import { buildTour, measureStops } from './tourPath';
import { startAmbience, stopAmbience } from './ambientSound';
import './ZooMap.css';

const SatelliteMap = lazy(() => import('./SatelliteMap'));

const W = 1200;
const H = 900;
const MIN_K = 1;
const MAX_K = 4.5;
const WALK_SPEED = 85; // map units per second
const STOP_PAUSE = 4200; // ms spent at each stop

// Deterministic pseudo-random so the trees are the same on every visit.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function useTrees() {
  return useMemo(() => {
    const r = rng(42);
    const trees = [];
    let tries = 0;
    while (trees.length < 230 && tries < 6000) {
      tries++;
      const x = 160 + r() * 900;
      const y = 115 + r() * 740;
      // keep inside an ellipse roughly matching the boundary
      const ex = (x - 610) / 455;
      const ey = (y - 485) / 375;
      if (ex * ex + ey * ey > 0.93) continue;
      if (ZONES.some((z) => Math.hypot(z.x - x, z.y - y) < 62)) continue;
      if (LAKES.some((l) => ((x - l.cx) / (l.rx + 18)) ** 2 + ((y - l.cy) / (l.ry + 18)) ** 2 < 1)) continue;
      trees.push({ x, y, s: 9 + r() * 11, hue: 105 + r() * 35, d: r() * 4 });
    }
    return trees;
  }, []);
}

export default function ZooMap({ autoTour = false, height = '100vh', showIntroHint = true, initialSound = false, initialZone = null }) {
  const svgRef = useRef(null);
  const routeRef = useRef(null);
  const wrapRef = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const viewRef = useRef(view);
  viewRef.current = view;

  const [selected, setSelected] = useState(initialZone && zoneById[initialZone] ? initialZone : null);
  const [hovered, setHovered] = useState(null);
  const [filters, setFilters] = useState(() => new Set(Object.keys(CATEGORIES)));
  const [query, setQuery] = useState('');
  const [night, setNight] = useState(false);
  const [sound, setSound] = useState(initialSound);
  const [mode, setMode] = useState('illustrated');
  const [panelOpen, setPanelOpen] = useState(true);

  const trees = useTrees();
  const tour = useMemo(buildTour, []);
  const [stopLens, setStopLens] = useState(null);
  const [walker, setWalker] = useState(null); // {x, y, angle}
  const [tourState, setTourState] = useState({ playing: false, dist: 0, stop: 0, atStop: true });
  const tourRef = useRef(tourState);
  tourRef.current = tourState;

  useEffect(() => {
    setStopLens(measureStops(tour.prefixes));
  }, [tour]);

  // ---------- camera ----------
  const clampView = useCallback((v) => {
    const k = Math.min(MAX_K, Math.max(MIN_K, v.k));
    const minX = W - W * k;
    const minY = H - H * k;
    return { k, x: Math.min(0, Math.max(minX, v.x)), y: Math.min(0, Math.max(minY, v.y)) };
  }, []);

  const svgPoint = useCallback((clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const scale = Math.max(rect.width / W, rect.height / H); // viewBox uses "slice"
    const offX = (rect.width - W * scale) / 2;
    const offY = (rect.height - H * scale) / 2;
    return { x: (clientX - rect.left - offX) / scale, y: (clientY - rect.top - offY) / scale, scale };
  }, []);

  const zoomAt = useCallback((cx, cy, factor) => {
    setView((v) => {
      const k = Math.min(MAX_K, Math.max(MIN_K, v.k * factor));
      const f = k / v.k;
      return clampView({ k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f });
    });
  }, [clampView]);

  const focusOn = useCallback((x, y, k = 2.4) => {
    setView(clampView({ k, x: W / 2 - x * k, y: H / 2 - y * k }));
  }, [clampView]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const p = svgPoint(e.clientX, e.clientY);
      zoomAt(p.x, p.y, e.deltaY < 0 ? 1.15 : 1 / 1.15);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [svgPoint, zoomAt, mode]);

  const pointers = useRef(new Map());
  const drag = useRef(null);
  const onPointerDown = (e) => {
    svgRef.current.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    drag.current = { moved: 0, pinch: null };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      drag.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId) || !drag.current) return;
    const prev = pointers.current.get(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && drag.current.pinch) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = svgPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
      zoomAt(mid.x, mid.y, dist / drag.current.pinch);
      drag.current.pinch = dist;
      drag.current.moved += 10;
      return;
    }
    const { scale } = svgPoint(e.clientX, e.clientY);
    const dx = (e.clientX - prev.x) / scale;
    const dy = (e.clientY - prev.y) / scale;
    drag.current.moved += Math.abs(dx) + Math.abs(dy);
    if (tourRef.current.playing) return; // camera follows the walker during the tour
    setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }));
  };
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2 && drag.current) drag.current.pinch = null;
  };
  const wasDrag = () => drag.current && drag.current.moved > 6;

  // ---------- tour animation ----------
  const updateWalker = useCallback((dist) => {
    const path = routeRef.current;
    if (!path) return;
    const p = path.getPointAtLength(dist);
    const q = path.getPointAtLength(Math.min(path.getTotalLength(), dist + 2));
    setWalker({ x: p.x, y: p.y, flip: q.x < p.x });
    return p;
  }, []);

  useEffect(() => {
    if (!tourState.playing || !stopLens) return undefined;
    let raf;
    let last = performance.now();
    let pauseUntil = tourRef.current.atStop ? last + STOP_PAUSE : 0;
    const total = routeRef.current.getTotalLength();

    const step = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      const s = tourRef.current;
      if (now < pauseUntil) {
        raf = requestAnimationFrame(step);
        return;
      }
      const nextStop = Math.min(s.stop + 1, stopLens.length - 1);
      const target = nextStop === stopLens.length - 1 ? total : stopLens[nextStop];
      let dist = s.dist + WALK_SPEED * dt;
      let state;
      if (dist >= target) {
        dist = target;
        const finished = nextStop === stopLens.length - 1;
        state = { playing: !finished, dist, stop: nextStop, atStop: true };
        const z = zoneById[TOUR_STOPS[nextStop]];
        setSelected(z.id);
        pauseUntil = now + STOP_PAUSE;
      } else {
        state = { ...s, dist, atStop: false };
      }
      tourRef.current = state;
      setTourState(state);
      const p = updateWalker(dist);
      if (p) {
        setView((v) => {
          const k = Math.max(v.k, 2.2);
          const tx = W / 2 - p.x * k;
          const ty = H / 2 - p.y * k;
          return clampView({ k, x: v.x + (tx - v.x) * 0.08, y: v.y + (ty - v.y) * 0.08 });
        });
      }
      if (state.playing) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [tourState.playing, stopLens, updateWalker, clampView]);

  const startTour = useCallback(() => {
    const s = tourRef.current;
    const restart = !stopLens || s.stop >= TOUR_STOPS.length - 1;
    const next = restart ? { playing: true, dist: 0, stop: 0, atStop: true } : { ...s, playing: true };
    if (restart) {
      setSelected('gate');
      focusOn(zoneById.gate.x, zoneById.gate.y, 2.4);
    }
    setPanelOpen(true);
    updateWalker(next.dist);
    setTourState(next);
  }, [stopLens, focusOn, updateWalker]);

  const pauseTour = () => setTourState((s) => ({ ...s, playing: false }));

  const jumpStop = (delta) => {
    if (!stopLens) return;
    const stop = Math.min(TOUR_STOPS.length - 1, Math.max(0, tourRef.current.stop + delta));
    const dist = stopLens[stop];
    const z = zoneById[TOUR_STOPS[stop]];
    setSelected(z.id);
    setTourState((s) => ({ ...s, stop, dist, atStop: true }));
    updateWalker(dist);
    focusOn(z.x, z.y, 2.4);
  };

  const exitTour = () => {
    setTourState({ playing: false, dist: 0, stop: 0, atStop: true });
    setWalker(null);
    setView({ x: 0, y: 0, k: 1 });
  };

  useEffect(() => {
    const z = initialZone && zoneById[initialZone];
    if (z) focusOn(z.x, z.y, 2.4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialZone]);

  useEffect(() => {
    if (autoTour && stopLens) startTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTour, stopLens]);

  // ---------- sound ----------
  useEffect(() => {
    if (sound) startAmbience();
    else stopAmbience();
  }, [sound]);
  useEffect(() => () => stopAmbience(), []);

  // ---------- filtering ----------
  const q = query.trim().toLowerCase();
  const matches = (z) => {
    if (!q) return true;
    if (z.name.toLowerCase().includes(q)) return true;
    return z.animals.some((a) => {
      const an = animalById[a];
      return an && (an.name.toLowerCase().includes(q) || an.bn.includes(query.trim()));
    });
  };
  const visibleZones = ZONES.filter((z) => filters.has(z.cat) && matches(z));
  const searchHits = q ? visibleZones : [];

  const toggleFilter = (c) => {
    setFilters((f) => {
      const n = new Set(f);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });
  };

  const selectZone = (z) => {
    if (wasDrag()) return;
    setSelected(z.id);
    setPanelOpen(true);
    if (!tourRef.current.playing) focusOn(z.x, z.y, Math.max(viewRef.current.k, 2.2));
  };

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const sel = selected ? zoneById[selected] : null;
  const tourActive = tourState.playing || tourState.dist > 0;
  const tourProgress = stopLens ? tourState.stop / (TOUR_STOPS.length - 1) : 0;
  const lampPoints = useMemo(() => ZONES.map((z) => [z.x + 30, z.y + 28]), []);

  return (
    <div className={`zm ${night ? 'zm-night' : ''}`} ref={wrapRef} style={{ height }}>
      {mode === 'satellite' ? (
        <Suspense fallback={<div className="zm-loading">Loading satellite view…</div>}>
          <SatelliteMap selected={selected} onSelect={(id) => { setSelected(id); setPanelOpen(true); }} filters={filters} />
        </Suspense>
      ) : (
        <svg
          ref={svgRef}
          className="zm-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="img"
          aria-label="Interactive illustrated map of Bangladesh National Zoo"
        >
          <defs>
            <radialGradient id="grass" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#9bd86a" />
              <stop offset="70%" stopColor="#6dbb4a" />
              <stop offset="100%" stopColor="#4f9a35" />
            </radialGradient>
            <linearGradient id="water" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7fd3f7" />
              <stop offset="100%" stopColor="#2b8fc7" />
            </linearGradient>
            <pattern id="city" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="#d9d2c3" />
              <rect x="6" y="6" width="22" height="18" rx="2" fill="#c9c0ae" />
              <rect x="34" y="8" width="20" height="26" rx="2" fill="#c4bba8" />
              <rect x="8" y="32" width="18" height="22" rx="2" fill="#cdc4b2" />
              <rect x="32" y="40" width="22" height="14" rx="2" fill="#c7bfac" />
            </pattern>
            <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.35" />
            </filter>
            <radialGradient id="lamp">
              <stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffe9a8" stopOpacity="0" />
            </radialGradient>
            <clipPath id="zooClip">
              <path d={BOUNDARY_PATH} />
            </clipPath>
            <path id="flight1" d="M -80 300 C 300 150 700 420 1300 180" />
            <path id="flight2" d="M 1280 650 C 900 520 500 760 -80 520" />
          </defs>

          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} className={tourState.playing ? 'zm-cam-follow' : 'zm-cam'}>
            {/* surrounding city — faded so only the zoo stands out */}
            <rect x="-600" y="-600" width={W + 1200} height={H + 1200} fill="url(#city)" />
            <g className="zm-roads">
              <path d="M -600 905 L 1800 905" />
              <path d="M 1110 -600 L 1110 1500" />
              <path d="M 110 -600 L 110 1500" />
            </g>
            <text x="600" y="925" className="zm-road-label">ZOO ROAD · MIRPUR-1</text>
            <text x="1128" y="470" className="zm-road-label" transform="rotate(90 1128 470)">TO BOTANICAL GARDEN</text>
            <rect x="-600" y="-600" width={W + 1200} height={H + 1200} className="zm-fog" />

            {/* zoo grounds */}
            <path d={BOUNDARY_PATH} fill="url(#grass)" />
            <g clipPath="url(#zooClip)">
              <path d={BOUNDARY_PATH} className="zm-grass-texture" />
            </g>
            <path d={BOUNDARY_PATH} className="zm-wall" />

            {/* lakes */}
            {LAKES.map((l) => (
              <g key={l.id} transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}>
                <ellipse cx={l.cx} cy={l.cy} rx={l.rx + 8} ry={l.ry + 8} fill="#c9b27c" opacity="0.6" />
                <ellipse cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill="url(#water)" />
                <ellipse cx={l.cx} cy={l.cy} rx={l.rx * 0.5} ry={l.ry * 0.4} className="zm-ripple" />
                <ellipse cx={l.cx} cy={l.cy} rx={l.rx * 0.5} ry={l.ry * 0.4} className="zm-ripple zm-ripple-2" />
                <path id={`swim-${l.id}`} d={`M ${l.cx - l.rx * 0.6} ${l.cy} a ${l.rx * 0.6} ${l.ry * 0.5} 0 1 0 ${l.rx * 1.2} 0 a ${l.rx * 0.6} ${l.ry * 0.5} 0 1 0 ${-l.rx * 1.2} 0`} fill="none" />
                <text fontSize="20" textAnchor="middle">
                  🦆
                  <animateMotion dur={l.id === 'lake-a' ? '38s' : '30s'} repeatCount="indefinite"><mpath href={`#swim-${l.id}`} /></animateMotion>
                </text>
                <text fontSize="16" textAnchor="middle">
                  🦢
                  <animateMotion dur="46s" begin="-20s" repeatCount="indefinite"><mpath href={`#swim-${l.id}`} /></animateMotion>
                </text>
              </g>
            ))}

            {/* walkways */}
            <path d={tour.d} className="zm-path-edge" />
            <path d={tour.d} className="zm-path" ref={routeRef} />
            <path d={tour.d} className="zm-path-dash" />
            {tourActive && (
              <path
                d={tour.d}
                className="zm-path-done"
                style={{ strokeDasharray: `${tourState.dist} 99999` }}
              />
            )}

            {/* trees */}
            {trees.map((t, i) => (
              <g key={i} className="zm-tree" style={{ animationDelay: `${t.d}s`, transformOrigin: `${t.x}px ${t.y + t.s}px` }}>
                <ellipse cx={t.x + 3} cy={t.y + t.s * 0.8} rx={t.s} ry={t.s * 0.45} fill="#000" opacity="0.15" />
                <circle cx={t.x} cy={t.y} r={t.s} fill={`hsl(${t.hue} 45% 32%)`} />
                <circle cx={t.x - t.s * 0.3} cy={t.y - t.s * 0.3} r={t.s * 0.55} fill={`hsl(${t.hue} 50% 44%)`} />
              </g>
            ))}

            {/* main gate arch */}
            <g transform="translate(600 872)" className="zm-gate">
              <rect x="-62" y="-14" width="14" height="40" rx="3" fill="#8d5524" />
              <rect x="48" y="-14" width="14" height="40" rx="3" fill="#8d5524" />
              <path d="M -66 -14 Q 0 -60 66 -14" fill="none" stroke="#b5651d" strokeWidth="10" strokeLinecap="round" />
              <text y="-30" textAnchor="middle" className="zm-gate-text">MAIN GATE</text>
            </g>

            {/* zones */}
            {visibleZones.map((z) => {
              const cat = CATEGORIES[z.cat];
              const isSel = z.id === selected;
              const isEnclosure = z.cat === 'animal' || (z.cat === 'bird' && !z.id.includes('lake'));
              return (
                <g
                  key={z.id}
                  className={`zm-zone ${isSel ? 'is-sel' : ''} ${q && matches(z) ? 'is-hit' : ''}`}
                  onClick={() => selectZone(z)}
                  onMouseEnter={() => setHovered(z.id)}
                  onMouseLeave={() => setHovered(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={z.name}
                  onKeyDown={(e) => e.key === 'Enter' && selectZone(z)}
                >
                  {isEnclosure && (
                    <>
                      <circle cx={z.x} cy={z.y} r="50" fill={cat.color} opacity="0.16" />
                      <circle cx={z.x} cy={z.y} r="50" className="zm-fence" />
                    </>
                  )}
                  {isEnclosure && z.animals.slice(0, 2).map((aid, i) => (
                    <text
                      key={aid}
                      x={z.x + (i ? 24 : -26)}
                      y={z.y + (i ? 30 : 34)}
                      fontSize="20"
                      textAnchor="middle"
                      className="zm-critter"
                      style={{ animationDelay: `${i * 1.7}s` }}
                    >
                      {animalById[aid]?.emoji}
                    </text>
                  ))}
                  {isSel && <circle cx={z.x} cy={z.y - 18} r="34" className="zm-pulse" />}
                  <g transform={`translate(${z.x} ${z.y - 18})`} filter="url(#shadow)" className="zm-pin">
                    <path d="M 0 22 C -6 12 -22 4 -22 -10 A 22 22 0 1 1 22 -10 C 22 4 6 12 0 22 Z" fill={cat.color} />
                    <circle r="16" cy="-10" fill="#fff" />
                    <text y="-3" fontSize="19" textAnchor="middle">{z.emoji}</text>
                  </g>
                  {(view.k > 1.6 || isSel || hovered === z.id) && (
                    <text x={z.x} y={z.y + 22} className="zm-label" textAnchor="middle">{z.name}</text>
                  )}
                </g>
              );
            })}

            {/* night lights */}
            {night && <rect x="-600" y="-600" width={W + 1200} height={H + 1200} className="zm-night-overlay" pointerEvents="none" />}
            {night && lampPoints.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="60" fill="url(#lamp)" className="zm-lamp" />
            ))}
            {/* walker */}
            {walker && (
              <g transform={`translate(${walker.x} ${walker.y})`} className="zm-walker">
                <circle r="18" className="zm-walker-halo" />
                <text fontSize="26" textAnchor="middle" y="9" transform={walker.flip ? 'scale(-1 1)' : undefined} className={tourState.playing && !tourState.atStop ? 'zm-walking' : ''}>🚶</text>
                <text y="-22" textAnchor="middle" className="zm-you">YOU</text>
              </g>
            )}

          </g>

          {/* birds fly over everything in screen space */}
          {!night && (
            <g className="zm-birds">
              <text fontSize="22"><animateMotion dur="26s" repeatCount="indefinite" rotate="0"><mpath href="#flight1" /></animateMotion>🕊️</text>
              <text fontSize="16"><animateMotion dur="32s" begin="-12s" repeatCount="indefinite"><mpath href="#flight2" /></animateMotion>🐦</text>
            </g>
          )}
        </svg>
      )}

      {/* ---------- overlay UI ---------- */}
      <div className="zm-top-left">
        <div className="zm-search">
          <span aria-hidden>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search animal or place… e.g. Tiger"
            aria-label="Search the zoo map"
          />
          {query && <button onClick={() => setQuery('')} aria-label="Clear search">✕</button>}
        </div>
        {searchHits.length > 0 && (
          <ul className="zm-results">
            {searchHits.slice(0, 6).map((z) => (
              <li key={z.id}>
                <button onClick={() => { setQuery(''); selectZone(z); }}>
                  <span>{z.emoji}</span> {z.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="zm-chips">
          {Object.entries(CATEGORIES).map(([k, c]) => (
            <button
              key={k}
              className={`zm-chip ${filters.has(k) ? 'on' : ''}`}
              style={{ '--c': c.color }}
              onClick={() => toggleFilter(k)}
            >
              <i /> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="zm-tools">
        <div className="zm-mode">
          <button className={mode === 'illustrated' ? 'on' : ''} onClick={() => setMode('illustrated')}>🗺️ <span className="zm-mode-label">Illustrated</span></button>
          <button className={mode === 'satellite' ? 'on' : ''} onClick={() => { pauseTour(); setMode('satellite'); }}>🛰️ <span className="zm-mode-label">Satellite</span></button>
        </div>
        {mode === 'illustrated' && (
          <div className="zm-btn-col">
            <button title="Zoom in" onClick={() => zoomAt(W / 2, H / 2, 1.3)}>＋</button>
            <button title="Zoom out" onClick={() => zoomAt(W / 2, H / 2, 1 / 1.3)}>－</button>
            <button title="Show whole zoo" onClick={() => setView({ x: 0, y: 0, k: 1 })}>⤢</button>
            <button title={night ? 'Day view' : 'Night view'} onClick={() => setNight((n) => !n)}>{night ? '☀️' : '🌙'}</button>
            <button title={sound ? 'Mute zoo sounds' : 'Play zoo sounds'} onClick={() => setSound((s) => !s)}>{sound ? '🔊' : '🔈'}</button>
            <button title="Full screen" onClick={toggleFullscreen}>⛶</button>
          </div>
        )}
        <div className="zm-compass" aria-hidden>
          <span>N</span>
        </div>
      </div>

      {sel && panelOpen && (
        <aside className="zm-panel" aria-live="polite">
          <button className="zm-panel-close" onClick={() => setPanelOpen(false)} aria-label="Close">✕</button>
          <div className="zm-panel-head" style={{ '--c': CATEGORIES[sel.cat].color }}>
            <span className="zm-panel-emoji">{sel.emoji}</span>
            <div>
              <small>{CATEGORIES[sel.cat].label}</small>
              <h3>{sel.name}</h3>
            </div>
          </div>
          <p>{sel.desc}</p>
          {sel.animals.length > 0 && (
            <>
              <h4>Who lives here</h4>
              <ul className="zm-animals">
                {sel.animals.map((a) => animalById[a]).filter(Boolean).map((a) => (
                  <li key={a.id}>
                    <span>{a.emoji}</span>
                    <div>
                      <b>{a.name}</b> <em>{a.bn}</em>
                      <small>{a.fact}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      )}

      {mode === 'illustrated' && (
        <div className={`zm-tour ${tourActive ? 'active' : ''}`}>
          {!tourActive ? (
            <button className="zm-tour-start" onClick={startTour} disabled={!stopLens}>
              🚶 Start Virtual Walk
              <small>Walk through the zoo stop by stop</small>
            </button>
          ) : (
            <>
              <div className="zm-tour-info">
                <small>{tourState.atStop ? 'You are at' : 'Walking to'}</small>
                <b>
                  {zoneById[TOUR_STOPS[tourState.atStop ? tourState.stop : Math.min(tourState.stop + 1, TOUR_STOPS.length - 1)]].emoji}{' '}
                  {zoneById[TOUR_STOPS[tourState.atStop ? tourState.stop : Math.min(tourState.stop + 1, TOUR_STOPS.length - 1)]].name}
                </b>
                <div className="zm-progress"><i style={{ width: `${tourProgress * 100}%` }} /></div>
                <small>Stop {tourState.stop + 1} of {TOUR_STOPS.length}</small>
              </div>
              <div className="zm-tour-btns">
                <button onClick={() => jumpStop(-1)} title="Previous stop">⏮</button>
                {tourState.playing
                  ? <button onClick={pauseTour} title="Pause" className="big">⏸</button>
                  : <button onClick={startTour} title="Continue" className="big">▶</button>}
                <button onClick={() => jumpStop(1)} title="Next stop">⏭</button>
                <button onClick={exitTour} title="End walk">✕</button>
              </div>
            </>
          )}
        </div>
      )}

      {showIntroHint && mode === 'illustrated' && !tourActive && view.k === 1 && !sel && (
        <div className="zm-hint">Drag to explore · Scroll or pinch to zoom · Tap a pin to learn more</div>
      )}
    </div>
  );
}
