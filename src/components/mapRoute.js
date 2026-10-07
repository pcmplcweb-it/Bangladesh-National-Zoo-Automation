import { ZOO_GEO } from '../data/zooGeo';
import { TOUR_STOPS, zoneById } from '../data/zoo';

const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;
export function meters(a, b) {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Graph of the zoo's real internal roads (OpenStreetMap).
function buildGraph() {
  const key = (p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
  const nodes = new Map(); // key -> {p, edges: Map(key -> dist)}
  const add = (p) => {
    const k = key(p);
    if (!nodes.has(k)) nodes.set(k, { p, edges: new Map() });
    return k;
  };
  ZOO_GEO.roads.forEach((line) => {
    for (let i = 0; i < line.length - 1; i++) {
      const a = add(line[i]);
      const b = add(line[i + 1]);
      if (a === b) continue;
      const d = meters(line[i], line[i + 1]);
      nodes.get(a).edges.set(b, d);
      nodes.get(b).edges.set(a, d);
    }
  });
  return nodes;
}

function nearestNode(nodes, p) {
  let best = null;
  let bestD = Infinity;
  nodes.forEach((n, k) => {
    const d = meters(n.p, p);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  });
  return best;
}

function shortestPath(nodes, from, to) {
  if (from === to) return [from];
  const dist = new Map([[from, 0]]);
  const prev = new Map();
  const open = new Set([from]);
  while (open.size) {
    let u = null;
    let ud = Infinity;
    open.forEach((k) => {
      const d = dist.get(k);
      if (d < ud) {
        ud = d;
        u = k;
      }
    });
    open.delete(u);
    if (u === to) break;
    nodes.get(u).edges.forEach((w, v) => {
      const nd = ud + w;
      if (nd < (dist.get(v) ?? Infinity)) {
        dist.set(v, nd);
        prev.set(v, u);
        open.add(v);
      }
    });
  }
  const path = [to];
  while (path[0] !== from) {
    const p = prev.get(path[0]);
    if (!p) return [from, to];
    path.unshift(p);
  }
  return path;
}

// One continuous walking route through all tour stops, following the real roads.
export function buildTourRoute() {
  const nodes = buildGraph();
  const latlngs = [];
  const stopIndex = [];
  const push = (p) => {
    const last = latlngs[latlngs.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) latlngs.push(p);
  };
  TOUR_STOPS.forEach((id, i) => {
    const z = zoneById[id];
    push(z.pos);
    stopIndex.push(latlngs.length - 1);
    const next = TOUR_STOPS[i + 1];
    if (!next) return;
    const a = nearestNode(nodes, z.pos);
    const b = nearestNode(nodes, zoneById[next].pos);
    shortestPath(nodes, a, b).forEach((k) => push(nodes.get(k).p));
  });
  const cum = [0];
  for (let i = 1; i < latlngs.length; i++) cum.push(cum[i - 1] + meters(latlngs[i - 1], latlngs[i]));
  return { latlngs, stopIndex, cum, stopDist: stopIndex.map((i) => cum[i]), total: cum[cum.length - 1] };
}

// Position along the route at a given distance (metres).
export function pointAt(route, d) {
  const { latlngs, cum } = route;
  if (d <= 0) return { p: latlngs[0], i: 0 };
  let lo = 0;
  let hi = cum.length - 1;
  if (d >= cum[hi]) return { p: latlngs[hi], i: hi };
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= d) lo = mid;
    else hi = mid;
  }
  const t = (d - cum[lo]) / (cum[hi] - cum[lo] || 1);
  const a = latlngs[lo];
  const b = latlngs[hi];
  return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], i: lo, heading: b[1] - a[1] };
}
