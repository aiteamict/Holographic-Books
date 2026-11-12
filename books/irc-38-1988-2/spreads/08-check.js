// Spread 8 · Design check (Examples 11.1, 11.2): class and terrain give the design speed (Table 2), the speed gives the
// minimum radius (Table 3, eq. 6), and the chosen radius is checked against it. Uses the series examples spread.
// Only values the book prints are in the answer table; the eq. (6) check is in the working.
import { curveExamples } from '../../_irc38/examples.js';
import { SPEEDS, MIN_RADIUS } from '../../_irc38/tables.js';

const V111 = SPEEDS[1][0][0], V112 = SPEEDS[0][0][0];   // MDR plain, NH plain: ruling speeds from Table 2

export default curveExamples({
  examples: [
    {
      id: '11.1', title: 'Radius check for a Major District Road (from the superelevation example)',
      given: 'MDR, very flat country, curve of radius 250 m (the statement prints 260 m; the working uses 250 m), transition 90 m',
      curve: [60 / 250 * 180 / Math.PI + 2 * (90 / 500) * 180 / Math.PI, 250, 90],
      steps: [
        { text: 'Ruling design speed for an MDR in flat country: 80 km/h (Table 2).', focus: 'pi' },
        { text: 'Minimum radius from Table 3 for 80 km/h, plain: 230 m. "250 m is OK."', focus: 'tp' },
        { text: 'Check with eq. (6): 0.0358 × 80² = 229 m. 250 m is larger, so the curve may be driven at 80 km/h.' },
      ],
      answers: [
        { label: 'Design speed (Table 2)', book: 80, value: () => V111, unit: 'km/h', digits: 0 },
        { label: 'Minimum radius (Table 3)', book: 230, value: () => MIN_RADIUS[V111][0], unit: 'm', digits: 0 },
        { label: 'Radius used', book: 250, value: k => k.R, unit: 'm', digits: 0 },
      ],
    },
    {
      id: '11.2', title: 'Radius for a National Highway transition curve',
      given: 'National Highway, plain country, Δ = 56°, no restrictions in the field',
      curve: [56, 400, 140],
      steps: [
        { text: 'Design speed for an NH in plain country: 100 km/h (Table 2).', focus: 'pi' },
        { text: 'Minimum desirable radius 360 m (Table 3). With no restrictions, a larger radius is chosen: Rc = 400 m.', focus: 'tp' },
        { text: 'eq. (6): 0.0358 × 100² = 358 m, so 400 m holds comfortably; cl. 4.4.4 asks for the largest radius possible.' },
      ],
      answers: [
        { label: 'Design speed (Table 2)', book: 100, value: () => V112, unit: 'km/h', digits: 0 },
        { label: 'Minimum radius (Table 3)', book: 360, value: () => MIN_RADIUS[V112][0], unit: 'm', digits: 0 },
        { label: 'Radius chosen', book: 400, value: k => k.R, unit: 'm', digits: 0 },
      ],
    },
  ],
});
