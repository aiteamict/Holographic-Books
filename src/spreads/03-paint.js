// Spread 3 · Paint it right (cl. 2.2, 6, 7) — the specification swatch board
// One lesson: colour and materials. The colour schedule (IS 309, black, IS 630) beside the sign, a backdrop you can
// change behind the post with an all-white and an all-black post beside the banded one, two plate samples (enamelled,
// painted), and the sign you can turn to see its grey back. The night check (cl. 3.3) lives on spread 4 with location.
import * as THREE from 'three';
import { tagged, textPlane, cardBg } from './util.js';
import * as props from '../engine/props.js';
import { Anims } from '../engine/anim.js';
import { makeGuide } from '../engine/guide.js';

const BACKDROPS = [
  { key: 'sky', label: 'open sky', note: 'Against a bright sky the white bands vanish; the black ones carry the post.' },
  { key: 'trees', label: 'trees', note: 'Against dark foliage the black bands vanish; the white ones carry the post.' },
  { key: 'buildings', label: 'buildings', note: 'Against a mixed street scene each colour drops out somewhere; alternating 25 cm bands always leave something to see (cl. 6).' },
];
function paintBackdrop(c, key) {
  const g = c.getContext('2d'), W = c.width, H = c.height;
  if (key === 'sky') { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#9fc9ea'); gr.addColorStop(1, '#eef6fb'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return; }
  if (key === 'trees') {
    g.fillStyle = '#17301c'; g.fillRect(0, 0, W, H); let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${20 + rnd() * 40},${50 + rnd() * 60},${25 + rnd() * 30},.85)`; g.beginPath(); g.arc(rnd() * W, rnd() * H, 10 + rnd() * 26, 0, 7); g.fill(); }
    return;
  }
  const gr = g.createLinearGradient(0, 0, 0, H * .35); gr.addColorStop(0, '#cfdde8'); gr.addColorStop(1, '#e9eef2'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const blocks = [[0, .3, .22, '#6f6c66'], [.22, .18, .2, '#a39e95'], [.42, .42, .16, '#4e4b47'], [.58, .26, .24, '#8d8a84'], [.82, .34, .18, '#b9b2a7']];
  for (const [x, top, w, col] of blocks) { g.fillStyle = col; g.fillRect(x * W, top * H, w * W, H); g.fillStyle = 'rgba(255,240,200,.35)'; for (let yy = top * H + 14; yy < H; yy += 22) for (let xx = x * W + 8; xx < (x + w) * W - 8; xx += 16) g.fillRect(xx, yy, 7, 10); }
  g.fillStyle = '#3a3835'; g.fillRect(0, H * .9, W, H * .1);
}

export default {
  shots: [
    { pos: [4, 14, 40], look: [13, 14, 0], dur: 1.8, hold: 2.6, text: 'Canary Yellow, IS 309, black letters and border (cl. 2.2). The schedule beside the sign names every shade by its Indian Standard number.' },
    { pos: [36, 17, 26], look: [13, 7, 0], dur: 2, hold: 2.6, text: 'The post in 25 cm bands, the lowest black, against whatever stands behind it (cl. 6). Show the back for the grey, IS 630.' },
  ],
  build(ctx) {
    const { holo, sign, ui } = ctx; const { SPEC } = sign; const S = .09, s = S * 100;             // 1 m = 9 cm; the sign is 20 cm tall
    const group = new THREE.Group(); group.add(holo.projector(14));
    const sg = sign.makeSign({ number: '42', kind: 'ahead', scale: S }); group.add(sg.group);
    const face = sg.plate.material[4]; face.roughness = .28; face.metalness = .25;
    const person = ctx.hero(s); person.position.set(-9.5, 0, 1.5); person.rotation.y = .7; group.add(person);

    // the backdrop behind the post, and two plain posts (all white, all black) to compare against the banded one
    const bdCanvas = document.createElement('canvas'); bdCanvas.width = 256; bdCanvas.height = 384; paintBackdrop(bdCanvas, 'sky');
    const bdTex = new THREE.CanvasTexture(bdCanvas); bdTex.colorSpace = THREE.SRGBColorSpace;
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(14, 19), new THREE.MeshBasicMaterial({ map: bdTex, toneMapped: false, transparent: true, opacity: .92, side: THREE.DoubleSide }));
    backdrop.position.set(0, 9.5, -4.5); group.add(backdrop);
    const realPostH = (sg.post ? sg.post.geometry.parameters.height : 125) * S;   // the post box is in cm before the sign's scale
    const plain = (x, hex, text) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.7, realPostH, .7), new THREE.MeshStandardMaterial({ color: hex, roughness: .6 })); m.position.set(x, realPostH / 2, -2.6); group.add(m); const l = holo.label(text, { h: .8 }); l.position.set(x, realPostH + 1.1, -2.6); group.add(l); return m; };
    plain(-3.4, 0xf4f4f4, 'all white'); plain(3.4, 0x111111, 'all black');

    // the colour schedule
    const C = SPEC.colours;
    const schedule = textPlane({ w: 8.4, h: 6.6, px: 48, draw: (c, W, Hh) => {
      cardBg(c, W, Hh); c.fillStyle = '#8fd8f3'; c.font = '600 17px Inter, Segoe UI, Arial'; c.fillText('COLOUR SCHEDULE', 18, 30);
      [[C.face.hex, 'Face', `Canary Yellow · IS Colour No. ${C.face.is} · ${C.face.ref}`], [C.ink.hex, 'Border, letters, numerals', 'Black · cl. 2.2'], [C.back.hex, 'Back of the sign', `Unobtrusive grey · IS Colour No. ${C.back.is} · cl. 6`], [null, 'Post', '25 cm bands, black and white, lowest black · cl. 6']].forEach(([hex, name, note], i) => {
        const y = 52 + i * 62;
        if (hex) { c.fillStyle = hex; c.fillRect(18, y, 64, 46); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.strokeRect(18.5, y + .5, 63, 45); }
        else { for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? '#f4f4f4' : '#111'; c.fillRect(18 + k * 16, y, 16, 46); } c.strokeStyle = 'rgba(255,255,255,.35)'; c.strokeRect(18.5, y + .5, 63, 45); }
        c.fillStyle = '#eef3f9'; c.font = '700 17px Inter, Segoe UI, Arial'; c.fillText(name, 96, y + 19);
        c.fillStyle = '#9fb0c4'; c.font = '500 14px Inter, Segoe UI, Arial'; c.fillText(note, 96, y + 39);
      });
    } });
    schedule.position.set(13.2, 12.4, -2); group.add(schedule);

    // two plate samples: enamelled and painted steel (cl. 7); tap one to give the sign that finish
    const sample = (x, finish, rough, metal) => { const m = new THREE.Mesh(new THREE.BoxGeometry(3, .25, 3), new THREE.MeshStandardMaterial({ color: C.face.hex, roughness: rough, metalness: metal })); m.position.set(x, .3, 2); m.userData.finish = finish; group.add(m); const l = holo.label(finish + ' steel', { h: .75 }); l.position.set(x, 1.7, 2); group.add(l); return m; };
    const enamelled = sample(11.2, 'enamelled', .12, .35), painted = sample(15.2, 'painted', .75, .05);
    // a cut of the post: 75 × 75 × 10 mm T-iron (Plate 2), standing beside the plate samples
    { const t = props.tIronSection(s, .3); t.position.set(7.6, 0, 2); group.add(t); const l = holo.label('75 × 75 × 10 T-iron · Plate 2', { h: .7 }); l.position.set(7.6, 3.6, 2); group.add(l); }

    const tagBack = holo.tag('unobtrusive grey · IS 630 · cl. 6', [-3, 16, -.6], [-6, 2, 0]); group.add(tagBack);
    group.add(holo.tag('25 cm bands, lowest black · cl. 6', [.4, 3.5, .4], [6, .5, 0]));
    const lever = holo.handle('turn', { label: 'turn the sign · drag', kind: 'lever' }); lever.position.set(-10.5, 0, 5.5); group.add(lever);

    let angle = 0, target = 0, pressAngle = 0, bandsOk = true, bd = 0;
    const anims = new Anims();
    const setAngle = (a, snap = false) => { target = a; if (snap) { angle = a; sg.group.rotation.y = a; } };
    const setBackdrop = i => { bd = (i + BACKDROPS.length) % BACKDROPS.length; paintBackdrop(bdCanvas, BACKDROPS[bd].key); bdTex.needsUpdate = true; ui.caption(BACKDROPS[bd].note, `Behind the post: ${BACKDROPS[bd].label}`, 5000); };
    const setFinish = m => { face.roughness = m.material.roughness; face.metalness = m.material.metalness; face.needsUpdate = true; ui.caption(`${m.userData.finish[0].toUpperCase()}${m.userData.finish.slice(1)} steel plate: cl. 7 allows either, to Indian Standards Institution paint requirements. ${m.userData.finish === 'enamelled' ? 'Glossier, and the brighter mirror at night.' : 'Duller, and kinder on headlamps.'}`, 'cl. 7', 5000); };
    const api = {
      group, targets: [sg.group, lever, backdrop, enamelled, painted], dragPlane: 'xz',
      tap(hit) {
        if (guide.tap(hit)) return;
        if (tagged(hit.object, 'handle')) { setAngle(0); ui.caption('Back square to the lane.', 'Lever', 2000); }
        else if (hit.object === backdrop) setBackdrop(bd + 1);
        else if (hit.object.userData.finish) setFinish(hit.object);
        else { setAngle(angle + Math.PI); ui.caption('Spun round: the grey back, IS Colour No. 630 (cl. 6).', 'Sign', 3000); }
      },
      actions: [
        { label: 'Show the back', run: () => { setAngle(Math.abs(angle) > 1 ? 0 : Math.PI * .92); ui.caption('The reverse of every route marker is painted an unobtrusive grey, IS Colour No. 630.', 'cl. 6'); } },
        { label: 'Change the background', run: () => setBackdrop(bd + 1) },
        { label: 'Swap the bands (wrong)', toggle: () => !bandsOk, run: () => { bandsOk = !bandsOk; sg.setBands(bandsOk); ui.caption(bandsOk ? 'Lowest band black again.' : 'Wrong: the band next to the ground must be black (cl. 6).', 'Post'); } },
      ],
      a11y: [{ label: 'Enamelled finish', run: () => setFinish(enamelled) }, { label: 'Painted finish', run: () => setFinish(painted) }],
      press() { pressAngle = angle; },
      drag(d) { if (d.hit.object !== backdrop && !d.hit.object.userData.finish) setAngle(pressAngle + d.dx * .012, true); },
      update(dt) {
        anims.tick(dt);
        if (Math.abs(target - angle) > 1e-4) { angle += (target - angle) * Math.min(1, dt * 5); sg.group.rotation.y = angle; }
        tagBack.visible = Math.cos(angle) < .1;
      },
      reset() { setAngle(0, true); bandsOk = true; sg.setBands(true); setBackdrop(0); face.roughness = .28; face.metalness = .25; guide.reset(); },
      get debug() { return { angleDeg: THREE.MathUtils.radToDeg(angle), bandsOk, backdrop: BACKDROPS[bd].key, faceRoughness: face.roughness, guide: guide.debug }; },
    };
    // guided sequence: the schedule, the backdrop test, the lowest band
    const guide = makeGuide(ctx, {
      anchor: [13.2, 19.6, -2], w: 10.5, h: 5,
      steps: [
        { title: 'The schedule', show: ['Show the back'], text: 'Every colour has a number: Canary Yellow IS 309 on the face, black border and letters, unobtrusive grey IS 630 on the back (cl. 2.2, 6). Show the back, and tap a plate sample for its finish (cl. 7).' },
        { title: 'Behind the post', show: ['Change the background'], enter: () => { if (bd !== 0) setBackdrop(0); },
          check: { q: 'Against a bright sky, which of the three posts disappears?', options: ['all white', 'all black', 'the banded one'], answer: 0, why: 'White on white. Change the background to trees and the black one goes instead. Alternating 25 cm bands always leave something to see (cl. 6).' } },
        { title: 'The lowest band', show: ['Swap the bands (wrong)'], text: 'cl. 6 is specific: the band next to the ground is black. Swap the bands and look at the foot of the post: a white band at the ground is the first thing dust and mud hide.' },
      ],
    });
    group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    return api;
  },
};
