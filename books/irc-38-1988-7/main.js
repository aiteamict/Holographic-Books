import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { car } from '../_irc38/site.js';

runBook({
  BOOK, COVER, LESSONS, QUIZ, SPREADS, fitPhone: true,
  // the cover mark: a hair-pin bend — two straights nearly parallel, joined by spiral, circle and spiral
  coverMark(ctx, W) {
    const k = W / 1040, R = 105 * k, L = 190 * k, ds = 2 * k, turn = 165 * Math.PI / 180, arc = R * (turn - L / R);   // the two spirals take L/R of the turn
    let x = 410 * k, y = 1120 * k, h = -Math.PI / 2 + (Math.PI - turn) / 2;   // climbing, turning clockwise through 165°
    const piece = (len, k0, k1, col) => {
      ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(x, y);
      for (let s = 0; s < len; s += ds) { h += (k0 + (k1 - k0) * (s + ds / 2) / len) * ds; x += Math.cos(h) * ds; y += Math.sin(h) * ds; ctx.lineTo(x, y); }
      ctx.stroke();
    };
    ctx.lineCap = 'round'; ctx.lineWidth = 14 * k;
    piece(150 * k, 0, 0, "#14202b"); piece(L, 0, 1 / R, "#b0532a"); piece(arc, 1 / R, 1 / R, "#24557a"); piece(L, 1 / R, 0, "#b0532a"); piece(150 * k, 0, 0, "#14202b");
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
