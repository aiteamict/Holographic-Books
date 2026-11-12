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
