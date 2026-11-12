// Spread 6 · Words for setting out (def. 5, 6, 8, 30–38), as a site model. One transition, large, T.P. as origin and the
// straight as the X axis; the surveyor's theodolite stands on T.P. Drag "any point" along the spiral to read X, Y, the
// polar ray ρ and the angles α, θ and β = θ − α. "Peg the spiral" sets it out the way the field does it: the instrument
// turns to each point's α, the chainman walks out one tenth of Ls and drives the peg.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { spiralXY, horizontalCurve, deg } from '../../_irc38/curve.js';
import { diorama, trees, makeRoad, worker, theodolite } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', S = .19, GROUND = .5, O = new THREE.Vector3(-10.2, GROUND, 3.6);   // T.P. on the page; X to +x, Y to −z
const R = 60, LS = 60, N = 10, CREWK = S * 3.6;                                                        // θs = 0.5 rad ≈ 28.6°
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };

export default {
  cam: { pos: [3, 38, 34], look: [3.5, 0, -2], portrait: { pos: [15, 58, 50], look: [12.3, 0, -2] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const P = (x, y, h = 0) => new THREE.Vector3(O.x + x * S, O.y + h, O.z - y * S);
    const PP = (xy, h = 0) => P(xy[0], xy[1], h);
    const st = { l: 35, ctVals: false, pegs: 0, pegging: false };
    const k = horizontalCurve(90, R, LS);

    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 30, 17); group.add(forest);
    // the road: the straight before T.P., the spiral, then the circle after C.T.
    const path = [];
    for (let x = -12; x < 0; x += 1) path.push([x, 0]);
    for (let i = 0; i <= 60; i++) { const p = spiralXY(LS * i / 60, LS, R); path.push([p.x, p.y]); }
    const cx = k.Xc - R * Math.sin(k.thetaS), cy = k.Yc + R * Math.cos(k.thetaS);
    for (let i = 1; i <= 30; i++) { const a = -Math.PI / 2 + k.thetaS + i * .025; const q = [cx + R * Math.cos(a), cy + R * Math.sin(a)]; const pg = PP(q); if (pg.z < SLAB.z0 + .6 || pg.x > SLAB.x1 - .6) break; path.push(q); }
    const road = makeRoad(PP, S); group.add(road.group); road.set(path, { stones: [12 + LS * .3, 12 + LS + 20], side: 1 });
    const near = path.filter((_, i) => i % 2 === 0).map(p => PP(p));
    forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.9) || Math.hypot(x - O.x, z - O.z) < 2.2);
    group.add(holo.polyline(path.slice(12, 73).map(p => PP(p, .06)), holo.AMBER, { width: .1 }));
    group.add(holo.polyline([P(-12, 0, .05), P(72, 0, .05)], holo.DIM, { width: .05, dashed: true }));        // X axis: the straight produced
    group.add(holo.polyline([P(0, 0, .05), P(0, 22, .05)], holo.DIM, { width: .04, dashed: true }));          // Y axis at T.P.
    const lab = (t, x, y, c = '#14202b', h = .75, bg = 'rgba(255,253,248,.9)') => { const l = holo.label(t, { h, color: c, weight: 700, bg }); l.position.copy(P(x, y, 1)); group.add(l); return l; };
    lab('X', 70, -3, '#5c6168'); lab('Y', -3, 20, '#5c6168'); lab('T.P.', -4, -5); lab('C.T.', k.Xc + 3, k.Yc - 5);

    // the survey party: theodolite on T.P., observer behind it, chainman
    const instrument = theodolite(CREWK), observer = worker(CREWK), chain = worker(CREWK);
    instrument.position.copy(P(0, 0)); observer.position.copy(P(-3.5, -2.5)); observer.rotation.y = .5; chain.position.copy(P(2, -4)); chain.rotation.y = 1.4;
    group.add(instrument, observer, chain);
    const sight = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .05, dashed: true, opacity: .8 }); sight.visible = false; group.add(sight);
    const pegMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .7 }), capMat = new THREE.MeshStandardMaterial({ color: 0xb0532a, roughness: .5 });
    const pegs = []; for (let i = 1; i <= N; i++) {
      const g = new THREE.Group(), post = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, .8, 8), pegMat); post.position.y = .4; post.castShadow = true;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .14, 8), capMat); cap.position.y = .82; g.add(post, cap);
      const p = spiralXY(LS * i / N, LS, R); g.position.copy(P(p.x, p.y)); g.visible = false; group.add(g); pegs.push(g);
    }

    // live geometry for "any point"
    const line = (color, width, dashed = false) => holo.polyline([[0, 0, 0], [1, 0, 0]], color, { width, dashed });
    const ray = line(holo.CYAN, .08), tangent = line(holo.RED, .06, true), xLine = line(holo.GREEN, .06), yLine = line(holo.GREEN, .06);
    const aArc = line(holo.CYAN, .06), tArc = line(holo.RED, .06), bArc = line(holo.AMBER, .06);
    group.add(ray, tangent, xLine, yLine, aArc, tArc, bArc);
    const aLab = lab('α', 0, 0, '#1d5f87', .8, null), tLab = lab('θ', 0, 0, '#c23b2f', .8, null), bLab = lab('β', 0, 0, '#b0532a', .8, null), xLab = lab('X', 0, 0, '#2f8f55', .7, null), yLab = lab('Y', 0, 0, '#2f8f55', .7, null), rhoLab = lab('ρ', 0, 0, '#1d5f87', .8, null);
    const ctLines = holo.segments([[0, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]], holo.WHITE, .7, { width: .05 }); group.add(ctLines);
    const ctLabs = [lab('L.T.', 0, 0, '#262b31', .7), lab('S.T.', 0, 0, '#262b31', .7), lab('long chord', 0, 0, '#262b31', .65)];
    const hPt = holo.handle('pt', { label: 'any point · drag', kind: 'lever', r: .8 }); group.add(hPt);
    const live = [ray, tangent, xLine, yLine, aArc, tArc, bArc, aLab, tLab, bLab, xLab, yLab, rhoLab, hPt];

    const arc = (cxp, cyp, r, a0, a1) => { const pts = []; for (let i = 0; i <= 16; i++) { const a = a0 + (a1 - a0) * i / 16; pts.push(P(cxp + r * Math.cos(a), cyp + r * Math.sin(a), .08)); } return pts; };
    const pt = l => { const p = spiralXY(l, LS, R), rho = Math.hypot(p.x, p.y), alpha = Math.atan2(p.y, p.x); return { ...p, rho, alpha, beta: p.theta - alpha }; };
    const readout = textPlane({ w: 9.4, h: 6.6, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
      if (st.pegs > 0) {   // the field book: polar deflection for each peg
        c.fillText('FIELD BOOK · polar deflection α from T.P.', 18, 28);
        for (let i = 1; i <= N; i++) {
          const col = i <= 5 ? 0 : 1, row = (i - 1) % 5, x = 18 + col * (W / 2), y = 62 + row * 36, q = pt(LS * i / N), done = i <= st.pegs;
          c.fillStyle = done ? '#14202b' : '#b9bec4'; c.font = `600 16px ${F}`; c.fillText(`peg ${i} · ${(LS * i / N).toFixed(0)} m`, x, y);
          c.font = `700 17px ${F}`; c.fillStyle = done ? '#1d5f87' : '#c9ced3'; c.textAlign = 'right'; c.fillText(`α ${deg(q.alpha).toFixed(3)}°`, x + W / 2 - 34, y); c.textAlign = 'left';
        }
        c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(`R ${R} m, Ls ${LS} m · chords of Ls/10 taken as arcs (cl. 7.8.1)`, 18, H - 16);
        return;
      }
      const q = pt(st.l); c.fillText(`ANY POINT · R ${R} m, Ls ${LS} m`, 20, 30);
      const rows = [['Distance from T.P., L', `${st.l.toFixed(1)} m`], ['X, Y (def. 30)', `${q.x.toFixed(2)}, ${q.y.toFixed(2)} m`], ['Polar ray ρ (def. 36)', `${q.rho.toFixed(2)} m`],
        ['Polar deflection α (def. 32)', `${deg(q.alpha).toFixed(2)}°`], ['Tangent angle θ (def. 38)', `${deg(q.theta).toFixed(2)}°`], ['β = θ − α (def. 34)', `${deg(q.beta).toFixed(2)}°`], ['α ÷ θ', q.theta > 1e-6 ? (q.alpha / q.theta).toFixed(3) : '–']];
      const ink = ['#14202b', '#2f8f55', '#1d5f87', '#1d5f87', '#c23b2f', '#b0532a', '#14202b'];
      rows.forEach(([a, b], i) => { const y = 62 + i * 33; c.fillStyle = '#5c6168'; c.font = `500 16px ${F}`; c.fillText(a, 20, y); c.fillStyle = ink[i]; c.font = `700 18px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 20, y); c.textAlign = 'left'; });
    } });
    readout.position.set(5.2, 2.6, 10.6); readout.rotation.x = -.6; group.add(readout);

    function place() {
      const q = pt(st.l), X = q.x, Y = q.y;
      hPt.position.copy(P(X, Y, .05));
      holo.setPoints(ray, [P(0, 0, .09), P(X, Y, .09)]);
      const tx = Math.cos(q.theta), ty = Math.sin(q.theta), back = Math.min(Y / Math.max(ty, 1e-6), 80);   // tangent at the point, produced back to the X axis
      holo.setPoints(tangent, [P(X - tx * back, Y - ty * back, .09), P(X + tx * 10, Y + ty * 10, .09)]);
      holo.setPoints(xLine, [P(0, -1.5, .1), P(X, -1.5, .1)]); holo.setPoints(yLine, [P(X, 0, .1), P(X, Y, .1)]);
      xLab.position.copy(P(X / 2, -3.4, 1)); yLab.position.copy(P(X + 2.5, Y / 2, 1)); rhoLab.position.copy(P(X * .55 - 1.5, Y * .55 + 2, 1));
      holo.setPoints(aArc, arc(0, 0, 9, 0, q.alpha)); aLab.position.copy(P(11 * Math.cos(q.alpha / 2), 11 * Math.sin(q.alpha / 2), 1));
      const ix = X - Y / Math.max(Math.tan(q.theta), 1e-6);
      holo.setPoints(tArc, arc(ix, 0, 6, 0, q.theta)); tLab.position.copy(P(ix + 8 * Math.cos(q.theta / 2), 8 * Math.sin(q.theta / 2), 1));
      holo.setPoints(bArc, arc(X, Y, 5, Math.PI + q.alpha, Math.PI + q.theta));
      bLab.position.copy(P(X + 7 * Math.cos(Math.PI + (q.alpha + q.theta) / 2), Y + 7 * Math.sin(Math.PI + (q.alpha + q.theta) / 2), 1));
      const angles = st.l > 4 && !st.pegging; for (const l of [aArc, aLab, tArc, tLab, bArc, bLab]) l.visible = angles;
      for (const l of [ray, tangent, xLine, yLine, xLab, yLab, rhoLab, hPt]) l.visible = !st.pegging;
      const lt = k.LT;
      holo.setPoints(ctLines, [P(0, 0, .11), P(lt, 0, .11), P(lt, 0, .11), P(k.Xc, k.Yc, .11), P(0, 0, .11), P(k.Xc, k.Yc, .11)]);
      ctLabs[0].position.copy(P(lt / 2, 3.4, 1)); ctLabs[1].position.copy(P((lt + k.Xc) / 2 + 3.5, k.Yc / 2, 1)); ctLabs[2].position.copy(P(k.Xc / 2, k.Yc / 2 + 4.5, 1));
      ctLines.visible = st.ctVals; ctLabs.forEach(l => { l.visible = st.ctVals; });
      readout.redraw();
    }
    const toL = (l, dur = .8) => { const a = st.l; anims.stop('l'); anims.add({ dur, tag: 'l', update: e => { st.l = a + (l - a) * e; place(); } }); };

    // polar deflection set-out: turn to α, walk out one chord, drive the peg
    function pegSpiral() {
      anims.stop('peg'); st.pegging = true; st.pegs = 0; pegs.forEach(p => { p.visible = false; }); sight.visible = true; place();
      let t = 0, from = [0, 0];
      for (let i = 1; i <= N; i++) {
        const q = pt(LS * i / N), to = [q.x, q.y], f = from.slice(), t0 = t;
        anims.add({ delay: t0, dur: .45, tag: 'peg', update: e => { const hd = instrument.userData.head; hd.rotation.y = THREE.MathUtils.lerp(hd.rotation.y, q.alpha, e); holo.setPoints(sight, [P(0, 0, .5), P(80 * Math.cos(hd.rotation.y), 80 * Math.sin(hd.rotation.y), .5)]); } });
        anims.add({ delay: t0 + .45, dur: .7, tag: 'peg', update: e => { const p = [f[0] + (to[0] - f[0]) * e, f[1] + (to[1] - f[1]) * e]; chain.position.copy(PP(p)); chain.position.y += Math.abs(Math.sin(e * Math.PI * 2)) * .06; chain.rotation.y = Math.atan2(to[1] - f[1], to[0] - f[0]); },
          done: () => { st.pegs = i; const g = pegs[i - 1]; g.visible = true; g.scale.set(1, .01, 1); anims.add({ dur: .3, update: e => g.scale.set(1, Math.max(.01, e), 1) }); ctx.snd?.play('tick'); readout.redraw(); guide.say(`Peg ${i}: turn to α = ${deg(q.alpha).toFixed(3)}°, measure one chord of ${(LS / N).toFixed(0)} m from the last peg to meet the sight line.`); } });
        t += 1.3; from = to;
      }
      anims.add({ delay: t, dur: .2, tag: 'peg', update: () => {}, done: () => { st.pegging = false; sight.visible = false; place(); guide.say(`Ten pegs set out C.T. from T.P. by angle and chord alone. Check: the last one should be at Xc ${k.Xc.toFixed(2)} m, Yc ${k.Yc.toFixed(2)} m.`); } });
    }

    let grip = null;
    const actions = [
      { label: 'Near T.P.', run: () => toL(8) }, { label: 'Half way', run: () => toL(30) }, { label: 'At C.T.', run: () => toL(LS) },
      { label: 'C.T. values', toggle: () => st.ctVals, run: () => { st.ctVals = !st.ctVals; place(); guide.say(st.ctVals ? `For C.T.: long tangent ${k.LT.toFixed(2)} m, short tangent ${k.ST.toFixed(2)} m, long chord ${k.LC.toFixed(2)} m.` : ''); } },
      { label: 'Peg the spiral', run: pegSpiral },
    ];
    const api = {
      group, dragPlane: 'xz', targets: [hPt], actions,
      press(hit) { grip = tagged(hit.object, 'handle') && !st.pegging ? {} : null; if (grip) { anims.stop('l'); if (st.pegs) { st.pegs = 0; pegs.forEach(p => { p.visible = false; }); } } },
      drag({ point }) {
        if (!grip) return;
        const x = (point.x - O.x) / S, y = -(point.z - O.z) / S;
        let best = st.l, bd = 1e9; for (let l = 0; l <= LS; l += .25) { const p = spiralXY(l, LS, R, 24); const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = l; } }
        st.l = best; place(); const q = pt(st.l);
        guide.say(`L ${st.l.toFixed(0)} m: X ${q.x.toFixed(1)}, Y ${q.y.toFixed(2)} m · α ${deg(q.alpha).toFixed(1)}°, θ ${deg(q.theta).toFixed(1)}°, β ${deg(q.beta).toFixed(1)}°.`);
      },
      release() { grip = null; },
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        readout.position.x = tall ? 3.6 : 5.2; readout.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.l = 35; st.ctVals = false; st.pegs = 0; st.pegging = false; sight.visible = false; pegs.forEach(p => { p.visible = false; }); place(); guide.reset(); },
      get debug() { const q = pt(st.l); return { l: st.l, X: +q.x.toFixed(3), Y: +q.y.toFixed(3), alpha: +deg(q.alpha).toFixed(3), theta: +deg(q.theta).toFixed(3), beta: +deg(q.beta).toFixed(3), LT: +k.LT.toFixed(3), ST: +k.ST.toFixed(3), pegs: st.pegs, guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'X and Y', show: ['Near T.P.', 'Half way', 'At C.T.'], text: 'The theodolite stands on T.P., the origin. X runs along the straight, Y at right angles. Drag "any point" along the spiral.',
          check: { q: 'At T.P. itself, what are X and Y?', options: ['0 and 0', 'Ls and 0', 'R and 0'], answer: 0, why: 'T.P. is the origin of the coordinates (def. 30). At C.T. they become Xc, Yc (def. 31).' } },
        { title: 'Three angles', show: ['Near T.P.', 'Half way', 'At C.T.', 'C.T. values'], text: 'α: polar ray from the straight. θ: tangent from the straight. β: between the ray and the tangent. Watch α ÷ θ.',
          check: { q: 'Close to T.P., α is about what fraction of θ?', options: ['one third', 'one half', 'the same'], answer: 0, why: 'For the spiral α ≈ θ/3, so β ≈ 2θ/3. The ratio drifts only slightly below 1/3 as θ grows.' } },
        { title: 'Peg it', show: ['Near T.P.', 'Half way', 'At C.T.', 'C.T. values', 'Peg the spiral'], text: 'Press "Peg the spiral". The surveyor turns to each α; the chainman measures one chord from the last peg to meet the sight line.',
          check: { q: 'To place each peg, the theodolite on T.P. is turned to…', options: ['the polar deflection α', 'the tangent angle θ', 'the angle β'], answer: 0, why: 'α is measured at T.P. from the straight to the point (def. 32): it is the angle read on the instrument. θ and β are at the point itself.' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    readout.userData.zoom = true; api.targets.push(readout);
    place();
    return api;
  },
};
