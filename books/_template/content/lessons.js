// The words on the pages. **bold** works in lede, paras and notes.
export const BOOK = {
  title: 'Book Title',
  subtitle: 'Standard · a holographic chapter',
  credit: 'built from Standard',                 // bottom-right credit line
  foot: 'Standard · Full title of the standard',  // running head on every page
  cover: { title: ['Book', 'Title'], kicker: 'S T A N D A R D   ·   A  H O L O G R A P H I C  C H A P T E R', foot: ['FULL TITLE OF THE STANDARD', 'Publisher · year'] },
};

export const COVER = {
  insideCover: { side: 'left', kicker: 'About this chapter', title: 'What this book covers.', lede: 'One sentence on the subject.', paras: ['How to read it: turn the pages in order; each right-hand page projects a hologram.'] },
  insideBack: { side: 'left', kicker: 'Sources', title: 'Where the numbers come from.', paras: ['**Source.** Full citation of the standard, clauses used.'] },
};

// One entry per spread, index 1..N (index 0 is the cover). SPREADS in spreads/index.js must line up with this.
export const LESSONS = [null,
  {
    id: 'example', title: 'An example spread', prompt: 'Follow the steps. Then explore.',
    left: { kicker: 'Spread 1 · Topic', title: 'An example spread', lede: 'The one idea this spread teaches.', paras: ['Body text with the clause numbers in brackets (cl. 1.1).'] },
    right: { kicker: 'Fig. 1', title: 'The hologram' },
  },
];

export const QUIZ = [];
