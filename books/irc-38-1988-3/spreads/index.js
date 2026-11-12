import * as THREE from 'three';
import why, { sectionSpread } from './01-section.js';

// ponytail: placeholder for spreads still being built; delete once all seven exist.
const todo = n => ({ build(ctx) { const g = new THREE.Group(); g.add(ctx.holo.projector(10)); const l = ctx.holo.label(`Spread ${n} · being built`, { h: 1.2 }); l.position.y = 4; g.add(l); return { group: g, targets: [], actions: [] }; } });

export const SPREADS = [null, why, sectionSpread('amount'), sectionSpread('table4'), sectionSpread('camber'), todo(5), todo(6), todo(7)];
