// Spreads 4 and 5 · Adding transitions (Fig. 2) and Transitional throughout (Fig. 3). One mechanic: drag the C.T. peg
// along the curve. Towards the middle the spirals lengthen, the circular arc shrinks (Δc = Δ − 2θs) and the circle moves
// inward by the shift S; at the middle the arc is gone and the two spirals meet at C.C.T.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { horizontalCurve, layout, deg } from '../../_irc38/curve.js';
import { makePlan } from '../../_irc38/plan.js';

const F = 'Inter, Segoe UI, Arial', S = .085, ORIGIN = [0, .15, -6.5], RAD = Math.PI / 180;

export function transitionSpread(mode) {
  const throughoutMode = mode === 'throughout';
  const D = throughoutMode ? 50 : 80, R = throughoutMode ? 90 : 50, LS0 = throughoutMode ? 30 : 0;
  return {
    cam: { pos: [3, 36, 34], look: [3, 1, -1], portrait: { pos: [15, 60, 52], look: [12.3, 0, -1] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const st = { Ls: LS0 };
      const plan = makePlan({ s: S, origin: ORIGIN, ext: 26, show: { delta: false } }); group.add(plan.group);
      // the circle before it was shifted: dashed ghost, so S can be seen
      const ghost = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.DIM, { width: .05, dashed: true, opacity: .9 }); group.add(ghost);
      const shiftLab = holo.label('S', { h: .8, color: '#2f8f55', weight: 700 }); group.add(shiftLab);
      const hCT = holo.handle('ct', { label: throughoutMode ? 'C.T. · drag to the middle' : 'C.T. · drag along the curve', kind: 'lever', r: .9 }); group.add(hCT);

      const curve = () => horizontalCurve(D, R, st.Ls);
      const readout = textPlane({ w: 9.4, h: 7, px: 46, draw: (c, W, H) => {
        const k = curve();
        cardBg(c, W, H); c.textAlign = 'left';
        c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText(k.throughout ? 'TRANSITIONAL THROUGHOUT · Fig. 3' : k.Ls ? 'CIRCULAR CURVE WITH TRANSITION · Fig. 2' : 'SIMPLE CIRCULAR CURVE', 20, 30);
        const rows = [[`Δ ${D}°, R ${R} m`, ''], ['Transition length Ls', `${k.Ls.toFixed(1)} m`], ['θs = Ls / 2R', `${deg(k.thetaS).toFixed(2)}°`],
          ['Circular part Δc = Δ − 2θs', `${deg(k.DeltaC).toFixed(2)}°`], ['Shift S ≈ Ls² / 24R', `${k.S.toFixed(2)} m`], ['Tangent distance Ts', `${k.Ts.toFixed(2)} m`],
          ['Apex distance Es', `${k.Es.toFixed(2)} m`], ['Arc Lc · total length', `${k.Lc.toFixed(1)} · ${k.length.toFixed(1)} m`]];
        rows.forEach(([a, b], i) => {
          const y = 62 + i * 34; c.fillStyle = i ? '#5c6168' : '#14202b'; c.font = `${i ? 500 : 700} 16px ${F}`; c.fillText(a, 20, y);
          c.fillStyle = i === 3 && k.throughout ? '#c23b2f' : i >= 4 ? '#8a3f1c' : '#14202b'; c.font = `700 18px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 20, y); c.textAlign = 'left';
        });
      } });
      readout.position.set(5.2, 2.6, 10.6); readout.rotation.x = -.6; group.add(readout);

      function place() {
        const k = curve(); plan.set(k);
        const g = layout(horizontalCurve(D, R, 0), 1); holo.setPoints(ghost, g.pts.map(p => plan.P(p, .07)));
        ghost.visible = k.Ls > 0;
        shiftLab.position.copy(plan.P([0, -k.Es + k.S / 2], .8)).add(new THREE.Vector3(1.4, 0, 0)); shiftLab.visible = k.Ls > 0;
        const L = plan.L; hCT.position.copy(plan.P(k.throughout ? L.mid : k.Ls > 0 ? L.CT : L.TP, .05));
        readout.redraw();
      }
      const toLs = (ls, dur = .9) => { const a = st.Ls; anims.stop('ls'); anims.add({ dur, tag: 'ls', update: e => { st.Ls = a + (ls - a) * e; place(); } }); };
      const maxLs = () => R * D * RAD;   // the whole deviation in spirals: transitional throughout

      let grip = null;
      const planXY = p => [(p.x - ORIGIN[0]) / S, -(p.z - ORIGIN[2]) / S];
      const actions = throughoutMode
        ? [{ label: 'Use up the circle', run: () => toLs(maxLs(), 1.6) }, { label: 'Back to Fig. 2', run: () => toLs(30) }]
        : [{ label: 'Transitions on', run: () => toLs(40) }, { label: 'Transitions off', run: () => toLs(0) }, { label: 'Longer', run: () => toLs(Math.min(maxLs() * .8, st.Ls + 15)) }, { label: 'Shorter', run: () => toLs(Math.max(0, st.Ls - 15)) }];
      const api = {
        group, dragPlane: 'xz', targets: [hCT], actions,
        press(hit) { grip = tagged(hit.object, 'handle') ? {} : null; anims.stop('ls'); },
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
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          readout.position.x = tall ? 3.6 : 5.2; readout.scale.setScalar(tall ? .82 : 1);
        },
        reset() { anims.clear(); st.Ls = LS0; place(); guide.reset(); },
        get debug() { const k = curve(); return { Ls: +k.Ls.toFixed(2), thetaS: +deg(k.thetaS).toFixed(3), DeltaC: +deg(k.DeltaC).toFixed(3), S: +k.S.toFixed(3), Ts: +k.Ts.toFixed(3), throughout: k.throughout, guide: guide.debug }; },
      };
      const steps = throughoutMode ? [
        { title: 'Lengthen', show: ['Use up the circle', 'Back to Fig. 2'], text: 'Drag C.T. towards the middle of the curve. The spirals grow and the cyan circular arc between them shrinks.',
          check: { q: 'When does the circular arc disappear?', options: ['when 2θs = Δ', 'when Ls = R', 'never'], answer: 0, why: 'Δc = Δ − 2θs. When the two spirals turn through the whole deviation, nothing is left for the circle (def. 13).' } },
        { title: 'C.C.T.', show: ['Use up the circle', 'Back to Fig. 2'], text: 'The two spirals now meet at one point, C.C.T., the mid point of the curve transitional throughout.',
          check: { q: 'Δ is 50°. Through what angle does each spiral turn?', options: ['25°', '50°', '12.5°'], answer: 0, why: 'θs = Δ/2 = 25°: each spiral takes half of the deviation.' } },
        { title: 'The wheel', show: ['Use up the circle', 'Back to Fig. 2'], text: 'On this curve the radius changes all the way: it falls from infinity to R at C.C.T. and rises again.',
          check: { q: 'On a curve transitional throughout, the steering wheel…', options: ['never rests', 'rests at C.C.T.', 'is not turned'], answer: 0, why: 'There is no length of constant radius, so the driver turns the wheel in, then straight back out.' } },
      ] : [
        { title: 'The shift', show: ['Transitions on', 'Transitions off'], text: 'Switch the transitions on. The dashed line is the circle before; it moves inward by the shift S to make room.',
          check: { q: 'Why does the circular curve move inward (def. 7)?', options: ['to make room for the transition', 'to widen the road', 'to shorten the curve'], answer: 0, why: 'The shift displaces the circle from the straight so a transition can be introduced between them.' } },
        { title: 'Drag C.T.', show: ['Transitions on', 'Transitions off', 'Longer', 'Shorter'], text: 'Drag the C.T. peg along the curve. Ls, θs and the shift follow.',
          check: { q: 'Ls doubles. What happens to the shift S ≈ Ls²/24R?', options: ['it doubles', 'four times', 'it halves'], answer: 1, why: 'S grows with the square of Ls: twice the length, about four times the shift.' } },
        { title: 'What is left', show: ['Transitions on', 'Transitions off', 'Longer', 'Shorter'], text: 'Each spiral turns through θs, so the circle is left with Δc = Δ − 2θs (def. 40).',
          check: { q: 'Δ = 80° and θs = 15°. What is Δc?', options: ['65°', '50°', '95°'], answer: 1, why: '80° − 2 × 15° = 50° for the circular arc between C.T. and T.C.' } },
      ];
      const guide = makeGuide(ctx, { anchor: [-5.4, 2.2, 10.5], w: 10, h: 5, steps });
      guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
      place();
      return api;
    },
  };
}

export default transitionSpread('fig2');
