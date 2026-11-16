// Spreads 5–8 · standing up and taking shape.
//   overturn  (cl. 503.5.1, 504.3)     wind tips a narrow bridge; 0.9 on the dead load that resists; spacing ≥ span / 20
//   classes   (cl. 503.7, Table 2)     an I-section whose flange and web are classed plastic to slender as you resize them
//   depth     (cl. 504.1–504.5)        depth and deflection limits on a plate girder and a truss
//   camber    (cl. 504.6–504.7)        a truss settling from its camber to the true shape; minimum plate thickness
import * as THREE from 'three';
import { tween } from '@engine/anim.js';
import { SM } from '@engine/scene.js';
import { spread, sit, girderBridge, truss, truck, arrow, box, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD } from '../../_irc24/kit.js';
import { classify, eps, LIMITS, CLASS, DEFL, minDepth, minSpacing, minThickness, overturning } from '../../_irc24/steel.js';

const Z = -4.5, TAG = { h: .7, color: INK, bg: 'rgba(255,253,248,.92)', weight: 700 };

// ---------------------------------------------------------------- 5 · stability against overturning
const SPAN = 40, GK = 60, HW = 2.5, GF = 1.5;   // illustrative: span m, dead load kN/m, wind lever arm m, load factor (the real ones come from IRC : 6)
const ot = st => overturning({ Gk: GK, W: st.W, h: HW, s: SPAN / st.r, gf: GF });
export const overturn = spread({
  init: { r: 20, W: 12, live: false },
  chips: [['r', [30, 20, 15], v => `Spacing L/${v}`], ['W', [6, 12, 18], v => ({ 6: 'Light wind', 12: 'Design wind', 18: 'Storm' })[v]], ['live', [false, true], v => v ? 'Truck on' : 'No traffic']],
  model({ holo, group: page, st }) {
    const group = new THREE.Group(); group.scale.setScalar(1.45); group.position.set(0, -.225, 1.5); page.add(group);   // the whole model enlarged about the slab top
    group.add(box(10, 1.6, 4.4, SM.concrete, 0, 1.3, Z));   // the pier cap, top at 2.1
    const pivot = new THREE.Group(); pivot.position.set(0, 2.1, Z); group.add(pivot);
    const wind = arrow(0xc23b2f, .1), wt = arrow(0x2f8f55, .1); wt.rotation.z = -Math.PI / 2; group.add(wind, wt);
    const lw = holo.label('wind', { h: .6, color: BAD }), lg = holo.label('0.9 × dead load', { h: .6, color: OK }), tag = holo.label('', TAG); group.add(lw, lg, tag);
    let b = null, tk = null, tip = 0;
    return {
      place() {
        if (b) { pivot.remove(b.g); dispose(b.g); }
        const gap = SPAN / st.r * 1.9;   // 1.9 cm per metre
        b = girderBridge({ L: 4.2, d: 1.6, n: 2, gap, H: 0, bf: .7, seg: 2, abut: false }); b.g.rotation.y = Math.PI / 2; b.g.position.x = -gap / 2; pivot.add(b.g); pivot.position.x = gap / 2;
        tk = truck(.34); tk.position.set(0, b.top, 0); tk.visible = st.live; b.g.add(tk);
        wind.position.set(-gap / 2 - 4.6, 2.1 + 1.5, Z + 2.3); wind.userData.len(st.W / 6); lw.position.set(-gap / 2 - 4, 4.4, Z + 2.3);
        wt.position.set(0, 7.6, Z + 2.3); wt.userData.len(1.8); lg.position.set(0, 8.2, Z + 2.3); tag.position.set(0, 9.4, Z);
        tag.userData.setText(ot(st).ok ? 'stable' : 'overturns');
      },
      update(dt) { const to = ot(st).ok ? 0 : .42; tip += (to - tip) * Math.min(1, dt * 3); pivot.rotation.z = -tip; },
      debug: () => { const r = ot(st); return { Mo: r.Mo, Mr: +r.Mr.toFixed(1), ok: r.ok }; },
    };
  },
  draw(c, W, H, st) {
    const r = ot(st), s = SPAN / st.r, okS = s >= minSpacing(SPAN) - 1e-9;
    head(c, 'OVERTURNING · cl. 503.5.1, 504.3');
    const y = kv(c, W, [['Girder spacing on a 40 m span', `${s.toFixed(2)} m ${okS ? '✓' : '✗'} L/20 = 2.00`, okS ? OK : BAD], ['Overturning  γf × W × h', `${GF} × ${st.W} × ${HW} = ${r.Mo.toFixed(1)}`], ['Resisting  0.9 × G × s/2', `0.9 × ${GK} × ${(s / 2).toFixed(2)} = ${r.Mr.toFixed(1)}`]], 60, 30);
    c.fillStyle = r.ok ? OK : BAD; c.font = `700 17px ${F}`; c.fillText(r.ok ? '✓ Resisting ≥ overturning: stable' : '✗ Overturning is larger: unstable', 18, y + 14);
    lines(c, st.live ? 'The truck’s weight would help, but variable loads that resist are disregarded (cl. 503.5.1 c).' : 'Permanent loads that resist are multiplied by 0.9; the loads that overturn take their full factors (cl. 503.5.1).', 18, y + 42, W - 36, 19, DIMC, `500 13.5px ${F}`);
    foot(c, H, 'G, W, h, γf illustrative (kN, m per metre run); real values from IRC : 6');
  },
  steps: [
    { title: 'Tipping', text: 'Wind pushes the span sideways; its weight holds it down. The span tips about the far bearing.',
      check: { q: 'Permanent loads that resist overturning are multiplied by… (cl. 503.5.1)', options: ['0.9', '1.0', '1.5'], answer: 0, why: 'The permanent loads and effects contributing to resistance shall be multiplied by a partial safety factor of 0.9 (cl. 503.5.1 c).' } },
    { title: 'Traffic does not count', text: 'Put the truck on. Its weight steadies the span, yet the check ignores it.',
      check: { q: 'Variable loads that add to the resistance are… (cl. 503.5.1)', options: ['disregarded', 'counted in full', 'counted at 0.9'], answer: 0, why: 'Variable loads and their effects contributing to resistance shall be disregarded (cl. 503.5.1 c).' } },
    { title: 'Spacing', text: 'Bring the girders closer, then raise the wind. A narrow bridge overturns sooner.',
      check: { q: 'The distance between centres of main girders shall not be less than… (cl. 504.3)', options: ['1/20 of the span', '1/10 of the span', '1/25 of the span'], answer: 0, why: 'It shall be sufficient to resist overturning or overstressing due to lateral forces, and not less than 1/20 of the span (cl. 504.3).' } },
  ],
});

// ---------------------------------------------------------------- 6 · classification of cross-sections
const K = .0095, HEX = [0, 0x2f8f55, 0x1d5f87, 0xb0732a, 0xc23b2f], CSS = ['', '#1f7a45', '#1d5f87', '#9a6220', '#b3362b'];
const CAN = ['', 'Can form a plastic hinge and keep rotating: a plastic mechanism can develop.', 'Reaches the plastic moment, but local buckling limits the rotation after that.',
  'The extreme fibre reaches yield; local buckling stops it before the plastic moment.', 'Buckles locally before yield. A slender compression element is outside the scope of the Code.'];
export const classes = spread({
  init: { welded: true, fy: 250, bf: 400, tf: 25, d: 1200, tw: 12 },
  chips: [['welded', [false, true], v => v ? 'Welded' : 'Rolled'], ['fy', [250, 350, 450], v => `fy ${v}`], ['tf', [16, 25, 40], v => `tf ${v}`], ['d', [800, 1200, 1600], v => `web ${v}`], ['tw', [8, 12, 16], v => `tw ${v}`]],
  slider: { key: 'bf', name: 'Flange', label: 'flange width · drag', values: [200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700], at: [-7.5, .5, -1] },
  model({ holo, group, st }) {
    const stand = new THREE.Group(); stand.position.set(0, 1, -3.5); stand.rotation.x = -.3; group.add(stand);
    const mk = () => { const m = new THREE.Mesh(new THREE.BufferGeometry(), paint()); m.castShadow = true; stand.add(m); return m; };
    const top = mk(), web = mk(), bot = mk(), lf = holo.label('', TAG), lw = holo.label('', TAG); stand.add(lf, lw);
    const set = (m, w, h, y) => { m.geometry.dispose(); m.geometry = new THREE.BoxGeometry(w, h, 5.5, 10, 6, 18); m.position.y = y; m.userData.b = m.geometry.attributes.position.array.slice(); m.userData.wh = [w, h]; };
    const wave = (m, A, flange, t) => {
      const b = m.userData.b, p = m.geometry.attributes.position, [w, h] = m.userData.wh;
      for (let i = 0; i < p.count; i++) { const x = b[i * 3], y = b[i * 3 + 1], s = A * Math.sin(b[i * 3 + 2] * 2.4 + t * 2.5); if (flange) p.setY(i, y + s * Math.abs(x) / (w / 2)); else p.setX(i, x + s * Math.cos(Math.PI * y / h)); }
      p.needsUpdate = true; m.geometry.computeVertexNormals();
    };
    let r = null;
    return {
      place() {
        r = classify(st); const d = st.d * K, tf = st.tf * K, bf = st.bf * K;
        set(bot, bf, tf, tf / 2); set(web, st.tw * K, d, tf + d / 2); set(top, bf, tf, tf + d + tf / 2);
        top.material.color.setHex(HEX[r.cf]); web.material.color.setHex(HEX[r.cw]);
        lf.position.set(0, 2 * tf + d + 1, 0); lf.userData.setText(`compression flange b/tf ${r.rf.toFixed(1)} · ${CLASS[r.cf]}`);
        lw.position.set(bf / 2 + 3.6, tf + d / 2, 2.8); lw.userData.setText(`web d/tw ${r.rw.toFixed(0)} · ${CLASS[r.cw]}`);
      },
      update(dt, t) { if (r.cf === 4) wave(top, .13, true, t); if (r.cw === 4) wave(web, .13, false, t); },
      debug: () => ({ rf: +r.rf.toFixed(2), rw: +r.rw.toFixed(1), cf: r.cf, cw: r.cw, cls: r.cls }),
    };
  },
  draw(c, W, H, st) {
    const r = classify(st), e = eps(st.fy), x = 18, w = W - 36;
    const bar = (y, title, ratio, lim) => {
      const max = lim[2] * e * 1.35, X = v => x + Math.min(1, v / max) * w, ed = [0, lim[0] * e, lim[1] * e, lim[2] * e, max];
      c.fillStyle = INK; c.font = `600 13.5px ${F}`; c.fillText(title, x, y - 7);
      for (let i = 0; i < 4; i++) { c.globalAlpha = .8; c.fillStyle = CSS[i + 1]; c.fillRect(X(ed[i]), y, X(ed[i + 1]) - X(ed[i]), 13); } c.globalAlpha = 1;
      c.fillStyle = INK; c.fillRect(X(ratio) - 1.5, y - 4, 3, 21);
      c.fillStyle = DIMC; c.font = `500 11px ${F}`; for (let i = 1; i < 4; i++) c.fillText(ed[i].toFixed(1), X(ed[i]) - 10, y + 26);
    };
    head(c, 'CLASS OF CROSS-SECTION · Table 2');
    c.fillStyle = DIMC; c.font = `500 13px ${F}`; c.fillText(`ε = √(250 / fy) = ${e.toFixed(3)} · limits below are × ε`, x, 50);
    bar(80, `Flange outstand b/tf = ${r.b.toFixed(0)} / ${st.tf} = ${r.rf.toFixed(1)}  (${st.welded ? 'welded' : 'rolled'})`, r.rf, st.welded ? LIMITS.welded : LIMITS.rolled);
    bar(140, `Web d/tw = ${st.d} / ${st.tw} = ${r.rw.toFixed(0)}  (neutral axis at mid-depth)`, r.rw, LIMITS.web);
    c.fillStyle = CSS[r.cls]; c.font = `700 19px ${F}`; c.fillText(`Class ${r.cls} · ${CLASS[r.cls]}`, x, 198);
    lines(c, CAN[r.cls], x, 222, w, 19, INK, `500 14px ${F}`);
    foot(c, H, r.shearCheck ? `d/tw > 67ε = ${(67 * e).toFixed(0)}: check the web for shear buckling (509.4.2)` : 'The section takes the class of its worst element (Table 2, note 4)', r.shearCheck ? OXIDE : DIMC);
  },
  steps: [
    { title: 'Four classes', text: 'A thin plate in compression buckles locally. Table 2 sorts each element by its width to thickness ratio.',
      check: { q: 'A plastic (Class 1) section can… (cl. 503.7.2)', options: ['form plastic hinges and rotate', 'only reach yield at the fibre', 'buckle before yield'], answer: 0, why: 'Plastic cross-sections can develop plastic hinges and have the rotation capacity required for failure of the structure by formation of a plastic mechanism (cl. 503.7.2).' } },
    { title: 'The flange', text: 'Drag the flange wider: the outstand b/tf climbs through compact and semi-compact to slender. A thicker flange brings it back.',
      check: { q: 'Welded section, fy 250: the plastic limit for a compression flange outstand is b/tf ≤ …', options: ['8.4', '9.4', '13.6'], answer: 0, why: 'Outstanding element of a compression flange, welded section: 8.4ε, 9.4ε, 13.6ε for Class 1, 2, 3. Rolled: 9.4ε, 10.5ε, 15.7ε (Table 2).' } },
    { title: 'Stronger steel', text: 'Raise fy. The limits shrink with ε = √(250/fy), so the same plate drops a class.',
      check: { q: 'With different classes in flange and web, the section is…', options: ['the least favourable class', 'the flange’s class', 'the average'], answer: 0, why: 'Different elements can be of different classes; the section is classified on the least favourable one (Table 2, note 4; cl. 503.7.2).' } },
  ],
});

// ---------------------------------------------------------------- 7 · span, depth and deflection
const LP = 17;
export const depth = spread({
  river: true, init: { kind: 'girder', L: 40, r: 20, n: 1000 },
  chips: [['kind', ['girder', 'truss'], v => v === 'truss' ? 'Truss' : 'Plate girder'], ['L', [20, 30, 40, 60], v => `${v} m`], ['r', [8, 10, 15, 20, 25, 30], v => `Depth L/${v}`]],
  slider: { key: 'n', name: 'δ', label: 'deflection · drag', values: [2000, 1200, 1000, 800, 700, 600, 500, 400, 300] },
  model({ holo, group, st }) {
    const tag = holo.label('', TAG); tag.position.set(0, 1.4, 1.2); group.add(tag);
    const ref = holo.polyline([[-LP / 2, 0, 0], [LP / 2, 0, 0]], holo.DIM, { width: .05, dashed: true }); ref.scale.setScalar(1.18); group.add(ref);
    let cur = null;
    return {
      place() {
        if (cur) { group.remove(cur.g); dispose(cur.g); }
        const d = LP / st.r, f = x => -LP / st.n * 45 * (1 - (2 * x / LP) ** 2);   // sag drawn 45 × true
        cur = st.kind === 'truss' ? truss({ L: LP, h: d, H: 2.6 }) : girderBridge({ L: LP, d, H: 2.6 });
        group.add(sit(cur.g));
        if (st.kind === 'truss') cur.pose(f); else cur.bend(f);
        const tk = truck(.3); tk.position.set(0, cur.top + f(0), 0); cur.g.add(tk);
        ref.position.set(0, cur.top * 1.18, -5 + 1.18 * (st.kind === 'truss' ? 1.4 : cur.w / 2 + .1));
        tag.userData.setText(`δ = L/${st.n} = ${(st.L * 1000 / st.n).toFixed(1)} mm`);
      },
      debug: () => ({ dmm: +(st.L * 1000 / st.n).toFixed(2), depth: +(st.L / st.r).toFixed(2) }),
    };
  },
  draw(c, W, H, st) {
    const tr = st.kind === 'truss', dp = st.L / st.r, dm = minDepth(st.L, tr), d = st.L * 1000 / st.n, okD = dp >= dm - 1e-9, lt = st.L * 1000 / DEFL.total, ll = st.L * 1000 / DEFL.live;
    head(c, 'PROPORTIONS · cl. 504.3 to 504.5');
    kv(c, W, [['Depth provided', `L/${st.r} = ${dp.toFixed(2)} m`], [`Minimum depth, ${tr ? 'trusses L/10' : 'plate girders L/25'}`, `${dm.toFixed(2)} m ${okD ? '✓' : '✗'}`, okD ? OK : BAD], ['Girder spacing, at least L/20', `${minSpacing(st.L).toFixed(2)} m`],
      ['Deflection shown', `L/${st.n} = ${d.toFixed(1)} mm`], ['As total load: limit L/600', `${lt.toFixed(1)} mm ${d <= lt + 1e-9 ? '✓' : '✗'}`, d <= lt + 1e-9 ? OK : BAD], ['As live load + impact: limit L/800', `${ll.toFixed(1)} mm ${d <= ll + 1e-9 ? '✓' : '✗'}`, d <= ll + 1e-9 ? OK : BAD]], 58, 28);
    lines(c, 'Elastic analysis, load factor 1.0, gross moment of inertia (504.5, 504.5.5). Cantilever tip: L/300 total, L/400 live load + impact.', 18, 238, W - 36, 18, DIMC, `500 12.5px ${F}`);
    foot(c, H, 'L/600 need not apply if precamber takes up the dead loads (504.5.1)');
  },
  steps: [
    { title: 'Depth', text: 'Pick a shallower depth. A plate girder should preferably be at least L/25 deep, a truss L/10.',
      check: { q: 'Minimum depth of a plate girder, preferably (cl. 504.4)?', options: ['1/25 of the effective span', '1/10 of the effective span', '1/40 of the effective span'], answer: 0, why: 'Trusses: 1/10 of the effective span. Rolled steel joists and plate girders: 1/25 of the effective span (cl. 504.4).' } },
    { title: 'Deflection', text: 'Drag the deflection lever. The card tests the sag against both limits.',
      check: { q: 'Deflection due to live load and impact shall not exceed… (cl. 504.5.1)', options: ['1/800 of the span', '1/600 of the span', '1/300 of the span'], answer: 0, why: 'Total deflection (dead load, live load and impact): 1/600 of the span. Live load and impact alone: 1/800 of the span (cl. 504.5.1).' } },
    { title: 'Span and truss', text: 'Switch to the truss, then change the span: every limit moves with L.',
      check: { q: 'Effective span of a main girder (cl. 504.1)?', options: ['between centres of bearings', 'the clear opening', 'the overall length'], answer: 0, why: 'Main girders: the distance between the centres of bearings. Cross girders: between centres of main girders. Stringers: between centres of cross girders (cl. 504.1).' } },
  ],
});

// ---------------------------------------------------------------- 8 · camber and minimum sections
const SHAPE = { none: [.6, 'Unloaded: the girder stands in its camber.'], dead: [.26, 'Dead load on: part of the camber is taken up.'], dl75: [0, 'Dead load + 75 % of live load, no impact: the true geometrical shape assumed in design (504.6.2 b).'], full: [-.13, 'Full live load and impact: just below the true shape.'] };
const COND = { both: 'Both sides can be painted', oneSide: 'One side cannot be reached', sealed: 'Box member, sealed inside' };
export const camber = spread({
  river: true, init: { load: 'none', cond: 'both', calc: 8 },
  chips: [['load', ['none', 'dead', 'dl75', 'full'], v => ({ none: 'Unloaded', dead: 'Dead load', dl75: 'DL + 75 % LL', full: 'DL + LL + impact' })[v]], ['cond', ['both', 'oneSide', 'sealed'], v => ({ both: 'Both sides open', oneSide: 'One side hidden', sealed: 'Sealed box' })[v]]],
  slider: { key: 'calc', name: 't', label: 'thickness · drag', values: [4, 6, 8, 9, 10, 11, 12, 12.5, 14, 16], at: [-1.5, .5, -1] },
  model({ holo, group, st, anims }) {
    const tr = truss({ L: LP, h: 2.8, H: 2.4 }); group.add(sit(tr.g, -6.5));
    group.add(holo.polyline([[-LP / 2 * 1.18, 2.98, -4.8], [LP / 2 * 1.18, 2.98, -4.8]], holo.DIM, { width: .05, dashed: true }));   // the nominal outline of the bottom chord
    const tk = truck(.3); tr.g.add(tk);
    const plate = new THREE.Group(); plate.position.set(-7, .5, 1); group.add(plate);
    const p1 = box(4.4, 1, 2.6, paint(), 0, .5, 0), p2 = box(4.4, 1, 2.6, paint(0xd08a2e, .5, .2), 0, 0, 0), tag = holo.label('', TAG); plate.add(p1, p2, tag);
    const cc = { v: SHAPE.none[0] }; let was = '';
    return {
      place() {
        if (was !== st.load) { was = st.load; anims.stop('camber'); tween(anims, cc, 'v', SHAPE[st.load][0], .9, { tag: 'camber' }); }
        tk.visible = st.load === 'dl75' || st.load === 'full';
        const t = minThickness(st.cond, st.calc), a = st.calc * .12, e = (t - st.calc) * .12;   // 1 mm drawn 1.2 mm thick
        p1.scale.y = a; p1.position.y = a / 2; p2.visible = e > 1e-6; p2.scale.y = Math.max(.001, e); p2.position.y = a + e / 2;
        tag.position.set(0, a + e + .8, 0); tag.userData.setText(`provide ${t} mm`);
      },
      update() { const f = x => cc.v * (1 - (2 * x / LP) ** 2); tr.pose(f); tk.position.set(0, tr.top + f(0), 0); },
      debug: () => ({ t: minThickness(st.cond, st.calc), camber: +cc.v.toFixed(2) }),
    };
  },
  draw(c, W, H, st) {
    const t = minThickness(st.cond, st.calc), add = t > st.calc;
    head(c, 'CAMBER · MINIMUM SECTIONS · cl. 504.6, 504.7');
    const y = lines(c, SHAPE[st.load][1], 18, 54, W - 36, 19);
    const y2 = kv(c, W, [['Calculated thickness', `${st.calc} mm`], [COND[st.cond], st.cond === 'both' ? 'at least 8 mm' : st.cond === 'sealed' ? 'at least 6 mm' : '+ 1.5 mm, at least 10'], ['Thickness to provide (504.7.1)', `${t} mm`, add ? OXIDE : OK]], y + 14, 28);
    lines(c, 'Angles: 75 × 50 at least in riveted main members; none under 65 × 45; flats 50 mm wide or more (504.7.3, 504.7.4).', 18, y2 + 8, W - 36, 18, DIMC, `500 12.5px ${F}`);
    foot(c, H, 'Beams and plate girders up to 35 m span need not be cambered');
  },
  steps: [
    { title: 'Camber', text: 'An open web girder is built slightly arched. Add the loads one at a time and watch it settle.',
      check: { q: 'An open web girder takes its true geometrical shape under… (cl. 504.6.2)', options: ['dead load + 75 % live load, no impact', 'dead load only', 'full live load and impact'], answer: 0, why: 'Loaded with full dead load plus 75 per cent of the live load without impact, the girders shall take up the true geometrical shape assumed in their design (cl. 504.6.2 b).' } },
    { title: 'Short spans', text: 'Camber is given where the engineer specifies it, for clearance or for appearance.',
      check: { q: 'Beams and plate girders need not be cambered up to a span of… (cl. 504.6.2)', options: ['35 m', '20 m', '50 m'], answer: 0, why: 'In the absence of specific guidance, beams and plate girders up to and including 35 m span need not be cambered (cl. 504.6.2 a).' } },
    { title: 'Minimum thickness', text: 'Drag the calculated thickness and change the condition of the plate. Thin steel has no reserve against rust.',
      check: { q: 'Minimum plate thickness when both sides can be painted (cl. 504.7.1)?', options: ['8 mm', '6 mm', '10 mm'], answer: 0, why: '8 mm when both sides are accessible for painting; where one side is not, add 1.5 mm to a calculated thickness under 12.5 mm, with at least 10 mm; 6 mm for sealed box members (cl. 504.7.1).' } },
  ],
});
