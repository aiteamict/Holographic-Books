// The IRC 38 site kit: a diorama slab standing on the page, a properly marked road built along any plan polyline, cars,
// survey crew and a theodolite. Everything is solid (MeshStandardMaterial); the curve geometry stays as hologram lines
// drawn by plan.js on top. Plan metres map to page cm through the P() a spread passes in.
// Vehicles and people are drawn larger than the road scale (VEH, CREW) so they read on a page-sized model.
import * as THREE from 'three';
import { SM } from '@engine/scene.js';

const std = (color, roughness = .85, metalness = 0, flat = false) => new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: flat });
export const MAT = {
  grass: std(0x93ad73, .95), earth: std(0x8b6d4c, .95), rim: std(0x6f5439, .95),
  leaf: std(0x5d8a4c, .9, 0, true), leaf2: std(0x6f9a52, .9, 0, true), trunk: std(0x6b4f35, .9),
  stone: std(0xf3f0e8, .55), band: std(0x2a2e33, .6), vest: std(0xf0862a, .6), skin: std(0xb4835f, .7),
  hat: std(0xf2c230, .45), trousers: std(0x34404c, .8), metal: std(0x9aa3ab, .35, .6), instrument: std(0xe2c13a, .5),
  tape: new THREE.MeshBasicMaterial({ color: 0xe8b53a, toneMapped: false }), glass: std(0x1d2830, .15, .2), tyre: std(0x1b1c1e, .9),
};
export const VEH = 2.4, CREW = 9;   // size multipliers over the road scale

/** A diorama slab on the page: grass top, earth sides. Bounds in page cm; top at height h. */
export function diorama({ x0 = -12.6, x1 = 12.6, z0 = -15.5, z1 = 7.5, h = .5 } = {}) {
  const g = new THREE.Group(), w = x1 - x0, d = z1 - z0;
  const slab = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [MAT.earth, MAT.earth, MAT.grass, MAT.earth, MAT.earth, MAT.earth]);
  slab.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2); slab.receiveShadow = true; slab.castShadow = true; g.add(slab);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(w + .12, .08, d + .12), MAT.rim); rim.position.set((x0 + x1) / 2, .04, (z0 + z1) / 2); g.add(rim);
  g.userData = { x0, x1, z0, z1, h };
  return g;
}

/** Trees scattered on the slab; userData.hide(fn) hides those for which fn(x, z) is true (e.g. too near the road). */
export function trees(slab, n = 34, seed = 7) {
  const { x0, x1, z0, z1, h } = slab.userData, g = new THREE.Group(), list = [];
  let r = seed; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const cone = new THREE.ConeGeometry(1, 2.2, 7), trunkG = new THREE.CylinderGeometry(.09, .12, .5, 6), ball = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < n; i++) {
    const x = x0 + .6 + rnd() * (x1 - x0 - 1.2), z = z0 + .6 + rnd() * (z1 - z0 - 1.2), k = .32 + rnd() * .3, t = new THREE.Group();
    const trunk = new THREE.Mesh(trunkG, MAT.trunk); trunk.position.y = .25; t.add(trunk);
    const top = new THREE.Mesh(rnd() < .55 ? cone : ball, rnd() < .5 ? MAT.leaf : MAT.leaf2); top.position.y = 1.2; top.castShadow = true; t.add(top);
    t.scale.setScalar(k); t.position.set(x, h, z); t.rotation.y = rnd() * 6; g.add(t); list.push(t);
  }
  g.userData.hide = fn => { for (const t of list) t.visible = !fn(t.position.x, t.position.z); };
  return g;
}

/** Cumulative distances of a plan polyline, and a sampler: at(d) → { x, y, h (heading), i }. */
export function track(pts) {
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = d => {
    d = Math.max(0, Math.min(cum.at(-1), d)); let lo = 1, hi = cum.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < d) lo = m + 1; else hi = m; }
    const a = pts[lo - 1], b = pts[lo], f = (d - cum[lo - 1]) / Math.max(1e-9, cum[lo] - cum[lo - 1]);
    return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, h: Math.atan2(b[1] - a[1], b[0] - a[0]), i: lo };
  };
  return { pts, cum, length: cum.at(-1), at };
}

/** The road path for a curve layout L (curve.js), its straights run out to the slab's edge. Returns { pts, e1, e2 }:
 *  e1 is the distance from the path's start to T.P. b: slab bounds in page cm. */
export function throughSlab(L, P, b, margin = .3) {
  const toEdge = (from, dir) => { let t = 0; for (; t < 600; t += 2) { const q = P([from[0] + dir[0] * t, from[1] + dir[1] * t]); if (q.x < b.x0 + margin || q.x > b.x1 - margin || q.z < b.z0 + margin || q.z > b.z1 - margin) break; } return Math.max(0, t - 2); };
  const u1 = L.u1, u2 = [u1[0], -u1[1]], e1 = toEdge(L.TP, [-u1[0], -u1[1]]), e2 = toEdge(L.PT, u2);
  return { pts: [[L.TP[0] - u1[0] * e1, L.TP[1] - u1[1] * e1], ...L.pts, [L.PT[0] + u2[0] * e2, L.PT[1] + u2[1] * e2]], e1, e2 };
}

function mergeTwo(a, b) {
  const pa = a.attributes.position.array, pb = b.attributes.position.array, n = pa.length / 3;
  const pos = new Float32Array(pa.length + pb.length); pos.set(pa); pos.set(pb, pa.length);
  const ia = a.index.array, ib = b.index.array, idx = new Uint32Array(ia.length + ib.length); idx.set(ia); for (let i = 0; i < ib.length; i++) idx[ia.length + i] = ib[i] + n;
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals(); return g;
}

/**
 * A two-lane road with shoulders, edge lines, a dashed centre line and guard stones. P(xy, lift) maps plan metres to the
 * page; s is cm per metre (markings are kept at least ~0.4 mm wide on the page). set(pts, { stones: [d0, d1], side })
 * rebuilds it; stones go every 10 m between distances d0 and d1 on the outside of the bend (side ±1 = left/right).
 */
export function makeRoad(P, s, { lane = 3.5, shoulder = 1.6 } = {}) {
  const g = new THREE.Group();
  const meshes = { asphalt: new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt), shoulder: new THREE.Mesh(new THREE.BufferGeometry(), SM.shoulder),
    edge: new THREE.Mesh(new THREE.BufferGeometry(), SM.paint), dash: new THREE.Mesh(new THREE.BufferGeometry(), SM.paint) };
  for (const m of Object.values(meshes)) { m.receiveShadow = true; g.add(m); }
  const stones = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), MAT.stone, 120); stones.castShadow = true; stones.count = 0; g.add(stones);
  const lw = Math.max(.18, .045 / s), hw = lane, dummy = new THREE.Object3D();
  const api = { group: g, set, track: null, lane };

  function set(pts, { stones: span = null, side = 1 } = {}) {
    const T = track(pts);
    const N = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1; return [-dy / m, dx / m]; });
    // a band between lateral offsets a..b metres (left positive), over distance ranges [[d0, d1], ...]
    const strip = (a, b, lift, ranges = [[0, T.length]]) => {
      const pos = [], idx = []; let v = 0;
      for (const [d0, d1] of ranges) {
        const n = Math.max(1, Math.ceil((d1 - d0) / 2));
        for (let k = 0; k <= n; k++) {
          const d = d0 + (d1 - d0) * k / n, p = T.at(d), nn = N[Math.min(p.i, N.length - 1)];
          const hi = Math.max(a, b), lo = Math.min(a, b);   // left edge first, so the faces point up
          const A = P([p.x + nn[0] * hi, p.y + nn[1] * hi], lift), B = P([p.x + nn[0] * lo, p.y + nn[1] * lo], lift); pos.push(A.x, A.y, A.z, B.x, B.y, B.z);
          if (k) idx.push(v - 2, v - 1, v, v - 1, v + 1, v); v += 2;
        }
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
    };
    const swap = (m, geo) => { m.geometry.dispose(); m.geometry = geo; };
    swap(meshes.asphalt, strip(-hw, hw, .012));
    swap(meshes.shoulder, mergeTwo(strip(hw, hw + shoulder, .008), strip(-hw - shoulder, -hw, .008)));
    swap(meshes.edge, mergeTwo(strip(hw - lw * 1.4, hw - lw * .4, .02), strip(-hw + lw * .4, -hw + lw * 1.4, .02)));
    const dashes = []; for (let d = 2; d < T.length - 6; d += 9) dashes.push([d, d + 4.5]);
    swap(meshes.dash, strip(-lw / 2, lw / 2, .02, dashes));
    let c = 0;   // guard stones on the outside of the bend
    if (span) for (let d = span[0]; d <= span[1] && c < 120; d += 10) {
      const p = T.at(d), nn = N[Math.min(p.i, N.length - 1)], o = side * (hw + shoulder + .6), q = P([p.x + nn[0] * o, p.y + nn[1] * o], 0);
      dummy.scale.set(Math.max(.5 * s, .06), Math.max(1.2 * s, .16), Math.max(.5 * s, .06)); dummy.position.copy(q); dummy.position.y += dummy.scale.y / 2; dummy.rotation.y = p.h; dummy.updateMatrix(); stones.setMatrixAt(c++, dummy.matrix);
    }
    stones.count = c; stones.instanceMatrix.needsUpdate = true;
    api.track = T; return T;
  }
  return api;
}

/** A small saloon in metres, nose along +x, scaled by k (page cm per metre × VEH). userData.body rolls for sway. */
export function car(k, color = 0x24557a) {
  const g = new THREE.Group(), inner = new THREE.Group(); inner.scale.setScalar(k); g.add(inner);
  const paint = std(color, .4, .25);
  const box = (w, h, d, m, x, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, 0); b.castShadow = true; inner.add(b); return b; };
  box(4.2, .75, 1.74, paint, 0, .62); box(2.1, .55, 1.56, paint, -.25, 1.25); box(2.16, .42, 1.6, MAT.glass, -.25, 1.24);
  for (const x of [1.35, -1.3]) for (const z of [-.8, .8]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .22, 14), MAT.tyre); w.rotation.x = Math.PI / 2; w.position.set(x, .33, z); inner.add(w); }
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(.06, .16, 1.4), new THREE.MeshBasicMaterial({ color: 0xfff1c4, toneMapped: false })); lamp.position.set(2.11, .7, 0); inner.add(lamp);
  g.userData.body = inner; return g;
}

/** A survey hand in a hi-vis vest and hard hat, metres, scaled by k. */
export function worker(k, { vest = MAT.vest } = {}) {
  const g = new THREE.Group(), b = new THREE.Group(); b.scale.setScalar(k); g.add(b);
  const part = (geo, m, y, x = 0, z = 0) => { const p = new THREE.Mesh(geo, m); p.position.set(x, y, z); p.castShadow = true; b.add(p); return p; };
  part(new THREE.CylinderGeometry(.11, .1, .8, 8), MAT.trousers, .4, 0, -.11); part(new THREE.CylinderGeometry(.11, .1, .8, 8), MAT.trousers, .4, 0, .11);
  part(new THREE.CylinderGeometry(.21, .19, .66, 10), vest, 1.12);
  part(new THREE.SphereGeometry(.13, 12, 10), MAT.skin, 1.6);
  part(new THREE.SphereGeometry(.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), MAT.hat, 1.66);
  part(new THREE.CylinderGeometry(.05, .045, .62, 6), vest, 1.1, 0, -.27); part(new THREE.CylinderGeometry(.05, .045, .62, 6), vest, 1.1, 0, .27);
  return g;
}

/** A theodolite on its tripod, metres, scaled by k. userData.head.rotation.y aims it. */
export function theodolite(k) {
  const g = new THREE.Group(), b = new THREE.Group(); b.scale.setScalar(k); g.add(b);
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, leg = new THREE.Mesh(new THREE.CylinderGeometry(.02, .025, 1.45, 6), MAT.metal); leg.position.set(Math.cos(a) * .28, .7, Math.sin(a) * .28); leg.rotation.set(Math.sin(a) * .2, 0, -Math.cos(a) * .2); b.add(leg); }
  const head = new THREE.Group(); head.position.y = 1.42; b.add(head);
  const body = new THREE.Mesh(new THREE.BoxGeometry(.2, .26, .16), MAT.instrument); body.position.y = .13; body.castShadow = true; head.add(body);
  const scope = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, .34, 10), MAT.band); scope.rotation.z = Math.PI / 2; scope.position.y = .22; head.add(scope);
  g.userData.head = head; return g;
}
