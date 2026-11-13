// Spreads 3–5 · Minimum length of transition (cl. 7.3, 7.4, eq. 16–19, Table 9). The site model closes in on the entry
// to a curve: straight, spiral (amber), circle. A car drives it.
//   'comfort' eq. (16)–(17): Ls = 0.0215 V³ / CR on the minimum radius for the speed (Table 3), or twice it
//   'super'   eq. (18)–(19): the outer edge (raised ×40, amber) climbs 7.9/2 × 0.07 m over the transition
//   'table9'  Table 9 for a speed and terrain, row by row, beside the two equations
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { horizontalCurve, layout } from '../../_irc38/curve.js';
import { diorama, trees, track, throughSlab, car, VEH } from '../../_irc38/site.js';
import { offsetPts, band, swapGeo, clipRun } from '../../_irc38/deck.js';
import { MIN_RADIUS, lsComfort, lsSuper, lsMin, rateC, t9, T9_R } from '../../_irc38/tables.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, DELTA = 70, LANE = 3.5, S = .14, LIFT = 40;
const RISE = 7.9 / 2 * .07;   // outer edge above the centre line at full superelevation (cl. 7.3.3)
const up5 = x => Math.ceil(x / 5 - 1e-9) * 5;

export function lengthSpread(mode) {
  const init = () => mode === 'comfort' ? { V: 65, big: false, hills: false, four: false, carD: 0 } : mode === 'super' ? { V: 50, big: false, hills: false, four: false, carD: 0 } : { V: 80, hills: false, ri: 0, carD: 0 };
  return {
    cam: { pos: [3, 38, 36], look: [3.5, 0, -2.5], portrait: { pos: [15, 58, 50], look: [12.3, 0, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const st = init();
      let ox = 0, oz = 0, road = null, off = 0, e1 = 0, Ls = 0;
      const P = (xy, h = 0) => new THREE.Vector3(ox + xy[0] * S, GROUND + h, oz - xy[1] * S);
      const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
      const forest = trees(slab, 30, 53); group.add(forest);
      const mk = m => { const x = new THREE.Mesh(new THREE.BufferGeometry(), m); x.receiveShadow = true; group.add(x); return x; };
      const deck = mk(SM.asphalt), shL = mk(SM.shoulder), shR = mk(SM.shoulder), edL = mk(SM.paint), edR = mk(SM.paint);
      const centre = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.WHITE, { width: .05, dashed: true }); group.add(centre);
      const spiralLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .09 }); group.add(spiralLine);
      const edge = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .08 }); group.add(edge);
      // a translucent curtain under the outer edge, so the length of the build-up can be seen at a glance
      const curtain = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xb0532a, transparent: true, opacity: .26, side: THREE.DoubleSide, depthWrite: false })); group.add(curtain);
      const wall = (base, top) => { const pos = [], idx = []; base.forEach((b, i) => { const t = top[i]; pos.push(b.x, b.y, b.z, t.x, t.y, t.z); if (i) { const v = 2 * i; idx.push(v - 2, v - 1, v, v - 1, v + 1, v); } }); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g; };
      const tags = ['T.P.', 'C.T.'].map(n => { const t = holo.label(n, { h: .62, color: '#14202b', bg: 'rgba(255,253,248,.92)', weight: 700 }); group.add(t); return t; });
      const edgeTag = holo.label(mode === 'comfort' ? 'sideways acceleration builds up over the spiral' : 'outer edge, heights ×40', { h: .55, color: '#8a3f1c', bg: 'rgba(255,253,248,.92)' }); group.add(edgeTag);
      const auto = car(S * VEH, 0x24557a); group.add(auto);
      // comfort: a speed handle by the road; sliding it sideways steps through the design speeds of Table 3
      const SPD = [20, 25, 30, 35, 40, 50, 65, 80, 100], knob = mode === 'comfort' ? holo.handle('speed', { label: 'speed · drag', kind: 'lever', r: .8 }) : null;
      if (knob) group.add(knob);
      let grip = null;

      const rows9 = () => T9_R.filter(R => t9(st.V, st.hills ? 'H' : 'P', R) != null);
      const R = () => mode === 'table9' ? rows9()[Math.min(st.ri, rows9().length - 1)] : (st.hills ? MIN_RADIUS[st.V][2] : MIN_RADIUS[st.V][0]) * (st.big ? 2 : 1);
      const lsFor = () => {
        if (mode === 'comfort') return up5(lsComfort(st.V, R()));
        if (mode === 'super') return up5(lsSuper(st.V, R(), st.hills) * (st.four ? 1.5 : 1));
        const p = t9(st.V, st.hills ? 'H' : 'P', R()); return typeof p === 'number' ? p : 0;
      };

      const card = textPlane({ w: 9.8, h: 7, px: 46, draw: (c, W, H) => {
        cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
        const row = (a, b, y, col = '#14202b') => { c.fillStyle = '#5c6168'; c.font = `500 15px ${F}`; c.fillText(a, 18, y); c.fillStyle = col; c.font = `700 16px ${F}`; c.textAlign = 'right'; c.fillText(b, W - 18, y); c.textAlign = 'left'; };
        const V = st.V, r = R(), v = V / 3.6, t = st.hills ? 'H' : 'P';
        if (mode === 'comfort') {
          c.fillText(`EQ. (16) · ${V} km/h · R ${r} m${st.big ? ' (twice the minimum)' : ' (Table 3 minimum)'}`, 18, 26);
          const y0 = 40, h = 96, s1 = Ls * 1.6 + 10, X = s => 18 + s / s1 * (W - 36), aF = v * v / r, Y = a => y0 + h - a / (aF * 1.2) * h;
          c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(18, y0, W - 36, h);
          c.strokeStyle = '#b0532a'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(Ls), Y(aF)); c.lineTo(X(s1), Y(aF)); c.stroke();
          c.fillStyle = '#5c6168'; c.font = `500 11px ${F}`; c.fillText('lateral acceleration, rising along the spiral', 22, y0 + 12); c.fillText('T.P.', X(0) + 2, y0 + h - 4); c.fillText('C.T.', X(Ls) - 10, y0 + h - 4);
          row('Speed v', `${v.toFixed(2)} m/s`, 160); row('Full push on the circle, v² / R', `${(v * v / r).toFixed(3)} m/s²`, 182);
          row('C = 80 / (75 + V), 0.5 to 0.8  (eq. 17)', `${rateC(V).toFixed(3)} m/s³`, 204);
          row('Ls = 0.0215 V³ / C R  (eq. 16)', `${lsComfort(V, r).toFixed(1)} m`, 226, '#8a3f1c');
          row('Time on the spiral, Ls / v', `${(lsComfort(V, r) / v).toFixed(1)} s`, 248);
          c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText(`Built here as ${Ls} m, a whole multiple of 5 m (cl. 7.3.4). 0.0215 = 1/3.6³.`, 18, H - 12);
          return;
        }
        if (mode === 'super') {
          c.fillText(`EQ. (${st.hills ? 19 : 18}) · ${st.hills ? 'hills, 1 in 60' : 'plain, 1 in 150'} · ${V} km/h · R ${r} m${st.four ? ' · four-lane' : ''}`, 18, 26);
          const y0 = 40, h = 96, s1 = Ls * 1.5 + 10, X = s => 18 + s / s1 * (W - 36), Y = z => y0 + h - z / (RISE * 1.25) * h;
          c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(18, y0, W - 36, h);
          const lim = st.hills ? 60 : 150; c.strokeStyle = '#c23b2f'; c.setLineDash([6, 4]); c.lineWidth = 2; c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(RISE * lim), Y(RISE)); c.stroke(); c.setLineDash([]);
          c.strokeStyle = '#b0532a'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(Ls), Y(RISE)); c.lineTo(X(s1), Y(RISE)); c.stroke();
          c.fillStyle = '#5c6168'; c.font = `500 11px ${F}`; c.fillText(`outer edge above the centre line (0.277 m) · red dashed: the steepest, 1 in ${lim}`, 22, y0 + 12);
          const sup = lsSuper(V, r, st.hills) * (st.four ? 1.5 : 1), com = lsComfort(V, r);
          row(`${st.hills ? 'V² / R  (eq. 19)' : '2.7 V² / R  (eq. 18)'}${st.four ? ' × 1.5' : ''}`, `${sup.toFixed(1)} m`, 160, '#8a3f1c');
          row('Comfort, 0.0215 V³ / C R  (eq. 16)', `${com.toFixed(1)} m`, 182);
          row('Transition: the greater (cl. 7.3.1)', `${up5(Math.max(sup, com))} m`, 204);
          row('Edge rises against the centre line at', `1 in ${(Ls / RISE).toFixed(0)}`, 226, Ls / RISE >= lim - .5 ? '#1f7a45' : '#b3362b');
          c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`;
          c.fillText(st.four ? 'Four-lane undivided or six-lane divided: 50 per cent more (cl. 7.3.3).' : 'Full superelevation is reached where R = 0.0635 V² (cl. 7.3.3).', 18, H - 12);
          return;
        }
        c.fillText(`TABLE 9 · ${V} km/h · ${st.hills ? 'mountainous and steep (H)' : 'plain and rolling (P)'}`, 18, 26);
        const list = rows9(), col = Math.ceil(list.length / 2);
        list.forEach((Rr, i) => {
          const x = i < col ? 18 : W / 2 + 6, y = 52 + (i % col) * 18, p = t9(V, t, Rr), on = Rr === r;
          if (on) { c.fillStyle = 'rgba(36,85,122,.14)'; c.fillRect(x - 4, y - 13, W / 2 - 22, 17); }
          c.fillStyle = '#5c6168'; c.font = `${on ? 700 : 500} 13px ${F}`; c.fillText(`R ${Rr} m`, x, y);
          c.fillStyle = typeof p === 'number' ? '#14202b' : '#8a3f1c'; c.textAlign = 'right'; c.fillText(typeof p === 'number' ? `${p} m` : p, x + W / 2 - 34, y); c.textAlign = 'left';
        });
        const p = t9(V, t, r), yb = 52 + col * 18 + 14;
        if (typeof p === 'number') {
          row('eq. (16), comfort', `${lsComfort(V, r).toFixed(1)} m`, yb); row(`eq. (${st.hills ? 19 : 18}), superelevation`, `${lsSuper(V, r, st.hills).toFixed(1)} m`, yb + 22);
          row('Greater, up to a multiple of 5 m', `${lsMin(V, r, st.hills)} m`, yb + 44); row('Table 9 prints', `${p} m`, yb + 66, p === lsMin(V, r, st.hills) ? '#1f7a45' : '#8a3f1c');
        } else {
          c.fillStyle = '#8a3f1c'; c.font = `600 15px ${F}`; c.fillText(p === 'NR' ? 'NR: no transition required at this radius.' : 'NA: this radius is below the minimum for the speed.', 18, yb);
          if (p === 'NR') { c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`; c.fillText(`Centrifugal ratio V²/127R = ${(V * V / (127 * r)).toFixed(3)}: drivers make their own transition (cl. 7.4).`, 18, yb + 22); }
        }
        c.fillStyle = '#5c6168'; c.font = `500 11px ${F}`; c.fillText('Table 9 never goes below 15 m; some cells differ by 5 m (judgement).', 18, H - 12);
      } });
      card.position.set(5.1, 2.8, 10.4); card.rotation.x = -.6; group.add(card);

      function rebuild() {
        Ls = lsFor();
        const k = horizontalCurve(DELTA, R(), Ls), L = layout(k, 1);
        ox = -6 - L.TP[0] * S; oz = 2.5 + L.TP[1] * S;
        const th = throughSlab(L, P, SLAB), rc = clipRun(th.pts, P, SLAB); road = track(rc.pts); off = rc.off; e1 = th.e1;
        swapGeo(deck, band(road, P, () => LANE, () => -LANE, .012)); swapGeo(shL, band(road, P, () => LANE, () => LANE + 1.5, .008)); swapGeo(shR, band(road, P, () => -LANE, () => -LANE - 1.5, .008));
        const lw = Math.max(.18, .045 / S); swapGeo(edL, band(road, P, () => LANE - lw * .4, () => LANE - lw * 1.4, .02)); swapGeo(edR, band(road, P, () => -LANE + lw * .4, () => -LANE + lw * 1.4, .02));
        holo.setPoints(centre, offsetPts(road, 0, 2).map(p => P(p, .03)));
        const onSlab = q => { const v = P(q); return v.x > SLAB.x0 && v.x < SLAB.x1 && v.z > SLAB.z0 && v.z < SLAB.z1; };
        const sp = Ls ? L.pts.slice(0, Math.ceil(Ls) + 1).filter(onSlab) : [];
        spiralLine.visible = sp.length > 1; if (sp.length > 1) holo.setPoints(spiralLine, sp.map(p => P(p, .04)));
        if (knob) { knob.position.copy(P(L.TP)); knob.position.z -= 2.8; }   // behind the road, clear of the guide card
        tags[0].position.copy(P(L.TP, 1.3)); tags[1].position.copy(P(L.CT, 1.3)); tags[1].visible = Ls > 0 && onSlab(L.CT);
        {   // the outer edge raised as it climbs from T.P. to C.T. (heights ×40) or, for eq. (16), the sideways acceleration
          const pts = offsetPts(road, LANE, 1), base = [], top = [];
          pts.forEach((q, i) => { const d = i * road.length / (pts.length - 1) + off - e1, f = Ls ? Math.max(0, Math.min(1, d / Ls)) : d > 0 ? 1 : 0; base.push(P(q, .03)); top.push(P(q, .03 + (mode === 'comfort' ? f * 1.6 : f * RISE * LIFT * S))); });
          holo.setPoints(edge, top); swapGeo(curtain, wall(base, top)); edgeTag.position.copy(P(L.CT, mode === 'comfort' ? 2.7 : 2.2));
        }
        const near = rc.pts.filter((_, i) => i % 3 === 0).map(p => P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.9));
        st.carD = 0; card.redraw();
      }
      const set = (k, v) => { st[k] = v; rebuild(); };
      function firstNum() { const l = rows9(); return Math.max(0, l.findIndex(Rr => typeof t9(st.V, st.hills ? 'H' : 'P', Rr) === 'number')); }
      const actions = mode === 'comfort' ? [
        ...[50, 65, 80, 100].map(V => ({ label: `${V} km/h`, toggle: () => st.V === V, run: () => set('V', V) })),
        { label: 'Twice the radius', toggle: () => st.big, run: () => set('big', !st.big) },
      ] : mode === 'super' ? [
        { label: 'Plain 1 in 150', toggle: () => !st.hills, run: () => set('hills', false) },
        { label: 'Hills 1 in 60', toggle: () => st.hills, run: () => { if (st.V > 50) st.V = 50; set('hills', true); } },
        ...[40, 50, 65].map(V => ({ label: `${V} km/h`, toggle: () => st.V === V, run: () => { if (V > 50) st.hills = false; set('V', V); } })),
        { label: 'Four-lane undivided', toggle: () => st.four, run: () => set('four', !st.four) },
      ] : [
        ...[100, 80, 50, 30].map(V => ({ label: `${V} km/h`, toggle: () => st.V === V, run: () => { st.V = V; if (V > 50) st.hills = false; st.ri = firstNum(); rebuild(); } })),
        { label: 'Hills', toggle: () => st.hills, run: () => { st.hills = !st.hills && st.V <= 50; st.ri = firstNum(); rebuild(); } },
        { label: 'Sharper', run: () => set('ri', Math.max(0, st.ri - 1)) },
        { label: 'Flatter', run: () => set('ri', Math.min(rows9().length - 1, st.ri + 1)) },
      ];
      if (mode === 'table9') st.ri = firstNum();
      const api = {
        group, targets: knob ? [knob] : [], actions, dragPlane: 'xz',
        press(hit) { grip = knob && tagged(hit.object, 'handle') ? Math.max(0, SPD.indexOf(st.V)) : null; },
        drag({ dx }) {
          if (grip == null) return;
          const V = SPD[Math.max(0, Math.min(SPD.length - 1, grip + Math.round(dx / 28)))];
          if (V !== st.V) { st.V = V; rebuild(); guide.say(`${V} km/h on R ${R()} m: Ls = 0.0215 V³ / CR = ${Ls} m.`); }
        },
        release() { grip = null; },
        tap(hit) { guide.tap(hit); },
        a11y: actions.map(a => ({ label: a.label, run: a.run })),
        update(dt) {
          anims.tick(dt);
          if (road) { st.carD += dt * 14; if (st.carD > road.length - 1) st.carD = 0; const p = road.at(st.carD); auto.position.copy(P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h; }
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
        },
        reset() { anims.clear(); Object.assign(st, init()); if (mode === 'table9') st.ri = firstNum(); rebuild(); guide.reset(); },
        get debug() { const r = R(); return { mode, V: st.V, R: r, hills: st.hills, Ls, eq16: +lsComfort(st.V, r).toFixed(2), eq1819: +lsSuper(st.V, r, st.hills).toFixed(2), table9: mode === 'table9' ? t9(st.V, st.hills ? 'H' : 'P', r) : null, guide: guide.debug }; },
      };
      const L = actions.map(a => a.label);
      const STEPS = {
        comfort: [
          { title: 'The rate C', show: L, text: 'Along the spiral the push v²/R grows from nothing at T.P. to full at C.T. Its rate of growth is C.',
            check: { q: 'C = 80 / (75 + V) is limited to…', options: ['between 0.5 and 0.8', 'between 0.1 and 0.3', 'at least 1.0'], answer: 0, why: 'C is subject to a maximum of 0.8 and a minimum of 0.5 (eq. 17, cl. 7.3.2).' } },
          { title: 'Faster', show: L, text: 'Raise the speed. V³ grows fast, so the transition must grow too, even on the larger minimum radius.',
            check: { q: 'eq. (16) for 80 km/h on R 230 m?', options: ['about 93 m', 'about 47 m', 'about 186 m'], answer: 0, why: 'C = 80/155 = 0.516; Ls = 0.0215 × 512 000 / (0.516 × 230) = 92.7 m (eq. 16).' } },
          { title: 'Gentler curve', show: L, text: 'Double the radius: the push halves, and so does the transition needed for comfort.',
            check: { q: 'Doubling R changes eq. (16)’s Ls by…', options: ['half', 'twice', 'nothing'], answer: 0, why: 'Ls = 0.0215 V³ / (C R): Ls varies inversely with R.' } },
        ],
        super: [
          { title: 'The edge', show: L, text: 'The amber curtain rises to the outer edge, heights ×40. It climbs 0.277 m from T.P. to C.T.',
            check: { q: 'The edge may rise against the centre line in plain terrain no faster than…', options: ['1 in 150', '1 in 60', '1 in 20'], answer: 0, why: '0.66 per cent, 1 in 150, in plain and rolling terrain; 1.66 per cent, 1 in 60, in mountainous and steep terrain (cl. 7.3.3).' } },
          { title: 'Hills', show: L, text: 'Hill roads allow 1 in 60, so eq. (19) drops the 2.7: Ls = V²/R.',
            check: { q: 'Which governs the transition length?', options: ['the greater of eq. (16) and eq. (18) or (19)', 'always eq. (16)', 'always eq. (18)'], answer: 0, why: 'The transition length is the greater of the values from the rate of change of centrifugal acceleration and of superelevation (cl. 7.3.1).' } },
          { title: 'Wide roads', show: L, text: 'A four-lane undivided road tilts a wider pavement: take 50 per cent more.',
            check: { q: 'For four-lane undivided and six-lane divided roads, eq. (18)–(19) lengths are…', options: ['increased by 50 per cent', 'halved', 'used as they are'], answer: 0, why: 'They were derived for two-lane roads; for four-lane undivided and six-lane divided highways it is preferable to increase them by 50 per cent (cl. 7.3.3).' } },
        ],
        table9: [
          { title: 'Read it', show: L, text: 'Pick a speed and step the radius. The card sets each Table 9 cell beside eq. (16) and eq. (18) or (19).',
            check: { q: 'In practice Ls is taken as…', options: ['a whole multiple of 5 m', 'exactly the eq. (16) value', 'a multiple of 10 m'], answer: 0, why: 'If 5 m is the standard chord used in setting out, Ls is a whole multiple of 5 m, a little above the theoretical minimum (cl. 7.3.4).' } },
          { title: 'NA', show: L, text: 'Step to the sharpest radius: NA marks radii below the minimum for the speed.' },
          { title: 'NR', show: L, text: 'Step flatter until NR. At 80 km/h that is at 1200 m.',
            check: { q: 'Curves need not have transitions above a radius of…', options: ['1200 m', '360 m', '5000 m'], answer: 0, why: 'On a 1200 m curve at 80 km/h the centrifugal ratio is only 0.042; curves of more than 1200 m need not be given transitions (cl. 7.4.1, 7.4.3).' } },
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

export default lengthSpread('comfort');
