// Synthesised zoo ambience (breeze, birdsong, the odd distant roar) — no audio files needed.
let ctx = null;
let master = null;
let timers = [];

function noiseBuffer(ac) {
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02; // brown-ish noise
    data[i] = last * 3.5;
  }
  return buf;
}

function chirp() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const notes = 2 + Math.floor(Math.random() * 4);
  const base = 2200 + Math.random() * 1800;
  const pan = ctx.createStereoPanner();
  pan.pan.value = Math.random() * 2 - 1;
  pan.connect(master);
  for (let i = 0; i < notes; i++) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const s = t + i * (0.09 + Math.random() * 0.05);
    o.type = 'sine';
    o.frequency.setValueAtTime(base, s);
    o.frequency.exponentialRampToValueAtTime(base * (0.6 + Math.random() * 0.9), s + 0.08);
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(0.05, s + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.1);
    o.connect(g).connect(pan);
    o.start(s);
    o.stop(s + 0.12);
  }
}

function roar() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(110, t);
  o.frequency.linearRampToValueAtTime(70, t + 1.6);
  f.type = 'lowpass';
  f.frequency.value = 380;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.06, t + 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
  o.connect(f).connect(g).connect(master);
  o.start(t);
  o.stop(t + 1.9);
}

function loop(fn, min, max) {
  const id = setTimeout(() => {
    fn();
    loop(fn, min, max);
  }, min + Math.random() * (max - min));
  timers.push(id);
}

export function startAmbience() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.7;
  master.connect(ctx.destination);

  const wind = ctx.createBufferSource();
  wind.buffer = noiseBuffer(ctx);
  wind.loop = true;
  const wf = ctx.createBiquadFilter();
  wf.type = 'lowpass';
  wf.frequency.value = 500;
  const wg = ctx.createGain();
  wg.gain.value = 0.12;
  wind.connect(wf).connect(wg).connect(master);
  wind.start();

  loop(chirp, 600, 2600);
  loop(roar, 14000, 30000);
}

export function stopAmbience() {
  timers.forEach(clearTimeout);
  timers = [];
  if (ctx) ctx.close();
  ctx = null;
  master = null;
}
