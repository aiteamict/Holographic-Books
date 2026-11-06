// Hologram props built from primitives only. Every prop takes `s` = world cm per real metre, so the same car works on a
// 1:12 plan and a 1:11 section. Real sizes live in SPEC.props with their source.
import * as THREE from 'three';
import * as holo from '@engine/holo.js';
import { SPEC } from './sign/spec.js';
export { figure, surveyor } from '@engine/figure.js';

const P = () => SPEC.props;

/** A small 1960s saloon, nose toward +z. `nose: true` builds only the front 1.6 m (for close-ups). */
export function car(s, { color = holo.CYAN, nose = false } = {}) {
  const c = P().car, g = new THREE.Group(); g.userData.prop = 'car';
  const L = nose ? 1.6 : c.length, W = c.width, H = c.height, wh = c.wheel;
  const body = holo.wireBox(W * s, (H * .5) * s, L * s, color, { fill: .07 }); body.position.set(0, (wh + H * .25) * s, (nose ? (c.length / 2 - L / 2) : 0) * s); g.add(body);
  if (!nose) { const cabin = holo.wireBox(W * .82 * s, H * .48 * s, L * .46 * s, color, { fill: .07 }); cabin.position.set(0, (wh + H * .5 + H * .22) * s, -L * .06 * s); g.add(cabin); }
  const zs = nose ? [c.length / 2 - .6] : [L * .32, -L * .32];
  for (const z of zs) for (const x of [-W / 2, W / 2]) { const w = holo.wireCyl(wh * s, .2 * s, color, 14, { fill: .05 }); w.rotation.z = Math.PI / 2; w.position.set(x * s, wh * s, z * s); g.add(w); }
  g.userData.headlamps = [-W * .36, W * .36].map(x => new THREE.Vector3(x * s, (wh + H * .42) * s, (c.length / 2) * s));
  for (const p of g.userData.headlamps) { const b = new THREE.Mesh(new THREE.SphereGeometry(.12 * s, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfff3cc, toneMapped: false })); b.position.copy(p); g.add(b); }
  return g;
}

/** A roadside tree: trunk + icosahedral canopy. */
export function tree(s, h = 6, color = holo.DIM) {
  const g = new THREE.Group();
  const t = holo.wireCyl(.15 * s, h * .45 * s, color, 8, { fill: 0 }); t.position.y = h * .225 * s; g.add(t);
  const c = holo.wire(new THREE.IcosahedronGeometry(h * .3 * s, 0), color, { fill: .05, angle: 10 }); c.position.y = h * .7 * s; g.add(c);
  return g;
}

/** A kerb stone run along z: 150 mm high, 300 mm wide (SPEC.props.kerb). */
export function kerb(s, length, color = holo.CYAN) {
  const k = P().kerb, g = holo.wireBox(k.width * s, k.height * s, length, color, { fill: .08 });
  g.position.y = k.height * s / 2; return g;
}

/**
 * A length of two-lane carriageway along z, centred on x = 0: edge lines, dashed centre line, faint surface.
 * opts: width (m), length (cm), kerbs (bool), centre (dashed line)
 */
export function road(s, { width = P().carriageway.width, length = 40, kerbs = false, centre = true, color = holo.CYAN } = {}) {
  const g = new THREE.Group(), hw = width * s / 2, hl = length / 2;
  g.add(holo.segments([[-hw, 0, -hl], [-hw, 0, hl], [hw, 0, -hl], [hw, 0, hl]], color, .9, { width: .1 }));
  if (centre) g.add(holo.polyline([[0, 0, -hl], [0, 0, hl]], color, { opacity: .4, width: .05, dashed: true }));
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(width * s, length), holo.glassMat(color, { opacity: .025, scan: 0 })); surf.rotation.x = -Math.PI / 2; surf.position.y = .01; g.add(surf);
  if (kerbs) for (const x of [-1, 1]) { const k = kerb(s, length, color); k.position.x = x * (hw + P().kerb.width * s / 2); g.add(k); }
  return g;
}

/** A short cut of 75 × 75 × 10 mm T-iron (Plate 2), standing, h in real metres. */
export function tIronSection(s, h = .3, color = holo.AMBER) {
  const t = P().tIron, g = new THREE.Group(); g.userData.prop = 'tIron';
  const flange = holo.wireBox(t.w * s, h * s, t.t * s, color, { fill: .12 }); flange.position.z = (t.w - t.t) * s / 2; g.add(flange);
  const web = holo.wireBox(t.t * s, h * s, (t.w - t.t) * s, color, { fill: .12 }); web.position.z = -t.t * s / 2; g.add(web);
  g.children.forEach(c => c.position.y += h * s / 2);
  return g;
}

/** The blank 450 × 600 × 1.6 mm steel sheet the sign is painted on, as a hologram slab (S = cm per mm). */
export function steelPlate(S, color = holo.DIM) {
  const p = SPEC.plate;
  return holo.wireBox(p.w * S, p.h * S, 1.6 * S * 10, color, { fill: .05, width: .05 });
}
