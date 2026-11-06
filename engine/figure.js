// The scale figure and the surveyor, shared by every book. Every prop takes `s` = world cm per real metre.
import * as THREE from 'three';
import * as holo from './holo.js';

export const FIGURE_H = 1.7;   // m, an adult for scale

/**
 * A standing person for scale: 1.7 m. A solid, stylised site surveyor (work blues, hi-vis band, white helmet) rather
 * than a wire mannequin, so he reads as a person beside the solid sign. The right arm reaches toward the staff.
 */
export function figure(s, color = holo.CYAN) {
  const f = { height: FIGURE_H }, g = new THREE.Group(); g.userData.prop = 'figure';
  const cloth = new THREE.MeshStandardMaterial({ color: 0x2b4a5e, roughness: .85 }), vis = new THREE.MeshStandardMaterial({ color: 0xffa24a, roughness: .6, emissive: 0x663300, emissiveIntensity: .35 });
  const skin = new THREE.MeshStandardMaterial({ color: 0x9a6a4a, roughness: .7 }), hat = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: .4 });
  const add = (geo, mat, x, y, z, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x * s, y * s, z * s); m.rotation.z = rz; m.castShadow = true; g.add(m); return m; };
  const cap = (r, l) => new THREE.CapsuleGeometry(r * s, l * s, 4, 10);
  add(cap(.085, .72), cloth, -.11, .46, 0); add(cap(.085, .72), cloth, .11, .46, 0);              // legs
  add(cap(.17, .42), cloth, 0, 1.17, 0);                                                            // torso
  add(new THREE.CylinderGeometry(.19 * s, .2 * s, .26 * s, 14), vis, 0, 1.2, 0);                    // hi-vis band
  add(cap(.055, .56), cloth, -.26, 1.12, 0, .12);                                                   // left arm hanging
  add(cap(.055, .56), cloth, .33, 1.18, .08, -.42);                                                 // right arm out to the staff
  add(new THREE.SphereGeometry(.11 * s, 14, 10), skin, 0, f.height - .14, 0);                        // head
  add(new THREE.SphereGeometry(.13 * s, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), hat, 0, f.height - .14, 0);   // helmet
  add(new THREE.CylinderGeometry(.16 * s, .16 * s, .012 * s, 16), hat, 0, f.height - .14, .01);     // brim
  return g;
}

/**
 * The procedural surveyor: the scale figure holding a 4 m levelling staff in red-and-white E-pattern bands.
 * opts.staffOnly returns just the staff (held position) for the glb hero.
 */
export function surveyor(s, { staff = true, staffOnly = false, staffH = 1.5, color = holo.CYAN } = {}) {
  const g = staffOnly ? new THREE.Group() : figure(s, color); g.userData.prop = 'surveyor';
  if (staff) {
    const H = staffH, x = .42, z = .12;   // collapsed at 1.5 m when carried; extended to 4 m when he is measuring
    const pole = holo.wireCyl(.035 * s, H * s, holo.AMBER, 8, { fill: .18 }); pole.position.set(x * s, H / 2 * s, z * s); g.add(pole);
    const ticks = []; for (let i = 0; i <= H * 2; i++) { const y = i * .5 * s; ticks.push([(x - .09) * s, y, z * s], [(x + .09) * s, y, z * s]); }
    g.add(holo.segments(ticks, holo.WHITE, .9, { width: .06 }));
    if (H >= 3) { const tag = holo.label('levelling staff · 4 m', { h: .22 * s, color: '#ffc98a' }); tag.position.set(x * s, (H + .25) * s, z * s); g.add(tag); }
  }
  return g;
}

