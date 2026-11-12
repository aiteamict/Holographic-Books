// Spread 6 · The spiral (cl. 7.5.1, 7.5.2, 7.5.4, eq. 20–24). A road leaves its straight on a spiral of length Ls ending
// at radius Rc, then runs on round the circle. Drag the point along the spiral: its osculating circle (radius A²/L,
// dashed) shrinks as it goes, the chord from T.P. shows the polar deflection α, and the card sets the series of the book
// beside the exact spiral.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { spiralXY } from '../../_irc38/curve.js';
import { diorama, trees, track } from '../../_irc38/site.js';
import { band, swapGeo } from '../../_irc38/deck.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, DEG = 180 / Math.PI;

export default {
  cam: { pos: [3, 38, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 58, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { Ls: 80, Rc: 100, L: 50 };
    let S = .15, ox = -9, oz = 4, spiral = [];
    const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S);
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 30, 71); group.add(forest);
    const deck = new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt); deck.receiveShadow = true; group.add(deck);
    const spLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .1 }), arcLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.CYAN, { width: .1 });
    const osc = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.GREEN, { width: .06, dashed: true }), chord = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .06 });
    const tangent = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.DIM, { width: .05, dashed: true }), yLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .06 });
    group.add(spLine, arcLine, osc, chord, tangent, yLine);
    const tags = { TP: holo.label('T.P.', { h: .62, color: '#14202b', bg: 'rgba(255,253,248,.92)', weight: 700 }), CT: holo.label('C.T.', { h: .62, color: '#14202b', bg: 'rgba(255,253,248,.92)', weight: 700 }), R: holo.label('R', { h: .6, color: '#2f8f55', bg: 'rgba(255,253,248,.92)' }) };
    Object.values(tags).forEach(t => group.add(t));
    const grip = holo.handle('point', { label: 'L · drag', kind: 'lever', r: .8 }); group.add(grip);
    const A2 = () => st.Rc * st.Ls;
    const at = L => spiralXY(L, st.Ls, st.Rc, 96);

    const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
      c.fillText(`THE SPIRAL · Ls ${st.Ls} m, Rc ${st.Rc} m · A² = Ls Rc = ${A2()} m²`, 18, 26);
      const L = st.L, p = at(L), th = L * L / (2 * st.Rc * st.Ls), alpha = Math.atan2(p.y, p.x);
      c.font = `600 12px ${F}`; c.fillStyle = '#5c6168'; c.fillText(`AT L = ${L.toFixed(1)} m`, 18, 52); c.textAlign = 'right'; c.fillText('EXACT', W - 150, 52); c.fillText('BOOK’S FORM', W - 18, 52); c.textAlign = 'left';
      const rows = [
        ['Radius R = A² / L (eq. 20)', `${(A2() / L).toFixed(1)} m`, `${(st.Rc * st.Ls / L).toFixed(1)} m`],
        ['θ = L² / 2RcLs (eq. 21A)', `${(th * DEG).toFixed(3)}°`, `${(28.65 * L * L / (st.Rc * st.Ls)).toFixed(3)}°`],
        ['Offset y ≈ L³ / 6RcLs (eq. 22)', `${p.y.toFixed(3)} m`, `${(L ** 3 / (6 * A2())).toFixed(3)} m`],
        ['Along x ≈ L (1 − θ²/10) (eq. 23)', `${p.x.toFixed(3)} m`, `${(L * (1 - th * th / 10)).toFixed(3)} m`],
        ['Polar deflection α ≈ θ/3 (eq. 24)', `${(alpha * DEG).toFixed(3)}°`, `${(th / 3 * DEG).toFixed(3)}°`],
      ];
      rows.forEach(([a, b, d], i) => { const y = 78 + i * 26; c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(a, 18, y); c.fillStyle = '#14202b'; c.font = `700 15px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 150, y); c.fillStyle = '#24557a'; c.fillText(d, W - 18, y); c.textAlign = 'left'; });
      const ths = st.Ls / (2 * st.Rc);
      c.fillStyle = '#14202b'; c.font = `700 15px ${F}`; c.fillText(`At C.T.: θs = Ls / 2Rc = ${ths.toFixed(4)} rad = 28.65 Ls / Rc = ${(28.65 * st.Ls / st.Rc).toFixed(2)}°`, 18, 222);
      c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`;
      c.fillText('Green dashed: the osculating circle at the point. Red: the chord from T.P.', 18, H - 30);
      c.fillText('28.65 is 90/π rounded, so the book’s form can differ in the last digit.', 18, H - 12);
    } });
    card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      spiral = []; for (let l = 0; l <= st.Ls + 1e-9; l += 1) { const q = at(l); spiral.push([q.x, q.y]); }
      const end = at(st.Ls), ths = end.theta, nC = [-Math.sin(ths), Math.cos(ths)], O = [end.x + nC[0] * st.Rc, end.y + nC[1] * st.Rc], arc = [];
      for (let i = 0; i <= 40; i++) { const a = ths + i / 40 * (40 / DEG); arc.push([O[0] + st.Rc * Math.sin(a), O[1] - st.Rc * Math.cos(a)]); }
      const all = [[-40, 0], ...spiral, ...arc.slice(1)], xs = all.map(p => p[0]), ys = all.map(p => p[1]);
      S = Math.min(.2, 22 / (Math.max(...xs) - Math.min(...xs) + 10), 15 / (Math.max(...ys) + 14));
      ox = -11.5 - Math.min(...xs) * S; oz = 4;
      swapGeo(deck, band(track(all), P, () => 3.5, () => -3.5, .012));
      holo.setPoints(spLine, spiral.map(p => P(p, .05))); holo.setPoints(arcLine, arc.map(p => P(p, .05)));
      tags.TP.position.copy(P([0, -9], 1)); tags.CT.position.copy(P([end.x + 6, end.y - 6], 1));
      const near = all.filter((_, i) => i % 4 === 0).map(p => P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.8));
      st.L = Math.min(st.L, st.Ls); place();
    }
    function place() {
      const L = Math.max(1, st.L), p = at(L), th = p.theta, rho = A2() / L, n = [-Math.sin(th), Math.cos(th)], C = [p.x + n[0] * rho, p.y + n[1] * rho];
      const span = Math.min(Math.PI, 90 / rho), oscPts = [];
      for (let i = 0; i <= 64; i++) { const a = th - span + 2 * span * i / 64; oscPts.push(P([C[0] + rho * Math.sin(a), C[1] - rho * Math.cos(a)], .07)); }
      holo.setPoints(osc, oscPts);
      holo.setPoints(chord, [P([0, 0], .08), P([p.x, p.y], .08)]);
      holo.setPoints(tangent, [P([0, 0], .06), P([p.x + 10, 0], .06)]);
      holo.setPoints(yLine, [P([p.x, 0], .09), P([p.x, p.y], .09)]);
      grip.position.copy(P([p.x, p.y], .1));
      tags.R.userData.setText(`R ${rho.toFixed(0)} m`); tags.R.position.copy(P([p.x + n[0] * 12, p.y + n[1] * 12], 1.2));
      card.redraw();
    }
    let dragging = false;
    const set = (k, v) => { st[k] = v; rebuild(); };
    const actions = [
      ...[40, 80, 120].map(Ls => ({ label: `Ls ${Ls} m`, toggle: () => st.Ls === Ls, run: () => set('Ls', Ls) })),
      ...[100, 200].map(Rc => ({ label: `Rc ${Rc} m`, toggle: () => st.Rc === Rc, run: () => set('Rc', Rc) })),
    ];
    const api = {
      group, dragPlane: 'xz', targets: [grip], actions,
      press(hit) { dragging = !!tagged(hit.object, 'handle'); },
      drag({ point }) {
        if (!dragging) return;
        const q = [(point.x - ox) / S, -(point.z - oz) / S]; let best = 0, bd = Infinity;
        spiral.forEach((p, i) => { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < bd) { bd = d; best = i; } });
        st.L = Math.max(1, best); place();
      },
      release() { if (dragging) { dragging = false; guide.say(`At L = ${st.L} m the radius is A²/L = ${(A2() / st.L).toFixed(0)} m.`); } },
      tap(hit) { guide.tap(hit); },
      a11y: [...actions.map(a => ({ label: a.label, run: a.run })), { label: 'Point 10 m on', run: () => { st.L = Math.min(st.Ls, st.L + 10); place(); } }, { label: 'Point 10 m back', run: () => { st.L = Math.max(1, st.L - 10); place(); } }],
      update(dt) {
        anims.tick(dt);
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); Object.assign(st, { Ls: 80, Rc: 100, L: 50 }); rebuild(); guide.reset(); },
      get debug() { const p = at(st.L); return { Ls: st.Ls, Rc: st.Rc, L: st.L, R: +(A2() / st.L).toFixed(2), thetaDeg: +(p.theta * DEG).toFixed(4), y: +p.y.toFixed(4), yBook: +(st.L ** 3 / (6 * A2())).toFixed(4), alpha: +(Math.atan2(p.y, p.x) * DEG).toFixed(4), guide: guide.debug }; },
    };
    const L = actions.map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'L R = A²', show: [], text: 'Drag the point along the spiral. Its circle (green) is huge near T.P. and shrinks to Rc at C.T.: L × R stays the same.',
          check: { q: 'Halfway along a spiral of Ls 80 m ending at Rc 100 m, the radius is…', options: ['200 m', '50 m', '100 m'], answer: 0, why: 'L R = Ls Rc = 8000 m²; at L = 40 m, R = 8000/40 = 200 m (eq. 20, cl. 7.5.2).' } },
        { title: 'The angles', show: L, text: 'θ grows as L²; the chord from T.P. turns through about a third of it.',
          check: { q: 'θs for Ls 80 m on Rc 100 m?', options: ['22.92°', '45.84°', '11.46°'], answer: 0, why: 'θs = 28.65 Ls / Rc = 28.65 × 80 / 100 = 22.92° (eq. 21B).' } },
        { title: 'Lengths and radii', show: L, text: 'Change Ls and Rc. For the same θs, Ls varies as Rc; a longer spiral on the same radius turns through more.',
          check: { q: 'Same radius, longer spiral: θs…', options: ['increases in proportion to the length', 'stays the same', 'decreases'], answer: 0, why: 'For the same radius θs is proportional to the length, and s, LC, LT and ST increase (cl. 7.5.4 f).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild();
    return api;
  },
};
