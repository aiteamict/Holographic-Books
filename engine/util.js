import * as THREE from 'three';

/** Rounded rectangle as a point list centred on the origin (y down, like the plate drawings). */
export function roundedRectPts(w, h, r, n = 5) {
  const pts = [], hw = w / 2, hh = h / 2;
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (Math.PI / 2) * i / n; pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }); } };
  corner(hw - r, -hh + r, -Math.PI / 2); corner(hw - r, hh - r, 0); corner(-hw + r, hh - r, Math.PI / 2); corner(-hw + r, -hh + r, Math.PI);
  return pts;
}

export function wrapText(ctx, text, maxW) {
  const out = []; let line = '';
  for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out;
}

/** A card: a plane with a canvas you can redraw. w, h in cm; px per cm. */
const SS = 2;   // supersample: the canvas holds 2× the logical pixels; draw callbacks still see the logical W × H
export function textPlane({ w, h, px = 44, draw }) {
  const W = Math.round(w * px), H = Math.round(h * px);
  const c = document.createElement('canvas'); c.width = W * SS; c.height = H * SS;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  m.renderOrder = 3;
  m.redraw = fn => { const ctx = c.getContext('2d'); ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.clearRect(0, 0, W, H); (fn || draw)(ctx, W, H); tex.needsUpdate = true; };
  m.redraw(); return m;
}

/** Glass card background for textPlane draws. */
export function cardBg(ctx, w, h, { stroke = 'rgba(29,95,135,.85)', fill = 'rgba(255,253,248,.96)' } = {}) {
  ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(2, 2, w - 4, h - 4, 14); ctx.fill(); ctx.stroke();
}

/** Walk up from a hit object to the first ancestor carrying userData[key]. */
export function tagged(obj, key) { let o = obj; while (o) { if (o.userData && key in o.userData) return o; o = o.parent; } return null; }

/** A small arrowhead (two strokes and a base) at `to`, pointing from `from`; flat (XZ) or upright (XY). */
export function arrowHead(from, to, size = .8) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), d = b.clone().sub(a).normalize();
  const flat = Math.abs(d.y) < 1e-6; const n = flat ? new THREE.Vector3(-d.z, 0, d.x) : new THREE.Vector3(-d.y, d.x, 0);
  const base = b.clone().sub(d.clone().multiplyScalar(size * 1.6));
  const l = base.clone().add(n.clone().multiplyScalar(size)), r = base.clone().sub(n.clone().multiplyScalar(size));
  return [b, l, b, r, l, r];
}
