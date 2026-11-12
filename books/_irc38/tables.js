// IRC : 38-1988 Tables 1–3, transcribed from the page (p014, p015, p019) and shared by the chapters.

/** Table 1 · terrain classification by the general cross slope of the country, per cent. */
export const TERRAIN = [['Plain', 0, 10], ['Rolling', 10, 25], ['Mountainous', 25, 60], ['Steep', 60, Infinity]];
export const terrainOf = slope => (TERRAIN.find(([, a, b]) => slope >= a && slope < b) || TERRAIN[3])[0];

/** Table 2 · design speeds, km/h: [ruling, minimum] for each road class in each terrain. */
export const CLASSES = ['National and State Highways', 'Major District Roads', 'Other District Roads', 'Village Roads'];
export const SHORT = ['NH / SH', 'MDR', 'ODR', 'VR'];
export const TERRAINS = ['Plain', 'Rolling', 'Mountainous', 'Steep'];
export const SPEEDS = [
  [[100, 80], [80, 65], [50, 40], [40, 30]],
  [[80, 65], [65, 50], [40, 30], [30, 20]],
  [[65, 50], [50, 40], [30, 25], [25, 20]],
  [[50, 40], [40, 35], [25, 20], [25, 20]],
];

/** Table 3 · minimum radius (m) by design speed: plain & rolling, mountainous & steep snow-bound, non-snow-bound.
 *  null = speed not applicable. Values marked * in the table: where trucks ply, at least 26 m (cl. 4.4.5). */
export const MIN_RADIUS = {
  20: [15, 15, 14], 25: [23, 23, 20], 30: [33, 33, 30], 35: [45, 45, 40], 40: [60, 60, 50], 50: [90, 90, 80],
  65: [155, null, null], 80: [230, null, null], 100: [360, null, null],
};
export const TRUCK_MIN_R = 26;

/** eq. (6): absolute minimum radius for a centrifugal ratio of 0.22 (e 0.07) or 0.25 (e 0.10). */
export const absMinR = (V, ratio = .22) => V * V / (ratio * 127);

/** eq. (7) and Table 4: superelevation to counteract the centrifugal force at ¾ of the design speed, capped at
 *  0.07 (plain, rolling, snow-bound hills) or 0.10 (hills not bound by snow). Table 4 note (i): "calculated by e = V²/225Rc". */
export const eRequired = (V, R) => V * V / (225 * R);
export const eDesign = (V, R, cap = .07) => Math.min(cap, eRequired(V, R));

/** Table 5 · camber / crossfall by surface, per cent [low, high]. */
export const CAMBER = [['High type bituminous or cement concrete', 1.7, 2.0], ['Thin bituminous surfacing', 2.0, 2.5], ['Water bound macadam, gravel', 2.5, 3.0], ['Earth', 3.0, 4.0]];

/** Table 6 · radii (m) beyond which superelevation is not required, for camber 4, 3, 2.5, 2 per cent (read on p025).
 *  25 km/h at 2 per cent is printed 110; R = V²/225e gives 139 (a misprint). */
export const CAMBERS = [4, 3, 2.5, 2];
export const NO_SUPER = { 20: [50, 60, 70, 90], 25: [70, 90, 110, 110], 30: [100, 130, 160, 200], 35: [140, 180, 220, 270], 40: [180, 240, 280, 350], 50: [280, 370, 450, 550], 65: [470, 620, 750, 950], 80: [700, 950, 1100, 1400], 100: [1100, 1500, 1800, 2200] };
export const noSuperR = (V, camberPct) => V * V / (225 * camberPct / 100);

/** eq. (8): extra width We = l²/2R (mechanical) + V/(9.5√R) (psychological); l = 11 m representative wheel base (cl. 6.2). */
export const WHEELBASE = 11;
export const widenMech = (R, l = WHEELBASE) => l * l / (2 * R);
export const widenPsy = (V, R) => V / (9.5 * Math.sqrt(R));
export const widenTotal = (V, R, lanes = 2, l = WHEELBASE) => lanes > 1 ? widenMech(R, l) + widenPsy(V, R) : widenMech(R, l);

/** Table 7 · extra width (m) by radius band: [two-lane, single-lane]; beyond 300 m none listed. */
export const WIDEN_BANDS = [[20, 1.5, .9], [40, 1.5, .6], [60, 1.2, .6], [100, .9, 0], [300, .6, 0]];
export const widenTable = (R, lanes = 2) => { const b = WIDEN_BANDS.find(([max]) => R <= max); return b ? (lanes > 1 ? b[1] : b[2]) : 0; };

/** Table 7A · widening given by edges of the same radius and transition as the centre line: W (sec Δ/2 − 1), W ≈ 6.59 m. */
export const WIDEN_DELTA = [[.30, 33 + 55 / 60], [.60, 47 + 8 / 60], [.90, 56 + 44 / 60], [1.20, 64 + 24 / 60], [1.50, 70 + 51 / 60]];

/** eq. (14), (15): set-back m = R − (R − n) cos θ, θ = S / 2(R − n) radians. */
export const setBack = (R, S, n = 0) => { const t = S / (2 * (R - n)); return R - (R - n) * Math.cos(t); };

/** Table 8 · set-back (m), single-lane hill roads (n = 0), as printed on p035; sight distance S for each column.
 *  R 150 / S 60 is printed 2.3 (eq. 14 gives 2.99) and R 33 / S 30 printed 3.7 (eq. 14 gives 3.35): misprints. */
export const SETBACK_S = [20, 25, 30, 45, 60];
export const SETBACK = { 14: [3.4], 15: [3.2], 20: [2.4, 3.8], 23: [2.1, 3.3], 30: [1.7, 2.6, 3.7], 33: [1.5, 2.3, 3.7], 50: [1.0, 1.6, 2.2, 5.0], 60: [null, 1.3, 1.9, 4.2], 80: [null, 1.0, 1.4, 3.1, 5.6], 100: [null, .8, 1.1, 2.5, 4.5], 120: [null, .7, .9, 2.1, 3.7], 150: [null, .5, .8, 1.7, 2.3] };

/** eq. (16), (17): transition length for the rate of change of centrifugal acceleration, C = 80/(75 + V), 0.5 ≤ C ≤ 0.8. */
export const rateC = V => Math.min(.8, Math.max(.5, 80 / (75 + V)));
export const lsComfort = (V, R) => .0215 * V ** 3 / (rateC(V) * R);
/** eq. (18), (19): transition length for the rate of introducing superelevation, 2.7V²/R plain and rolling, V²/R hills. */
export const lsSuper = (V, R, hills = false) => (hills ? 1 : 2.7) * V * V / R;
/** cl. 7.3.4: the larger of the two, as a whole multiple of 5 m. */
export const lsMin = (V, R, hills = false) => Math.max(15, Math.ceil(Math.max(lsComfort(V, R), lsSuper(V, R, hills)) / 5 - 1e-9) * 5);   // Table 9 never goes below 15 m

/** Table 9 · minimum transition lengths (m), read on p038. Columns: speed × terrain in T9_COLS; each row a string of 18
 *  cells, '.' where nothing (or a dash) is printed, NA = radius not applicable, NR = transition not required. */
export const T9_COLS = [100, 80, 65, 50, 40, 35, 30, 25, 20].flatMap(V => [[V, 'P'], [V, 'H']]);
const T9_ROWS = {
  14: '. . . . . . . . . . . . . . . . 80 30', 15: '. . . . . . . . . . . . . . . NA 75 30', 20: '. . . . . . . . . . . . . . NA 35 55 20',
  23: '. . . . . . . . . . . . . . 75 . . .', 25: '. . . . . . . . . . . . NA NA 70 25 45 20', 30: '. . . . . . . . . . . NA 80 30 60 25 40 15',
  33: '. . . . . . . . . . . . 75 . . . . .', 40: '. . . . . . . . . . NA 35 60 25 45 20 30 15', 45: '. . . . . . . . . NA 75 30 55 20 40 15 25 15',
  50: '. . . . . . . . . 40 70 25 50 20 35 15 25 15', 55: '. . . . . . . . NA 40 60 25 45 20 30 15 20 15', 60: '. . . . . . . . 75 35 55 25 40 15 30 15 20 15',
  70: '. . . . . . . NA 65 30 50 20 35 15 30 15 15 15', 80: '. . . . . . NA 55 55 25 45 20 30 15 25 15 15 15', 90: '. . . . . . 75 45 50 25 40 15 30 15 20 15 15 NR',
  100: '. . . . . . 70 45 45 20 35 15 25 15 20 15 NR .', 125: '. . . . NA . 55 35 35 15 30 15 20 15 15 NR . .', 150: '. . . . 80 . 45 30 30 15 25 15 20 15 15 . . .',
  155: '. . . . 80 . . . . . . . . . . . . .', 170: '. . . . 70 . 40 25 25 15 20 15 15 NR NR . . .', 200: '. . NA . 60 . 35 20 25 15 20 15 15 . . . . .',
  230: '. . 90 . . . . . . . . . . . . . . .', 250: '. . 90 . 50 . 30 15 20 15 NR NR NR . . . . .', 300: 'NA . 75 . 40 . 25 15 NR NR . . . . . . . .',
  350: '130 . 60 . 35 . 20 . . . . . . . . . . .', 360: '130 . . . . . . . . . . . . . . . . .', 400: '115 . 55 . 30 . 20 15 . . . . . . . . . .',
  500: '95 . 45 . 25 . NR NR . . . . . . . . . .', 600: '80 . 35 . 20 . . . . . . . . . . . . .', 700: '70 . 35 . 20 . . . . . . . . . . . . .',
  800: '60 . 30 . NR . . . . . . . . . . . . .', 900: '55 . 30 . . . . . . . . . . . . . . .', 1000: '50 . 30 . . . . . . . . . . . . . . .',
  1200: '40 . NR . . . . . . . . . . . . . . .', 1500: '35 . . . . . . . . . . . . . . . . .', 1800: '30 . . . . . . . . . . . . . . . . .', 2000: 'NR . . . . . . . . . . . . . . . . .',
};
export const T9_R = Object.keys(T9_ROWS).map(Number);
export const T9 = Object.fromEntries(T9_R.map(R => [R, T9_ROWS[R].split(' ').map(t => t === '.' ? null : /^\d/.test(t) ? +t : t)]));
export const t9 = (V, terrain, R) => { const j = T9_COLS.findIndex(([v, t]) => v === V && t === terrain); return j < 0 ? null : T9[R]?.[j] ?? null; };
