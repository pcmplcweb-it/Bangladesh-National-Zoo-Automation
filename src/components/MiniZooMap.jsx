import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZONES, CATEGORIES, zoneById } from '../data/zoo';
import { TILES, zooBounds, addZooFrame, zoneIcon } from './mapLayers';

const TOUR = ['tiger', 'northlake', 'giraffe', 'elephant', 'southlake', 'gate'];

// A small, non-interactive live satellite view of the zoo that slowly flies between highlights.
export default function MiniZooMap({ onStop }) {
  const ref = useRef(null);
  useEffect(() => {
    const map = L.map(ref.current, {
      zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false,
      doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false, zoomSnap: 0.25,
    });
    L.tileLayer(TILES.satellite.url, TILES.satellite.options).addTo(map);
    addZooFrame(map, { maskOpacity: 0.55, labels: false });
    ZONES.filter((z) => ['animal', 'attraction'].includes(z.cat) || z.id === 'gate').forEach((z) => {
      L.marker(z.pos, { icon: zoneIcon(z, CATEGORIES[z.cat].color), interactive: false }).addTo(map);
    });
    map.fitBounds(zooBounds(), { padding: [6, 6] });

    let i = 0;
    const timer = setInterval(() => {
      const z = zoneById[TOUR[i % TOUR.length]];
      if (i % (TOUR.length + 1) === TOUR.length) {
        map.flyToBounds(zooBounds(), { padding: [6, 6], duration: 2 });
        onStop?.(null);
      } else {
        map.flyTo(z.pos, 18, { duration: 2 });
        onStop?.(z);
      }
      i++;
    }, 4200);
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(ref.current);
    return () => {
      clearInterval(timer);
      ro.disconnect();
      map.remove();
    };
  }, [onStop]);
  return <div ref={ref} className="mini-map" aria-hidden />;
}
