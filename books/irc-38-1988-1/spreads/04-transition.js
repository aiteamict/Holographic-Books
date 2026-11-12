// Spreads 4 and 5 · Adding transitions (Fig. 2) and Transitional throughout (Fig. 3), as a site model with traffic.
// A car drives the bend at 40 km/h; the meter shows what the driver feels: the steering wheel and the sideways
// acceleration v²/r along the road, without a transition (a step at T.P.) and with one (a ramp). The magnifier shows the
// circle moving inward. Drag the C.T. peg along the curve to change Ls; at the middle the curve is transitional throughout.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { horizontalCurve, layout, deg } from '../../_irc38/curve.js';
import { makePlan } from '../../_irc38/plan.js';
import { diorama, trees, makeRoad, throughSlab, car, VEH } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', S = .085, GROUND = .5, ORIGIN = [0, GROUND, -6.5], RAD = Math.PI / 180;
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };
const V = 40, v = V / 3.6, C_IRC = 80 / (75 + V);   // design speed, m/s, and the allowable rate of change of acceleration (cl. 7.3)

export function transitionSpread(mode) {
  const throughoutMode = mode === 'throughout';
  const D = throughoutMode ? 50 : 80, R = throughoutMode ? 90 : 50, LS0 = throughoutMode ? 30 : 0;
  return {
    cam: { pos: [3, 41, 37], look: [3.5, 0, -2], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const st = { Ls: LS0, carD: 0, a: 0 };
      const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
      const forest = trees(slab, 36, throughoutMode ? 23 : 5); group.add(forest);
      const plan = makePlan({ s: S, origin: ORIGIN, ext: 0, show: { ribbon: false, delta: false, ts: false } }); group.add(plan.group);
      const P = plan.P, road = makeRoad(P, S); group.add(road.group);
      const ghost = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.DIM, { width: .06, dashed: true, opacity: .9 }); group.add(ghost);   // the circle before it moved in
      const auto = car(S * VEH, 0x24557a); group.add(auto);
      const hCT = holo.handle('ct', { label: throughoutMode ? 'C.T. · drag to the middle' : 'C.T. · drag along the curve', kind: 'lever', r: .9 }); group.add(hCT);

      const curve = () => horizontalCurve(D, R, st.Ls);
      let T = null, e1 = 0;
      // curvature along the road from the start of the path: 0 on the straights, rising along the spirals, 1/R on the arc
      const kappa = (d, ls = curve().Ls) => {
        const k = horizontalCurve(D, R, ls), x = d - e1, tot = 2 * k.Ls + k.Lc;
        if (x <= 0 || x >= tot) return 0;
        if (k.Ls && x < k.Ls) return x / (R * k.Ls);
        if (k.Ls && x > k.Ls + k.Lc) return (tot - x) / (R * k.Ls);
        return 1 / R;
      };

      // the meter: steering wheel and sideways acceleration along the road, both versions
      const meter = textPlane({ w: 9.6, h: 6.8, px: 46, draw: (c, W, H) => {
        const k = curve(); cardBg(c, W, H); c.textAlign = 'left';
        c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText(`WHAT THE DRIVER FEELS · ${V} km/h`, 18, 28);
        // wheel
        const wx = 62, wy = 112, wr = 40, turn = THREE.MathUtils.clamp(kappa(st.carD) * R, 0, 1) * 1.6;
        c.save(); c.translate(wx, wy); c.rotate(turn); c.strokeStyle = '#14202b'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, wr, 0, Math.PI * 2); c.stroke();
        c.lineWidth = 5; for (const a of [0, 2.2, 4.1]) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - Math.PI / 2) * wr, Math.sin(a - Math.PI / 2) * wr); c.stroke(); }
        c.fillStyle = '#c23b2f'; c.beginPath(); c.arc(0, -wr, 6, 0, Math.PI * 2); c.fill(); c.restore();
        c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`; c.textAlign = 'center'; c.fillText('steering', wx, wy + wr + 20); c.textAlign = 'left';
        // graph
        const gx = 128, gy = 50, gw = W - gx - 18, gh = 118, amax = v * v / R, tot = 2 * k.Ls + k.Lc, d0 = e1 - 25, d1 = e1 + Math.max(tot, 2 * 50 + R * D * RAD - 100) + 25;
        c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(gx, gy, gw, gh);
        const X = d => gx + (d - d0) / (d1 - d0) * gw, Y = a => gy + gh - a / amax * (gh - 10);
        const trace = (ls, color, dash) => { c.strokeStyle = color; c.lineWidth = 3; c.setLineDash(dash); c.beginPath(); for (let d = d0; d <= d1; d += 1) { const y = Y(v * v * kappa(d, ls)); if (d === d0) c.moveTo(X(d), y); else c.lineTo(X(d), y); } c.stroke(); c.setLineDash([]); };
        const other = k.Ls ? 0 : 50;
        trace(other, other ? 'rgba(47,143,85,.55)' : 'rgba(194,59,47,.55)', [6, 5]);
        trace(k.Ls, k.Ls ? '#2f8f55' : '#c23b2f', []);
        c.fillStyle = '#24557a'; c.beginPath(); c.arc(X(Math.min(d1, Math.max(d0, st.carD))), Y(st.a), 6, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText(`${amax.toFixed(1)} m/s²`, gx + 4, gy + 13); c.fillText('T.P.', X(e1) - 12, gy + gh + 14); c.fillText('sideways acceleration v²/r along the road', gx, gy + gh + 30);
        // verdict
        c.font = `700 16px ${F}`; c.fillStyle = k.Ls ? '#1f7a45' : '#b3362b';
        const Cnow = k.Ls ? v ** 3 / (R * k.Ls) : Infinity, Lmin = .0215 * V ** 3 / (C_IRC * R);
        c.fillText(k.Ls ? `Builds over ${k.Ls.toFixed(0)} m: rate C = ${Cnow.toFixed(2)} m/s³` : `No transition: 0 → ${amax.toFixed(1)} m/s² at once`, 18, H - 50);
        c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`;
        c.fillText(`IRC: C = 80/(75 + V) = ${C_IRC.toFixed(2)} m/s³ → Ls ≥ 0.0215 V³/(C R) = ${Lmin.toFixed(0)} m`, 18, H - 24);
      } });
      meter.position.set(5.1, 2.7, 10.5); meter.rotation.x = -.6; group.add(meter);

      // the magnifier: the circle before and after it moved inward, at the middle of the curve
      const lens = textPlane({ w: 6.4, h: 4.6, px: 46, draw: (c, W, H) => {
        cardBg(c, W, H); c.textAlign = 'left'; if (!plan.L) return;   // first draw happens before the curve is laid out
        const k = curve(), L0 = layout(horizontalCurve(D, R, 0), .5), L1 = plan.L;
        c.fillStyle = '#24557a'; c.font = `700 14px ${F}`; c.fillText('MAGNIFIER · middle of the curve', 14, 24);
        const gap = k.Es - horizontalCurve(D, R, 0).Es, scale = Math.min(60, 70 / Math.max(gap, .3)), cx = W / 2, cy = H / 2 + 6;
        const draw = (pts, color, dash, dy) => { c.strokeStyle = color; c.lineWidth = 4; c.setLineDash(dash); c.beginPath(); let first = true; for (const p of pts) { if (Math.abs(p[0]) > (W / 2 - 12) / scale) continue; const x = cx + p[0] * scale, y = cy - (p[1] + dy) * scale; if (first) { c.moveTo(x, y); first = false; } else c.lineTo(x, y); } c.stroke(); c.setLineDash([]); };
        const mid0 = -horizontalCurve(D, R, 0).Es;
        draw(L0.pts, '#8b959e', [8, 6], -mid0 + gap / 2); draw(L1.pts, '#1d5f87', [], -mid0 + gap / 2);
        c.fillStyle = '#14202b'; c.font = `700 15px ${F}`;
        c.fillText(k.Ls ? `moved in ${gap.toFixed(2)} m here · shift S = ${k.S.toFixed(2)} m` : 'no transition: nothing moved', 14, H - 34);
        c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`; c.fillText(`Ls ${k.Ls.toFixed(0)} m · θs ${deg(k.thetaS).toFixed(1)}° · Δc ${deg(k.DeltaC).toFixed(1)}° · ×${(scale / 46 / S).toFixed(0)}`, 14, H - 14);
      } });
      lens.position.set(-7.6, 4.2, -10.6); lens.rotation.x = -.45; group.add(lens);

      function place() {
        const k = curve(); plan.set(k);
        const L = plan.L, through = throughSlab(L, P, SLAB); e1 = through.e1;
        T = road.set(through.pts, { stones: [e1, e1 + k.length], side: 1 });
        holo.setPoints(ghost, layout(horizontalCurve(D, R, 0), 1).pts.map(p => P(p, .08))); ghost.visible = k.Ls > 0;
        const near = through.pts.filter((_, i) => i % 3 === 0).map(p => P(p));
        forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.1));
        hCT.position.copy(P(k.throughout ? L.mid : k.Ls > 0 ? L.CT : L.TP, .05));
        meter.redraw(); lens.redraw();
      }
      const toLs = (ls, dur = .9) => { const a = st.Ls; anims.stop('ls'); anims.add({ dur, tag: 'ls', update: e => { st.Ls = a + (ls - a) * e; place(); } }); };
      const maxLs = () => R * D * RAD;   // the whole deviation in spirals: transitional throughout

      let grip = null, redrawT = 0;
      const planXY = p => [(p.x - ORIGIN[0]) / S, -(p.z - ORIGIN[2]) / S];
      const actions = throughoutMode
        ? [{ label: 'Use up the circle', run: () => toLs(maxLs(), 1.6) }, { label: 'Back to Fig. 2', run: () => toLs(30) }]
        : [{ label: 'No transition', toggle: () => st.Ls < .5, run: () => toLs(0) }, { label: 'With transition', toggle: () => st.Ls >= .5, run: () => toLs(50) }, { label: 'Longer', run: () => toLs(Math.min(maxLs() * .8, st.Ls + 15)) }, { label: 'Shorter', run: () => toLs(Math.max(0, st.Ls - 15)) }];
      const api = {
        group, dragPlane: 'xz', targets: [hCT], actions,
        press(hit) { grip = tagged(hit.object, 'handle') ? {} : null; if (grip) anims.stop('ls'); },
        drag({ point }) {
          if (!grip) return;
          const [x, y] = planXY(point), O = plan.L.O, phi = Math.atan2(Math.abs(x - O[0]), y - O[1]);   // angle of the pointer from the axis of symmetry
          const dc = THREE.MathUtils.clamp(2 * phi, 0, D * RAD); st.Ls = R * (D * RAD - dc);         // Δc = 2φ, θs = (Δ − Δc)/2, Ls = 2Rθs
          place(); const k = curve();
          guide.say(k.throughout ? `Transitional throughout: two ${k.Ls.toFixed(0)} m spirals meet at C.C.T., each turning ${deg(k.thetaS).toFixed(1)}° = Δ/2.` : k.Ls ? `Ls ${k.Ls.toFixed(0)} m: θs ${deg(k.thetaS).toFixed(1)}°, Δc ${deg(k.DeltaC).toFixed(1)}°, shift ${k.S.toFixed(2)} m.` : 'No transition: a simple circular curve.');
        },
        release() { grip = null; },
        tap(hit) { guide.tap(hit); },
        a11y: actions.map(a => ({ label: a.label, run: a.run })),
        update(dt) {
          anims.tick(dt);
          if (T) {   // the car at 40 km/h (shown 2.5× faster), keeping left, rolling with the sideways push
            st.carD = (st.carD + dt * v * 2.5) % T.length;
            const p = T.at(st.carD), off = 1.75; st.a = v * v * kappa(st.carD);
            auto.position.copy(P([p.x - Math.sin(p.h) * off, p.y + Math.cos(p.h) * off], .01)); auto.rotation.y = p.h;
            auto.userData.body.rotation.x = -st.a * .022;
            if ((redrawT += dt) > .1) { redrawT = 0; meter.redraw(); }
          }
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          meter.position.x = tall ? 3.6 : 5.1; meter.scale.setScalar(tall ? .82 : 1);
          lens.position.x = tall ? -4.4 : -7.6; lens.scale.setScalar(tall ? .8 : 1);
        },
        reset() { anims.clear(); st.Ls = LS0; st.carD = 0; place(); guide.reset(); },
        get debug() { const k = curve(); return { Ls: +k.Ls.toFixed(2), thetaS: +deg(k.thetaS).toFixed(3), DeltaC: +deg(k.DeltaC).toFixed(3), S: +k.S.toFixed(3), Ts: +k.Ts.toFixed(3), throughout: k.throughout, a: +st.a.toFixed(2), guide: guide.debug }; },
      };
      const steps = throughoutMode ? [
        { title: 'Lengthen', show: ['Use up the circle', 'Back to Fig. 2'], text: 'Drag C.T. towards the middle of the curve. The spirals grow and the cyan circular arc between them shrinks.',
          check: { q: 'When does the circular arc disappear?', options: ['when 2θs = Δ', 'when Ls = R', 'never'], answer: 0, why: 'Δc = Δ − 2θs. When the two spirals turn through the whole deviation, nothing is left for the circle (def. 13).' } },
        { title: 'C.C.T.', show: ['Use up the circle', 'Back to Fig. 2'], text: 'The two spirals now meet at one point, C.C.T. Watch the meter: the push rises to a peak and falls straight away.',
          check: { q: 'Δ is 50°. Through what angle does each spiral turn?', options: ['25°', '50°', '12.5°'], answer: 0, why: 'θs = Δ/2 = 25°: each spiral takes half of the deviation.' } },
        { title: 'The wheel', show: ['Use up the circle', 'Back to Fig. 2'], text: 'On this curve the radius changes all the way: it falls from infinity to R at C.C.T. and rises again.',
          check: { q: 'On a curve transitional throughout, the steering wheel…', options: ['never rests', 'rests at C.C.T.', 'is not turned'], answer: 0, why: 'There is no length of constant radius, so the driver turns the wheel in, then straight back out.' } },
      ] : [
        { title: 'The jolt', show: ['No transition', 'With transition'], text: 'The car enters a plain circle at T.P. Watch the meter and the car: the sideways push arrives all at once.',
          check: { q: 'What does a sudden curve do to driver and passengers (cl. 7.1.1)?', options: ['a shock and a sway', 'nothing at all', 'it slows the car'], answer: 0, why: 'Entering a curve of finite radius from the straight, they are suddenly subjected to an outward centrifugal force: a shock and sway (cl. 7.1.1).' } },
        { title: 'The ramp', show: ['No transition', 'With transition'], text: 'Press "With transition". The push now builds up along the spiral, at a rate C the driver can follow.',
          check: { q: 'Along a transition, the radius…', options: ['falls gradually from infinity to R', 'stays R throughout', 'grows towards the end'], answer: 0, why: 'The radius of curvature should decrease gradually from infinity to the minimum, so the steering wheel can be turned gradually (cl. 7.2.1).' } },
        { title: 'The shift', show: ['No transition', 'With transition', 'Longer', 'Shorter'], text: 'Drag the C.T. peg along the curve. The dashed line is the circle before; the magnifier shows it moving in by the shift.',
          check: { q: 'Ls doubles. What happens to the shift S ≈ Ls²/24R?', options: ['it doubles', 'four times', 'it halves'], answer: 1, why: 'S grows with the square of Ls: twice the length, about four times the shift.' } },
      ];
      const guide = makeGuide(ctx, { anchor: [-5.4, 2.2, 10.5], w: 10, h: 5, steps });
      guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
      place();
      return api;
    },
  };
}

export default transitionSpread('fig2');
