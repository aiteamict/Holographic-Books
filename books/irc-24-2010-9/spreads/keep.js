// Chapter 9, spreads 6–9 · keeping the bridge, and the annexes (Annexes D to G).
//   durable  (Annex D)  exposure conditions and corrosion protection
//   inspect  (Annex E)  how often a bridge is inspected
//   test     (Annex F)  load testing: the acceptance test and its criteria
//   wsm      (Annex G)  the working stress method: permissible stresses and their increase
import * as THREE from 'three';
import { spread, sit, girderBridge, truck, box, paint, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, OXIDE_HEX, TAG } from '../../_irc24/kit.js';
import { acceptanceLoad, TABLE_F1, TABLE_G1, TABLE_G2, permissible } from '../../_irc24/steel.js';
import { range, mark, GRADES } from './fabricate.js';

const bridge = group => { const b = girderBridge({ L: 17, d: 1, H: 2.6 }); group.add(sit(b.g)); const tk = truck(.32); b.g.add(tk); return { b, tk }; };
const sag = (b, tk, k, x = 0) => { const f = X => -k * (1 - (2 * X / 17) ** 2); b.bend(f); tk.position.set(x, b.top + f(x), 0); };

// ---------------------------------------------------------------- 6 · durability
const EXPO = [
  ['Mild', 'Surfaces normally protected against exposure to weather or aggressive conditions, except in coastal areas.', 0x9a4c33],
  ['Moderate', 'Exposed to condensation and rain · continuously under water · non-aggressive soil or groundwater · sheltered from saturated salt air in coastal areas.', 0x91482f],
  ['Severe', 'Severe frequent rain · alternate wetting and drying · severe condensation · completely immersed in sea water · saturated salt air in a coastal area.', 0x84462e],
  ['Very severe', 'Sea water spray · corrosive fumes · aggressive subsoil or groundwater.', 0x74442f],
  ['Extreme', 'Tidal zones and splash zones in the sea · aggressive liquid or solid chemicals. Protection as per specialist literature.', 0x62412f],
];
export const durable = spread({
  river: true, init: { e: 1 },
  chips: [['e', [0, 1, 2, 3, 4], v => EXPO[v][0]]],
  model({ holo, group, st }) {
    const { b, tk } = bridge(group); sag(b, tk, .12, -2);
    const coats = [0xb8bcc0, 0xa33a2a, 0x7d8a94, 0x4f6f8a, 0x2f5d7c].map((c, i) => { const m = box(3.4, .22, 2.6, paint(c, .6, .1), 8.6, .7 + i * .24, -1.4); group.add(m); return m; });
    const tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag);
    return { place() { b.mat.color.setHex(EXPO[st.e][2]); coats.forEach((m, i) => { m.visible = i <= st.e; }); tag.userData.setText(`${EXPO[st.e][0].toLowerCase()} exposure`); } };
  },
  draw(c, W, H, st) {
    head(c, 'DURABILITY · Annex D, Table D.1');
    c.fillStyle = OXIDE; c.font = `700 21px ${F}`; c.fillText(EXPO[st.e][0], 18, 62);
    const y = lines(c, EXPO[st.e][1], 18, 88, W - 36, 19, INK, `500 14px ${F}`);
    const y2 = kv(c, W, [['Primer, after surface preparation', 'at least one coat, at once'], ['Friction grip (HSFG) contact surfaces', 'not painted'], ['Next to a weld still to be made', 'not pre-painted'], ['Sulphate over 2 % soil, 5 % water', 'a lining over the steel']], y + 12, 26);
    lines(c, st.e === 0 ? 'In mild exposure a coat of primer, after loose mill scale is removed, may be adequate (D2.4.1).' : 'As exposure becomes more critical, more elaborate surface preparation and coatings become necessary (D2.4.1).', 18, y2 + 2, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, 'Protection: cathodic, inhibitors, metal coatings or paint systems (D2.3)');
  },
  steps: [
    { title: 'Where the bridge stands', text: 'Steel lasts as long as its protection. The Code sorts the surroundings of a bridge into five levels of severity. Pick each one.',
      check: { q: 'Steel surfaces exposed to sea water spray are classed as… (Table D.1)', options: ['very severe', 'mild', 'moderate'], answer: 0, why: 'Very severe: exposed to sea water spray, corrosive fumes, or aggressive subsoil or groundwater. Tidal and splash zones are extreme (Table D.1).' } },
    { title: 'Paint at once', text: 'Bare, freshly cleaned steel rusts within hours. The stack beside the bridge grows a coat with each level.',
      check: { q: 'After surface preparation, steel surfaces are given… (Annex D, D2.4.2)', options: ['at least one coat of primer immediately', 'no coating for a year', 'a coat of oil only'], answer: 0, why: 'Steel surfaces shall be provided with at least one coat of primer immediately after surface preparation such as sand blasting (D2.4.2).' } },
    { title: 'Where not to paint', text: 'Two places are left bare on purpose.',
      check: { q: 'Surfaces that transfer force by friction, as in HSFG connections, are… (D2.4.4)', options: ['not painted', 'painted twice', 'galvanised and painted'], answer: 0, why: 'They shall not be painted; moisture must be kept from being trapped on them after the bolts are pretensioned. Members are not pre-painted next to a weld (D2.4.4, D2.4.5).' } },
  ],
});

// ---------------------------------------------------------------- 7 · inspection
const ins = st => ({ det: st.y <= 5, rou: st.m <= 12 });
export const inspect = spread({
  river: true, init: { y: 3, m: 6, special: false },
  chips: [['m', [3, 6, 12, 18, 24], v => `Routine: ${v} months ago`], ['special', [false, true], v => v ? 'Known deficiency' : 'No known deficiency']],
  slider: { key: 'y', name: 'Years', label: 'years since · drag', values: range(0, 8, 1) },
  model({ holo, group, st }) {
    const { b, tk } = bridge(group), rust = [-6, -3.5, -1, 1.5, 4, 6.5, -5, 3].map((x, i) => { const m = box(.9, .5, .08, paint(0x5a2e16, .9, 0), x, 3.1 + (i % 2) * .25, 1.56); b.g.add(m); return m; });
    const tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag);
    return {
      place() { const r = ins(st); rust.forEach((m, i) => { m.visible = i < st.y; }); tag.userData.setText(st.special ? 'special inspection required' : r.det && r.rou ? 'inspections up to date' : 'inspection overdue'); },
      update(dt, t) { const x = Math.sin(t * .8) * 6.5; sag(b, tk, .15, x); tk.rotation.y = Math.cos(t * .8) < 0 ? Math.PI : 0; },
      debug: () => ins(st),
    };
  },
  draw(c, W, H, st) {
    const r = ins(st);
    head(c, 'INSPECTION · Annex E');
    const y = kv(c, W, [['Detailed inspection: at intervals not over 5 years', `${st.y} years ${mark(r.det)}`, r.det ? OK : BAD], ['Routine inspection: at least once a year', `${st.m} months ${mark(r.rou)}`, r.rou ? OK : BAD], ['Special inspection', st.special ? 'required' : 'not needed', st.special ? OXIDE : INK]], 60, 29);
    lines(c, st.special ? 'For a bridge with known deficiencies, such as a restriction on weight or speed or loss of camber, or after an unusual occurrence (E4.3).' : 'How often and how closely a bridge is inspected depends on its age, traffic, condition, vulnerability and history of deterioration (E4.1.1).', 18, y + 6, W - 36, 18, INK, `500 13.5px ${F}`);
    lines(c, 'Looked at: girders and stringers, trusses, bearings, decks and drainage, expansion joints, railings and barriers, signs, services (Table E-1).', 18, y + 68, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, 'A complete and accurate record of every inspection is kept (E14)');
  },
  steps: [
    { title: 'A detailed look', text: 'Drag the years since the last detailed inspection. Rust and loose rivets do not announce themselves.',
      check: { q: 'Each bridge is inspected in detail at intervals not exceeding… (Annex E, E4.1.2)', options: ['5 years', '20 years', '6 months'], answer: 0, why: 'Each bridge has to be inspected in detail at regular intervals not exceeding 5 years (E4.1.2).' } },
    { title: 'Every year', text: 'Some items are looked at regularly whether or not anything alarming has happened.',
      check: { q: 'Periodic routine inspection of certain items is made… (E4.2)', options: ['at least once a year', 'every ten years', 'only after a flood'], answer: 0, why: 'Certain items in each bridge are inspected at definite intervals, at least once a year, irrespective of whether anything alarming has taken place (E4.2).' } },
    { title: 'When something is wrong', text: 'Switch on a known deficiency.',
      check: { q: 'A special inspection is required for a bridge with… (E4.3)', options: ['known deficiencies, such as a weight restriction or loss of camber', 'a new coat of paint', 'more than two lanes'], answer: 0, why: 'For any bridge with known deficiencies like restriction on weight or speed, or loss of camber, and where routine inspection or an unusual occurrence shows the need (E4.3).' } },
  ],
});

// ---------------------------------------------------------------- 8 · load testing
const LOADS = { self: 400, perm: 200, variable: 600 };   // illustrative, kN
const ts = st => { const F0 = acceptanceLoad(LOADS.self, LOADS.perm, LOADS.variable), lim = st.second ? 10 : 20; return { F0, lim, ok: st.res <= lim, f: TABLE_F1[st.n] }; };
export const test = spread({
  river: true, init: { res: 10, second: false, n: 1 },
  chips: [['second', [false, true], v => v ? 'Second application' : 'First application'], ['n', [1, 2, 3, 4, 5, 10], v => v === 1 ? '1 unit tested' : `${v} units tested`]],
  slider: { key: 'res', name: 'Residual', label: 'residual · drag', values: range(0, 40, 5) },
  model({ holo, group, st }) {
    const b = girderBridge({ L: 17, d: 1, H: 2.6 }); group.add(sit(b.g));
    const kent = [-3, -1, 1, 3].map(x => { const m = box(1.7, 1.2, 2.6, paint(0x8b959e, .8, 0), x, 0, 0); b.g.add(m); return m; });
    const tag = holo.label('', TAG); tag.position.set(0, 9, -5); group.add(tag);
    return {
      place() { tag.userData.setText(`residual ${st.res} % ${mark(ts(st).ok)}`); },
      update(dt, t) { const p = (t * .25) % 1, on = p < .6, k = on ? .7 * Math.min(1, p / .15) : .7 * Math.max(st.res / 100, 1 - (p - .6) / .15), f = X => -k * (1 - (2 * X / 17) ** 2); b.bend(f); kent.forEach(m => { m.visible = on; m.position.y = b.top + .6 + f(m.position.x); }); },
      debug: () => ts(st),
    };
  },
  draw(c, W, H, st) {
    const r = ts(st);
    head(c, 'LOAD TESTING · Annex F');
    const y = kv(c, W, [['Acceptance test load: 1.0 self weight', `${LOADS.self} kN`], ['+ 1.15 × the rest of the permanent load', `${(1.15 * LOADS.perm).toFixed(0)} kN`], ['+ 1.25 × the variable load', `${(1.25 * LOADS.variable).toFixed(0)} kN`], ['Ftest,a', `${r.F0.toFixed(0)} kN`, OXIDE],
      [`Residual deflection, limit ${r.lim} % of the maximum`, `${st.res} % ${mark(r.ok)}`, r.ok ? OK : BAD], [`Prototype factor, ${st.n} unit${st.n > 1 ? 's' : ''} (Table F.1)`, `strength ${r.f[0]} · service ${r.f[1]}`]], 58, 27);
    lines(c, st.second ? 'If the first test fails the criteria it may be repeated once only; the residual deflection shall then not exceed 10 per cent.' : 'The assembly shall behave substantially linearly; on removal of the load the residual deflection shall not exceed 20 per cent.', 18, y + 2, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, 'The maximum load is held for at least 1 hour (F4.2) · loads illustrative');
  },
  steps: [
    { title: 'Load it and watch', text: 'An acceptance test is a non-destructive test that confirms structural performance. Blocks go on, the span sags, the blocks come off.',
      check: { q: 'In the acceptance test load, the variable load is multiplied by… (Annex F, F2.1)', options: ['1.25', '1.0', '2.0'], answer: 0, why: 'Ftest,a = 1.0 × self weight + 1.15 × remainder of the permanent load + 1.25 × variable load (F2.1).' } },
    { title: 'What stays behind', text: 'Drag the residual deflection: how much of the sag does not recover.',
      check: { q: 'On removal of the test load, the residual deflection should not exceed… (F2.1)', options: ['20 per cent of the maximum recorded', '50 per cent', '1 per cent'], answer: 0, why: '20 per cent of the maximum recorded deflection; if the test is repeated, once only, 10 per cent (F2.1).' } },
    { title: 'One of many', text: 'When prototypes are tested for a run of similar units, the load is raised to allow for variation between them.',
      check: { q: 'With one unit tested, the factor for the strength limit state is… (Table F.1)', options: ['1.5', '1.2', '1.0'], answer: 0, why: 'Table F.1: 1.5, 1.4, 1.3, 1.3, 1.3 and 1.2 for 1, 2, 3, 4, 5 and 10 similar units tested; 1.2 or 1.1 for serviceability.' } },
  ],
});

// ---------------------------------------------------------------- 9 · working stress design
const KIND = { tension: 'Axial tension on net area', compression: 'Axial compression on effective section', bendPlate: 'Bending: plates, flats, tubes', bendGirder: 'Bending: girders, rolled sections', shearMax: 'Shear stress, maximum', shearAvg: 'Shear stress, average', bearing: 'Bearing on a flat surface' };
const COMB = ['G + Q or Gs + Qim + Fwc + Ff + Gb + Fcf + Fep + Gc', '(I) + Fs + Fd + Fte', '(II) + W + Fwp', '(II) + Feq + Fwp', '(II) + Fim + W', 'G + Fwc + Gb + Fep + Fer + Ff + W + Gc', '(VI) + Feq − W'];
const ws = st => { const k = TABLE_G2[st.kind](st.fy), inc = TABLE_G1[st.c][1], basic = k * st.fy, raw = basic * (1 + inc / 100), p = permissible(st.kind, st.fy, inc); return { k, inc, basic, raw, p, cap: raw > p + 1e-9 }; };
export const wsm = spread({
  river: true, init: { kind: 'bendGirder', c: 0, fy: 250 },
  chips: [['kind', Object.keys(KIND), v => ({ tension: 'Tension', compression: 'Compression', bendPlate: 'Bending · plates', bendGirder: 'Bending · girders', shearMax: 'Shear · maximum', shearAvg: 'Shear · average', bearing: 'Bearing' })[v]], ['c', [0, 1, 2, 3, 4, 5, 6], v => `Combination ${TABLE_G1[v][0]}`], GRADES],
  model({ holo, group, st }) {
    const { b, tk } = bridge(group), tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag);
    // a bar against fy: filled to the permissible stress, a dark line at the basic stress, a red line at 0.9 fy
    const X = -6.5, Z = -9, H = 4, B0 = 5.2, line = c => box(1.6, .07, 1.6, new THREE.MeshBasicMaterial({ color: c, toneMapped: false })), fill = box(1, 1, 1, paint(0x2f8f55, .5, .2)), frame = holo.wireBox(1.05, H + .05, 1.05, holo.DIM), cap = line(0xc23b2f), basic = line(0x262b31);
    fill.geometry.translate(0, .5, 0); fill.position.set(X, B0, Z); frame.position.set(X, B0 + H / 2, Z); cap.position.set(X, B0 + .9 * H, Z); basic.position.set(X, 0, Z); group.add(fill, frame, cap, basic);
    const lf = holo.label('fy', { h: .55, color: INK }); lf.position.set(X, B0 + H + .5, Z); group.add(lf);
    return { place() { const r = ws(st); sag(b, tk, .16); fill.scale.y = r.p / st.fy * H; fill.material.color.setHex(r.cap ? 0xb0532a : 0x2f8f55); basic.position.y = B0 + r.k * H; tag.userData.setText(`permissible stress ${r.p.toFixed(0)} MPa`); }, debug: () => ws(st) };
  },
  draw(c, W, H, st) {
    const r = ws(st);
    head(c, 'WORKING STRESS DESIGN · Annex G');
    c.fillStyle = INK; c.font = `700 16px ${F}`; c.fillText(KIND[st.kind], 18, 58);
    const y = kv(c, W, [['Basic permissible stress (Table G.2)', `${r.k} fy = ${r.basic.toFixed(0)} MPa`], [`Combination ${TABLE_G1[st.c][0]}: increase (Table G.1)`, r.inc ? `${r.inc} per cent` : 'nil'], ['Limited to 90 per cent of yield', `${(.9 * st.fy).toFixed(0)} MPa${r.cap ? ' governs' : ''}`, r.cap ? OXIDE : INK], ['Permissible stress', `${r.p.toFixed(0)} MPa`, OXIDE]], 84, 28);
    const y2 = lines(c, `Combination ${TABLE_G1[st.c][0]}: ${COMB[st.c]}.`, 18, y + 4, W - 36, 18, INK, `500 13px ${F}`);
    lines(c, 'Symbols as in cl. 202.1 of IRC : 6. Stresses in compression are also limited by buckling. The equivalent stress never exceeds 92 per cent of yield (G2.4.2.2).', 18, y2 + 4, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, `fy ${st.fy} MPa · the method of IRC : 24-2001`);
  },
  steps: [
    { title: 'The older method', text: 'In working stress design the stress under the design loads is kept below a permissible stress: the yield stress times a factor of safety. It may be used where the limit state method cannot conveniently be adopted.',
      check: { q: 'The basic permissible stress in axial tension on the net area is… (Table G.2)', options: ['0.6 fy', '0.9 fy', '0.38 fy'], answer: 0, why: 'Table G.2: axial tension 0.6 fy; axial compression 0.6 fy; bending 0.66 fy in plates and 0.62 fy in girders; shear 0.43 fy maximum; bearing 0.8 fy.' } },
    { title: 'Rarer loads, higher stress', text: 'Pick the load combinations. The less likely the combination, the more the permissible stress may be raised.',
      check: { q: 'For combination IV, which includes the seismic force, the permissible increase is… (Table G.1)', options: ['40 per cent', '15 per cent', 'nil'], answer: 0, why: 'Table G.1: I nil, II 15, III 25, IV 40, V 25, VI 30 and VII 40 per cent.' } },
    { title: 'A ceiling', text: 'Pick Bearing with combination IV. The increase stops short.',
      check: { q: 'The permissible increase in stress is limited to… (Annex G, G2.2.2)', options: ['90 per cent of the yield stress', '100 per cent of the ultimate stress', '60 per cent of the yield stress'], answer: 0, why: 'The permissible increase in stress shall be limited to 90 per cent of the yield stress (G2.2.2).' } },
  ],
});
