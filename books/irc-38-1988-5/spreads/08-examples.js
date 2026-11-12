// Spreads 8–9 · Worked examples 11.10–11.16 (curves with transitions designed from Tables 12 and 13). "Computed" values
// solve the exact spiral (curve.js) for whatever the site fixes: Es, the shift, Yc, ST or a point to pass through.
// The book reads rounded table values, so a few last digits differ; a gap beyond that is a misprint and is flagged.
import { curveExamples } from '../../_irc38/examples.js';
import { horizontalCurve as hc, spiralXY, deg } from '../../_irc38/curve.js';

const RAD = Math.PI / 180;
const bis = (f, a, b) => { for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; } return (a + b) / 2; };
const R28 = Ls => Ls / (2 * 28 * RAD);                                       // radius for θs = 28° (fully transitional, Δ 56°)
const ES100 = hc(56, R28(100), 100).Es;                                       // Table 13: Es for Ls = 100 m, Δ 56°
const L11 = 100 / ES100 * 21.75;
const L15 = bis(L => hc(56, 4 * L, L).Es - 21.75, 10, 100);                   // Es 21.75 m with Rc = 4 Ls
const L12 = bis(L => hc(30, 100, L).S - .25, 5, 60);                          // shift 0.25 m on Rc 100 m
const L13 = bis(L => spiralXY(L, L, 250).y - 3, 20, 150);                     // Yc 3 m on Rc 250 m
const L14 = bis(L => hc(40, 250, L).ST - 20, 20, 150);                        // ST 20 m on Rc 250 m
const L16 = bis(Ls => { const l = bis(q => spiralXY(q, Ls, 250).x - 80, 1, Ls); return spiralXY(l, Ls, 250).y - 2.5; }, 82, 400);   // through (80, 2.5)

export const design = curveExamples({
  examples: [
    {
      id: '11.10', title: 'A fully transitioned curve for a range of apex distance',
      given: 'Δ 56°, Es between 20 and 23.5 m (data of Example 11.3), transitional throughout',
      curve: [56, R28(120), 120],
      steps: [
        { text: 'Table 13: for Ls = 100 m and Δ 56°, Es = 18.137 m. Es varies with Ls for the same θs.', focus: 'pi' },
        { text: 'Ls = (100 / 18.137) × (20 to 23.5) = 110.27 to 129.57 m. Take Ls = 120 m.' },
        { text: 'Transitional throughout: θs = Δ/2 = 28°, so Rc = 120 × 28.65 / 28 = 122.79 m.', focus: 'tp' },
      ],
      answers: [
        { label: 'Es for Ls 100 m (Table 13)', book: 18.137, value: () => ES100, unit: 'm', digits: 3 },
        { label: 'Ls, lower end', book: 110.27, value: () => 2000 / ES100, unit: 'm', digits: 2 },
        { label: 'Ls, upper end', book: 129.57, value: () => 2350 / ES100, unit: 'm', digits: 2 },
        { label: 'Rc for Ls 120 m', book: 122.79, value: k => k.R, unit: 'm', digits: 2, tol: .02 },
      ],
    },
    {
      id: '11.11', title: 'A fully transitioned curve for a given apex distance',
      given: 'Δ 56°, Es = 21.75 m (data of Example 11.5), transitional throughout',
      curve: [56, R28(L11), L11],
      steps: [
        { text: 'θs = 28°. Ls = (100 / 18.137) × 21.75 = 119.92 m (Table 13).', focus: 'pi' },
        { text: 'Rc = 119.92 × 28.65 / 28 = 122.704 m.' },
        { text: 'Ts = (119.92 / 100) × 106.153 = 127.298 m. The book writes 199.92 here; it means 119.92.', focus: 'tp' },
      ],
      answers: [
        { label: 'Transition length Ls', book: 119.92, value: k => k.Ls, unit: 'm', digits: 2 },
        { label: 'Radius Rc', book: 122.704, value: k => k.R, unit: 'm', digits: 3, tol: .02 },
        { label: 'Tangent distance Ts', book: 127.298, value: k => k.Ts, unit: 'm', digits: 3, tol: .004 },
      ],
    },
    {
      id: '11.15', title: 'A curve with a given apex distance and R/L',
      given: 'Δ 56°, Es = 21.75 m, Rc = 4 Ls',
      curve: [56, 4 * L15, L15],
      steps: [
        { text: 'Table 12: unit R = 4.00 at θs = 7.1623°; unit s = 0.0104, unit K = 0.4997.' },
        { text: 'Es = Rc × 0.1326 + 1.1326 s: 21.75 = 4 Ls × 0.1326 + 1.1326 × 0.0104 Ls = 0.5422 Ls, so Ls = 40.114 m and Rc = 160.457 m.', focus: 'pi' },
        { text: 'Ts = (160.457 + 0.41718) × 0.5317 + 20.0449 = 105.582 m.', focus: 'tp' },
      ],
      answers: [
        { label: 'Transition length Ls', book: 40.114, value: k => k.Ls, unit: 'm', digits: 3, tol: .015 },
        { label: 'Radius Rc', book: 160.457, value: k => k.R, unit: 'm', digits: 3, tol: .05 },
        { label: 'Shift s', book: .417, value: k => k.S, unit: 'm', digits: 3, tol: .002 },
        { label: 'Tangent distance Ts', book: 105.582, value: k => k.Ts, unit: 'm', digits: 3, tol: .035 },
      ],
    },
  ],
});

export const table12 = curveExamples({
  examples: [
    {
      id: '11.12', title: 'A transition for a given radius and shift',
      given: 'Rc = 100 m, s = 0.25 m (Δ not given: the model uses 30°)',
      curve: [30, 100, 24.5],
      steps: [
        { text: 's / Rc = 0.0025: Table 12 gives θs = 7.0°.' },
        { text: 'Unit R at 7° = 4.0926, so Ls = 100 / 4.0926 = 24.434 m; or by the unit shift 0.0102, Ls = 0.25 / 0.0102 = 24.509 m. Rounded tables give the two.', focus: 'tp' },
        { text: 'With Ls = 24.5 m: LT = 0.6672 × 24.5 = 16.346 m, ST = 0.3338 × 24.5 = 8.178 m.', focus: 'lt' },
      ],
      answers: [
        { label: 'Spiral angle θs', book: 7.0, value: () => deg(L12 / 200), unit: '°', digits: 1, tol: .05 },
        { label: 'Ls from the shift', book: 24.509, value: () => L12, unit: 'm', digits: 3, tol: .01 },
        { label: 'Long tangent LT', book: 16.346, value: k => k.LT, unit: 'm', digits: 3 },
        { label: 'Short tangent ST', book: 8.178, value: k => k.ST, unit: 'm', digits: 3 },
      ],
    },
    {
      id: '11.13', title: 'A transition with given Yc and Rc',
      given: 'Yc = 3 m, Rc = 250 m (Δ not given: the model uses 40°)',
      curve: [40, 250, 67.195],
      steps: [
        { text: 'Yc / Rc = 0.012: Table 12 gives θ = 7.7°; unit R = 3.7205, so Ls = 250 / 3.7205 = 67.195 m.', focus: 'ct' },
        { text: 's = 0.0112 × 67.195 = 0.753 m.' },
        { text: 'LT = 0.6673 × 67.195, ST = 0.3339 × 67.195 = 22.44 m.', focus: 'lt' },
      ],
      answers: [
        { label: 'Ls for Yc 3 m', book: 67.195, value: () => L13, unit: 'm', digits: 3, tol: .08 },
        { label: 'Shift s', book: .753, value: k => k.S, unit: 'm', digits: 3, tol: .004 },
        { label: 'Long tangent LT', book: 49.84, value: k => k.LT, unit: 'm', digits: 2, tol: .05, note: 'Printed 49.84: 0.6673 × 67.195 = 44.84 m, a misprint.' },
        { label: 'Short tangent ST', book: 22.44, value: k => k.ST, unit: 'm', digits: 2, tol: .02 },
      ],
    },
    {
      id: '11.14', title: 'A transition with given radius and short tangent',
      given: 'Rc = 250 m, ST = 20 m (Δ not given: the model uses 40°)',
      curve: [40, 250, L14],
      steps: [
        { text: 'Rc / ST = 12.50. Table 12: R/ST is 12.621 at 6.8° and 12.438 at 6.9°; interpolating, θs = 6.866°.' },
        { text: 'Unit R at 6.866° = 4.1726, so Ls = 250 / 4.1726 = 59.914 m.', focus: 'tp' },
        { text: 'LT = 0.6672 × 59.914 = 39.975 m; ST = 0.3338 × 59.914 = 19.999 m.', focus: 'lt' },
      ],
      answers: [
        { label: 'Spiral angle θs', book: 6.866, value: k => deg(k.thetaS), unit: '°', digits: 3, tol: .002 },
        { label: 'Transition length Ls', book: 59.914, value: k => k.Ls, unit: 'm', digits: 3, tol: .01 },
        { label: 'Long tangent LT', book: 39.975, value: k => k.LT, unit: 'm', digits: 3, tol: .01 },
        { label: 'Short tangent ST', book: 19.999, value: k => k.ST, unit: 'm', digits: 3, tol: .01 },
      ],
    },
    {
      id: '11.16', title: 'A spiral through a given point',
      given: 'Rc = 250 m; the curve passes 2.5 m from the tangent at 80 m from its start (Δ not given: the model uses 50°)',
      curve: [50, 250, L16],
      steps: [
        { text: 'α = tan⁻¹ (2.5 / 80) = 1.7899°, so θ at the point = 3α = 5.3697°.', focus: 'tp' },
        { text: 'L at the point = 80 / 0.9991 = 80.072 m; unit R at 5.3697° = 5.3355, so R there = 427.226 m.' },
        { text: 'R L is constant: Ls × 250 = 80.072 × 427.226, Ls = 136.836 m; θs = 15.6815°.', focus: 'ct' },
        { text: 'Table 12: s = 0.02276 × 136.836 = 3.114 m; LT = 91.584 m; ST = 45.936 m.', focus: 'lt' },
      ],
      answers: [
        { label: 'Transition length Ls', book: 136.836, value: k => k.Ls, unit: 'm', digits: 3, tol: .035 },
        { label: 'Spiral angle θs', book: 15.6815, value: k => deg(k.thetaS), unit: '°', digits: 4, tol: .006 },
        { label: 'Shift s', book: 3.114, value: k => k.S, unit: 'm', digits: 3, tol: .004 },
        { label: 'Long tangent LT', book: 91.584, value: k => k.LT, unit: 'm', digits: 3, tol: .025 },
      ],
    },
  ],
});
