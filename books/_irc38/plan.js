// The curve drawn on the page as a live plan: a solid asphalt road along the alignment, the two straights produced to
// the apex, pegs at the named points, the centre and the dimensions. set(curve) redraws everything in place, so a spread
// can drag Δ, Rc or Ls every frame. Plan metres map to page centimetres by `s`; plan y (north) is page −z.
import * as THREE from 'three';
import * as holo from '@engine/holo.js';
import { SM } from '@engine/scene.js';
import { layout } from './curve.js';

const PEG = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .7 }), CAP = new THREE.MeshStandardMaterial({ color: 0xb0532a, roughness: .5 });

/** A survey peg with a painted cap and a name card above it. */
function peg(name, color = '#14202b') {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, 1, 8), PEG); post.position.y = .5; post.castShadow = true; g.add(post);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .18, 8), CAP); cap.position.y = 1.05; g.add(cap);
  const l = holo.label(name, { h: .72, color, bg: 'rgba(255,253,248,.94)', weight: 700 }); l.position.y = 1.85; g.add(l);
  g.userData.label = l; return g;
}

/**
 * opts: s (cm per m), origin [x, y, z] of the P.I. on the page, road (m wide), ext (straight beyond T.P./P.T., m),
 *       show: which extras to draw ({ tangents, centre, radii, ts, es, delta, spiral })
 */
export function makePlan({ s = .05, origin = [0, .15, -11], road = 7, ext = 40, show = {} } = {}) {
  const group = new THREE.Group(), O = new THREE.Vector3(...origin);
  const P = ([x, y], h = 0) => new THREE.Vector3(O.x + x * s, O.y + h, O.z - y * s);
  const opt = { tangents: true, centre: true, radii: true, ts: true, es: true, delta: true, spiral: true, ribbon: true, ...show };   // ribbon: false when the site kit draws the real road

  // asphalt ribbon with painted edges: rebuilt geometry, fixed materials
  const ribbon = new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt); ribbon.receiveShadow = true; group.add(ribbon);
  const line = (color, width) => holo.polyline([[0, 0, 0], [1, 0, 0]], color, { width, opacity: .95 });
  const edgeL = line(0xf3f0e6, .05), edgeR = line(0xf3f0e6, .05);
  const circ = line(holo.CYAN, .11), spirA = line(holo.AMBER, .11), spirB = line(holo.AMBER, .11);   // centre line: circle cyan, spirals amber
  group.add(edgeL, edgeR, circ, spirA, spirB);
  const tangents = holo.polyline([[0, 0, 0], [1, 0, 0], [2, 0, 0]], holo.DIM, { width: .05, dashed: true, opacity: .8 }); group.add(tangents);
  const radii = holo.segments([[0, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]], holo.DIM, .6, { width: .04, dashed: true }); group.add(radii);
  const centre = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 8), new THREE.MeshBasicMaterial({ color: holo.CYAN, toneMapped: false })); group.add(centre);
  const centreLab = holo.label('O', { h: .7, color: '#1d5f87' }); group.add(centreLab);
  const deltaArc = line(holo.RED, .07); group.add(deltaArc);
  const deltaLab = holo.label('Δ', { h: .9, color: '#c23b2f', weight: 700 }); group.add(deltaLab);
  const pegs = {}; for (const n of ['T.P.', 'P.T.', 'P.I.', 'C.T.', 'T.C.', 'C.C.T.']) { pegs[n] = peg(n); group.add(pegs[n]); }
  let tsDim = null, esDim = null, last = null;
  const dispose = g => g.traverse(o => { o.geometry?.dispose(); if (o.material?.map) o.material.map.dispose(); });

  function set(c) {
    last = c; const L = layout(c, Math.max(.5, c.length / 300));
    const u2 = [L.u1[0], -L.u1[1]];
    const pts = [[L.TP[0] - L.u1[0] * ext, L.TP[1] - L.u1[1] * ext], ...L.pts, [L.PT[0] + u2[0] * ext, L.PT[1] + u2[1] * ext]];
    // ribbon: offset each point along its normal
    const pos = [], idx = [], left = [], right = [], hw = road / 2;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
      const nx = -dy / m, ny = dx / m, l = P([pts[i][0] + nx * hw, pts[i][1] + ny * hw], .01), r = P([pts[i][0] - nx * hw, pts[i][1] - ny * hw], .01);
      pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
      left.push(P([pts[i][0] + nx * hw * .9, pts[i][1] + ny * hw * .9], .03)); right.push(P([pts[i][0] - nx * hw * .9, pts[i][1] - ny * hw * .9], .03));
      if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
    }
    ribbon.geometry.dispose(); ribbon.geometry = new THREE.BufferGeometry();
    ribbon.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ribbon.geometry.setIndex(idx); ribbon.geometry.computeVertexNormals();
    holo.setPoints(edgeL, left); holo.setPoints(edgeR, right);
    ribbon.visible = edgeL.visible = edgeR.visible = opt.ribbon;
    // centre line coloured by part
    const nSp = c.Ls > 0 ? L.pts.findIndex(p => Math.hypot(p[0] - L.CT[0], p[1] - L.CT[1]) < 1e-6) : 0;
    const lift = q => P(q, .06);
    if (c.Ls > 0) { holo.setPoints(spirA, L.pts.slice(0, nSp + 1).map(lift)); holo.setPoints(spirB, L.pts.slice(L.pts.length - 1 - nSp).map(lift)); }
    spirA.visible = spirB.visible = c.Ls > 0 && opt.spiral;
    const arc = c.Ls > 0 ? L.pts.slice(nSp, L.pts.length - nSp) : L.pts; circ.visible = arc.length > 1;
    if (arc.length > 1) holo.setPoints(circ, arc.map(lift));
    holo.setPoints(tangents, [P(L.TP, .05), P(L.PI, .05), P(L.PT, .05)]); tangents.visible = opt.tangents;
    holo.setPoints(radii, [P(L.O, .04), P(L.CT, .04), P(L.O, .04), P(L.TC, .04)]); radii.visible = opt.radii;
    centre.position.copy(P(L.O, .2)); centreLab.position.copy(P(L.O, 1)); centre.visible = centreLab.visible = opt.centre;
    // Δ: the arc at the apex between the first straight produced and the second straight
    const r = 3 / s, a0 = c.delta / 2, arcPts = []; for (let i = 0; i <= 24; i++) { const a = a0 - c.delta * i / 24; arcPts.push(P([r * Math.cos(a), r * Math.sin(a)], .05)); }
    holo.setPoints(deltaArc, arcPts); deltaLab.position.copy(P([r + 1.4 / s, 0], .3)); deltaArc.visible = deltaLab.visible = opt.delta;
    // pegs
    const put = (n, q, on) => { pegs[n].position.copy(P(q)); pegs[n].visible = on; };
    put('T.P.', L.TP, true); put('P.T.', L.PT, true); put('P.I.', L.PI, true);
    put('C.T.', L.CT, c.Ls > 0 && !c.throughout); put('T.C.', L.TC, c.Ls > 0 && !c.throughout); put('C.C.T.', L.mid, c.throughout);
    // dimensions: Ts along the first straight (offset outward), Es from the apex to the curve
    if (tsDim) { group.remove(tsDim); dispose(tsDim); tsDim = null; }
    if (esDim) { group.remove(esDim); dispose(esDim); esDim = null; }
    if (opt.ts) { tsDim = holo.dimension(P(L.TP, .1), P(L.PI, .1), `Ts ${c.Ts.toFixed(1)} m`, { color: holo.AMBER, h: .9, tick: .45, offset: [-Math.sin(c.delta / 2) * 2.4, 0, -Math.cos(c.delta / 2) * 2.4] }); group.add(tsDim); }
    if (opt.es) { esDim = holo.dimension(P(L.PI, .1), P(L.mid, .1), `Es ${c.Es.toFixed(1)} m`, { color: holo.GREEN, h: .9, tick: .45 }); esDim.children.at(-1).position.x += 2.6; group.add(esDim); }   // Es label sits right of the apex, clear of Ts
    api.L = L; api.path = pts;
  }
  const api = { group, set, P, pegs, get curve() { return last; }, L: null, opt };
  return api;
}
