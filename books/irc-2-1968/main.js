import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import * as holo from '@engine/holo.js';
import * as sign from './sign/index.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { initHero, makeHero } from '@engine/hero.js';

const heroReady = initHero();

runBook({
  fitPhone: true, phoneZoom: true,   // upright phones: the camera pulls back until the whole hologram fits (engine/run.js fitPortrait)
  BOOK, COVER, LESSONS, QUIZ, SPREADS,
  ctx: { sign, hero: makeHero },
  // the NH 42 shield on the cover board
  coverMark(ctx, W) {
    const c = document.createElement('canvas'); c.width = 450; c.height = 600; sign.drawFace(c, '42');
    const k = W / 1040; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40 * k; ctx.shadowOffsetY = 14 * k; ctx.drawImage(c, W / 2 - 170 * k, 520 * k, 340 * k, 453 * k); ctx.restore();
  },
  // the shield outline, turning slowly beside the closed book, with the surveyor sizing it up
  coverHolo() {
    const g = new THREE.Group();
    const S = .03, o = sign.shieldOutline().map(p => ({ x: p.x - 225, y: p.y - 300 }));
    const up = new THREE.Group(); up.position.y = 12;
    up.add(holo.outline(o, holo.CYAN, { scale: S }), holo.fillPoly(o, holo.CYAN, { scale: S, opacity: .08 }));
    const gc = document.createElement('canvas'); gc.width = 450; gc.height = 600; sign.drawFace(gc, '42', { yellow: 'rgba(0,0,0,0)', ink: '#1d5f87', noBorder: true });
    const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace;
    up.add(new THREE.Mesh(new THREE.PlaneGeometry(450 * S, 600 * S), new THREE.MeshBasicMaterial({ map: gt, transparent: true, opacity: .55, blending: THREE.NormalBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })));
    g.add(holo.projector(11), up); g.userData.up = up;
    heroReady.then(() => { const h = makeHero(7); h.position.set(-7.5, 0, 5); h.rotation.y = .6; g.add(h); });
    return g;
  },
});
