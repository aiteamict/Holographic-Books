// Typesets a book page onto a canvas and returns a texture. Pages are 26 × 34 cm at 40 px/cm.
import * as THREE from 'three';

// 1456 × 1904 px pages on desktop: more texels than screen pixels even up close. Touch devices get 884 × 1156: still more
// than a phone shows a page at, and 24 pages at full size (~600 MB of canvas + GPU memory) crashed phone browsers.
export const PHONE = typeof matchMedia === 'function' && (matchMedia('(pointer: coarse)').matches || /[?&]phone\b/.test(location.search));   // ?phone tests it on desktop
export const PAGE_W = 26, PAGE_H = 34, PX = PHONE ? 34 : 56;
const W = PAGE_W * PX, H = PAGE_H * PX;
const SERIF = '"Source Serif 4","Georgia","Times New Roman",serif';
const SANS = 'Inter,"Segoe UI",Arial,sans-serif';
// light theme: cream paper and near-black ink; the cover keeps its own dark board colours (COVER below)
export const INK = { paper: '#f6f1e7', paper2: '#e6dece', ink: '#1f2328', dim: '#5c6168', cyan: '#1d6a94', amber: '#b0532a', rule: 'rgba(0,0,0,.16)', bold: '#0e1115', title: '#14171b' };
const COVER = { ink: '#eef3f9', cyan: '#58d6ff', dim: '#8d9db2', board: ['#1a2230', '#0a0e14'], frame: 'rgba(255,255,255,.14)' };

function wrap(ctx, text, maxW) {
  const words = text.split(' '), lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
/** Draw text where **bold** runs come out white and bold. Returns the y after the block. */
function paragraph(ctx, text, x, y, maxW, { size = 30, lh = 1.42, color = INK.ink, font = SERIF, italic = false } = {}) {
  const base = `${italic ? 'italic ' : ''}400 ${size}px ${font}`, bold = `${italic ? 'italic ' : ''}700 ${size}px ${font}`;
  // words, each marked `glue` when it touches the run before it with no space ("**axles**." → the stop hugs the word)
  const words = []; let prevSpace = true;
  for (const t of text.split(/(\*\*[^*]+\*\*)/).filter(Boolean)) {
    const b = t.startsWith('**'), s = b ? t.slice(2, -2) : t;
    s.split(' ').forEach((w, i) => { if (w) words.push({ b, t: w, glue: i === 0 && words.length > 0 && !prevSpace && !/^\s/.test(s) }); });
    prevSpace = /\s$/.test(s);
  }
  let cx = x, cy = y; ctx.font = base; const space = ctx.measureText(' ').width;
  for (const w of words) {
    ctx.font = w.b ? bold : base; const ww = ctx.measureText(w.t).width;
    if (w.glue) cx -= space;                                   // no space between a bold run and the punctuation after it
    else if (cx + ww > x + maxW && cx > x) { cx = x; cy += size * lh; }
    ctx.fillStyle = w.b ? INK.bold : color; ctx.fillText(w.t, cx, cy); cx += ww + space;
  }
  return cy + size * lh;
}

function paper(ctx, side, W, H) {
  const g = ctx.createLinearGradient(side === 'left' ? W : 0, 0, side === 'left' ? 0 : W, 0);
  g.addColorStop(0, INK.paper2); g.addColorStop(.12, INK.paper); g.addColorStop(1, INK.paper);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = .045; for (let i = 0; i < 6000; i++) { ctx.fillStyle = Math.random() < .7 ? '#8a7a60' : '#fff'; ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2); } ctx.globalAlpha = 1;   // paper fibre
}

/**
 * spec: { kicker, title, lede, paras: [], notes: [], pageNo, side: 'left'|'right', foot }
 * Returns a CanvasTexture; `draw(ctx, box)` may add graphics under the text.
 */
export function renderPage(spec, draw, px = PX) {   // px: pixels per cm; phones draw pages small and redraw the one being read at full size
  const W = PAGE_W * px, H = PAGE_H * px;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  paper(ctx, spec.side, W, H);
  // right-hand pages carry only a short caption, set at the bottom so the hologram standing on the page never covers it
  const k = px / 40;   // type sizes were tuned at 40 px/cm
  const m = 84 * k, x = spec.side === 'left' ? m : m + 24 * k, maxW = W - m * 2 - 24 * k;
  // quiet pages carry only their kicker, down by the page number, so a hologram standing on the page covers no words
  let y = spec.quiet ? H - 112 * k : spec.side === 'right' && !spec.top ? H - 400 * k : 120 * k;
  ctx.textBaseline = 'alphabetic';
  if (spec.kicker) { ctx.font = `600 ${20 * k}px ${SANS}`; ctx.fillStyle = INK.cyan; ctx.fillText(spec.kicker.toUpperCase().split('').join(' '), x, y); y += 46 * k; }
  if (spec.title) { ctx.font = `italic 700 ${62 * k}px ${SERIF}`; ctx.fillStyle = INK.title; for (const l of wrap(ctx, spec.title, maxW)) { ctx.fillText(l, x, y); y += 70 * k; } y += 18 * k; }
  if (spec.lede) { y = paragraph(ctx, spec.lede, x, y, maxW, { size: 36 * k, color: INK.title, lh: 1.36 }) + 14 * k; }
  for (const p of spec.paras || []) y = paragraph(ctx, p, x, y, maxW, { size: 31 * k, lh: 1.4 }) + 10 * k;
  if (spec.notes?.length) {
    y += 10 * k; ctx.fillStyle = INK.rule; ctx.fillRect(x, y, maxW * .35, 2 * k); y += 40 * k;
    for (const n of spec.notes) y = paragraph(ctx, n, x, y, maxW, { size: 25 * k, color: INK.dim, italic: true, lh: 1.36 }) + 6 * k;
  }
  if (draw) draw(ctx, { x, y, maxW, W, H, PX: px });
  ctx.font = `500 ${20 * k}px ${SANS}`; ctx.fillStyle = INK.dim; ctx.textAlign = spec.side === 'left' ? 'left' : 'right';
  const fx = spec.side === 'left' ? m : W - m;
  if (spec.pageNo != null) ctx.fillText(String(spec.pageNo), fx, H - 60 * k);
  ctx.font = `500 ${17 * k}px ${SANS}`; ctx.fillText(spec.foot || '', fx, 64 * k);
  ctx.textAlign = 'left';
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/** The cover: dark board. spec = { title: [lines], kicker, foot: [lines], colors? }; drawMark paints the artwork. */
export function renderCover(spec, drawMark) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  const C = { ...COVER, ...spec.colors };   // spec.colors: { board: [centre, edge], ink, cyan, dim, frame }
  const g = ctx.createRadialGradient(W * .5, H * .4, 40, W * .5, H * .4, H); g.addColorStop(0, C.board[0]); g.addColorStop(1, C.board[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = .05; for (let i = 0; i < 4000; i++) { ctx.fillStyle = Math.random() < .5 ? '#fff' : '#000'; ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2); } ctx.globalAlpha = 1;
  const k = PX / 40;
  ctx.strokeStyle = C.frame; ctx.lineWidth = 3 * k; ctx.strokeRect(50 * k, 50 * k, W - 100 * k, H - 100 * k);
  ctx.textAlign = 'center'; ctx.fillStyle = C.ink;
  ctx.font = `italic 800 ${112 * k}px ${SERIF}`; (spec.title || []).forEach((t, i) => ctx.fillText(t, W / 2, (250 + i * 120) * k));
  ctx.font = `600 ${26 * k}px ${SANS}`; ctx.fillStyle = C.cyan; ctx.fillText(spec.kicker || '', W / 2, (190 + (spec.title || []).length * 120) * k);
  if (drawMark) { ctx.save(); drawMark(ctx, W, H); ctx.restore(); }   // a mark must not leave textAlign, fonts or dashes behind for the foot
  ctx.font = `500 ${24 * k}px ${SANS}`; ctx.fillStyle = C.dim; (spec.foot || []).forEach((t, i, a) => ctx.fillText(t, W / 2, H - (112 + (a.length - 1 - i) * 38) * k));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; return t;
}
