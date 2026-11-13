// Spread 5 · Friction and superelevation (cl. 4.1–4.3, eq. 3–5, Figs. 6–8). A cross-section of the road through a curve,
// seen from behind a car. Tilt the road (e), pick speed and radius: the centrifugal ratio B = V²/127R must be met by
// e + f. The friction the tyres must supply, f = B − e, is drawn along the road; beyond 0.15 the car slides off outward.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { diorama, car, MAT } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', S = 1.15, TILTX = 3, FMAX = .15;   // page cm per m; the tilt is drawn 3× steeper

export default {
  cam: { pos: [4.6, 26, 40], look: [4.6, 2.6, -1], portrait: { pos: [15, 50, 56], look: [12.3, 1, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { e: .07, V: 80, R: 230, slide: 0, falling: false };
    group.add(diorama({ x0: -12.6, x1: 12.6, z0: -14, z1: 4, h: .5 }));
    // the section stands on a lectern tilted back towards the reader, so its face is seen square on, like Figs. 6–8
    const stand = new THREE.Group(); stand.position.set(0, .5, -.5); stand.rotation.x = -.62; group.add(stand);
    const bank = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.2, 3.2), MAT.earth); bank.position.set(0, .6, 0); bank.castShadow = bank.receiveShadow = true; stand.add(bank);
    const pivot = new THREE.Group(); pivot.position.set(0, 1.6, 0); stand.add(pivot);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(7 * S, .7, 4), SM.asphalt); deck.receiveShadow = true; pivot.add(deck);
    for (const x of [-1, 1]) { const line = new THREE.Mesh(new THREE.BoxGeometry(.12, .72, 4), SM.paint); line.position.x = x * 3.4 * S; pivot.add(line); }
    const auto = car(S * 1.05, 0x24557a); auto.rotation.y = Math.PI / 2; pivot.add(auto);   // seen from behind: nose away from the reader
    // arrows at the car's centre of gravity
    const arrow = color => {
      const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color, toneMapped: false });
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 1, 8), m); sh.rotation.z = -Math.PI / 2;
      const hd = new THREE.Mesh(new THREE.ConeGeometry(.25, .55, 10), m); hd.rotation.z = -Math.PI / 2;
      g.add(sh, hd); g.userData = { sh, hd }; stand.add(g); return g;
    };
    const setLen = (a, L) => { a.userData.sh.scale.y = Math.max(.01, Math.abs(L)); a.userData.sh.position.x = L / 2; a.userData.hd.position.x = L + Math.sign(L || 1) * .27; a.userData.hd.rotation.z = L >= 0 ? -Math.PI / 2 : Math.PI / 2; a.visible = Math.abs(L) > .03; };
    const pA = arrow(0xc23b2f), wA = arrow(0x3b4d5e), fA = arrow(0x2f8f55);
    const lab = (t, c) => { const l = holo.label(t, { h: .62, color: c, bg: 'rgba(255,253,248,.92)', weight: 700 }); stand.add(l); return l; };
    const pL = lab('P', '#c23b2f'), wL = lab('W', '#3b4d5e'), fL = lab('friction', '#1f7a45');
    stand.add(holo.polyline([[-6, 1.6, 2.2], [6, 1.6, 2.2]], holo.DIM, { width: .05, dashed: true }));   // level, for comparison
    const outL = holo.label('OUTSIDE OF CURVE →', { h: .55, color: '#5c6168' }); outL.position.set(6.4, 3.4, 2.2); stand.add(outL);

    const B = () => st.V * st.V / (127 * st.R), fNeed = () => B() - st.e, holds = () => fNeed() <= FMAX + 1e-9;
    const card = textPlane({ w: 9.4, h: 6.4, px: 46, draw: (c, W, H) => {
      const ok = holds(); cardBg(c, W, H, { stroke: ok ? 'rgba(47,143,85,.9)' : 'rgba(194,59,47,.9)' }); c.textAlign = 'left';
      c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText(`B = V²/127R = e + f · ${st.V} km/h on R ${st.R} m`, 18, 26);
      const rows = [['Centrifugal ratio B = V²/127R', B().toFixed(3)], ['Superelevation e (tilt)', st.e.toFixed(2)], ['Friction needed f = B − e', fNeed().toFixed(3)], ['Friction allowed: 0.2 ÷ 1⅓ (cl. 4.2)', FMAX.toFixed(2)]];
      rows.forEach(([a, b], i) => { const y = 62 + i * 36; c.fillStyle = '#5c6168'; c.font = `500 16px ${F}`; c.fillText(a, 18, y); c.fillStyle = i === 2 ? (ok ? '#1f7a45' : '#b3362b') : '#14202b'; c.font = `700 19px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 18, y); c.textAlign = 'left'; });
      c.fillStyle = ok ? '#1f7a45' : '#b3362b'; c.font = `700 17px ${F}`; c.fillText(ok ? (fNeed() < 0 ? '✓ holds: the tilt alone is more than enough' : '✓ holds: friction and tilt share the push') : '✗ more friction than the road gives: slides', 18, H - 44);
      c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`; c.fillText('e at most 0.07; 0.10 in hills without snow (cl. 4.3). Tilt drawn 3×.', 18, H - 18);
    } });
    card.position.set(5.1, 2.6, 10.6); card.rotation.x = -.6; group.add(card);

    function place() {
      const A = Math.atan(st.e * TILTX); pivot.rotation.z = A;   // positive z turns +x upward: the outer (right) edge rises
      auto.position.set(st.slide * S, .35, 0);
      const cg = new THREE.Vector3(st.slide * S, 1.4, 0).applyEuler(pivot.rotation).add(pivot.position);
      pA.position.copy(cg); setLen(pA, B() * 16);
      wA.position.copy(cg); wA.rotation.set(0, 0, -Math.PI / 2); setLen(wA, 2.6);
      fA.position.copy(new THREE.Vector3(st.slide * S, .45, 2.1).applyEuler(pivot.rotation).add(pivot.position)); fA.rotation.set(0, 0, A); setLen(fA, -Math.min(fNeed(), .3) * 16);
      fA.children.forEach(m => m.material.color.setHex(holds() ? 0x2f8f55 : 0xc23b2f));
      pL.position.copy(cg).add(new THREE.Vector3(B() * 16 + .9, .4, 0)); wL.position.copy(cg).add(new THREE.Vector3(.6, -2.4, 0));
      fL.position.copy(fA.position).add(new THREE.Vector3(-Math.min(fNeed(), .3) * 8, .7, 0)); fL.visible = Math.abs(fNeed()) > .005;
      card.redraw();
    }
    const set = (k, v) => { st[k] = v; st.slide = 0; st.falling = false; place(); };
    const actions = [
      ...[0, .04, .07, .10].map(e => ({ label: `e ${Math.round(e * 100)} %`, toggle: () => st.e === e, run: () => set('e', e) })),
      ...[40, 65, 80, 100].map(v => ({ label: `${v} km/h`, toggle: () => st.V === v, run: () => set('V', v) })),
      ...[90, 155, 230, 360].map(r => ({ label: `R ${r}`, toggle: () => st.R === r, run: () => set('R', r) })),
    ];
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        if (!holds()) {   // slide outward to the edge and off, then start again
          st.slide += dt * 1.6; st.falling = st.slide > 3.4; if (st.slide > 4.6) st.slide = 0;
          place(); if (st.falling) auto.position.y = .35 - (st.slide - 3.4) * 1.2;
        } else if (st.slide) { st.slide = 0; place(); }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.e = .07; st.V = 80; st.R = 230; st.slide = 0; place(); guide.reset(); },
      get debug() { return { e: st.e, V: st.V, R: st.R, B: +B().toFixed(4), fNeed: +fNeed().toFixed(4), holds: holds(), guide: guide.debug }; },
    };
    const eChips = actions.slice(0, 4).map(a => a.label), vChips = actions.slice(4, 8).map(a => a.label), rChips = actions.slice(8).map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Friction alone', show: ['e 0 %', ...vChips], text: 'With the road level (e 0), friction alone must hold the car against the push. Raise the speed until it cannot.',
          check: { q: 'What value of friction is used for design (cl. 4.2)?', options: ['0.15', '0.20', '0.07'], answer: 0, why: 'Friction falls as low as 0.2 on a muddy pavement; with a factor of safety of 1⅓, the design value is 0.15 (cl. 4.2).' } },
        { title: 'Tilt the road', show: [...eChips, ...vChips, ...rChips], text: 'Tilt the road. The superelevation takes part of the push, so the tyres need less friction: B = e + f.',
          check: { q: 'What is the maximum superelevation in plains (cl. 4.3)?', options: ['7 per cent', '10 per cent', '15 per cent'], answer: 0, why: 'Slow bullock carts loaded high find a steeper cross slope inconvenient, so the maximum is 7 per cent (cl. 4.3; the page misprints the carts’ limit as "70 per cent").' } },
        { title: 'Hills', show: [...eChips, ...vChips, ...rChips], text: 'Where carts are few, a steeper tilt helps. But snow makes a steep tilt dangerous for slow traffic.',
          check: { q: 'In hills not affected by snow, the recommended superelevation is…', options: ['10 per cent', '7 per cent', '4 per cent'], answer: 0, why: '10 per cent in hilly areas not affected by snow; where snow makes the road slippery, the limit stays 7 per cent (cl. 4.3).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    place();
    return api;
  },
};
