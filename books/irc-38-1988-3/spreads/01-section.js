// Spreads 1–4 · The road's cross-section through a curve, face-on on a lectern (like Figs. 6–8 and 11), heights drawn
// 4× so the tilt can be seen. A car on the outer lane carries the centrifugal arrow P and the friction it needs.
//   'why'    (cl. 5.1)             level road and superelevated road side by side at the same speed
//   'amount' (cl. 5.2, eq. 7)      three design methods charted: full at V, fixed 32 %, IRC ¾V; who needs friction
//   'table4' (Table 4, Fig. 10)    e = V²/225R by speed and terrain cap, the chart of Fig. 10
//   'camber' (cl. 5.3, Tables 5–6) camber kept round flat curves; Table 6 radius; the 5.3.3 check
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { diorama, car, MAT } from '../../_irc38/site.js';
import { eRequired, eDesign, CAMBER, CAMBERS, NO_SUPER, noSuperR } from '../../_irc38/tables.js';

const F = 'Inter, Segoe UI, Arial', S = .95, VX = 4, W = 7, FMAX = .15;   // page cm per m across; heights ×4; 7 m carriageway

/** A cross-section block: profile [inner y, centre y, outer y] in metres, extruded 3 m deep; car on the outer lane. */
function section(parent, holo, x0) {
  const g = new THREE.Group(); g.position.set(x0, 0, 0); parent.add(g);
  const deck = new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt); deck.castShadow = deck.receiveShadow = true; g.add(deck);
  const base = new THREE.Mesh(new THREE.BoxGeometry(W * S + 1.4, 1, 3.4), MAT.earth); base.position.y = -.55; g.add(base);
  g.add(holo.polyline([[-W * S / 2 - .6, 0, 1.75], [W * S / 2 + .6, 0, 1.75]], holo.DIM, { width: .045, dashed: true }));   // level, for comparison
  const vehicle = car(S * .62, 0x24557a); vehicle.rotation.y = Math.PI / 2; g.add(vehicle);
  const mk = color => {
    const a = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1, 8), m); sh.rotation.z = -Math.PI / 2;
    const hd = new THREE.Mesh(new THREE.ConeGeometry(.2, .45, 10), m); hd.rotation.z = -Math.PI / 2;
    a.add(sh, hd); a.userData = { sh, hd, m }; g.add(a); return a;
  };
  const pA = mk(0xc23b2f), fA = mk(0x2f8f55);
  const len = (a, L) => { a.userData.sh.scale.y = Math.max(.01, Math.abs(L)); a.userData.sh.position.x = L / 2; a.userData.hd.position.x = L + Math.sign(L || 1) * .22; a.userData.hd.rotation.z = L >= 0 ? -Math.PI / 2 : Math.PI / 2; a.visible = Math.abs(L) > .03; };
  const tag = holo.label('', { h: .55, color: '#14202b', bg: 'rgba(255,253,248,.92)', weight: 700 }); tag.position.set(0, 2.6, 1.8); g.add(tag);
  return {
    g, tag,
    set([yi, yc, yo], B, fNeed) {
      const sh = new THREE.Shape(), X = W * S / 2, Y = y => y * S * VX;
      sh.moveTo(-X, Y(yi) - .45); sh.lineTo(X, Y(yo) - .45); sh.lineTo(X, Y(yo)); sh.lineTo(0, Y(yc)); sh.lineTo(-X, Y(yi)); sh.closePath();
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: false }); geo.translate(0, 0, -1.5); deck.geometry.dispose(); deck.geometry = geo;
      // the car on the outer lane, sitting on the outer half's slope
      const xc = X / 2, slope = (Y(yo) - Y(yc)) / X, yCar = Y(yc) + slope * xc; vehicle.position.set(xc, yCar, 0); vehicle.rotation.z = Math.atan(slope);
      const cg = new THREE.Vector3(xc, yCar + 1.1, 1.6);
      pA.position.copy(cg); len(pA, B * 14);
      fA.position.set(xc, yCar + .2, 1.7); fA.rotation.z = Math.atan(slope); len(fA, -Math.max(-.3, Math.min(.3, fNeed)) * 14);
      fA.userData.m.color.setHex(fNeed > FMAX + 1e-9 ? 0xc23b2f : 0x2f8f55);
    },
  };
}

export function sectionSpread(mode) {
  return {
    cam: { pos: [4.6, 26, 40], look: [4.6, 2.6, -1], portrait: { pos: [15, 50, 56], look: [12.3, 1, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      group.add(diorama({ x0: -12.6, x1: 12.6, z0: -14, z1: 4, h: .5 }));
      const stand = new THREE.Group(); stand.position.set(0, 1.6, -1); stand.rotation.x = -.62; group.add(stand);
      const two = mode === 'why';
      const secs = two ? [section(stand, holo, -5.9), section(stand, holo, 5.9)] : [section(stand, holo, 0)];
      if (two) secs.forEach(s => s.g.scale.setScalar(.86));
      const st = { V: 80, R: 230, method: 'irc', cap: .07, surf: 1 };

      const camberPct = () => (CAMBER[st.surf][1] + CAMBER[st.surf][2]) / 2;
      const camber = () => camberPct() / 100;
      const B = () => st.V * st.V / (127 * st.R);
      const eOf = () => {   // the superelevation this spread applies
        if (mode === 'amount') return st.method === 'full' ? Math.min(.07, B()) : st.method === 'fixed' ? Math.min(.07, .32 * B()) : eDesign(st.V, st.R, .07);
        if (mode === 'table4') return eDesign(st.V, st.R, st.cap);
        if (mode === 'camber') return eRequired(st.V, st.R) < camber() ? null : Math.max(camber(), eDesign(st.V, st.R, .07));   // null: camber kept
        return eDesign(st.V, st.R, .07);
      };
      const profile = e => e === null ? [-camber() * W / 2, 0, -camber() * W / 2] : [-e * W / 2, 0, e * W / 2];

      const card = textPlane({ w: 9.6, h: 6.8, px: 46, draw: (c, Wc, H) => {
        cardBg(c, Wc, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`;
        const chart = (title, curves, x, y, w, h, maxR, maxE) => {   // e against R, like Fig. 10
          c.fillStyle = '#24557a'; c.font = `700 15px ${F}`; c.fillText(title, x, y - 8);
          c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(x, y, w, h);
          const X = r => x + r / maxR * w, Y = e => y + h - e / maxE * h;
          for (const [fn, col, dash] of curves) { c.strokeStyle = col; c.lineWidth = 3; c.setLineDash(dash || []); c.beginPath(); for (let r = 10; r <= maxR; r += maxR / 120) { const v = fn(r); if (r === 10) c.moveTo(X(r), Y(v)); else c.lineTo(X(r), Y(v)); } c.stroke(); c.setLineDash([]); }
          c.strokeStyle = '#14202b'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(Math.min(st.R, maxR)), y); c.lineTo(X(Math.min(st.R, maxR)), y + h); c.stroke();
          c.fillStyle = '#5c6168'; c.font = `500 12px ${F}`; c.fillText(`R ${st.R} m`, Math.min(x + w - 50, X(Math.min(st.R, maxR)) + 4), y + 14); c.fillText(`${maxE}`, x + 3, y + 12); c.fillText(`${maxR} m`, x + w - 40, y + h + 14);
        };
        if (mode === 'why') {
          const e = eDesign(st.V, st.R), fL = B(), fT = B() - e;
          c.fillText(`${st.V} km/h on R ${st.R} m · P/W = V²/127R = ${B().toFixed(3)}`, 18, 26);
          [['Level road: friction alone', fL], ['Superelevated, e = ' + e.toFixed(3), fT]].forEach(([a, f], i) => {
            const y = 70 + i * 60, ok = f <= FMAX; c.fillStyle = '#14202b'; c.font = `600 17px ${F}`; c.fillText(a, 18, y);
            c.fillStyle = ok ? '#1f7a45' : '#b3362b'; c.font = `700 17px ${F}`; c.fillText(`friction needed ${f.toFixed(3)} ${ok ? '✓ within 0.15' : '✗ over 0.15: skids'}`, 18, y + 26);
          });
          c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText('Less sideways force on the tyres also means fewer pot-holes (cl. 5.1).', 18, H - 18);
        } else if (mode === 'amount') {
          const V = st.V, maxR = 600;
          chart(`e against R at ${V} km/h · capped at 0.07`, [[r => Math.min(.07, V * V / (127 * r)), '#c23b2f', [6, 4]], [r => Math.min(.07, .32 * V * V / (127 * r)), '#8b959e', [3, 4]], [r => eDesign(V, r), '#24557a']], 18, 46, Wc - 36, 120, maxR, .08);
          c.font = `600 13px ${F}`; [['full at V', '#c23b2f'], ['32 %', '#8b959e'], ['IRC ¾V: V²/225R', '#24557a']].forEach(([t, col], i) => { c.fillStyle = col; c.fillText(t, 18 + i * 120, 196); });
          const e = eOf(); c.font = `600 15px ${F}`;
          [['slow 40', 40], [`¾V ${Math.round(V * .75)}`, V * .75], [`design ${V}`, V]].forEach(([t, v], i) => { const f = v * v / (127 * st.R) - e; c.fillStyle = f > FMAX ? '#b3362b' : f < 0 ? '#1d5f87' : '#1f7a45'; c.fillText(`${t}: f ${f.toFixed(3)}`, 18 + i * 145, 228); });
          c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`; c.fillText(`This method gives e = ${e.toFixed(3)}. Negative f: the tilt alone holds the car.`, 18, H - 18);
        } else if (mode === 'table4') {
          const maxR = st.cap > .08 ? 300 : 1500;
          chart(`Fig. 10 · e = V²/225R, cap ${st.cap.toFixed(2)}`, [20, 30, 40, 50, 65, 80, 100].map(v => [r => eDesign(v, r, st.cap), v === st.V ? '#8a3f1c' : 'rgba(29,95,135,.35)']), 18, 46, Wc - 36, 130, maxR, +(st.cap + .01).toFixed(2));
          const e = eDesign(st.V, st.R, st.cap); c.fillStyle = '#14202b'; c.font = `700 19px ${F}`; c.fillText(`${st.V} km/h, R ${st.R} m: e = ${e.toFixed(3)}`, 18, 214);
          c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(eRequired(st.V, st.R) > st.cap ? `V²/225R = ${eRequired(st.V, st.R).toFixed(3)}: limited to ${st.cap.toFixed(2)}` : 'Below the cap: e = V²/225R as Table 4 lists it', 18, 240);
          c.fillText(st.cap > .08 ? 'Hills not bound by snow: up to 0.10 (cl. 4.3)' : 'Plain, rolling and snow-bound hills: up to 0.07', 18, H - 18);
        } else {
          const cp = camberPct(), Rt = NO_SUPER[st.V]?.[CAMBERS.indexOf(cp)] ?? null, Rf = noSuperR(st.V, cp), keep = eOf() === null;
          c.fillText(`TABLES 5–6 · ${CAMBER[st.surf][0].toLowerCase()}`, 18, 26);
          const rows = [['Camber (Table 5, middle)', `${cp} %`], ['No superelevation beyond R = V²/225e', `${Rf.toFixed(0)} m`], ['Table 6', Rt ? `${Rt} m` : '—'], ['This curve', `R ${st.R} m at ${st.V} km/h`]];
          rows.forEach(([a, b], i) => { const y = 62 + i * 34; c.fillStyle = '#5c6168'; c.font = `500 16px ${F}`; c.fillText(a, 18, y); c.fillStyle = '#14202b'; c.font = `700 17px ${F}`; c.textAlign = 'right'; c.fillText(b, Wc - 18, y); c.textAlign = 'left'; });
          const f = B() + camber();   // the outer half slopes outward by the camber
          c.fillStyle = keep ? '#1f7a45' : '#24557a'; c.font = `700 16px ${F}`; c.fillText(keep ? `Camber kept: outer half −${cp} %, friction needed ${f.toFixed(3)}` : `Superelevate: e = ${eOf().toFixed(3)}`, 18, H - 44);
          c.fillStyle = '#5c6168'; c.font = `500 13px ${F}`; c.fillText('cl. 5.3.3: R 1500 m, camber 0.03, 100 km/h → 0.052 + 0.03 = 0.082, well within 0.15', 18, H - 18);
        }
      } });
      card.position.set(5.1, 2.7, 10.6); card.rotation.x = -.6; group.add(card);

      function place() {
        if (two) {
          secs[0].set([0, 0, 0], B(), B()); secs[0].tag.userData.setText('level road');
          const e = eDesign(st.V, st.R); secs[1].set(profile(e), B(), B() - e); secs[1].tag.userData.setText(`superelevated ${(e * 100).toFixed(1)} %`);
        } else {
          const e = eOf(), fNeed = e === null ? B() + camber() : B() - e;
          secs[0].set(profile(e), B(), fNeed); secs[0].tag.userData.setText(e === null ? `camber kept · ${camberPct()} % each way` : `e = ${(e * 100).toFixed(1)} %`);
        }
        card.redraw();
      }
      const chips = (vals, key, fmt) => vals.map(v => ({ label: fmt(v), toggle: () => st[key] === v, run: () => { st[key] = v; place(); } }));
      const V = mode === 'why' ? [40, 65, 80, 100] : mode === 'camber' ? [50, 65, 80, 100] : [30, 50, 65, 80, 100];
      const R = mode === 'camber' ? [400, 800, 1500, 2500] : mode === 'table4' ? [60, 150, 300, 600, 1200] : [120, 230, 400, 800];
      let actions = [...chips(V, 'V', v => `${v} km/h`), ...chips(R, 'R', r => `R ${r}`)];
      if (mode === 'amount') actions = [...chips(['full', 'fixed', 'irc'], 'method', m => ({ full: 'Full at V', fixed: '32 %', irc: 'IRC ¾V' })[m]), ...actions];
      if (mode === 'table4') actions = [...actions, ...chips([.07, .10], 'cap', c => c > .08 ? 'Hills, no snow' : 'Plain / snow')];
      if (mode === 'camber') actions = [...chips([0, 1, 2, 3], 'surf', i => ['Concrete', 'Thin bit.', 'WBM', 'Earth'][i]), ...actions, { label: 'cl. 5.3.3 check', run: () => { st.surf = 2; st.V = 100; st.R = 1500; place(); guide.say('WBM camber 0.03, R 1500 m, 100 km/h: centrifugal ratio 0.052; with the outer half sloping out by 0.03, friction needed 0.082 (cl. 5.3.3).'); } }];
      const R0 = mode === 'camber' ? 800 : mode === 'table4' ? 300 : 230; st.R = R0;
      const api = {
        group, targets: [], actions,
        tap(hit) { guide.tap(hit); },
        a11y: actions.map(a => ({ label: a.label, run: a.run })),
        update(dt) {
          anims.tick(dt);
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
        },
        reset() { anims.clear(); Object.assign(st, { V: 80, R: R0, method: 'irc', cap: .07, surf: 1 }); place(); guide.reset(); },
        get debug() { const e = eOf(); return { mode, V: st.V, R: st.R, B: +B().toFixed(4), e: e === null ? null : +e.toFixed(4), method: st.method, cap: st.cap, camber: camberPct(), guide: guide.debug }; },
      };
      const L = actions.map(a => a.label);
      const STEPS = {
        why: [
          { title: 'Level road', show: L, text: 'Both roads carry the same car round the same curve. On the level road friction alone must hold it.',
            check: { q: 'On a level road, what resists the centrifugal force (cl. 5.1)?', options: ['friction alone', 'the weight', 'nothing'], answer: 0, why: 'On a laterally level road friction alone has to counteract it; if friction is not enough the vehicle skids outward (cl. 5.1).' } },
          { title: 'Tilted road', show: L, text: 'On the tilted road the weight helps: the friction arrow shrinks. Raise the speed until the level road fails.',
            check: { q: 'On the superelevated road, what helps friction?', options: ['the weight along the surface', 'the camber', 'the wind'], answer: 0, why: 'When a road is superelevated, the component of the weight along the surface aids friction (cl. 5.1).' } },
          { title: 'Maintenance', show: L, text: 'Less sideways force also means less wear.',
            check: { q: 'Why does superelevation save maintenance?', options: ['fewer skids, fewer pot-holes', 'it drains rain away', 'it is cheaper to build'], answer: 0, why: 'Skidding and unequal wheel pressures from high sideways force give rise to pot-holes (cl. 5.1).' } },
        ],
        amount: [
          { title: 'Full at V', show: L, text: 'Design to cancel the push fully at the design speed: sharp curves hit the 7 % cap, flat ones need no friction at all.',
            check: { q: 'Why not counteract the centrifugal force fully (cl. 5.2.2)?', options: ['sharp curves would need over 7 %', 'it wastes asphalt', 'it is not allowed'], answer: 0, why: 'More than 7 per cent would be needed on sharp curves, inconvenient for slow vehicles, and the design would be unbalanced (cl. 5.2.2).' } },
          { title: '32 %', show: L, text: 'Counteracting a fixed 32 % leaves flatter curves under-tilted for traffic faster than the design speed.' },
          { title: 'IRC ¾V', show: L, text: 'IRC balances a vehicle at three-quarters of the design speed: e = V²/225R. Compare who needs friction.',
            check: { q: 'At what speed does IRC superelevation fully balance the push (cl. 5.2.3)?', options: ['¾ of the design speed', 'the design speed', 'half the design speed'], answer: 0, why: 'Most vehicles travel below the design speed, so e fully counteracts the centrifugal force at three-fourths of it: e = (0.75V)²/127R = V²/225R (eq. 7).' } },
        ],
        table4: [
          { title: 'Fig. 10', show: L, text: 'Each curve on the chart is one design speed; the bold one is yours. Pick radii to move along it.' },
          { title: 'The cap', show: L, text: 'Below a certain radius e stops rising: it is capped at 0.07, or 0.10 in hills without snow.',
            check: { q: 'In hills not bound by snow, Table 4 goes up to…', options: ['0.10', '0.07', '0.15'], answer: 0, why: 'Table 4’s right-hand block, for mountainous and steep terrain not bound by snow, runs to 0.10 (cl. 4.3).' } },
          { title: 'Largest radius', show: L, text: 'For a given speed, a larger radius needs less tilt and less friction.',
            check: { q: 'For a given design speed, Table 4 note (iii) advises…', options: ['the largest possible radius', 'the smallest radius', 'the cap value always'], answer: 0, why: 'For a given design speed adopt the largest possible radius (Table 4, note iii).' } },
        ],
        camber: [
          { title: 'Camber', show: L, text: 'A straight road is cambered both ways for drainage. Pick a surface: Table 5 sets the camber.',
            check: { q: 'Camber for water bound macadam or gravel (Table 5)?', options: ['2.5–3.0 per cent', '1.7–2.0 per cent', '3.0–4.0 per cent'], answer: 0, why: 'High type bituminous or concrete 1.7–2.0, thin bituminous 2.0–2.5, WBM and gravel 2.5–3.0, earth 3.0–4.0 per cent (Table 5).' } },
          { title: 'Table 6', show: L, text: 'Flatten the curve past the Table 6 radius: the road keeps its camber round the bend.',
            check: { q: 'A curve needs no superelevation when its radius is greater than…', options: ['V²/225e, e the camber', 'V²/127', '0.0358 V²'], answer: 0, why: 'Curves with R greater than V²/225e, e being the camber, need less superelevation than the camber (cl. 5.3.2, Table 6).' } },
          { title: 'Is it safe?', show: L, text: 'With camber kept, the outer half tilts the wrong way. Press "cl. 5.3.3 check".',
            check: { q: 'R 1500 m, camber 0.03, 100 km/h: the friction needed is…', options: ['0.082', '0.15', '0.30'], answer: 0, why: 'Centrifugal ratio 0.052 plus the negative camber 0.03 gives 0.082, much less than the safe value (cl. 5.3.3).' } },
        ],
      };
      const guide = makeGuide(ctx, { anchor: [-5.4, 2.2, 10.5], w: 10, h: 5, steps: STEPS[mode] });
      guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
      card.userData.zoom = true; api.targets.push(card);
      place();
      return api;
    },
  };
}

export default sectionSpread('why');
