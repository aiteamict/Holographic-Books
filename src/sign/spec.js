// Every number in the book comes from IRC : 2-1968 (first revision, reprinted 1985).
// Millimetres unless noted. `ref` names the clause or plate it was read from.
// Colour hexes are approximations of the IS colour numbers; the standard gives only the numbers.

export const SPEC = {
  code: 'IRC : 2-1968',
  title: 'Route Marker Signs for National Highways',
  history: { published: 1953, revised: 1968, reprinted: 1985, ceMeeting: 'April 1952', council: '2 November 1968, Bombay', ref: 'cl. 1.1–1.2' },

  plate: { w: 450, h: 600, r: 12, ref: 'cl. 2.1, Plate 1' },
  border: { t: 10, inset: 12, ref: 'Plate 1' },
  notch: { halfW: 25, depth: 12, ref: 'Plate 1' },
  // top → bottom; the five bands between the two 12 mm margins add up with them to 600
  zones: [
    { h: 12, label: 'margin' }, { h: 75, label: 'space' }, { h: 100, label: 'letters N H' },
    { h: 75, label: 'space' }, { h: 200, label: 'route numerals' }, { h: 126, label: 'space' }, { h: 12, label: 'margin' },
  ],
  curve: { straightTo: 385, R: 318, Rcentre: 132, Rfillet: 120, ref: 'Plate 1 (construction)' },
  holes: { d: 13, bolt: 10, apart: 50, fromTop: 25, fromBottom: 50, ref: 'Plate 2' },

  letters: { h: 100, stroke: 16, w: 67, gap: 45, barFromBottom: 44, ref: 'Fig. 1' },
  numerals: { h: 200, stroke: 31, w: 134, ref: 'Plate 5' },
  // Plate 5, Table 1: code number by preceding numeral (row) and following numeral (column group)
  spacingCode: { 1: [1, 1, 2], 2: [1, 2, 2], 3: [1, 2, 2], 4: [2, 2, 4], 5: [1, 2, 2], 6: [1, 2, 2], 7: [2, 2, 4], 8: [1, 2, 2], 9: [1, 2, 2], 0: [1, 2, 2] },
  spacingGroups: ['1, 5', '2, 3, 6, 8, 9, 0', '4, 7'],
  // Plate 5, Table 2
  spacingMM: { 1: 47, 2: 38, 4: 13 },

  colours: {
    face: { name: 'Canary Yellow', is: 309, hex: '#f0c020', ref: 'cl. 2.2' },
    ink: { name: 'Black', hex: '#141414', ref: 'cl. 2.2' },
    back: { name: 'Unobtrusive grey', is: 630, hex: '#9a9d98', ref: 'cl. 6' },
    postBands: { h: 250, lowest: 'black', ref: 'cl. 6' },
  },
  materials: ['enamelled steel plate', 'painted steel plate'],
  materialsRef: 'cl. 7',

  post: { section: '75 × 75 × 10 mm T-iron', w: 75, topOfShield: 2250, gapToDefPlate: 150, defPlateToGround: 1250, ref: 'Plate 2' },
  defPlate: { w: 300, h: 250, border: 10, inset: 15, shaft: 45, headL: 90, headW: 100, ref: 'cl. 4.1, Plate 3' },

  // real-world props drawn around the sign (metres). Not from IRC 2; sourced as noted.
  props: {
    carriageway: { width: 7, ref: 'IRC 73-1980 two-lane carriageway, 7.0 m' },
    kerb: { height: .15, width: .3, ref: 'typical barrier kerb, 150 mm upstand' },
    car: { length: 4.3, width: 1.7, height: 1.6, wheel: .32, ref: 'a 1960s saloon (Hindustan Ambassador: 4.33 × 1.66 × 1.59 m)' },
    figure: { height: 1.7, ref: 'adult for scale' },
    tIron: { w: .075, t: .010, ref: 'Plate 2: 75 × 75 × 10 mm T-iron' },
  },

  location: {
    beforeJunction: [100, 150],   // m, cl. 3.4
    confirmatory: [15, 30],       // m, Plate 2
    noKerb: [2, 3],               // m clear from carriageway edge, cl. 3.3
    kerb: 0.6,                    // m from kerb edge, Plate 2 (text misprints 60 mm)
    side: 'left',                 // cl. 3.4
    turnAway: 'slightly, to avoid specular reflection', // cl. 3.3
    ref: 'cl. 3, Plate 2',
  },
};

const COL = d => '15'.includes(d) ? 0 : '47'.includes(d) ? 2 : 1;
export const spacingCode = (a, b) => SPEC.spacingCode[a][COL(b)];
export const spacingMM = (a, b) => SPEC.spacingMM[spacingCode(a, b)];
export const groupOf = d => SPEC.spacingGroups[COL(d)];
