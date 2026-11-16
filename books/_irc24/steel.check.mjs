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

// ---- chapter 5 · cl. 509.1–509.3. Table 11 as printed: KL/r 100 with h/tf 20; 50 with 30; 200 with 50
{ const s = await import('./steel.js');
  near(s.fcrb(100, 20), 325.8, .15, 'Table 11'); near(s.fcrb(50, 30), 927.1, .3, 'Table 11'); near(s.fcrb(200, 50), 72.8, .1, 'Table 11');
  const b = s.iSection({ bf: 400, tf: 25, d: 1200, tw: 12 }); near(b.Zp, 400 * 25 * 1225 + 12 * 1200 * 1200 / 4, 1e-6, 'Zp'); near(b.ry, 88.07, .05, 'ry');
  const m = s.bendingStrength({ bf: 400, tf: 25, d: 1200, tw: 12 }, 2, 250); near(m.Md, 16.57e6 * 250 / 1.1 / 1e6, 1, 'Md'); assert.equal(m.bb, 1);
  near(s.ltb(.2, 250, true).chi, 1, 1e-9, 'χLT at λ 0.2'); assert.ok(s.ltb(1, 250, false).chi > s.ltb(1, 250, true).chi);
  assert.deepEqual(s.TABLE12.map(r => r[2]), [.7, .75, .8, .85, 1, 1, 1.2]); assert.deepEqual(s.TABLE13.d[3], [.5, .5]); assert.deepEqual(s.TABLE13.a[0], [3, 7.5]);
  near(s.holeLimit(250), 250 / 410 * (1.25 / 1.1) / .9, 1e-12, 'hole limit'); }

// ---- chapter 6 · cl. 509.4–510
{ const s = await import('./steel.js');
  assert.deepEqual([s.Kv(0), s.Kv(1), s.Kv(.5), s.Kv(2)], [5.35, 9.35, 4 + 5.35 / .25, 5.35 + 1]);
  const b = s.shearBuckling({ d: 1600, tw: 10, fyw: 250, cd: 1.5 });
  near(b.tcr, b.kv * Math.PI ** 2 * 2e5 / (12 * .91 * 160 ** 2), 1e-9, 'τcr,e'); near(b.Vp, 1600 * 10 * 250 / Math.sqrt(3) / 1000, 1e-9, 'Vp'); assert.ok(b.lw > 1.2); near(b.tb, 250 / Math.sqrt(3) / b.lw ** 2, 1e-9, 'τb');
  near(s.shearBuckling({ d: 600, tw: 12, fyw: 250, cd: 0 }).tb, 250 / Math.sqrt(3), 1e-9, 'stocky web yields');
  const t = s.tensionField({ d: 1600, tw: 10, fyw: 250, cd: 1.5, bf: 500, tf: 32, fyf: 250 }); assert.ok(t.Vtf > t.Vcr && t.Vtf <= t.Vp + 1e-9); near(t.phi, Math.atan(1 / 1.5), 1e-12, 'φ');
  near(s.anchorForces(2000, 500, 1600).Hq, 1.25 * 2000 * Math.sqrt(.75), 1e-9, 'Hq');
  assert.deepEqual([s.webLimit('none', 2), s.webLimit('trans', 2), s.webLimit('trans', .8), s.webLimit('trans', .5), s.webLimit('trans', 3.5), s.webLimit('long1', 1.5), s.webLimit('long1', .5), s.webLimit('long2', 1)],
    [[200, 'd'], [200, 'd'], [200, 'c'], [270, 'd'], [200, 'd'], [250, 'd'], [340, 'd'], [400, 'd']]);
  near(s.flangeLimit(true, 1, 250), 345, 1e-9, 'flange limit'); near(s.flangeLimit(true, 2, 300), 345 * 250 / 300, 1e-9, 'flange limit');
  near(s.stiffenerI(1600, 10, 3200), .75 * 1600 * 1000, 1e-6, 'Is'); near(s.stiffenerI(1600, 10, 1600), 1.5 * 1600 * 1000, 1e-6, 'Is');
  assert.deepEqual([s.alphaS(40), s.alphaS(100), s.alphaS(200)], [.006, .003, 30 / 40000]);
  near(s.highShear({ Md: 1000, Mfd: 600, ZeFy: 900, v: 1, compact: true }).Mdv, 600, 1e-9, 'Mdv at full shear'); assert.equal(s.highShear({ Md: 1000, Mfd: 600, ZeFy: 900, v: .5, compact: true }).Mdv, 1000); }

// ---- chapter 7 · cl. 511
{ const s = await import('./steel.js');
  near(s.muR(25), 1, 1e-12, 'μr'); near(s.muR(50), .5 ** .25, 1e-12, 'μr'); assert.equal(s.muR(12), 1);
  near(s.fatigueStrength(83, 5e6), 83, 1e-9, 'ff at 5e6'); near(s.fatigueStrength(83, 2e6), 83 * 2.5 ** (1 / 3), 1e-9, 'ff at 2e6'); near(s.fatigueStrength(83, 1e8), 83 * .05 ** .2, 1e-9, 'ff at 1e8'); near(s.fatigueStrength(67, 2e6, true), 67 * 2.5 ** .2, 1e-9, 'τf');
  near(s.fatigueLife(83, s.fatigueStrength(83, 2e6)), 2e6, 1, 'life inverts strength'); near(s.fatigueLife(83, s.fatigueStrength(83, 5e7)), 5e7, 50, 'life inverts strength'); assert.equal(s.fatigueLife(100, 50), Infinity);
  assert.deepEqual(s.GAMMA_MFT, { good: [1, 1.25], poor: [1.15, 1.35] }); assert.equal(s.lowFatigue(20, 1e9, 1.25).exempt, true); assert.equal(s.lowFatigue(60, 1e7, 1.25).exempt, false);
  assert.deepEqual(s.DETAILS.map(d => d[1]), [118, 103, 92, 92, 83, 66, 59, 83, 66, 52, 59, 37, 27]); }

// ---- chapter 8 · cl. 512
{ const s = await import('./steel.js');
  near(s.filletStrength(410), 410 / Math.sqrt(3) / 1.25, 1e-9, 'fwd shop'); near(s.filletStrength(410, true), 410 / Math.sqrt(3) / 1.5, 1e-9, 'fwd site');
  near(s.weldLongJoint(840, 5.6), 1, 1e-9, 'βlw at 150 tt'); near(s.weldLongJoint(1680, 5.6), .8, 1e-9, 'βlw at 300 tt');
  near(s.weldEquivalent(60, 80), Math.sqrt(3600 + 19200), 1e-9, 'fe');
  near(s.boltShear({ d: 20, fub: 400, nn: 1 }), 400 / Math.sqrt(3) * 245 / 1.25 / 1000, 1e-9, 'Vdsb'); assert.ok(s.boltShear({ d: 20, fub: 400, ns: 1 }) > s.boltShear({ d: 20, fub: 400, nn: 1 }));
  const b = s.boltBearing({ d: 20, t: 12, e: 40, p: 60, fub: 400, fu: 410 }); near(b.kb, 40 / 64.5, 1e-9, 'kb'); near(b.V, 2.5 * b.kb * 20 * 12 * 400 / 1.25 / 1000, 1e-9, 'Vdpb');
  near(s.boltTension({ d: 20, fub: 800, fyb: 640 }), .9 * 800 * 245 / 1.25 / 1000, 1e-9, 'Tdb');
  assert.deepEqual([s.longJoint(300, 20), s.longJoint(3000, 20)], [1, .75]); near(s.longJoint(600, 20), .925, 1e-9, 'βlj');
  assert.equal(s.largeGrip(100, 20), 1); near(s.largeGrip(160, 20), 160 / 220, 1e-9, 'βlg'); assert.deepEqual([s.packingFactor(6), s.packingFactor(16)], [1, .8]);
  const p = s.prying({ Te: 80, lv: 40, e: 40, be: 100, t: 12, f0: 560, fy: 250, pre: false }); assert.equal(p.le, Math.min(40, 1.1 * 12 * Math.sqrt(2 * 560 / 250)));
  near(p.Q, 40 / (2 * p.le) * (80000 - 2 * 1.5 * 560 * 100 * 12 ** 4 / (27 * p.le * 1600)) / 1000, 1e-9, 'Q'); assert.equal(s.prying({ Te: 80, lv: 40, e: 40, be: 100, t: 40, f0: 560, fy: 250, pre: false }).Q, 0); }

// ---- chapter 9 · cl. 513, 514, Annexes D to G
{ const s = await import('./steel.js');
  assert.deepEqual([s.holeSize(20), s.holeSize(24), s.holeSize(25), s.holeSize(30)], [21.5, 25.5, 27, 32]);
  assert.deepEqual([s.holeMethod({ t: 10, main: false, plies: 1, fy: 250 }), s.holeMethod({ t: 10, main: true, plies: 1, fy: 250 }), s.holeMethod({ t: 16, main: false, plies: 1, fy: 250 }), s.holeMethod({ t: 25, main: true, plies: 1, fy: 250 }), s.holeMethod({ t: 18, main: true, plies: 1, fy: 300 }), s.holeMethod({ t: 8, main: true, plies: 2, fy: 250 })],
    ['punch', 'drill', 'drill', 'ream', 'ream', 'ream']);
  assert.deepEqual([s.turnOfNut(4, false), s.turnOfNut(6, false), s.turnOfNut(10, true), s.turnOfNut(14, false)], [1 / 3, 1 / 2, 5 / 6, null]);
  assert.deepEqual([s.TOLERANCE.length(12000), s.TOLERANCE.length(15000), s.TOLERANCE.depth(), s.TOLERANCE.column(3000), s.TOLERANCE.column(9000), s.TOLERANCE.web(300), s.TOLERANCE.web(1600), s.TOLERANCE.butt(12), s.TOLERANCE.butt(40)],
    [[2, 2], [3.5, 3.5], [2, 3], [10, 10], [15, 15], [1.5, 1.5], [2, 2], [.15 * 12, .15 * 12], [3, 3]]);
  near(s.acceptanceLoad(400, 200, 600), 400 + 230 + 750, 1e-9, 'acceptance test load'); assert.deepEqual(s.TABLE_F1[1], [1.5, 1.2]); assert.deepEqual(s.TABLE_F1[10], [1.2, 1.1]);
  near(s.permissible('tension', 250, 0), 150, 1e-9, '0.6 fy'); near(s.permissible('bendGirder', 250, 25), .62 * 250 * 1.25, 1e-9, 'with increase'); near(s.permissible('bearing', 250, 40), 225, 1e-9, 'capped at 0.9 fy'); near(s.permissible('shearAvg', 300, 0), .35 * 300, 1e-9, 'average shear'); }
