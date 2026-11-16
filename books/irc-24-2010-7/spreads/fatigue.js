// Chapter 7 · fatigue (cl. 511).
//   cycles    (cl. 511.1, 511.2.1)      load cycles; what the clause leaves out; the thickness correction μr
//   gamma     (cl. 511.2.3, Table 18)   γmft from inspection and from the consequence of failure
//   category  (cl. 511.3, Table 19)     detail categories of common details
//   sn        (cl. 511.4, Fig. 11)      the S-N curve: fatigue strength against number of cycles
//   assess    (cl. 511.2.2.3, 511.5)    low fatigue, and the check under a constant stress range
//   miner     (cl. 511.5.2.4)           a spectrum of stress ranges and the damage it adds up to
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, sit, girderBridge, truck, arrow, box, cyl, paint, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, OXIDE_HEX, TAG } from '../../_irc24/kit.js';
import { GAMMA_MFT, muR, fatigueStrength, fatigueLife, lowFatigue, DETAILS } from '../../_irc24/steel.js';

const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** 2000000 → 2 × 10⁶ */
const sci = N => { if (!isFinite(N)) return 'no limit'; const e = Math.floor(Math.log10(N) + 1e-9), m = +(N / 10 ** e).toFixed(1); return `${m === 1 ? '' : m + ' × '}10${String(e).replace(/\d/g, d => SUP[d])}`; };
const WELD = paint(0x6f7a84, .4, .6), REDM = new THREE.MeshBasicMaterial({ color: 0xc23b2f, toneMapped: false });
/** A lorry crossing to and fro; returns its x so a caller can count the crossings. */
const crossing = (b, tk, t, sag = .16) => { const x = Math.sin(t * .8) * 6.5, f = X => -sag * (1 - (2 * X / 17) ** 2); b.bend(f); tk.position.set(x, b.top + f(x), 0); tk.rotation.y = Math.cos(t * .8) < 0 ? Math.PI : 0; return x; };
const counter = () => { let N = 0, side = 1; return { tick(x) { const s = Math.sign(x || 1); if (s !== side) { side = s; N++; } return N; }, reset() { N = 0; }, get n() { return N; } }; };
/** A crack that opens upward from the soffit of the near girder at mid-span. */
const crackOn = b => { const c = box(.14, .5, .9, REDM, 0, 2.72, 1.5); c.geometry.translate(0, .25, 0); c.visible = false; b.g.add(c); return c; };
/** A bar beside the bridge: fill = a stress range, a red line at a limit, both against max. */
function gauge(group, holo) {
  const GX = -6.5, GY = 5.2, GZ = -9, lb = holo.label("stress range", { h: .9, color: INK }), ll = holo.label("limit", { h: .75, color: "#b3362b" }); lb.position.set(GX, GY + 4.8, GZ); group.add(lb, ll, box(.3, GY - .5, .3, SM.steel, GX, (GY + .5) / 2, GZ));   // above and behind the deck, clear of the truck and the cards
  const fill = box(1, 1, 1, paint(0x2f8f55, .5, .2)), frame = holo.wireBox(1.05, 4.05, 1.05, holo.DIM), line = box(1.6, .08, 1.6, REDM);
  fill.geometry.translate(0, .5, 0); fill.position.set(GX, GY, GZ); frame.position.set(GX, GY + 2.03, GZ); line.position.set(GX, 0, GZ); group.add(fill, frame, line);
  return { set(v, lim, max, bad) { fill.scale.y = Math.max(.02, Math.min(1, v / max) * 4); fill.material.color.setHex(bad ? 0xc23b2f : 0x2f8f55); line.visible = lim != null; if (lim != null) line.position.y = GY + Math.min(1, lim / max) * 4; ll.visible = line.visible; ll.position.set(GX + 2, line.position.y, GZ); } };
}

// ---------------------------------------------------------------- 1 · cycles and the thickness correction
const mu1 = st => st.flush ? 1 : muR(st.tp);
export const cycles = spread({
  river: true, init: { tp: 25, flush: false },
  chips: [['flush', [false, true], v => v ? 'Ground flush and tested' : 'As welded']],
  slider: { key: 'tp', name: 'tp', label: 'plate thickness · drag', values: [12, 16, 20, 25, 32, 40, 50, 63, 80, 100] },
  model({ holo, group, st }) {
    const b = girderBridge({ L: 17, d: 1, H: 2.6 }); group.add(sit(b.g)); const tk = truck(.32); b.g.add(tk);
    const j = new THREE.Group(), m = paint(), pA = box(2.4, 1, 2.6, m, -1.3, 0, 0), pB = box(2.4, 1, 2.6, m, 1.3, 0, 0), bead = box(.5, 1, 2.6, WELD); j.position.set(6.6, .55, -1.7); j.add(pA, pB, bead); group.add(j);
    const tag = holo.label('', TAG), cnt = counter(); tag.position.set(0, 8.4, -5); group.add(tag);
    return {
      place() { const t = st.tp * .013; for (const p of [pA, pB]) { p.scale.y = t; p.position.y = t / 2; } bead.scale.y = st.flush ? t : t + .25; bead.position.y = bead.scale.y / 2; },
      update(dt, t) { const n = cnt.tick(crossing(b, tk, t)); tag.userData.setText(`${n} load cycles · μr = ${mu1(st).toFixed(2)}`); },
      debug: () => ({ mu: +mu1(st).toFixed(3) }),
    };
  },
  draw(c, W, H, st) {
    head(c, 'FATIGUE · cl. 511.1, 511.2.1');
    let y = lines(c, 'Not covered: corrosion fatigue · low cycle (high stress) fatigue · thermal fatigue · stress corrosion cracking · temperatures above 150 °C · temperatures below the brittle transition.', 18, 54, W - 36, 18, DIMC, `500 13px ${F}`);
    y = kv(c, W, [['Standard S-N curves: transverse welds join plates up to', '25 mm'], ['Thicker plate being joined, tp', `${st.tp} mm`], ['μr = (25 / tp)^0.25 ≤ 1.0', mu1(st).toFixed(2), OXIDE]], y + 14, 28);
    lines(c, st.flush ? 'Full penetration butt weld, reinforcement machined flush and proved free of defect by non-destructive testing: no thickness correction.' : 'The values from the standard S-N curve are multiplied by μr when plates thicker than 25 mm are joined by transverse fillet or butt welding.', 18, y + 4, W - 36, 18, INK, `500 13.5px ${F}`);
    foot(c, H, 'Reference: redundant load path, regular inspection, mild corrosion');
  },
  steps: [
    { title: 'Many small loads', text: 'No single lorry harms the bridge. But every crossing is a cycle of stress, and millions of them can start a crack at a detail.',
      check: { q: 'Clause 511 does not cover… (cl. 511.1)', options: ['low cycle (high stress) fatigue', 'welded details', 'bolted connections'], answer: 0, why: 'It does not cover corrosion fatigue, low cycle (high stress) fatigue, thermal fatigue, stress corrosion cracking, or the effects of high (> 150 °C) and low temperature (cl. 511.1).' } },
    { title: 'Thick plates', text: 'Drag the plate thickness. The standard curves are for transverse welds joining plates up to 25 mm; thicker joints are worse.',
      check: { q: 'For plates thicker than 25 mm joined by transverse welds, the correction is μr = … (cl. 511.2.1)', options: ['(25 / tp)^0.25', '25 / tp', '(tp / 25)^0.5'], answer: 0, why: 'μr = (25/tp)^0.25 ≤ 1.0, with tp the actual thickness in mm of the thicker plate being joined (cl. 511.2.1).' } },
    { title: 'A flush weld', text: 'Pick Ground flush and tested. The weld is machined level with the plate and proved sound.',
      check: { q: 'No thickness correction is needed when butt weld reinforcements are…', options: ['machined flush and proved free of defect by NDT', 'painted', 'made on site'], answer: 0, why: 'No thickness correction is necessary when full penetration butt weld reinforcements are machined flush and proved free of defect through non-destructive testing (cl. 511.2.1).' } },
  ],
});

// ---------------------------------------------------------------- 2 · partial safety factor for fatigue strength
const gm = st => GAMMA_MFT[st.insp][st.fs ? 0 : 1];
export const gamma = spread({
  river: true, init: { insp: 'good', fs: true },
  chips: [['insp', ['good', 'poor'], v => v === 'good' ? 'Inspection, access good' : 'Inspection, access poor'], ['fs', [true, false], v => v ? 'Fail-safe' : 'Non-fail-safe']],
  model({ holo, group, st }) {
    const B = [girderBridge({ L: 17, d: 1, n: 4, gap: 1.05, H: 2.6 }), girderBridge({ L: 17, d: 1, n: 2, gap: 2.6, H: 2.6 })], T = B.map(b => { group.add(sit(b.g)); const tk = truck(.32); b.g.add(tk); const c = crackOn(b); c.visible = true; c.scale.y = 1.4; c.position.z = (b.w - 1.4) / 2; return tk; });
    const tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag);
    return {
      place() { B[0].g.visible = st.fs; B[1].g.visible = !st.fs; B[1].mat.color.setHex(0xc23b2f); tag.userData.setText(st.fs ? 'one girder cracks: the others carry on' : 'one girder cracks: the span is lost'); },
      update(dt, t) { const i = st.fs ? 0 : 1; crossing(B[i], T[i], t, st.fs ? .18 : .9); },
      debug: () => ({ gm: gm(st) }),
    };
  },
  draw(c, W, H, st) {
    head(c, 'PARTIAL SAFETY FACTOR γmft · Table 18');
    c.font = `600 12px ${F}`; c.fillStyle = DIMC; c.textAlign = 'right'; c.fillText('fail-safe', W - 120, 50); c.fillText('non-fail-safe', W - 18, 50); c.textAlign = 'left';
    [['good', 'Periodic inspection, access good'], ['poor', 'Periodic inspection, access poor']].forEach(([k, t], i) => {
      const y = 76 + i * 28; if (k === st.insp) { c.fillStyle = 'rgba(138,63,28,.14)'; c.fillRect(10, y - 18, W - 20, 26); }
      c.fillStyle = INK; c.font = `500 14px ${F}`; c.fillText(t, 18, y); c.textAlign = 'right';
      GAMMA_MFT[k].forEach((v, j) => { const on = k === st.insp && (j === 0) === st.fs; c.fillStyle = on ? OXIDE : DIMC; c.font = `${on ? 700 : 500} 15px ${F}`; c.fillText(v.toFixed(2), j ? W - 18 : W - 120, y); }); c.textAlign = 'left';
    });
    c.fillStyle = OXIDE; c.font = `700 21px ${F}`; c.fillText(`γmft = ${gm(st).toFixed(2)}`, 18, 150);
    const y = lines(c, st.fs ? 'Fail-safe: local failure of one component by a fatigue crack does not bring down the structure, because another load path is available (a redundant system).' : 'Non-fail-safe: local failure of one component leads rapidly to failure of the structure, because it is non-redundant.', 18, 176, W - 36, 18);
    kv(c, W, [['Partial safety factor for loads, γfft', '1.0']], y + 12, 26);
    foot(c, H, 'γmft: consequence of damage and level of inspection (511.2.3.2)');
  },
  steps: [
    { title: 'What if it cracks', text: 'With four girders, one cracked girder is carried by the rest. With two, there is nowhere for the load to go.',
      check: { q: 'A fail-safe component is one where a fatigue crack… (cl. 511.2.3.3)', options: ['does not cause failure of the structure: another load path exists', 'cannot start at all', 'is repaired the same day'], answer: 0, why: 'Local failure of one component due to a fatigue crack does not result in failure of the structure, due to the availability of an alternative load path (cl. 511.2.3.3 a).' } },
    { title: 'Can it be seen', text: 'Switch inspection and access to poor. A crack that cannot be found in time needs a larger margin.',
      check: { q: 'Non-fail-safe detail, inspection and access poor: γmft = … (Table 18)', options: ['1.35', '1.00', '1.15'], answer: 0, why: 'Table 18: fail-safe 1.00 (good) and 1.15 (poor); non-fail-safe 1.25 (good) and 1.35 (poor).' } },
    { title: 'The load side', text: 'On the load side nothing is added for fatigue.',
      check: { q: 'The partial safety factor for loads in fatigue design is… (cl. 511.2.3.1)', options: ['1.0', '1.5', '1.25'], answer: 0, why: 'Unless uncertainty in the loads demands a higher value, the partial safety factor for loads in the evaluation of stress range shall be taken as 1.0 (cl. 511.2.3.1).' } },
  ],
});

// ---------------------------------------------------------------- 3 · detail categories
const CHIP = { plate: 'Rolled product', bolted: 'Bolted · sheared edge', gascut: 'Gas-cut edge', lwauto: 'Long weld · automatic', lwstop: 'Long weld · stop-starts', lwone: 'Long weld · one side', lwint: 'Long weld · intermittent',
  buttflush: 'Butt weld · ground flush', butt: 'Butt splice', backing: 'Butt · backing bar', stiff: 'Stiffener', cover: 'Cover plate end', cruci: 'Cruciform · fillet' };
function detail(k, m) {
  const g = new THREE.Group(), P = (w, h, d, x, y, z, mat = m) => g.add(box(w, h, d, mat, x, y, z)), web = () => P(11, 2.2, .25, 0, 1.25, 0);
  if (['buttflush', 'butt', 'backing'].includes(k)) { P(5.4, .3, 3.2, -2.8, 0, 0); P(5.4, .3, 3.2, 2.8, 0, 0); } else P(11, .3, 3.2, 0, 0, 0);
  if (k === 'bolted') { P(5, .3, 3.2, 0, .3, 0); for (const x of [-1.6, 0, 1.6]) for (const z of [-.9, .9]) g.add(cyl(.22, .5, SM.steel, x, .5, z, 6)); }
  if (k === 'gascut') P(11, .34, .08, 0, 0, 1.62, REDM);
  if (k === 'lwauto') { web(); for (const z of [-.2, .2]) P(11, .16, .16, 0, .23, z, WELD); }
  if (k === 'lwstop') { web(); for (const z of [-.2, .2]) for (const x of [-2.85, 2.85]) P(5.3, .16, .16, x, .23, z, WELD); }
  if (k === 'lwone') { web(); P(11, .16, .16, 0, .23, .2, WELD); }
  if (k === 'lwint') { web(); for (const z of [-.2, .2]) for (const x of [-4, -1.35, 1.35, 4]) P(1.6, .16, .16, x, .23, z, WELD); }
  if (k === 'buttflush') P(.2, .3, 3.2, 0, 0, 0, WELD);
  if (k === 'butt' || k === 'backing') P(.5, .42, 3.2, 0, .02, 0, WELD);
  if (k === 'backing') P(1.3, .16, 3.9, 0, -.23, 0);
  if (k === 'stiff') { P(.25, 2, 3.2, 0, 1.15, 0); for (const x of [-.2, .2]) P(.16, .16, 3.2, x, .23, 0, WELD); }
  if (k === 'cover') { P(5.5, .25, 2.2, -2.75, .275, 0); P(.16, .2, 2.2, .08, .25, 0, WELD); }
  if (k === 'cruci') for (const s of [-1, 1]) { P(.3, 1.6, 3.2, 0, s * .95, 0); for (const x of [-.23, .23]) P(.16, .16, 3.2, x, s * .23, 0, WELD); }
  return g;
}
const det = st => DETAILS.find(d => d[0] === st.d);
export const category = spread({
  init: { d: 'plate' },
  chips: [['d', DETAILS.map(d => d[0]), v => CHIP[v]]],
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, 3, -5); g.rotation.x = .45; g.scale.setScalar(1.2); group.add(g);
    const m = paint(); let cur = null; for (const s of [-1, 1]) { const a = arrow(0xc23b2f, .09); a.position.set(s * 5.7, 0, 0); a.userData.len(s * 1.6); g.add(a); }
    const tag = holo.label('', TAG); tag.position.set(0, 8.8, -5); group.add(tag);
    return { place() { if (cur) { g.remove(cur); cur.traverse(o => o.geometry?.dispose()); } cur = detail(st.d, m); g.add(cur); tag.userData.setText(`detail category ${det(st)[1]}`); } };
  },
  draw(c, W, H, st) {
    const [, cat, what] = det(st);
    head(c, 'DETAIL CATEGORY · cl. 511.3, Table 19');
    c.fillStyle = OXIDE; c.font = `700 24px ${F}`; c.fillText(`Detail category ${cat}`, 18, 64);
    c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(18, 78, W - 36, 12); c.fillStyle = OXIDE; c.fillRect(18, 78, (W - 36) * cat / 118, 12);
    const y = lines(c, what + '.', 18, 114, W - 36, 19, INK, `500 14.5px ${F}`);
    kv(c, W, [['Strength ffn at 5 × 10⁶ cycles', `${cat} MPa`], ['Strength ff at 2 × 10⁶ cycles', `${fatigueStrength(cat, 2e6).toFixed(0)} MPa`]], y + 14, 27);
    foot(c, H, 'A detail not in the table: the lowest category of a similar detail');
  },
  steps: [
    { title: 'The detail sets the strength', text: 'Fatigue strength depends on the detail, not on the grade of steel. Pick each detail: the category is its strength in MPa at five million cycles.',
      check: { q: 'Plates, flats and rolled sections with no welds or holes are detail category… (Table 19 a)', options: ['118', '83', '52'], answer: 0, why: 'Rolled and extruded products, plates and flats, rolled sections and seamless tubes: detail category 118, with sharp edges and rolling flaws ground out (Table 19 a).' } },
    { title: 'Welds along the stress', text: 'Pick the four longitudinal welds. Every stop, start and gap in a weld is a place for a crack to begin.',
      check: { q: 'Intermittent longitudinal welds are detail category…', options: ['59', '92', '118'], answer: 0, why: 'Continuous automatic welds from both sides 92; with stop-start positions 83; from one side only 66; intermittent 59; at cope holes 52 (Table 19 b).' } },
    { title: 'Welds across the stress', text: 'Pick the stiffener and the cover plate end. Attachments welded across the stress are among the weakest details on a girder.',
      check: { q: 'The end zone of a welded cover plate, plates up to 25 mm thick, is detail category…', options: ['37', '66', '83'], answer: 0, why: 'End zones of single or multiple welded cover plates: 37 when tf or tp ≤ 25 mm, and 27 above 25 mm (Table 19 b).' } },
  ],
});

// ---------------------------------------------------------------- 4 · the S-N curve
const CATS = [118, 103, 92, 83, 66, 59, 52, 46, 41, 37, 33, 27], NS = [1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7, 2e7, 5e7, 1e8];
export const sn = spread({
  river: true, init: { cat: 83, N: 2e6 },
  chips: [['cat', [118, 103, 92, 83, 66, 52, 37, 27], v => `Category ${v}`]],
  slider: { key: 'N', name: 'N', label: 'cycles · drag', values: NS },
  model({ holo, group, st }) {
    const b = girderBridge({ L: 17, d: 1, H: 2.6 }); group.add(sit(b.g)); const tk = truck(.32); b.g.add(tk);
    const tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag);
    const gg = gauge(group, holo);
    return {
      place() { const ff = fatigueStrength(st.cat, st.N); gg.set(ff, null, fatigueStrength(118, 1e5), st.N > 5e6); tag.userData.setText(`${sci(st.N)} cycles: ff = ${ff.toFixed(0)} MPa`); },   // the bar is the stress range the detail can stand; red past 5 × 10⁶ where the slope changes
      update(dt, t) { crossing(b, tk, t); },
      debug: () => ({ ff: +fatigueStrength(st.cat, st.N).toFixed(1) }),
    };
  },
  draw(c, W, H, st) {
    const x0 = 44, w = W - 72, y0 = 172, h = 122, X = N => x0 + (Math.log10(N) - 5) / 3 * w, Y = f => y0 - (Math.log10(f) - 1) / 2 * h, ff = fatigueStrength(st.cat, st.N);
    head(c, 'S-N CURVE · cl. 511.4, Fig. 11');
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, Y(1000)); c.lineTo(x0, y0); c.lineTo(X(1e8), y0); c.stroke();
    c.fillStyle = DIMC; c.font = `500 10.5px ${F}`; for (const f of [10, 100, 1000]) c.fillText(String(f), x0 - 26, Y(f) + 4); for (const e of [5, 6, 7, 8]) c.fillText('10' + SUP[e], X(10 ** e) - 8, y0 + 13); c.fillText('MPa', x0 + 5, Y(1000) + 4);
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(5e6), y0); c.lineTo(X(5e6), Y(1000)); c.stroke(); c.setLineDash([]);
    for (const k of CATS) { const on = k === st.cat; c.strokeStyle = on ? OXIDE : 'rgba(92,97,104,.4)'; c.lineWidth = on ? 2.6 : 1; c.beginPath(); c.moveTo(X(1e5), Y(fatigueStrength(k, 1e5))); c.lineTo(X(5e6), Y(k)); c.lineTo(X(1e8), Y(fatigueStrength(k, 1e8))); c.stroke(); }
    c.fillStyle = INK; c.beginPath(); c.arc(X(st.N), Y(ff), 4.5, 0, 7); c.fill();
    kv(c, W, [[`Category ${st.cat}: ffn at 5 × 10⁶ cycles`, `${st.cat} MPa`], [`Number of stress cycles Nsc`, sci(st.N)], [st.N <= 5e6 ? 'ff = ffn ∛( 5 × 10⁶ / Nsc )' : 'ff = ffn ⁵√( 5 × 10⁶ / Nsc )', `${ff.toFixed(0)} MPa`, OXIDE]], 204, 25);
    foot(c, H, 'Shear: τf = τfn ⁵√( 5 × 10⁶ / Nsc ) · both scales logarithmic');
  },
  steps: [
    { title: 'More cycles, less stress', text: 'Drag the number of cycles. The stress range a detail can stand falls as the cycles mount up: a straight line on logarithmic paper.',
      check: { q: 'For Nsc up to 5 × 10⁶, the normal fatigue strength is ff = … (cl. 511.4)', options: ['ffn ∛(5 × 10⁶ / Nsc)', 'ffn × Nsc', 'ffn / 2'], answer: 0, why: 'ff = ffn (5 × 10⁶/Nsc)^(1/3) when Nsc ≤ 5 × 10⁶, and ffn (5 × 10⁶/Nsc)^(1/5) when 5 × 10⁶ ≤ Nsc ≤ 10⁸ (cl. 511.4).' } },
    { title: 'A change of slope', text: 'Past five million cycles, the dashed line, the curve flattens: the root changes from the third to the fifth.',
      check: { q: 'ffn is the fatigue strength of the detail for…', options: ['5 × 10⁶ cycles', '2 × 10⁶ cycles', '10⁸ cycles'], answer: 0, why: 'ffn and τfn are the normal and shear fatigue strength of the detail for 5 × 10⁶ cycles, for the detail category of Table 19 (cl. 511.4).' } },
    { title: 'A family of curves', text: 'Pick other categories. Every detail has the same shape of curve, set higher or lower.',
      check: { q: 'For shear stress, τf = τfn × … (cl. 511.4)', options: ['⁵√(5 × 10⁶ / Nsc)', '∛(5 × 10⁶ / Nsc)', '√(5 × 10⁶ / Nsc)'], answer: 0, why: 'τf = τfn (5 × 10⁶/Nsc)^(1/5) for shear stress (cl. 511.4, Fig. 12).' } },
  ],
});

// ---------------------------------------------------------------- 5 · assessment under a constant stress range
const as = st => { const mu = muR(st.tp), lf = lowFatigue(st.f, st.N, st.gm), ff = fatigueStrength(st.cat, st.N), ffd = mu * ff / st.gm; return { mu, ...lf, ff, ffd, ok: st.f <= ffd + 1e-9 }; };
export const assess = spread({
  river: true, init: { cat: 52, N: 2e6, f: 60, gm: 1.25, tp: 25 },
  chips: [['cat', [83, 66, 52, 37, 27], v => `Category ${v}`], ['N', [5e5, 2e6, 1e7, 1e8], v => `${sci(v)} cycles`], ['gm', [1, 1.15, 1.25, 1.35], v => `γmft ${v.toFixed(2)}`], ['tp', [25, 50], v => `tp ${v}`]],
  slider: { key: 'f', name: 'f', label: 'stress range · drag', values: range(10, 200, 10) },
  model({ holo, group, st }) {
    const b = girderBridge({ L: 17, d: 1, H: 2.6 }); group.add(sit(b.g)); const tk = truck(.32), crack = crackOn(b), cnt = counter(); b.g.add(tk);
    const tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag); let r = as(st), key = ''; const gg = gauge(group, holo);
    return {
      place() { r = as(st); gg.set(st.f, r.ffd, 200, !r.exempt && !r.ok); const k = JSON.stringify(st); if (k !== key) { key = k; cnt.reset(); } b.mat.color.setHex(r.exempt || r.ok ? OXIDE_HEX : 0xb0532a); tag.userData.setText(r.exempt ? 'low fatigue: no assessment needed' : r.ok ? 'f ≤ ffd' : 'f > ffd: a crack grows'); },   // the bar is the actual stress range f, the red line ffd
      update(dt, t) { const n = cnt.tick(crossing(b, tk, t)), bad = !r.exempt && !r.ok; crack.visible = bad && n > 0; crack.scale.y = Math.max(.05, Math.min(1, n / 12) * 2.6); },
      debug: () => ({ fLim: +r.fLim.toFixed(1), ff: +r.ff.toFixed(1), ffd: +r.ffd.toFixed(1), exempt: r.exempt, ok: r.ok }),
    };
  },
  draw(c, W, H, st) {
    const r = as(st), a = st.f <= r.fLim, b = st.N < r.nLim;
    head(c, 'FATIGUE ASSESSMENT · cl. 511.2.2.3, 511.5');
    const y = kv(c, W, [['Low fatigue: f ≤ 27 / γmft', `${r.fLim.toFixed(1)} MPa ${a ? '✓' : '—'}`, a ? OK : INK], ['or Nsc < 5 × 10⁶ ( 27/γmft ÷ γfft f )³', `${sci(+r.nLim.toPrecision(2))} ${b ? '✓' : '—'}`, b ? OK : INK], ['ff for Nsc, from the S-N curve', `${r.ff.toFixed(0)} MPa`], ['ffd = μr ff / γmft', `${r.ffd.toFixed(0)} MPa`, OXIDE]], 58, 28);
    c.fillStyle = r.exempt || r.ok ? OK : BAD; c.font = `700 16px ${F}`; c.fillText(r.exempt ? 'No fatigue assessment required' : r.ok ? `✓ f = ${st.f} MPa ≤ ffd` : `✗ f = ${st.f} MPa > ffd`, 18, y + 12);
    kv(c, W, [['The stress range never exceeds', '1.5 fy · shear 1.5 fy/√3']], y + 44, 26);
    lines(c, 'If f is below the design strength at 5 × 10⁶ cycles, no further assessment is needed at that point (511.5.1).', 18, y + 62, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, `Category ${st.cat}, ${sci(st.N)} cycles, μr ${r.mu.toFixed(2)}, γfft 1.0`);
  },
  steps: [
    { title: 'Too small to matter', text: 'Drag the stress range right down. Below 27/γmft, or with few enough cycles, no fatigue assessment is required.',
      check: { q: 'Fatigue assessment is not required if the design stress range f is not more than… (cl. 511.2.2.3)', options: ['27 / γmft', '0.6 fy', '118 MPa'], answer: 0, why: 'f ≤ 27/γmft, or the number of stress cycles Nsc < 5 × 10⁶ (27/γmft / γfft f)³ (cl. 511.2.2.3).' } },
    { title: 'The check', text: 'Raise the stress range. It must stay within the design fatigue strength for the life of the bridge.',
      check: { q: 'Under a constant stress range, f ≤ ffd = … (cl. 511.5.2.3)', options: ['μr ff / γmft', 'ff × γmft', 'fy / γm0'], answer: 0, why: 'f ≤ ffd = μr ff/γmft, where ff is the fatigue strength range for the actual life cycle Nsc from cl. 511.4 (cl. 511.5.2.3).' } },
    { title: 'A hard ceiling', text: 'Whatever the detail and the number of cycles, the stress range has an upper bound.',
      check: { q: 'The maximum normal stress range shall not exceed… (cl. 511.5.2.2)', options: ['1.5 fy', '0.6 fy', '3 fy'], answer: 0, why: 'The maximum stress range shall not exceed 1.5 fy for normal stresses and 1.5 fy/√3 for shear stresses under any circumstance (cl. 511.5.2.2).' } },
  ],
});

// ---------------------------------------------------------------- 6 · a spectrum of stress ranges
const SPEC = [[90, 2e5, 'heavy'], [60, 1e6, 'medium'], [35, 5e6, 'light']];   // illustrative: stress range MPa, cycles in the life of the bridge
const mn = st => { const ref = st.cat / st.gm, rows = SPEC.map(([f, n, name]) => { const fi = f * st.k, N = fatigueLife(ref, fi); return { name, f: fi, n, N, D: n / N }; }); return { ref, rows, D: rows.reduce((s, r) => s + r.D, 0) }; };
export const miner = spread({
  river: true, init: { cat: 66, gm: 1.15, k: 1 },
  chips: [['cat', [92, 83, 66, 52, 37], v => `Category ${v}`], ['gm', [1, 1.15, 1.25, 1.35], v => `γmft ${v.toFixed(2)}`]],
  slider: { key: 'k', name: 'Load', label: 'load level · drag', values: range(.5, 1.5, .1) },
  model({ holo, group, st }) {
    const b = girderBridge({ L: 17, d: 1, H: 2.6 }); group.add(sit(b.g));
    const tks = [.4, .3, .22].map((k, i) => { const t = truck(k); t.position.set(-5 + i * 5, b.top, 0); b.g.add(t); return t; });
    const fill = box(1, 1, 1, paint(0x2f8f55, .5, .2)), frame = holo.wireBox(1.05, 4.05, 1.05, holo.DIM); frame.position.set(9.4, 2.55, -1.6); fill.geometry.translate(0, .5, 0); fill.position.set(9.4, .52, -1.6); group.add(fill, frame);
    const tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag);
    return {
      place() { const r = mn(st); fill.scale.y = Math.max(.02, Math.min(1, r.D) * 4); fill.material.color.setHex(r.D > 1 ? 0xc23b2f : 0x2f8f55); tag.userData.setText(`damage sum ${r.D.toFixed(2)}${r.D > 1 ? ' > 1' : ''}`); },
      update(dt, t) { const f = X => -.16 * (1 - (2 * X / 17) ** 2); tks.forEach((k, i) => { const x = ((t * 1.6 + i * 5.6) % 17) - 8.5; k.position.set(x, b.top + f(x), 0); }); },
      debug: () => { const r = mn(st); return { ref: +r.ref.toFixed(1), D: +r.D.toFixed(3) }; },
    };
  },
  draw(c, W, H, st) {
    const r = mn(st), ok = r.D <= 1 + 1e-9, col = [18, 130, 232];
    head(c, 'VARIABLE STRESS RANGE · cl. 511.5.2.4');
    c.fillStyle = DIMC; c.font = `600 12px ${F}`; ['lorries', 'range f, MPa', 'cycles n'].forEach((t, i) => c.fillText(t, col[i], 52)); c.textAlign = 'right'; c.fillText('life N', W - 86, 52); c.fillText('n / N', W - 18, 52); c.textAlign = 'left';
    r.rows.forEach((q, i) => {
      const y = 78 + i * 26; c.fillStyle = INK; c.font = `500 14.5px ${F}`; c.fillText(q.name, col[0], y); c.fillText(q.f.toFixed(0), col[1], y); c.fillText(sci(q.n), col[2], y);
      c.textAlign = 'right'; c.fillText(sci(+q.N.toPrecision(2)), W - 86, y); c.font = `700 14.5px ${F}`; c.fillText(isFinite(q.N) ? q.D.toFixed(2) : '0', W - 18, y); c.textAlign = 'left';
    });
    c.fillStyle = ok ? OK : BAD; c.font = `700 17px ${F}`; c.fillText(`${ok ? '✓' : '✗'} Sum of n / N = ${r.D.toFixed(2)} ${ok ? '≤' : '>'} 1.0`, 18, 172);
    lines(c, `Strength at 5 × 10⁶ cycles: ffn / γmft = ${r.ref.toFixed(0)} MPa. A range at or above it has N = 5 × 10⁶ (ffn/γmft ÷ f)³; a smaller one, the same to the fifth power; under 0.55 of it, the range is disregarded.`, 18, 198, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, 'Spectrum illustrative · the life N follows the S-N curve of cl. 511.4');
  },
  steps: [
    { title: 'Not every lorry is the same', text: 'Real traffic gives many stress ranges, each with its own number of cycles. Each uses up a share n/N of the fatigue life.',
      check: { q: 'Under variable stress ranges, the shares of life used must add up to… (cl. 511.5.2.4)', options: ['not more than 1.0', 'exactly 2.0', 'not more than 0.5'], answer: 0, why: 'The summation over all stress ranges of ni fi³ and nj fj⁵, each divided by 5 × 10⁶ times the matching power of μ ffn/γmft, shall not exceed 1.0 (cl. 511.5.2.4).' } },
    { title: 'Heavier traffic', text: 'Drag the load level up. Damage grows with the third or fifth power of the stress range, so a little more load costs a lot of life.',
      check: { q: 'Stress ranges may be disregarded in the summation when they are less than…', options: ['0.55 of the strength at 5 × 10⁶ cycles', 'the dead load stress', '27 MPa always'], answer: 0, why: 'All normal and shear stress ranges having magnitude less than 0.55 μc ffn and 0.55 μc τfn may be disregarded (cl. 511.5.2.4).' } },
    { title: 'A better detail', text: 'Pick a higher detail category, or a smaller γmft. The same traffic then does less harm.',
      check: { q: 'No fatigue assessment is necessary if the highest normal stress range is not more than… (cl. 511.6)', options: ['27 μc / γmft', '67 μc / γmft', '118 MPa'], answer: 0, why: 'ffmax ≤ 27 μc/γmft for normal stress, τfmax ≤ 67 μc/γmft for shear, or Nsc ≤ 5 × 10⁶ (27 μc / γmft ffeq)³ (cl. 511.6).' } },
  ],
});
