import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { car } from '../_irc38/site.js';

runBook({
  BOOK, COVER, LESSONS, QUIZ, SPREADS, fitPhone: true,
  // the cover mark: a spiral pegged in ten chords, each peg on a sight line from the tangent point
  coverMark(ctx, W) {
    const k = W / 1040, x0 = 170 * k, y0 = 1090 * k, A = 330 * k, end = A * 1.3, n = 260, ds = end / n;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#14202b'; ctx.lineWidth = 8 * k; ctx.beginPath(); ctx.moveTo(60 * k, y0); ctx.lineTo(900 * k, y0); ctx.stroke();
    const pegs = []; let x = x0, y = y0;
    ctx.strokeStyle = '#b0532a'; ctx.lineWidth = 12 * k; ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 1; i <= n; i++) { const s = (i - .5) * ds, th = s * s / (2 * A * A); x += Math.cos(th) * ds; y -= Math.sin(th) * ds; ctx.lineTo(x, y); if (i % (n / 10) === 0) pegs.push([x, y]); }
    ctx.stroke();
    ctx.setLineDash([10 * k, 10 * k]); ctx.strokeStyle = '#24557a'; ctx.lineWidth = 4 * k;
    for (const [px, py] of pegs) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(px, py); ctx.stroke(); }
    ctx.setLineDash([]); ctx.fillStyle = '#14202b';
    for (const [px, py] of pegs) { ctx.beginPath(); ctx.arc(px, py, 11 * k, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#24557a'; ctx.beginPath(); ctx.arc(x0, y0, 18 * k, 0, Math.PI * 2); ctx.fill();
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
