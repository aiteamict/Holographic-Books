// IRC : 24-2010 numbers used by the chapter models. The clause or table is named beside each.

// cl. 502.2.2.1: modulus of elasticity and of rigidity (MPa), Poisson's ratio, unit mass (kg/m³), thermal expansion (per °C)
export const E = 2.0e5, G = .77e5, MU = .3, RHO = 7850, ALPHA = 12e-6;

/** Yield stress ratio ε = √(250 / fy) (Table 2, note 2). */
export const eps = fy => Math.sqrt(250 / fy);

// Table 1, partial safety factors for materials: [key, what it governs, symbol, shop, field]
export const GAMMA = [
  ['yield', 'Resistance governed by yielding', 'γm0', 1.10, 1.10],
  ['buckling', 'Member resistance governed by buckling', 'γm0', 1.10, 1.10],
  ['ultimate', 'Resistance governed by ultimate stress', 'γm1', 1.25, 1.25],
  ['friction', 'Bolts, friction type', 'γmf', 1.25, 1.25],
  ['bearing', 'Bolts, bearing type', 'γmb', 1.25, 1.25],
  ['rivets', 'Rivets', 'γmr', 1.25, 1.25],
  ['welds', 'Welds', 'γmw', 1.25, 1.50],
];

// Table 2, limiting width to thickness ratios (× ε) for Class 1, 2, 3: outstanding element of a compression flange,
// rolled and welded; web of an I, H or box section with the neutral axis at mid-depth
export const LIMITS = { rolled: [9.4, 10.5, 15.7], welded: [8.4, 9.4, 13.6], web: [84, 105, 126] };
export const CLASS = ['', 'Plastic', 'Compact', 'Semi-compact', 'Slender'];
export const classOf = (ratio, lim, fy) => { const e = eps(fy); return ratio <= lim[0] * e ? 1 : ratio <= lim[1] * e ? 2 : ratio <= lim[2] * e ? 3 : 4; };

/**
 * Class of an I-section in bending (cl. 503.7.2, Table 2). mm and MPa. The outstand b is half the flange for a rolled
 * section and the clear width from the web face for a welded one (Table 2 note 3: clear distance from the lateral
 * support to the free edge). The section takes the class of its worst element (Table 2 note 4).
 */
export function classify({ bf, tf, d, tw, fy, welded }) {
  const b = welded ? (bf - tw) / 2 : bf / 2, rf = b / tf, rw = d / tw;
  const cf = classOf(rf, welded ? LIMITS.welded : LIMITS.rolled, fy), cw = classOf(rw, LIMITS.web, fy);
  return { b, rf, rw, cf, cw, cls: Math.max(cf, cw), shearCheck: rw > 67 * eps(fy) };   // Table 2 note 3: d/t > 67ε, check shear buckling
}

/** Change of length in mm of a span L metres long for a temperature change dT (ΔL = α L ΔT). */
export const thermal = (L, dT) => ALPHA * L * 1000 * dT;

// cl. 504.5.1–504.5.2: deflection limits as span / n. Total = dead + live + impact; live = live + impact.
export const DEFL = { total: 600, live: 800, cantTotal: 300, cantLive: 400 };
export const minDepth = (L, truss) => L / (truss ? 10 : 25);   // cl. 504.4
export const minSpacing = L => L / 20;                         // cl. 504.3

/** Minimum plate thickness in mm for a calculated thickness (cl. 504.7.1). cond: 'both' | 'oneSide' | 'sealed'. */
export function minThickness(cond, calc = 0) {
  if (cond === 'sealed') return Math.max(6, calc);                          // (c) box members effectively sealed inside
  if (cond === 'oneSide') return calc < 12.5 ? Math.max(10, calc + 1.5) : calc;   // (b) one side not accessible for painting
  return Math.max(8, calc);                                                 // (a) both sides accessible
}

// ---- chapter 2 · tension members (cl. 506). Areas in mm², stresses in MPa, forces returned in kN.
export const GM0 = 1.10, GM1 = 1.25;        // Table 1: yielding and buckling; ultimate stress
export const FU = { 250: 410, 300: 440 };   // fy → fu for the two grades the Code names: E 250 (Fe 410 W), E 300 (Fe 440 W)
/** cl. 506.1.1: yielding of the gross section, Tdg = Ag fy / γm0. */
export const Tdg = (Ag, fy) => Ag * fy / GM0 / 1000;
/** cl. 506.1.2.1: rupture of the net section, Tdn = 0.9 An fu / γm1. */
export const Tdn = (An, fu) => .9 * An * fu / GM1 / 1000;
/** cl. 506.1.2.1: An = [b − n dh + Σ ps² / 4g] t. legs: one [ps, g] per inclined leg of the section. */
export const netArea = (b, t, n, dh, legs = []) => (b - n * dh + legs.reduce((s, [ps, g]) => s + ps * ps / (4 * g), 0)) * t;
/** cl. 506.1.2.3: single angle connected through one leg. β = 1.4 − 0.076 (w/t)(fy/fu)(bs/Lc), not over fu γm0 / fy γm1, not under 0.7. */
export function angleRupture({ Anc, Ago, w, t, bs, Lc, fy, fu }) {
  const raw = 1.4 - .076 * (w / t) * (fy / fu) * (bs / Lc), beta = Math.max(.7, Math.min(fu * GM0 / (fy * GM1), raw));
  return { raw, beta, Tdn: (.9 * Anc * fu / GM1 + beta * Ago * fy / GM0) / 1000 };
}
/** cl. 506.1.2.3: α for preliminary sizing, by the number of bolts or rivets along the end connection. */
export const alphaPrelim = n => n <= 2 ? .6 : n === 3 ? .7 : .8;
/** cl. 506.1.3.1: block shear, the smaller of the two expressions. */
export function blockShear({ Avg, Avn, Atg, Atn, fy, fu }) {
  const a = (Avg * fy / (Math.sqrt(3) * GM0) + .9 * Atn * fu / GM1) / 1000, b = (.9 * Avn * fu / (Math.sqrt(3) * GM1) + Atg * fy / GM0) / 1000;
  return { a, b, Tdb: Math.min(a, b) };
}

// ---- chapter 3 · compression members (cl. 507)
export const IMPERFECTION = { a: .21, b: .34, c: .49, d: .76 };   // Table 3: imperfection factor α by buckling class
/** cl. 507.1.2.1 from the non-dimensional slenderness λ: φ = 0.5 [1 + α (λ − 0.2) + λ²], χ = 1 / [φ + (φ² − λ²)^0.5], fcd = χ fy / γm0 ≤ fy / γm0. */
export function bucklingLam(lam, fy, cls) {
  const phi = .5 * (1 + IMPERFECTION[cls] * (lam - .2) + lam * lam), chi = Math.min(1, 1 / (phi + Math.sqrt(Math.max(0, phi * phi - lam * lam))));
  return { lam, phi, chi, fcd: chi * fy / GM0 };
}
/** cl. 507.1.2.1 from the effective slenderness ratio KL/r: λ = √(fy (KL/r)² / π² E). */
export const buckling = (klr, fy, cls) => bucklingLam(Math.sqrt(fy * klr * klr / (Math.PI ** 2 * E)), fy, cls);
// Table 4, buckling class of cross-sections: [key, cross-section and limits, class about z-z, class about y-y]
export const BUCKLING_CLASS = [
  ['ri1', 'Rolled I-section, h/bf > 1.2, tf ≤ 40 mm', 'a', 'b'], ['ri2', 'Rolled I-section, h/bf > 1.2, 40 mm < tf ≤ 100 mm', 'b', 'c'],
  ['ri3', 'Rolled I-section, h/bf ≤ 1.2, tf ≤ 100 mm', 'b', 'c'], ['ri4', 'Rolled I-section, h/bf ≤ 1.2, tf > 100 mm', 'd', 'd'],
  ['wi1', 'Welded I-section, tf ≤ 40 mm', 'b', 'c'], ['wi2', 'Welded I-section, tf > 40 mm', 'c', 'd'],
  ['hr', 'Hollow section, hot rolled', 'a', 'a'], ['hc', 'Hollow section, cold formed', 'b', 'b'],
  ['box', 'Welded box section, generally', 'b', 'b'], ['boxw', 'Welded box section, thick welds and b/tf < 30 (z-z), h/tw < 30 (y-y)', 'c', 'c'],
  ['open', 'Channel, angle, T and solid sections', 'c', 'c'], ['built', 'Built-up member', 'c', 'c'],
];
// Table 7, effective length of prismatic compression members: [key, K, one end: translation, rotation, other end: translation, rotation] (R restrained, F free)
export const KEFF = [['cant', 2.0, 'R', 'R', 'F', 'F'], ['psway', 2.0, 'F', 'R', 'R', 'F'], ['pp', 1.0, 'R', 'F', 'R', 'F'], ['fsway', 1.2, 'R', 'R', 'F', 'R'], ['fp', .8, 'R', 'R', 'R', 'F'], ['ff', .65, 'R', 'R', 'R', 'R']];
/** cl. 507.4.3.1: minimum thickness of a rectangular slab base, mm. w in MPa, projections a ≥ b in mm. It must also exceed the flange thickness. */
export const slabBase = (w, a, b, fy) => Math.sqrt(2.5 * w * (a * a - .3 * b * b) * GM0 / fy);
// Table 8, constants k1, k2, k3: bolts at each end connection (2 = two or more) and gusset fixity (F fixed, H hinged)
export const K_ANGLE = { '2F': [.20, .35, 20], '2H': [.70, .60, 5], '1F': [.75, .35, 20], '1H': [1.25, .50, 60] };
/**
 * cl. 507.5.1.2: single angle loaded through one leg. λe = √(k1 + k2 λvv² + k3 λφ²), λvv = (l/rvv) / (ε √(π²E/250)),
 * λφ = (b1 + b2)/2t / (ε √(π²E/250)). The Code prints ε under the root where the Euler term needs E; E is used here.
 */
export function angleStrut({ l, rvv, b1, b2, t, fy, bolts, fix }) {
  const d = eps(fy) * Math.sqrt(Math.PI ** 2 * E / 250), lvv = l / rvv / d, lphi = (b1 + b2) / (2 * t) / d, k = K_ANGLE[(bolts >= 2 ? '2' : '1') + fix];
  const le = Math.sqrt(k[0] + k[1] * lvv * lvv + k[2] * lphi * lphi);
  return { k, lvv, lphi, le, ...bucklingLam(le, fy, 'c') };   // angles are buckling class c (Table 4)
}

/** Stability against overturning (cl. 503.5.1): permanent loads that resist are multiplied by 0.9. Moments per metre run. */
export function overturning({ Gk, W, h, s, gf }) {
  const Mo = gf * W * h, Mr = .9 * Gk * s / 2;
  return { Mo, Mr, ok: Mr >= Mo };
}

// ---- chapter 4 · trusses (cl. 508)
// Table 9, effective length KL of compression members: [factor, the distance it multiplies] for buckling in the plane of the
// truss, normal to it with the member effectively braced by a lateral system, and normal to it unbraced (null: see cl. 508.4.4)
export const TABLE9 = {
  chord: [[.85, 'distance between centres of intersection with the web members'], [.85, 'distance between centres of intersection with the lateral bracing members or rigidly connected cross girders'], null],
  single: [[.70, 'distance between centres of intersection with the main chords'], [.85, 'distance between centres of intersections'], [1, 'distance between centres of intersection']],
  multi: [[.85, 'greatest distance between centres of any two adjacent intersections'], [.70, 'distance between centres of intersection with the main chords'], [.85, 'distance between centres of intersection with the main chords']],
};
/**
 * cl. 508.4.4 (b): compression chord held by U frames. δ = d1³ / 3EI1 + d2² b / EI2 (mm per N), KL = 2.5 ⁴√(E I a δ), not
 * less than a; KL = a when δ ≤ a³ / 40EI. Lengths in mm, moments of inertia in mm⁴.
 */
export function uFrame({ I, a, d1, d2, b, I1, I2 }) {
  const delta = d1 ** 3 / (3 * E * I1) + d2 * d2 * b / (E * I2), stiff = a ** 3 / (40 * E * I);
  return { delta, stiff, KL: Math.max(a, 2.5 * (E * I * a * delta) ** .25) };
}
/** cl. 508.4.4 (b): horizontal force on a U frame, F = 1.4 × 10⁻³ KL / δ (fcc/fa − 1.7), N. fcc = π² E / (KL/r)². */
export function uFrameForce(KL, delta, r, fa) { const fcc = Math.PI ** 2 * E / (KL / r) ** 2; return { fcc, F: 1.4e-3 * KL / (delta * (fcc / fa - 1.7)) }; }

// ---- chapter 5 · beams in bending (cl. 509.1–509.3)
/** A doubly symmetric I: flanges bf × tf, web d × tw (mm). Section moduli in mm³, ry about the weak axis, hf between flange centres. */
export function iSection({ bf, tf, d, tw }) {
  const D = d + 2 * tf, I = (bf * D ** 3 - (bf - tw) * d ** 3) / 12, A = 2 * bf * tf + d * tw, Iy = (2 * tf * bf ** 3 + d * tw ** 3) / 12;
  return { D, A, I, Ze: I / (D / 2), Zp: bf * tf * (d + tf) + tw * d * d / 4, Iy, ry: Math.sqrt(Iy / A), hf: d + tf };
}
/**
 * cl. 509.2.1.2: laterally supported beam with shear not over 0.6 Vd. Md = βb Zp fy / γm0, kept below 1.2 Ze fy / γm0 for a
 * simply supported beam and 1.5 Ze fy / γm0 for a cantilever. βb = 1 for plastic and compact sections, Ze/Zp for semi-compact. kNm.
 */
export function bendingStrength(sec, cls, fy, cantilever = false) {
  const s = iSection(sec), bb = cls <= 2 ? 1 : s.Ze / s.Zp, raw = bb * s.Zp * fy / GM0 / 1e6, cap = (cantilever ? 1.5 : 1.2) * s.Ze * fy / GM0 / 1e6;
  return { ...s, bb, raw, cap, Md: Math.min(raw, cap) };
}
/** cl. 509.2.2.1, the equation Table 11 was prepared from: fcr,b = 1.1 π² E / (LLT/ry)² × [1 + (1/20) ((LLT/ry) / (hf/tf))²]^0.5, MPa. */
export const fcrb = (klr, hft) => 1.1 * Math.PI ** 2 * E / klr ** 2 * Math.sqrt(1 + (klr / hft) ** 2 / 20);
/** cl. 509.2.2: χLT = 1 / {φLT + [φLT² − λLT²]^0.5} ≤ 1, φLT = 0.5 [1 + αLT (λLT − 0.2) + λLT²], αLT 0.21 rolled, 0.49 welded. */
export function ltb(lam, fy, welded) {
  const a = welded ? .49 : .21, phi = .5 * (1 + a * (lam - .2) + lam * lam), chi = Math.min(1, 1 / (phi + Math.sqrt(Math.max(0, phi * phi - lam * lam))));
  return { a, phi, chi, fbd: chi * fy / GM0 };
}
// Table 12, effective length LLT of simply supported beams: [torsional restraint, warping restraint, normal, destabilising, × D added]
export const TABLE12 = [
  ['Fully restrained', 'Both flanges fully restrained', .70, .85, 0],
  ['Fully restrained', 'Compression flange fully restrained', .75, .90, 0],
  ['Fully restrained', 'Both flanges fully restrained', .80, .95, 0],   // printed with the same words as the first row
  ['Fully restrained', 'Compression flange partially restrained', .85, 1.00, 0],
  ['Fully restrained', 'Warping not restrained in both flanges', 1.00, 1.20, 0],
  ['Partially restrained by bottom flange support connection', 'Warping not restrained in both flanges', 1.0, 1.2, 2],
  ['Partially restrained by bottom flange bearing support', 'Warping not restrained in both flanges', 1.2, 1.4, 2],
];
// Table 13, effective length LLT of a cantilever of length L: support condition a–d, then top restraint i–iv, as [normal, destabilising] × L
export const TABLE13 = {
  a: [[3.0, 7.5], [2.7, 7.5], [2.4, 4.5], [2.1, 3.6]], b: [[2.0, 5.0], [1.8, 5.0], [1.6, 3.0], [1.4, 2.4]],
  c: [[1.0, 2.5], [.9, 2.5], [.8, 1.5], [.7, 1.2]], d: [[.8, 1.4], [.7, 1.4], [.6, .6], [.5, .5]],
};
/** cl. 509.2.1.4 (a): holes in the tension flange need not be considered if Anf/Agf ≥ (fy/fu)(γm1/γm0)/0.9. */
export const holeLimit = fy => fy / FU[fy] * (GM1 / GM0) / .9;

// ---- chapter 6 · shear, stiffeners and combined forces (cl. 509.4–510)
/** cl. 509.4.2.2 (a): shear buckling coefficient. cd = c/d, the stiffener spacing over the web depth; 0 or null = stiffeners at supports only. */
export const Kv = cd => !cd ? 5.35 : cd < 1 ? 4 + 5.35 / cd ** 2 : 5.35 + 4 / cd ** 2;
/**
 * cl. 509.4.1 and 509.4.2.2 (a), simple post-critical method, for a welded I (Av = d tw). τcr,e = Kv π² E / 12(1 − μ²)(d/tw)²,
 * λw = √(fyw / √3 τcr,e); τb = fyw/√3 for λw ≤ 0.8, [1 − 0.8 (λw − 0.8)] fyw/√3 up to 1.2, fyw / (√3 λw²) beyond. Forces in kN.
 */
export function shearBuckling({ d, tw, fyw, cd }) {
  const kv = Kv(cd), ty = fyw / Math.sqrt(3), tcr = kv * Math.PI ** 2 * E / (12 * (1 - MU * MU) * (d / tw) ** 2), lw = Math.sqrt(ty / tcr);
  const tb = lw <= .8 ? ty : lw < 1.2 ? (1 - .8 * (lw - .8)) * ty : ty / (lw * lw);
  return { kv, tcr, lw, tb, Vp: d * tw * ty / 1000, Vcr: d * tw * tb / 1000, limit: 67 * eps(fyw) * (cd ? Math.sqrt(kv / 5.35) : 1) };   // limit: d/tw above which buckling is verified (509.4.2.1)
}
/**
 * cl. 509.4.2.2 (b), tension field method (c/d ≥ 1). φ = tan⁻¹(d/c), ψ = 1.5 τb sin 2φ, fv = [fyw² − 3τb² + ψ²]^0.5 − ψ,
 * s = (2/sin φ) [Mfr / (fyw tw)]^0.5 ≤ c, Mfr = 0.25 bf tf² fyf [1 − nf²] with nf = Nf / (bf tf fyf / γm0),
 * wtf = d cos φ + (c − sc − st) sin φ, Vtf = Av τb + 0.9 wtf tw fv sin φ ≤ Vp. Both flanges are taken alike (sc = st).
 */
export function tensionField({ d, tw, fyw, cd, bf, tf, fyf, nf = 0 }) {
  const b = shearBuckling({ d, tw, fyw, cd }), c = cd * d, phi = Math.atan(d / c), psi = 1.5 * b.tb * Math.sin(2 * phi), fv = Math.sqrt(fyw ** 2 - 3 * b.tb ** 2 + psi ** 2) - psi;
  const Mfr = .25 * bf * tf * tf * fyf * (1 - nf * nf), s = Math.min(c, 2 / Math.sin(phi) * Math.sqrt(Mfr / (fyw * tw))), wtf = d * Math.cos(phi) + (c - 2 * s) * Math.sin(phi);
  const raw = (d * tw * b.tb + .9 * wtf * tw * fv * Math.sin(phi)) / 1000;
  return { ...b, c, phi, psi, fv, Mfr, s, wtf, raw, Vtf: Math.min(raw, b.Vp) };
}
/** cl. 509.5.3: anchor forces of the tension field. Hq = 1.25 Vp (1 − Vcr/Vp)^½, Rtf = Hq/2, Mtf = Hq d/10 (kN, kNm; d in mm). */
export function anchorForces(Vp, Vcr, d, ratio = 1) { const Hq = 1.25 * Vp * Math.sqrt(1 - Vcr / Vp) * ratio; return { Hq, Rtf: Hq / 2, Mtf: Hq * d / 10 / 1000 }; }
/**
 * cl. 509.6.1.1, serviceability limit on the web: returns [k, 'd' | 'c'] meaning d/tw or c/tw ≤ k εw. arr: 'none' no transverse
 * stiffeners, 'trans' transverse only, 'long1' with one longitudinal stiffener, 'long2' with a second at the neutral axis.
 * The Code prints the third transverse-only case as "c < d"; it is applied here below 0.74 d, where the second case ends.
 */
export function webLimit(arr, cd) {
  if (arr === 'long2') return [400, 'd'];
  if (arr === 'none' || (arr === 'trans' && cd > 3)) return [200, 'd'];
  const [a, b] = arr === 'trans' ? [200, 270] : [250, 340];
  return cd >= 1 ? [a, 'd'] : cd >= .74 ? [a, 'c'] : [b, 'd'];
}
/** cl. 509.6.1.2: so that the compression flange does not buckle into the web, d/tw ≤ 345 εf² (no stiffeners, or c ≥ 1.5 d), 345 εf (c < 1.5 d). */
export const flangeLimit = (stiffened, cd, fyf) => 345 * (stiffened && cd < 1.5 ? eps(fyf) : eps(fyf) ** 2);
/** cl. 509.7.2.4: least second moment of area of an intermediate transverse stiffener, mm⁴. */
export const stiffenerI = (d, tw, c) => c / d >= Math.SQRT2 ? .75 * d * tw ** 3 : 1.5 * d ** 3 * tw ** 3 / c ** 2;
/** cl. 509.7.4: local capacity of the web at its junction with the flange, Fw = (b1 + n2) tw fyw / γm0, kN. */
export const webBearing = (b1, n2, tw, fyw) => (b1 + n2) * tw * fyw / GM0 / 1000;
/** cl. 509.7.5.2: bearing strength of a load carrying stiffener, Fpsd = Aq fyq / (0.8 γm0), kN. */
export const stiffenerBearing = (Aq, fyq) => Aq * fyq / (.8 * GM0) / 1000;
/** cl. 509.7.9: αs for a torsional stiffener, Is ≥ 0.34 αs D³ Tcf. */
export const alphaS = klr => klr <= 50 ? .006 : klr <= 100 ? .3 / klr : 30 / klr ** 2;
/** cl. 510.2: moment capacity under shear v = V/Vd. Above 0.6: Mdv = Md − β (Md − Mfd) ≤ 1.2 Ze fy/γm0, β = (2v − 1)² (plastic, compact); Ze fy/γm0 (semi-compact). */
export function highShear({ Md, Mfd, ZeFy, v, compact }) {
  if (v <= .6) return { beta: 0, Mdv: Md };
  if (!compact) return { beta: 0, Mdv: ZeFy };
  const beta = (2 * v - 1) ** 2; return { beta, Mdv: Math.min(Md - beta * (Md - Mfd), 1.2 * ZeFy) };
}

// ---- chapter 7 · fatigue (cl. 511)
// Table 18, partial safety factor for fatigue strength γmft: inspection and access good or poor → [fail-safe, non-fail-safe]
export const GAMMA_MFT = { good: [1.00, 1.25], poor: [1.15, 1.35] };
/** cl. 511.2.1: capacity reduction for plates thicker than 25 mm joined by transverse fillet or butt welds, μr = (25/tp)^0.25 ≤ 1. */
export const muR = tp => Math.min(1, (25 / tp) ** .25);
/** cl. 511.4: fatigue strength for N cycles from the strength at 5 × 10⁶. Normal stress: cube root up to 5 × 10⁶, fifth root to 10⁸; shear: fifth root. */
export const fatigueStrength = (ffn, N, shear = false) => ffn * (5e6 / N) ** (shear || N > 5e6 ? 1 / 5 : 1 / 3);
/** The same curve read the other way: cycles to failure at a normal stress range f. Ranges under 0.55 of the strength at 5 × 10⁶ are disregarded (cl. 511.5.2.4). */
export const fatigueLife = (ffn, f) => f < .55 * ffn ? Infinity : f >= ffn ? 5e6 * (ffn / f) ** 3 : 5e6 * (ffn / f) ** 5;
/** cl. 511.2.2.3, low fatigue: no assessment if f ≤ 27/γmft, or if Nsc < 5 × 10⁶ (27/γmft / γfft f)³. */
export const lowFatigue = (f, N, gm, gf = 1) => { const lim = 5e6 * (27 / gm / (gf * f)) ** 3; return { fLim: 27 / gm, nLim: lim, exempt: f <= 27 / gm || N < lim }; };
// Table 19 (a), (b), a selection: [key, detail category (MPa at 5 × 10⁶ cycles), the constructional detail]
export const DETAILS = [
  ['plate', 118, 'Rolled and extruded products: plates and flats, rolled sections, seamless tubes'],
  ['bolted', 103, 'Bolted connections; material with gas-cut or sheared edges with no draglines'],
  ['gascut', 92, 'Material with machine gas-cut edges with draglines, or manual gas-cut material'],
  ['lwauto', 92, 'Continuous automatic longitudinal fillet or butt welds from both sides, no un-repaired stop-start positions'],
  ['lwstop', 83, 'Continuous longitudinal welds from both sides containing stop-start positions; automatic butt welds from one side on a backing bar'],
  ['lwone', 66, 'Continuous longitudinal welds carried out from one side only'],
  ['lwint', 59, 'Intermittent longitudinal welds'],
  ['buttflush', 83, 'Transverse butt weld, complete penetration, reinforcement ground flush, 100 per cent NDT'],
  ['butt', 66, 'Transverse butt-welded splices of plates, rolled sections or plate girders'],
  ['backing', 52, 'Transverse butt-welded splice made on a backing bar'],
  ['stiff', 59, 'Vertical stiffener or transverse fillet weld on a plate up to 12 mm thick (52 above 12 mm)'],
  ['cover', 37, 'End zone of a welded cover plate, flange or plate up to 25 mm thick (27 above 25 mm)'],
  ['cruci', 27, 'Cruciform joint, partial penetration or fillet welds, stress range on the throat area (41 on the plate area)'],
];

// ---- chapter 8 · connections (cl. 512). Stresses MPa, lengths mm, forces returned in kN.
export const GMW = { shop: 1.25, site: 1.50 }, GMB = 1.25;   // Table 1: welds in the shop and in the field; bolts
// cl. 512.5.5.1: net tensile stress area of bolts, mm², by nominal diameter
export const BOLT_AREA = { 12: 84, 14: 115, 16: 157, 18: 192, 20: 245, 22: 303, 24: 353, 27: 459, 30: 561, 33: 694 };
/** cl. 512.4.5.1.1: design strength of a fillet weld on its throat area, fwd = fu / (√3 γmw), MPa. */
export const filletStrength = (fu, site = false) => fu / Math.sqrt(3) / GMW[site ? 'site' : 'shop'];
/** cl. 512.4.5.3: long welded joints (lj > 150 tt), βlw = 1.2 − 0.2 lj / (150 tt) ≤ 1.0. */
export const weldLongJoint = (lj, tt) => Math.min(1, 1.2 - .2 * lj / (150 * tt));
/** cl. 512.4.8.1.1: equivalent stress in a fillet weld under normal stress fa and shear q, to be kept within fu / (√3 γmw). */
export const weldEquivalent = (fa, q) => Math.sqrt(fa * fa + 3 * q * q);
/** cl. 512.5.5.3: Vdsb = fub (nn Anb + ns Asb) / (√3 γmb). nn, ns: shear planes with and without threads in them. */
export const boltShear = ({ d, fub, nn = 0, ns = 0 }) => fub / Math.sqrt(3) * (nn * BOLT_AREA[d] + ns * Math.PI * d * d / 4) / GMB / 1000;
/** cl. 512.5.5.4: Vdpb = 2.5 kb d t f'u / γmb, kb the least of e/3d0, p/3d0 − 0.25, fub/fu, 1.0; hole d0 = d + 1.5 (cl. 512.5.4 a). */
export function boltBearing({ d, t, e, p, fub, fu }) {
  const d0 = d + 1.5, kb = Math.min(e / (3 * d0), p / (3 * d0) - .25, fub / fu, 1);
  return { d0, kb, V: 2.5 * kb * d * t * Math.min(fub, fu) / GMB / 1000 };
}
/** cl. 512.5.5.5: Tdb = Tnb / γmb, Tnb = 0.90 fub Anb, not more than fyb Asb (γmb/γm0). */
export const boltTension = ({ d, fub, fyb }) => Math.min(.9 * fub * BOLT_AREA[d], fyb * Math.PI * d * d / 4 * GMB / GM0) / GMB / 1000;
/** cl. 512.5.8: long joints (lj > 15 d), βlj = 1.075 − lj / (200 d), between 0.75 and 1.0. */
export const longJoint = (lj, d) => Math.max(.75, Math.min(1, 1.075 - lj / (200 * d)));
/** cl. 512.5.9: large grip lengths (lg > 5 d), βlg = 8 d / (3 d + lg). */
export const largeGrip = (lg, d) => lg > 5 * d ? 8 * d / (3 * d + lg) : 1;
/** cl. 512.5.9: bolts carrying shear through a packing thicker than 6 mm, βpk = 1 − 0.0125 tpk. */
export const packingFactor = tpk => tpk > 6 ? 1 - .0125 * tpk : 1;
/**
 * cl. 512.7: prying force per bolt, Q = (lv / 2 le) [Te − β η f0 be t⁴ / (27 le lv²)], not less than zero. le is the lesser of the
 * end distance e and 1.1 t √(β f0 / fy); β = 2 for a non pre-tensioned bolt, 1 for a pre-tensioned one; η = 1.5. Te and Q in kN.
 */
export function prying({ Te, lv, e, be, t, f0, fy, pre }) {
  const beta = pre ? 1 : 2, le = Math.min(e, 1.1 * t * Math.sqrt(beta * f0 / fy));
  return { beta, le, Q: Math.max(0, lv / (2 * le) * (Te * 1000 - beta * 1.5 * f0 * be * t ** 4 / (27 * le * lv * lv)) / 1000) };
}

// ---- chapter 9 · fabrication, erection and the annexes (cl. 513, 514, Annexes D to G)
/** cl. 513.5.5.1: hole diameter for rivets and bolts: 1.5 mm larger up to 25 mm diameter, 2.0 mm at 25 mm and above. */
export const holeSize = d => d + (d >= 25 ? 2 : 1.5);
/**
 * cl. 513.5.5.1: how a hole is made. 'ream': sub-drilled or sub-punched 3 mm under and reamed, for holes through more than one
 * thickness or main material over 20 mm (up to E 250) or 16 mm (E 300 and above). 'punch': allowed only in secondary members
 * not over 12 mm thick, steel up to E 250. Otherwise 'drill'.
 */
export const holeMethod = ({ t, main, plies, fy }) => plies > 1 || t > (fy >= 300 ? 16 : 20) ? 'ream' : !main && t <= 12 && fy <= 250 ? 'punch' : 'drill';
// cl. 513.5.6.1, turn of nut after snug tight: [bolt length up to (diameters), both faces normal, one face sloped less than 1:20]
export const TURN = [[4, 1 / 3, 1 / 2], [8, 1 / 2, 2 / 3], [12, 2 / 3, 5 / 6]];
export const turnOfNut = (dias, sloped) => { const r = TURN.find(q => dias <= q[0]); return r ? r[sloped ? 2 : 1] : null; };
// Table 20 and cl. 513.5.14.2, a selection: each returns the allowed deviation in mm as [minus, plus]
export const TOLERANCE = {
  length: L => L <= 12000 ? [2, 2] : [3.5, 3.5],                 // 1 c: other members, up to and over 12 m
  bearing: () => [1, 1],                                         // 1 a: both ends finished for contact bearing
  width: () => [3, 3],                                           // 2 a: width of built-up girders
  depth: () => [2, 3],                                           // 3: depth of solid web and open web girders
  column: L => { const v = Math.min(15, L / 300); return [v, v]; },   // 4 a: straightness of columns, as printed
  web: d => { const v = Math.min(2, .005 * d); return [v, v]; },      // 6: flatness of plate webs, in a length equal to the depth
  tilt: b => { const v = Math.min(2, .005 * b); return [v, v]; },     // 7 a: tilt of flange at splices, stiffeners, supports, bearings
  butt: t => { const v = Math.min(3, .15 * t); return [v, v]; },      // 513.5.14.2: misalignment in welded butt joints
};
/** Annex F2.1: acceptance test load = 1.0 × self weight + 1.15 × remainder of the permanent load + 1.25 × variable load. */
export const acceptanceLoad = (self, perm, variable) => self + 1.15 * perm + 1.25 * variable;
// Table F.1, factors to allow for variability of structural units: number of similar units tested → [strength, serviceability]
export const TABLE_F1 = { 1: [1.5, 1.2], 2: [1.4, 1.2], 3: [1.3, 1.2], 4: [1.3, 1.1], 5: [1.3, 1.1], 10: [1.2, 1.1] };
// Annex G, Table G.1: classification of load combinations and the permissible increase in stress, per cent
export const TABLE_G1 = [['I', 0], ['II', 15], ['III', 25], ['IV', 40], ['V', 25], ['VI', 30], ['VII', 40]];
// Annex G, Table G.2: basic permissible stresses as a fraction of fy
export const TABLE_G2 = { tension: () => .6, compression: () => .6, bendPlate: () => .66, bendGirder: () => .62, shearMax: () => .43, shearAvg: fy => fy <= 250 ? .38 : .35, bearing: () => .8 };
/** Annex G2.2: permissible stress with the increase of Table G.1, limited to 90 per cent of the yield stress. */
export const permissible = (kind, fy, inc) => Math.min(TABLE_G2[kind](fy) * fy * (1 + inc / 100), .9 * fy);
