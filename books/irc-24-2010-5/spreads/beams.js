// Chapter 5 · beams in bending (cl. 509.1–509.3).
//   supported   (cl. 509.2.1)            a laterally supported girder: Md = βb Zp fy / γm0
//   restraint   (cl. 509.2.1, 509.3.4)   the forces lateral restraints are designed for
//   ltbSpread   (cl. 509.2.2, Table 11)  a bare beam twisting sideways: χLT and fbd
//   efflen      (cl. 509.3.1, Table 12)  effective length LLT of a simply supported beam
//   cantilever  (cl. 509.3.3, Table 13)  effective length LLT of a cantilever
//   openings    (cl. 509.1.4, 509.2.1.4) openings in webs, holes in the tension flange, shear lag
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, sit, girderBridge, truck, arrow, box, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, OXIDE_HEX, TAG } from '../../_irc24/kit.js';
import { classify, CLASS, bendingStrength, iSection, fcrb, ltb, TABLE12, TABLE13, holeLimit, GM0 } from '../../_irc24/steel.js';

const GRADES = ['fy', [250, 300], v => `E ${v}`];
const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
const SEC = { A: { bf: 300, tf: 20, d: 800, tw: 10 }, B: { bf: 400, tf: 25, d: 1200, tw: 12 }, C: { bf: 500, tf: 32, d: 1600, tw: 14 } };   // welded I-girders, mm
const SECCHIP = ['sec', ['A', 'B', 'C'], v => `Web ${SEC[v].d} × ${SEC[v].tw}`];
const GREEN = paint(0x2f8f55, .5, .2);
/** An I-beam along x, centred on its mid-depth. seg > 1 lets warp() bend and twist it. */
function ibeam(L, bf, tf, d, tw, mat, seg = 1) {
  const g = new THREE.Group(); g.add(box(L, tf, bf, mat, 0, d / 2 + tf / 2, 0, seg), box(L, d, tw, mat, 0, 0, 0, seg), box(L, tf, bf, mat, 0, -d / 2 - tf / 2, 0, seg)); return g;
}
/** Move every vertex of the segmented boxes under root to fn(x, y, z), in root's own frame. */
function warp(root, fn) {
  root.traverse(o => {
    const b = o.userData.base; if (!b) return;
    const p = o.geometry.attributes.position, q = o.position;
    for (let i = 0; i < p.count; i++) { const [x, y, z] = fn(b[i * 3] + q.x, b[i * 3 + 1] + q.y, b[i * 3 + 2] + q.z); p.setXYZ(i, x - q.x, y - q.y, z - q.z); }
    p.needsUpdate = true; o.geometry.computeVertexNormals();
  });
}
const posts = (g, half, top, w = 2.4) => { for (const s of [-1, 1]) g.add(box(1, top, w, SM.concrete, s * (half - .5), top / 2, 0)); };
const down = (g, x, y, len = 1.6) => { const a = arrow(0xc23b2f, .1); a.rotation.z = -Math.PI / 2; a.position.set(x, y + len + .3, 0); a.userData.len(len); g.add(a); return a; };

// ---------------------------------------------------------------- 1 · laterally supported beam
const sup = st => { const c = classify({ ...SEC[st.sec], fy: st.fy, welded: true }); return { c, ...bendingStrength(SEC[st.sec], c.cls, st.fy, st.sup === 'cant') }; };
export const supported = spread({
  river: true, init: { sec: 'B', fy: 250, sup: 'ss', M: 2000 },
  chips: [SECCHIP, GRADES, ['sup', ['ss', 'cant'], v => v === 'ss' ? 'Simply supported' : 'Cantilever limit']],
  slider: { key: 'M', name: 'M', label: 'moment · drag', values: range(500, 9000, 500) },
  model({ holo, group, st }) {
    const b = girderBridge({ L: 17, d: 1.1, H: 2.6 }); group.add(sit(b.g));
    const tk = truck(.32); b.g.add(tk); const tag = holo.label('', TAG); tag.position.set(0, 8.4, -5); group.add(tag);
    let k = 0, r = sup(st);
    return {
      place() { r = sup(st); const over = st.M > r.Md + 1e-6; b.mat.color.setHex(over ? 0xc23b2f : OXIDE_HEX); tag.userData.setText(over ? 'M > Md: a plastic hinge forms' : 'M ≤ Md'); },
      update(dt) {
        const over = st.M > r.Md + 1e-6, to = Math.min(1.6, st.M / r.Md) * (over ? 1 : .22); k += (to - k) * Math.min(1, dt * 4);
        const f = over ? x => -k * (1 - Math.abs(2 * x / 17)) : x => -k * (1 - (2 * x / 17) ** 2); b.bend(f); tk.position.set(0, b.top + f(0), 0);
      },
      debug: () => ({ cls: r.c.cls, bb: +r.bb.toFixed(3), Md: +r.Md.toFixed(0) }),
    };
  },
  draw(c, W, H, st) {
    const r = sup(st), ok = st.M <= r.Md + 1e-6, s = SEC[st.sec], lim = st.sup === 'cant' ? 1.5 : 1.2;
    head(c, 'LATERALLY SUPPORTED BEAM · cl. 509.2.1.2');
    c.fillStyle = INK; c.font = `700 15px ${F}`; c.fillText('Md = βb Zp fy / γm0', 18, 54);
    const y = kv(c, W, [['Class of section (Table 2)', `${r.c.cls} · ${CLASS[r.c.cls]}`], ['βb', r.bb === 1 ? '1.0' : `Ze / Zp = ${r.bb.toFixed(3)}`], ['Zp and Ze, × 10⁶ mm³', `${(r.Zp / 1e6).toFixed(2)} and ${(r.Ze / 1e6).toFixed(2)}`],
      ['βb Zp fy / γm0', `${r.raw.toFixed(0)} kNm`], [`Kept below ${lim} Ze fy / γm0`, `${r.cap.toFixed(0)} kNm`], ['Design bending strength Md', `${r.Md.toFixed(0)} kNm`, OXIDE]], 80, 26);
    c.fillStyle = ok ? OK : BAD; c.font = `700 16px ${F}`; c.fillText(ok ? `✓ M = ${st.M} kNm ≤ Md` : `✗ M = ${st.M} kNm > Md`, 18, y + 12);
    foot(c, H, `Flanges ${s.bf} × ${s.tf}, web ${s.d} × ${s.tw} mm · shear not over 0.6 Vd`);
  },
  steps: [
    { title: 'Held by the deck', text: 'The deck holds the compression flange sideways, so the girder can reach its full bending strength. Drag the moment past Md.',
      check: { q: 'For a laterally supported beam with low shear, Md = … (cl. 509.2.1.2)', options: ['βb Zp fy / γm0', 'Ze fu / γm1', 'χLT Zp fy'], answer: 0, why: 'When the factored shear does not exceed 0.6 Vd, Md = βb Zp fy / γm0, with βb = 1.0 for plastic and compact sections and Ze/Zp for semi-compact sections (cl. 509.2.1.2).' } },
    { title: 'Class matters', text: 'Pick the deepest girder. Its web is semi-compact, so only the elastic modulus counts: βb = Ze / Zp.',
      check: { q: 'For a semi-compact section, βb is…', options: ['Ze / Zp', '1.0', '1.2'], answer: 0, why: 'βb = 1.0 for plastic and compact sections, and Ze/Zp for semi-compact sections, where Zp and Ze are the plastic and elastic section moduli (cl. 509.2.1.2).' } },
    { title: 'A limit for service', text: 'To avoid permanent deformation under working loads, Md is also kept below a multiple of the elastic strength.',
      check: { q: 'For a simply supported beam, Md shall be less than…', options: ['1.2 Ze fy / γm0', '1.5 Ze fy / γm0', '2.0 Ze fy / γm0'], answer: 0, why: 'To avoid irreversible deformation under serviceability loads, Md shall be less than 1.2 Ze fy/γm0 for simply supported beams and 1.5 Ze fy/γm0 for cantilevers (cl. 509.2.1.2).' } },
  ],
});

// ---------------------------------------------------------------- 2 · lateral restraints
const rest = st => { const each = Math.max(.025 * st.Ff / st.n, .01 * st.Ff), sum = st.kind === 'solid' ? .025 * st.Ff : Math.min(.075, .025 + .0125 * (st.beams - 1)) * st.Ff; return { each, share: .025 * st.Ff / st.n, sum }; };
export const restraint = spread({
  init: { n: 2, Ff: 2000, kind: 'solid', beams: 2 },
  chips: [['n', [1, 2, 3, 4], v => v === 1 ? '1 restraint' : `${v} restraints`], ['kind', ['solid', 'lattice'], v => v === 'solid' ? 'Solid web beams' : 'Latticed girders'], ['beams', [2, 3, 4, 5], v => `${v} girders`]],
  slider: { key: 'Ff', name: 'F', label: 'force · drag', values: range(500, 5000, 500), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, 1.4, -5.5); g.rotation.x = .5; g.scale.setScalar(1.05); group.add(g);
    const parts = new THREE.Group(), m = paint(), ar = []; g.add(parts);
    const tag = holo.label('', TAG); tag.position.set(0, 8.6, -5); group.add(tag);
    return {
      place() {
        dispose(parts); parts.clear(); for (const a of ar) { g.remove(a); dispose(a); } ar.length = 0;
        const LB = 15, GAP = 1.9, z0 = -(st.beams - 1) * GAP / 2;
        for (let i = 0; i < st.beams; i++) { const b = ibeam(LB, .8, .14, 2, .1, m); b.position.set(0, 3.8, z0 + i * GAP); parts.add(b); }
        for (const s of [-1, 1]) parts.add(box(1, 2.6, st.beams * GAP + .6, SM.concrete, s * (LB / 2 - .5), 1.3, 0));
        for (let j = 1; j <= st.n; j++) {
          const x = -LB / 2 + j * LB / (st.n + 1);
          for (let i = 0; i < st.beams - 1; i++) for (const d of [-1, 1]) { const q = box(Math.hypot(GAP, 2), .12, .12, GREEN, x, 3.8, z0 + (i + .5) * GAP); q.rotation.y = Math.PI / 2; q.rotateZ(d * Math.atan2(2, GAP)); parts.add(q); }
          const a = arrow(0xc23b2f, .08); a.rotation.y = -Math.PI / 2; a.position.set(x, 4.9, z0 + (st.beams - 1) * GAP + .5); a.userData.len(1.1); g.add(a); ar.push(a);
        }
        tag.userData.setText(`each restraint point: ${rest(st).each.toFixed(1)} kN`);
      },
      debug: () => rest(st),
    };
  },
  draw(c, W, H, st) {
    const r = rest(st), pct = st.kind === 'solid' ? 2.5 : Math.min(7.5, 2.5 + 1.25 * (st.beams - 1));
    head(c, 'LATERAL RESTRAINT · cl. 509.2.1, 509.3.4');
    const y = kv(c, W, [['Maximum force in the compression flange', `${st.Ff} kN`], ['Total restraint force, 2.5 %', `${(.025 * st.Ff).toFixed(1)} kN`], [`Divided between ${st.n} restraint point${st.n > 1 ? 's' : ''}`, `${r.share.toFixed(1)} kN each`],
      ['Every point at least 1 %', `${(.01 * st.Ff).toFixed(1)} kN`], ['Design each restraint for', `${r.each.toFixed(1)} kN`, OXIDE], [`${st.beams} ${st.kind === 'solid' ? 'solid web beams' : 'latticed girders'}, one system: ${pct} %`, `${r.sum.toFixed(1)} kN in all`, OXIDE]], 58, 28);
    lines(c, st.kind === 'solid' ? 'Beams with solid webs tied by one system of restraints: 2.5 % of the flange force in one beam only (509.3.4.1).' : 'Latticed girders: 2.5 %, plus 1.25 % for each girder after the first, up to 7.5 % (509.3.4.2).', 18, y + 4, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, 'Restraints fixed as close to the compression flange as practicable');
  },
  steps: [
    { title: 'What counts as restraint', text: 'A compression flange is fully held if its connection can resist a small sideways force. Drag the flange force.',
      check: { q: 'Full lateral restraint needs a connection able to resist… (cl. 509.2.1)', options: ['2.5 % of the maximum force in the compression flange', '25 % of that force', 'the whole shear force'], answer: 0, why: 'Full lateral restraint may be assumed if the restraint can resist a lateral force of not less than 2.5 per cent of the maximum force in the compression flange (cl. 509.2.1).' } },
    { title: 'Shared between points', text: 'Add restraints along the span. The 2.5 per cent is shared between them, but no point may be designed for too little.',
      check: { q: 'Each restraint point should resist at least… (cl. 509.3.4)', options: ['1 % of the maximum flange force', '0.1 % of it', '5 % of it'], answer: 0, why: 'The restraint resists 2.5 per cent of the maximum flange force, divided equally between the restraint points; each point should be capable of resisting 1 per cent of it (cl. 509.3.4).' } },
    { title: 'A row of girders', text: 'Add girders, then switch to latticed girders. The total restraining force grows for trusses, not for solid web beams.',
      check: { q: 'Latticed girders tied by one restraint system: the total is 2.5 % plus…', options: ['1.25 % for each girder after the first, up to 7.5 %', '2.5 % for each girder', 'nothing more'], answer: 0, why: '2.5 per cent of the maximum force in the compression flange plus 1.25 per cent for every member of the series other than the first, up to a maximum total of 7.5 per cent (cl. 509.3.4.2).' } },
  ],
});

// ---------------------------------------------------------------- 3 · lateral torsional buckling
const lt = st => {
  const sec = SEC[st.sec], s = iSection(sec), c = classify({ ...sec, fy: st.fy, welded: st.welded }), bb = c.cls <= 2 ? 1 : s.Ze / s.Zp;
  const klr = st.L * 1000 / s.ry, hft = s.hf / sec.tf, fcr = fcrb(klr, hft), lam = Math.sqrt(st.fy / fcr), r = ltb(lam, st.fy, st.welded), free = lam < .4;
  return { klr, hft, fcr, lam, bb, free, ...r, Md: bb * s.Zp * (free ? st.fy / GM0 : r.fbd) / 1e6 };
};
export const ltbSpread = spread({
  init: { sec: 'B', welded: true, fy: 250, L: 8 },
  chips: [SECCHIP, ['welded', [false, true], v => v ? 'Welded' : 'Rolled'], GRADES],
  slider: { key: 'L', name: 'LLT', label: 'length · drag', values: range(2, 30, 2), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.1); group.add(g);
    const LB = 15, m = paint(); posts(g, LB / 2, 2.6); let beam = null, key = '', r = lt(st);
    const a = down(g, 0, 6.2), tag = holo.label('', TAG); tag.position.set(0, 10, -5); group.add(tag);
    return {
      place() {
        r = lt(st); const s = SEC[st.sec], K = .0022;
        if (key !== st.sec) { key = st.sec; if (beam) { g.remove(beam); dispose(beam); } beam = ibeam(LB, s.bf * K * 1.6, .16, s.d * K, .1, m, 44); beam.position.y = 2.6 + .16 + s.d * K / 2; g.add(beam); a.position.y = 2.6 + s.d * K + 2.4; }
        tag.userData.setText(r.free ? 'λLT < 0.4: no buckling check needed' : `χLT = ${r.chi.toFixed(2)} · fbd = ${r.fbd.toFixed(0)} MPa`);
      },
      update(dt, t) {
        const k = r.free ? 0 : 1 - r.chi, w = .75 + .25 * Math.sin(t * 2), u = 1.7 * k * w, th = .9 * k * w;
        warp(beam, (x, y, z) => { const s = Math.sin(Math.PI * (x / LB + .5)), q = th * s, cs = Math.cos(q), sn = Math.sin(q); return [x, y * cs - z * sn - .3 * k * s, z * cs + y * sn + u * s]; });
      },
      debug: () => ({ klr: +r.klr.toFixed(1), fcr: +r.fcr.toFixed(1), lam: +r.lam.toFixed(3), chi: +r.chi.toFixed(3), Md: +r.Md.toFixed(0) }),
    };
  },
  draw(c, W, H, st) {
    const r = lt(st), x0 = 34, w = W - 70, y0 = 146, h = 98, X = l => x0 + l / 3 * w, Y = v => y0 - v * h;
    head(c, 'LATERAL TORSIONAL BUCKLING · cl. 509.2.2');
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, Y(1.02)); c.lineTo(x0, y0); c.lineTo(X(3), y0); c.stroke();
    for (const wd of [false, true]) {
      const on = wd === st.welded; c.strokeStyle = on ? OXIDE : 'rgba(92,97,104,.55)'; c.lineWidth = on ? 2.6 : 1.2; c.beginPath();
      for (let l = 0; l <= 3.001; l += .05) { const v = ltb(l, 250, wd).chi; if (l) c.lineTo(X(l), Y(v)); else c.moveTo(X(l), Y(v)); }
      c.stroke(); c.fillStyle = on ? OXIDE : DIMC; c.font = `${on ? 700 : 500} 11px ${F}`; c.fillText(wd ? 'welded 0.49' : 'rolled 0.21', X(wd ? .55 : 1.5), Y(ltb(wd ? .9 : 1.5, 250, wd).chi) + (wd ? 22 : -8));
    }
    c.fillStyle = DIMC; c.font = `500 11px ${F}`; c.fillText('χLT', x0 - 26, Y(1) + 4); c.fillText('λLT', X(3) - 8, y0 + 14); for (const l of [1, 2]) c.fillText(String(l), X(l) - 3, y0 + 13);
    c.fillStyle = INK; c.beginPath(); c.arc(X(Math.min(3, r.lam)), Y(r.chi), 4.5, 0, 7); c.fill();
    kv(c, W, [['LLT / ry and hf / tf', `${r.klr.toFixed(0)} and ${r.hft.toFixed(0)}`], ['fcr,b (equation of Table 11)', `${r.fcr.toFixed(0)} MPa`], ['λLT = √( fy / fcr,b )', r.lam.toFixed(2)], ['fbd = χLT fy / γm0', r.free ? 'not governing' : `${r.fbd.toFixed(0)} MPa`],
      ['Md = βb Zp fbd', `${r.Md.toFixed(0)} kNm`, OXIDE]], 178, 24);
    foot(c, H, `LLT ${st.L} m · web ${SEC[st.sec].d} × ${SEC[st.sec].tw}, ${st.welded ? 'welded' : 'rolled'}, fy ${st.fy}`);
  },
  steps: [
    { title: 'Sideways and twisting', text: 'With nothing holding its compression flange, a beam bows sideways and twists long before it yields. Drag the unsupported length.',
      check: { q: 'For a laterally unsupported beam, Md = … (cl. 509.2.2)', options: ['βb Zp fbd', 'βb Zp fy / γm0', 'Ze fu'], answer: 0, why: 'Md = βb Zp fbd, where fbd = χLT fy / γm0 is the design bending compressive stress and χLT the reduction factor for lateral torsional buckling (cl. 509.2.2).' } },
    { title: 'Rolled and welded', text: 'Switch between rolled and welded. A welded section sits on the lower curve.',
      check: { q: 'The imperfection parameter αLT for a welded steel section is…', options: ['0.49', '0.21', '0.76'], answer: 0, why: 'αLT = 0.21 for rolled steel sections and 0.49 for welded steel sections (cl. 509.2.2).' } },
    { title: 'When no check is needed', text: 'Drag to a short length. Below λLT = 0.4 the beam may be treated as laterally supported.',
      check: { q: 'Lateral torsional buckling need not be checked when…', options: ['λLT is less than 0.4', 'the span is under 10 m', 'the beam is welded'], answer: 0, why: 'It need not be checked for bending about the minor axis, for hollow sections or solid bars, or when λLT is less than 0.4 for major axis bending (cl. 509.2.2).' } },
  ],
});

// ---------------------------------------------------------------- 4 · effective length, Table 12
const DG = 1.25, ROW = ['Both flanges fully restrained', 'Compression flange fully restrained', 'Both flanges fully restrained · 3rd row', 'Compression flange partly restrained', 'Warping not restrained', 'Partial torsion · connection', 'Partial torsion · bearing'];
const t12 = st => { const r = TABLE12[st.row], f = r[st.load === 'n' ? 2 : 3]; return { r, f, LLT: f * st.L + r[4] * DG }; };
export const efflen = spread({
  init: { row: 0, load: 'n', L: 20 },
  chips: [['row', [0, 1, 2, 3, 4, 5, 6], v => ROW[v]], ['load', ['n', 'd'], v => v === 'n' ? 'Normal load' : 'Destabilising load'], ['L', [10, 20, 30], v => `L ${v} m`]],
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.1); group.add(g);
    const LB = 15, m = paint(), beam = ibeam(LB, 1.5, .16, 2.6, .1, m, 40); beam.position.y = 2.6 + .16 + 1.3; g.add(beam); posts(g, LB / 2, 2.6);
    const fit = { stiff: [], both: [], top: [] };
    for (const s of [-1, 1]) {
      const x = s * (LB / 2 - .5);
      for (const z of [-.4, .4]) { const q = box(.14, 2.6, .66, GREEN, x, 4.06, z); g.add(q); fit.stiff.push(q); }
      const e = box(.16, 3, 1.7, SM.steel, s * (LB / 2 + .08), 4.06, 0), tp = box(1.6, .14, 1.7, SM.steel, x, 5.6, 0); g.add(e, tp); fit.both.push(e); fit.top.push(tp);
    }
    const a = down(g, 0, 5.6), tag = holo.label('', TAG); tag.position.set(0, 10, -5); group.add(tag);
    return {
      place() {
        const full = st.row < 5; for (const q of fit.stiff) q.visible = full; for (const q of fit.both) q.visible = st.row === 0 || st.row === 2; for (const q of fit.top) q.visible = st.row === 1 || st.row === 3;
        a.position.y = (st.load === 'n' ? 4.06 : 5.6) + 1.9; const r = t12(st); tag.userData.setText(`LLT = ${r.LLT.toFixed(1)} m`);
      },
      update(dt, t) { const k = (t12(st).f - .6) * .9 * (.7 + .3 * Math.sin(t * 2)); warp(beam, (x, y, z) => { const s = Math.sin(Math.PI * (x / LB + .5)), q = .5 * k * s, cs = Math.cos(q), sn = Math.sin(q); return [x, y * cs - z * sn, z * cs + y * sn + k * s]; }); },
      debug: () => ({ LLT: t12(st).LLT }),
    };
  },
  draw(c, W, H, st) {
    const { r, f, LLT } = t12(st);
    head(c, 'EFFECTIVE LENGTH LLT · cl. 509.3.1, Table 12');
    let y = lines(c, 'Torsional restraint: ' + r[0].toLowerCase() + '.', 18, 54, W - 36, 19, INK, `600 14.5px ${F}`);
    y = lines(c, 'Warping restraint: ' + r[1].toLowerCase() + '.', 18, y + 3, W - 36, 19, INK, `600 14.5px ${F}`);
    y = lines(c, st.load === 'n' ? 'Normal loading.' : 'Destabilising loading: the load is not at the shear centre and acts towards it.', 18, y + 3, W - 36, 19, DIMC, `500 14px ${F}`);
    c.fillStyle = OXIDE; c.font = `700 20px ${F}`; c.fillText(`LLT = ${f.toFixed(2)} L${r[4] ? ' + 2 D' : ''} = ${LLT.toFixed(1)} m`, 18, y + 18);
    lines(c, (st.row === 2 ? 'The third row is printed with the same words as the first. ' : '') + 'Torsional restraint prevents rotation about the longitudinal axis; warping restraint prevents rotation of the flange in its plane. D is the overall depth.', 18, y + 44, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, `L ${st.L} m, D ${DG} m · between restraints: the segment (509.3.2)`);
  },
  steps: [
    { title: 'Held at the ends only', text: 'A simply supported beam with no restraint along its span depends on how its ends are held. Pick the rows of Table 12.',
      check: { q: 'Ends fully restrained against torsion, both flanges fully restrained against warping, normal loading: LLT = …', options: ['0.70 L', '1.00 L', '1.20 L'], answer: 0, why: 'Table 12: 0.70 L under normal loading and 0.85 L under destabilising loading.' } },
    { title: 'Destabilising load', text: 'Switch to a destabilising load: one that sits on the top flange and pushes the beam further over as it twists.',
      check: { q: 'Torsion fully restrained, warping not restrained in both flanges, destabilising load: LLT = …', options: ['1.20 L', '1.00 L', '0.85 L'], answer: 0, why: 'Table 12: warping not restrained in both flanges gives 1.00 L for normal loading and 1.20 L for destabilising loading.' } },
    { title: 'Only the bottom flange held', text: 'Pick the last two rows. The beam is held only through its bottom flange, and twice its depth is added.',
      check: { q: 'Torsional restraint means the section is prevented from…', options: ['rotating about its longitudinal axis', 'moving vertically', 'expanding with heat'], answer: 0, why: 'Torsional restraint prevents rotation about the longitudinal axis; warping restraint prevents rotation of the flange in its plane (Table 12, notes).' } },
  ],
});

// ---------------------------------------------------------------- 5 · cantilevers, Table 13
const SUP = { a: 'Continuous, with lateral restraint to top flange', b: 'Continuous, with partial torsional restraint', c: 'Continuous, with lateral and torsional restraint', d: 'Restrained laterally, torsionally and against rotation on plan' };
const TOP = ['Free', 'Lateral restraint to top flange', 'Torsional restraint', 'Lateral and torsional restraint'];
const t13 = st => { const f = TABLE13[st.sup][st.top][st.load === 'n' ? 0 : 1]; return { f, LLT: f * st.L }; };
export const cantilever = spread({
  init: { sup: 'c', top: 0, load: 'n', L: 4 },
  chips: [['sup', ['a', 'b', 'c', 'd'], v => ({ a: 'Support a · top flange held', b: 'Support b · partial torsion', c: 'Support c · lateral + torsion', d: 'Support d · built in' })[v]], ['top', [0, 1, 2, 3], v => 'Tip: ' + ['free', 'lateral', 'torsional', 'lateral + torsional'][v]], ['load', ['n', 'd'], v => v === 'n' ? 'Normal load' : 'Destabilising load'], ['L', [2, 4, 6], v => `L ${v} m`]],
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(-1, .5, -5); g.scale.setScalar(1.1); group.add(g);
    const m = paint(), LC = 9, x0 = -3, beam = ibeam(LC, 1.4, .16, 2.4, .1, m, 30); beam.position.set(x0 + LC / 2, 5, 0); g.add(beam);
    const back = ibeam(4.5, 1.4, .16, 2.4, .1, m); back.position.set(x0 - 2.25, 5, 0); const cross = ibeam(5, 1.2, .16, 2, .1, m); cross.rotation.y = Math.PI / 2; cross.position.set(x0, 2.6, 0);
    const wall = box(1.4, 8, 5, SM.concrete, x0 - .7, 4, 0), pier = box(1.2, 1.5, 5, SM.concrete, x0, .75, 0), sTop = box(.14, .14, 3.4, GREEN, x0, 6.36, 0), sTor = box(.14, 2.4, .7, GREEN, x0, 5, .45), sTor2 = box(.14, 2.4, .7, GREEN, x0, 5, -.45);
    const tipL = box(.14, .14, 4.2, GREEN, x0 + LC - .3, 6.36, -1.4), tipT = ibeam(4.6, .9, .12, 2.2, .1, GREEN); tipT.rotation.y = Math.PI / 2; tipT.position.set(x0 + LC - .3, 5, -3);
    g.add(back, cross, wall, pier, sTop, sTor, sTor2, tipL, tipT);
    const a = down(g, x0 + LC - .6, 6.4), tag = holo.label('', TAG); tag.position.set(1, 10.6, -5); group.add(tag);
    return {
      place() {
        const d = st.sup === 'd'; wall.visible = d; back.visible = cross.visible = pier.visible = !d;
        sTop.visible = st.sup === 'a' || st.sup === 'c'; sTor.visible = sTor2.visible = st.sup === 'c'; tipL.visible = st.top === 1 || st.top === 3; tipT.visible = st.top >= 2;
        a.position.y = (st.load === 'n' ? 5 : 6.4) + 1.9; tag.userData.setText(`LLT = ${t13(st).f} L = ${t13(st).LLT.toFixed(1)} m`);
      },
      update(dt, t) { const k = Math.min(1, t13(st).f / 5) * (.7 + .3 * Math.sin(t * 2)); warp(beam, (x, y, z) => { const s = ((x - x0) / LC) ** 2, q = .7 * k * s, cs = Math.cos(q), sn = Math.sin(q); return [x, y * cs - z * sn - .3 * k * s, z * cs + y * sn + 1.3 * k * s]; }); },
      debug: () => t13(st),
    };
  },
  draw(c, W, H, st) {
    const r = t13(st);
    head(c, 'CANTILEVER, LLT · cl. 509.3.3, Table 13');
    let y = lines(c, `At the support (${st.sup}): ${SUP[st.sup].toLowerCase()}.`, 18, 54, W - 36, 19, INK, `600 14.5px ${F}`);
    y = lines(c, `At the top (${['i', 'ii', 'iii', 'iv'][st.top]}): ${TOP[st.top].toLowerCase()}.`, 18, y + 3, W - 36, 19, INK, `600 14.5px ${F}`);
    y = lines(c, st.load === 'n' ? 'Normal loading.' : 'Destabilising loading.', 18, y + 3, W - 36, 19, DIMC, `500 14px ${F}`);
    c.fillStyle = OXIDE; c.font = `700 21px ${F}`; c.fillText(`LLT = ${r.f.toFixed(1)} L = ${r.LLT.toFixed(1)} m`, 18, y + 20);
    const t = TABLE13[st.sup]; kv(c, W, [['This support: tip i, ii, iii, iv, normal', t.map(v => v[0]).join(' · ')], ['Destabilising', t.map(v => v[1]).join(' · ')]], y + 52, 25);
    foot(c, H, `Projecting length L ${st.L} m`);
  },
  steps: [
    { title: 'A free tip', text: 'A cantilever with a free tip can twist over far more easily than a beam held at both ends. Pick each support condition.',
      check: { q: 'Continuous with lateral and torsional restraint at the support, tip free, normal loading: LLT = …', options: ['1.0 L', '0.5 L', '3.0 L'], answer: 0, why: 'Table 13, support condition c with a free tip: 1.0 L for normal loading and 2.5 L for destabilising loading.' } },
    { title: 'Holding the tip', text: 'Give the tip a lateral restraint, then a torsional one. The effective length falls.',
      check: { q: 'Built in at the support (d), lateral and torsional restraint at the tip: LLT = …', options: ['0.5 L', '0.8 L', '1.4 L'], answer: 0, why: 'Table 13, support d with lateral and torsional restraint at the top: 0.5 L under both normal and destabilising loading.' } },
    { title: 'Load on the top flange', text: 'Switch to a destabilising load with only the top flange held at the support.',
      check: { q: 'Support a, tip free, destabilising loading: LLT = …', options: ['7.5 L', '3.0 L', '2.5 L'], answer: 0, why: 'Table 13, support a (continuous, with lateral restraint to top flange), tip free: 3.0 L normal and 7.5 L destabilising.' } },
  ],
});

// ---------------------------------------------------------------- 6 · openings and holes
const open = st => ({ a: st.size <= 10, b: st.gap >= 3, c: st.per === 1, lim: holeLimit(st.fy) });
export const openings = spread({
  init: { size: 10, gap: 3, per: 1, hole: .8, fy: 250 },
  chips: [['gap', [2, 3, 4], v => `${v} × apart`], ['per', [1, 2], v => v === 1 ? 'One at a section' : 'Two at a section'], ['hole', [.7, .8, .9], v => `Anf / Agf ${v}`], GRADES],
  slider: { key: 'size', name: 'Size', label: 'size · drag', values: range(4, 20, 2), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.1); group.add(g);
    const LB = 16, DW = 4.4, m = paint(), mOk = new THREE.MeshStandardMaterial({ color: 0x14301f, roughness: .9 }), mBad = new THREE.MeshStandardMaterial({ color: 0x7a1c15, roughness: .9 }), holes = new THREE.Group();
    const beam = ibeam(LB, 1.6, .2, DW, .12, m); beam.position.y = 2.2 + .2 + DW / 2; g.add(beam, holes); posts(g, LB / 2, 2.2);
    const tag = holo.label('', TAG); tag.position.set(0, 10.4, -5); group.add(tag);
    return {
      place() {
        dispose(holes); holes.clear(); const o = open(st), ok = o.a && o.b && o.c, s = st.size / 100 * DW, pitch = s * (1 + st.gap), yc = 2.4 + DW / 2;
        for (let x = -Math.floor((LB / 2 - 1.6) / pitch) * pitch; x <= LB / 2 - 1.4; x += pitch) for (const dy of st.per === 1 ? [0] : [-DW / 4, DW / 4]) holes.add(box(s, s, .16, ok ? mOk : mBad, x, yc + dy, 0));
        tag.userData.setText(ok ? 'may be left unstiffened' : 'frame and stiffen the openings');
      },
    };
  },
  draw(c, W, H, st) {
    const o = open(st), ok = o.a && o.b && o.c, m = (b, t) => `${t} ${b ? '✓' : '✗'}`, hok = st.hole >= o.lim - 1e-9;
    head(c, 'OPENINGS AND HOLES · cl. 509.1.4, 509.2.1.4');
    const y = kv(c, W, [['Opening ÷ depth of web, limit 1/10', m(o.a, `${st.size} %`), o.a ? OK : BAD], ['Between openings, at least 3 × size', m(o.b, `${st.gap} ×`), o.b ? OK : BAD], ['At one cross-section, not more than 1', m(o.c, String(st.per)), o.c ? OK : BAD]], 58, 27);
    c.fillStyle = ok ? OK : OXIDE; c.font = `700 15px ${F}`; c.fillText(ok ? 'The openings may be unstiffened (509.1.4.2)' : 'Frame the openings and stiffen the section (509.1.4.1)', 18, y + 8);
    kv(c, W, [['Corner radius', '≥ 1/4 of the least dimension'], [`Flange holes: Anf/Agf ≥ ${o.lim.toFixed(3)}`, hok ? `${st.hole} ✓ ignore them` : `${st.hole} ✗`, hok ? OK : BAD], ['If not, effective flange area', hok ? 'Agf' : `Anf / ${o.lim.toFixed(3)}`], ['Shear lag ignored if b0, bi', '≤ L0/20, ≤ L0/10']], y + 38, 26);
    foot(c, H, `Anf/Agf ≥ (fy/fu)(γm1/γm0) / 0.9 · E ${st.fy}`);
  },
  steps: [
    { title: 'Holes in the web', text: 'Small openings may be cut in a web without stiffening, within three limits. Drag the size of the opening.',
      check: { q: 'An unstiffened opening is not larger than… (cl. 509.1.4.2)', options: ['one-tenth of the depth of the web', 'one-third of the depth of the web', 'half the depth of the web'], answer: 0, why: 'The overall greatest internal dimension does not exceed one-tenth of the depth of the web; in longitudinally stiffened webs, one-third of the depth of the panel (cl. 509.1.4.2 a).' } },
    { title: 'Spacing', text: 'Bring the openings closer, then put two at one section.',
      check: { q: 'The distance between the boundaries of adjacent openings is at least…', options: ['three times the maximum internal dimension', 'the web thickness', 'one opening width'], answer: 0, why: 'At least three times the maximum internal dimension, with not more than one opening at any cross-section (cl. 509.1.4.2 b, c).' } },
    { title: 'Holes in the tension flange', text: 'Change the ratio of net to gross area of the tension flange.',
      check: { q: 'Holes in the tension flange need not be considered if Anf/Agf ≥ … (cl. 509.2.1.4)', options: ['(fy/fu)(γm1/γm0) / 0.9', '0.5', 'fu / fy'], answer: 0, why: 'If Anf/Agf ≥ (fy/fu)(γm1/γm0)/0.9 the holes are ignored; otherwise a reduced effective flange area satisfying the equation is used (cl. 509.2.1.4 a).' } },
  ],
});
