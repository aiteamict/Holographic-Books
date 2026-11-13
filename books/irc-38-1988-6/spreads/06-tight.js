// Spread 6 · Curves in tight locations (cl. 7.10.1, Example 11.25, Figs. 38–39). National Highway in hills, Δ 56°,
// R 100 m. Along BD the next apex D is 180 m away, so the tangent on that side may be at most 90 m. The alignment is
// built from its curvature (curve.js alignment), so the two spirals can differ: equal 80 m, equal 60 m, or 60 m on BD
// with 80 m on BA as the book does.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { alignment, meet } from '../../_irc38/curve.js';
import { diorama, trees, makeRoad, car, VEH } from '../../_irc38/site.js';
import { clipRun } from '../../_irc38/deck.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, D = 56 * Math.PI / 180, R = 100, LIMIT = 90, BD = 180;
const CASES = { e80: { L1: 80, L2: 80, label: 'Equal 80 m', book: [94.368, 94.368] }, e60: { L1: 60, L2: 60, label: 'Equal 60 m', book: [83.876, 83.876] }, un: { L1: 60, L2: 80, label: 'Unequal 60 / 80 m', book: [85.27, 92.969] } };

// the curve with its apex B at the origin, first straight (along BD) arriving at heading Δ/2
function build({ L1, L2 }) {
  const t1 = L1 / (2 * R), t2 = L2 / (2 * R), a = alignment([{ len: L1, k0: 0, k1: 1 / R }, { len: R * (D - t1 - t2), k0: 1 / R }, { len: L2, k0: 1 / R, k1: 0 }], { h0: D / 2 });
  const pi = meet([0, 0], D / 2, [a.end.x, a.end.y], a.end.h), pts = a.pts.map(p => [p[0] - pi[0], p[1] - pi[1]]);
  const TP = pts[0], PT = pts.at(-1);
  return { pts, TP, PT, T1: Math.hypot(...TP), T2: Math.hypot(...PT) };
}

export default {
  cam: { pos: [3, 40, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { k: 'un', carD: 0 };
    const S = .085, u1 = [Math.cos(D / 2), Math.sin(D / 2)], u2 = [Math.cos(D / 2), -Math.sin(D / 2)], nrm = [-u1[1], u1[0]];
    const ox = 3, oz = -9;   // apex B on the page
    const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S);
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 34, 83); group.add(forest);
    const road = makeRoad(P, S); group.add(road.group);
    const tangents = holo.polyline([[0, 0, 0], [1, 0, 0], [2, 0, 0]], holo.DIM, { width: .05, dashed: true }); group.add(tangents);
    const spirals = holo.segments([[0, 0, 0], [0, 0, 0]], holo.AMBER, .9, { width: .1 }); group.add(spirals);
    const limitLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .09 }); group.add(limitLine);
    const lab = (t, col, h = .6) => { const l = holo.label(t, { h, color: col, bg: 'rgba(255,253,248,.92)', weight: 700 }); group.add(l); return l; };
    const tags = { B: lab('B (apex)', '#14202b'), D: lab('D, next apex · 180 m', '#14202b'), A: lab('A', '#14202b'), lim: lab('90 m: half of BD', '#c23b2f', .55), T1: lab('T', '#8a3f1c', .55), T2: lab('T', '#8a3f1c', .55) };
    const auto = car(S * VEH * 1.4, 0x24557a); group.add(auto);
    let cur = null, track = null;

    const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
      const K = CASES[st.k]; c.fillText(`EXAMPLE 11.25 · Δ 56°, R 100 m · ${K.label}`, 18, 26);
      if (!cur) return;
      c.font = `600 12px ${F}`; c.fillStyle = '#5c6168'; c.textAlign = 'right'; c.fillText('BOOK', W - 150, 52); c.fillText('COMPUTED', W - 30, 52); c.textAlign = 'left';
      const row = (a, b, v, y, col = '#14202b') => { c.fillStyle = '#5c6168'; c.font = `500 15px ${F}`; c.fillText(a, 18, y); c.font = `700 15px ${F}`; c.textAlign = 'right'; c.fillStyle = '#14202b'; c.fillText(b, W - 150, y); c.fillStyle = col; c.fillText(v, W - 30, y); c.textAlign = 'left'; };
      const ok = cur.T1 <= LIMIT + 1e-6;
      row(`Along BD (Ls ${K.L1} m), max 90 m`, `${K.book[0].toFixed(3)} m`, `${cur.T1.toFixed(3)} m`, 80, ok ? '#1f7a45' : '#b3362b');
      row(`Along BA (Ls ${K.L2} m)`, `${K.book[1].toFixed(3)} m`, `${cur.T2.toFixed(3)} m`, 108);
      c.fillStyle = ok ? '#1f7a45' : '#b3362b'; c.font = `700 16px ${F}`; c.fillText(ok ? '✓ Fits: the curve is clear of the next one.' : '✗ Too long: it runs into the curve at D.', 18, 146);
      c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`;
      const lines = st.k === 'un'
        ? ['Book: ME = (s2 − s1) / sin Δ + 83.876 = 85.270 m;', 'DR − NM = 93.7435 − 0.7797 m. Its own subtraction', 'gives 92.9638; it prints 92.969 (Fig. 39).']
        : st.k === 'e80' ? ['Table 10, R 100 m, Ls 80 m: Ts = 94.368 m.', 'Equal transitions cannot fit the 90 m side.'] : ['Table 10, R 100 m, Ls 60 m: Ts = 83.876 m.', 'It fits, but the other side could take a longer,', 'gentler spiral: the unequal design uses the room.'];
      lines.forEach((l, i) => c.fillText(l, 18, 180 + i * 20));
      c.font = `500 12px ${F}`; c.fillText('R 100 m: hills, NH, 50 km/h (Table 3 desirable minimum 90 m). Table 9: Ls over 45 m.', 18, H - 12);
    } });
    card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      cur = build(CASES[st.k]);
      const Dpt = [-BD * u1[0], -BD * u1[1]], far = [cur.PT[0] + u2[0] * 120, cur.PT[1] + u2[1] * 120];
      const rc = clipRun([Dpt, ...cur.pts, far], P, SLAB);
      track = road.set(rc.pts);
      holo.setPoints(tangents, [P(Dpt, .05), P([0, 0], .05), P(far, .05)]);
      const n1 = Math.round(CASES[st.k].L1 / .25), n2 = Math.round(CASES[st.k].L2 / .25), sp = [];
      for (let i = 1; i <= n1; i += 2) sp.push(P(cur.pts[i - 1], .08), P(cur.pts[i], .08));
      for (let i = cur.pts.length - n2; i < cur.pts.length - 1; i += 2) sp.push(P(cur.pts[i], .08), P(cur.pts[i + 1], .08));
      holo.setPoints(spirals, sp);
      const Lm = [-LIMIT * u1[0], -LIMIT * u1[1]];
      holo.setPoints(limitLine, [P([Lm[0] + nrm[0] * 9, Lm[1] + nrm[1] * 9], .1), P([Lm[0] - nrm[0] * 9, Lm[1] - nrm[1] * 9], .1)]);
      tags.B.position.copy(P([0, 10], 1)); tags.D.position.copy(P([Dpt[0] + 30, Dpt[1] - 12], 1)); tags.A.position.copy(P([far[0] - 30, far[1] - 10], 1));
      tags.lim.position.copy(P([Lm[0] - nrm[0] * 18, Lm[1] - nrm[1] * 18], 1));
      tags.T1.userData.setText(`T ${cur.T1.toFixed(2)} m`); tags.T1.position.copy(P([cur.TP[0] / 2 + nrm[0] * 14, cur.TP[1] / 2 + nrm[1] * 14], 1.1));
      tags.T2.userData.setText(`T ${cur.T2.toFixed(2)} m`); tags.T2.position.copy(P([cur.PT[0] / 2 + 12, cur.PT[1] / 2 + 10], 1.1));
      const near = rc.pts.filter((_, i) => i % 6 === 0).map(p => P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.3));
      card.redraw();
    }
    const actions = Object.entries(CASES).map(([k, v]) => ({ label: v.label, toggle: () => st.k === k, run: () => { st.k = k; rebuild(); } }));
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        if (track) { st.carD = (st.carD + dt * 24) % track.length; const p = track.at(st.carD); auto.position.copy(P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h; }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.k = 'un'; rebuild(); guide.reset(); },
      get debug() { return { k: st.k, T1: +cur.T1.toFixed(3), T2: +cur.T2.toFixed(3), fits: cur.T1 <= LIMIT, guide: guide.debug }; },
    };
    const L = actions.map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'The limit', show: L, text: 'The next apex D is 180 m back along this straight, so each curve may use only half: the tangent here must stay within 90 m.',
          check: { q: 'What controls a curve in a tight location?', options: ['Δ, Ts and Es', 'only the radius', 'only the speed'], answer: 0, why: 'The controls are Δ, Ts and Es; the requirements are the minimum radius and transition length for the design speed (cl. 7.10.1).' } },
        { title: 'Equal spirals', show: L, text: 'Try equal 80 m transitions: 94.4 m, too long. Equal 60 m fits at 83.9 m.' },
        { title: 'Unequal', show: L, text: 'Put the shorter spiral on the tight side and the longer on the free side: 85.3 m along BD, 93.0 m along BA.',
          check: { q: 'Why unequal rather than two 60 m spirals?', options: ['the free side can take a longer, gentler spiral', 'unequal spirals need no superelevation', 'equal spirals are not allowed'], answer: 0, why: 'Only the BD side is limited; the longer transition on BA uses the room where there is no limit (Example 11.25).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild();
    return api;
  },
};
