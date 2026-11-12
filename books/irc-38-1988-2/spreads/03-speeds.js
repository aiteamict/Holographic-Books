// Spread 3 · Design speeds (cl. 3.4–3.6, Table 2). Pick a class of road and a terrain: Table 2 lights the cell and the
// roadside signs show the ruling speed. "Change gradually" (cl. 3.6) steps the speed down section by section towards a
// sharp bend, with a warning sign well ahead of it; the car slows at each sign.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { diorama, trees, makeRoad, car, MAT, VEH } from '../../_irc38/site.js';
import { SPEEDS, SHORT, TERRAINS } from '../../_irc38/tables.js';

const F = 'Inter, Segoe UI, Arial', S = .1, GROUND = .5, O = new THREE.Vector3(-2, GROUND, 0);
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };

// the road: a long straight into a sharp right-hand bend (R 30 m, 80°)
const PATH = (() => { const p = []; for (let x = -102; x <= 40; x += 4) p.push([x, 0]); const R = 30, cx = 40, cy = -R; for (let a = 4; a <= 80; a += 4) { const t = (90 - a) * Math.PI / 180; p.push([cx + R * Math.cos(t), cy + R * Math.sin(t)]); } const e = p.at(-1), h = -80 * Math.PI / 180; for (let s = 6; s <= 60; s += 6) p.push([e[0] + Math.cos(h) * s, e[1] + Math.sin(h) * s]); return p; })();
const SIGN_X = [-80, -36, 6], WARN_X = 22;

function signTexture(draw) { const c = document.createElement('canvas'); c.width = c.height = 128; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const speedFace = v => signTexture(g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.lineWidth = 14; g.strokeStyle = '#c4231b'; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.stroke(); g.fillStyle = '#111'; g.font = '700 50px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(v), 64, 68); });
const warnFace = () => signTexture(g => { g.fillStyle = '#fff'; g.strokeStyle = '#c4231b'; g.lineWidth = 12; g.beginPath(); g.moveTo(64, 10); g.lineTo(120, 112); g.lineTo(8, 112); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#111'; g.lineWidth = 9; g.beginPath(); g.moveTo(50, 98); g.lineTo(50, 66); g.quadraticCurveTo(50, 48, 76, 46); g.stroke(); g.fillStyle = '#111'; g.beginPath(); g.moveTo(76, 34); g.lineTo(92, 46); g.lineTo(76, 58); g.fill(); });

export default {
  cam: { pos: [3, 38, 38], look: [3.5, 0, -2], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const P = (xy, h = 0) => new THREE.Vector3(O.x + xy[0] * S, O.y + h, O.z - xy[1] * S);
    const st = { cls: 0, ter: 0, gradual: false, carD: 0, v: 0, shown: -1 };
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 40, 13); group.add(forest);
    const road = makeRoad(P, S); group.add(road.group); const T = road.set(PATH, { stones: [146, 186], side: 1 });
    const near = PATH.map(p => P(p)); forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.3));
    const auto = car(S * VEH, 0x24557a); group.add(auto);
    const tag = holo.label('', { h: .62, color: '#14202b', bg: 'rgba(255,253,248,.9)', weight: 700 }); group.add(tag);

    // signs on the left verge, turned to face the oncoming driver and the reader
    const makeSign = tex => {
      const g = new THREE.Group(), post = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1.6, 6), MAT.metal); post.position.y = .8; post.castShadow = true;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .5 })); face.position.y = 1.9; face.rotation.y = -Math.PI / 2 + .5;
      g.add(post, face); g.userData.face = face; group.add(g); return g;
    };
    const signs = SIGN_X.map(x => { const s = makeSign(speedFace(100)); s.position.copy(P([x, 7.5])); return s; });
    const warn = makeSign(warnFace()); warn.position.copy(P([WARN_X, 7.5]));
    const plan = () => { const [ruling, min] = SPEEDS[st.cls][st.ter]; if (!st.gradual) return [ruling, ruling, ruling]; const mid = Math.round((ruling + min) / 10) * 5; return [ruling, mid, min]; };

    // Table 2 on the card
    const card = textPlane({ w: 10, h: 6.6, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText('TABLE 2 · DESIGN SPEEDS, km/h  (ruling / minimum)', 18, 26);
      const x0 = 18, cw = (W - 36 - 92) / 4, y0 = 44, rh = 40;
      c.font = `600 14px ${F}`; c.fillStyle = '#5c6168'; TERRAINS.forEach((t, j) => { c.textAlign = 'center'; c.fillText(t, x0 + 92 + cw * (j + .5), y0 + 14); });
      SHORT.forEach((name, i) => {
        const y = y0 + 26 + i * rh; c.textAlign = 'left'; c.fillStyle = i === st.cls ? '#8a3f1c' : '#14202b'; c.font = `700 15px ${F}`; c.fillText(name, x0, y + 24);
        TERRAINS.forEach((_, j) => {
          const on = i === st.cls && j === st.ter, x = x0 + 92 + cw * j;
          if (on) { c.fillStyle = 'rgba(176,83,42,.16)'; c.fillRect(x + 2, y + 2, cw - 4, rh - 4); }
          const [r, m] = SPEEDS[i][j]; c.textAlign = 'center'; c.fillStyle = on ? '#8a3f1c' : '#14202b'; c.font = `${on ? 800 : 600} 17px ${F}`; c.fillText(`${r} / ${m}`, x + cw / 2, y + 26);
        });
      });
      const [r, m] = SPEEDS[st.cls][st.ter]; c.textAlign = 'left'; c.fillStyle = '#14202b'; c.font = `600 15px ${F}`;
      c.fillText(st.gradual ? `Stepping down ${plan().join(' → ')} km/h, warning sign before the bend (cl. 3.6)` : `Ruling ${r} km/h; minimum ${m} km/h where the site does not permit the ruling (cl. 3.5)`, 18, H - 16);
    } });
    card.position.set(5.1, 2.7, 10.5); card.rotation.x = -.6; group.add(card);
    function setSigns() { plan().forEach((v, i) => { const f = signs[i].userData.face; f.material.map.dispose(); f.material.map = speedFace(v); f.material.needsUpdate = true; }); warn.visible = st.gradual; card.redraw(); }

    const actions = [
      ...SHORT.map((n, i) => ({ label: n, toggle: () => st.cls === i, run: () => { st.cls = i; setSigns(); } })),
      ...TERRAINS.map((n, j) => ({ label: n, toggle: () => st.ter === j, run: () => { st.ter = j; setSigns(); } })),
      { label: 'Change gradually', toggle: () => st.gradual, run: () => { st.gradual = !st.gradual; setSigns(); } },
    ];
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        // the car takes the speed of the last sign it passed, easing to it
        const p = T.at(st.carD), sp = plan(); let target = sp[0]; SIGN_X.forEach((x, i) => { if (p.x > x) target = sp[i]; });
        st.v += (target - st.v) * Math.min(1, dt * 1.2); st.carD += st.v / 3.6 * 1.4 * dt; if (st.carD > T.length - 2) { st.carD = 0; st.v = sp[0]; }
        auto.position.copy(P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h;
        tag.position.copy(auto.position).add(new THREE.Vector3(0, 1.3, 0)); if (Math.round(st.v) !== st.shown) { st.shown = Math.round(st.v); tag.userData.setText(`${st.shown} km/h`); }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.5 : 5.1; card.scale.setScalar(tall ? .8 : 1);
      },
      reset() { anims.clear(); st.cls = 0; st.ter = 0; st.gradual = false; st.carD = 0; setSigns(); guide.reset(); },
      get debug() { return { cls: SHORT[st.cls], terrain: TERRAINS[st.ter], speeds: plan(), gradual: st.gradual, guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Table 2', show: [...SHORT, ...TERRAINS], text: 'Pick a class of road and a terrain. The cell lights up and the signs along the road show the ruling speed.',
          check: { q: 'A National Highway in rolling terrain: ruling design speed?', options: ['80 km/h', '100 km/h', '65 km/h'], answer: 0, why: 'NH and SH: 100 plain, 80 rolling, 50 mountainous, 40 steep (Table 2). The minimum in rolling terrain is 65.' } },
        { title: 'Minimum', show: [...SHORT, ...TERRAINS], text: 'Every cell has two speeds: the ruling, and below it the minimum.',
          check: { q: 'When may the minimum design speed be adopted (cl. 3.5)?', options: ['where the site does not permit the ruling', 'on every curve', 'at night'], answer: 0, why: 'The ruling speed is the guiding criterion; the minimum may be adopted where site conditions, including costs, do not permit design to the ruling speed (cl. 3.5).' } },
        { title: 'Changing speed', show: [...SHORT, ...TERRAINS, 'Change gradually'], text: 'Press "Change gradually": the speed steps down section by section towards the sharp bend, with a warning well ahead of it.',
          check: { q: 'Where terrain forces a lower design speed, the change should be…', options: ['gradual, with warning ahead', 'sudden, at the bend', 'left unmarked'], answer: 0, why: 'Change gradually through successive sections; where an adequate design is impossible or prohibitively costly, put a warning sign well in advance of the danger point (cl. 3.6).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    setSigns(); st.v = plan()[0];
    return api;
  },
};
