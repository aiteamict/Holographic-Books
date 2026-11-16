// Chapter 8, spreads 4–9 · bolted and riveted connections (cl. 512.5–512.7).
//   bolt        (cl. 512.5.5.2–512.5.5.4)  a bearing type bolt: shear of the bolt against bearing on the plate
//   details     (cl. 512.5.4)              hole size, edge distance and pitch
//   tension     (cl. 512.5.5.5, 512.5.7)   a bolt in tension, and in shear and tension together
//   pry         (cl. 512.7)                the prying force on the bolts of a T-stub
//   splices     (cl. 512.5.2, 512.5.3)     the forces splices, intersections and gussets are designed for
//   reductions  (cl. 512.5.8, 512.5.9)     long joints, large grips and packings
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, arrow, box, cyl, bend, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, OXIDE_HEX, TAG } from '../../_irc24/kit.js';
import { FU, GMB, BOLT_AREA, boltShear, boltBearing, boltTension, longJoint, largeGrip, packingFactor, prying } from '../../_irc24/steel.js';
import { GRADES, range, kN, mark, GREEN, REDP, table } from './welds.js';

const CLS = { '4.6': [400, 240], '8.8': [800, 640] };   // bolt property class: fub, fyb (MPa)
const DIA = ['d', [16, 20, 24], v => `M${v}`], CLASS = ['cls', ['4.6', '8.8'], v => `Class ${v}`];
const AMBER = paint(0xd08a2e, .5, .2);
/** A bolt standing along y: shank, hexagon head on top, nut below. */
function boltMesh(r, len, mat = SM.steel) {
  const g = new THREE.Group(); g.add(cyl(r, len, mat), cyl(r * 1.75, r * 1.1, mat, 0, len / 2 + r * .55, 0, 6), cyl(r * 1.75, r * 1.1, mat, 0, -len / 2 - r * .55, 0, 6)); return g;
}
const stand = (group, k = 1.2, ry = -.45) => { const g = new THREE.Group(); g.position.set(0, .5, -5); g.rotation.y = ry; g.scale.setScalar(k); group.add(g); return g; };

// ---------------------------------------------------------------- 4 · a bearing type bolt in shear
const E0 = 40, P0 = 60;   // end distance and pitch along the load, mm
const bl = st => { const fub = CLS[st.cls][0], Vs = boltShear({ d: st.d, fub, nn: st.thr ? st.planes : 0, ns: st.thr ? 0 : st.planes }), b = boltBearing({ d: st.d, t: st.t, e: E0, p: P0, fub, fu: FU[st.fy] }); return { fub, Vs, kb: b.kb, d0: b.d0, Vb: b.V, Vd: Math.min(Vs, b.V), shear: Vs <= b.V }; };
export const bolt = spread({
  init: { d: 20, cls: '4.6', planes: 1, thr: true, t: 12, fy: 250 },
  chips: [DIA, CLASS, ['planes', [1, 2], v => v === 1 ? 'Single shear' : 'Double shear'], ['thr', [true, false], v => v ? 'Threads in the shear plane' : 'Shank in the shear plane'], GRADES],
  slider: { key: 't', name: 't', label: 'thickness · drag', values: [6, 8, 10, 12, 16, 20, 25], at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stand(group), parts = new THREE.Group(), mP = paint(), ar = [0, 1].map(() => { const a = arrow(0xc23b2f, .1); g.add(a); return a; }); g.add(parts);
    const tag = holo.label('', TAG); tag.position.set(0, 8.6, -5); group.add(tag);
    return {
      place() {
        dispose(parts); parts.clear(); const r = bl(st), th = st.t * .06, n = st.planes + 1, y0 = 3.2, rb = st.d * .028, mat = r.shear ? mP : AMBER;
        for (let i = 0; i < n; i++) parts.add(box(7, th, 3.4, mat, (i % 2 ? 1 : -1) * 1.9, y0 + (i - (n - 1) / 2) * th, 0));
        const b = boltMesh(rb, n * th + .1, r.shear ? AMBER : SM.steel); b.position.set(0, y0, 0); parts.add(b);
        ar[0].position.set(-5.6, y0, 0); ar[0].userData.len(-1.6); ar[1].position.set(5.6, y0 + (n === 2 ? th / 2 : 0), 0); ar[1].userData.len(1.6);
        tag.userData.setText(`${r.shear ? 'the bolt shears first' : 'the plate bears first'} · Vdb = ${kN(r.Vd)}`);
      },
      debug: () => { const r = bl(st); return { Vs: +r.Vs.toFixed(1), kb: +r.kb.toFixed(3), Vb: +r.Vb.toFixed(1) }; },
    };
  },
  draw(c, W, H, st) {
    const r = bl(st);
    head(c, 'BEARING TYPE BOLT · cl. 512.5.5');
    kv(c, W, [['Tensile stress area Anb and shank area Asb', `${BOLT_AREA[st.d]} and ${(Math.PI * st.d * st.d / 4).toFixed(0)} mm²`], ['Shear Vdsb = fub (nn Anb + ns Asb) / √3 γmb', kN(r.Vs), r.shear ? OXIDE : INK], ['kb, least of e/3d0, p/3d0 − 0.25, fub/fu, 1', r.kb.toFixed(2)],
      ['Bearing Vdpb = 2.5 kb d t fu / γmb', kN(r.Vb), r.shear ? INK : OXIDE], ['Design strength Vdb, the smaller', kN(r.Vd), OXIDE]], 58, 29);
    lines(c, 'Threads can occur in the shear plane, so the area for shear is normally the net tensile stress area (512.5.5.1).', 18, 212, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, `fub ${r.fub} MPa · hole ${r.d0} mm · e ${E0}, p ${P0} mm · plate fu ${FU[st.fy]} MPa`);
  },
  steps: [
    { title: 'Bolt or plate', text: 'A bearing type bolt can fail by shearing through, or the plate can crush where the bolt bears on it. Drag the plate thickness.',
      check: { q: 'The design strength Vdb of a bearing type bolt is… (cl. 512.5.5.2)', options: ['the smaller of its shear and bearing strengths', 'their sum', 'the shear strength only'], answer: 0, why: 'Vdb is the smaller of the value governed by shear, Vdsb, and by bearing, Vdpb (cl. 512.5.5.2).' } },
    { title: 'Shear planes and threads', text: 'Pick double shear, then keep the threads out of the shear plane. Both raise the shear strength.',
      check: { q: 'Vnsb = (fub / √3) × … (cl. 512.5.5.3)', options: ['(nn Anb + ns Asb)', 'Asb only', '2.5 kb d t'], answer: 0, why: 'Vnsb = fub (nn Anb + ns Asb)/√3, with nn and ns the number of shear planes with and without threads in them (cl. 512.5.5.3).' } },
    { title: 'Bearing and spacing', text: 'kb falls when the bolt is near the end of the plate or the bolts are close together.',
      check: { q: 'The nominal bearing strength of a bolt is… (cl. 512.5.5.4)', options: ['2.5 kb d t fu', 'fub Anb', '0.9 fub Anb'], answer: 0, why: 'Vnpb = 2.5 kb d t f′u, with kb the smallest of e/3d0, p/3d0 − 0.25, fub/fu and 1.0, and f′u the smaller of fub and fu (cl. 512.5.5.4).' } },
  ],
});

// ---------------------------------------------------------------- 5 · holes, edge distances and pitch
const dt = st => {
  const d0 = st.d + 1.5, minP = 2.5 * st.d, along = Math.min((st.comp ? 12 : 16) * st.t, 200), maxP = Math.min(32 * st.t, 300, along), minE = (st.edge === 'machine' ? 1.5 : 1.75) * d0, maxE = 12 * st.t;
  return { d0, minP, along, maxP, minE, maxE, okP: st.p >= minP - 1e-9 && st.p <= maxP + 1e-9, okE: st.e >= minE - 1e-9 && st.e <= maxE + 1e-9 };
};
export const details = spread({
  init: { p: 60, d: 20, t: 10, edge: 'machine', comp: false, e: 35 },
  chips: [DIA, ['t', [8, 10, 16], v => `Plate ${v}`], ['e', [25, 35, 50, 150], v => `Edge ${v}`], ['edge', ['machine', 'sheared'], v => v === 'machine' ? 'Rolled or machine cut' : 'Sheared or hand cut'], ['comp', [false, true], v => v ? 'Compression' : 'Tension']],
  slider: { key: 'p', name: 'Pitch', label: 'pitch · drag', values: range(40, 320, 20), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = table(group), m = paint(), bolts = new THREE.Group(); g.add(box(15, .3, 4.4, m), bolts);
    const tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag);
    return {
      place() {
        dispose(bolts); bolts.clear(); const r = dt(st), K = .028, x0 = -7.5 + Math.min(5, st.e * K), mat = r.okP ? GREEN : REDP;
        for (let x = x0, i = 0; x < 7.2; x += st.p * K, i++) bolts.add(cyl(st.d * K * .8, .36, i === 0 && !r.okE ? REDP : mat, x, .22, 0, 6));
        tag.userData.setText(`pitch ${st.p} mm ${mark(r.okP)} · edge ${st.e} mm ${mark(r.okE)}`);
      },
      debug: () => dt(st),
    };
  },
  draw(c, W, H, st) {
    const r = dt(st);
    head(c, 'HOLES, EDGES AND PITCH · cl. 512.5.4');
    kv(c, W, [['Bolt hole: diameter + 1.5 mm', `${r.d0} mm`], [`Edge distance, at least ${st.edge === 'machine' ? '1.5' : '1.75'} × hole`, `${st.e} mm ${mark(st.e >= r.minE - 1e-9)} ${r.minE.toFixed(0)} mm`, st.e >= r.minE - 1e-9 ? OK : BAD], ['Edge distance, at most 12 t', `${mark(st.e <= r.maxE)} ${r.maxE} mm`, st.e <= r.maxE ? OK : BAD],
      ['Pitch, at least 2.5 × diameter', `${st.p} mm ${mark(st.p >= r.minP)} ${r.minP} mm`, st.p >= r.minP ? OK : BAD], ['Pitch, at most 32 t or 300 mm', `${mark(st.p <= Math.min(32 * st.t, 300))} ${Math.min(32 * st.t, 300)} mm`, st.p <= Math.min(32 * st.t, 300) ? OK : BAD],
      [`Along the stress: ${st.comp ? 12 : 16} t or 200 mm`, `${mark(st.p <= r.along)} ${r.along} mm`, st.p <= r.along ? OK : BAD], ['Fasteners in load bearing members', 'at least 16 mm']], 58, 27);
    foot(c, H, 'Corrosive exposure: edge distance at most 40 mm + 4 t');
  },
  steps: [
    { title: 'Not too close', text: 'Bolts need room for the spanner and for the steel between them. Drag the pitch down.',
      check: { q: 'The minimum distance between centres of adjacent bolts or rivets is… (cl. 512.5.4 c)', options: ['2.5 times the shank diameter', '1.5 times the hole', '5 times the diameter'], answer: 0, why: 'Not less than 2.5 times the diameter of the shank of the bolt or rivet (cl. 512.5.4 c 1).' } },
    { title: 'Not too far', text: 'Drag the pitch up. Plates held too far apart gape, let in water and can buckle.',
      check: { q: 'Along the stress in a tension member, the pitch is not more than… (cl. 512.5.4 c)', options: ['16 t or 200 mm', '32 t or 300 mm', '4.5 d'], answer: 0, why: '16t or 200 mm in tension members and 12t or 200 mm in compression members; in general not more than 32t or 300 mm (cl. 512.5.4 c 2, 3).' } },
    { title: 'The edge', text: 'Change the edge distance and how the edge was cut. A sheared edge needs more.',
      check: { q: 'From a sheared or hand flame cut edge, the hole centre is at least… (cl. 512.5.4 b)', options: ['1.75 times the hole diameter', '1.5 times the hole diameter', '12 t'], answer: 0, why: '1.5 times the hole diameter from rolled, machine flame cut, sawn or planed edges, and 1.75 times from sheared or hand flame cut edges (cl. 512.5.4 b).' } },
  ],
});

// ---------------------------------------------------------------- 6 · tension, and shear with tension
const tn = st => { const [fub, fyb] = CLS[st.cls], Vd = boltShear({ d: st.d, fub, nn: 1 }), Td = boltTension({ d: st.d, fub, fyb }), u = (st.V / Vd) ** 2 + (st.T / Td) ** 2; return { fub, Vd, Td, u, ok: u <= 1 + 1e-9 }; };
export const tension = spread({
  init: { d: 20, cls: '8.8', V: 40, T: 60 },
  chips: [DIA, CLASS, ['T', [0, 40, 80, 120, 160], v => `Tension ${v} kN`]],
  slider: { key: 'V', name: 'V', label: 'shear · drag', values: range(0, 150, 10), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stand(group), m = paint(), b = boltMesh(.5, 2.2), aT = arrow(0xc23b2f, .1), aV = arrow(0xc23b2f, .1); aT.rotation.z = -Math.PI / 2;
    b.position.set(0, 5, 0); g.add(box(7, .9, 3.4, m, 0, 5.5, 0), box(5, .9, 3.4, m, 0, 4.5, 0), box(.5, 3, 3.4, m, 0, 2.6, 0), b, aT, aV, box(1.2, 7, 3.4, SM.concrete, -4.2, 3.5, 0));
    const tag = holo.label('', TAG); tag.position.set(0, 9.6, -5); group.add(tag);
    return {
      place() { const r = tn(st); aT.position.set(0, 1, 0); aT.userData.len(st.T / 60); aV.position.set(2.7, 4.5, 0); aV.userData.len(st.V / 50); b.traverse(o => { if (o.material) o.material = r.ok ? SM.steel : REDP; }); tag.userData.setText(`(V/Vdb)² + (T/Tdb)² = ${r.u.toFixed(2)} ${r.ok ? '≤' : '>'} 1`); },
      debug: () => { const r = tn(st); return { Vd: +r.Vd.toFixed(1), Td: +r.Td.toFixed(1), u: +r.u.toFixed(3) }; },
    };
  },
  draw(c, W, H, st) {
    const r = tn(st), x0 = 40, y0 = 176, R = 116, X = v => x0 + v * R, Y = v => y0 - v * R;
    head(c, 'SHEAR AND TENSION · cl. 512.5.5.5, 512.5.7');
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, Y(1.12)); c.lineTo(x0, y0); c.lineTo(X(1.12), y0); c.stroke();
    c.strokeStyle = OXIDE; c.lineWidth = 2.4; c.beginPath(); c.arc(x0, y0, R, -Math.PI / 2, 0); c.stroke();
    c.fillStyle = DIMC; c.font = `500 11px ${F}`; c.fillText('T / Tdb', x0 + 6, Y(1.12) + 8); c.fillText('V / Vdb', X(1.12) - 30, y0 + 14); c.fillText('1', X(1) - 3, y0 + 14); c.fillText('1', x0 - 10, Y(1) + 4);
    c.fillStyle = r.ok ? INK : BAD; c.beginPath(); c.arc(X(Math.min(1.15, st.V / r.Vd)), Y(Math.min(1.15, st.T / r.Td)), 5, 0, 7); c.fill();
    const xr = X(1.12) + 16; c.textAlign = 'left';
    [['Vdb, single shear', kN(r.Vd)], ['Tdb = Tnb / γmb', kN(r.Td)], ['Tnb = 0.90 fub Anb', kN(r.Td * GMB)], ['Shear Vsb', `${st.V} kN`], ['Tension Tb', `${st.T} kN`]].forEach(([a, b], i) => {
      const y = 62 + i * 25; c.fillStyle = DIMC; c.font = `500 13px ${F}`; c.fillText(a, xr, y); c.textAlign = 'right'; c.fillStyle = INK; c.font = `700 14px ${F}`; c.fillText(b, W - 18, y); c.textAlign = 'left';
    });
    c.fillStyle = r.ok ? OK : BAD; c.font = `700 16px ${F}`; c.fillText(`${mark(r.ok)} (Vsb/Vdb)² + (Tb/Tdb)² = ${r.u.toFixed(2)}`, 18, 216);
    lines(c, 'Tnb = 0.90 fub Anb, not more than fyb Asb (γmb/γm0). Rivets in tension should be avoided wherever possible (512.5.6.5).', 18, 240, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, `M${st.d} class ${st.cls}: fub ${r.fub} MPa, Anb ${BOLT_AREA[st.d]} mm², threads in the shear plane`);
  },
  steps: [
    { title: 'A bolt pulled along its axis', text: 'A bolt in tension breaks at its threads, where the area is least.',
      check: { q: 'The nominal tensile capacity of a bolt is Tnb = … (cl. 512.5.5.5)', options: ['0.90 fub Anb', 'fub Asb / √3', '2.5 kb d t fu'], answer: 0, why: 'Tnb = 0.90 fub Anb, less than fyb Asb (γmb/γm0); Tdb = Tnb/γmb (cl. 512.5.5.5).' } },
    { title: 'Shear as well', text: 'Drag the shear on a bolt that is already in tension. The point must stay inside the quarter circle.',
      check: { q: 'A bolt in shear and tension together must satisfy… (cl. 512.5.7)', options: ['(Vsb/Vdb)² + (Tb/Tdb)² ≤ 1.0', 'Vsb/Vdb + Tb/Tdb ≤ 2.0', 'Vsb × Tb ≤ Vdb × Tdb'], answer: 0, why: '(Vsb/Vdb)² + (Tb/Tdb)² ≤ 1.0, for bolts and rivets alike (cl. 512.5.7).' } },
    { title: 'Friction grip bolts', text: 'A high strength friction grip bolt clamps the plates so hard that friction carries the shear.',
      check: { q: 'In HSFG bolting, slip between the plates is opposed by… (cl. 512.6.1)', options: ['friction from the clamping force of the pretensioned bolt', 'bearing of the shank on the hole', 'welding the nut'], answer: 0, why: 'Initial pretension in the bolt develops a clamping force at the interfaces; the frictional resistance to slip opposes the applied shear (cl. 512.6.1).' } },
  ],
});

// ---------------------------------------------------------------- 7 · prying force
const PR = { lv: 40, e: 40, be: 100, f0: 560, fy: 250 };   // illustrative T-stub: mm and MPa; f0 the proof stress of a class 8.8 bolt
const py = st => prying({ Te: st.Te, ...PR, t: st.t, pre: st.pre });
export const pry = spread({
  init: { t: 16, Te: 80, pre: false },
  chips: [['Te', [40, 80, 120], v => `Te ${v} kN`], ['pre', [false, true], v => v ? 'Pre-tensioned bolts' : 'Not pre-tensioned']],
  slider: { key: 't', name: 't', label: 'thickness · drag', values: range(10, 40, 2), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stand(group, 1.25, -.35), m = paint(), fl = new THREE.Group(), web = box(.4, 4, 3, m), up = arrow(0xc23b2f, .11); up.rotation.z = Math.PI / 2;
    g.add(box(9, 1.4, 4, SM.concrete, 0, .7, 0), fl, web, up); const bolts = [-1, 1].map(s => { const b = boltMesh(.3, 1.6); g.add(b); return b; }), dn = [-1, 1].map(() => { const a = arrow(0xc23b2f, .08); a.rotation.z = -Math.PI / 2; g.add(a); return a; });
    const tag = holo.label('', TAG); tag.position.set(0, 10, -5); group.add(tag); let key = 0, A = 0;
    return {
      place() {
        const r = py(st), th = st.t * .03;
        if (key !== st.t) { key = st.t; dispose(fl); fl.clear(); fl.add(box(7, th, 3, m, 0, 0, 0, 28)); }
        A = Math.min(.7, .5 * (16 / st.t) ** 2 * st.Te / 80); bend(fl, x => A * Math.max(0, 1 - Math.abs(x) / 3.5)); fl.position.y = 1.4 + th / 2;
        web.position.set(0, 1.4 + th + A + 2, 0); up.position.set(0, 1.4 + th + A + 4.1, 0); up.userData.len(.8 + st.Te / 80);
        bolts.forEach((b, i) => { const s = i ? 1 : -1; b.position.set(s * 1.6, 1.4 + th / 2 + A * .5, 0); dn[i].position.set(s * 1.6, .9, 2.2); dn[i].userData.len(.5 + (st.Te + r.Q) / 120); });
        tag.userData.setText(`each bolt: Te + Q = ${st.Te} + ${r.Q.toFixed(0)} = ${(st.Te + r.Q).toFixed(0)} kN`);
      },
      debug: () => { const r = py(st); return { le: +r.le.toFixed(1), Q: +r.Q.toFixed(1) }; },
    };
  },
  draw(c, W, H, st) {
    const r = py(st);
    head(c, 'PRYING FORCE · cl. 512.7');
    c.fillStyle = INK; c.font = `700 15px ${F}`; c.fillText('Q = (lv / 2 le) [ Te − β η f0 be t⁴ / 27 le lv² ]', 18, 54);
    kv(c, W, [['β, η', `${r.beta} (${st.pre ? 'pre-tensioned' : 'not pre-tensioned'}), 1.5`], ['le, lesser of the end distance and 1.1 t √(β f0 / fy)', `${r.le.toFixed(0)} mm`], ['Tension from the load, per bolt, Te', `${st.Te} kN`], ['Prying force Q', `${r.Q.toFixed(1)} kN`, OXIDE], ['Tension in the bolt Te + Q', `${(st.Te + r.Q).toFixed(0)} kN`, OXIDE]], 82, 28);
    lines(c, 'A flexible end plate bends and levers against its own edges. That reaction, the prying force, is added to the tension in the bolt.', 18, 228, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, `lv ${PR.lv}, end distance ${PR.e}, be ${PR.be} mm · f0 ${PR.f0}, fy ${PR.fy} MPa (illustrative)`);
  },
  steps: [
    { title: 'A lever on the bolt', text: 'Pull the T-stub: its flange bends, its tips press down, and the bolts must carry that extra force. Drag the plate thinner.',
      check: { q: 'Where prying force Q is significant, it is… (cl. 512.7)', options: ['added to the tension in the bolt', 'subtracted from the bolt tension', 'ignored for bolts'], answer: 0, why: 'Where prying force is significant it shall be calculated and added to the tension in the bolt (cl. 512.7).' } },
    { title: 'A stiffer plate', text: 'Drag the plate thicker. The term in t⁴ grows quickly and the prying force vanishes.',
      check: { q: 'In the prying formula, lv is the distance from the bolt centre line to…', options: ['the toe of the fillet weld, or half the root radius', 'the edge of the plate', 'the next bolt'], answer: 0, why: 'lv is the distance from the bolt centreline to the toe of the fillet weld or to half the root radius for a rolled section; le is the distance between the prying force and the bolt centreline (cl. 512.7).' } },
    { title: 'Pre-tensioned bolts', text: 'Switch to pre-tensioned bolts: β changes from 2 to 1.',
      check: { q: 'For a pre-tensioned bolt, β = …', options: ['1', '2', '1.5'], answer: 0, why: 'β = 2 for a non pre-tensioned bolt and 1 for a pre-tensioned bolt; η = 1.5 (cl. 512.7).' } },
  ],
});

// ---------------------------------------------------------------- 8 · what splices and joints are designed for
const CAP = 1000;   // capacity of the member or flange, kN (illustrative)
const big = Fo => Math.max(1.1 * Fo, .8 * CAP);
const KIND = {
  flange: ['Flange splice of a girder', big, 'The greater of 1.10 × the flange force and 0.80 × the capacity of the weaker flange. The splice plates have at least the area of the flange (512.5.2 b).'],
  member: ['Splice in a tension or compression member', big, 'Not of bearing type: the greater of 1.10 × the force in the member and 0.80 × its capacity, plus any moment. The ends need not be in close contact (512.5.3 c).'],
  bearing: ['Bearing splice in a compression member', Fo => .6 * Fo, 'Ends machined and in close contact are taken to transmit 50 % of the compressive force; the splice plates and connection are designed for 60 % of it (512.5.3 d).'],
  inter: ['Connection at an intersection', Fo => 1.1 * Fo, 'Connections of members at an intersection develop at least 1.10 × the design loads and moments in the members (512.5.3 b).'],
  gusset: ['Gusset plate', Fo => 1.05 * Fo, 'Gusset plates sustain 1.05 × the design loads and moments. An unsupported edge in compression longer than 50 t is stiffened (512.5.3 b).'],
};
export const splices = spread({
  init: { kind: 'flange', u: 60 },
  chips: [['kind', Object.keys(KIND), v => ({ flange: 'Flange splice', member: 'Member splice', bearing: 'Bearing splice', inter: 'Intersection', gusset: 'Gusset plate' })[v]]],
  slider: { key: 'u', name: 'Force', label: 'member force · drag', values: range(20, 100, 10), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = table(group, 2.8), m = paint(), parts = new THREE.Group(); g.add(parts);
    const tag = holo.label('', TAG); tag.position.set(0, 8.6, -5); group.add(tag);
    return {
      place() {
        dispose(parts); parts.clear(); const gs = st.kind === 'inter' || st.kind === 'gusset', gap = st.kind === 'bearing' ? 0 : .12;
        if (gs) { parts.add(box(6, .26, 5.4, GREEN, 0, .28, 0), box(7, .3, 1.6, m, -5, 0, 0), box(7, .3, 1.6, m, 5, 0, 0)); const d = box(6, .3, 1.4, m, 1.6, 0, -2.4); d.rotation.y = .9; parts.add(d); for (const x of [-2.2, -1.2, 1.2, 2.2]) parts.add(cyl(.2, .5, SM.steel, x, .4, 0, 6)); }
        else { parts.add(box(7, .4, 3, m, -3.5 - gap, 0, 0), box(7, .4, 3, m, 3.5 + gap, 0, 0), box(6, .26, 3, GREEN, 0, .33, 0)); for (const x of [-2.4, -1.2, 1.2, 2.4]) for (const z of [-.8, .8]) parts.add(cyl(.2, .5, SM.steel, x, .45, z, 6)); }
        const Fo = st.u / 100 * CAP; tag.userData.setText(`design the ${gs ? (st.kind === 'gusset' ? 'gusset' : 'connection') : 'splice'} for ${kN(KIND[st.kind][1](Fo))}`);
      },
      debug: () => ({ design: KIND[st.kind][1](st.u / 100 * CAP) }),
    };
  },
  draw(c, W, H, st) {
    const [name, f, text] = KIND[st.kind], Fo = st.u / 100 * CAP, two = f === big;
    head(c, 'DESIGN FORCES FOR JOINTS · cl. 512.5.2, 512.5.3');
    c.fillStyle = INK; c.font = `700 17px ${F}`; c.fillText(name, 18, 58);
    const rows = [['Capacity of the member or flange', kN(CAP)], [`Factored force in it, ${st.u} %`, kN(Fo)]];
    if (two) rows.push(['1.10 × the force', kN(1.1 * Fo), 1.1 * Fo >= .8 * CAP ? OXIDE : INK], ['0.80 × the capacity', kN(.8 * CAP), 1.1 * Fo >= .8 * CAP ? INK : OXIDE]);
    rows.push(['Design the joint for', kN(f(Fo)), OXIDE]);
    const y = kv(c, W, rows, 86, 27);
    lines(c, text, 18, y + 6, W - 36, 18, INK, `500 13.5px ${F}`);
    foot(c, H, 'A member carrying calculated stress never has a single bolt or rivet');
  },
  steps: [
    { title: 'Stronger than the force', text: 'A splice is designed for more than the force in the member at that point. Drag the force down: the splice still needs most of the member’s capacity.',
      check: { q: 'A bolted flange splice transmits at least the greater of 1.10 × the flange force and… (cl. 512.5.2 b)', options: ['0.80 × the capacity of the weaker flange', '0.50 × the capacity', '2.0 × the flange force'], answer: 0, why: 'The greater of 1.10 times the force in the flange at the splice and 0.80 times the maximum capacity of the weaker flange (cl. 512.5.2 b).' } },
    { title: 'Bearing splices', text: 'Pick the bearing splice. Machined ends pressed together carry part of the compression themselves.',
      check: { q: 'In a bearing splice of a compression member, the splice plates are designed for… (cl. 512.5.3 d)', options: ['60 % of the compressive force', '10 % of it', '110 % of it'], answer: 0, why: 'The machined faces may be assumed to transmit 50 per cent of the compressive force, but the splice plates and connection are designed for 60 per cent of it, and any moment (cl. 512.5.3 d).' } },
    { title: 'Truss joints', text: 'Pick Intersection, then Gusset plate.',
      check: { q: 'Gusset plates sustain… (cl. 512.5.3 b)', options: ['1.05 × the design loads and moments', '0.80 × the design loads', '2.5 % of the chord force'], answer: 0, why: 'Connections at an intersection develop at least 1.10 times the design loads and moments; gusset plates sustain 1.05 times them (cl. 512.5.3 b).' } },
  ],
});

// ---------------------------------------------------------------- 9 · long joints, large grips and packings
const rd = st => { const long = st.lj > 15 * st.d, blj = long ? longJoint(st.lj, st.d) : 1, grip = st.lg > 5 * st.d, blg = grip ? Math.min(largeGrip(st.lg, st.d), blj) : 1, bpk = packingFactor(st.tpk); return { long, blj, grip, blg, bpk, okG: st.lg <= 8 * st.d, all: blj * blg * bpk }; };
export const reductions = spread({
  init: { lj: 400, d: 20, lg: 60, tpk: 0 },
  chips: [DIA, ['lg', [40, 60, 120, 160, 200], v => `Grip ${v}`], ['tpk', [0, 6, 10, 16], v => `Packing ${v}`]],
  slider: { key: 'lj', name: 'lj', label: 'joint length · drag', values: range(100, 1200, 100), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = table(group, 2.6, .45), m = paint(), parts = new THREE.Group(); g.add(parts);
    const tag = holo.label('', TAG); tag.position.set(0, 8.6, -5); group.add(tag);
    return {
      place() {
        dispose(parts); parts.clear(); const r = rd(st), L = 3 + st.lj * .009, n = Math.max(2, Math.round(st.lj / 100) + 1), th = Math.max(.25, st.lg * .006), pk = st.tpk * .03;
        parts.add(box(L + 4, th, 3, m, -2, 0, 0), box(L + 4, th, 3, m, 2, th + pk, 0)); if (pk) parts.add(box(L, pk, 3, GREEN, 0, th / 2 + pk / 2, 0));
        for (let i = 0; i < n; i++) { const x = -L / 2 + .6 + i * (L - 1.2) / (n - 1), end = 1 - Math.min(i, n - 1 - i) / Math.max(1, (n - 1) / 2), hot = r.long && end > .6; parts.add(cyl(.22, 2 * th + pk + .5, hot ? REDP : SM.steel, x, th / 2 + pk / 2, 0, 6), box(.3, .4 + end * (r.long ? 1.6 : .2), .3, hot ? REDP : GREEN, x, 2 * th + pk + .6 + (.4 + end * (r.long ? 1.6 : .2)) / 2, 0)); }
        tag.userData.setText(`shear capacity of each bolt × ${r.all.toFixed(2)}`);
      },
      debug: () => rd(st),
    };
  },
  draw(c, W, H, st) {
    const r = rd(st);
    head(c, 'LONG JOINTS, GRIPS, PACKINGS · cl. 512.5.8, 512.5.9');
    kv(c, W, [[`Joint length lj, against 15 d = ${15 * st.d} mm`, `${st.lj} mm`], ['βlj = 1.075 − lj / 200 d, from 0.75 to 1.0', r.long ? r.blj.toFixed(2) : 'not needed', r.long ? OXIDE : INK], [`Grip lg, against 5 d = ${5 * st.d} mm; limit 8 d`, `${st.lg} mm ${mark(r.okG)}`, r.okG ? INK : BAD],
      ['βlg = 8 d / (3 d + lg), not above βlj', r.grip ? r.blg.toFixed(2) : 'not needed', r.grip ? OXIDE : INK], ['Packing over 6 mm: βpk = 1 − 0.0125 tpk', st.tpk > 6 ? r.bpk.toFixed(2) : 'not needed', st.tpk > 6 ? OXIDE : INK], ['Shear capacity of a bolt, multiplied by', r.all.toFixed(2), OXIDE]], 58, 28);
    lines(c, 'In a long joint the end bolts take more than their share: the bars show it. The rule does not apply where the shear is uniform along the joint, as between web and flange.', 18, 232, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, 'lj: between the first and last rows of fasteners, along the load');
  },
  steps: [
    { title: 'A long line of bolts', text: 'In a long joint the plates stretch, and the end bolts carry more than the middle ones. Drag the joint longer.',
      check: { q: 'The long joint reduction applies when the joint length exceeds… (cl. 512.5.8)', options: ['15 d', '5 d', '150 tt'], answer: 0, why: 'When lj exceeds 15d in the direction of load, the nominal shear capacity is reduced by βlj = 1.075 − lj/(200d), with 0.75 ≤ βlj ≤ 1.0 (cl. 512.5.8).' } },
    { title: 'A thick pile of plates', text: 'Increase the grip. A long bolt bends as well as shears.',
      check: { q: 'The grip length shall in no case be greater than… (cl. 512.5.9)', options: ['8 d', '5 d', '15 d'], answer: 0, why: 'When lg exceeds 5d the design shear capacity is reduced by βlg = 8d/(3d + lg), not more than βlj; lg shall in no case exceed 8d (cl. 512.5.9).' } },
    { title: 'Packing plates', text: 'Add a packing plate between the parts. Thick packings bend the bolt too.',
      check: { q: 'For a packing thicker than 6 mm, the shear capacity is multiplied by… (cl. 512.5.9)', options: ['1 − 0.0125 tpk', '1 − 0.25 tpk', '0.5'], answer: 0, why: 'βpk = (1 − 0.0125 tpk), with tpk the thickness of the thicker packing in mm (cl. 512.5.9).' } },
  ],
});
