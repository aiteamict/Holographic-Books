// Spreads 1–4 · the basis of the Code.
//   scope    (cl. 501.1–501.2, Annex A)  which bridges the Code covers; the ten types that need special literature
//   steel    (cl. 502.2.2.1, 509.9)      the five constants of structural steel; a span growing and shrinking with heat
//   limit    (cl. 503.1–503.2)           strength, serviceability, fatigue: one bridge taken to each limit
//   factors  (cl. 503.4, Table 1)        design strength = ultimate strength / γm
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, sit, girderBridge, truss, truck, arrow, box, bend, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, OXIDE_HEX } from '../../_irc24/kit.js';
import { thermal, GAMMA } from '../../_irc24/steel.js';

const Z = -4.5, TAG = { h: .7, color: INK, bg: 'rgba(255,253,248,.92)', weight: 700 };

// ---------------------------------------------------------------- 1 · scope
const TYPES = [['girder', 'Beam / plate girder', 1], ['truss', 'Open web girder', 1], ['curved', 'Curved'], ['cable', 'Cable-stayed'], ['susp', 'Suspension'],
  ['temp', 'Temporary'], ['ped', 'Pedestrian'], ['swing', 'Swing'], ['bascule', 'Bascule'], ['box', 'Box girder'], ['pre', 'Prestressed steel'], ['arch', 'Arch']];
const ANNEX = {
  curved: 'rigorous analysis; the detailing must follow the needs of the curvature effects.',
  cable: 'specialised treatment for analysis and design; erection conditions thoroughly analysed.',
  susp: 'specialised treatment for analysis and design; erection conditions thoroughly analysed.',
  temp: 'certain provisions (permissible deflection, live load) can be relaxed with the Engineer’s approval.',
  ped: 'certain provisions (permissible deflection, live load) can be relaxed with the Engineer’s approval.',
  swing: 'the mechanical equipment needs its own codes; the structural part can follow this Code.',
  bascule: 'the mechanical equipment needs its own codes; the structural part can follow this Code.',
  box: 'special analysis and detailing are warranted.', pre: 'special analysis and detailing are warranted.', arch: 'special analysis and detailing are warranted.',
};
/** A line drawing of each special type: pairs of points, deck at y = 3, 18 cm long. */
function outline(type) {
  const s = [], L = (x1, y1, x2, y2, z1 = 0, z2 = z1) => s.push([x1, y1, z1], [x2, y2, z2]);
  const deck = () => { L(-9, 3, 9, 3); L(-9, 2.6, 9, 2.6); L(-9, 3, -9, 2.6); L(9, 3, 9, 2.6); };
  const posts = (...xs) => xs.forEach(x => { L(x - .3, .5, x - .3, 2.6); L(x + .3, .5, x + .3, 2.6); });
  if (type === 'curved') { for (const r of [14, 16.5]) for (let i = 0; i < 16; i++) { const a = -.6 + i * .075, b = a + .075; L(Math.sin(a) * r, 3, Math.sin(b) * r, 3, 15 - Math.cos(a) * r, 15 - Math.cos(b) * r); } for (const a of [-.6, 0, .6]) L(Math.sin(a) * 15.2, .5, Math.sin(a) * 15.2, 3, 15 - Math.cos(a) * 15.2); }
  if (type === 'cable') { deck(); for (const x of [-3.6, 3.6]) { L(x, .5, x, 9); for (const k of [1, 2, 3, 4]) for (const d of [-1, 1]) if (Math.abs(x + d * k * 1.15) < 9) L(x, 9.2 - k * .45, x + d * k * 1.15, 3); } }
  if (type === 'susp') { deck(); const y = x => 3.7 + 5.3 * (x / 5.5) ** 2; for (const x of [-5.5, 5.5]) { L(x, .5, x, 9); L(x, 9, Math.sign(x) * 9, 3.1); } for (let x = -5.5; x < 5.4; x += .55) { L(x, y(x), x + .55, y(x + .55)); if (Math.abs(x) > .1 && Math.round(x / .55) % 2 === 0) L(x, y(x), x, 3); } }
  if (type === 'temp') { deck(); posts(-8.6, 8.6); for (let x = -9; x < 9; x += 3) { L(x, 3, x, 4.5); L(x, 4.5, x + 3, 4.5); L(x, 3, x + 3, 4.5); L(x + 3, 3, x, 4.5); } L(9, 3, 9, 4.5); }
  if (type === 'ped') { L(-9, 3, 9, 3); L(-9, 2.85, 9, 2.85); L(-9, 3.9, 9, 3.9); for (let x = -9; x <= 9; x += 1.5) L(x, 3, x, 3.9); posts(-8.6, 8.6); for (const d of [-1, 1]) { L(d * 9, 3, d * 11.6, .6); L(d * 9, 3.9, d * 11.6, 1.5); } }
  if (type === 'swing') { const c = Math.cos(.55), n = Math.sin(.55); for (const o of [-.8, .8]) L(-9 * c + o * n, 3, 9 * c + o * n, 3, 9 * n + o * c, -9 * n + o * c); for (const d of [-1, 1]) L(d * 9 * c - .8 * n, 3, d * 9 * c + .8 * n, 3, -d * 9 * n - .8 * c, -d * 9 * n + .8 * c); L(-.5, .5, -.5, 2.6); L(.5, .5, .5, 2.6); for (const x of [-9.6, 9.6]) { L(x, .5, x, 3, -.8); L(x, .5, x, 3, .8); L(x, 3, x, 3, -.8, .8); } }
  if (type === 'bascule') { const c = Math.cos(.7), n = Math.sin(.7); for (const d of [-1, 1]) { L(d * 9, 3, d * (9 - 8.6 * c), 3 + 8.6 * n); L(d * 9, 2.6, d * (9 - 8.6 * c + .4 * n), 2.6 + 8.6 * n + .4 * c - .4); L(d * 9.3, .5, d * 9.3, 3); L(d * 10.5, .5, d * 10.5, 3); L(d * 9.3, 3, d * 10.5, 3); } }
  if (type === 'box') { L(-6, 5.2, 6, 5.2); L(-6, 4.9, -3.2, 4.9); L(3.2, 4.9, 6, 4.9); L(-6, 5.2, -6, 4.9); L(6, 5.2, 6, 4.9); L(-3.2, 4.9, -2.2, 2.2); L(3.2, 4.9, 2.2, 2.2); L(-2.2, 2.2, 2.2, 2.2); L(-2.75, 4.9, -1.9, 2.5); L(2.75, 4.9, 1.9, 2.5); L(-1.9, 2.5, 1.9, 2.5); L(-2.75, 4.9, 2.75, 4.9); L(-.8, .5, -.8, 2.2); L(.8, .5, .8, 2.2); }
  if (type === 'pre') { deck(); posts(-8.6, 8.6); L(-9, 2.8, -3, 1.2); L(-3, 1.2, 3, 1.2); L(3, 1.2, 9, 2.8); L(-3, 2.6, -3, 1.2); L(3, 2.6, 3, 1.2); }
  if (type === 'arch') { deck(); const y = x => 3 + 4.5 * (1 - (x / 9) ** 2); for (let x = -9; x < 8.9; x += .75) { L(x, y(x), x + .75, y(x + .75)); if (Math.abs(x) < 8 && Math.round(x / .75) % 2 === 0) L(x, y(x), x, 3); } posts(-8.6, 8.6); }
  return s;
}
export const scope = spread({
  river: true, init: { type: 'girder' },
  chips: [['type', TYPES.map(t => t[0]), v => TYPES.find(t => t[0] === v)[1]]],
  model({ holo, group, st }) {
    const gb = girderBridge({ L: 18, d: 1.1, H: 2.2 }), tr = truss({ L: 18, h: 3, H: 2.2 }); group.add(sit(gb.g), sit(tr.g));
    const tk = truck(.3); tk.position.set(-2, gb.top, 0); gb.g.add(tk);
    const sil = {}; for (const [k, , ok] of TYPES) if (!ok) { const l = holo.segments(outline(k), holo.CYAN, .95, { width: .09 }); group.add(sit(l)); sil[k] = l; }
    return { place() { gb.g.visible = st.type === 'girder'; tr.g.visible = st.type === 'truss'; for (const k in sil) sil[k].visible = st.type === k; } };
  },
  draw(c, W, H, st) {
    const [k, name, ok] = TYPES.find(t => t[0] === st.type);
    head(c, 'SCOPE · cl. 501.1, 501.2, Annex A');
    c.fillStyle = INK; c.font = `700 22px ${F}`; c.fillText(ok ? name : name + ' bridge', 18, 62);
    c.fillStyle = ok ? OK : OXIDE; c.font = `700 15px ${F}`; c.fillText(ok ? '✓ Covered: a normal steel road bridge' : 'Special requirements for design', 18, 90);
    const y = lines(c, ok ? 'The Code deals mainly with the structural steelwork of normal road bridges: beams, plate girders, open web girders (cl. 501.1.1).' : 'Special literature may be referred to. Structural members and connections may still be designed by this Code (cl. 501.2).', 18, 118, W - 36);
    if (!ok) lines(c, 'Annex A: ' + ANNEX[k], 18, y + 8, W - 36, 20, OXIDE);
    foot(c, H, 'Riveted, bolted, welded · hot rolled sections only (cl. 501.1.2)');
  },
  steps: [
    { title: 'Normal bridges', text: 'The Code is written for normal steel road bridges. Pick the beam or plate girder bridge, then the open web girder.',
      check: { q: 'The Code deals mainly with the structural steelwork of… (cl. 501.1.1)', options: ['normal road bridges', 'all steel structures', 'railway bridges'], answer: 0, why: 'It deals mainly with the design of the structural steelwork of normal road bridges, e.g. beams, plate girders, open web girders (cl. 501.1.1).' } },
    { title: 'Special types', text: 'Ten types have special requirements. Pick each one: the drawing shows the type, the card what Annex A says.',
      check: { q: 'For a cable-stayed bridge, the Code says… (cl. 501.2)', options: ['special literature may be referred to', 'use this Code alone', 'steel is not allowed'], answer: 0, why: 'For the listed types there are special requirements for design; special literature may be referred to (cl. 501.2).' } },
    { title: 'Members still apply', text: 'Even on a special bridge, members and connections may follow this Code.',
      check: { q: 'Which sections does the Code cover (cl. 501.1.2)?', options: ['hot rolled only', 'cold formed too', 'aluminium'], answer: 0, why: 'Provisions generally apply to riveted, bolted and welded construction using hot rolled steel sections only. Cold formed sections are not covered (cl. 501.1.2).' } },
  ],
});

// ---------------------------------------------------------------- 2 · steel
export const steel = spread({
  river: true, init: { L: 40, dT: 20 },
  chips: [['L', [20, 40, 60, 80], v => `${v} m span`]],
  slider: { key: 'dT', name: 'ΔT', label: 'temperature · drag', values: [-30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40] },
  model({ holo, group, st }) {
    const b = girderBridge({ L: 17, d: 1.1, H: 2.4 }); group.add(sit(b.g));
    b.g.children.filter(o => o.position.x > 8.5 && o.geometry?.parameters.height > 1).forEach(o => { o.position.x += .8; });   // the free end's abutment stands back: the expansion gap
    const tag = holo.label('', TAG), fix = holo.label('fixed bearing', { h: .8, color: INK }), free = holo.label('free bearing', { h: .8, color: INK });
    tag.position.set(10, 7, -5); fix.position.set(-10.4, 1.3, -1.4); free.position.set(10.6, 1.3, -1.4); group.add(tag, fix, free);
    const hot = new THREE.Color(0xd0562a), cold = new THREE.Color(0x5f6f8a), base = new THREE.Color(OXIDE_HEX);
    return {
      place() {
        const mm = thermal(st.L, st.dT), s = mm / 60;   // 60 mm of movement drawn as 1 cm
        b.span.scale.x = 1 + s / 17; b.span.position.x = s / 2;
        b.mat.color.lerpColors(base, st.dT >= 0 ? hot : cold, Math.min(1, Math.abs(st.dT) / 40));
        tag.userData.setText(`${mm >= 0 ? '+' : '−'}${Math.abs(mm).toFixed(1)} mm`);
      },
      debug: () => ({ mm: +thermal(st.L, st.dT).toFixed(2) }),
    };
  },
  draw(c, W, H, st) {
    head(c, 'STRUCTURAL STEEL · cl. 502.2.2.1');
    const y = kv(c, W, [['Unit mass ρ', '7850 kg/m³'], ['Modulus of elasticity E', '2.0 × 10⁵ MPa'], ['Poisson’s ratio μ', '0.3'], ['Modulus of rigidity G', '0.77 × 10⁵ MPa'], ['Thermal expansion αt', '12 × 10⁻⁶ per °C']], 58, 27);
    const mm = thermal(st.L, st.dT);
    c.fillStyle = OXIDE; c.font = `700 14px ${F}`; c.fillText('ΔL = αt × L × ΔT', 18, y + 14);
    c.fillStyle = INK; c.font = `700 17px ${F}`; c.fillText(`12 × 10⁻⁶ × ${st.L} 000 mm × ${st.dT} °C = ${mm.toFixed(1)} mm`, 18, y + 40);
    lines(c, 'The free bearing and the joint must take this movement, or the steel must resist the stress.', 18, y + 64, W - 36, 19, DIMC, `500 13.5px ${F}`);
    foot(c, H, 'Movement drawn larger than true · cl. 509.9');
  },
  steps: [
    { title: 'Five constants', text: 'For design, every grade of steel is given the same five physical properties. They are on the card.',
      check: { q: 'Modulus of elasticity of steel for design (cl. 502.2.2.1)?', options: ['2.0 × 10⁵ MPa', '0.77 × 10⁵ MPa', '2.0 × 10⁶ MPa'], answer: 0, why: 'E = 2.0 × 10⁵ N/mm² (MPa) for all grades of steel; G = 0.77 × 10⁵ MPa is the modulus of rigidity (cl. 502.2.2.1).' } },
    { title: 'Heat', text: 'Drag the temperature lever. The span is fixed at the left bearing and free at the right one.',
      check: { q: 'A 40 m span warms by 20 °C. It grows by about…', options: ['9.6 mm', '0.96 mm', '96 mm'], answer: 0, why: 'ΔL = αt L ΔT = 12 × 10⁻⁶ × 40 000 mm × 20 = 9.6 mm (cl. 502.2.2.1).' } },
    { title: 'Longer spans', text: 'Pick a longer span at the same temperature change: the movement grows in proportion.',
      check: { q: 'In all bridges, provision shall be made… (cl. 509.9)', options: ['to resist thermal stresses or allow movement', 'to stop all movement', 'only above 60 m span'], answer: 0, why: 'Provision shall be made to resist thermal stresses induced, or means provided for movement caused by temperature changes; also for changes in span length from live loads (cl. 509.9).' } },
  ],
});

// ---------------------------------------------------------------- 3 · limit states
const STATE = {
  strength: ['Limit state of strength', 'Loss of equilibrium · loss of stability, overturning · failure by excessive deformation or rupture · brittle fracture (cl. 503.2.2.1).'],
  service: ['Limit state of serviceability', 'Deformation or deflection that harms appearance or use · vibration causing discomfort or damage · corrosion and durability (cl. 503.2.2.2).'],
  fatigue: ['Limit state of fatigue', 'The stress range from live loads reaches the limiting value for the number of load cycles and the detail (cl. 503.2.2.3, 511).'],
};
export const limit = spread({
  river: true, init: { state: 'strength', load: .8 },
  chips: [['state', ['strength', 'service', 'fatigue'], v => ({ strength: 'Strength', service: 'Serviceability', fatigue: 'Fatigue' })[v]]],
  slider: { key: 'load', name: 'Load', label: 'load · drag', values: [.4, .5, .6, .7, .8, .9, 1, 1.1, 1.2, 1.3, 1.4] },
  model({ holo, group, st }) {
    const b = girderBridge({ L: 17, d: 1, H: 2.6 }); group.add(sit(b.g));
    const tk = truck(.32); b.g.add(tk);
    const crack = box(.07, .5, .7, new THREE.MeshBasicMaterial({ color: 0xc23b2f, toneMapped: false }), 0, 2.72 + .25, 1.5); crack.geometry.translate(0, .25, 0); crack.position.y = 2.72; b.g.add(crack);
    const tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag);
    let N = 0, side = 1, was = '';
    return {
      place() { if (was !== st.state) { N = 0; was = st.state; } },
      update(dt, t) {
        const s = st.state, over = st.load > 1 + 1e-9;
        let d = s === 'strength' ? (over ? .25 + (st.load - 1) * 5 : .25 * st.load) : .18 * st.load;
        if (s === 'service') d += Math.sin(t * 9) * .05 * st.load;
        const x = s === 'strength' ? 0 : Math.sin(t * .8) * 6.5, f = X => -d * (1 - (2 * X / 17) ** 2);
        b.bend(f); tk.position.set(x, b.top + f(x), 0); tk.rotation.y = s !== 'strength' && Math.cos(t * .8) < 0 ? Math.PI : 0;
        if (s === 'fatigue' && Math.sign(x || 1) !== side) { side = Math.sign(x || 1); N++; }
        b.mat.color.setHex(s === 'strength' && over ? 0xc23b2f : OXIDE_HEX);
        const grown = s === 'fatigue' && over ? Math.min(1, N / 12) : 0; crack.visible = grown > 0; crack.scale.y = Math.max(.05, grown * 1.6);
        tag.userData.setText(s === 'fatigue' ? `${N} load cycles${over ? ' · crack growing' : ''}` : s === 'strength' ? (over ? 'limit state exceeded' : 'safe') : 'deflects and vibrates');
      },
      debug: () => ({ N }),
    };
  },
  draw(c, W, H, st) {
    const [name, what] = STATE[st.state], over = st.load > 1 + 1e-9, x0 = 18, w = W - 36, X = v => x0 + v / 1.4 * w;
    head(c, 'LIMIT STATES · cl. 503.2');
    c.fillStyle = INK; c.font = `700 20px ${F}`; c.fillText(name, 18, 60);
    c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x0, 80, w, 18); c.fillStyle = over ? BAD : OK; c.fillRect(x0, 80, X(st.load) - x0, 18);
    c.fillStyle = INK; c.fillRect(X(1) - 1.5, 74, 3, 30);
    c.fillStyle = DIMC; c.font = `500 12px ${F}`; c.fillText(st.state === 'fatigue' ? 'fatigue strength' : 'design strength', X(1) - 96, 118); c.fillText(st.state === 'fatigue' ? 'stress range' : 'design load', x0, 118);
    c.fillStyle = over ? BAD : OK; c.font = `700 15px ${F}`; c.fillText(over ? `✗ ${(st.load * 100).toFixed(0)} % of the limit: exceeded` : `✓ ${(st.load * 100).toFixed(0)} % of the limit`, 18, 146);
    lines(c, what, 18, 174, W - 36);
    foot(c, H, 'Design load ≤ design strength (cl. 503.2.1)');
  },
  steps: [
    { title: 'Strength', text: 'Drag the load past the design strength: the girder fails. The probability of reaching a limit state should be very low.',
      check: { q: 'The reliability of the design is ensured when… (cl. 503.2.1)', options: ['design load ≤ design strength', 'stress ≤ 0.6 fy', 'deflection is zero'], answer: 0, why: 'Design values come from characteristic values through partial safety factors; reliability is ensured when design load ≤ design strength (cl. 503.2.1).' } },
    { title: 'Serviceability', text: 'Pick Serviceability. Nothing breaks, but the bridge deflects and vibrates under traffic.',
      check: { q: 'Which is a limit state of serviceability (cl. 503.2.2.2)?', options: ['vibration causing discomfort', 'brittle fracture', 'overturning'], answer: 0, why: 'Serviceability covers deformation or deflection, vibration causing discomfort or damage, and corrosion and durability. Brittle fracture and overturning are limit states of strength.' } },
    { title: 'Fatigue', text: 'Pick Fatigue. Each crossing is a load cycle. Raise the stress range past the limit and a crack grows.',
      check: { q: 'The limit state of fatigue is reached through… (cl. 503.2.2.3)', options: ['the stress range due to live loads', 'the dead load alone', 'wind on the deck'], answer: 0, why: 'It is the state at which the stress range due to live loads reaches the limiting value for the number of load cycles and the detail configuration (cl. 503.2.2.3).' } },
  ],
});

// ---------------------------------------------------------------- 4 · partial safety factors
const SHORT = { yield: 'Yielding', buckling: 'Buckling', ultimate: 'Ultimate stress', friction: 'Friction bolts', bearing: 'Bearing bolts', rivets: 'Rivets', welds: 'Welds' };
const FU = { 250: 410, 300: 440 };   // the two grades the Code names: E 250 (Fe 410 W) and E 300 (Fe 440)
const fval = st => { const row = GAMMA.find(g => g[0] === st.c), g = row[st.site === 'shop' ? 3 : 4], plate = ['yield', 'buckling', 'ultimate', 'welds'].includes(st.c), Su = st.c === 'yield' || st.c === 'buckling' ? st.grade : FU[st.grade]; return { row, g, plate, Su, Sd: Su / g }; };
export const factors = spread({
  init: { c: 'yield', grade: 250, site: 'shop' },
  chips: [['c', GAMMA.map(g => g[0]), v => SHORT[v]], ['grade', [250, 300], v => `E ${v}`], ['site', ['shop', 'field'], v => v === 'shop' ? 'Shop' : 'Field']],
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(-2.2, .5, -5.5); g.scale.setScalar(1.3); group.add(g);
    g.add(box(11, .4, 5, SM.concrete, 0, .2, 0));
    const A = box(2.6, 6, 2.6, paint(), -2.6, 3.4, 0), B = box(2.6, 1, 2.6, paint(0x2f8f55, .5, .2), 2, 0, 0), cut = box(2.6, 1, 2.6, new THREE.MeshStandardMaterial({ color: 0xb0732a, transparent: true, opacity: .28 }), 2, 0, 0); g.add(A, B, cut);
    const la = holo.label('ultimate strength Su', { h: .6, color: INK }), lb = holo.label('', TAG), lc = holo.label('', { h: .6, color: '#8a5a1c' }); la.position.set(-2.6, 7.2, 0); g.add(la, lb, lc);
    const piece = new THREE.Group(); piece.position.set(8.4, 3.4, .5); g.add(piece);
    const a1 = arrow(0xc23b2f, .07), a2 = arrow(0xc23b2f, .07); g.add(a1, a2);
    const dark = new THREE.MeshStandardMaterial({ color: 0x1b1c1e }), cyl = (r, h, m, x, y, seg = 16) => { const q = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); q.position.set(x, y, 0); q.castShadow = true; return q; };
    return {
      place() {
        const v = fval(st), hB = 6 / v.g;
        B.scale.y = hB; B.position.y = .4 + hB / 2; cut.scale.y = 6 - hB; cut.position.y = .4 + hB + (6 - hB) / 2;
        lb.position.set(2, .4 + hB + .7, 1.6); lb.userData.setText(`design strength Sd = Su / ${v.g.toFixed(2)}`); lc.position.set(5.2, .4 + hB + (6 - hB) / 2, 0); lc.userData.setText(`÷ ${v.row[2]}`);
        dispose(piece); piece.clear();
        const c = st.c, m = paint(), pull = c !== 'buckling';
        if (c === 'yield') piece.add(box(3, .25, 1.4, m));
        if (c === 'buckling') { const s = box(3.4, .22, .22, m, 0, 0, 0, 16); piece.add(s); bend(piece, x => .45 * Math.cos(Math.PI * x / 3.4)); }
        if (c === 'ultimate') piece.add(box(3, .25, 1.4, m), cyl(.3, .27, dark, 0, 0));
        if (['friction', 'bearing', 'rivets', 'welds'].includes(c)) piece.add(box(2, .2, 1.3, m, -.7, 0), box(2, .2, 1.3, m, .7, .2));
        if (c === 'friction' || c === 'bearing') piece.add(cyl(.16, .8, SM.steel, 0, .1), cyl(.3, .16, SM.steel, 0, .44, 6), cyl(.3, .16, SM.steel, 0, -.24, 6));
        if (c === 'rivets') { piece.add(cyl(.16, .5, SM.steel, 0, .1)); for (const y of [.36, -.16]) { const h = new THREE.Mesh(new THREE.SphereGeometry(.28, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), SM.steel); h.position.set(0, y, 0); if (y < 0) h.rotation.x = Math.PI; piece.add(h); } }
        if (c === 'welds') { const w = box(.26, .26, 1.3, paint(0x6f7a84, .4, .6), -.3, .1, 0); w.rotation.z = Math.PI / 4; piece.add(w); }
        const L = pull ? 1.3 : -1.3; a1.position.set(8.4 + (pull ? 2 : 3.4), 3.4, .5); a1.userData.len(L); a2.position.set(8.4 - (pull ? 2 : 3.4), 3.4, .5); a2.userData.len(-L);
      },
      debug: () => { const v = fval(st); return { gamma: v.g, Su: v.Su, Sd: +v.Sd.toFixed(1) }; },
    };
  },
  draw(c, W, H, st) {
    const v = fval(st);
    head(c, 'PARTIAL SAFETY FACTORS γm · Table 1');
    c.font = `600 11px ${F}`; c.fillStyle = DIMC; c.textAlign = 'right'; c.fillText('shop', W - 70, 48); c.fillText('field', W - 18, 48); c.textAlign = 'left';
    GAMMA.forEach((r, i) => {
      const y = 68 + i * 23, on = r[0] === st.c;
      if (on) { c.fillStyle = 'rgba(138,63,28,.14)'; c.fillRect(10, y - 16, W - 20, 22); }
      c.fillStyle = on ? INK : DIMC; c.font = `${on ? 700 : 500} 13.5px ${F}`; c.fillText(r[1], 18, y);
      c.textAlign = 'right'; c.fillText(r[2], W - 118, y); c.fillText(r[3].toFixed(2), W - 70, y); c.fillText(r[4].toFixed(2), W - 18, y); c.textAlign = 'left';
    });
    c.fillStyle = INK; c.font = `700 16px ${F}`;
    c.fillText(v.plate ? `Sd = Su / γm = ${v.Su} / ${v.g.toFixed(2)} = ${v.Sd.toFixed(0)} MPa` : `Sd = Su / γm = Su / ${v.g.toFixed(2)} = ${(100 / v.g).toFixed(0)} % of Su`, 18, 250);
    c.fillStyle = DIMC; c.font = `500 12.5px ${F}`; c.fillText(v.plate ? `E ${st.grade}: fy ${st.grade} MPa, fu ${FU[st.grade]} MPa (nominal)` : 'Su: the ultimate strength of the fastener itself', 18, 272);
    foot(c, H, 'γm covers strength, size, fabrication and calculation doubts (503.4)');
  },
  steps: [
    { title: 'Design strength', text: 'The tall block is the ultimate strength. Dividing by γm cuts it to the design strength, the green block.',
      check: { q: 'Design strength Sd is… (cl. 503.4)', options: ['Su / γm', 'Su × γm', '0.6 Su'], answer: 0, why: 'The design strength Sd is obtained from the ultimate strength Su and the partial safety factor for materials: Sd = Su / γm (cl. 503.4).' } },
    { title: 'Which factor', text: 'Pick each row of Table 1. Yielding and buckling take 1.10; ultimate stress and connections take 1.25.',
      check: { q: 'γm0 for resistance governed by yielding (Table 1)?', options: ['1.10', '1.25', '1.50'], answer: 0, why: 'Yielding and buckling: γm0 = 1.10. Ultimate stress: γm1 = 1.25. Bolts, rivets and shop welds: 1.25 (Table 1).' } },
    { title: 'Shop or field', text: 'Pick Welds, then switch between Shop and Field.',
      check: { q: 'γmw for welds made in the field (Table 1)?', options: ['1.50', '1.25', '1.10'], answer: 0, why: 'Welds: 1.25 for shop fabrication, 1.50 for field fabrication. Bolts and rivets are 1.25 in both (Table 1).' } },
  ],
});
