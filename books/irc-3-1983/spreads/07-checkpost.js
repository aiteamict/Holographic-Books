// Spread 7 · The checkpost (all clauses)
// Four vehicles arrive one by one at a highway checkpost. Each stops at the barrier and is measured: height, length,
// and the load on every axle, shown on the vehicle and on the ticket. The reader passes it or stops it with the
// clause it breaks. Pass: the barrier lifts and the vehicle drives on. Stop: a stamp names the clause. A score at the end.
import * as THREE from 'three';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { makeGuide } from '@engine/guide.js';
import { TYPES, INK, CSS, FORM_NAME, MAXLEN, makeRig } from '../vehicles.js';
import { road, checkpost } from '../scene.js';

const S = .8, CPX = -6, LANE_Z = 1.75 * S, F = 'Inter, Segoe UI, Arial';
const BARRIER_X = CPX + 1.8 * S, STOP_FRONT = BARRIER_X + .35, END_FRONT = -12.5;
const HIT = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const OPTIONS = ['Pass', 'Height', 'Length', 'Width', 'Axle load', 'Too many'];   // stop reasons, short enough for the card
const T = id => TYPES.find(t => t.id === id);
const CASES = [
  { type: T('2-S2'), top: 3.6, loads: [6, 10.2, 18], answer: 0, why: 'Height 3.6 m, length 16 m, width 2.5 m, and every axle at or under its limit. Pass.' },
  { type: T('3'), top: 3.6, loads: [6, 21.4], answer: 4, why: 'The tandem carries 21.4 t; two axles in tandem may put at most 18 t on the road (cl. 6.2). Stop.' },
  { type: T('2'), top: 3.6, wide: 2.8, loads: [6, 10.2], answer: 3, why: 'The load sticks out to 2.8 m. Overall width includes the load (cl. 3.14) and may not exceed 2.5 m (cl. 5.1). Stop.' },
  { type: { ...T('2-2'), len: 19 }, top: 3.6, loads: [6, 10.2, 10.2, 10.2], answer: 2, why: '19 m long: a truck-trailer combination may be 18 m at most (cl. 5.3.4). Stop.' },
  { type: T('2-2'), top: 3.6, extra: true, loads: [6, 10.2, 10.2, 10.2], answer: 5, alt: [2], why: 'A truck pulling two trailers: no combination may comprise more than two vehicles (cl. 5.3.5). At 27 m it is far too long as well (cl. 5.3.4). Stop.' },
  { type: T('3-S2'), top: 4.2, iso: true, loads: [6, 18, 18], answer: 0, why: '4.2 m tall, but it carries ISO series 1 freight containers, for which 4.2 m is allowed (cl. 5.2). Pass.' },
];

export default {
  cam: { pos: [2.5, 30, 42], look: [2.5, 4, 0], portrait: { pos: [15, 58, 56], look: [12.3, 1, 1] } },
  shots: [
    { pos: [4, 11, 20], look: [6, 4, 1], dur: 1.8, hold: 2.6, text: 'Every vehicle stops at the barrier. Its height, its length and the load on each axle are on the ticket.' },
  ],
  build(ctx) {
    const { holo, ui, camera } = ctx;
    const group = new THREE.Group(), root = new THREE.Group(); group.add(root);
    root.add(road(S, { len: 32, verge: 1 }));
    const post = checkpost(S, { roadW: 10, gantryH: 5.4 }); post.position.x = CPX; root.add(post);
    for (let m = 0; m <= 20; m += 2) {                               // length marks along the near shoulder, from the barrier back
      const x = STOP_FRONT + m * S, big = m % 4 === 0 || m === 18, hot = m === 16 || m === 18;
      root.add(holo.segments([[x, .08, -4.2 * S], [x, .08, -(big ? 5.2 : 4.7) * S]], hot ? holo.RED : holo.WHITE, .9, { width: .05 }));
      if (big) { const l = holo.label(`${m} m`, { h: .55, color: hot ? '#c23b2f' : '#5c6168' }); l.position.set(x, .3, -5.9 * S); root.add(l); }   // marks on the far shoulder, clear of the cards
    }
    const man = ctx.hero(S); man.position.set(CPX - .4, 0, -7.3 * S); man.rotation.y = .9; root.add(man);   // the inspector at the booth

    const st = { i: 0, c: 20, state: 'idle', open: 0, meas: 0, first: {}, verdict: null, scored: false };
    let rig = null, vehHit = null, meas = new THREE.Group(), stamp = null; root.add(meas);
    const C = () => CASES[st.i], halfL = () => rig.L * S / 2;

    // ---- the ticket
    const ticket = textPlane({ w: 9.4, h: 7.6, px: 50, draw: (c, W, H) => {
      if (!rig) return;
      const k = C(), t = k.type, L = rig.L, maxL = MAXLEN[t.form], longBad = L > maxL, hMax = k.iso ? 4.2 : 3.8, hBad = k.top > hMax;
      cardBg(c, W, H, { stroke: 'rgba(42,109,104,.85)' });
      c.textAlign = 'left'; c.fillStyle = '#2a6d68'; c.font = `700 15px ${F}`; c.fillText(`CHECKPOST · VEHICLE ${st.i + 1} OF ${CASES.length}`, 22, 30);
      c.fillStyle = '#1f2328'; c.font = `800 28px ${F}`; c.fillText(`Type ${t.code}`, 22, 64);
      c.fillStyle = '#5c6168'; c.font = `500 15px ${F}`; c.fillText(`${FORM_NAME[t.form]}${k.iso ? ' · carrying ISO containers' : ''}`, 22, 86);
      const row = (y, name, val, lim, bad) => { c.fillStyle = '#1f2328'; c.font = `500 17px ${F}`; c.fillText(name, 22, y); c.textAlign = 'right'; c.fillStyle = bad ? CSS.over : '#1f2328'; c.font = `700 17px ${F}`; c.fillText(val, W - 120, y); c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(lim, W - 22, y); c.textAlign = 'left'; };
      const show = st.meas > .5;
      row(120, 'Height', show ? `${k.top.toFixed(1)} m` : '…', `max ${hMax} m`, show && hBad);
      row(148, 'Length', show ? `${L} m` : '…', `max ${maxL} m`, show && longBad);
      row(176, 'Width', show ? `${(k.wide ?? 2.5).toFixed(1)} m` : '…', 'max 2.5 m', show && (k.wide ?? 2.5) > 2.5);
      if (k.extra) row(176 + 28 * 5, 'Vehicles', show ? '3' : '…', 'max 2', show);
      rig.groups.forEach((a, j) => row(204 + j * 26, `Axle ${j + 1} · ${a.kind === 't' ? 'tandem' : a.kind === 'd' ? 'dual' : 'single'}`, show ? `${k.loads[j]} t` : '…', `max ${a.limit}`, show && k.loads[j] > a.limit));
      if (st.verdict) {
        const ok = st.verdict === 'pass', col = ok ? '#2f8f55' : CSS.over;
        c.save(); c.translate(W - 150, H - 36); c.rotate(-.06); c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(-128, -22, 256, 40);
        c.fillStyle = col; c.font = `800 18px ${F}`; c.textAlign = 'center'; c.fillText(ok ? 'PASSED' : 'STOPPED', 0, 5); c.restore();
      } else { c.fillStyle = '#b0532a'; c.font = `700 15px ${F}`; c.fillText(st.state === 'arriving' ? 'Arriving…' : 'Pass or stop? Answer on the card.', 22, H - 30); }
    } });
    ticket.position.set(4.6, 2.9, 10); ticket.rotation.x = -.6; group.add(ticket);

    function measure() {                                            // dimensions and axle columns on the stopped vehicle
      root.remove(meas); meas = new THREE.Group(); root.add(meas);
      const k = C(), fx = -halfL(), hMax = k.iso ? 4.2 : 3.8, base = (k.top + 1.2) * S;
      meas.add(holo.dimension([fx - .4, 0, 1.4 * S], [fx - .4, k.top * S, 1.4 * S], `${k.top.toFixed(1)} m`, { color: k.top > hMax ? holo.RED : holo.AMBER, h: .85, tick: .35 }));
      meas.add(holo.dimension([fx, .15, 2.6 * S], [halfL(), .15, 2.6 * S], `${rig.L} m`, { color: rig.L > MAXLEN[k.type.form] ? holo.RED : holo.AMBER, h: .85, tick: .35 }));
      const wd = k.wide ?? 2.5; meas.add(holo.dimension([halfL() + .3, (k.top + .3) * S, -wd / 2 * S], [halfL() + .3, (k.top + .3) * S, wd / 2 * S], `${wd} m`, { color: wd > 2.5 ? holo.RED : holo.CYAN, h: .8, tick: .3 }));
      rig.groups.forEach((a, j) => {
        const over = k.loads[j] > a.limit, h = k.loads[j] * .22, w = a.kind === 't' ? 1.7 : .9;
        const col = holo.wireBox(w, h, .9, over ? INK.over : INK[a.kind], { fill: over ? .35 : .22, width: .06 }); col.position.set(a.wx, base + h / 2, 0); meas.add(col);
        meas.add(holo.polyline([[a.wx - w / 2 - .4, base + a.limit * .22, 0], [a.wx + w / 2 + .4, base + a.limit * .22, 0]], holo.WHITE, { width: .06, dashed: true }));
        const l = holo.label(`${k.loads[j]} t`, { h: .8, weight: 700, color: over ? CSS.over : CSS[a.kind] }); l.position.set(a.wx, base + h + .8, 0); meas.add(l);
      });
      meas.position.set(st.c, 0, LANE_Z); meas.scale.y = .001;
    }
    function arrive(i) {
      st.i = i; st.verdict = null; st.open = 0; st.meas = 0; st.state = 'arriving';
      if (rig) root.remove(rig.group); if (stamp) { root.remove(stamp); stamp = null; }
      const k = C(); rig = makeRig(k.type, S, { top: k.top });
      if (k.wide) {                                                 // a load sticking out past the body
        const crate = new THREE.Mesh(new THREE.BoxGeometry(rig.L - 2.8, 1.6, k.wide), new THREE.MeshStandardMaterial({ color: 0xa8814f, roughness: .8 }));
        crate.position.set((2.5 + rig.L) / 2 - rig.L / 2, 2.6, 0); crate.castShadow = true; rig.parts.truck.add(crate);
      }
      if (k.extra) {                                                // a second trailer on the first one's tail: three vehicles
        const add = 9.4, second = rig.parts.trailer.clone(true); second.position.x = add; rig.parts.truck.parent.add(second);
        rig.group.children[0].position.x = -add / 2 * S; rig.L += add; for (const a of rig.groups) a.wx -= add / 2 * S;
        second.traverse(o => { if (o.userData.axle != null) rig.groups[rig.groups.length - 1].wheels.push(o); });   // its wheels turn too
      }
      st.c = 13 + halfL(); rig.group.position.set(st.c, 0, LANE_Z); root.add(rig.group);
      if (vehHit) root.remove(vehHit); vehHit = new THREE.Mesh(new THREE.BoxGeometry(rig.L * S, k.top * S, 2.6 * S), HIT); vehHit.userData.veh = true; root.add(vehHit);
      measure(); ticket.redraw();
    }
    function resolve() {                                            // the reader picked the right answer
      const ok = CASES[st.i].answer === 0; st.verdict = ok ? 'pass' : 'stop'; ticket.redraw();
      if (ok) st.state = 'leaving';
      else { stamp = holo.label(`STOPPED · ${OPTIONS[CASES[st.i].answer].toLowerCase()}`, { h: 1.1, weight: 800, color: '#ffffff', bg: 'rgba(194,59,47,.95)' }); stamp.position.set(st.c, (C().top + 1) * S + 6.4, LANE_Z); root.add(stamp); }
    }
    const summary = () => { const k = C(); return `Type ${k.type.code}: ${k.top.toFixed(1)} m tall, ${rig.L} m long, axles ${k.loads.join(' / ')} t.`; };

    const api = {
      group,
      actions: [],
      tap(hit) { if (guide.tap(hit)) return; if (tagged(hit.object, 'veh')) ui.caption(summary(), 'Measured', 5000); },
      a11y: [{ label: 'Read the measurements', run: () => ui.caption(summary(), 'Measured', 5000) }],
      enter() { arrive(guide.free ? 0 : guide.step); },
      update(dt, t) {
        const goalFront = st.state === 'leaving' && st.open > .9 ? END_FRONT : STOP_FRONT;
        const goalC = goalFront + halfL(), nc = st.c + (goalC - st.c) * Math.min(1, dt * (st.state === 'leaving' ? 1.6 : 2.2)), step = st.c - nc; st.c = Math.abs(goalC - nc) < .01 ? goalC : nc;
        for (const a of rig.groups) for (const w of a.wheels) w.rotation.y += step / (.5 * S);
        if (st.state === 'arriving' && Math.abs(st.c - goalC) < .05) { st.state = 'measured'; ticket.redraw(); }
        if (st.state === 'measured' || st.verdict) { const m0 = st.meas; st.meas = Math.min(1, st.meas + dt * 1.8); meas.scale.y = st.meas; if (m0 <= .5 && st.meas > .5) ticket.redraw(); }
        if (st.state === 'leaving') { st.open = Math.min(1, st.open + dt * 1.5); meas.visible = false; if (st.c - halfL() < END_FRONT + .3) rig.group.visible = false; }
        else { st.open = Math.max(0, st.open - dt * 1.5); meas.visible = true; }
        post.userData.setOpen(st.open);
        rig.group.position.x = st.c; meas.position.x = st.c; vehHit.position.set(st.c, C().top * S / 2, LANE_Z);
        if (stamp) stamp.position.y = (C().top + 1) * S + 6.4 + Math.sin(t * 3) * .1;
        if (guide.free && !st.scored) { st.scored = true; const n = CASES.filter((_, j) => st.first[j]).length; ui.caption(`${n} of ${CASES.length} right first time. ${n === CASES.length ? 'A perfect inspection.' : 'Step back through the vehicles to see each clause again.'}`, 'Your score', 8000); }
        const tall = camera.aspect < 1;
        root.rotation.y += ((tall ? -.5 : 0) - root.rotation.y) * Math.min(1, dt * 5);
        guide.card.position.x = tall ? -4.5 : -5.4; ticket.position.x = tall ? 4.4 : 4.6; guide.card.scale.setScalar(tall ? .86 : 1); ticket.scale.setScalar(tall ? .86 : 1);
      },
      reset() { st.first = {}; st.scored = false; guide.reset(); arrive(0); },
      get debug() { return { i: st.i, state: st.state, verdict: st.verdict, open: +st.open.toFixed(2), first: st.first, guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: CASES.map((k, j) => ({
        title: `Vehicle ${j + 1}`, show: [], enter: () => arrive(j),
        check: { q: `Vehicle ${j + 1}: Type ${k.type.code}${k.iso ? ' with ISO containers' : ''}${k.extra ? ' and a second trailer' : ''}. Pass, or stop for which reason?`, options: OPTIONS, answer: k.answer, why: k.why },
      })),
    });
    const pick = guide.pick;                                        // hook the answer: score the first try, act on the right one
    guide.pick = k => { const c = CASES[st.i], kk = c.alt?.includes(k) ? c.answer : k; if (!(st.i in st.first)) st.first[st.i] = kk === c.answer; pick(kk); if (kk === c.answer && !st.verdict) resolve(); };
    guide.card.rotation.x = -.6; group.add(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);

    arrive(0);
    Object.defineProperty(api, 'targets', { get: () => [guide.card, ticket, vehHit] });
    return api;
  },
};
