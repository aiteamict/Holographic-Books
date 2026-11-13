// Spread 7 · Hair-pin bends (section 10, Example 11.40, Fig. 54). Intersection angle 165°, 25 km/h in steep terrain.
// Inner edge R 20 m fully transitional; centre line R 23.75 m and outer edge R 27.5 m with their own transitions, all
// concentric (cl. 10.3), the straights 4.75 m apart, 7.5 m at the apex (cl. 10.2). The deck climbs 1 in 20 on the
// approaches and 1 in 40 on the bend (Fig. 54; cl. 10.2 caps the bend at 1 in 40).
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { horizontalCurve as hc, layout, deg } from '../../_irc38/curve.js';
import { diorama, trees, track, car, VEH } from '../../_irc38/site.js';
import { SM } from '@engine/scene.js';
import { swapGeo } from '../../_irc38/deck.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, D = 165, RAD = Math.PI / 180, HALF = 4.75 / 2, RUN = 70;
const bis = (f, a, b) => { for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; } return (a + b) / 2; };
// inner edge: fully transitional (θs = 82.5°); centre and outer: the shift that keeps them concentric with the inner
const kin = hc(D, 20, 2 * 20 * 82.5 * RAD);
const sFor = R => 20 + kin.S + (R === 23.75 ? HALF : 2 * HALF) - R;
const kmid = hc(D, 23.75, bis(L => hc(D, 23.75, L).S - sFor(23.75), 1, 2 * 23.75 * 82.5 * RAD - 1e-6));
const kout = hc(D, 27.5, bis(L => hc(D, 27.5, L).S - sFor(27.5), 1, 2 * 27.5 * 82.5 * RAD - 1e-6));
const up = HALF / Math.cos(D * RAD / 2);   // straights 2.375 m apart move the apex this far along the bisector
const lineOf = (k, dy) => { const L = layout(k, .5), u1 = L.u1, u2 = [u1[0], -u1[1]], mv = p => [p[0], p[1] + dy]; return [mv([L.TP[0] - u1[0] * RUN, L.TP[1] - u1[1] * RUN]), ...L.pts.map(mv), mv([L.PT[0] + u2[0] * RUN, L.PT[1] + u2[1] * RUN])]; };
const LINES = { inner: lineOf(kin, -up), centre: lineOf(kmid, 0), outer: lineOf(kout, up) };
const segDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
const near = (p, poly) => { let m = Infinity; for (let i = 1; i < poly.length; i++) m = Math.min(m, segDist(p, poly[i - 1], poly[i])); return m; };

export default {
  cam: { pos: [3, 40, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { view: 'design', vx: 1, carD: 0 };
    const xs = [...LINES.inner, ...LINES.outer].map(p => p[0]), ys = [...LINES.inner, ...LINES.outer].map(p => p[1]);
    const S = Math.min(20 / (Math.max(...xs) - Math.min(...xs) + 10), 18 / (Math.max(...ys) - Math.min(...ys) + 10));
    const ox = .5 - (Math.max(...xs) + Math.min(...xs)) / 2 * S, oz = -4 + (Math.max(...ys) + Math.min(...ys)) / 2 * S;
    const T = track(LINES.centre), e1 = RUN, len = kmid.length;
    // grade: 1 in 20 up to the bend, 1 in 40 round it, 1 in 20 beyond
    const zOf = d => d < e1 ? d / 20 : d < e1 + len ? e1 / 20 + (d - e1) / 40 : e1 / 20 + len / 40 + (d - e1 - len) / 20;
    const P = (q, h = 0) => new THREE.Vector3(ox + q[0] * S, GROUND + h, oz - q[1] * S);
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 30, 77); group.add(forest);
    const deck = new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt); deck.receiveShadow = deck.castShadow = true; group.add(deck);
    const fill = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0x9e8a66, roughness: .95, side: THREE.DoubleSide })); group.add(fill);
    const lines = { inner: holo.polyline([[0, 0, 0], [1, 0, 0]], holo.CYAN, { width: .07 }), centre: holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .05, dashed: true }), outer: holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .07 }) };
    Object.values(lines).forEach(l => group.add(l));
    const lab = (t, col, h = .55) => { const l = holo.label(t, { h, color: col, bg: 'rgba(255,253,248,.92)', weight: 700 }); group.add(l); return l; };
    const tags = { inner: lab('inner edge R 20 m', '#1d5f87'), outer: lab('outer edge R 27.5 m', '#b0532a'), w: lab('7.5 m at the apex', '#14202b'), s: lab('4.75 m', '#14202b') };
    const auto = car(S * VEH * 1.2, 0x24557a); group.add(auto);
    function nearestIdx(q) { let best = 0, bd = Infinity; for (let i = 0; i < LINES.centre.length; i += 2) { const p = LINES.centre[i], d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; if (d < bd) { bd = d; best = i; } } return best; }

    const card = textPlane({ w: 9.8, h: 7.2, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 15px ${F}`;
      if (st.view === 'criteria') {
        c.fillText('CL. 10.2 · HAIR-PIN BENDS, NORMAL CRITERIA', 18, 24);
        const rows = [['Minimum design speed', '20 km/h'], ['Roadway at the apex: NH / SH double · single lane', '11.5 m · 9.0 m'], ['MDR and ODR · Village Roads', '7.5 m · 6.5 m'], ['Minimum radius of the inner curve', '14.0 m'], ['Minimum transition length', '15.0 m'], ['Gradient: maximum · minimum', '1 in 40 · 1 in 200'], ['Superelevation', '1 in 10'], ['Between successive hair-pins (cl. 10.4)', 'at least 60 m']];
        rows.forEach(([a, b], i) => { const y = 54 + i * 26; c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(a, 18, y); c.fillStyle = '#14202b'; c.font = `700 14px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 18, y); c.textAlign = 'left'; });
        c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`;
        c.fillText('Edges concentric with the centre line (cl. 10.3). Widening later is difficult: plan for', 18, H - 30);
        c.fillText('it (cl. 10.5). Preferably surface the full width at the bend (cl. 10.6).', 18, H - 14);
        return;
      }
      c.fillText('EXAMPLE 11.40 · Δ 165°, 25 km/h, steep terrain', 18, 24);
      c.font = `600 11px ${F}`; c.fillStyle = '#5c6168'; const cols = [18, 132, 222, 300, 378];
      ['', 'R', 'θs', 'Ls', 'shift s'].forEach((t, i) => c.fillText(t, cols[i], 46));
      const rows = [['Inner edge', kin, 20, '82°30′', 57.587, 6.421], ['Centre line', kmid, 23.75, '66.252°', 54.921, 5.032], ['Outer edge', kout, 27.5, '52.04°', 49.964, 3.667]];
      rows.forEach(([n, k, R, th, ls, s], i) => {
        const y = 68 + i * 40; c.fillStyle = '#14202b'; c.font = `700 13px ${F}`; c.fillText(n, cols[0], y);
        c.font = `500 12px ${F}`; c.fillStyle = '#5c6168'; c.fillText('book', cols[0], y + 16);
        c.fillStyle = '#14202b'; c.font = `600 13px ${F}`; [`${R} m`, th, `${ls} m`, `${s} m`].forEach((t, j) => c.fillText(t, cols[j + 1], y + 16));
        c.fillStyle = '#1f7a45'; [`${R} m`, `${deg(k.thetaS).toFixed(3)}°`, `${k.Ls.toFixed(3)} m`, `${k.S.toFixed(3)} m`].forEach((t, j) => c.fillText(t, cols[j + 1], y));
      });
      c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`;
      const notes = [`Green: exact, edges concentric. Circular arc on the centre line: ${kmid.Lc.toFixed(2)} m;`, 'Fig. 54 prints 11.32 m. Table 11.19: 0.9287 × 49.964 is printed 46.002', '(the spiral gives 0.9206, 46.00 m); 0.486 × 49.964 is printed 24.312 (24.28).', 'Width 4.75 m on the straights (IRC : 52); Ls at least 35 m (Table 9).'];
      notes.forEach((t, i) => c.fillText(t, 18, 196 + i * 16));
      c.fillStyle = '#b3362b'; c.font = `600 12px ${F}`; c.fillText('Misprints confirmed on the page.', 18, H - 8);
    } });
    card.position.set(5.1, 2.9, 10.3); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      const n = Math.ceil(T.length / 1.5), pos = [], idx = [], fp = [], fi = [];
      for (let i = 0; i <= n; i++) {
        const d = T.length * i / n, p = T.at(d), q = [p.x, p.y], nx = -Math.sin(p.h), ny = Math.cos(p.h);
        const wo = near(q, LINES.outer), wi = near(q, LINES.inner), z = zOf(d) * S * st.vx + .03;
        const A = P([q[0] + nx * wo, q[1] + ny * wo], z), B = P([q[0] - nx * wi, q[1] - ny * wi], z);
        pos.push(A.x, A.y, A.z, B.x, B.y, B.z);
        fp.push(A.x, GROUND, A.z, A.x, A.y, A.z, B.x, GROUND, B.z, B.x, B.y, B.z);
        if (i) { const v = 2 * i; idx.push(v - 2, v - 1, v, v - 1, v + 1, v); const f = 4 * i, g = f - 4; fi.push(g, f, g + 1, f, f + 1, g + 1, g + 2, g + 3, f + 2, f + 2, g + 3, f + 3); }
      }
      const mk = (p, ix) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(ix); g.computeVertexNormals(); return g; };
      swapGeo(deck, mk(pos, idx)); swapGeo(fill, mk(fp, fi)); deck.material.side = THREE.DoubleSide;
      const lift = (poly, dl) => poly.map(q => P(q, zOf(T.cum[nearestIdx(q)]) * S * st.vx + dl));
      holo.setPoints(lines.inner, lift(LINES.inner, .06)); holo.setPoints(lines.centre, lift(LINES.centre, .07)); holo.setPoints(lines.outer, lift(LINES.outer, .06));
      const apex = T.at(e1 + len / 2), a = [apex.x, apex.y], za = zOf(e1 + len / 2) * S * st.vx;
      tags.w.position.copy(P([a[0], a[1] - 10], za + 1)); tags.inner.position.copy(P([a[0], a[1] - 24], za + .8)); tags.outer.position.copy(P([a[0] + 30, a[1] - 18], za + .8));
      const s0 = T.at(20); tags.s.position.copy(P([s0.x + 9, s0.y], zOf(20) * S * st.vx + .8));
      const nearPts = LINES.centre.filter((_, i) => i % 8 === 0).map(q => P(q)); forest.userData.hide((x, z) => nearPts.some(q => Math.hypot(q.x - x, q.z - z) < 2.2) || (Math.abs(x - P(a).x) < 4 && z > P(a).z - 1 && z < P(a).z + 7));
      card.redraw();
    }
    const actions = [
      { label: 'Design (Ex 11.40)', toggle: () => st.view === 'design', run: () => { st.view = 'design'; card.redraw(); } },
      { label: 'Criteria (cl. 10.2)', toggle: () => st.view === 'criteria', run: () => { st.view = 'criteria'; card.redraw(); } },
      { label: 'Grades true', toggle: () => st.vx === 1, run: () => { st.vx = 1; rebuild(); } },
      { label: 'Grades ×4', toggle: () => st.vx === 4, run: () => { st.vx = 4; rebuild(); } },
    ];
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        st.carD = (st.carD + dt * 7) % T.length; const p = T.at(st.carD);
        auto.position.copy(P([p.x - Math.sin(p.h) * 1.2, p.y + Math.cos(p.h) * 1.2], zOf(st.carD) * S * st.vx + .05)); auto.rotation.set(0, p.h, 0);
        auto.rotateZ(Math.atan((st.carD < e1 || st.carD > e1 + len ? 1 / 20 : 1 / 40) * st.vx));
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.5 : 5.1; card.scale.setScalar(tall ? .8 : 1);
      },
      reset() { anims.clear(); Object.assign(st, { view: 'design', vx: 1 }); rebuild(); guide.reset(); },
      get debug() { const apex = T.at(e1 + len / 2), q = [apex.x, apex.y]; return { inner: [kin.Ls, kin.S].map(v => +v.toFixed(3)), centre: [kmid.Ls, kmid.S, kmid.Lc].map(v => +v.toFixed(3)), outer: [kout.Ls, kout.S, deg(kout.thetaS)].map(v => +v.toFixed(3)), widthApex: +(near(q, LINES.outer) + near(q, LINES.inner)).toFixed(3), widthStraight: +(near(LINES.centre[5], LINES.outer) + near(LINES.centre[5], LINES.inner)).toFixed(3), rise: +zOf(T.length).toFixed(2), guide: guide.debug }; },
    };
    const L = actions.map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'The bend', show: L, text: 'A road climbing a hillside doubles back through 165°: a hair-pin. The inner edge is a single spiral pair on 20 m; the roadway widens to 7.5 m at the apex.',
          check: { q: 'The minimum radius of the inner curve of a hair-pin is…', options: ['14 m', '20 m', '26 m'], answer: 0, why: 'Normal criteria: minimum radius for the inner curve 14.0 m, minimum transition 15.0 m, design speed at least 20 km/h (cl. 10.2).' } },
        { title: 'Edges', show: L, text: 'Inner edge, centre line and outer edge each get their own transition so that all three are concentric.',
          check: { q: 'At a hair-pin the edges of the roadway are…', options: ['concentric with the centre line', 'parallel straights', 'free to differ'], answer: 0, why: 'The inner and outer edges of the roadway should be concentric with the centre line of the pavement (cl. 10.3).' } },
        { title: 'Grade', show: L, text: 'Make the grades four times steeper to see the climb: easier on the approaches, flatter round the bend.',
          check: { q: 'The steepest gradient allowed at a hair-pin bend is…', options: ['1 in 40', '1 in 20', '1 in 200'], answer: 0, why: 'Gradient at hair-pin bends: maximum 1 in 40 (2.5 per cent), minimum 1 in 200 (0.5 per cent); superelevation 1 in 10 (cl. 10.2).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild();
    return api;
  },
};
