import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZONES, CATEGORIES, TOUR_STOPS, ZOO_INFO, NO_STREETVIEW, STREETVIEW_OK, zoneById, animalById } from '../data/zoo';
import { PHOTOS } from '../data/photos';
import { zonePhoto } from '../data/media';
import { TILES, OSM_ATTRIBUTION, zooBounds, addZooFrame, addEnclosures, zoneIcon } from './mapLayers';
import { buildTourRoute, pointAt } from './mapRoute';
import { startAmbience, stopAmbience } from './ambientSound';
import './ZooMap.css';

const WALK_SPEED = 45; // metres of route per second of animation
const STOP_PAUSE = 8000; // ms at each stop — time to look around in Street View
const TOUR_ZOOM = 18.5;

const directionsUrl = ([lat, lng]) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
const gmapsPlaceUrl = ([lat, lng]) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
// Keyless Google Maps embeds: satellite map with Google's own labels, and 360° Street View.
const googleMapEmbed = ([lat, lng], z) => `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=${z}&hl=en&output=embed`;
const streetViewEmbed = ([lat, lng]) => `https://www.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=12,0,0,0,0&hl=en&output=svembed`;


export default function ZooMap({ autoTour = false, height = '100vh', showIntroHint = true, initialSound = false, initialZone = null }) {
  const elRef = useRef(null);
  const wrapRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({});
  const markersRef = useRef({});

  const [base, setBase] = useState('satellite');
  const [zoom, setZoom] = useState(17);
  const [selected, setSelected] = useState(initialZone && zoneById[initialZone] ? initialZone : null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [filters, setFilters] = useState(() => new Set(Object.keys(CATEGORIES)));
  const [query, setQuery] = useState('');
  const [night, setNight] = useState(false);
  const [sound, setSound] = useState(initialSound);
  const [toast, setToast] = useState('');
  const [hint, setHint] = useState(showIntroHint);
  const [media, setMedia] = useState('photo'); // 'photo' | 'sv' (360° Street View)

  const route = useMemo(buildTourRoute, []);
  const [tour, setTour] = useState({ playing: false, dist: 0, stop: 0, atStop: true, active: false });
  const tourRef = useRef(tour);
  tourRef.current = tour;

  const flash = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(flash.t);
    flash.t = window.setTimeout(() => setToast(''), 4000);
  }, []);

  // ---------- create map once ----------
  useEffect(() => {
    const bounds = zooBounds();
    const map = L.map(elRef.current, {
      zoomControl: false,
      minZoom: 16,
      maxZoom: 20,
      zoomSnap: 0.25,
      maxBounds: bounds.pad(0.45),
      maxBoundsViscosity: 0.9,
      attributionControl: true,
    });
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    map.attributionControl.addAttribution(OSM_ATTRIBUTION);
    map.fitBounds(bounds, { padding: [24, 24] });
    mapRef.current = map;

    layersRef.current.satellite = L.tileLayer(TILES.satellite.url, TILES.satellite.options).addTo(map);
    layersRef.current.street = L.tileLayer(TILES.street.url, TILES.street.options);
    addEnclosures(map);
    addZooFrame(map);
    layersRef.current.routeAll = L.polyline(route.latlngs, { color: '#ffd166', weight: 4, opacity: 0.9, dashArray: '1 9', lineCap: 'round', interactive: false });
    layersRef.current.routeDone = L.polyline([], { color: '#ff7a29', weight: 5, opacity: 0.95, interactive: false });

    ZONES.forEach((z) => {
      const m = L.marker(z.pos, { icon: zoneIcon(z, CATEGORIES[z.cat].color), riseOnHover: true, title: z.name, keyboard: true });
      m.on('click', () => {
        setSelected(z.id);
        setPanelOpen(true);
        setHint(false);
        if (!tourRef.current.playing) map.flyTo(z.pos, Math.max(map.getZoom(), 18.5), { duration: 0.8 });
      });
      m.addTo(map);
      markersRef.current[z.id] = m;
    });

    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    map.on('dragstart', () => setHint(false));
    onZoom();

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [route]);

  // ---------- base layer ----------
  useEffect(() => {
    const map = mapRef.current;
    const { satellite, street } = layersRef.current;
    if (!map) return;
    if (base === 'google') return;
    if (base === 'satellite') {
      map.removeLayer(street);
      satellite.addTo(map);
    } else {
      map.removeLayer(satellite);
      street.addTo(map);
    }
    satellite.bringToBack();
    street.bringToBack();
  }, [base]);

  // ---------- markers: filters, search, selection ----------
  const q = query.trim().toLowerCase();
  const matches = useCallback((z) => {
    if (!q) return true;
    if (`${z.name} ${z.bn}`.toLowerCase().includes(q)) return true;
    return z.animals.some((a) => {
      const an = animalById[a];
      return an && `${an.name} ${an.bn}`.toLowerCase().includes(q);
    });
  }, [q]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    ZONES.forEach((z) => {
      const m = markersRef.current[z.id];
      const show = filters.has(z.cat) && (!q || matches(z));
      if (show && !map.hasLayer(m)) m.addTo(map);
      if (!show && map.hasLayer(m)) map.removeLayer(m);
      m.setIcon(zoneIcon(z, CATEGORIES[z.cat].color, z.id === selected));
      m.setZIndexOffset(z.id === selected ? 1000 : 0);
    });
  }, [filters, q, matches, selected]);

  useEffect(() => {
    const z = initialZone && zoneById[initialZone];
    if (z && mapRef.current) mapRef.current.setView(z.pos, 19);
  }, [initialZone]);

  // ---------- tour ----------
  const walkerRef = useRef(null);
  const placeWalker = useCallback((dist) => {
    const map = mapRef.current;
    const { p, heading } = pointAt(route, dist);
    if (!walkerRef.current) {
      walkerRef.current = L.marker(p, {
        icon: L.divIcon({ className: 'zm-walker-wrap', html: '<div class="zm-walker"><i></i><span>🚶</span><b>YOU</b></div>', iconSize: [44, 44], iconAnchor: [22, 30] }),
        interactive: false,
        zIndexOffset: 2000,
      }).addTo(map);
    }
    walkerRef.current.setLatLng(p);
    const el = walkerRef.current.getElement();
    if (el && heading !== undefined) el.classList.toggle('flip', heading < 0);
    const done = route.latlngs.slice(0, pointAt(route, dist).i + 1);
    done.push(p);
    layersRef.current.routeDone.setLatLngs(done);
    return p;
  }, [route]);

  useEffect(() => {
    if (!tour.playing) return undefined;
    const map = mapRef.current;
    let raf;
    let last = performance.now();
    let pauseUntil = tourRef.current.atStop ? last + STOP_PAUSE : 0;
    const step = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (now < pauseUntil) {
        raf = requestAnimationFrame(step);
        return;
      }
      const s = tourRef.current;
      const nextStop = Math.min(s.stop + 1, route.stopDist.length - 1);
      if (s.atStop) setSelected(TOUR_STOPS[nextStop]); // panel previews the next stop while walking
      const target = route.stopDist[nextStop];
      let dist = s.dist + WALK_SPEED * dt;
      let state;
      if (dist >= target) {
        dist = target;
        const finished = nextStop === route.stopDist.length - 1;
        state = { ...s, playing: !finished, dist, stop: nextStop, atStop: true };
        setSelected(TOUR_STOPS[nextStop]);
        setMedia(STREETVIEW_OK.has(TOUR_STOPS[nextStop]) ? 'sv' : 'photo');
        setPanelOpen(true);
        pauseUntil = now + STOP_PAUSE;
        if (finished) flash('🎉 Tour complete — welcome back to the main gate!');
      } else {
        state = { ...s, dist, atStop: false };
      }
      tourRef.current = state;
      setTour(state);
      const p = placeWalker(dist);
      map.panTo(p, { animate: false });
      if (state.playing) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [tour.playing, route, placeWalker, flash]);

  const startTour = useCallback((fromStop) => {
    const map = mapRef.current;
    setBase((b) => (b === 'google' ? 'satellite' : b));
    const { routeAll, routeDone } = layersRef.current;
    routeAll.addTo(map);
    routeDone.addTo(map);
    const s = tourRef.current;
    let next;
    if (typeof fromStop === 'number') next = { playing: true, active: true, stop: fromStop, dist: route.stopDist[fromStop], atStop: true };
    else if (!s.active || s.stop >= TOUR_STOPS.length - 1) next = { playing: true, active: true, stop: 0, dist: 0, atStop: true };
    else next = { ...s, playing: true };
    const p = placeWalker(next.dist);
    map.setView(p, TOUR_ZOOM, { animate: true });
    if (next.atStop) setMedia(STREETVIEW_OK.has(TOUR_STOPS[next.stop]) ? 'sv' : 'photo');
    if (next.atStop) setSelected(TOUR_STOPS[next.stop]);
    setPanelOpen(true);
    setHint(false);
    tourRef.current = next;
    setTour(next);
  }, [route, placeWalker]);

  const pauseTour = () => setTour((s) => ({ ...s, playing: false }));

  const jumpStop = (delta) => {
    const stop = Math.min(TOUR_STOPS.length - 1, Math.max(0, tourRef.current.stop + delta));
    const dist = route.stopDist[stop];
    const next = { ...tourRef.current, stop, dist, atStop: true };
    tourRef.current = next;
    setTour(next);
    setSelected(TOUR_STOPS[stop]);
    setMedia(STREETVIEW_OK.has(TOUR_STOPS[stop]) ? 'sv' : 'photo');
    setPanelOpen(true);
    mapRef.current.setView(placeWalker(dist), TOUR_ZOOM);
  };

  const exitTour = () => {
    const map = mapRef.current;
    const next = { playing: false, active: false, dist: 0, stop: 0, atStop: true };
    tourRef.current = next;
    setTour(next);
    map.removeLayer(layersRef.current.routeAll);
    map.removeLayer(layersRef.current.routeDone);
    if (walkerRef.current) {
      map.removeLayer(walkerRef.current);
      walkerRef.current = null;
    }
    map.flyToBounds(zooBounds(), { padding: [24, 24], duration: 0.8 });
  };

  useEffect(() => {
    if (!autoTour) return undefined;
    const t = setTimeout(() => startTour(), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTour]);

  // ---------- sound ----------
  useEffect(() => {
    if (sound) startAmbience();
    else stopAmbience();
  }, [sound]);
  useEffect(() => () => stopAmbience(), []);

  // ---------- locate me ----------
  const meRef = useRef(null);
  const locate = () => {
    if (!navigator.geolocation) return flash('Location is not available on this device.');
    flash('📡 Finding your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        const map = mapRef.current;
        if (!zooBounds().pad(0.05).contains(p)) {
          flash('You are not inside the zoo right now — use “Directions” on any place to navigate here.');
          return;
        }
        if (!meRef.current) {
          meRef.current = L.marker(p, { icon: L.divIcon({ className: '', html: '<div class="zm-me"></div>', iconSize: [20, 20] }), zIndexOffset: 1500 }).addTo(map);
        } else meRef.current.setLatLng(p);
        map.flyTo(p, 19);
        flash('📍 You are here!');
      },
      () => flash('Could not get your location (permission denied).'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
    return undefined;
  };

  const flyToZone = (z) => {
    setSelected(z.id);
    setPanelOpen(true);
    setQuery('');
    mapRef.current.flyTo(z.pos, 19, { duration: 0.9 });
  };

  const toggleFilter = (c) => setFilters((f) => {
    const n = new Set(f);
    if (n.has(c)) n.delete(c);
    else n.add(c);
    return n;
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) wrapRef.current.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const sel = selected ? zoneById[selected] : null;
  const selPhoto = sel ? zonePhoto(sel) : null;
  const hasSV = sel && !NO_STREETVIEW.has(sel.id);
  const showSV = media === 'sv' && hasSV && (!tour.active || tour.atStop);
  const searchHits = q ? ZONES.filter((z) => filters.has(z.cat) && matches(z)) : [];
  const curStopIdx = tour.atStop ? tour.stop : Math.min(tour.stop + 1, TOUR_STOPS.length - 1);
  const curStop = zoneById[TOUR_STOPS[curStopIdx]];
  const tourIdx = sel ? TOUR_STOPS.indexOf(sel.id) : -1;
  const walkedKm = (tour.dist / 1000).toFixed(2);

  return (
    <div className={`zm ${night ? 'zm-night' : ''} ${zoom >= 18 ? 'zm-labels' : ''} base-${base}`} ref={wrapRef} style={{ height }}>
      <div ref={elRef} className="zm-leaflet" aria-label="Real map of Bangladesh National Zoo" />
      {base === 'google' && (
        <iframe
          key={sel ? sel.id : 'zoo'}
          className="zm-google"
          title="Bangladesh National Zoo on Google Maps"
          src={googleMapEmbed(sel ? sel.pos : [23.8133, 90.3452], sel ? 19 : 17)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      )}

      <div className="zm-top-left">
        <div className="zm-search">
          <span aria-hidden>🔍</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: Tiger / বাঘ…" aria-label="Search the zoo map" />
          {query && <button onClick={() => setQuery('')} aria-label="Clear search">✕</button>}
        </div>
        {searchHits.length > 0 && (
          <ul className="zm-results">
            {searchHits.slice(0, 7).map((z) => (
              <li key={z.id}><button onClick={() => flyToZone(z)}><span>{z.emoji}</span> {z.name} <small>{z.bn}</small></button></li>
            ))}
          </ul>
        )}
        {q && searchHits.length === 0 && <div className="zm-results zm-empty">No match for “{query}”.</div>}
        <div className="zm-chips">
          {Object.entries(CATEGORIES).map(([k, c]) => (
            <button key={k} className={`zm-chip ${filters.has(k) ? 'on' : ''}`} style={{ '--c': c.color }} onClick={() => toggleFilter(k)}>
              <i /> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="zm-tools">
        <div className="zm-mode" role="group" aria-label="Map style">
          <button className={base === 'satellite' ? 'on' : ''} onClick={() => setBase('satellite')}>🛰️ <span className="zm-mode-label">Satellite</span></button>
          <button className={base === 'street' ? 'on' : ''} onClick={() => setBase('street')}>🗺️ <span className="zm-mode-label">Map</span></button>
          <button className={base === 'google' ? 'on' : ''} onClick={() => { pauseTour(); setBase('google'); }} title="Google Maps view">
            <b className="g-logo">G</b> <span className="zm-mode-label">Google</span>
          </button>
        </div>
        <div className={`zm-btn-col ${base === 'google' ? 'zm-hide' : ''}`}>
          <button title="Zoom in" onClick={() => mapRef.current.zoomIn()}>＋</button>
          <button title="Zoom out" onClick={() => mapRef.current.zoomOut()}>－</button>
          <button title="Show the whole zoo" onClick={() => mapRef.current.flyToBounds(zooBounds(), { padding: [24, 24] })}>⤢</button>
          <button title="Where am I? (for visitors inside the zoo)" onClick={locate}>◎</button>
          <button title={night ? 'Day view' : 'Night view'} onClick={() => setNight((n) => !n)}>{night ? '☀️' : '🌙'}</button>
          <button title={sound ? 'Mute nature sounds' : 'Play nature sounds'} onClick={() => setSound((s) => !s)}>{sound ? '🔊' : '🔈'}</button>
          <button title="Full screen" onClick={toggleFullscreen}>⛶</button>
        </div>
      </div>

      {sel && panelOpen && (
        <aside className={`zm-panel ${tour.active ? 'wide' : ''}`} aria-live="polite">
          <button className="zm-panel-close" onClick={() => setPanelOpen(false)} aria-label="Close">✕</button>
          <div className="zm-media" onPointerDown={() => tour.playing && showSV && pauseTour()}>
            {showSV ? (
              <iframe
                key={`sv-${sel.id}`}
                className="zm-sv"
                title={`360° Street View — ${sel.name}`}
                src={streetViewEmbed(sel.pos)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : selPhoto ? (
              <figure className="zm-panel-photo">
                <img key={selPhoto.src} src={selPhoto.src} alt={sel.name} loading="lazy" />
                <figcaption>
                  {selPhoto.atZoo ? '📍 Taken at this zoo · ' : ''}Photo: {selPhoto.author} · {selPhoto.license}
                </figcaption>
              </figure>
            ) : (
              <div className="zm-media-empty" style={{ '--c': CATEGORIES[sel.cat].color }}>{sel.emoji}</div>
            )}
            {tour.active && !tour.atStop && <span className="zm-media-tag">🚶 Walking to…</span>}
            {(hasSV || selPhoto) && (
              <div className="zm-media-tabs" role="tablist">
                {selPhoto && <button className={!showSV ? 'on' : ''} onClick={() => setMedia('photo')}>📷 Photo</button>}
                {hasSV && <button className={showSV ? 'on' : ''} onClick={() => setMedia('sv')}>🌐 360° Street View</button>}
              </div>
            )}
          </div>
          <div className="zm-panel-head" style={{ '--c': CATEGORIES[sel.cat].color }}>
            <span className="zm-panel-emoji">{sel.emoji}</span>
            <div>
              <small>{CATEGORIES[sel.cat].label}</small>
              <h3>{sel.name}</h3>
              <span className="bn">{sel.bn}</span>
            </div>
          </div>
          <p>{sel.desc}</p>
          {sel.animals.length > 0 && (
            <ul className="zm-animals">
              {sel.animals.map((a) => animalById[a]).filter(Boolean).map((a) => (
                <li key={a.id}>
                  {a.photo ? <img src={PHOTOS[a.photo].src} alt="" loading="lazy" /> : <span>{a.emoji}</span>}
                  <div><b>{a.name}</b> <em className="bn">{a.bn}</em><small>{a.fact}</small></div>
                </li>
              ))}
            </ul>
          )}
          <div className="zm-panel-actions">
            <a className="zm-act" href={directionsUrl(sel.pos)} target="_blank" rel="noreferrer">🧭 Directions</a>
            <a className="zm-act ghost" href={gmapsPlaceUrl(sel.pos)} target="_blank" rel="noreferrer">Google Maps ↗</a>
            {tourIdx >= 0 && !tour.playing && <button className="zm-act alt" onClick={() => startTour(tourIdx)}>🚶 Walk from here</button>}
          </div>
        </aside>
      )}

      <div className={`zm-tour ${tour.active ? 'active' : ''} ${base === 'google' && !tour.active ? 'zm-hide' : ''}`}>
        {!tour.active ? (
          <button className="zm-tour-start" onClick={() => startTour()}>
            🚶 Start Virtual Walk
            <small>Follow the real roads · {TOUR_STOPS.length - 1} stops · {(route.total / 1000).toFixed(1)} km</small>
          </button>
        ) : (
          <>
            <div className="zm-tour-info">
              <small>{tour.atStop ? 'You are at' : 'Walking to'}</small>
              <b>{curStop.emoji} {curStop.name}</b>
              <div className="zm-progress"><i style={{ width: `${(tour.dist / route.total) * 100}%` }} /></div>
              <small>Stop {tour.stop + 1} of {TOUR_STOPS.length} · {walkedKm} km walked</small>
            </div>
            <div className="zm-tour-btns">
              <button onClick={() => jumpStop(-1)} title="Previous stop">⏮</button>
              {tour.playing
                ? <button onClick={pauseTour} title="Pause" className="big">⏸</button>
                : <button onClick={() => startTour()} title="Continue" className="big">▶</button>}
              <button onClick={() => jumpStop(1)} title="Next stop">⏭</button>
              <button onClick={exitTour} title="End walk">✕</button>
            </div>
          </>
        )}
      </div>

      {hint && !tour.active && !sel && (
        <div className="zm-hint">Drag to explore · Scroll or pinch to zoom · Tap a pin to learn more</div>
      )}
      {toast && <div className="zm-toast" role="status">{toast}</div>}
      <a className="zm-gmaps" href={ZOO_INFO.googleMaps} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
    </div>
  );
}
