import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZONES, CATEGORIES, toLatLng, boundaryLatLngs } from '../data/zoo';

const WORLD = [[-90, -180], [-90, 180], [90, 180], [90, -180]];

function FitZoo({ ring }) {
  const map = useMap();
  useEffect(() => {
    const b = L.latLngBounds(ring);
    map.fitBounds(b, { padding: [20, 20] });
    map.setMaxBounds(b.pad(0.35));
  }, [map, ring]);
  return null;
}

export default function SatelliteMap({ selected, onSelect, filters }) {
  const ring = useMemo(() => boundaryLatLngs(), []);

  return (
    <MapContainer
      center={toLatLng(600, 480)}
      zoom={17}
      minZoom={16}
      maxZoom={19}
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Imagery &copy; Esri"
        maxZoom={19}
      />
      <FitZoo ring={ring} />
      {/* dim everything outside the zoo so only the zoo grounds stand out */}
      <Polygon positions={[WORLD, ring]} pathOptions={{ color: '#000', weight: 0, fillOpacity: 0.55 }} />
      <Polygon positions={ring} pathOptions={{ color: '#ffd166', weight: 3, dashArray: '8 6', fill: false }} />
      {ZONES.filter((z) => filters.has(z.cat)).map((z) => {
        const icon = L.divIcon({
          className: `zm-leaf-pin ${selected === z.id ? 'sel' : ''}`,
          html: `<span style="--c:${CATEGORIES[z.cat].color}">${z.emoji}</span>`,
          iconSize: [36, 36],
        });
        return (
          <Marker
            key={`${z.id}-${selected === z.id}`}
            position={toLatLng(z.x, z.y)}
            icon={icon}
            eventHandlers={{ click: () => onSelect(z.id) }}
          >
            <Tooltip direction="top" offset={[0, -16]}>{z.name}</Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
