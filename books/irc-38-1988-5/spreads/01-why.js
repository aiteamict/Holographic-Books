// Spread 1 · Why a transition (cl. 7.1). A two-lane road turns through 80° on the minimum radius for the chosen speed
// (Table 3). 'Circular only': the road jumps from straight to circle; the driver eases in over about 3 s of steering, so
// the car's path (red) cuts inside the lane by the shift of that self-made transition, L²/24R. 'With transition': a
// spiral of Table 9 length (eq. 16–19) lets the car hold its lane. The card plots the lateral acceleration v²/R.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { horizontalCurve, layout } from '../../_irc38/curve.js';
import { diorama, trees, track, throughSlab, car, VEH } from '../../_irc38/site.js';
import { offsetPts, band, swapGeo, clipRun } from '../../_irc38/deck.js';
import { MIN_RADIUS, lsMin, rateC } from '../../_irc38/tables.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, DELTA = 80, LANE = 3.5, STEER = 3, S = .16;

export default {
  cam: { pos: [3, 38, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 58, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { V: 65, spiral: false, carD: 0, tick: 0 };
    let ox = 0, oz = 0, road = null, path = null, pe1 = 0, Lp = 0, Rp = 1, Ls = 0, cut = 0;
    const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S);
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 30, 29); group.add(forest);
    const mk = m => { const x = new THREE.Mesh(new THREE.BufferGeometry(), m); x.receiveShadow = true; group.add(x); return x; };
    const deck = mk(SM.asphalt), shL = mk(SM.shoulder), shR = mk(SM.shoulder), edL = mk(SM.paint), edR = mk(SM.paint);
    const centre = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .05, dashed: true }); group.add(centre);
    const trail = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .09 }); group.add(trail);
    const spiralLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .08 }); group.add(spiralLine);
    const auto = car(S * VEH, 0x24557a); group.add(auto);
    const R = () => MIN_RADIUS[st.V][0], v = () => st.V / 3.6;
    // curvature of the car's path at distance d along it (whole-path distance; the path starts pe1 before its T.P.)
    const kOf = d => { const u = Math.min(d - pe1, pe1 + path.len - d); if (u <= 0) return 0; return Lp > 0 && u < Lp ? u / (Lp * Rp) : 1 / Rp; };

    const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
      c.fillText(`LATERAL ACCELERATION · ${st.V} km/h · R ${R()} m · ${st.spiral ? `spiral Ls ${Ls} m` : 'circular only'}`, 18, 26);
      if (!path) return;
      const s0 = pe1 - 60, s1 = pe1 + Math.max(Ls, v() * STEER) + 60, X = s => 18 + (s - s0) / (s1 - s0) * (W - 36), y0 = 42, h = 100, aMax = v() * v() / Rp * 1.25, Y = a => y0 + h - a / aMax * h;
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(18, y0, W - 36, h);
      if (!st.spiral) { c.strokeStyle = '#9aa3ab'; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(X(s0), Y(0)); c.lineTo(X(pe1), Y(0)); c.lineTo(X(pe1), Y(v() * v() / R())); c.lineTo(X(s1), Y(v() * v() / R())); c.stroke(); c.setLineDash([]); }
      c.strokeStyle = st.spiral ? '#2f8f55' : '#c23b2f'; c.lineWidth = 3; c.beginPath();
      for (let s = s0; s <= s1; s += .5) { const a = v() * v() * kOf(s); s === s0 ? c.moveTo(X(s), Y(a)) : c.lineTo(X(s), Y(a)); } c.stroke();
      const cd = Math.min(s1, Math.max(s0, st.carD + path.off)); c.strokeStyle = '#14202b'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(cd), y0); c.lineTo(X(cd), y0 + h); c.stroke();
      c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText(st.spiral ? 'green: the car on the spiral' : 'grey dashed: the road · red: the car, steering in over 3 s', 22, y0 + 14);
      const row = (a, b, y, col = '#14202b') => { c.fillStyle = '#5c6168'; c.font = `500 15px ${F}`; c.fillText(a, 18, y); c.fillStyle = col; c.font = `700 16px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 18, y); c.textAlign = 'left'; };
      const L = st.spiral ? Ls : v() * STEER, Cnow = v() ** 3 / (Rp * L);
      row('Full push on the curve, v² / R', `${(v() * v() / R()).toFixed(2)} m/s²`, 176);
      row(st.spiral ? 'Rate of change along the spiral' : 'Rate of change on the road', st.spiral ? `${Cnow.toFixed(2)} m/s³` : 'sudden', 200, st.spiral ? '#2f8f55' : '#b3362b');
      row('Allowed, C = 80 / (75 + V)  (eq. 17)', `${rateC(st.V).toFixed(2)} m/s³`, 224);
      row(st.spiral ? 'The car leaves its lane by' : 'The car cuts inside its lane by', st.spiral ? '0 m' : `${cut.toFixed(2)} m`, 248, st.spiral ? '#2f8f55' : '#b3362b');
      c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText('A 2.5 m bus in a 3.5 m lane: 0.5 m to spare (cl. 7.1.1). 3 s steering: illustrative.', 18, H - 12);
    } });
    card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      const r = R(); Ls = st.spiral ? lsMin(st.V, r) : 0;
      const k = horizontalCurve(DELTA, r, Ls), L = layout(k, 1);
      ox = -4 - L.TP[0] * S; oz = 1.5 + L.TP[1] * S;   // T.P. at the lower left, the bend opening up the slab
      const th = throughSlab(L, P, SLAB), rc = clipRun(th.pts, P, SLAB); road = track(rc.pts);
      swapGeo(deck, band(road, P, () => LANE, () => -LANE, .012)); swapGeo(shL, band(road, P, () => LANE, () => LANE + 1.5, .008)); swapGeo(shR, band(road, P, () => -LANE, () => -LANE - 1.5, .008));
      const lw = Math.max(.18, .045 / S); swapGeo(edL, band(road, P, () => LANE - lw * .4, () => LANE - lw * 1.4, .02)); swapGeo(edR, band(road, P, () => -LANE + lw * .4, () => -LANE + lw * 1.4, .02));
      holo.setPoints(centre, offsetPts(road, 0, 2).map(p => P(p, .03)));
      // the car's path: the lane centre, 1.75 m left (outer), eased in by the driver over 3 s when the road has no spiral
      Rp = r + 1.75; Lp = st.spiral ? Ls : v() * STEER;
      const kp = horizontalCurve(DELTA, Rp, Lp), Lq = layout(kp, 1), m = 1.75 / Math.cos(DELTA * Math.PI / 360), u1 = Lq.u1, u2 = [u1[0], -u1[1]], E = 300;
      const mv = p => [p[0], p[1] + m];
      const full = [mv([Lq.TP[0] - u1[0] * E, Lq.TP[1] - u1[1] * E]), ...Lq.pts.map(mv), mv([Lq.PT[0] + u2[0] * E, Lq.PT[1] + u2[1] * E])];
      const pc = clipRun(full, P, SLAB); path = track(pc.pts); path.off = pc.off; path.len = kp.length; pe1 = E;
      cut = st.spiral ? 0 : kp.S;   // the eased path falls inside the lane by the shift of the driver's own transition
      holo.setPoints(trail, path.pts.map(p => P(p, .05))); trail.visible = !st.spiral;
      spiralLine.visible = st.spiral;
      if (st.spiral) { const sp = L.pts.slice(0, Math.ceil(Ls) + 1).filter(p => { const q = P(p); return q.x > SLAB.x0 && q.x < SLAB.x1 && q.z > SLAB.z0 && q.z < SLAB.z1; }); if (sp.length > 1) holo.setPoints(spiralLine, sp.map(p => P(p, .04))); }
      const near = rc.pts.filter((_, i) => i % 3 === 0).map(p => P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.9));
      st.carD = 0; card.redraw();
    }
    const set = (k, val) => { st[k] = val; rebuild(); };
    const actions = [
      { label: 'Circular only', toggle: () => !st.spiral, run: () => set('spiral', false) },
      { label: 'With transition', toggle: () => st.spiral, run: () => set('spiral', true) },
      ...[40, 65, 80].map(V => ({ label: `${V} km/h`, toggle: () => st.V === V, run: () => set('V', V) })),
    ];
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        if (path) {
          st.carD += dt * v() * .6; if (st.carD > path.length - 1) st.carD = 0;
          const p = path.at(st.carD); auto.position.copy(P([p.x, p.y], .01)); auto.rotation.y = p.h;
          auto.userData.body.rotation.x = -Math.min(.25, v() * v() * kOf(st.carD + path.off) * .06);   // body roll with the push
          if ((st.tick += dt) > .12) { st.tick = 0; card.redraw(); }
        }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); Object.assign(st, { V: 65, spiral: false, carD: 0 }); rebuild(); guide.reset(); },
      get debug() { return { V: st.V, R: R(), spiral: st.spiral, Ls, cut: +cut.toFixed(3), C: +(v() ** 3 / (Rp * (st.spiral ? Ls : v() * STEER))).toFixed(3), allowedC: +rateC(st.V).toFixed(3), guide: guide.debug }; },
    };
    const L = actions.map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Circular only', show: L, text: 'The road goes straight into the circle. The push jumps; the driver eases in anyway, and the car (red) cuts inside its lane.',
          check: { q: 'Entering a circular curve straight from a tangent…', options: ['applies the centrifugal force suddenly', 'needs no steering', 'removes the need for superelevation'], answer: 0, why: 'The centrifugal force is applied suddenly, causing a shock and sway; drivers steer gradually and cut into the adjacent lane (cl. 7.1.1).' } },
        { title: 'With transition', show: L, text: 'Now a spiral: the radius falls gradually from infinity to R, the push grows steadily, and the car keeps its lane.',
          check: { q: 'Which way lets vehicles keep the same speed on the curve as on the straight?', options: ['a radius changing gradually from infinity to the design radius', 'slowing down before the curve', 'a path of larger radius across the lanes'], answer: 0, why: 'Reducing speed needs foreknowledge and hurts free flow; a larger path encroaches the inner lane. Only a gradual change of radius keeps the speed (cl. 7.1.2).' } },
        { title: 'And also', show: L, text: 'The spiral is also where superelevation is built up, and it takes away the kink a circle makes against a straight.',
          check: { q: 'Besides comfort, transitions…', options: ['let superelevation be applied gradually and remove the optical bulge', 'make the curve shorter', 'remove the need for widening'], answer: 0, why: 'They permit gradual application of superelevation and improve appearance: a circular curve joining a straight gives an illusion of a bulge (cl. 7.1.3).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild();
    return api;
  },
};
