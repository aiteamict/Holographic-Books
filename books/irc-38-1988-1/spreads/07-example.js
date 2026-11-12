// Spread 7 · Fit the curve (Example 11.3, Fig. 27). Δ = 56°, 40 km/h, plain country. High rocky ground at the apex and
// buildings inside the bend hold the apex distance between 20 m and 23.5 m. First name the pegs, then drag the radius and
// pick a transition until the road clears both. The book's answer: Rc 170 m, Ls 55 m → Ts 118.260 m, Es 23.376 m.
import * as THREE from 'three';
import { Anims, pulse } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { horizontalCurve, deg } from '../../_irc38/curve.js';
import { makePlan } from '../../_irc38/plan.js';
import { diorama, trees, makeRoad, throughSlab, car, VEH } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', S = .1, GROUND = .5, ORIGIN = [0, GROUND, -4.5];
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };
const D = 56, ES_MIN = 20, ES_MAX = 23.5, RMIN = 100, RMAX = 220, NAMES = ['T.P.', 'P.I.', 'C.T.', 'T.C.'];

export default {
  cam: { pos: [3, 36, 34], look: [3, 1, -1], portrait: { pos: [15, 60, 52], look: [12.3, 0, -1] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { R: 125, Ls: 30, ask: 0 };
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 34, 29); group.add(forest);
    const plan = makePlan({ s: S, origin: ORIGIN, ext: 0, show: { radii: false, centre: false, ribbon: false } }); group.add(plan.group);
    const road = makeRoad(plan.P, S); group.add(road.group);
    const auto = car(S * VEH, 0x24557a); group.add(auto); let carD = 0;
    const P = plan.P;

    // the site (Fig. 27): rocky ground around the apex, two buildings inside the bend
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x8c7f6c, roughness: .95, flatShading: true });
    for (const [x, y, r, h] of [[0, 4, 15, 1.0], [-9, 1, 9, .7], [9, 2, 9, .75], [0, -8, 9, .5]]) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), rockMat); m.scale.set(r * S, h, r * S * .8); m.position.copy(P([x, y], h * .3)); m.castShadow = true; group.add(m);
    }
    const bldMat = new THREE.MeshStandardMaterial({ color: 0xc9b9a0, roughness: .8 }), roofMat = new THREE.MeshStandardMaterial({ color: 0x8a4a3a, roughness: .7 });
    for (const x of [-9, 7]) {
      const b = new THREE.Group(), w = 9 * S, d = 8 * S;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), bldMat); body.position.y = .6; body.castShadow = true; b.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * .75, .6, 4), roofMat); roof.rotation.y = Math.PI / 4; roof.position.y = 1.5; b.add(roof);
      b.position.copy(P([x, -(ES_MAX + 8.5)])); group.add(b);
    }
    const rockLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .05, dashed: true }), bldLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .05, dashed: true });
    group.add(rockLine, bldLine);                                            // Es = 20 m and Es = 23.5 m: the curve's mid point must lie between
    const zoneLab = holo.label('Es between 20 m and 23.5 m', { h: .7, color: '#c23b2f' }); group.add(zoneLab);
    const hR = holo.handle('radius', { label: 'R · drag', kind: 'lever', r: .9 }); group.add(hR);

    const curve = () => horizontalCurve(D, st.R, st.Ls);
    const fits = k => k.Es >= ES_MIN && k.Es <= ES_MAX;
    const readout = textPlane({ w: 9.4, h: 6.4, px: 46, draw: (c, W, H) => {
      const k = curve(), ok = fits(k);
      cardBg(c, W, H, { stroke: ok ? 'rgba(47,143,85,.9)' : 'rgba(194,59,47,.9)' }); c.textAlign = 'left';
      c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText('EXAMPLE 11.3 · Δ 56°, 40 km/h, PLAIN', 20, 30);
      const rows = [['Radius Rc', `${st.R.toFixed(0)} m`], ['Transition Ls', `${st.Ls.toFixed(0)} m`], ['Tangent distance Ts', `${k.Ts.toFixed(3)} m`], ['Apex distance Es', `${k.Es.toFixed(3)} m`], ['θs', `${deg(k.thetaS).toFixed(2)}°`]];
      rows.forEach(([a, b], i) => { const y = 64 + i * 34; c.fillStyle = '#5c6168'; c.font = `500 17px ${F}`; c.fillText(a, 20, y); c.fillStyle = i === 3 ? (ok ? '#1f7a45' : '#b3362b') : '#14202b'; c.font = `700 19px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 20, y); c.textAlign = 'left'; });
      c.fillStyle = ok ? '#1f7a45' : '#b3362b'; c.font = `700 18px ${F}`;
      c.fillText(ok ? '✓ clears the rock and the buildings' : k.Es < ES_MIN ? '✗ into the rocky ground: Es under 20 m' : '✗ into the buildings: Es over 23.5 m', 20, H - 22);
    } });
    readout.position.set(5.2, 2.6, 10.6); readout.rotation.x = -.6; group.add(readout);

    function place() {
      const k = curve(); plan.set(k);
      const through = throughSlab(plan.L, plan.P, SLAB); road.set(through.pts, { stones: [through.e1, through.e1 + k.length], side: 1 });
      const near = through.pts.filter((_, i) => i % 3 === 0).map(p => plan.P(p)), keep = plan.P([0, 0]);
      forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.2) || Math.hypot(keep.x - x, keep.z - z) < 4.4);
      const w = 16, ok = fits(k);
      holo.setPoints(rockLine, [P([-w, -ES_MIN], .06), P([w, -ES_MIN], .06)]); holo.setPoints(bldLine, [P([-w, -ES_MAX], .06), P([w, -ES_MAX], .06)]);
      zoneLab.position.copy(P([0, -(ES_MAX + 18)], .8));
      hR.position.copy(P(plan.L.mid, .05));
      for (const l of [rockLine, bldLine]) l.material.color.setHex(ok ? holo.GREEN : holo.RED);
      rockMat.emissive.setHex(k.Es < ES_MIN ? 0x7a1a12 : 0); bldMat.emissive.setHex(k.Es > ES_MAX ? 0x7a1a12 : 0);   // what the road runs into glows red
      readout.redraw();
    }
    const setTo = (R, Ls, dur = .8) => { const r0 = st.R, l0 = st.Ls; anims.stop('to'); anims.add({ dur, tag: 'to', update: e => { st.R = r0 + (R - r0) * e; st.Ls = l0 + (Ls - l0) * e; place(); } }); };
    const report = () => { const k = curve(); guide.say(fits(k) ? `R ${st.R.toFixed(0)} m with Ls ${st.Ls.toFixed(0)} m fits: Es ${k.Es.toFixed(2)} m, Ts ${k.Ts.toFixed(2)} m.` : `R ${st.R.toFixed(0)}, Ls ${st.Ls.toFixed(0)}: Es ${k.Es.toFixed(2)} m is not between 20 and 23.5 m.`); };

    let grip = null;
    const lsChip = ls => ({ label: `Ls ${ls} m`, toggle: () => Math.round(st.Ls) === ls, run: () => { setTo(st.R, ls, .5); anims.after(.55, report); } });
    const actions = [lsChip(15), lsChip(30), lsChip(55), lsChip(100),
      { label: 'The book’s answer', run: () => { setTo(170, 55); anims.after(.85, () => guide.say('Rc 170 m, Ls 55 m: Ts 118.260 m and Es 23.376 m, exactly as Example 11.3 prints them, and the largest radius that fits.')); } }];
    const pegs = NAMES.map(n => plan.pegs[n]);
    const api = {
      group, dragPlane: 'xz', targets: [hR, ...pegs], actions,
      press(hit) { grip = tagged(hit.object, 'handle') ? {} : null; if (grip) anims.stop('to'); },
      drag({ point }) {
        if (!grip) return;
        const es = THREE.MathUtils.clamp((point.z - ORIGIN[2]) / S, 5, 60);
        // invert Es(R) at this Ls by bisection: Es grows with R
        let a = RMIN, b = RMAX; for (let i = 0; i < 30; i++) { const m = (a + b) / 2; if (horizontalCurve(D, m, st.Ls).Es < es) a = m; else b = m; }
        st.R = Math.round((a + b) / 2); place(); report();
      },
      release() { grip = null; },
      tap(hit) {
        if (guide.tap(hit)) return;
        const i = pegs.findIndex(p => p === hit.object || p.getObjectById(hit.object.id)); if (i < 0) return;
        const name = NAMES[i], want = NAMES[st.ask % NAMES.length];
        if (name === want) { pulse(anims, pegs[i], 1.4, .4); ctx.snd?.play('tick'); st.ask++; guide.say(st.ask >= NAMES.length ? 'All four named. Tap the card to fit the curve.' : `Right: the ${name}. Now tap the ${NAMES[st.ask]}.`); }
        else { ctx.snd?.play('step'); guide.say(`That one is the ${name}. Tap the ${want}.`); }
      },
      a11y: [...actions.map(a => ({ label: a.label, run: a.run })), { label: 'Radius 125 m', run: () => setTo(125, st.Ls) }, { label: 'Radius 170 m', run: () => setTo(170, st.Ls) }, { label: 'Radius 210 m', run: () => setTo(210, st.Ls) }],
      update(dt) {
        anims.tick(dt);
        const T = road.track; if (T) { carD = (carD + dt * 20) % T.length; const p = T.at(carD); auto.position.copy(plan.P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h; }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        readout.position.x = tall ? 3.6 : 5.2; readout.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.R = 125; st.Ls = 30; st.ask = 0; place(); guide.reset(); },
      get debug() { const k = curve(); return { R: st.R, Ls: st.Ls, Ts: +k.Ts.toFixed(3), Es: +k.Es.toFixed(3), fits: fits(k), ask: st.ask, guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Name the pegs', show: [], text: 'Before designing, name the pegs. Tap the T.P., then the P.I., the C.T. and the T.C.' },
        { title: 'Fit it', show: ['Ls 15 m', 'Ls 30 m', 'Ls 55 m', 'Ls 100 m'], text: 'Drag the curve to change the radius and pick a transition length. Its mid point must stay between the two red lines.',
          check: { q: 'At the same Ls, a larger radius moves the curve…', options: ['away from the apex', 'towards the apex', 'nowhere'], answer: 0, why: 'Es = (R + S) sec Δ/2 − R grows with R: a flatter curve passes farther from the apex, here towards the buildings.' } },
        { title: 'The book', show: ['Ls 15 m', 'Ls 30 m', 'Ls 55 m', 'Ls 100 m', 'The book’s answer'], text: 'Several pairs fit (Table 11.1). Press "The book’s answer" to see which one Example 11.3 chooses.',
          check: { q: 'Why does the book choose Rc 170 m over 125 m or 155 m?', options: ['the largest radius is best', 'it is the cheapest', 'it has the shortest Ts'], answer: 0, why: '"Since it is better to have the largest possible radius, the combination of 170 m for radius and 55 m for Ls is chosen" (Example 11.3).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    readout.userData.zoom = true; api.targets.push(readout);
    place();
    return api;
  },
};
