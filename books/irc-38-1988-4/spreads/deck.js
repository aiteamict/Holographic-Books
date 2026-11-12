// Chapter 4 helpers: a road deck whose two edges are free functions of the distance along a plan track, so widening can
// grow and shrink along the curve. Offsets in metres, left of travel positive (the curves turn right, so left = outer).
import * as THREE from 'three';

/** Plan points offset sideways by off(d) metres from track T, every `step` metres. */
export function offsetPts(T, off, step = 1.5) {
  const n = Math.max(2, Math.ceil(T.length / step)), out = [];
  for (let k = 0; k <= n; k++) { const d = T.length * k / n, p = T.at(d), o = typeof off === 'function' ? off(d) : off; out.push([p.x - Math.sin(p.h) * o, p.y + Math.cos(p.h) * o]); }
  return out;
}

/** Page geometry of the band between offsets a(d) and b(d) along T, lifted `lift` above the ground. */
export function band(T, P, a, b, lift = .012, step = 1.5) {
  const n = Math.max(2, Math.ceil(T.length / step)), pos = [], idx = [];
  for (let k = 0; k <= n; k++) {
    const d = T.length * k / n, p = T.at(d), nx = -Math.sin(p.h), ny = Math.cos(p.h), A0 = a(d), B0 = b(d);
    const hi = Math.max(A0, B0), lo = Math.min(A0, B0);   // left edge first, so the faces point up
    const A = P([p.x + nx * hi, p.y + ny * hi], lift), B = P([p.x + nx * lo, p.y + ny * lo], lift);
    pos.push(A.x, A.y, A.z, B.x, B.y, B.z);
    if (k) { const v = 2 * k; idx.push(v - 2, v - 1, v, v - 1, v + 1, v); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

/** The longest run of plan points whose page position lies inside the slab b, and the distance along `pts` to its start. */
export function clipRun(pts, P, b, margin = .3) {
  const inside = p => { const q = P(p); return q.x > b.x0 + margin && q.x < b.x1 - margin && q.z > b.z0 + margin && q.z < b.z1 - margin; };
  let best = [0, -1], s = -1;
  for (let i = 0; i <= pts.length; i++) {
    const ok = i < pts.length && inside(pts[i]);
    if (ok && s < 0) s = i;
    if (!ok && s >= 0) { if (i - 1 - s > best[1] - best[0]) best = [s, i - 1]; s = -1; }
  }
  let off = 0; for (let i = 1; i <= best[0]; i++) off += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { pts: pts.slice(best[0], best[1] + 1), off };
}

export const swapGeo =(mesh, geo) => { mesh.geometry.dispose(); mesh.geometry = geo; };
