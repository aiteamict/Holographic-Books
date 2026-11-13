// Spread 7 · The spiral and the main curve (cl. 7.5.3, 7.5.5, 7.5.6, eq. 25–28). A curve of Δ 50° with spirals of the
// chosen length; the same circle without transitions is drawn dashed red. With spirals the circle moves in from the
// tangents by the shift s and its centre moves out along the bisector; the card sets the exact values beside the
// approximations of cl. 7.5.6 (with s ≈ Ls²/24Rc).
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { horizontalCurve, layout, spiralXY } from '../../_irc38/curve.js';
import { makePlan } from '../../_irc38/plan.js';
import { diorama, trees, makeRoad, throughSlab, car, VEH } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, DELTA = 50;

export default {
  cam: { pos: [3, 41, 37], look: [3.5, 0, -2], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { Ls: 80, R: 100, carD: 0 };
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 34, 19); group.add(forest);
    let plan = null, road = null, S = .1;
    const ghost = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .07, dashed: true }); group.add(ghost);
    const sMark = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .09 }); group.add(sMark);
    const sTag = holo.label('s', { h: .62, color: '#c23b2f', bg: 'rgba(255,253,248,.92)', weight: 700 }); group.add(sTag);
    const auto = car(1, 0x24557a); group.add(auto);
    const k = () => horizontalCurve(DELTA, st.R, st.Ls);

    const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
      const cv = k(), t = Math.tan(DELTA * Math.PI / 360), sec = 1 / Math.cos(DELTA * Math.PI / 360), sA = st.Ls ** 2 / (24 * st.R);
      c.fillText(`THE SHIFT · Δ ${DELTA}° · Rc ${st.R} m · Ls ${st.Ls} m`, 18, 26);
      c.font = `600 12px ${F}`; c.fillStyle = '#5c6168'; c.textAlign = 'right'; c.fillText('EXACT', W - 150, 50); c.fillText('APPROXIMATE', W - 18, 50); c.textAlign = 'left';
      const rows = st.Ls ? [
        ['Shift s (eq. 27)', cv.S, sA, 'Ls² / 24Rc'],
        ['K, T.P. to the shifted P.C. (eq. 28)', cv.K, st.Ls / 2, 'Ls / 2'],
        ['Ts = K + (Rc + s) tan Δ/2 (eq. 25)', cv.Ts, st.Ls / 2 + (st.R + sA) * t, 'Ls/2 + (Rc + s) tan Δ/2'],
        ['Es = (Rc + s) sec Δ/2 − Rc (eq. 26)', cv.Es, (st.R + sA) * sec - st.R, 'with s ≈ Ls² / 24Rc'],
        ['Spiral offset at its middle', spiralXY(st.Ls / 2, st.Ls, st.R).y, cv.S / 2, 's / 2: bisected'],
      ] : [['No transition: the circle meets the tangents', 0, 0, ''], ['Ts = Rc tan Δ/2', cv.Ts, st.R * t, ''], ['Es = Rc (sec Δ/2 − 1)', cv.Es, st.R * (sec - 1), '']];
      rows.forEach(([a, ex, ap, how], i) => { const y = 74 + i * 30; c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(a, 18, y); if (how) { c.font = `500 11px ${F}`; c.fillText(how, W - 18 - c.measureText(how).width, y + 13); } c.fillStyle = '#14202b'; c.font = `700 15px ${F}`; c.textAlign = 'right'; if (ex || ap) { c.fillText(`${ex.toFixed(3)} m`, W - 150, y); c.fillStyle = '#24557a'; c.fillText(`${ap.toFixed(3)} m`, W - 18, y); } c.textAlign = 'left'; });
      const t0 = horizontalCurve(DELTA, st.R, 0);
      c.fillStyle = '#14202b'; c.font = `700 14px ${F}`; c.fillText(`Without spirals: Ts ${t0.Ts.toFixed(2)} m, Es ${t0.Es.toFixed(2)} m (dashed red).`, 18, 240);
      c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText('Approximations hold for small deviations (cl. 7.5.6). Shift drawn true to scale.', 18, H - 12);
    } });
    card.position.set(5.1, 2.9, 10.3); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      const cv = k(); S = Math.min(.12, 19 / (2 * cv.Ts * Math.cos(cv.delta / 2) + 40));
      if (plan) group.remove(plan.group); if (road) group.remove(road.group);
      plan = makePlan({ s: S, origin: [0, GROUND, -9 + Math.min(6, cv.Es * S * .5)], ext: 0, show: { ribbon: false, radii: false } }); group.add(plan.group);
      road = makeRoad(plan.P, S); group.add(road.group);
      plan.set(cv); const through = throughSlab(plan.L, plan.P, SLAB); road.set(through.pts, { stones: [through.e1, through.e1 + cv.length], side: 1 });
      holo.setPoints(ghost, layout(horizontalCurve(DELTA, st.R, 0), 1).pts.map(p => plan.P(p, .09)));
      const L = plan.L, foot = [L.PC[0] + L.n1[0] * cv.S, L.PC[1] + L.n1[1] * cv.S];
      sMark.visible = sTag.visible = st.Ls > 0; holo.setPoints(sMark, [plan.P(L.PC, .12), plan.P(foot, .12)]); sTag.position.copy(plan.P([L.PC[0] - L.n1[0] * 9, L.PC[1] - L.n1[1] * 9], 1));
      const near = through.pts.filter((_, i) => i % 3 === 0).map(p => plan.P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.1));
      auto.children[0].scale.setScalar(S * VEH);
      card.redraw();
    }
    const set = (key, v) => { st[key] = v; rebuild(); };
    const actions = [
      ...[0, 40, 80, 120].map(Ls => ({ label: Ls ? `Ls ${Ls} m` : 'No spiral', toggle: () => st.Ls === Ls, run: () => set('Ls', Ls) })),
      ...[100, 200].map(R => ({ label: `Rc ${R} m`, toggle: () => st.R === R, run: () => set('R', R) })),
    ];
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        const T = road?.track;
        if (T) { st.carD = (st.carD + dt * 22) % T.length; const p = T.at(st.carD); auto.position.copy(plan.P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h; }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.5 : 5.1; card.scale.setScalar(tall ? .8 : 1);
      },
      reset() { anims.clear(); Object.assign(st, { Ls: 80, R: 100, carD: 0 }); rebuild(); guide.reset(); },
      get debug() { const cv = k(); return { Ls: st.Ls, R: st.R, s: +cv.S.toFixed(4), sApprox: +(st.Ls ** 2 / (24 * st.R)).toFixed(4), K: +cv.K.toFixed(3), Ts: +cv.Ts.toFixed(3), Es: +cv.Es.toFixed(3), midOffset: st.Ls ? +spiralXY(st.Ls / 2, st.Ls, st.R).y.toFixed(4) : 0, guide: guide.debug }; },
    };
    const L = actions.map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'The shift', show: L, text: 'Start with no spiral, then add one. The circle moves in from the tangents by s; Ts and Es grow.',
          check: { q: 'With transitions, the centre of the circle moves…', options: ['away from the apex along the bisector', 'towards the apex', 'along the first straight'], answer: 0, why: 'The centre is moved away from the P.I. along the bisector and the tangents are moved out by about the shift (cl. 7.5.3).' } },
        { title: 'Approximately', show: L, text: 'Compare the columns: s ≈ Ls²/24Rc, K ≈ Ls/2, and the spiral passes through the middle of the shift.',
          check: { q: 'For small deviations the shift is…', options: ['bisected by the transition', 'equal to the transition length', 'zero'], answer: 0, why: 'Below about 10° the shift is bisected by the transition, and K is about half the curve length (cl. 7.5.6).' } },
        { title: 'In the field', show: L, text: 'Because the spiral leaves its own circle as it left the tangent, the surveyor can move the instrument along it.',
          check: { q: 'Why can the instrument be shifted along a spiral?', options: ['it leaves its circle as it left the tangent', 'the spiral is a circle', 'its chords are all equal'], answer: 0, why: 'The spiral departs from the osculating circle at any point at the same rate as from the tangent at the start, so the instrument can be shifted (cl. 7.5.5).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild();
    return api;
  },
};
