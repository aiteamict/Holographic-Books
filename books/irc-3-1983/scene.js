// Solid scene props for the Design Vehicle book: road, overbridge, checkpost. Built in metres inside a group scaled to
// s (world cm per real metre), like the vehicles. Road runs along x; its width is along z.
import * as THREE from 'three';

const std = (color, roughness = .8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
export const SM = {
  asphalt: std(0x55585d, .95), shoulder: std(0x8d8a80, .95), paint: std(0xf3f0e6, .6), yellow: std(0xe2b53a, .55),
  concrete: std(0xcbc6ba, .85), concreteDark: std(0xa9a397, .9), steel: std(0x6c7680, .4, .6), red: std(0xb3271d, .5),
  white: std(0xf4f2ec, .5), glass: std(0x6d8796, .1, .3), roof: std(0x2a5c57, .6), verge: std(0x9fb08a, .95),
};

function scaled(s) { const g = new THREE.Group(), inner = new THREE.Group(); inner.scale.setScalar(s); g.add(inner); return { g, inner }; }
const add = (into, geo, mat, x, y, z, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.receiveShadow = true; m.castShadow = shadow; into.add(m); return m; };

/** A straight two-lane road with shoulders, edge lines and a dashed centre line. len, lane, shoulder in metres. */
export function road(s, { len = 24, lane = 3.5, shoulder = 1.5, verge = 0 } = {}) {
  const { g, inner } = scaled(s), W = lane * 2;
  add(inner, new THREE.BoxGeometry(len, .06, W), SM.asphalt, 0, .03, 0, false);
  for (const z of [-1, 1]) {
    add(inner, new THREE.BoxGeometry(len, .05, shoulder), SM.shoulder, 0, .025, z * (W / 2 + shoulder / 2), false);
    add(inner, new THREE.BoxGeometry(len, .065, .15), SM.paint, 0, .033, z * (W / 2 - .1), false);          // edge lines
    if (verge) add(inner, new THREE.BoxGeometry(len, .04, verge), SM.verge, 0, .02, z * (W / 2 + shoulder + verge / 2), false);
  }
  for (let x = -len / 2 + 1.5; x < len / 2 - 1; x += 6) add(inner, new THREE.BoxGeometry(3, .065, .12), SM.paint, x + 1.5, .033, 0, false);   // centre dashes
  g.userData.width = W + shoulder * 2;
  return g;
}

/** A concrete overbridge crossing the road at x = 0: deck along z on two piers. setClear(h) moves the deck soffit to h m. */
export function overbridge(s, { clear = 5, span = 14, depth = 2.2, deck = 1.1 } = {}) {
  const { g, inner } = scaled(s), deckG = new THREE.Group(); inner.add(deckG);
  add(deckG, new THREE.BoxGeometry(depth, deck, span + 2), SM.concrete, 0, deck / 2, 0);
  for (const x of [-1, 1]) add(deckG, new THREE.BoxGeometry(.25, .9, span + 2), SM.concreteDark, x * (depth / 2 - .12), deck + .45, 0);   // parapets
  const piers = [];
  for (const z of [-1, 1]) { const p = add(inner, new THREE.BoxGeometry(1.2, 1, 1.6), SM.concreteDark, 0, .5, z * span / 2); piers.push(p); }
  g.userData.setClear = h => { deckG.position.y = h; for (const p of piers) { p.scale.y = h; p.position.y = h / 2; } };
  g.userData.setClear(clear); g.userData.deck = deckG;
  return g;
}

/** The pavement layers, top to bottom: name, thickness (world cm), colour. */
export const LAYERS = [['surface', .45, 0x5a5f66], ['base', .85, 0x8a6d3b], ['sub-base', 1.0, 0x9c8a63], ['subgrade', .9, 0x7d8a6a]];

/** Checkpost: a booth, a striped barrier arm on a pivot (setOpen(0..1)), a height gantry with a 3.8 m bar. */
export function checkpost(s, { roadW = 10, gantryH = 3.8 } = {}) {
  const { g, inner } = scaled(s);
  const bz = -(roadW / 2 + 2.2);                                    // booth on the far verge
  add(inner, new THREE.BoxGeometry(2.6, 2.6, 2.4), SM.white, 0, 1.3, bz);
  add(inner, new THREE.BoxGeometry(2.0, 1.0, 2.42), SM.glass, 0, 1.75, bz);
  add(inner, new THREE.BoxGeometry(3.2, .25, 3.0), SM.roof, 0, 2.75, bz);
  const pivot = new THREE.Group(); pivot.position.set(1.8, 1.05, roadW / 2 + .6); inner.add(pivot);   // barrier: pivot post near side, arm across
  add(inner, new THREE.BoxGeometry(.4, 1.1, .4), SM.steel, 1.8, .55, roadW / 2 + .6);
  const armLen = roadW + .4;
  for (let i = 0; i < 8; i++) add(pivot, new THREE.BoxGeometry(.14, .14, armLen / 8), i % 2 ? SM.white : SM.red, 0, 0, -(i + .5) * armLen / 8);
  g.userData.setOpen = k => { pivot.rotation.x = -k * Math.PI * .47; };
  for (const z of [-1, 1]) add(inner, new THREE.BoxGeometry(.25, gantryH + .5, .25), SM.steel, -3, (gantryH + .5) / 2, z * (roadW / 2 + .3));   // height gantry
  add(inner, new THREE.BoxGeometry(.25, .25, roadW + .9), SM.steel, -3, gantryH + .5, 0);
  for (let i = 0; i < 10; i++) add(inner, new THREE.BoxGeometry(.18, .2, roadW / 10), i % 2 ? SM.yellow : SM.white, -3, gantryH + .1, -roadW / 2 + (i + .5) * roadW / 10, false);   // the 3.8 m bar
  return g;
}
