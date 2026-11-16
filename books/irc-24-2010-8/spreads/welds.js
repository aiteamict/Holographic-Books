// Chapter 8, spreads 1–3 · welded connections (cl. 512.4).
//   fillet      (cl. 512.4.3.2, 512.4.5)  strength of a fillet weld: throat, effective length, shop or site, long joints
//   weldrules   (cl. 512.4.4.1)           intermittent fillet welds and the other general requirements
//   weldstress  (cl. 512.4.7, 512.4.8)    normal and shear stress combined in a fillet weld
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, arrow, box, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, TAG } from '../../_irc24/kit.js';
import { FU, GMW, filletStrength, weldLongJoint, weldEquivalent } from '../../_irc24/steel.js';

export const GRADES = ['fy', [250, 300], v => `E ${v}`];
export const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
export const kN = v => `${v.toFixed(0)} kN`;
export const mark = ok => ok ? '✓' : '✗';
export const WELD = new THREE.MeshStandardMaterial({ color: 0x6f7a84, roughness: .4, metalness: .6, side: THREE.DoubleSide });
export const GREEN = paint(0x2f8f55, .5, .2), REDP = paint(0xc23b2f, .5, .2);
/** A tilted table, so that flat plates show their top face to the reader. */
export const table = (group, y = 2.6, tilt = .5, k = 1.15) => { const g = new THREE.Group(); g.position.set(0, y, -5); g.rotation.x = tilt; g.scale.setScalar(k); group.add(g); return g; };
/** A fillet weld along x: a triangular prism with legs s, lying on the plane y = 0 against a face at z = 0. side −1 mirrors it. */
export function wedge(len, s, side = 1, mat = WELD) {
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(s, 0); sh.lineTo(0, s); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false }); geo.translate(0, 0, -len / 2);
  const m = new THREE.Mesh(geo, mat); m.rotation.y = -Math.PI / 2; m.scale.x = side; m.castShadow = true; return m;   // the prism's length now runs along x, its flat leg along +z
}

// ---------------------------------------------------------------- 1 · strength of a fillet weld
const fw = st => {
  const tt = st.s / Math.SQRT2, lw = st.ret ? st.l : st.l - 2 * st.s, fwd = filletStrength(FU[st.fy], st.site), b = weldLongJoint(st.l, tt), one = tt * lw * fwd * b / 1000;
  return { tt, lw, fwd, b, one, max: st.t - 1, okS: st.s <= st.t - 1 };
};
export const fillet = spread({
  init: { s: 8, l: 300, site: false, ret: false, t: 12, fy: 250 },
  chips: [['l', [150, 300, 600, 1500], v => `Length ${v}`], ['site', [false, true], v => v ? 'Site weld' : 'Shop weld'], ['ret', [false, true], v => v ? 'End returns' : 'No end returns'], ['t', [10, 12, 16], v => `Plate ${v}`], GRADES],
  slider: { key: 's', name: 'Leg', label: 'leg size · drag', values: [4, 5, 6, 8, 10, 12, 14, 16], at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = table(group), m = paint(), parts = new THREE.Group(), ar = [-1, 1].map(s => { const a = arrow(0xc23b2f, .1); g.add(a); return a; }); g.add(parts);
    const tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag);
    return {
      place() {
        dispose(parts); parts.clear(); const r = fw(st), L = Math.min(11, st.l * .018 + 1.5), th = st.t * .03, s = st.s * .05, W = 3;
        parts.add(box(L + 4, th, 6, m, -2, 0, 0), box(L + 4, th, W, m, 2, th, 0));   // the two plates lap over the length L about x = 0
        const xc = 0;
        for (const sd of [-1, 1]) { const w = wedge(L, s, sd, r.okS ? WELD : REDP); w.position.set(xc, th / 2, sd * W / 2); parts.add(w); }
        ar[0].position.set(-L / 2 - 4.2, 0, 0); ar[0].userData.len(-1.4); ar[1].position.set(L / 2 + 4.2, th, 0); ar[1].userData.len(1.4);
        tag.userData.setText(r.okS ? `two welds: ${kN(2 * r.one)}` : `leg too large for a ${st.t} mm edge`);
      },
      debug: () => { const r = fw(st); return { tt: +r.tt.toFixed(2), fwd: +r.fwd.toFixed(1), b: +r.b.toFixed(3), one: +r.one.toFixed(1) }; },
    };
  },
  draw(c, W, H, st) {
    const r = fw(st);
    head(c, 'FILLET WELD · cl. 512.4.3.2, 512.4.5');
    kv(c, W, [['Throat tt = leg / √2', `${st.s} / √2 = ${r.tt.toFixed(1)} mm`], [st.ret ? 'Effective length, with end returns' : 'Effective length = length − 2 × leg', `${r.lw} mm`], ['fwd = fu / √3 γmw', `${FU[st.fy]} / (√3 × ${GMW[st.site ? 'site' : 'shop'].toFixed(2)}) = ${r.fwd.toFixed(0)} MPa`],
      ['Long joint: βlw = 1.2 − 0.2 lj / 150 tt', r.b.toFixed(2)], ['One weld: tt × length × fwd × βlw', kN(r.one)], ['Two side welds', kN(2 * r.one), OXIDE], [`Leg, at most 1 mm under the ${st.t} mm edge`, `${st.s} mm ${mark(r.okS)} ${r.max} mm`, r.okS ? OK : BAD]], 58, 27);
    foot(c, H, 'Throat: height of the triangle inscribed in the weld (512.4.3.2)');
  },
  steps: [
    { title: 'The throat', text: 'A fillet weld is as strong as its throat: the shortest way through the weld. Drag the leg size.',
      check: { q: 'The design strength of a fillet weld is based on… (cl. 512.4.5.1.1)', options: ['its throat area', 'its leg length squared', 'the plate thickness'], answer: 0, why: 'fwd = fwn/γmw with fwn = fu/√3, based on the throat area; fu is the smaller of the ultimate stress of the weld or the parent metal (cl. 512.4.5.1.1).' } },
    { title: 'Shop and site', text: 'Switch to a site weld. A weld made during erection gets a larger safety factor.',
      check: { q: 'The partial safety factor for welds made in the field is… (Table 1)', options: ['1.50', '1.25', '1.10'], answer: 0, why: 'γmw = 1.25 for shop fabrication and 1.50 for field fabrication (Table 1; cl. 512.4.5.2).' } },
    { title: 'Length that counts', text: 'Without end returns, a leg length is lost at each end. Pick the longest weld: past 150 throats, its capacity is reduced.',
      check: { q: 'The effective length of a fillet weld without end returns is… (cl. 512.4.3.2)', options: ['the actual length minus twice the leg length', 'the actual length', 'half the actual length'], answer: 0, why: 'The effective length is the actual length minus twice the leg length; with end returns it is the actual length (cl. 512.4.3.2).' } },
  ],
});

// ---------------------------------------------------------------- 2 · intermittent welds and general requirements
const wr = st => { const k = st.comp ? 12 : 16, lim = Math.min(200, k * st.t); return { k, lim, ok: st.gap <= lim }; };
export const weldrules = spread({
  init: { gap: 150, t: 10, comp: false },
  chips: [['t', [8, 10, 12, 16], v => `Thinner part ${v}`], ['comp', [false, true], v => v ? 'In compression' : 'In tension']],
  slider: { key: 'gap', name: 'Gap', label: 'gap · drag', values: range(50, 300, 25), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = table(group), m = paint(), beads = new THREE.Group(); g.add(box(15, .3, 5, m), box(15, 2.2, .3, m, 0, 1.25, 0), beads);
    const tag = holo.label('', TAG); tag.position.set(0, 8.6, -5); group.add(tag);
    return {
      place() {
        dispose(beads); beads.clear(); const r = wr(st), bl = 1.3, gp = st.gap * .011, n = Math.max(2, Math.floor((15 + gp) / (bl + gp))), tot = n * bl + (n - 1) * gp;
        for (let i = 0; i < n; i++) for (const sd of [-1, 1]) { const w = wedge(bl, .3, sd, r.ok ? WELD : REDP); w.position.set(-tot / 2 + bl / 2 + i * (bl + gp), .15, sd * .15); beads.add(w); }
        tag.userData.setText(`gap ${st.gap} mm ${mark(r.ok)} limit ${r.lim} mm`);
      },
      debug: () => wr(st),
    };
  },
  draw(c, W, H, st) {
    const r = wr(st);
    head(c, 'INTERMITTENT FILLET WELDS · cl. 512.4.4.1');
    const y = kv(c, W, [['Clear gap between the ends of welds', `${st.gap} mm`], ['Never more than', `200 mm ${mark(st.gap <= 200)}`, st.gap <= 200 ? OK : BAD], [`${r.k} × thinner part, in ${st.comp ? 'compression' : 'tension'}`, `${r.k * st.t} mm ${mark(st.gap <= r.k * st.t)}`, st.gap <= r.k * st.t ? OK : BAD],
      ['Welding stiffeners to a plate', '≤ ¼ of the stiffener spacing'], ['End return round a corner', '≥ 2 × leg length'], ['Side fillets only: each weld', '≥ their distance apart, ≥ 4 t'], ['Lap for transverse welds', '≥ 4 t, two lines of weld']], 58, 27);
    lines(c, 'Not where rust pockets could form. A weld at each end of the part connected.', 18, y + 2, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, 'Intermittent butt welds shall not be used (512.4.2)');
  },
  steps: [
    { title: 'Welds with gaps', text: 'An intermittent weld saves welding, but the plate between the welds can buckle or gape. Drag the gap.',
      check: { q: 'The clear gap between intermittent fillet welds is never more than… (cl. 512.4.4.1)', options: ['200 mm', '500 mm', '50 mm'], answer: 0, why: 'Not more than 200 mm, nor 12 times the thickness of the thinner part in compression, nor 16 times in tension (cl. 512.4.4.1).' } },
    { title: 'Compression is stricter', text: 'Switch the part to compression, then make it thinner.',
      check: { q: 'For a part in compression, the gap is not more than…', options: ['12 times the thinner part', '16 times the thinner part', '32 times the thinner part'], answer: 0, why: '12 times the thickness of the thinner part when the part is in compression, 16 times when it is in tension (cl. 512.4.4.1).' } },
    { title: 'Where they may be used', text: 'Gaps hold water. Intermittent welds are for places protected from the weather.',
      check: { q: 'Intermittent fillet welds should not be used where…', options: ['rust pockets could form', 'the plate is thick', 'the weld is made in the shop'], answer: 0, why: 'They should not be used where they could result in the formation of rust pockets; they are permitted where the connection is protected from weather, as inside box sections (cl. 512.4.4.1).' } },
  ],
});

// ---------------------------------------------------------------- 3 · combined stresses in a fillet weld
const LW3 = 200;   // length of each of the two welds, mm
const ws = st => { const tt = st.s / Math.SQRT2, A = 2 * tt * (LW3 - 2 * st.s), a = st.ang * Math.PI / 180, fa = st.P * 1000 * Math.sin(a) / A, q = st.P * 1000 * Math.cos(a) / A, fe = weldEquivalent(fa, q), lim = filletStrength(410); return { A, fa, q, fe, lim, ok: fe <= lim + 1e-9, skip: fa + q <= lim }; };
export const weldstress = spread({
  init: { P: 200, ang: 30, s: 8 },
  chips: [['P', [100, 200, 300, 400], v => `P ${v} kN`], ['s', [6, 8, 10, 12], v => `Leg ${v}`]],
  slider: { key: 'ang', name: 'Angle', label: 'angle · drag', values: range(0, 90, 10), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.rotation.y = -.5; g.scale.setScalar(1.2); group.add(g);
    const m = paint(), welds = new THREE.Group(), a = arrow(0xc23b2f, .11), piv = new THREE.Group(); piv.position.set(0, 3.2, 0); piv.add(a); g.add(box(9, .5, 6, m, 0, .25, 0), box(6, 5, .4, m, 0, 3, 0), welds, piv);
    const tag = holo.label('', TAG); tag.position.set(0, 9.6, -5); group.add(tag);
    return {
      place() {
        dispose(welds); welds.clear(); const r = ws(st), s = st.s * .06;
        for (const sd of [-1, 1]) { const w = wedge(6, s, sd, r.ok ? WELD : REDP); w.position.set(0, .5, sd * .2); welds.add(w); }
        piv.rotation.z = st.ang * Math.PI / 180; a.position.set(3.2, 0, 0); a.userData.len(1 + st.P / 150);   // 0°: along the welds; 90°: straight up, pulling the plate off
        tag.userData.setText(`fe = ${r.fe.toFixed(0)} MPa ${r.ok ? '≤' : '>'} ${r.lim.toFixed(0)} MPa`);
      },
      debug: () => { const r = ws(st); return { fa: +r.fa.toFixed(1), q: +r.q.toFixed(1), fe: +r.fe.toFixed(1) }; },
    };
  },
  draw(c, W, H, st) {
    const r = ws(st);
    head(c, 'COMBINED STRESSES IN A FILLET WELD · cl. 512.4.8');
    const y = kv(c, W, [['Throat area of the two welds, tt lw', `${r.A.toFixed(0)} mm²`], ['Normal stress fa = P sin θ / tt lw', `${r.fa.toFixed(0)} MPa`], ['Shear stress q = P cos θ / tt lw', `${r.q.toFixed(0)} MPa`], ['fe = √( fa² + 3 q² )', `${r.fe.toFixed(0)} MPa`, OXIDE], ['Limit fu / √3 γmw', `${r.lim.toFixed(0)} MPa`]], 58, 28);
    c.fillStyle = r.ok ? OK : BAD; c.font = `700 16px ${F}`; c.fillText(r.ok ? '✓ fe within the limit' : '✗ fe exceeds the limit', 18, y + 12);
    lines(c, r.skip ? 'Here fa + q does not exceed fwd, so the combination need not be checked (512.4.8.1.2 b).' : 'No check is needed for side fillets joining cover plates and flange plates, or where fa + q ≤ fwd (512.4.8.1.2).', 18, y + 38, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, `Two ${LW3} mm welds, leg ${st.s} mm, shop welded · θ from the weld axis`);
  },
  steps: [
    { title: 'Along and across', text: 'A force along the welds shears them. Drag the angle: the force turns until it pulls the plate straight off.',
      check: { q: 'Under one force alone, the stress in a weld is… (cl. 512.4.7)', options: ['P / (tt lw)', 'P / leg²', 'P × tt'], answer: 0, why: 'fa or q = P/(tt lw), with tt the effective throat thickness and lw the effective length of the weld (cl. 512.4.7).' } },
    { title: 'The equivalent stress', text: 'Normal and shear stresses are combined into one equivalent stress.',
      check: { q: 'The equivalent stress in a fillet weld is fe = … (cl. 512.4.8.1.1)', options: ['√( fa² + 3 q² )', 'fa + q', 'fa × q'], answer: 0, why: 'fe = √(fa² + 3q²) ≤ fu/(√3 γmw) (cl. 512.4.8.1.1).' } },
    { title: 'When no check is needed', text: 'For many welds the combination need not be worked out at all.',
      check: { q: 'The combination check may be omitted when… (cl. 512.4.8.1.2)', options: ['the sum of normal and shear stresses is within fwd', 'the weld is longer than 1 m', 'the weld is made on site'], answer: 0, why: 'For side fillet welds joining cover plates and flange plates, and for fillet welds where the sum of normal and shear stresses does not exceed fwd (cl. 512.4.8.1.2).' } },
  ],
});
