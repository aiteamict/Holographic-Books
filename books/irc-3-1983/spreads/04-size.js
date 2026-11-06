// Spread 4 · How big? (cl. 3.14, 5.1, 5.2)
// A road under a concrete overbridge. Pick the 3.8 m truck, a 4.2 m container truck or a 4.75 m double-decker and
// drive it at the bridge. Drag the deck up or down: too low, and the vehicle stops short with a strike warning. The
// width is dimensioned at the rear, and the mirrors are tagged as excluded (cl. 3.14).
import * as THREE from 'three';
import { tagged } from '@engine/util.js';
import { makeGuide } from '@engine/guide.js';
import { TYPES, makeRig, makeBus } from '../vehicles.js';
import { road, overbridge } from '../scene.js';

const S = .8, BX = -1, DEPTH = 2.2, LANE_Z = 1.75 * S, END_X = -14;   // the scene is turned 90°: the road runs toward the reader
const HIT = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const VEH = {
  truck: { label: 'Truck 3.8 m', H: 3.8, name: 'a 3.8 m truck', make: () => makeRig(TYPES.find(t => t.id === '3'), S, { top: 3.8 }) },
  container: { label: 'Container 4.2 m', H: 4.2, name: 'a 4.2 m ISO container truck', make: () => makeRig(TYPES.find(t => t.id === '3-S2'), S, { top: 4.2 }) },
  bus: { label: 'Double-decker 4.75 m', H: 4.75, name: 'a 4.75 m double-decker bus', make: () => makeBus(S, { double: true }) },
};
const cap = s => s[0].toUpperCase() + s.slice(1);

export default {
  cam: { pos: [5, 21, 46], look: [6, 4, 0], portrait: { pos: [13.4, 50, 56], look: [12.6, -5, 1] } },   // the bridge face-on: clearance reads as a gap over the road
  shots: [
    { pos: [5, 9, 18], look: [8, 4, 1], dur: 1.8, hold: 2.6, text: 'The deck’s underside sets the clearance. Every vehicle must fit beneath it: 3.8 m, 4.2 m with ISO containers, 4.75 m for a double-decker bus (cl. 5.2).' },
  ],
  build(ctx) {
    const { holo, ui, camera } = ctx;
    const group = new THREE.Group(), root = new THREE.Group(); root.rotation.y = -Math.PI / 2; group.add(root);   // vehicles drive away from the reader, toward the bridge
    const rd = road(S, { len: 32, verge: 1 }); root.add(rd);
    const br = overbridge(S, { clear: 5, span: 14, depth: DEPTH }); br.position.x = BX; root.add(br);
    const deckHit = new THREE.Mesh(new THREE.BoxGeometry(DEPTH * S + 1, 3, 14 * S), HIT); deckHit.userData.deck = true; root.add(deckHit);
    const man = ctx.hero(S); man.position.set(BX + 2.4, 0, 7 * S); man.rotation.y = -.4; root.add(man);
    const st = { kind: 'truck', clear: 5, c: 0, state: 'idle', t: 0 };
    let veh = null, vehHit = null, deco = new THREE.Group(), clearDeco = new THREE.Group(), strike = null; root.add(deco, clearDeco);

    const face = () => BX + DEPTH * S / 2 + .15;                     // the bridge face the vehicle approaches (it drives toward -x)
    const halfL = () => veh.L * S / 2;
    const startC = () => 15 - halfL();
    function setKind(k) {
      st.kind = k; if (veh) root.remove(veh.group);
      veh = VEH[k].make(); veh.group.position.set(startC(), 0, LANE_Z); root.add(veh.group); st.c = startC(); st.state = 'idle';
      if (strike) { root.remove(strike); strike = null; }
      if (vehHit) root.remove(vehHit);
      vehHit = new THREE.Mesh(new THREE.BoxGeometry(veh.L * S, VEH[k].H * S, 2.6 * S), HIT); vehHit.userData.veh = true; root.add(vehHit);
      dress(); ui.refreshActions?.();
    }
    function dress() {                                              // vehicle dimensions: height at the front, width at the rear, mirrors tagged
      root.remove(deco); deco = new THREE.Group(); root.add(deco);
      const H = VEH[st.kind].H, fx = -halfL() - .4, rx = halfL() + .3;
      deco.add(holo.dimension([rx + .1, 0, -1.6 * S], [rx + .1, H * S, -1.6 * S], `${H} m`, { color: holo.AMBER, h: 1, tick: .4 }));
      deco.add(holo.dimension([rx + .2, (H + .3) * S, -1.25 * S], [rx + .2, (H + .3) * S, 1.25 * S], '2.5 m', { color: holo.CYAN, h: .85, tick: .35 }));
      deco.add(holo.tag('mirrors: not counted (cl. 3.14)', [-halfL() + .25 * S, 2.5 * S, 1.38 * S], [1.5, 3.4, 2.2], { accent: holo.GREEN, h: .7 }));
      deco.position.set(st.c, 0, LANE_Z);
    }
    function setClear(h, say) {
      st.clear = Math.round(THREE.MathUtils.clamp(h, 3.4, 5.8) * 20) / 20; br.userData.setClear(st.clear);
      root.remove(clearDeco); clearDeco = new THREE.Group(); root.add(clearDeco);
      const z = -5.6 * S;                                          // on the far pier, clear of the vehicle
      clearDeco.add(holo.dimension([BX + DEPTH * S / 2 + .3, 0, z], [BX + DEPTH * S / 2 + .3, st.clear * S, z], `${st.clear.toFixed(2)} m clear`, { color: holo.GREEN, h: .95, tick: .4 }));
      const drag = holo.label('⇕ drag the deck', { h: .7, color: '#b0532a', weight: 700 }); drag.position.set(BX, (st.clear + 1.1) * S + 1.4, 0); clearDeco.add(drag);
      deckHit.position.set(BX, (st.clear + .55) * S, 0);
      if (st.state === 'blocked') st.state = 'idle';
      if (say) ui.caption(`The bridge now clears ${st.clear.toFixed(2)} m.`, 'Clearance', 2500);
    }
    function drive() {
      if (st.state === 'driving') return;
      if (st.state !== 'idle' || st.c < startC() - .01) st.c = startC();
      st.state = 'driving'; if (strike) { root.remove(strike); strike = null; }
    }

    let grip = null;
    const api = {
      group, dragPlane: 'xy',
      actions: [
        ...Object.entries(VEH).map(([k, v]) => ({ label: v.label, run: () => { setKind(k); ui.caption(`${cap(v.name)}. Tap ▶ Drive, or tap the vehicle.`, 'Vehicle', 3500); } })),
        { label: 'Bridge −0.1 m', run: () => setClear(st.clear - .1, true) },
        { label: 'Bridge +0.1 m', run: () => setClear(st.clear + .1, true) },
        { label: '▶ Drive', run: drive },
      ],
      press(hit) { grip = tagged(hit.object, 'deck') ? { c0: st.clear, moved: false } : null; },
      drag({ dy }) { if (!grip) return; grip.moved = true; setClear(grip.c0 - dy / 110); },
      release() { if (grip?.moved) ui.caption(`The bridge now clears ${st.clear.toFixed(2)} m.`, 'Clearance', 2500); grip = null; },
      tap(hit) {
        if (guide.tap(hit)) return;
        if (tagged(hit.object, 'veh')) drive();
        else if (tagged(hit.object, 'deck')) ui.caption(`The underside of the deck is ${st.clear.toFixed(2)} m above the road. Drag it up or down.`, 'Clearance', 4000);
      },
      a11y: [{ label: 'Drive the vehicle under the bridge', run: drive }, { label: 'Lower the bridge', run: () => setClear(st.clear - .1, true) }, { label: 'Raise the bridge', run: () => setClear(st.clear + .1, true) }],
      enter() { setKind(st.kind); setTimeout(drive, 700); },
      update(dt, t) {
        const H = VEH[st.kind].H, tooTall = H > st.clear + 1e-9, stopAt = face() + halfL();
        if (st.state === 'driving') {
          const goal = tooTall ? stopAt : END_X + halfL(), nc = Math.max(goal, st.c - dt * 7), step = st.c - nc; st.c = nc;
          for (const a of veh.groups) for (const w of a.wheels) w.rotation.y += step / (.5 * S);
          if (st.c <= goal + 1e-4) {
            if (tooTall) {
              st.state = 'blocked'; st.t = .6;
              strike = holo.label(`✕ STRIKE · ${(H - st.clear).toFixed(2)} m too tall`, { h: 1.1, color: '#c23b2f', weight: 800, bg: 'rgba(255,253,248,.95)' }); strike.position.set(BX + 6.5, (st.clear + 1.6) * S + 4.2, LANE_Z); root.add(strike);
              ui.caption(`${cap(VEH[st.kind].name)} cannot pass a ${st.clear.toFixed(2)} m bridge.`, 'Strike', 5000);
            } else { st.state = 'through'; st.t = 1.2; ui.caption(`Clear: ${H} m under ${st.clear.toFixed(2)} m.`, 'Passed', 3000); }
          }
        } else if (st.state === 'blocked' && st.t > 0) { st.t -= dt; veh.group.position.y = Math.abs(Math.sin(st.t * 40)) * .08 * st.t; }
        else if (st.state === 'through') { st.t -= dt; if (st.t <= 0) { st.c = startC(); st.state = 'idle'; } }
        veh.group.position.x = st.c; vehHit.position.set(st.c, H * S / 2, LANE_Z); deco.position.x = st.c;
        if (strike) strike.position.y = (st.clear + 1.6) * S + 4.2 + Math.sin(t * 4) * .1;
        const tall = camera.aspect < 1;
        root.rotation.y += ((-Math.PI / 2 + (tall ? .25 : 0)) - root.rotation.y) * Math.min(1, dt * 5);
        guide.card.position.x = tall ? -6.2 : -8.6; guide.card.scale.setScalar(tall ? .78 : .9);
      },
      reset() { setClear(5); setKind('truck'); guide.reset(); },
      get debug() { return { kind: st.kind, clear: st.clear, state: st.state, c: +st.c.toFixed(2), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-8.6, 2.4, 8.5], w: 9, h: 5.2, rotY: .35,
      steps: [
        { title: 'Under the bridge', show: ['Truck 3.8 m', 'Container 4.2 m', 'Double-decker 4.75 m', '▶ Drive'], enter: () => setClear(5),
          text: 'Pick a vehicle and drive it under the bridge: tap ▶ Drive or the vehicle. Drag the deck up or down to change the clearance.' },
        { title: 'Lower it', show: ['Truck 3.8 m', 'Container 4.2 m', 'Double-decker 4.75 m', '▶ Drive'], enter: () => setClear(4),
          check: { q: 'The bridge now clears 4.0 m. Which of the three can pass?', options: ['all three', 'only the 3.8 m truck', 'none'], answer: 1, why: 'Only the 3.8 m truck fits. The 4.2 m container truck and the 4.75 m double-decker, both legal (cl. 5.2), would strike it. Try them.' } },
        { title: 'Width', show: ['Truck 3.8 m', 'Container 4.2 m', 'Double-decker 4.75 m', 'Bridge −0.1 m', 'Bridge +0.1 m', '▶ Drive'],
          check: { q: 'Do the mirrors count toward the 2.5 m width?', options: ['yes', 'no: safety devices are excluded'], answer: 1, why: 'Overall width includes the load but excludes approved safety devices and tyre bulge (cl. 3.14). The limit is 2.5 m (cl. 5.1).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);

    setClear(5); setKind('truck');
    Object.defineProperty(api, 'targets', { get: () => [guide.card, deckHit, vehHit] });
    return api;
  },
};
