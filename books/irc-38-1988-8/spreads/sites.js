// What each table's site model shows beyond the curve itself (tableSpread init/decorate hooks):
//   level    Table 10 · Example 11.7's level crossing, 322 m from the apex along the first straight
//   osc      Table 13 · the circle of radius Rc that the two spirals share at the C.C.T., touching at one point only
//   shiftFig Table 15 · the shift: straight, circle with no transition, shifted circle and spiral, offsets exaggerated
//   unit     Table 16 · the 100 m circle the table is printed for, on the same straights as the chosen radius
import * as THREE from 'three';
import { horizontalCurve as hc, layout, spiralXY } from '../../_irc38/curve.js';

const onSlab = q => Math.abs(q.x) < 12.2 && q.z > -15.4 && q.z < 7;
const tagOpt = (color = '#14202b') => ({ h: .62, color, bg: 'rgba(255,253,248,.94)', weight: 700 });

// ── Table 10: the level crossing ───────────────────────────────────────────────────────────────────────────────────
const RAIL = 322;   // Example 11.7: Ts must stay under 322 m
export const level = {
  init({ group, holo }) {
    const rail = new THREE.Group(), steel = new THREE.MeshStandardMaterial({ color: 0x6d737a, metalness: .6, roughness: .4 }), wood = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: .9 });
    for (const z of [-.24, .24]) { const r = new THREE.Mesh(new THREE.BoxGeometry(9, .07, .07), steel); r.position.set(0, .09, z); rail.add(r); }
    for (let x = -4.4; x <= 4.4; x += .4) { const sl = new THREE.Mesh(new THREE.BoxGeometry(.13, .05, .78), wood); sl.position.set(x, .03, 0); sl.castShadow = true; rail.add(sl); }
    const ok = holo.label('Level crossing, 322 m from P.I.: Ts fits', tagOpt('#1f7a45')), bad = holo.label('T.P. beyond the level crossing', tagOpt('#b3362b'));
    group.add(rail, ok, bad);
    return { rail, ok, bad };
  },
  decorate(d, s, plan, k) {
    const u = plan.L.u1, q = plan.P([-u[0] * RAIL, -u[1] * RAIL], .02), on = onSlab(q);
    d.rail.visible = on; d.rail.position.copy(q); d.rail.rotation.y = Math.atan2(-u[0], u[1]);   // sleepers square to the straight
    d.ok.visible = on && k.Ts <= RAIL; d.bad.visible = on && k.Ts > RAIL;
    for (const t of [d.ok, d.bad]) t.position.set(q.x, q.y + 1.6, q.z + 1.2);
  },
};

// ── Table 13: the circle at the C.C.T. ─────────────────────────────────────────────────────────────────────────────
export const osc = {
  init({ group, holo }) {
    const arc = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.CYAN, { width: .1, dashed: true }); const tag = holo.label('circle of Rc: touches only at C.C.T.', tagOpt('#1d5f87'));
    group.add(arc, tag); return { arc, tag, holo };
  },
  decorate(d, s, plan, k) {
    const c = [0, -k.Es - k.R], pts = [];
    for (let a = -.9; a <= .9001; a += .03) pts.push(plan.P([c[0] + k.R * Math.sin(a), c[1] + k.R * Math.cos(a)], .08));
    const on = pts.filter(onSlab); d.arc.visible = on.length > 1; if (on.length > 1) d.holo.setPoints(d.arc, on);
    d.tag.position.copy(plan.P([0, -k.Es], 3.2));
  },
};

// ── Table 15: the shift, drawn as in the text figures ──────────────────────────────────────────────────────────────
export const shiftFig = {
  init({ group, holo, GROUND }) {
    const W = 13, H = 5.6, panel = holo.frame(W, H, 'The shift · along the first straight');
    panel.position.set(0, GROUND + 2.6, -12.6); panel.rotation.x = -.8; group.add(panel);
    const line = (col, o) => { const l = holo.polyline([[0, 0, 0], [1, 0, 0]], col, { width: .1, ...o }); panel.add(l); return l; };
    const L = { straight: line(holo.DIM), plain: line(holo.WHITE, { dashed: true, width: .07 }), circle: line(holo.CYAN), spiral: line(holo.AMBER), dim: line(holo.RED, { width: .08 }) };
    const tag = (t, col) => { const l = holo.label(t, { h: .62, color: col, weight: 700 }); panel.add(l); return l; };
    const T = { straight: tag('straight', '#5c6168'), plain: tag('circle with no transition', '#262b31'), circle: tag('shifted circle', '#1d5f87'), spiral: tag('spiral', '#b0532a'), s: tag('s', '#c23b2f'), k: tag(' ', '#14202b') };
    T.k.position.set(-W / 2 + 4.2, H / 2 - .6, .05);
    return { W, H, L, T, holo };
  },
  decorate(d, s, plan, k) {
    const { W, H, L, T, holo } = d, R = k.R, Ls = k.Ls, D = k.delta;
    const x0 = k.Ts - R * Math.tan(D / 2);                       // where the plain circle leaves the straight, from T.P.
    const xa = -.15 * Ls, xb = 1.3 * Ls;   // the transition and a little either side: where the shift lives
    // the shifted circle is produced back to P.C., where it runs s from the straight
    const circ = (cx, cy, x) => cy - Math.sqrt(Math.max(0, R * R - (x - cx) ** 2));
    const plain = [], shifted = [], spiral = [];
    for (let i = 0; i <= 80; i++) { const x = xa + (xb - xa) * i / 80; if (x >= x0) plain.push([x, circ(x0, R, x)]); if (x >= k.K) shifted.push([x, circ(k.K, R + k.S, x)]); }
    for (let i = 0; i <= 40; i++) { const p = spiralXY(Ls * i / 40, Ls, R); spiral.push([p.x, p.y]); }
    const ymax = 4.4 * k.S;   // the spiral ends at Yc ≈ 4s: scale to that and clip the circles above it
    const sx = (W - 1.6) / (xb - xa), sy = (H - 2.2) / ymax, X = x => -W / 2 + .8 + (x - xa) * sx, Y = y => -H / 2 + 1.2 + y * sy;
    const pts = a => { const q = a.filter(p => p[1] <= ymax).map(([x, y]) => [X(x), Y(y), .03]); return q.length > 1 ? q : [[0, 0, 0], [0, 0, 0]]; };
    holo.setPoints(L.straight, [[X(xa), Y(0), .02], [X(xb), Y(0), .02]]);
    holo.setPoints(L.plain, pts(plain)); holo.setPoints(L.circle, pts(shifted)); holo.setPoints(L.spiral, pts(spiral));
    holo.setPoints(L.dim, [[X(k.K), Y(0), .04], [X(k.K), Y(k.S), .04]]);   // the shift: straight to shifted circle, square at P.C.
    T.straight.position.set(X(xa) + 1, Y(0) - .45, .05); T.spiral.position.set(X(spiral[24][0]) - 1.2, Y(spiral[24][1]) + .4, .05);
    const top = a => a.filter(p => p[1] <= ymax).at(-1) || a[0] || [xb, 0], pe = top(plain), se = top(shifted);
    T.plain.visible = plain.length > 1; T.plain.position.set(X(pe[0]) - 2.6, Y(pe[1]) - .7, .05); T.circle.position.set(X(k.K) + 2.4, Y(k.S) + .75, .05);
    T.s.position.set(X(k.K) - .35, Y(k.S / 2), .05);
    T.k.userData.setText(`s = ${k.S.toFixed(3)} m · offsets drawn ${Math.round(sy / sx)}× true`);
  },
};

// ── Table 16: the 100 m circle beside the chosen one ───────────────────────────────────────────────────────────────
export const unit = {
  init({ group, holo }) {
    const arc = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .06, dashed: true }), tag = holo.label('R 100 m: Table 16 as printed', tagOpt('#262b31'));
    group.add(arc, tag); return { arc, tag, holo };
  },
  decorate(d, s, plan, k) {
    const show = Math.abs(k.R - 100) > 1; d.arc.visible = d.tag.visible = show; if (!show) return;
    const L = layout(hc(k.deltaDeg, 100, 0), .5), pts = L.pts.map(p => plan.P(p, .07));
    d.holo.setPoints(d.arc, pts); d.tag.position.copy(plan.P(L.mid, .9)); d.tag.position.z += 1.8;   // below the arc, clear of the P.I. tag
  },
};
