import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { car } from '../_irc38/site.js';

runBook({
  BOOK, COVER, LESSONS, QUIZ, SPREADS, fitPhone: true, phoneLayout: 2,
  // the cover mark: a car on a curve with the outward push and the weight, the balance of section 4
  coverMark(ctx, W) {
    const k = W / 1040, cx = W / 2, cy = 860 * k, r = 300 * k;
    ctx.lineCap = 'round'; ctx.strokeStyle = '#14202b'; ctx.lineWidth = 14 * k;
    ctx.beginPath(); ctx.arc(cx, cy + r, r, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.fillStyle = '#24557a'; ctx.fillRect(cx - 34 * k, cy - 26 * k, 68 * k, 36 * k);
    const arrow = (x0, y0, x1, y1, col) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 7 * k; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); const a = Math.atan2(y1 - y0, x1 - x0); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 22 * k * Math.cos(a - .4), y1 - 22 * k * Math.sin(a - .4)); ctx.lineTo(x1 - 22 * k * Math.cos(a + .4), y1 - 22 * k * Math.sin(a + .4)); ctx.fill(); };
    arrow(cx, cy - 8 * k, cx, cy - 170 * k, '#c23b2f'); arrow(cx, cy - 8 * k, cx, cy + 110 * k, '#3b4d5e');
    ctx.font = `700 ${38 * k}px Georgia, serif`; ctx.fillStyle = '#c23b2f'; ctx.fillText('P = WV²/127R', cx + 24 * k, cy - 120 * k);
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
