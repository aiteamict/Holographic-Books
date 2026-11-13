import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { car } from '../_irc38/site.js';

runBook({
  BOOK, COVER, LESSONS, QUIZ, SPREADS, fitPhone: true,
  // the cover mark: a ruled table, one cell in red, with a transition curve drawn over it
  coverMark(ctx, W) {
    const k = W / 1040, x0 = 250 * k, y0 = 640 * k, cw = 108 * k, rh = 62 * k, n = 5, m = 7;
    ctx.strokeStyle = 'rgba(20,32,43,.45)'; ctx.lineWidth = 3 * k;
    for (let i = 0; i <= m; i++) { ctx.beginPath(); ctx.moveTo(x0, y0 + i * rh); ctx.lineTo(x0 + n * cw, y0 + i * rh); ctx.stroke(); }
    for (let j = 0; j <= n; j++) { ctx.beginPath(); ctx.moveTo(x0 + j * cw, y0); ctx.lineTo(x0 + j * cw, y0 + m * rh); ctx.stroke(); }
    ctx.fillStyle = 'rgba(179,54,43,.75)'; ctx.fillRect(x0 + 3 * cw + 4 * k, y0 + 4 * rh + 4 * k, cw - 8 * k, rh - 8 * k);
    ctx.strokeStyle = '#b0532a'; ctx.lineWidth = 14 * k; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const t = i / 60, x = x0 - 60 * k + t * (n * cw + 120 * k), y = y0 + m * rh + 40 * k - (t ** 3) * (m * rh + 120 * k); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
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
