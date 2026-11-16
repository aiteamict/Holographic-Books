// node books/_irc24/steel.check.mjs — fails loudly if the numbers drift from IRC : 24-2010.
import assert from 'node:assert/strict';
import { E, G, MU, eps, GAMMA, classify, classOf, LIMITS, thermal, minThickness, minDepth, minSpacing, overturning, DEFL } from './steel.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: got ${a}, want ${b} ± ${tol}`);

// cl. 502.2.2.1: the printed G agrees with E / 2(1 + μ) to the two figures printed
near(E / (2 * (1 + MU)), G, .005e5, 'G = E / 2(1 + μ)');

// Table 2 note 2
near(eps(250), 1, 1e-9, 'ε at fy 250'); near(eps(350), .8452, 1e-4, 'ε at fy 350');

// Table 1
assert.equal(GAMMA.find(g => g[0] === 'welds')[4], 1.5); assert.equal(GAMMA.find(g => g[0] === 'yield')[3], 1.1);

// Table 2: class boundaries of a welded flange at fy 250 (8.4, 9.4, 13.6) and a web (84, 105, 126)
assert.deepEqual([8.4, 8.41, 9.4, 13.6, 13.7].map(r => classOf(r, LIMITS.welded, 250)), [1, 2, 2, 3, 4]);
assert.deepEqual([84, 105, 126, 127].map(r => classOf(r, LIMITS.web, 250)), [1, 2, 3, 4]);
{ const r = classify({ bf: 400, tf: 25, d: 1200, tw: 12, fy: 250, welded: true });
  near(r.rf, 7.76, .001, 'outstand ratio'); assert.equal(r.cf, 1); assert.equal(r.cw, 2); assert.equal(r.cls, 2); assert.equal(r.shearCheck, true); }
assert.equal(classify({ bf: 300, tf: 20, d: 600, tw: 12, fy: 250, welded: false }).shearCheck, false);   // d/t 50 < 67

// ΔL = α L ΔT: 60 m, 40 °C → 28.8 mm
near(thermal(60, 40), 28.8, 1e-9, 'thermal movement');

// cl. 504.7.1
assert.deepEqual([minThickness('both', 5), minThickness('both', 9), minThickness('oneSide', 6), minThickness('oneSide', 10), minThickness('oneSide', 12.5), minThickness('sealed', 4)], [8, 9, 10, 11.5, 12.5, 6]);

// cl. 504.3–504.5 on a 40 m span
near(minDepth(40, false), 1.6, 1e-9, 'girder depth'); near(minDepth(40, true), 4, 1e-9, 'truss depth'); near(minSpacing(40), 2, 1e-9, 'spacing');
near(40000 / DEFL.total, 66.67, .01, 'total deflection'); near(40000 / DEFL.live, 50, 1e-9, 'live deflection');

// cl. 503.5.1: 0.9 on the resisting permanent load
{ const r = overturning({ Gk: 60, W: 12, h: 2.5, s: 2, gf: 1.5 }); near(r.Mo, 45, 1e-9, 'Mo'); near(r.Mr, 54, 1e-9, 'Mr'); assert.equal(r.ok, true); }

console.log('IRC 24 steel checks pass');
