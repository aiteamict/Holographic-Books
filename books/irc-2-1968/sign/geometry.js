// The shield outline of Plate 1 as a point list (mm, plate coordinates: x right, y down, origin top-left).
// The same list strokes the border on canvas and builds the THREE.Shape for the holograms.
import { SPEC } from './spec.js';

const bez = (p0, p1, p2, p3, n, out) => {
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push({ x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x, y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y });
  }
};
const arc = (cx, cy, r, a0, a1, n, out) => { for (let i = 1; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }); } };

/** Border centre-line of the shield (the 10 mm black line is stroked along it). */
export function shieldOutline() {
  const { plate, border, notch, curve } = SPEC;
  const c = border.inset + border.t / 2;         // 17 mm in from the plate edge
  const L = c, R = plate.w - c, T = c, B = plate.h - c, M = plate.w / 2;
  const r = plate.r - border.t / 2;              // corner radius on the centre-line
  const pts = [{ x: L + r, y: T }];
  pts.push({ x: M - notch.halfW, y: T }, { x: M, y: T + notch.depth }, { x: M + notch.halfW, y: T }, { x: R - r, y: T });
  arc(R - r, T + r, r, -Math.PI / 2, 0, 4, pts);
  pts.push({ x: R, y: curve.straightTo });
  bez({ x: R, y: curve.straightTo }, { x: R, y: 505 }, { x: M + 75, y: B - 13 }, { x: M, y: B }, 22, pts);
  bez({ x: M, y: B }, { x: M - 75, y: B - 13 }, { x: L, y: 505 }, { x: L, y: curve.straightTo }, 22, pts);
  pts.push({ x: L, y: T + r });
  arc(L + r, T + r, r, Math.PI, Math.PI * 1.5, 4, pts);
  return pts;
}

/** Letter N and H of Fig. 1 as polygons (mm, origin top-left of the letter box, y down). */
export function letterN() {
  const { h, stroke: s, w } = SPEC.letters;
  const v = 38; // vertical thickness of the diagonal band that gives it a 16 mm perpendicular stroke
  return [
    [{ x: 0, y: 0 }, { x: s, y: 0 }, { x: s, y: h }, { x: 0, y: h }],
    [{ x: w - s, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: w - s, y: h }],
    [{ x: s, y: 0 }, { x: s, y: v }, { x: w - s, y: h }, { x: w - s, y: h - v }],
  ];
}
export function letterH() {
  const { h, stroke: s, w, barFromBottom } = SPEC.letters;
  const barTop = h - barFromBottom - s;
  return [
    [{ x: 0, y: 0 }, { x: s, y: 0 }, { x: s, y: h }, { x: 0, y: h }],
    [{ x: w - s, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: w - s, y: h }],
    [{ x: s, y: barTop }, { x: w - s, y: barTop }, { x: w - s, y: barTop + s }, { x: s, y: barTop + s }],
  ];
}

/** Where things sit on the plate (mm from the top), from the zone chain of Plate 1. */
export function zoneTops() {
  let y = 0; const out = [];
  for (const z of SPEC.zones) { out.push({ ...z, top: y, bottom: y + z.h }); y += z.h; }
  return out;
}
export const lettersTop = () => zoneTops()[2].top;    // 87
export const numeralsTop = () => zoneTops()[4].top;   // 262

export function polyPath(ctx, poly) { ctx.beginPath(); poly.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); }
