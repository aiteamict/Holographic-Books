// The words on the pages. Taken from IRC : 24-2010 with the clause, table or figure in brackets.
export const BOOK = {
  title: 'Plate Girders: Shear and Stiffeners',
  subtitle: 'IRC : 24-2010 · chapter 6 of 9',
  credit: 'built from IRC : 24-2010',
  home: { href: '../irc-24-2010/', label: 'All IRC 24 chapters' },
  foot: 'IRC : 24-2010 · Steel Road Bridges · 6 Plate Girders: Shear and Stiffeners',
  cover: {
    title: ['Plate Girders:', 'Shear and Stiffeners'],
    kicker: 'I R C : 2 4 - 2 0 1 0   ·   C H A P T E R  6  O F  9',
    foot: ['STANDARD SPECIFICATIONS AND CODE OF PRACTICE FOR ROAD BRIDGES · SECTION V · STEEL ROAD BRIDGES', 'Indian Roads Congress · clauses 509.4 to 510'],
    colors: { board: ['#e4d5c4', '#c4a98f'], ink: '#231a14', cyan: '#8a3f1c', dim: '#5b4a3c', frame: 'rgba(35,26,20,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'A thin web, well stiffened.',
    lede: 'The factored design shear force V in a beam shall not exceed the design strength: V ≤ Vd = Vn / γm0 (cl. 509.4).',
    paras: [
      'A plate girder puts its steel in the flanges and keeps the web thin. A thin web yields in shear, or buckles first; after buckling it can still carry load as a tension field. Stiffeners decide which of these governs.',
      'This chapter follows the web: its shear strength, its least thickness, the stiffeners along it and at the supports, and what shear and axial force take away from bending.',
    ],
    notes: ['Forces in kN, moments in kNm, stresses in MPa, lengths in mm. The girder of most pages has a web 1600 mm deep and flanges 500 × 32 mm; it is illustrative.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'A thin web, well stiffened.',
    lede: 'Chapter 6 of 9 in the IRC : 24 series: clauses 509.4 to 510 of the standard.',
    paras: [
      '**Source.** IRC : 24-2010, Standard Specifications and Code of Practice for Road Bridges, Section V, Steel Road Bridges (Limit State Method), Third Revision, Indian Roads Congress, May 2010.',
      '**Coverage.** cl. 509.4, 509.4.1: spread 1 · cl. 509.4.2: spreads 2 and 3 · cl. 509.5: spread 4 · cl. 509.6.1: spread 5 · cl. 509.7.1, 509.7.2: spread 6 · cl. 509.7.3 to 509.7.5, 509.7.9: spread 7 · cl. 510.2, 510.3.1: spread 8.',
      '**Not drawn.** Flanges, flange splices and web splices (cl. 509.6.3, 509.6.4), diagonal, tension and longitudinal stiffeners in detail (cl. 509.7.7, 509.7.8, 509.7.13), and overall member strength under axial force and bending with its Table 15 (cl. 510.3.2).',
    ],
    notes: ['In cl. 509.6.1.1 (b) the third case is printed "c < d"; the models apply it below 0.74 d, where the second case ends. The same clause puts the longitudinal stiffener 0.2 d from the compression flange, while cl. 509.7.13 (a) gives one-fifth of the distance to the neutral axis. Table 14 prints "1 = 1.13 n²". Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'shear', title: 'Shear in the web', prompt: 'Drag the shear. Change the web thickness.',
    left: {
      kicker: 'Spread 1 · cl. 509.4, 509.4.1', title: 'Shear in the web',
      lede: 'The nominal shear strength Vn may be governed by the **plastic shear resistance** of the section, or by the strength of the web as governed by **shear buckling** (cl. 509.4).',
      paras: [
        'Under pure shear, **Vn = Vp = Av fyw / √3**, where Av is the shear area and fyw the yield strength of the web (cl. 509.4.1).',
        'Shear area, I and channel sections, major axis bending: **h tw** hot rolled and **d tw** welded; minor axis bending **2 b tf**. Rectangular hollow sections: A h/(b + h) loaded parallel to the depth. Circular tubes: 2A/π. Plates and solid bars: A (cl. 509.4.1.1).',
        'Fastener holes need not be allowed for if Avn ≥ (fy/fu)(γm1/γm0) Av / 0.9 (cl. 509.4.1.1).',
        'Shear buckling is verified when **d/tw exceeds 67ε** for a web without stiffeners, and 67ε √(Kv/5.35) for a web with stiffeners (cl. 509.4.2.1).',
      ],
    },
    right: { kicker: 'cl. 509.4.1', title: 'Plastic shear resistance' },
  },
  {
    id: 'buckling', title: 'A web that buckles', prompt: 'Drag the stiffener spacing. Change the web thickness.',
    left: {
      kicker: 'Spread 2 · cl. 509.4.2.2 (a)', title: 'A web that buckles',
      lede: 'The **simple post-critical method** can be used for webs of I-section girders, with or without intermediate transverse stiffeners, provided the web has transverse stiffeners at the supports (cl. 509.4.2.2 a).',
      paras: [
        '**Vn = Vcr = Av τb**, where τb is the shear stress corresponding to web buckling.',
        'The elastic critical shear stress is **τcr,e = Kv π² E / 12 (1 − μ²)(d/tw)²**, and the web slenderness **λw = √( fyw / √3 τcr,e )**.',
        '**Kv = 5.35** with transverse stiffeners only at supports; **4.0 + 5.35/(c/d)²** for c/d < 1.0; **5.35 + 4.0/(c/d)²** for c/d ≥ 1.0. c is the spacing of the transverse stiffeners and d the depth of the web.',
        'When λw ≤ 0.8, **τb = fyw/√3**. Between 0.8 and 1.2, **τb = [1 − 0.8 (λw − 0.8)] fyw/√3**. When λw ≥ 1.2, **τb = fyw / (√3 λw²)**.',
      ],
    },
    right: { kicker: 'cl. 509.4.2.2 (a)', title: 'Simple post-critical method' },
  },
  {
    id: 'tension', title: 'Tension field action', prompt: 'Drag the stiffener spacing. Load the flanges.',
    left: {
      kicker: 'Spread 3 · cl. 509.4.2.2 (b)', title: 'Tension field action',
      lede: 'The **tension field method** is based on the strength left after the web has buckled in shear. It needs intermediate transverse stiffeners, anchorage from the adjacent panels or end posts, and **c/d ≥ 1.0** (cl. 509.4.2.2 b).',
      paras: [
        '**Vn = Vtf = [ Av τb + 0.9 wtf tw fv sin φ ] ≤ Vp**. τb is the buckling stress of the simple post-critical method.',
        'The tension field is inclined at **φ = tan⁻¹(d/c)**. Its yield strength is **fv = [ fyw² − 3τb² + ψ² ]^0.5 − ψ**, with ψ = 1.5 τb sin 2φ.',
        'Its width is **wtf = d cos φ + (c − sc − st) sin φ**. The anchorage lengths along the compression and tension flanges are **s = (2 / sin φ) [ Mfr / (fyw tw) ]^0.5 ≤ c**.',
        '**Mfr = 0.25 bf tf² fyf [ 1 − { Nf / (bf tf fyf / γm0) }² ]** is the plastic moment capacity of the flange plate, reduced for the axial force Nf it already carries.',
      ],
    },
    right: { kicker: 'cl. 509.4.2.2 (b)', title: 'Strength after buckling' },
  },
  {
    id: 'endpanel', title: 'End panels', prompt: 'Pick the kind of end panel. Drag the shear.',
    left: {
      kicker: 'Spread 4 · cl. 509.5 · Figs. 7 to 9', title: 'End panels',
      lede: 'The tension field of the last interior panel pulls on the end of the girder. The anchor forces are **Rtf = Hq / 2** and **Mtf = Hq d / 10**, with **Hq = 1.25 Vp (1 − Vcr/Vp)^½** (cl. 509.5.3).',
      paras: [
        'If the shear V in the panel is less than Vtf, Hq may be reduced by the ratio **(V − Vcr) / (Vtf − Vcr)** (cl. 509.5.3).',
        '**End panel without tension field (Fig. 7).** The end panel is designed by the simple post-critical method only. With its stiffeners it is checked as a beam spanning between the flanges for Rtf and Mtf; the end stiffener takes the reaction plus the compressive force due to Mtf (cl. 509.5.1).',
        '**End panel with tension field (Figs. 8, 9).** It has an end post. A single stiffener, rigidly connected to the flange by full strength welds, resists the reaction plus **2/3 Mtf**. A double stiffener is checked as a beam between the flanges for Rtf and Mtf (cl. 509.5.2).',
        'Panels with an opening larger than 10 per cent of the least panel dimension are designed without tension field action (cl. 509.5.4).',
      ],
    },
    right: { kicker: 'cl. 509.5', title: 'Anchoring the tension field' },
  },
  {
    id: 'webthick', title: 'How thin a web', prompt: 'Pick the stiffeners. Drag their spacing.',
    left: {
      kicker: 'Spread 5 · cl. 509.6.1', title: 'How thin a web',
      lede: 'The thickness of the web shall satisfy a serviceability requirement and a compression flange buckling requirement (cl. 509.6.1).',
      paras: [
        '**No transverse stiffeners:** d/tw ≤ **200ε** with the web connected to flanges along both edges, **90ε** along one edge only (cl. 509.6.1.1 a).',
        '**Transverse stiffeners only:** d/tw ≤ **200εw** when 3d ≥ c ≥ d; c/tw ≤ **200εw** when 0.74d ≤ c < d; d/tw ≤ **270εw** for closer stiffeners; when c > 3d the web is considered unstiffened (cl. 509.6.1.1 b).',
        '**With one longitudinal stiffener:** d/tw ≤ **250εw** when 2.4d ≥ c ≥ d; c/tw ≤ **250εw** when 0.74d ≤ c ≤ d; d/tw ≤ **340εw** when c < 0.74d. **With a second, at the neutral axis:** d/tw ≤ **400εw** (cl. 509.6.1.1 c, d).',
        '**Compression flange buckling:** d/tw ≤ **345εf²** without transverse stiffeners or when c ≥ 1.5d, and **345εf** when c < 1.5d (cl. 509.6.1.2).',
      ],
      notes: ['Clear panel dimensions are not more than 270 t and 180 t. Transverse stiffeners, where required, are 0.33 d1 to 1.5 d1 apart (cl. 509.7.14 g, h).'],
    },
    right: { kicker: 'cl. 509.6.1', title: 'Minimum web thickness' },
  },
  {
    id: 'stiff', title: 'Intermediate stiffeners', prompt: 'Drag the outstand. Change the stiffener and its spacing.',
    left: {
      kicker: 'Spread 6 · cl. 509.7.1, 509.7.2', title: 'Intermediate stiffeners',
      lede: 'Intermediate transverse web stiffeners improve the buckling strength of a slender web in shear. They may be on one or both sides of the web (cl. 509.7.1.1, 509.7.2.1).',
      paras: [
        '**Outstand.** Unless the outer edge is continuously stiffened, the outstand from the face of the web is not more than **20 tq ε**. Between 14 tq ε and 20 tq ε, the design is based on a core section with an outstand of **14 tq ε** (cl. 509.7.1.2).',
        '**Stiffness.** Is ≥ **0.75 d tw³** if c/d ≥ √2, and Is ≥ **1.5 d³ tw³ / c²** if c/d < √2, about the centre line of the web for a pair and about the face of the web for a single stiffener (cl. 509.7.2.4).',
        '**Buckling.** The stiffener is checked for a force **Fq = (V − Vcr) / γm0 ≤ Fqd**. Fqd is the strength of a strut on **curve c**: the stiffener with 20 tw of web on each side, with an effective length of **0.7 L** (cl. 509.7.1.5, 509.7.2.5).',
        '**Connection.** The shear between each component of the stiffener and the web is not less than **tw² / (5 bs)** kN/mm. A stiffener carrying no external load may stop short of the tension flange by not more than 4 tw (cl. 509.7.2.6).',
      ],
    },
    right: { kicker: 'cl. 509.7.1.2 · 509.7.2', title: 'Outstand and stiffness' },
  },
  {
    id: 'bearing', title: 'Stiffeners at supports', prompt: 'Drag the reaction. Change the bearing and the web.',
    left: {
      kicker: 'Spread 7 · cl. 509.7.3 to 509.7.6, 509.7.9', title: 'Stiffeners at supports',
      lede: 'A load carrying stiffener prevents local buckling of the web under a concentrated load; a bearing stiffener prevents local crushing of the web (cl. 509.7.1.1).',
      paras: [
        '**Bearing.** Bearing stiffeners are needed where the load exceeds the local capacity of the web, **Fw = (b1 + n2) tw fyw / γm0**. b1 is the stiff bearing length, n2 the length from dispersion through the flange at **1 : 2.5** (cl. 509.7.4). They are designed for the load less Fw (cl. 509.7.6).',
        '**Buckling.** Load carrying stiffeners are needed where the load exceeds the buckling strength of the web, a strut of area **(b1 + n1) tw** on curve c; n1 is the dispersion at 45° to half the depth (cl. 509.7.3.1).',
        'The load on a stiffener shall not exceed its buckling resistance, nor its bearing strength **Fpsd = Aq fyq / (0.8 γm0)** (cl. 509.7.5).',
        '**Torsional restraint.** A bearing stiffener that also holds the beam against twisting needs **Is ≥ 0.34 αs D³ Tcf**; αs is 0.006 for LLT/ry ≤ 50, 0.3/(LLT/ry) up to 100, and 30/(LLT/ry)² beyond (cl. 509.7.9).',
      ],
    },
    right: { kicker: 'cl. 509.7.3 · 509.7.4', title: 'Crushing and buckling under a reaction' },
  },
  {
    id: 'combined', title: 'Combined forces', prompt: 'Drag the shear. Add an axial force.',
    left: {
      kicker: 'Spread 8 · cl. 510', title: 'Combined forces',
      lede: 'No reduction in moment capacity is necessary as long as the factored shear is not more than **60 per cent** of the shear strength of the section (cl. 510.2.1).',
      paras: [
        'Under higher shear, a plastic or compact section has **Mdv = Md − β (Md − Mfd) ≤ 1.2 Ze fy / γm0**, with **β = (2V/Vd − 1)²**. Mfd is the plastic design strength of the cross-section excluding the shear area. A semi-compact section has **Mdv = Ze fy / γm0** (cl. 510.2.2).',
        '**Axial force and bending.** Plastic and compact sections satisfy (My/Mndy)^α1 + (Mz/Mndz)^α2 ≤ 1.0. For I and channel sections α1 = 5n ≥ 1 and α2 = 2 (Table 14). Conservatively, **N/Nd + My/Mdy + Mz/Mdz ≤ 1.0** (cl. 510.3.1.1).',
        'For a welded I or H section, **Mndz = Mdz (1 − n) / (1 − 0.5a) ≤ Mdz**, with n = N/Nd and a = (A − 2 b tf)/A ≤ 0.5 (cl. 510.3.1.2).',
        'Members under axial force and bending are also checked for overall buckling, by the interaction relationships of cl. 510.3.2.',
      ],
    },
    right: { kicker: 'cl. 510.2 · 510.3.1', title: 'What shear and thrust take from bending' },
  },
];

export const QUIZ = [];
