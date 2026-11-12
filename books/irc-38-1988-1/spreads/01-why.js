// Spread 1 · Why the road must turn (cl. 1.1, 1.2), as a site model. A road from A to B; drag the hill or the temple onto
// its line and the alignment bends round with a real circular curve (computed by the series geometry). Traffic keeps
// driving it.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { horizontalCurve, layout, deg } from '../../_irc38/curve.js';
import { diorama, trees, makeRoad, car, VEH } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', S = .105, GROUND = .5, O = new THREE.Vector3(0, GROUND, -4);   // plan origin: middle of A–B
const HALF = 115, CLEAR = 10;                                                                      // A and B at the slab's ends
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };

export default {
  cam: { pos: [3, 41, 37], look: [3.5, 0, -2], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const P = (xy, h = 0) => new THREE.Vector3(O.x + xy[0] * S, O.y + h, O.z - xy[1] * S);
    const st = { R: 60, d: 0, dTarget: 0, pix: 0, carD: [0, 90], curve: null };
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 42, 3); group.add(forest);
    const road = makeRoad(P, S); group.add(road.group);
    const centre = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.CYAN, { width: .08, opacity: .8 }); group.add(centre);
    group.add(holo.polyline([P([-HALF, 0], .05), P([HALF, 0], .05)], holo.DIM, { width: .04, dashed: true, opacity: .7 }));   // the straight A–B would like to be
    const cars = [car(S * VEH, 0x24557a), car(S * VEH, 0xb0532a)]; group.add(...cars);

    // the land: a low hill and a temple, both draggable
    const obs = [{ name: 'hill', r: 26, x: -25, y: 36, g: new THREE.Group() }, { name: 'temple', r: 12, x: 42, y: -36, g: new THREE.Group() }];
    { const hillMat = new THREE.MeshStandardMaterial({ color: 0x86a067, roughness: .95, flatShading: true }), rock = new THREE.MeshStandardMaterial({ color: 0x9a8d78, roughness: .95, flatShading: true });
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), hillMat); m.scale.set(26 * S, 2.2, 26 * S); m.castShadow = m.receiveShadow = true; obs[0].g.add(m);
      for (const [x, z, k] of [[.6, .3, .5], [-.8, -.5, .4], [.2, -1, .35]]) { const b = new THREE.Mesh(new THREE.DodecahedronGeometry(k, 0), rock); b.position.set(x, 1.3, z); b.castShadow = true; obs[0].g.add(b); } }
    { const stone = new THREE.MeshStandardMaterial({ color: 0xe0cfae, roughness: .8 }), red = new THREE.MeshStandardMaterial({ color: 0xb03a2e, roughness: .6, side: THREE.DoubleSide });
      const part = (geo, mat, y, x = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, 0); m.castShadow = true; obs[1].g.add(m); };
      part(new THREE.BoxGeometry(1.8, .5, 1.8), stone, .25); part(new THREE.BoxGeometry(1.1, .9, 1.1), stone, .95); part(new THREE.ConeGeometry(.75, 1.7, 8), stone, 2.25);
      part(new THREE.CylinderGeometry(.03, .03, .8, 6), stone, 3.4); part(new THREE.PlaneGeometry(.5, .3), red, 3.65, .26); }
    for (const o of obs) { o.g.userData.obstacle = o.name; const r = holo.ring(o.r * S, holo.AMBER, { width: .06, opacity: .6 }); r.position.y = .06; o.g.add(r); group.add(o.g); }
    const labels = obs.map(o => { const l = holo.label(o.name === 'hill' ? 'hill · drag' : 'temple · drag', { h: .75, color: '#9a4a22', bg: 'rgba(255,253,248,.9)' }); group.add(l); return l; });
    for (const [t, x] of [['A', -HALF + 4], ['B', HALF - 4]]) { const l = holo.label(t, { h: 1, color: '#14202b', weight: 800, bg: 'rgba(255,253,248,.9)' }); l.position.copy(P([x, -11], 1)); group.add(l); }

    const readout = textPlane({ w: 9.4, h: 4.6, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText('A TO B', 20, 30);
      const len = road.track?.length || 2 * HALF, k = st.curve;
      const rows = k ? [['Deviation Δ', `${k.deltaDeg.toFixed(1)}°`], ['Radius R', `${k.R.toFixed(0)} m`], ['Road length', `${len.toFixed(0)} m (straight ${2 * HALF} m)`]] : [['Deviation Δ', 'none: the straight is clear'], ['Road length', `${len.toFixed(0)} m`]];
      rows.forEach(([a, b], i) => { const y = 66 + i * 34; c.fillStyle = '#5c6168'; c.font = `500 17px ${F}`; c.fillText(a, 20, y); c.fillStyle = '#14202b'; c.font = `700 18px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 20, y); c.textAlign = 'left'; });
    } });
    readout.position.set(5.2, 2.6, 10.6); readout.rotation.x = -.6; group.add(readout);

    // where must the bend be, and how far off the straight? The obstacle that blocks most decides.
    function target() {
      let best = null;
      for (const o of obs) {
        if (Math.abs(o.x) > HALF - 35) continue;
        const need = o.r + CLEAR; if (Math.abs(o.y) >= need) continue;
        const d = o.y > 0 ? o.y - need : o.y + need;                 // pass on the side nearer the straight
        if (!best || Math.abs(d) > Math.abs(best.d)) best = { d, x: o.x };
      }
      return best || { d: 0, x: st.pix };
    }
    function rebuild() {
      const A = [-HALF, 0], B = [HALF, 0], PI = [st.pix, st.d];
      let pts, span = null, side = 1;
      if (Math.abs(st.d) < .3) { pts = [A, B]; st.curve = null; }
      else {
        const d1 = [PI[0] - A[0], PI[1] - A[1]], d2 = [B[0] - PI[0], B[1] - PI[1]];
        const a1 = Math.atan2(d1[1], d1[0]), a2 = Math.atan2(d2[1], d2[0]), left = a2 - a1 > 0, D = Math.abs(a2 - a1);
        let R = st.R; const legs = Math.min(Math.hypot(...d1), Math.hypot(...d2));
        if (R * Math.tan(D / 2) > legs * .9) R = legs * .9 / Math.tan(D / 2);    // the curve must fit between A and B
        const k = horizontalCurve(deg(D), R, 0), L = layout(k, 1); st.curve = k;
        const rot = a1 - (left ? -D / 2 : D / 2), c = Math.cos(rot), s = Math.sin(rot);
        const toW = ([x, y]) => { const yy = left ? -y : y; return [PI[0] + x * c - yy * s, PI[1] + x * s + yy * c]; };
        pts = [A, ...L.pts.map(toW), B];
        const e = Math.hypot(...d1) - k.Ts; span = [e, e + k.Lc]; side = left ? -1 : 1;
      }
      const T = road.set(pts, { stones: span, side });
      holo.setPoints(centre, T.pts.map(p => P(p, .05)));
      const near = []; for (let d = 0; d <= T.length; d += 5) near.push(P([T.at(d).x, T.at(d).y]));
      forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.15) || obs.some(o => Math.hypot(P([o.x, o.y]).x - x, P([o.x, o.y]).z - z) < o.r * S + .5));
      readout.redraw();
    }
    function placeObstacles() { obs.forEach((o, i) => { o.g.position.copy(P([o.x, o.y])); labels[i].position.copy(P([o.x, o.y - o.r - 7], 1.4)); }); }
    const retarget = () => { const t = target(); st.dTarget = t.d; if (t.d) st.pix = t.x; };
    function moveTo(i, x, y) { const o = obs[i], x0 = o.x, y0 = o.y; anims.add({ dur: .9, update: e => { o.x = x0 + (x - x0) * e; o.y = y0 + (y - y0) * e; placeObstacles(); retarget(); } }); }

    let grip = null;
    const setR = R => { st.R = R; rebuild(); };
    const actions = [
      { label: 'Gentle R 120', toggle: () => st.R === 120, run: () => setR(120) },
      { label: 'R 60', toggle: () => st.R === 60, run: () => setR(60) },
      { label: 'Sharp R 25', toggle: () => st.R === 25, run: () => setR(25) },
      { label: 'Hill on the line', run: () => moveTo(0, -22, 10) },
      { label: 'Temple on the line', run: () => moveTo(1, 28, 4) },
    ];
    const api = {
      group, dragPlane: 'xz', targets: obs.map(o => o.g), actions,
      press(hit) { const n = tagged(hit.object, 'obstacle')?.userData.obstacle; grip = obs.find(o => o.name === n) || null; },
      drag({ point }) {
        if (!grip) return;
        grip.x = THREE.MathUtils.clamp((point.x - O.x) / S, -HALF + 12, HALF - 12); grip.y = THREE.MathUtils.clamp(-(point.z - O.z) / S, -100, 70);
        placeObstacles(); retarget();
      },
      release() {
        if (!grip) return; grip = null;
        const k = st.curve, by = obs.find(o => Math.abs(o.y) < o.r + CLEAR && Math.abs(o.x) <= HALF - 35);
        guide.say(k && by ? `To pass the ${by.name} the road turns through Δ ${k.deltaDeg.toFixed(0)}° on a curve of R ${k.R.toFixed(0)} m.` : 'The straight is clear: no change in direction is needed.');
      },
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        if (Math.abs(st.d - st.dTarget) > .05) { st.d += (st.dTarget - st.d) * Math.min(1, dt * 6); rebuild(); }
        const T = road.track;
        if (T) cars.forEach((c, i) => {   // one each way, keeping left
          st.carD[i] = (st.carD[i] + dt * 24) % T.length;
          const p = T.at(i ? T.length - st.carD[i] : st.carD[i]), h = p.h + (i ? Math.PI : 0);
          c.position.copy(P([p.x - Math.sin(h) * 1.75, p.y + Math.cos(h) * 1.75], .01)); c.rotation.y = h;
        });
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        readout.position.x = tall ? 3.6 : 5.2; readout.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); obs[0].x = -25; obs[0].y = 36; obs[1].x = 42; obs[1].y = -36; st.R = 60; placeObstacles(); retarget(); st.d = st.dTarget; rebuild(); guide.reset(); },
      get debug() { return { d: +st.d.toFixed(2), dTarget: +st.dTarget.toFixed(2), R: st.R, delta: st.curve ? +st.curve.deltaDeg.toFixed(2) : 0, length: +(road.track?.length || 0).toFixed(1), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Topography', show: ['Hill on the line'], text: 'The straight from A to B is the shortest road. Drag the hill onto it, or press "Hill on the line".',
          check: { q: 'What does the road need to change direction safely (cl. 1.2)?', options: ['a horizontal curve', 'a level crossing', 'a bridge'], answer: 0, why: 'Changes in direction are made with horizontal curves and transition curves, for convenient, safe and pleasant travel (cl. 1.2).' } },
        { title: 'Monuments', show: ['Hill on the line', 'Temple on the line'], text: 'Now bring the temple onto the line. Places of worship and monuments are not moved for a road.',
          check: { q: 'Which of these does cl. 1.2 name as a reason to change direction?', options: ['places of worship', 'traffic signals', 'speed limits'], answer: 0, why: 'Topography, environment and ecology, monuments, places of worship, structures and the land available (cl. 1.2).' } },
        { title: 'Mild curves', show: ['Gentle R 120', 'R 60', 'Sharp R 25', 'Hill on the line', 'Temple on the line'], text: 'Try a sharper and a gentler radius for the same bend. The cars follow it.',
          check: { q: 'What is the aim of modern alignment design (cl. 1.1)?', options: ['gentle slopes and mild curves', 'the shortest straight line', 'the fewest curves at any cost'], answer: 0, why: 'Gentle slopes and mild curves that fit the natural terrain and are more aesthetic (cl. 1.1).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    readout.userData.zoom = true; api.targets.push(readout);
    placeObstacles(); retarget(); st.d = st.dTarget; rebuild();
    return api;
  },
};
