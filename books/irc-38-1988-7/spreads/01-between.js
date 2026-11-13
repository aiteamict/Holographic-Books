// Spread 1 · Transitions between curves of different radius (cl. 8.1–8.2). A flatter arc R1 runs into a sharper arc
// R2, with or without a transition between them (curve.js alignment). The card plots the car's lateral acceleration
// and works the clause: Ls = 0.0215 V³ / (C Ra) with 1/Ra = 1/R2 − 1/R1, the edge-height check (150 × the change),
// and the 50 per cent / 30 m rule.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { alignment } from '../../_irc38/curve.js';
import { diorama, trees, makeRoad, car, VEH } from '../../_irc38/site.js';
import { clipRun } from '../../_irc38/deck.js';
import { rateC, eDesign } from '../../_irc38/tables.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, V = 80, S = .14, A1 = 90, A2 = 120;
const PAIRS = { a: { R1: 600, R2: 250, label: '600 → 250 m' }, b: { R1: 300, R2: 250, label: '300 → 250 m' } };
const lsOf = (R1, R2) => .0215 * V ** 3 / rateC(V) * (1 / R2 - 1 / R1);

export default {
  cam: { pos: [3, 40, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { p: 'a', trans: true, carD: 0, tick: 0 };
    let ox = 0, oz = 0, track = null, off = 0, La = 0;
    const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S);
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 32, 13); group.add(forest);
    const road = makeRoad(P, S); group.add(road.group);
    const sp = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .1 }); group.add(sp);
    const lab = (t, col, h = .6) => { const l = holo.label(t, { h, color: col, bg: 'rgba(255,253,248,.92)', weight: 700 }); group.add(l); return l; };
    const tags = { r1: lab('R1', '#24557a'), r2: lab('R2', '#24557a'), cs: lab('P.C.C.', '#8a3f1c', .55) };
    const auto = car(S * VEH, 0x24557a); group.add(auto);
    const pr = () => PAIRS[st.p];
    // curvature along the path (distance measured from the start of the R1 arc)
    const kOf = d => { const { R1, R2 } = pr(); if (d < A1) return 1 / R1; if (d < A1 + La) return 1 / R1 + (1 / R2 - 1 / R1) * (d - A1) / La; return 1 / R2; };

    const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 15px ${F}`;
      const { R1, R2 } = pr(), v = V / 3.6, ls = lsOf(R1, R2), e1 = eDesign(V, R1), e2 = eDesign(V, R2), dh = (e2 - e1) * 3.5, big = (R1 - R2) / R2 > .5;
      c.fillText(`R1 ${R1} m → R2 ${R2} m at ${V} km/h · ${st.trans ? `transition ${La} m` : 'no transition'}`, 18, 24);
      const s0 = A1 - 50, s1 = A1 + Math.max(La, 1) + 50, X = s => 18 + (s - s0) / (s1 - s0) * (W - 36), y0 = 36, h = 74, aM = v * v / R2 * 1.15, Y = a => y0 + h - a / aM * h;
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(18, y0, W - 36, h);
      c.strokeStyle = st.trans ? '#2f8f55' : '#c23b2f'; c.lineWidth = 3; c.beginPath(); for (let s = s0; s <= s1; s += .5) { const a = v * v * kOf(s); s === s0 ? c.moveTo(X(s), Y(a)) : c.lineTo(X(s), Y(a)); } c.stroke();
      const cd = Math.min(s1, Math.max(s0, st.carD + off)); c.strokeStyle = '#14202b'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(cd), y0); c.lineTo(X(cd), y0 + h); c.stroke();
      c.fillStyle = '#5c6168'; c.font = `500 11px ${F}`; c.fillText('lateral acceleration v²/R as the car goes from R1 to R2', 22, y0 + 12);
      const row = (a, b, y, col = '#14202b') => { c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(a, 18, y); c.fillStyle = col; c.font = `700 14px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 18, y); c.textAlign = 'left'; };
      row('C = 80 / (75 + V)', rateC(V).toFixed(4), 134);
      row('1/Ra = 1/R2 − 1/R1', (1 / R2 - 1 / R1).toFixed(5), 154);
      row('Ls = 0.0215 V³ / (C Ra)', `${ls.toFixed(2)} m`, 174, '#8a3f1c');
      row(`Edges: (${e2.toFixed(3)} − ${e1.toFixed(3)}) × 3.5 m; × 150`, `${(150 * dh).toFixed(1)} m`, 194);
      row('Radii differ by (R1 − R2)/R2', `${((R1 - R2) / R2 * 100).toFixed(0)} %`, 214);
      c.fillStyle = big || ls >= 30 ? '#8a3f1c' : '#1f7a45'; c.font = `700 14px ${F}`;
      c.fillText(big ? `Over 50 %: a transition of at least 30 m. Adopt ${Math.max(30, Math.ceil(Math.max(ls, 150 * dh) / 5) * 5)} m.` : ls < 30 ? 'Under 50 % and under 30 m: the transition may be omitted.' : 'A transition is needed.', 18, 240);
      c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText(big ? 'The book: 1/Ra = 0.00233, Ls = 49.69 m, say 50 m; 150 × 0.08 = 12 m (cl. 8.2).' : 'Then the superelevation is changed on the flatter curve (cl. 8.1).', 18, H - 12);
    } });
    card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      const { R1, R2 } = pr(), ls = lsOf(R1, R2), big = (R1 - R2) / R2 > .5;
      La = st.trans ? (big ? Math.max(30, Math.ceil(ls / 5) * 5) : Math.max(15, Math.ceil(ls / 5) * 5)) : 0;
      const parts = [{ len: 60, k0: 0 }, { len: A1, k0: 1 / R1 }, ...(La ? [{ len: La, k0: 1 / R1, k1: 1 / R2 }] : []), { len: A2, k0: 1 / R2 }, { len: 60, k0: 0 }];
      const a = alignment(parts, { h0: .45 }), pts = a.pts.map(p => [p[0], p[1]]);
      const j = Math.round((60 + A1) / .25), pcc = pts[j];
      ox = -2.5 - pcc[0] * S; oz = -4 + pcc[1] * S;
      const rc = clipRun(pts, P, SLAB); track = road.set(rc.pts); off = rc.off - 60;   // chart distances start at the R1 arc
      const spPts = La ? pts.slice(j, j + Math.round(La / .25) + 1) : [];
      sp.visible = spPts.length > 1; if (sp.visible) holo.setPoints(sp, spPts.map(p => P(p, .1)));
      const q1 = pts[Math.round((60 + A1 * .4) / .25)], q2 = pts[Math.round((60 + A1 + La + A2 * .3) / .25)];
      tags.r1.userData.setText(`R1 ${R1} m`); tags.r1.position.copy(P([q1[0], q1[1] + 2.2 / S], 1));
      tags.r2.userData.setText(`R2 ${R2} m`); tags.r2.position.copy(P([q2[0], q2[1] + 2.2 / S], 1));
      tags.cs.userData.setText(La ? 'transition' : 'P.C.C.'); tags.cs.position.copy(P([pcc[0], pcc[1] - 2 / S], 1.2));
      const near = rc.pts.filter((_, i) => i % 8 === 0).map(p => P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.6));
      st.carD = 0; card.redraw();
    }
    const actions = [
      ...Object.entries(PAIRS).map(([k, v]) => ({ label: v.label, toggle: () => st.p === k, run: () => { st.p = k; rebuild(); } })),
      { label: 'No transition', toggle: () => !st.trans, run: () => { st.trans = false; rebuild(); } },
      { label: 'With transition', toggle: () => st.trans, run: () => { st.trans = true; rebuild(); } },
    ];
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        if (track) {
          st.carD = (st.carD + dt * 16) % track.length; const p = track.at(st.carD);
          auto.position.copy(P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h;
          const d = st.carD + off; auto.userData.body.rotation.x = d > 0 && d < A1 + La + A2 ? -Math.min(.22, (V / 3.6) ** 2 * kOf(d) * .09) : 0;
          if ((st.tick += dt) > .12) { st.tick = 0; card.redraw(); }
        }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); Object.assign(st, { p: 'a', trans: true, carD: 0 }); rebuild(); guide.reset(); },
      get debug() { const { R1, R2 } = pr(); return { pair: st.p, trans: st.trans, La, ls: +lsOf(R1, R2).toFixed(2), edge150: +(150 * (eDesign(V, R2) - eDesign(V, R1)) * 3.5).toFixed(2), guide: guide.debug }; },
    };
    const L = actions.map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'The jump', show: L, text: 'Without a transition, the push jumps where the 600 m curve meets the 250 m one. Add the transition: it ramps.',
          check: { q: 'A transition between two curves is designed like one from a tangent, using…', options: ['the difference of their curvatures, 1/R2 − 1/R1', 'the sharper radius alone', 'the average radius'], answer: 0, why: 'Ls = 0.0215V³/(C R2) − 0.0215V³/(C R1) = 0.0215V³/(C Ra), Ra being the radius whose degree is the difference of degrees (cl. 8.1).' } },
        { title: 'The rule', show: L, text: 'Radii differing by more than half the smaller one need a transition of at least 30 m.',
          check: { q: 'For 600 m and 250 m at 80 km/h, the book adopts…', options: ['50 m', '12 m', '30 m'], answer: 0, why: 'Ls = 49.69 m, say 50 m; the edge check, 150 × 0.08 = 12 m, is less (cl. 8.2).' } },
        { title: 'Close radii', show: L, text: 'Now 300 m into 250 m: under 50 per cent apart and under 30 m computed, so the transition may be left out.',
          check: { q: 'If the transition is omitted, the change in superelevation is made…', options: ['on the flatter curve', 'on the sharper curve', 'on the straight'], answer: 0, why: 'With less than 50 per cent difference and a computed length under 30 m, the superelevation change is made on the flatter curve (cl. 8.1).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild();
    return api;
  },
};
