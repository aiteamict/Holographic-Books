import * as THREE from 'three';
import { runBook } from '@engine/run.js';
import { initHero, makeHero } from '@engine/hero.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { horizontalCurve, layout } from '../_irc38/curve.js';
import { makePlan } from '../_irc38/plan.js';

const heroReady = initHero();

runBook({
  BOOK, COVER, LESSONS, QUIZ, SPREADS, fitPhone: true,
  ctx: { hero: makeHero },
  // the cover mark: two straights, the curve between them, the apex distance
  coverMark(ctx, W) {
    const k = W / 1040, c = horizontalCurve(56, 170, 55), L = layout(c, 1), s = 3.2 * k, cx = W / 2, cy = 820 * k;
    const P = ([x, y]) => [cx + x * s, cy - y * s];
    ctx.lineCap = 'round'; ctx.setLineDash([12 * k, 12 * k]); ctx.strokeStyle = 'rgba(20,32,43,.45)'; ctx.lineWidth = 4 * k;
    ctx.beginPath(); ctx.moveTo(...P(L.TP)); ctx.lineTo(...P(L.PI)); ctx.lineTo(...P(L.PT)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#14202b'; ctx.lineWidth = 12 * k; ctx.beginPath(); L.pts.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](...P(p))); ctx.stroke();
    ctx.strokeStyle = '#24557a'; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(...P(L.PI)); ctx.lineTo(...P(L.mid)); ctx.stroke();
    for (const q of [L.TP, L.PT, L.PI]) { ctx.fillStyle = '#b0532a'; ctx.beginPath(); ctx.arc(...P(q), 9 * k, 0, Math.PI * 2); ctx.fill(); }
  },
  // the curve of Example 11.3 on the projector, the surveyor beside it
  coverHolo({ holo }) {
    const g = new THREE.Group(), up = new THREE.Group(); up.position.y = .4;
    const plan = makePlan({ s: .055, origin: [0, .1, -3.5], ext: 30, show: { ts: false, es: false, radii: false, centre: false } });
    plan.set(horizontalCurve(56, 170, 55)); up.add(plan.group);
    g.add(holo.projector(9), up); g.userData.up = up;
    heroReady.then(() => { const h = makeHero(.9); h.position.set(-8.5, 0, 3); h.rotation.y = .6; g.add(h); });
    return g;
  },
});
