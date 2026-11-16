import { fillet, weldrules, weldstress } from './welds.js';
import { bolt, details, tension, pry, splices, reductions } from './bolts.js';

export const SPREADS = [null, fillet, weldrules, weldstress, bolt, details, tension, pry, splices, reductions];
