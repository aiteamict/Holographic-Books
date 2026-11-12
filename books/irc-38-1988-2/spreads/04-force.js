// Spreads 4 and 6 · A car drives a curve at the design speed (cl. 4.1, 4.4). Mode 'force': the centrifugal force
// P = WV²/127R as an arrow on the car and the tyre loads seen from behind (Figs. 4–5). Mode 'radius': drag the curve
// tighter; below the minimum radius for the speed (eq. 6) the car cannot hold the curve and skids off outward.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { horizontalCurve } from '../../_irc38/curve.js';
import { makePlan } from '../../_irc38/plan.js';
import { diorama, trees, makeRoad, throughSlab, car, VEH } from '../../_irc38/site.js';
import { MIN_RADIUS } from '../../_irc38/tables.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, D = 60, RAD = Math.PI / 180;
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };
const TERR = [['Plain / rolling', .07, 0], ['Hills, no snow', .10, 2], ['Hills, snow', .07, 1]];   // e max (cl. 4.3), Table 3 column

export function curveDrive(mode) {
  const radiusMode = mode === 'radius';
  const RMIN = radiusMode ? 15 : 30, RMAX = radiusMode ? 380 : 200;
  const S = radiusMode ? .045 : .075, ORIGIN = [0, GROUND, radiusMode ? -8 : -7];   // the force view is closer: radii only to 200 m
  return {
    cam: { pos: [3, 40, 36], look: [3.5, 0, -2], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const st = { V: radiusMode ? 80 : 60, R: radiusMode ? 300 : 120, ter: 0, carD: 0, skid: null, B: 0, shown: -1, lastB: 0 };
      const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
      const forest = trees(slab, 36, radiusMode ? 31 : 19); group.add(forest);
      const plan = makePlan({ s: S, origin: ORIGIN, ext: 0, show: { ribbon: false, ts: false, es: false, delta: false, radii: true } }); group.add(plan.group);
      const road = makeRoad(plan.P, S); group.add(road.group);
      const auto = car(S * VEH * 1.8, 0x24557a); group.add(auto);
      const hR = holo.handle('radius', { label: 'R · drag', kind: 'lever', r: .9 }); group.add(hR);
      // force arrows on the car: P outward (red), W down (dark)
      const arrow = color => {
        const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color, toneMapped: false });
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 1, 8), m); shaft.rotation.z = -Math.PI / 2; shaft.position.x = .5;
        const head = new THREE.Mesh(new THREE.ConeGeometry(.22, .5, 10), m); head.rotation.z = -Math.PI / 2; head.position.x = 1.15;
        g.add(shaft, head); g.userData = { shaft, head }; group.add(g); return g;
      };
      const pArrow = arrow(0xc23b2f), wArrow = arrow(0x3b4d5e); wArrow.rotation.z = -Math.PI / 2;
      const pLab = holo.label('', { h: .6, color: '#c23b2f', bg: 'rgba(255,253,248,.9)', weight: 700 }); group.add(pLab);
      const setLen = (a, L) => { a.userData.shaft.scale.y = Math.max(.01, L); a.userData.shaft.position.x = L / 2; a.userData.head.position.x = L + .25; a.visible = L > .02; };

      const curve = () => horizontalCurve(D, st.R, 0);
      const e = () => TERR[st.ter][1], minAbs = () => st.V * st.V / (127 * (e() + .15));
      const tableR = () => MIN_RADIUS[st.V]?.[TERR[st.ter][2]];
      const holds = () => st.R >= minAbs();
      let T = null, e1 = 0;

      const card = textPlane({ w: 9.6, h: 6.6, px: 46, draw: (c, W, H) => {
        cardBg(c, W, H, radiusMode ? { stroke: holds() ? 'rgba(47,143,85,.9)' : 'rgba(194,59,47,.9)' } : {}); c.textAlign = 'left';
        const B = st.V * st.V / (127 * st.R);
        c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText(radiusMode ? `MINIMUM RADIUS · ${st.V} km/h, ${TERR[st.ter][0].toLowerCase()}` : `CENTRIFUGAL FORCE · ${st.V} km/h on R ${st.R.toFixed(0)} m`, 18, 26);
        if (!radiusMode) {
          c.fillStyle = '#14202b'; c.font = `700 19px ${F}`; c.fillText(`P/W = V²/127R = ${B.toFixed(3)}`, 18, 58);
          c.font = `500 15px ${F}`; c.fillStyle = '#5c6168'; c.fillText(`For a 1-tonne car: P ≈ ${(B * 1000).toFixed(0)} kg, pushing it outward (eq. 2)`, 18, 82);
          // rear view on a level road: the outer wheel loaded more (Fig. 4: Wo = W/2 + P h/t, with h/t ≈ 0.4)
          const on = st.B > 0, k = on ? st.B * .4 : 0, wo = .5 + k, wi = .5 - k, cx = W / 2, gy = H - 64;
          c.fillStyle = '#24557a'; c.fillRect(cx - 80, gy - 96, 160, 54); c.fillStyle = '#1d2830'; c.fillRect(cx - 62, gy - 128, 124, 34);
          for (const [x, w, lab] of [[cx - 70, wi, 'inner'], [cx + 70, wo, 'outer']]) {
            c.fillStyle = '#1b1c1e'; c.fillRect(x - 13, gy - 44, 26, 44);
            c.fillStyle = 'rgba(194,59,47,.45)'; c.beginPath(); c.ellipse(x, gy + 4, 10 + w * 46, 6 + w * 30, 0, 0, Math.PI); c.fill();
            c.fillStyle = '#14202b'; c.font = `600 13px ${F}`; c.textAlign = 'center'; c.fillText(`${lab} ${(w * 100).toFixed(0)} %`, x, gy + 48); c.textAlign = 'left';
          }
          c.fillStyle = '#c23b2f'; c.font = `700 14px ${F}`; c.fillText(on ? '→ outward' : 'straight: no push', cx + 92, gy - 70);
          return;
        }
        const rows = [['Design speed V', `${st.V} km/h`], ['Superelevation e + friction f', `${e().toFixed(2)} + 0.15`], ['Absolute minimum V²/127(e+f) (eq. 6)', `${minAbs().toFixed(0)} m`], ['Table 3 minimum', tableR() ? `${tableR()} m` : 'speed not applicable'], ['Radius of this curve', `${st.R.toFixed(0)} m`]];
        rows.forEach(([a, b], i) => { const y = 60 + i * 34; c.fillStyle = '#5c6168'; c.font = `500 16px ${F}`; c.fillText(a, 18, y); c.fillStyle = i === 4 ? (holds() ? '#1f7a45' : '#b3362b') : '#14202b'; c.font = `700 18px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 18, y); c.textAlign = 'left'; });
        c.fillStyle = holds() ? '#1f7a45' : '#b3362b'; c.font = `700 17px ${F}`;
        c.fillText(holds() ? (tableR() && st.R < tableR() ? '✓ holds, but below the Table 3 minimum' : '✓ the car holds the curve') : '✗ too sharp for this speed: the car skids off', 18, H - 18);
      } });
      card.position.set(5.1, 2.7, 10.5); card.rotation.x = -.6; group.add(card);

      function place() {
        const k = curve(); plan.set(k);
        const through = throughSlab(plan.L, plan.P, SLAB); e1 = through.e1;
        T = road.set(through.pts, { stones: [e1, e1 + k.Lc], side: 1 });
        const near = through.pts.filter((_, i) => i % 3 === 0).map(p => plan.P(p));
        forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.1));
        hR.position.copy(plan.P(plan.L.mid, .05)); card.redraw();
      }
      const setV = v => { st.V = v; st.skid = null; card.redraw(); };
      let grip = null;
      const planXY = p => [(p.x - ORIGIN[0]) / S, -(p.z - ORIGIN[2]) / S];
      const speeds = radiusMode ? [40, 50, 65, 80, 100] : [40, 60, 80, 100];
      const actions = [
        ...speeds.map(v => ({ label: `${v} km/h`, toggle: () => st.V === v, run: () => setV(v) })),
        ...(radiusMode ? TERR.map(([n], i) => ({ label: n, toggle: () => st.ter === i, run: () => { st.ter = i; st.skid = null; card.redraw(); } })) : []),
        ...(radiusMode ? [{ label: 'Set to Table 3', run: () => { const r = tableR(); if (r) { st.R = r; st.skid = null; place(); } } }] : []),
      ];
      const api = {
        group, dragPlane: 'xz', targets: [hR], actions,
        press(hit) { grip = tagged(hit.object, 'handle') ? {} : null; },
        drag({ point }) {
          if (!grip) return;
          const [, y] = planXY(point), es = THREE.MathUtils.clamp(-y, 1, 400);
          st.R = THREE.MathUtils.clamp(es / (1 / Math.cos(D / 2 * RAD) - 1), RMIN, RMAX); st.skid = null; place();
          guide.say(radiusMode ? `R ${st.R.toFixed(0)} m against a minimum of ${minAbs().toFixed(0)} m at ${st.V} km/h: ${holds() ? 'it holds.' : 'too sharp.'}` : `R ${st.R.toFixed(0)} m: P/W = ${(st.V * st.V / (127 * st.R)).toFixed(3)}.`);
        },
        release() { grip = null; },
        tap(hit) { guide.tap(hit); },
        a11y: actions.map(a => ({ label: a.label, run: a.run })),
        update(dt) {
          anims.tick(dt);
          if (T) {
            const k = curve(), v = st.V / 3.6;
            if (st.skid) {   // sliding off along the tangent, turning, then back to the start
              const s = st.skid; s.t += dt; const go = v * 1.4 * dt * Math.max(0, 1 - s.t / 1.6); s.x += Math.cos(s.h) * go; s.y += Math.sin(s.h) * go;
              auto.position.copy(plan.P([s.x, s.y], .01)); auto.rotation.y = s.h + s.t * 1.6; setLen(pArrow, 0); setLen(wArrow, 0); pLab.visible = false;
              if (s.t > 2.4) { st.skid = null; st.carD = 0; }
            } else {
              st.carD += v * 1.4 * dt; if (st.carD > T.length - 1) st.carD = 0;
              const p = T.at(st.carD), onCurve = st.carD > e1 && st.carD < e1 + k.Lc;
              st.B = onCurve ? st.V * st.V / (127 * st.R) : 0;
              const nx = -Math.sin(p.h), ny = Math.cos(p.h), pos = [p.x + nx * 1.75, p.y + ny * 1.75];
              auto.position.copy(plan.P(pos, .01)); auto.rotation.y = p.h;
              if (radiusMode && onCurve && !holds()) { st.skid = { x: pos[0], y: pos[1], h: p.h, t: 0 }; ctx.snd?.play('step'); }
              // P points outward: this curve turns right, so outward is to the car's left
              const c0 = auto.position.clone().add(new THREE.Vector3(0, .7, 0));
              pArrow.position.copy(c0); pArrow.rotation.set(0, p.h + Math.PI / 2, 0); setLen(pArrow, st.B * 14);
              wArrow.position.copy(c0); setLen(wArrow, radiusMode ? 0 : 1.4);
              pLab.visible = st.B > 0; pLab.position.copy(c0).add(new THREE.Vector3(-Math.sin(p.h) * st.B * 8.4, 1, -Math.cos(p.h) * st.B * 8.4));
              if (st.B > 0 && Math.round(st.B * 100) !== st.shown) { st.shown = Math.round(st.B * 100); pLab.userData.setText(`P = ${st.B.toFixed(2)} W`); }
              if (!radiusMode && (st.lastB > 0) !== (st.B > 0)) card.redraw(); st.lastB = st.B;
            }
          }
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
        },
        reset() { anims.clear(); st.V = radiusMode ? 80 : 60; st.R = radiusMode ? 300 : 120; st.ter = 0; st.skid = null; st.carD = 0; place(); guide.reset(); },
        get debug() { return { V: st.V, R: +st.R.toFixed(1), B: +(st.V * st.V / (127 * st.R)).toFixed(4), minAbs: +minAbs().toFixed(1), table3: tableR() ?? null, holds: holds(), skidding: !!st.skid, guide: guide.debug }; },
      };
      const steps = radiusMode ? [
        { title: 'Tighten', show: speeds.map(v => `${v} km/h`), text: 'At 80 km/h, drag the curve tighter. Below the minimum radius the car cannot hold it and skids off outward.',
          check: { q: 'At 80 km/h with e + f = 0.22, the absolute minimum radius is about…', options: ['229 m', '360 m', '100 m'], answer: 0, why: '80² / (0.22 × 127) = 229 m, which is 0.0358 V² (eq. 6). Table 3 gives 230 m.' } },
        { title: 'Table 3', show: [...speeds.map(v => `${v} km/h`), ...TERR.map(t => t[0]), 'Set to Table 3'], text: 'Change the speed and the terrain. "Set to Table 3" puts the curve at the tabled minimum.',
          check: { q: 'Table 3 minimum radius at 100 km/h in plain or rolling terrain?', options: ['360 m', '230 m', '155 m'], answer: 0, why: 'Plain and rolling: 360 m at 100 km/h, 230 at 80, 155 at 65, 90 at 50 (Table 3).' } },
        { title: 'Largest possible', show: [...speeds.map(v => `${v} km/h`), ...TERR.map(t => t[0]), 'Set to Table 3'], text: 'The table gives the least the curve may be, not what to aim for.',
          check: { q: 'The radii of Table 3 are…', options: ['minima: design for the largest possible', 'targets to aim at', 'maxima'], answer: 0, why: 'The values are the minimum, and the engineer should design curves for the largest radius possible (cl. 4.4.4).' } },
      ] : [
        { title: 'The push', show: speeds.map(v => `${v} km/h`), text: 'On the curve a red arrow appears on the car: the centrifugal force, pushing it outward.',
          check: { q: 'Where and which way does the centrifugal force act (cl. 4.1)?', options: ['outward, at the centre of gravity', 'inward, at the tyres', 'downward'], answer: 0, why: 'It acts radially outward, horizontally at the centre of gravity of the vehicle and its load (cl. 4.1).' } },
        { title: 'Speed', show: speeds.map(v => `${v} km/h`), text: 'Try 40 and 80 km/h on the same curve. Watch the arrow and P/W on the card.',
          check: { q: 'Double the speed on the same curve. P becomes…', options: ['four times', 'twice', 'the same'], answer: 0, why: 'P = WV²/127R grows with the square of the speed (eq. 2).' } },
        { title: 'The tyres', show: speeds.map(v => `${v} km/h`), text: 'The rear view on the card shows the load on each tyre while the car is on the curve. Drag the curve tighter too.',
          check: { q: 'On a curve with no superelevation, which wheel carries more?', options: ['the outer', 'the inner', 'both the same'], answer: 0, why: 'With friction alone resisting the force, the pressure on the wheels is unequal, the outer wheel taking more (cl. 4.1, Fig. 4).' } },
      ];
      const guide = makeGuide(ctx, { anchor: [-5.4, 2.2, 10.5], w: 10, h: 5, steps });
      guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
      card.userData.zoom = true; api.targets.push(card);
      place();
      return api;
    },
  };
}

export default curveDrive('force');
