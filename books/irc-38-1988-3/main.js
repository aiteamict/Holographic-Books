import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { car } from '../_irc38/site.js';

runBook({
  BOOK, COVER, LESSONS, QUIZ, SPREADS, fitPhone: true, phoneLayout: 2,
  // the cover mark: a road cross-section tilting from camber to full superelevation
  coverMark(ctx, W) {
    const k = W / 1040, cx = W / 2, cy = 880 * k;
    ctx.lineCap = 'round'; ctx.lineWidth = 16 * k;
    [[0, '#97a9ba'], [.035, '#5f7486'], [.07, '#14202b']].forEach(([e, col], i) => { const y = cy - i * 70 * k, a = Math.atan(e * 3); ctx.strokeStyle = col; ctx.beginPath(); if (!e) { ctx.moveTo(cx - 260 * k, y + 14 * k); ctx.lineTo(cx, y); ctx.lineTo(cx + 260 * k, y + 14 * k); } else { ctx.moveTo(cx - 260 * k * Math.cos(a), y + 260 * k * Math.sin(a)); ctx.lineTo(cx + 260 * k * Math.cos(a), y - 260 * k * Math.sin(a)); } ctx.stroke(); });
    ctx.font = '700 ' + 38 * k + 'px Georgia, serif'; ctx.fillStyle = '#c23b2f'; ctx.textAlign = 'center'; ctx.fillText('e = V²/225R', cx, cy - 230 * k); ctx.textAlign = 'left';
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
