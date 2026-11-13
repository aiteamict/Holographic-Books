// Spread 8 · Worked examples 11.19, 11.26–11.28: an odd-length spiral and three old curves given transitions.
// Computed values come from the exact spiral; the book reads rounded Table 12 values, hence the tolerances.
import { curveExamples } from '../../_irc38/examples.js';
import { horizontalCurve as hc, spiralXY, deg } from '../../_irc38/curve.js';

const bis = (f, a, b) => { for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; } return (a + b) / 2; };
const L26 = bis(L => hc(56, 199, L).S - 1, 10, 200);   // exact Ls for a 1 m shift on 199 m

export default curveExamples({
  examples: [
    {
      id: '11.19', title: 'Setting out a transition of odd length',
      given: 'Ls = 58.468 m, Rc = 125 m (Δ not given: the model uses 56°)',
      curve: [56, 125, 58.468],
      steps: [
        { text: 'θs = 58.468 × 28.65 / 125 = 13.4°. To chord point i, θ = 13.4 × (i/10)².', focus: 'tp' },
        { text: 'X and Y for each point: the Table 12 coefficients at that θ, times the length to the point. Point 9: θ = 10.854°, X = 0.9964 × 52.621 = 52.434 m, Y = 0.06321 × 52.621 = 3.326 m.' },
        { text: 'Point 8 is printed with Y coefficient 0.0469 and Y = 2.1963 m; the sequence 0.0382, 0.0469, 0.0632 shows the slip: about 0.0499.' },
        { text: 'At C.T.: Xc = 0.9945 × 58.468 = 58.146 m, Yc = 0.0777 × 58.468 = 4.543 m (Table 11.5).', focus: 'ct' },
      ],
      answers: [
        { label: 'Spiral angle θs', book: 13.4, value: k => deg(k.thetaS), unit: '°', digits: 1, tol: .02 },
        { label: 'Xc at C.T.', book: 58.146, value: k => k.Xc, unit: 'm', digits: 3, tol: .005 },
        { label: 'Yc at C.T.', book: 4.543, value: k => k.Yc, unit: 'm', digits: 3, tol: .005 },
        { label: 'Y at point 8', book: 2.1963, value: () => spiralXY(.8 * 58.468, 58.468, 125).y, unit: 'm', digits: 3, tol: .02, note: 'Table 11.5 point 8: coefficient 0.0469 for about 0.0499.' },
      ],
    },
    {
      id: '11.26', title: 'Transition added with the centre kept',
      given: 'Old curve R 200 m on an ODR in plain country (65 km/h), Δ 56°; keep the centre',
      curve: [56, 199, 69.444],
      steps: [
        { text: 'Table 9: Ls at least 60 m on 200 m; Table 11 gives a shift of 0.749 m, so Rc 199.251 m; recomputed, s = 0.753 m: not quite consistent.' },
        { text: 'So assume s = 1 m and Rc = 199 m, the centre kept: s / Rc = 0.00502, Table 12 gives θs = 9.9°.', focus: 'tp' },
        { text: 'Unit shift at 9.9° = 0.0144, so Ls = 1 / 0.0144 = 69.444 m. The circle turns through 56 − 2 × 9.9 = 36.2°.', focus: 'ct' },
      ],
      answers: [
        { label: 'Ls for a 1 m shift', book: 69.444, value: () => L26, unit: 'm', digits: 3, tol: .35 },
        { label: 'Spiral angle θs', book: 9.9, value: () => deg(L26 / 398), unit: '°', digits: 2, tol: .1 },
        { label: 'Shift with Ls 69.444 m', book: 1, value: k => k.S, unit: 'm', digits: 3, tol: .015 },
        { label: 'Circular arc, Δ − 2θs', book: 36.2, value: () => 56 - 2 * deg(L26 / 398), unit: '°', digits: 2, tol: .15 },
      ],
    },
    {
      id: '11.27', title: 'Transition added without altering the radius',
      given: 'Old curve R 165 m on an ODR, Δ 56°; keep the radius (Table 9: Ls at least 75 m; 90 m adopted)',
      curve: [56, 165, 90],
      steps: [
        { text: 'θs = 90 × 28.65 / 165 = 15.627°; unit shift 0.02265, so s = 2.039 m.', focus: 'tp' },
        { text: 'Ts = (165 + 2.039) tan 28° + 44.892 = 133.708 m; Es = (165 + 2.039) sec 28° − 165 = 24.183 m.', focus: 'pi' },
        { text: 'The centre moves out by s / cos 28° = 2.309 m; the arc left is 56 − 2 × 15.627 = 24.746° (Fig. 41 prints 27.746°).', focus: 'ct' },
      ],
      answers: [
        { label: 'Spiral angle θs', book: 15.627, value: k => deg(k.thetaS), unit: '°', digits: 3, tol: .002 },
        { label: 'Shift s', book: 2.039, value: k => k.S, unit: 'm', digits: 3, tol: .002 },
        { label: 'Tangent distance Ts', book: 133.708, value: k => k.Ts, unit: 'm', digits: 3, tol: .005 },
        { label: 'Apex distance Es', book: 24.183, value: k => k.Es, unit: 'm', digits: 3, tol: .004 },
      ],
    },
    {
      id: '11.28', title: 'Sharper end curves keep the old 400 m curve',
      given: 'Old curve R 400 m on an NH, Δ 56°; 375 m curves with 122 m transitions at the ends (the model shows one end curve)',
      curve: [56, 375, 122],
      steps: [
        { text: 'First try 350 m with 130 m (Table 9): θs 10.64°, s 2.0124 m; cos Δ2 = 47.9875 / 50, Δ2 = 16.31°: only 23.38° of the old curve is left.' },
        { text: 'Try Rc 375 m, Ls 122 m: θs = 122 × 28.65 / 375 = 9.32°, s = 0.01354 × 122 = 1.652 m.', focus: 'tp' },
        { text: '400 = 375 + 1.652 + 25 cos Δ2: cos Δ2 = 23.348 / 25 = 0.93392, Δ2 = 20.945°. (The book adds a spurious “+ 3.93” and writes 23.395.)' },
        { text: 'Table 12 × 122: Xc 121.68 m, Yc 6.603 m, LT 81.447 m, ST 40.773 m, LC 121.854 m, K 60.951 m.', focus: 'ct' },
      ],
      answers: [
        { label: 'cos Δ2', book: .93392, value: k => (25 - k.S) / 25, unit: '', digits: 5, tol: .0001 },
        { label: 'Δ2', book: 20.945, value: k => deg(Math.acos((25 - k.S) / 25)), unit: '°', digits: 3, tol: .005 },
        { label: 'Shift s', book: 1.652, value: k => k.S, unit: 'm', digits: 3, tol: .002 },
        { label: 'Xc at C.T.', book: 121.68, value: k => k.Xc, unit: 'm', digits: 2, tol: .01 },
      ],
    },
  ],
});
