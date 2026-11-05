// Paints the sign face and the definition plate on a canvas, in millimetres, straight from the spec.
import { SPEC, spacingCode, spacingMM } from './spec.js';
import { shieldOutline, letterN, letterH, lettersTop, numeralsTop, polyPath } from './geometry.js';

const NUMERAL_FONT = '"Arial Black","Inter",Arial,Helvetica,sans-serif';
let measureCtx;
const mctx = () => measureCtx ||= document.createElement('canvas').getContext('2d');

/** Font size whose digit cap height is exactly `h` mm. */
function digitFont(h) {
  const c = mctx(); c.font = `900 100px ${NUMERAL_FONT}`;
  const asc = c.measureText('0').actualBoundingBoxAscent || 72;
  return { font: `900 ${(100 * h / asc).toFixed(2)}px ${NUMERAL_FONT}`, size: 100 * h / asc };
}

/**
 * Lay the numerals out with the Plate 5 spacing. Returns glyph boxes and the gaps between them (mm, centred on 0).
 * `even` (mm) overrides every gap with one fixed value: the sign-writer's mistake a spread can demonstrate. The Plate 5
 * code is still reported on each gap so the tables stay truthful.
 */
export function layoutNumerals(number, { even = 0 } = {}) {
  const digits = String(number).replace(/\D/g, '').slice(0, 3) || '0';
  const { font } = digitFont(SPEC.numerals.h);
  const c = mctx(); c.font = font; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const glyphs = [], gaps = [];
  let x = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = digits[i], m = c.measureText(d);
    const left = m.actualBoundingBoxLeft, w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    if (i) { const a = digits[i - 1], code = spacingCode(a, d), mm = even || spacingMM(a, d); gaps.push({ a, b: d, code, mm, x }); x += mm; }
    glyphs.push({ d, x0: x, x1: x + w, draw: x + left });
    x += w;
  }
  const shift = -x / 2;
  glyphs.forEach(g => { g.x0 += shift; g.x1 += shift; g.draw += shift; });
  gaps.forEach(g => { g.x += shift; });
  return { digits, glyphs, gaps, width: x, font };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/**
 * Paint the route marker face. `opts` lets a spread show a deliberate mistake:
 * { yellow: hex, ink: hex, noBorder: true, noLetters: true, noNumerals: true, even: mm }  (the no* flags let a spread paint the
 * face in shop stages: coat, border, letters, numerals)
 */
export function drawFace(canvas, number = '42', opts = {}) {
  const { plate, border, letters, colours } = SPEC;
  const ctx = canvas.getContext('2d');
  const s = canvas.width / plate.w;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.clearRect(0, 0, plate.w, plate.h);
  ctx.fillStyle = opts.yellow || colours.face.hex;
  roundRect(ctx, 0, 0, plate.w, plate.h, plate.r); ctx.fill();
  ctx.fillStyle = ctx.strokeStyle = opts.ink || colours.ink.hex;
  if (!opts.noBorder) {
    const o = shieldOutline();
    ctx.beginPath(); o.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
    ctx.lineWidth = border.t; ctx.lineJoin = 'round'; ctx.stroke();
  }
  // N H: two 67 mm letters with a 45 mm gap, centred, in the 100 mm zone
  const lt = lettersTop(), total = letters.w * 2 + letters.gap, x0 = (plate.w - total) / 2;
  if (!opts.noLetters) for (const poly of letterN()) { ctx.save(); ctx.translate(x0, lt); polyPath(ctx, poly); ctx.fill(); ctx.restore(); }
  if (!opts.noLetters) for (const poly of letterH()) { ctx.save(); ctx.translate(x0 + letters.w + letters.gap, lt); polyPath(ctx, poly); ctx.fill(); ctx.restore(); }
  // numerals: 200 mm high, spaced by Plate 5
  const lay = layoutNumerals(number, { even: opts.even });
  ctx.font = lay.font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const base = numeralsTop() + SPEC.numerals.h;
  if (!opts.noNumerals) for (const g of lay.glyphs) ctx.fillText(g.d, plate.w / 2 + g.draw, base);
  return lay;
}

/** Paint the grey back of the plate (cl. 6). */
export function drawBack(canvas) {
  const ctx = canvas.getContext('2d'); const { plate, colours } = SPEC; const s = canvas.width / plate.w;
  ctx.setTransform(s, 0, 0, s, 0, 0); ctx.fillStyle = colours.back.hex; roundRect(ctx, 0, 0, plate.w, plate.h, plate.r); ctx.fill();
}

// ---- Definition plate (Plate 3) -------------------------------------------------------------------
export const ARROWS = {
  ahead:      { label: 'straight ahead',       pts: [[150, 205], [150, 45]], bar: { y: 180, w: 130 } },
  turnLeft:   { label: 'turns left',           pts: [[205, 205], [205, 125], [40, 125]] },
  turnRight:  { label: 'turns right',          pts: [[95, 205], [95, 125], [260, 125]] },
  right:      { label: 'to the right',         pts: [[40, 125], [260, 125]] },
  left:       { label: 'to the left',          pts: [[260, 125], [40, 125]] },
  aheadRight: { label: 'forks ahead-right',    pts: [[95, 205], [95, 150], [245, 45]], bar: { x: 95, y: 185, w: 60 } },
  aheadLeft:  { label: 'forks ahead-left',     pts: [[205, 205], [205, 150], [55, 45]], bar: { x: 205, y: 185, w: 60 } },
  bothDiag:   { label: 'both ways (diagonal)', pts: [[55, 205], [245, 45]], both: true },
  both:       { label: 'both ways',            pts: [[40, 125], [260, 125]], both: true },
};

function head(ctx, from, to, L, W) {
  const dx = to[0] - from[0], dy = to[1] - from[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
  const bx = to[0] - ux * L, by = to[1] - uy * L;
  ctx.beginPath(); ctx.moveTo(to[0], to[1]); ctx.lineTo(bx - uy * W / 2, by + ux * W / 2); ctx.lineTo(bx + uy * W / 2, by - ux * W / 2); ctx.closePath(); ctx.fill();
  return [bx, by];
}

export function drawDefinitionPlate(canvas, kind = 'ahead', opts = {}) {
  const { defPlate: D, colours } = SPEC;
  const a = ARROWS[kind] || ARROWS.ahead;
  const ctx = canvas.getContext('2d'); const s = canvas.width / D.w;
  ctx.setTransform(s, 0, 0, s, 0, 0); ctx.clearRect(0, 0, D.w, D.h);
  ctx.fillStyle = opts.yellow || colours.face.hex; roundRect(ctx, 0, 0, D.w, D.h, 8); ctx.fill();
  ctx.fillStyle = ctx.strokeStyle = colours.ink.hex;
  ctx.lineWidth = D.border; ctx.strokeRect(D.inset + D.border / 2, D.inset + D.border / 2, D.w - 2 * D.inset - D.border, D.h - 2 * D.inset - D.border);
  const pts = a.pts.slice();
  const last = pts.length - 1, endBase = head(ctx, pts[last - 1], pts[last], D.headL, D.headW);
  let start = pts[0];
  if (a.both) start = head(ctx, pts[1], pts[0], D.headL, D.headW);
  ctx.lineWidth = D.shaft; ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(start[0], start[1]); for (let i = 1; i < last; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.lineTo(endBase[0], endBase[1]); ctx.stroke();
  if (a.bar) { const cx = a.bar.x ?? pts[0][0]; ctx.fillRect(cx - a.bar.w / 2, a.bar.y - 6, a.bar.w, 12); }
  return a;
}
