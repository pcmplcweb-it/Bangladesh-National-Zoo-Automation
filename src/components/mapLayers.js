import L from 'leaflet';
import { ZOO_GEO } from '../data/zooGeo';

export const TILES = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: { maxNativeZoom: 19, maxZoom: 20, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' },
  },
  street: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { maxNativeZoom: 19, maxZoom: 20, attribution: 'Map tiles © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  },
};

export const OSM_ATTRIBUTION = 'Zoo data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const WORLD = [[-89, -179], [-89, 179], [89, 179], [89, -179]];

export const zooBounds = () => L.latLngBounds(ZOO_GEO.boundary);

// Dims everything outside the zoo and draws the real boundary wall.
export function addZooFrame(map, { maskOpacity = 0.62, labels = true } = {}) {
  const group = L.layerGroup();
  L.polygon([WORLD, ZOO_GEO.boundary], {
    stroke: false, fillColor: '#04190c', fillOpacity: maskOpacity, interactive: false,
  }).addTo(group);
  L.polygon(ZOO_GEO.boundary, { color: '#c9ff8a', weight: 10, opacity: 0.18, fill: false, interactive: false }).addTo(group);
  L.polygon(ZOO_GEO.boundary, { color: '#ffe08a', weight: 2.5, dashArray: '8 6', fill: false, interactive: false }).addTo(group);

  ZOO_GEO.lakes.forEach((lake) => {
    const poly = L.polygon(lake.pts, { color: '#9be2ff', weight: 1.5, opacity: 0.8, fillColor: '#5ec8ff', fillOpacity: 0.1, interactive: false });
    poly.addTo(group);
    if (labels) {
      L.tooltip({ permanent: true, direction: 'center', className: 'zm-lake-label', interactive: false })
        .setLatLng(poly.getBounds().getCenter())
        .setContent(lake.name === 'North Lake' ? 'North Lake · উত্তর লেক' : 'South Lake · দক্ষিণ লেক')
        .addTo(group);
    }
  });
  return group.addTo(map);
}

export function addEnclosures(map) {
  const group = L.layerGroup();
  ZOO_GEO.enclosures.forEach((e) => {
    L.polygon(e.pts, { color: '#ffb36b', weight: 1.5, opacity: 0.9, fillColor: '#ffb36b', fillOpacity: 0.12 })
      .bindTooltip(e.name.replace(/ cage$/i, '').replace(/ Cage$/, ''), { sticky: true, className: 'zm-tip' })
      .addTo(group);
  });
  ZOO_GEO.roads.forEach((r) => {
    L.polyline(r, { color: '#f6e3b4', weight: 4, opacity: 0.55, interactive: false }).addTo(group);
  });
  return group.addTo(map);
}

export function zoneIcon(zone, color, selected = false) {
  return L.divIcon({
    className: 'zm-marker',
    html: `<div class="zm-pin${selected ? ' sel' : ''}" style="--c:${color}"><span>${zone.emoji}</span></div><div class="zm-pin-label">${zone.name}</div>`,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
  });
}
