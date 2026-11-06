// Spread 1 · Why a design vehicle? (cl. 1.1)
// A real truck on a real road, with five numbers floating over it: width, height, length, axle load, gross weight.
// Tap one and the road element it decides comes in around the truck: the lane lights up, a bridge beam comes down, a
// curve is traced ahead, the pavement layers are measured, the road tilts into a gradient.
import * as THREE from 'three';
import { tagged } from '@engine/util.js';
import { makeGuide } from '@engine/guide.js';
import { TYPES, INK, makeRig } from '../vehicles.js';
import { road, SM, LAYERS } from '../scene.js';

const S = 1.0, GY = 2.4, LZ = 1.75, T3 = TYPES.find(t => t.id === '3');
const HIT = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const KEYS = [
  { key: 'width', label: 'Width', badge: 'WIDTH 2.5 m', road: 'lane and shoulder widths', cl: 'The width of the design vehicle bears on the width of traffic lanes and shoulders (cl. 1.1).' },
  { key: 'height', label: 'Height', badge: 'HEIGHT 3.8 m', road: 'clearance under overhead structures', cl: 'Its height sets the clearance under bridges, electric service lines and other overhead structures (cl. 1.1).' },
  { key: 'length', label: 'Length', badge: 'LENGTH 11 m', road: 'curves, passing and overtaking', cl: 'Its overall length is used for horizontal and vertical curves and for the rules on passing and overtaking (cl. 1.1).' },
  { key: 'axle', label: 'Axle load', badge: 'AXLE 18 t', road: 'thickness of pavement', cl: 'The axle load affects the design of the thickness of pavement (cl. 1.1).' },
  { key: 'gross', label: 'Gross weight', badge: 'GROSS 24 t', road: 'limiting gradients', cl: 'The total weight of the vehicle governs limiting gradients (cl. 1.1).' },
];

export default {
  cam: { pos: [2.5, 30, 42], look: [2.5, 5, 0], portrait: { pos: [15, 58, 56], look: [12.3, 2, 1] } },
  shots: [
    { pos: [13, 14, 26], look: [13, 7, 0], dur: 1.8, hold: 2.6, text: 'Five numbers describe the design vehicle. Each one decides a different part of the road.' },
  ],
  build(ctx) {
    const { holo, ui, camera } = ctx;
    const group = new THREE.Group(), root = new THREE.Group(); group.add(root);
    // road on a cut-away of its pavement layers
    let y = GY; const k = GY / LAYERS.reduce((a, l) => a + l[1], 0);
    for (const [name, t, col] of LAYERS) { const b = holo.wireBox(22, t * k, 10, col, { fill: .14, width: .04, opacity: .6 }); b.position.set(0, y - t * k / 2, 0); root.add(b); const l = holo.label(name, { h: .5, color: '#5c6168' }); l.position.set(-9.6, y - t * k / 2, 5.1); root.add(l); y -= t * k; }
    const rd = road(S, { len: 22 }); rd.position.y = GY; root.add(rd);
    const rig = makeRig(T3, S); rig.group.position.set(0, GY, LZ); root.add(rig.group);
    const man = ctx.hero(S); man.position.set(8.4, GY, 4.4); man.rotation.y = -.5; root.add(man);
    const rearX = rig.groups[1].wx, frontX = -rig.L * S / 2, backX = rig.L * S / 2;

    // ---- the five road elements, each a group faded in when its number is chosen
    const E = {};
    { const g = new THREE.Group();                                   // width → lanes and shoulders
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(22, 3.5), new THREE.MeshBasicMaterial({ color: holo.GREEN, transparent: true, opacity: .22, depthWrite: false, toneMapped: false })); lane.material.userData.fade = true; lane.rotation.x = -Math.PI / 2; lane.position.set(0, GY + .08, LZ); g.add(lane);
      g.add(holo.dimension([backX + .6, GY + 4.2, LZ - 1.25], [backX + .6, GY + 4.2, LZ + 1.25], '2.5 m', { color: holo.AMBER, h: .9, tick: .35 }));
      g.add(holo.tag('lane and shoulder widths', [-6, GY + .1, LZ + 1.75], [-3, 3.4, 2], { accent: holo.GREEN, h: .75 })); E.width = g; }
    { const g = new THREE.Group(), beam = new THREE.Group(); g.add(beam);   // height → a bridge beam comes down
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 12), SM.concrete); b.position.set(frontX - 3.4, GY + 4.6 + .5, 0); b.castShadow = true; beam.add(b);
      for (const z of [-5.6]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.8, 4.6, .8), SM.concreteDark);   // a cantilever gantry: one pier on the far verge, so the beam reads from the reader’s side
      p.position.set(frontX - 3.4, GY + 2.3, z); p.castShadow = true; beam.add(p); }
      g.add(holo.dimension([frontX - .4, GY, LZ + 1.4], [frontX - .4, GY + 3.8, LZ + 1.4], '3.8 m', { color: holo.AMBER, h: .9, tick: .35 }));
      g.add(holo.tag('clearance under bridges and electric lines', [frontX - 3.4, GY + 5.6, 3], [3.4, 1.6, 0], { accent: holo.CYAN, h: .75 })); g.userData.beam = beam; E.height = g; }
    { const g = new THREE.Group(), pts = [];                         // length → a curve traced ahead
      for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI / 2; pts.push([frontX - 7 * Math.sin(a), GY + .12, LZ - 7 + 7 * Math.cos(a)]); }
      g.add(holo.polyline(pts, holo.AMBER, { width: .12, dashed: true }));
      g.add(holo.dimension([frontX, GY + 4.4, LZ], [backX, GY + 4.4, LZ], '11 m', { color: holo.AMBER, h: .9, tick: .35 }));
      g.add(holo.tag('curves · passing and overtaking', [frontX - 5, GY + .1, LZ - 2.6], [-1.5, 3.2, -1], { accent: holo.AMBER, h: .75 })); E.length = g; }
    { const g = new THREE.Group(), h = 18 * .3;                       // axle load → pavement thickness
      const col = holo.wireBox(2.1, h, 1.1, INK.t, { fill: .24, width: .07 }); col.position.set(rearX, GY + 4.6 + h / 2, LZ); g.add(col);
      const l = holo.label('18 t', { h: .95, color: '#6a4a8c', weight: 700 }); l.position.set(rearX, GY + 4.6 + h + .9, LZ); g.add(l);
      g.add(holo.dimension([10.6, 0, 5.2], [10.6, GY, 5.2], 'pavement thickness', { color: holo.AMBER, h: .75, tick: .35 })); E.axle = g; }
    { const g = new THREE.Group();                                   // gross weight → gradient (the whole road tilts too)
      g.add(holo.segments([[-10, GY + .1, -5.4], [10, GY + .1, -5.4], [-10, GY + .1, -5.4], [-10, GY + 1.7, -5.4]], holo.AMBER, .9, { width: .07 }));
      g.add(holo.tag('limiting gradient', [-10, GY + 1.7, -5.4], [2, 2.6, 0], { accent: holo.AMBER, h: .75 })); E.gross = g; }
    for (const key in E) { E[key].visible = false; E[key].userData.k = 0; root.add(E[key]); }

    // ---- the five numbers, as tappable badges floating over the truck
    const st = { sel: null }, badges = [];
    function drawBadges() {
      for (const b of badges) group.remove(b.g); badges.length = 0;
      KEYS.forEach((K, i) => {
        const on = st.sel === K.key, g = new THREE.Group(), tall = camera.aspect < 1;   // upright phones: two rows (3 + 2)
        const bx = tall ? (i < 3 ? -5.4 + i * 5.4 : -2.7 + (i - 3) * 5.4) : -10.4 + i * 5.2, by = tall && i < 3 ? GY + 11.2 : GY + 9.2;
        g.position.set(bx, by, 0); g.userData.by = by;
        const l = holo.label(K.badge, { h: .72, weight: 800, color: on ? '#ffffff' : '#1f2328', bg: on ? 'rgba(176,83,42,.95)' : 'rgba(255,253,248,.95)' }); g.add(l);
        const hit = new THREE.Mesh(new THREE.BoxGeometry(5, 2, 1.5), HIT); hit.userData.badge = K.key; g.add(hit);
        group.add(g); badges.push({ g, hit, key: K.key }); st.tall = tall;
      });
    }
    function select(key, say = true) {
      st.sel = key; drawBadges(); ui.refreshActions?.();
      const K = KEYS.find(k => k.key === key); if (K && say) ui.caption(K.cl, `${K.label} → ${K.road}`, 6500);
    }

    const api = {
      group,
      actions: KEYS.map(K => ({ label: K.label, run: () => select(K.key) })),
      tap(hit) { if (guide.tap(hit)) return; const b = tagged(hit.object, 'badge'); if (b) select(b.userData.badge); },
      a11y: KEYS.map(K => ({ label: `Show what ${K.label.toLowerCase()} decides`, run: () => select(K.key) })),
      enter() { if (!st.sel) setTimeout(() => select('width', false), 600); },
      update(dt, t) {
        for (const key in E) {
          const g = E[key], goal = st.sel === key ? 1 : 0; g.userData.k += (goal - g.userData.k) * Math.min(1, dt * 4);
          const kk = g.userData.k; g.visible = kk > .01; holo.setOpacity(g, kk);
          if (g.userData.beam) g.userData.beam.position.y = (1 - kk) * 9;
        }
        const tall = camera.aspect < 1;
        root.rotation.z = -.07 * E.gross.userData.k; root.rotation.y += ((tall ? -.5 : 0) - root.rotation.y) * Math.min(1, dt * 5);
        if (st.tall !== tall) drawBadges();
        for (const b of badges) b.g.position.y = b.g.userData.by + Math.sin(t * 1.6 + b.g.position.x) * .12;
        guide.card.position.x = tall ? -4.5 : -5.4; guide.card.scale.setScalar(tall ? .86 : 1);
      },
      reset() { select(null, false); guide.reset(); },
      get debug() { return { sel: st.sel, k: Object.fromEntries(Object.entries(E).map(([a, g]) => [a, +g.userData.k.toFixed(2)])), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Five numbers', show: KEYS.map(k => k.label),
          text: 'Every road element starts from a vehicle number. Tap one of the five over the truck, or a chip, to see the part of the road it decides.' },
        { title: 'Overhead', show: KEYS.map(k => k.label), enter: () => select('height', false),
          check: { q: 'The design vehicle is 3.8 m tall. A bridge over the road must give it…', options: ['exactly 3.8 m', 'more than 3.8 m', '2.5 m'], answer: 1, why: 'Height sets the clearance under bridges, electric lines and other overhead structures (cl. 1.1); the road must clear the tallest vehicle, with room to spare.' } },
        { title: 'Pavement', show: KEYS.map(k => k.label), enter: () => select('axle', false),
          check: { q: 'Which number decides how thick the pavement must be?', options: ['gross weight', 'axle load', 'length'], answer: 1, why: 'Axle load sets the thickness of pavement; the total weight governs limiting gradients (cl. 1.1).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);

    drawBadges();
    Object.defineProperty(api, 'targets', { get: () => [guide.card, ...badges.map(b => b.hit)] });
    return api;
  },
};
