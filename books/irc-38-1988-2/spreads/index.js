import speed from './01-speed.js';
import terrain from './02-terrain.js';
import speeds from './03-speeds.js';
import force, { curveDrive } from './04-force.js';
import balance from './05-balance.js';
import turning from './07-turning.js';
import check from './08-check.js';

export const SPREADS = [null, speed, terrain, speeds, force, balance, curveDrive('radius'), turning, check];
