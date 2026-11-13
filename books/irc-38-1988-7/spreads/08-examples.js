// Spread 8 · Worked examples 11.33–11.40 line by line. Compound, reverse and hair-pin curves are not symmetric, so
// instead of the shared curve spread each example is an alignment of pieces of linearly varying curvature
// (curve.js `alignment`) drawn as a road with pegs. "Exact" values are the geometry the spreads before compute.
import * as THREE from 'three';
import { Anims, pulse } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, wrapText } from '@engine/util.js';
import { alignment } from '../../_irc38/curve.js';
import { diorama, trees, makeRoad } from '../../_irc38/site.js';
import { GEO as C } from './02-compound.js';
import { GEO as V } from './06-reverse.js';
import { GEO as H } from './07-hairpin.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, RAD = Math.PI / 180, DEG = 1 / RAD;
const okOf = (a, v) => Math.abs(v - a.book) <= (a.tol ?? Math.pow(10, -(a.digits ?? 2)) * 1.5);
// deflection from the tangent at C.S.1 (s = 0 of the compound spiral) to the spiral point at L, degrees
const defl = L => { const p = C.at(L); return -Math.atan2(p[1], p[0]) * DEG; };
const from6 = L => { const a = C.at(33), b = C.at(L); return -(Math.atan2(b[1] - a[1], b[0] - a[0]) - a[2]) * DEG; };

const COMPOUND = [{ len: 60, k0: 1 / 600 }, { len: 55, k0: 1 / 600, k1: 1 / 240 }, { len: 70, k0: 1 / 240 }];
const CMARKS = [['C.S.1', 60], ['6', 93], ['C.S.2', 115]];
const reverse = (rot, straight) => {
  const a = 150 * (30 * RAD + rot), b = 125 * (40 * RAD + rot);
  const parts = [{ len: 45, k0: 0 }, { len: 45, k0: 0, k1: 1 / 150 }, { len: a - 45, k0: 1 / 150 }, { len: 45, k0: 1 / 150, k1: 0 }, { len: straight, k0: 0 },
    { len: 55, k0: 0, k1: -1 / 125 }, { len: b - 55, k0: -1 / 125 }, { len: 55, k0: -1 / 125, k1: 0 }, { len: 45, k0: 0 }];
  const t1 = 45, p1 = t1 + a + 45, t2 = p1 + straight, p2 = t2 + b + 55;
  return { parts, marks: [['T.P. 1', t1], ['P.T. 1', p1], ['T.P. 2', t2], ['P.T. 2', p2]], h0: .25 };
};
const Lh = H.kmid.Ls, HAIR = [{ len: 35, k0: 0 }, { len: Lh, k0: 0, k1: 1 / 23.75 }, { len: 23.75 * 165 * RAD - Lh, k0: 1 / 23.75 }, { len: Lh, k0: 1 / 23.75, k1: 0 }, { len: 35, k0: 0 }];

const EXAMPLES = [
  { id: '11.33', title: 'The compound transition', given: 'R1 600 m, R2 240 m, La 55 m', parts: COMPOUND, marks: CMARKS,
    steps: [
      { text: 'θa = 28.65 × 55 (1/240 − 1/600) = 3.939°.', mark: 'C.S.1' },
      { text: 'Pa from Table 12: 0.00574 × 55. The book writes 0.03156; it is 0.3157 m.' },
      { text: 'Δ1 = 28.65 × 55/600 = 2.626°; Δ2 = 28.65 × 55/240 = 6.565°.' },
      { text: 'AB = 240 exsec Δ2 − 600 exsec Δ1 − Pa; AI and BI follow; T1 = R1 tan Δ1 + AI, T2 = R2 tan Δ2 − BI.', mark: 'C.S.2' },
    ],
    answers: [
      { label: 'Equivalent angle θa', book: 3.939, value: () => C.thA, unit: '°', digits: 3 },
      { label: 'Offset Pa', book: .03156, value: () => C.PaExact, unit: 'm', digits: 4, tol: .003, note: '0.00574 × 55 = 0.3157: the book slips a factor of ten.' },
      { label: 'Tangent T1', book: 33.252, value: () => C.T1, unit: 'm', digits: 2, tol: .05 },
      { label: 'Tangent T2', book: 21.855, value: () => C.T2, unit: 'm', digits: 2, tol: .05 },
    ] },
  { id: '11.34', title: 'Offsets from the two circles', given: 'Example 11.33; offsets at 10 and 20 m from each end', parts: COMPOUND, marks: CMARKS,
    steps: [
      { text: 'Offset = (Pa/2) × (x / 27.5)³, inward from the 600 m curve and outward from the 240 m curve.', mark: 'C.S.1' },
      { text: 'At 10 m: (0.03156/2) × 10³/27.5³ = 0.00076 m; at 20 m: 0.006 m (Table 11.13).' },
      { text: 'Built on 11.33’s Pa, every offset is ten times too small.', mark: 'C.S.2' },
    ],
    answers: [
      { label: 'Offset at 10 m', book: .00076, value: () => C.PaExact / 2 * (10 / 27.5) ** 3, unit: 'm', digits: 5, tol: .0002, note: 'With Pa = 0.3157 m the offsets are 0.0076 and 0.060 m.' },
      { label: 'Offset at 20 m', book: .006, value: () => C.PaExact / 2 * (20 / 27.5) ** 3, unit: 'm', digits: 4, tol: .002 },
      { label: 'Middle: Pa / 2', book: .01578, value: () => C.PaExact / 2, unit: 'm', digits: 4, tol: .002 },
    ] },
  { id: '11.35', title: 'Deflections for five chords from C.S.1', given: 'Example 11.33; chords of 11 m; instrument at C.S.1', parts: COMPOUND, marks: CMARKS,
    steps: [
      { text: 'Spiral part = L² × θa / 3La² = L² × 0.000434; circular part = sin⁻¹ (C / 2 × 600).', mark: 'C.S.1' },
      { text: 'Point 2: 22² is 484, not 489; 484 × 0.000434 = 0.2101°, so the sum is 1.2605°, not 1.0715°.' },
      { text: 'Point 5 (C.S.2): 1.31285 + 2.62697 = 3.9398°.', mark: 'C.S.2' },
    ],
    answers: [
      { label: 'Constant θa / 3La²', book: .000434, value: () => C.thA / (3 * 55 * 55), digits: 6 },
      { label: 'Deflection to point 2', book: 1.071487, value: () => defl(22), unit: '°', digits: 4, tol: .003, note: 'Point 2: 22² = 484, not 489; 484 × 0.000434 = 0.2101°.' },
      { label: 'Deflection to C.S.2', book: 3.9398268, value: () => defl(55), unit: '°', digits: 4, tol: .003 },
    ] },
  { id: '11.36', title: 'Deflections for ten chords from C.S.1', given: 'Example 11.33; chords of 5.5 m; whole curve visible', parts: COMPOUND, marks: CMARKS,
    steps: [
      { text: 'Spiral part = Table 14 first column × 3.939°; circular part for each chord on 600 m.', mark: 'C.S.1' },
      { text: 'Point 4: 0.0533 × 3.939 + 1.05048 = 1.2604°. Point 8: 0.2133 × 3.939 + 2.1013 = 2.9415°.' },
      { text: 'C.S.2: 0.3333 × 3.939 + 2.6270 = 3.9398°.', mark: 'C.S.2' },
    ],
    answers: [
      { label: 'Deflection to point 4', book: 1.2604314, value: () => defl(22), unit: '°', digits: 4, tol: .003 },
      { label: 'Deflection to point 8', book: 2.9415042, value: () => defl(44), unit: '°', digits: 4, tol: .003 },
      { label: 'Deflection to C.S.2', book: 3.9398468, value: () => defl(55), unit: '°', digits: 4, tol: .003 },
    ] },
  { id: '11.37', title: 'Moving the instrument to point 6', given: 'Example 11.36, but beyond point 6 cannot be seen from C.S.1', parts: COMPOUND, marks: CMARKS,
    steps: [
      { text: 'The book: R at 6 = 600 − (33/55)(600 − 240) = 384 m. It prints “3.3/55”.', mark: '6' },
      { text: 'On a spiral the curvature varies with length, not the radius: at point 6, R = 316 m.' },
      { text: 'Point 7 from 6: 0.0033 × 3.939 + sin⁻¹ (5.5 / 768) = 0.4233° by the book.' },
    ],
    answers: [
      { label: 'R at 6, the book’s rule', book: 384, value: () => 600 - 33 / 55 * 360, unit: 'm', digits: 1 },
      { label: 'R at 6 on the spiral', book: 384, value: () => C.R6, unit: 'm', digits: 1, tol: .5, note: 'Method, not misprint: on a spiral 1/R varies with length.' },
      { label: 'Point 7 from point 6', book: .4233148, value: () => from6(38.5), unit: '°', digits: 4, tol: .003 },
    ] },
  { id: '11.38', title: 'Reverse curves: the curves move', given: 'R 150 m, Δ 30° and R 125 m, Δ 40°, 75 m apart; 50 km/h, plain', ...reverse(0, V.straightI),
    steps: [
      { text: 'Table 9 at 50 km/h, plain: 45 m on 150 m and 55 m on 125 m. Each curve is designed alone.', mark: 'T.P. 1' },
      { text: 'Curve AE: s 0.5623, K 22.482, Ts 62.825 m. Curve FC: s 1.0068, K 27.456, Ts 73.318 m.', mark: 'P.T. 1' },
      { text: 'FC’s Es is (125 + 1.0068)/cos 20° − 125 = 9.094 m; the text prints 9.874.', mark: 'T.P. 2' },
      { text: 'Straight left: 75 − 22.482 − 27.456 = 25.062 m by the book.' },
    ],
    answers: [
      { label: 'AE: Ts', book: 62.825, value: () => V.k1.Ts, unit: 'm', digits: 3 },
      { label: 'FC: Es', book: 9.874, value: () => V.k2.Es, unit: 'm', digits: 3, note: 'Text prints 9.874; Fig. 52 has the right 9.094.' },
      { label: 'Straight between them', book: 25.062, value: () => V.straightI, unit: 'm', digits: 3, tol: .02 },
    ] },
  { id: '11.39', title: 'Reverse curves: the tangent moves', given: 'Example 11.38 with the circles fixed', ...reverse(V.rotation, V.straightII),
    steps: [
      { text: 'Δ1 = tan⁻¹ 75/275 = 15.255°; O1O2 = 275 / cos Δ1 = 285.04 m.', mark: 'T.P. 1' },
      { text: 'cos Δ2 = (150 + 0.5623 + 125 + 1.0068) / 285.04 = 0.97027; the book drops 1 m and prints 0.96676.' },
      { text: 'The new tangent is O1O2 sin Δ2, not tan Δ2: the straight is 19.05 m, not 25.448.', mark: 'T.P. 2' },
    ],
    answers: [
      { label: 'Δ1', book: 15.255, value: () => Math.atan(75 / 275) * DEG, unit: '°', digits: 3 },
      { label: 'cos Δ2', book: .9667612, value: () => (275 + V.k1.S + V.k2.S) / (275 / Math.cos(Math.atan(75 / 275))), digits: 5, note: '150 + 0.5623 + 125 + 1.0068 = 276.569, not 275.569.' },
      { label: 'Straight between them', book: 25.448, value: () => V.straightII, unit: 'm', digits: 3, tol: .02 },
    ] },
  { id: '11.40', title: 'Transitions for a hair-pin bend', given: 'Δ 165°, 25 km/h; inner R 20 m, 7.5 m at the apex, 4.75 m on the straights', parts: HAIR, h0: Math.PI / 2 - 7.5 * RAD,
    marks: [['T.P.', 35], ['C.T.', 35 + Lh], ['T.C.', 35 + 23.75 * 165 * RAD], ['P.T.', 35 + 23.75 * 165 * RAD + Lh]],
    steps: [
      { text: 'Inner edge fully transitional: θ = 82.5°, Table 12 R = 0.3473 Ls, so Ls = 20 / 0.3473 = 57.587 m.', mark: 'T.P.' },
      { text: 'Centre line, R 23.75 m: shift 5.046 m, θc = 66.25°, Ls = 54.921 m.', mark: 'C.T.' },
      { text: 'Outer edge, R 27.5 m: shift 3.671 m, θ = 52.04°, Ls = 49.964 m; its K is 24.28 m (0.486 × 49.964).', mark: 'T.C.' },
    ],
    answers: [
      { label: 'Inner edge Ls', book: 57.587, value: () => H.kin.Ls, unit: 'm', digits: 3, tol: .01 },
      { label: 'Centre line Ls', book: 54.921, value: () => H.kmid.Ls, unit: 'm', digits: 3, tol: .02 },
      { label: 'Outer edge Ls', book: 49.964, value: () => H.kout.Ls, unit: 'm', digits: 3, tol: .02 },
    ] },
];

export default {
  cam: { pos: [3, 41, 37], look: [3.5, 0, -2], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims(), group = new THREE.Group();
    const st = { ex: 0, step: -1 };
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 34, 51); group.add(forest);
    const line = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .08 }); group.add(line);
    const pegMat = new THREE.MeshStandardMaterial({ color: 0xb0532a, roughness: .5 });
    const pegs = Array.from({ length: 4 }, () => {
      const g = new THREE.Group(), m = new THREE.Mesh(new THREE.CylinderGeometry(.11, .14, 1, 8), pegMat); m.position.y = .5; m.castShadow = true;
      const l = holo.label(' ', { h: .7, color: '#14202b', bg: 'rgba(255,253,248,.94)', weight: 700 }); l.position.y = 1.7; g.add(m, l); g.userData.label = l; group.add(g); return g;
    });
    let road = null;
    const E = () => EXAMPLES[st.ex];

    const card = textPlane({ w: 10, h: 7.6, px: 46, draw: (c, W, Hh) => {
      const ex = E(); cardBg(c, W, Hh); c.textAlign = 'left';
      c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText(`EXAMPLE ${ex.id}`, 18, 26);
      c.fillStyle = '#14202b'; c.font = `700 17px ${F}`; let y = 50; for (const l of wrapText(c, ex.title, W - 36).slice(0, 2)) { c.fillText(l, 18, y); y += 21; }
      c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; for (const l of wrapText(c, 'Given: ' + ex.given, W - 36).slice(0, 2)) { c.fillText(l, 18, y); y += 18; }
      y += 6;
      const shown = ex.steps.slice(0, st.step + 1);
      c.font = `500 15px ${F}`;
      for (let i = Math.max(0, shown.length - 3); i < shown.length; i++) {
        c.fillStyle = i === st.step ? '#8a3f1c' : '#5c6168';
        for (const l of wrapText(c, `${i + 1}. ${shown[i].text}`, W - 36).slice(0, 2)) { c.fillText(l, 18, y); y += 18; }
        y += 3;
      }
      if (st.step < 0) { c.fillStyle = '#5c6168'; c.fillText('Press "Next step" to work it.', 18, y); }
      const done = st.step >= ex.steps.length - 1, top = Hh - 26 - ex.answers.length * 22;
      c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(18, top - 22, W - 36, 1.5);
      c.fillStyle = '#5c6168'; c.font = `600 12px ${F}`; c.fillText('RESULT', 18, top - 6); c.textAlign = 'right'; c.fillText('BOOK PRINTS', W - 150, top - 6); c.fillText('EXACT', W - 40, top - 6); c.textAlign = 'left';
      ex.answers.forEach((a, i) => {
        const yy = top + 16 + i * 22, v = a.value(), ok = okOf(a, v);
        c.font = `500 14px ${F}`; c.fillStyle = '#14202b'; c.fillText(a.label, 18, yy);
        c.textAlign = 'right'; c.font = `700 14px ${F}`; c.fillStyle = ok || !done ? '#14202b' : '#b3362b'; c.fillText(`${a.book.toFixed(a.digits ?? 2)} ${a.unit || ''}`, W - 150, yy);
        c.fillStyle = done ? '#1f7a45' : '#c9ced3'; c.fillText(done ? `${v.toFixed(a.digits ?? 2)} ${a.unit || ''}` : '…', W - 40, yy);
        c.fillText(done ? (ok ? '✓' : '!') : '', W - 18, yy); c.textAlign = 'left';
      });
      const bad = done && ex.answers.find(a => !okOf(a, a.value()));
      if (bad?.note) { c.fillStyle = '#b3362b'; c.font = `600 12px ${F}`; c.fillText(bad.note, 18, Hh - 8); }
    } });
    card.position.set(5.1, 2.9, 10.3); card.rotation.x = -.6; group.add(card);

    function setup() {
      const ex = E(), al = alignment(ex.parts, { h0: ex.h0 ?? 0, ds: .5 }), pts = al.pts.map(p => [p[0], p[1]]);
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const S = Math.min(.2, 20 / (Math.max(...xs) - Math.min(...xs) + 16), 15 / (Math.max(...ys) - Math.min(...ys) + 16));
      const P = (q, h = 0) => new THREE.Vector3((q[0] - cx) * S, GROUND + h, -(q[1] - cy) * S - 6);
      if (road) group.remove(road.group); road = makeRoad(P, S); group.add(road.group); road.set(pts);
      holo.setPoints(line, pts.map(q => P(q, .06)));
      pegs.forEach((g, i) => { const m = ex.marks[i]; g.visible = !!m; if (!m) return; g.position.copy(P(pts[Math.min(pts.length - 1, Math.round(m[1] / .5))])); g.userData.label.userData.setText(m[0]); g.userData.name = m[0]; });
      const near = pts.filter((_, i) => i % 4 === 0).map(q => P(q)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.3));
      card.redraw();
    }
    const pick = i => { st.ex = i; st.step = -1; setup(); guide.say(`Example ${E().id}: ${E().title}.`); };
    const next = () => {
      const ex = E(); if (st.step >= ex.steps.length - 1) return;
      st.step++; const s = ex.steps[st.step], g = pegs.find(p => p.visible && p.userData.name === s.mark);
      if (g) pulse(anims, g, 1.5, .5);
      card.redraw(); guide.say(s.text); ctx.snd?.play('tick');
    };
    const actions = [
      ...EXAMPLES.map((ex, i) => ({ label: `Ex ${ex.id}`, toggle: () => st.ex === i, run: () => pick(i) })),
      { label: 'Next step', run: next },
      { label: 'Show all', run: () => { st.step = E().steps.length - 1; card.redraw(); } },
    ];
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.5 : 5.1; card.scale.setScalar(tall ? .8 : 1);
      },
      reset() { anims.clear(); pick(0); guide.reset(); },
      get debug() { const ex = E(); return { ex: ex.id, step: st.step, answers: ex.answers.map(a => ({ label: a.label, book: a.book, exact: +a.value().toFixed(a.digits ?? 2), ok: okOf(a, a.value()) })), guide: guide.debug }; },
    };
    const L = EXAMPLES.map(e => `Ex ${e.id}`);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Pick one', show: L, text: 'Examples 11.33 to 11.40: compound transitions, reverse curves and a hair-pin. Pick one: the site lays out its alignment.' },
        { title: 'Work it', show: [...L, 'Next step'], text: 'Press "Next step" to follow the book’s working one line at a time; the pegs it names light up.' },
        { title: 'Check it', show: [...L, 'Next step', 'Show all'], text: 'At the end the card sets each printed result beside the exact geometry, and flags the slips.',
          check: { q: 'In Example 11.33 the offset Pa is printed 0.03156 m. The right value is…', options: ['0.3157 m', '0.0316 m', '3.157 m'], answer: 0, why: 'Table 12 gives 0.00574 for θa = 3.939°; 0.00574 × 55 = 0.3157 m. The slip carries into T1, T2 and Example 11.34.' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    setup();
    return api;
  },
};
