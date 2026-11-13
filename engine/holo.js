// Hologram helpers in drafting ink: thick lines, tinted glass, labels, the projector ring. Light theme: normal blending, no bloom.
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

// light theme: drafting inks. CYAN is the main line ink (deep blue), WHITE the near-black construction ink.
export const CYAN = 0x1d5f87, AMBER = 0xb0532a, GREEN = 0x2f8f55, RED = 0xc23b2f, WHITE = 0x262b31, DIM = 0x8b959e;

// ---- line materials (shared, resolution-aware) ---------------------------------------------------
const RES = new THREE.Vector2(1, 1);
const lineMats = new Map();
export let thick = true;                       // quality tiers may switch to 1px lines
export function setThickLines(v) { thick = v; }
export function setResolution(w, h) { RES.set(w, h); for (const m of lineMats.values()) if (m.isLineMaterial) m.resolution.copy(RES); }

export function lineMat(color = CYAN, opacity = .95, width = .1, dashed = false) {
  const k = [thick, color, opacity, width, dashed].join(':');
  if (!lineMats.has(k)) {
    const m = thick
      ? new LineMaterial({ color, linewidth: width, worldUnits: true, transparent: true, opacity, depthWrite: false, toneMapped: false, dashed, dashSize: .9, gapSize: .6, alphaToCoverage: false })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, toneMapped: false });
    if (m.isLineMaterial) m.resolution.copy(RES);
    m.userData.fade = true;
    lineMats.set(k, m);
  }
  return lineMats.get(k);
}

const toV3 = p => p instanceof THREE.Vector3 ? p : Array.isArray(p) ? new THREE.Vector3(...p) : new THREE.Vector3(p.x, p.y, p.z ?? 0);
const flat = v => { const a = new Float32Array(v.length * 3); v.forEach((p, i) => { a[i * 3] = p.x; a[i * 3 + 1] = p.y; a[i * 3 + 2] = p.z; }); return a; };

/** points: [{x,y,z}|Vector3|[x,y,z]] → a thick line. opts: closed, opacity, width, dashed */
export function polyline(points, color = CYAN, { closed = false, opacity, width = .1, dashed = false } = {}) {
  const v = points.map(toV3); if (closed) v.push(v[0].clone());
  let l;
  if (thick) { const g = new LineGeometry(); g.setPositions(flat(v)); l = new Line2(g, lineMat(color, opacity, width, dashed)); l.computeLineDistances(); }
  else l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(v), lineMat(color, opacity));
  l.renderOrder = 2; l.userData.points = v.length; return l;
}
/** flat array of points, two per segment */
export function segments(points, color = CYAN, opacity, { width = .08, dashed = false } = {}) {
  const v = points.map(toV3);
  let l;
  if (thick) { const g = new LineSegmentsGeometry(); g.setPositions(flat(v)); l = new LineSegments2(g, lineMat(color, opacity, width, dashed)); l.computeLineDistances(); }
  else l = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(v), lineMat(color, opacity));
  l.renderOrder = 2; l.userData.points = v.length; return l;
}
/** Replace a line's points in place (thick or 1 px). */
export function setPoints(line, points) {
  const v = points.map(toV3);
  if (line.geometry.setPositions) { line.geometry.setPositions(flat(v)); line.computeLineDistances(); }
  else if (line.geometry.attributes.position?.count !== v.length) { line.geometry.dispose(); line.geometry = new THREE.BufferGeometry().setFromPoints(v); }   // 1 px lines cannot grow in place
  else { line.geometry.setFromPoints(v); line.geometry.attributes.position.needsUpdate = true; }
  line.userData.points = v.length;
}
/** Reveal a line progressively: t in 0..1 */
export function reveal(line, t) {
  const k = THREE.MathUtils.clamp(t, 0, 1), n = line.userData.points || line.geometry.attributes.position?.count || 0;
  if (line.isLine2) line.geometry.instanceCount = Math.max(0, Math.round((n - 1) * k));
  else if (line.isLineSegments2) line.geometry.instanceCount = Math.max(0, Math.round(n / 2 * k));
  else line.geometry.setDrawRange(0, Math.round(n * k));
}

// ---- glass -----------------------------------------------------------------------------------------
/** Translucent hologram fill with a fresnel rim and drifting scanlines. */
export function glassMat(color = CYAN, { opacity = .18, scan = 1 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uTime: { value: 0 }, uScan: { value: scan } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){ vec4 wp = modelMatrix * vec4(position,1.); vW = wp.xyz; vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity, uTime, uScan; varying vec3 vN, vV, vW;
      void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.2);
        float s = .75 + .25 * sin(vW.y * 9. - uTime * 2.) * uScan;
        gl_FragColor = vec4(uColor, clamp((uOpacity * .9 + f * .22) * s, 0., 1.)); }`,   // a tint of the ink, a little stronger at the rim
    transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
  });
}
export const tickGlass = (root, t) => root.traverse(o => { if (o.material?.uniforms?.uTime) o.material.uniforms.uTime.value = t; });

/**
 * Any geometry as a hologram prop: glass fill + glowing edges. Returns a Group you position yourself.
 * opts: color, fill (opacity, 0 = none), width (line), angle (EdgesGeometry threshold)
 */
export function wire(geometry, color = CYAN, { fill = .1, width = .07, angle = 20, opacity = .85 } = {}) {
  const g = new THREE.Group();
  if (fill > 0) { const m = new THREE.Mesh(geometry, glassMat(color, { opacity: fill, scan: .8 })); m.renderOrder = 1; g.add(m); }
  const e = new THREE.EdgesGeometry(geometry, angle);
  let l;
  if (thick) { const lg = new LineSegmentsGeometry(); lg.setPositions(e.attributes.position.array); l = new LineSegments2(lg, lineMat(color, opacity, width)); l.computeLineDistances(); }
  else l = new THREE.LineSegments(e, lineMat(color, opacity));
  l.renderOrder = 2; g.add(l); g.userData.edges = l; return g;
}
export const wireBox = (w, h, d, color, o) => wire(new THREE.BoxGeometry(w, h, d), color, o);
export const wireCyl = (r, h, color, seg = 16, o) => wire(new THREE.CylinderGeometry(r, r, h, seg), color, { angle: 30, ...o });

// ---- labels, rings, dimensions ----------------------------------------------------------------------
/** A text label that always faces the camera. h = height in world units (cm). */
let LABEL_K = 1;
/** Scale every label made from now on (phone layout 2 draws them larger: the scene is smaller on screen). */
export function setLabelScale(k) { LABEL_K = k; }
export function label(text, { h = 1.3, color = '#1f2328', bg = null, weight = 600, align = 'center' } = {}) {
  // drawn at 160 px and shown at ~30 px: always more texels than screen pixels, no mipmaps, tone-mapped so it never blooms
  const px = 160, pad = 36, c = document.createElement('canvas'), ctx = c.getContext('2d');
  const lines = String(text).split('\n');
  const font = `${weight} ${px}px Inter, "Segoe UI", Arial, sans-serif`;
  ctx.font = font;
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + pad * 2, lh = px * 1.2;
  c.width = Math.ceil(w); c.height = Math.ceil(lh * lines.length + pad);
  ctx.font = font; ctx.textBaseline = 'top'; ctx.textAlign = align;
  if (bg) { ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(0, 0, c.width, c.height, 28); ctx.fill(); }
  else { ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(255,253,248,.95)'; /* a paper halo keeps ink legible over lines */ ctx.lineJoin = 'round'; const x0 = align === 'center' ? c.width / 2 : align === 'left' ? pad : c.width - pad; lines.forEach((l, i) => ctx.strokeText(l, x0, pad / 2 + i * lh)); }
  ctx.fillStyle = color;
  const x = align === 'center' ? c.width / 2 : align === 'left' ? pad : c.width - pad;
  lines.forEach((l, i) => ctx.fillText(l, x, pad / 2 + i * lh));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;   // mipmapped: labels are drawn large and minified, so trilinear + anisotropic sampling is the clean path
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  const H = h * lines.length * LABEL_K; sp.scale.set(H * c.width / c.height, H, 1); sp.renderOrder = 5;
  sp.userData.setText = t => { const n = label(t, { h, color, bg, weight, align }); sp.material.map.dispose(); sp.material.map = n.material.map; sp.scale.copy(n.scale); };
  return sp;
}

/** The projector disc the hologram stands on: a ring, a faint grid, a glow. r in cm. */
export function projector(r = 14, color = CYAN) {
  const g = new THREE.Group();
  const ring = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2; ring.push([Math.cos(a) * r, 0, Math.sin(a) * r]); }
  g.add(polyline(ring, color, { opacity: .8, width: .12 }));
  const grid = [], step = r / 5;
  for (let i = -5; i <= 5; i++) { const d = i * step, h = Math.sqrt(Math.max(0, r * r - d * d)); grid.push([d, 0, -h], [d, 0, h], [-h, 0, d], [h, 0, d]); }
  g.add(segments(grid, color, .14, { width: .04 }));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .05, depthWrite: false, toneMapped: false }));
  disc.material.userData.fade = true; disc.rotation.x = -Math.PI / 2; disc.position.y = .02; g.add(disc);
  return g;
}

/** A flat ring (XZ) — marker discs, highlight halos. */
export function ring(r, color = AMBER, { width = .1, opacity = .9 } = {}) {
  const pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2; pts.push([Math.cos(a) * r, 0, Math.sin(a) * r]); }
  return polyline(pts, color, { opacity, width });
}

/**
 * A grab handle on the page: amber ring, stem and knob, a label below. Raycast target; `userData.handle` names it.
 * kind: 'knob' (tap), 'dial' (drag sideways to step), 'lever' (drag to set). The spread decides what it does.
 */
export function handle(name, { label: text = '', kind = 'knob', r = 1.1 } = {}) {
  const g = new THREE.Group(); g.userData.handle = name; g.userData.kind = kind;
  g.add(ring(r, AMBER, { width: .12 }));
  const ticks = []; for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; ticks.push([Math.cos(a) * (r + .3), 0, Math.sin(a) * (r + .3)], [Math.cos(a) * (r + .9), 0, Math.sin(a) * (r + .9)]); }
  g.add(segments(ticks, AMBER, .7, { width: .06 }));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, 1.6, 10), new THREE.MeshBasicMaterial({ color: 0xffb060, toneMapped: false })); stem.position.y = .8; g.add(stem);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.42, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffc27a, toneMapped: false })); knob.position.y = 1.8; g.add(knob);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(r + 1, 32), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); pad.rotation.x = -Math.PI / 2; g.add(pad);   // fat hit area
  if (kind === 'dial') { const arc = []; for (let i = -6; i <= 6; i++) { const a = Math.PI / 2 + i * .12; arc.push([Math.cos(a) * (r + 1.3), .05, Math.sin(a) * (r + 1.3)]); } g.add(polyline(arc, AMBER, { opacity: .6, width: .06 })); }
  if (text) { const l = label(text, { h: .9, color: '#9a4a22' }); l.position.set(0, .35, r + 1.9); g.add(l); }
  g.userData.setHot = hot => { knob.scale.setScalar(hot ? 1.3 : 1); stem.material.color.setHex(hot ? 0xffe0a0 : 0xffb060); };
  return g;
}

/**
 * The one label style for the diagrams: a dot on the thing, a leader, a card with the text. offset is where the card
 * goes relative to the anchor; the card is pushed outward so the leader meets its near edge.
 */
export function tag(text, anchor, offset, { color = '#1f2328', h = .9, accent = CYAN } = {}) {
  const g = new THREE.Group(); const a = toV3(anchor).clone(), o = toV3(offset), p = a.clone().add(o);
  const l = label(text, { h, color, bg: 'rgba(255,253,248,.95)' });
  const push = new THREE.Vector3(Math.sign(o.x) * l.scale.x / 2, 0, 0); l.position.copy(p).add(push);
  g.add(polyline([a, p], accent, { opacity: .75, width: .045 }));
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 6), new THREE.MeshBasicMaterial({ color: accent, toneMapped: false })); dot.position.copy(a); g.add(dot);
  g.add(l); g.userData.label = l; return g;
}

/** A titled rectangular frame on the XY plane (for insets). */
export function frame(w, h, title, color = CYAN) {
  const g = new THREE.Group();
  g.add(polyline([[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [w / 2, h / 2, 0], [-w / 2, h / 2, 0]], color, { closed: true, width: .06, opacity: .7 }));
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xfffdf8, transparent: true, opacity: .88, depthWrite: false, toneMapped: false })); back.position.z = -.02; g.add(back);
  if (title) { const l = label(title.toUpperCase(), { h: .7, color: '#1d5f87' }); l.position.set(-w / 2 + l.scale.x / 2 + .2, h / 2 + .65, 0); g.add(l); }
  return g;
}

/** A flat band on the page (XZ) marking a zone along z: from z0 to z1 at x, width w. */
export function zone(x, z0, z1, w, color = GREEN, opacity = .07) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, Math.abs(z1 - z0)), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: Math.min(1, opacity * 2.2), depthWrite: false, toneMapped: false }));
  m.material.userData.fade = true;
  m.rotation.x = -Math.PI / 2; m.position.set(x, .03, (z0 + z1) / 2);
  const g = new THREE.Group(); g.add(m, segments([[x - w / 2, .04, z0], [x + w / 2, .04, z0], [x - w / 2, .04, z1], [x + w / 2, .04, z1]], color, .8, { width: .05 }));
  return g;
}

/** Outline of a 2-D point list (plate coordinates, y down) lifted into 3-D on the XY plane. */
export function outline(points2d, color = CYAN, { scale = 1, flipY = true, closed = true, z = 0, width = .1 } = {}) {
  return polyline(points2d.map(p => [p.x * scale, (flipY ? -p.y : p.y) * scale, z]), color, { closed, width });
}

/** Dimension line between two points with end ticks and a label, like a drawing. */
export function dimension(a, b, text, { color = AMBER, tick = .8, h = 1.6, offset = [0, 0, 0] } = {}) {
  const A = toV3(a).clone().add(toV3(offset)), B = toV3(b).clone().add(toV3(offset));
  const dir = B.clone().sub(A).normalize();
  let n = Math.abs(dir.z) < 1e-6 ? new THREE.Vector3(-dir.y, dir.x, 0) : new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
  if (n.lengthSq() < 1e-9) n.set(1, 0, 0);
  n.normalize().multiplyScalar(tick);
  const g = new THREE.Group();
  g.add(segments([A, B, A.clone().add(n), A.clone().sub(n), B.clone().add(n), B.clone().sub(n)], color, .9, { width: .05 }));
  const l = label(text, { h, color: '#' + new THREE.Color(color).getHexString() }); l.position.copy(A).lerp(B, .5).add(n.clone().multiplyScalar(2.2)); g.add(l);
  return g;
}

/** A filled polygon (XY plane) from 2-D points, as hologram glass. */
export function fillPoly(points2d, color = CYAN, { scale = 1, flipY = true, opacity = .14 } = {}) {
  const sh = new THREE.Shape(points2d.map(p => new THREE.Vector2(p.x * scale, (flipY ? -p.y : p.y) * scale)));
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), glassMat(color, { opacity, scan: .6 })); m.renderOrder = 1; return m;
}

/** Fade a hologram group: k in 0..1 scales every additive material's opacity. */
export function setOpacity(root, k) {
  root.traverse(o => {
    const m = o.material; if (!m) return;
    if (m.uniforms?.uOpacity) { m.uniforms.uOpacity.value = (o.userData.baseOpacity ??= m.uniforms.uOpacity.value) * k; return; }
    if (m.transparent && 'opacity' in m && (o.isSprite || m.userData.fade || m.blending === THREE.AdditiveBlending)) m.opacity = (o.userData.baseOpacity ??= m.opacity) * k;
  });
}
