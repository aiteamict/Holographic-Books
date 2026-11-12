// Spread 3 · The circular curve (def. 1–4, 9–11), as a site model. A marked road with traffic runs through the curve;
// the surveyor stands at the apex with a theodolite. Drag the second straight to open or close Δ, drag the curve to
// change R. "Set out the curve" plays the field job: tape Ts along each straight to peg T.P. and P.T., then Es towards
// the centre to peg the mid point of the curve.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { horizontalCurve } from '../../_irc38/curve.js';
import { makePlan } from '../../_irc38/plan.js';
import { diorama, trees, makeRoad, car, worker, theodolite, MAT, VEH, CREW } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', S = .085, GROUND = .5, ORIGIN = [0, GROUND, -7.5];
const DMIN = 20, DMAX = 90, RMIN = 40, RMAX = 150, RAD = Math.PI / 180;
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };

export default {
  cam: { pos: [3, 41, 37], look: [3.5, 0, -2], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { delta: 56, R: 120, carD: [0, 120], setout: null, doneOnce: false };
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 38, 11); group.add(forest);
    const plan = makePlan({ s: S, origin: ORIGIN, ext: 0, show: { ribbon: false } }); group.add(plan.group);
    const P = plan.P;
    const road = makeRoad(P, S); group.add(road.group);
    const cars = [car(S * VEH, 0x24557a), car(S * VEH, 0xb0532a)]; group.add(...cars);
    const instrument = theodolite(S * CREW), observer = worker(S * CREW), chain = worker(S * CREW);
    group.add(instrument, observer, chain);
    const tape = new THREE.Mesh(new THREE.BoxGeometry(1, .05, .16), MAT.tape); tape.visible = false; group.add(tape);
    const reading = holo.label('0 m', { h: .85, color: '#8a3f1c', bg: 'rgba(255,253,248,.95)', weight: 800 }); reading.visible = false; group.add(reading);
    const midPeg = plan.pegs['C.C.T.'].clone(true); group.add(midPeg); midPeg.visible = false;
    { const l = midPeg.children.find(o => o.isSprite); if (l) { const n = holo.label('mid point', { h: .72, color: '#14202b', bg: 'rgba(255,253,248,.94)', weight: 700 }); n.position.copy(l.position); midPeg.remove(l); midPeg.add(n); } }

    // handles: one on the second straight (swings Δ), one on the curve's mid point (pulls R)
    const hDelta = holo.handle('delta', { label: 'Δ · drag', kind: 'lever' }), hR = holo.handle('radius', { label: 'R · drag', kind: 'lever' });
    group.add(hDelta, hR);

    const curve = () => horizontalCurve(st.delta, st.R, 0);
    const readout = textPlane({ w: 9.4, h: 6.2, px: 46, draw: (c, W, H) => {
      const k = curve();
      cardBg(c, W, H); c.textAlign = 'left';
      c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText('SIMPLE CIRCULAR CURVE', 20, 30);
      const rows = [['Deviation Δ', `${st.delta.toFixed(0)}°`], ['Intersection angle 180° − Δ', `${(180 - st.delta).toFixed(0)}°`], ['Radius R', `${st.R.toFixed(0)} m`],
        ['Tangent distance Ts = R tan Δ/2', `${k.Ts.toFixed(2)} m`], ['Apex distance Es = R (sec Δ/2 − 1)', `${k.Es.toFixed(2)} m`], ['Curve length R·Δ', `${k.Lc.toFixed(2)} m`]];
      rows.forEach(([a, b], i) => {
        const y = 66 + i * 38; c.fillStyle = '#5c6168'; c.font = `500 17px ${F}`; c.fillText(a, 20, y);
        c.fillStyle = i >= 3 ? '#8a3f1c' : '#14202b'; c.font = `700 19px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 20, y); c.textAlign = 'left';
      });
    } });
    readout.position.set(5.2, 2.6, 10.6); readout.rotation.x = -.6; group.add(readout);

    // the road runs from slab edge to slab edge
    const toEdge = (from, dir) => {   // metres along dir from plan point `from` until the page point leaves the slab
      let t = 0; for (; t < 400; t += 2) { const q = P([from[0] + dir[0] * t, from[1] + dir[1] * t]); if (q.x < SLAB.x0 + .3 || q.x > SLAB.x1 - .3 || q.z < SLAB.z0 + .3 || q.z > SLAB.z1 - .3) break; }
      return Math.max(0, t - 2);
    };
    let T = null;
    // pegs: all shown, except during a set-out, when each appears as the chainman drives it
    function showPegs() {
      const so = st.setout; plan.pegs['T.P.'].visible = !so || so.placed.has('T.P.'); plan.pegs['P.T.'].visible = !so || so.placed.has('P.T.');
      midPeg.visible = !!so?.placed.has('mid') || st.doneOnce;
    }
    function place() {
      const k = curve(); plan.set(k);
      const L = plan.L, u1 = L.u1, u2 = [u1[0], -u1[1]];
      const e1 = toEdge(L.TP, [-u1[0], -u1[1]]), e2 = toEdge(L.PT, u2);
      const pts = [[L.TP[0] - u1[0] * e1, L.TP[1] - u1[1] * e1], ...L.pts, [L.PT[0] + u2[0] * e2, L.PT[1] + u2[1] * e2]];
      T = road.set(pts, { stones: [e1, e1 + k.Lc], side: 1 });
      // trees keep clear of the road and of the survey party at the apex
      const near = pts.filter((_, i) => i % 3 === 0).map(p => P(p)), crew = P([0, 6]);
      forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.1) || Math.hypot(crew.x - x, crew.z - z) < 1.6);
      const d = k.Ts + 14; hDelta.position.copy(P([u2[0] * d, u2[1] * d], .05)); hR.position.copy(P(L.mid, .05));
      if (!st.setout) { instrument.position.copy(P([0, 0])); observer.position.copy(P([-3, 5])); observer.rotation.y = -1.2; chain.position.copy(P([3.5, 4])); chain.rotation.y = 2; }
      midPeg.position.copy(P(L.mid));
      showPegs(); readout.redraw();
    }
    const setTo = (delta, R, dur = .7) => {
      const d0 = st.delta, r0 = st.R; anims.stop('to');
      anims.add({ dur, tag: 'to', update: e => { st.delta = d0 + (delta - d0) * e; st.R = r0 + (R - r0) * e; place(); } });
    };

    // the field job, as a little play
    // the tape, and its reading riding above the chainman (redrawn only when the whole metre changes)
    let shown = -1;
    const stretch = (a, b) => {
      const A = P(a, .14), B = P(b, .14); tape.position.copy(A).lerp(B, .5); tape.scale.x = Math.max(.01, A.distanceTo(B)); tape.rotation.y = Math.atan2(-(B.z - A.z), B.x - A.x); tape.visible = true;
      const m = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1])); if (m !== shown) { shown = m; reading.userData.setText(`${m} m`); }
      reading.position.copy(chain.position).add(new THREE.Vector3(0, 2.4, 0)); reading.visible = true;
    };
    const popPeg = name => { const p = name === 'mid' ? midPeg : plan.pegs[name]; p.scale.set(1, .01, 1); anims.add({ dur: .35, update: e => p.scale.set(1, Math.max(.01, e), 1) }); };
    function setOut() {
      anims.stop('setout'); const k = curve(), L = plan.L;
      st.setout = { placed: new Set() }; st.doneOnce = false; showPegs();
      const legs = [[L.TP, 'T.P.', `Ts = ${k.Ts.toFixed(2)} m along the first straight from the apex: T.P. is pegged.`], [L.PT, 'P.T.', 'The same Ts along the second straight: P.T. is pegged.'], [L.mid, 'mid', `Es = ${k.Es.toFixed(2)} m from the apex towards the centre: the mid point of the curve.`]];
      const aim = to => Math.atan2(to[1], to[0]);
      let t = 0;
      for (const [to, name, say] of legs) {
        const dist = Math.hypot(to[0], to[1]), walk = Math.max(1.2, dist / 45), t0 = t;
        anims.add({ delay: t0, dur: .6, tag: 'setout', update: e => { const hd = instrument.userData.head; hd.rotation.y = THREE.MathUtils.lerp(hd.rotation.y, aim(to), e); } });
        anims.add({ delay: t0 + .6, dur: walk, tag: 'setout', update: e => { const p = [to[0] * e, to[1] * e]; chain.position.copy(P(p)); chain.position.y += Math.abs(Math.sin(e * dist / 3)) * .08; chain.rotation.y = aim(to); stretch([0, 0], p); },
          done: () => { st.setout?.placed.add(name); showPegs(); popPeg(name); guide.say(say); ctx.snd?.play('tick'); } });
        anims.add({ delay: t0 + .6 + walk + .5, dur: walk * .6, tag: 'setout', update: e => { const p = [to[0] * (1 - e), to[1] * (1 - e)]; chain.position.copy(P(p)); chain.rotation.y = aim(to) + Math.PI; stretch([0, 0], p); } });
        t += .6 + walk + .5 + walk * .6;
      }
      anims.add({ delay: t, dur: .2, tag: 'setout', update: () => { tape.visible = reading.visible = false; }, done: () => { st.doneOnce = true; st.setout = null; showPegs(); guide.say('Three pegs fix the curve on the ground: T.P. and P.T. at Ts from the apex, and the mid point at Es. Every other peg follows from these.'); } });
    }

    let grip = null;
    const planXY = p => [(p.x - ORIGIN[0]) / S, -(p.z - ORIGIN[2]) / S];
    const api = {
      group, dragPlane: 'xz', targets: [hDelta, hR],
      actions: [
        { label: 'Set out the curve', run: setOut },
        { label: 'Gentle curve', run: () => setTo(30, 150) },
        { label: 'Sharp curve', run: () => setTo(90, 50) },
        { label: 'Back to 56°', run: () => setTo(56, 120) },
      ],
      press(hit) { grip = tagged(hit.object, 'handle')?.userData.handle || null; if (grip) { anims.stop('to'); anims.stop('setout'); st.setout = null; tape.visible = reading.visible = false; } },
      drag({ point }) {
        if (!grip) return;
        const [x, y] = planXY(point);
        if (grip === 'delta') { if (x > 1) st.delta = THREE.MathUtils.clamp(-2 * Math.atan2(y, x) / RAD, DMIN, DMAX); }
        else { const es = THREE.MathUtils.clamp(-y, 2, 400); st.R = THREE.MathUtils.clamp(es / (1 / Math.cos(st.delta / 2 * RAD) - 1), RMIN, RMAX); }
        place(); const k = curve();
        guide.say(grip === 'delta' ? `Δ ${st.delta.toFixed(0)}°: the straights meet at ${(180 - st.delta).toFixed(0)}°, and Ts is ${k.Ts.toFixed(1)} m.` : `R ${st.R.toFixed(0)} m: Ts ${k.Ts.toFixed(1)} m, Es ${k.Es.toFixed(1)} m.`);
      },
      release() { grip = null; },
      tap(hit) { guide.tap(hit); },
      a11y: [{ label: 'Set out the curve', run: setOut }, { label: 'Gentle curve, Δ 30°, R 150 m', run: () => setTo(30, 150) }, { label: 'Sharp curve, Δ 90°, R 50 m', run: () => setTo(90, 50) }, { label: 'Back to Δ 56°, R 120 m', run: () => setTo(56, 120) }],
      update(dt) {
        anims.tick(dt);
        // traffic: two cars, one each way, keeping to the left
        if (T) cars.forEach((c, i) => {
          st.carD[i] = (st.carD[i] + dt * 22) % T.length;
          const p = T.at(i ? T.length - st.carD[i] : st.carD[i]), h = p.h + (i ? Math.PI : 0), off = 1.75;
          c.position.copy(P([p.x - Math.sin(h) * off, p.y + Math.cos(h) * off], .01)); c.rotation.y = h;
        });
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        readout.position.x = tall ? 3.6 : 5.2; readout.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.delta = 56; st.R = 120; st.setout = null; st.doneOnce = false; tape.visible = reading.visible = false; place(); guide.reset(); },
      get debug() { const k = curve(); return { delta: st.delta, R: st.R, Ts: +k.Ts.toFixed(3), Es: +k.Es.toFixed(3), Lc: +k.Lc.toFixed(3), setout: !!st.setout, done: st.doneOnce, guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'The parts', show: [], text: 'The straights meet at the apex P.I., where the surveyor stands. The curve leaves the first straight at T.P. and joins the second at P.T.',
          check: { q: 'Where does the straight end and curvature begin (def. 10)?', options: ['P.I.', 'T.P.', 'O'], answer: 1, why: 'At the tangent point, T.P. The apex P.I. is where the straights produced would meet; the road never touches it.' } },
        { title: 'Δ and R', show: ['Gentle curve', 'Sharp curve', 'Back to 56°'], text: 'Drag the handle on the second straight to change Δ, or drag the curve to change R. Watch Ts and Es on the card.',
          check: { q: 'Δ is 60°. What is the intersection angle between the straights (def. 4)?', options: ['60°', '120°', '90°'], answer: 1, why: '180° − Δ = 120°. The intersection angle is the supplement of the deviation angle.' } },
        { title: 'Set it out', show: ['Set out the curve', 'Gentle curve', 'Sharp curve', 'Back to 56°'], text: 'Press "Set out the curve". The theodolite stands over P.I.; the chainman tapes the distances and drives the pegs.',
          check: { q: 'To fix T.P. on the ground, the chainman measures from the apex…', options: ['Ts along the straight', 'Es towards the centre', 'R from the centre'], answer: 0, why: 'The tangent distance is laid along the straight from P.I. (def. 9); Es, towards the centre, fixes the middle of the curve (def. 2).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    place();
    return api;
  },
};
