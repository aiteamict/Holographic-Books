// node books/_irc38/curve.check.mjs — fails loudly if the curve geometry drifts from IRC 38's printed tables.
import assert from 'node:assert/strict';
import { horizontalCurve, layout } from './curve.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: got ${a.toFixed(4)}, want ${b} ± ${tol}`);

// Table 10 (Appendix 3), Δ = 6°, Rc = 2500 m, Ls = 15 m: Ts = 138.520 (printed)
near(horizontalCurve(6, 2500, 15).Ts, 138.520, .002, 'Table 10 Ts Δ6 R2500 Ls15');

// Example 11.2: Δ 56°, Rc 400, Ls 140 → Ts 283.695, Es 55.350, LT 95.48, ST 46.802, LC 139.81
{ const c = horizontalCurve(56, 400, 140);
  near(c.Ts, 283.695, .02, 'Ex 11.2 Ts'); near(c.Es, 55.350, .02, 'Ex 11.2 Es');
  // LT: the book prints 95.48, but its own working is 0.66773 × 140 = 93.48, a misprint
  near(c.LT, 93.48, .02, 'Ex 11.2 LT'); near(c.ST, 46.802, .02, 'Ex 11.2 ST'); near(c.LC, 139.81, .02, 'Ex 11.2 LC'); }
// Example 11.3 (apex between 20 and 23.5 m): Δ 56°, Rc 170, Ls 55 → Ts 118.260, Es 23.376, θs 9.269°, shift 0.74079,
// LT 36.718, ST 18.381; Example 11.4: Δ 55° → Ts 116.358, Es 22.490
{ const c = horizontalCurve(56, 170, 55);
  near(c.Ts, 118.260, .005, 'Ex 11.3 Ts'); near(c.Es, 23.376, .005, 'Ex 11.3 Es'); near(c.thetaS * 180 / Math.PI, 9.269, .001, 'Ex 11.3 θs');
  near(c.S, .74079, .002, 'Ex 11.3 shift'); near(c.LT, 36.718, .01, 'Ex 11.3 LT'); near(c.ST, 18.381, .01, 'Ex 11.3 ST');
  const d = horizontalCurve(55, 170, 55); near(d.Ts, 116.358, .005, 'Ex 11.4 Ts'); near(d.Es, 22.490, .005, 'Ex 11.4 Es'); }

// shift S ≈ Ls²/24R for flat spirals (cl. 7.5)
near(horizontalCurve(30, 300, 60).S, 60 * 60 / (24 * 300), .01, 'shift ≈ Ls²/24R');

for (const [D, R, Ls] of [[30, 300, 60], [60, 120, 45], [10, 500, 0], [20, 80, 80]]) {
  const c = horizontalCurve(D, R, Ls), L = layout(c, .5), end = L.pts.at(-1), mid = L.pts[Math.floor(L.pts.length / 2)];
  near(Math.hypot(end[0] - L.PT[0], end[1] - L.PT[1]), 0, .01, `ends at P.T. (${D}/${R}/${Ls})`);
  near(Math.hypot(L.pts[0][0] - L.TP[0], L.pts[0][1] - L.TP[1]), 0, 1e-9, `starts at T.P. (${D}/${R}/${Ls})`);
  near(Math.abs(mid[1]), c.Es, .02, `passes Es below P.I. (${D}/${R}/${Ls})`);
  if (!c.throughout) near(Math.hypot(L.CT[0] - L.O[0], L.CT[1] - L.O[1]), R, .01, `C.T. lies on the circle (${D}/${R}/${Ls})`);
}
assert.ok(horizontalCurve(20, 80, 80).throughout, '20° with two 80 m spirals at R 80 is transitional throughout');
console.log('curve.check: all passed');
