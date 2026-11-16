// Chapter 6, spreads 5–8 · proportioning the web, its stiffeners, and combined forces.
//   webthick  (cl. 509.6.1)            minimum web thickness for each arrangement of stiffeners
//   stiff     (cl. 509.7.1.2, 509.7.2) outstand and stiffness of an intermediate transverse stiffener
//   bearing   (cl. 509.7.3–509.7.5)    a reaction on the web: bearing, buckling and the stiffeners it needs
//   combined  (cl. 510.2, 510.3)       bending strength under high shear and with axial force
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, sit, girderBridge, truck, arrow, box, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, TAG } from '../../_irc24/kit.js';
import { GM0, eps, webLimit, flangeLimit, stiffenerI, webBearing, stiffenerBearing, buckling, classify, CLASS, bendingStrength, highShear } from '../../_irc24/steel.js';
import { DW, TF, LG, DG, Y0, YM, GREEN, GRADES, TWS, range, kN, stage, girder, stiffXs } from './shear.js';

// ---------------------------------------------------------------- 5 · minimum web thickness
const ARR = { none: 'No stiffeners', trans: 'Transverse only', long1: '+ 1 longitudinal', long2: '+ 2 longitudinal' };
const wt = st => {
  const none = st.arr === 'none', unst = st.arr === 'trans' && st.cd > 3, [k, on] = webLimit(st.arr, st.cd), e = eps(st.fy), t1 = (on === 'c' ? st.cd * st.d : st.d) / (k * e);
  const sq = none || unst || st.cd >= 1.5, t2 = st.d / flangeLimit(!none && !unst, st.cd, st.fy);
  return { k, on, e, t1, t2, sq, t: Math.max(t1, t2), unst, okh: none || (st.cd >= .33 && st.cd <= 1.5), off: st.arr === 'long1' && st.cd > 2.4 };
};
export const webthick = spread({
  init: { arr: 'trans', cd: 1.5, d: 1600, fy: 250 },
  chips: [['arr', ['none', 'trans', 'long1', 'long2'], v => ARR[v]], ['d', [1200, 1600, 2400], v => `d ${v}`], GRADES],
  slider: { key: 'cd', name: 'c/d', label: 'spacing · drag', values: [.5, .6, .74, .9, 1, 1.25, 1.5, 2, 2.4, 3, 3.5], at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stage(group), mat = paint(); let gi = null, key = '';
    const sec = new THREE.Group(), ls = holo.label('', TAG); sec.position.set(-4, 0, 6); sec.scale.setScalar(1.5); ls.position.set(1.4, 2.4, 6); g.add(sec, ls);   // an end section of the girder, so the web thickness can be seen
    const tag = holo.label('', TAG); tag.position.set(0, 10.6, -5); group.add(tag);
    return {
      place() {
        const k = st.arr + st.cd;
        if (k !== key) { key = k; if (gi) { g.remove(gi.g); dispose(gi.g); } gi = girder(g, { xs: stiffXs(st.arr === 'none' ? 0 : st.cd), longs: st.arr === 'long1' ? [.2] : st.arr === 'long2' ? [.2, .5] : [], mat }); }
        gi.web.scale.z = Math.max(1, wt(st).t / 4);   // the web drawn as thick as it must be, 2.5 times larger
        dispose(sec); sec.clear(); const tw = wt(st).t, w = Math.max(.1, tw * .06); sec.add(box(1.8, .25, .5, mat, 0, .125, 0), box(w, 2.6, .5, GREEN, 0, .25 + 1.3, 0), box(1.8, .25, .5, mat, 0, 2.85 + .125, 0));   // web width 15 times the flange scale
        ls.userData.setText(`end section · web ×15 · tw ≥ ${tw.toFixed(1)} mm`);
        tag.userData.setText(`web at least ${wt(st).t.toFixed(1)} mm thick`);
      },
      debug: () => { const r = wt(st); return { k: r.k, on: r.on, t1: +r.t1.toFixed(2), t2: +r.t2.toFixed(2) }; },
    };
  },
  draw(c, W, H, st) {
    const r = wt(st), T = Math.ceil(r.t);
    head(c, 'MINIMUM WEB THICKNESS · cl. 509.6.1');
    const y0 = lines(c, st.arr === 'none' ? 'No transverse stiffeners, web connected to the flanges along both edges.' : r.unst ? 'c is more than 3 d: the web is considered as unstiffened.' : `${ARR[st.arr].replace('+ ', 'Transverse and ')} stiffener${st.arr === 'long2' ? 's' : st.arr === 'trans' ? 's' : ''}, c = ${st.cd} d.` + (r.off ? ' Beyond 2.4 d the Code gives no value for this case.' : ''), 18, 54, W - 36, 18, DIMC, `500 13.5px ${F}`);
    kv(c, W, [[`Serviceability: ${r.on} / tw ≤ ${r.k} εw`, `tw ≥ ${r.t1.toFixed(1)} mm`, r.t1 >= r.t2 ? OXIDE : INK], [`Flange buckling: d / tw ≤ 345 εf${r.sq ? '²' : ''}`, `tw ≥ ${r.t2.toFixed(1)} mm`, r.t2 > r.t1 ? OXIDE : INK], ['Web thickness, at least', `${r.t.toFixed(1)} mm`, OXIDE],
      [`Clear panel sides with t = ${T} mm`, `≤ ${270 * T} and ≤ ${180 * T} mm`], ['Stiffener spacing 0.33 d1 to 1.5 d1', st.arr === 'none' ? 'no stiffeners' : r.okh ? `${st.cd} d ✓` : `${st.cd} d ✗`, r.okh ? INK : BAD]], y0 + 14, 27);
    foot(c, H, `Web depth ${st.d} mm · εw = εf = ${r.e.toFixed(3)} · detailing: cl. 509.7.14 (g), (h)`);
  },
  steps: [
    { title: 'How thin may a web be', text: 'A web must not flap in service, and must hold the compression flange up. Drag the stiffener spacing and read the least thickness.',
      check: { q: 'With no transverse stiffeners and both edges connected, d/tw is not more than… (cl. 509.6.1.1 a)', options: ['200 ε', '90 ε', '400 ε'], answer: 0, why: 'd/tw ≤ 200ε for a web connected to flanges along both longitudinal edges, and ≤ 90ε when connected along one edge only (cl. 509.6.1.1 a).' } },
    { title: 'Longitudinal stiffeners', text: 'Add one longitudinal stiffener, then a second at the neutral axis. Each lets the web be thinner.',
      check: { q: 'With a second longitudinal stiffener at the neutral axis, d/tw ≤ … (cl. 509.6.1.1 d)', options: ['400 εw', '250 εw', '200 εw'], answer: 0, why: 'd/tw ≤ 400 εw when a second longitudinal stiffener, located at the neutral axis, is provided (cl. 509.6.1.1 d).' } },
    { title: 'The flange into the web', text: 'A thin web lets the compression flange buckle into it. This second limit often governs for deep webs.',
      check: { q: 'To stop the compression flange buckling into an unstiffened web, d/tw ≤ … (cl. 509.6.1.2)', options: ['345 εf²', '67 εf', '126 εf'], answer: 0, why: 'd/tw ≤ 345 εf² when transverse stiffeners are not provided or c ≥ 1.5 d, and ≤ 345 εf when c < 1.5 d (cl. 509.6.1.2).' } },
  ],
});

// ---------------------------------------------------------------- 6 · intermediate transverse stiffeners
const sf = st => {
  const e = eps(st.fy), max = 20 * st.tq * e, core = 14 * st.tq * e, be = Math.min(st.bs, core), Is = st.tq * (2 * be + st.tw) ** 3 / 12, req = stiffenerI(DW, st.tw, st.cd * DW);
  return { e, max, core, be, ok: st.bs <= max + 1e-9, Is, req, okI: Is >= req, q: st.tw ** 2 / (5 * st.bs) };
};
export const stiff = spread({
  init: { bs: 120, tq: 12, cd: 1.5, tw: 10, fy: 250 },
  chips: [['tq', [8, 12, 16], v => `tq ${v}`], ['cd', [1, 1.2, 1.5, 2], v => `c/d ${v}`], TWS, GRADES],
  slider: { key: 'bs', name: 'bs', label: 'outstand · drag', values: range(60, 300, 20), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.rotation.y = -.75; g.scale.setScalar(1.15); group.add(g);
    const m = paint(), mA = paint(0xd08a2e, .5, .2), mR = paint(0xc23b2f, .5, .2), parts = new THREE.Group(), K = .014; g.add(parts, box(9, .5, 6, SM.concrete, 0, .25, 0), box(9, 6, .16, m, 0, 3.5, 0));
    const tag = holo.label('', TAG); tag.position.set(0, 10, -5); group.add(tag);
    return {
      place() {
        dispose(parts); parts.clear(); const r = sf(st), t = Math.max(.14, st.tq * K), b1 = r.be * K, b2 = st.bs * K;
        for (const s of [-1, 1]) { parts.add(box(t, 6, b1, GREEN, 0, 3.5, s * (.08 + b1 / 2))); if (b2 > b1 + 1e-6) parts.add(box(t, 6, b2 - b1, r.ok ? mA : mR, 0, 3.5, s * (.08 + b1 + (b2 - b1) / 2))); }
        tag.userData.setText(r.ok ? (st.bs > r.core ? `only ${r.core.toFixed(0)} mm of the outstand counts` : 'outstand within 14 tq ε') : 'outstand over 20 tq ε');
      },
      debug: () => { const r = sf(st); return { max: +r.max.toFixed(0), core: +r.core.toFixed(0), Is: +r.Is.toFixed(0), req: +r.req.toFixed(0) }; },
    };
  },
  draw(c, W, H, st) {
    const r = sf(st), e4 = v => `${(v / 1e4).toFixed(0)} × 10⁴ mm⁴`;
    head(c, 'INTERMEDIATE STIFFENERS · cl. 509.7.1.2, 509.7.2');
    const y = kv(c, W, [['Outstand, limit 20 tq ε', `${st.bs} mm ${r.ok ? '✓' : '✗'} ${r.max.toFixed(0)} mm`, r.ok ? OK : BAD], ['Core section: outstand 14 tq ε', `${r.core.toFixed(0)} mm`], [`Is needed, c/d ${st.cd >= Math.SQRT2 ? '≥' : '<'} √2`, e4(r.req)],
      ['Is of the pair, about the web centre line', `${e4(r.Is)} ${r.okI ? '✓' : '✗'}`, r.okI ? OK : BAD], ['Shear between stiffener and web, tw² / 5 bs', `${r.q.toFixed(2)} kN/mm`], ['Stiffener force Fq = (V − Vcr) / γm0', '≤ Fqd']], 58, 27);
    lines(c, 'Fqd: a strut on curve c, effective length 0.7 L, of the stiffener with 20 tw of web on each side (509.7.1.5).', 18, y + 4, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, 'Is ≥ 0.75 d tw³ (c/d ≥ √2) · 1.5 d³ tw³ / c² (c/d < √2)');
  },
  steps: [
    { title: 'A stiffener must not buckle itself', text: 'The outstand of a stiffener is limited by its own thickness. Drag the outstand: beyond 14 tq ε only a core counts, beyond 20 tq ε it is not allowed.',
      check: { q: 'Unless its edge is stiffened, the outstand of a web stiffener is not more than… (cl. 509.7.1.2)', options: ['20 tq ε', '50 tq ε', '8 tq ε'], answer: 0, why: 'The outstand from the face of the web should not exceed 20 tq ε; between 14 tq ε and 20 tq ε the design is based on a core section with an outstand of 14 tq ε (cl. 509.7.1.2).' } },
    { title: 'Stiff enough', text: 'Change the stiffener spacing and the web thickness. Closer stiffeners must each be stiffer.',
      check: { q: 'For c/d ≥ √2, an intermediate stiffener needs Is ≥ … (cl. 509.7.2.4)', options: ['0.75 d tw³', '1.5 d³ tw³ / c²', '4 c tw³'], answer: 0, why: 'Is ≥ 0.75 d tw³ if c/d ≥ √2, and Is ≥ 1.5 d³ tw³/c² if c/d < √2, about the centre line of the web for stiffeners on both sides (cl. 509.7.2.4).' } },
    { title: 'Its force and its weld', text: 'The stiffener carries what the buckled web cannot, and its weld to the web a small shear flow.',
      check: { q: 'An intermediate stiffener with no external load is checked for a force Fq = … (cl. 509.7.2.5)', options: ['(V − Vcr) / γm0', 'V', '2.5 % of V'], answer: 0, why: 'Fq = (V − Vcr)/γm0 ≤ Fqd, where Vcr is the shear buckling resistance of the web panel without tension field action (cl. 509.7.2.5).' } },
  ],
});

// ---------------------------------------------------------------- 7 · bearing and load carrying stiffeners
const SQ = 2 * (150 - 15) * 16;   // contact area of a pair of 150 × 16 stiffeners coped 15 mm, mm²
const br = st => {
  const n2 = 2.5 * TF, Fw = webBearing(st.b1, n2, st.tw, st.fy), n1 = (DW + 2 * TF) / 2, klr = .7 * DW * Math.sqrt(12) / st.tw, Fcdw = (st.b1 + n1) * st.tw * buckling(klr, st.fy, 'c').fcd / 1000;
  return { n2, n1, Fw, Fcdw, Fpsd: stiffenerBearing(SQ, st.fy), needB: st.Fx > Fw, needL: st.Fx > Fcdw };
};
export const bearing = spread({
  init: { Fx: 800, b1: 200, tw: 12, fy: 250 },
  chips: [['b1', [100, 200, 300], v => `Bearing ${v}`], TWS, GRADES],
  slider: { key: 'Fx', name: 'F', label: 'reaction · drag', values: range(200, 3000, 200), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stage(group), mat = paint(), gi = girder(g, { mat }), st2 = [], pl = [], ar = [];
    for (const s of [-1, 1]) {
      const x = s * (LG / 2 - .5), q = box(.14, DG, 1.1, GREEN, x, YM, 0), p = box(1, .16, 1.6, SM.steel, x, Y0 - .02, 0), a = arrow(0xc23b2f, .1); a.rotation.z = Math.PI / 2; g.add(q, p, a); st2.push(q); pl.push(p); ar.push(a);
      g.add(holo.segments([[x, Y0 + .2, .1], [x - s * DG / 2, YM, .1]], holo.AMBER, .9, { width: .09 }));
    }
    const tag = holo.label('', TAG); tag.position.set(0, 10.6, -5); group.add(tag);
    return {
      place() {
        const r = br(st), need = r.needB || r.needL;
        st2.forEach(q => { q.visible = need; }); pl.forEach(p => { p.scale.x = st.b1 / 200; }); ar.forEach((a, i) => { a.position.set((i ? 1 : -1) * (LG / 2 + .7), .4, 0); a.userData.len(.6 + st.Fx / 1500); });
        tag.userData.setText(need ? 'stiffeners needed at the supports' : 'the web alone carries the reaction');
      },
      debug: () => { const r = br(st); return { Fw: +r.Fw.toFixed(0), Fcdw: +r.Fcdw.toFixed(0), Fpsd: +r.Fpsd.toFixed(0) }; },
    };
  },
  draw(c, W, H, st) {
    const r = br(st), okP = r.Fpsd >= st.Fx;
    head(c, 'STIFFENERS AT SUPPORTS · cl. 509.7.3 to 509.7.5');
    const y = kv(c, W, [['Web bearing Fw = (b1 + n2) tw fyw / γm0', kN(r.Fw), r.needB ? BAD : OK], ['Web buckling (b1 + n1) tw fcd, curve c', kN(r.Fcdw), r.needL ? BAD : OK], [`Reaction Fx = ${st.Fx} kN`, r.needB || r.needL ? 'stiffeners needed' : 'web is enough', r.needB || r.needL ? OXIDE : OK],
      ['Bearing stiffener carries Fx − Fw', r.needB ? kN(st.Fx - r.Fw) : 'none'], ['Its bearing Fpsd = Aq fyq / 0.8 γm0', `${kN(r.Fpsd)} ${okP ? '✓' : '✗'}`, okP ? INK : BAD], ['Torsional stiffener (509.7.9)', 'Is ≥ 0.34 αs D³ Tcf']], 58, 27);
    lines(c, `n2 = 2.5 tf = ${r.n2} mm, spread through the flange at 1 : 2.5. n1 = ${r.n1} mm, at 45° to mid-depth. Pair of 150 × 16 stiffeners.`, 18, y + 4, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, 'Load bearing stiffeners: in pairs, fitted to both flanges (509.7.14)');
  },
  steps: [
    { title: 'A reaction on a thin web', text: 'At a support the whole reaction enters the web over a short length. Drag the reaction and watch the two capacities of the web.',
      check: { q: 'The local capacity of the web is Fw = (b1 + n2) tw fyw / γm0, where n2 comes from dispersion through the flange at… (cl. 509.7.4)', options: ['a slope of 1 : 2.5', '45°', 'a slope of 1 : 1'], answer: 0, why: 'n2 is the length obtained by dispersion through the flange to the web junction at a slope of 1 : 2.5 to the plane of the flange; b1 is the stiff bearing length (cl. 509.7.4).' } },
    { title: 'Buckling of the web', text: 'The web can also buckle as a strut under the load. A longer stiff bearing helps a little; a thicker web helps a lot.',
      check: { q: 'The buckling strength of the unstiffened web under a load is found using… (cl. 509.7.3.1)', options: ['strut curve c', 'strut curve a', 'the tension field method'], answer: 0, why: 'The area (b1 + n1) tw, with n1 the dispersion at 45° to half the depth, is treated as a strut and its strength found from cl. 507.1.2.1 using curve c (cl. 509.7.3.1).' } },
    { title: 'The stiffener in bearing', text: 'A load carrying stiffener must also bear on the flange without crushing.',
      check: { q: 'The bearing strength of a load carrying stiffener is Fpsd = … (cl. 509.7.5.2)', options: ['Aq fyq / (0.8 γm0)', 'Aq fu / γm1', '0.6 Aq fyq'], answer: 0, why: 'Fpsd = Aq fyq/(0.8 γm0) ≥ Fx, with Aq the area of the stiffener in contact with the flange (cl. 509.7.5.2).' } },
  ],
});

// ---------------------------------------------------------------- 8 · combined forces
const SEC = { A: { bf: 300, tf: 20, d: 800, tw: 10 }, B: { bf: 400, tf: 25, d: 1200, tw: 12 }, C: { bf: 500, tf: 32, d: 1600, tw: 14 } };
const cb = (st, v = st.v) => {
  const sec = SEC[st.sec], c = classify({ ...sec, fy: st.fy, welded: true }), m = bendingStrength(sec, c.cls, st.fy), ZeFy = m.Ze * st.fy / GM0 / 1e6, Mfd = sec.bf * sec.tf * (sec.d + sec.tf) * st.fy / GM0 / 1e6;
  const hs = highShear({ Md: m.Md, Mfd, ZeFy, v, compact: c.cls <= 2 }), a = Math.min(.5, (m.A - 2 * sec.bf * sec.tf) / m.A);
  return { cls: c.cls, Md: m.Md, Mfd, ...hs, a, Mn: Math.min(m.Md, m.Md * (1 - st.n) / (1 - .5 * a)), lin: m.Md * (1 - st.n) };
};
export const combined = spread({
  init: { sec: 'B', v: .5, n: .2, fy: 250 },
  chips: [['sec', ['A', 'B', 'C'], v => `Web ${SEC[v].d} × ${SEC[v].tw}`], ['n', [0, .2, .4], v => `N/Nd ${v}`], GRADES],
  slider: { key: 'v', name: 'V/Vd', label: 'shear · drag', values: range(0, 1, .1) },
  model({ holo, group, st }) {
    // the girder of these pages: its web coloured by how hard it works in shear, a bar above for the moment it can still carry
    const g = stage(group), gi = girder(g, { xs: stiffXs(0), mat: paint() }), wm = new THREE.MeshStandardMaterial({ roughness: .5, metalness: .3 }); gi.web.material = wm;
    const yb = Y0 + .6 + DG, bar = box(LG - 3, 1, .5, paint(0x1d5f87, .5, .2)), frame = holo.wireBox(LG - 3, 1.6, .55, holo.DIM), lm = holo.label('moment capacity', { h: .6, color: INK }), lv = holo.label('web in shear', { h: .6, color: INK });
    bar.geometry.translate(0, .5, 0); bar.position.set(0, yb, 0); frame.position.set(0, yb + .8, 0); lm.position.set(0, yb + 2.2, 0); lv.position.set(-4, YM, .6); g.add(bar, frame, lm, lv);
    const tag = holo.label('', TAG); tag.position.set(0, 12.6, -5); group.add(tag);
    const G = new THREE.Color(0x2f8f55), R = new THREE.Color(0xc23b2f);
    return {
      place() { const r = cb(st); wm.color.copy(G).lerp(R, st.v); bar.scale.y = Math.max(.02, 1.6 * Math.min(r.Mdv, r.Mn) / r.Md); tag.userData.setText(st.v > .6 ? `high shear: Mdv = ${r.Mdv.toFixed(0)} kNm` : 'shear up to 0.6 Vd: full Md'); },
      debug: () => { const r = cb(st); return { beta: +r.beta.toFixed(3), Mdv: +r.Mdv.toFixed(0), Mn: +r.Mn.toFixed(0) }; },
    };
  },
  draw(c, W, H, st) {
    const r = cb(st), x0 = 34, w = W - 70, y0 = 126, h = 74, X = v => x0 + v * w, Y = v => y0 - v * h;
    head(c, 'COMBINED FORCES · cl. 510.2, 510.3');
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, Y(1.05)); c.lineTo(x0, y0); c.lineTo(X(1), y0); c.stroke();
    c.strokeStyle = OXIDE; c.lineWidth = 2.4; c.beginPath(); for (let v = 0; v <= 1.0001; v += .02) { const q = cb(st, v).Mdv / r.Md; if (v) c.lineTo(X(v), Y(q)); else c.moveTo(X(v), Y(q)); } c.stroke();
    c.fillStyle = DIMC; c.font = `500 11px ${F}`; c.fillText('Mdv / Md', x0 + 6, Y(1.05) + 8); c.fillText('V / Vd', X(1) - 34, y0 + 14); c.fillText('0.6', X(.6) - 8, y0 + 14); c.fillRect(X(.6), y0 - 3, 1, 6);
    c.fillStyle = INK; c.beginPath(); c.arc(X(st.v), Y(r.Mdv / r.Md), 4.5, 0, 7); c.fill();
    kv(c, W, [[`Md at low shear · class ${r.cls}, ${CLASS[r.cls]}`, `${r.Md.toFixed(0)} kNm`], ['Mfd, the section without its shear area', `${r.Mfd.toFixed(0)} kNm`], ['β = (2 V/Vd − 1)²', st.v > .6 && r.cls <= 2 ? r.beta.toFixed(2) : '—'],
      [r.cls <= 2 ? 'Mdv = Md − β (Md − Mfd)' : 'Mdv = Ze fy / γm0 (semi-compact)', `${r.Mdv.toFixed(0)} kNm`, OXIDE], [`Axial N/Nd = ${st.n}: Mndz = Mdz (1 − n)/(1 − 0.5a)`, `${r.Mn.toFixed(0)} kNm`], ['Or simply N/Nd + M/Md ≤ 1: M up to', `${r.lin.toFixed(0)} kNm`]], 156, 24);
    foot(c, H, `a = (A − 2 b tf)/A = ${r.a.toFixed(2)} · Mdv ≤ 1.2 Ze fy/γm0`);
  },
  steps: [
    { title: 'Shear takes from bending', text: 'A web working hard in shear has less to give in bending. Drag the shear past 0.6 Vd and watch the moment capacity fall.',
      check: { q: 'No reduction in moment capacity is needed while the shear is not more than… (cl. 510.2.1)', options: ['60 % of the shear strength', '100 % of it', '25 % of it'], answer: 0, why: 'The moment capacity may be taken as Md without reduction while the factored shear is less than or equal to 60 per cent of the shear strength of the section (cl. 510.2.1).' } },
    { title: 'Down to the flanges', text: 'At full shear the web gives nothing to bending: only Mfd, the strength of the section without its shear area, is left.',
      check: { q: 'For a plastic or compact section under high shear, Mdv = Md − β (Md − Mfd), with β = … (cl. 510.2.2)', options: ['(2 V/Vd − 1)²', 'V / Vd', '1 − V/Vd'], answer: 0, why: 'β = (2V/Vd − 1)²; Mdv is also kept below 1.2 Ze fy/γm0. For a semi-compact section Mdv = Ze fy/γm0 (cl. 510.2.2).' } },
    { title: 'Axial force as well', text: 'Add an axial force. The simple, conservative check adds the three ratios.',
      check: { q: 'Conservatively, under axial force and bending… (cl. 510.3.1.1)', options: ['N/Nd + My/Mdy + Mz/Mdz ≤ 1.0', 'N/Nd × M/Md ≤ 1.0', 'N + M ≤ fy'], answer: 0, why: 'N/Nd + My/Mdy + Mz/Mdz ≤ 1.0, where Nd is the design strength in tension, or in compression due to yielding Ag fy/γm0 (cl. 510.3.1.1). Overall member buckling is checked as well (cl. 510.3.2).' } },
  ],
});
