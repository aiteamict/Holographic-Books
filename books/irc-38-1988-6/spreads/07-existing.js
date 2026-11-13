// Spread 7 · Transitions for old curves (cl. 7.10.2–7.10.3, Figs. 21–24, Examples 11.26–11.28). The old alignment is
// dashed red; the new road follows the transitions. The view closes in on the start of the circular curve, where the
// change of a metre or two can be seen.
//   1 reduce the radius by the shift, centre and straights kept (Fig. 21, Ex 11.26: 200 m → 199 m, s 1 m)
//   2 keep the radius, move the centre by s / cos Δ/2 (Fig. 22, Ex 11.27: 165 m, Ls 90 m)
//   3 keep the curve, move the straights out by the shift (Fig. 23: 200 m, Ls 100 m, s 2.079 m from Table 11)
//   4 sharper curves with transitions at the ends, the old curve kept in the middle (Fig. 24, Ex 11.28: 400 m, 375 m)
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { horizontalCurve as hc, layout, alignment, meet, deg } from '../../_irc38/curve.js';
import { diorama, trees, makeRoad, car, VEH } from '../../_irc38/site.js';
import { clipRun } from '../../_irc38/deck.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, DD = 56, D = DD * Math.PI / 180;
const u1 = [Math.cos(D / 2), Math.sin(D / 2)], u2 = [Math.cos(D / 2), -Math.sin(D / 2)], E = 500;
const withStraights = (pts, a, b) => [[a[0] - u1[0] * E, a[1] - u1[1] * E], ...pts, [b[0] + u2[0] * E, b[1] + u2[1] * E]];
const circle = R => { const L = layout(hc(DD, R, 0), 1); return { pts: withStraights(L.pts, L.TP, L.PT), R }; };
function bis(f, a, b) { for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; } return (a + b) / 2; }

function method(m) {
  if (m === 1) { const k = hc(DD, 199, 69.444), L = layout(k, 1); return { old: circle(200), pts: withStraights(L.pts, L.TP, L.PT), focus: L.CT, S: .3, title: '1 · REDUCE THE RADIUS (Ex 11.26)',
    rows: [['Shift adopted', '1 m', `${k.S.toFixed(3)} m`], ['Ls on Rc 199 m (Table 12)', '69.444 m', `${bis(L0 => hc(DD, 199, L0).S - 1, 10, 200).toFixed(3)} m for s = 1`], ['θs', '9.9°', `${deg(69.444 / 398).toFixed(3)}°`], ['Centre of the circle', 'kept', `moves ${((199 + k.S - 200) / Math.cos(D / 2)).toFixed(3)} m`]],
    note: 'Ls 60 m first gave s 0.749 on 200 m; the book assumes s = 1 m, Rc 199 m, and reads Ls from Table 12.' }; }
  if (m === 2) { const k = hc(DD, 165, 90), L = layout(k, 1); return { old: circle(165), pts: withStraights(L.pts, L.TP, L.PT), focus: L.CT, S: .3, title: '2 · KEEP THE RADIUS, MOVE THE CENTRE (Ex 11.27)',
    rows: [['θs = 90 × 28.65 / 165', '15.627°', `${deg(k.thetaS).toFixed(3)}°`], ['Shift s', '2.039 m', `${k.S.toFixed(3)} m`], ['Ts', '133.708 m', `${k.Ts.toFixed(3)} m`], ['Es', '24.183 m', `${k.Es.toFixed(3)} m`], ['Centre moves s / cos Δ/2', '2.309 m', `${(k.S / Math.cos(D / 2)).toFixed(3)} m`], ['Circular arc left, Δ − 2θs', '27.746° !', `${deg(k.DeltaC).toFixed(3)}°`]],
    bad: 5, note: 'Fig. 41 prints the remaining angle as 27.746°; 56 − 2 × 15.627 = 24.746°.' }; }
  if (m === 3) { const k = hc(DD, 200, 100), L = layout(k, 1), up = k.S / Math.cos(D / 2), mv = p => [p[0], p[1] + up]; return { old: circle(200), pts: withStraights(L.pts.map(mv), mv(L.TP), mv(L.PT)), focus: mv(L.CT), S: .3, title: '3 · KEEP THE CURVE, MOVE THE STRAIGHTS',
    rows: [['Shift for Ls 100 m on 200 m (Table 11)', '2.079 m', `${k.S.toFixed(3)} m`], ['Each straight moves out by', 's', `${k.S.toFixed(3)} m`], ['Circle', 'unchanged', 'same centre, same radius']],
    note: 'Check the effect on the next curves: their straights move too (cl. 7.10.3).' }; }
  // 4 · sharper curves at the ends: R2 375 m with Ls 122 m, the 400 m curve kept in the middle (concentric)
  const R0 = 400, R2 = 375, Ls = 122, k = hc(DD, R2, Ls), cosD2 = (R0 - R2 - k.S) / (R0 - R2), D2 = Math.acos(cosD2), ths = k.thetaS, mid = D - 2 * D2;
  const a = alignment([{ len: Ls, k0: 0, k1: 1 / R2 }, { len: R2 * (D2 - ths), k0: 1 / R2 }, { len: R0 * mid, k0: 1 / R0 }, { len: R2 * (D2 - ths), k0: 1 / R2 }, { len: Ls, k0: 1 / R2, k1: 0 }], { h0: D / 2 });
  const pi = meet([0, 0], D / 2, [a.end.x, a.end.y], a.end.h), pts = a.pts.map(p => [p[0] - pi[0], p[1] - pi[1]]), j = Math.round((Ls + R2 * (D2 - ths)) / .25);
  return { old: circle(R0), pts: withStraights(pts, pts[0], pts.at(-1)), focus: pts[j], S: .12, title: '4 · SHARPER CURVES AT THE ENDS (Ex 11.28)',
    rows: [['cos Δ2 = (400 − 375 − s) / 25', '0.93392', cosD2.toFixed(5)], ['Δ2', '20.945°', `${deg(D2).toFixed(3)}°`], ['θs = 122 × 28.65 / 375; s', '9.32°; 1.652 m', `${deg(ths).toFixed(3)}°; ${k.S.toFixed(3)} m`], ['375 m arc, Δ2 − θs', '11.625°', `${deg(D2 - ths).toFixed(3)}°`], ['400 m arc kept, Δ − 2Δ2', '—', `${deg(mid).toFixed(3)}°`]],
    note: 'First tried 350 m with 130 m: Δ2 16.31°, only 23.38° of the old curve left. The book’s “+ 3.93” and 23.395 are spurious.' };
}

export default {
  cam: { pos: [3, 40, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { m: 1, carD: 0 };
    let S = .3, ox = 0, oz = 0, cur = null, track = null, road = null;
    const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S);
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 34, 91); group.add(forest);
    const old = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .08, dashed: true }); group.add(old);
    const lab = (t, col, h = .58) => { const l = holo.label(t, { h, color: col, bg: 'rgba(255,253,248,.92)', weight: 700 }); group.add(l); return l; };
    const tags = { old: lab('old curve', '#c23b2f'), neu: lab('new road', '#24557a') };
    const auto = car(1, 0x24557a); group.add(auto);

    const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; if (!cur) return;
      c.fillStyle = '#24557a'; c.font = `700 15px ${F}`; c.fillText(cur.title, 18, 26);
      c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText(`Old curve: R ${cur.old.R} m, Δ 56°, no transition. Dashed red.`, 18, 44);
      c.font = `600 12px ${F}`; c.textAlign = 'right'; c.fillText('BOOK', W - 160, 66); c.fillText('COMPUTED', W - 18, 66); c.textAlign = 'left';
      cur.rows.forEach(([a, b, v], i) => { const y = 90 + i * 26; c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(a, 18, y); c.textAlign = 'right'; c.font = `700 14px ${F}`; c.fillStyle = cur.bad === i ? '#b3362b' : '#14202b'; c.fillText(b, W - 160, y); c.fillStyle = '#1f7a45'; c.fillText(v, W - 18, y); c.textAlign = 'left'; });
      c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; let y = H - 30, line = '';
      for (const w of cur.note.split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > W - 36) { c.fillText(line, 18, y); y += 16; line = w; } else line = t; }
      c.fillText(line, 18, y);
    } });
    card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

    function rebuild() {
      cur = method(st.m); S = cur.S; ox = .5 - cur.focus[0] * S; oz = -5 + cur.focus[1] * S;
      if (road) group.remove(road.group); road = makeRoad(P, S); group.add(road.group);
      const rc = clipRun(cur.pts, P, SLAB); track = road.set(rc.pts);
      const oc = clipRun(cur.old.pts, P, SLAB); holo.setPoints(old, oc.pts.map(p => P(p, .1)));
      const f = cur.focus; tags.old.position.copy(P([f[0] + 3 / S, f[1] + 3.5 / S], 1.2)); tags.neu.position.copy(P([f[0] - 3 / S, f[1] - 3 / S], 1.2));
      auto.children[0].scale.setScalar(S * VEH);
      const near = rc.pts.filter((_, i) => i % 4 === 0).map(p => P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.8));
      card.redraw();
    }
    const NAMES = ['1 Reduce radius', '2 Keep radius', '3 Move straights', '4 Sharper ends'];
    const actions = NAMES.map((l, i) => ({ label: l, toggle: () => st.m === i + 1, run: () => { st.m = i + 1; rebuild(); } }));
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        if (track) { st.carD = (st.carD + dt * 12) % track.length; const p = track.at(st.carD); auto.position.copy(P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h; }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.m = 1; rebuild(); guide.reset(); },
      get debug() { return { m: st.m, rows: cur.rows, guide: guide.debug }; },
    };
    const L = actions.map(a => a.label);
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Why bother', show: L, text: 'The old road enters its curve with no transition. Each method slips a spiral in; watch the new road part from the dashed old one.',
          check: { q: 'Adding transitions to an old curve is…', options: ['a palliative; the real cure is a larger radius', 'as good as a new curve', 'never worth doing below standard'], answer: 0, why: 'It eases the change of direction and gives length for superelevation, an advantage even below standard, but it is a palliative; the real improvement is a larger radius (cl. 7.10.2).' } },
        { title: 'Methods 1–3', show: L, text: 'Reduce the radius; or keep it and move the centre; or keep the curve and move the straights. Each moves the road by about the shift.',
          check: { q: 'Keeping the radius, the centre moves by…', options: ['s / cos Δ/2', 's', 's tan Δ/2'], answer: 0, why: 'Method (2): keep the radius and shift the centre by s / cos (Δ/2), the straights unchanged (cl. 7.10.3, Fig. 22).' } },
        { title: 'Method 4', show: L, text: 'Sharper curves with transitions at the ends keep as much of the old 400 m curve as possible.',
          check: { q: 'Method 4 suits an old curve whose radius is…', options: ['well above the minimum', 'below the minimum', 'any radius'], answer: 0, why: 'Only where the existing radius is substantially above the minimum, and the new end curves not much sharper than the old one (cl. 7.10.3).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    rebuild();
    return api;
  },
};
