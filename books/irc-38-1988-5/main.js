import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { car } from '../_irc38/site.js';

runBook({
  BOOK, COVER, LESSONS, QUIZ, SPREADS, fitPhone: true,
  // the cover mark: a straight easing into a spiral (amber) and on round the circle (blue)
  coverMark(ctx, W) {
    const k = W / 1040, x0 = 220 * k, y0 = 1090 * k, A = 300 * k;
    ctx.lineCap = 'round'; ctx.lineWidth = 14 * k;
    ctx.strokeStyle = '#14202b'; ctx.beginPath(); ctx.moveTo(60 * k, y0); ctx.lineTo(x0, y0); ctx.stroke();
    let x = x0, y = y0, th = 0; const ds = 2 * k, end = A * 1.25;
    ctx.strokeStyle = '#b0532a'; ctx.beginPath(); ctx.moveTo(x, y);
    for (let s = 0; s < end; s += ds) { th = s * s / (2 * A * A); x += Math.cos(th) * ds; y -= Math.sin(th) * ds; ctx.lineTo(x, y); }
    ctx.stroke();
    const R = A * A / end; ctx.strokeStyle = '#24557a'; ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 0; i < 70; i++) { th += ds / R * 3; x += Math.cos(th) * ds * 3; y -= Math.sin(th) * ds * 3; ctx.lineTo(x, y); }
    ctx.stroke();
  },
  // a car circling on the projector
  coverHolo({ holo }) {
    const g = new THREE.Group(), up = new THREE.Group(); up.position.y = .4;
    const c = car(.9, 0x24557a); c.position.set(5, 0, 0); c.rotation.y = -Math.PI / 2; up.add(c);
    up.add(holo.ring(5, holo.CYAN, { width: .12 }));
    g.add(holo.projector(9), up); g.userData.up = up;
    return g;
  },
});
