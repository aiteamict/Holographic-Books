import { setoutSpread } from './01-setout.js';
import tight from './06-tight.js';
import existing from './07-existing.js';
import examples from './08-examples.js';

export const SPREADS = [null, setoutSpread('tangent'), setoutSpread('parallel'), setoutSpread('quarter'), setoutSpread('polar'), setoutSpread('station'), tight, existing, examples];
