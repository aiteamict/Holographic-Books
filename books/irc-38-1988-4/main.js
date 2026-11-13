import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { car } from '../_irc38/site.js';

runBook({
  BOOK, COVER, LESSONS, QUIZ, SPREADS, fitPhone: true, phoneLayout: 2,
  // the cover mark: a curve widened on the inside, a sight line across it
  coverMark(ctx, W) {
    const k = W / 1040, cx = W / 2, cy = 1000 * k;
    ctx.lineCap = 'round'; ctx.strokeStyle = '#14202b'; ctx.lineWidth = 12 * k;
    ctx.beginPath(); ctx.arc(cx, cy, 300 * k, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.strokeStyle = '#24557a'; ctx.beginPath(); ctx.arc(cx, cy, 250 * k, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.setLineDash([14 * k, 12 * k]); ctx.strokeStyle = '#c23b2f'; ctx.lineWidth = 6 * k; ctx.beginPath(); const a0 = Math.PI * 1.3, a1 = Math.PI * 1.7; ctx.moveTo(cx + 275 * k * Math.cos(a0), cy + 275 * k * Math.sin(a0)); ctx.lineTo(cx + 275 * k * Math.cos(a1), cy + 275 * k * Math.sin(a1)); ctx.stroke(); ctx.setLineDash([]);
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
