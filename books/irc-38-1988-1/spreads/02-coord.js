// Spread 2 · Plan and profile together (cl. 1.3, Fig. 1), as a site model. A road with one bend (R 150 m, Δ 50°) and
// one crest, the height exaggerated ×3, trees along it. Slide the crest along the road; the driver's view is a real
// camera at the driver's eye in the moving car, so a bend just over the crest truly disappears behind the hill.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { horizontalCurve, layout } from '../../_irc38/curve.js';
import { diorama, track, car, MAT, VEH } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', S = .046, VX = 3, GROUND = .5, O = new THREE.Vector3(-1.5, GROUND, -3);
const G = .05, LV = 140, EYE = 1.3, HW = 3.5;                           // grades ±5 %, vertical curve 140 m, driver's eye 1.3 m
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };
const k = horizontalCurve(50, 150, 0), L = layout(k, 2);

// the alignment as a station-indexed polyline: 130 m of straight, the bend, 130 m of straight
const plan = [];
{ const u1 = L.u1, u2 = [u1[0], -u1[1]]; for (let s = 130; s > 0; s -= 2) plan.push([L.TP[0] - u1[0] * s, L.TP[1] - u1[1] * s]); plan.push(...L.pts); for (let s = 2; s <= 130; s += 2) plan.push([L.PT[0] + u2[0] * s, L.PT[1] + u2[1] * s]); }
const TR = track(plan), TOTAL = TR.length, HC0 = 130, HC1 = 130 + k.Lc, HCMID = (HC0 + HC1) / 2, at = TR.at;

export default {
  cam: { pos: [3, 36, 38], look: [3.5, 1.5, -2], portrait: { pos: [15, 56, 54], look: [12.3, 0, -1] } },
  build(ctx) {
    const { holo, renderer, scene } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { sc: 60, drive: 20, driving: true };
    // crest: +G up to the vertical curve, a parabola over it, −G after; continuous in height and slope
    const elev = s => { const x = s - (st.sc - LV / 2); if (x < 0) return G * x; if (x > LV) return -G * (x - LV); return G * x - G * x * x / LV; };
    const base = () => Math.min(elev(0), elev(TOTAL)) - .6;
    const P = (x, y, h) => new THREE.Vector3(O.x + x * S, O.y + h * S * VX, O.z - y * S);

    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    // road, its grassy embankment, edge lines, roadside trees: rebuilt when the crest moves
    const road = new THREE.Mesh(new THREE.BufferGeometry(), SM.asphalt); road.receiveShadow = true; group.add(road);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x8da56c, roughness: .95, side: THREE.DoubleSide });
    const bank = new THREE.Mesh(new THREE.BufferGeometry(), bankMat); bank.receiveShadow = true; group.add(bank);
    const edges = new THREE.Mesh(new THREE.BufferGeometry(), SM.paint); group.add(edges);
    const treeList = []; { const cone = new THREE.ConeGeometry(1, 2.2, 7), trunk = new THREE.CylinderGeometry(.1, .12, .6, 6);
      for (let s = 12, i = 0; s < TOTAL - 5; s += 24, i++) for (const side of [-1, 1]) { if ((i + (side > 0 ? 1 : 0)) % 3 === 0) continue; const t = new THREE.Group(); const a = new THREE.Mesh(trunk, MAT.trunk); a.position.y = .3; const b = new THREE.Mesh(cone, i % 2 ? MAT.leaf : MAT.leaf2); b.position.y = 1.3; b.castShadow = true; t.add(a, b); t.scale.setScalar(.3); t.userData = { s: s + side * 3, side }; group.add(t); treeList.push(t); } }
    const hcLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.CYAN, { width: .1 }), vcLine = holo.polyline([[0, 0, 0], [1, 0, 0]], holo.AMBER, { width: .1 }); group.add(hcLine, vcLine);
    const hCrest = holo.handle('crest', { label: 'crest · drag', kind: 'lever', r: .9 }); group.add(hCrest);
    const auto = car(S * VEH * 1.3, 0x24557a); group.add(auto);
    const tagH = holo.label('horizontal curve', { h: .65, color: '#1d5f87', bg: 'rgba(255,253,248,.9)' }), tagV = holo.label('crest (vertical curve)', { h: .65, color: '#9a4a22', bg: 'rgba(255,253,248,.9)' }); group.add(tagH, tagV);

    function judge() {
      if (Math.abs(st.sc - HCMID) < 25) return { good: true, text: '✓ Vertices coincide (Fig. 1 a)', why: 'Crest and bend together, about equal in length.' };
      if (st.sc < HC0 && st.sc + LV / 2 > HC0 - 60) return { bad: true, text: '✗ Bend hidden behind the summit (Fig. 1)', why: 'The road turns away unseen over the top.' };
      return { text: '· Crest and bend apart', why: 'Not coordinated: read as two events.' };
    }

    // the driver's view: a real camera in the car, rendered into the card
    const VW = 8.9, VH = 3.9, rt = new THREE.WebGLRenderTarget(640, 280, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    const dcam = new THREE.PerspectiveCamera(48, VW / VH, .02, 40);
    const view = textPlane({ w: 9.6, h: 6.6, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); const verdict = judge();
      c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.textAlign = 'left'; c.fillText(`DRIVER’S VIEW · ${Math.max(0, Math.round(HC0 - st.drive))} m before the bend`, 18, 26);
      c.fillStyle = verdict.good ? '#1f7a45' : verdict.bad ? '#b3362b' : '#8a3f1c'; c.font = `700 17px ${F}`; c.fillText(verdict.text, 18, H - 34);
      c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(verdict.why, 18, H - 12);
    } });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(VW, VH), new THREE.MeshBasicMaterial({ map: rt.texture, toneMapped: false })); screen.position.set(0, .35, .01); screen.renderOrder = 4; view.add(screen);
    view.position.set(5.1, 2.8, 10.4); view.rotation.x = -.55; group.add(view);
    const helpers = [hcLine, vcLine, hCrest, tagH, tagV, view, auto];
    let frameN = 0;
    function renderView() {
      const me = at(st.drive), ahead = at(st.drive + 35), b = base();
      dcam.position.copy(P(me.x, me.y, elev(st.drive) - b + EYE)); dcam.lookAt(P(ahead.x, ahead.y, elev(st.drive + 35) - b + EYE * .6));
      group.updateMatrixWorld(); dcam.position.applyMatrix4(group.matrixWorld); dcam.quaternion.premultiply(new THREE.Quaternion().setFromRotationMatrix(group.matrixWorld)); dcam.updateMatrixWorld();
      const was = helpers.map(h => h.visible), guideWas = guide.card.visible; helpers.forEach(h => { h.visible = false; }); guide.card.visible = false;
      const oldTarget = renderer.getRenderTarget(), oldColor = renderer.getClearColor(new THREE.Color()), oldAlpha = renderer.getClearAlpha();
      renderer.setRenderTarget(rt); renderer.setClearColor(0xcfe0ee, 1); renderer.clear(); renderer.render(scene, dcam);
      renderer.setRenderTarget(oldTarget); renderer.setClearColor(oldColor, oldAlpha);
      helpers.forEach((h, i) => { h.visible = was[i]; }); guide.card.visible = guideWas;
    }

    function placeCar() { const p = at(st.drive); auto.position.copy(P(p.x, p.y, elev(st.drive) - base())); auto.rotation.y = p.h; }
    function rebuild() {
      const b = base(), pos = [], idx = [], bp = [], bi = [], ep = [], ei = [];
      for (let i = 0; i < plan.length; i++) {
        const s = TR.cum[i], p = at(s), nx = -Math.sin(p.h), ny = Math.cos(p.h), z = elev(s) - b;
        const l = P(p.x + nx * HW, p.y + ny * HW, z), r = P(p.x - nx * HW, p.y - ny * HW, z); pos.push(l.x, l.y + .015, l.z, r.x, r.y + .015, r.z);
        const lb = P(p.x + nx * HW * 2.6, p.y + ny * HW * 2.6, 0), rb = P(p.x - nx * HW * 2.6, p.y - ny * HW * 2.6, 0); bp.push(lb.x, O.y + .01, lb.z, l.x, l.y, l.z, r.x, r.y, r.z, rb.x, O.y + .01, rb.z);
        for (const side of [1, -1]) { const a = P(p.x + nx * side * (HW - .3), p.y + ny * side * (HW - .3), z), c = P(p.x + nx * side * (HW - .55), p.y + ny * side * (HW - .55), z); ep.push(a.x, a.y + .025, a.z, c.x, c.y + .025, c.z); }
        if (i) {
          const j = i * 2; idx.push(j - 2, j - 1, j, j - 1, j + 1, j);
          const q = i * 4, m = q - 4; bi.push(m, q, m + 1, q, q + 1, m + 1, m + 2, q + 2, m + 3, q + 2, q + 3, m + 3);
          const e = i * 4, f = e - 4; ei.push(f, f + 1, e, f + 1, e + 1, e, f + 2, e + 2, f + 3, e + 2, e + 3, f + 3);
        }
      }
      const mk = (m, p2, i2) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p2, 3)); g.setIndex(i2); g.computeVertexNormals(); m.geometry.dispose(); m.geometry = g; };
      mk(road, pos, idx); mk(bank, bp, bi); mk(edges, ep, ei);
      for (const t of treeList) { const s = THREE.MathUtils.clamp(t.userData.s, 0, TOTAL), p = at(s), o = t.userData.side * HW * 2.1; t.position.copy(P(p.x - Math.sin(p.h) * o, p.y + Math.cos(p.h) * o, elev(s) - b - .3)); }
      const line = (s0, s1, lift) => { const out = []; for (let s = Math.max(0, s0); s <= Math.min(TOTAL, s1); s += 2) { const p = at(s); out.push(P(p.x, p.y, elev(s) - b).add(new THREE.Vector3(0, lift, 0))); } return out; };
      holo.setPoints(hcLine, line(HC0, HC1, .1)); holo.setPoints(vcLine, line(st.sc - LV / 2, st.sc + LV / 2, .2));
      const top = at(st.sc); hCrest.position.copy(P(top.x, top.y, elev(st.sc) - b)).add(new THREE.Vector3(0, .1, 0));
      const hm = at(HCMID); tagH.position.copy(P(hm.x, hm.y - 24, elev(HCMID) - b)).add(new THREE.Vector3(0, 1.6, 0));
      tagV.position.copy(hCrest.position).add(new THREE.Vector3(0, 3.4, 0));
      placeCar(); view.redraw();
    }
    const toSc = (sc, dur = .9) => { const a = st.sc; anims.stop('sc'); anims.add({ dur, tag: 'sc', update: e => { st.sc = a + (sc - a) * e; rebuild(); } }); };

    let grip = null;
    const actions = [
      { label: 'Crest before the bend', run: () => toSc(HC0 - 25) },
      { label: 'Coincide', run: () => toSc(HCMID) },
      { label: 'Drive', toggle: () => st.driving, run: () => { st.driving = !st.driving; } },
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
        if (st.driving) { st.drive += dt * 16; if (st.drive > HC1 + 20) st.drive = 10; placeCar(); }
        if (++frameN % 2 === 0 && group.visible) { renderView(); if (frameN % 12 === 0) view.redraw(); }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        view.position.x = tall ? 3.6 : 5.1; view.scale.setScalar(tall ? .82 : 1);
      },
      leave() { st.driving = true; },
      reset() { anims.clear(); st.sc = 60; st.drive = 20; st.driving = true; rebuild(); guide.reset(); },
      get debug() { const j = judge(); return { sc: st.sc, drive: +st.drive.toFixed(1), verdict: j.good ? 'good' : j.bad ? 'bad' : 'apart', hcMid: +HCMID.toFixed(1), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Hidden bend', show: ['Crest before the bend', 'Drive'], text: 'Press "Crest before the bend" and watch the driver’s view as the car climbs: over the top, the bend is simply not there.',
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
