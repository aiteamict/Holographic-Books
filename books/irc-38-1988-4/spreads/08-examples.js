// Spread 8 · Worked examples 11.29, 11.30, 11.32: widening built into a curve and the edges of a widened pavement.
// Values the book prints, beside the series geometry (curve.js) and Tables 4 and 7.
import { curveExamples } from '../../_irc38/examples.js';
import { horizontalCurve, deg } from '../../_irc38/curve.js';
import { widenTable, eRequired } from '../../_irc38/tables.js';

const RAD = Math.PI / 180;
const inner = () => horizontalCurve(56, 150.3, 102.8325), outer = () => horizontalCurve(56, 158.5, 80.776);

export default curveExamples({
  examples: [
    {
      id: '11.29', title: 'Widening proportional to the distance from the start of the curve',
      given: 'Thin bituminous surface, 7 m on the straight, Rc 175 m, Ls 30 m, 40 km/h (Δ not given: the model uses 40°)',
      curve: [40, 175, 30],
      steps: [
        { text: 'Widening from Table 7 for 175 m: 0.6 m, applied in proportion to the distance from T.P.: 0.1 m every 5 m to C.T.', focus: 'tp' },
        { text: 'Case (i) shares it equally, 3.5 to 3.8 m each half; case (ii) puts it all inside, the inner half 3.5 to 4.1 m.', focus: 'ct' },
        { text: 'Superelevation for 175 m at 40 km/h (Table 4): 0.042. The outer edge reaches crown level at T.P., one plane 6 m past it.' },
        { text: 'At C.T., rotating about the centre line (crown 100.00): outer edge 100 + 0.042 × 3.5, inner edge 100 − 0.042 × 4.1.' },
      ],
      answers: [
        { label: 'Widening (Table 7)', book: .6, value: () => widenTable(175, 2), unit: 'm', digits: 1 },
        { label: 'Superelevation (Table 4)', book: .042, value: () => eRequired(40, 175), unit: '', digits: 3, tol: .002 },
        { label: 'Outer edge level at C.T.', book: 100.147, value: () => 100 + .042 * 3.5, unit: 'm', digits: 3 },
        { label: 'Inner edge level at C.T.', book: 99.828, value: () => 100 - .042 * 4.1, unit: 'm', digits: 3 },
      ],
    },
    {
      id: '11.30', title: 'Edges with the same radius and transition as the centre line',
      given: 'Centre line Rc 155 m, Ls 80 m, Δ 56°, 50 km/h, 7 m on the straight; both edges use Rc 155 m and Ls 80 m',
      curve: [56, 155, 80],
      steps: [
        { text: 'Same Rc, Ls and Δ give the same Ts and Es for each edge (Table 10): 123.239 m and 22.492 m.', focus: 'pi' },
        { text: 'The edges’ apexes are 7 sec 28° apart, so the width at the middle is 7 × 1.1326 = 7.928 m.' },
        { text: 'The edges’ tangent points sit 3.5 tan 28° = 1.86 m from the centre line’s; θs = 28.65 × 80 / 155 = 14.787°.', focus: 'tp' },
      ],
      answers: [
        { label: 'Tangent distance Ts', book: 123.239, value: k => k.Ts, unit: 'm', digits: 3 },
        { label: 'Apex distance Es', book: 22.492, value: k => k.Es, unit: 'm', digits: 3 },
        { label: 'Width at the middle', book: 7.928, value: () => 7 / Math.cos(28 * RAD), unit: 'm', digits: 3 },
        { label: 'Spiral angle θs', book: 14.787, value: k => deg(k.thetaS), unit: '°', digits: 3 },
      ],
    },
    {
      id: '11.32', title: 'Concentric layout for the edges of the pavement',
      given: 'Centre line Rc 155 m, Ls 80 m, Δ 56°, 7 m wide, 1.2 m widening on the inside',
      curve: [56, 155, 80],
      steps: [
        { text: 'Inner edge: R = 155 − 3.5 − 1.2 = 150.3 m; its shift is 1.716 + 1.2 = 2.916 m, so θs = 19.6° and Ls = 102.8325 m (Table 12).', focus: 'tp' },
        { text: 'Inner Ts = (150.3 + 2.916) tan 28° + 51.22 = 132.685 m; the inner curve starts 11.307 m ahead.' },
        { text: 'Outer edge: R = 158.5 m with the centre line’s shift 1.716 m: θs = 14.6°, Ls = 80.776 m, Ts = 125.486 m.', focus: 'pi' },
        { text: 'Table 11.12 sets the three curves side by side with their apex distances.' },
      ],
      answers: [
        { label: 'Inner edge Ts', book: 132.685, value: () => inner().Ts, unit: 'm', digits: 3, tol: .003 },
        { label: 'Inner edge Es', book: 23.23, value: () => inner().Es, unit: 'm', digits: 2, tol: .02 },
        { label: 'Outer edge Ts', book: 125.486, value: () => outer().Ts, unit: 'm', digits: 3, tol: .003 },
        { label: 'Outer edge Es', book: 23.96, value: () => outer().Es, unit: 'm', digits: 2, tol: .02, note: 'Table 11.12 prints 23.96; (158.5 + 1.716) sec 28° − 158.5 = 22.956 m.' },
      ],
    },
  ],
});
