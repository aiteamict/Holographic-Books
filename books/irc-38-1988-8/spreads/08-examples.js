// Spread 8 · Worked examples 11.7–11.9: curves where the tangent distance governs, designed from Table 10. "Computed"
// values come from the exact geometry (curve.js); the book reads rounded table values, so last digits may differ.
import { curveExamples } from '../../_irc38/examples.js';
import { horizontalCurve as hc } from '../../_irc38/curve.js';

const DEG = 180 / Math.PI, T28 = Math.tan(28 / DEG);
const bis = (f, a, b) => { for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; } return (a + b) / 2; };
const R9 = bis(r => hc(56, r, 95).Ts - 350, 500, 600);              // Ts exactly 350 m with Ls 95 m

export default curveExamples({
  examples: [
    {
      id: '11.7', title: 'When the tangent distance controls the design',
      given: 'NH, plain, Δ 56°; a level crossing keeps Ts between 300 and 322 m (Fig. 28)',
      curve: [56, 500, 110],
      steps: [
        { text: 'NH in plain country: 100 km/h. Use the Table 10 values right of its zig-zag line.', focus: 'tp' },
        { text: 'Table 11.2 lists seven pairs for Δ 56°. Its Es for 400/120 and 500/120 should read 54.726 and 67.643.' },
        { text: 'The largest radius within 322 m: Rc 500 m, Ls 110 m. Ts 321.368 m, Es 67.427 m.', focus: 'pi' },
        { text: 'θs = 110 × 28.65 / 500 = 6°18′10.8″; L.T. 73.381 m, S.T. 36.707 m, s 1.012 m.', focus: 'lt' },
      ],
      answers: [
        { label: 'Tangent distance Ts', book: 321.368, value: k => k.Ts, unit: 'm', digits: 3 },
        { label: 'Apex distance Es', book: 67.427, value: k => k.Es, unit: 'm', digits: 3 },
        { label: 'Spiral angle θs', book: 6.3030, value: k => k.thetaS * DEG, unit: '°', digits: 4, tol: .001 },
        { label: 'Long tangent L.T.', book: 73.381, value: k => k.LT, unit: 'm', digits: 3, tol: .002 },
        { label: 'Short tangent S.T.', book: 36.707, value: k => k.ST, unit: 'm', digits: 3, tol: .003 },
        { label: 'Shift s', book: 1.012, value: k => k.S, unit: 'm', digits: 3, tol: .005 },
      ],
    },
    {
      id: '11.8', title: 'Tangent distance controls; Δ not a whole degree',
      given: 'Example 11.7 with Δ 55° 42′; Ts between 300 and 322 m',
      curve: [55.7, 500, 110],
      steps: [
        { text: 'Table 10, Rc 500 m, Ls 110 m: Ts 315.786 m at 55°, 321.368 m at 56°.' },
        { text: 'Difference for 60′: 5.582 m; for 42′: 3.907 m.' },
        { text: 'Ts = 315.786 + 3.907 = 319.693 m: within the limit. Interpolation is good to 5 mm here.', focus: 'tp' },
      ],
      answers: [
        { label: 'Ts at Δ 55°', book: 315.786, value: () => hc(55, 500, 110).Ts, unit: 'm', digits: 3 },
        { label: 'Ts at Δ 56°', book: 321.368, value: () => hc(56, 500, 110).Ts, unit: 'm', digits: 3 },
        { label: 'Ts at Δ 55° 42′', book: 319.693, value: k => k.Ts, unit: 'm', digits: 3, tol: .006 },
      ],
    },
    {
      id: '11.9', title: 'A curve for a tangent distance exactly equal to a given value',
      given: 'Example 11.7 with Ts = 350 m exactly',
      curve: [56, R9, 95],
      steps: [
        { text: 'Ts = (Rc + s) tan Δ/2 + K = 350 m. Table 9: an NH needs Ls of at least 95 m on 500 m; take 95 m.' },
        { text: 'Table 10: Ts(500, 95) = 313.740 m, Ts(600, 95) = 366.849 m; by inspection Rc is near 568 m.' },
        { text: 'Table 11.3: s tan 28° ≈ 0.35 and K = 47.49 hardly change with Rc. Its 0.3550 at 570 m should be 0.3507.' },
        { text: 'Rc tan 28° = 350 − 47.84 = 302.16, so Rc = 302.16 / 0.5317 = 568.29 m.', focus: 'tp' },
      ],
      answers: [
        { label: 'Ts for Rc 500, Ls 95', book: 313.740, value: () => hc(56, 500, 95).Ts, unit: 'm', digits: 3 },
        { label: 'Ts for Rc 600, Ls 95', book: 366.849, value: () => hc(56, 600, 95).Ts, unit: 'm', digits: 3 },
        { label: 's tan 28° at Rc 570 m', book: .3550, value: () => hc(56, 570, 95).S * T28, digits: 4, tol: .0005, note: 'Table 11.3 prints 0.3550 at 570 m; 0.660 × 0.5317 = 0.3509.' },
        { label: 'K', book: 47.4905, value: k => k.K, unit: 'm', digits: 3, tol: .003 },
        { label: 'Radius Rc', book: 568.29, value: k => k.R, unit: 'm', digits: 2, tol: .02 },
      ],
    },
  ],
});
