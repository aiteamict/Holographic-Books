// The words on the pages. Taken from IRC : 24-2010 with the clause, table or annex in brackets.
export const BOOK = {
  title: 'Building and Keeping the Bridge',
  subtitle: 'IRC : 24-2010 · chapter 9 of 9',
  credit: 'built from IRC : 24-2010',
  home: { href: '../irc-24-2010/', label: 'All IRC 24 chapters' },
  foot: 'IRC : 24-2010 · Steel Road Bridges · 9 Building and Keeping the Bridge',
  cover: {
    title: ['Building and', 'Keeping the Bridge'],
    kicker: 'I R C : 2 4 - 2 0 1 0   ·   C H A P T E R  9  O F  9',
    foot: ['STANDARD SPECIFICATIONS AND CODE OF PRACTICE FOR ROAD BRIDGES · SECTION V · STEEL ROAD BRIDGES', 'Indian Roads Congress · clauses 513, 514 · Annexes D to G'],
    colors: { board: ['#e4d5c4', '#c4a98f'], ink: '#231a14', cyan: '#8a3f1c', dim: '#5b4a3c', frame: 'rgba(35,26,20,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'From drawing to river.',
    lede: 'All work shall be in accordance with the drawings and the clauses of the Code, unless otherwise agreed (cl. 513.1).',
    paras: [
      'A design is only as good as the steelwork made from it. Clause 513 covers the workshop: holes, bolts, rivets, welds, heat, tolerances and inspection. Clause 514 covers the journey to site and the erection.',
      'The annexes carry on after the bridge opens: protecting it against corrosion, inspecting it, testing it under load. The last annex keeps the older working stress method.',
    ],
    notes: ['Lengths in mm, temperatures in °C, loads in kN, stresses in MPa. Sizes and loads in the models are illustrative.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'From drawing to river.',
    lede: 'Chapter 9 of 9 in the IRC : 24 series: clauses 513 and 514, and Annexes D to G.',
    paras: [
      '**Source.** IRC : 24-2010, Standard Specifications and Code of Practice for Road Bridges, Section V, Steel Road Bridges (Limit State Method), Third Revision, Indian Roads Congress, May 2010.',
      '**Coverage.** cl. 513.5.5: spread 1 · cl. 513.5.6: spread 2 · cl. 513.5.13, 513.5.14, Table 20: spread 3 · cl. 513.4, 513.5.7, 513.5.9: spread 4 · cl. 514: spread 5 · Annex D: spread 6 · Annex E: spread 7 · Annex F: spread 8 · Annex G: spread 9.',
      '**Not drawn.** Laminations in plates (cl. 513.2), edge preparation (cl. 513.5.4), welded construction and its testing (cl. 513.5.8, 513.6), transport and storage (cl. 514.2, 514.3), strength tests and tests to failure (Annex F2.2, F2.3), and the rest of Annex G.',
    ],
    notes: ['Table 20 prints the straightness of columns as L/300 with a maximum of 15 mm; the model shows it as printed. The rates of heating and cooling for stress relieving are given per unit of metal thickness without a unit, and are not modelled. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'holes', title: 'Making holes', prompt: 'Drag the thickness. Change the member and the number of thicknesses.',
    left: {
      kicker: 'Spread 1 · cl. 513.5.5', title: 'Making holes',
      lede: 'All holes for rivets or bolts shall be either punched or drilled. The hole is **1.5 mm larger** than the bolt or rivet up to 25 mm diameter, and **2.0 mm larger** at 25 mm and above (cl. 513.5.5.1).',
      paras: [
        '**All holes shall be drilled**, except that secondary members such as floor plates and handrails, and members that do not carry the main load, may be punched if not over **12 mm** thick, for steel up to E 250.',
        'Holes through more than one thickness, or where the main material is thicker than **20 mm** (up to E 250) or **16 mm** (E 300 and above), are sub-drilled or sub-punched **3 mm under size** and reamed to full diameter. Reaming through several thicknesses is done after assembly.',
        '**Close tolerance and turned fitted bolts:** the hole equals the shank, + 0.15 mm to − 0.0 mm; the parts are held together, drilled through in one operation and reamed (cl. 513.5.5.2).',
        '**Friction grip bolts:** all holes drilled, after removal of burrs; 1.5 mm larger than the bolt where there are not more than three plies (cl. 513.5.5.3).',
      ],
    },
    right: { kicker: 'cl. 513.5.5.1', title: 'Drilled, punched or reamed' },
  },
  {
    id: 'tighten', title: 'Tightening bolts', prompt: 'Drag the bolt length. Slope one face.',
    left: {
      kicker: 'Spread 2 · cl. 513.5.6', title: 'Tightening bolts',
      lede: 'Each fastener of a joint shall be tightened to the specified value, or to **70 per cent** of the specified minimum tensile strength (cl. 513.5.6.1).',
      paras: [
        'Joint surfaces, bolts, nuts and washers shall be free of scale, dirt, burrs and anything else that would prevent solid seating. All fasteners have a washer under the nut or the head, whichever is turned.',
        'The slope of a surface in contact with the bolt head or nut shall not exceed **1 : 20**; otherwise a tapered washer is used.',
        'Tightening is by the **turn of nut** method, calibrated wrenches or torque wrenches. For turn of nut, all bolts are first brought **snug tight**: the full effort of a man with an ordinary wrench, or a few impacts of an impact wrench.',
        'Then each nut is rotated further. With both faces normal to the bolt axis: **1/3 turn** up to 4 diameters long, **1/2 turn** over 4 and under 8, **2/3 turn** over 8 and under 12. With one face sloped less than 1 : 20: **1/2, 2/3 and 5/6** (cl. 513.5.6.1).',
      ],
    },
    right: { kicker: 'cl. 513.5.6.1', title: 'Snug tight, then the turn of the nut' },
  },
  {
    id: 'tolerance', title: 'Tolerances', prompt: 'Pick what is measured. Drag the deviation.',
    left: {
      kicker: 'Spread 3 · cl. 513.5.13, 513.5.14 · Table 20', title: 'Tolerances',
      lede: 'All parts in an assembly shall fit together accurately within the tolerances of Table 20, unless otherwise specified and agreed (cl. 513.5.13.1).',
      paras: [
        '**Length:** ± 1 mm with both ends finished for contact bearing; ± 2 mm for other members up to 12 m; ± 3.5 mm over 12 m. **Width** of built-up girders: ± 3 mm. **Depth:** + 3 mm, − 2 mm.',
        '**Straightness of columns:** L/300, to a maximum of 15 mm. **Flatness of plate webs:** 0.005 d, to a maximum of 2 mm. **Tilt of flange:** 0.005 b up to 2 mm at splices, stiffeners, supports and bearings; 0.015 b up to 4 mm elsewhere.',
        'A machined bearing surface is machined within **0.25 mm** for surfaces that fit within a square of side 0.5 m (cl. 513.5.13.2).',
        'In bolted splices, unintended steps between adjacent surfaces total not more than **1 mm** for friction grip joints and **2 mm** for others. In welded butt joints, misalignment is not more than the lesser of **0.15 t and 3 mm** (cl. 513.5.14).',
      ],
    },
    right: { kicker: 'Table 20', title: 'How far from the drawing' },
  },
  {
    id: 'heat', title: 'Heat in the shop', prompt: 'Pick a process. Drag the temperature.',
    left: {
      kicker: 'Spread 4 · cl. 513.4, 513.5.7.3, 513.5.9', title: 'Heat in the shop',
      lede: 'Straightening and flattening of steel shall be done by methods that will not injure the metal. **Hammering shall not be permitted** (cl. 513.4.1).',
      paras: [
        '**Straightening by heating** follows a controlled procedure, with the steel not hotter than **650 °C** (cl. 513.4.1).',
        '**Heat curving.** Steel with a yield stress above **360 MPa** shall not be heat curved. The steel shall not exceed **620 °C**, and the girder is not artificially cooled until it has fallen to **315 °C** by natural cooling. V-type heating uses wedges of 15° to 30°, with a base not more than 250 mm long (cl. 513.4.2).',
        '**Rivets** are heated uniformly to a light cherry red, **650 °C to 700 °C**, for hydraulic riveting; high tensile steel rivets up to **1100 °C**. A rivet heated beyond the limit shall not be driven (cl. 513.5.7.3).',
        '**Stress relieving.** The furnace is not above **300 °C** when the welded assembly is placed in it. It is held at a maximum of **600 °C**, no two points differing by more than 80 °C, and cooled in the closed furnace while above 300 °C (cl. 513.5.9).',
      ],
    },
    right: { kicker: 'cl. 513.4 · 513.5.9', title: 'How hot, and no hotter' },
  },
  {
    id: 'erect', title: 'Erection', prompt: 'Drag how many holes are filled.',
    left: {
      kicker: 'Spread 5 · cl. 514', title: 'Erection',
      lede: 'The design of a bridge should take into consideration the method of erection. A detailed scheme is prepared, showing stage-wise activities with complete drawings and working instructions (cl. 514.4.1).',
      paras: [
        'The scheme is based on **site conditions**: hydrology, rainfall, flood timings, soil, water depth, climate and working space. It names the temporary fasteners and the minimum percentage of permanent fasteners fitted at each stage (cl. 514.4.2, 514.4.4).',
        'It is **checked** for the adequacy of the affected components and the safety of the bridge at all stages of erection (cl. 514.4.5).',
        'Equipment, tackles and ropes are **tested** before work starts. The structure is divided into **modules**, pre-assembled in a yard and matched by trial assembly (cl. 514.5.1, 514.5.7).',
        'A connection to be riveted or bolted is held in close contact by service bolts before the final connection. Joints are made by filling not less than **50 per cent** of the holes with service bolts and drifts in the ratio **4 : 1** (cl. 514.5.10).',
      ],
    },
    right: { kicker: 'cl. 514.5.10', title: 'Service bolts and drifts' },
  },
  {
    id: 'durable', title: 'Durability', prompt: 'Pick the exposure of the bridge.',
    left: {
      kicker: 'Spread 6 · Annex D', title: 'Durability',
      lede: 'The general environment to which a steel structure is exposed during its working life is classified into **five levels of severity** (Annex D, D2.2.1).',
      paras: [
        '**Mild:** normally protected from weather. **Moderate:** condensation and rain, or continuously under water. **Severe:** frequent rain, alternate wetting and drying, sea water, saturated salt air. **Very severe:** sea water spray, corrosive fumes, aggressive ground. **Extreme:** tidal and splash zones, aggressive chemicals (Table D.1).',
        'Corrosion protection is by cathodic protection, inhibitors, and inorganic or metal coatings or organic paint systems (D2.3).',
        'Steel is given at least **one coat of primer immediately** after surface preparation, and is not stored outdoors for long without a protective coating (D2.4.2, D2.4.3).',
        'Surfaces that transfer force by friction, as in HSFG connections, are **not painted**. Members to be welded are not pre-painted next to the weld. Where sulphates exceed **2 per cent** in soil or **5 per cent** in water, a lining keeps the solution off the steel (D2.2.3, D2.4.4, D2.4.5).',
      ],
    },
    right: { kicker: 'Table D.1', title: 'Five exposures' },
  },
  {
    id: 'inspect', title: 'Inspection', prompt: 'Drag the years since the last detailed inspection.',
    left: {
      kicker: 'Spread 7 · Annex E', title: 'Inspection',
      lede: 'Each bridge has to be inspected in detail at regular intervals **not exceeding 5 years** (Annex E, E4.1.2).',
      paras: [
        '**Periodic routine inspection:** certain items are inspected at definite intervals, **at least once a year**, whether or not anything alarming has taken place (E4.2).',
        '**Special inspection** is required for a bridge with known deficiencies, such as a restriction on weight or speed or loss of camber, and after an unusual occurrence (E4.3).',
        'Girders are examined for cracks, corrosion and misalignment; welds for cracks; rivets for looseness; bearings for free movement; trusses for loss of camber and damage from collision; decks for drainage (E6, E7, E9).',
        'The most important function of a maintenance unit is to keep a **complete and accurate record**: a full history of the structure, with every recommendation and repair (E14).',
      ],
    },
    right: { kicker: 'Annex E, E4', title: 'Five years, one year, and when needed' },
  },
  {
    id: 'test', title: 'Load testing', prompt: 'Drag the residual deflection. Change the number of units tested.',
    left: {
      kicker: 'Spread 8 · Annex F', title: 'Load testing',
      lede: 'An **acceptance test** is a non-destructive test for confirming structural performance (Annex F, F2.1).',
      paras: [
        'Its load is **1.0 × self weight + 1.15 × the remainder of the permanent load + 1.25 × the variable load**. The assembly shall behave substantially linearly, and on removal of the load the residual deflection shall not exceed **20 per cent** of the maximum. If it fails, the test may be repeated once only, with a limit of **10 per cent** (F2.1).',
        'A **strength test** confirms the calculated resistance: **Ftest,s = γmi Fd (fym / fy)**, with fym the mean yield strength from coupon tests. There shall be no failure by buckling or rupture (F2.2).',
        'A **test to failure** finds the design resistance from at least three identical specimens: for a ductile failure, Fd = 0.9 Ftest,min (fy/fym) / γm0 (F2.3).',
        'The maximum load is held for at least **1 hour**. In prototype testing the design load is multiplied by a factor from Table F.1: **1.5** for one unit tested, falling to **1.2** for ten (F4.2, F4.4).',
      ],
    },
    right: { kicker: 'Annex F, F2.1', title: 'The acceptance test' },
  },
  {
    id: 'wsm', title: 'Working stress design', prompt: 'Pick the kind of stress and the load combination.',
    left: {
      kicker: 'Spread 9 · Annex G · cl. 501.1.6', title: 'Working stress design',
      lede: 'In the working stress method, members are designed so that the unit stress caused by the design loads does not exceed a pre-defined **permissible stress** (Annex G, G1).',
      paras: [
        'The factor of safety in the permissible stress caters for uncertainties in loads, material strength, behaviour of the structure, corrosion and fatigue. Serviceability, such as deflection, is checked as well (G1).',
        '**Basic permissible stresses:** axial tension on the net area **0.6 fy**; axial compression **0.6 fy**; bending **0.66 fy** in plates, flats and tubes and **0.62 fy** in girders and rolled sections; shear **0.43 fy** maximum, and on average **0.38 fy** (fy ≤ 250 MPa) or **0.35 fy**; bearing on a flat surface **0.8 fy** (Table G.2).',
        '**Increase by load combination:** I nil; II 15 per cent; III 25; IV 40; V 25; VI 30; VII 40 per cent, limited to **90 per cent of the yield stress** (Table G.1, G2.2.2).',
        'Steel bridges shall generally be designed by the limit state method; this method may be used where that cannot be conveniently adopted, at the discretion of the authority (cl. 501.1.6).',
      ],
    },
    right: { kicker: 'Tables G.1 · G.2', title: 'Permissible stress, and its increase' },
  },
];

export const QUIZ = [];
