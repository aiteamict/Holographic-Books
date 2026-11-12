import why from './01-why.js';
import { widenSpread } from './02-widen.js';
import edges from './05-edges.js';
import { sightSpread } from './06-sight.js';
import examples from './08-examples.js';

export const SPREADS = [null, why, widenSpread('amount'), widenSpread('table7'), widenSpread('apply'), edges, sightSpread('setback'), sightSpread('cut'), examples];
