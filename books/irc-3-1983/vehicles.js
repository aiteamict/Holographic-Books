// The design vehicles of IRC : 3-1983, as data and as a 3-D hologram rig.
// Numbers: Table (cl. 6.3), axle limits cl. 6.1–6.2, lengths cl. 5.3, width cl. 5.1, height cl. 5.2.
import * as THREE from 'three';
import * as holo from '@engine/holo.js';

// axle kinds: s = single axle, single tyres · d = single axle, dual tyres · t = tandem pair, 8 tyres
export const LIMIT = { s: 6, d: 10.2, t: 18 };
export const KIND_NAME = { s: 'single axle, single tyres', d: 'single axle, dual tyres', t: 'tandem axle, 8 tyres' };
// the book's colour code: the same on the holograms, the pages and the Table
export const INK = { s: 0x2a6d68, d: 0xc97a10, t: 0x6a4a8c, body: 0x262b31, over: holo.RED };
export const CSS = { s: '#2a6d68', d: '#c97a10', t: '#6a4a8c', over: '#c23b2f', ink: '#1f2328', dim: '#5c6168' };

export const WIDTH = 2.5, HEIGHT = 3.8;                                  // m, cl. 5.1, 5.2
export const MAXLEN = { rigid: 11, semi: 16, trailer: 18 };              // m, cl. 5.3.1, 5.3.3, 5.3.4

/** The Table, row by row. truck/trailer list axle kinds front to back. */
export const TYPES = [
  { id: '2s', code: '2', name: 'Type 2, single tyres', form: 'rigid', truck: ['s', 's'], gross: 12 },
  { id: '2', code: '2', name: 'Type 2, dual rear tyres', form: 'rigid', truck: ['s', 'd'], gross: 16.2 },
  { id: '3', code: '3', name: 'Type 3', form: 'rigid', truck: ['s', 't'], gross: 24 },
  { id: '2-S1', code: '2-S1', name: 'Type 2-S1', form: 'semi', truck: ['s', 'd'], trailer: ['d'], gross: 26.4 },
  { id: '2-S2', code: '2-S2', name: 'Type 2-S2', form: 'semi', truck: ['s', 'd'], trailer: ['t'], gross: 34.2 },
  { id: '3-S1', code: '3-S1', name: 'Type 3-S1', form: 'semi', truck: ['s', 't'], trailer: ['d'], gross: 34.2 },
  { id: '3-S2', code: '3-S2', name: 'Type 3-S2', form: 'semi', truck: ['s', 't'], trailer: ['t'], gross: 42 },
  { id: '2-2', code: '2-2', name: 'Type 2-2', form: 'trailer', truck: ['s', 'd'], trailer: ['d', 'd'], gross: 36.6 },
  { id: '3-2', code: '3-2', name: 'Type 3-2', form: 'trailer', truck: ['s', 't'], trailer: ['d', 'd'], gross: 44.4 },
  { id: '2-3', code: '2-3', name: 'Type 2-3', form: 'trailer', truck: ['s', 'd'], trailer: ['d', 't'], gross: 44.4 },
  { id: '3-3', code: '3-3', name: 'Type 3-3', form: 'trailer', truck: ['s', 't'], trailer: ['d', 't'], gross: 52.2 },
];
export const FORM_NAME = { rigid: 'single unit truck', semi: 'truck-tractor + semi-trailer', trailer: 'truck-trailer combination' };

/**
 * Side layout in metres from the front bumper, drawn at the longest length the standard allows for the form.
 * Tandem axles are 1.3 m apart (inside the 1.2–2.5 m of cl. 3.8).
 */
export function layout(T) {
  const L = MAXLEN[T.form], units = [], groups = [];
  const put = (kind, x, unit) => groups.push({ kind, unit, x, xs: kind === 't' ? [x - .65, x + .65] : [x], limit: LIMIT[kind] });
  if (T.form === 'rigid') {
    units.push({ part: 'truck', cab: [0, 2.3], body: [2.5, L] });
    put(T.truck[0], 1.4, 'truck'); put(T.truck[1], L - 2.6, 'truck');
  } else if (T.form === 'semi') {
    units.push({ part: 'truck', cab: [0, 2.3], frame: [0, 6.2] }, { part: 'trailer', body: [4.2, L], low: true });
    put(T.truck[0], 1.4, 'truck'); put(T.truck[1], 4.9, 'truck'); put(T.trailer[0], L - 2.1, 'trailer');
  } else {
    units.push({ part: 'truck', cab: [0, 2.3], body: [2.5, 8.6] }, { part: 'bar', bar: [8.6, 9.8] }, { part: 'trailer', body: [9.8, L] });
    put(T.truck[0], 1.4, 'truck'); put(T.truck[1], 6.8, 'truck'); put(T.trailer[0], 11.3, 'trailer'); put(T.trailer[1], L - 1.7, 'trailer');
  }
  return { L, units, groups };
}

/**
 * The vehicle as a hologram, side-on along x, front at -x, centred on x = 0, wheels on y = 0, width along z.
 * s = world cm per real metre. Returns { group, groups: [{ kind, wx (world x), wheels: [meshes] }], L, parts }.
 */
export function makeRig(T, s) {
  const { L, units, groups } = layout(T), g = new THREE.Group(), X = m => (m - L / 2) * s, hw = WIDTH / 2;
  const parts = { truck: new THREE.Group(), trailer: new THREE.Group() }; g.add(parts.truck, parts.trailer);
  const box = (x0, x1, y0, y1, w = WIDTH, fill = .06) => { const b = holo.wireBox((x1 - x0) * s, (y1 - y0) * s, w * s, INK.body, { fill, width: .06 }); b.position.set(X((x0 + x1) / 2), (y0 + y1) / 2 * s, 0); return b; };
  for (const u of units) {
    const into = parts[u.part === 'bar' ? 'trailer' : u.part];
    if (u.cab) {
      into.add(box(u.cab[0], u.cab[1], 1.0, 3.05, WIDTH, .1));
      const glass = holo.wireBox(.05 * s, .75 * s, (WIDTH - .3) * s, holo.CYAN, { fill: .18, width: .04 }); glass.position.set(X(u.cab[0]) - .01, 2.5 * s, 0); into.add(glass);
    }
    if (u.frame) into.add(box(u.frame[0], u.frame[1], 1.05, 1.35, 1.0, .1));
    if (u.body) into.add(box(u.body[0], u.body[1], u.low ? 1.35 : 1.15, 3.6, WIDTH, .05));
    if (u.bar) into.add(box(u.bar[0], u.bar[1], .8, .95, .15, .2));
  }
  const out = [];
  for (const a of groups) {
    const wheels = [];
    for (const xm of a.xs) for (const side of [-1, 1]) {
      const tw = a.kind === 's' ? .3 : .62;                                  // dual tyres: twice the tread
      const w = holo.wireCyl(.5 * s, tw * s, INK[a.kind], 14, { fill: .16, width: .07 });
      w.rotation.x = Math.PI / 2; w.position.set(X(xm), .5 * s, side * (hw - tw / 2) * s);
      w.userData.axle = out.length; parts[a.unit].add(w); wheels.push(w);
    }
    const shaft = holo.segments(a.xs.flatMap(xm => [[X(xm), .5 * s, -hw * s], [X(xm), .5 * s, hw * s]]), INK[a.kind], .8, { width: .06 });
    parts[a.unit].add(shaft);
    out.push({ ...a, wx: X(a.x), wxs: a.xs.map(X), wheels });
  }
  g.userData.rig = true;
  return { group: g, groups: out, L, parts, X };
}

/** Flat silhouette of a vehicle on a 2-D canvas, like the Fig. of the standard. x0,y0 = front bumper at ground. */
export function drawSilhouette(ctx, T, x0, y0, pxPerM, { ink = CSS.ink, wheelInk = true, lw = 3 } = {}) {
  const { units, groups } = layout(T), X = m => x0 + m * pxPerM, Y = m => y0 - m * pxPerM;
  ctx.save(); ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.lineJoin = 'round';
  for (const u of units) {
    if (u.cab) { ctx.beginPath(); ctx.moveTo(X(u.cab[0]), Y(1)); ctx.lineTo(X(u.cab[0]), Y(2.4)); ctx.lineTo(X(u.cab[0] + .5), Y(3.05)); ctx.lineTo(X(u.cab[1]), Y(3.05)); ctx.lineTo(X(u.cab[1]), Y(1)); ctx.closePath(); ctx.stroke(); }
    if (u.frame) ctx.strokeRect(X(u.frame[0]), Y(1.35), (u.frame[1] - u.frame[0]) * pxPerM, .3 * pxPerM);
    if (u.body) ctx.strokeRect(X(u.body[0]), Y(3.6), (u.body[1] - u.body[0]) * pxPerM, (3.6 - (u.low ? 1.35 : 1.15)) * pxPerM);
    if (u.bar) { ctx.beginPath(); ctx.moveTo(X(u.bar[0]), Y(.9)); ctx.lineTo(X(u.bar[1]), Y(.9)); ctx.stroke(); }
  }
  for (const a of groups) for (const xm of a.xs) {
    ctx.beginPath(); ctx.arc(X(xm), Y(.5), .5 * pxPerM, 0, Math.PI * 2);
    ctx.fillStyle = '#fbf8f1'; ctx.fill(); ctx.strokeStyle = wheelInk ? CSS[a.kind] : ink; ctx.lineWidth = a.kind === 's' ? lw : lw * 1.7; ctx.stroke();
  }
  ctx.restore();
}
