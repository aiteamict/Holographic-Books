// Spreads 2–4 · How much to widen and how to build it in (cl. 6.2, 6.3, eq. 8, Table 7, Figs. 14–16). A curve on the
// site model carries a deck whose extra width (drawn several times wider than true, so it can be seen) grows along it.
//   'amount' eq. (8): mechanical l²/2R (amber) plus psychological V/(9.5√R) (cyan), for a chosen radius and speed
//   'table7' Table 7 for single-, two- and four-lane roads against eq. (8) (dashed)
//   'apply'  Example 11.29 (R 175 m, Ls 30 m, 0.6 m): on both sides, on the inside, or on a curve without transition
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { horizontalCurve, layout } from '../../_irc38/curve.js';
import { diorama, trees, track, throughSlab, car, VEH } from '../../_irc38/site.js';
import { widenMech, widenPsy, widenTable, MIN_RADIUS } from '../../_irc38/tables.js';
import { offsetPts, band, swapGeo, clipRun } from '../../_irc38/deck.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };
const std = color => new THREE.MeshStandardMaterial({ color, roughness: .8 });
const MAT = { mech: std(0xd08a4a), psy: std(0x5d97bf), tab: std(0x5aa070) };
// eq. (8) at the highest design speed this radius allows in plain country (Table 3)
const vFor = R => Object.keys(MIN_RADIUS).map(Number).filter(v => MIN_RADIUS[v][0] <= R).pop() || 20;

export function widenSpread(mode) {
  const apply = mode === 'apply', EX = 4;
  return {
    cam: { pos: [3, 38, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 58, 50], look: [12.3, 0, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const st = { R: mode === 'amount' ? 60 : apply ? 175 : 50, V: 65, lanes: 2, side: 'both', trans: true, carD: 0 };
      let S = .1, ox = 1.5, oz = -6, T = null, off = 0, e1 = 0, len = 0, Ls = 0;   // e1, len: along the whole path; T is the part on the slab, starting off metres in
      const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S);
      const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
      const forest = trees(slab, 30, 61); group.add(forest);
      const mk = m => { const x = new THREE.Mesh(new THREE.BufferGeometry(), m); x.receiveShadow = true; group.add(x); return x; };
      const deck = mk(SM.asphalt), stripA = mk(apply ? MAT.tab : MAT.mech), stripB = mk(apply ? MAT.tab : MAT.psy), edL = mk(SM.paint), edR = mk(SM.paint);
      if (mode === 'table7') stripA.material = MAT.tab;
      const centre = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .05, dashed: true }); group.add(centre);
      const ghost = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .06, dashed: true }); ghost.visible = mode === 'table7'; group.add(ghost);
      const auto = car(1, 0x24557a); group.add(auto);

      const half = () => st.lanes === 1 ? 1.875 : st.lanes === 4 ? 7 : 3.5;
      const mech = () => widenMech(st.R), psy = () => widenPsy(st.V, st.R);
      const eq8 = () => { const V = vFor(st.R), two = widenMech(st.R) + widenPsy(V, st.R); return st.lanes === 1 ? widenMech(st.R) : st.lanes === 4 ? 2 * two : two; };
      const tab = () => st.lanes === 4 ? 2 * widenTable(st.R, 2) : widenTable(st.R, st.lanes);   // half the two-lane widening per lane (cl. 6.2.4)
      const W = () => apply ? .6 : mode === 'amount' ? mech() + psy() : tab();
      // fraction of the full widening at distance d along the path: uniform along a transition, else ⅔ by the curve's start
      const ramp = d => {
        const up = t => apply && st.trans ? Math.min(1, Math.max(0, t / Ls)) : t < -20 ? 0 : t < 0 ? (t + 20) / 30 : Math.min(1, 2 / 3 + t / 30);
        return Math.min(up(d - e1), up(e1 + len - d));
      };
      const extra = d => { const w = W() * ramp(d); return apply && st.side === 'both' ? [w / 2, w / 2] : [0, w]; };   // [outer, inner]

      const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, Wc, H) => {
        cardBg(c, Wc, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
        const row = (a, b, y, col = '#14202b') => { c.fillStyle = '#5c6168'; c.font = `500 15px ${F}`; c.fillText(a, 18, y); c.fillStyle = col; c.font = `700 16px ${F}`; c.textAlign = 'right'; c.fillText(b, Wc - 18, y); c.textAlign = 'left'; };
        if (apply) {
          c.fillText(st.trans ? `EXAMPLE 11.29 · R 175 m, Ls 30 m · 0.6 m ${st.side === 'both' ? 'on both sides' : 'on the inside'}` : 'NO TRANSITION · ⅔ on the straight, ⅓ on the curve', 18, 26);
          if (!T) return;
          const s0 = e1 - 30, s1 = e1 + 50, X = s => 18 + (s - s0) / (s1 - s0) * (Wc - 36), y0 = 44, h = 70, Y = v => y0 + h / 2 - v / .7 * (h / 2);
          c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(18, y0, Wc - 36, h);
          c.strokeStyle = '#5c6168'; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(18, Y(0)); c.lineTo(Wc - 18, Y(0)); c.stroke(); c.setLineDash([]);
          [[0, 1, '#b0532a'], [1, -1, '#1d5f87']].forEach(([j, sg, col]) => { c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); for (let s = s0; s <= s1; s += .5) { const v = sg * extra(s)[j]; s === s0 ? c.moveTo(X(s), Y(v)) : c.lineTo(X(s), Y(v)); } c.stroke(); });
          c.strokeStyle = '#14202b'; c.lineWidth = 2; const cd = Math.min(Math.max(st.carD + off, s0), s1); c.beginPath(); c.moveTo(X(cd), y0); c.lineTo(X(cd), y0 + h); c.stroke();
          c.font = `600 12px ${F}`; c.fillStyle = '#14202b'; c.fillText('T.P.', X(e1) - 12, y0 + h + 14); if (st.trans) c.fillText('C.T.', X(e1 + 30) - 12, y0 + h + 14);
          c.fillStyle = '#b0532a'; c.fillText('outer edge, beyond 3.5 m', 22, y0 + 13); c.fillStyle = '#1d5f87'; c.fillText('inner edge, beyond 3.5 m', 22, y0 + h - 5);
          // Table 11.10: distance from T.P., extra width, half-widths for each case
          const top = 150, cols = [18, 96, 150, 212, 380]; c.font = `600 12px ${F}`; c.fillStyle = '#5c6168';
          ['From T.P.', 'Extra', 'Width', 'Both sides: each half', 'Inside: outer · inner'].forEach((t, i) => c.fillText(t, cols[i], top));
          const here = Math.round((st.carD + off - e1) / 5);
          for (let i = 0; i <= 6; i++) {
            const y = top + 18 + i * 17, w = i * .1, on = st.trans && here === i;
            if (on) { c.fillStyle = 'rgba(36,85,122,.12)'; c.fillRect(14, y - 13, Wc - 28, 17); }
            c.fillStyle = '#14202b'; c.font = `${on ? 700 : 500} 13px ${F}`;
            [i ? `${i * 5} m` : 'T.P.', w.toFixed(1), (7 + w).toFixed(1), (3.5 + w / 2).toFixed(2), `3.5 · ${(3.5 + w).toFixed(1)}`].forEach((t, j) => c.fillText(t, cols[j], y));
          }
          c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText(`Table 11.10 (Example 11.29). Extra width drawn ${EX}× wider than true.`, 18, H - 12);
          return;
        }
        c.fillText(mode === 'amount' ? `EQ. (8) · R ${st.R} m · ${st.V} km/h · two-lane` : `TABLE 7 · R ${st.R} m · ${st.lanes === 1 ? 'single-lane' : st.lanes === 4 ? 'four-lane' : 'two-lane'}`, 18, 26);
        const x0 = 18, x1 = Wc - 18, y0 = 40, h = 120, R0 = 20, R1 = 300, X = R => x0 + (R - R0) / (R1 - R0) * (x1 - x0), Y = v => y0 + h - Math.min(v, 3) / 3 * h;
        c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(x0, y0, x1 - x0, h);
        c.fillStyle = '#5c6168'; c.font = `500 11px ${F}`; [20, 60, 100, 150, 200, 300].forEach(r => c.fillText(String(r), X(r) - 8, y0 + h + 12)); c.fillText('m', x1 - 10, y0 + h + 12); [1, 2, 3].forEach(v => c.fillText(`${v}`, x0 + 3, Y(v) + 10));
        const plot = (fn, col, dash, wd = 3) => { c.strokeStyle = col; c.lineWidth = wd; c.setLineDash(dash || []); c.beginPath(); for (let R = R0; R <= R1; R += 2) { const v = fn(R); R === R0 ? c.moveTo(X(R), Y(v)) : c.lineTo(X(R), Y(v)); } c.stroke(); c.setLineDash([]); };
        if (mode === 'amount') {
          plot(R => widenMech(R), '#b0532a'); plot(R => widenPsy(st.V, R), '#1d5f87'); plot(R => widenMech(R) + widenPsy(st.V, R), '#14202b');
          c.strokeStyle = '#14202b'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(st.R), y0); c.lineTo(X(st.R), y0 + h); c.stroke();
          row('Mechanical  l² / 2R = 121 / 2R', `${mech().toFixed(2)} m`, 196, '#b0532a');
          row('Psychological  V / 9.5√R', `${psy().toFixed(2)} m`, 220, '#1d5f87');
          row('Total extra width We (eq. 8)', `${(mech() + psy()).toFixed(2)} m`, 248);
          row('Single-lane road: mechanical only', `${mech().toFixed(2)} m`, 272, '#5c6168');
          c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText(`l = 11 m (cl. 6.2.1). Extra width drawn ${EX}× wider than true on the model.`, 18, H - 12);
        } else {
          const tabOf = R => st.lanes === 4 ? 2 * widenTable(R, 2) : widenTable(R, st.lanes);
          const eqOf = R => { const two = widenMech(R) + widenPsy(vFor(R), R); return st.lanes === 1 ? widenMech(R) : st.lanes === 4 ? 2 * two : two; };
          plot(eqOf, '#5c6168', [6, 4], 2); plot(tabOf, '#2f8f55');
          c.strokeStyle = '#14202b'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(st.R), y0); c.lineTo(X(st.R), y0 + h); c.stroke();
          row('Table 7 extra width', tab() ? `${tab().toFixed(1)} m` : 'nil', 196, '#2f8f55');
          row(`eq. (8) at ${vFor(st.R)} km/h (Table 3 limit)`, `${eq8().toFixed(2)} m`, 220, '#5c6168');
          c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`;
          c.fillText(st.lanes === 4 ? 'Multi-lane: half the two-lane widening for each lane (cl. 6.2.4).' : st.lanes === 1 ? 'Single-lane: mechanical widening only, nil beyond 60 m (Table 7).' : 'Two-lane: 1.5 m to 40 m, 1.2 m to 60 m, 0.9 m to 100 m, 0.6 m to 300 m.', 18, 252);
          c.fillText(`Green: Table 7. Dashed: eq. (8). Extra width drawn ${EX}× on the model.`, 18, H - 12);
        }
      } });
      card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

      function rebuild() {
        const D = apply ? 40 : 60; Ls = apply && st.trans ? 30 : 0;
        const k = horizontalCurve(D, st.R, Ls), L = layout(k, 1); len = k.length;
        if (apply) {   // close in on the run-in: T.P. to C.T. and the start of the circular curve
          const c = L.CT; S = .28; ox = 1.5 - c[0] * S; oz = -4 + c[1] * S;
        } else {       // the whole curve on the slab
          S = Math.min(.3, 17 / (2 * k.Ts * Math.cos(k.delta / 2) + 18)); ox = 1.5;
          oz = -4.5 - (k.Es + k.Ts * Math.sin(k.delta / 2)) / 2 * S;
        }
        const th = throughSlab(L, P, SLAB), cut = clipRun(th.pts, P, SLAB); T = track(cut.pts); off = cut.off; e1 = th.e1;
        const hw = half(), out = d => hw + EX * extra(d + off)[0], inn = d => -hw - EX * extra(d + off)[1];
        swapGeo(deck, band(T, P, () => hw, () => -hw, .012));
        if (apply) { swapGeo(stripA, band(T, P, () => hw, out, .013)); swapGeo(stripB, band(T, P, () => -hw, inn, .013)); }
        else if (mode === 'amount') { const m = d => -hw - EX * mech() * ramp(d + off); swapGeo(stripA, band(T, P, () => -hw, m, .013)); swapGeo(stripB, band(T, P, m, inn, .013)); }
        else { swapGeo(stripA, band(T, P, () => -hw, inn, .013)); holo.setPoints(ghost, offsetPts(T, d => -hw - EX * eq8() * ramp(d + off), 2).map(p => P(p, .04))); }
        const lw = Math.max(.18, .045 / S);
        swapGeo(edL, band(T, P, d => out(d) - lw * .4, d => out(d) - lw * 1.4, .02)); swapGeo(edR, band(T, P, d => inn(d) + lw * .4, d => inn(d) + lw * 1.4, .02));
        holo.setPoints(centre, offsetPts(T, 0, 2).map(p => P(p, .03)));
        auto.children[0].scale.setScalar(S * VEH);
        const near = cut.pts.filter((_, i) => i % 3 === 0).map(p => P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.6));
        card.redraw();
      }
      const set = (k, v) => { st[k] = v; rebuild(); };
      const actions = mode === 'amount' ? [
        ...[30, 60, 100, 200].map(R => ({ label: `R ${R} m`, toggle: () => st.R === R, run: () => set('R', R) })),
        ...[40, 65, 80].map(V => ({ label: `${V} km/h`, toggle: () => st.V === V, run: () => set('V', V) })),
      ] : mode === 'table7' ? [
        ...[30, 50, 80, 200].map(R => ({ label: `R ${R} m`, toggle: () => st.R === R, run: () => set('R', R) })),
        ...[[1, 'Single lane'], [2, 'Two lane'], [4, 'Four lane']].map(([n, l]) => ({ label: l, toggle: () => st.lanes === n, run: () => set('lanes', n) })),
      ] : [
        { label: 'Both sides', toggle: () => st.trans && st.side === 'both', run: () => { st.trans = true; set('side', 'both'); } },
        { label: 'Inside only', toggle: () => st.trans && st.side === 'inside', run: () => { st.trans = true; set('side', 'inside'); } },
        { label: 'No transition', toggle: () => !st.trans, run: () => { st.side = 'inside'; set('trans', false); } },
      ];
      const api = {
        group, targets: [], actions,
        tap(hit) { guide.tap(hit); },
        a11y: actions.map(a => ({ label: a.label, run: a.run })),
        update(dt) {
          anims.tick(dt);
          if (T) {
            const was = Math.round((st.carD + off - e1) / 5); st.carD = (st.carD + dt * (apply ? 12 : 16)) % T.length;
            const p = T.at(st.carD); auto.position.copy(P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h;
            if (apply && Math.round((st.carD + off - e1) / 5) !== was) card.redraw();
          }
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
        },
        reset() { anims.clear(); Object.assign(st, { R: mode === 'amount' ? 60 : apply ? 175 : 50, V: 65, lanes: 2, side: 'both', trans: true, carD: 0 }); rebuild(); guide.reset(); },
        get debug() { return { mode, R: st.R, V: st.V, lanes: st.lanes, side: st.side, trans: st.trans, mech: +mech().toFixed(3), psy: +psy().toFixed(3), table7: tab(), eq8: +eq8().toFixed(3), atMiddle: T ? extra(e1 + len / 2).map(v => +v.toFixed(3)) : null, guide: guide.debug }; },
      };
      const L = actions.map(a => a.label), Rs = L.filter(l => l.startsWith('R '));
      const STEPS = {
        amount: [
          { title: 'Mechanical', show: Rs, text: 'Amber is the mechanical widening l²/2R with l = 11 m. Halve the radius and it doubles.',
            check: { q: 'Mechanical widening on R 60 m (l = 11 m)?', options: ['1.01 m', '0.50 m', '2.02 m'], answer: 0, why: 'l²/2R = 121 / 120 = 1.01 m (cl. 6.2.1, Fig. 14).' } },
          { title: 'Psychological', show: L, text: 'Cyan is the psychological widening V/(9.5√R), found empirically. It grows with the speed.',
            check: { q: 'On a single-lane road, which part is provided?', options: ['the mechanical only', 'the psychological only', 'both'], answer: 0, why: 'On single-lane roads the outer wheels use the shoulder when vehicles cross, so only the mechanical widening is needed (cl. 6.2.3).' } },
          { title: 'Total', show: L, text: 'The two together: We = l²/2R + V/(9.5√R), eq. (8), for two-lane and wider roads.',
            check: { q: 'eq. (8) for R 100 m at 65 km/h?', options: ['1.29 m', '0.61 m', '0.68 m'], answer: 0, why: '121/200 = 0.605 plus 65/(9.5 × 10) = 0.684: 1.29 m (eq. 8).' } },
        ],
        table7: [
          { title: 'Two-lane', show: Rs, text: 'Table 7 steps down as the radius grows. The dashed line is eq. (8) at the fastest speed that radius allows.',
            check: { q: 'Two-lane road on R 50 m: extra width from Table 7?', options: ['1.2 m', '0.9 m', '1.5 m'], answer: 0, why: 'Radius 41 to 60 m: 1.2 m for a two-lane road (Table 7).' } },
          { title: 'Single lane', show: L, text: 'A single-lane road gets the mechanical part only, and nothing beyond 60 m.',
            check: { q: 'Single-lane road on R 80 m?', options: ['nil', '0.6 m', '0.9 m'], answer: 0, why: 'Table 7 lists no widening for single-lane roads beyond 60 m radius.' } },
          { title: 'Multi-lane', show: L, text: 'For more lanes, add half the two-lane widening for each lane.',
            check: { q: 'Four-lane road on R 200 m?', options: ['1.2 m', '0.6 m', '2.4 m'], answer: 0, why: 'Half of 0.6 m for each of four lanes: 4 × 0.3 = 1.2 m (cl. 6.2.4).' } },
        ],
        apply: [
          { title: 'Both sides', show: L, text: 'Example 11.29: 0.6 m grows uniformly along the 30 m transition, half on each side, then runs round the circular curve.',
            check: { q: 'Along the transition the widening grows…', options: ['uniformly from nothing at T.P.', 'all at once at T.P.', 'only on the circular curve'], answer: 0, why: 'It is applied at an approximately uniform rate along the transition and is full at its end (cl. 6.2.5, 6.3.2, Fig. 15).' } },
          { title: 'Inside only', show: L, text: 'On hill roads the whole widening preferably goes on the inside. Watch the outer edge stay at 3.5 m.',
            check: { q: 'On hill roads the widening is preferably put…', options: ['on the inside', 'on the outside', 'equally on both sides'], answer: 0, why: 'Widening is equal on both sides except on hill roads, where it is preferably on the inside (cl. 6.2.6).' } },
          { title: 'No transition', show: L, text: 'A circular curve without transition: widening only on the inside, two-thirds on the straight and one-third on the curve.',
            check: { q: 'Without a transition, how much is attained before the curve?', options: ['two-thirds', 'one-third', 'all of it'], answer: 0, why: 'Two-thirds of the widening is attained on the straight before the curve and one-third on the curve (cl. 6.2.5).' } },
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

export default widenSpread('amount');
