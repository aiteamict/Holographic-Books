import between from './01-between.js';
import { compoundSpread } from './02-compound.js';
import reverse from './06-reverse.js';
import hairpin from './07-hairpin.js';

export const SPREADS = [null, between, compoundSpread('geometry'), compoundSpread('offsets'), compoundSpread('deflect'), compoundSpread('station'), reverse, hairpin];
