// Spreads 2–5 · The compound transition (cl. 8.3–8.6, Examples 11.33–11.37). A spiral of La 55 m joins a 600 m curve
// to a 240 m curve (curve.js alignment, curvature varying with length). Plan frame: C.S.1 at the origin, its tangent
// along +x; offsets across the curve drawn 8× true (an affine stretch, so sight lines stay straight).
//   'geometry' Pa between the two circles produced, the tangents at C.S.1 and C.S.2 meeting at I (Ex 11.33)
//   'offsets'  pegs offset from the circles: Pa/2 at the middle, the cube of the distance elsewhere (Ex 11.34)
//   'deflect'  deflections from C.S.1: circular for R1 plus the spiral term, 5 or 10 chords (Ex 11.35, 11.36)
//   'station'  instrument moved to point 6 (Ex 11.37): the book's radius there against the spiral's
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { alignment, meet, deg } from '../../_irc38/curve.js';
import { diorama, trees, worker, theodolite } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, YX = 8, S = .2, DS = .05;
const R1 = 600, R2 = 240, La = 55;
const dms = d => { const s = Math.abs(d) * 3600, a = Math.floor(s / 3600 + 1e-9), m = Math.floor((s - a * 3600) / 60 + 1e-9), r = s - a * 3600 - m * 60; return `${a}°${String(m).padStart(2, '0')}′${r.toFixed(0).padStart(2, '0')}″`; };
const thA = deg(La / 2 * (1 / R2 - 1 / R1));   // equivalent spiral angle, 28.65 La (1/R2 − 1/R1)

// the spiral alone, C.S.1 at the origin heading 0; dense, so the point at distance L is spiral.pts[L / DS]
const spiral = alignment([{ len: La, k0: 1 / R1, k1: 1 / R2 }], { ds: DS });
const at = L => spiral.pts[Math.round(L / DS)];
const O1 = [0, -R1], end = spiral.end, C2 = [end.x + Math.sin(end.h) * R2, end.y - Math.cos(end.h) * R2];
const PaExact = (R1 - R2) - Math.hypot(C2[0] - O1[0], C2[1] - O1[1]);
const I = meet([0, 0], 0, [end.x, end.y], end.h), T1 = Math.hypot(...I), T2 = Math.hypot(end.x - I[0], end.y - I[1]);
const ang = (from, h, to) => { let d = Math.atan2(to[1] - from[1], to[0] - from[0]) - h; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d); };
const R6 = 1 / (1 / R1 + 33 / La * (1 / R2 - 1 / R1));   // radius at point 6 of the spiral: curvature varies with length

const BOOK = {
  d5: [.577736, 1.071487, 2.0484586, 2.9415402, 3.9398268], bad5: [1],
  d10: [.2755963, .5776066, .906048, 1.2604314, 1.6412612, 2.0485126, 2.4818421, 2.9415042, 3.4276516, 3.9398468],
  st: { pts: [0, 7, 8, 9, 10], a: [2.0485126, .4233148, .8730587, 1.3492287, 1.8514599] },
};

export function compoundSpread(mode) {
  return {
    cam: { pos: [3, 40, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const st = { five: false, k: 0, t: 0, run: true };
      const ox = -4.5, oz = -9;
      const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S * YX);
      const onSlab = q => { const v = P(q); return v.x > SLAB.x0 + .3 && v.x < SLAB.x1 - .3 && v.z > SLAB.z0 + .3 && v.z < SLAB.z1 - .3; };
      const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
      const forest = trees(slab, 30, 47); group.add(forest);
      const line = (col, w, dashed) => { const l = holo.polyline([[0, 0, 0], [1, 0, 0]], col, { width: w, dashed }); group.add(l); return l; };
      const c1 = line(holo.CYAN, .06, true), c2 = line(holo.AMBER, .06, true), sp = line(holo.RED, .1, false), tg = line(holo.DIM, .05, true);
      const segs = holo.segments([[0, 0, 0], [0, 0, 0]], holo.GREEN, .9, { width: .06 }); group.add(segs);
      const sights = holo.segments([[0, 0, 0], [0, 0, 0]], holo.CYAN, .95, { width: .07, dashed: true }); group.add(sights);
      const chords = holo.segments([[0, 0, 0], [0, 0, 0]], holo.AMBER, .95, { width: .08 }); group.add(chords);
      const lab = (t, col = '#14202b', h = .58) => { const l = holo.label(t, { h, color: col, bg: 'rgba(255,253,248,.92)', weight: 700 }); group.add(l); return l; };
      const tags = { cs1: lab('C.S.1'), cs2: lab('C.S.2'), r1: lab('600 m circle', '#24557a', .52), r2: lab('240 m circle', '#8a3f1c', .52), pa: lab('Pa', '#2f8f55', .55), I: lab('I', '#14202b', .55) };
      const pegMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .7 }), capMat = new THREE.MeshStandardMaterial({ color: 0xc23b2f, roughness: .5 });
      const pegGeo = new THREE.CylinderGeometry(.06, .08, .5, 8), capGeo = new THREE.CylinderGeometry(.1, .1, .1, 8);
      const pegs = [...Array(14)].map(() => { const g = new THREE.Group(), p = new THREE.Mesh(pegGeo, pegMat), c = new THREE.Mesh(capGeo, capMat); p.position.y = .25; c.position.y = .53; g.add(p, c); g.visible = false; group.add(g); return g; });
      const crew = worker(1.15); group.add(crew); crew.visible = mode !== 'geometry';
      const theo = theodolite(1.3); theo.visible = mode === 'deflect' || mode === 'station'; group.add(theo);

      // the pegs in order, each with what the book prints and the exact value
      function plan() {
        const out = [];
        if (mode === 'offsets') {
          const fromC1 = x => { const q = at(x), r = Math.hypot(q[0] - O1[0], q[1] - O1[1]); return { q, foot: [O1[0] + (q[0] - O1[0]) * R1 / r, O1[1] + (q[1] - O1[1]) * R1 / r], off: R1 - r }; };
          const fromC2 = x => { const q = at(La - x), r = Math.hypot(q[0] - C2[0], q[1] - C2[1]); return { q, foot: [C2[0] + (q[0] - C2[0]) * R2 / r, C2[1] + (q[1] - C2[1]) * R2 / r], off: r - R2 }; };
          [[10, .00076], [20, .006]].forEach(([x, b]) => out.push({ n: `${x} m from C.S.1`, ...fromC1(x), book: b, bad: true }));
          out.push({ n: 'middle: Pa/2', ...fromC1(La / 2), book: .03156 / 2, bad: true });
          [[20, .006], [10, .00076]].forEach(([x, b]) => out.push({ n: `${x} m from C.S.2`, ...fromC2(x), book: b, bad: true }));
        }
        if (mode === 'deflect') { const n = st.five ? 5 : 10; for (let i = 1; i <= n; i++) { const L = La * i / n, q = at(L); out.push({ n: i === n ? 'C.S.2' : i, q, book: (st.five ? BOOK.d5 : BOOK.d10)[i - 1], bad: st.five && BOOK.bad5.includes(i - 1), calc: deg(ang([0, 0], 0, q)) }); } }
        if (mode === 'station') {
          for (let i = 1; i <= 6; i++) out.push({ n: i, q: at(5.5 * i), pre: true });
          const p6 = at(33), h6 = p6[2];
          BOOK.st.pts.forEach((i, j) => { const q = at(5.5 * i), back = i < 6; out.push({ n: i === 0 ? 'C.S.1' : i === 10 ? 'C.S.2' : i, q, book: BOOK.st.a[j], calc: deg(ang(p6, back ? h6 + Math.PI : h6, q)), bad: true }); });
        }
        return out;
      }
      let steps = plan();

      const card = textPlane({ w: 9.8, h: 7.2, px: 46, draw: (c, W, H) => {
        cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 15px ${F}`;
        const head = { geometry: 'EXAMPLE 11.33 · THE COMPOUND TRANSITION', offsets: 'EXAMPLE 11.34 · OFFSETS FROM THE CIRCLES', deflect: st.five ? 'EXAMPLE 11.35 · FIVE CHORDS FROM C.S.1' : 'EXAMPLE 11.36 · TEN CHORDS FROM C.S.1', station: 'EXAMPLE 11.37 · INSTRUMENT AT POINT 6' }[mode];
        c.fillText(head, 18, 24); c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText(`R1 600 m → R2 240 m · La 55 m · θa = 28.65 La (1/R2 − 1/R1) = ${thA.toFixed(3)}°`, 18, 42);
        c.font = `600 11px ${F}`; c.textAlign = 'right'; c.fillText('BOOK PRINTS', W - 150, 62); c.fillText('EXACT', W - 30, 62); c.textAlign = 'left';
        const rows = mode === 'geometry' ? [
          ['Pa = 0.00574 × 55 (Table 12)', '0.03156 m', `${PaExact.toFixed(4)} m`, true],
          ['Δ1 = 28.65 × 55 / 600', '2°37′35″', dms(deg(La / (2 * R1))), false],
          ['Δ2 = 28.65 × 55 / 240', '6°33′56″', dms(deg(La / (2 * R2))), false],
          ['AB = R2 exsec Δ2 − R1 exsec Δ1 − Pa', '0.9218 m', `${(R2 * (1 / Math.cos(La / (2 * R2)) - 1) - R1 * (1 / Math.cos(La / (2 * R1)) - 1) - PaExact).toFixed(4)} m`, true],
          ['T1 = R1 tan Δ1 + AI', '33.252 m', `${T1.toFixed(3)} m`, true],
          ['T2 = R2 tan Δ2 − BI', '−21.855 m', `${T2.toFixed(3)} m`, true],
        ] : steps.filter(s => !s.pre).map(s => [String(s.n), mode === 'offsets' ? `${s.book.toFixed(5)} m` : `${s.book.toFixed(5)}°`, steps.indexOf(s) < st.k ? (mode === 'offsets' ? `${s.off.toFixed(4)} m` : `${s.calc.toFixed(5)}°`) : '…', s.bad, steps.indexOf(s) === st.k - 1]);
        const rh = mode === 'deflect' && !st.five ? 16 : 22;
        rows.forEach(([a, b, v, bad, now], i) => { const y = 82 + i * rh; if (now) { c.fillStyle = 'rgba(36,85,122,.12)'; c.fillRect(14, y - 12, W - 28, rh - 2); } c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`; c.fillText(a, 18, y); c.textAlign = 'right'; c.font = `700 13px ${F}`; c.fillStyle = bad ? '#b3362b' : '#14202b'; c.fillText(b, W - 150, y); c.fillStyle = v === '…' ? '#c9ced3' : '#1f7a45'; c.fillText(v, W - 30, y); c.fillStyle = '#b3362b'; c.fillText(bad && v !== '…' ? '!' : '', W - 16, y); c.textAlign = 'left'; });
        const note = {
          geometry: '0.00574 × 55 = 0.3157, not 0.03156: AB, AI, BI, T1, T2 all follow it, and T2 is printed negative. Exact: I is where the tangents at C.S.1 and C.S.2 meet.',
          offsets: 'Pa/2 at the middle, Pa/2 × (x / ½La)³ elsewhere, in from the 600 m curve and out from the 240 m one. The book’s values use the wrong Pa (and a 60 m column beyond the spiral).',
          deflect: st.five ? 'Circular deflection for 600 m plus L² × θa / 3La². Point 2 prints 22² = 489 and 0.0210056 for 484 and 0.210056.' : 'Circular deflection for 600 m plus Table 14’s i²/300 × θa: the book’s method agrees with the exact spiral to 0.001°.',
          station: `The book takes the radius as varying with length: 384 m at point 6 (printed 3.3/55). On a spiral the curvature varies: ${R6.toFixed(0)} m. Forward angles grow a fifth; the backsight differs too.`,
        }[mode];
        c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; let y = H - 44, ln = '';
        for (const w of note.split(' ')) { const t = ln ? ln + ' ' + w : w; if (c.measureText(t).width > W - 36) { c.fillText(ln, 18, y); y += 15; ln = w; } else ln = t; }
        c.fillText(ln, 18, y);
        c.fillText('Red: confirmed on the page. Offsets drawn 8× true.', 18, H - 6);
      } });
      card.position.set(5.1, 2.9, 10.3); card.rotation.x = -.6; group.add(card);

      function rebuild() {
        steps = plan(); st.k = steps.filter(s => s.pre).length; st.t = 0;
        // the two circles produced, the spiral, and (geometry) the tangents to I
        const circ = (C, R, a0, a1) => { const o = []; for (let i = 0; i <= 120; i++) { const a = a0 + (a1 - a0) * i / 120; o.push([C[0] + R * Math.sin(a), C[1] + R * Math.cos(a)]); } return o.filter(onSlab); };
        const a2 = Math.atan2(end.x - C2[0], end.y - C2[1]);
        holo.setPoints(c1, circ(O1, R1, -40 / R1, 100 / R1).map(q => P(q, .04)));
        holo.setPoints(c2, circ(C2, R2, a2 - 70 / R2, a2 + 25 / R2).map(q => P(q, .05)));
        holo.setPoints(sp, spiral.pts.filter((_, i) => i % 10 === 0).map(q => P(q, .08)));
        tg.visible = tags.I.visible = mode === 'geometry';
        if (mode === 'geometry') { holo.setPoints(tg, [P([0, 0], .06), P(I, .06), P([end.x, end.y], .06)]); tags.I.position.copy(P(I, 1)); }
        // Pa: from the 600 m circle, square to it, at the common radius (middle of the spiral) out to the 240 m circle
        const m = at(La / 2), r = Math.hypot(m[0] - O1[0], m[1] - O1[1]), u = [(m[0] - O1[0]) / r, (m[1] - O1[1]) / r];
        const onC1 = [O1[0] + u[0] * R1, O1[1] + u[1] * R1], onC2 = [O1[0] + u[0] * (R1 - PaExact), O1[1] + u[1] * (R1 - PaExact)];
        tags.pa.visible = mode === 'geometry'; tags.pa.position.copy(P([m[0] - 6, m[1] - .9], 1.1));
        tags.cs1.position.copy(P([0, .7], 1)); tags.cs2.position.copy(P([end.x + 2, end.y + .7], 1));
        tags.r1.position.copy(P([80, -80 * 80 / 1200 + .4], 1)); tags.r2.position.copy(P([end.x - 52, end.y - 1.6], 1));
        segs.userData.pa = mode === 'geometry' ? [P(onC1, .1), P(onC2, .1)] : null;
        const near = [...spiral.pts.filter((_, i) => i % 40 === 0), ...circ(O1, R1, -40 / R1, 100 / R1).filter((_, i) => i % 6 === 0)].map(q => P(q)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.6));
        theo.position.copy(P(mode === 'station' ? at(33) : [0, 0]));
        draw(); card.redraw();
      }
      function draw() {
        pegs.forEach(p => { p.visible = false; });
        const of = segs.userData.pa ? [...segs.userData.pa] : [], si = [], ch = [];
        const S0 = mode === 'station' ? at(33) : [0, 0];
        steps.slice(0, st.k).forEach((s, j) => {
          pegs[j].visible = true; pegs[j].position.copy(P(s.q, 0));
          if (s.pre) return;
          if (mode === 'offsets') of.push(P(s.foot, .06), P(s.q, .06));
          if (mode === 'deflect' || mode === 'station') { si.push(P(S0, .3), P(s.q, .05)); const prev = j && !steps[j - 1].pre ? steps[j - 1].q : S0; ch.push(P(prev, .06), P(s.q, .06)); }
        });
        const set = (l, a) => { l.visible = a.length > 0; if (a.length) holo.setPoints(l, a); };
        set(segs, of); set(sights, si); set(chords, ch);
        const cur = steps[st.k - 1]; if (cur) crew.position.copy(P([cur.q[0] + 2, cur.q[1] - .5]));
        if ((mode === 'deflect' || mode === 'station') && cur && !cur.pre) theo.userData.head.rotation.y = Math.atan2((cur.q[1] - S0[1]) * YX, cur.q[0] - S0[0]);
      }
      const restart = () => { st.k = steps.filter(s => s.pre).length; st.t = 0; st.run = true; draw(); card.redraw(); };
      const actions = mode === 'geometry' ? [] : [
        { label: 'Set out', run: restart },
        { label: 'Next peg', run: () => { st.run = false; if (st.k < steps.length) { st.k++; draw(); card.redraw(); } } },
        ...(mode === 'deflect' ? [{ label: '10 chords (11.36)', toggle: () => !st.five, run: () => { st.five = false; rebuild(); } }, { label: '5 chords (11.35)', toggle: () => st.five, run: () => { st.five = true; rebuild(); } }] : []),
      ];
      const api = {
        group, targets: [], actions,
        tap(hit) { guide.tap(hit); },
        a11y: actions.map(a => ({ label: a.label, run: a.run })),
        update(dt) {
          anims.tick(dt);
          if (st.run && st.k < steps.length && (st.t += dt) > .8) { st.t = 0; st.k++; draw(); card.redraw(); }
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          card.position.x = tall ? 3.5 : 5.1; card.scale.setScalar(tall ? .8 : 1);
        },
        reset() { anims.clear(); Object.assign(st, { five: false, run: true }); rebuild(); guide.reset(); },
        get debug() { return { mode, five: st.five, pegs: st.k, of: steps.length, Pa: +PaExact.toFixed(4), T1: +T1.toFixed(3), T2: +T2.toFixed(3), R6: +R6.toFixed(1), rows: steps.filter(s => !s.pre).map(s => [s.n, s.book, +(mode === 'offsets' ? s.off : s.calc).toFixed(5)]), guide: guide.debug }; },
      };
      const L = actions.map(a => a.label);
      const STEPS = {
        geometry: [
          { title: 'Two circles', show: [], text: 'The 600 m circle (blue) and the 240 m circle (amber) are produced past each other. The spiral (red) joins them; the gap between the circles at the common radius is Pa.',
            check: { q: 'The common radius of the compound transition…', options: ['bisects the spiral', 'lies at C.S.1', 'lies at C.S.2'], answer: 0, why: 'The compound transition behaves like a tangent-to-curve transition with degree equal to the difference of degrees; the common radius bisects the spiral (cl. 8.4).' } },
          { title: 'Tangents', show: [], text: 'The tangents at C.S.1 and C.S.2 meet at I: T1 and T2 locate the spiral from the two curves.',
            check: { q: 'The sharper curve of a compound pair lies…', options: ['inside the flatter one', 'outside the flatter one', 'on the same circle'], answer: 0, why: 'With a transition between curves of different radii, the sharper curve lies inside the flatter (cl. 8.1).' } },
        ],
        offsets: [
          { title: 'From the circles', show: L, text: 'With both circles laid out first, each peg is offset from the nearer circle: in from the 600 m, out from the 240 m.',
            check: { q: 'At the middle of the compound spiral the offset is…', options: ['Pa / 2', 'Pa', 'zero'], answer: 0, why: 'Pa/2 at mid-spiral; elsewhere Pa/2 × (distance from the nearer C.S. / half the length)³ (cl. 8.6, method 1).' } },
        ],
        deflect: [
          { title: 'Two terms', show: L, text: 'From C.S.1 each deflection is the circular deflection for 600 m plus the spiral term of the equivalent angle θa.',
            check: { q: 'At C.S.1, the circular part of the deflection uses the radius…', options: ['R1, the flatter', 'R2, the sharper', 'their mean'], answer: 0, why: 'Circular-curve deflections for the radius at the set-up point: R1 at C.S.1, R2 at C.S.2 (cl. 8.6, method 2).' } },
        ],
        station: [
          { title: 'From point 6', show: L, text: 'The curve beyond point 6 is hidden from C.S.1, so the instrument moves to point 6. Compare the book’s deflections with the spiral’s.',
            check: { q: 'Along a spiral, what varies directly with the length?', options: ['the curvature 1/R', 'the radius R', 'the deflection'], answer: 0, why: 'L R = constant on a simple spiral (cl. 7.5.2), so curvature, not radius, varies linearly; cl. 8.6 writes the radius, which gives 384 m at point 6 instead of 316 m.' } },
        ],
      };
      const guide = makeGuide(ctx, { anchor: [-5.4, 2.2, 10.5], w: 10, h: 5, steps: STEPS[mode] });
      guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
      card.userData.zoom = true; api.targets.push(card);
      rebuild();
      return api;
    },
  };
}

export default compoundSpread('geometry');

// exact geometry reused by the worked-examples spread
export const GEO = { thA, PaExact, T1, T2, R6, at };
