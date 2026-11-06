import { runBook } from '@engine/run.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';

// Optional: ctx (extra fields for every spread), coverMark(ctx2d, W, H), coverHolo({ THREE, holo }). See engine/run.js.
runBook({ BOOK, COVER, LESSONS, QUIZ, SPREADS });
