// Spread 3 · The circular curve (def. 1–4, 9–11). Drag the second straight to open or close Δ; drag the curve toward or
// away from the apex to change R. Ts, Es, the curve length and the intersection angle follow live.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { horizontalCurve } from '../../_irc38/curve.js';
import { makePlan } from '../../_irc38/plan.js';

const F = 'Inter, Segoe UI, Arial', S = .085, ORIGIN = [0, .15, -7];   // ranges below keep Ts within the page
const DMIN = 20, DMAX = 90, RMIN = 40, RMAX = 150, RAD = Math.PI / 180;

export default {
  cam: { pos: [3, 36, 34], look: [3, 1, -1], portrait: { pos: [15, 60, 52], look: [12.3, 0, -1] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { delta: 56, R: 120 };
    const plan = makePlan({ s: S, origin: ORIGIN, ext: 30 }); group.add(plan.group);

    // handles: one on the second straight (swings Δ), one on the curve's mid point (pulls R)
    const hDelta = holo.handle('delta', { label: 'Δ · drag', kind: 'lever' }), hR = holo.handle('radius', { label: 'R · drag', kind: 'lever' });
    group.add(hDelta, hR);

    const curve = () => horizontalCurve(st.delta, st.R, 0);
    const readout = textPlane({ w: 9.4, h: 6.2, px: 46, draw: (c, W, H) => {
      const k = curve();
      cardBg(c, W, H); c.textAlign = 'left';
      c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText('SIMPLE CIRCULAR CURVE', 20, 30);
      const rows = [['Deviation Δ', `${st.delta.toFixed(0)}°`], ['Intersection angle 180° − Δ', `${(180 - st.delta).toFixed(0)}°`], ['Radius R', `${st.R.toFixed(0)} m`],
        ['Tangent distance Ts = R tan Δ/2', `${k.Ts.toFixed(2)} m`], ['Apex distance Es = R (sec Δ/2 − 1)', `${k.Es.toFixed(2)} m`], ['Curve length R·Δ', `${k.Lc.toFixed(2)} m`]];
      rows.forEach(([a, b], i) => {
        const y = 66 + i * 38; c.fillStyle = '#5c6168'; c.font = `500 17px ${F}`; c.fillText(a, 20, y);
        c.fillStyle = i >= 3 ? '#8a3f1c' : '#14202b'; c.font = `700 19px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 20, y); c.textAlign = 'left';
      });
    } });
    readout.position.set(5.2, 2.6, 10.6); readout.rotation.x = -.6; group.add(readout);

    function place() {
      const k = curve(); plan.set(k);
      const L = plan.L, u2 = [L.u1[0], -L.u1[1]], d = k.Ts + 14;
      hDelta.position.copy(plan.P([u2[0] * d, u2[1] * d], .05));
      hR.position.copy(plan.P(L.mid, .05));
      readout.redraw();
    }
    const setTo = (delta, R, dur = .7) => {
      const d0 = st.delta, r0 = st.R; anims.stop('to');
      anims.add({ dur, tag: 'to', update: e => { st.delta = d0 + (delta - d0) * e; st.R = r0 + (R - r0) * e; place(); } });
    };

    let grip = null;
    const planXY = p => [(p.x - ORIGIN[0]) / S, -(p.z - ORIGIN[2]) / S];
    const api = {
      group, dragPlane: 'xz', targets: [hDelta, hR],
      actions: [
        { label: 'Gentle curve', run: () => setTo(30, 150) },
        { label: 'Sharp curve', run: () => setTo(90, 50) },
        { label: 'Back to 56°', run: () => setTo(56, 120) },
      ],
      press(hit) { grip = tagged(hit.object, 'handle')?.userData.handle || null; anims.stop('to'); },
      drag({ point }) {
        if (!grip) return;
        const [x, y] = planXY(point);
        if (grip === 'delta') { if (x > 1) st.delta = THREE.MathUtils.clamp(-2 * Math.atan2(y, x) / RAD, DMIN, DMAX); }
        else { const es = THREE.MathUtils.clamp(-y, 2, 400); st.R = THREE.MathUtils.clamp(es / (1 / Math.cos(st.delta / 2 * RAD) - 1), RMIN, RMAX); }
        place(); const k = curve();
        guide.say(grip === 'delta' ? `Δ ${st.delta.toFixed(0)}°: the straights meet at ${(180 - st.delta).toFixed(0)}°, and Ts is ${k.Ts.toFixed(1)} m.` : `R ${st.R.toFixed(0)} m: Ts ${k.Ts.toFixed(1)} m, Es ${k.Es.toFixed(1)} m.`);
      },
      release() { grip = null; },
      tap(hit) { guide.tap(hit); },
      a11y: [{ label: 'Gentle curve, Δ 30°, R 150 m', run: () => setTo(30, 150) }, { label: 'Sharp curve, Δ 90°, R 50 m', run: () => setTo(90, 50) }, { label: 'Back to Δ 56°, R 120 m', run: () => setTo(56, 120) }],
      update(dt) {
        anims.tick(dt);
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        readout.position.x = tall ? 3.6 : 5.2; readout.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.delta = 56; st.R = 120; place(); guide.reset(); },
      get debug() { const k = curve(); return { delta: st.delta, R: st.R, Ts: +k.Ts.toFixed(3), Es: +k.Es.toFixed(3), Lc: +k.Lc.toFixed(3), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'The parts', show: [], text: 'The straights meet at the apex P.I. The curve leaves the first straight at T.P. and joins the second at P.T., turning through Δ about the centre O.',
          check: { q: 'Where does the straight end and curvature begin (def. 10)?', options: ['P.I.', 'T.P.', 'O'], answer: 1, why: 'At the tangent point, T.P. The apex P.I. is where the straights produced would meet; the curve never touches it.' } },
        { title: 'Turn Δ', show: ['Gentle curve', 'Sharp curve'], text: 'Drag the handle on the second straight to open or close the deviation angle Δ. Watch Ts.',
          check: { q: 'Δ is 60°. What is the intersection angle between the straights (def. 4)?', options: ['60°', '120°', '90°'], answer: 1, why: '180° − Δ = 120°. The intersection angle is the supplement of the deviation angle.' } },
        { title: 'Change R', show: ['Gentle curve', 'Sharp curve', 'Back to 56°'], text: 'Drag the curve toward or away from the apex. The radius follows; Ts and Es change with it.',
          check: { q: 'Same Δ, larger radius. What happens to the tangent distance Ts?', options: ['it shrinks', 'it grows', 'it stays'], answer: 1, why: 'Ts = R tan Δ/2 grows in step with R: a flatter curve starts farther from the apex.' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    place();
    return api;
  },
};
