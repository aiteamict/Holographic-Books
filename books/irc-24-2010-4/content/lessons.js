// The words on the pages. Taken from IRC : 24-2010 with the clause, table or annex in brackets.
export const BOOK = {
  title: 'Trusses and Open Web Girders',
  subtitle: 'IRC : 24-2010 · chapter 4 of 9',
  credit: 'built from IRC : 24-2010',
  home: { href: '../irc-24-2010/', label: 'All IRC 24 chapters' },
  foot: 'IRC : 24-2010 · Steel Road Bridges · 4 Trusses and Open Web Girders',
  cover: {
    title: ['Trusses and', 'Open Web Girders'],
    kicker: 'I R C : 2 4 - 2 0 1 0   ·   C H A P T E R  4  O F  9',
    foot: ['STANDARD SPECIFICATIONS AND CODE OF PRACTICE FOR ROAD BRIDGES · SECTION V · STEEL ROAD BRIDGES', 'Indian Roads Congress · clause 508 · Annex B'],
    colors: { board: ['#e4d5c4', '#c4a98f'], ink: '#231a14', cyan: '#8a3f1c', dim: '#5b4a3c', frame: 'rgba(35,26,20,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'A skeleton of triangles.',
    lede: 'Trusses or open web girders are defined as triangulated skeletal girders (cl. 508.1).',
    paras: [
      'Their members are designed as the tension and compression members of clauses 506 and 507. Clause 508 adds what belongs to the truss as a whole: how it is analysed, how long its struts are taken to be, how its chords are held sideways, and how it is braced.',
      'Annex B gives the rules for cambering an open web girder: how much longer or shorter each member is made in the workshop.',
    ],
    notes: ['Forces in kN, stresses in MPa, lengths in mm or m as marked. The trusses in the models are illustrative: eight panels of 5 m, 6 m deep.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'A skeleton of triangles.',
    lede: 'Chapter 4 of 9 in the IRC : 24 series: clause 508 and Annex B of the standard.',
    paras: [
      '**Source.** IRC : 24-2010, Standard Specifications and Code of Practice for Road Bridges, Section V, Steel Road Bridges (Limit State Method), Third Revision, Indian Roads Congress, May 2010.',
      '**Coverage.** cl. 508.1 to 508.3: spread 1 · cl. 508.4.1, 508.5, Table 9: spread 2 · cl. 508.4.4: spread 3 · cl. 508.7 to 508.9: spread 4 · cl. 508.11: spread 5 · Annex B: spread 6.',
      '**Not drawn.** Single angle discontinuous struts and cross bracing (cl. 508.4.2, 508.4.3), connections at intersections and gussets (cl. 508.6), diaphragms (cl. 508.10), and the fabrication and erection rules of Annex B (B2, B3).',
    ],
    notes: ['The Code gives no worked examples. Member forces, stresses, stiffnesses and the U frame dimensions in the models are illustrative. Annex B1.3 refers to cl. 502.2.4.1 for the modulus of elasticity; the value used is E of cl. 502.2.2.1. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'pins', title: 'Pins and joints', prompt: 'Move the load between joints. Let the axes miss the joint.',
    left: {
      kicker: 'Spread 1 · cl. 508.1 to 508.3', title: 'Pins and joints',
      lede: 'For the analysis of trusses three assumptions may be made, unless rigorous rigid frame analysis is adopted (cl. 508.2).',
      paras: [
        '**a)** All members are frictionless pin jointed. **b)** All members are straight and free to rotate at the joints. **c)** All loads, including self weight of members, are applied at the joints. These stipulations do not apply to the stiffening trusses of suspension bridges (cl. 508.2).',
        'Members meeting at a joint should, where practicable, have their **centroidal axes meeting at a point**, and the centre of resistance of a connection should lie on the line of action of the load, to avoid an eccentricity moment. If the axes do not meet at a single point, the flexural stresses that result are taken into account as **secondary stress** (cl. 508.3).',
        'Where loads are not applied at the joints, account is taken of the stresses in the loaded member, and of torsion and lateral flexure when the load is not in the plane of the truss (cl. 508.3).',
      ],
    },
    right: { kicker: 'cl. 508.2 · 508.3', title: 'Axial force, and what disturbs it' },
  },
  {
    id: 'efflen', title: 'How long is a strut', prompt: 'Pick a member and the direction it buckles in.',
    left: {
      kicker: 'Spread 2 · cl. 508.4.1, 508.5 · Table 9', title: 'How long is a strut',
      lede: 'In riveted, bolted or welded trusses the compression members act in a complex manner, and their effective lengths KL are taken from Table 9 (cl. 508.4.1).',
      paras: [
        '**Chords:** 0.85 × the distance between centres of intersection with the web members, for buckling in the plane of the truss; 0.85 × the distance between intersections with the lateral bracing members or rigidly connected cross girders, normal to it. An unbraced chord follows cl. 508.4.4.',
        '**Web members, single triangulated system:** 0.70 × the distance between centres of intersection with the main chords in the plane; 0.85 × normal to the plane when braced; the full distance when unbraced.',
        '**Web members, multiple intersection system** with adequate connections at all intersections: 0.85 × the greatest distance between any two adjacent intersections in the plane; 0.70 × the distance between intersections with the main chords normal to it when braced; 0.85 × when unbraced.',
        'For battened compression members all the values are increased by **10 per cent**. KL/r shall not exceed **120** for main members and **140** for wind bracings and subsidiary members (cl. 508.4.1, 508.5).',
      ],
    },
    right: { kicker: 'Table 9', title: 'Effective length of compression members' },
  },
  {
    id: 'uframe', title: 'A chord held by U frames', prompt: 'Drag the stiffness of the verticals. Change the lateral system.',
    left: {
      kicker: 'Spread 3 · cl. 508.4.4', title: 'A chord held by U frames',
      lede: 'For simply supported trusses with ends restrained at the bearings against torsion, the effective length of an unbraced compression chord, for buckling normal to the plane of the truss, depends on what holds it (cl. 508.4.4).',
      paras: [
        '**a) No lateral support:** no lateral bracing between the compression chords and no cross frames. KL = **span**.',
        '**b) U frames:** cross-members and verticals give lateral restraint. KL = **2.5 ⁴√(E I a δ)**, but not less than a. I is the chord’s moment of inertia about the axis in the plane of the truss, a the distance between frames, δ the lateral displacement of the chord at the frame nearest mid-span. When δ ≤ a³/40EI, KL = a.',
        'For symmetrical U frames, **δ = d1³ / 3EI1 + d2² b / EI2**: d1, d2 are the distances of the chord’s centroid from the top and the neutral axis of the cross-member, b half the distance between trusses, I1 and I2 the moments of inertia of vertical and cross-member. The frames resist a force **F = 1.4 × 10⁻³ KL / δ (fcc/fa − 1.7)**.',
        '**c) Continuous deck:** a chord continuously supporting a deck is restrained throughout, if the connection resists **2.5 per cent** of the maximum chord force.',
      ],
    },
    right: { kicker: 'cl. 508.4.4', title: 'Half-through: nothing over the top' },
  },
  {
    id: 'joints', title: 'Lug angles and pins', prompt: 'Drag the force. Pick the channel, then the pin hole.',
    left: {
      kicker: 'Spread 4 · cl. 508.6 to 508.9', title: 'Lug angles and pins',
      lede: 'Connections of members at an intersection shall develop at least the design loads and moments transmitted by the members (cl. 508.6.1).',
      paras: [
        'Gussets are shaped to avoid stress concentrations, and groups of fasteners kept compact. Where a section is not connected over its whole area, the load may be taken to spread at **45°** (cl. 508.6).',
        '**Lug angles.** On an angle member, the lug angle and its connection to the gusset develop **20 per cent** more than the force in the outstanding leg, and its attachment to the member **40 per cent** more. On a channel the figures are **10** and **20 per cent** of the force not taken by the direct connection. Never fewer than two bolts or rivets fix the lug angle to the gusset (cl. 508.7).',
        '**Pin holes** in tension members: the net section beyond the hole, parallel to the axis, is not less than the required net section; the net section through the hole, across the axis, is at least **33 per cent** greater. Without stiffened edges, net width ÷ thickness is not more than **16** (cl. 508.8).',
        '**Pin plates** make up the bearing or cross-sectional area. From the centre of the pin to the end they are at least as long as they are wide (cl. 508.9).',
      ],
    },
    right: { kicker: 'cl. 508.7 · 508.8', title: 'Margins at the ends of members' },
  },
  {
    id: 'bracing', title: 'Bracing', prompt: 'Pick a bracing system. Drag the chord force.',
    left: {
      kicker: 'Spread 5 · cl. 508.11', title: 'Bracing',
      lede: 'Girders shall have a lateral bracing system from end to end, strong enough to transmit wind, seismic and centrifugal forces to the bearings; it may be left out where a rigid deck does the same work (cl. 508.11.1).',
      paras: [
        'Bracing on the loaded chord carries traction and braking to the main girders (cl. 508.11.2). Where the depth permits, diagonal bracing between the top chords of a through span keeps them in line (cl. 508.11.3).',
        '**Lateral bracing** between compression chords resists a transverse shear of **2.5 per cent** of the total compressive force in both chords at the section, besides wind and centrifugal forces (cl. 508.11.4).',
        '**Sway bracing** between the vertical web members transmits at least **50 per cent** of the panel lateral load to the chord on the bearings. It gives no relief to the lateral or portal systems (cl. 508.11.5).',
        '**Portal bracing** in through spans is as deep as the clearance allows. It takes the full end reaction of the top chord lateral system, and a lateral shear of **1.25 per cent** of the compressive force in the end posts or in the top chords of the end panel, whichever is greater (cl. 508.11.6).',
      ],
    },
    right: { kicker: 'cl. 508.11', title: 'Lateral, portal and sway' },
  },
  {
    id: 'camber', title: 'The camber diagram', prompt: 'Pick a member. Drag its stress under load.',
    left: {
      kicker: 'Spread 6 · Annex B · cl. 504.6.2', title: 'The camber diagram',
      lede: 'Contract drawings show the main girder without camber. A camber diagram shows how much the nominal length of each member is increased or decreased (Annex B, B1.1).',
      paras: [
        'The aim is that under **full dead load and 75 per cent of the live load without impact** the outline of the girder is the nominal outline, with no deformation stresses in the loaded span (B1.1).',
        'The **stress camber change** in each member equals its change of length under that loading, with the **opposite sign**: a member that stretches in service is made shorter, one that shortens is made longer (B1.2).',
        'A further change **K × L** is made in every member, where K is the loaded chord’s extension or contraction divided by its length: an **increase** in through spans, a **decrease** in deck spans. The loaded chord then keeps the length on the contract drawings, and the floor system needs no change (B1.4, B1.5).',
        'Nominal and camber lengths are rounded to the nearest **half a millimetre** (B1.6). The members are made to the camber lengths, and all except the chords are strained into position during erection (B2.1, B3.2).',
      ],
    },
    right: { kicker: 'Annex B', title: 'Made longer, made shorter' },
  },
];

export const QUIZ = [];
