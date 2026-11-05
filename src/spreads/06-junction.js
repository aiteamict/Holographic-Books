// Spread 6 · Two routes, one post (cl. 5, Plate 4)
// A true-width plan at one scale, with the 100–150 m and 15–30 m zones drawn as bands, marker symbols you tap, and the
// selected assembly shown large above the plan so the shields and arrows can actually be read.
import * as THREE from 'three';
import { tagged, textPlane, cardBg } from './util.js';
import * as props from '../engine/props.js';
import { Anims, drive, pulse, smooth } from '../engine/anim.js';
import { makeGuide } from '../engine/guide.js';

const M = .085;                                  // cm per metre: 150 m = 12.75 cm, fits the page
const HW = 3.5 * M, FAR = 125 * M, NEAR = 22 * M, OFF = HW + .5;
// facing = the direction the driver travels; `pos` = the marker symbol on the driver's left
const EX1 = {
  name: 'Crossroads · NH 6 and NH 7',
  roads: [{ a: [-13, 0], b: [13, 0], w: 7 }, { a: [0, -13], b: [0, 13], w: 7 }],
  tags: [['N.H. 7', 1.4, -12.3], ['N.H. 7', 1.4, 12.6], ['N.H. 6', -12.2, -1.2], ['N.H. 6', 11.6, -1.2]],
  markers: [
    { pos: [OFF, FAR], facing: [0, -1], shields: [{ n: '6', kind: 'both' }, { n: '7', kind: 'ahead' }], text: 'Approaching from the south on NH 7: NH 7 straight on, NH 6 either way, 100 to 150 m before the junction.' },
    { pos: [-OFF, -FAR], facing: [0, 1], shields: [{ n: '6', kind: 'both' }, { n: '7', kind: 'ahead' }], text: 'Approaching from the north on NH 7: the same pair, on the driver’s left.' },
    { pos: [-FAR, -OFF], facing: [1, 0], shields: [{ n: '7', kind: 'both' }, { n: '6', kind: 'ahead' }], text: 'Approaching from the west on NH 6: NH 6 straight on, NH 7 either way.' },
    { pos: [FAR, OFF], facing: [-1, 0], shields: [{ n: '7', kind: 'both' }, { n: '6', kind: 'ahead' }], text: 'Approaching from the east on NH 6: NH 6 straight on, NH 7 either way.' },
    { pos: [OFF, -NEAR], facing: [0, -1], shields: [{ n: '7' }], text: 'Leaving northwards: a single confirmatory NH 7, no definition plate, 15 to 30 m after the junction.' },
    { pos: [-OFF, NEAR], facing: [0, 1], shields: [{ n: '7' }], text: 'Leaving southwards: confirmatory NH 7.' },
    { pos: [NEAR, -OFF], facing: [1, 0], shields: [{ n: '6' }], text: 'Leaving eastwards: confirmatory NH 6.' },
    { pos: [-NEAR, OFF], facing: [-1, 0], shields: [{ n: '6' }], text: 'Leaving westwards: confirmatory NH 6.' },
  ],
};
const EX2 = {
  name: 'Fork · NH 26 leaves NH 7',
  roads: [{ a: [0, -13], b: [0, 13], w: 7 }, { a: [0, 0], b: [-9.2, -9.2], w: 7 }],
  tags: [['N.H. 7', 1.4, -12.3], ['N.H. 7', 1.4, 12.6], ['N.H. 26', -9.6, -6.6]],
  markers: [
    { pos: [OFF, FAR], facing: [0, -1], shields: [{ n: '26', kind: 'aheadLeft' }, { n: '7', kind: 'ahead' }], text: 'From the south on NH 7: NH 7 straight on, NH 26 forks ahead-left.' },
    { pos: [-OFF, -FAR], facing: [0, 1], shields: [{ n: '26', kind: 'turnRight' }, { n: '7', kind: 'ahead' }], text: 'From the north on NH 7: NH 7 straight on, NH 26 turns back to the right.' },
    { pos: [-7.9, -6.9], facing: [.707, .707], shields: [{ n: '7', kind: 'both' }], text: 'Coming down NH 26: NH 7 may be followed either way.' },
    { pos: [OFF, -NEAR], facing: [0, -1], shields: [{ n: '7' }], text: 'Leaving northwards: confirmatory NH 7.' },
    { pos: [-OFF, NEAR], facing: [0, 1], shields: [{ n: '7' }], text: 'Leaving southwards: confirmatory NH 7.' },
    { pos: [-1.9, -1.0], facing: [-.707, -.707], shields: [{ n: '26' }], text: 'Up NH 26: confirmatory NH 26, and nothing else; you are no longer on NH 7.' },
  ],
};

export default {
  cam: { pos: [0, 48, 38], look: [0, 7, -3] },   // over the spine, like the default
  shots: [
    { pos: [15, 34, 10], look: [13, 1, -1], dur: 1.8, hold: 2.6, text: 'The plan to scale: amber bands 100 to 150 m before each approach, green bands 15 to 30 m after each exit.' },
    { pos: [10, 22, 18], look: [13, 13, -3], dur: 1.8, hold: 2.6, text: 'The selected post, large enough to read: the travelled route with its arrow, the crossing route with a double-headed one (cl. 5.1).' },
  ],
  build(ctx) {
    const { holo, sign, ui } = ctx; const anims = new Anims();
    const group = new THREE.Group();
    const showcase = new THREE.Group(); showcase.position.set(7.5, 4, -5); group.add(showcase);   // the big readable assembly, kept inside the frame
    let big = null;
    // the schedule of signs: how a signing scheme is delivered. One row per post; click a row to select it.
    const ROW = 34, HEAD = 64, COLS = [['post', 14], ['where', 130], ['side', 270], ['shields', 322], ['definition plates', 440]];
    const kindName = k => ({ ahead: '↑ ahead', both: '↔ both ways', aheadLeft: '↖ fork left', turnRight: '↱ turn right', turnLeft: '↰ turn left', aheadRight: '↗ fork right' })[k] || '—';
    let sel = -1, cur = 0, planOn = true;     // the plan is hidden in the guide's first step: the schedule comes first
    const sched = textPlane({ w: 13.5, h: 9.6, px: 48, draw: (c, W, H) => {
      const def = [EX1, EX2][cur]; cardBg(c, W, H);
      c.fillStyle = '#8fd8f3'; c.font = '600 17px Inter, Segoe UI, Arial'; c.fillText(`SCHEDULE OF SIGNS · ${def.name.toUpperCase()}`, 18, 30);
      c.fillStyle = '#9fb0c4'; c.font = '600 14px Inter, Segoe UI, Arial'; COLS.forEach(([t, x]) => c.fillText(t.toUpperCase(), x + 6, HEAD - 12));
      def.markers.forEach((m, i) => {
        const y = HEAD + i * ROW, lit = i === sel, approach = m.shields.length > 1;
        if (lit) { c.fillStyle = 'rgba(255,162,74,.22)'; c.fillRect(12, y, W - 24, ROW); }
        c.fillStyle = lit ? '#ffd7a8' : '#e6f6ff'; c.font = `${lit ? 700 : 500} 15px Inter, Segoe UI, Arial`;
        const cells = [`P${i + 1}`, approach ? '100–150 m before' : '15–30 m after', 'left', m.shields.map(s => 'NH ' + s.n).join(' + '), approach ? m.shields.map(s => kindName(s.kind)).join(' · ') : 'none (Plate 2)'];
        cells.forEach((t, k) => c.fillText(t, COLS[k][1] + 6, y + 23));
        c.strokeStyle = 'rgba(79,216,255,.14)'; c.beginPath(); c.moveTo(12, y + ROW); c.lineTo(W - 12, y + ROW); c.stroke();
      });
      c.fillStyle = '#7fb4c8'; c.font = '500 13px Inter, Segoe UI, Arial'; c.fillText('cl. 5.1: the crossing route rides on the same post as the travelled route, each with its own arrow', 18, H - 16);
    } });
    sched.position.set(-5.4, 11.5, -6); sched.userData.sched = true; group.add(sched);     // left edge stays right of the spine on screen
    const schedFrame = holo.frame(13.5, 9.6, 'Signing schedule'); schedFrame.position.set(-5.4, 11.5, -6.05); group.add(schedFrame);
    const scenes = [EX1, EX2].map(def => {
      const g = new THREE.Group(); g.position.y = .25;
      // roads at true width
      for (const r of def.roads) {
        const a = new THREE.Vector3(r.a[0], 0, r.a[1]), b = new THREE.Vector3(r.b[0], 0, r.b[1]), d = b.clone().sub(a).normalize(), n = new THREE.Vector3(-d.z, 0, d.x).multiplyScalar(r.w / 2 * M);
        g.add(holo.segments([a.clone().add(n), b.clone().add(n), a.clone().sub(n), b.clone().sub(n)], holo.CYAN, .9, { width: .08 }));
        g.add(holo.polyline([a, b], holo.CYAN, { opacity: .3, width: .035, dashed: true }));
      }
      for (const [t, x, z] of def.tags) { const l = holo.label(t, { h: .8, color: '#8fd8f3' }); l.position.set(x, .3, z); g.add(l); }
      const discs = [];
      def.markers.forEach((m, i) => {
        const approach = m.shields.length > 1, axis = Math.abs(m.facing[0]) < Math.abs(m.facing[1]);
        // zone band along the approach / exit, beside the marker
        if (Math.abs(m.facing[0]) < .01 || Math.abs(m.facing[1]) < .01) {
          const [z0, z1] = approach ? [100 * M, 150 * M] : [15 * M, 30 * M];
          const zb = holo.zone(0, z0, z1, .7, approach ? holo.AMBER : holo.GREEN, .1);
          // orient: the band lies along the approach, starting at the junction edge, measured against the travel direction
          zb.rotation.y = Math.atan2(m.facing[0], m.facing[1]) + (approach ? Math.PI : 0); zb.position.set(axis ? Math.sign(m.pos[0]) * OFF : 0, 0, axis ? 0 : Math.sign(m.pos[1]) * OFF);
          if (!axis) { zb.position.x = 0; }
          g.add(zb);
        }
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .12, 24), holo.glassMat(approach ? holo.AMBER : holo.GREEN, { opacity: .3, scan: 0 }));
        disc.position.set(m.pos[0], .06, m.pos[1]); disc.userData.i = i; g.add(disc); discs.push(disc);
        const ic = holo.label(approach ? m.shields.map(s => 'NH ' + s.n).join(' · ') : 'NH ' + m.shields[0].n, { h: .62, color: '#1a1200', bg: sign.SPEC.colours.face.hex, weight: 800 }); ic.position.set(m.pos[0], 1, m.pos[1]); g.add(ic);
      });
      const halo = holo.ring(1, holo.AMBER, { width: .12 }); halo.position.y = .08; g.add(halo);
      const auto = props.car(M * 1.6); auto.visible = false; auto.userData.car = true; g.add(auto);   // drawn 1.6× for legibility
      g.visible = false; group.add(g);
      return { def, g, discs, halo, auto };
    });

    const buildBig = m => {
      if (big) showcase.remove(big); big = new THREE.Group(); const S = .048;
      if (m.shields.length === 1) { const s = sign.makeSign({ number: m.shields[0].n, defPlate: false, scale: S }); big.add(s.group); }
      else {
        const r = sign.makeSign({ number: m.shields[1].n, kind: m.shields[1].kind, scale: S }); r.plate.position.x += 26; r.def.position.x += 26; big.add(r.group);
        const l = sign.makeSign({ number: m.shields[0].n, kind: m.shields[0].kind, post: false, scale: S }); l.plate.position.x -= 26; l.def.position.x -= 26; big.add(l.group);
      }
      big.position.y = 0; big.rotation.y = -.15; showcase.add(big);
      showcase.children.filter(c => c.userData.cap).forEach(c => showcase.remove(c));
      const cap = holo.tag(m.shields.length > 1 ? 'travelled route: single arrow · crossing route: double-headed · cl. 5.1' : 'confirmatory shield: no definition plate · Plate 2', [0, 225 * S + .5, 0], [0, 1.8, 0]); cap.userData.cap = true; showcase.add(cap);
      pulse(anims, big, 1.08, .4);
    };
    const driveApproach = i => {
      const sc = scenes[cur], m = sc.def.markers[i]; anims.stop('car');
      const axis = Math.abs(m.facing[0]) < Math.abs(m.facing[1]);
      if (!(m.shields.length > 1 && (Math.abs(m.facing[0]) < .01 || Math.abs(m.facing[1]) < .01))) { sc.auto.visible = false; return; }
      const lane = axis ? [Math.sign(m.pos[0]) * HW / 2, 0] : [0, Math.sign(m.pos[1]) * HW / 2];
      const far = 13, out = NEAR + 2.5;
      const start = [axis ? lane[0] : -m.facing[0] * far, 0, axis ? -m.facing[1] * far : lane[1]];
      const end = [axis ? lane[0] : m.facing[0] * out, 0, axis ? m.facing[1] * out : lane[1]];
      const total = far + out, postAt = (far - FAR) / total, exitAt = (far + NEAR) / total;
      const exitIdx = sc.def.markers.findIndex(q => q.shields.length === 1 && Math.abs(q.facing[0] - m.facing[0]) < .01 && Math.abs(q.facing[1] - m.facing[1]) < .01);
      drive(anims, sc.auto, [start, end], 4, { ease: smooth, tag: 'car', onPass: [
        { at: postAt, fn: () => { pulse(anims, sc.halo, 1.7, .6); pulse(anims, big, 1.06, .5); } },
        { at: exitAt, fn: () => { if (exitIdx >= 0) { pulse(anims, sc.discs[exitIdx], 2, .6); ui.caption(sc.def.markers[exitIdx].text, 'Confirmatory, Plate 2', 3500); } } },
      ] });
    };
    const show = (i, silent) => {
      const sc = scenes[cur]; sel = i; const m = sc.def.markers[i];
      sc.halo.position.x = m.pos[0]; sc.halo.position.z = m.pos[1];
      sc.discs.forEach((d, k) => d.material.uniforms.uOpacity.value = k === i ? .65 : .3);
      buildBig(m); driveApproach(i); sched.redraw();
      if (!silent) ui.caption(m.text, m.shields.length > 1 ? 'Assembly, cl. 5.1' : 'Confirmatory, Plate 2', 7000);
    };
    const use = k => { scenes[cur].g.visible = false; cur = k; scenes[cur].g.visible = planOn; show(0, true); ui.caption(scenes[cur].def.name + (planOn ? '. Tap an amber (approach) or green (exit) marker.' : '. Tap a row of the schedule.'), 'Plate 4', 5000); };
    const setPlan = v => { planOn = v; scenes[cur].g.visible = v; };
    const api = {
      group, get targets() { return [...(planOn ? [...scenes[cur].discs, scenes[cur].auto] : []), sched, guide.card]; },
      enter() { anims.after(.5, () => show(sel < 0 ? 0 : sel, true)); },
      actions: [
        { label: 'Crossroads NH 6 × NH 7', toggle: () => cur === 0, run: () => use(0) },
        { label: 'Fork: NH 26 off NH 7', toggle: () => cur === 1, run: () => use(1) },
        { label: '▶ Drive the approach', run: () => driveApproach(sel < 0 ? 0 : sel) },
      ],
      tap(hit) {
        if (guide.tap(hit)) return;
        const d = tagged(hit.object, 'i'); if (d) { show(d.userData.i); return; }
        if (hit.object.userData.sched && hit.uv) { const row = Math.floor(((1 - hit.uv.y) * 9.6 * 48 - HEAD) / ROW); if (row >= 0 && row < scenes[cur].def.markers.length) show(row); return; }
        if (tagged(hit.object, 'car')) driveApproach(sel < 0 ? 0 : sel);
      },
      get a11y() { return scenes[cur].def.markers.map((m, i) => ({ label: `Show the post: ${m.text.split(':')[0]}`, run: () => show(i) })); },
      update(dt) { anims.tick(dt); },
      reset() { anims.clear(); guide.reset(); use(0); },
      get debug() { return { scene: cur, selected: sel, planOn, guide: guide.debug }; },
    };
    // guided sequence: the schedule, the plan, the fork
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 20.6, -6], w: 11, h: 4.8,
      steps: [
        { title: 'The schedule', show: [], enter: () => setPlan(false),
          text: 'A signing scheme is delivered as a schedule: one row per post with its chainage, side, shields and plates. Tap a row: that post’s assembly appears large on the right, the crossing route with its double-headed arrow (cl. 5.1).' },
        { title: 'On the ground', show: ['▶ Drive the approach'], enter: () => setPlan(true),
          text: 'The same posts on the plan, to scale: amber bands 100–150 m before each approach, green bands 15–30 m after each exit. Tap a disc, or drive the approach and watch the pair, then the confirmatory shield.' },
        { title: 'The fork', show: ['Crossroads NH 6 × NH 7', 'Fork: NH 26 off NH 7'], enter: () => { setPlan(true); if (cur !== 1) use(1); },
          check: { q: 'Past the fork, driving up NH 26: what does the confirmatory shield carry?', options: ['NH 7 + NH 26', 'NH 26 only', 'NH 7 only'], answer: 1, why: 'After the junction you are on one road, and the confirmatory marker names only that road (Plate 4). The pair belongs before the junction, where the choice is made.' } },
      ],
    });
    group.add(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    scenes[0].g.visible = true; show(0, true); setPlan(false); return api;
  },
};
