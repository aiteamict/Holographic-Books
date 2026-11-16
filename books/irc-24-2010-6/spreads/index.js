import { shear, buckling, tension, endpanel } from './shear.js';
import { webthick, stiff, bearing, combined } from './stiffeners.js';

export const SPREADS = [null, shear, buckling, tension, endpanel, webthick, stiff, bearing, combined];
