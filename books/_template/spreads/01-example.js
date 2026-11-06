// A minimal spread: one object on the projector, one action, a two-step guide.
// Contract: build(ctx) → { group, targets, actions, tap?, drag?, update?, reset?, guide?, a11y?, debug? }
// ctx: { THREE, holo, ui, QUIZ, scene, camera, snd, ...whatever main.js passes as ctx }
import * as THREE from 'three';
import { Anims, pulse, tween } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';

export default {
  // shots: [{ pos, look, dur, hold, text }]  — optional ▶ Watch tour; pos/look in world coords (hologram root at x≈13)
  build(ctx) {
    const { holo, ui } = ctx;
    const anims = new Anims();
    const group = new THREE.Group(); group.add(holo.projector(12));
    const box = holo.wireBox(6, 6, 6, holo.CYAN); box.position.y = 6; group.add(box);
    const spin = { label: 'Spin', run: () => tween(anims, box.rotation, 'y', box.rotation.y + Math.PI / 2, .8) };

    const api = {
      group, targets: [box],
      actions: [spin],
      tap(hit) { if (guide.tap(hit)) return; pulse(anims, box); ui.caption('You tapped the box.', 'Example', 3000); },
      a11y: [{ label: 'Tap the box', run: () => pulse(anims, box) }],
      update(dt) { anims.tick(dt); },
      reset() { anims.clear(); box.rotation.set(0, 0, 0); guide.reset(); },
      get debug() { return { rotY: box.rotation.y, guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [0, 15, 0],
      steps: [
        { title: 'Look', show: [], text: 'Say what the reader should notice first. Tap this card to go on.' },
        { title: 'Try', show: ['Spin'], text: 'Now the Spin chip appears. Press it.', check: { q: 'How far does one Spin turn the box?', options: ['45°', '90°', '180°'], answer: 1, why: 'One Spin is a quarter turn.' } },
      ],
    });
    group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    return api;
  },
};
