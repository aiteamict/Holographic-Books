// The words on the pages. Taken from IRC : 24-2010 with the clause, table or figure in brackets.
export const BOOK = {
  title: 'Tension Members',
  subtitle: 'IRC : 24-2010 · chapter 2 of 9',
  credit: 'built from IRC : 24-2010',
  home: { href: '../irc-24-2010/', label: 'All IRC 24 chapters' },
  foot: 'IRC : 24-2010 · Steel Road Bridges · 2 Tension Members',
  cover: {
    title: ['Tension', 'Members'],
    kicker: 'I R C : 2 4 - 2 0 1 0   ·   C H A P T E R  2  O F  9',
    foot: ['STANDARD SPECIFICATIONS AND CODE OF PRACTICE FOR ROAD BRIDGES · SECTION V · STEEL ROAD BRIDGES', 'Indian Roads Congress · clause 506'],
    colors: { board: ['#e4d5c4', '#c4a98f'], ink: '#231a14', cyan: '#8a3f1c', dim: '#5b4a3c', frame: 'rgba(35,26,20,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Pulled until something gives.',
    lede: 'Tension members are linear members in which axial forces act, causing elongation (cl. 506.1).',
    paras: [
      'Clause 506 gives three ways such a member can fail, and a design strength for each: yielding of the gross section, rupture of the net section at the holes, and block shear at the end connection. The lowest of the three is the design strength.',
      'Each right-hand page is a live model. Pull the member, move the holes, add bolts, and read the strength on the card.',
    ],
    notes: ['Areas in mm², stresses in MPa, forces in kN. γm0 = 1.10 and γm1 = 1.25 (Table 1). The models use the two grades the Code names: E 250 (fu 410 MPa) and E 300 (fu 440 MPa).'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Pulled until something gives.',
    lede: 'Chapter 2 of 9 in the IRC : 24 series: clause 506 of the standard.',
    paras: [
      '**Source.** IRC : 24-2010, Standard Specifications and Code of Practice for Road Bridges, Section V, Steel Road Bridges (Limit State Method), Third Revision, Indian Roads Congress, May 2010.',
      '**Coverage.** cl. 506.1, 506.1.1, 506.1.2.1: spread 1 · cl. 506.1.2.1, Fig. 2: spread 2 · cl. 506.1.2.3, Fig. 3: spread 3 · cl. 506.1.3, Fig. 4: spread 4 · cl. 506.2: spread 5.',
      '**Not drawn.** Threaded rods (cl. 506.1.2.2), other sections connected through part of their area (cl. 506.1.2.4), members of two components back-to-back (cl. 506.2.6) and the design of battens (cl. 506.2.8).',
    ],
    notes: ['The Code gives no worked examples. Plate sizes, hole sizes, bolt pitches and the angle sections in the models are illustrative. The legs of the angle are taken to mid-thickness, and its bolt line is set at a usual gauge. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'modes', title: 'Yielding or rupture', prompt: 'Drag the tension up. Change the plate and its holes.',
    left: {
      kicker: 'Spread 1 · cl. 506.1 to 506.1.2.1', title: 'Yielding or rupture',
      lede: 'The factored design tension T in a member shall not exceed its design strength: **T ≤ Td** (cl. 506.1).',
      paras: [
        'A tension member can carry load up to the ultimate load, when it fails by **rupture at a critical section**. But if the gross area yields over most of its length before that, the member may become non-functional through **excessive elongation**. Plates and rolled sections may also fail by **block shear** at a bolted or riveted end (cl. 506.1).',
        '**Yielding of the gross section:** Tdg = Ag fy / γm0, with Ag the gross area of the cross-section (cl. 506.1.1).',
        '**Rupture of the net section of a plate:** Tdn = 0.9 An fu / γm1, with An the net effective area at the holes (cl. 506.1.2.1). For a threaded rod, An is the net root area at the thread (cl. 506.1.2.2).',
        'Td is the **lowest** of Tdg, Tdn and the block shear strength Tdb (cl. 506.1).',
      ],
    },
    right: { kicker: 'cl. 506.1.1 · 506.1.2.1', title: 'The gross section and the net section' },
  },
  {
    id: 'stagger', title: 'Staggered holes', prompt: 'Drag the stagger. Change the gauge.',
    left: {
      kicker: 'Spread 2 · cl. 506.1.2.1 · Fig. 2', title: 'Staggered holes',
      lede: 'The net effective area of a plate is **An = [ b − n dh + Σ ps² / 4g ] t** (cl. 506.1.2.1).',
      paras: [
        '**b** and **t** are the width and thickness of the plate, **dh** the diameter of the hole and **n** the number of holes in the critical section.',
        '**g** is the gauge length between the holes, across the member. **ps** is the staggered pitch length between lines of holes, along the member. The sum is taken over all the inclined legs of the section (Fig. 2).',
        'So a zig-zag section loses one more hole than the straight one, and gains ps²/4g for each inclined leg. Every possible chain of holes is tried, and the smallest net area governs.',
      ],
    },
    right: { kicker: 'cl. 506.1.2.1 · Fig. 2', title: 'Straight cut or zig-zag' },
  },
  {
    id: 'angle', title: 'Angles and shear lag', prompt: 'Drag for more bolts. Change the angle and the pitch.',
    left: {
      kicker: 'Spread 3 · cl. 506.1.2.3, 506.1.2.4 · Fig. 3', title: 'Angles and shear lag',
      lede: 'The rupture strength of an angle connected through one leg is affected by **shear lag** (cl. 506.1.2.3).',
      paras: [
        'Tdn = **0.9 Anc fu / γm1 + β Ago fy / γm0**, where Anc is the net area of the connected leg and Ago the gross area of the outstanding leg (cl. 506.1.2.3).',
        '**β = 1.4 − 0.076 (w/t) (fy/fu) (bs/Lc)**, not more than fu γm0 / fy γm1 and not less than **0.7**. w is the outstand leg width, bs the shear lag width (Fig. 3) and Lc the length of the end connection: the distance between the outermost bolts or rivets along the load, or the length of the weld.',
        'For preliminary sizing, Tdn = **α An fu / γm1** with α = **0.6** for one or two bolts or rivets, **0.7** for three and **0.8** for four or more along the connection (cl. 506.1.2.3).',
        'Double angles, channels, I-sections and other rolled sections connected through part of their section are treated the same way, with bs taken from the farthest edge of the outstanding leg to the nearest line of fasteners or weld (cl. 506.1.2.4).',
      ],
    },
    right: { kicker: 'cl. 506.1.2.3 · Fig. 3', title: 'One leg bolted, one leg lagging' },
  },
  {
    id: 'block', title: 'Block shear', prompt: 'Drag the tension up. Add bolts to a line.',
    left: {
      kicker: 'Spread 4 · cl. 506.1.3 · Fig. 4', title: 'Block shear',
      lede: 'At an end connection of a plate or angle, a block of material can tear out along the lines of bolts (cl. 506.1.3).',
      paras: [
        'For bolted or riveted connections, the block shear strength Tdb is the **smaller** of **Avg fy / (√3 γm0) + 0.9 Atn fu / γm1** and **0.9 Avn fu / (√3 γm1) + Atg fy / γm0** (cl. 506.1.3.1).',
        '**Avg, Avn** are the minimum gross and net areas in **shear** along the bolt or rivet line parallel to the external force. **Atg, Atn** are the minimum gross and net areas in **tension**, perpendicular to the line of force, from the bolt hole to the toe of the angle or between the end bolts (Fig. 4).',
        'For welded end connections, block shear is checked by taking an appropriate section in the member around the end weld, which can shear off as a block (cl. 506.1.3.2).',
      ],
    },
    right: { kicker: 'cl. 506.1.3.1 · Fig. 4', title: 'Shear planes and a tension plane' },
  },
  {
    id: 'details', title: 'Design details', prompt: 'Drag the lacing angle. Change the system and the slenderness.',
    left: {
      kicker: 'Spread 5 · cl. 506.2', title: 'Design details',
      lede: 'For main members the ratio of unsupported length to the least radius of gyration shall not exceed **300** (cl. 506.2.1).',
      paras: [
        'Tension members should preferably be of solid cross-section. Open sides of built-up members of channel or beam sections are **laced or battened** where the outstand towards the open side exceeds **16 times** its mean thickness for steel up to E 250, and **14 times** for E 300 and above (cl. 506.2.2, 506.2.4).',
        'Lacing bars are inclined at **40° to 70°** to the axis of the member in a single intersection system and **40° to 50°** in a double intersection system. The slenderness ratio of a lacing bar shall not exceed **140** (cl. 506.2.7.2, 506.2.7.5).',
        'Laced members have **tie plates** at the ends of the lacing, where it is interrupted and where the member is connected to another. An end tie plate is at least as long as the distance between the centroids of the main components, an intermediate one **3/4** of that; its thickness is at least **1/60** of the distance between the innermost lines of its fasteners (cl. 506.2.7.7 to 506.2.7.9).',
        'Splices have a sectional area **5 per cent more** than that required to develop the load in the member (cl. 506.2.9).',
      ],
    },
    right: { kicker: 'cl. 506.2.1 · 506.2.7', title: 'Slender, laced and spliced' },
  },
];

export const QUIZ = [];
