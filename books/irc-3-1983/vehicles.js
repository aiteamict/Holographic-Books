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
// shared materials for the solid model (built once): painted cab, steel, rubber, glass; rims carry the axle colour code
const std = (color, roughness = .6, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
const MAT = {
  cab: std(0xe8e1d2, .45, .08), stripe: std(0x23395b, .5), glass: std(0x1d2a35, .15, .5), grille: std(0x2a2d31, .5, .4),
  chassis: std(0x2a2d31, .75), steel: std(0x8e979e, .35, .7), bumper: std(0x3b3f45, .4, .5), tyre: std(0x1a1b1d, .92),
  box: std(0xb8c1c7, .6, .1), rib: std(0xa3adb4, .55, .15), tarp: std(0x7d7650, .85), wood: std(0x86663f, .8),
  head: new THREE.MeshBasicMaterial({ color: 0xfff3cc, toneMapped: false }), tail: std(0xb3271d, .4, 0, { emissive: 0x5a0d08 }),
  rim: { s: std(INK.s, .4, .4), d: std(INK.d, .4, .4), t: std(INK.t, .4, .4) },
};

/**
 * The vehicle as a solid model, side-on along x, front at -x, centred on x = 0, wheels on y = 0, width along z.
 * Built in metres inside a group scaled to s (world cm per real metre). Wheel rims are coloured by axle kind.
 * Returns { group, groups: [{ kind, wx (world x), wheels: [groups] }], L, parts, X }.
 */
export function makeRig(T, s) {
  const { L, units, groups } = layout(T), g = new THREE.Group(), X = m => (m - L / 2) * s, hw = WIDTH / 2;
  const inner = new THREE.Group(); inner.scale.setScalar(s); g.add(inner);
  const parts = { truck: new THREE.Group(), trailer: new THREE.Group() }; inner.add(parts.truck, parts.trailer);
  const x = m => m - L / 2;                                        // metres from the front bumper → local x
  const mesh = (geo, mat, px, py, pz, into) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.castShadow = true; m.receiveShadow = true; into.add(m); return m; };
  const box = (x0, x1, y0, y1, w, mat, into, z = 0) => mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, w), mat, x((x0 + x1) / 2), (y0 + y1) / 2, z, into);
  const rails = (x0, x1, into) => { for (const z of [-.45, .45]) box(x0, x1, .84, 1.06, .12, MAT.chassis, into, z); };
  const ribbedBox = (x0, x1, y0, y1, mat, into) => {                // a goods body with vertical stiffening ribs and a top rail
    box(x0, x1, y0, y1, WIDTH, mat, into);
    for (let r = x0 + .35; r < x1 - .2; r += .7) box(r - .03, r + .03, y0 + .05, y1 - .05, WIDTH + .04, MAT.rib, into);
    box(x0, x1, y1 - .06, y1, WIDTH + .05, MAT.rib, into);
    for (const z of [-.95, .95]) box(x1 - .02, x1 + .01, .95, 1.12, .22, MAT.tail, into, z);   // tail lamps
  };
  function cab(c0, into) {                                         // a flat-fronted goods-vehicle cab, sloped windscreen
    const sh = new THREE.Shape([[0, 1.0], [0, 2.15], [.45, 3.0], [2.3, 3.0], [2.3, 1.0]].map(([px, py]) => new THREE.Vector2(px, py)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: WIDTH - .1, bevelEnabled: false }); geo.translate(0, 0, -(WIDTH - .1) / 2);
    mesh(geo, MAT.cab, x(c0), 0, 0, into);
    const ws = mesh(new THREE.BoxGeometry(.04, .86, WIDTH - .3), MAT.glass, x(c0 + .21), 2.6, 0, into); ws.rotation.z = -.487;   // windscreen on the slope
    box(c0 + .75, c0 + 1.75, 2.2, 2.85, WIDTH - .06, MAT.glass, into);                         // side windows, both doors
    box(c0, c0 + 2.3, 1.82, 1.94, WIDTH - .06, MAT.stripe, into);                              // a painted stripe
    box(c0 - .03, c0 + .01, 1.15, 1.75, 1.6, MAT.grille, into);                                // grille
    box(c0 - .12, c0 + .12, .62, .9, WIDTH, MAT.bumper, into);                                 // bumper
    for (const z of [-.85, .85]) { const h = mesh(new THREE.CylinderGeometry(.11, .11, .05, 16), MAT.head, x(c0 - .03), 1.3, z, into); h.rotation.z = Math.PI / 2; }
    for (const z of [-1, 1]) { box(c0 + .25, c0 + .3, 2.35, 2.75, .2, MAT.bumper, into, z * 1.38); box(c0 + .25, c0 + .3, 2.5, 2.54, .25, MAT.steel, into, z * 1.24); }   // mirrors on arms
    const tank = mesh(new THREE.CylinderGeometry(.28, .28, .9, 16), MAT.steel, x(c0 + 2.75), .78, -1.0, into); tank.rotation.z = Math.PI / 2;   // fuel tank
  }
  for (const u of units) {
    const into = parts[u.part === 'bar' ? 'trailer' : u.part];
    if (u.part === 'truck') { cab(u.cab[0], into); rails(.2, (u.body || u.frame)[1] - .1, into); }
    if (u.frame) { const fw = mesh(new THREE.CylinderGeometry(.5, .5, .1, 20), MAT.steel, x(4.75), 1.12, 0, into); fw.receiveShadow = true; }   // fifth wheel under the kingpin
    if (u.body && u.part === 'truck') ribbedBox(u.body[0], u.body[1], 1.15, 3.6, MAT.box, into);
    if (u.body && u.part === 'trailer') {
      if (u.low) {                                                 // semi-trailer: a container on its own frame, landing legs, underride bar
        rails(u.body[0] + .3, u.body[1] - .1, into); ribbedBox(u.body[0], u.body[1], 1.35, 3.6, MAT.box, into);
        for (const z of [-.9, .9]) { box(6.4, 6.52, .12, 1.32, .12, MAT.chassis, into, z); box(6.3, 6.62, 0, .12, .3, MAT.chassis, into, z); }
        box(u.body[1] - .15, u.body[1] - .05, .45, .6, WIDTH - .2, MAT.bumper, into);
      } else {                                                     // full trailer: a tarpaulin-covered body on its own frame
        rails(u.body[0] + .1, u.body[1] - .1, into);
        box(u.body[0], u.body[1], 1.15, 1.8, WIDTH, MAT.wood, into);
        box(u.body[0] + .05, u.body[1] - .05, 1.8, 3.55, WIDTH - .06, MAT.tarp, into);
        for (const z of [-.95, .95]) box(u.body[1] - .02, u.body[1] + .01, .95, 1.12, .22, MAT.tail, into, z);
      }
    }
    if (u.bar) for (const z of [-.5, .5]) {                         // A-frame drawbar from the truck's tow hitch to the trailer
      const len = Math.hypot(u.bar[1] - u.bar[0] + 1.4, z), bar = mesh(new THREE.BoxGeometry(len, .1, .1), MAT.chassis, x((u.bar[0] + u.bar[1] + 1.4) / 2), .9, z / 2, into);
      bar.rotation.y = Math.atan2(z, u.bar[1] - u.bar[0] + 1.4);
    }
  }
  const out = [];
  for (const a of groups) {
    const wheels = [];
    for (const xm of a.xs) for (const side of [-1, 1]) {
      const dual = a.kind !== 's', tw = dual ? .62 : .3;           // dual tyres: two tyres side by side
      const w = new THREE.Group(); w.rotation.x = Math.PI / 2; w.position.set(x(xm), .5, side * (hw - tw / 2));
      const tyres = dual ? [-.165, .165] : [0];
      for (const o of tyres) { const t = mesh(new THREE.CylinderGeometry(.5, .5, dual ? .28 : .3, 24), MAT.tyre, 0, o, 0, w); t.castShadow = true; }
      mesh(new THREE.CylinderGeometry(.3, .3, tw + .02, 18), MAT.rim[a.kind], 0, 0, 0, w);       // the rim, in the axle's colour
      mesh(new THREE.CylinderGeometry(.11, .11, tw + .05, 10), MAT.steel, 0, 0, 0, w);         // hub
      w.userData.axle = out.length; parts[a.unit].add(w); wheels.push(w);
    }
    for (const xm of a.xs) { const sh = mesh(new THREE.CylinderGeometry(.06, .06, WIDTH - .4, 8), MAT.chassis, x(xm), .5, 0, parts[a.unit]); sh.rotation.x = Math.PI / 2; }   // axle beam
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
