import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import { initHero, makeHero } from '@engine/hero.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { TYPES, makeRig, drawSilhouette } from './vehicles.js';

const heroReady = initHero();
const COVER_TYPE = TYPES.find(t => t.id === '3-S2');

runBook({
  BOOK, COVER, LESSONS, QUIZ, SPREADS,
  ctx: { hero: makeHero },
  // the 3-S2 silhouette from the standard's Figure, on the sage board
  coverMark(ctx, W) {
    const k = W / 1040, m = 44 * k;                      // px per metre: the 16 m rig spans ~700 px of a 1040 px-wide cover
    drawSilhouette(ctx, COVER_TYPE, W / 2 - 8 * m, 900 * k, m, { ink: '#13201f', lw: 5 * k });
    ctx.fillStyle = 'rgba(19,32,31,.35)'; ctx.fillRect(W / 2 - 9 * m, 900 * k, 18 * m, 3 * k);
  },
  // a 3-S2 hologram turning slowly beside the closed book, the surveyor sizing it up
  coverHolo({ holo }) {
    const g = new THREE.Group(), up = new THREE.Group(); up.position.y = .5;
    const rig = makeRig(COVER_TYPE, .9); up.add(rig.group);
    g.add(holo.projector(9), up); g.userData.up = up;
    heroReady.then(() => { const h = makeHero(.9); h.position.set(-8.5, 0, 3); h.rotation.y = .6; g.add(h); });
    return g;
  },
});
