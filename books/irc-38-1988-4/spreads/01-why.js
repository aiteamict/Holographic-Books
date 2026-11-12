// Spread 1 · Why curves are widened (cl. 6.1). A truck, then a truck-trailer, drives the left lane round a 30 m hill
// bend. The front axle follows the lane; the rear axle and the trailer follow by a simple pursuit model, so they cut
// inside. Red traces the outer front corner, blue the inner rear wheel; the gap between them is the width swept.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { horizontalCurve, layout } from '../../_irc38/curve.js';
import { diorama, trees, track, throughSlab } from '../../_irc38/site.js';
import { offsetPts, band, swapGeo } from './deck.js';

const F = 'Inter, Segoe UI, Arial', S = .3, GROUND = .5, O = new THREE.Vector3(1.5, GROUND, -11), R = 30, DELTA = 100, LANE = 3.5;
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };
// dimensions illustrative, of the kind cl. 6.2.1 has in mind (11 m representative wheel base)
const VEHS = {
  truck: { label: 'Truck', wb: 6.1, w: 2.5, front: 1.4, rear: 2.0 },
  semi: { label: 'Truck-trailer', wb: 3.8, w: 2.5, front: 1.4, rear: .2, trailer: 9.6, tRear: 2.2 },
};

export default {
  cam: { pos: [3, 38, 35], look: [3.5, 0, -3], portrait: { pos: [15, 58, 48], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const P = (xy, h = 0) => new THREE.Vector3(O.x + xy[0] * S, O.y + h, O.z - xy[1] * S);
    const st = { kind: 'truck', sim: null };
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 30, 23); group.add(forest);
    const deck = new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt), shL = new THREE.Mesh(new THREE.BufferGeometry(), SM.shoulder), shR = new THREE.Mesh(new THREE.BufferGeometry(), SM.shoulder);
    const edL = new THREE.Mesh(new THREE.BufferGeometry(), SM.paint), edR = new THREE.Mesh(new THREE.BufferGeometry(), SM.paint);
    for (const m of [deck, shL, shR, edL, edR]) { m.receiveShadow = true; group.add(m); }
    const centre = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .05, dashed: true }); group.add(centre);
    const outer = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .09 }), inner = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.CYAN, { width: .09 }); group.add(outer, inner);
    let units = [], T = null, lane = null, L = null, e1 = 0, arc = 0;
    const body = (len, w, h, color) => { const g = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(len * S, h * S, w * S), new THREE.MeshStandardMaterial({ color, roughness: .5 })); m.position.y = h * S / 2 + .02; m.castShadow = true; g.add(m); return g; };
    const sum = v => (v.wb * v.wb + (v.trailer || 0) ** 2) / (2 * (R + 1.75));   // Fig. 14, one l²/2R per wheel base, on the lane's radius

    const card = textPlane({ w: 9.4, h: 6.2, px: 46, draw: (c, W, H) => {
      const v = VEHS[st.kind], sim = st.sim, done = sim && sim.rIn < 1e8; cardBg(c, W, H); c.textAlign = 'left';
      c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText(`OFF-TRACKING · ${v.label.toUpperCase()} · R ${R} m`, 18, 26);
      const over = done ? R - sim.rIn : 0;
      const rows = [['Vehicle width', `${v.w.toFixed(2)} m`], ['Width swept on the curve', done ? `${(sim.rOut - sim.rIn).toFixed(2)} m` : '…'], ['Extra width needed', done ? `${(sim.rOut - sim.rIn - v.w).toFixed(2)} m` : '…'], ['Fig. 14: Σ l² / 2R', `${sum(v).toFixed(2)} m`], ['Rear wheels over the centre line', done ? (over > .02 ? `${over.toFixed(2)} m` : 'no') : '…']];
      rows.forEach(([a, b], i) => { const y = 60 + i * 32; c.fillStyle = '#5c6168'; c.font = `500 16px ${F}`; c.fillText(a, 18, y); c.fillStyle = i === 2 ? '#8a3f1c' : i === 4 && over > .02 ? '#b3362b' : '#14202b'; c.font = `700 18px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 18, y); c.textAlign = 'left'; });
      c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`;
      c.fillText('The rear wheels do not follow the front ones (cl. 6.1.1). Red: outer front', 18, H - 38);
      c.fillText('corner. Blue: inner rear wheel. Pursuit model; true scale.', 18, H - 18);
    } });
    card.position.set(5.2, 2.6, 10.6); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      const k = horizontalCurve(DELTA, R, 0); L = layout(k, 1); arc = k.length;
      const th = throughSlab(L, P, SLAB); T = track(th.pts); e1 = th.e1;
      swapGeo(deck, band(T, P, () => LANE, () => -LANE, .012)); swapGeo(shL, band(T, P, () => LANE, () => LANE + 1.2, .008)); swapGeo(shR, band(T, P, () => -LANE, () => -LANE - 1.2, .008));
      swapGeo(edL, band(T, P, () => LANE - .1, () => LANE - .3, .02)); swapGeo(edR, band(T, P, () => -LANE + .1, () => -LANE + .3, .02));
      holo.setPoints(centre, offsetPts(T, 0, 2).map(p => P(p, .03)));
      lane = track(offsetPts(T, 1.75, 1));
      const near = th.pts.filter((_, i) => i % 3 === 0).map(p => P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.9));
    }
    function start(kind) {
      st.kind = kind; const v = VEHS[kind];
      for (const u of units) group.remove(u);
      units = v.trailer ? [body(v.front + v.wb + v.rear, v.w, 3, 0x24557a), body(v.trailer + v.tRear + 1, v.w, 3.6, 0xd8d2c4)] : [body(v.front + v.wb + v.rear, v.w, 3.2, 0xb0532a)];
      group.add(...units);
      const d = (v.trailer || 0) + v.wb + 2, at = s => { const p = lane.at(s); return [p.x, p.y]; };
      st.sim = { d, F: at(d), Rr: at(d - v.wb), Ta: v.trailer ? at(d - v.wb - v.trailer) : null, out: [], in: [], rOut: 0, rIn: Infinity };
      card.redraw();
    }
    const pursue = (lead, foll, len) => { const dx = lead[0] - foll[0], dy = lead[1] - foll[1], m = Math.hypot(dx, dy) || 1; return [lead[0] - dx / m * len, lead[1] - dy / m * len]; };
    const placeUnit = (u, a, b, len, back) => { const h = Math.atan2(a[1] - b[1], a[0] - b[0]); u.position.copy(P([b[0] + Math.cos(h) * (len / 2 - back), b[1] + Math.sin(h) * (len / 2 - back)])); u.rotation.y = h; };
    function step(dt) {
      const sim = st.sim, v = VEHS[st.kind];
      sim.d += 6 * dt; const p = lane.at(sim.d); sim.F = [p.x, p.y];
      sim.Rr = pursue(sim.F, sim.Rr, v.wb); if (sim.Ta) sim.Ta = pursue(sim.Rr, sim.Ta, v.trailer);
      const hd = Math.atan2(sim.F[1] - sim.Rr[1], sim.F[0] - sim.Rr[0]);
      const corner = [sim.F[0] + Math.cos(hd) * v.front - Math.sin(hd) * v.w / 2, sim.F[1] + Math.sin(hd) * v.front + Math.cos(hd) * v.w / 2];   // left = outside on this right-hand bend
      const last = sim.Ta || sim.Rr, lead = sim.Ta ? sim.Rr : sim.F, hl = Math.atan2(lead[1] - last[1], lead[0] - last[0]);
      const wheel = [last[0] + Math.sin(hl) * v.w / 2, last[1] - Math.cos(hl) * v.w / 2];
      if (sim.d > e1 - 12 && sim.d < e1 + arc + 40) {
        sim.out.push(corner); sim.in.push(wheel);
        if (sim.d > e1 + v.wb + (v.trailer || 0) + 4 && sim.d < e1 + arc) { const o = L.O; sim.rOut = Math.max(sim.rOut, Math.hypot(corner[0] - o[0], corner[1] - o[1])); sim.rIn = Math.min(sim.rIn, Math.hypot(wheel[0] - o[0], wheel[1] - o[1])); }
        if (sim.out.length > 1 && sim.out.length % 3 === 0) { holo.setPoints(outer, sim.out.map(q => P(q, .07))); holo.setPoints(inner, sim.in.map(q => P(q, .07))); if (sim.out.length % 30 === 0) card.redraw(); }
      }
      placeUnit(units[0], sim.F, sim.Rr, v.front + v.wb + v.rear, v.rear);
      if (sim.Ta) placeUnit(units[1], sim.Rr, sim.Ta, v.trailer + v.tRear + 1, v.tRear);
      if (sim.d > lane.length - 2) { card.redraw(); start(st.kind); }
    }
    const actions = Object.entries(VEHS).map(([k, v]) => ({ label: v.label, toggle: () => st.kind === k, run: () => start(k) }));
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt); if (st.sim) for (let i = 0; i < 4; i++) step(Math.min(dt, .05) / 4 * 2);
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.2; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); start('truck'); guide.reset(); },
      get debug() { const s = st.sim, v = VEHS[st.kind]; return { kind: st.kind, swept: s?.rIn < 1e8 ? +(s.rOut - s.rIn).toFixed(2) : null, extra: s?.rIn < 1e8 ? +(s.rOut - s.rIn - v.w).toFixed(2) : null, fig14: +sum(v).toFixed(2), guide: guide.debug }; },
    };
    const labels = actions.map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Truck', show: labels, text: 'A truck takes a 30 m hill bend in the left lane. Red traces its outer front corner, blue its inner rear wheel.',
          check: { q: 'On a curve without superelevation the rear wheels track…', options: ['inside the front wheels', 'outside the front wheels', 'exactly in the front wheel tracks'], answer: 0, why: 'On curves without superelevation the rear wheels track inside the front wheels; on superelevated curves it depends on the speed (cl. 6.1.1).' } },
        { title: 'Truck-trailer', show: labels, text: 'Now the truck-trailer. The trailer cuts in much harder: its rear wheels cross the centre line into the other lane.',
          check: { q: 'Besides off-tracking, why else are curves widened (cl. 6.1.2)?', options: ['drivers keep greater clearances when passing on curves', 'to drain the pavement', 'to slow the traffic'], answer: 0, why: 'Drivers find it hard to keep to the centre of the lane and keep greater clearances when passing on curves; the front overhang reduces the clearance (cl. 6.1.2).' } },
        { title: 'The rule', show: labels, text: 'The extra width swept is close to l²/2R for each wheel base l: the mechanical widening of Fig. 14, on the next spread.',
          check: { q: 'At speeds above the balanced speed the trailer of a truck-trailer…', options: ['may track farther out', 'always tracks inside', 'follows the tractor exactly'], answer: 0, why: 'The trailer tracks inside at balanced speeds and farther out at higher speeds; rough pavements and jerks whip it out of the lane (cl. 6.1.3).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild(); start('truck');
    return api;
  },
};
