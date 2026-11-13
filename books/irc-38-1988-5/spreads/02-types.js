// Spread 2 · Types of transition (cl. 7.2). Three curves leave the same tangent point with the same initial rate of
// curvature (A = 50 m): the spiral (curvature = s/A², exactly), the lemniscate r² = a² sin 2φ with a² = 3A² (curvature
// 3r/a², growing with the chord, not the length) and the cubic parabola y = x³/6A² (curvature peaks at a polar deflection
// of about 8.5°, then falls). Each is drawn out to the chosen polar deflection.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { diorama, trees, track, car } from '../../_irc38/site.js';
import { band, swapGeo } from '../../_irc38/deck.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, A = 50, O = new THREE.Vector3(-8, GROUND, 4);
let S = .2;   // page cm per metre, refitted to each deflection
const RAD = Math.PI / 180;
// each curve as samples { x, y, s, k } out to polar deflection `to` (radians)
function spiral(to) { const out = [{ x: 0, y: 0, s: 0, k: 0 }]; let x = 0, y = 0; for (let s = .5; s < 400; s += .5) { const t = (s - .25) ** 2 / (2 * A * A); x += Math.cos(t) * .5; y += Math.sin(t) * .5; out.push({ x, y, s, k: s / (A * A) }); if (Math.atan2(y, x) >= to) break; } return out; }
function cubic(to) { const out = [{ x: 0, y: 0, s: 0, k: 0 }]; let s = 0, px = 0, py = 0; for (let x = .5; x < 400; x += .5) { const y = x ** 3 / (6 * A * A); s += Math.hypot(x - px, y - py); px = x; py = y; const u = x * x / (2 * A * A); out.push({ x, y, s, k: (x / (A * A)) / (1 + u * u) ** 1.5 }); if (Math.atan2(y, x) >= to) break; } return out; }
function lemniscate(to) { const a = Math.sqrt(3) * A, out = [{ x: 0, y: 0, s: 0, k: 0 }]; let s = 0, px = 0, py = 0; for (let f = .0005; f <= Math.min(to, Math.PI / 4) + 1e-9; f += .0005) { const r = a * Math.sqrt(Math.sin(2 * f)), x = r * Math.cos(f), y = r * Math.sin(f); s += Math.hypot(x - px, y - py); px = x; py = y; out.push({ x, y, s, k: 3 * r / (a * a) }); } return out; }
const KINDS = [['spiral', spiral, '#b0532a', 0xb0532a], ['lemniscate', lemniscate, '#2f8f55', 0x2f8f55], ['cubic parabola', cubic, '#c23b2f', 0xc23b2f]];

export default {
  cam: { pos: [3, 38, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 58, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { deg: 9, s: 0, tick: 0 };
    const P = (xy, h = 0) => new THREE.Vector3(O.x + xy[0] * S, O.y + h, O.z - xy[1] * S);
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 30, 37); group.add(forest);
    const deck = new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt); deck.receiveShadow = true; group.add(deck);
    const approach = new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt); approach.receiveShadow = true; group.add(approach);
    const lines = KINDS.map(([, , , hex]) => { const l = holo.polyline([[0, 0, 0], [1, 0, 0]], hex, { width: .09 }); group.add(l); return l; });
    const tags = KINDS.map(([n, , col]) => { const t = holo.label(n, { h: .6, color: col, bg: 'rgba(255,253,248,.92)' }); group.add(t); return t; });
    const tpTag = holo.label('T.P.', { h: .6, color: '#14202b', bg: 'rgba(255,253,248,.92)' }); tpTag.position.copy(P([0, -8], 1)); group.add(tpTag);
    let curves = [];
    // a car on each curve, all leaving T.P. together at the same speed: the chart marks where each one is
    const autos = KINDS.map(([, , , hex]) => { const c = car(1, hex); group.add(c); return c; });
    const carAt = cv => { let i = cv.findIndex(p => p.s >= st.s); if (i < 0) i = cv.length - 1; const a = cv[Math.max(0, i - 1)], b = cv[Math.max(1, i)]; return { p: cv[i], h: Math.atan2(b.y - a.y, b.x - a.x) }; };

    const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
      c.fillText(`CURVATURE · out to a polar deflection of ${st.deg}°`, 18, 26);
      const smax = Math.max(...curves.map(cv => cv.at(-1).s)) / A, kmax = Math.max(...curves.map(cv => Math.max(...cv.map(p => p.k)))) * A * 1.1;
      const y0 = 42, h = 110, X = s => 18 + s / A / smax * (W - 36), Y = k => y0 + h - k * A / kmax * h;
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(18, y0, W - 36, h);
      curves.forEach((cv, i) => { c.strokeStyle = KINDS[i][2]; c.lineWidth = 3; c.setLineDash(i === 2 ? [7, 4] : []); c.beginPath(); cv.forEach((p, j) => j ? c.lineTo(X(p.s), Y(p.k)) : c.moveTo(X(p.s), Y(p.k))); c.stroke(); c.setLineDash([]); });
      if (st.s > 0) { c.strokeStyle = 'rgba(20,32,43,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(st.s), y0); c.lineTo(X(st.s), y0 + h); c.stroke(); curves.forEach((cv, i) => { const { p } = carAt(cv); c.fillStyle = KINDS[i][2]; c.beginPath(); c.arc(X(Math.min(st.s, p.s)), Y(p.k), 5, 0, 7); c.fill(); }); }
      c.fillStyle = '#5c6168'; c.font = `500 11px ${F}`; c.fillText('curvature 1/R', 22, y0 + 12); c.fillText('length along the curve →', W - 160, y0 + h - 6);
      const rows = curves.map((cv, i) => { const a = cv.at(-1), b = cv[Math.max(0, cv.length - 6)], kpk = Math.max(...cv.map(p => p.k)); return [KINDS[i][0], a.k, a.k >= b.k - 1e-9 && a.k >= kpk - 1e-6, KINDS[i][2]]; });
      c.font = `600 12px ${F}`; c.fillStyle = '#5c6168'; c.fillText('AT THE END', 18, 178); c.textAlign = 'right'; c.fillText('RADIUS', W - 150, 178); c.fillText('CURVATURE STILL RISING?', W - 18, 178); c.textAlign = 'left';
      rows.forEach(([n, k, up, col], i) => { const y = 200 + i * 22; c.fillStyle = col; c.font = `700 15px ${F}`; c.fillText(n, 18, y); c.fillStyle = '#14202b'; c.textAlign = 'right'; c.fillText(`${(1 / k).toFixed(0)} m`, W - 150, y); c.fillStyle = up ? '#1f7a45' : '#b3362b'; c.fillText(up ? 'yes' : 'no: past its peak', W - 18, y); c.textAlign = 'left'; });
      c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`;
      c.fillText('The spiral’s curvature grows exactly with length (cl. 7.2.1); the lemniscate', 18, H - 30);
      c.fillText('falls slowly behind (7.2.2); the cubic parabola turns back past 9° (7.2.3).', 18, H - 12);
    } });
    card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      curves = KINDS.map(([, fn]) => fn(st.deg * RAD));
      const pts = curves.flat(); S = Math.min(.32, 19 / (Math.max(...pts.map(q => q.x)) + 8), 16 / (Math.max(...pts.map(q => q.y)) + 8));
      tpTag.position.copy(P([0, -2.4 / S], 1));
      curves.forEach((cv, i) => { holo.setPoints(lines[i], cv.map(p => P([p.x, p.y], .05 + i * .01))); const e = cv.at(-1); tags[i].position.copy(P([e.x + 6, e.y + (i - 1) * 7], 1)); });
      const sp = track(curves[0].map(p => [p.x, p.y])), ap = track([[(SLAB.x0 + .3 - O.x) / S, 0], [0, 0]]);
      swapGeo(deck, band(sp, P, () => 3.5, () => -3.5, .012)); swapGeo(approach, band(ap, P, () => 3.5, () => -3.5, .012));
      const near = [...curves[0], ...curves[1], ...curves[2]].filter((_, i) => i % 8 === 0).map(p => P([p.x, p.y])).concat([P([-1 / S, 0]), P([-2.5 / S, 0]), P([-4 / S, 0])]);
      forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.5));
      autos.forEach(a => a.children[0].scale.setScalar(S));   // true size: the page scale here is large st.s = 0;
      card.redraw();
    }
    const actions = [9, 20, 30, 45].map(d => ({ label: `Deflection ${d}°`, toggle: () => st.deg === d, run: () => { st.deg = d; rebuild(); } }));
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        if (curves.length) {
          const end = Math.max(...curves.map(cv => cv.at(-1).s)); st.s += dt * 14; if (st.s > end + 20) st.s = 0;
          curves.forEach((cv, i) => { const { p, h } = carAt(cv); autos[i].position.copy(P([p.x, p.y], .03)); autos[i].rotation.set(0, h, 0); });
          if ((st.tick += dt) > .15) { st.tick = 0; card.redraw(); }
        }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.deg = 9; rebuild(); guide.reset(); },
      get debug() { return { deg: st.deg, ends: curves.map((cv, i) => ({ kind: KINDS[i][0], R: +(1 / cv.at(-1).k).toFixed(1), peakR: +(1 / Math.max(...cv.map(p => p.k))).toFixed(1) })), guide: guide.debug }; },
    };
    const L = actions.map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Up to 9°', show: L, text: 'Three cars leave T.P. together. Out to 9° the curves almost coincide: each sharpens as it goes. The road follows the spiral.',
          check: { q: 'The radius of an ideal transition should be…', options: ['inversely proportional to the length from its start', 'constant along it', 'proportional to the length from its start'], answer: 0, why: 'Radial acceleration varies as 1/R, so for a uniform rate of change the radius should be inversely proportional to the length from the start (cl. 7.2.1).' } },
        { title: 'Wider', show: L, text: 'Open to 20°, 30° and 45° and watch the dots on the chart: the red car’s curvature turns back down; the lemniscate falls behind.',
          check: { q: 'The cubic parabola has no transitional properties beyond a polar deflection of…', options: ['9°', '30°', '45°'], answer: 0, why: 'It has no transitional properties for polar deflection angles greater than 9°, so it is unsuitable for large deflections (cl. 7.2.3).' } },
        { title: 'The spiral', show: L, text: 'Only the spiral keeps the curvature growing exactly with length, at any deflection.',
          check: { q: 'The transition specified for Indian roads is…', options: ['the spiral', 'the lemniscate', 'the cubic parabola'], answer: 0, why: 'The spiral: radius inversely proportional to length, uniform rate of change of acceleration, and the instrument can be shifted in setting out (cl. 7.2.4).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild();
    return api;
  },
};
