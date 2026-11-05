// Typesets a book page onto a canvas and returns a texture. Pages are 26 × 34 cm at 40 px/cm.
import * as THREE from 'three';

export const PAGE_W = 26, PAGE_H = 34, PX = 56;   // 1456 × 1904 px pages: more texels than screen pixels even up close
const W = PAGE_W * PX, H = PAGE_H * PX;
const SERIF = '"Source Serif 4","Georgia","Times New Roman",serif';
const SANS = 'Inter,"Segoe UI",Arial,sans-serif';
export const INK = { paper: '#0f141c', paper2: '#121923', ink: '#d9e2ee', dim: '#8d9db2', cyan: '#58d6ff', amber: '#ffa24a', rule: 'rgba(255,255,255,.12)' };

function wrap(ctx, text, maxW) {
  const words = text.split(' '), lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
/** Draw text where **bold** runs come out white and bold. Returns the y after the block. */
function paragraph(ctx, text, x, y, maxW, { size = 30, lh = 1.42, color = INK.ink, font = SERIF, italic = false } = {}) {
  const base = `${italic ? 'italic ' : ''}400 ${size}px ${font}`, bold = `${italic ? 'italic ' : ''}700 ${size}px ${font}`;
  const words = text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).flatMap(t => {
    const b = t.startsWith('**'); return (b ? t.slice(2, -2) : t).split(' ').filter(Boolean).map(w => ({ b, t: w }));
  });
  let cx = x, cy = y; ctx.font = base; const space = ctx.measureText(' ').width;
  for (const w of words) {
    ctx.font = w.b ? bold : base; const ww = ctx.measureText(w.t).width;
    if (cx + ww > x + maxW && cx > x) { cx = x; cy += size * lh; }
    ctx.fillStyle = w.b ? '#ffffff' : color; ctx.fillText(w.t, cx, cy); cx += ww + space;
  }
  return cy + size * lh;
}

function paper(ctx, side) {
  const g = ctx.createLinearGradient(side === 'left' ? W : 0, 0, side === 'left' ? 0 : W, 0);
  g.addColorStop(0, INK.paper2); g.addColorStop(.12, INK.paper); g.addColorStop(1, INK.paper);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = .035; for (let i = 0; i < 5000; i++) { ctx.fillStyle = Math.random() < .5 ? '#fff' : '#000'; ctx.fillRect(Math.random() * W, Math.random() * H, 3, 3); } ctx.globalAlpha = 1;
}

/**
 * spec: { kicker, title, lede, paras: [], notes: [], pageNo, side: 'left'|'right', foot }
 * Returns a CanvasTexture; `draw(ctx, box)` may add graphics under the text.
 */
export function renderPage(spec, draw) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  paper(ctx, spec.side);
  // right-hand pages carry only a short caption, set at the bottom so the hologram standing on the page never covers it
  const k = PX / 40;   // type sizes were tuned at 40 px/cm
  const m = 84 * k, x = spec.side === 'left' ? m : m + 24 * k, maxW = W - m * 2 - 24 * k;
  // quiet pages carry only their kicker, down by the page number, so a hologram standing on the page covers no words
  let y = spec.quiet ? H - 112 * k : spec.side === 'right' && !spec.top ? H - 400 * k : 120 * k;
  ctx.textBaseline = 'alphabetic';
  if (spec.kicker) { ctx.font = `600 ${20 * k}px ${SANS}`; ctx.fillStyle = INK.cyan; ctx.fillText(spec.kicker.toUpperCase().split('').join(' '), x, y); y += 46 * k; }
  if (spec.title) { ctx.font = `italic 700 ${62 * k}px ${SERIF}`; ctx.fillStyle = '#fff'; for (const l of wrap(ctx, spec.title, maxW)) { ctx.fillText(l, x, y); y += 70 * k; } y += 18 * k; }
  if (spec.lede) { y = paragraph(ctx, spec.lede, x, y, maxW, { size: 36 * k, color: '#eef3f9', lh: 1.36 }) + 14 * k; }
  for (const p of spec.paras || []) y = paragraph(ctx, p, x, y, maxW, { size: 31 * k, lh: 1.4 }) + 10 * k;
  if (spec.notes?.length) {
    y += 10 * k; ctx.fillStyle = INK.rule; ctx.fillRect(x, y, maxW * .35, 2 * k); y += 40 * k;
    for (const n of spec.notes) y = paragraph(ctx, n, x, y, maxW, { size: 25 * k, color: INK.dim, italic: true, lh: 1.36 }) + 6 * k;
  }
  if (draw) draw(ctx, { x, y, maxW, W, H, PX });
  ctx.font = `500 ${20 * k}px ${SANS}`; ctx.fillStyle = INK.dim; ctx.textAlign = spec.side === 'left' ? 'left' : 'right';
  const fx = spec.side === 'left' ? m : W - m;
  if (spec.pageNo != null) ctx.fillText(String(spec.pageNo), fx, H - 60 * k);
  ctx.font = `500 ${17 * k}px ${SANS}`; ctx.fillText(spec.foot || 'IRC : 2-1968 · Route Marker Signs for National Highways', fx, 64 * k);
  ctx.textAlign = 'left';
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/** The cover: dark board with the title and the shield mark. */
export function renderCover(drawMark) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(W * .5, H * .4, 40, W * .5, H * .4, H); g.addColorStop(0, '#1a2230'); g.addColorStop(1, '#0a0e14');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = .05; for (let i = 0; i < 4000; i++) { ctx.fillStyle = Math.random() < .5 ? '#fff' : '#000'; ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2); } ctx.globalAlpha = 1;
  const k = PX / 40;
  ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 3 * k; ctx.strokeRect(50 * k, 50 * k, W - 100 * k, H - 100 * k);
  ctx.textAlign = 'center'; ctx.fillStyle = '#eef3f9';
  ctx.font = `italic 800 ${112 * k}px ${SERIF}`; ctx.fillText('The Route', W / 2, 250 * k); ctx.fillText('Marker', W / 2, 370 * k);
  ctx.font = `600 ${26 * k}px ${SANS}`; ctx.fillStyle = INK.cyan; ctx.fillText('I R C : 2 - 1 9 6 8   ·   A  H O L O G R A P H I C  C H A P T E R', W / 2, 430 * k);
  if (drawMark) drawMark(ctx, W, H);
  ctx.font = `500 ${24 * k}px ${SANS}`; ctx.fillStyle = INK.dim; ctx.fillText('ROUTE MARKER SIGNS FOR NATIONAL HIGHWAYS', W / 2, H - 150 * k);
  ctx.fillText('Indian Roads Congress · first published 1953 · first revision 1968', W / 2, H - 112 * k);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; return t;
}
