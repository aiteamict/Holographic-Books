// Spreads 1–7 · the design tables as a live calculator. Each value is computed from the geometry (curve.js) and set
// beside what the book prints; a printed cell is drawn red only where it was read on the page and the gap is beyond
// rounding. Tables 10–12 are too large to transcribe whole: their spreads check the cells the book quotes.
import { horizontalCurve as hc, spiralXY } from '../../_irc38/curve.js';
import { T9_R, t9, MIN_RADIUS } from '../../_irc38/tables.js';
import { T13, T15, T16, T17 } from '../data.js';
import { tableSpread, head, table, foot, stepper, dms, DEG, F } from './table.js';
import { level, osc, shiftFig, unit } from './sites.js';

const RAD = Math.PI / 180, f3 = v => v.toFixed(3);
const RADII = [...T9_R, 2500];                                   // Table 10's standard radii, 14 to 2500 m
const LENGTHS = Array.from({ length: 26 }, (_, i) => 15 + 5 * i);   // its 26 standard transitions, 15 to 140 m
const at = (list, v) => list.indexOf(v);
const near = (list, i, n = 2) => { const a = Math.max(0, Math.min(list.length - 2 * n - 1, i - n)); return list.slice(a, a + 2 * n + 1).map((v, j) => [v, a + j]); };
const selOf = (view, i) => view.findIndex(([, j]) => j === i);

// ── Table 10 ────────────────────────────────────────────────────────────────────────────────────────────────────────
// the Table 10 cells the examples quote (Example 11.3's Table 11.1, 11.4, 11.7's Table 11.2, 11.8, 11.9): Δ/R/Ls → [Ts, Es]
const QUOTED = {
  '56/125/100': [null, 20.325], '56/125/120': [null, 21.963], '56/155/15': [null, 20.617], '56/155/20': [null, 20.670], '56/155/40': [null, 21.305],
  '56/155/50': [null, 21.309], '56/155/80': [null, 22.492], '56/155/100': [null, 23.582], '56/170/15': [null, 21.599], '56/170/20': [null, 22.685],
  '56/170/30': [null, 22.787], '56/170/55': [118.260, 23.376], '55/170/55': [116.358, 22.490], '56/360/140': [262.532, 50.291],
  '56/400/140': [283.697, 55.338], '56/400/130': [278.562, 55.020], '56/400/120': [273.436, 54.720], '56/500/120': [326.463, 67.694],
  '56/500/110': [321.368, 67.427], '56/500/105': [318.823, 67.325], '55/500/110': [315.786, null], '56/500/95': [313.740, null], '56/600/95': [366.849, null],
};
const book = (v, exact, tol = .0035) => v == null ? '' : { t: f3(v), bad: Math.abs(v - exact) > tol };
// the highest plain-terrain design speed a radius and transition suit: Table 3 radius and Table 9 length
function speedFor(R, Ls) {
  for (const V of [100, 80, 65, 50, 40, 35, 30, 25, 20]) {
    const need = t9(V, 'P', R);
    if (R >= MIN_RADIUS[V][0] && (typeof need !== 'number' || Ls >= need)) return [V, need];
  }
  return [null, null];
}
export const table10 = tableSpread({
  ...level,
  state: { d: 56, r: at(RADII, 500), l: at(LENGTHS, 110) },
  curve: s => [s.d, RADII[s.r], LENGTHS[s.l]],
  actions: (s, go) => [
    { label: 'Δ −', run: () => { s.d = Math.max(6, s.d - 1); go(); } }, { label: 'Δ +', run: () => { s.d = Math.min(120, s.d + 1); go(); } },
    ...stepper('Rc', () => s.r, v => { s.r = v; }, RADII.length, go), ...stepper('Ls', () => s.l, v => { s.l = v; }, LENGTHS.length, go),
  ],
  card(c, W, H, s) {
    const R = RADII[s.r], Ls = LENGTHS[s.l], k = hc(s.d, R, Ls), [V, need] = speedFor(R, Ls);
    const y = head(c, W, `TABLE 10 · Δ ${s.d}° · Ls ${Ls} m`, [
      `Rc ${R} m:  Ts ${f3(k.Ts)} m,  Es ${f3(k.Es)} m${k.throughout ? ' (throughout)' : ''}`,
      V ? `Suits ${V} km/h, plain (Table 3 Rc; Table 9 Ls ${typeof need === 'number' ? '≥ ' + need + ' m' : 'not needed'})` : 'Below every design speed’s minimum radius (Table 3)',
    ]);
    const view = near(RADII, s.r);
    const rows = view.map(([r]) => { const q = hc(s.d, r, Ls), b = QUOTED[`${s.d}/${r}/${Ls}`] || []; return [`${r}`, f3(q.Ts), book(b[0], q.Ts), f3(q.Es), book(b[1], q.Es)]; });
    table(c, W, y + 6, [{ h: 'RC (m)', w: .14 }, { h: 'TS', w: .36 }, { h: 'BOOK TS', w: .56 }, { h: 'ES', w: .77 }, { h: 'BOOK ES', w: 1 }], rows, { sel: selOf(view, s.r) });
    foot(c, W, H, ['BOOK: the Table 10 cells Examples 11.3–11.9 quote (try Δ 56°, Rc 400–500).', 'Red: printed value read on the page, beyond rounding.']);
  },
  steps: [
    { title: 'Ts and Es', text: 'Table 10 gives Ts and Es for Δ 6° to 120°, radii 14 to 2500 m and transitions 15 to 140 m (cl. 7.7.2). Step Δ, Rc and Ls.',
      check: { q: 'When terrain fixes Ts or Es, Table 10 helps you pick…', options: ['the largest radius that fits', 'the smallest radius', 'the longest transition'], answer: 0, why: 'Many pairs fit; the tables let the engineer choose the maximum radius and the best transition (cl. 7.6.2).' } },
    { title: 'Design speed', text: 'Zig-zag lines in Table 10 mark the design speeds. The card tests the pair against Table 3 (radius) and Table 9 (length).',
      check: { q: 'Values below a speed’s zig-zag line are for…', options: ['exceptional conditions only', 'village roads', 'never'], answer: 0, why: 'Only where a safe curve is impossible or prohibitively costly (cl. 7.7.2).' } },
    { title: 'Example 11.7', text: 'Δ 56°: two Es values Table 11.2 quotes differ from the exact ones, at Rc 400 and 500 m with Ls 120 m.' },
  ],
  debug: s => { const k = hc(s.d, RADII[s.r], LENGTHS[s.l]); return { d: s.d, R: RADII[s.r], Ls: LENGTHS[s.l], Ts: +f3(k.Ts), Es: +f3(k.Es) }; },
});

// ── Tables 11 and 12 ────────────────────────────────────────────────────────────────────────────────────────────────
const QUOTED11 = { '250/100': 1.664, '100/30': .375, '80/55': 1.567 };   // shifts the text quotes from the tables (cl. 7.10.2, 7.10.3)
const fitL = s => { while (s.l > 0 && LENGTHS[s.l] > RADII[s.r]) s.l--; };   // keep θs ≤ 28.65°
const k11 = s => { const R = RADII[s.r], Ls = LENGTHS[s.l]; return hc(Math.min(170, Ls / R * DEG + 24), R, Ls); };
export const table11 = tableSpread({
  size: { w: 10, h: 8.6, px: 46 },
  state: { r: at(RADII, 250), l: at(LENGTHS, 100) },
  curve: s => { const R = RADII[s.r], Ls = LENGTHS[s.l]; return [Math.min(170, Ls / R * DEG + 24), R, Ls]; },
  pegs: (s, L, k) => ({ pts: Array.from({ length: 11 }, (_, i) => L.onSpiral(k.Ls * i / 10)), at: 0 }),
  actions: (s, go) => [
    ...stepper('Rc', () => s.r, v => { s.r = v; fitL(s); }, RADII.length, go),
    { label: 'Ls −', run: () => { s.l = Math.max(0, s.l - 1); go(); } }, { label: 'Ls +', run: () => { if (LENGTHS[s.l + 1] <= RADII[s.r]) s.l++; go(); } },
  ],
  card(c, W, H, s) {
    const R = RADII[s.r], Ls = LENGTHS[s.l], k = k11(s), q = QUOTED11[`${R}/${Ls}`];
    const y = head(c, W, `TABLES 11 & 12 · Rc ${R} m · Ls ${Ls} m`, [
      `θs = 28.65 Ls / Rc = ${dms(k.thetaS * DEG)};  s ${f3(k.S)} m,  K ${f3(k.K)} m`,
      `L.T. ${f3(k.LT)},  S.T. ${f3(k.ST)},  L.C. ${f3(k.LC)} m`,
    ]);
    const rows = Array.from({ length: 10 }, (_, j) => { const i = j + 1, p = spiralXY(Ls * i / 10, Ls, R); return [`${i}`, (Ls * i / 10).toFixed(1), f3(p.x), f3(p.y), dms(Math.atan2(p.y, p.x) * DEG)]; });
    table(c, W, y + 4, [{ h: 'POINT', w: .1 }, { h: 'L (m)', w: .3 }, { h: 'X (m)', w: .52 }, { h: 'Y (m)', w: .72 }, { h: 'POLAR DEFLECTION', w: 1 }], rows, { rh: 16, size: 12 });
    foot(c, W, H, [
      `Table 12, per m of Ls: s ${(k.S / Ls).toFixed(5)}, K ${(k.K / Ls).toFixed(4)}, L.T. ${(k.LT / Ls).toFixed(4)}`,
      q ? `The text quotes s = ${q} m for this curve (cl. 7.10): ${Math.abs(q - k.S) < .002 ? 'it matches ✓' : 'exact ' + f3(k.S)}` : 'Try Rc 250, Ls 100: the text quotes its shift.',
    ]);
  },
  steps: [
    { title: 'Ten chords', text: 'Table 11 lists, for standard radii and lengths, X, Y and the polar deflection to each chord point, with L.T., S.T., L.C., s and K (cl. 7.8.6).',
      check: { q: 'For 15 m and 20 m transitions Table 11 uses…', options: ['5 chords', '10 chords', '20 chords'], answer: 0, why: 'Ten-chord points for 30 m and above, five chords for 15 m and 20 m (cl. 7.8.6).' } },
    { title: 'Unit spiral', text: 'Table 12 gives the same functions for a spiral of unit length against θs; multiply by Ls (cl. 7.6.1). The card’s foot shows them.',
      check: { q: 'Table 12 steps θs by 0.1° up to…', options: ['50°', '20°', '135°'], answer: 0, why: '0.1° up to 50°, 0.5° from 50° to 70°, 1° from 70° to 135° (cl. 7.6.1).' } },
    { title: 'Off the table', text: 'A radius or length not in Table 11 needs its own calculation, which is what this card does for every pair (cl. 7.9.2).' },
  ],
  debug: s => { const k = k11(s); return { R: RADII[s.r], Ls: LENGTHS[s.l], S: +f3(k.S), K: +f3(k.K) }; },
});

// ── Table 13 ────────────────────────────────────────────────────────────────────────────────────────────────────────
const t13x = d => hc(d, 100 / (d * RAD), 100);                       // θs = Δ/2 with Ls = 100 m
const bad13 = T13.filter(([d, T, E]) => Math.abs(T - t13x(d).Ts) > .0035 || Math.abs(E - t13x(d).Es) > .0035).map(r => r[0]);
const nextOf = (list, i, bad) => { const n = list.findIndex((r, j) => j > i && bad.includes(r[0])); return n < 0 ? list.findIndex(r => r[0] === bad[0]) : n; };
export const table13 = tableSpread({
  ...osc,
  state: { i: T13.findIndex(r => r[0] === 56), ls: 100 },
  curve: s => { const d = T13[s.i][0]; return [d, s.ls / (d * RAD), s.ls]; },
  actions: (s, go) => [
    ...stepper('Δ', () => s.i, v => { s.i = v; }, T13.length, go),
    { label: 'Next misprint', run: () => { s.i = nextOf(T13, s.i, bad13); go(); } },
    ...[100, 120].map(v => ({ label: `Ls ${v} m`, toggle: () => s.ls === v, run: () => { s.ls = v; go(); } })),
  ],
  card(c, W, H, s) {
    const [d] = T13[s.i], k = hc(d, s.ls / (d * RAD), s.ls), m = s.ls / 100;
    const y = head(c, W, `TABLE 13 · TRANSITIONAL THROUGHOUT · Δ ${d}°`, [
      `θs = Δ/2 = ${d / 2}°;  Rc = Ls × 28.65 / θs = ${(s.ls / (d * RAD)).toFixed(2)} m`,
      `Ls ${s.ls} m: Ts ${f3(k.Ts)} m, Es ${f3(k.Es)} m${m !== 1 ? ` (Table 13 × ${m.toFixed(2)})` : ''}`,
    ]);
    const view = near(T13, s.i);
    const rows = view.map(([[dd, T, E]]) => { const x = t13x(dd); return [`${dd}°`, book(T, x.Ts), f3(x.Ts), book(E, x.Es), f3(x.Es)]; });
    table(c, W, y + 6, [{ h: 'Δ', w: .1 }, { h: 'BOOK TS', w: .32 }, { h: 'EXACT TS', w: .54 }, { h: 'BOOK ES', w: .77 }, { h: 'EXACT ES', w: 1 }], rows, { sel: selOf(view, s.i) });
    foot(c, W, H, ['Printed for Ls = 100 m; other lengths scale in proportion (cl. 7.7.4).', `Read on the page and wrong: ${bad13.map(v => v + '°').join(', ')}.`]);
  },
  steps: [
    { title: 'One length', text: 'In a curve transitional throughout each spiral takes half the deviation, so θs = Δ/2. Table 13 gives Ts and Es for Ls = 100 m (cl. 7.7.4).',
      check: { q: 'For Ls = 120 m the Table 13 values are…', options: ['multiplied by 1.2', 'the same', 'divided by 1.2'], answer: 0, why: 'Every length scales with Ls for the same θs, so Ts and Es scale in proportion (cl. 7.7.4).' } },
    { title: 'Misprints', text: 'Press "Next misprint". Each red cell was read on the page; at 130° and 131° the two Es values are swapped.' },
  ],
  debug: s => { const [d, T, E] = T13[s.i], x = t13x(d); return { d, book: [T, E], exact: [+f3(x.Ts), +f3(x.Es)], bad13 }; },
});

// ── Table 14 ────────────────────────────────────────────────────────────────────────────────────────────────────────
// coefficient for the polar deflection from the tangent at station a (instrument) to station b of a ten-chord spiral
const coef = (b, a) => b > a ? (b - a) * (b + 2 * a) / 300 : (a - b) * (2 * a + b) / 300;
const PR14 = { '0/1': .0267, '0/2': .8267, '0/3': .8600, '1/3': .0457, '4/8': .2651, '5/4': .0453, '5/6': .0367, '6/9': .1400, '6/10': .3469,
  '7/6': .0533, '7/9': .1687, '7/10': .2100, '9/10': .0867, '10/8': .1737 };   // to/at: printed cells read on the page that differ
const C14 = [[20, .4], [25, .8], [30, 1.4], [35, 2.2], [40, 3.4], [45, 4.8], [50, 6.6], [55, 8.8]];   // Table 14-2: C (minutes) for θ
function corr(th) {
  if (th < 20) return 0;
  const i = Math.max(0, Math.min(C14.length - 2, C14.findIndex(([t]) => t > th) - 1)), [t0, c0] = C14[i], [t1, c1] = C14[i + 1];
  return c0 + (c1 - c0) * (th - t0) / (t1 - t0);
}
// the true angle on the spiral, for comparison: tangent at a to the chord a→b
function trueAngle(a, b, th) {
  const Ls = 100, R = Ls / (2 * th * RAD), p = spiralXY(a * 10, Ls, R), q = spiralXY(b * 10, Ls, R);
  return Math.abs(Math.atan2(q.y - p.y, q.x - p.x) - p.theta) * DEG;
}
export const table14 = tableSpread({
  size: { w: 11, h: 8.8, px: 52 },
  state: { at: 0, th: 30 },
  curve: s => [2 * s.th + 24, 100 / (2 * s.th * RAD), 100],
  pegs: (s, L) => ({ pts: Array.from({ length: 11 }, (_, i) => L.onSpiral(10 * i)), at: s.at }),
  actions: (s, go) => [
    ...stepper('Station', () => s.at, v => { s.at = v; }, 11, go),
    ...[10, 30].map(v => ({ label: `θs ${v}°`, toggle: () => s.th === v, run: () => { s.th = v; go(); } })),
  ],
  card(c, W, H, s) {
    const y0 = head(c, W, `TABLE 14 · INSTRUMENT AT STATION ${s.at} · θs ${s.th}°`, ['Polar deflection α = coefficient × θs, less C forward, plus C back']);
    const x0 = 16, cw = (W - 32) / 12, rh = 20, gy = y0 + 4;
    c.font = `600 10px ${F}`; c.textAlign = 'center'; c.fillStyle = '#5c6168';
    c.fillText('TO↓ AT→', x0 + cw / 2, gy);
    c.fillStyle = 'rgba(29,95,135,.12)'; c.fillRect(x0 + cw * (s.at + 1), gy + 4, cw, rh * 11 + 2);
    c.font = `600 11px ${F}`;
    for (let a = 0; a <= 10; a++) { c.fillStyle = a === s.at ? '#24557a' : '#5c6168'; c.fillText(a === 0 ? 'T.P.' : a === 10 ? 'C.T.' : a, x0 + cw * (a + 1.5), gy); }
    const bad = [];
    for (let b = 0; b <= 10; b++) {
      const yy = gy + 4 + rh * (b + 1) - 5;
      c.font = `700 12px ${F}`; c.fillStyle = '#14202b'; c.fillText(b, x0 + cw / 2, yy);
      for (let a = 0; a <= 10; a++) {
        if (a === b) { c.fillStyle = '#9aa0a6'; c.font = `500 12px ${F}`; c.fillText('o', x0 + cw * (a + 1.5), yy); continue; }
        const p = PR14[`${b}/${a}`]; if (p != null && a === s.at) bad.push(`to ${b} prints ${p.toFixed(4)} for ${coef(b, a).toFixed(4)}`);
        c.font = `${p != null ? 700 : 500} 13px ${F}`; c.fillStyle = p != null ? '#b3362b' : '#2b3036';
        c.fillText((p ?? coef(b, a)).toFixed(4).slice(1), x0 + cw * (a + 1.5), yy);
      }
    }
    const b = s.at < 10 ? 10 : 0, k = coef(b, s.at), C = corr(s.th) / 60;   // col (1) for C.T. and col (15) for T.P. are both 1.00
    foot(c, W, H, [
      `To ${b === 10 ? 'C.T.' : 'T.P.'}: ${k.toFixed(4)} × ${s.th}° = ${dms(k * s.th, 1)}${C ? ` ${b > s.at ? '−' : '+'} C ${(C * 60).toFixed(1)}′` : ''}; true spiral: ${dms(trueAngle(s.at, b, s.th), 1)}`,
      bad.length ? 'Red, read on the page: ' + bad.slice(0, 2).join('; ') : 'Red cells: printed values read on the page that are wrong.',
    ], bad.length ? '#b3362b' : '#5c6168');
  },
  steps: [
    { title: 'Any station', text: 'Table 14 gives the coefficient for a polar deflection from any chord point to any other of a ten-chord spiral; multiply by θs (cl. 7.8.7).',
      check: { q: 'From T.P. to point 8 with θs = 30°, the deflection is…', options: ['0.2133 × 30° = 6.399°', '0.64 × 30° = 19.2°', '0.8 × 30° = 24°'], answer: 0, why: 'Table 14, note 2 (i): 0.2133 × 30° = 6.399°.' } },
    { title: 'The rule', text: 'Every coefficient is (b − a)(b + 2a)/300 forward and (a − b)(2a + b)/300 back. Fourteen printed cells break it; they are red.',
      check: { q: 'No correction C is needed when θs is at most…', options: ['20°', '30°', '45°'], answer: 0, why: 'For θs of 20° and less no correction is necessary (Table 14, note 3).' } },
    { title: 'True angle', text: 'Step the station and try θs 10° and 30°: the foot sets α against the angle on the true spiral.' },
  ],
  debug: s => ({ at: s.at, th: s.th, misprints: Object.keys(PR14).length, k80: coef(8, 0) }),
});

// ── Table 15 ────────────────────────────────────────────────────────────────────────────────────────────────────────
const shift = (R, Ls) => hc(Math.min(170, Ls / R * DEG + 20), R, Ls).S;
const COLS = [...new Set(T15.map(r => r[0]))].sort((a, b) => parseInt(b) - parseInt(a) || (a.endsWith('P') ? -1 : 1));
const ROWS15 = COLS.map(col => T15.filter(r => r[0] === col).sort((a, b) => a[1] - b[1]));
// beyond rounding: the long 50–100 km/h shifts run 3–4 mm high throughout (the book's series), so also ask for 0.4 %
const off15 = ([, R, Ls, s]) => { const e = shift(R, Ls); return Math.abs(s - e) > .0035 && Math.abs(s - e) / e > .004; };
const bad15 = T15.filter(off15);
const terrain = col => `${parseInt(col)} km/h, ${col.endsWith('P') ? 'plain' : 'hilly'}`;
export const table15 = tableSpread({
  ...shiftFig,
  state: { c: COLS.indexOf('40H'), i: 0 },
  curve: s => { const [, R, Ls] = ROWS15[s.c][s.i]; return [Math.min(170, Ls / R * DEG + 30), R, Ls]; },
  actions: (s, go) => [
    { label: 'Speed −', run: () => { s.c = Math.min(COLS.length - 1, s.c + 1); s.i = 0; go(); } }, { label: 'Speed +', run: () => { s.c = Math.max(0, s.c - 1); s.i = 0; go(); } },
    { label: 'Row −', run: () => { s.i = Math.max(0, s.i - 1); go(); } }, { label: 'Row +', run: () => { s.i = Math.min(ROWS15[s.c].length - 1, s.i + 1); go(); } },
    { label: 'Next misprint', run: () => {
      const all = ROWS15.flatMap((rs, c) => rs.map((r, i) => [c, i, r])), cur = all.findIndex(([c, i]) => c === s.c && i === s.i);
      [s.c, s.i] = [...all.slice(cur + 1), ...all.slice(0, cur + 1)].find(([, , r]) => off15(r)); go();
    } },
  ],
  card(c, W, H, s) {
    const rs = ROWS15[s.c], [, R, Ls] = rs[s.i];
    const y = head(c, W, `TABLE 15 · SHIFT · ${terrain(COLS[s.c]).toUpperCase()}`, [`Rc ${R} m, Ls ${Ls} m: s = ${f3(shift(R, Ls))} m  (Ls²/24Rc = ${f3(Ls * Ls / 24 / R)} m)`]);
    const view = near(rs, s.i, 3);
    table(c, W, y + 6, [{ h: 'RC (m)', w: .2 }, { h: 'LS (m)', w: .45 }, { h: 'BOOK S', w: .72 }, { h: 'EXACT S', w: 1 }],
      view.map(([r]) => [`${r[1]}`, `${r[2]}`, { t: f3(r[3]), bad: off15(r) }, f3(shift(r[1], r[2]))]), { sel: selOf(view, s.i) });
    foot(c, W, H, ['The shift for each Table 9 length: how far the circle moves in to take the spirals.', `${bad15.length} printed shifts, read on the page, are beyond rounding: “Next misprint”.`]);
  },
  steps: [
    { title: 'How far in', text: 'Table 15 gives the shift for the Table 9 transition at each radius and speed: how far the circle moves in to make room (cl. 7.10.2).',
      check: { q: 'A 55 m transition on an 80 m radius needs a shift of…', options: ['1.567 m', '7.367 m', '0.375 m'], answer: 0, why: 'Table 15 gives 1.567 m; the text then says “7.367 m” for the same move, a misprint (cl. 7.10.2).' } },
    { title: 'Misprints', text: 'Press "Next misprint": 25 km/h hilly at 100 m prints 0.944 for 0.094, a slipped decimal point.' },
  ],
  debug: s => { const r = ROWS15[s.c][s.i]; return { col: r[0], R: r[1], Ls: r[2], book: r[3], exact: +f3(shift(r[1], r[2])), bad: bad15.length, cols: COLS }; },
});

// ── Table 16 ────────────────────────────────────────────────────────────────────────────────────────────────────────
const t16x = d => [100 * Math.tan(d * RAD / 2), 100 * (1 / Math.cos(d * RAD / 2) - 1), 100 * d * RAD];
const off16 = (v, e) => v != null && Math.abs(v - e) > 3e-5;            // beyond the last printed digit
const bad16 = T16.filter(([d, ...v]) => v.some((x, j) => off16(x, t16x(d)[j]))).map(r => r[0]);
const f5 = v => v.toFixed(5);
export const table16 = tableSpread({
  ...unit,
  state: { i: 15, r: 100 },
  curve: s => [T16[s.i][0], s.r, 0],
  actions: (s, go) => [
    ...stepper('Δ', () => s.i, v => { s.i = v; }, T16.length, go),
    { label: 'Next misprint', run: () => { s.i = nextOf(T16, s.i, bad16); go(); } },
    ...[100, 250].map(v => ({ label: `Rc ${v} m`, toggle: () => s.r === v, run: () => { s.r = v; go(); } })),
  ],
  card(c, W, H, s) {
    const d = T16[s.i][0], e = t16x(d), m = s.r / 100;
    const y = head(c, W, `TABLE 16 · CIRCULAR CURVE · Δ ${d}°`, [
      'T = 100 tan Δ/2,  E = 100 (sec Δ/2 − 1),  L = 100 Δ (rad)',
      `Rc ${s.r} m: T ${(e[0] * m).toFixed(3)}, E ${(e[1] * m).toFixed(3)}, L ${(e[2] * m).toFixed(3)} m`,
    ]);
    const view = near(T16, s.i);
    table(c, W, y + 6, [{ h: 'Δ', w: .07 }, { h: 'BOOK T', w: .24 }, { h: 'EXACT', w: .4 }, { h: 'BOOK E', w: .55 }, { h: 'EXACT', w: .69 }, { h: 'BOOK L', w: .85 }, { h: 'EXACT', w: 1 }],
      view.map(([[dd, ...v]]) => { const x = t16x(dd); return [`${dd}°`, ...v.flatMap((p, j) => [{ t: p == null ? '—' : f5(p), bad: off16(p, x[j]) }, f5(x[j])])]; }), { sel: selOf(view, s.i), size: 11 });
    foot(c, W, H, ['Printed for 100 m radius; multiply by Rc / 100 (Appendix 2).', `${bad16.length} rows hold a value read on the page and wrong: “Next misprint”.`]);
  },
  steps: [
    { title: 'Unit circle', text: 'Table 16 gives the tangent length, apex distance and arc length of a circular curve of 100 m radius; multiply by Rc/100 (Appendix 2).',
      check: { q: 'For Rc 250 m and Δ 16°, the tangent length is…', options: ['2.5 × 14.054 = 35.14 m', '14.054 m', '250 × 14.054 m'], answer: 0, why: 'Multiply the 100 m value by 250/100. The book prints 13.05408 at 16°; 100 tan 8° is 14.05408.' } },
    { title: 'Misprints', text: 'Press "Next misprint". Several slips are a single digit: 14° L prints 22.43461 for 24.43461.' },
  ],
  debug: s => ({ d: T16[s.i][0], bad16 }),
});

// ── Table 17 ────────────────────────────────────────────────────────────────────────────────────────────────────────
const toD = t => { if (t == null) return null; const [a, m, x] = String(t).split(':').map(Number); return a + m / 60 + x / 3600; };
const ARCS = [10, 20, 50];
function rows17(R, r) {
  const row = (label, p, e, fmt, tol) => [label, p == null ? '—' : { t: fmt(p), bad: e != null && Math.abs(p - e) > tol }, e == null ? 'over 2R' : fmt(e)];
  return [
    row('Deflection, 1 m of arc', r[4], 1718.873 / R, v => v.toFixed(4) + '′', .002),
    ...ARCS.map((l, j) => row(`Chord of a ${l} m arc`, r[1 + j], 2 * R * Math.sin(l / (2 * R)), v => v.toFixed(4), 2e-4)),
    ...ARCS.map((l, j) => row(`Deflection, ${l} m arc`, toD(r[5 + j]), l / (2 * R) * DEG, v => dms(v, 2), .5 / 3600)),
    ...ARCS.map((l, j) => row(`Deflection, ${l} m chord`, toD(r[8 + j]), l <= 2 * R ? Math.asin(l / (2 * R)) * DEG : null, v => dms(v, 2), .5 / 3600)),
  ];
}
export const table17 = tableSpread({
  size: { w: 10, h: 8.4, px: 46 },
  state: { i: T17.findIndex(r => r[0] === 100), arc: 10 },
  curve: s => { const R = T17[s.i][0]; return [Math.min(150, 10 * s.arc / R * DEG), R, 0]; },
  pegs: (s, L, k) => {
    const R = k.R, h = k.delta / 2, n = Math.min(10, Math.floor(k.Lc / s.arc + 1e-6));
    return { pts: Array.from({ length: n + 1 }, (_, i) => { const del = s.arc * i / (2 * R), C = 2 * R * Math.sin(del); return [L.TP[0] + C * Math.cos(h - del), L.TP[1] + C * Math.sin(h - del)]; }), at: 0 };
  },
  actions: (s, go) => [
    ...stepper('Rc', () => s.i, v => { s.i = v; }, T17.length, go),
    ...ARCS.map(v => ({ label: `Pegs every ${v} m`, toggle: () => s.arc === v, run: () => { s.arc = v; go(); } })),
  ],
  card(c, W, H, s) {
    const r = T17[s.i], R = r[0];
    const y = head(c, W, `TABLE 17 · CIRCULAR CURVE · Rc ${R} m`, ['Chord = 2R sin (l / 2R);  deflection for an arc l: l / 2R', 'for a chord C: sin⁻¹ (C / 2R);  1 m of arc: 1718.87′ / R']);
    table(c, W, y + 4, [{ h: '', w: .42 }, { h: 'BOOK', w: .71 }, { h: 'EXACT', w: 1 }], rows17(R, r), { rh: 17, size: 12 });
    foot(c, W, H, ['Pegs: the theodolite at T.P. turns l/2R to each; the chain lays the chord.', 'Red: printed values read on the page that are wrong.']);
  },
  steps: [
    { title: 'By deflection', text: 'Table 17 gives, for each radius, the deflection for arcs of 1, 10, 20 and 50 m, chord lengths and the deflection for chords (Appendix 2).',
      check: { q: 'The deflection angle for an arc l on radius R is…', options: ['l / 2R radians', 'l / R radians', 'sin⁻¹ (l / R)'], answer: 0, why: 'The angle between tangent and chord is half the central angle l/R (Appendix 2).' } },
    { title: 'Check it', text: 'Step Rc. At 100 m two chords are misprinted; at 300 m two arc deflections; at 400 and 600 m the 1 m deflection.' },
  ],
  debug: s => { const r = T17[s.i]; return { R: r[0], arc: s.arc, bad: rows17(r[0], r).filter(x => x[1]?.bad).map(x => x[0]) }; },
});
export const BAD = { t13: bad13, t15: bad15.map(r => r.slice(0, 3).join(' ')), t16: bad16, t17: T17.map(r => [r[0], rows17(r[0], r).filter(x => x[1]?.bad).map(x => x[0])]).filter(x => x[1].length) };
