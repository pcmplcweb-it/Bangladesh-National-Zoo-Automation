import { TOUR_STOPS, TOUR_WAYPOINTS, zoneById } from '../data/zoo';

// Builds one smooth walking route through every tour stop (Catmull-Rom → cubic Bézier).
export function buildTour() {
  const pts = [];
  const stopPointIndex = [];
  TOUR_STOPS.forEach((id, i) => {
    const z = zoneById[id];
    stopPointIndex.push(pts.length);
    pts.push([z.x, z.y + 22]); // walkway runs just in front of each zone
    const next = TOUR_STOPS[i + 1];
    if (next) (TOUR_WAYPOINTS[`${id}>${next}`] || []).forEach((w) => pts.push(w));
  });

  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    segs.push(`C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`);
  }
  const start = `M ${pts[0][0]} ${pts[0][1]}`;
  const d = `${start} ${segs.join(' ')}`;
  // prefix path for each stop, used to measure where along the route each stop lies
  const prefixes = stopPointIndex.map((pi) => (pi === 0 ? null : `${start} ${segs.slice(0, pi).join(' ')}`));
  return { d, prefixes };
}

export function measureStops(prefixes) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden';
  const p = document.createElementNS(NS, 'path');
  svg.appendChild(p);
  document.body.appendChild(svg);
  const lens = prefixes.map((d) => {
    if (!d) return 0;
    p.setAttribute('d', d);
    return p.getTotalLength();
  });
  svg.remove();
  return lens;
}
