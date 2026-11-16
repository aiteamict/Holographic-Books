// Chapter 6, spreads 1–4 · shear in the web of a plate girder.
//   shear     (cl. 509.4, 509.4.1)   plastic shear resistance of the web
//   buckling  (cl. 509.4.2.2 a)      shear buckling by the simple post-critical method
//   tension   (cl. 509.4.2.2 b)      tension field action between transverse stiffeners
//   endpanel  (cl. 509.5)            end panels, end posts and the anchor forces
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, arrow, box, bend, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, OXIDE_HEX, TAG } from '../../_irc24/kit.js';
import { GM0, eps, shearBuckling, tensionField, anchorForces } from '../../_irc24/steel.js';

export const DW = 1600, BF = 500, TF = 32;   // the girder of these pages: web depth, flange width and thickness, mm
export const LG = 16, DG = 4, Y0 = 2.2, YM = Y0 + .2 + DG / 2;   // its model: length, web depth, soffit height and mid-depth, page cm
export const GREEN = paint(0x2f8f55, .5, .2);
export const GRADES = ['fy', [250, 300], v => `E ${v}`], TWS = ['tw', [8, 10, 12, 16], v => `tw ${v}`];
export const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
export const kN = v => `${v.toFixed(0)} kN`;
export const stage = group => { const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.1); group.add(g); return g; };
/** A plate girder seen from the side on two supports. xs: transverse stiffeners; longs: longitudinal stiffeners, as fractions of the depth below the top flange. */
export function girder(parent, { xs = [], longs = [], mat, seg = 1 }) {
  const g = new THREE.Group(); parent.add(g);
  const web = box(LG, DG, .1, mat, 0, YM, 0, seg); g.add(web, box(LG, .2, 1.5, mat, 0, Y0 + .1, 0, seg), box(LG, .2, 1.5, mat, 0, Y0 + .3 + DG, 0, seg));
  for (const x of xs) g.add(box(.12, DG, .62, GREEN, x, YM, .36));
  for (const f of longs) g.add(box(LG, .12, .5, GREEN, 0, Y0 + .2 + DG * (1 - f), .3));
  for (const s of [-1, 1]) g.add(box(1, Y0, 2.2, SM.concrete, s * (LG / 2 - .5), Y0 / 2, 0));
  return { g, web };
}
/** Stiffener positions for a spacing of cd × depth; 0 = at the supports only. */
export const stiffXs = cd => { const xs = [-LG / 2 + .5, LG / 2 - .5]; if (cd) { const c = cd * DG; for (let x = -LG / 2 + .5 + c; x < LG / 2 - .5 - c * .35; x += c) xs.push(x); } return xs; };
/** Diagonal waves in a segmented web: the look of a plate buckled in shear. */
function ripple(web, A, wl = 1.7) {
  const b = web.userData.base, p = web.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, b[i * 3 + 2] + A * Math.sin((b[i * 3] + b[i * 3 + 1]) * 2 * Math.PI / wl));
  p.needsUpdate = true; web.geometry.computeVertexNormals();
}
/** Three lines in every panel along the tension diagonal, which falls towards mid-span. skip: panels to leave out, counted from each end. */
function bands(xs, skip = 0) {
  const s = [...xs].sort((a, b) => a - b), pts = [], T = Y0 + .2 + DG, B = Y0 + .2;
  for (let i = skip; i < s.length - 1 - skip; i++) {
    const xa = s[i], c = s[i + 1] - xa, left = xa + c / 2 < 0;
    for (const o of [-.3, 0, .3]) { const P = t => [xa + (o + t) * c, left ? T - t * DG : B + t * DG, .1]; pts.push(P(Math.max(0, -o)), P(Math.min(1, 1 - o))); }
  }
  return pts;
}
const loads = g => { for (const x of [-2.5, 2.5]) { const a = arrow(0xc23b2f, .1); a.rotation.z = -Math.PI / 2; a.position.set(x, Y0 + .4 + DG + 1.9, 0); a.userData.len(1.6); g.add(a); } };

// ---------------------------------------------------------------- 1 · plastic shear resistance
const sh = st => { const b = shearBuckling({ d: DW, tw: st.tw, fyw: st.fy, cd: 0 }); return { Av: DW * st.tw, Vp: b.Vp, Vd: b.Vp / GM0, lim: 67 * eps(st.fy), slender: DW / st.tw > 67 * eps(st.fy) }; };
export const shear = spread({
  init: { tw: 12, fy: 250, V: 1000 },
  chips: [TWS, GRADES],
  slider: { key: 'V', name: 'V', label: 'shear · drag', values: range(200, 4000, 200), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stage(group), mat = paint(), gi = girder(g, { xs: stiffXs(0), mat, seg: 40 }); loads(g);
    const tag = holo.label('', TAG); tag.position.set(0, 10.6, -5); group.add(tag);
    let k = 0, r = sh(st);
    return {
      place() { r = sh(st); const over = st.V > r.Vd + 1e-6; mat.color.setHex(over ? 0xc23b2f : OXIDE_HEX); tag.userData.setText(over ? 'V > Vd: the web yields in shear' : 'V ≤ Vd'); },
      update(dt) { const u = st.V / r.Vd, to = u > 1 ? Math.min(1.2, .3 + (u - 1) * 3) : .22 * u; k += (to - k) * Math.min(1, dt * 4); bend(gi.g, x => -k * Math.min(1, (LG / 2 - .5 - Math.abs(x)) / 2.5)); },
      debug: () => ({ Vp: +r.Vp.toFixed(0), Vd: +r.Vd.toFixed(0) }),
    };
  },
  draw(c, W, H, st) {
    const r = sh(st), ok = st.V <= r.Vd + 1e-6;
    head(c, 'SHEAR · cl. 509.4, 509.4.1');
    c.fillStyle = INK; c.font = `700 15px ${F}`; c.fillText('Vd = Vn / γm0,  Vn = Vp = Av fyw / √3', 18, 54);
    const y = kv(c, W, [['Shear area Av = d tw (welded I)', `${DW} × ${st.tw} = ${r.Av} mm²`], ['Plastic shear resistance Vp', kN(r.Vp)], ['Design shear strength Vd = Vp / γm0', kN(r.Vd), OXIDE], ['0.6 Vd: above it, bending strength falls', kN(.6 * r.Vd)],
      [`d / tw = ${(DW / st.tw).toFixed(0)} against 67 ε = ${r.lim.toFixed(0)}`, r.slender ? 'check buckling' : 'no buckling check', r.slender ? OXIDE : OK]], 80, 27);
    c.fillStyle = ok ? OK : BAD; c.font = `700 16px ${F}`; c.fillText(ok ? `✓ V = ${st.V} kN ≤ Vd` : `✗ V = ${st.V} kN > Vd`, 18, y + 12);
    foot(c, H, 'Hot rolled I: Av = h tw · minor axis bending: 2 b tf (509.4.1.1)');
  },
  steps: [
    { title: 'The web carries the shear', text: 'Near the supports the web is sheared. Drag the shear force until the web yields.',
      check: { q: 'The plastic shear resistance is Vp = … (cl. 509.4.1)', options: ['Av fyw / √3', 'Av fyw', 'Ag fu / γm1'], answer: 0, why: 'Vn = Vp = Av fyw / √3, where Av is the shear area and fyw the yield strength of the web; Vd = Vn / γm0 (cl. 509.4, 509.4.1).' } },
    { title: 'Shear area', text: 'Change the web thickness. For a welded I the shear area is the web alone, d × tw.',
      check: { q: 'For a welded I-section bending about its major axis, the shear area is… (cl. 509.4.1.1)', options: ['d tw', 'h tw', '2 b tf'], answer: 0, why: 'Major axis bending: hot rolled h tw, welded d tw. Minor axis bending: 2 b tf (cl. 509.4.1.1).' } },
    { title: 'A thin web', text: 'Pick the thinnest web. Its d/tw passes 67ε, so it may buckle before it yields.',
      check: { q: 'For a web without stiffeners, shear buckling is verified when d/tw exceeds… (cl. 509.4.2.1)', options: ['67 ε', '200 ε', '9.4 ε'], answer: 0, why: 'd/tw > 67ε for a web without stiffeners, and > 67ε √(Kv/5.35) for a web with stiffeners (cl. 509.4.2.1).' } },
  ],
});

// ---------------------------------------------------------------- 2 · shear buckling, simple post-critical method
const sb = st => shearBuckling({ d: DW, tw: st.tw, fyw: st.fy, cd: st.cd });
export const buckling = spread({
  init: { tw: 10, fy: 250, cd: 1.5 },
  chips: [TWS, GRADES],
  slider: { key: 'cd', name: 'c/d', label: 'spacing · drag', values: [.5, .75, 1, 1.25, 1.5, 2, 2.5, 3, 0], at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stage(group), mat = paint(); loads(g); let gi = null, key = -1;
    const tag = holo.label('', TAG); tag.position.set(0, 10.6, -5); group.add(tag);
    return {
      place() {
        const r = sb(st);
        if (key !== st.cd) { key = st.cd; if (gi) { g.remove(gi.g); dispose(gi.g); } gi = girder(g, { xs: stiffXs(st.cd), mat, seg: 90 }); }
        ripple(gi.web, Math.max(0, Math.min(.22, (r.lw - .8) * .25))); tag.userData.setText(`Vcr = ${kN(r.Vcr)}${st.cd ? '' : ' · stiffeners at supports only'}`);
      },
      debug: () => { const r = sb(st); return { kv: +r.kv.toFixed(2), lw: +r.lw.toFixed(3), tb: +r.tb.toFixed(1), Vcr: +r.Vcr.toFixed(0) }; },
    };
  },
  draw(c, W, H, st) {
    const r = sb(st);
    head(c, 'SHEAR BUCKLING · cl. 509.4.2.2 (a)');
    const y = kv(c, W, [[!st.cd ? 'Kv, stiffeners at supports only' : st.cd < 1 ? 'Kv = 4.0 + 5.35 / (c/d)²' : 'Kv = 5.35 + 4.0 / (c/d)²', r.kv.toFixed(2)], ['τcr,e = Kv π² E / 12 (1 − μ²)(d/tw)²', `${r.tcr.toFixed(0)} MPa`], ['λw = √( fyw / √3 τcr,e )', r.lw.toFixed(2)],
      [r.lw <= .8 ? 'τb = fyw / √3' : r.lw < 1.2 ? 'τb = [1 − 0.8 (λw − 0.8)] fyw / √3' : 'τb = fyw / √3 λw²', `${r.tb.toFixed(0)} MPa`], ['Vcr = Av τb', kN(r.Vcr)], ['Vd = Vcr / γm0', kN(r.Vcr / GM0), OXIDE]], 58, 28);
    lines(c, `Buckling is verified when d/tw exceeds ${r.limit.toFixed(0)}; here d/tw = ${(DW / st.tw).toFixed(0)}.`, 18, y + 6, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, `Web ${DW} × ${st.tw} mm, ${st.cd ? 'c = ' + st.cd * DW + ' mm' : 'no intermediate stiffeners'} · Vp ${kN(r.Vp)}`);
  },
  steps: [
    { title: 'A web that buckles', text: 'A thin web wrinkles along its compression diagonal before it yields. Change the web thickness and see the buckling stress τb.',
      check: { q: 'In the simple post-critical method, Vn = Vcr = … (cl. 509.4.2.2 a)', options: ['Av τb', 'Av fyw', 'Av fu / √3'], answer: 0, why: 'Vcr = Av τb, where τb is the shear stress corresponding to web buckling, found from the web slenderness λw (cl. 509.4.2.2 a).' } },
    { title: 'Closer stiffeners', text: 'Drag the spacing of the transverse stiffeners. Smaller panels have a larger Kv, and the web buckles later.',
      check: { q: 'With transverse stiffeners only at the supports, Kv = …', options: ['5.35', '4.0', '9.35'], answer: 0, why: 'Kv = 5.35 when transverse stiffeners are provided only at supports; 4.0 + 5.35/(c/d)² for c/d < 1.0; 5.35 + 4.0/(c/d)² for c/d ≥ 1.0 (cl. 509.4.2.2 a).' } },
    { title: 'Three ranges', text: 'τb equals the shear yield stress up to λw = 0.8, falls in a straight line to 1.2, and beyond that falls with 1/λw².',
      check: { q: 'When λw is 0.8 or less, τb = …', options: ['fyw / √3', 'fyw / (√3 λw²)', '0.6 fyw'], answer: 0, why: 'λw ≤ 0.8: τb = fyw/√3. 0.8 < λw < 1.2: [1 − 0.8 (λw − 0.8)] fyw/√3. λw ≥ 1.2: fyw/(√3 λw²) (cl. 509.4.2.2 a).' } },
  ],
});

// ---------------------------------------------------------------- 3 · tension field method
const tfm = st => tensionField({ d: DW, tw: st.tw, fyw: st.fy, cd: st.cd, bf: BF, tf: TF, fyf: st.fy, nf: st.nf });
export const tension = spread({
  init: { tw: 10, fy: 250, cd: 1.5, nf: 0 },
  chips: [TWS, ['nf', [0, .5, .8], v => `Flange force ${v * 100} %`], GRADES],
  slider: { key: 'cd', name: 'c/d', label: 'spacing · drag', values: [1, 1.25, 1.5, 1.75, 2, 2.5, 3], at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stage(group), mat = paint(); loads(g); let gi = null, key = -1;
    const tag = holo.label('', TAG); tag.position.set(0, 10.6, -5); group.add(tag);
    return {
      place() {
        const r = tfm(st);
        if (key !== st.cd) { key = st.cd; if (gi) { g.remove(gi.g); dispose(gi.g); } const xs = stiffXs(st.cd); gi = girder(g, { xs, mat, seg: 90 }); gi.g.add(holo.segments(bands(xs), holo.AMBER, .95, { width: .14 })); }
        ripple(gi.web, Math.max(0, Math.min(.2, (r.lw - .8) * .22))); tag.userData.setText(`Vtf = ${kN(r.Vtf)} · buckling alone ${kN(r.Vcr)}`);
      },
      debug: () => { const r = tfm(st); return { fv: +r.fv.toFixed(1), s: +r.s.toFixed(0), wtf: +r.wtf.toFixed(0), Vcr: +r.Vcr.toFixed(0), Vtf: +r.Vtf.toFixed(0) }; },
    };
  },
  draw(c, W, H, st) {
    const r = tfm(st);
    head(c, 'TENSION FIELD METHOD · cl. 509.4.2.2 (b)');
    kv(c, W, [['Buckling stress τb', `${r.tb.toFixed(0)} MPa`], ['φ = tan⁻¹ (d / c)', `${(r.phi * 180 / Math.PI).toFixed(1)}°`], ['fv = [ fyw² − 3 τb² + ψ² ]^0.5 − ψ', `${r.fv.toFixed(0)} MPa`], ['Anchor lengths sc = st', `${r.s.toFixed(0)} mm`],
      ['wtf = d cos φ + (c − sc − st) sin φ', `${r.wtf.toFixed(0)} mm`], ['Vcr = Av τb', kN(r.Vcr)], ['Vtf = Av τb + 0.9 wtf tw fv sin φ', kN(r.Vtf) + (r.raw > r.Vp ? ' = Vp' : ''), OXIDE], ['Vd = Vtf / γm0', kN(r.Vtf / GM0), OXIDE]], 56, 26);
    foot(c, H, `Web ${DW} × ${st.tw}, c ${st.cd * DW} mm, flange ${BF} × ${TF} · Vtf ≤ Vp = ${kN(r.Vp)}`);
  },
  steps: [
    { title: 'After the web buckles', text: 'A buckled panel still carries shear: the web pulls along its tension diagonal, the amber lines, anchored by the flanges and stiffeners.',
      check: { q: 'The tension field method may be used when… (cl. 509.4.2.2 b)', options: ['there are intermediate stiffeners and c/d ≥ 1.0', 'the web has no stiffeners', 'c/d is below 0.5'], answer: 0, why: 'For webs with intermediate transverse stiffeners as well as stiffeners at supports, where the adjacent panels or end posts anchor the tension field, and c/d ≥ 1.0 (cl. 509.4.2.2 b).' } },
    { title: 'The width of the field', text: 'Drag the stiffener spacing. The inclination φ and the width wtf of the tension field change with it.',
      check: { q: 'The inclination of the tension field is φ = …', options: ['tan⁻¹ (d / c)', 'tan⁻¹ (c / d)', '45° always'], answer: 0, why: 'φ = tan⁻¹(d/c); wtf = d cos φ + (c − sc − st) sin φ, with sc and st the anchorage lengths along the compression and tension flanges (cl. 509.4.2.2 b).' } },
    { title: 'Flanges that are busy', text: 'Raise the axial force in the flanges. They have less left to anchor the field: Mfr falls, and with it the anchor length.',
      check: { q: 'Vtf may not exceed…', options: ['Vp, the plastic shear resistance', '2 Vp', 'Vcr'], answer: 0, why: 'Vn = Vtf = [Av τb + 0.9 wtf tw fv sin φ] ≤ Vp (cl. 509.4.2.2 b).' } },
  ],
});

// ---------------------------------------------------------------- 4 · end panels and anchor forces
const END = { f7: 'End panel without tension field', f8: 'Single stiffener end post', f9: 'Double stiffener end post' };
const WHAT = {
  f7: 'Fig. 7: end panel B is designed by the simple post-critical method only. With its stiffeners it spans between the flanges as a beam, for Rtf and Mtf. The end stiffener takes the reaction plus the compressive force from Mtf.',
  f8: 'Fig. 8: panel B also uses tension field action. A single stiffener end post, rigidly welded to the flange, takes the reaction plus a moment of 2/3 Mtf. It is no wider or thicker than the flange.',
  f9: 'Fig. 9: panel B also uses tension field action. A double stiffener end post is checked as a beam spanning between the flanges, for the shear Rtf and the moment Mtf.',
};
const ep = st => { const r = tensionField({ d: DW, tw: st.tw, fyw: 250, cd: 1.5, bf: BF, tf: TF, fyf: 250 }); return { ...r, V: r.Vcr + st.ratio * (r.Vtf - r.Vcr), ...anchorForces(r.Vp, r.Vcr, DW, st.ratio) }; };
export const endpanel = spread({
  init: { type: 'f7', tw: 10, ratio: 1 },
  chips: [['type', ['f7', 'f8', 'f9'], v => END[v]], TWS],
  slider: { key: 'ratio', name: 'V', label: 'shear · drag', values: [0, .25, .5, .75, 1], at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stage(group), mat = paint(); let gi = null, key = '';
    const tag = holo.label('', TAG), la = holo.label('A', { h: 1, color: INK, weight: 700 }), lb = holo.label('B', { h: 1, color: INK, weight: 700 }), a = arrow(0xc23b2f, .1);
    tag.position.set(0, 10.6, -5); group.add(tag); g.add(la, lb, a);
    return {
      place() {
        const r = ep(st);
        if (key !== st.type) {
          key = st.type; if (gi) { g.remove(gi.g); dispose(gi.g); }
          const xs = stiffXs(1.5); gi = girder(g, { xs: st.type === 'f9' ? [...xs, -LG / 2 + 1.4, LG / 2 - 1.4] : xs, mat, seg: 90 });
          gi.g.add(holo.segments(bands(xs, st.type === 'f7' ? 1 : 0), holo.AMBER, .95, { width: .14 }));
        }
        lb.position.set(-LG / 2 + .5 + 3, YM, .9); la.position.set(-LG / 2 + .5 + 9, YM, .9);
        a.position.set(-LG / 2 + .2, Y0 + .3 + DG, 0); a.userData.len(.3 + 2.2 * st.ratio);
        tag.userData.setText(`Rtf = ${kN(r.Rtf)} · Mtf = ${r.Mtf.toFixed(0)} kNm`);
      },
      debug: () => { const r = ep(st); return { Hq: +r.Hq.toFixed(0), Rtf: +r.Rtf.toFixed(0), Mtf: +r.Mtf.toFixed(0) }; },
    };
  },
  draw(c, W, H, st) {
    const r = ep(st);
    head(c, 'END PANELS · cl. 509.5');
    const y = lines(c, WHAT[st.type], 18, 52, W - 36, 18, INK, `500 13.5px ${F}`);
    kv(c, W, [['Shear V in panel A, from Vcr to Vtf', kN(r.V)], ['Hq = 1.25 Vp (1 − Vcr/Vp)^½, reduced', kN(r.Hq)], ['Rtf = Hq / 2', kN(r.Rtf), OXIDE], [st.type === 'f8' ? '2/3 of Mtf = Hq d / 10' : 'Mtf = Hq d / 10', `${((st.type === 'f8' ? 2 / 3 : 1) * r.Mtf).toFixed(0)} kNm`, OXIDE]], y + 14, 26);
    foot(c, H, 'Hq is reduced by (V − Vcr) / (Vtf − Vcr) when V is less than Vtf');
  },
  steps: [
    { title: 'Something to pull against', text: 'A tension field must be anchored. Inside the span the next panel does it; at the end of the girder nothing does, unless it is designed for.',
      check: { q: 'If panel A uses tension field action and the end panel does not, the end panel is designed by… (cl. 509.5.1)', options: ['the simple post-critical method only', 'the tension field method', 'plastic shear resistance alone'], answer: 0, why: 'The end panel should be designed using only the simple post-critical method, and checked with its stiffeners as a beam spanning between the flanges for Rtf and Mtf (cl. 509.5.1, Fig. 7).' } },
    { title: 'End posts', text: 'Pick the single and the double stiffener end post. They let the end panel use its tension field too.',
      check: { q: 'A single stiffener end post resists the reaction plus a moment of… (cl. 509.5.2 a)', options: ['2/3 Mtf', 'Mtf', '1/10 Mtf'], answer: 0, why: 'The end post should resist the reaction plus a moment from the anchor forces equal to 2/3 Mtf; a double stiffener end post is checked for Rtf and Mtf (cl. 509.5.2).' } },
    { title: 'Anchor forces', text: 'Drag the shear down from Vtf towards Vcr. The anchor forces fall in proportion.',
      check: { q: 'The anchor forces are Rtf = Hq / 2 and Mtf = … (cl. 509.5.3)', options: ['Hq d / 10', 'Hq d / 2', 'Hq / 10'], answer: 0, why: 'Rtf = Hq/2 and Mtf = Hq d/10, with Hq = 1.25 Vp (1 − Vcr/Vp)^½ and d the web depth (cl. 509.5.3).' } },
  ],
});
