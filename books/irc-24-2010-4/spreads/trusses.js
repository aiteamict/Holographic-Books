// Chapter 4 · trusses and open web girders (cl. 508, Annex B).
//   pins     (cl. 508.2, 508.3)   the pin-jointed assumptions; a load between joints; axes that miss the joint
//   efflen   (cl. 508.4, Table 9) effective length of chords and web members
//   uframe   (cl. 508.4.4)        an unbraced compression chord held by U frames
//   joints   (cl. 508.7–508.9)    lug angles, pin holes and pin plates
//   bracing  (cl. 508.11)         lateral, portal and sway bracing and the shear each is designed for
//   camber   (Annex B)            the camber diagram: how much longer or shorter each member is made
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, sit, truss, truck, arrow, box, cyl, bend, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, BAD, OK, TAG } from '../../_irc24/kit.js';
import { E, GM1, FU, TABLE9, uFrame, uFrameForce } from '../../_irc24/steel.js';

const LP = 17, NP = 8, HT = 3.2, PAN = LP / NP, W2 = 1.3, TEN = 0x1d5f87, COM = 0xb0532a, HI = 0xd08a2e;
const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
const mk = () => truss({ L: LP, h: HT, n: NP, H: 2.4 });
/** What a bar of the kit truss is, from its two panel points [i, top]. */
const kindOf = (a, b) => !a[1] && !b[1] ? 'bottom' : a[1] && b[1] ? 'top' : a[0] === b[0] ? 'vert' : !a[1] && (a[0] === 0 || a[0] === NP) ? 'raker' : 'diag';
const tint = (tr, pick) => { for (const [m, a, b] of tr.mem) m.material = pick(kindOf(a, b), a, b); };
const node = (i, top, s = 1) => [i * PAN - LP / 2, top ? HT : 0, s * W2];

// ---------------------------------------------------------------- 1 · pin-jointed analysis
export const pins = spread({
  river: true, init: { at: 'joint', ecc: false },
  chips: [['at', ['joint', 'panel'], v => v === 'joint' ? 'Load at a joint' : 'Load between joints'], ['ecc', [false, true], v => v ? 'Axes miss the point' : 'Axes meet at a point']],
  model({ holo, group, st }) {
    const tr = mk(); group.add(sit(tr.g));
    const M = { T: paint(TEN), C: paint(COM), B: paint(0xc23b2f) }, tk = truck(.3); tr.g.add(tk);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.32, 16, 12), new THREE.MeshBasicMaterial({ color: 0xc23b2f, toneMapped: false })); dot.position.set(...node(2, 1)); tr.span.add(dot);
    const tag = holo.label('', TAG), lt = holo.label('tension', { h: .8, color: '#1d5f87', weight: 700 }), lc = holo.label('compression', { h: .8, color: '#b0532a', weight: 700 });
    tag.position.set(0, 9.6, -5); lt.position.set(-4.5, 1.4, -1.4); lc.position.set(4.5, 1.4, -1.4); group.add(tag, lt, lc);
    return {
      place() {
        const mid = st.at === 'panel';
        tint(tr, (k, a) => mid && k === 'bottom' && a[0] === 3 ? M.B : k === 'bottom' || k === 'diag' ? M.T : M.C);
        tk.position.set(mid ? -PAN / 2 : 0, tr.top, 0); dot.visible = st.ecc;
        tag.userData.setText((mid ? 'the loaded member also bends' : 'axial forces only') + (st.ecc ? ' · secondary stress at the joint' : ''));
      },
    };
  },
  draw(c, W, H, st) {
    head(c, 'TRUSS ANALYSIS · cl. 508.2, 508.3');
    let y = lines(c, 'Unless a rigorous rigid frame analysis is made, assume:', 18, 54, W - 36, 19, DIMC, `500 14px ${F}`);
    for (const t of ['a) all members are frictionless pin jointed', 'b) all members are straight and free to rotate at the joints', 'c) all loads, with self weight, are applied at the joints']) y = lines(c, t, 18, y + 4, W - 36, 19, INK, `600 14.5px ${F}`);
    const mid = st.at === 'panel';
    y = lines(c, mid ? 'Load between joints: allow for the stresses it causes in the loaded member (508.3 a).' : '✓ Load at a joint: the members carry axial force only.', 18, y + 14, W - 36, 19, mid ? OXIDE : OK, `700 14.5px ${F}`);
    lines(c, st.ecc ? 'Centroidal axes do not meet at one point: the flexural stresses are taken as secondary stress (508.3).' : '✓ Centroidal axes meet at a point: no eccentricity moment.', 18, y + 8, W - 36, 19, st.ecc ? OXIDE : OK, `700 14.5px ${F}`);
    foot(c, H, 'Not for stiffening trusses of suspension bridges (508.2)');
  },
  steps: [
    { title: 'Pins and joints', text: 'A truss is a triangulated skeleton. Blue members pull, rust members push. The analysis assumes every joint is a frictionless pin.',
      check: { q: 'Which is an assumption for truss analysis (cl. 508.2)?', options: ['all loads are applied at the joints', 'members are rigidly fixed', 'self weight is ignored'], answer: 0, why: 'Members are frictionless pin jointed, straight and free to rotate at the joints, and all loads including self weight are applied at the joints (cl. 508.2).' } },
    { title: 'A load between joints', text: 'Move the load between two joints. The member under it must now bend as well as pull.',
      check: { q: 'Where a load is applied to a member other than at a joint… (cl. 508.3)', options: ['the resulting stresses are taken into account', 'it may be ignored', 'the truss must be redesigned as a beam'], answer: 0, why: 'Account should be taken of the resulting stresses where load is applied to a member in the plane of a truss other than at a joint (cl. 508.3 a).' } },
    { title: 'Axes that miss', text: 'Let the centroidal axes miss the joint. The red joint now carries an eccentricity moment.',
      check: { q: 'If the centroidal axes at a joint do not meet at a single point, the flexural stresses are… (cl. 508.3)', options: ['taken as secondary stress', 'neglected', 'added to the dead load'], answer: 0, why: 'The resulting flexural stresses in the members should be taken into account as secondary stress (cl. 508.3).' } },
  ],
});

// ---------------------------------------------------------------- 2 · effective length, Table 9
const DG = Math.hypot(5, 6), T9D = { chord: [5, 5, 0], single: [DG, DG, DG], multi: [DG / 2, DG, DG] };   // illustrative truss: 5 m panels, 6 m deep
const DIRS = ['in', 'nb', 'nu'], MEMBER = { chord: 'Compression chord', single: 'Web member, single triangulated system', multi: 'Web member, multiple intersection system' };
const el = st => { const i = DIRS.indexOf(st.dir), row = TABLE9[st.mem][i]; if (!row) return null; const d = T9D[st.mem][i]; return { f: row[0], what: row[1], d, KL: row[0] * d * (st.bat ? 1.1 : 1) }; };
export const efflen = spread({
  river: true, init: { mem: 'chord', dir: 'in', bat: false },
  chips: [['mem', ['chord', 'single', 'multi'], v => ({ chord: 'Chord', single: 'Web · single system', multi: 'Web · multiple system' })[v]], ['dir', DIRS, v => ({ in: 'In the plane', nb: 'Normal · braced', nu: 'Normal · unbraced' })[v]], ['bat', [false, true], v => v ? 'Battened' : 'Not battened']],
  model({ holo, group, st }) {
    const tr = mk(); group.add(sit(tr.g));
    const M = { n: paint(), hi: paint(HI) }, xs = [];
    for (const s of [-1, 1]) for (let i = 1; i < NP - 1; i++) { const left = i < NP / 2; xs.push(node(i, left ? 0 : 1, s), node(i + 1, left ? 1 : 0, s)); }
    const cross = holo.segments(xs, holo.AMBER, .95, { width: .1 }); tr.span.add(cross);
    const tag = holo.label('', TAG); tag.position.set(0, 9.6, -5); group.add(tag);
    return {
      place() {
        const web = st.mem !== 'chord', r = el(st);
        tint(tr, k => (web ? k === 'diag' || k === 'vert' : k === 'top') ? M.hi : M.n); cross.visible = st.mem === 'multi';
        tag.userData.setText(r ? `KL = ${r.KL.toFixed(2)} m` : 'KL: see cl. 508.4.4');
      },
      debug: () => ({ KL: el(st)?.KL ?? null }),
    };
  },
  draw(c, W, H, st) {
    const r = el(st);
    head(c, 'EFFECTIVE LENGTH · cl. 508.4, Table 9');
    let y = lines(c, MEMBER[st.mem], 18, 56, W - 36, 21, INK, `700 17px ${F}`);
    y = lines(c, 'Buckling ' + ({ in: 'in the plane of the truss.', nb: 'normal to the plane of the truss, braced by a lateral system.', nu: 'normal to the plane of the truss, unbraced.' })[st.dir], 18, y + 2, W - 36, 19, DIMC, `500 14px ${F}`);
    if (r) {
      y = lines(c, `KL = ${r.f === 1 ? '' : r.f.toFixed(2) + ' × '}${r.what}`, 18, y + 6, W - 36, 19);
      c.fillStyle = OXIDE; c.font = `700 19px ${F}`; c.fillText(`KL = ${r.f.toFixed(2)} × ${r.d.toFixed(2)}${st.bat ? ' × 1.10' : ''} = ${r.KL.toFixed(2)} m`, 18, y + 14); y += 28;
    } else y = lines(c, 'See cl. 508.4.4: KL = span with no lateral support, or 2.5 ⁴√(E I a δ) with U frames. Turn the page.', 18, y + 6, W - 36, 19, OXIDE, `700 14.5px ${F}`);
    kv(c, W, [['KL/r, main members', 'not over 120'], ['KL/r, wind bracing, subsidiary members', 'not over 140']], y + 20, 25);
    foot(c, H, 'Panel 5.00 m, depth 6.00 m, diagonal 7.81 m (illustrative)');
  },
  steps: [
    { title: 'Chords', text: 'In a riveted, bolted or welded truss the joints hold the members a little, so they buckle over less than their full length.',
      check: { q: 'A chord buckling in the plane of the truss: KL = … (Table 9)', options: ['0.85 × distance between intersections with the web members', '1.0 × the span', '0.5 × the panel length'], answer: 0, why: 'Chords, in the plane of the truss: 0.85 × distance between centres of intersection with the web members (Table 9).' } },
    { title: 'Web members', text: 'Pick a web member, then change the direction of buckling. The factor depends on what holds the member.',
      check: { q: 'A web member of a single triangulated system, buckling in the plane of the truss: KL = …', options: ['0.70 × distance between intersections with the chords', '0.85 × that distance', '1.0 × that distance'], answer: 0, why: 'Single triangulated system: 0.70 × the distance between centres of intersection with the main chords in the plane; 0.85 × normal to it when braced; the full distance when unbraced (Table 9).' } },
    { title: 'Battens and slenderness', text: 'Switch on Battened. Then note the limits on slenderness at the foot of the card.',
      check: { q: 'For battened compression members, the values of Table 9 are… (cl. 508.4.1)', options: ['increased by 10 per cent', 'reduced by 10 per cent', 'doubled'], answer: 0, why: 'For battened compression members, all values given in Table 9 shall be increased by 10 per cent (cl. 508.4.1). KL/r shall not exceed 120 for main members and 140 for wind bracings and subsidiary members (cl. 508.5).' } },
  ],
});

// ---------------------------------------------------------------- 3 · unbraced compression chord, U frames
const UF = { I: 2e8, a: 5000, d1: 5000, d2: 5500, b: 3500 }, UR = 120, UFA = 100, USPAN = 40;   // illustrative; mm, mm⁴, MPa, m
const uf = st => { const u = uFrame({ ...UF, I1: st.I1 * 1e8, I2: st.I2 * 1e9 }); return { ...u, ...uFrameForce(u.KL, u.delta, UR, UFA) }; };
export const uframe = spread({
  init: { sys: 'u', I1: 1, I2: 2 },
  chips: [['sys', ['none', 'u', 'deck'], v => ({ none: 'No lateral support', u: 'U frames', deck: 'Continuous deck' })[v]], ['I2', [2, 8], v => `Cross girder I ${v} × 10⁹`]],
  slider: { key: 'I1', name: 'I1', label: 'stiffness · drag', values: [.5, 1, 2, 4, 8, 16, 32], at: [-10, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.15); group.add(g);
    const m = paint(), HV = 5, B = 3.4, YB = 1.95, girder = box(2 * B + .6, .7, .6, m, 0, 1.6, 0), low = box(2 * B - .6, .16, 3, SM.asphalt, 0, 2.05, 0), high = box(2 * B + 1.8, .3, 3, SM.concrete, 0, YB + HV + .7, 0);
    g.add(girder, low, high); for (const s of [-1, 1]) g.add(box(.9, 1.25, 2.4, SM.concrete, s * B, .625, 0));
    const posts = [-1, 1].map(s => { const col = new THREE.Group(); col.rotation.z = Math.PI / 2; col.position.set(s * B, YB + HV / 2, 0); g.add(col); return { col, s, bar: null }; });
    const chords = [-1, 1].map(s => { const q = box(.9, .9, 3, m, s * B, YB + HV + .1, 0); g.add(q); return q; }), fa = [-1, 1].map(() => { const a = arrow(0xc23b2f, .09); g.add(a); return a; });
    const tag = holo.label('', TAG); tag.position.set(0, 10.6, -5); group.add(tag);
    let r = uf(st), was = 0;
    return {
      place() {
        r = uf(st); const w = .22 + .07 * Math.log2(st.I1 * 2);
        if (w !== was) { was = w; for (const p of posts) { if (p.bar) { p.col.remove(p.bar); p.bar.geometry.dispose(); } p.bar = box(HV, w, .5, m, 0, 0, 0, 20); p.col.add(p.bar); } }
        girder.scale.y = st.I2 === 8 ? 1.6 : 1; high.visible = st.sys === 'deck'; low.visible = !high.visible; for (const a of fa) a.visible = st.sys === 'u';
        tag.userData.setText(st.sys === 'none' ? `KL = span = ${USPAN} m` : st.sys === 'deck' ? 'KL = 0: held along its whole length' : `KL = ${(r.KL / 1000).toFixed(2)} m`);
      },
      update(dt, t) {
        const A = st.sys === 'deck' ? 0 : st.sys === 'none' ? 1.3 : Math.min(1.1, .15 + r.delta * 300), o = A * Math.sin(t * 1.6);
        posts.forEach((p, i) => { bend(p.col, x => -p.s * o * (x / HV + .5) ** 2); chords[i].position.x = p.s * (B + o); fa[i].position.set(p.s * (B + o + .6), YB + HV + .1, 0); fa[i].userData.len(p.s * 1.3); });
      },
      debug: () => ({ delta: +(r.delta * 1000).toFixed(3), KL: +r.KL.toFixed(0), F: +(r.F / 1000).toFixed(1) }),
    };
  },
  draw(c, W, H, st) {
    const r = uf(st);
    head(c, 'UNBRACED COMPRESSION CHORD · cl. 508.4.4');
    if (st.sys !== 'u') {
      const y = lines(c, st.sys === 'none' ? 'a) No lateral support: no lateral bracing between the compression chords and no cross frames.'
        : 'c) A chord continuously supporting a reinforced concrete or steel deck is deemed effectively restrained laterally throughout its length, if friction or positive connection of the deck can resist a lateral force of 2.5 per cent of the maximum force in the chord, spread uniformly along it.', 18, 56, W - 36, 20);
      c.fillStyle = OXIDE; c.font = `700 22px ${F}`; c.fillText(st.sys === 'none' ? `KL = span = ${USPAN}.0 m` : 'KL = 0', 18, y + 22);
    } else {
      c.fillStyle = INK; c.font = `700 15px ${F}`; c.fillText('b) KL = 2.5 ⁴√( E I a δ ), not less than a', 18, 54);
      kv(c, W, [['δ = d1³ / 3EI1 + d2² b / EI2', `${(r.delta * 1000).toFixed(2)} mm per kN`], ['KL = a when δ ≤ a³ / 40EI', `${(r.stiff * 1000).toFixed(3)} mm per kN`], ['Effective length KL', `${(r.KL / 1000).toFixed(2)} m`, OXIDE],
        ['fcc = π² E / (KL/r)²', `${r.fcc.toFixed(0)} MPa`], ['F = 1.4 × 10⁻³ KL / δ (fcc/fa − 1.7)', r.F > 0 ? `${(r.F / 1000).toFixed(1)} kN` : 'fcc/fa ≤ 1.7', r.F > 0 ? INK : BAD]], 82, 27);
      lines(c, 'Illustrative: a 5 m, d1 5.0 m, d2 5.5 m, b 3.5 m, chord I 2 × 10⁸ mm⁴, r 120 mm, fa 100 MPa.', 18, 226, W - 36, 17, DIMC, `500 12.5px ${F}`);
    }
    foot(c, H, 'Simply supported trusses, ends held against torsion at the bearings');
  },
  steps: [
    { title: 'A chord with nothing above it', text: 'In a half-through bridge the top chords cannot be braced to each other. They are held only by the verticals and cross girders: the U frames.',
      check: { q: 'With no lateral bracing and no cross frames, the compression chord has KL = … (cl. 508.4.4 a)', options: ['the span', 'the panel length', 'half the span'], answer: 0, why: 'With no lateral support to the compression chord, KL = span (cl. 508.4.4 a).' } },
    { title: 'Stiffer frames', text: 'Pick U frames and drag the stiffness of the verticals. A stiffer frame moves less under a unit force (δ), and the chord buckles in shorter waves.',
      check: { q: 'With U frames, KL = 2.5 ⁴√(E I a δ), but not less than…', options: ['a, the distance between frames', 'the span', 'the depth of the truss'], answer: 0, why: 'KL = 2.5 ⁴√(E I a δ) but not less than a, the distance between frames; when δ is not greater than a³/40EI, KL = a (cl. 508.4.4 b).' } },
    { title: 'A deck on the chord', text: 'Pick Continuous deck. A deck fixed along the chord holds it everywhere.',
      check: { q: 'A deck restrains the chord if it can resist a lateral force of… (cl. 508.4.4 c)', options: ['2.5 per cent of the maximum chord force', '25 per cent of the chord force', 'the full wind load only'], answer: 0, why: 'The friction or positive connection of the deck must resist a lateral force, distributed uniformly along its length, of 2.5 per cent of the maximum force in the chord, in addition to other lateral forces (cl. 508.4.4 c).' } },
  ],
});

// ---------------------------------------------------------------- 4 · lug angles and pin holes
const pinReq = Fo => { const An = Fo * 1000 * GM1 / (.9 * FU[250]); return { An, across: 1.33 * An, t: Math.sqrt(1.33 * An / 16) }; };
export const joints = spread({
  init: { kind: 'angle', Fo: 200 },
  chips: [['kind', ['angle', 'channel', 'pin'], v => ({ angle: 'Lug angle · angle member', channel: 'Lug angle · channel', pin: 'Pin hole' })[v]]],
  slider: { key: 'Fo', name: 'F', label: 'force · drag', values: range(50, 500, 50), at: [-10, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.2); group.add(g);
    const m = paint(), ml = paint(0x2f8f55, .5, .2), parts = new THREE.Group(), a = arrow(0xc23b2f, .1); g.add(parts, a, box(1.2, 8, 1.4, SM.concrete, -7.4, 4, -1));
    const bz = (x, y, z) => { const b = cyl(.17, .3, SM.steel, x, y, z, 6); b.rotation.x = Math.PI / 2; return b; };
    const tag = holo.label('', TAG); tag.position.set(0, 10.2, -5); group.add(tag);
    return {
      place() {
        dispose(parts); parts.clear();
        if (st.kind === 'pin') {
          const p = cyl(.7, 1.6, SM.steel, -4.4, 4, 0, 24); p.rotation.x = Math.PI / 2;
          parts.add(box(9, 2.4, .25, m, 1.6, 4, 0), box(3.6, 3.8, .25, m, -4.4, 4, 0), box(3.2, 3.4, .14, ml, -4.4, 4, .2), p, box(2.6, .5, 1.2, SM.steel, -6, 4, -.6));
          tag.userData.setText(`across the pin hole ≥ ${pinReq(st.Fo).across.toFixed(0)} mm²`);
        } else {
          const ch = st.kind === 'channel', hh = ch ? 1.3 : 1;
          parts.add(box(5.2, 6.4, .22, SM.steel, -4.2, 4, -.22), box(11, 2 * hh, .2, m, 1, 4, 0));
          for (const s of ch ? [1, -1] : [1]) {
            const y = 4 + s * hh;
            parts.add(box(11, .2, 1.6, m, 1, y - s * .1, .8), box(3, .18, 1.5, ml, -4.6, y + s * .09, .85), box(3, 1.5, .18, ml, -4.6, y + s * .75, .1));
            for (const x of [-5.3, -3.9]) { parts.add(bz(x, y + s * .9, .28), cyl(.17, .3, SM.steel, x, y + s * .22, 1.15, 6)); }
          }
          for (const x of [-5.8, -4.6, -3.4]) parts.add(bz(x, 4, .2));
          tag.userData.setText(`lug angle ≥ ${((ch ? 1.1 : 1.2) * st.Fo).toFixed(0)} kN · its attachment ≥ ${((ch ? 1.2 : 1.4) * st.Fo).toFixed(0)} kN`);
        }
        a.position.set(6.8, 4, 0); a.userData.len(.8 + st.Fo / 250);
      },
    };
  },
  draw(c, W, H, st) {
    if (st.kind === 'pin') {
      const r = pinReq(st.Fo);
      head(c, 'PIN HOLES AND PIN PLATES · cl. 508.8, 508.9');
      kv(c, W, [[`Net section for ${st.Fo} kN (0.9 An fu / γm1)`, `${r.An.toFixed(0)} mm²`], ['Beyond the pin hole, along the axis', `≥ ${r.An.toFixed(0)} mm²`], ['Through the pin hole, across the axis', `≥ 1.33 × = ${r.across.toFixed(0)} mm²`, OXIDE],
        ['Net width ÷ thickness, plain edges', 'not over 16'], ['So the thickness is at least', `${r.t.toFixed(1)} mm`], ['Pin plate, pin centre to its end', '≥ its width']], 58, 28);
      lines(c, 'Pin plates make up the bearing or cross-sectional area, and spread the pin’s pressure evenly over the member (508.9).', 18, 230, W - 36, 18, DIMC, `500 13px ${F}`);
      foot(c, H, 'Pin-connected tension members are generally used for erection · E 250');
      return;
    }
    const ch = st.kind === 'channel', k1 = ch ? 1.1 : 1.2, k2 = ch ? 1.2 : 1.4;
    head(c, 'LUG ANGLES · cl. 508.7');
    kv(c, W, [[ch ? 'Force not taken by the direct connection' : 'Force in the outstanding leg', `${st.Fo} kN`], ['Lug angle, and lug angle to gusset', `≥ ${k1.toFixed(2)} × = ${(k1 * st.Fo).toFixed(0)} kN`, OXIDE], ['Lug angle to the member', `≥ ${k2.toFixed(2)} × = ${(k2 * st.Fo).toFixed(0)} kN`, OXIDE],
      ['Bolts or rivets, lug angle to gusset', 'not less than 2']], 58, 28);
    lines(c, (ch ? 'Lug angles on a channel are placed symmetrically about the section as far as possible (508.7.1). ' : '') + 'The lug angle should end at the end of the member, and its fastening to the member should start ahead of the member’s own connection to the gusset (508.7.5).', 18, 178, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, ch ? 'Channel: 10 % and 20 % in excess (508.7.3)' : 'Angle: 20 % and 40 % in excess (508.7.2)');
  },
  steps: [
    { title: 'A lug angle', text: 'The green lug angle picks up the outstanding leg, so the connection can be shorter. Drag the force.',
      check: { q: 'On an angle member, the lug angle and its connection to the gusset develop… (cl. 508.7.2)', options: ['20 % more than the force in the outstanding leg', 'exactly that force', '5 % more'], answer: 0, why: 'Not less than 20 per cent in excess of the force in the outstanding leg; the attachment of the lug angle to the angle member, 40 per cent in excess (cl. 508.7.2).' } },
    { title: 'On a channel', text: 'Pick the channel. Two lug angles, one on each flange, and smaller margins.',
      check: { q: 'On a channel, the lug angles develop… (cl. 508.7.3)', options: ['10 % more than the force not taken directly', '40 % more', '2.5 % more'], answer: 0, why: 'Not less than 10 per cent in excess of the force not accounted for by the direct connection of the member; their attachment to the member, 20 per cent in excess (cl. 508.7.3).' } },
    { title: 'Pin holes', text: 'Pick Pin hole. The metal beside the hole must be more than the member itself needs.',
      check: { q: 'The net section through the pin hole, across the axis, is at least… (cl. 508.8)', options: ['33 % greater than the required net section', 'equal to it', '5 % greater'], answer: 0, why: 'The net section through the pin hole transverse to the axis shall be at least 33 per cent greater than the required net section; beyond the pin hole, not less than it (cl. 508.8).' } },
  ],
});

// ---------------------------------------------------------------- 5 · bracing
const PLL = 40;   // illustrative panel lateral load, kN
export const bracing = spread({
  river: true, init: { sys: 'lateral', C: 2000 },
  chips: [['sys', ['lateral', 'portal', 'sway'], v => ({ lateral: 'Top lateral bracing', portal: 'Portal bracing', sway: 'Sway bracing' })[v]]],
  slider: { key: 'C', name: 'C', label: 'chord force · drag', values: range(500, 5000, 500) },
  model({ holo, group, st }) {
    const tr = mk(); group.add(sit(tr.g));
    const S = { lateral: [], portal: [], sway: [] };
    for (let i = 1; i < NP - 1; i++) S.lateral.push(node(i, 1, -1), node(i + 1, 1, 1), node(i, 1, 1), node(i + 1, 1, -1));
    for (const e of [-1, 1]) { const q = f => [e * (LP / 2 - f * PAN), f * HT], [x1, y1] = q(.55), [x2, y2] = q(1); S.portal.push([x1, y1, -W2], [x2, y2, W2], [x1, y1, W2], [x2, y2, -W2], [x1, y1, -W2], [x1, y1, W2]); }
    for (let i = 2; i < NP - 1; i++) { const x = i * PAN - LP / 2; S.sway.push([x, HT, -W2], [x, HT * .55, W2], [x, HT, W2], [x, HT * .55, -W2], [x, HT * .55, -W2], [x, HT * .55, W2]); }
    const Ln = {}; for (const k in S) { Ln[k] = [holo.segments(S[k], holo.RED, .95, { width: .2 }), holo.segments(S[k], holo.DIM, .8, { width: .05 })]; tr.span.add(...Ln[k]); }
    const tk = truck(.3); tk.position.set(-2, tr.top, 0); tr.g.add(tk);
    const tag = holo.label('', TAG); tag.position.set(0, 9.6, -5); group.add(tag);
    const V = () => st.sys === 'lateral' ? .025 * 2 * st.C : st.sys === 'portal' ? .0125 * 2 * st.C : .5 * PLL;
    return {
      place() { for (const k in Ln) { Ln[k][0].visible = st.sys === k; Ln[k][1].visible = st.sys !== k; } tag.userData.setText(`design shear ${V().toFixed(1)} kN`); },
      debug: () => ({ V: V() }),
    };
  },
  draw(c, W, H, st) {
    head(c, 'BRACING · cl. 508.11');
    const T = 2 * st.C;
    const [rows, text] = st.sys === 'lateral' ? [[['Compressive force in each chord', `${st.C} kN`], ['Total in both chords', `${T} kN`], ['Transverse shear, 2.5 %', `${(.025 * T).toFixed(1)} kN`, OXIDE]],
        'Lateral bracing between the compression chords resists this shear at any section, in addition to wind and centrifugal forces (508.11.4). The system runs from end to end and takes wind, seismic and centrifugal forces to the bearings (508.11.1).']
      : st.sys === 'portal' ? [[['Compressive force, each end post', `${st.C} kN`], ['Total, end posts or end top chords', `${T} kN`], ['Lateral shear, 1.25 %', `${(.0125 * T).toFixed(1)} kN`, OXIDE]],
        'A through span has a portal system as deep as the clearance allows. It takes the full end reaction of the top chord lateral system, and the end posts carry it to the bearings (508.11.6).']
      : [[['Panel lateral load (illustrative)', `${PLL} kN`], ['Sway bracing carries at least 50 %', `${(.5 * PLL).toFixed(0)} kN`, OXIDE]],
        'Sway bracing between the vertical web members takes its share to the chord on the bearings. The verticals resist the bending that results, and the lateral and portal systems get no relief from it (508.11.5).'];
    const y = kv(c, W, rows, 60, 29);
    lines(c, text, 18, y + 6, W - 36, 19, INK, `500 14px ${F}`);
    foot(c, H, st.sys === 'portal' ? 'The greater of the end posts and the top chords in the end panel' : 'A rigid deck may replace the bracing system (508.11.1)');
  },
  steps: [
    { title: 'Lateral bracing', text: 'The red crosses between the top chords are the lateral bracing. It keeps the chords in line and carries wind to the ends. Drag the chord force.',
      check: { q: 'Lateral bracing between compression chords resists a transverse shear of… (cl. 508.11.4)', options: ['2.5 % of the total compressive force in both chords', '25 % of that force', '0.25 % of that force'], answer: 0, why: 'A transverse shear at any section equal to 2.5 per cent of the total compressive force carried by both the chords, in addition to wind and centrifugal forces (cl. 508.11.4).' } },
    { title: 'Portals', text: 'Pick Portal bracing: the frames in the planes of the end posts. They bring the top lateral system down to the bearings.',
      check: { q: 'A portal system also resists a lateral shear of… (cl. 508.11.6)', options: ['1.25 % of the compressive force in the end posts or end top chords', '2.5 % of the dead load', '50 % of the wind load'], answer: 0, why: '1.25 per cent of the total compressive force in the end posts or in the top chords in the end panel, whichever is greater (cl. 508.11.6).' } },
    { title: 'Sway bracing', text: 'Pick Sway bracing: cross frames between the verticals, above the traffic.',
      check: { q: 'Sway bracing is proportioned for at least… (cl. 508.11.5)', options: ['50 % of the panel lateral load', '100 % of the panel lateral load', '2.5 % of the chord force'], answer: 0, why: 'Sway bracings transmit at least 50 per cent of the panel lateral load to the chord supported on bearings, through the web members (cl. 508.11.5).' } },
  ],
});

// ---------------------------------------------------------------- 6 · the camber diagram, Annex B
const MEM = { bottom: ['Bottom chord', 5000, 1], top: ['Top chord', 5000, -1], diag: ['Diagonal', 7810, 1], vert: ['Vertical', 6000, -1] };   // name, nominal length mm, +1 tension under load
const cam = st => { const [name, L, sg] = MEM[st.mem], dl = sg * st.s * L / E, kl = (st.span === 'through' ? 1 : -1) * st.sc / E * L, tot = -dl + kl; return { name, L, sg, dl, kl, tot, len: Math.round((L + tot) * 2) / 2 }; };
const mm = v => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)} mm`;
export const camber = spread({
  river: true, init: { mem: 'diag', span: 'through', s: 90, sc: 80 },
  chips: [['mem', ['bottom', 'top', 'diag', 'vert'], v => MEM[v][0]], ['span', ['through', 'deck'], v => v === 'through' ? 'Through span' : 'Deck span'], ['sc', [60, 80, 100], v => `Loaded chord ${v} MPa`]],
  slider: { key: 's', name: 'Stress', label: 'member stress · drag', values: range(20, 160, 10) },
  model({ holo, group, st }) {
    const tr = mk(); group.add(sit(tr.g)); tr.pose(x => .45 * (1 - (2 * x / LP) ** 2));
    const M = { n: paint(), hi: paint(HI) }, tag = holo.label('', TAG); tag.position.set(0, 10, -5); group.add(tag);
    return {
      place() { const r = cam(st); tint(tr, k => k === st.mem ? M.hi : M.n); tag.userData.setText(`make it ${r.len.toFixed(1)} mm: ${mm(r.len - r.L)}`); },
      debug: () => { const r = cam(st); return { dl: +r.dl.toFixed(3), kl: +r.kl.toFixed(3), len: r.len }; },
    };
  },
  draw(c, W, H, st) {
    const r = cam(st);
    head(c, 'CAMBER DIAGRAM · Annex B');
    const y = kv(c, W, [[`${r.name}: nominal length`, `${r.L} mm`], [`Under load: ${r.sg > 0 ? 'tension' : 'compression'} ${st.s} MPa`, mm(r.dl)], ['Stress camber change, opposite sign (B1.2)', mm(-r.dl)],
      [`K × L, ${st.span} span (B1.4)`, mm(r.kl)], ['Camber length, nearest 0.5 mm (B1.6)', `${r.len.toFixed(1)} mm`, OXIDE]], 60, 29);
    lines(c, 'K is the loaded chord’s extension or contraction ÷ its length. Adding K × L to every member keeps the floor system at its nominal length.', 18, y + 6, W - 36, 18, DIMC, `500 13px ${F}`);
    foot(c, H, 'Load: dead load + 75 % live load, no impact (B1.1)');
  },
  steps: [
    { title: 'Longer or shorter', text: 'Each member is made a little longer or shorter than its nominal length, so that under load the girder takes its true outline. Drag the stress.',
      check: { q: 'The stress camber change in a member is… (Annex B, B1.2)', options: ['its change of length under the load, with opposite sign', 'twice its change of length', 'the same for every member'], answer: 0, why: 'The stress camber change in each member equals the change of length of the member under full dead load and 75 per cent live load without impact, but of opposite sign (B1.1, B1.2).' } },
    { title: 'The factor K', text: 'Switch between a through span and a deck span. A further change K × L is made in every member.',
      check: { q: 'In a through span, the further change K × L is… (B1.4)', options: ['an increase in the length of all members', 'a decrease in all members', 'applied to chords only'], answer: 0, why: 'In through spans this change is an increase in the lengths of all members; in deck spans a decrease (B1.4). It leaves the loaded chord, and so the floor system, at its nominal length (B1.5).' } },
    { title: 'Half a millimetre', text: 'The lengths on the camber diagram are what the workshop makes.',
      check: { q: 'Nominal and camber lengths are rounded off to the nearest… (B1.6)', options: ['half a millimetre', 'five millimetres', 'tenth of a millimetre'], answer: 0, why: 'The nominal lengths and camber lengths shall be rounded off to the nearest half a millimetre (B1.6).' } },
  ],
});
