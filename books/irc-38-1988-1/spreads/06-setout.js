// Spread 6 · Words for setting out (def. 5, 6, 8, 30–38). One transition, large, with T.P. as origin and the straight as
// the X axis. Drag "any point" along the spiral: its X and Y, the polar ray ρ and the angles α, θ and β = θ − α follow.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { spiralXY, horizontalCurve, deg } from '../../_irc38/curve.js';

const F = 'Inter, Segoe UI, Arial', S = .19, O = new THREE.Vector3(-10.5, .15, 3);   // T.P. on the page; X runs to +x, Y to −z
const R = 60, LS = 60;                                                                  // θs = 0.5 rad ≈ 28.6°: angles big enough to see

export default {
  cam: { pos: [3, 34, 32], look: [3, 1, -2], portrait: { pos: [15, 58, 50], look: [12.3, 0, -2] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const P = (x, y, h = 0) => new THREE.Vector3(O.x + x * S, O.y + h, O.z - y * S);
    const st = { l: 35, ctVals: false };
    const k = horizontalCurve(90, R, LS);                     // Δ large enough that this spiral is followed by a circle

    // the road: the straight before T.P., the spiral, a little of the circle after C.T.
    const path = [];
    for (let x = -14; x < 0; x += 1) path.push([x, 0]);
    for (let i = 0; i <= 60; i++) { const p = spiralXY(LS * i / 60, LS, R); path.push([p.x, p.y]); }
    const cx = k.Xc - R * Math.sin(k.thetaS), cy = k.Yc + R * Math.cos(k.thetaS);    // centre of the circle after C.T.
    for (let i = 1; i <= 12; i++) { const a = -Math.PI / 2 + k.thetaS + i * .025; path.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    const pos = [], idx = [], hw = 3.5;
    path.forEach((p, i) => {
      const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy);
      const L = P(p[0] - dy / m * hw, p[1] + dx / m * hw, .01), Rr = P(p[0] + dy / m * hw, p[1] - dx / m * hw, .01); pos.push(L.x, L.y, L.z, Rr.x, Rr.y, Rr.z);
      if (i) { const j = i * 2; idx.push(j - 2, j - 1, j, j - 1, j + 1, j); }
    });
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); rg.setIndex(idx); rg.computeVertexNormals();
    const road = new THREE.Mesh(rg, SM.asphalt); road.receiveShadow = true; group.add(road);
    const sp = path.filter(p => p[0] >= 0).slice(0, 61);
    group.add(holo.polyline(sp.map(p => P(p[0], p[1], .06)), holo.AMBER, { width: .12 }));
    group.add(holo.polyline(path.slice(path.length - 13).map(p => P(p[0], p[1], .06)), holo.CYAN, { width: .12 }));
    group.add(holo.polyline([P(-14, 0, .05), P(72, 0, .05)], holo.DIM, { width: .05, dashed: true }));        // the straight produced: X axis
    group.add(holo.polyline([P(0, 0, .05), P(0, 22, .05)], holo.DIM, { width: .04, dashed: true }));          // Y axis at T.P.
    const lab = (t, x, y, c = '#14202b', h = .75) => { const l = holo.label(t, { h, color: c, weight: 700 }); l.position.copy(P(x, y, .9)); group.add(l); return l; };
    lab('X', 70, -2.5, '#5c6168'); lab('Y', -2.5, 20, '#5c6168'); lab('T.P.', -2, -3.4); lab('C.T.', k.Xc + 2, k.Yc - 4);

    // live geometry for the point
    const line = (color, width, dashed = false) => holo.polyline([[0, 0, 0], [1, 0, 0]], color, { width, dashed });
    const ray = line(holo.CYAN, .08), tangent = line(holo.RED, .06, true), xLine = line(holo.GREEN, .06), yLine = line(holo.GREEN, .06);
    const aArc = line(holo.CYAN, .06), tArc = line(holo.RED, .06), bArc = line(holo.AMBER, .06);
    group.add(ray, tangent, xLine, yLine, aArc, tArc, bArc);
    const aLab = lab('α', 0, 0, '#1d5f87', .8), tLab = lab('θ', 0, 0, '#c23b2f', .8), bLab = lab('β', 0, 0, '#b0532a', .8), xLab = lab('X', 0, 0, '#2f8f55', .7), yLab = lab('Y', 0, 0, '#2f8f55', .7), rhoLab = lab('ρ', 0, 0, '#1d5f87', .8);
    const ctLines = holo.segments([[0, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]], holo.WHITE, .7, { width: .05 }); group.add(ctLines);
    const ctLabs = [lab('L.T.', 0, 0, '#262b31', .7), lab('S.T.', 0, 0, '#262b31', .7), lab('long chord', 0, 0, '#262b31', .65)];
    const hPt = holo.handle('pt', { label: 'any point · drag', kind: 'lever', r: .8 }); group.add(hPt);

    const arc = (cxp, cyp, r, a0, a1) => { const pts = []; for (let i = 0; i <= 16; i++) { const a = a0 + (a1 - a0) * i / 16; pts.push(P(cxp + r * Math.cos(a), cyp + r * Math.sin(a), .08)); } return pts; };
    const pt = () => { const p = spiralXY(st.l, LS, R), rho = Math.hypot(p.x, p.y), alpha = Math.atan2(p.y, p.x); return { ...p, rho, alpha, beta: p.theta - alpha }; };
    const readout = textPlane({ w: 9.4, h: 6.6, px: 46, draw: (c, W, H) => {
      const q = pt(); cardBg(c, W, H); c.textAlign = 'left';
      c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText(`ANY POINT · R ${R} m, Ls ${LS} m`, 20, 30);
      const rows = [['Distance from T.P., L', `${st.l.toFixed(1)} m`], ['X, Y (def. 30)', `${q.x.toFixed(2)}, ${q.y.toFixed(2)} m`], ['Polar ray ρ (def. 36)', `${q.rho.toFixed(2)} m`],
        ['Polar deflection α (def. 32)', `${deg(q.alpha).toFixed(2)}°`], ['Tangent angle θ (def. 38)', `${deg(q.theta).toFixed(2)}°`], ['β = θ − α (def. 34)', `${deg(q.beta).toFixed(2)}°`], ['α ÷ θ', q.theta > 1e-6 ? (q.alpha / q.theta).toFixed(3) : '–']];
      const ink = ['#14202b', '#2f8f55', '#1d5f87', '#1d5f87', '#c23b2f', '#b0532a', '#14202b'];
      rows.forEach(([a, b], i) => { const y = 62 + i * 33; c.fillStyle = '#5c6168'; c.font = `500 16px ${F}`; c.fillText(a, 20, y); c.fillStyle = ink[i]; c.font = `700 18px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 20, y); c.textAlign = 'left'; });
    } });
    readout.position.set(5.2, 2.6, 10.6); readout.rotation.x = -.6; group.add(readout);

    function place() {
      const q = pt(), X = q.x, Y = q.y;
      hPt.position.copy(P(X, Y, .05));
      holo.setPoints(ray, [P(0, 0, .09), P(X, Y, .09)]);
      const tx = Math.cos(q.theta), ty = Math.sin(q.theta), back = Math.min(Y / Math.max(ty, 1e-6), 80);   // tangent at the point, produced back to the X axis
      holo.setPoints(tangent, [P(X - tx * back, Y - ty * back, .09), P(X + tx * 10, Y + ty * 10, .09)]);
      holo.setPoints(xLine, [P(0, -1.5, .1), P(X, -1.5, .1)]); holo.setPoints(yLine, [P(X, 0, .1), P(X, Y, .1)]);
      xLab.position.copy(P(X / 2, -3.2, .9)); yLab.position.copy(P(X + 2, Y / 2, .9)); rhoLab.position.copy(P(X * .55 - 1.5, Y * .55 + 1.8, .9));
      holo.setPoints(aArc, arc(0, 0, 9, 0, q.alpha)); aLab.position.copy(P(11 * Math.cos(q.alpha / 2), 11 * Math.sin(q.alpha / 2), .9));
      const ix = X - Y / Math.max(Math.tan(q.theta), 1e-6);                                          // where the tangent meets the X axis
      holo.setPoints(tArc, arc(ix, 0, 6, 0, q.theta)); tLab.position.copy(P(ix + 8 * Math.cos(q.theta / 2), 8 * Math.sin(q.theta / 2), .9));
      holo.setPoints(bArc, arc(X, Y, 5, Math.PI + q.alpha, Math.PI + q.theta));
      bLab.position.copy(P(X + 7 * Math.cos(Math.PI + (q.alpha + q.theta) / 2), Y + 7 * Math.sin(Math.PI + (q.alpha + q.theta) / 2), .9));
      for (const l of [aArc, aLab, tArc, tLab, bArc, bLab]) l.visible = st.l > 4;
      // L.T., S.T. and the long chord for C.T. (def. 5, 6, 8)
      const lt = k.LT;
      holo.setPoints(ctLines, [P(0, 0, .11), P(lt, 0, .11), P(lt, 0, .11), P(k.Xc, k.Yc, .11), P(0, 0, .11), P(k.Xc, k.Yc, .11)]);
      ctLabs[0].position.copy(P(lt / 2, 3, .9)); ctLabs[1].position.copy(P((lt + k.Xc) / 2 + 3, k.Yc / 2, .9)); ctLabs[2].position.copy(P(k.Xc / 2, k.Yc / 2 + 4, .9));
      ctLines.visible = st.ctVals; ctLabs.forEach(l => { l.visible = st.ctVals; });
      readout.redraw();
    }
    const toL = (l, dur = .8) => { const a = st.l; anims.stop('l'); anims.add({ dur, tag: 'l', update: e => { st.l = a + (l - a) * e; place(); } }); };

    let grip = null;
    const actions = [
      { label: 'Near T.P.', run: () => toL(8) }, { label: 'Half way', run: () => toL(30) }, { label: 'At C.T.', run: () => toL(LS) },
      { label: 'C.T. values', toggle: () => st.ctVals, run: () => { st.ctVals = !st.ctVals; place(); guide.say(st.ctVals ? `For C.T.: long tangent ${k.LT.toFixed(2)} m, short tangent ${k.ST.toFixed(2)} m, long chord ${k.LC.toFixed(2)} m.` : ''); } },
    ];
    const api = {
      group, dragPlane: 'xz', targets: [hPt], actions,
      press(hit) { grip = tagged(hit.object, 'handle') ? {} : null; anims.stop('l'); },
      drag({ point }) {
        if (!grip) return;
        const x = (point.x - O.x) / S, y = -(point.z - O.z) / S;
        let best = st.l, bd = 1e9; for (let l = 0; l <= LS; l += .25) { const p = spiralXY(l, LS, R, 24); const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = l; } }
        st.l = best; place(); const q = pt();
        guide.say(`L ${st.l.toFixed(0)} m: X ${q.x.toFixed(1)}, Y ${q.y.toFixed(2)} m · α ${deg(q.alpha).toFixed(1)}°, θ ${deg(q.theta).toFixed(1)}°, β ${deg(q.beta).toFixed(1)}°.`);
      },
      release() { grip = null; },
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      enter() { if (ctx.hero && !group.userData.man) { const m = ctx.hero(.9); m.position.copy(P(-6, -6)); m.rotation.y = -.9; group.add(m); group.userData.man = m; } },
      update(dt) {
        anims.tick(dt);
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        readout.position.x = tall ? 3.6 : 5.2; readout.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.l = 35; st.ctVals = false; place(); guide.reset(); },
      get debug() { const q = pt(); return { l: st.l, X: +q.x.toFixed(3), Y: +q.y.toFixed(3), alpha: +deg(q.alpha).toFixed(3), theta: +deg(q.theta).toFixed(3), beta: +deg(q.beta).toFixed(3), LT: +k.LT.toFixed(3), ST: +k.ST.toFixed(3), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'X and Y', show: ['Near T.P.', 'Half way', 'At C.T.'], text: 'T.P. is the origin. X runs along the straight, Y at right angles to it. Drag "any point" along the spiral.',
          check: { q: 'At T.P. itself, what are X and Y?', options: ['0 and 0', 'Ls and 0', 'R and 0'], answer: 0, why: 'T.P. is the origin of the coordinates (def. 30). At C.T. they become Xc, Yc (def. 31).' } },
        { title: 'Three angles', show: ['Near T.P.', 'Half way', 'At C.T.'], text: 'α: polar ray from the straight. θ: tangent from the straight. β: between the ray and the tangent. Watch α ÷ θ.',
          check: { q: 'Close to T.P., α is about what fraction of θ?', options: ['one third', 'one half', 'the same'], answer: 0, why: 'For the spiral α ≈ θ/3, so β ≈ 2θ/3. The ratio drifts only slightly below 1/3 as θ grows.' } },
        { title: 'At C.T.', show: ['Near T.P.', 'Half way', 'At C.T.', 'C.T. values'], text: 'Switch on the C.T. values: the long tangent, the short tangent and the long chord (def. 5, 6, 8).',
          check: { q: 'The long chord joins T.P. to…', options: ['C.T.', 'P.I.', 'the centre'], answer: 0, why: 'The long chord is the polar ray from the beginning to the end of the transition, T.P. to C.T. (def. 5).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    place();
    return api;
  },
};
