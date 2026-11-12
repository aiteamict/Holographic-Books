import * as THREE from 'three';
import speed from './01-speed.js';
import terrain from './02-terrain.js';
import speeds from './03-speeds.js';
import force, { curveDrive } from './04-force.js';
import balance from './05-balance.js';

// ponytail: placeholder for spreads still being built; delete once all eight exist.
const todo = n => ({ build(ctx) { const g = new THREE.Group(); g.add(ctx.holo.projector(10)); const l = ctx.holo.label(`Spread ${n} · being built`, { h: 1.2 }); l.position.y = 4; g.add(l); return { group: g, targets: [], actions: [] }; } });

export const SPREADS = [null, speed, terrain, speeds, force, balance, curveDrive('radius'), todo(7), todo(8)];
