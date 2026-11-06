// Spread 3 · Single or tandem? (cl. 3.1, 3.7, 3.8, 6.1, 6.2)
// Two dual-tyre axles on a length of chassis, over a metre ruler. Drag the rear axle: within 1 m the pair is one single
// axle (10.2 t); from 1.2 to 2.5 m a tandem (18 t); between 1.0 and 1.2 m neither definition applies; beyond 2.5 m they
// are two separate axles (10.2 t each). The load the road may take changes with the spacing.
import * as THREE from 'three';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { makeGuide } from '@engine/guide.js';
import { CSS, INK, MAT, axleWheels } from '../vehicles.js';
import { SM } from '../scene.js';

const S = 3, X0 = -2.4, DMIN = .4, DMAX = 3.5, F = 'Inter, Segoe UI, Arial';
const HIT = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const ZONES = [[0, 1, 'single axle', CSS.s], [1, 1.2, 'neither', '#8b959e'], [1.2, 2.5, 'tandem', CSS.t], [2.5, DMAX, 'separate axles', CSS.d]];
export const classify = d => d <= 1.0 + 1e-9 ? 'single' : d <= 1.2 + 1e-9 ? 'neither' : d <= 2.5 + 1e-9 ? 'tandem' : 'separate';
const VERDICT = {
  single: d => `${d.toFixed(2)} m apart: inside planes 1 m apart, so one single axle (cl. 3.7). On dual tyres: 10.2 t (cl. 6.1).`,
  neither: d => `${d.toFixed(2)} m apart: more than 1 m, so not a single axle; not more than 1.2 m, so not a tandem. Neither definition applies.`,
  tandem: d => `${d.toFixed(2)} m apart: more than 1.2 m and not more than 2.5 m, so a tandem axle (cl. 3.8): 18 t for the pair (cl. 6.2).`,
  separate: d => `${d.toFixed(2)} m apart: beyond 2.5 m the pair is no longer a tandem. This book reads them as two single axles, 10.2 t each; the standard says no more.`,
};

export default {
  cam: { pos: [3, 36, 47], look: [4, 4, 1], portrait: { pos: [14, 58, 56], look: [12.6, 1, 2] } },
  shots: [
    { pos: [13, 10, 22], look: [13, 3, 0], dur: 1.8, hold: 2.6, text: 'Two axles on dual tyres. The spacing between their centres decides what the road may carry.' },
  ],
  build(ctx) {
    const { holo, ui } = ctx;
    const group = new THREE.Group(), inner = new THREE.Group(); inner.scale.setScalar(S); group.add(inner);
    const st = { d: .8, shown: .8, intro: 0 };   // opens on step 1: two axles within 1 m

    // ground and chassis (metres, inside `inner`); the front axle sits at local x = X0 / S
    const fx = X0 / S;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(8, .06, 4), SM.asphalt); slab.position.set(fx + 1.8, .03, 0); slab.receiveShadow = true; inner.add(slab);
    const rails = []; for (const z of [-.45, .45]) { const r = new THREE.Mesh(new THREE.BoxGeometry(5.2, .22, .12), MAT.chassis); r.position.set(fx + 1.7, 1.0, z); r.castShadow = true; inner.add(r); rails.push(r); }
    const front = new THREE.Group(); front.position.x = fx; inner.add(front); axleWheels('d', [0], front, 0);
    const rear = new THREE.Group(); inner.add(rear); const rearWheels = axleWheels('d', [0], rear, 1);
    for (const g of [front, rear]) { const spring = new THREE.Mesh(new THREE.BoxGeometry(1.1, .12, 2.0), MAT.steel); spring.position.y = .8; spring.castShadow = true; g.add(spring); }

    // drag handle over the rear axle, and a fat touch area
    const handle = holo.handle('rear', { label: 'drag', kind: 'lever', r: .9 }); group.add(handle);
    const rearHit = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.4, 9), HIT); rearHit.userData.rear = true; group.add(rearHit);

    // the two transverse planes of cl. 3.7, 1 m apart, riding on the front axle: green while the rear axle is inside them
    const planeMat = new THREE.MeshBasicMaterial({ color: holo.GREEN, transparent: true, opacity: .14, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
    const planes = new THREE.Group(); group.add(planes);
    for (const dx of [0, 1]) {
      const px = X0 + dx * S, p = new THREE.Mesh(new THREE.PlaneGeometry(3 * S, 2.4 * S), planeMat); p.rotation.y = Math.PI / 2; p.position.set(px, 1.2 * S, 0); planes.add(p);
      planes.add(holo.polyline([[px, 0, -1.5 * S], [px, 2.4 * S, -1.5 * S], [px, 2.4 * S, 1.5 * S], [px, 0, 1.5 * S]], holo.GREEN, { width: .05, opacity: .8 }));
    }
    const planeTag = holo.label('two planes 1 m apart · cl. 3.7', { h: .7, color: '#2f8f55' }); planeTag.position.set(X0 + .5 * S, 2.8 * S, -1.5 * S); planes.add(planeTag);

    // the ruler, tilted toward the reader in front of the wheels, origin at the front axle
    const RW = (DMAX + .6) * S, ruler = textPlane({ w: RW, h: 2.6, px: 40, draw: (c, W, H) => {
      const k = W / RW * S, x0 = .3 * S * W / RW;                    // px per metre, x of the front axle
      cardBg(c, W, H, { stroke: 'rgba(31,35,40,.4)' });
      for (const [a, b, name, col] of ZONES) {
        c.fillStyle = col + '33'; c.fillRect(x0 + a * k, 8, (b - a) * k, H - 50);
        c.fillStyle = col; c.font = `700 ${name === 'neither' ? 11 : 14}px ${F}`; c.textAlign = 'center'; c.fillText(name.toUpperCase(), x0 + (a + b) / 2 * k, 26);
      }
      c.strokeStyle = '#1f2328'; c.lineWidth = 1.5; c.fillStyle = '#1f2328'; c.font = `600 14px ${F}`;
      for (let m = 0; m <= DMAX * 10 + .01; m++) { const x = x0 + m / 10 * k, big = m % 5 === 0; c.beginPath(); c.moveTo(x, H - 42); c.lineTo(x, H - 42 - (big ? 18 : 9)); c.stroke(); if (big) c.fillText(`${(m / 10).toFixed(1)}`, x, H - 22); }
      c.fillText('m', W - 14, H - 22);
      const xd = x0 + st.d * k; c.fillStyle = '#c97a10'; c.beginPath(); c.moveTo(xd, H - 44); c.lineTo(xd - 9, H - 60); c.lineTo(xd + 9, H - 60); c.closePath(); c.fill();
    } });
    ruler.position.set(X0 - .3 * S + RW / 2, .35, 5.6); ruler.rotation.x = -1.05; group.add(ruler);

    // readout and load columns (rebuilt when the spacing changes; cheap)
    let deco = new THREE.Group(); group.add(deco);
    function rebuild() {
      group.remove(deco); deco = new THREE.Group(); group.add(deco);
      const d = st.shown, kind = classify(d), xr = X0 + d * S, top = 4.6, K = .32;
      planeMat.color.setHex(kind === 'single' ? holo.GREEN : holo.DIM);
      deco.add(holo.dimension([X0, .25, 4.6], [xr, .25, 4.6], `${d.toFixed(2)} m`, { color: holo.AMBER, h: 1.1, tick: .5 }));
      const col = (x0, x1, t, color, txt) => {
        const h = t * K, w = Math.max(1.4, x1 - x0 + 1.2), b = holo.wireBox(w, h, 1.2, color, { fill: .24, width: .07 }); b.position.set((x0 + x1) / 2, top + h / 2, 0); deco.add(b);
        const l = holo.label(txt, { h: 1, weight: 700, color: '#' + new THREE.Color(color).getHexString() }); l.position.set((x0 + x1) / 2, top + h + 1, 0); deco.add(l);
      };
      if (kind === 'single') col(X0, xr, 10.2, INK.d, '10.2 t together');
      else if (kind === 'tandem') col(X0, xr, 18, INK.t, '18 t for the pair');
      else if (kind === 'separate') { col(X0, X0, 10.2, INK.d, '10.2 t'); col(xr, xr, 10.2, INK.d, '10.2 t'); }
      else { const l = holo.label('?', { h: 3, weight: 800, color: '#8b959e' }); l.position.set((X0 + xr) / 2, top + 2.5, 0); deco.add(l); }
      const name = { single: 'SINGLE AXLE · cl. 3.7', neither: 'NEITHER DEFINITION', tandem: 'TANDEM AXLE · cl. 3.8', separate: 'TWO SEPARATE AXLES' }[kind];
      const v = holo.label(name, { h: 1.05, weight: 800, color: { single: CSS.s, neither: '#5c6168', tandem: CSS.t, separate: CSS.d }[kind] }); v.position.set(0, 13.6, 0); deco.add(v);
      ruler.redraw();
    }
    function place() {
      rear.position.x = fx + st.shown; handle.position.x = X0 + st.shown * S; rearHit.position.set(X0 + st.shown * S, 1.8, 0);
      for (const r of rails) { const x1 = fx - .9, x2 = fx + st.shown + 1.1; r.scale.x = (x2 - x1) / 5.2; r.position.x = (x1 + x2) / 2; }
    }
    function setD(d, say = true) {
      st.d = Math.round(THREE.MathUtils.clamp(d, DMIN, DMAX) * 20) / 20;
      if (say) ui.caption(VERDICT[classify(st.d)](st.d), 'Axle spacing', 6500);
    }

    let grip = null;
    const api = {
      group, dragPlane: 'xy',
      actions: [
        { label: '−0.1 m', run: () => setD(st.d - .1) },
        { label: '+0.1 m', run: () => setD(st.d + .1) },
        { label: 'Within 1 m', run: () => setD(.8) },
        { label: 'Tandem 1.3 m', run: () => setD(1.3) },
        { label: 'Apart 3 m', run: () => setD(3) },
      ],
      press(hit) { const rearAxle = tagged(hit.object, 'axle')?.userData.axle === 1; grip = tagged(hit.object, 'rear') || tagged(hit.object, 'handle') || rearAxle ? { moved: false } : null; },
      drag({ point }) { if (!grip) return; grip.moved = true; st.d = Math.round(THREE.MathUtils.clamp((point.x - X0) / S, DMIN, DMAX) * 20) / 20; },
      release() { if (grip?.moved) setD(st.d); grip = null; },
      tap(hit) { if (guide.tap(hit)) return; if (tagged(hit.object, 'rear') || tagged(hit.object, 'axle')) ui.caption(VERDICT[classify(st.d)](st.d), 'Axle spacing', 6500); },
      a11y: [{ label: 'Rear axle back 0.1 m', run: () => setD(st.d - .1) }, { label: 'Rear axle on 0.1 m', run: () => setD(st.d + .1) }],
      enter() { st.intro = 1.2; },
      update(dt, t) {
        const goal = st.intro > 0 ? st.d + Math.sin((1.2 - st.intro) * 5) * .25 * st.intro : st.d;   // on entry the rear axle rocks to show it moves
        if (st.intro > 0) st.intro = Math.max(0, st.intro - dt);
        const prev = st.shown; st.shown += (goal - st.shown) * Math.min(1, dt * 8);
        if (Math.abs(st.shown - prev) > 1e-4) { for (const w of rearWheels) w.rotation.y -= (st.shown - prev) / .5; place(); }
        if (Math.abs(st.shown - (deco.userData.d ?? -1)) > .004) { rebuild(); deco.userData.d = st.shown; }
        handle.position.y = 3.4 + Math.sin(t * 3) * .12;
      },
      reset() { setD(.8, false); guide.reset(); },
      get debug() { return { d: st.d, shown: +st.shown.toFixed(3), kind: classify(st.d), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-7.7, 2.4, 12.4], w: 9, h: 5.2,
      steps: [
        { title: 'One axle', show: [], enter: () => setD(.8, false),
          text: 'Two axles 0.8 m apart lie between planes 1 m apart, so they count as one single axle (cl. 3.7): 10.2 t on dual tyres. Drag the amber handle to move the rear axle.' },
        { title: 'Tandem', show: ['−0.1 m', '+0.1 m'], enter: () => setD(1.5, false),
          check: { q: 'These axles are 1.5 m apart. What are they?', options: ['a single axle', 'a tandem axle', 'neither'], answer: 1, why: 'More than 1.2 m and not more than 2.5 m apart: a tandem (cl. 3.8), 18 t for the pair (cl. 6.2).' } },
        { title: 'The gap', show: ['−0.1 m', '+0.1 m', 'Within 1 m', 'Tandem 1.3 m', 'Apart 3 m'], enter: () => setD(1.1, false),
          check: { q: 'And at 1.1 m apart?', options: ['a single axle', 'a tandem axle', 'neither definition'], answer: 2, why: 'Beyond 1 m it is not a single axle (cl. 3.7); not more than 1.2 m, it is not a tandem (cl. 3.8). The standard does not cover the gap.' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    const man = ctx.hero(S); man.position.set(X0 - 5, 0, -2.5); man.rotation.y = .6; group.add(man);   // a person at true scale beside the wheels

    place(); rebuild();
    api.targets = [guide.card, rearHit, handle, ...rearWheels];
    return api;
  },
};
