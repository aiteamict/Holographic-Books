// The words on the pages. Taken from IRC : 24-2010 with the clause, table or annex in brackets.
export const BOOK = {
  title: 'The Limit State Method',
  subtitle: 'IRC : 24-2010 · chapter 1 of 9',
  credit: 'built from IRC : 24-2010',
  home: { href: '../irc-24-2010/', label: 'All IRC 24 chapters' },
  foot: 'IRC : 24-2010 · Steel Road Bridges · 1 The Limit State Method',
  cover: {
    title: ['The Limit', 'State Method'],
    kicker: 'I R C : 2 4 - 2 0 1 0   ·   C H A P T E R  1  O F  9',
    foot: ['STANDARD SPECIFICATIONS AND CODE OF PRACTICE FOR ROAD BRIDGES · SECTION V · STEEL ROAD BRIDGES', 'Indian Roads Congress · clauses 501 to 505'],
    colors: { board: ['#e4d5c4', '#c4a98f'], ink: '#231a14', cyan: '#8a3f1c', dim: '#5b4a3c', frame: 'rgba(35,26,20,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Steel, designed to its limits.',
    lede: 'The third revision of the steel bridge code replaced the working stress method with the limit state method (Introduction).',
    paras: [
      'Clauses 501 to 505 set the ground rules: which bridges the Code covers, the properties of the steel, the limit states, the safety factors, how a cross-section is classed, and the first proportions of a girder.',
      'Turn the pages in order. Each right-hand page is a live model you can load, heat, resize and tip over.',
    ],
    notes: ['Stresses in MPa (N/mm²), forces in kN, lengths in mm or m as marked (cl. 501.7). Deflections and movements in the models are drawn larger than true so they can be seen.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Steel, designed to its limits.',
    lede: 'Chapter 1 of 9 in the IRC : 24 series: clauses 501 to 505 of the standard.',
    paras: [
      '**Source.** IRC : 24-2010, Standard Specifications and Code of Practice for Road Bridges, Section V, Steel Road Bridges (Limit State Method), Third Revision, Indian Roads Congress, May 2010.',
      '**Coverage.** cl. 501.1, 501.2, Annex A: spread 1 · cl. 502.2.2.1, 509.9: spread 2 · cl. 503.1, 503.2, 505: spread 3 · cl. 503.4, Table 1: spread 4 · cl. 503.5.1, 504.3: spread 5 · cl. 503.7, Table 2, Fig. 1: spread 6 · cl. 504.1 to 504.5: spread 7 · cl. 504.6 to 504.10: spread 8.',
      '**Not drawn.** The definitions and symbols (cl. 501.4, 501.5), the lists of Indian Standards for steel, fasteners and welding (cl. 502.2.3 to 502.7), and the rules for cambering open web girders (Annex B, in chapter 4).',
    ],
    notes: ['The Code gives no worked examples. Where a model needs loads, they are marked illustrative: loads and load factors come from IRC : 6. The flange outstand of a welded section is taken clear of the web (Table 2, note 3). Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'scope', title: 'What the Code covers', prompt: 'Pick a bridge type. The card says whether the Code covers it.',
    left: {
      kicker: 'Spread 1 · cl. 501.1, 501.2 · Annex A', title: 'What the Code covers',
      lede: 'The Code deals mainly with the design of the structural steelwork of **normal road bridges**: beams, plate girders, open web girders (cl. 501.1.1).',
      paras: [
        'It applies to **riveted, bolted and welded** construction using **hot rolled** steel sections only; cold formed sections are not covered (cl. 501.1.2). Loads and load combinations come from IRC : 6, and concrete acting with the steel from IRC : 22 (cl. 501.1.3, 501.1.4).',
        'Ten types have special requirements for design, and special literature may be referred to: **curved, cable-stayed, suspension, temporary, pedestrian, swing, bascule, box girder, prestressed steel and arch** bridges. Their structural members and connections may still be designed by this Code (cl. 501.2).',
        'Steel bridges shall generally be designed by the limit state method. Where that cannot be conveniently adopted, the working stress method of Annex G may be used at the discretion of the authority (cl. 501.1.6).',
      ],
    },
    right: { kicker: 'cl. 501.2 · Annex A', title: 'Normal and special bridges' },
  },
  {
    id: 'steel', title: 'The steel', prompt: 'Drag the temperature. Pick a longer span.',
    left: {
      kicker: 'Spread 2 · cl. 502.2.2.1, 509.9', title: 'The steel',
      lede: 'For design, the same physical properties are assumed for **all grades** of steel (cl. 502.2.2.1).',
      paras: [
        'Unit mass **ρ = 7850 kg/m³**. Modulus of elasticity **E = 2.0 × 10⁵ MPa**. Poisson’s ratio **μ = 0.3**. Modulus of rigidity **G = 0.77 × 10⁵ MPa**. Coefficient of thermal expansion **αt = 12 × 10⁻⁶ per °C** (cl. 502.2.2.1).',
        'What differs between grades is the mechanical side: the **yield stress fy**, the **ultimate stress fu**, the elongation and the notch toughness, found by tests on samples cut from the plates and sections (cl. 502.2.2.2). Structural steel shall comply with IS 2062 and the other standards listed (cl. 502.2.3).',
        'A span changes length with temperature, so provision shall be made to resist the thermal stresses, or means provided for the movement; and also for changes in length of span resulting from live loads (cl. 509.9).',
      ],
    },
    right: { kicker: 'cl. 502.2.2.1 · 509.9', title: 'A span that breathes' },
  },
  {
    id: 'limit', title: 'Limit states', prompt: 'Pick a limit state, then drag the load.',
    left: {
      kicker: 'Spread 3 · cl. 503.1, 503.2, 505', title: 'Limit states',
      lede: 'A limit state is the acceptable limit for safety or serviceability, before failure occurs (cl. 503.1.1).',
      paras: [
        'The structure is designed on the most critical limit state and checked for the others. **Strength:** loss of equilibrium, loss of stability, failure by excessive deformation or rupture, brittle fracture. **Serviceability:** deflection, vibration, corrosion and durability. **Fatigue:** the stress range from live loads reaching its limit for the number of cycles and the detail (cl. 503.2.2).',
        'Design is based on **characteristic values** of strength and load, which allow for their variation. Partial safety factors turn them into design values, and the design is reliable when **design load ≤ design strength** (cl. 503.2.1).',
        'Load effects are found by **elastic analysis**: members are assumed to remain elastic under the factored design loads for all limit states (cl. 505.1, 505.2.1).',
      ],
      notes: ['A bridge must also survive accidents such as fire, explosion and vehicle impact with local damage only: by avoiding hazards, by its form and by redundancy (cl. 503.1.2).'],
    },
    right: { kicker: 'cl. 503.2', title: 'Strength, serviceability, fatigue' },
  },
  {
    id: 'factors', title: 'Partial safety factors', prompt: 'Pick a row of Table 1. Switch between shop and field.',
    left: {
      kicker: 'Spread 4 · cl. 503.4 · Table 1', title: 'Partial safety factors',
      lede: 'The design strength is the ultimate strength divided by a partial safety factor for materials: **Sd = Su / γm** (cl. 503.4).',
      paras: [
        'γm allows for an unfavourable deviation of material strength from its characteristic value, unfavourable variation of member sizes, loss of strength from fabrication and tolerances, and uncertain calculation of strength (cl. 503.4, note).',
        'Resistance governed by **yielding** or by **buckling**: γm0 = **1.10**. Resistance governed by **ultimate stress**: γm1 = **1.25**. Connections: friction bolts, bearing bolts and rivets **1.25**; welds **1.25** in the shop and **1.50** in the field (Table 1).',
        'The loads of IRC : 6 are taken with their own load factors (cl. 503.3). For fatigue, the partial safety factor for loads is 1.00 (cl. 503.5.2).',
      ],
    },
    right: { kicker: 'Table 1', title: 'From ultimate to design strength' },
  },
  {
    id: 'overturn', title: 'Staying upright', prompt: 'Change the spacing and the wind. Put the truck on.',
    left: {
      kicker: 'Spread 5 · cl. 503.5.1, 504.3', title: 'Staying upright',
      lede: 'The structure as a whole, or any part of it, shall be designed to prevent instability due to **overturning, uplift or sliding** under factored load (cl. 503.5.1).',
      paras: [
        'The loads are divided into those that aid instability and those that resist it. The loads causing instability are combined with their load factors to give the largest destabilising effect (cl. 503.5.1 a, b).',
        'The permanent loads that resist are multiplied by a partial safety factor of **0.9**. Variable loads that would help the resistance are **disregarded**. The resistance must be greater than or equal to the destabilising effect (cl. 503.5.1 c, d).',
        'For the same reason, the distance between centres of the main girders must be enough to resist overturning or overstressing due to lateral forces, and **not less than 1/20 of the span** (cl. 504.3).',
      ],
    },
    right: { kicker: 'cl. 503.5.1 · 504.3', title: 'Wind against weight' },
  },
  {
    id: 'classes', title: 'The class of a section', prompt: 'Drag the flange wider. Change the thicknesses and the steel.',
    left: {
      kicker: 'Spread 6 · cl. 503.7 · Table 2 · Fig. 1', title: 'The class of a section',
      lede: 'Local buckling of the plates of a section is avoided by limiting the **width to thickness ratio** of each element in compression (cl. 503.7.1).',
      paras: [
        '**Class 1, plastic:** can develop plastic hinges with the rotation needed for a plastic mechanism. **Class 2, compact:** can develop the plastic moment, but without that rotation. **Class 3, semi-compact:** the extreme fibre can reach yield, but not the plastic moment. **Class 4, slender:** buckles locally before yield (cl. 503.7.2).',
        'Table 2 gives the limits as multiples of **ε = √(250 / fy)**. For the outstand of a compression flange: **9.4ε, 10.5ε, 15.7ε** rolled and **8.4ε, 9.4ε, 13.6ε** welded. For a web with the neutral axis at mid-depth: **84ε, 105ε, 126ε** (Table 2).',
        'When elements fall in different classes, the section takes the class of its most critical element. Design of slender compression elements is outside the scope of the Code (cl. 503.7.2).',
      ],
      notes: ['Webs shall be checked for shear buckling when d/t exceeds 67ε (Table 2, note 3).'],
    },
    right: { kicker: 'Table 2', title: 'Plastic, compact, semi-compact, slender' },
  },
  {
    id: 'depth', title: 'Span, depth and deflection', prompt: 'Pick a depth. Drag the deflection.',
    left: {
      kicker: 'Spread 7 · cl. 504.1 to 504.5', title: 'Span, depth and deflection',
      lede: 'The effective span of a main girder is the distance between the **centres of bearings** (cl. 504.1).',
      paras: [
        'The effective depth is measured between the centres of gravity of the flanges or chords (cl. 504.2). The depth should preferably be not less than **1/10** of the effective span for trusses and **1/25** for rolled joists and plate girders; an open web girder should be no deeper than three times the distance between the girders (cl. 504.4).',
        'Deflection is checked by elastic analysis with a load factor of 1.0 (cl. 504.5). The total deflection under dead load, live load and impact shall not exceed **1/600** of the span, unless precamber takes up the dead loads; live load and impact alone shall not exceed **1/800** (cl. 504.5.1).',
        'At the tip of a cantilever the limits are **1/300** and **1/400** of the arm (cl. 504.5.2). Footpath live load may be neglected, and the gross moment of inertia is used (cl. 504.5.3, 504.5.5).',
      ],
    },
    right: { kicker: 'cl. 504.4 · 504.5', title: 'How deep, how stiff' },
  },
  {
    id: 'camber', title: 'Camber and minimum sections', prompt: 'Add the loads one by one. Drag the calculated thickness.',
    left: {
      kicker: 'Spread 8 · cl. 504.6 to 504.10', title: 'Camber and minimum sections',
      lede: 'Camber is provided as the engineer specifies, to keep clearance under all loading or for the sake of appearance (cl. 504.6.1).',
      paras: [
        'Beams and plate girders up to and including **35 m** span need not be cambered. An open web girder is cambered so that under full dead load plus **75 per cent of the live load without impact** it takes the true geometrical shape assumed in design (cl. 504.6.2).',
        'Minimum thickness: **8 mm** where both sides can be painted; where one side cannot, **1.5 mm** is added to a calculated thickness under 12.5 mm, with at least **10 mm**; **6 mm** for box members sealed inside (cl. 504.7.1). No angle under 75 × 50 mm in riveted main members, none under 65 × 45 mm anywhere, and no flat under 50 mm wide (cl. 504.7.3, 504.7.4).',
        'Skew bridges need a detailed analysis of forces unless the skew is within **15°** (cl. 504.8). Jacking points for inspecting and maintaining the bearings are built in and marked (cl. 504.9.1). Fire-fighting equipment should reach all parts, and after a fire experts must inspect the bridge before it is declared safe (cl. 504.10).',
      ],
    },
    right: { kicker: 'cl. 504.6 · 504.7', title: 'Built arched, built thick enough' },
  },
];

export const QUIZ = [];
