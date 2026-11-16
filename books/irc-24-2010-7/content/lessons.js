// The words on the pages. Taken from IRC : 24-2010 with the clause, table or figure in brackets.
export const BOOK = {
  title: 'Fatigue',
  subtitle: 'IRC : 24-2010 · chapter 7 of 9',
  credit: 'built from IRC : 24-2010',
  home: { href: '../irc-24-2010/', label: 'All IRC 24 chapters' },
  foot: 'IRC : 24-2010 · Steel Road Bridges · 7 Fatigue',
  cover: {
    title: ['Fatigue'],
    kicker: 'I R C : 2 4 - 2 0 1 0   ·   C H A P T E R  7  O F  9',
    foot: ['STANDARD SPECIFICATIONS AND CODE OF PRACTICE FOR ROAD BRIDGES · SECTION V · STEEL ROAD BRIDGES', 'Indian Roads Congress · clause 511'],
    colors: { board: ['#e4d5c4', '#c4a98f'], ink: '#231a14', cyan: '#8a3f1c', dim: '#5b4a3c', frame: 'rgba(35,26,20,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Millions of small loads.',
    lede: 'Clause 511 applies to structures and structural elements subject to loading which could lead to fatigue failure (cl. 511.1).',
    paras: [
      'For fatigue, the details of members and connections are sorted into fatigue classes. Each class has a design stress range for each number of cycles. The check is made at every critical location, for the cycles and stress ranges expected in the life of the structure (cl. 511.1.1).',
      'So the questions are: how good is the detail, how many cycles, how large the stress range, and how safe must the answer be.',
    ],
    notes: ['Stress ranges in MPa. A detail category is the fatigue strength of the detail, in MPa, at 5 × 10⁶ cycles. Cracks and deflections in the models are drawn far larger than true.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Millions of small loads.',
    lede: 'Chapter 7 of 9 in the IRC : 24 series: clause 511 of the standard.',
    paras: [
      '**Source.** IRC : 24-2010, Standard Specifications and Code of Practice for Road Bridges, Section V, Steel Road Bridges (Limit State Method), Third Revision, Indian Roads Congress, May 2010.',
      '**Coverage.** cl. 511.1, 511.2.1: spread 1 · cl. 511.2.3, Table 18: spread 2 · cl. 511.3, Table 19: spread 3 · cl. 511.4, Fig. 11: spread 4 · cl. 511.2.2.3, 511.5: spread 5 · cl. 511.5.2.4, 511.6: spread 6.',
      '**Not drawn.** The multiplying factors for hollow section connections (Tables 16, 17), the details of Table 19 not chosen for spread 3, including bolts (Table 19 c) and hollow sections (Table 19 d), and the S-N curve for shear (Fig. 12).',
    ],
    notes: ['In cl. 511.5.2.4 the second sum is printed without nj, and the note on its limits puts the cubic term with the smaller stress ranges. The model takes the life N of each range from the S-N curve of cl. 511.4: third power at or above the strength at 5 × 10⁶ cycles, fifth power below. The traffic spectrum is illustrative. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'cycles', title: 'Cycles of stress', prompt: 'Watch the cycles count. Drag the plate thickness.',
    left: {
      kicker: 'Spread 1 · cl. 511.1, 511.2.1', title: 'Cycles of stress',
      lede: 'The clause does not cover corrosion fatigue, low cycle (high stress) fatigue, thermal fatigue, stress corrosion cracking, or the effects of temperatures above 150 °C or below the brittle transition temperature (cl. 511.1).',
      paras: [
        'The standard S-N curves are for **reference conditions**: the detail is in a redundant load path; the nominal stress is found without the local stress concentration of the detail; the load cycles are not highly irregular; the details can be inspected and are; the environment is only mildly corrosive (cl. 511.2.1).',
        'They also assume that a transverse fillet or butt weld connects plates **not thicker than 25 mm**. For thicker plates the values are multiplied by **μr = (25 / tp)^0.25 ≤ 1.0**, tp being the thickness of the thicker plate (cl. 511.2.1).',
        'No thickness correction is needed when full penetration butt weld reinforcements are machined flush and proved free of defect by non-destructive testing (cl. 511.2.1).',
        'Holes should preferably be avoided in members and connections subjected to fatigue. They shall not be punched in plates thicker than 12 mm, nor gas cut, unless reamed afterwards (cl. 511.2.1, 511.3).',
      ],
    },
    right: { kicker: 'cl. 511.2.1', title: 'Reference conditions and thick plates' },
  },
  {
    id: 'gamma', title: 'How safe', prompt: 'Change the inspection and the consequence of failure.',
    left: {
      kicker: 'Spread 2 · cl. 511.2.3 · Table 18', title: 'How safe',
      lede: 'The partial safety factor for fatigue strength, γmft, is influenced by the consequences of fatigue damage and by the level of inspection (cl. 511.2.3.2).',
      paras: [
        'A **fail-safe** component or detail is one where local failure of one component by a fatigue crack does not result in failure of the structure, because an alternative load path is available: a redundant system (cl. 511.2.3.3 a).',
        'A **non-fail-safe** component or detail is one where local failure of one component leads rapidly to failure of the structure, because of its non-redundant nature (cl. 511.2.3.3 b).',
        'With periodic inspection and maintenance, and good access to the detail: **1.00** fail-safe, **1.25** non-fail-safe. With poor access: **1.15** and **1.35** (Table 18).',
        'The partial safety factor for loads and their effects in fatigue, **γfft, is 1.0**, unless uncertainty in the loads demands more (cl. 511.2.3.1).',
      ],
    },
    right: { kicker: 'Table 18', title: 'Consequence and inspection' },
  },
  {
    id: 'category', title: 'Detail categories', prompt: 'Pick a detail.',
    left: {
      kicker: 'Spread 3 · cl. 511.3 · Table 19', title: 'Detail categories',
      lede: 'Tables 19 (a) to (d) classify details into categories for assessing fatigue strength. The category number is the fatigue strength in MPa at 5 × 10⁶ cycles (cl. 511.3, 511.4).',
      paras: [
        '**Non-welded.** Rolled and extruded products **118**. Bolted connections, and gas-cut or sheared edges with no draglines, **103**. Machine gas-cut edges with draglines, or manual gas cutting, **92** (Table 19 a).',
        '**Longitudinal welds.** Continuous automatic welds from both sides **92**; with stop-start positions, or from one side on a backing bar, **83**; from one side only **66**; intermittent **59**; at cope holes **52** (Table 19 b).',
        '**Transverse butt welds.** Ground flush with full testing **83**; ordinary splices **66**; on a backing bar **52** (Table 19 b).',
        '**Attachments.** Vertical stiffeners **59** on plates up to 12 mm and **52** above; cover plate ends **37** up to 25 mm and **27** above; fillet welded cruciform joints **41** on the plate and **27** on the weld throat (Table 19 b).',
      ],
      notes: ['A detail not in the tables is treated as the lowest category of a similar detail, unless testing or analysis proves better (cl. 511.3).'],
    },
    right: { kicker: 'Table 19', title: 'The detail sets the strength' },
  },
  {
    id: 'sn', title: 'The S-N curve', prompt: 'Drag the number of cycles. Pick a category.',
    left: {
      kicker: 'Spread 4 · cl. 511.4 · Figs. 11, 12', title: 'The S-N curve',
      lede: 'The fatigue strength of the standard detail falls as the number of stress cycles Nsc rises (cl. 511.4).',
      paras: [
        'For normal stress, when Nsc ≤ 5 × 10⁶: **ff = ffn ∛(5 × 10⁶ / Nsc)**.',
        'When 5 × 10⁶ ≤ Nsc ≤ 10⁸: **ff = ffn ⁵√(5 × 10⁶ / Nsc)**.',
        'For shear stress: **τf = τfn ⁵√(5 × 10⁶ / Nsc)**.',
        'ff and τf are the design normal and shear fatigue stress ranges of the detail for a life of Nsc cycles. ffn and τfn are its normal and shear fatigue strength for 5 × 10⁶ cycles, for its detail category (Table 19). Figures 11 and 12 plot the curves for every category, on logarithmic scales.',
      ],
    },
    right: { kicker: 'cl. 511.4 · Fig. 11', title: 'Strength against cycles' },
  },
  {
    id: 'assess', title: 'The assessment', prompt: 'Drag the stress range. Change the detail, the cycles and γmft.',
    left: {
      kicker: 'Spread 5 · cl. 511.2.2.3, 511.5', title: 'The assessment',
      lede: 'The design fatigue strength is the standard fatigue strength for Nsc cycles, multiplied by the correction factor μr and divided by the partial safety factor of Table 18 (cl. 511.5).',
      paras: [
        '**Low fatigue.** No assessment is required if the design stress range **f ≤ 27 / γmft**, or if the number of cycles **Nsc < 5 × 10⁶ (27/γmft / γfft f)³** (cl. 511.2.2.3).',
        '**Exemption.** If the actual stress range is less than the design fatigue strength at 5 × 10⁶ cycles, no further assessment is needed at that point (cl. 511.5.1).',
        '**Constant stress range.** **f ≤ ffd = μr ff / γmft** and **τ ≤ τfd = μr τf / γmft**, with ff and τf from the S-N curve for the actual life Nsc (cl. 511.5.2.3).',
        '**Limits.** The maximum stress never exceeds the elastic limit under cyclic loading, and the maximum stress range never exceeds **1.5 fy** for normal stress and **1.5 fy / √3** for shear (cl. 511.5.2.1, 511.5.2.2).',
      ],
    },
    right: { kicker: 'cl. 511.5.2.3', title: 'Stress range against design strength' },
  },
  {
    id: 'miner', title: 'A spectrum of loads', prompt: 'Drag the load level. Pick a better detail.',
    left: {
      kicker: 'Spread 6 · cl. 511.5.2.4, 511.6', title: 'A spectrum of loads',
      lede: 'Where variable stress ranges fi act for ni cycles each, their effects are added (cl. 511.5.2.4).',
      paras: [
        'For normal stress, the sum of **ni fi³ / [5 × 10⁶ (μ ffn/γmft)³]** and of **nj fj⁵ / [5 × 10⁶ (μ ffn/γmft)⁵]** over the stress ranges shall not exceed **1.0**. For shear, Σ ni τi⁵ ≤ 5 × 10⁶ (μ τfn/γmft)⁵ (cl. 511.5.2.4).',
        'Each term is the share of the fatigue life used by one stress range: its cycles divided by the cycles the detail could stand at that range.',
        'Stress ranges less than **0.55 μc ffn** (normal) and **0.55 μc τfn** (shear) may be disregarded (cl. 511.5.2.4).',
        '**No assessment at all** is necessary if the highest normal stress range is not more than **27 μc / γmft**, the highest shear stress range not more than **67 μc / γmft**, or Nsc ≤ 5 × 10⁶ (27 μc / γmft ffeq)³, ffeq being the equivalent constant amplitude stress range (cl. 511.6).',
      ],
    },
    right: { kicker: 'cl. 511.5.2.4', title: 'Shares of a life' },
  },
];

export const QUIZ = [];
