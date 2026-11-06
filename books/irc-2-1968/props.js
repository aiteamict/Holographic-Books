// Hologram props built from primitives only. Every prop takes `s` = world cm per real metre, so the same car works on a
// 1:12 plan and a 1:11 section. Real sizes live in SPEC.props with their source.
import * as THREE from 'three';
import * as holo from '@engine/holo.js';
import { SPEC } from './sign/spec.js';
export { figure, surveyor } from '@engine/figure.js';

const P = () => SPEC.props;

// solid materials for the real-world props (built once)
const MAT = {
  paint: new THREE.MeshStandardMaterial({ color: 0xd9d1bd, roughness: .4, metalness: .15 }), glass: new THREE.MeshStandardMaterial({ color: 0x223140, roughness: .1, metalness: .5 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xb8bec4, roughness: .25, metalness: .8 }), tyre: new THREE.MeshStandardMaterial({ color: 0x1a1b1d, roughness: .9 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0xc9c4b8, roughness: .85 }), lamp: new THREE.MeshBasicMaterial({ color: 0xfff3cc, toneMapped: false }),
};

/** A small 1960s saloon, solid, nose toward +z. `nose: true` builds only the front 1.6 m (for close-ups). */
export function car(s, { nose = false } = {}) {
  const c = P().car, g = new THREE.Group(); g.userData.prop = 'car';
  const L = nose ? 1.6 : c.length, W = c.width, H = c.height, wh = c.wheel, z0 = (nose ? (c.length / 2 - L / 2) : 0);
  const box = (w, h, l, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w * s, h * s, l * s), mat); m.position.set(x * s, y * s, z * s); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  box(W, H * .42, L, MAT.paint, 0, wh + H * .14, z0);                                       // body
  if (!nose) {
    box(W * .84, H * .34, L * .46, MAT.paint, 0, wh + H * .52, -L * .05);                     // cabin
    box(W * .86, H * .22, L * .42, MAT.glass, 0, wh + H * .52, -L * .05);                     // window band, all round
    box(W * .9, H * .1, .12, MAT.chrome, 0, wh + H * .02, -L / 2);                            // rear bumper
  }
  box(W * .9, H * .1, .12, MAT.chrome, 0, wh + H * .02, z0 + L / 2);                          // front bumper
  const zs = nose ? [c.length / 2 - .6] : [L * .32, -L * .32];
  for (const z of zs) for (const x of [-W / 2, W / 2]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(wh * s, wh * s, .2 * s, 18), MAT.tyre); w.rotation.z = Math.PI / 2; w.position.set(x * s, wh * s, z * s); w.castShadow = true; g.add(w); }
  g.userData.headlamps = [-W * .36, W * .36].map(x => new THREE.Vector3(x * s, (wh + H * .2) * s, (c.length / 2 + .01) * s));
  for (const p of g.userData.headlamps) { const b = new THREE.Mesh(new THREE.SphereGeometry(.12 * s, 10, 10), MAT.lamp); b.position.copy(p); g.add(b); }
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
export function kerb(s, length) {
  const k = P().kerb, g = new THREE.Mesh(new THREE.BoxGeometry(k.width * s, k.height * s, length), MAT.concrete);   // solid concrete kerb
  g.castShadow = true; g.receiveShadow = true; g.position.y = k.height * s / 2; return g;
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
