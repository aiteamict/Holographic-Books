// Chapter 3 · compression members (cl. 507).
//   buckle   (cl. 507.1, Table 3, Fig. 5)  a pin-ended column on the four buckling curves
//   classes  (Table 4)                     which curve a cross-section belongs to, about each axis
//   length   (cl. 507.2, Table 7)          effective length for six end conditions
//   base     (cl. 507.4.3.1)               thickness of a slab base
//   strut    (cl. 507.5.1.2, Table 8)      a single angle strut loaded through one leg
//   built    (cl. 507.6–507.9)             back-to-back, laced and battened members
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, arrow, box, cyl, bend, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, OXIDE_HEX, TAG } from '../../_irc24/kit.js';
import { buckling, bucklingLam, IMPERFECTION, BUCKLING_CLASS, KEFF, slabBase, angleStrut, GM0 } from '../../_irc24/steel.js';

const GRADES = ['fy', [250, 300], v => `E ${v}`];
const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
const HC = 8;   // height of the model columns, page cm
/** A standing column: a segmented bar whose sideways bow is set by shape(s), s from 0 at the base to 1 at the top. */
function column(g, mat, w, y0 = .5) {
  const col = new THREE.Group(); col.rotation.z = Math.PI / 2; col.position.set(0, y0 + HC / 2, 0); g.add(col);
  let bar = null, was = 0;
  return {
    size(v) { if (v === was) return; was = v; if (bar) { col.remove(bar); bar.geometry.dispose(); } bar = box(HC, v, v, mat, 0, 0, 0, 30); col.add(bar); },
    bow(shape, A) { bend(col, x => -A * shape(x / HC + .5)); },   // once the bar stands up, minus its own y is the reader's right
  };
}

// ---------------------------------------------------------------- 1 · the buckling curves
export const buckle = spread({
  init: { klr: 80, cls: 'b', fy: 250 },
  chips: [['cls', ['a', 'b', 'c', 'd'], v => `Class ${v}`], GRADES],
  slider: { key: 'klr', name: 'KL/r', label: 'slenderness · drag', values: range(10, 250, 10) },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.1); group.add(g);
    const mat = paint(), c = column(g, mat), cap = box(2.4, .4, 2.4, SM.steel, 0, .5 + HC + .2, 0), a = arrow(0xc23b2f, .12);
    g.add(box(4, .5, 4, SM.concrete, 0, .25, 0), cap, a); a.rotation.z = -Math.PI / 2; a.position.set(0, .5 + HC + 3, 0); a.userData.len(1.8);
    const tag = holo.label('', TAG); tag.position.set(4.6, 7, -5); group.add(tag);
    let r = buckling(st.klr, st.fy, st.cls);
    return {
      place() { r = buckling(st.klr, st.fy, st.cls); c.size(Math.max(.16, Math.min(2.4, HC * 3.46 / st.klr))); tag.userData.setText(`fcd = ${r.fcd.toFixed(0)} MPa · χ = ${r.chi.toFixed(2)}`); },
      update(dt, t) { c.bow(s => Math.sin(Math.PI * s), (1 - r.chi) * 1.5 * (.8 + .2 * Math.sin(t * 2))); },
      debug: () => ({ lam: +r.lam.toFixed(3), chi: +r.chi.toFixed(3), fcd: +r.fcd.toFixed(1) }),
    };
  },
  draw(c, W, H, st) {
    const r = buckling(st.klr, st.fy, st.cls), x0 = 34, w = W - 70, y0 = 166, h = 116, X = l => x0 + l / 3 * w, Y = v => y0 - v * h;
    head(c, 'BUCKLING CURVES · cl. 507.1.2.1, Fig. 5');
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, Y(1.02)); c.lineTo(x0, y0); c.lineTo(X(3), y0); c.stroke();
    for (const k of ['a', 'b', 'c', 'd']) {
      const on = k === st.cls; c.strokeStyle = on ? OXIDE : 'rgba(92,97,104,.55)'; c.lineWidth = on ? 2.6 : 1.2; c.beginPath();
      for (let l = 0; l <= 3.001; l += .05) { const v = bucklingLam(l, 250, k).chi; if (l) c.lineTo(X(l), Y(v)); else c.moveTo(X(l), Y(v)); }
      c.stroke(); c.fillStyle = on ? OXIDE : DIMC; c.font = `${on ? 700 : 500} 11px ${F}`; c.fillText(k, X(1.02) + (k === 'a' ? 14 : k === 'b' ? 6 : k === 'c' ? -3 : -13), Y(bucklingLam(1, 250, k).chi) - (k === 'a' ? 5 : 3));
    }
    c.fillStyle = DIMC; c.font = `500 11px ${F}`; c.fillText('χ', x0 - 14, Y(1) + 4); c.fillText('1.0', x0 - 22, Y(1) + 18); c.fillText('λ', X(3) + 6, y0 + 4); for (const l of [1, 2, 3]) c.fillText(String(l), X(l) - 3, y0 + 13);
    c.fillStyle = INK; c.beginPath(); c.arc(X(Math.min(3, r.lam)), Y(r.chi), 4.5, 0, 7); c.fill();
    kv(c, W, [['λ = √( fy (KL/r)² / π² E )', r.lam.toFixed(2)], ['φ = 0.5 [ 1 + α (λ − 0.2) + λ² ]', r.phi.toFixed(2)], ['χ = 1 / [ φ + (φ² − λ²)^0.5 ]', r.chi.toFixed(3)], ['fcd = χ fy / γm0', `${r.fcd.toFixed(0)} MPa`, OXIDE]], 198, 25);
    foot(c, H, `KL/r ${st.klr}, class ${st.cls}: α = ${IMPERFECTION[st.cls]} (Table 3), fy ${st.fy} MPa`);
  },
  steps: [
    { title: 'Flexural buckling', text: 'A compression member usually fails by bowing sideways. Drag the slenderness: a slender column carries far less stress.',
      check: { q: 'The design strength of a compression member is Pd = … (cl. 507.1.2)', options: ['Ae fcd', 'Ag fy', 'An fu / γm1'], answer: 0, why: 'Pd = Ae fcd, with Ae the effective sectional area and fcd the design compressive stress (cl. 507.1.2).' } },
    { title: 'Four curves', text: 'Pick the buckling class. Each class has its own imperfection factor α, so the curves part company at middle slenderness.',
      check: { q: 'Imperfection factor α for buckling class c (Table 3)?', options: ['0.49', '0.21', '0.76'], answer: 0, why: 'Table 3: α = 0.21, 0.34, 0.49 and 0.76 for buckling classes a, b, c and d.' } },
    { title: 'Never above yield', text: 'Drag to a very stocky column. The stress stops at fy / γm0: χ is never more than 1.',
      check: { q: 'The buckling class allows for… (cl. 507.1.1)', options: ['residual stresses, initial bow, accidental eccentricity', 'fatigue cracks', 'corrosion loss'], answer: 0, why: 'Buckling strength is affected by residual stresses, initial bow and accidental eccentricities of load; the buckling class a, b, c or d accounts for them (cl. 507.1.1).' } },
  ],
});

// ---------------------------------------------------------------- 2 · buckling class of a cross-section
const CHIP = { ri1: 'Rolled I · deep · tf ≤ 40', ri2: 'Rolled I · deep · tf 40–100', ri3: 'Rolled I · stocky · tf ≤ 100', ri4: 'Rolled I · stocky · tf > 100', wi1: 'Welded I · tf ≤ 40', wi2: 'Welded I · tf > 40',
  hr: 'Hollow · hot rolled', hc: 'Hollow · cold formed', box: 'Welded box', boxw: 'Welded box · thick welds', open: 'Channel, angle, T, solid', built: 'Built-up' };
const I = (bf, h, tf, tw) => [[bf, tf, 0, h / 2 - tf / 2], [bf, tf, 0, -h / 2 + tf / 2], [tw, h - 2 * tf, 0, 0]];
const WELD = (h, tf, tw) => [-1, 1].flatMap(sy => [-1, 1].map(sx => [.3, .3, sx * (tw / 2 + .1), sy * (h / 2 - tf - .1), 1]));
const SHAPE = {
  ri1: I(3.2, 5.4, .35, .22), ri2: I(3.2, 5.4, .8, .4), ri3: I(5, 4.6, .5, .3), ri4: I(5, 4.6, 1.3, .7),
  wi1: [...I(3.6, 5.4, .4, .22), ...WELD(5.4, .4, .22)], wi2: [...I(3.6, 5.4, .9, .3), ...WELD(5.4, .9, .3)],
  hc: [[4.4, .3, 0, 2.05], [4.4, .3, 0, -2.05], [.3, 3.8, -2.05, 0], [.3, 3.8, 2.05, 0]],
  box: [[4.8, .35, 0, 2.3], [4.8, .35, 0, -2.3], [.3, 4.25, -1.8, 0], [.3, 4.25, 1.8, 0]],
  boxw: [[4.8, .6, 0, 2.3], [4.8, .6, 0, -2.3], [.5, 4, -1.8, 0], [.5, 4, 1.8, 0], ...[-1, 1].flatMap(sy => [-1, 1].map(sx => [.4, .4, sx * 2.15, sy * 1.9, 1]))],
  open: [[.45, 4.4, -1.975, 0], [4.4, .45, 0, -1.975]],
  built: [[.3, 4, -1.6, 0], [1.2, .3, -1.15, 1.85], [1.2, .3, -1.15, -1.85], [.3, 4, 1.6, 0], [1.2, .3, 1.15, 1.85], [1.2, .3, 1.15, -1.85], [4.8, .25, 0, 2.13], [4.8, .25, 0, -2.13]],
};
export const classes = spread({
  init: { sec: 'ri1', axis: 'z' },
  chips: [['sec', BUCKLING_CLASS.map(b => b[0]), v => CHIP[v]], ['axis', ['z', 'y'], v => `About ${v}-${v}`]],
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, 4.6, -5); g.rotation.x = -.25; g.scale.setScalar(1.25); group.add(g);
    const body = new THREE.Group(), mat = paint(), weld = paint(0x6f7a84, .4, .6), tube = new THREE.MeshStandardMaterial({ color: OXIDE_HEX, roughness: .5, metalness: .3, side: THREE.DoubleSide }); g.add(body);
    const zl = holo.polyline([[-3.8, 0, 1.15], [3.8, 0, 1.15]], holo.CYAN, { width: .1, dashed: true }), yl = holo.polyline([[0, -3.6, 1.15], [0, 3.6, 1.15]], holo.CYAN, { width: .1, dashed: true });
    const za = holo.label('z', { h: .7, color: '#1d5f87' }), zb = holo.label('z', { h: .7, color: '#1d5f87' }), ya = holo.label('y', { h: .7, color: '#1d5f87' }), yb = holo.label('y', { h: .7, color: '#1d5f87' });
    za.position.set(-4.3, 0, 1.15); zb.position.set(4.3, 0, 1.15); ya.position.set(0, 4.1, 1.15); yb.position.set(0, -4.1, 1.15); g.add(zl, yl, za, zb, ya, yb);
    const tag = holo.label('', TAG); tag.position.set(0, 10.6, -5); group.add(tag);
    return {
      place() {
        dispose(body); body.clear();
        if (st.sec === 'hr') { const m = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 2, 40, 1, true), tube); m.rotation.x = Math.PI / 2; m.castShadow = true; body.add(m); }
        else for (const [w, h, x, y, wd] of SHAPE[st.sec]) { const m = box(w, h, 2, wd ? weld : mat, x, y, 0); if (wd) m.rotation.z = Math.PI / 4; body.add(m); }
        const z = st.axis === 'z'; zl.visible = za.visible = zb.visible = z; yl.visible = ya.visible = yb.visible = !z;
        const b = BUCKLING_CLASS.find(q => q[0] === st.sec); tag.userData.setText(`buckling about ${st.axis}-${st.axis}: class ${b[z ? 2 : 3]}`);
      },
    };
  },
  draw(c, W, H, st) {
    const b = BUCKLING_CLASS.find(q => q[0] === st.sec), z = st.axis === 'z', k = b[z ? 2 : 3];
    head(c, 'BUCKLING CLASS · Table 4');
    const y = lines(c, b[1], 18, 56, W - 36, 20, INK, `700 16px ${F}`);
    const y2 = kv(c, W, [['Buckling about z-z', `class ${b[2]}`, z ? OXIDE : INK], ['Buckling about y-y', `class ${b[3]}`, z ? INK : OXIDE]], y + 12, 27);
    c.fillStyle = OXIDE; c.font = `700 20px ${F}`; c.fillText(`Class ${k} · α = ${IMPERFECTION[k]}`, 18, y2 + 16);
    kv(c, W, [['fcd at KL/r = 100, fy 250', `${buckling(100, 250, k).fcd.toFixed(0)} MPa`]], y2 + 46, 27);
    lines(c, 'The class allows for residual stresses, initial bow and accidental eccentricity of load (cl. 507.1.1).', 18, y2 + 72, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, 'α: a 0.21 · b 0.34 · c 0.49 · d 0.76 (Table 3)');
  },
  steps: [
    { title: 'Section decides the curve', text: 'Pick a cross-section. Table 4 puts it on curve a, b, c or d. Rolling and welding leave different residual stresses.',
      check: { q: 'Rolled I-section, h/bf > 1.2, tf ≤ 40 mm, buckling about z-z: class…', options: ['a', 'c', 'd'], answer: 0, why: 'Table 4: rolled I-sections with h/bf > 1.2 and tf ≤ 40 mm are class a about z-z and class b about y-y.' } },
    { title: 'Two axes', text: 'Switch the axis. The same section can be on a lower curve about its weak axis.',
      check: { q: 'Welded I-section, tf ≤ 40 mm, buckling about y-y: class…', options: ['c', 'a', 'b'], answer: 0, why: 'Table 4: welded I-sections with tf ≤ 40 mm are class b about z-z and class c about y-y; with tf > 40 mm, c and d.' } },
    { title: 'Angles and built-up members', text: 'Pick the channel, angle, T and solid sections, then the built-up member.',
      check: { q: 'Channels, angles, tees, solid sections and built-up members are buckling class…', options: ['c', 'a', 'b'], answer: 0, why: 'Table 4: channel, angle, T and solid sections, and built-up members, are class c about any axis.' } },
  ],
});

// ---------------------------------------------------------------- 3 · effective length
const BC = {
  cant: ['Fixed · free', s => 1 - Math.cos(Math.PI * s / 2)], psway: ['Pinned · sway', s => Math.sin(Math.PI * s / 2)], pp: ['Pinned · pinned', s => Math.sin(Math.PI * s)],
  fsway: ['Fixed · sway', s => (1 - Math.cos(Math.PI * s)) / 2], fp: ['Fixed · pinned', s => 6.75 * s * s * (1 - s)], ff: ['Fixed · fixed', s => (1 - Math.cos(2 * Math.PI * s)) / 2],
};
const RF = { R: 'restrained', F: 'free' };
export const length = spread({
  init: { bc: 'pp', L: 6 },
  chips: [['bc', KEFF.map(k => k[0]), v => BC[v][0]], ['L', [4, 6, 8], v => `L ${v} m`]],
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.1); group.add(g);
    const c = column(g, paint(), .5, .9); c.size(.3);
    const fixB = box(3.4, .9, 3, SM.concrete, 0, .45, 0), pinB = cyl(.38, 1.4, SM.steel, 0, .62, 0), top = new THREE.Group(); pinB.rotation.x = Math.PI / 2; g.add(fixB, pinB, top);
    const fixT = box(3.4, .7, 3, SM.concrete, 0, .35, 0), pinT = cyl(.38, 1.4, SM.steel, 0, .3, 0), sway = new THREE.Group(); pinT.rotation.x = Math.PI / 2;
    sway.add(box(2.2, .3, 2.2, SM.steel, 0, .15, 0), cyl(.2, 2, SM.steel, -.6, .5, 0), cyl(.2, 2, SM.steel, .6, .5, 0), box(5.4, .3, 2.6, SM.concrete, 0, .86, 0)); sway.children[1].rotation.x = sway.children[2].rotation.x = Math.PI / 2;
    top.add(fixT, pinT, sway); top.position.y = .9 + HC;
    const tag = holo.label('', TAG); tag.position.set(4.8, 7, -5); group.add(tag);
    return {
      place() {
        const k = KEFF.find(q => q[0] === st.bc);
        fixB.visible = k[3] === 'R'; pinB.visible = !fixB.visible;
        fixT.visible = k[4] === 'R' && k[5] === 'R'; pinT.visible = k[4] === 'R' && k[5] === 'F'; sway.visible = k[4] === 'F' && k[5] === 'R';
        tag.userData.setText(`KL = ${k[1]} L = ${(k[1] * st.L).toFixed(1)} m`);
      },
      update(dt, t) { const A = 1.2 * (.75 + .25 * Math.sin(t * 2)), f = BC[st.bc][1]; c.bow(f, A); sway.position.x = A * f(1); sway.children[3].position.x = -A * f(1); },   // the roller track stays put
      debug: () => ({ K: KEFF.find(q => q[0] === st.bc)[1] }),
    };
  },
  draw(c, W, H, st) {
    const k = KEFF.find(q => q[0] === st.bc);
    head(c, 'EFFECTIVE LENGTH · cl. 507.2, Table 7');
    const y = kv(c, W, [['One end: translation', RF[k[2]]], ['One end: rotation', RF[k[3]]], ['Other end: translation', RF[k[4]]], ['Other end: rotation', RF[k[5]]]], 58, 26);
    c.fillStyle = OXIDE; c.font = `700 21px ${F}`; c.fillText(`KL = ${k[1]} L = ${(k[1] * st.L).toFixed(1)} m`, 18, y + 16);
    lines(c, 'L is the unsupported length, centre to centre of the intersections with the supporting members. A member with a free end is measured from the centre of the member that holds it (cl. 507.2.1).', 18, y + 44, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, 'Truss members: effective lengths of cl. 508 (507.2.3)');
  },
  steps: [
    { title: 'Ends decide the length', text: 'The same bar buckles in a longer or shorter wave depending on how its ends are held. Pick each case.',
      check: { q: 'Both ends held in position but free to rotate: KL = … (Table 7)', options: ['1.0 L', '0.65 L', '2.0 L'], answer: 0, why: 'Translation restrained and rotation free at both ends gives an effective length of 1.0 L (Table 7).' } },
    { title: 'A free end', text: 'Pick Fixed · free: a cantilever column. It buckles as half of a wave twice its own length.',
      check: { q: 'One end fixed, the other free in translation and rotation: KL = …', options: ['2.0 L', '1.2 L', '0.8 L'], answer: 0, why: 'Restrained in translation and rotation at one end and free at the other: 2.0 L (Table 7).' } },
    { title: 'Both ends fixed', text: 'Pick Fixed · fixed. The Code does not go down to the textbook half length.',
      check: { q: 'Both ends restrained in translation and rotation: KL = …', options: ['0.65 L', '0.5 L', '1.0 L'], answer: 0, why: 'Table 7 gives 0.65 L for both ends restrained in translation and rotation, and 0.8 L when one end is free to rotate.' } },
  ],
});

// ---------------------------------------------------------------- 4 · slab base
const PLATE = { a: [450, 450], b: [600, 450], c: [600, 600] }, COL = 250, TF = 17;   // base plates, the column's circumscribing square and its flange thickness (mm)
const slab = st => { const [L, B] = PLATE[st.plate], w = st.P * 1000 / (L * B), p = [(L - COL) / 2, (B - COL) / 2], a = Math.max(...p), b = Math.min(...p), ts = slabBase(w, a, b, st.fy); return { L, B, w, a, b, ts, need: Math.max(ts, TF) }; };
export const base = spread({
  init: { P: 1500, plate: 'a', fy: 250 },
  chips: [['plate', ['a', 'b', 'c'], v => `Base ${PLATE[v][0]} × ${PLATE[v][1]}`], GRADES],
  slider: { key: 'P', name: 'P', label: 'load · drag', values: range(500, 4000, 250) },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.25); group.add(g);
    const K = .012, plate = box(1, 1, 1, paint(0xd08a2e, .5, .2)), ped = box(1, 2, 1, SM.concrete), col = new THREE.Group(), a = arrow(0xc23b2f, .12), m = paint(), c = COL * K;
    col.add(box(c, 4, .22, m, 0, 2, c / 2 - .11), box(c, 4, .22, m, 0, 2, -c / 2 + .11), box(.16, 4, c - .44, m, 0, 2, 0)); a.rotation.z = -Math.PI / 2; g.add(plate, ped, col, a);
    const tag = holo.label('', TAG); tag.position.set(5.4, 6, -5); group.add(tag);
    return {
      place() {
        const r = slab(st), t = r.need * .03;
        ped.scale.set(r.L * K + 1.6, 1, r.B * K + 1.6); ped.position.y = 1; plate.scale.set(r.L * K, t, r.B * K); plate.position.y = 2 + t / 2; col.position.y = 2 + t;
        a.position.set(0, 2 + t + 4 + 1.1 + st.P / 3000, 0); a.userData.len(.8 + st.P / 3000);
        tag.userData.setText(`slab at least ${Math.ceil(r.need)} mm thick`);
      },
      debug: () => { const r = slab(st); return { w: +r.w.toFixed(2), ts: +r.ts.toFixed(1), a: r.a, b: r.b }; },
    };
  },
  draw(c, W, H, st) {
    const r = slab(st), gov = r.ts > TF;
    head(c, 'SLAB BASE · cl. 507.4.3.1');
    c.fillStyle = INK; c.font = `700 15px ${F}`; c.fillText('ts = √[ 2.5 w (a² − 0.3 b²) γm0 / fy ]  > tf', 18, 54);
    kv(c, W, [['Pressure w = P / area', `${st.P} kN / (${r.L} × ${r.B}) = ${r.w.toFixed(2)} MPa`], ['Projections a (larger), b (smaller)', `${r.a} and ${r.b} mm`], ['Calculated ts', `${r.ts.toFixed(1)} mm`, gov ? OXIDE : INK],
      ['Flange thickness tf', `${TF} mm`, gov ? INK : OXIDE], ['Slab thickness, more than', `${Math.max(r.ts, TF).toFixed(1)} mm`, OXIDE]], 84, 28);
    lines(c, 'w is the uniform pressure from below under the factored axial load; a and b are measured beyond the rectangle that encloses the column.', 18, 226, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, 'Bearing pressure on the support: IRC : 78 (cl. 507.4.1.1)');
  },
  steps: [
    { title: 'Spreading the load', text: 'A slab base spreads the column load over the concrete. The slab bends like a cantilever where it projects. Drag the load.',
      check: { q: 'In the slab base formula, w is… (cl. 507.4.3.1)', options: ['the uniform pressure from below', 'the weight of the column', 'the width of the flange'], answer: 0, why: 'w is the uniform pressure from below on the slab base under the factored axial compression (cl. 507.4.3.1).' } },
    { title: 'Projections', text: 'Pick a larger base. The pressure falls, but the projections a and b grow.',
      check: { q: 'a and b are the projections of the slab base beyond…', options: ['the rectangle circumscribing the column', 'the anchor bolts', 'the edge of the pedestal'], answer: 0, why: 'a and b are the larger and smaller projection of the slab base beyond the rectangle circumscribing the compression member (cl. 507.4.3.1).' } },
    { title: 'Not thinner than the flange', text: 'Take the load right down. The calculated thickness falls, but the slab must stay thicker than the column flange.',
      check: { q: 'The slab base thickness ts must be greater than…', options: ['the flange thickness tf', '6 mm', 'the web thickness'], answer: 0, why: 'ts = √[2.5 w (a² − 0.3 b²) γm0 / fy] > tf, the flange thickness of the compression member (cl. 507.4.3.1).' } },
  ],
});

// ---------------------------------------------------------------- 5 · single angle strut
const ANG = { 75: [75, 8, 14.5, 1138], 100: [100, 10, 19.4, 1903], 150: [150, 12, 29.3, 3459] };   // leg, thickness, rvv, area (mm, mm²) from section tables
const str = st => { const [leg, t, rvv, A] = ANG[st.size], r = angleStrut({ l: st.l, rvv, b1: leg, b2: leg, t, fy: st.fy, bolts: st.bolts, fix: st.fix }); return { leg, t, rvv, A, ...r, Pd: A * r.fcd / 1000 }; };
export const strut = spread({
  init: { size: 100, l: 2000, bolts: 2, fix: 'F', fy: 250 },
  chips: [['size', [75, 100, 150], v => `ISA ${v}`], ['bolts', [1, 2], v => v === 1 ? '1 bolt' : '2 or more bolts'], ['fix', ['F', 'H'], v => v === 'F' ? 'Gusset fixed' : 'Gusset hinged'], GRADES],
  slider: { key: 'l', name: 'l', label: 'length · drag', values: range(1000, 4000, 250), at: [-10, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.1); group.add(g);
    const m = paint(), bar = new THREE.Group(), bolts = new THREE.Group(), posts = [-1, 1].map(s => { const p = box(1.4, 5, 2.4, SM.concrete, 0, 2.5, -.6); g.add(p); return p; }), gus = [-1, 1].map(s => { const p = box(2.4, 2.4, .2, SM.steel); g.add(p); return p; });
    g.add(bar, bolts); bar.position.y = 4; const ar = [-1, 1].map(s => { const a = arrow(0xc23b2f, .1); g.add(a); return a; });
    const tag = holo.label('', TAG); tag.position.set(0, 9.2, -5); group.add(tag);
    let r = str(st), LB = 0, key = '';
    return {
      place() {
        r = str(st); const leg = r.leg * .012, LBn = 5 + st.l / 500, k = st.size + '|' + LBn;
        if (k !== key) { key = k; LB = LBn; dispose(bar); bar.clear(); bar.add(box(LB, leg, .18, m, 0, 0, 0, 24), box(LB, .18, leg, m, 0, leg / 2 - .09, -leg / 2, 24)); }
        dispose(bolts); bolts.clear();
        [-1, 1].forEach((s, i) => {
          posts[i].position.x = s * (LB / 2 + 1.1); gus[i].position.set(s * (LB / 2 - .5), 4, -.2); ar[i].position.set(s * (LB / 2 + 4.2), 4, 0); ar[i].userData.len(-s * 2);
          for (let j = 0; j < st.bolts; j++) { const b = cyl(.2, .34, SM.steel, s * (LB / 2 - .5 - j * .7), 4, .14, 6); b.rotation.x = Math.PI / 2; bolts.add(b); }
        });
        tag.userData.setText(`λe = ${r.le.toFixed(2)} · Pd = ${r.Pd.toFixed(0)} kN`);
      },
      update(dt, t) { const A = Math.min(1.1, r.le * .4) * (.8 + .2 * Math.sin(t * 2)); bend(bar, x => -A * Math.cos(Math.PI * x / LB)); },
      debug: () => ({ lvv: +r.lvv.toFixed(3), lphi: +r.lphi.toFixed(3), le: +r.le.toFixed(3), fcd: +r.fcd.toFixed(1), Pd: +r.Pd.toFixed(1) }),
    };
  },
  draw(c, W, H, st) {
    const r = str(st);
    head(c, 'SINGLE ANGLE STRUT · cl. 507.5.1.2, Table 8');
    c.fillStyle = INK; c.font = `700 15px ${F}`; c.fillText('λe = √( k1 + k2 λvv² + k3 λφ² )', 18, 54);
    kv(c, W, [['k1, k2, k3 (Table 8)', r.k.join(', ')], ['λvv = (l / rvv) ÷ ε √(π² E / 250)', r.lvv.toFixed(2)], ['λφ = (b1 + b2) / 2t ÷ ε √(π² E / 250)', r.lphi.toFixed(3)], ['Equivalent slenderness λe', r.le.toFixed(2), OXIDE],
      ['fcd, buckling class c', `${r.fcd.toFixed(0)} MPa`], ['Pd = Ae fcd', `${r.Pd.toFixed(0)} kN`, OXIDE]], 82, 27);
    foot(c, H, `ISA ${r.leg} × ${r.leg} × ${r.t}: rvv ${r.rvv} mm, A ${r.A} mm² · l ${st.l} mm`);
  },
  steps: [
    { title: 'Loaded through one leg', text: 'An angle bolted through one leg is pushed off its centroid, so it bends and twists as it buckles. Drag the length.',
      check: { q: 'A single angle loaded through one leg is checked with… (cl. 507.5.1.2)', options: ['an equivalent slenderness ratio λe', 'its gross area alone', 'twice its length'], answer: 0, why: 'Its flexural torsional buckling strength may be evaluated using the equivalent slenderness ratio λe = √(k1 + k2 λvv² + k3 λφ²) (cl. 507.5.1.2).' } },
    { title: 'Bolts and fixity', text: 'Change the number of bolts and the fixity of the gusset. Table 8 gives a new set of constants each time.',
      check: { q: 'Two or more bolts at each end, gusset fixed: k1, k2, k3 are… (Table 8)', options: ['0.20, 0.35, 20', '1.25, 0.50, 60', '0.70, 0.60, 5'], answer: 0, why: 'Table 8: two or more bolts, fixed 0.20, 0.35, 20; hinged 0.70, 0.60, 5. One bolt, fixed 0.75, 0.35, 20; hinged 1.25, 0.50, 60.' } },
    { title: 'Concentric loading', text: 'If the load reaches the centroid of the angle through an end gusset, the ordinary column rule applies.',
      check: { q: 'For double angles back-to-back on opposite sides of a gusset, KL in the plane of the gusset is… (cl. 507.5.2.1)', options: ['0.7 to 0.85 of the distance between intersections', '2.0 times that distance', '0.5 of that distance'], answer: 0, why: 'KL in the plane of the end gusset is between 0.7 and 0.85 times the distance between intersections, depending on the restraint; perpendicular to it, the full distance (cl. 507.5.2.1).' } },
  ],
});

// ---------------------------------------------------------------- 6 · built-up members
const DB = 600, AB = 300, NB = 2;   // illustrative battens: spacing D, distance a between fastener groups (mm), parallel planes n
const TYPE = { b2b: ['Back-to-back', 40, .6], lace: ['Laced', 50, .7], batten: ['Battened', 50, .7] };
const lim = st => Math.min(TYPE[st.type][1], TYPE[st.type][2] * st.lam);
export const built = spread({
  init: { type: 'lace', lam: 80, P: 1000 },
  chips: [['type', ['b2b', 'lace', 'batten'], v => TYPE[v][0]], ['P', [500, 1000, 2000], v => `P ${v} kN`]],
  slider: { key: 'lam', name: 'KL/r', label: 'slenderness · drag', values: range(40, 140, 10) },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.rotation.y = -.5; g.scale.setScalar(1.1); group.add(g);
    const m = paint(), mc = paint(0x2f8f55, .5, .2), parts = new THREE.Group(); g.add(parts, box(4.6, .5, 4, SM.concrete, 0, .25, 0));
    const tag = holo.label('', TAG); tag.position.set(0, 11.2, -5); group.add(tag);
    return {
      place() {
        dispose(parts); parts.clear();
        const S = lim(st) * .035, gap = st.type === 'b2b' ? .16 : 2.4, y0 = .5, top = y0 + HC;
        for (const s of [-1, 1]) parts.add(box(.3, HC, 2.2, m, s * (gap / 2 + .15), y0 + HC / 2, 0), box(.9, HC, .28, m, s * (gap / 2 + .6), y0 + HC / 2, .96), box(.9, HC, .28, m, s * (gap / 2 + .6), y0 + HC / 2, -.96));
        let i = 0;
        for (let y = y0 + .6; y < top - .3; y += S, i++) {
          if (st.type === 'b2b') { const b = cyl(.16, gap + .9, SM.steel, 0, y, 0, 6); b.rotation.z = Math.PI / 2; parts.add(b); }
          else if (st.type === 'batten') parts.add(box(gap + 1.9, Math.min(1, S * .45), .12, mc, 0, y, 1.16));
          else if (y + S < top) { const w = gap + 1.2, b = box(Math.hypot(w, S), .26, .1, mc, 0, y + S / 2, 1.16); b.rotation.z = (i % 2 ? -1 : 1) * Math.atan2(S, w); parts.add(b); }
        }
        if (st.type === 'lace') for (const y of [y0 + .35, top - .35]) parts.add(box(gap + 1.9, .7, .12, SM.steel, 0, y, 1.16));
        tag.userData.setText(`component slenderness ≤ ${lim(st).toFixed(0)}`);
      },
      debug: () => ({ limit: lim(st), Vt: .025 * st.P }),
    };
  },
  draw(c, W, H, st) {
    const [name, cap, f] = TYPE[st.type], Vt = .025 * st.P;
    const more = { b2b: [['Parts the member is divided into', 'not less than 3'], ['Bolts or rivets, t ≤ 10, ≤ 16, > 16 mm', '16, 20, 22 mm dia'], ['Apart by not more than', '50 mm back-to-back']],
      lace: [['Lacing angle to the axis', '40°–70° single, 40°–50° double'], ['Lacing bar KL/r', 'not over 140'], ['Tie plate thickness', '≥ 1/50 between fastener lines']],
      batten: [['Bays in the member', 'not less than 3'], [`Shear on a batten, Vt D / n a`, `${(Vt * DB / (NB * AB)).toFixed(1)} kN`], ['Moment on a batten, Vt D / 2n', `${(Vt * DB / (2 * NB) / 1000).toFixed(2)} kNm`]] }[st.type];
    head(c, 'BUILT-UP MEMBERS · cl. 507.6 to 507.9');
    c.fillStyle = INK; c.font = `700 18px ${F}`; c.fillText(name, 18, 58);
    kv(c, W, [['Slenderness of the whole member', String(st.lam)], [`Component: lesser of ${cap} and ${f} × ${st.lam}`, `not over ${lim(st).toFixed(0)}`, OXIDE], ['Transverse shear Vt = 2.5 % of P', `${Vt.toFixed(1)} kN`], ...more], 86, 27);
    foot(c, H, st.type === 'batten' ? `D ${DB} mm, a ${AB} mm, n ${NB} planes (illustrative)` : 'Built this way, the member may be designed as homogeneous (507.7.3)');
  },
  steps: [
    { title: 'Two components, one member', text: 'Two channels work as one column only if they are tied together often enough. Drag the slenderness of the whole member.',
      check: { q: 'In a laced member, the slenderness of a component between lacing connections is not more than… (cl. 507.8.5)', options: ['50 or 0.7 × the member’s, whichever is less', '140', '300'], answer: 0, why: 'Not greater than 50 or 0.7 times the maximum slenderness ratio of the member as a whole, whichever is lesser (cl. 507.8.5). Back-to-back components: 40 or 0.6 times (cl. 507.6.1).' } },
    { title: 'A shear to design for', text: 'Change the axial load. Lacing and battens must carry a transverse shear even when no shear is applied.',
      check: { q: 'Lacing and battens resist a transverse shear Vt of at least… (cl. 507.7.2)', options: ['2.5 per cent of the axial force', '10 per cent of the axial force', '0.25 per cent of the axial force'], answer: 0, why: 'Vt is at least 2.5 per cent of the axial force in the member, together with all shear due to external forces in the plane of lacing (cl. 507.7.2).' } },
    { title: 'Battens', text: 'Pick Battened. Each batten carries a longitudinal shear and a moment from Vt.',
      check: { q: 'A battened member is divided into not less than… (cl. 507.9.1)', options: ['three bays', 'two bays', 'six bays'], answer: 0, why: 'The number of battens shall be such that the member is divided into not less than three bays within its actual length (cl. 507.9.1).' } },
  ],
});
