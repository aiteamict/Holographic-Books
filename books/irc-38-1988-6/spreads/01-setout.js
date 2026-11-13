// Spreads 1–5 · Setting out a transition (cl. 7.8, 7.9, Examples 11.17–11.24). The site before the road: grass, the
// design centre line dashed, the main tangent dotted. A crew pegs the ten-chord spiral one peg at a time; the field book
// card sets what the book prints beside the exact spiral, and flags the misprints confirmed on the page.
//   'tangent'  offsets from the main tangent (Ex 11.17), then the L.T. / S.T. / L.C. check
//   'parallel' first five from the tangent, the rest from a line through P.C. (Ex 11.18)
//   'quarter'  odd length (Ex 11.19): quarter-point offsets Yc/64, Yc/8, 27Yc/64 (Ex 11.20) against the true spiral
//   'polar'    polar deflections from T.P., chords swung onto the sight lines (Ex 11.21; odd length Ex 11.22)
//   'station'  from C.T. backwards (Ex 11.23) or with the instrument moved to point 6 (Ex 11.24)
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { spiralXY } from '../../_irc38/curve.js';
import { diorama, trees, worker, theodolite } from '../../_irc38/site.js';

const YX = 5;   // offsets across the tangent drawn 5× true, as the book's figures do
const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, DEG = 180 / Math.PI;
const dms = d => { const s = Math.abs(d) * 3600, a = Math.floor(s / 3600 + 1e-9), m = Math.floor((s - a * 3600) / 60 + 1e-9), r = s - a * 3600 - m * 60; return `${a}°${String(m).padStart(2, '0')}′${r.toFixed(0).padStart(2, '0')}″`; };
const toDeg = (d, m, s) => d + m / 60 + s / 3600;
// what the book prints (Table 11 / Tables 11.4–11.9 of the examples); bad: confirmed misprints
const CURVES = { std: { Ls: 55, R: 170 }, odd: { Ls: 58.468, R: 125 }, ex5: { Ls: 62.8548, R: 155 } };
const PRINT = {
  tangent: { X: [5.5, 11, 16.5, 21.999, 27.495, 32.989, 38.476, 43.953, 49.415, 54.856], Y: [.003, .024, .080, .190, .371, .640, 1.017, 1.517, 2.159, 2.96] },
  parallel: { X: [5.513, 11, 16.477, 21.939, 27.38], Y: [-.101, .276, .776, 1.418, 2.219] },
  quarter: { X: [19.536, 29.073, 43.61, 58.146], Y: [.071, .568, 1.917, 4.543], bad: [0] },
  polar: [[0, 1, 51], [0, 7, 24], [0, 16, 40], [0, 29, 39], [0, 46, 20], [1, 6, 43], [1, 30, 49], [1, 58, 37], [2, 30, 7], [3, 5, 19]].map(a => toDeg(...a)),
  polarOdd: [[0, 2, 39.2], [0, 10, 41.6], [0, 24, 7.2], [0, 42, 51.2], [1, 6, 58.4], [1, 36, 28.8], [2, 11, 17.6], [2, 51, 29.6], [3, 37, 4.8], [4, 27, 58.4]].map(a => toDeg(...a)),
  fromCT: { pts: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], a: [[1, 7, 22.8], [2, 10, 10], [3, 8, 14.6], [4, 1, 43.5], [4, 5, 31.39], [5, 34, 39.36], [6, 14, 48.88], [6, 9, 2.83], [7, 19, 14], [7, 44, 1]].map(a => toDeg(...a)), bad: [4, 6, 7, 9] },
  from6: { pts: [5, 4, 3, 2, 1, 0, 7, 8, 9, 10], a: [[0, 39, 32], [1, 14, 23], [1, 44, 35], [2, 10, 10], [2, 31, 5], [2, 47, 2], [0, 46, 13], [1, 32, 56], [2, 26, 24], [3, 24, 29]].map(a => toDeg(...a)), bad: [5, 6] },
};

export function setoutSpread(mode) {
  return {
    cam: { pos: [3, 40, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const st = { odd: false, at6: false, k: 0, t: 0, run: true };
      const cv = () => mode === 'quarter' ? CURVES.odd : mode === 'station' ? CURVES.ex5 : mode === 'polar' && st.odd ? CURVES.odd : CURVES.std;
      let S = .25;
      const ox = -10, oz = 3;
      const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S * YX);
      const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
      const forest = trees(slab, 30, 61); group.add(forest);
      const design = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.DIM, { width: .05, dashed: true }); group.add(design);
      const tangentLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .04, dashed: true }); group.add(tangentLine);
      const tapes = holo.segments([[0, 0, 0], [0, 0, 0]], holo.AMBER, .9, { width: .06 }); group.add(tapes);
      const offs = holo.segments([[0, 0, 0], [0, 0, 0]], holo.GREEN, .9, { width: .06 }); group.add(offs);
      const sights = holo.segments([[0, 0, 0], [0, 0, 0]], holo.CYAN, .7, { width: .04, dashed: true }); group.add(sights);
      const checks = holo.segments([[0, 0, 0], [0, 0, 0]], holo.RED, .9, { width: .06 }); group.add(checks);
      const truth = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.CYAN, { width: .05 }); truth.visible = mode === 'quarter'; group.add(truth);
      const pegMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .7 }), capMat = new THREE.MeshStandardMaterial({ color: 0xc23b2f, roughness: .5 });
      const pegGeo = new THREE.CylinderGeometry(.06, .08, .5, 8), capGeo = new THREE.CylinderGeometry(.1, .1, .1, 8);
      // 17: the instrument-at-6 plan has 6 pegs already in plus 10 more
      const pegs = [...Array(17)].map(() => { const g = new THREE.Group(), p = new THREE.Mesh(pegGeo, pegMat), c = new THREE.Mesh(capGeo, capMat); p.position.y = .25; c.position.y = .53; p.castShadow = true; g.add(p, c); g.visible = false; group.add(g); return g; });
      const tag = (t, col = '#14202b', h = .6) => { const l = holo.label(t, { h, color: col, bg: 'rgba(255,253,248,.92)', weight: 700 }); group.add(l); return l; };
      const tags = { TP: tag('T.P.'), CT: tag('C.T.'), PC: tag('P.C.', '#8a3f1c', .55), LT: tag('L.T.', '#c23b2f', .55) };
      const crew = worker(.75); group.add(crew);
      const theo = theodolite(.8); theo.visible = mode === 'polar' || mode === 'station'; group.add(theo);

      const pt = f => { const c = cv(), q = spiralXY(c.Ls * f, c.Ls, c.R); return [q.x, q.y]; };
      const end = () => spiralXY(cv().Ls, cv().Ls, cv().R);
      const ths = () => cv().Ls / (2 * cv().R);
      const K = () => { const e = end(); return e.x - cv().R * Math.sin(e.theta); }, sh = () => { const e = end(); return e.y - cv().R * (1 - Math.cos(e.theta)); };
      const LT = () => { const e = end(); return e.x - e.y / Math.tan(e.theta); }, ST = () => { const e = end(); return e.y / Math.sin(e.theta); };
      const station = () => mode === 'station' ? (st.at6 ? 6 : 10) : 0;
      // the deflection measured at chord point b from its tangent (backwards: from the tangent turned back) to point a
      const deflect = (b, a) => { const P0 = pt(b), Q = pt(a), h = spiralXY(cv().Ls * b, cv().Ls, cv().R).theta, ch = Math.atan2(Q[1] - P0[1], Q[0] - P0[0]); const d = Math.abs(ch - h); return a < b ? Math.PI - d : d; };
      // the pegs in order: where each goes, what the book prints, and the exact value
      function plan() {
        const out = [];
        if (mode === 'tangent') for (let i = 1; i <= 10; i++) { const q = pt(i / 10); out.push({ n: i, q, book: [PRINT.tangent.X[i - 1], PRINT.tangent.Y[i - 1]], calc: q }); }
        if (mode === 'parallel') {
          for (let i = 1; i <= 5; i++) { const q = pt(i / 10); out.push({ n: i, q, calc: q, book: [PRINT.tangent.X[i - 1], PRINT.tangent.Y[i - 1]] }); }
          out.push({ n: 'P.C.', q: [K(), sh()], calc: [K(), sh()], book: [27.476, .741], pc: true });
          for (let i = 6; i <= 10; i++) { const q = pt(i / 10); out.push({ n: i, q, calc: [q[0] - K(), q[1] - sh()], book: [PRINT.parallel.X[i - 6], PRINT.parallel.Y[i - 6]], par: true }); }
        }
        if (mode === 'quarter') { const e = end(); [.25, .5, .75, 1].forEach((f, j) => { const q = [e.x * f, e.y * f ** 3]; out.push({ n: ['¼', '½', '¾', 'C.T.'][j], q, calc: q, book: [PRINT.quarter.X[j], PRINT.quarter.Y[j]], bad: PRINT.quarter.bad.includes(j) }); }); }
        if (mode === 'polar') for (let i = 1; i <= 10; i++) { const q = pt(i / 10); out.push({ n: i, q, ang: Math.atan2(q[1], q[0]) * DEG, book: (st.odd ? PRINT.polarOdd : PRINT.polar)[i - 1] }); }
        if (mode === 'station') {
          const T = st.at6 ? PRINT.from6 : PRINT.fromCT, b = station() / 10;
          if (st.at6) for (let i = 1; i <= 6; i++) out.push({ n: i, q: pt(i / 10), pre: true }); else out.push({ n: 'C.T.', q: pt(1), pre: true });
          T.pts.forEach((i, j) => out.push({ n: i === 0 ? 'T.P.' : i, q: pt(i / 10), ang: deflect(b, i / 10) * DEG, book: T.a[j], bad: T.bad.includes(j) }));
        }
        return out;
      }
      let steps = plan();

      const card = textPlane({ w: 9.8, h: 7.2, px: 46, draw: (c, W, H) => {
        cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 15px ${F}`;
        const C = cv(), head = { tangent: 'EXAMPLE 11.17 · OFFSETS FROM THE MAIN TANGENT', parallel: 'EXAMPLE 11.18 · FROM A LINE THROUGH P.C.', quarter: 'EXAMPLES 11.19–11.20 · QUARTER POINTS', polar: st.odd ? 'EXAMPLE 11.22 · POLAR DEFLECTIONS, ODD LENGTH' : 'EXAMPLE 11.21 · POLAR DEFLECTIONS FROM T.P.', station: st.at6 ? 'EXAMPLE 11.24 · INSTRUMENT MOVED TO POINT 6' : 'EXAMPLE 11.23 · FROM C.T. BACKWARDS' }[mode];
        c.fillText(head, 18, 24); c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText(`Rc ${C.R} m · Ls ${C.Ls} m · θs ${(ths() * DEG).toFixed(3)}° · ten chords of ${(C.Ls / 10).toFixed(3)} m`, 18, 42);
        const angular = mode === 'polar' || mode === 'station', rows = steps.filter(s => !s.pre), y0 = 64, rh = 17;
        c.font = `600 11px ${F}`; c.fillStyle = '#5c6168'; c.fillText('POINT', 18, y0);
        c.textAlign = 'right'; c.fillText(angular ? 'BOOK PRINTS' : mode === 'parallel' ? 'BOOK X, Y (or X′, Y′)' : 'BOOK X, Y', W - (angular ? 150 : 160), y0); c.fillText(angular ? 'EXACT SPIRAL' : 'EXACT', W - 30, y0); c.textAlign = 'left';
        rows.forEach((s, j) => {
          const y = y0 + 16 + j * rh, idx = steps.indexOf(s), done = idx < st.k, now = idx === st.k - 1;
          if (now) { c.fillStyle = 'rgba(36,85,122,.12)'; c.fillRect(14, y - 12, W - 28, rh); }
          c.font = `${now ? 700 : 500} 13px ${F}`; c.fillStyle = '#14202b'; c.fillText(String(s.n), 18, y);
          c.textAlign = 'right'; c.fillStyle = s.bad ? '#b3362b' : '#14202b';
          c.fillText(angular ? dms(s.book) : `${s.book[0].toFixed(3)}, ${s.book[1].toFixed(3)}`, W - (angular ? 150 : 160), y);
          c.fillStyle = done ? '#1f7a45' : '#c9ced3';
          c.fillText(done ? (angular ? dms(s.ang) : `${s.calc[0].toFixed(3)}, ${s.calc[1].toFixed(3)}`) : '…', W - 30, y);
          c.fillStyle = '#b3362b'; c.fillText(done && s.bad ? '!' : '', W - 16, y); c.textAlign = 'left';
        });
        const yb = y0 + 16 + rows.length * rh + 6; c.font = `500 12px ${F}`; c.fillStyle = '#5c6168';
        const note = {
          tangent: `Check: L.C. ${Math.hypot(...pt(1)).toFixed(3)} m (book 54.936), L.T. ${LT().toFixed(3)} m (36.717), S.T. ${ST().toFixed(3)} m (18.379).`,
          parallel: `K ${K().toFixed(3)} m, s ${sh().toFixed(3)} m. Chord P.C.–C.T. ${(2 * C.R * Math.sin(ths() / 2)).toFixed(2)} m; the book prints 27.59.`,
          quarter: 'Yc/64, Yc/8, 27Yc/64 at Xc/4, Xc/2, 3Xc/4. ¼-point X printed 19.536 for 14.536.',
          polar: st.odd ? 'θs × i²/300 (Table 14). Exact differs by seconds at the far end: below 20°, no correction.' : 'From Table 11. Check: from L.T. on the tangent, θs must sight C.T. at S.T.',
          station: st.at6 ? 'Sight T.P. at 0.24 θs, zero, transit, go on. Point 7: 0.0633, not 0.0663.' : 'Turn 0.6667 θs to sight T.P.: the short tangent. Points 5, 3, 2 are misprinted; T.P. uses 11.6° for 11.62°.',
        }[mode];
        c.fillText(note, 18, Math.min(yb, H - 26));
        c.fillText('Red: misprint confirmed on the page. Offsets drawn 5× true on the model.', 18, H - 9);
      } });
      card.position.set(5.1, 2.9, 10.3); card.rotation.x = -.6; group.add(card);

      function rebuild() {
        const C = cv(); S = Math.min(.3, 20 / (C.Ls + 22));
        steps = plan(); st.k = steps.filter(s => s.pre).length; st.t = 0;
        const e = end(), O = [e.x - Math.sin(e.theta) * C.R, e.y + Math.cos(e.theta) * C.R], des = [];
        for (let l = 0; l <= C.Ls; l += 1) des.push(pt(l / C.Ls));
        for (let i = 1; i <= 30; i++) { const a = e.theta + i / C.R; des.push([O[0] + C.R * Math.sin(a), O[1] - C.R * Math.cos(a)]); }
        holo.setPoints(design, [[-12, 0], ...des].map(q => P(q, .03)));
        holo.setPoints(tangentLine, [P([-8, 0], .02), P([C.Ls + 18, 0], .02)]);
        if (mode === 'quarter') holo.setPoints(truth, des.slice(0, Math.ceil(C.Ls) + 1).map(q => P(q, .04)));
        tags.TP.position.copy(P([0, -.5 / S], 1)); tags.CT.position.copy(P([e.x + 1.8 / S, e.y], 1));
        tags.PC.visible = mode === 'parallel'; tags.PC.position.copy(P([K(), sh() - .4 / S], 1.2));
        tags.LT.position.copy(P([LT(), -.45 / S], 1));
        const near = [...des, [-6, 0], [C.Ls + 10, 0]].filter((_, i) => i % 3 === 0).map(q => P(q)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 2.2));
        const sta = station(); theo.position.copy(P(sta ? pt(sta / 10) : [0, 0])); theo.userData.head.rotation.y = 0;
        draw(); card.redraw();
      }
      // pegs, tapes, offsets and sight lines for everything set out so far
      function draw() {
        pegs.forEach(p => { p.visible = false; });
        const tp = [], of = [], si = [], ch = [], chk = [];
        const sta = station(), S0 = sta ? pt(sta / 10) : [0, 0];
        steps.slice(0, st.k).forEach((s, j) => {
          pegs[j].visible = true; pegs[j].position.copy(P(s.q, 0));
          if (s.pre) return;
          if (mode === 'tangent' || mode === 'quarter' || (mode === 'parallel' && !s.par && !s.pc)) of.push(P([s.q[0], 0], .05), P(s.q, .05));
          if (mode === 'parallel' && (s.par || s.pc)) of.push(P([s.q[0], s.pc ? 0 : sh()], .05), P(s.q, .05));
          if (mode === 'polar' || mode === 'station') { si.push(P(S0, .3), P(s.q, .05)); const prev = j ? steps[j - 1].q : S0; ch.push(P(prev, .06), P(s.q, .06)); }
        });
        const cur = steps[st.k - 1];
        if (cur && !cur.pre && (mode === 'tangent' || mode === 'quarter' || (mode === 'parallel' && !cur.par))) tp.push(P([0, 0], .04), P([cur.q[0], 0], .04));
        if (cur && mode === 'parallel' && cur.par) tp.push(P([K(), sh()], .04), P([cur.q[0], sh()], .04));
        if (mode === 'parallel' && st.k > 5) tp.push(P([K() - 6, sh()], .03), P([end().x + 4, sh()], .03));
        tp.push(...ch);
        const done = st.k >= steps.length;
        if (done && mode === 'tangent') { const c = pt(1); chk.push(P([LT(), 0], .07), P(c, .07), P([0, 0], .07), P(c, .07)); }
        if (done && mode === 'polar') { const c = pt(1), l = [LT(), 0], d = [c[0] - l[0], c[1] - l[1]], m = Math.hypot(...d); chk.push(P(l, .07), P([l[0] + d[0] / m * (m + 8), l[1] + d[1] / m * (m + 8)], .07)); }
        tags.LT.visible = done && (mode === 'tangent' || mode === 'polar');
        const set = (line, arr) => { line.visible = arr.length > 0; if (arr.length) holo.setPoints(line, arr); };
        set(tapes, tp); set(offs, of); set(sights, si); set(checks, chk);
        if (cur) crew.position.copy(P([cur.q[0] + .6 / S, cur.q[1] - .16 / S]));
        if ((mode === 'polar' || mode === 'station') && cur && !cur.pre) theo.userData.head.rotation.y = Math.atan2(cur.q[1] - S0[1], cur.q[0] - S0[0]);
      }
      const restart = () => { st.k = steps.filter(s => s.pre).length; st.t = 0; st.run = true; draw(); card.redraw(); };
      const actions = [
        { label: 'Set out', run: restart },
        { label: 'Next peg', run: () => { st.run = false; if (st.k < steps.length) { st.k++; draw(); card.redraw(); } } },
        ...(mode === 'polar' ? [{ label: 'Standard (11.21)', toggle: () => !st.odd, run: () => { st.odd = false; rebuild(); } }, { label: 'Odd length (11.22)', toggle: () => st.odd, run: () => { st.odd = true; rebuild(); } }] : []),
        ...(mode === 'station' ? [{ label: 'From C.T. (11.23)', toggle: () => !st.at6, run: () => { st.at6 = false; rebuild(); } }, { label: 'From point 6 (11.24)', toggle: () => st.at6, run: () => { st.at6 = true; rebuild(); } }] : []),
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
        reset() { anims.clear(); Object.assign(st, { odd: false, at6: false, run: true }); rebuild(); guide.reset(); },
        get debug() { return { mode, odd: st.odd, at6: st.at6, pegs: st.k, of: steps.length, K: +K().toFixed(3), s: +sh().toFixed(3), LT: +LT().toFixed(3), ST: +ST().toFixed(3), rows: steps.filter(s => !s.pre).map(s => s.ang != null ? [s.n, dms(s.book), dms(s.ang)] : [s.n, s.book, s.calc.map(v => +v.toFixed(3))]), guide: guide.debug }; },
      };
      const L = actions.map(a => a.label);
      const STEPS = {
        tangent: [
          { title: 'Along and across', show: L, text: 'The chain runs along the tangent to X, then the offset Y is set square to it. No theodolite needed.',
            check: { q: 'Who can set out by offsets from the tangent?', options: ['staff unfamiliar with theodolites', 'only trained surveyors', 'nobody beyond 15 m'], answer: 0, why: 'It needs no angle-measuring instrument and can be done by staff unfamiliar with theodolites; offsets over 15 m need care to keep them square (cl. 7.8.2).' } },
          { title: 'Check', show: L, text: 'When the tenth peg is in, the red lines close the check: L.T. along the tangent, S.T. to C.T., and L.C. back to T.P.',
            check: { q: 'What line becomes the base for laying the circular curve?', options: ['the short tangent S.T. produced', 'the long chord L.C.', 'the main tangent'], answer: 0, why: 'The line joining C.T. to the point at L.T. on the main tangent is the short tangent; it serves as the base for the circular curve (cl. 7.9.1).' } },
        ],
        parallel: [
          { title: 'First half', show: L, text: 'Points 1 to 5 go in from the main tangent as before.' },
          { title: 'New base', show: L, text: 'P.C. goes in at K along the tangent and s across. Points 6 to 10 are offset from a line through P.C., parallel to the tangent.',
            check: { q: 'From the line through P.C., the offset to point 6 is…', options: ['Y6 − s, here −0.101 m (towards the main tangent)', 'Y6 + s', 'Y6 unchanged'], answer: 0, why: 'X6 … X10 are reduced by K and Y6 … Y10 by s; minus values are towards the main tangent (cl. 7.9.1 b, Example 11.18).' } },
        ],
        quarter: [
          { title: 'Three pegs', show: L, text: 'Only the quarter points and C.T. are pegged, with offsets Yc/64, Yc/8 and 27Yc/64. Blue is the true spiral.',
            check: { q: 'At the half point the offset is…', options: ['Yc / 8', 'Yc / 2', 'Yc / 4'], answer: 0, why: 'Offsets vary nearly as the cube of the distance: (½)³ = 1/8 (cl. 7.9.3).' } },
          { title: 'When to use it', show: L, text: 'The pegs sit a little off the true spiral: good enough for earthwork, not for the pavement.',
            check: { q: 'Quarter-point offsets suit…', options: ['work where accuracy is not essential, such as embankments', 'setting the pavement edges', 'every case'], answer: 0, why: 'Offsets to quarter points give fewer points, for work where accuracy is not essential, such as embankments (cl. 7.8.3).' } },
        ],
        polar: [
          { title: 'Angles', show: L, text: 'At T.P. the theodolite sights the apex at zero and turns α1; the chain swings one chord onto that line. And so on to C.T.',
            check: { q: 'Which set-out method suits all conditions and is accurate?', options: ['polar deflection', 'quarter points', 'offsets from the tangent'], answer: 0, why: 'The polar deflection method suits all conditions and is accurate (cl. 7.8.5).' } },
          { title: 'Odd length', show: L, text: 'For a spiral not in Table 11: θs = 28.65 Ls/Rc and α = θs × i²/300.',
            check: { q: 'From T.P., the deflection to the last point C.T. is about…', options: ['θs / 3', 'θs', 'θs / 2'], answer: 0, why: 'Table 14 gives i²/300 from T.P.: at i = 10, 100/300 = 1/3 (cl. 7.9.4, eq. 24).' } },
        ],
        station: [
          { title: 'From C.T.', show: L, text: 'Set at C.T., the theodolite turns 0.6667 θs to sight T.P.: that is the short tangent. Then it ranges the points back to T.P.',
            check: { q: 'Why can the instrument be set on the spiral itself?', options: ['the spiral leaves its osculating circle as it leaves the tangent at its start', 'the spiral is a circle', 'all chords subtend equal angles'], answer: 0, why: 'cl. 7.5.5: the departure from the osculating circle at any point equals that from the tangent at the start.' } },
          { title: 'From point 6', show: L, text: 'Point 7 is hidden from T.P. The instrument moves to point 6, sights T.P. at 0.24 θs, zeroes, transits and carries on.',
            check: { q: 'From point 6, back to T.P., the coefficient is…', options: ['0.24', '0.12', '0.36'], answer: 0, why: '(b − a)(2b + a)/3 with b = 0.6, a = 0: 0.6 × 1.2 / 3 = 0.24 (Table 14, Example 11.24).' } },
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

export default setoutSpread('tangent');
