// The words on the pages. Taken from IRC : 24-2010 with the clause, table or figure in brackets.
export const BOOK = {
  title: 'Connections',
  subtitle: 'IRC : 24-2010 · chapter 8 of 9',
  credit: 'built from IRC : 24-2010',
  home: { href: '../irc-24-2010/', label: 'All IRC 24 chapters' },
  foot: 'IRC : 24-2010 · Steel Road Bridges · 8 Connections',
  cover: {
    title: ['Connections'],
    kicker: 'I R C : 2 4 - 2 0 1 0   ·   C H A P T E R  8  O F  9',
    foot: ['STANDARD SPECIFICATIONS AND CODE OF PRACTICE FOR ROAD BRIDGES · SECTION V · STEEL ROAD BRIDGES', 'Indian Roads Congress · clause 512'],
    colors: { board: ['#e4d5c4', '#c4a98f'], ink: '#231a14', cyan: '#8a3f1c', dim: '#5b4a3c', frame: 'rgba(35,26,20,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Where the members meet.',
    lede: 'The term connection applies to all joints between the components of a member, joints between separate members, and splices. Fasteners are bolts, rivets and pins (cl. 512.1.1).',
    paras: [
      'Connections are designed to be consistent with the assumptions of the analysis, and to transmit the calculated design loads and moments. Ease of fabrication, erection, inspection and maintenance is considered in their design (cl. 512.2.3, 512.2.5).',
      'Different forms of fastener should not share one force. Only rivets and turned and fitted bolts may be taken as acting together (cl. 512.2.6).',
    ],
    notes: ['Forces in kN, stresses in MPa, lengths in mm. Partial safety factors from Table 1: welds 1.25 in the shop and 1.50 in the field; bolts and rivets 1.25.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Where the members meet.',
    lede: 'Chapter 8 of 9 in the IRC : 24 series: clause 512 of the standard.',
    paras: [
      '**Source.** IRC : 24-2010, Standard Specifications and Code of Practice for Road Bridges, Section V, Steel Road Bridges (Limit State Method), Third Revision, Indian Roads Congress, May 2010.',
      '**Coverage.** cl. 512.4.3, 512.4.5: spread 1 · cl. 512.4.4: spread 2 · cl. 512.4.7, 512.4.8: spread 3 · cl. 512.5.5: spread 4 · cl. 512.5.4: spread 5 · cl. 512.5.5.5, 512.5.7, 512.6: spread 6 · cl. 512.7: spread 7 · cl. 512.5.2, 512.5.3: spread 8 · cl. 512.5.8, 512.5.9: spread 9.',
      '**Not drawn.** Butt welds, plug welds and welds at the edges of plates (cl. 512.4.3.1, 512.4.4.3, 512.4.6), rivets (cl. 512.5.6, which follow the pattern of bolts), and the tension resistance of friction grip bolts (cl. 512.6.4).',
    ],
    notes: ['Bolt property classes 4.6 and 8.8 (fub 400 and 800 MPa) and the proof stress used for prying are illustrative; the Code gives the stress areas of bolts but not their grades. Plate, weld and joint sizes in the models are illustrative. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'fillet', title: 'Fillet welds', prompt: 'Drag the leg size. Switch between shop and site.',
    left: {
      kicker: 'Spread 1 · cl. 512.4.2, 512.4.3, 512.4.5', title: 'Fillet welds',
      lede: 'The strength of a fillet weld is based on its **effective throat thickness** and its **effective length** (cl. 512.4.3.2).',
      paras: [
        'The throat is the height of a triangle that can be inscribed within the weld, measured perpendicular to its outer side. The effective length is the actual length **minus twice the leg length**; with end returns it is the actual length (cl. 512.4.3.2).',
        'Design strength on the throat area: **fwd = fwn / γmw**, with **fwn = fu / √3**; fu is the smaller of the ultimate stress of the weld and of the parent metal. Site welds use the field value of γmw (cl. 512.4.5.1.1, 512.4.5.2).',
        'When a welded joint is longer than **150 tt**, its capacity is reduced by **βlw = 1.2 − 0.2 lj / (150 tt) ≤ 1.0** (cl. 512.4.5.3).',
        'The leg is at most **1 mm less** than the thickness of the connected part at the edge (cl. 512.4.4.1). A full penetration butt weld is as strong as the weaker part joined (cl. 512.4.3.1).',
      ],
    },
    right: { kicker: 'cl. 512.4.5.1.1', title: 'Throat, length and strength' },
  },
  {
    id: 'weldrules', title: 'Intermittent welds', prompt: 'Drag the gap. Change the part and its stress.',
    left: {
      kicker: 'Spread 2 · cl. 512.4.2, 512.4.4.1', title: 'Intermittent welds',
      lede: 'Welds may be continuous full or partial penetration butt welds, continuous or intermittent fillet welds, and plug welds. **Intermittent butt welds shall not be used** (cl. 512.4.2).',
      paras: [
        'Intermittent fillet welds should not be used where **rust pockets** could form. They are permitted where the connection is protected from the weather, as inside box sections (cl. 512.4.4.1).',
        'The clear gap between the ends of the welds is not more than **200 mm**, nor **12 times** the thickness of the thinner part in compression, nor **16 times** in tension, nor one-quarter of the distance between stiffeners where it connects stiffeners to a plate.',
        'A fillet weld is **returned round the corner** for at least twice the leg length. Where side fillets alone make an end connection, each is at least as long as the distance between them, and at least 4 times the thinnest part.',
        'For transverse welds, the parts overlap by at least **4 times** the thickness of the thinnest part and are joined by two transverse lines of weld. Plug welds do not transmit load: they only prevent buckling or separation of lapped parts (cl. 512.4.2, 512.4.4.1).',
      ],
    },
    right: { kicker: 'cl. 512.4.4.1', title: 'Gaps between welds' },
  },
  {
    id: 'weldstress', title: 'Stresses in a weld', prompt: 'Drag the angle of the force. Change the load.',
    left: {
      kicker: 'Spread 3 · cl. 512.4.7, 512.4.8', title: 'Stresses in a weld',
      lede: 'Under compression, tension or shear alone, the stress in a weld is **fa or q = P / (tt lw)**: the force over the effective throat thickness times the effective length (cl. 512.4.7).',
      paras: [
        'Under normal and shear stress together, the equivalent stress in a fillet weld is **fe = √( fa² + 3 q² )**, and it shall not exceed **fu / (√3 γmw)** (cl. 512.4.8.1.1).',
        'The combination need not be checked for side fillet welds joining cover plates and flange plates, nor for fillet welds where the **sum** of the normal and shear stresses does not exceed fwd (cl. 512.4.8.1.2).',
        'Butt welds need no combination check when they are axially loaded, and in single and double bevel welds when the sum of normal and shear stresses is within the design normal stress and the shear is within half the design shear stress (cl. 512.4.8.2.1).',
        'Where bearing, bending and shear combine in a butt weld, **fe = √( fb² + fbr² + fb fbr + 3 q² )** is kept within the values allowed for the parent metal (cl. 512.4.8.2.2).',
      ],
    },
    right: { kicker: 'cl. 512.4.8.1', title: 'Normal and shear stress together' },
  },
  {
    id: 'bolt', title: 'A bolt in shear', prompt: 'Drag the plate thickness. Change the bolt.',
    left: {
      kicker: 'Spread 4 · cl. 512.5.5', title: 'A bolt in shear',
      lede: 'A bolt subjected to a factored shear force shall satisfy **Vsb ≤ Vdb**, the smaller of its strength in shear, Vdsb, and in bearing, Vdpb (cl. 512.5.5.2).',
      paras: [
        '**Shear.** Vdsb = Vnsb / γmb, with **Vnsb = (fub / √3)(nn Anb + ns Asb)**. nn and ns are the numbers of shear planes with and without threads in them; Anb is the net area at the thread, Asb the area of the shank (cl. 512.5.5.3).',
        'Since threads can occur in the shear plane, the area for shear is normally the **net tensile stress area**: 157, 245 and 353 mm² for 16, 20 and 24 mm bolts (cl. 512.5.5.1).',
        '**Bearing.** Vdpb = Vnpb / γmb, with **Vnpb = 2.5 kb d t f′u**. kb is the smallest of e/3d0, p/3d0 − 0.25, fub/fu and 1.0; e and p are the end distance and pitch along the bearing direction, d0 the hole diameter, f′u the smaller of fub and fu (cl. 512.5.5.4).',
        't is the sum of the thicknesses of the plates bearing in the same direction. Block shear at the edge may be checked by cl. 506.1.3.',
      ],
    },
    right: { kicker: 'cl. 512.5.5.3 · 512.5.5.4', title: 'Shear of the bolt, bearing on the plate' },
  },
  {
    id: 'details', title: 'Holes, edges and pitch', prompt: 'Drag the pitch. Change the edge distance.',
    left: {
      kicker: 'Spread 5 · cl. 512.5.1, 512.5.4', title: 'Holes, edges and pitch',
      lede: 'A member carrying calculated stress shall not have a splice or connection with a single bolt or rivet. Fasteners in load bearing members are at least **16 mm** in diameter (cl. 512.5.1).',
      paras: [
        '**Holes.** A bolt hole is the nominal diameter plus **1.5 mm**. A rivet hole is 1.5 mm larger up to 25 mm diameter, and 2.0 mm larger above (cl. 512.5.4 a).',
        '**Edge distance.** At least **1.5 times** the hole diameter from rolled, machine flame cut, sawn or planed edges, and **1.75 times** from sheared or hand flame cut edges. At most **12 t**; where exposed to corrosive influences, 40 mm + 4 t (cl. 512.5.4 b).',
        '**Pitch.** At least **2.5 times** the shank diameter. At most **32 t or 300 mm**. Along the direction of stress, at most **16 t or 200 mm** in tension members and **12 t or 200 mm** in compression members (cl. 512.5.4 c).',
        'Bolts carrying shear through a packing thicker than 6 mm are increased in number by 2.5 per cent for each 2 mm of packing. The grip of rivets is not more than 8 times the hole diameter (cl. 512.5.4 e, f).',
      ],
    },
    right: { kicker: 'cl. 512.5.4', title: 'Where the holes may go' },
  },
  {
    id: 'tension', title: 'Shear and tension', prompt: 'Drag the shear. Change the tension.',
    left: {
      kicker: 'Spread 6 · cl. 512.5.5.5, 512.5.7, 512.6', title: 'Shear and tension',
      lede: 'A bolt subjected to a factored tensile force shall satisfy **Tb ≤ Tdb = Tnb / γmb** (cl. 512.5.5.5).',
      paras: [
        '**Tnb = 0.90 fub Anb**, and less than fyb Asb (γmb/γm0). Anb is the net tensile stress area and Asb the shank area (cl. 512.5.5.5).',
        'A bolt or rivet resisting shear and tension at the same time shall satisfy **(Vsb/Vdb)² + (Tb/Tdb)² ≤ 1.0** (cl. 512.5.7).',
        'The use of **rivets in tension** should be avoided wherever possible. With countersunk heads in tension, their tensile value is reduced by 33⅓ per cent (cl. 512.5.4 d, 512.5.6.5).',
        '**High strength friction grip bolts.** Initial pretension in the bolt clamps the interfaces, and friction between the plates opposes slip under the applied shear. When the bolts are designed not to slip only under service loads, the capacity at ultimate load may be found as for bearing type bolts. In shear and tension together they satisfy the same sum of squares (cl. 512.6.1, 512.6.3, 512.6.5).',
      ],
    },
    right: { kicker: 'cl. 512.5.7', title: 'Inside the quarter circle' },
  },
  {
    id: 'pry', title: 'Prying force', prompt: 'Drag the plate thickness. Change the pull.',
    left: {
      kicker: 'Spread 7 · cl. 512.7', title: 'Prying force',
      lede: 'Where the prying force Q is significant, it shall be calculated and **added to the tension in the bolt** (cl. 512.7).',
      paras: [
        '**Q = (lv / 2 le) [ Te − β η f0 be t⁴ / (27 le lv²) ]**. Te is the tension per bolt from the applied load, so that each bolt carries Te + Q.',
        '**lv** is the distance from the bolt centre line to the toe of the fillet weld, or to half the root radius of a rolled section. **le** is the distance between the prying force and the bolt centre line: the lesser of the end distance and **1.1 t √(β f0 / fy)**.',
        '**β** is 2 for a non pre-tensioned bolt and 1 for a pre-tensioned bolt; **η** is 1.5. be is the effective width of flange per pair of bolts, f0 the proof stress, and t the thickness of the end plate.',
        'The second term grows with the fourth power of the plate thickness. A thick, stiff end plate does not lever on its bolts.',
      ],
    },
    right: { kicker: 'cl. 512.7', title: 'The lever in a T-stub' },
  },
  {
    id: 'splices', title: 'Splices and joints', prompt: 'Pick a joint. Drag the force in the member.',
    left: {
      kicker: 'Spread 8 · cl. 512.3, 512.5.2, 512.5.3', title: 'Splices and joints',
      lede: 'The centroidal axes of members meeting at a joint or splice should preferably meet at a point. If not, the moment due to the eccentricity is taken into account (cl. 512.3).',
      paras: [
        '**Flange splices.** Splice plates have at least the area of the flange spliced. They transmit the greater of **1.10 times** the force in the flange and **0.80 times** the capacity of the weaker flange (cl. 512.5.2 b).',
        '**Web splices** resist the shear, the part of the moment in the web, and the moment from the eccentricity of the shear. Plates on each side, with at least two rows of fasteners on each side of the joint (cl. 512.5.2 c).',
        '**Truss joints.** Connections at an intersection develop at least **1.10 times** the design loads and moments. Gusset plates sustain **1.05 times** them; an unsupported edge in compression longer than 50 times the thickness is stiffened (cl. 512.5.3 b).',
        '**Member splices.** Not of bearing type: the greater of 1.10 times the force and 0.80 times the capacity. Of bearing type, with machined ends in close contact: the splice plates are designed for **60 per cent** of the compressive force (cl. 512.5.3 c, d).',
      ],
    },
    right: { kicker: 'cl. 512.5.2 · 512.5.3', title: 'What a joint is designed for' },
  },
  {
    id: 'reductions', title: 'Long joints and grips', prompt: 'Drag the joint length. Change the grip and the packing.',
    left: {
      kicker: 'Spread 9 · cl. 512.5.8, 512.5.9', title: 'Long joints and grips',
      lede: 'When the length of a joint, between its first and last rows of fasteners along the load, exceeds **15 d**, the nominal shear capacity of the fasteners is reduced (cl. 512.5.8).',
      paras: [
        '**Long joints.** **βlj = 1.075 − lj / (200 d)**, with 0.75 ≤ βlj ≤ 1.0. The rule does not apply when the shear is distributed uniformly over the joint, as in the connection of a web to the flanges. It applies to friction grip connections as well (cl. 512.5.8, 512.6.2).',
        '**Large grips.** When the grip length lg, the total thickness of the connected plates, exceeds **5 d**, the design shear capacity is reduced by **βlg = 8 d / (3 d + lg)**, not more than βlj. The grip shall in no case exceed **8 d** (cl. 512.5.9).',
        '**Packing plates.** The design shear capacity of bolts carrying shear through a packing thicker than 6 mm is multiplied by **βpk = 1 − 0.0125 tpk**, tpk being the thickness of the thicker packing in mm (cl. 512.5.9).',
      ],
    },
    right: { kicker: 'cl. 512.5.8 · 512.5.9', title: 'Three reductions on a bolt' },
  },
];

export const QUIZ = [];
