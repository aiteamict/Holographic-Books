import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { box, paint } from '../_irc24/kit.js';

runBook({
  BOOK, COVER, LESSONS, QUIZ, SPREADS, fitPhone: true, phoneLayout: 2,
  // the cover mark: an I-section with the design inequality under it
  coverMark(ctx, W) {
    const k = W / 1040, cx = W / 2, cy = 800 * k;
    ctx.fillStyle = '#8a3f1c'; ctx.fillRect(cx - 190 * k, cy - 250 * k, 380 * k, 46 * k); ctx.fillRect(cx - 190 * k, cy + 204 * k, 380 * k, 46 * k); ctx.fillRect(cx - 17 * k, cy - 204 * k, 34 * k, 408 * k);
    ctx.font = '700 ' + 36 * k + 'px Georgia, serif'; ctx.fillStyle = '#231a14'; ctx.textAlign = 'center'; ctx.fillText('design load ≤ design strength', cx, cy + 330 * k); ctx.textAlign = 'left';
  },
  // an I-beam turning on the projector
  coverHolo({ holo }) {
    const g = new THREE.Group(), up = new THREE.Group(), m = paint(); up.position.y = 2.2;
    up.add(box(9, .5, 3.4, m, 0, -2, 0), box(9, 3.5, .34, m), box(9, .5, 3.4, m, 0, 2, 0));
    g.add(holo.projector(9), up); g.userData.up = up;
    return g;
  },
});
