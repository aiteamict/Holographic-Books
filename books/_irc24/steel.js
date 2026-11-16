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
