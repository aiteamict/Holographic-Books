// Spread 2 · Terrain (cl. 3.4, Table 1). The country rises across the road at the chosen cross slope; the road follows a
// contour along the foot. A slope triangle on the hillside shows the rise per 100 m; Table 1 names the terrain live.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { makeRoad, car, MAT, VEH } from '../../_irc38/site.js';
import { TERRAIN, terrainOf } from '../../_irc38/tables.js';

const F = 'Inter, Segoe UI, Arial', S = .1, GROUND = .5, ROADZ = 4.2;   // page cm per m; the road runs along the front
const X0 = -12.6, X1 = 12.6, Z0 = -15.8, Z1 = 7.4, NX = 64, NZ = 60;

export default {
  cam: { pos: [34, 30, 44], look: [2, 2, -1], portrait: { pos: [38, 46, 58], look: [12.3, 2, -3] } },   // from the side, so the earth edge shows the slope
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const st = { slope: 5, carX: 0 };
    // the ground: a heightfield rising behind the road at the cross slope, with gentle undulations
    const geo = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, NX, NZ); geo.rotateX(-Math.PI / 2); geo.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
    const base = geo.attributes.position.array.slice();
    const ground = new THREE.Mesh(geo, MAT.grass); ground.receiveShadow = true; group.add(ground);
    const skirt = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0x8b6d4c, roughness: .95, side: THREE.DoubleSide })); group.add(skirt);
    const bump = (x, z) => .06 * Math.sin(x * .9) * Math.cos(z * .7) + .04 * Math.sin(x * .37 + z * .5);
    const heightAt = (x, z) => { const up = Math.max(0, ROADZ - 1.2 - z); return GROUND + up * st.slope / 100 + bump(x, z) * Math.min(1, up) * (1 + st.slope / 30); };
    // trees, and rocks once the country gets rough
    const props = []; {
      let r = 4; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647; const cone = new THREE.ConeGeometry(1, 2.2, 7), rockG = new THREE.DodecahedronGeometry(1, 0);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x9a8d78, roughness: .95, flatShading: true });
      for (let i = 0; i < 46; i++) {
        const x = X0 + .6 + rnd() * (X1 - X0 - 1.2), z = Z0 + .6 + rnd() * (ROADZ - 2.2 - Z0), rock = rnd() < .3;
        const m = new THREE.Mesh(rock ? rockG : cone, rock ? rockMat : (rnd() < .5 ? MAT.leaf : MAT.leaf2)); m.castShadow = true;
        const k = rock ? .18 + rnd() * .2 : .3 + rnd() * .2; m.scale.setScalar(k); m.userData = { x, z, rock, k }; group.add(m); props.push(m);
      }
    }
    const road = makeRoad(([x, y], h = 0) => new THREE.Vector3(x * S, GROUND + h + .02, ROADZ - y * S), S); group.add(road.group); road.set([[-124, 0], [124, 0]]);
    const auto = car(S * VEH, 0x24557a); group.add(auto);
    // the slope triangle: 100 m across the country, the rise above it
    const tri = holo.polyline([[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0]], holo.AMBER, { width: .1 }); group.add(tri);
    const runLab = holo.label('100 m', { h: .7, color: '#9a4a22', bg: 'rgba(255,253,248,.9)' }), riseLab = holo.label('', { h: .7, color: '#9a4a22', bg: 'rgba(255,253,248,.9)', weight: 800 });
    group.add(runLab, riseLab);
    const hSlope = holo.handle('slope', { label: 'slope · drag back or forward', kind: 'lever', r: .9 }); group.add(hSlope);

    const card = textPlane({ w: 9.4, h: 5.8, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText('TABLE 1 · TERRAIN CLASSIFICATION', 18, 26);
      c.fillStyle = '#14202b'; c.font = `700 22px ${F}`; c.fillText(`Cross slope ${st.slope.toFixed(0)} %: ${terrainOf(st.slope)}`, 18, 60);
      TERRAIN.forEach(([name, a, b], i) => {
        const y = 92 + i * 36, on = name === terrainOf(st.slope);
        if (on) { c.fillStyle = 'rgba(176,83,42,.14)'; c.fillRect(14, y - 24, W - 28, 32); }
        c.fillStyle = on ? '#8a3f1c' : '#14202b'; c.font = `${on ? 700 : 500} 18px ${F}`; c.fillText(name, 24, y);
        c.textAlign = 'right'; c.fillText(b === Infinity ? `greater than ${a} %` : `${a}–${b} %`, W - 24, y); c.textAlign = 'left';
      });
      c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText('Short isolated stretches of other terrain are not counted (cl. 3.4).', 18, H - 14);
    } });
    card.position.set(5.2, 2.6, 10.6); card.rotation.x = -.6; group.add(card);

    function shape() {
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, heightAt(x, z)); }
      p.needsUpdate = true; geo.computeVertexNormals();
      // earth skirt round the edges so the model reads as a solid block
      const pos = [], idx = []; let v = 0;
      const edge = pts => { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; pos.push(a[0], 0, a[1], b[0], 0, b[1], b[0], heightAt(b[0], b[1]), b[1], a[0], heightAt(a[0], a[1]), a[1]); idx.push(v, v + 1, v + 2, v, v + 2, v + 3); v += 4; } };
      const line = (ax, az, bx, bz, n = 40) => Array.from({ length: n + 1 }, (_, i) => [ax + (bx - ax) * i / n, az + (bz - az) * i / n]);
      edge(line(X1, Z0, X0, Z0)); edge(line(X0, Z0, X0, Z1)); edge(line(X1, Z1, X1, Z0)); edge(line(X0, Z1, X1, Z1));
      const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g2.setIndex(idx); g2.computeVertexNormals(); skirt.geometry.dispose(); skirt.geometry = g2;
      for (const m of props) { m.position.set(m.userData.x, heightAt(m.userData.x, m.userData.z) + (m.userData.rock ? m.userData.k * .4 : m.userData.k * 1.1), m.userData.z); m.visible = !m.userData.rock || st.slope > 20; }
      // slope triangle on the right of the hillside: 100 m back from the road
      const tx = 9.6, za = ROADZ - 1.4, zb = za - 100 * S, ya = heightAt(tx, za) + .05, yb = ya + st.slope * S;
      holo.setPoints(tri, [[tx, ya, za], [tx, ya, zb], [tx, yb, zb], [tx, ya, za]]);
      runLab.position.set(tx + 1.8, ya + .3, (za + zb) / 2); riseLab.position.set(tx + 2.2, (ya + yb) / 2 + .3, zb); riseLab.userData.setText(`rise ${st.slope.toFixed(0)} m`);
      hSlope.position.set(-8.5, heightAt(-8.5, -9), -9);
      card.redraw();
    }
    const toSlope = (s, dur = .9) => { const a = st.slope; anims.stop('s'); anims.add({ dur, tag: 's', update: e => { st.slope = a + (s - a) * e; shape(); } }); };

    let grip = null, z0 = null, s0 = 0;
    const presets = [['Plain 5 %', 5], ['Rolling 18 %', 18], ['Mountainous 40 %', 40], ['Steep 70 %', 70]];
    const actions = presets.map(([label, s]) => ({ label, toggle: () => Math.round(st.slope) === s, run: () => toSlope(s) }));
    const api = {
      group, dragPlane: 'xz', targets: [hSlope], actions,
      press(hit) { grip = tagged(hit.object, 'handle') ? {} : null; if (grip) { anims.stop('s'); z0 = null; s0 = st.slope; } },
      drag({ point }) { if (!grip) return; if (z0 === null) z0 = point.z; st.slope = THREE.MathUtils.clamp(s0 + (z0 - point.z) * 6, 0, 90); shape(); guide.say(`Cross slope ${st.slope.toFixed(0)} per cent: ${terrainOf(st.slope).toLowerCase()} terrain (Table 1).`); },
      release() { grip = null; },
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        st.carX = (st.carX + dt * 24) % 248; auto.position.set((-124 + st.carX) * S, GROUND + .02, ROADZ - 1.75 * S); auto.rotation.y = 0;
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        card.position.x = tall ? 3.6 : 5.2; card.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.slope = 5; shape(); guide.reset(); },
      get debug() { return { slope: +st.slope.toFixed(1), terrain: terrainOf(st.slope), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Plain', show: ['Plain 5 %', 'Rolling 18 %'], text: 'The country rises across the road. The triangle on the hillside shows how many metres it climbs in 100 m.',
          check: { q: 'Terrain is classified by…', options: ['the cross slope of the country', 'the road gradient', 'height above sea level'], answer: 0, why: 'By the general slope of the country across the highway alignment (cl. 3.4, Table 1).' } },
        { title: 'Steeper', show: presets.map(p => p[0]), text: 'Drag the handle back to steepen the country, or pick a terrain. Watch the class change on the card.',
          check: { q: 'A cross slope of 30 per cent is…', options: ['mountainous', 'rolling', 'steep'], answer: 0, why: 'Mountainous terrain is 25 to 60 per cent cross slope (Table 1).' } },
        { title: 'Stretches', show: presets.map(p => p[0]), text: 'A road crosses many slopes. The class is set by the general slope, not by every small bump.',
          check: { q: 'A short isolated steep stretch in plain country…', options: ['is not taken into account', 'makes it steep terrain', 'halves the design speed'], answer: 0, why: 'While classifying a terrain, short isolated stretches of varying terrain should not be taken into consideration (cl. 3.4).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    card.userData.zoom = true; api.targets.push(card);
    shape();
    return api;
  },
};
