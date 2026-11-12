// Spread 8 · Worked examples for chapter 1 (Section 11): curves designed from Table 10, checked against the geometry.
import { curveExamples } from '../../_irc38/examples.js';
import { deg } from '../../_irc38/curve.js';

export default curveExamples({
  examples: [
    {
      id: '11.2', title: 'Transition curve for a National Highway',
      given: 'National Highway, plain country, Δ = 56°, no restrictions in the field',
      curve: [56, 400, 140],
      steps: [
        { text: 'Design speed for an NH in plain country: 100 km/h (Table 2). Minimum desirable radius 360 m (Table 3): choose Rc = 400 m.', focus: 'pi' },
        { text: 'Minimum transition 115 m (Table 9): choose Ls = 140 m.', focus: 'tp' },
        { text: 'θs = Ls / 2Rc = 140 / 800 = 0.175 rad = 10.02673° (10° 1′ 36″).', focus: 'ct' },
        { text: 'Table 12, interpolated: shift = 0.01455 × 140 = 2.04 m; K = 0.4995 × 140 = 69.93 m.', focus: 'tp' },
        { text: 'Ts = (Rc + s) tan Δ/2 + K = 402.04 × 0.5317 + 69.93 = 283.695 m. Es = 402.04 sec 28° − 400 = 55.350 m.', focus: 'pi' },
        { text: 'Table 12: L.T. = 0.66773 × 140, S.T. = 0.3343 × 140, long chord = 0.99863 × 140.', focus: 'lt' },
      ],
      answers: [
        { label: 'θs', book: 10.02673, value: k => deg(k.thetaS), unit: '°', digits: 3, tol: .001 },
        { label: 'Shift s', book: 2.04, value: k => k.S, unit: 'm', digits: 2, tol: .01 },
        { label: 'K', book: 69.93, value: k => k.K, unit: 'm', digits: 2, tol: .01 },
        { label: 'Tangent distance Ts', book: 283.695, value: k => k.Ts, unit: 'm', digits: 3, tol: .005 },
        { label: 'Apex distance Es', book: 55.350, value: k => k.Es, unit: 'm', digits: 3, tol: .015 },
        { label: 'Long tangent L.T.', book: 95.48, value: k => k.LT, unit: 'm', digits: 2, tol: .02, note: 'Book prints L.T. 95.48; its own 0.66773 × 140 is 93.48: a misprint.' },
        { label: 'Short tangent S.T.', book: 46.802, value: k => k.ST, unit: 'm', digits: 3, tol: .005 },
      ],
    },
    {
      id: '11.3', title: 'Curve where the apex distance controls the design',
      given: 'design speed 40 km/h, plain country, Δ = 56°; high rocky ground and buildings hold Es between 20 m and 23.5 m (Fig. 27)',
      curve: [56, 170, 55],
      steps: [
        { text: 'Table 10 (Appendix 3) for Δ = 56° lists the radius and transition pairs whose Es lies between 20 and 23.5 m (Table 11.1).', focus: 'pi' },
        { text: '"It is better to have the largest possible radius": Rc = 170 m with Ls = 55 m. Ts = 118.260 m, Es = 23.376 m.', focus: 'tp' },
        { text: 'θs = Ls × 28.65 / Rc = 55 × 28.65 / 170 = 9.269° (9° 16′ 8.8″).', focus: 'ct' },
        { text: 'From Table 12: shift = 0.013461 × 55 = 0.74079 m; L.T. = 0.6676 × 55 = 36.718 m; S.T. = 0.3342 × 55 = 18.381 m.', focus: 'lt' },
      ],
      answers: [
        { label: 'Tangent distance Ts', book: 118.260, value: k => k.Ts, unit: 'm', digits: 3 },
        { label: 'Apex distance Es', book: 23.376, value: k => k.Es, unit: 'm', digits: 3 },
        { label: 'θs', book: 9.269, value: k => deg(k.thetaS), unit: '°', digits: 3, tol: .002 },
        { label: 'Shift', book: .74079, value: k => k.S, unit: 'm', digits: 3, tol: .002 },
        { label: 'Long tangent L.T.', book: 36.718, value: k => k.LT, unit: 'm', digits: 3, tol: .01 },
        { label: 'Short tangent S.T.', book: 18.381, value: k => k.ST, unit: 'm', digits: 3, tol: .01 },
      ],
    },
    {
      id: '11.4', title: 'Apex distance controls and the deviation angle is not a full degree',
      given: 'as Example 11.3, but Δ = 55° 42′',
      curve: [55 + 42 / 60, 170, 55],
      steps: [
        { text: 'Rc = 170 m and Ls = 55 m still satisfy the requirement (Es values for 55° and 56°).', focus: 'pi' },
        { text: 'Table 10: Δ = 55° gives Ts 116.358, Es 22.490; Δ = 56° gives Ts 118.260, Es 23.376.', focus: 'tp' },
        { text: 'Difference for one degree: 1.902 and 0.886. For 42 minutes: 1.3314 and 0.620.' },
        { text: 'Ts and Es for Δ = 55° 42′: 116.358 + 1.331 and 22.490 + 0.620.', focus: 'tp' },
      ],
      answers: [
        { label: 'Tangent distance Ts', book: 107.689, value: k => k.Ts, unit: 'm', digits: 3, tol: .01, note: 'Book prints 107.689; its own sum 116.358 + 1.3314 is 117.689: a misprint.' },
        { label: 'Apex distance Es', book: 23.11, value: k => k.Es, unit: 'm', digits: 2, tol: .01 },
      ],
    },
    {
      id: '11.5', title: 'Curve where the apex distance is equal to a given value',
      given: 'as Example 11.3, with Es exactly 21.75 m',
      curve: [56, 155, 62.87],
      steps: [
        { text: 'Inspect the Es values of Table 10 for Δ = 56°.', focus: 'pi' },
        { text: 'Solutions: radius 155 m with a transition between 60 m and 65 m, or radius 155–170 m with a transition of 40–60 m.' },
        { text: 'R 170 m needs at least Ls 40 m, which already gives Es 22.981 m: too much. So the solutions lie below 170 m.' },
        { text: 'Shown: R 155 m with Ls 62.87 m, which gives Es = 21.75 m exactly, between the 60 m and 65 m the book names.', focus: 'tp' },
      ],
      answers: [
        { label: 'Es at R 155 m, Ls 62.87 m', book: 21.75, value: k => k.Es, unit: 'm', digits: 2, tol: .01 },
      ],
    },
  ],
});
