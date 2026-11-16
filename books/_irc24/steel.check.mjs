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

// ---- chapter 2 · cl. 506
{ const s = await import('./steel.js');
  near(s.Tdg(3200, 250), 727.27, .01, 'Tdg'); near(s.Tdn(2496, 410), 736.82, .01, 'Tdn');
  near(s.netArea(300, 16, 3, 22, [[40, 75], [40, 75]]), (300 - 66 + 2 * 1600 / 300) * 16, 1e-9, 'staggered net area');
  const a = s.angleRupture({ Anc: 730, Ago: 950, w: 100, t: 10, bs: 145, Lc: 120, fy: 250, fu: 410 });
  near(a.raw, 1.4 - .076 * 10 * (250 / 410) * (145 / 120), 1e-9, 'β'); near(a.beta, .84, .005, 'β value');
  assert.equal(s.angleRupture({ Anc: 730, Ago: 950, w: 100, t: 10, bs: 145, Lc: 50, fy: 250, fu: 410 }).beta, .7);   // the floor
  assert.deepEqual([1, 2, 3, 4, 6].map(s.alphaPrelim), [.6, .6, .7, .8, .8]);
  const b = s.blockShear({ Avg: 3200, Avn: 2100, Atg: 750, Atn: 530, fy: 250, fu: 410 });
  near(b.a, 576.3, .2, 'block shear, first'); near(b.b, 528.4, .2, 'block shear, second'); assert.equal(b.Tdb, b.b); }

// ---- chapter 3 · cl. 507. Table 6c (class c) as printed: fy 250 at KL/r 50, 100, 150; fy 300 at KL/r 80
{ const s = await import('./steel.js');
  near(s.buckling(50, 250, 'c').fcd, 183, .6, 'Table 6c'); near(s.buckling(100, 250, 'c').fcd, 107, .6, 'Table 6c'); near(s.buckling(150, 250, 'c').fcd, 59.2, .2, 'Table 6c'); near(s.buckling(80, 300, 'c').fcd, 149, .6, 'Table 6c');
  near(s.buckling(10, 250, 'c').fcd, 227, .6, 'Table 6c, capped at fy / γm0');
  assert.deepEqual(s.KEFF.map(k => k[1]), [2, 2, 1, 1.2, .8, .65]);
  near(s.slabBase(6, 125, 100, 250), Math.sqrt(2.5 * 6 * (15625 - 3000) * 1.1 / 250), 1e-9, 'slab base');
  const a = s.angleStrut({ l: 2000, rvv: 19.4, b1: 100, b2: 100, t: 10, fy: 250, bolts: 2, fix: 'F' });
  near(a.lvv, 2000 / 19.4 / Math.sqrt(Math.PI ** 2 * 2e5 / 250), 1e-9, 'λvv'); near(a.le, Math.sqrt(.2 + .35 * a.lvv ** 2 + 20 * a.lphi ** 2), 1e-9, 'λe'); }

// ---- chapter 4 · cl. 508
{ const s = await import('./steel.js');
  const u = s.uFrame({ I: 2e8, a: 5000, d1: 5000, d2: 5500, b: 3500, I1: 1e8, I2: 2e9 });
  near(u.delta, 1.25e11 / 6e13 + 3.025e7 * 3500 / 4e14, 1e-12, 'δ'); near(u.KL, 2.5 * (2e5 * 2e8 * 5000 * u.delta) ** .25, 1e-6, 'KL');
  assert.equal(s.uFrame({ I: 2e8, a: 5000, d1: 5000, d2: 5500, b: 3500, I1: 1e13, I2: 1e14 }).KL, 5000);   // a stiff frame: KL = a
  near(s.uFrameForce(u.KL, u.delta, 120, 100).fcc, Math.PI ** 2 * 2e5 / (u.KL / 120) ** 2, 1e-9, 'fcc');
  assert.deepEqual([s.TABLE9.chord[0][0], s.TABLE9.single[0][0], s.TABLE9.single[2][0], s.TABLE9.multi[1][0]], [.85, .7, 1, .7]); }
