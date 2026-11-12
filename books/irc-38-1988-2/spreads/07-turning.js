// Spread 7 · Turning circles (cl. 4.4.5, Fig. 9). Each vehicle drives its tightest circle, the outer front wheel on the
// radius of Fig. 9; the rear axle (and the trailer) follow by a simple pursuit model, so the rear cuts inside. The traces
// of the outer front corner and the inner rear wheel show the swept path; the 26 m ring is the radius cl. 4.4.5 asks for.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { diorama, car } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', S = .27, GROUND = .5, O = new THREE.Vector3(1.5, GROUND, -4.2);
// Fig. 9 radii of the outer front wheel; other dimensions illustrative, within cl. 4.4.5's ranges
const VEH = {
  car: { label: 'Large car', R: 6.85, wb: 2.7, w: 1.8, front: .9, rear: 1.0, note: 'Cars: 1.4–1.9 m wide, 3–5.5 m long, turning circles 7.6–13.7 m (cl. 4.4.5).' },
  bus: { label: 'Rigid bus', R: 12.2, wb: 6.0, w: 2.5, front: 2.2, rear: 2.7, note: 'Buses up to 10.973 m long sweep circles of at most 21.641 m diameter (cl. 4.4.5).' },
  semi: { label: 'Articulated truck', R: 12.2, wb: 3.8, w: 2.5, front: 1.4, rear: .2, trailer: 9.6, tRear: 2.2, note: 'Long articulated vehicles cut the corner: 26 m minimum radius where trucks ply (cl. 4.4.5).' },
};

export default {
  cam: { pos: [3, 40, 34], look: [3.5, 0, -3], portrait: { pos: [15, 60, 48], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const P = (xy, h = 0) => new THREE.Vector3(O.x + xy[0] * S, O.y + h, O.z - xy[1] * S);
    const st = { kind: 'bus', sim: null };
    group.add(diorama({ x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4, h: GROUND }));
    const yard = new THREE.Mesh(new THREE.CircleGeometry(16 * S, 64), SM.asphalt); yard.rotation.x = -Math.PI / 2; yard.position.copy(P([0, 0], .01)); yard.receiveShadow = true; group.add(yard);
    const ring = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2; ring.push(P([26 * Math.cos(a), 26 * Math.sin(a)], .06)); }
    group.add(holo.polyline(ring, holo.GREEN, { width: .07, dashed: true }));
    const ringLab = holo.label('26 m radius where trucks ply (cl. 4.4.5)', { h: .62, color: '#1f7a45', bg: 'rgba(255,253,248,.9)' }); ringLab.position.copy(P([0, 27.5], .8)); group.add(ringLab);
    const outer = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .09 }), inner = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.CYAN, { width: .09 }); group.add(outer, inner);
    // vehicle bodies (metres → page via S), one box per unit, rebuilt per vehicle
    let units = [];
    const body = (len, w, h, color) => { const g = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(len * S, h * S, w * S), new THREE.MeshStandardMaterial({ color, roughness: .5 })); m.position.y = h * S / 2 + .02; m.castShadow = true; g.add(m); return g; };

    const card = textPlane({ w: 9.4, h: 6.2, px: 46, draw: (c, W, H) => {
      const v = VEH[st.kind], sim = st.sim; cardBg(c, W, H); c.textAlign = 'left';
      c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText(`TURNING CIRCLE · ${v.label.toUpperCase()}`, 18, 26);
      const rows = [['Outer front wheel radius (Fig. 9)', `${v.R.toFixed(2)} m`], ['Swept path, outer radius', sim?.rOut ? `${sim.rOut.toFixed(1)} m` : '…'], ['Swept path, inner radius', sim?.rIn < 1e8 ? `${sim.rIn.toFixed(1)} m` : '…'], ['Width swept on the turn', sim?.rIn < 1e8 ? `${(sim.rOut - sim.rIn).toFixed(1)} m` : '…']];
      rows.forEach(([a, b], i) => { const y = 62 + i * 36; c.fillStyle = '#5c6168'; c.font = `500 16px ${F}`; c.fillText(a, 18, y); c.fillStyle = i === 3 ? '#8a3f1c' : '#14202b'; c.font = `700 18px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 18, y); c.textAlign = 'left'; });
      c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; let y = H - 40, line = '';
      for (const wd of v.note.split(' ')) { const t = line ? line + ' ' + wd : wd; if (c.measureText(t).width > W - 36) { c.fillText(line, 18, y); y += 18; line = wd; } else line = t; }
      c.fillText(line, 18, y);
    } });
    card.position.set(5.2, 2.6, 10.6); card.rotation.x = -.6; group.add(card);

    function start(kind) {
      st.kind = kind; const v = VEH[kind];
      for (const u of units) group.remove(u);
      units = kind === 'car' ? [car(S * 1.05, 0x24557a)] : kind === 'bus' ? [body(v.front + v.wb + v.rear, v.w, 3, 0xb0532a)] : [body(v.front + v.wb + v.rear, v.w, 3, 0x24557a), body(v.trailer + v.tRear + 1, v.w, 3.6, 0xd8d2c4)];
      group.add(...units);
      const Rf = v.R - v.w / 2, F0 = [Rf, -18];          // front axle centre radius; approach straight from below the circle
      st.sim = { F: F0, Rr: [Rf, -18 - v.wb], Ta: v.trailer ? [Rf, -18 - v.wb - v.trailer] : null, ang: null, out: [], in: [], rOut: 0, rIn: Infinity };
      holo.setPoints(outer, [P(F0, .07), P(F0, .07)]); holo.setPoints(inner, [P(F0, .07), P(F0, .07)]);
      card.redraw();
    }
    const pursue = (lead, foll, L) => { const dx = lead[0] - foll[0], dy = lead[1] - foll[1], d = Math.hypot(dx, dy) || 1; return [lead[0] - dx / d * L, lead[1] - dy / d * L]; };
    const placeUnit = (u, a, b, len, back) => { const h = Math.atan2(a[1] - b[1], a[0] - b[0]); u.position.copy(P([b[0] + Math.cos(h) * (len / 2 - back), b[1] + Math.sin(h) * (len / 2 - back)])); u.rotation.y = h; };
    function step(dt) {
      const sim = st.sim, v = VEH[st.kind], Rf = v.R - v.w / 2, speed = 4.2;   // m/s
      // the front axle: straight up to the circle's east point, then round it anticlockwise
      if (sim.ang === null) { sim.F = [Rf, sim.F[1] + speed * dt]; if (sim.F[1] >= 0) { sim.ang = 0; sim.F = [Rf, 0]; } }
      else { sim.ang += speed * dt / Rf; sim.F = [Rf * Math.cos(sim.ang), Rf * Math.sin(sim.ang)]; }
      sim.Rr = pursue(sim.F, sim.Rr, v.wb);
      if (sim.Ta) sim.Ta = pursue(sim.Rr, sim.Ta, v.trailer);
      // traces: the outer front corner of the first unit, the inner rear wheel of the last
      const hd = Math.atan2(sim.F[1] - sim.Rr[1], sim.F[0] - sim.Rr[0]);
      const corner = [sim.F[0] + Math.cos(hd) * v.front + Math.sin(hd) * v.w / 2, sim.F[1] + Math.sin(hd) * v.front - Math.cos(hd) * v.w / 2];   // right side is outside on a left turn
      const last = sim.Ta || sim.Rr, lead = sim.Ta ? sim.Rr : sim.F, hl = Math.atan2(lead[1] - last[1], lead[0] - last[0]);
      const wheel = [last[0] - Math.sin(hl) * v.w / 2, last[1] + Math.cos(hl) * v.w / 2];
      if (sim.ang !== null) {
        sim.out.push(corner); sim.in.push(wheel);
        if (sim.ang > Math.PI * .8) { sim.rOut = Math.max(sim.rOut, Math.hypot(...corner)); sim.rIn = Math.min(sim.rIn, Math.hypot(...wheel)); }
        if (sim.out.length > 1 && sim.out.length % 3 === 0) { holo.setPoints(outer, sim.out.map(p => P(p, .07))); holo.setPoints(inner, sim.in.map(p => P(p, .07))); if (sim.out.length % 30 === 0) card.redraw(); }
      }
      if (st.kind === 'car') placeUnit(units[0], sim.F, sim.Rr, 4.2, (4.2 - v.wb) / 2); else placeUnit(units[0], sim.F, sim.Rr, v.front + v.wb + v.rear, v.rear);
      if (sim.Ta) placeUnit(units[1], sim.Rr, sim.Ta, v.trailer + v.tRear + 1, v.tRear);
      if (sim.ang !== null && sim.ang > Math.PI * 2.3) { card.redraw(); start(st.kind); }
    }
    const actions = Object.entries(VEH).map(([k, v]) => ({ label: v.label, toggle: () => st.kind === k, run: () => start(k) }));
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt); if (st.sim) for (let i = 0; i < 4; i++) step(Math.min(dt, .05) / 4 * 2.2);
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.2; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); start('bus'); guide.reset(); },
      get debug() { const s = st.sim; return { kind: st.kind, rOut: +(s?.rOut || 0).toFixed(2), rIn: s?.rIn < 1e8 ? +s.rIn.toFixed(2) : null, guide: guide.debug }; },
    };
    const labels = actions.map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Car', show: labels, text: 'Pick the large car: its outer front wheel turns on 6.85 m (Fig. 9). Red: the outer front corner. Blue: the inner rear wheel.',
          check: { q: 'Turning circles of cars (cl. 4.4.5)…', options: ['7.6 to 13.7 m', '19.8 to 23.8 m', 'exactly 26 m'], answer: 0, why: 'Cars 1.4–1.9 m wide and 3–5.5 m long turn in circles of 7.600 to 13.700 m (cl. 4.4.5).' } },
        { title: 'Bus', show: labels, text: 'Now the rigid bus on 12.2 m. The rear wheels track well inside the front: the strip it sweeps is wider than the bus.',
          check: { q: 'A bus between 8.230 m and 10.973 m long sweeps a circle of at most…', options: ['21.641 m', '19.812 m', '23.774 m'], answer: 0, why: '19.812 m up to 8.230 m long, 21.641 m up to 10.973 m, and 23.774 m beyond (cl. 4.4.5).' } },
        { title: 'Articulated', show: labels, text: 'The articulated truck: the trailer cuts the corner hardest. Compare its swept width with the bus.',
          check: { q: 'Where trucks ply, the minimum radius should be…', options: ['26 m', '15 m', '12.2 m'], answer: 0, why: 'A vehicle cannot go straight to full lock and long articulated vehicles cut the corner, so 26 m is desirable (cl. 4.4.5, footnote to Table 3).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    start('bus');
    return api;
  },
};
