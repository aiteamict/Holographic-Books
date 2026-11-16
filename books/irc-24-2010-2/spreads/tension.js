// Chapter 2 · tension members (cl. 506).
//   modes    (cl. 506.1–506.1.2.1)   a plate pulled until its gross section yields or its net section ruptures
//   stagger  (cl. 506.1.2.1, Fig. 2) staggered holes: the straight section against the zig-zag
//   angle    (cl. 506.1.2.3, Fig. 3) a single angle bolted through one leg: shear lag and β
//   block    (cl. 506.1.3, Fig. 4)   block shear at a bolted end
//   details  (cl. 506.2)             slenderness, lacing angles, tie plates, splices
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, arrow, box, cyl, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, OXIDE_HEX, TAG, DARK } from '../../_irc24/kit.js';
import { GM0, GM1, FU, Tdg, Tdn, netArea, angleRupture, alphaPrelim, blockShear } from '../../_irc24/steel.js';

const kN = v => `${v.toFixed(0)} kN`, GRADES = ['fy', [250, 300], v => `E ${v}`], DH = 22;
const gradeFoot = st => `E ${st.fy}: fy ${st.fy}, fu ${FU[st.fy]} MPa · γm0 1.10, γm1 1.25 (Table 1)`;
const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
/** A tilted table: a flat piece of steel laid on it shows its face, with the holes, to the reader. */
const table = (group, y = 2.4, z = -5, tilt = .5) => { const g = new THREE.Group(); g.position.set(0, y, z); g.rotation.x = tilt; g.scale.setScalar(1.15); group.add(g); return g; };

// ---------------------------------------------------------------- 1 · yielding or rupture
const K1 = .03;   // page cm per mm
const tens = st => { const Ag = st.b * st.t, An = netArea(st.b, st.t, st.n, st.dh), g = Tdg(Ag, st.fy), n = Tdn(An, FU[st.fy]); return { Ag, An, g, n, Td: Math.min(g, n), yields: g <= n }; };
export const modes = spread({
  init: { b: 200, t: 16, n: 2, dh: 22, fy: 250, T: 500 },
  chips: [['b', [150, 200, 250], v => `b ${v}`], ['t', [10, 16, 20], v => `t ${v}`], ['n', [1, 2, 3], v => v === 1 ? '1 hole' : `${v} holes`], ['dh', [18, 22, 26], v => `hole ${v}`], GRADES],
  slider: { key: 'T', name: 'T', label: 'tension · drag', values: range(100, 1500, 100), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = table(group), mat = paint(), holes = new THREE.Group();
    const halves = [0, 1].map(() => { const m = box(1, 1, 1, mat); g.add(m); return m; }), grips = [0, 1].map(() => { const m = box(1.4, 1.5, 1, SM.steel); g.add(m); return m; }), arrows = [0, 1].map(() => { const a = arrow(0xc23b2f, .1); g.add(a); return a; });
    g.add(holes); const tag = holo.label('', TAG); tag.position.set(0, 7.8, -5); group.add(tag);
    const cur = { s: 1, gap: 0 }; let r = tens(st);
    const lay = () => {
      const L = 6.2 * cur.s, w = st.b * K1, th = st.t * K1;
      for (const i of [0, 1]) {
        const s = i ? 1 : -1;
        halves[i].scale.set(L, th, w); halves[i].position.x = s * (cur.gap / 2 + L / 2); grips[i].position.x = s * (cur.gap / 2 + L + .7); grips[i].scale.z = w + 1.2;
        arrows[i].position.set(s * (cur.gap / 2 + L + 1.4), 0, 0); arrows[i].userData.len(s * (.8 + st.T / 700));
      }
      for (const h of holes.children) h.position.x = h.userData.s * cur.gap / 2;
    };
    return {
      place() {
        r = tens(st); dispose(holes); holes.clear();
        for (const s of [-1, 1]) for (let i = 0; i < st.n; i++) { const h = cyl(st.dh * K1 / 2, st.t * K1 + .04, DARK, 0, 0, (i - (st.n - 1) / 2) * st.b * K1 / st.n); h.userData.s = s; h.castShadow = false; holes.add(h); }
        const over = st.T > r.Td + 1e-9;
        mat.color.setHex(over ? (r.yields ? 0xd08a2e : 0xc23b2f) : OXIDE_HEX);
        tag.userData.setText(!over ? 'T ≤ Td: safe' : r.yields ? 'the gross section yields and stretches' : 'the net section ruptures at the holes');
        lay();
      },
      update(dt) { const over = st.T > r.Td + 1e-9, k = Math.min(1, dt * 4); cur.s += ((over && r.yields ? 1.14 : 1) - cur.s) * k; cur.gap += ((over && !r.yields ? 1.1 : 0) - cur.gap) * k; lay(); },
      debug: () => ({ Tdg: +r.g.toFixed(1), Tdn: +r.n.toFixed(1), Td: +r.Td.toFixed(1) }),
    };
  },
  draw(c, W, H, st) {
    const r = tens(st), ok = st.T <= r.Td + 1e-9;
    head(c, 'TENSION MEMBER · cl. 506.1');
    const y = kv(c, W, [['Gross area Ag = b t', `${st.b} × ${st.t} = ${r.Ag} mm²`], [`Net area An = (b − ${st.n} dh) t`, `${r.An} mm²`],
      ['Yielding  Tdg = Ag fy / γm0', kN(r.g), r.yields ? OXIDE : INK], ['Rupture  Tdn = 0.9 An fu / γm1', kN(r.n), r.yields ? INK : OXIDE]], 58, 28);
    c.fillStyle = INK; c.font = `700 17px ${F}`; c.fillText(`Td = ${kN(r.Td)}, governed by ${r.yields ? 'yielding' : 'rupture'}`, 18, y + 12);
    c.fillStyle = ok ? OK : BAD; c.font = `700 16px ${F}`; c.fillText(ok ? `✓ T = ${st.T} kN ≤ Td` : `✗ T = ${st.T} kN > Td`, 18, y + 40);
    lines(c, 'Td is the lowest of yielding, rupture and block shear (cl. 506.1).', 18, y + 66, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, gradeFoot(st));
  },
  steps: [
    { title: 'Two ways to fail', text: 'A tension member can yield along its whole length, or tear across the holes. Drag the tension up until it fails.',
      check: { q: 'The design strength in tension Td is… (cl. 506.1)', options: ['the lowest of Tdg, Tdn and Tdb', 'the average of the three', 'Tdg alone'], answer: 0, why: 'Td is the lowest of the design strength due to yielding of the gross section Tdg, rupture of the critical section Tdn and block shear Tdb (cl. 506.1).' } },
    { title: 'Yielding', text: 'Leave one small hole. Now the gross section yields first: the member stretches until it is no longer of use.',
      check: { q: 'Yielding of the gross section: Tdg = … (cl. 506.1.1)', options: ['Ag fy / γm0', '0.9 An fu / γm1', 'Ag fu / γm1'], answer: 0, why: 'Tdg = Ag fy / γm0, with Ag the gross area and γm0 = 1.10 from Table 1 (cl. 506.1.1).' } },
    { title: 'Rupture', text: 'Add holes or make them larger. The net section at the holes now tears before the plate yields.',
      check: { q: 'Rupture of a plate at the holes: Tdn = … (cl. 506.1.2.1)', options: ['0.9 An fu / γm1', 'An fy / γm0', '0.9 Ag fu / γm0'], answer: 0, why: 'Tdn = 0.9 An fu / γm1, with An the net effective area at the holes and γm1 = 1.25 (cl. 506.1.2.1).' } },
  ],
});

// ---------------------------------------------------------------- 2 · staggered holes
const K2 = .028, B2 = 300;
const stag = st => {
  const s = netArea(B2, st.t, st.ps ? 2 : 3, DH), z = netArea(B2, st.t, 3, DH, [[st.ps, st.g], [st.ps, st.g]]), An = Math.min(s, z);
  return { s, z, An, zig: !st.ps || z < s - 1e-9, leg: st.ps ** 2 / (4 * st.g), T: Tdn(An, FU[st.fy]) };
};
export const stagger = spread({
  init: { g: 75, ps: 40, t: 16, fy: 250 },
  chips: [['g', [60, 75, 100], v => `gauge ${v}`], ['t', [10, 16], v => `t ${v}`], GRADES],
  slider: { key: 'ps', name: 'ps', label: 'stagger · drag', values: range(0, 120, 10) },
  model({ holo, group, st }) {
    const g = table(group), w = B2 * K2, th = .45, y = th / 2 + .05;
    g.add(box(14, th, w, paint()));
    const hs = [0, 1, 2].map(() => { const h = cyl(DH * K2 / 2, th + .04, DARK); h.castShadow = false; g.add(h); return h; });
    const path = () => [[0, y, -w / 2], [0, y, -1], [0, y, 0], [0, y, 1], [0, y, w / 2]];
    const mk = (col, wd) => { const l = holo.polyline(path(), col, { width: wd }); g.add(l); return l; };
    const sR = mk(holo.RED, .14), sD = mk(holo.DIM, .07), zR = mk(holo.RED, .14), zD = mk(holo.DIM, .07);
    const tag = holo.label('', TAG); tag.position.set(0, 7.6, -5); group.add(tag);
    const lp = holo.label('ps', { h: .55, color: INK }), lg = holo.label('g', { h: .55, color: INK }); g.add(lp, lg);
    return {
      place() {
        const r = stag(st), G = st.g * K2, P = st.ps * K2;
        hs[0].position.set(0, 0, -G); hs[1].position.set(P, 0, 0); hs[2].position.set(0, 0, G);
        const zz = [[0, y, -w / 2], [0, y, -G], [P, y, 0], [0, y, G], [0, y, w / 2]];
        holo.setPoints(zR, zz); holo.setPoints(zD, zz);
        zR.visible = r.zig; zD.visible = !r.zig; sR.visible = !r.zig; sD.visible = r.zig && st.ps > 0;
        lp.position.set(P / 2, y + .5, .6); lp.visible = st.ps > 0; lg.position.set(-.9, y + .4, G / 2);
        tag.userData.setText(`${r.zig ? 'the zig-zag' : 'the straight section'} governs · An = ${r.An.toFixed(0)} mm²`);
      },
      debug: () => { const r = stag(st); return { straight: r.s, zigzag: +r.z.toFixed(1), An: +r.An.toFixed(1) }; },
    };
  },
  draw(c, W, H, st) {
    const r = stag(st);
    head(c, 'STAGGERED HOLES · cl. 506.1.2.1, Fig. 2');
    c.fillStyle = INK; c.font = `700 16px ${F}`; c.fillText('An = [ b − n dh + Σ ps² / 4g ] t', 18, 56);
    const y = kv(c, W, [[st.ps ? 'Straight section, 2 holes' : 'All 3 holes in one section', `${r.s.toFixed(0)} mm²`, r.zig ? INK : OXIDE], ['Zig-zag, 3 holes, 2 inclined legs', `${r.z.toFixed(0)} mm²`, r.zig ? OXIDE : INK],
      ['Each leg adds ps² / 4g', `${st.ps}² / (4 × ${st.g}) = ${r.leg.toFixed(1)} mm`], ['Rupture  Tdn = 0.9 An fu / γm1', kN(r.T)]], 86, 28);
    lines(c, `The smaller net area governs. Here the zig-zag stops being critical once the stagger reaches √(2 g dh) = ${Math.sqrt(2 * st.g * DH).toFixed(0)} mm.`, 18, y + 6, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, `Plate ${B2} × ${st.t} mm, holes ${DH} mm, E ${st.fy}`);
  },
  steps: [
    { title: 'A chain of holes', text: 'When holes are staggered, the plate can tear along a zig-zag that passes through more holes than a straight cut.',
      check: { q: 'In An = [b − n dh + Σ ps²/4g] t, ps is… (cl. 506.1.2.1)', options: ['the staggered pitch between lines of holes', 'the plate thickness', 'the hole diameter'], answer: 0, why: 'ps is the staggered pitch length between lines of holes, g the gauge length between the holes, n the number of holes in the critical section (cl. 506.1.2.1, Fig. 2).' } },
    { title: 'What a stagger gives back', text: 'Drag the stagger. Each inclined leg of the zig-zag adds ps²/4g to the width that counts.',
      check: { q: 'g in the formula is…', options: ['the gauge length between the holes', 'the gross width', 'the grip of the bolt'], answer: 0, why: 'g is the gauge length between the holes, measured across the member, as shown in Fig. 2.' } },
    { title: 'Which path governs', text: 'Push the stagger further. The straight section through two holes takes over as the weakest.',
      check: { q: 'n is the number of holes…', options: ['in the critical section', 'in the whole plate', 'per metre of plate'], answer: 0, why: 'n is the number of holes in the critical section; the summation runs over all the inclined legs of that section (cl. 506.1.2.1).' } },
  ],
});

// ---------------------------------------------------------------- 3 · single angle, shear lag
const K3 = .035, ISA = { 75: [75, 8, 40], 100: [100, 10, 55], 150: [150, 12, 85] };   // leg, thickness, bolt line from the heel (mm)
const ang = st => {
  const [leg, t, wi] = ISA[st.size], fu = FU[st.fy], Lc = (st.nb - 1) * st.p, Ago = (leg - t / 2) * t, Anc = (leg - t / 2 - DH) * t, Ag = (2 * leg - t) * t, bs = leg + wi - t;
  const a = alphaPrelim(st.nb);
  return { leg, t, wi, Lc, bs, Ag, ...angleRupture({ Anc, Ago, w: leg, t, bs, Lc, fy: st.fy, fu }), g: Tdg(Ag, st.fy), a, pre: a * (Ag - DH * t) * fu / GM1 / 1000, top: fu * GM0 / (st.fy * GM1) };
};
export const angle = spread({
  init: { size: 100, nb: 3, p: 60, fy: 250 },
  chips: [['size', [75, 100, 150], v => `ISA ${v}`], ['p', [50, 60, 75], v => `pitch ${v}`], GRADES],
  slider: { key: 'nb', name: 'Bolts', label: 'bolts · drag', values: [2, 3, 4, 5, 6], at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(-1, 1.2, -5); g.scale.setScalar(1.12); group.add(g);
    const mo = paint(), conn = box(1, 1, 1, paint()), out = box(1, 1, 1, mo), gus = box(1, 1, .3, SM.steel), bolts = new THREE.Group(), a = arrow(0xc23b2f, .1);
    g.add(conn, out, gus, bolts, a, box(1.2, 7, 4, SM.concrete, -8.4, 2.6, -.4));
    const tag = holo.label('', TAG); tag.position.set(0, 9, -5); group.add(tag);
    const lo = holo.label('outstanding leg', { h: .8, color: INK }), lc = holo.label('connected leg', { h: .8, color: INK }); g.add(lo, lc);
    const pale = new THREE.Color(0xd9b8a4), full = new THREE.Color(OXIDE_HEX);
    return {
      place() {
        const r = ang(st), leg = r.leg * K3, t = Math.max(.22, r.t * K3), x0 = -7, LEN = Math.max(13, r.Lc * K3 + 3.5), gl = r.Lc * K3 + 3.4;
        conn.scale.set(LEN, leg, t); conn.position.set(x0 + LEN / 2, leg / 2, 0);
        out.scale.set(LEN, t, leg); out.position.set(x0 + LEN / 2, leg - t / 2, -leg / 2);
        gus.scale.set(gl, leg + 2.4, 1); gus.position.set(-7.8 + gl / 2, leg / 2, -t / 2 - .16);
        dispose(bolts); bolts.clear();
        for (let i = 0; i < st.nb; i++) { const b = cyl(.3, .3, SM.steel, x0 + 1.2 + i * st.p * K3, leg - r.wi * K3, t / 2 + .1, 6); b.rotation.x = Math.PI / 2; bolts.add(b); }
        mo.color.lerpColors(pale, full, Math.max(0, Math.min(1, (r.beta - .7) / (r.top - .7))));
        a.position.set(x0 + LEN + .2, leg / 2, 0); a.userData.len(2);
        lo.position.set(x0 + LEN - 3, leg + .7, -leg / 2); lc.position.set(x0 + LEN - 3, -.6, .5);
        tag.userData.setText(`β = ${r.beta.toFixed(2)} on the outstanding leg`);
      },
      debug: () => { const r = ang(st); return { beta: +r.beta.toFixed(3), Tdn: +r.Tdn.toFixed(1), Tdg: +r.g.toFixed(1) }; },
    };
  },
  draw(c, W, H, st) {
    const r = ang(st);
    head(c, 'SINGLE ANGLE · cl. 506.1.2.3, Fig. 3');
    c.fillStyle = INK; c.font = `700 15px ${F}`; c.fillText('Tdn = 0.9 Anc fu / γm1 + β Ago fy / γm0', 18, 54);
    kv(c, W, [['Connection length Lc', `${st.nb - 1} × ${st.p} = ${r.Lc} mm`], ['Shear lag width bs = w + wi − t', `${r.leg} + ${r.wi} − ${r.t} = ${r.bs} mm`],
      ['β = 1.4 − 0.076 (w/t)(fy/fu)(bs/Lc)', r.beta.toFixed(2) + (r.raw < .7 ? ' (min 0.7)' : r.raw > r.top ? ' (max)' : '')], ['Rupture Tdn', kN(r.Tdn), OXIDE], ['Yielding Tdg = Ag fy / γm0', kN(r.g)], [`Preliminary α An fu / γm1, α = ${r.a}`, kN(r.pre)]], 82, 27);
    foot(c, H, `ISA ${r.leg} × ${r.leg} × ${r.t}, holes ${DH} mm, legs taken to mid-thickness`);
  },
  steps: [
    { title: 'Shear lag', text: 'An angle bolted through one leg is not pulled evenly. The outstanding leg lags behind and gives less than its full area.',
      check: { q: 'The rupture strength of an angle connected through one leg is affected by… (cl. 506.1.2.3)', options: ['shear lag', 'fatigue', 'creep'], answer: 0, why: 'The rupture strength of an angle connected through one leg is affected by shear lag; β reduces the share of the outstanding leg (cl. 506.1.2.3).' } },
    { title: 'A longer connection', text: 'Drag for more bolts. A longer connection brings the outstanding leg into play, and β rises.',
      check: { q: 'β shall not be taken as less than…', options: ['0.7', '0.5', '1.0'], answer: 0, why: 'β = 1.4 − 0.076 (w/t)(fy/fu)(bs/Lc), not more than fu γm0 / fy γm1 and not less than 0.7 (cl. 506.1.2.3).' } },
    { title: 'Preliminary sizing', text: 'For a first size, the Code allows Tdn = α An fu / γm1. Compare it with the full formula on the card.',
      check: { q: 'For preliminary sizing with four or more bolts along the connection, α = …', options: ['0.8', '0.6', '0.7'], answer: 0, why: 'α = 0.6 for one or two bolts or rivets, 0.7 for three, and 0.8 for four or more along the length of the end connection, or the equivalent weld length (cl. 506.1.2.3).' } },
  ],
});

// ---------------------------------------------------------------- 4 · block shear
const K4 = .035, E4 = 40;   // end distance, mm
const blk = st => {
  const Ls = E4 + (st.n - 1) * st.p, Avg = 2 * Ls * st.t, Avn = 2 * (Ls - (st.n - .5) * DH) * st.t, Atg = st.g * st.t, Atn = (st.g - DH) * st.t;
  return { Ls, Avg, Avn, Atg, Atn, ...blockShear({ Avg, Avn, Atg, Atn, fy: st.fy, fu: FU[st.fy] }) };
};
export const block = spread({
  init: { n: 3, p: 60, t: 10, g: 75, fy: 250, T: 300 },
  chips: [['n', [2, 3, 4], v => `${v} bolts a line`], ['p', [60, 75], v => `pitch ${v}`], ['t', [10, 16], v => `t ${v}`], ['g', [75, 100], v => `gauge ${v}`], GRADES],
  slider: { key: 'T', name: 'T', label: 'tension · drag', values: range(100, 1800, 100), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = table(group, 2.2), mat = paint(), mb = paint(), mov = new THREE.Group(), fix = new THREE.Group(), a = arrow(0xc23b2f, .1); g.add(mov, fix, a);
    const tag = holo.label('', TAG); tag.position.set(0, 7.6, -5); group.add(tag);
    const xe = -6, LM = 13; let r = blk(st), d = 0;
    return {
      place() {
        r = blk(st); for (const q of [mov, fix]) { dispose(q); q.clear(); }
        const th = Math.max(.28, st.t * K4), G = st.g * K4, B = (st.g + 80) * K4, Ls = r.Ls * K4, y = th / 2 + .05, xi = xe + Ls, over = st.T > r.Tdb + 1e-9;
        for (const s of [-1, 1]) mov.add(box(LM, th, (B - G) / 2, mat, xe + LM / 2, 0, s * (G / 2 + (B - G) / 4)));
        mov.add(box(LM - Ls, th, G, mat, xi + (LM - Ls) / 2, 0, 0));
        fix.add(box(Ls, th, G, mb, xe + Ls / 2, 0, 0), box(Ls + 3.5, .3, B + 2.4, SM.steel, xe - 2 + (Ls + 3.5) / 2, -th / 2 - .16, 0), box(1.2, 2, B + 2.4, SM.concrete, xe - 2.6, -.6, 0));
        for (let i = 0; i < st.n; i++) for (const s of [-1, 1]) fix.add(cyl(.28, th + .5, SM.steel, xe + (E4 + i * st.p) * K4, .05, s * G / 2, 6));
        fix.add(holo.segments([[xe, y, -G / 2], [xi, y, -G / 2], [xe, y, G / 2], [xi, y, G / 2]], holo.AMBER, .95, { width: .12 }), holo.segments([[xi, y, -G / 2], [xi, y, G / 2]], holo.RED, .95, { width: .12 }));
        mb.color.setHex(over ? 0xc23b2f : OXIDE_HEX); a.userData.len(.8 + st.T / 700);
        tag.userData.setText(over ? 'the block shears out' : 'T ≤ Tdb: the block holds');
      },
      update(dt) { d += ((st.T > r.Tdb + 1e-9 ? 1 : 0) - d) * Math.min(1, dt * 4); mov.position.x = d; a.position.set(xe + LM + .2 + d, 0, 0); },
      debug: () => ({ a: +r.a.toFixed(1), b: +r.b.toFixed(1), Tdb: +r.Tdb.toFixed(1) }),
    };
  },
  draw(c, W, H, st) {
    const r = blk(st), ok = st.T <= r.Tdb + 1e-9;
    head(c, 'BLOCK SHEAR · cl. 506.1.3.1, Fig. 4');
    const y = kv(c, W, [['Shear area, gross Avg and net Avn', `${r.Avg} and ${r.Avn} mm²`], ['Tension area, gross Atg and net Atn', `${r.Atg} and ${r.Atn} mm²`],
      ['Avg fy / (√3 γm0) + 0.9 Atn fu / γm1', kN(r.a), r.a <= r.b ? OXIDE : INK], ['0.9 Avn fu / (√3 γm1) + Atg fy / γm0', kN(r.b), r.b < r.a ? OXIDE : INK]], 58, 28);
    c.fillStyle = INK; c.font = `700 17px ${F}`; c.fillText(`Tdb = ${kN(r.Tdb)}, the smaller of the two`, 18, y + 12);
    c.fillStyle = ok ? OK : BAD; c.font = `700 16px ${F}`; c.fillText(ok ? `✓ T = ${st.T} kN ≤ Tdb` : `✗ T = ${st.T} kN > Tdb`, 18, y + 40);
    lines(c, 'Shear along the two bolt lines, tension across the inner bolts.', 18, y + 66, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, `Holes ${DH} mm, end distance ${E4} mm, E ${st.fy}`);
  },
  steps: [
    { title: 'A block tears out', text: 'At a bolted end, a whole block of plate can pull out: shear along the bolt lines, tension across them. Drag the tension up.',
      check: { q: 'The block shear strength Tdb is taken as… (cl. 506.1.3.1)', options: ['the smaller of the two expressions', 'the larger of the two', 'their sum'], answer: 0, why: 'Tdb is the smaller of Avg fy/(√3 γm0) + 0.9 Atn fu/γm1 and 0.9 Avn fu/(√3 γm1) + Atg fy/γm0 (cl. 506.1.3.1).' } },
    { title: 'Shear and tension planes', text: 'The amber lines shear along the bolt lines. The red line breaks in tension between the inner bolts.',
      check: { q: 'Avg and Avn are the gross and net areas…', options: ['in shear along the bolt line parallel to the force', 'in tension across the member', 'around every hole'], answer: 0, why: 'Avg, Avn: minimum gross and net area in shear along the bolt or rivet line parallel to the external force. Atg, Atn: gross and net area in tension, perpendicular to the line of force (cl. 506.1.3.1).' } },
    { title: 'More bolts', text: 'Add bolts or pitch. The shear planes lengthen and the block holds more.',
      check: { q: 'For a welded end connection, block shear… (cl. 506.1.3.2)', options: ['is checked on a section around the end weld', 'need not be checked', 'is taken as zero'], answer: 0, why: 'Block shear shall be checked for welded end connections by taking an appropriate section in the member around the end weld, which can shear off as a block (cl. 506.1.3.2).' } },
  ],
});

// ---------------------------------------------------------------- 5 · design details
const LACE = { single: [40, 70], double: [40, 50] };
export const details = spread({
  init: { sys: 'single', ang: 55, lr: 250 },
  chips: [['sys', ['single', 'double'], v => v === 'single' ? 'Single lacing' : 'Double lacing'], ['lr', [200, 250, 300, 350], v => `L/r ${v}`]],
  slider: { key: 'ang', name: 'Angle', label: 'lacing angle · drag', values: range(30, 80, 5) },
  model({ holo, group, st }) {
    const g = table(group, 2.4, -5, .55), lace = new THREE.Group(), GZ = 3.6, LEN = 15, mok = paint(0x2f8f55, .5, .2), mbad = paint(0xc23b2f, .5, .2), mm = paint();
    for (const s of [-1, 1]) g.add(box(LEN, 1.3, .5, mm, 0, 0, s * GZ / 2), box(1.8, .14, GZ + .5, SM.steel, s * (LEN / 2 - .9), .72, 0));
    g.add(lace); const tag = holo.label('', TAG); tag.position.set(0, 7.4, -5); group.add(tag);
    return {
      place() {
        dispose(lace); lace.clear();
        const [lo, hi] = LACE[st.sys], ok = st.ang >= lo && st.ang <= hi, a = st.ang * Math.PI / 180, dx = GZ / Math.tan(a), len = GZ / Math.sin(a), x0 = -LEN / 2 + 1.9, x1 = LEN / 2 - 1.9;
        let i = 0;
        for (let x = x0; x + dx <= x1 + 1e-6; x += dx, i++) for (const dir of st.sys === 'single' ? [i % 2 ? -1 : 1] : [1, -1]) { const b = box(len, .1, .28, ok ? mok : mbad, x + dx / 2, .72 + (dir > 0 ? 0 : .1), 0); b.rotation.y = dir * a; lace.add(b); }
        mm.color.setHex(st.lr <= 300 ? OXIDE_HEX : 0xc23b2f);
        tag.userData.setText(`lacing at ${st.ang}° ${ok ? '✓' : '✗'} · allowed ${lo}° to ${hi}°`);
      },
      debug: () => ({ bars: lace.children.length }),
    };
  },
  draw(c, W, H, st) {
    const [lo, hi] = LACE[st.sys], ok = st.ang >= lo && st.ang <= hi, okL = st.lr <= 300;
    head(c, 'DESIGN DETAILS · cl. 506.2');
    kv(c, W, [['Slenderness L/r of a main member', `${st.lr} ${okL ? '✓' : '✗'} limit 300`, okL ? OK : BAD], [`Lacing angle, ${st.sys} system`, `${st.ang}° ${ok ? '✓' : '✗'} ${lo}° to ${hi}°`, ok ? OK : BAD],
      ['Slenderness of a lacing bar', 'not over 140'], ['End tie plate, length', '≥ distance between centroids'], ['Intermediate tie plate, length', '≥ 3/4 of that distance'], ['Tie plate thickness', '≥ 1/60 between fastener lines'], ['Splice, sectional area', '5 % more than required']], 58, 28);
    foot(c, H, 'Lace or batten open sides when the outstand exceeds 16 t (E 250)');
  },
  steps: [
    { title: 'Slenderness', text: 'Even a member that only pulls must not be too slender. Change L/r past the limit.',
      check: { q: 'For main tension members, unsupported length ÷ least radius of gyration shall not exceed… (cl. 506.2.1)', options: ['300', '180', '350'], answer: 0, why: 'For main members the ratio of unsupported length to the least radius of gyration shall not exceed 300 (cl. 506.2.1).' } },
    { title: 'Lacing', text: 'Two components are tied together by lacing. Drag the lacing angle, then switch to double lacing.',
      check: { q: 'Single intersection lacing is inclined to the axis of the member at… (cl. 506.2.7.2)', options: ['40° to 70°', '40° to 50°', '30° to 60°'], answer: 0, why: 'Lacing bars are inclined at 40° to 70° to the axis for a single intersection system and 40° to 50° for a double intersection system (cl. 506.2.7.2).' } },
    { title: 'Tie plates and splices', text: 'Tie plates close the lacing at the ends. A splice must be a little stronger than the member it joins.',
      check: { q: 'A splice in a tension member has a sectional area… (cl. 506.2.9)', options: ['5 per cent more than required', 'equal to the member', '25 per cent more'], answer: 0, why: 'Splices in tension members shall have a sectional area 5 per cent more than that required to develop the load in the member (cl. 506.2.9).' } },
  ],
});
