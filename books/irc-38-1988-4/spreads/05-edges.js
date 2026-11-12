// Spread 5 · Laying out the edges (cl. 6.3.5–6.3.7, Table 7A, Examples 11.30, 11.32). Centre line R 155 m, Ls 80 m.
// 'Same radius': each edge is the centre-line curve moved out until its straights lie 3.5 m off, so the width grows to
// 7 sec Δ/2 at the middle. 'Concentric': the inner edge is offset 1.2 m more, reached at the start of the circular curve
// (drawn as radial offsets of the centre line; Example 11.32 gives each edge its own transition). Extra width drawn 5×.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { horizontalCurve, layout } from '../../_irc38/curve.js';
import { diorama, trees, track, throughSlab, car, VEH } from '../../_irc38/site.js';
import { WIDEN_DELTA, widenTable } from '../../_irc38/tables.js';
import { offsetPts, band, swapGeo, clipRun } from '../../_irc38/deck.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, R = 155, LS = 80, EX = 5, HW = 3.5, CON = 1.2;
const dms = d => `${Math.floor(d)}° ${String(Math.round((d % 1) * 60)).padStart(2, '0')}′`;
const segDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };

export default {
  cam: { pos: [3, 38, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 58, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { i: 2, kind: 'same', carD: 0 };
    let S = .14, ox = 1, oz = -6, T = null, off = 0, e1 = 0, len = 0, prof = { same: [], con: [] };   // prof, e1, len: along the whole path; T: the part on the slab, from off metres
    const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S);
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 30, 83); group.add(forest);
    const mk = m => { const x = new THREE.Mesh(new THREE.BufferGeometry(), m); x.receiveShadow = true; group.add(x); return x; };
    const deck = mk(SM.asphalt), wide = mk(new THREE.MeshStandardMaterial({ color: 0x5aa070, roughness: .8 })), wide2 = mk(wide.material), edL = mk(SM.paint), edR = mk(SM.paint);
    const centre = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .05, dashed: true }); group.add(centre);
    const tag = holo.label('width', { h: .62, color: '#14202b', bg: 'rgba(255,253,248,.92)' }); group.add(tag);
    const auto = car(1, 0x24557a); group.add(auto);
    const delta = () => WIDEN_DELTA[st.i][1];
    // half-widths [outer, inner] at distance d, metres (true, not exaggerated)
    const at = (arr, d) => { const j = Math.max(0, Math.min(arr.length - 1, Math.round(d))); return arr[j] || [HW, HW]; };
    const halfs = d => at(prof[st.kind], d);

    const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
      const D = delta(), same = st.kind === 'same';
      c.fillText(`${same ? 'SAME-RADIUS EDGES' : 'CONCENTRIC EDGES'} · Δ ${dms(D)} · R 155 m, Ls 80 m`, 18, 26);
      if (!T) return;
      const s0 = e1 - 25, s1 = e1 + len + 25, X = s => 18 + (s - s0) / (s1 - s0) * (W - 36), y0 = 42, h = 92, top = 8.8, Y = v => y0 + h - (v - 7) / (top - 7) * h;
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(18, y0, W - 36, h);
      const plot = (kind, col, wd, dash) => { c.strokeStyle = col; c.lineWidth = wd; c.setLineDash(dash || []); c.beginPath(); for (let s = s0; s <= s1; s += 1) { const [o, i] = at(prof[kind], s); const v = Math.min(top, o + i); s === s0 ? c.moveTo(X(s), Y(v)) : c.lineTo(X(s), Y(v)); } c.stroke(); c.setLineDash([]); };
      plot(same ? 'con' : 'same', '#9aa3ab', 2, [6, 4]); plot(st.kind, '#2f8f55', 3);
      c.fillStyle = '#14202b'; c.font = `600 12px ${F}`;
      [['T.P.', e1], ['C.T.', e1 + LS], ['middle', e1 + len / 2], ['T.C.', e1 + len - LS], ['P.T.', e1 + len]].forEach(([n, s]) => { c.fillText(n, X(s) - 12, y0 + h + 14); c.strokeStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.moveTo(X(s), y0); c.lineTo(X(s), y0 + h); c.stroke(); });
      c.fillStyle = '#5c6168'; c.font = `500 11px ${F}`; c.fillText('width, m', 22, y0 + 12); c.fillText('7.0', 22, y0 + h - 4);
      const row = (a, b, y, col = '#14202b') => { c.fillStyle = '#5c6168'; c.font = `500 15px ${F}`; c.fillText(a, 18, y); c.fillStyle = col; c.font = `700 16px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 18, y); c.textAlign = 'left'; };
      const sec = 1 / Math.cos(D * Math.PI / 360);
      if (same) {
        row('Width at the middle, 7 sec Δ/2', `${(7 * sec).toFixed(3)} m`, 186);
        row('Widening obtained, 7 (sec Δ/2 − 1)', `${(7 * (sec - 1)).toFixed(2)} m`, 210, '#2f8f55');
        row('Table 7A prints for this Δ', `${WIDEN_DELTA[st.i][0].toFixed(2)} m`, 234);
        row('Table 7 needs, two-lane R 155 m', `${widenTable(R, 2).toFixed(1)} m`, 258, '#8a3f1c');
        c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText('Full only at the middle (cl. 6.3.7). Table 7A fits W = 6.6 m.', 18, H - 12);
      } else {
        row('Widening on the inside (Example 11.32)', `${CON.toFixed(1)} m`, 186, '#2f8f55');
        row('Inner edge radius 155 − 3.5 − 1.2', '150.3 m', 210);
        row('Outer edge radius 155 + 3.5', '158.5 m', 234);
        row('Full widening reached at', 'start of circular curve', 258);
        c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText('The ideal (cl. 6.3.7). Grey dashed: same radius. Extra width ×5.', 18, H - 12);
      }
    } });
    card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      const k = horizontalCurve(delta(), R, LS), L = layout(k, 1); len = k.length;
      // close in on the middle of the curve: C.T. to T.C. fill the slab
      oz = -5 - k.Es * S;
      const u1 = L.u1, u2 = [u1[0], -u1[1]], RUN = 60;
      const full = [[L.TP[0] - u1[0] * RUN, L.TP[1] - u1[1] * RUN], ...L.pts, [L.PT[0] + u2[0] * RUN, L.PT[1] + u2[1] * RUN]], Tf = track(full); e1 = RUN;
      const cut = clipRun(full, P, SLAB); T = track(cut.pts); off = cut.off;
      // same-radius edges: the whole curve moved out by 3.5 sec Δ/2 along the bisector, straights run on 250 m
      const m = HW / Math.cos(k.delta / 2);
      const edge = sg => { const core = L.pts.map(p => [p[0], p[1] + sg * m]), a = core[0], b = core.at(-1); return [[a[0] - u1[0] * 250, a[1] - u1[1] * 250], ...core, [b[0] + u2[0] * 250, b[1] + u2[1] * 250]]; };
      const eo = edge(1), ei = edge(-1), near = (p, poly) => { let best = Infinity; for (let j = 1; j < poly.length; j++) best = Math.min(best, segDist(p, poly[j - 1], poly[j])); return best; };
      const ramp = d => { const up = t => Math.min(1, Math.max(0, t / LS)); return Math.min(up(d - e1), up(e1 + len - d)); };
      prof = { same: [], con: [] };
      for (let d = 0; d <= Math.ceil(Tf.length); d++) {
        const p = Tf.at(d), q = [p.x, p.y];
        prof.same.push(d < e1 - 5 || d > e1 + len + 5 ? [HW, HW] : [near(q, eo), near(q, ei)]);
        prof.con.push([HW, HW + CON * ramp(d)]);
      }
      const out = d => HW + EX * (halfs(d + off)[0] - HW), inn = d => -HW - EX * (halfs(d + off)[1] - HW);
      swapGeo(deck, band(T, P, () => HW, () => -HW, .012));
      swapGeo(wide, band(T, P, () => HW, out, .013)); swapGeo(wide2, band(T, P, () => -HW, inn, .013));
      const lw = Math.max(.18, .045 / S);
      swapGeo(edL, band(T, P, d => out(d) - lw * .4, d => out(d) - lw * 1.4, .02)); swapGeo(edR, band(T, P, d => inn(d) + lw * .4, d => inn(d) + lw * 1.4, .02));
      holo.setPoints(centre, offsetPts(T, 0, 2).map(p => P(p, .03)));
      const mid = Tf.at(e1 + len / 2), [ho, hi] = halfs(e1 + len / 2);
      tag.userData.setText(`width ${(ho + hi).toFixed(2)} m`);
      tag.position.copy(P([mid.x + Math.sin(mid.h) * (hi + 10), mid.y - Math.cos(mid.h) * (hi + 10)], 1.2));
      auto.children[0].scale.setScalar(S * VEH);
      const nearPts = cut.pts.filter((_, i) => i % 3 === 0).map(p => P(p)); forest.userData.hide((x, z) => nearPts.some(q => Math.hypot(q.x - x, q.z - z) < 1.8));
      card.redraw();
    }
    const set = (k, v) => { st[k] = v; rebuild(); };
    const actions = [
      ...WIDEN_DELTA.map(([, D], i) => ({ label: `Δ ${dms(D)}`, toggle: () => st.i === i, run: () => set('i', i) })),
      { label: 'Same radius', toggle: () => st.kind === 'same', run: () => set('kind', 'same') },
      { label: 'Concentric', toggle: () => st.kind === 'con', run: () => set('kind', 'con') },
    ];
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        if (T) { st.carD = (st.carD + dt * 14) % T.length; const p = T.at(st.carD); auto.position.copy(P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h; }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); Object.assign(st, { i: 2, kind: 'same', carD: 0 }); rebuild(); guide.reset(); },
      get debug() { const mid = T ? halfs(e1 + len / 2) : null; return { kind: st.kind, delta: +delta().toFixed(3), widthMid: mid ? +(mid[0] + mid[1]).toFixed(3) : null, widthCT: T ? +halfs(e1 + LS).reduce((a, b) => a + b, 0).toFixed(3) : null, guide: guide.debug }; },
    };
    const L = actions.map(a => a.label), As = L.slice(0, WIDEN_DELTA.length);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Same radius', show: As, text: 'Each edge is the centre-line curve, same radius and transition, moved out. Change Δ: the widening depends on Δ alone.',
          check: { q: 'With same-radius edges, the extra width at the middle is…', options: ['W (sec Δ/2 − 1), set by Δ alone', 'l²/2R', 'always 0.6 m'], answer: 0, why: 'Moving the edges out makes the width at the middle W sec Δ/2, so the widening is W (sec Δ/2 − 1), whatever is needed (cl. 6.3.5–6.3.6, Table 7A).' } },
        { title: 'Where it is full', show: [...As, 'Same radius'], text: 'Follow the chart: the width grows from 7 m only to its full value at the middle of the curve.',
          check: { q: 'Where is the widening full with same-radius edges?', options: ['at the middle of the circular curve', 'at the tangent point', 'at the end of the transition'], answer: 0, why: 'The widening increases from zero to the full value only at the middle of the circular curve, but it is needed at its start (cl. 6.3.7).' } },
        { title: 'Concentric', show: L, text: 'Concentric edges with suitable transitions reach full widening at the start of the circular curve. Compare the two charts.',
          check: { q: 'The ideal layout of the edges is…', options: ['concentric circular curves with suitable transitions', 'edges of the same radius as the centre line', 'a straight taper ending at T.P.'], answer: 0, why: 'The ideal is concentric circular curves with suitable transitions, as in Example 11.32 (cl. 6.3.7).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild();
    return api;
  },
};
