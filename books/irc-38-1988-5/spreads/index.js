import why from './01-why.js';
import types from './02-types.js';
import { lengthSpread } from './03-length.js';
import spiral from './06-spiral.js';
import shift from './07-shift.js';
import { design, table12 } from './08-examples.js';

export const SPREADS = [null, why, types, lengthSpread('comfort'), lengthSpread('super'), lengthSpread('table9'), spiral, shift, design, table12];
