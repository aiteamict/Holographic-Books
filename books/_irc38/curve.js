// Geometry of a horizontal curve as IRC : 38-1988 defines it (section 2, Figs. 2 and 3): two straights meeting at the
// apex (P.I.), a circular arc of radius Rc and, optionally, an Euler spiral (clothoid) of length Ls at each end.
// Shared by every chapter of the IRC 38 series. Lengths in metres, angles in radians unless named *Deg.
//
// Plan frame: P.I. at the origin, travel left → right, the road turning right through the deviation angle Δ.
// The first straight heads at +Δ/2, the second at −Δ/2, so the curve is symmetric about the y axis and the centre lies
// on the negative y axis. x = east, y = north (a spread maps plan y to −z).

const RAD = Math.PI / 180;
export const deg = r => r / RAD;

/** A point on a clothoid of length Ls ending at radius R, distance l from its start: local x along the tangent at the
 *  start, y towards the curve's centre. Simpson integration of cos/sin θ, θ = l² / (2 R Ls) (cl. 7.5). */
export function spiralXY(l, Ls, R, n = 64) {
  if (l <= 0) return { x: 0, y: 0, theta: 0 };
  const k = 1 / (2 * R * Ls), h = l / n; let x = 0, y = 0;
  for (let i = 0; i <= n; i++) {
    const s = i * h, t = k * s * s, w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
    x += w * Math.cos(t); y += w * Math.sin(t);
  }
  return { x: x * h / 3, y: y * h / 3, theta: k * l * l };
}

/**
 * Everything section 2 names, for deviation Δ (degrees), circular radius Rc and transition length Ls (0 = a simple
 * circular curve). When the two spirals use up the whole deviation (Δc ≤ 0) the curve is "transitional throughout"
 * (Fig. 3): Ls is then fixed by Δ and Rc and returned as `Ls`.
 */
export function horizontalCurve(deltaDeg, Rc, Ls = 0) {
  const D = deltaDeg * RAD, R = Rc;
  let ls = Ls, thetaS = ls / (2 * R), throughout = false;
  if (2 * thetaS >= D) { thetaS = D / 2; ls = 2 * R * thetaS; throughout = true; }   // Fig. 3: no circular arc left
  const end = spiralXY(ls, Math.max(ls, 1e-9), R), Xc = end.x, Yc = end.y;
  const S = ls ? Yc - R * (1 - Math.cos(thetaS)) : 0;          // shift (def. 7)
  const K = ls ? Xc - R * Math.sin(thetaS) : 0;                 // T.P. to P.C. along the straight (def. 17)
  const Ts = (R + S) * Math.tan(D / 2) + K;                     // tangent distance (def. 9)
  const Es = (R + S) / Math.cos(D / 2) - R;                     // apex distance (def. 2)
  const DeltaC = Math.max(0, D - 2 * thetaS);                   // central angle of the circular part (def. 40)
  const Lc = R * DeltaC;                                        // circular arc C.T.–T.C. (def. 19)
  const LT = ls ? Xc - Yc / Math.tan(thetaS) : 0;              // long tangent (def. 6)
  const ST = ls ? Yc / Math.sin(thetaS) : 0;                    // short tangent (def. 8)
  const LC = Math.hypot(Xc, Yc);                                // long chord T.P.–C.T. (def. 5)
  const alphaC = ls ? Math.atan2(Yc, Xc) : 0;                   // polar deflection to C.T. (def. 33)
  return { delta: D, deltaDeg, R, Ls: ls, throughout, thetaS, Xc, Yc, S, K, Ts, Es, DeltaC, Lc, LT, ST, LC, alphaC,
    betaC: thetaS - alphaC, length: 2 * ls + Lc, intersectionDeg: 180 - deltaDeg };
}

/** Key points and a dense polyline of the curve in the plan frame (P.I. at the origin). */
export function layout(c, step = 1) {
  const h1 = c.delta / 2, u1 = [Math.cos(h1), Math.sin(h1)], n1 = [Math.sin(h1), -Math.cos(h1)];   // heading and right-normal
  const TP = [-c.Ts * u1[0], -c.Ts * u1[1]], PT = [c.Ts * u1[0], -c.Ts * u1[1]];
  const O = [0, -(c.R + c.S) / Math.cos(c.delta / 2)];            // centre of the circular arc
  const onSpiral = l => { const p = spiralXY(l, c.Ls, c.R); return [TP[0] + p.x * u1[0] + p.y * n1[0], TP[1] + p.x * u1[1] + p.y * n1[1]]; };
  const mirror = p => [-p[0], p[1]];
  const pts = [];
  const nS = Math.max(2, Math.ceil(c.Ls / step)), nC = Math.max(2, Math.ceil(c.Lc / step));
  for (let i = 0; i <= nS && c.Ls > 0; i++) pts.push(onSpiral(c.Ls * i / nS));
  const a0 = Math.PI / 2 + c.DeltaC / 2;                          // arc from C.T. (left) to T.C. (right) about O
  for (let i = c.Ls > 0 ? 1 : 0; i <= nC && c.Lc > 0; i++) { const a = a0 - c.DeltaC * i / nC; pts.push([O[0] + c.R * Math.cos(a), O[1] + c.R * Math.sin(a)]); }
  if (c.Ls > 0) for (let i = nS - 1; i >= 0; i--) pts.push(mirror(onSpiral(c.Ls * i / nS)));
  const CT = c.Ls ? onSpiral(c.Ls) : TP, TC = mirror(CT);
  const PC = [TP[0] + c.K * u1[0], TP[1] + c.K * u1[1]];          // foot of the shifted circle's P.C. on the straight
  const mid = [0, -c.Es];
  return { TP, PT, PI: [0, 0], O, CT, TC, PC, mid, pts, onSpiral, u1, n1 };
}

// ponytail: Simpson with 64 panels is exact to < 1 mm for Ls ≤ 300 m; raise n if longer spirals ever appear.
