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
