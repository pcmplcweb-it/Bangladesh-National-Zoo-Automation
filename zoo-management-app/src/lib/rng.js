// Small deterministic RNG so demo data is the same on every reload (and on every machine).
export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed) {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export const between = (r, min, max) => min + Math.floor(r() * (max - min + 1));
// Roughly normal value (sum of uniforms).
export const gauss = (r, mean, sd) => mean + ((r() + r() + r() + r() - 2) / 0.816) * sd;
