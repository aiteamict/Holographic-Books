// The words on the pages. Taken from IRC : 24-2010 with the clause, table or annex in brackets.
export const BOOK = {
  title: 'Beams in Bending',
  subtitle: 'IRC : 24-2010 · chapter 5 of 9',
  credit: 'built from IRC : 24-2010',
  home: { href: '../irc-24-2010/', label: 'All IRC 24 chapters' },
  foot: 'IRC : 24-2010 · Steel Road Bridges · 5 Beams in Bending',
  cover: {
    title: ['Beams in', 'Bending'],
    kicker: 'I R C : 2 4 - 2 0 1 0   ·   C H A P T E R  5  O F  9',
    foot: ['STANDARD SPECIFICATIONS AND CODE OF PRACTICE FOR ROAD BRIDGES · SECTION V · STEEL ROAD BRIDGES', 'Indian Roads Congress · clauses 509.1 to 509.3 · Annex C'],
    colors: { board: ['#e4d5c4', '#c4a98f'], ink: '#231a14', cyan: '#8a3f1c', dim: '#5b4a3c', frame: 'rgba(35,26,20,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Strong only if held.',
    lede: 'Beams are members with solid webs, including rolled and hollow sections and plate girders, subjected primarily to bending (cl. 509.1.1).',
    paras: [
      'A beam whose compression flange is held sideways can use its full section: its strength is governed by the yield stress. One that is not held may bow sideways and twist first: its strength is governed by lateral torsional buckling (cl. 509.2).',
      'So most of this chapter is about holding the compression flange: what counts as restraint, how strong it must be, and how long a beam is taken to be between restraints.',
    ],
    notes: ['Moments in kNm, stresses in MPa, lengths in mm or m as marked. The three welded girders in the models are illustrative. Shear and stiffeners are in chapter 6.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Strong only if held.',
    lede: 'Chapter 5 of 9 in the IRC : 24 series: clauses 509.1 to 509.3 and Annex C of the standard.',
    paras: [
      '**Source.** IRC : 24-2010, Standard Specifications and Code of Practice for Road Bridges, Section V, Steel Road Bridges (Limit State Method), Third Revision, Indian Roads Congress, May 2010.',
      '**Coverage.** cl. 509.2.1: spread 1 · cl. 509.2.1, 509.3.4: spread 2 · cl. 509.2.2, 509.2.2.1, Table 11: spread 3 · cl. 509.3.1, 509.3.2, Table 12: spread 4 · cl. 509.3.3, Table 13: spread 5 · cl. 509.1.4, 509.2.1.4, 509.2.1.5: spread 6.',
      '**Not drawn.** The tabulated stresses of Tables 10a, 10b and 11 (the models compute them, and agree with Table 11), the general equation of Annex C for sections symmetrical about one axis with its Table C.1, and the U frames of cl. 509.3.5 (the same rule as for truss chords, in chapter 4).',
    ],
    notes: ['The third row of Table 12 is printed with the same wording as the first; the model shows it as printed. Girder sizes, moments and forces in the models are illustrative. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'supported', title: 'A beam that is held', prompt: 'Drag the moment. Pick a deeper girder.',
    left: {
      kicker: 'Spread 1 · cl. 509.2, 509.2.1', title: 'A beam that is held',
      lede: 'The factored design moment at any section shall not exceed the design bending strength: **M ≤ Md** (cl. 509.2).',
      paras: [
        'A beam may be taken as **laterally supported** when its compression flange has full lateral restraint, and its ends nominal torsional restraint from web cleats, end plates, fin plates or continuity with the next span (cl. 509.2.1).',
        'When the factored shear does not exceed 0.6 Vd, **Md = βb Zp fy / γm0**. **βb = 1.0** for plastic and compact sections and **Ze / Zp** for semi-compact sections; Zp and Ze are the plastic and elastic section moduli (cl. 509.2.1.2).',
        'To avoid irreversible deformation under serviceability loads, Md is kept below **1.2 Ze fy / γm0** in simply supported beams and **1.5 Ze fy / γm0** in cantilevers. Under higher shear, the reduced strength of cl. 510.2 applies (cl. 509.2.1.2, 509.2.1.3).',
        'A web with **d/tw greater than 67ε** may buckle in shear before it yields. Then either the flanges alone are taken to resist the moment and the web the shear, or the web is designed for combined shear and normal stresses (cl. 509.2.1.1).',
      ],
    },
    right: { kicker: 'cl. 509.2.1.2', title: 'Governed by the yield stress' },
  },
  {
    id: 'restraint', title: 'What holds the flange', prompt: 'Drag the flange force. Add restraints and girders.',
    left: {
      kicker: 'Spread 2 · cl. 509.2.1, 509.3.4', title: 'What holds the flange',
      lede: 'Full lateral restraint may be assumed if the connection to the compression flange can resist a lateral force of not less than **2.5 per cent** of the maximum force in that flange (cl. 509.2.1).',
      paras: [
        'Intermediate lateral restraints must be strong and stiff enough to stop the compression flange moving sideways relative to the end supports. They are connected to a bracing system that carries the force to the supports, or to an independent robust part of the structure (cl. 509.3.4).',
        'Parallel members that both need restraint shall not simply be tied to each other. Restraints are fixed as close to the compression flange as practicable (cl. 509.3.4).',
        'The restraint resists **2.5 per cent** of the maximum flange force, divided equally between the restraint points, and each point at least **1 per cent** (cl. 509.3.4).',
        'In a series of solid web beams on one system of restraints, the total is 2.5 per cent of the flange force in **one beam only**. For latticed girders it is 2.5 per cent plus **1.25 per cent** for each girder after the first, up to **7.5 per cent** (cl. 509.3.4.1, 509.3.4.2).',
      ],
    },
    right: { kicker: 'cl. 509.3.4', title: 'Two and a half per cent' },
  },
  {
    id: 'ltb', title: 'Lateral torsional buckling', prompt: 'Drag the unsupported length. Switch rolled and welded.',
    left: {
      kicker: 'Spread 3 · cl. 509.2.2 · Table 11 · Annex C', title: 'Lateral torsional buckling',
      lede: 'For a laterally unsupported beam, **Md = βb Zp fbd**, where fbd = χLT fy / γm0 is the design bending compressive stress (cl. 509.2.2).',
      paras: [
        '**χLT = 1 / { φLT + [ φLT² − λLT² ]^0.5 }**, not more than 1.0, with **φLT = 0.5 [ 1 + αLT (λLT − 0.2) + λLT² ]**. The imperfection parameter αLT is **0.21** for rolled and **0.49** for welded steel sections.',
        'The slenderness is **λLT = √(βb Zp fy / Mcr) = √(fy / fcr,b)**. Mcr is the elastic critical moment; for I-sections fcr,b comes from Table 11, prepared from **1.1 π² E / (LLT/ry)² × [ 1 + (1/20) ((LLT/ry) / (hf/tf))² ]^0.5** (cl. 509.2.2.1).',
        'No separate check is needed for bending about the minor axis, for hollow sections and solid bars, or when **λLT is less than 0.4** (cl. 509.2.2).',
        'Annex C gives the elastic critical moment for other cases. It is affected by the moment gradient, the boundary conditions at the lateral supports, non-symmetric or non-prismatic sections, and the position of the load relative to the shear centre (Annex C, C1.1).',
      ],
    },
    right: { kicker: 'cl. 509.2.2', title: 'Sideways and twisting' },
  },
  {
    id: 'efflen', title: 'How long between restraints', prompt: 'Pick how the ends are held, and the kind of load.',
    left: {
      kicker: 'Spread 4 · cl. 509.3.1, 509.3.2 · Table 12', title: 'How long between restraints',
      lede: 'For a simply supported beam of span L with no lateral restraint to its compression flange, but with each end restrained against torsion, the effective length LLT is taken from Table 12 (cl. 509.3.1).',
      paras: [
        'With the ends fully restrained against torsion, LLT runs from **0.70 L** (both flanges fully restrained against warping) to **1.00 L** (warping not restrained), under normal loading. Under destabilising loading the values are **0.85 L to 1.20 L**.',
        'With only partial torsional restraint through the bottom flange, LLT is **1.0 L + 2 D** for a support connection and **1.2 L + 2 D** for a bearing support; 1.2 L + 2 D and 1.4 L + 2 D when destabilising. D is the overall depth of the beam.',
        'Torsional restraint at supports may come from web or flange cleats, from bearing stiffeners acting with the bearing, or from lateral end frames (cl. 509.3.1).',
        'With effective lateral restraints at intervals, LLT is the distance between them, and **1.2 times** that distance where the load does not act at the shear centre and has a destabilising effect (cl. 509.3.2).',
      ],
    },
    right: { kicker: 'Table 12', title: 'Effective length for simply supported beams' },
  },
  {
    id: 'cantilever', title: 'Cantilevers', prompt: 'Pick the support, the tip restraint and the load.',
    left: {
      kicker: 'Spread 5 · cl. 509.3.3 · Table 13', title: 'Cantilevers',
      lede: 'For a cantilever beam of projecting length L, the effective length LLT is taken from Table 13, by its restraint at the support and at the top (cl. 509.3.3).',
      paras: [
        '**At the support:** a) continuous, with lateral restraint to the top flange; b) continuous, with partial torsional restraint; c) continuous, with lateral and torsional restraint; d) restrained laterally, torsionally and against rotation on plan.',
        '**At the top:** i) free; ii) lateral restraint to the top flange; iii) torsional restraint; iv) lateral and torsional restraint.',
        'Normal loading, tip conditions i to iv: a) **3.0, 2.7, 2.4, 2.1 L**; b) **2.0, 1.8, 1.6, 1.4 L**; c) **1.0, 0.9, 0.8, 0.7 L**; d) **0.8, 0.7, 0.6, 0.5 L**.',
        'Destabilising loading: a) **7.5, 7.5, 4.5, 3.6 L**; b) **5.0, 5.0, 3.0, 2.4 L**; c) **2.5, 2.5, 1.5, 1.2 L**; d) **1.4, 1.4, 0.6, 0.5 L** (Table 13).',
      ],
    },
    right: { kicker: 'Table 13', title: 'Effective length for a cantilever' },
  },
  {
    id: 'openings', title: 'Openings and holes', prompt: 'Drag the size of the opening. Change the spacing.',
    left: {
      kicker: 'Spread 6 · cl. 509.1.4, 509.2.1.4, 509.2.1.5', title: 'Openings and holes',
      lede: 'Any openings in webs or compression flanges should be framed, and the stiffened section designed for local load effects, including secondary bending (cl. 509.1.4.1).',
      paras: [
        'Openings in a web may be **unstiffened** if the greatest internal dimension is not more than **one-tenth** of the depth of the web, adjacent openings are at least **three times** that dimension apart, and there is **not more than one** at any cross-section. Corners are rounded to a radius of at least one-quarter of the least dimension (cl. 509.1.4).',
        '**Holes in the tension flange** need not be considered if **Anf / Agf ≥ (fy/fu)(γm1/γm0) / 0.9**. If not, a reduced effective flange area that satisfies the equation is used. Fastener holes in the compression zone are ignored, except oversize, slotted or empty holes (cl. 509.2.1.4).',
        '**Shear lag** in flanges may be disregarded if an outstand is not wider than **L0/20** and an internal element not wider than **L0/10**, L0 being the length between points of zero moment (cl. 509.2.1.5).',
      ],
    },
    right: { kicker: 'cl. 509.1.4 · 509.2.1.4', title: 'What may be cut away' },
  },
];

export const QUIZ = [];
