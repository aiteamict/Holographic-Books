import * as THREE from 'three';
import speed from './01-speed.js';
import terrain from './02-terrain.js';

// ponytail: placeholder for spreads still being built; delete once all eight exist.
const todo = n => ({ build(ctx) { const g = new THREE.Group(); g.add(ctx.holo.projector(10)); const l = ctx.holo.label(`Spread ${n} · being built`, { h: 1.2 }); l.position.y = 4; g.add(l); return { group: g, targets: [], actions: [] }; } });

export const SPREADS = [null, speed, terrain, todo(3), todo(4), todo(5), todo(6), todo(7), todo(8)];
