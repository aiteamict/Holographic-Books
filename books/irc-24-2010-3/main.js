import { runBook } from '@engine/run.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { cover } from '../_irc24/kit.js';

runBook({ BOOK, COVER, LESSONS, QUIZ, SPREADS, fitPhone: true, phoneLayout: 2, ...cover("P ≤ Pd = Ae fcd") });
