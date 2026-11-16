// The words on the pages. Taken from IRC : 24-2010 with the clause, table or figure in brackets.
export const BOOK = {
  title: 'Compression Members',
  subtitle: 'IRC : 24-2010 · chapter 3 of 9',
  credit: 'built from IRC : 24-2010',
  home: { href: '../irc-24-2010/', label: 'All IRC 24 chapters' },
  foot: 'IRC : 24-2010 · Steel Road Bridges · 3 Compression Members',
  cover: {
    title: ['Compression', 'Members'],
    kicker: 'I R C : 2 4 - 2 0 1 0   ·   C H A P T E R  3  O F  9',
    foot: ['STANDARD SPECIFICATIONS AND CODE OF PRACTICE FOR ROAD BRIDGES · SECTION V · STEEL ROAD BRIDGES', 'Indian Roads Congress · clause 507'],
    colors: { board: ['#e4d5c4', '#c4a98f'], ink: '#231a14', cyan: '#8a3f1c', dim: '#5b4a3c', frame: 'rgba(35,26,20,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Pushed until it bows.',
    lede: 'Common hot rolled and built-up steel members carrying axial compression usually fail by flexural buckling (cl. 507.1.1).',
    paras: [
      'Clause 507 gives one formula for the design compressive stress and four buckling curves to use it with. The rest of the clause is about which curve, which length, and how the ends, bases and built-up members are detailed.',
      'Each right-hand page is a live model: a column you can make slender, hold at its ends in six ways, stand on a slab base or build from two channels.',
    ],
    notes: ['Stresses in MPa, forces in kN, lengths in mm or m as marked. γm0 = 1.10 (Table 1). The buckled shapes are drawn far larger than true.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Pushed until it bows.',
    lede: 'Chapter 3 of 9 in the IRC : 24 series: clause 507 of the standard.',
    paras: [
      '**Source.** IRC : 24-2010, Standard Specifications and Code of Practice for Road Bridges, Section V, Steel Road Bridges (Limit State Method), Third Revision, Indian Roads Congress, May 2010.',
      '**Coverage.** cl. 507.1, Table 3, Fig. 5: spread 1 · Table 4: spread 2 · cl. 507.2, Table 7: spread 3 · cl. 507.4: spread 4 · cl. 507.5, Table 8: spread 5 · cl. 507.6 to 507.9: spread 6.',
      '**Not drawn.** The tabulated values of χ and fcd (Tables 5 and 6: the models compute them from the formula, and agree with Table 6), eccentricity for columns (cl. 507.3.3), splices (cl. 507.3.4) and gusseted bases (cl. 507.4.2).',
    ],
    notes: ['In cl. 507.5.1.2 the Code prints ε under the root in λvv and λφ where the Euler term needs E; the models use E. Section properties of the angles, the base plate sizes and the batten dimensions are illustrative. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'buckle', title: 'The buckling curves', prompt: 'Drag the slenderness. Pick a buckling class.',
    left: {
      kicker: 'Spread 1 · cl. 507.1 · Table 3 · Fig. 5', title: 'The buckling curves',
      lede: 'The factored design compression P shall not exceed the design strength **Pd = Ae fcd** (cl. 507.1.2).',
      paras: [
        'Buckling strength is affected by **residual stresses, initial bow and accidental eccentricities** of load. To account for these, the strength is defined by a **buckling class a, b, c or d** (cl. 507.1.1).',
        'The design compressive stress is **fcd = χ fy / γm0**, not more than fy / γm0, with **χ = 1 / [ φ + (φ² − λ²)^0.5 ]** and **φ = 0.5 [ 1 + α (λ − 0.2) + λ² ]** (cl. 507.1.2.1).',
        '**λ** is the non-dimensional effective slenderness ratio, √(fy / fcc), where fcc = π² E / (KL/r)² is the Euler buckling stress and KL/r the effective slenderness ratio.',
        'The imperfection factor **α** is **0.21, 0.34, 0.49 and 0.76** for classes a, b, c and d (Table 3). Tables 5 and 6 list χ and fcd for each class, yield stress and slenderness; Fig. 5 shows the four curves.',
      ],
    },
    right: { kicker: 'cl. 507.1.2.1 · Fig. 5', title: 'Stress against slenderness' },
  },
  {
    id: 'classes', title: 'Which curve', prompt: 'Pick a cross-section, then the axis it buckles about.',
    left: {
      kicker: 'Spread 2 · cl. 507.1.2.2 · Table 4', title: 'Which curve',
      lede: 'Table 4 puts each cross-section in a buckling class, separately for buckling about its **z-z** and **y-y** axes.',
      paras: [
        '**Rolled I-sections.** With h/bf > 1.2: tf ≤ 40 mm, class **a** about z-z and **b** about y-y; 40 mm < tf ≤ 100 mm, **b** and **c**. With h/bf ≤ 1.2: tf ≤ 100 mm, **b** and **c**; tf > 100 mm, **d** about both.',
        '**Welded I-sections.** tf ≤ 40 mm: **b** about z-z and **c** about y-y. tf > 40 mm: **c** and **d**.',
        '**Hollow sections.** Hot rolled **a**, cold formed **b**, about any axis. **Welded box sections** are generally **b**; with thick welds and b/tf < 30 (about z-z) or h/tw < 30 (about y-y), **c**.',
        '**Channel, angle, T and solid sections**, and **built-up members**: class **c** about any axis.',
      ],
    },
    right: { kicker: 'Table 4', title: 'Buckling class of cross-sections' },
  },
  {
    id: 'length', title: 'Effective length', prompt: 'Pick how the ends are held.',
    left: {
      kicker: 'Spread 3 · cl. 507.2 · Table 7', title: 'Effective length',
      lede: 'The effective length KL is calculated from the member length L, considering the rotational and relative translational boundary conditions at the ends (cl. 507.2.1).',
      paras: [
        'The member length is taken from **centre to centre of its intersections** with the supporting members in the plane of buckling. For a member with a free end, it is the free standing length from the centre of the intersecting member at the supported end (cl. 507.2.1).',
        'Where the boundary conditions can be assessed, Table 7 gives KL: **2.0 L** for a member fixed at one end and free at the other, and for one pinned at one end and free to sway without rotating at the other; **1.0 L** held in position at both ends; **1.2 L** fixed at one end and swaying without rotation at the other; **0.8 L** fixed at one end and held in position at the other; **0.65 L** fixed at both (Table 7).',
        'In trusses and braced frames the effective lengths of cl. 508 apply. For buckling out of the plane of the truss, KL is the distance between the centres of intersection (cl. 507.2.3).',
      ],
    },
    right: { kicker: 'Table 7', title: 'Six ways to hold a column' },
  },
  {
    id: 'base', title: 'Slab bases', prompt: 'Drag the load. Pick a larger base.',
    left: {
      kicker: 'Spread 4 · cl. 507.4', title: 'Slab bases',
      lede: 'Base plates should have sufficient stiffness and strength to transmit axial force, bending moments and shear forces to the foundation without exceeding the load carrying capacity of the supports (cl. 507.4.1.1).',
      paras: [
        'The minimum thickness of a rectangular slab base under axial compression is **ts = √[ 2.5 w (a² − 0.3 b²) γm0 / fy ]**, and **greater than tf**, the flange thickness of the compression member (cl. 507.4.3.1).',
        '**w** is the uniform pressure from below under the factored load. **a** and **b** are the larger and smaller projection of the slab beyond the rectangle circumscribing the member.',
        'If the plate is larger than the bearing pressure requires, an equal projection **c** beyond the face of the member may be taken as effective, and c² used in place of (a² − 0.3 b²) (cl. 507.4.1.2, Fig. 6).',
        'Members with slab bases need no gussets, but enough fastenings to hold the parts and resist moments and forces in transit, unloading and erection. In gusseted bases, all bearing surfaces should be machined to ensure perfect contact (cl. 507.4.2, 507.4.3).',
      ],
    },
    right: { kicker: 'cl. 507.4.3.1', title: 'How thick the slab' },
  },
  {
    id: 'strut', title: 'Angle struts', prompt: 'Drag the length. Change the bolts and the gusset.',
    left: {
      kicker: 'Spread 5 · cl. 507.5 · Table 8', title: 'Angle struts',
      lede: 'The compression in a single angle may be transferred concentrically to its centroid through an end gusset, or eccentrically by connecting one of its legs (cl. 507.5.1).',
      paras: [
        'Loaded concentrically, the angle is designed by the ordinary rule of cl. 507.1.2. Loaded **through one leg**, its flexural torsional buckling strength is found from an equivalent slenderness ratio **λe = √( k1 + k2 λvv² + k3 λφ² )** (cl. 507.5.1.2).',
        'λvv comes from l / rvv, the centre to centre length over the radius of gyration about the minor axis; λφ from (b1 + b2) / 2t, the widths of the two legs over twice the thickness.',
        'Table 8 gives the constants. **Two or more bolts** at each end: gusset fixed **0.20, 0.35, 20**; hinged **0.70, 0.60, 5**. **One bolt:** fixed **0.75, 0.35, 20**; hinged **1.25, 0.50, 60**. For partial restraint, λe may be interpolated between the fixed and hinged results.',
        '**Double angles** back-to-back on opposite sides of a gusset, with at least two fasteners in line at each end, may be taken as axially loaded, with KL between **0.7 and 0.85** of the distance between intersections in the plane of the gusset (cl. 507.5.2.1).',
      ],
    },
    right: { kicker: 'cl. 507.5.1.2 · Table 8', title: 'One angle, one leg connected' },
  },
  {
    id: 'built', title: 'Built-up members', prompt: 'Pick how the two components are joined. Drag the slenderness.',
    left: {
      kicker: 'Spread 6 · cl. 507.6 to 507.9', title: 'Built-up members',
      lede: 'Members of two or more components connected as the Code describes may be designed as homogeneous members (cl. 507.7.3).',
      paras: [
        '**Back-to-back.** Two angles, channels or tees in contact, or not more than 50 mm apart, are connected so that the slenderness of each component between connections is not greater than **40** or **0.6 times** that of the member as a whole, whichever is less, and the member is divided into at least **three** parts (cl. 507.6.1).',
        '**Lacing and battens** are proportioned for a transverse shear **Vt** of at least **2.5 per cent of the axial force**, plus any shear from external forces (cl. 507.7.2). The slenderness of a component between connections is not greater than **50** or **0.7 times** that of the whole member (cl. 507.8.5, 507.9.2).',
        '**Lacing bars** are inclined at 40° to 70° (single) or 40° to 50° (double) to the axis, with KL/r not over **140**; tie plates are at least **1/50** of the distance between their innermost fastener lines in thickness (cl. 507.8.2, 507.8.8, 507.8.12).',
        '**Battens** divide the member into at least three bays, and each resists a longitudinal shear **Vt D / n a** and a moment **Vt D / 2n** (cl. 507.9.1, 507.9.3).',
      ],
    },
    right: { kicker: 'cl. 507.6 · 507.8 · 507.9', title: 'Back-to-back, laced, battened' },
  },
];

export const QUIZ = [];
