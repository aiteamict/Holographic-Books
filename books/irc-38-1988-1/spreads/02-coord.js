// Spread 2 · Plan and profile together (cl. 1.3, Fig. 1). A road with one bend (R 150 m, Δ 50°) and one crest, in 3D
// with the height exaggerated ×3. Slide the crest along the road; the driver's view, drawn from the driver's eye at
// real height, shows when the bend is visible and when it hides behind the summit.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { horizontalCurve, layout } from '../../_irc38/curve.js';

const F = 'Inter, Segoe UI, Arial', S = .046, VX = 3, O = new THREE.Vector3(-1.5, .15, -1);
const G = .05, LV = 140, EYE = 1.2, HW = 3.5;                           // grades ±5 %, vertical curve 140 m, eye 1.2 m
const k = horizontalCurve(50, 150, 0), L = layout(k, 2);

// the alignment as a station-indexed polyline: 130 m of straight, the bend, 130 m of straight
const plan = [];
{ const u1 = L.u1, u2 = [u1[0], -u1[1]]; for (let s = 130; s > 0; s -= 2) plan.push([L.TP[0] - u1[0] * s, L.TP[1] - u1[1] * s]); plan.push(...L.pts); for (let s = 2; s <= 130; s += 2) plan.push([L.PT[0] + u2[0] * s, L.PT[1] + u2[1] * s]); }
const cum = [0]; for (let i = 1; i < plan.length; i++) cum.push(cum[i - 1] + Math.hypot(plan[i][0] - plan[i - 1][0], plan[i][1] - plan[i - 1][1]));
const TOTAL = cum.at(-1), HC0 = 130, HC1 = 130 + k.Lc, HCMID = (HC0 + HC1) / 2;
const at = s => { s = THREE.MathUtils.clamp(s, 0, TOTAL); let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const a = plan[i - 1], b = plan[i], f = (s - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, h: Math.atan2(b[1] - a[1], b[0] - a[0]) }; };

export default {
  cam: { pos: [3, 30, 38], look: [3, 2, -1], portrait: { pos: [15, 56, 54], look: [12.3, 0, -1] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { sc: 60, drive: 20, driving: false };
    // crest: +G up to the vertical curve, a parabola over it, −G after; continuous in height and slope
    const elev = s => { const x = s - (st.sc - LV / 2); if (x < 0) return G * x; if (x > LV) return -G * (x - LV); return G * x - G * x * x / LV; };
    const base = () => Math.min(elev(0), elev(TOTAL)) - 1;
    const P = (x, y, h) => new THREE.Vector3(O.x + x * S, O.y + h * S * VX, O.z - y * S);

    // road and its embankment, rebuilt when the crest moves
    const road = new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt); road.castShadow = road.receiveShadow = true; group.add(road);
    const bank = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0xa79e86, roughness: .95, side: THREE.DoubleSide })); bank.receiveShadow = true; group.add(bank);
    const hcLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.CYAN, { width: .1 }), vcLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .1 }); group.add(hcLine, vcLine);
    const hCrest = holo.handle('crest', { label: 'crest · drag', kind: 'lever', r: .9 }); group.add(hCrest);
    const car = new THREE.Group(); {
      const body = new THREE.Mesh(new THREE.BoxGeometry(4.4 * S, .25, 1.8 * S), new THREE.MeshStandardMaterial({ color: 0x24557a, roughness: .45, metalness: .2 })); body.position.y = .18; body.castShadow = true; car.add(body);
    }
    group.add(car);
    const tagH = holo.label('horizontal curve', { h: .65, color: '#1d5f87' }), tagV = holo.label('vertical curve (crest)', { h: .65, color: '#9a4a22' }); group.add(tagH, tagV);

    function judge() {
      if (Math.abs(st.sc - HCMID) < 25) return { good: true, text: '✓ Vertices coincide (Fig. 1 a)', why: 'Crest and bend together, about equal in length.' };
      if (st.sc < HC0 && st.sc + LV / 2 > HC0 - 60) return { bad: true, text: '✗ Bend hidden behind the summit (Fig. 1)', why: 'The road turns away unseen over the top.' };
      return { text: '· Crest and bend apart', why: 'Not coordinated: read as two events.' };
    }
    // the driver's view, computed from the real (unexaggerated) road
    const view = textPlane({ w: 9.4, h: 6.6, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H);
      const verdict = judge();
      c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.textAlign = 'left'; c.fillText(`DRIVER’S VIEW · ${Math.max(0, Math.round(HC0 - st.drive))} m before the bend`, 20, 28);
      const x0 = 14, y0 = 40, w = W - 28, h = H - 104, hz = y0 + h * .42;
      c.fillStyle = '#dfe9f2'; c.fillRect(x0, y0, w, hz - y0); c.fillStyle = '#c9c0a6'; c.fillRect(x0, hz, w, y0 + h - hz);
      const me = at(st.drive), eyeZ = elev(st.drive) + EYE, fx = w * .9;
      const project = (x, y, z) => { const dx = x - me.x, dy = y - me.y, f = dx * Math.cos(me.h) + dy * Math.sin(me.h), r = dx * Math.sin(me.h) - dy * Math.cos(me.h); if (f < 2) return null; return [x0 + w / 2 + fx * r / f, hz - fx * (z - eyeZ) / f]; };
      const visible = s => { const target = elev(s), d = s - st.drive; for (let t = .05; t < 1; t += .05) { const line = eyeZ + (target + .2 - eyeZ) * t; if (elev(st.drive + d * t) > line + .02) return false; } return true; };
      c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip();
      for (const side of [-1, 1]) {
        c.strokeStyle = '#3d4248'; c.lineWidth = 3; c.beginPath(); let pen = false;
        for (let s = st.drive + 3; s < Math.min(TOTAL, st.drive + 320); s += 2) {
          const p = at(s), q = project(p.x - Math.sin(p.h) * HW * side, p.y + Math.cos(p.h) * HW * side, elev(s));
          if (!q || !visible(s)) { pen = false; continue; }
          if (pen) c.lineTo(q[0], q[1]); else { c.moveTo(q[0], q[1]); pen = true; }
        }
        c.stroke();
      }
      c.restore();
      c.fillStyle = verdict.good ? '#1f7a45' : verdict.bad ? '#b3362b' : '#8a3f1c'; c.font = `700 17px ${F}`; c.fillText(verdict.text, 20, H - 36);
      c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(verdict.why, 20, H - 14);
    } });
    view.position.set(5.2, 2.8, 10.4); view.rotation.x = -.55; group.add(view);

    function placeCar() { const p = at(st.drive); car.position.copy(P(p.x, p.y, elev(st.drive) - base())); car.rotation.y = p.h; }
    function rebuild() {
      const b = base(), pos = [], idx = [], bp = [], bi = [];
      for (let i = 0; i < plan.length; i++) {
        const s = cum[i], p = at(s), nx = -Math.sin(p.h) * HW, ny = Math.cos(p.h) * HW, z = elev(s) - b;
        const l = P(p.x + nx, p.y + ny, z), r = P(p.x - nx, p.y - ny, z); pos.push(l.x, l.y + .02, l.z, r.x, r.y + .02, r.z);
        const lb = P(p.x + nx * 1.9, p.y + ny * 1.9, 0), rb = P(p.x - nx * 1.9, p.y - ny * 1.9, 0); bp.push(lb.x, O.y, lb.z, l.x, l.y, l.z, r.x, r.y, r.z, rb.x, O.y, rb.z);
        if (i) { const j = i * 2; idx.push(j - 2, j - 1, j, j - 1, j + 1, j); const q = i * 4, m = q - 4; bi.push(m, q, m + 1, q, q + 1, m + 1, m + 2, q + 2, m + 3, q + 2, q + 3, m + 3); }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); road.geometry.dispose(); road.geometry = g;
      const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3)); g2.setIndex(bi); g2.computeVertexNormals(); bank.geometry.dispose(); bank.geometry = g2;
      const line = (s0, s1, lift) => { const out = []; for (let s = Math.max(0, s0); s <= Math.min(TOTAL, s1); s += 2) { const p = at(s); out.push(P(p.x, p.y, elev(s) - b).add(new THREE.Vector3(0, lift, 0))); } return out; };
      holo.setPoints(hcLine, line(HC0, HC1, .08)); holo.setPoints(vcLine, line(st.sc - LV / 2, st.sc + LV / 2, .16));
      const top = at(st.sc); hCrest.position.copy(P(top.x, top.y, elev(st.sc) - b)).add(new THREE.Vector3(0, .1, 0));
      const hm = at(HCMID); tagH.position.copy(P(hm.x, hm.y - 22, elev(HCMID) - b)).add(new THREE.Vector3(0, 1.4, 0));
      tagV.position.copy(hCrest.position).add(new THREE.Vector3(0, 3.4, 0));
      placeCar(); view.redraw();
    }
    const toSc = (sc, dur = .9) => { const a = st.sc; anims.stop('sc'); anims.add({ dur, tag: 'sc', update: e => { st.sc = a + (sc - a) * e; rebuild(); } }); };

    let grip = null;
    const actions = [
      { label: 'Crest before the bend', run: () => toSc(HC0 - 25) },
      { label: 'Coincide', run: () => toSc(HCMID) },
      { label: 'Drive', toggle: () => st.driving, run: () => { st.driving = !st.driving; if (st.driving && st.drive > HC0 - 10) st.drive = 10; } },
    ];
    const api = {
      group, dragPlane: 'xz', targets: [hCrest], actions,
      press(hit) { grip = tagged(hit.object, 'handle') ? {} : null; if (grip) anims.stop('sc'); },
      drag({ point }) {
        if (!grip) return;
        const x = (point.x - O.x) / S, y = -(point.z - O.z) / S;
        let best = st.sc, bd = 1e9; for (let s = LV / 2; s <= TOTAL - LV / 2; s += 2) { const p = at(s), d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = s; } }
        st.sc = best; rebuild(); const j = judge(); guide.say(`${j.text}. ${j.why}`);
      },
      release() { grip = null; },
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        if (st.driving) { st.drive += dt * 14; if (st.drive > HC0 - 5) st.drive = 10; placeCar(); view.redraw(); }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        view.position.x = tall ? 3.6 : 5.2; view.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.sc = 60; st.drive = 20; st.driving = false; rebuild(); guide.reset(); },
      get debug() { const j = judge(); return { sc: st.sc, drive: +st.drive.toFixed(1), verdict: j.good ? 'good' : j.bad ? 'bad' : 'apart', hcMid: +HCMID.toFixed(1), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Hidden bend', show: ['Crest before the bend', 'Drive'], text: 'Press "Crest before the bend", then Drive. Watch the driver’s view: the road goes over the top and the bend is gone.',
          check: { q: 'Sharp horizontal curves should be avoided where (cl. 1.3 (1))?', options: ['near a summit’s apex', 'on long straights', 'on level ground'], answer: 0, why: 'At or near the apex of pronounced summit or sag curves, from safety considerations (cl. 1.3 (1)).' } },
        { title: 'Coincide', show: ['Crest before the bend', 'Coincide', 'Drive'], text: 'Now press "Coincide", or drag the crest onto the bend. The driver sees the bend rise with the road.',
          check: { q: 'If the two curves cannot be the same length, which should be longer (cl. 1.3 (2))?', options: ['the horizontal curve', 'the vertical curve', 'neither'], answer: 0, why: 'They should coincide with lengths more or less equal; if not, the horizontal curve should be somewhat longer (cl. 1.3 (2)).' } },
        { title: 'Balance', show: ['Crest before the bend', 'Coincide', 'Drive'], text: 'Drag the crest anywhere along the road and judge each view the way Fig. 1 does.',
          check: { q: 'Which is NOT a balanced design (cl. 1.3 (3))?', options: ['flat curves bought with steep, long grades', 'curves in balance with gradients', 'vertices that coincide'], answer: 0, why: 'Straight alignment or flat curves at the expense of steep or long grades, or excessive curvature on flat grades, are not balanced (cl. 1.3 (3)).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    rebuild();
    return api;
  },
};
