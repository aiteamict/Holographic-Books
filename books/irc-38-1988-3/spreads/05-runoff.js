// Spreads 5–7 · Building superelevation into the road (cl. 5.4, Figs. 11–13, Example 11.1 / Fig. 26). A curve with
// transitions carries a 3D road whose cross-section changes station by station (heights drawn ×10): camber on the
// straight; stage 1 raises the outer half to level and on to a crossfall equal to the camber before T.P.; stage 2
// rotates the section to the full superelevation along the transition.
//   'build'   pick the rotation axis (Fig. 11 d–f) and check the edge rise rate (1 in 150 / 1 in 60, Fig. 13)
//   'where'   Fig. 12: full superelevation at B (R = 0.06349 V², case i) or at the end of the transition (case ii)
//   'example' Example 11.1: MDR, 80 km/h, R 250 m, Ls 90 m, 7 m + 0.6 m widening, sections A–G of Fig. 26
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { horizontalCurve, layout } from '../../_irc38/curve.js';
import { diorama, trees, track, car, VEH } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', S = .085, VX = 10, GROUND = .5, LIFT = .35, O = new THREE.Vector3(0, GROUND, -7.5);
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };

export function runoffSpread(mode) {
  const ex = mode === 'example';
  return {
    cam: { pos: [3, 36, 36], look: [3.5, 1, -2], portrait: { pos: [15, 58, 50], look: [12.3, 0, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const P = (xy, h = 0) => new THREE.Vector3(O.x + xy[0] * S, O.y + h, O.z - xy[1] * S);
      const st = { axis: 'centre', Ls: ex ? 90 : 60, hills: false, kase: 'ii', V: 80, carD: 0, tick: 0 };
      const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
      const forest = trees(slab, 30, 47); group.add(forest);
      const deck = new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt); deck.receiveShadow = deck.castShadow = true; group.add(deck);
      const bank = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0x9e8a66, roughness: .95, side: THREE.DoubleSide })); group.add(bank);
      const lines = { inner: holo.polyline([[0, 0, 0], [1, 0, 0]], holo.CYAN, { width: .06 }), centre: holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .05, dashed: true }), outer: holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .06 }) };
      Object.values(lines).forEach(l => group.add(l));
      const auto = car(S * VEH, 0x24557a); group.add(auto);
      const marks = 'ABCDEFG'.split('').map(n => { const l = holo.label(n, { h: .7, color: '#14202b', bg: 'rgba(255,253,248,.92)', weight: 800 }); l.visible = ex; group.add(l); return l; });

      // design data
      const c = .02, e = .07, W0 = 7, Wwide = ex ? .6 : 0;
      const R = () => ex ? 250 : mode === 'where' ? .0358 * st.V * st.V : 230;
      const D = () => ex ? 60 / 250 * 180 / Math.PI + 2 * (90 / 500) * 180 / Math.PI : 60;
      const L1 = ex ? 30 : c * W0 * 200;   // stage 1 before T.P.: 1 in 200 on the outer half (Fig. 26 uses 15 m + 15 m)
      let T = null, e1 = 0;
      const width = s => W0 + Wwide * Math.min(1, Math.max(0, (s - (e1 - L1)) / (L1 + st.Ls)));
      const section = s => {   // heights of [inner edge, centre, outer edge] against the centre-line datum, metres
        const w = width(s), t = s - e1, h = w / 2;   // t: distance past T.P.
        if (t < -L1) return [-c * h, 0, -c * h];
        if (t < 0) { const k = (t + L1) / L1; return [-c * h, 0, -c * h + 2 * c * h * k]; }   // stage 1: the outer half from −c to +c
        let x;
        if (mode === 'where' && st.kase === 'i') { const r = R() * st.Ls / Math.max(t, 1e-3); x = t > st.Ls ? e : Math.max(c, Math.min(e, st.V * st.V / (225 * r))); }
        else x = t >= st.Ls ? e : c + (e - c) * t / st.Ls;
        if (st.axis === 'inner') return [-c * h, -c * h + x * h, -c * h + 2 * x * h];
        if (st.axis === 'outer') return [c * h - 2 * x * h, c * h - x * h, c * h];
        return [-x * h, 0, x * h];
      };

      const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (cx, Wc, H) => {
        cardBg(cx, Wc, H); cx.textAlign = 'left'; cx.fillStyle = '#24557a'; cx.font = `700 16px ${F}`;
        if (!T) return;
        const s0 = Math.max(0, e1 - L1 - 15), s1 = Math.min(T.length, e1 + st.Ls + 30), X = s => 18 + (s - s0) / (s1 - s0) * (Wc - 36);
        if (mode === 'where') {
          cx.fillText(`FIG. 12 · ALONG THE TRANSITION · ${st.V} km/h, R ${R().toFixed(0)} m`, 18, 26);
          const y0 = 42, h = 92, Y = v => y0 + h - v / .2 * h;   // e and f on one 0–0.2 scale
          cx.strokeStyle = 'rgba(0,0,0,.18)'; cx.lineWidth = 1; cx.strokeRect(18, y0, Wc - 36, h);
          const plot = (fn, col, dash) => { cx.strokeStyle = col; cx.lineWidth = 3; cx.setLineDash(dash || []); cx.beginPath(); for (let s = s0; s <= s1; s += 1) { const v = fn(s); s === s0 ? cx.moveTo(X(s), Y(v)) : cx.lineTo(X(s), Y(v)); } cx.stroke(); cx.setLineDash([]); };
          const xOf = s => { const [i, , o] = section(s); return (o - i) / width(s); };
          const rOf = s => { const t = s - e1; return t <= 0 ? Infinity : t >= st.Ls ? R() : R() * st.Ls / t; };
          plot(s => Math.max(0, xOf(s)), '#24557a'); plot(s => Math.max(0, st.V * st.V / (127 * rOf(s)) - Math.max(0, xOf(s))), '#c23b2f', [6, 4]);
          cx.strokeStyle = 'rgba(194,59,47,.5)'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(18, Y(.15)); cx.lineTo(Wc - 18, Y(.15)); cx.stroke();
          const B = e1 + st.Ls * R() / (.06349 * st.V * st.V);
          cx.font = `600 13px ${F}`; [['A', e1], ['B', B], ['C', e1 + st.Ls]].forEach(([n, s]) => { if (s > s0 && s < s1) { cx.fillStyle = '#14202b'; cx.fillText(n, X(s) - 4, y0 + h + 16); } });
          cx.fillStyle = '#24557a'; cx.fillText('superelevation e', 18, y0 + h + 34); cx.fillStyle = '#c23b2f'; cx.fillText('friction needed at the design speed (limit 0.15)', 150, y0 + h + 34);
          cx.fillStyle = '#14202b'; cx.font = `600 15px ${F}`;
          cx.fillText(st.kase === 'i' ? 'Case (i): e reaches 0.07 at B, where R = 0.06349 V²' : 'Case (ii): e reaches 0.07 at the end of the transition (adopted)', 18, H - 40);
          cx.fillStyle = '#5c6168'; cx.font = `500 13px ${F}`; cx.fillText('Both need f = 0.15 at C; case (i) is no better, and harder to set out.', 18, H - 16);
          return;
        }
        cx.fillText(ex ? 'EXAMPLE 11.1 · FIG. 26 · rotation about the centre line' : `FIG. 13 · EDGE PROFILES · rotation about the ${st.axis === 'centre' ? 'centre line' : st.axis + ' edge'}`, 18, 26);
        const y0 = 40, h = 110; let lo = 0, hi = 0; for (let s = s0; s <= s1; s += 2) { const v = section(s); lo = Math.min(lo, ...v); hi = Math.max(hi, ...v); }
        const Y = v => y0 + h - (v - lo) / Math.max(.05, hi - lo) * h;
        cx.strokeStyle = 'rgba(0,0,0,.18)'; cx.lineWidth = 1; cx.strokeRect(18, y0, Wc - 36, h);
        [[0, '#1d5f87'], [1, '#5c6168'], [2, '#b0532a']].forEach(([j, col]) => { cx.strokeStyle = col; cx.lineWidth = 3; cx.setLineDash(j === 1 ? [6, 4] : []); cx.beginPath(); for (let s = s0; s <= s1; s += 1) { const v = section(s)[j]; s === s0 ? cx.moveTo(X(s), Y(v)) : cx.lineTo(X(s), Y(v)); } cx.stroke(); cx.setLineDash([]); });
        cx.strokeStyle = '#14202b'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(X(st.carD), y0); cx.lineTo(X(st.carD), y0 + h); cx.stroke();
        cx.font = `600 12px ${F}`; cx.fillStyle = '#1d5f87'; cx.fillText('inner edge', 18, y0 + h + 16); cx.fillStyle = '#5c6168'; cx.fillText('centre line', 100, y0 + h + 16); cx.fillStyle = '#b0532a'; cx.fillText('outer edge', 186, y0 + h + 16);
        cx.fillStyle = '#14202b'; cx.fillText('T.P.', X(e1) - 12, y0 + h + 32); cx.fillText('end of transition', X(e1 + st.Ls) - 40, y0 + h + 32);
        if (ex) {
          const rows = [['e = 80² / (225 × 250)', '0.1137 → 0.07'], ['Rise of outer edge over inner, 7.6 m × 0.07', '0.532 m'], ['Outer edge above centre line', '0.266 m'], ['Grade 0.266 / 90', '0.0029'], ['Inner edge drop 0.266 − 0.02 × 3.8', '0.19 m']];
          rows.forEach(([a, b], i) => { const y = 200 + i * 20; cx.fillStyle = '#5c6168'; cx.font = `500 13px ${F}`; cx.fillText(a, 18, y); cx.fillStyle = '#14202b'; cx.font = `700 14px ${F}`; cx.textAlign = 'right'; cx.fillText(b, Wc - 18, y); cx.textAlign = 'left'; });
          return;
        }
        const rate = st.Ls / ((e - c) * W0 / 2), need = st.hills ? 60 : 150, ok = rate >= need;   // edge against centre line over the transition
        cx.fillStyle = ok ? '#1f7a45' : '#b3362b'; cx.font = `700 16px ${F}`;
        cx.fillText(`Edge rise 1 in ${rate.toFixed(0)} · limit 1 in ${need}: ${ok ? '✓' : '✗ too steep: longer Ls'}`, 18, H - 40);
        cx.fillStyle = '#5c6168'; cx.font = `500 13px ${F}`; cx.fillText(st.axis === 'inner' ? 'About the inner edge: centre and outer edge rise; more embankment.' : st.axis === 'outer' ? 'About the outer edge: the centre and inner edge drop.' : 'About the centre line: level kept; inner edge drops, outer rises.', 18, H - 16);
      } });
      card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

      // the cross-section at the car, large: on the road itself the tilt is a few millimetres of page and cannot be seen.
      // A panel behind the road redraws the section the car is on, 1.4 cm per metre across and heights ×5.
      const GW = 14, GH = 6, HS = 1.4, GX = 5, GP = new THREE.Vector3(0, GROUND + 2.4, -11.6);
      const gauge = holo.frame(GW, GH, 'Cross-section at the car · heights ×5'); gauge.position.copy(GP); gauge.rotation.x = -.8; group.add(gauge);   // tilted back to face the camera
      const gDeck = holo.polyline([[0, 0, 0], [1, 0, 0], [2, 0, 0]], holo.WHITE, { width: .18 }); gauge.add(gDeck);
      const gLevel = holo.polyline([[-GW / 2 + .4, 0, 0], [GW / 2 - .4, 0, 0]], holo.DIM, { width: .05, dashed: true }); gauge.add(gLevel);
      const gPivot = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 8), new THREE.MeshBasicMaterial({ color: holo.RED, toneMapped: false })); gauge.add(gPivot);
      const gIn = holo.label('inner edge', { h: .8, color: '#1d5f87' }), gOut = holo.label('outer edge', { h: .8, color: '#b0532a' }), gE = holo.label(' ', { h: .9, color: '#14202b', weight: 700 });
      gE.position.set(-GW / 2 + 4.6, GH / 2 - .7, .05); gauge.add(gIn, gOut, gE);
      const gY0 = -1.2;   // the level line through the centre-line datum
      gLevel.position.y = gY0;
      function drawGauge(force) {
        const [hi, hc, ho] = section(st.carD), w = width(st.carD), X = f => (f - .5) * w * HS, Y = v => gY0 + v * HS * GX;
        holo.setPoints(gDeck, [[X(0), Y(hi), .03], [X(.5), Y(hc), .03], [X(1), Y(ho), .03]]);
        gIn.position.set(X(0) + .6, Y(hi) - .75, .05); gOut.position.set(X(1) - .6, Y(ho) + .7, .05);
        const ax = st.axis === 'inner' && mode === 'build' ? [X(0), Y(hi)] : st.axis === 'outer' && mode === 'build' ? [X(1), Y(ho)] : [X(.5), Y(hc)];
        gPivot.position.set(ax[0], ax[1], .06);
        if (force) {
          const x = (ho - hi) / w, t = st.carD - e1;
          gE.userData.setText(Math.abs(hi - ho) < 1e-6 ? `Camber ${(c * 100).toFixed(0)} % both ways` : `${t < 0 ? 'Stage 1' : t < st.Ls ? 'Stage 2' : 'Full'} · crossfall ${(x * 100).toFixed(1)} %${t >= st.Ls ? ' = e' : ''}`);
        }
      }

      function rebuild() {
        const k = horizontalCurve(D(), R(), st.Ls), L = layout(k, 1.5), u1 = L.u1, u2 = [u1[0], -u1[1]];
        const lead = L1 + 22, tail = 26;
        const pts = [[L.TP[0] - u1[0] * lead, L.TP[1] - u1[1] * lead], ...L.pts, [L.PT[0] + u2[0] * tail, L.PT[1] + u2[1] * tail]];
        T = track(pts); e1 = lead;
        const N = pts.length, pos = [], idx = [], bp = [], bi = [], cols = 5, ln = { inner: [], centre: [], outer: [] };
        for (let i = 0; i < N; i++) {
          const s = T.cum[i], p = T.at(s), nx = -Math.sin(p.h), ny = Math.cos(p.h), [hi, hc, ho] = section(s), w = width(s);
          // left of travel is the outer side (the curve turns right); five points across: inner, ¼, centre, ¾, outer
          const across = j => { const f = j / (cols - 1), off = (f - .5) * w, yy = f < .5 ? hi + (hc - hi) * f * 2 : hc + (ho - hc) * (f - .5) * 2; return P([p.x + nx * off, p.y + ny * off], LIFT + yy * S * VX); };
          for (let j = 0; j < cols; j++) { const q = across(j); pos.push(q.x, q.y, q.z); }
          ln.inner.push(across(0).add(new THREE.Vector3(0, .03, 0))); ln.centre.push(across(2).add(new THREE.Vector3(0, .03, 0))); ln.outer.push(across(4).add(new THREE.Vector3(0, .03, 0)));
          const a = across(0), b = across(4), ga = P([p.x + nx * (-w / 2 - 6), p.y + ny * (-w / 2 - 6)]), gb = P([p.x + nx * (w / 2 + 6), p.y + ny * (w / 2 + 6)]);
          bp.push(ga.x, O.y + .01, ga.z, a.x, a.y, a.z, b.x, b.y, b.z, gb.x, O.y + .01, gb.z);
          if (i) {
            for (let j = 0; j < cols - 1; j++) { const r0 = (i - 1) * cols + j, r1 = i * cols + j; idx.push(r0, r0 + 1, r1, r1, r0 + 1, r1 + 1); }
            const q = i * 4, m = q - 4; bi.push(m, q, m + 1, q, q + 1, m + 1, m + 2, q + 2, m + 3, q + 2, q + 3, m + 3);
          }
        }
        const mk = (mesh, p, ix) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(ix); g.computeVertexNormals(); mesh.geometry.dispose(); mesh.geometry = g; };
        mk(deck, pos, idx); mk(bank, bp, bi); deck.material.side = THREE.DoubleSide;
        for (const n of ['inner', 'centre', 'outer']) holo.setPoints(lines[n], ln[n]);
        const near = pts.filter((_, i) => i % 3 === 0).map(p => P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.4) || (Math.abs(x - GP.x) < GW / 2 + .6 && Math.abs(z - GP.z) < 3));
        if (ex) { const a0 = e1 - L1; [a0, a0 + 15, e1, e1 + 45, e1 + 90, e1 + 120, e1 + 150].forEach((s, i) => { const p = T.at(Math.min(s, T.length)); marks[i].position.copy(P([p.x - Math.sin(p.h) * 8, p.y + Math.cos(p.h) * 8], 1.6)); }); }
        card.redraw();
      }
      const set = (k, v) => { st[k] = v; rebuild(); };
      const actions = mode === 'build' ? [
        { label: 'About centre line', toggle: () => st.axis === 'centre', run: () => set('axis', 'centre') },
        { label: 'About inner edge', toggle: () => st.axis === 'inner', run: () => set('axis', 'inner') },
        { label: 'About outer edge', toggle: () => st.axis === 'outer', run: () => set('axis', 'outer') },
        { label: 'Ls 20 m', toggle: () => st.Ls === 20, run: () => set('Ls', 20) }, { label: 'Ls 60 m', toggle: () => st.Ls === 60, run: () => set('Ls', 60) },
        { label: 'Hills (1 in 60)', toggle: () => st.hills, run: () => { st.hills = !st.hills; card.redraw(); } },
      ] : mode === 'where' ? [
        { label: 'Case (i)', toggle: () => st.kase === 'i', run: () => set('kase', 'i') }, { label: 'Case (ii)', toggle: () => st.kase === 'ii', run: () => set('kase', 'ii') },
        { label: '65 km/h', toggle: () => st.V === 65, run: () => set('V', 65) }, { label: '80 km/h', toggle: () => st.V === 80, run: () => set('V', 80) },
      ] : [];
      const api = {
        group, targets: [], actions,
        tap(hit) { guide.tap(hit); },
        a11y: actions.map(a => ({ label: a.label, run: a.run })),
        update(dt) {
          anims.tick(dt);
          if (T) {
            st.carD = (st.carD + dt * 16) % T.length; const p = T.at(st.carD), [, hc, ho] = section(st.carD), w = width(st.carD);
            const off = w / 4, yy = hc + (ho - hc) * .5;   // the outer lane, left of travel
            auto.position.copy(P([p.x - Math.sin(p.h) * off, p.y + Math.cos(p.h) * off], LIFT + yy * S * VX + .02)); auto.rotation.set(0, p.h, 0);
            auto.rotateX(-Math.atan((ho - hc) * 2 / w * VX));
            const slow = (st.tick += dt) > .15; if (slow) { st.tick = 0; card.redraw(); }
            drawGauge(slow);
          }
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
        },
        reset() { anims.clear(); Object.assign(st, { axis: 'centre', Ls: ex ? 90 : 60, hills: false, kase: 'ii', V: 80, carD: 0 }); rebuild(); guide.reset(); },
        get debug() { const end = T ? section(e1 + st.Ls) : null; return { mode, axis: st.axis, Ls: st.Ls, kase: st.kase, V: st.V, R: +R().toFixed(1), endSection: end?.map(v => +v.toFixed(3)), widthEnd: T ? +width(e1 + st.Ls).toFixed(2) : null, guide: guide.debug }; },
      };
      const L = actions.map(a => a.label);
      const STEPS = {
        build: [
          { title: 'Stage 1', show: L.slice(0, 3), text: 'Watch the outer half: before T.P. it rises until level, then on to a crossfall equal to the camber.',
            check: { q: 'Where must stage 1 be finished (cl. 5.4.1)?', options: ['before the tangent point', 'at the middle of the curve', 'after the curve'], answer: 0, why: 'Raising the outer half until it is level should be done before T.P.: negative superelevation, however slight, is objectionable on a curve (cl. 5.4.1).' } },
          { title: 'Stage 2', show: L.slice(0, 3), text: 'Along the transition the whole section rotates to full superelevation. Try each axis and watch the profiles.',
            check: { q: 'Rotating about the inner edge…', options: ['raises the centre and outer edge', 'keeps the centre level', 'lowers the outer edge'], answer: 0, why: 'About the inner edge the centre and outer edge rise together, increasing the embankment height on the outer side (cl. 5.4.1).' } },
          { title: 'Rate of rise', show: L, text: 'Shorten the transition and the edge climbs faster. Plain country allows 1 in 150; hills 1 in 60 (Fig. 13).',
            check: { q: 'Raising the outer half in stage 1 should not exceed a slope of…', options: ['1 in 200', '1 in 50', '1 in 20'], answer: 0, why: 'Normally the outer half is raised so as not to produce a slope of more than 1 in 200 (cl. 5.4.1).' } },
        ],
        where: [
          { title: 'Case (ii)', show: L, text: 'The adopted way: superelevation grows steadily along the transition and reaches 0.07 at its end.' },
          { title: 'Case (i)', show: L, text: 'Case (i) follows V²/225R up the transition and reaches 0.07 already at B, where the radius is 0.06349 V².',
            check: { q: 'At what radius does V²/225R reach 0.07?', options: ['0.06349 V²', '0.0358 V²', 'V²/127'], answer: 0, why: 'V²/(225 R) = 0.07 gives R = V²/15.75 = 0.06349 V² (cl. 5.4.2).' } },
          { title: 'Adopted', show: L, text: 'Both need the friction limit 0.15 at C. Which does IRC adopt?',
            check: { q: 'IRC attains the full superelevation…', options: ['at the end of the transition', 'at point B', 'at the tangent point'], answer: 0, why: 'Case (i) has no definite advantage and its setting out is complicated, so the full superelevation is attained at the end of the transition (cl. 5.4.2).' } },
        ],
        example: [
          { title: 'The design', show: [], text: 'MDR at 80 km/h on R 250 m: V²/225R = 0.1137, more than 7 per cent, so e = 0.07 over a 90 m transition.',
            check: { q: 'Example 11.1 computes e = 0.1137. What is provided?', options: ['0.07', '0.1137', '0.10'], answer: 0, why: 'It is more than the 7 per cent allowed, so 7 per cent is provided, reached at the end of the transition (Example 11.1).' } },
          { title: 'Sections', show: [], text: 'Follow the car past sections A to G of Fig. 26: crown, outer half level, crossfall at camber, half-way, then full superelevation.' },
          { title: 'Drainage', show: [], text: 'Rotating about the centre line, the inner edge drops 0.19 m below its level on the straight.',
            check: { q: 'Why is a 0.19 m drop of the inner edge acceptable here?', options: ['the embankment is 0.3 m high', 'the curve is short', 'it is under 7 per cent'], answer: 0, why: 'There is no drainage trouble because the road is on a 0.3 m embankment (Example 11.1).' } },
        ],
      };
      const guide = makeGuide(ctx, { anchor: [-5.4, 2.2, 10.5], w: 10, h: 5, steps: STEPS[mode] });
      guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
      card.userData.zoom = true; api.targets.push(card);
      rebuild();
      return api;
    },
  };
}

export default runoffSpread('build');
