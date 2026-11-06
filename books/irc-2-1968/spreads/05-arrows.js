// Spread 5 · Which way now? (cl. 4, Plate 3) — the junction-type picker
// Choose the junction (crossroads, T, Y-fork) and the arm the National Highway takes. The definition plate gets the one
// arrow that tells the truth about that move, drawn from Plate 3's parts, and the car drives it on the plan in front.
// "Wrong arrow" hangs a plate that lies, and the car follows the lie off the road.
import * as THREE from 'three';
import { arrowHead, tagged, textPlane } from '@engine/util.js';
import * as props from '../props.js';
import { Anims, drive, smooth, pulse } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';

const PATHS = {
  ahead: [[0, 0, 5], [0, 0, -5]], turnLeft: [[0, 0, 5], [0, 0, 0], [-5, 0, 0]], turnRight: [[0, 0, 5], [0, 0, 0], [5, 0, 0]],
  aheadLeft: [[0, 0, 5], [0, 0, 1], [-4, 0, -4]], aheadRight: [[0, 0, 5], [0, 0, 1], [4, 0, -4]], both: [[-5, 0, 0], [5, 0, 0]],
};
const D = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0], NW: [-Math.SQRT1_2, -Math.SQRT1_2], NE: [Math.SQRT1_2, -Math.SQRT1_2] };
// which arrow each junction gives each exit, and the arrow that would lie there
const JUNCTIONS = {
  cross: { label: 'Crossroads', arms: ['N', 'E', 'S', 'W'], close: [], exits: { left: 'turnLeft', ahead: 'ahead', right: 'turnRight', both: 'both' }, wrong: 'aheadLeft' },
  tee: { label: 'T-junction', arms: ['E', 'S', 'W'], close: ['N'], exits: { left: 'turnLeft', right: 'turnRight', both: 'both' }, wrong: 'ahead' },
  wye: { label: 'Y-fork', arms: ['S', 'NW', 'NE'], close: [], exits: { left: 'aheadLeft', right: 'aheadRight' }, wrong: 'ahead' },
};
const EXITS = [['left', 'NH goes left'], ['ahead', 'NH goes ahead'], ['right', 'NH goes right'], ['both', 'NH runs both ways']];
const JORDER = ['cross', 'tee', 'wye'];

export default {
  shots: [
    { pos: [18, 14, 22], look: [19, 11, 0], dur: 1.8, hold: 2.4, text: 'The definition plate, 300 by 250 mm, hangs 150 mm under the shield (cl. 4.1, Plate 2).' },
    { pos: [6, 18, 23], look: [6.5, 11, -3], dur: 1.8, hold: 2.6, text: 'Plate 3: a 45 mm shaft and a 90 by 100 mm head, on every arrow. The junction decides which arrow.' },
  ],
  build(ctx) {
    const { holo, sign, ui } = ctx; const { SPEC } = sign; const S = .075;
    const group = new THREE.Group();
    const sg = sign.makeSign({ number: '42', kind: 'ahead', scale: S }); sg.group.position.set(6, 0, -2); sg.group.rotation.y = -.25; group.add(sg.group);
    const proj = holo.projector(7); proj.position.set(6, 0, -2); group.add(proj);
    // where the plate hangs: 150 mm under the shield, its bottom edge 1250 mm above the road (Plate 2)
    { const P = SPEC.post, x = 6 + 3.4, z = -1.4, topShield = P.topOfShield / 10 * S, botShield = topShield - 60 * S, topDef = botShield - 15 * S, botDef = topDef - 25 * S;   // spec in mm, scale in cm
      group.add(holo.dimension([x, 0, z], [x, botDef, z], '1250', { h: .8, tick: .3 }), holo.dimension([x, topDef, z], [x, botShield, z], '150', { h: .7, tick: .25, color: holo.AMBER })); }
    // the enlarged plate with its dimensions, redrawn for each arrow
    const defC = document.createElement('canvas'); defC.width = 600; defC.height = 500;
    let junction = 'cross', exit = 'ahead', wrong = false, kind = 'ahead';
    const big = textPlane({ w: 10.8, h: 9, px: 50, draw: (c, W, H) => {
      sign.drawDefinitionPlate(defC, kind); const pad = 70, pw = W - pad * 2, ph = pw * 250 / 300, py = (H - ph) / 2 + 4;
      c.drawImage(defC, pad, py, pw, ph);
      c.strokeStyle = c.fillStyle = wrong ? '#ff6b6b' : '#ffa24a'; c.lineWidth = 2; c.font = '600 18px Inter, Segoe UI, Arial'; c.textAlign = 'center';
      const dimH = (x0, x1, y, t) => { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.moveTo(x0, y - 6); c.lineTo(x0, y + 6); c.moveTo(x1, y - 6); c.lineTo(x1, y + 6); c.stroke(); c.fillText(t, (x0 + x1) / 2, y - 8); };
      const dimV = (y0, y1, x, t) => { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.moveTo(x - 6, y0); c.lineTo(x + 6, y0); c.moveTo(x - 6, y1); c.lineTo(x + 6, y1); c.stroke(); c.save(); c.translate(x - 10, (y0 + y1) / 2); c.rotate(-Math.PI / 2); c.fillText(t, 0, 0); c.restore(); };
      dimH(pad, pad + pw, py - 22, '300'); dimV(py, py + ph, pad - 24, '250');
      const b = SPEC.defPlate; c.textAlign = 'left'; c.font = '600 17px Inter, Segoe UI, Arial';
      c.fillText(`border ${b.border} · ${b.inset} in  ·  shaft ${b.shaft}  ·  head ${b.headL} × ${b.headW}  (mm)`, pad, py + ph + 26);
      if (wrong) { c.fillStyle = '#ff6b6b'; c.font = '800 18px Inter, Segoe UI, Arial'; c.textAlign = 'center'; c.fillText('WRONG ARROW FOR THIS JUNCTION', W / 2, py - 42); }
    } });
    big.position.set(-6.5, 12.5, -3); group.add(big); const fr = holo.frame(10.8, 9, 'Definition plate · Plate 3'); fr.position.set(-6.5, 12.5, -3.05); group.add(fr);
    group.add(holo.tag('same Canary Yellow; border and arrow black · cl. 4.2', [-1.2, 8.2, -3], [-4, -2.2, 0]));
    // the plan in front: the junction, the car, the route
    const plan = new THREE.Group(); plan.position.set(-5, .25, 0); group.add(plan);   // under the floating plate, clear of the page caption
    const w = .8, L = 4.6, roads = new THREE.Group(); plan.add(roads);
    const jLabel = holo.label(' ', { h: .85, color: '#1d5f87' }); jLabel.position.set(0, 1.4, -6.3); plan.add(jLabel);
    const drawJunction = () => {
      roads.clear(); const J = JUNCTIONS[junction], E = [];
      for (const a of J.arms) { const [dx, dz] = D[a], px = -dz, pz = dx; for (const s of [-1, 1]) E.push([dx * w + px * w * s, 0, dz * w + pz * w * s], [dx * L + px * w * s, 0, dz * L + pz * w * s]); }
      for (const a of J.close) {                                   // a closed arm gets a kerb across its mouth, not just a line
        const [dx, dz] = D[a]; const k = props.kerb(.3, 2 * w); k.rotation.y = dx ? 0 : Math.PI / 2; k.position.x = dx * w; k.position.z = dz * w; roads.add(k);
      }
      roads.add(holo.segments(E, holo.CYAN, .8, { width: .07 }));
      jLabel.userData.setText(J.label);
    };
    const sm = .28, you = props.car(sm); you.position.set(.45, 0, 4.4); you.rotation.y = Math.PI; you.userData.car = true; plan.add(you);
    const route = new THREE.Group(); plan.add(route);
    const knob = holo.handle('junction', { label: 'next junction · tap', kind: 'knob' }); knob.position.set(-13, 0, 3); group.add(knob);
    const anims = new Anims();
    const go = () => {
      anims.stop('car'); const p = PATHS[kind];
      const path = kind === 'both' ? [[.45, 0, 4.4], [.45, 0, .45], [4.8, 0, .45]] : p.map((q, i) => i === 0 ? [.45, 0, 4.4] : [q[0] + (q[0] === 0 ? .45 : 0), 0, q[2] + (q[2] === 0 && q[0] !== 0 ? .45 : 0)]);
      drive(anims, you, path, 2.6, { ease: smooth, tag: 'car', done: () => anims.after(.6, () => { you.position.set(.45, 0, 4.4); you.rotation.y = Math.PI; }, 'car') });
    };
    function apply() {
      const J = JUNCTIONS[junction]; if (!(exit in J.exits)) exit = Object.keys(J.exits)[0];
      kind = wrong ? J.wrong : J.exits[exit]; sg.setKind(kind); route.clear(); big.redraw(); drawJunction(); pulse(anims, big, 1.03, .3);
      const p = PATHS[kind]; route.add(holo.polyline(p, wrong ? holo.RED : holo.AMBER, { width: .07 })); route.add(holo.segments(arrowHead(p[p.length - 2], p[p.length - 1], .6), wrong ? holo.RED : holo.AMBER, .9, { width: .07 }));
      if (kind === 'both') route.add(holo.segments(arrowHead(p[1], p[0], .6), holo.AMBER, .9, { width: .07 }));
      go();
      if (wrong) ui.caption(`${J.label}, but the plate says "${sign.ARROWS[kind].label}". The driver trusts the plate and leaves the road. One arrow per junction, and it must match (cl. 4.1, Plate 3).`, 'Wrong arrow', 6000);
      else ui.caption(`${J.label}: the highway ${sign.ARROWS[kind].label}. Shaft 45 mm, head 90 × 100 mm, on a 300 × 250 mm plate (Plate 3).`, 'Definition plate');
    }
    const setJunction = j => { junction = j; apply(); };
    const setExit = e => { const J = JUNCTIONS[junction]; if (!(e in J.exits)) { ui.caption(e === 'ahead' ? `No road goes ahead at a ${J.label.toLowerCase()}.` : `"${EXITS.find(x => x[0] === e)[1]}" has no meaning at a ${J.label.toLowerCase()} (Plate 3).`, J.label, 3000); return; } exit = e; apply(); };
    const api = {
      group, targets: [knob, you, sg.group],
      enter() { anims.after(.7, go); },
      tap(hit) { if (guide.tap(hit)) return; if (tagged(hit.object, 'handle')) setJunction(JORDER[(JORDER.indexOf(junction) + 1) % JORDER.length]); else if (tagged(hit.object, 'part')) { const ks = Object.keys(JUNCTIONS[junction].exits); setExit(ks[(ks.indexOf(exit) + 1) % ks.length]); } else go(); },
      actions: JORDER.map(j => ({ label: JUNCTIONS[j].label, toggle: () => junction === j, run: () => setJunction(j) }))
        .concat(EXITS.map(([e, label]) => ({ label, toggle: () => exit === e && !wrong, hidden: () => !(e in JUNCTIONS[junction].exits), run: () => setExit(e) })))   // only exits this junction has
        .concat([{ label: 'Wrong arrow', toggle: () => wrong, run: () => { wrong = !wrong; apply(); } }]),
      update(dt, t) { anims.tick(dt); sg.group.rotation.y = -.25 + Math.sin(t * .5) * .03; },
      reset() { junction = 'cross'; exit = 'ahead'; wrong = false; apply(); guide.reset(); },
      get debug() { return { junction, exit, wrong, kind, guide: guide.debug }; },
    };
    // guided sequence: the junction, the arm, the lie
    const guide = makeGuide(ctx, {
      anchor: [-6.5, 20.8, -3], w: 10.8, h: 4.8,
      steps: [
        { title: 'The junction', show: ['Crossroads', 'T-junction', 'Y-fork'], text: 'Pick the junction. The plan redraws, and so does the list of arms a highway can take there: only arrows for roads that exist are offered.' },
        { title: 'The arm', show: ['NH goes left', 'NH goes ahead', 'NH goes right', 'NH runs both ways'], enter: () => { if (junction !== 'tee') { junction = 'tee'; apply(); } },
          check: { q: 'At a T-junction, which arrow can the definition plate never carry?', options: ['turns left', 'straight ahead', 'both ways'], answer: 1, why: 'No road goes ahead at a T. One arrow per junction, and it must describe a road that is there (cl. 4.1, Plate 3). Pick an arm and the car drives it.' } },
        { title: 'The lie', show: ['Wrong arrow'], text: 'Wrong arrow hangs a plate that lies about this junction. The driver trusts the plate and leaves the road: the arrow is not decoration, it is an instruction.' },
      ],
    });
    group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    apply(); return api;
  },
};
