// Spread 6 · Reverse curves (cl. 9.1, Examples 11.38–11.39, Figs. 51–53). An existing reverse curve: 150 m turning
// through 30°, a 75 m straight, 125 m turning back through 40° (Fig. 51). Transitions of 45 m and 55 m (Table 9, 50
// km/h, plain) are added two ways:
//   Case I  the curves move, the tangents stay: each curve gets its spirals about its own apex (Ex 11.38)
//   Case II the curves stay, the middle tangent moves: it now touches circles R + s about the same centres (Ex 11.39)
// Checked: with no shift the Case II construction gives back E, F and the 75 m exactly.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { horizontalCurve as hc, alignment, meet, deg } from '../../_irc38/curve.js';
import { diorama, trees, makeRoad, car, VEH } from '../../_irc38/site.js';
import { clipRun } from '../../_irc38/deck.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, RAD = Math.PI / 180;
const R1 = 150, D1 = 30 * RAD, R2 = 125, D2 = 40 * RAD, EF = 75, L1 = 45, L2 = 55, H0 = .2;
const k1 = hc(30, R1, L1), k2 = hc(40, R2, L2);
const dms = d => { const s = Math.abs(d) * 3600, a = Math.floor(s / 3600 + 1e-9), m = Math.floor((s - a * 3600) / 60 + 1e-9), r = s - a * 3600 - m * 60; return `${a}°${String(m).padStart(2, '0')}′${r.toFixed(0).padStart(2, '0')}″`; };
const xy = p => [p[0], p[1]];
const unit = h => [Math.cos(h), Math.sin(h)];

// the existing reverse curve, from A heading H0; centres, apexes and the middle tangent E–F
const ex = alignment([{ len: 80, k0: 0 }, { len: R1 * D1, k0: 1 / R1 }, { len: EF, k0: 0 }, { len: R2 * D2, k0: -1 / R2 }, { len: 80, k0: 0 }], { h0: H0 });
const idx = s => Math.round(s / .25), E = ex.pts[idx(80 + R1 * D1)], Fp = ex.pts[idx(80 + R1 * D1 + EF)];
const hIn = H0, hMid = H0 - D1, hOut = hMid + D2;
const O1 = [E[0] + Math.sin(hMid) * R1, E[1] - Math.cos(hMid) * R1], O2 = [Fp[0] - Math.sin(hMid) * R2, Fp[1] + Math.cos(hMid) * R2];
const A0 = xy(ex.pts[0]), Z0 = [ex.end.x, ex.end.y];
const V1 = meet(A0, hIn, xy(E), hMid), V2 = meet(xy(E), hMid, Z0, hOut), apexDist = Math.hypot(V2[0] - V1[0], V2[1] - V1[1]);

// Case I: spirals about each apex, the three straights unchanged
const straightI = apexDist - k1.Ts - k2.Ts;
function caseI() {
  const start = [V1[0] - unit(hIn)[0] * (k1.Ts + 60), V1[1] - unit(hIn)[1] * (k1.Ts + 60)];
  return alignment([{ len: 60, k0: 0 }, { len: L1, k0: 0, k1: 1 / R1 }, { len: k1.Lc, k0: 1 / R1 }, { len: L1, k0: 1 / R1, k1: 0 }, { len: straightI, k0: 0 },
    { len: L2, k0: 0, k1: -1 / R2 }, { len: k2.Lc, k0: -1 / R2 }, { len: L2, k0: -1 / R2, k1: 0 }, { len: 80, k0: 0 }], { start, h0: hIn });
}
// Case II: the same centres; the middle tangent touches circles R1 + s1 and R2 + s2 (an internal common tangent)
const a = R1 + k1.S, b = R2 + k2.S, d12 = Math.hypot(O2[0] - O1[0], O2[1] - O1[1]), e12 = Math.atan2(O2[1] - O1[1], O2[0] - O1[0]);
const beta0 = Math.asin((R1 + R2) / d12), sgn = Math.sign(hMid - e12) || 1, beta = Math.asin((a + b) / d12), hNew = e12 + sgn * beta;
const rotation = beta - beta0, uN = unit(hNew), F1 = [O1[0] - a * uN[1], O1[1] + a * uN[0]], F2 = [O2[0] + b * uN[1], O2[1] - b * uN[0]];
const tangentII = Math.hypot(F2[0] - F1[0], F2[1] - F1[1]), straightII = tangentII - k1.K - k2.K;
function caseII() {
  const TS1 = [F1[0] + uN[0] * k1.K, F1[1] + uN[1] * k1.K];
  const back = alignment([{ len: L1, k0: 0, k1: -1 / R1 }, { len: 40, k0: -1 / R1 }], { start: TS1, h0: hNew + Math.PI });
  const fwd = alignment([{ len: straightII, k0: 0 }, { len: L2, k0: 0, k1: -1 / R2 }, { len: 40, k0: -1 / R2 }], { start: TS1, h0: hNew });
  const pts = [...back.pts.slice(1).reverse(), ...fwd.pts];
  return { pts, check: [Math.hypot(back.end.x - O1[0], back.end.y - O1[1]) - R1, Math.hypot(fwd.end.x - O2[0], fwd.end.y - O2[1]) - R2] };
}
const II = caseII();
const arcAround = (C, R, F0, half) => { const t0 = Math.atan2(F0[1] - C[1], F0[0] - C[0]), o = []; for (let i = 0; i <= 40; i++) { const t = t0 + (i / 40 - .5) * 2 * half / R; o.push([C[0] + R * Math.cos(t), C[1] + R * Math.sin(t)]); } return o; };

export default {
  cam: { pos: [3, 40, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { m: 'I', carD: 0 };
    let S = .08, ox = 0, oz = 0, track = null, road = null;
    const P = (q, h = 0) => new THREE.Vector3(ox + q[0] * S, GROUND + h, oz - q[1] * S);
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 34, 29); group.add(forest);
    const old = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .07, dashed: true }); group.add(old);
    const circles = holo.segments([[0, 0, 0], [0, 0, 0]], holo.DIM, .8, { width: .04, dashed: true }); group.add(circles);
    const lab = (t, col = '#14202b', h = .58) => { const l = holo.label(t, { h, color: col, bg: 'rgba(255,253,248,.92)', weight: 700 }); group.add(l); return l; };
    const tags = { a: lab('R 150 m, 30°', '#24557a'), b: lab('R 125 m, 40°', '#24557a'), mid: lab('straight', '#8a3f1c', .55) };
    const auto = car(1, 0x24557a); group.add(auto);

    const card = textPlane({ w: 9.8, h: 7.2, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 15px ${F}`;
      const head = { E: 'FIG. 51 · THE EXISTING REVERSE CURVE', I: 'EXAMPLE 11.38 · CASE I: THE CURVES MOVE', II: 'EXAMPLE 11.39 · CASE II: THE CURVES STAY' }[st.m];
      c.fillText(head, 18, 24); c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText('150 m 30°, 75 m straight, 125 m back 40°; Ls 45 and 55 m (Table 9).', 18, 42);
      c.font = `600 11px ${F}`; c.textAlign = 'right'; c.fillText('BOOK', W - 150, 62); c.fillText('COMPUTED', W - 30, 62); c.textAlign = 'left';
      const rows = st.m === 'E' ? [
        ['150 tan 15°; 150 (sec 15° − 1)', '40.192; 5.292', `${(R1 * Math.tan(D1 / 2)).toFixed(3)}; ${(R1 * (1 / Math.cos(D1 / 2) - 1)).toFixed(3)}`],
        ['125 tan 20°; 125 (sec 20° − 1)', '45.496; 8.022', `${(R2 * Math.tan(D2 / 2)).toFixed(3)}; ${(R2 * (1 / Math.cos(D2 / 2) - 1)).toFixed(3)}`],
        ['Apex to apex', '160.686 m', `${apexDist.toFixed(3)} m`],
      ] : st.m === 'I' ? [
        ['150 m: θs, s, K', '8.595°, 0.5623, 22.482', `${deg(k1.thetaS).toFixed(3)}°, ${k1.S.toFixed(4)}, ${k1.K.toFixed(3)}`],
        ['150 m: Ts, Es', '62.825, 5.8736', `${k1.Ts.toFixed(3)}, ${k1.Es.toFixed(4)}`],
        ['125 m: θs, s, K', '12.606°, 1.0068, 27.456', `${deg(k2.thetaS).toFixed(3)}°, ${k2.S.toFixed(4)}, ${k2.K.toFixed(3)}`],
        ['125 m: Ts, Es', '73.318, 9.874 !', `${k2.Ts.toFixed(3)}, ${k2.Es.toFixed(4)}`, true],
        ['Straight between', '25.062 m !', `${straightI.toFixed(3)} m`, true],
      ] : [
        ['Δ1 = tan⁻¹ 75 / 275', '15°15′18″', dms(90 - deg(beta0))],
        ['O1O2 = 275 / cos Δ1', '285.0436 m', `${d12.toFixed(4)} m`],
        ['cos Δ2 = (R1 + s1 + R2 + s2) / O1O2', '0.9667612 !', ((a + b) / d12).toFixed(7), true],
        ['Δ2', '14°48′50″ !', dms(90 - deg(beta)), true],
        ['The middle tangent turns by Δ1 − Δ2', '0°26′18″ !', dms(deg(rotation)), true],
        ['Straight between the spirals', '25.448 m !', `${straightII.toFixed(3)} m`, true],
      ];
      rows.forEach(([l, bk, v, bad], i) => { const y = 84 + i * 24; c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`; c.fillText(l, 18, y); c.textAlign = 'right'; c.font = `700 13px ${F}`; c.fillStyle = bad ? '#b3362b' : '#14202b'; c.fillText(bk, W - 150, y); c.fillStyle = '#1f7a45'; c.fillText(v, W - 30, y); c.textAlign = 'left'; });
      const note = {
        E: 'Two curves of opposite hand close together: transitions matter most here (cl. 9.1). Case I moves the curves, Case II keeps them.',
        I: 'FC’s Es is printed 9.874; (125 + 1.0068) sec 20° − 125 = 9.094 (Fig. 52 has it right). The book takes K off the 75 m only; each shift also lengthens its tangent by s tan Δ/2, so 24.545 m is left.',
        II: 'The book drops a metre in the sum (275.569 for 276.569), subtracts the angles wrongly, and measures along the tangent with O1O2 tan Δ2 where the common tangent is O1O2 sin Δ2. Exact: 19.05 m of straight.',
      }[st.m];
      c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; let y = H - 46, ln = '';
      for (const w of note.split(' ')) { const t = ln ? ln + ' ' + w : w; if (c.measureText(t).width > W - 36) { c.fillText(ln, 18, y); y += 15; ln = w; } else ln = t; }
      c.fillText(ln, 18, y);
      c.fillText('Red: confirmed on the page, or against the book’s own geometry.', 18, H - 6);
    } });
    card.position.set(5.1, 2.9, 10.3); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      let pts, focus;
      if (st.m === 'II') { pts = II.pts.map(xy); focus = [(F1[0] + F2[0]) / 2, (F1[1] + F2[1]) / 2]; S = .2; }
      else { pts = (st.m === 'I' ? caseI().pts : ex.pts).map(xy); focus = [(V1[0] + V2[0]) / 2, (V1[1] + V2[1]) / 2]; S = .075; }
      ox = .5 - focus[0] * S; oz = -5 + focus[1] * S;
      if (road) group.remove(road.group); road = makeRoad(P, S); group.add(road.group);
      const rc = clipRun(pts, P, SLAB); track = road.set(rc.pts);
      old.visible = st.m !== 'E'; if (old.visible) holo.setPoints(old, clipRun(ex.pts.map(xy), P, SLAB).pts.map(q => P(q, .1)));
      circles.visible = st.m === 'II';
      if (circles.visible) { const pairs = []; for (const arc of [arcAround(O1, a, F1, 45), arcAround(O2, b, F2, 45)]) for (let i = 0; i < arc.length - 1; i += 2) pairs.push(P(arc[i], .05), P(arc[i + 1], .05)); holo.setPoints(circles, pairs); }
      const c1 = ex.pts[idx(80 + R1 * D1 / 2)], c2 = ex.pts[idx(80 + R1 * D1 + EF + R2 * D2 / 2)];
      tags.a.position.copy(P([c1[0] + 2 / S, c1[1] + 1.5 / S], 1)); tags.b.position.copy(P([c2[0] - 1 / S, c2[1] - 2 / S], 1)); tags.a.visible = tags.b.visible = st.m !== 'II';
      tags.mid.userData.setText(st.m === 'E' ? `straight ${EF} m` : `straight ${(st.m === 'I' ? straightI : straightII).toFixed(2)} m`);
      tags.mid.position.copy(P([focus[0] + .4 / S, focus[1] + 1.5 / S], 1.1));
      auto.children[0].scale.setScalar(S * VEH);
      const near = rc.pts.filter((_, i) => i % 6 === 0).map(q => P(q)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.6));
      card.redraw();
    }
    const actions = [['E', 'Existing (Fig. 51)'], ['I', 'Case I: curves move'], ['II', 'Case II: curves stay']].map(([k, l]) => ({ label: l, toggle: () => st.m === k, run: () => { st.m = k; rebuild(); } }));
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a2 => ({ label: a2.label, run: a2.run })),
      update(dt) {
        anims.tick(dt);
        if (track) { st.carD = (st.carD + dt * (st.m === 'II' ? 8 : 20)) % track.length; const p = track.at(st.carD); auto.position.copy(P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h; }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.5 : 5.1; card.scale.setScalar(tall ? .8 : 1);
      },
      reset() { anims.clear(); st.m = 'I'; rebuild(); guide.reset(); },
      get debug() { return { m: st.m, apexDist: +apexDist.toFixed(3), straightI: +straightI.toFixed(3), cosD2: +((a + b) / d12).toFixed(7), rotation: dms(deg(rotation)), tangentII: +tangentII.toFixed(3), straightII: +straightII.toFixed(3), onCircles: II.check.map(v => +v.toFixed(3)), guide: guide.debug }; },
    };
    const L = actions.map(a2 => a2.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Reverse', show: L, text: 'Two curves of opposite hand with only 75 m between them. A driver flicks from one to the other: transitions are very important here.',
          check: { q: 'Transitions are most important when…', options: ['two curves of opposite direction are close together', 'a curve is very flat', 'the road is straight'], answer: 0, why: 'Transitions are very important when two curves of opposite direction are close together (cl. 9.1).' } },
        { title: 'Case I', show: L, text: 'Keep the straights; each curve takes its spirals about its own apex and moves inward. The straight between them shrinks.',
          check: { q: 'In Case I, what stays fixed?', options: ['the tangents', 'the circular curves', 'both'], answer: 0, why: 'Case I: circular curves movable, tangents fixed (cl. 9.1, Example 11.38).' } },
        { title: 'Case II', show: L, text: 'Keep the circles; the middle tangent swings to touch circles enlarged by the shifts. Compare the book’s numbers with the exact geometry.',
          check: { q: 'The length of a common tangent between two circles whose centres are O1O2 apart is…', options: ['O1O2 sin Δ2, i.e. √(O1O2² − (sum of radii)²)', 'O1O2 tan Δ2', 'O1O2 cos Δ2'], answer: 0, why: 'The radii, the tangent and O1O2 make a right-angled triangle: the tangent is O1O2 sin Δ2. With s = 0 it gives back the original 75 m; Example 11.39 prints tan.' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild();
    return api;
  },
};
