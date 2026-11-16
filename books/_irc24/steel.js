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

/** Stability against overturning (cl. 503.5.1): permanent loads that resist are multiplied by 0.9. Moments per metre run. */
export function overturning({ Gk, W, h, s, gf }) {
  const Mo = gf * W * h, Mr = .9 * Gk * s / 2;
  return { Mo, Mr, ok: Mr >= Mo };
}
