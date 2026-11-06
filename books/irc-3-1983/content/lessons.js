// The words on the pages. Numbers are quoted from IRC : 3-1983 with the clause in brackets.
export const BOOK = {
  title: 'The Design Vehicle',
  subtitle: 'IRC : 3-1983 · a holographic chapter',
  credit: 'built from IRC : 3-1983',
  foot: 'IRC : 3-1983 · Dimensions and Weights of Road Design Vehicles',
  cover: {
    title: ['The Design', 'Vehicle'],
    kicker: 'I R C : 3 - 1 9 8 3   ·   A  H O L O G R A P H I C  C H A P T E R',
    foot: ['DIMENSIONS AND WEIGHTS OF ROAD DESIGN VEHICLES', 'Indian Roads Congress · first published 1954 · first revision 1983'],
    // the sage green of the 1983 printed cover
    colors: { board: ['#b4cbc3', '#8eaba2'], ink: '#13201f', cyan: '#2a5c57', dim: '#3d5652', frame: 'rgba(19,32,31,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Roads are built for a truck.',
    lede: 'Every lane width, bridge clearance, curve and pavement in India starts from one imagined vehicle: the **design vehicle** of IRC : 3.',
    paras: [
      'The standard lays down the largest dimensions and heaviest weights a road must be designed for (cl. 1.1). It applies to every road element except culverts and bridges, which follow the IRC Bridge Codes (cl. 2.1).',
      'It was first published in **January 1954**. The metric revision was drafted by **L. R. Kadiyali**, considered by the Specifications and Standards Committee on **24 May 1983**, and approved by the Executive Committee on **21 July** and the Council on **21 August 1983** (cl. 1).',
      'Turn the pages in order. Each right-hand page projects a hologram you can weigh, measure and drive.',
    ],
    notes: ['Dimensions in metres, weights in tonnes. Vehicles in the holograms are drawn at the longest length the standard allows for their kind.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Roads are built for a truck.',
    lede: 'IRC : 3-1983 fits on six printed pages: definitions, a notation, five size limits and one table of weights.',
    paras: [
      '**Source.** IRC : 3-1983, Dimensions and Weights of Road Design Vehicles (First Revision), Indian Roads Congress, New Delhi. First published January 1954, reprinted November 1954, revised August 1983. Clauses 1–6, the Figure of vehicle types and the Table.',
      'The road-wear figures on spread 6 use the fourth-power rule of the AASHO Road Test (USA, 1958–60). It is not part of IRC : 3 and is given only to show why axle limits matter.',
    ],
    notes: ['Axle positions and body outlines in the holograms are illustrative; the standard fixes the limits, not the shapes. Built with three.js. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'why', title: 'Why a design vehicle?', prompt: 'Tap a number on the truck to see the part of the road it decides.',
    left: {
      kicker: 'Spread 1 · Purpose', title: 'Why a design vehicle?',
      lede: 'The size and weight of vehicles are the **cardinal factors** in designing road elements (cl. 1.1).',
      paras: [
        'The **width** of the design vehicle bears on the width of traffic lanes and shoulders. Its **height** sets the clearance under bridges, electric lines and other overhead structures.',
        'Its **overall length**, trailer included, is used for horizontal and vertical curves and for the rules on passing and overtaking.',
        'Its **axle load** decides the thickness of the pavement; its **total weight** limits how steep a gradient may be.',
      ],
      notes: ['Each road element is designed for whichever maximum dimension or weight has the severest effect on it, and must be able to take vehicles that conform to this standard (cl. 2.2).'],
    },
    right: { kicker: 'cl. 1.1', title: 'Five numbers, five road elements' },
  },
  {
    id: 'code', title: 'Reading the code', prompt: 'Tap the code tiles to build a vehicle. Follow the three steps.',
    left: {
      kicker: 'Spread 2 · Notation', title: 'Reading the code',
      lede: 'Three kinds of commercial vehicle are recognised: the **single unit**, the **semi-trailer** and the **truck-trailer combination** (cl. 2.2).',
      paras: [
        'The **first digit** is the number of axles on the truck or truck-tractor. An **S** means a semi-trailer, and the digit after it counts the semi-trailer’s axles. Any other digit counts the axles on a trailer (cl. 4).',
        'So **2-S2** is a two-axle tractor with a tandem-axle semi-trailer, and **2-2** is a two-axle truck pulling a two-axle trailer.',
        'A semi-trailer rests part of its weight on the tractor (cl. 3.6); a trailer carries all its weight on its own wheels (cl. 3.10). No combination may have more than **two vehicles** (cl. 5.3.5).',
      ],
      notes: ['Which type to design for depends on terrain, economics and the importance of the road. In steep and mountainous terrain a road need not be designed for truck-trailer combinations: single units, and semi-trailers where economically feasible, are enough (cl. 2.2).'],
    },
    right: { kicker: 'cl. 4 · Fig.', title: 'The vehicle types' },
  },
  {
    id: 'axles', title: 'Single or tandem?', prompt: 'Drag the rear axle along the ruler. Follow the three steps.',
    left: {
      kicker: 'Spread 3 · Axles', title: 'Single or tandem?',
      lede: 'An **axle** is the common axis of rotation of one or more wheels (cl. 3.1).',
      paras: [
        'A **single axle** is two or more wheels whose centres lie in one transverse plane, or between two transverse planes **1 m** apart (cl. 3.7).',
        'A **tandem axle** is two or more consecutive axles whose centres are more than **1.2 m** but not more than **2.5 m** apart, joined so as to share the load (cl. 3.8).',
        'Between 1.0 m and 1.2 m neither definition applies.',
      ],
      notes: ['Beyond 2.5 m the standard says nothing more. This book reads the two axles as separate single axles, 10.2 t each on dual tyres; that reading is ours, not a clause.'],
    },
    right: { kicker: 'cl. 3.7, 3.8', title: 'The axle ruler' },
  },
  {
    id: 'size', title: 'How big?', prompt: 'Drive a vehicle under the bridge; drag the deck lower.',
    left: {
      kicker: 'Spread 4 · Width and height', title: 'How big?',
      lede: 'No vehicle may be wider than **2.5 m** (cl. 5.1).',
      paras: [
        'Overall width is measured over the vehicle and its load, but **excludes** approved safety devices and tyre bulge (cl. 3.14).',
        'No vehicle other than a double-decker bus may be taller than **3.8 m**, or **4.2 m** when carrying ISO series 1 freight containers. A double-decker bus may be up to **4.75 m** (cl. 5.2).',
      ],
    },
    right: { kicker: 'cl. 5.1, 5.2', title: 'Under the bridge' },
  },
  {
    id: 'length', title: 'How long?', prompt: 'Drive each vehicle round the bend and compare the strips they sweep.',
    left: {
      kicker: 'Spread 5 · Length', title: 'How long?',
      lede: 'Overall length is measured over any load or load-holding device, **excluding** front and rear bumpers (cl. 3.4, 5.3).',
      paras: [
        'A **single unit truck** with two or more axles: **11 m**. A **single unit bus**: **12 m** (cl. 5.3.1, 5.3.2).',
        'A **truck-tractor and semi-trailer**: **16 m**. A **truck-trailer combination**: **18 m** (cl. 5.3.3, 5.3.4).',
        'On a curve the rear wheels cut inside the front ones, so a vehicle sweeps a strip wider than its own 2.5 m. How wide depends on its length **and on where it is coupled**: a 16 m semi-trailer, pivoting on the tractor far ahead of its axles, can sweep more than an 18 m truck-trailer.',
      ],
    },
    right: { kicker: 'cl. 5.3', title: 'Round the bend' },
  },
  {
    id: 'weight', title: 'How heavy?', prompt: 'Follow the three steps. Then weigh any vehicle in the Table.',
    left: {
      kicker: 'Spread 6 · Weights', title: 'How heavy?',
      lede: 'The road does not feel the whole truck at once. It feels **axles**.',
      paras: [
        'A **single axle with dual tyres** may put at most **10.2 t** on the road; a single axle with **single tyres**, **6 t** (cl. 6.1).',
        'Two axles in **tandem**, 1.2 m to 2.5 m apart, may put at most **18 t** on the road between them (cl. 6.2).',
        'The most a vehicle may weigh in all is the **sum of its axle limits** (cl. 6.3). The Table gives it for every type: from **12 t** for a Type 2 on single tyres to **52.2 t** for a Type 3-3.',
      ],
      notes: ['Road wear rises with about the fourth power of axle load (AASHO Road Test, 1958–60; not part of IRC : 3). An axle 20 % over its limit wears the road about twice as fast.'],
    },
    right: { kicker: 'cl. 6 · Table', title: 'The weighbridge' },
  },
  {
    id: 'checkpost', title: 'The checkpost', prompt: 'Six vehicles arrive. Pass each one, or stop it for the right reason.',
    left: {
      kicker: 'Spread 7 · Review', title: 'The checkpost',
      lede: 'Six vehicles arrive at the checkpost. Pass them, or stop them with the clause they break.',
      paras: [
        'Check the width with its load (2.5 m), the height (3.8 m, 4.2 m with ISO containers), the length for its kind (11, 12, 16 or 18 m), every axle against 6, 10.2 and 18 t, and that no combination has more than two vehicles.',
      ],
    },
    right: { kicker: 'All clauses', title: 'Pass or stop' },
  },
];

export const QUIZ = [];
