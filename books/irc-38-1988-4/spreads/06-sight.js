// Spreads 6–7 · Sight distance across the inside of a curve (cl. 6.4, eq. 14–15, Table 8, Fig. 17). A single-lane hill
// road (n = 0) on a circular curve; a car drives it and its sight line reaches S metres ahead along the road. The line
// turns red when anything on the inside of the curve stands in it.
//   'setback' drag the wall; pick R and S; compare eq. (14) with Table 8 (two printed values are misprints)
//   'cut'     a cut slope on the inside, the sight line 0.7 m (stopping) or 1.2 m (intermediate) high: cut back or bench
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { horizontalCurve, layout } from '../../_irc38/curve.js';
import { diorama, trees, track, throughSlab, car, VEH } from '../../_irc38/site.js';
import { setBack, SETBACK, SETBACK_S } from '../../_irc38/tables.js';
import { band, swapGeo, clipRun } from '../../_irc38/deck.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, HW = 1.875, HC = 7;
const printed = (R, S) => { const i = SETBACK_S.indexOf(S); return SETBACK[R]?.[i] ?? null; };

export function sightSpread(mode) {
  const cut = mode === 'cut';
  return {
    cam: { pos: [3, 38, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 58, 50], look: [12.3, 0, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const init = () => ({ R: cut ? 60 : 100, S: cut ? 45 : 60, wall: cut ? 0 : 6, h: .7, toe: 3, bench: false, carD: 0, blocked: false });
      const st = init();
      let S = .2, ox = 1, oz = -6, T = null, L = null, a0 = 0, a1 = 0, vA = 0, vB = 0;   // a0..a1: the arc; vA..vB: its part on the slab
      const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S);
      const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
      const forest = trees(slab, 30, 97); group.add(forest);
      const mk = m => { const x = new THREE.Mesh(new THREE.BufferGeometry(), m); x.receiveShadow = true; group.add(x); return x; };
      const deck = mk(SM.asphalt), shL = mk(SM.shoulder), shR = mk(SM.shoulder);
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xb9a88a, roughness: .9 });
      const wall = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), wallMat, 200); wall.castShadow = true; wall.count = 0; wall.visible = !cut; group.add(wall);
      const hill = mk([new THREE.MeshStandardMaterial({ color: 0x9c7f5d, roughness: .95, flatShading: true, side: THREE.DoubleSide }), new THREE.MeshStandardMaterial({ color: 0x8fa86c, roughness: .95, side: THREE.DoubleSide })]); hill.castShadow = true; hill.visible = cut;   // rock faces, grass on the flats
      const seeOk = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.GREEN, { width: .09 }), seeNo = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.RED, { width: .09 }); group.add(seeOk, seeNo);
      const sbLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .06, dashed: true }); group.add(sbLine);
      const sbTag = holo.label('set-back', { h: .6, color: '#8a3f1c', bg: 'rgba(255,253,248,.92)' }); group.add(sbTag);
      const target = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xc23b2f, roughness: .5 })); group.add(target);
      const grip = holo.handle('wall', { label: 'wall · drag', kind: 'lever' }); grip.visible = !cut; group.add(grip);
      const auto = car(1, 0x24557a); group.add(auto);

      const m = () => setBack(st.R, st.S, 0);
      const inward = q => st.R - Math.hypot(q[0] - L.O[0], q[1] - L.O[1]);   // metres inside the centre line
      const inSpan = q => { const a = Math.atan2(q[1] - L.O[1], q[0] - L.O[0]); return a >= a1 - 1e-6 && a <= a0 + 1e-6; };
      // the cut slope's height at an inward offset x: 1 : 1 face from the toe, or a bench at the sight line's height
      const prof = () => {
        const sb = m() + .5, top = Math.min(40, st.R - 6);
        if (st.bench && sb > st.toe + st.h) return [[st.toe, 0], [st.toe + st.h, st.h], [sb, st.h], [sb + HC - st.h, HC], [Math.max(top, sb + HC), HC]];
        return [[st.toe, 0], [st.toe + HC, HC], [Math.max(top, st.toe + HC + 1), HC]];
      };
      const cutAt = x => { const p = prof(); if (x <= p[0][0]) return 0; for (let i = 1; i < p.length; i++) if (x <= p[i][0]) { const [xa, za] = p[i - 1], [xb, zb] = p[i]; return za + (zb - za) * (x - xa) / Math.max(1e-6, xb - xa); } return p.at(-1)[1]; };

      const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, W, H) => {
        cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
        const row = (a, b, y, col = '#14202b') => { c.fillStyle = '#5c6168'; c.font = `500 15px ${F}`; c.fillText(a, 18, y); c.fillStyle = col; c.font = `700 16px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 18, y); c.textAlign = 'left'; };
        const th = st.S / (2 * st.R), mm = m();
        if (!cut) {
          c.fillText(`SET-BACK · R ${st.R} m · S ${st.S} m · single lane, n = 0`, 18, 26);
          row('θ = S / 2(R − n)', `${th.toFixed(4)} rad`, 62);
          row('m = R − (R − n) cos θ  (eq. 14)', `${mm.toFixed(2)} m`, 90, '#8a3f1c');
          const p = printed(st.R, st.S);
          row('Table 8 prints', p == null ? 'not tabulated' : `${p.toFixed(1)} m`, 118);
          row('The wall stands at', `${st.wall.toFixed(1)} m`, 146);
          const ok = st.wall >= mm - .02;
          c.fillStyle = ok ? '#1f7a45' : '#b3362b'; c.font = `700 17px ${F}`;
          c.fillText(ok ? '✓ The wall is clear of the sight line' : '✗ The wall blocks the view: move it back', 18, 186);
          if (p != null && Math.abs(p - mm) > .15) { c.fillStyle = '#b3362b'; c.font = `600 13px ${F}`; c.fillText(`Table 8 prints ${p.toFixed(1)} m; eq. (14) gives ${mm.toFixed(2)} m: a misprint.`, 18, 214); }
          c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`;
          c.fillText('m is measured from the centre line; n from the centre line to the middle', 18, H - 52);
          c.fillText('of the inside lane (Fig. 17). Table 8 assumes the curve is longer than S;', 18, H - 34);
          c.fillText('for shorter curves its values are somewhat high (cl. 6.4.3).', 18, H - 16);
          return;
        }
        c.fillText(`CUT SLOPE · R ${st.R} m · S ${st.S} m · sight line ${st.h} m high`, 18, 26);
        // cross-section at the middle of the sight line: centre line at 0, inside to the right
        const x0 = -3, x1 = Math.max(mm + 6, 12), y0 = 40, h = 96, zmax = 6, X = x => 18 + (x - x0) / (x1 - x0) * (W - 36), Y = z => y0 + h - z / zmax * h;
        c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(18, y0, W - 36, h);
        c.fillStyle = 'rgba(156,127,93,.55)'; c.beginPath(); c.moveTo(X(x0), Y(0));
        for (let x = x0; x <= x1; x += (x1 - x0) / 200) c.lineTo(X(x), Y(Math.min(zmax, cutAt(x)))); c.lineTo(X(x1), Y(0)); c.closePath(); c.fill();
        c.fillStyle = '#3a3f45'; c.fillRect(X(-HW), Y(0) - 3, X(HW) - X(-HW), 4);
        c.strokeStyle = '#2f8f55'; c.setLineDash([6, 4]); c.lineWidth = 2; c.beginPath(); c.moveTo(X(x0), Y(st.h)); c.lineTo(X(x1), Y(st.h)); c.stroke();
        c.strokeStyle = '#b0532a'; c.beginPath(); c.moveTo(X(mm), y0); c.lineTo(X(mm), y0 + h); c.stroke(); c.setLineDash([]);
        const hm = cutAt(mm), ok = hm <= st.h + 1e-6;
        c.fillStyle = ok ? '#2f8f55' : '#c23b2f'; c.beginPath(); c.arc(X(mm), Y(st.h), 6, 0, Math.PI * 2); c.fill();
        c.font = `600 12px ${F}`; c.fillStyle = '#14202b'; c.fillText('road', X(-HW), Y(0) + 14); c.fillStyle = '#8a3f1c'; c.fillText('set-back line', X(mm) + 5, y0 + 14);
        row('Set-back m (eq. 14)', `${mm.toFixed(2)} m`, 172, '#8a3f1c');
        row('Height of the cut at the set-back line', `${hm.toFixed(2)} m`, 196);
        row('Toe of the cut from the centre line', `${st.toe.toFixed(1)} m`, 220);
        c.fillStyle = ok ? '#1f7a45' : '#b3362b'; c.font = `700 16px ${F}`;
        c.fillText(ok ? `✓ The cut is below the ${st.h} m sight line` : `✗ The cut rises above ${st.h} m: cut back or bench`, 18, 250);
        c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`;
        c.fillText(st.S > 45 ? 'Intermediate S 90 m at 40 km/h: IRC : 66. Rarely economical (cl. 6.4.4).' : '0.7 m: the bare minimum, for stopping sight (cl. 6.4.5). S 45 m: Table 8.', 18, H - 12);
      } });
      card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

      function rebuild() {
        const D = Math.min(150, Math.max(70, st.S / st.R * 180 / Math.PI + 40));
        const k = horizontalCurve(D, st.R, 0); L = layout(k, 1);
        // close in on the bend: about one sight distance across the slab, the inside of the curve towards the reader
        S = Math.min(.3, 21 / (st.S * 1.1 + 30)); ox = 1; oz = -11 - k.Es * S;
        const th = throughSlab(L, P, SLAB), run = clipRun(th.pts, P, SLAB); T = track(run.pts);
        a0 = Math.atan2(L.TP[1] - L.O[1], L.TP[0] - L.O[0]); a1 = Math.atan2(L.PT[1] - L.O[1], L.PT[0] - L.O[0]);
        const on = q => { const v = P(q); return v.x > SLAB.x0 + .4 && v.x < SLAB.x1 - .4 && v.z > SLAB.z0 + .4 && v.z < SLAB.z1 - .4; }, seen = [];
        for (let i = 0; i <= 240; i++) { const a = a1 + (a0 - a1) * i / 240; if (on([L.O[0] + st.R * Math.cos(a), L.O[1] + st.R * Math.sin(a)])) seen.push(a); }
        vA = Math.max(...seen); vB = Math.min(...seen);
        swapGeo(deck, band(T, P, () => HW, () => -HW, .012)); swapGeo(shL, band(T, P, () => HW, () => HW + 1, .008)); swapGeo(shR, band(T, P, () => -HW, () => -HW - 1, .008));
        const arcAt = (r, n = 80) => { const out = []; for (let i = 0; i <= n; i++) { const a = vA + (vB - vA) * i / n; out.push([L.O[0] + r * Math.cos(a), L.O[1] + r * Math.sin(a)]); } return out; };
        holo.setPoints(sbLine, arcAt(st.R - m()).map(p => P(p, .05)));
        const mid = arcAt(st.R - m() - 2.5, 2)[1]; sbTag.userData.setText(`set-back ${m().toFixed(2)} m`); sbTag.position.copy(P(mid, 1.1));
        if (cut) buildHill(); else placeWall();
        target.scale.setScalar(Math.max(.15, .8 * S * VEH));
        auto.children[0].scale.setScalar(S * VEH);
        const c0 = P(L.O), near = run.pts.filter((_, i) => i % 3 === 0).map(p => P(p));
        forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.4) || (x - c0.x) ** 2 + (z - c0.z) ** 2 < ((st.R - .5) * S) ** 2);
        card.redraw();
      }
      function placeWall() {
        const r = st.R - st.wall, n = Math.min(200, Math.ceil(r * (vA - vB) / 2)), dummy = new THREE.Object3D();
        for (let i = 0; i < n; i++) {
          const a = vA + (vB - vA) * (i + .5) / n, q = [L.O[0] + r * Math.cos(a), L.O[1] + r * Math.sin(a)], p = P(q, 0);
          dummy.scale.set(Math.max(.08, .6 * S), 2.5 * S, r * (vA - vB) / n * S * 1.02); dummy.position.set(p.x, p.y + dummy.scale.y / 2, p.z); dummy.rotation.set(0, a, 0); dummy.updateMatrix(); wall.setMatrixAt(i, dummy.matrix);
        }
        wall.count = n; wall.instanceMatrix.needsUpdate = true;
        const am = (vA + vB) / 2; grip.position.copy(P([L.O[0] + r * Math.cos(am), L.O[1] + r * Math.sin(am)], 2.5 * S + .1));
      }
      function buildHill() {
        const pr = prof(), n = 60, pos = [], idx = [], cols = pr.length;
        for (let i = 0; i <= n; i++) {
          const a = vA + (vB - vA) * i / n, ca = Math.cos(a), sa = Math.sin(a);
          for (const [x, z] of pr) { const r = st.R - x, q = P([L.O[0] + r * ca, L.O[1] + r * sa], z * S); pos.push(q.x, q.y, q.z); }
        }
        const g = new THREE.BufferGeometry();
        for (let j = 0; j < cols - 1; j++) {   // one group per profile segment: faces rock, flats grass
          const start = idx.length;
          for (let i = 1; i <= n; i++) { const p0 = (i - 1) * cols + j, p1 = i * cols + j; idx.push(p0, p1, p0 + 1, p1, p1 + 1, p0 + 1); }
          g.addGroup(start, idx.length - start, pr[j][1] === pr[j + 1][1] ? 1 : 0);
        }
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); swapGeo(hill, g);
      }
      // the sight line from the car to the point S ahead along the road; red when the wall or the cut is in it
      function sight() {
        const p = T.at(st.carD), q = T.at(Math.min(T.length, st.carD + st.S)), lift = cut ? st.h : 1.2;
        let blocked = false;
        for (let i = 1; i < 24 && !blocked; i++) {
          const f = i / 24, s = [p.x + (q.x - p.x) * f, p.y + (q.y - p.y) * f];
          if (!inSpan(s)) continue;
          const x = inward(s); blocked = cut ? cutAt(x) > st.h + 1e-6 : x > st.wall;
        }
        const pts = [P([p.x, p.y], lift * S + .05), P([q.x, q.y], lift * S + .05)];
        seeOk.visible = !blocked; seeNo.visible = blocked; holo.setPoints(blocked ? seeNo : seeOk, pts);
        target.position.copy(P([q.x, q.y], target.scale.y / 2));
        st.blocked = blocked;
      }
      const set = (k, v) => { st[k] = v; rebuild(); };
      const actions = cut ? [
        { label: 'Stopping 0.7 m', toggle: () => st.S === 45, run: () => { st.h = .7; set('S', 45); } },
        { label: 'Intermediate 1.2 m', toggle: () => st.S === 90, run: () => { st.h = 1.2; set('S', 90); } },
        { label: 'Cut back 1 m', run: () => { st.bench = false; set('toe', Math.min(25, st.toe + 1)); } },
        { label: 'Bench', toggle: () => st.bench, run: () => set('bench', !st.bench) },
        { label: 'Restore slope', run: () => { st.bench = false; set('toe', 3); } },
      ] : [
        ...[33, 50, 100, 150].map(R => ({ label: `R ${R} m`, toggle: () => st.R === R, run: () => { st.wall = Math.min(st.wall, R - 4); set('R', R); } })),
        ...[30, 45, 60].map(s => ({ label: `S ${s} m`, toggle: () => st.S === s, run: () => set('S', s) })),
      ];
      let dragging = false;
      const nudge = dv => { st.wall = THREE.MathUtils.clamp(st.wall + dv, .5, Math.min(20, st.R - 4)); placeWall(); card.redraw(); };
      const api = {
        group, dragPlane: 'xz', targets: [grip], actions,
        press(hit) { dragging = !cut && !!tagged(hit.object, 'handle'); },
        drag({ point }) {
          if (!dragging) return;
          const q = [(point.x - ox) / S, -(point.z - oz) / S];
          st.wall = Math.round(THREE.MathUtils.clamp(inward(q), .5, Math.min(20, st.R - 4)) * 10) / 10; placeWall(); card.redraw();
        },
        release() { if (!dragging) return; dragging = false; const ok = st.wall >= m() - .02; guide.say(ok ? `Clear: the wall is ${st.wall.toFixed(1)} m in, beyond the ${m().toFixed(2)} m set-back.` : `Blocked: the wall at ${st.wall.toFixed(1)} m is inside the ${m().toFixed(2)} m set-back.`); },
        tap(hit) { guide.tap(hit); },
        a11y: [...actions.map(a => ({ label: a.label, run: a.run })), ...(cut ? [] : [{ label: 'Wall 1 m farther from the road', run: () => nudge(1) }, { label: 'Wall 1 m nearer the road', run: () => nudge(-1) }])],
        update(dt) {
          anims.tick(dt);
          if (T) { st.carD = (st.carD + dt * 12) % Math.max(1, T.length - st.S); const p = T.at(st.carD); auto.position.copy(P([p.x, p.y], .01)); auto.rotation.y = p.h; sight(); }
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
        },
        reset() { anims.clear(); Object.assign(st, init()); rebuild(); guide.reset(); },
        get debug() { return { mode, R: st.R, S: st.S, m: +m().toFixed(3), table8: printed(st.R, st.S), wall: st.wall, toe: st.toe, bench: st.bench, h: st.h, cutAtM: cut ? +cutAt(m()).toFixed(3) : null, blocked: st.blocked, guide: guide.debug }; },
      };
      const L0 = actions.map(a => a.label);
      const STEPS = cut ? [
        { title: 'Stopping', show: L0.filter(l => l !== 'Intermediate 1.2 m'), text: 'A cut slope on the inside of the bend hides the road ahead. Cut it back, or bench it, until it is below the 0.7 m sight line.',
          check: { q: 'Average height of the sight line for stopping sight distance?', options: ['0.7 m', '1.2 m', '2.0 m'], answer: 0, why: 'An average height of 0.7 m may be taken for stopping sight distance, the bare minimum; 1.2 m for intermediate or overtaking (cl. 6.4.5).' } },
        { title: 'Intermediate', show: L0, text: 'Switch to intermediate sight distance: the set-back jumps to about 16 m. Count the cut-backs it needs.',
          check: { q: 'Set-backs for intermediate or overtaking sight distance are…', options: ['usually too large to be economical except on very flat curves', 'always provided', 'never computed'], answer: 0, why: 'They are computed the same way but are usually too large to be economical except on very flat curves (cl. 6.4.4).' } },
        { title: 'Summits', show: L0, text: 'Where this bend also sits on a summit, the driver must see over the crest as well as round the bend.',
          check: { q: 'Where a horizontal curve overlaps a summit vertical curve…', options: ['sight distance must be provided both vertically and horizontally', 'only the vertical sight distance matters', 'only the horizontal sight distance matters'], answer: 0, why: 'The design should provide the required sight distance both in the vertical direction along the pavement and in the horizontal direction on the inside of the curve (cl. 6.4.6).' } },
      ] : [
        { title: 'Move the wall', show: [], text: 'Drag the wall on the inside of the bend towards the road until the sight line turns red.',
          check: { q: 'In m = R − (R − n) cos θ, what is n?', options: ['the distance from the centre line to the middle of the inside lane', 'the number of lanes', 'the radius of the inner edge'], answer: 0, why: 'n is the distance between the centre line of the road and the centre line of the inside lane; on a single-lane road it is 0 (cl. 6.4.2, Fig. 17).' } },
        { title: 'Table 8', show: L0, text: 'Pick a radius and a sight distance. The card sets eq. (14) beside Table 8.',
          check: { q: 'R 100 m, S 60 m: set-back distance?', options: ['4.5 m', '2.5 m', '6.0 m'], answer: 0, why: 'θ = 60/200 = 0.3 rad; m = 100 (1 − cos 0.3) = 4.47 m; Table 8 prints 4.5 m.' } },
        { title: 'Misprint', show: L0, text: 'Now R 150 m with S 60 m: Table 8 prints 2.3 m, but eq. (14) gives 2.99 m. R 33 m with S 30 m is printed 3.7 m for 3.35 m.',
          check: { q: 'Table 8 assumes circular curves…', options: ['longer than the sight distance', 'shorter than the sight distance', 'with transitions only'], answer: 0, why: 'The values assume curves longer than the sight distance; for shorter curves they are somewhat high (cl. 6.4.3).' } },
      ];
      const guide = makeGuide(ctx, { anchor: [-5.4, 2.2, 10.5], w: 10, h: 5, steps: STEPS });
      guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
      card.userData.zoom = true; api.targets.push(card);
      rebuild();
      return api;
    },
  };
}

export default sightSpread('setback');
