import why, { sectionSpread } from './01-section.js';
import build, { runoffSpread } from './05-runoff.js';

export const SPREADS = [null, why, sectionSpread('amount'), sectionSpread('table4'), sectionSpread('camber'), build, runoffSpread('where'), runoffSpread('example')];
