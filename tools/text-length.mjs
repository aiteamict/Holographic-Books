// node tools/text-length.mjs <book folder>... — characters on each left page (lede + paragraphs + notes) and the number of blocks.
// A left page of the IRC 24 chapters holds about 1150 characters in 5 blocks; more runs off the bottom of the page.
import { pathToFileURL } from 'node:url';
for (const b of process.argv.slice(2)) {
  const { LESSONS } = await import(pathToFileURL(`books/${b}/content/lessons.js`).href);
  for (const l of LESSONS.filter(Boolean)) {
    const t = [l.left.lede, ...(l.left.paras || []), ...(l.left.notes || [])], n = t.join('').replace(/\*\*/g, '').length, cost = n + 70 * t.length;
    console.log(b, l.id.padEnd(10), String(n).padStart(5), 'chars', t.length, 'blocks', cost > 1510 ? '  <-- long' : '');
  }
}
