// Shared kit for the IRC : 24-2010 chapter books: steel bridge parts in page centimetres, card text helpers, and
// spread(), which wraps one model + one readout card + chips + an optional slide handle into the engine's spread contract.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, tagged, wrapText } from '@engine/util.js';
import { SM } from '@engine/scene.js';
import { diorama, MAT } from '../_irc38/site.js';

export const F = 'Inter, Segoe UI, Arial', INK = '#231a14', OXIDE = '#8a3f1c', DIMC = '#5c6168', OK = '#1f7a45', BAD = '#b3362b';
export const OXIDE_HEX = 0x9a4c33;
export const paint = (color = OXIDE_HEX, rough = .5, metal = .3) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
export const STEEL = paint();
export const TAG = { h: .7, color: INK, bg: 'rgba(255,253,248,.92)', weight: 700 };
export const DARK = new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: .8 });
/** An upright cylinder mesh. */
export function cyl(r, h, mat, x = 0, y = 0, z = 0, seg = 18) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; return m;
}
/** The cover every chapter after the first shares: an I-section with the chapter's motto under it, and an I-beam on the projector. */
export const cover = motto => ({
  coverMark(ctx, W) {
    const k = W / 1040, cx = W / 2, cy = 800 * k;
    ctx.fillStyle = OXIDE; ctx.fillRect(cx - 190 * k, cy - 250 * k, 380 * k, 46 * k); ctx.fillRect(cx - 190 * k, cy + 204 * k, 380 * k, 46 * k); ctx.fillRect(cx - 17 * k, cy - 204 * k, 34 * k, 408 * k);
    ctx.font = '700 ' + 36 * k + 'px Georgia, serif'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(motto, cx, cy + 330 * k); ctx.textAlign = 'left';
  },
  coverHolo({ holo }) {
    const g = new THREE.Group(), up = new THREE.Group(), m = paint(); up.position.y = 2.2;
    up.add(box(9, .5, 3.4, m, 0, -2, 0), box(9, 3.5, .34, m), box(9, .5, 3.4, m, 0, 2, 0));
    g.add(holo.projector(9), up); g.userData.up = up;
    return g;
  },
});

/** A box mesh. seg > 1 cuts it along x and keeps the rest shape, so bend() can sag it. */
export function box(w, h, d, mat, x = 0, y = 0, z = 0, seg = 1) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d, seg, 1, 1), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  if (seg > 1) m.userData.base = m.geometry.attributes.position.array.slice();
  return m;
}
/** Move every segmented box under root vertically by f(x), x along the span in root's own frame. */
export function bend(root, f) {
  root.traverse(o => {
    const b = o.userData.base; if (!b) return;
    const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, b[i * 3 + 1] + f(b[i * 3] + o.position.x));
    p.needsUpdate = true; o.geometry.computeVertexNormals();
  });
}
/** Stand a bridge on the slab: over the river, enlarged to fill the page. */
export function sit(o, z = -5, k = 1.18) { o.position.z = z; o.scale.setScalar(k); return o; }
export function dispose(root) { root.traverse(o => o.geometry?.dispose()); }

/** An arrow along +x; userData.len(L) sets its length (negative points the other way). */
export function arrow(color = 0xc23b2f, r = .08) {
  const a = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 8), m), hd = new THREE.Mesh(new THREE.ConeGeometry(r * 3, r * 6, 10), m);
  sh.rotation.z = -Math.PI / 2; a.add(sh, hd);
  a.userData.len = L => { sh.scale.y = Math.max(.01, Math.abs(L)); sh.position.x = L / 2; hd.position.x = L + Math.sign(L || 1) * r * 3; hd.rotation.z = L >= 0 ? -Math.PI / 2 : Math.PI / 2; a.visible = Math.abs(L) > .03; };
  a.userData.len(1); return a;
}

/** A lorry about 7 units long, scaled by k, facing +x. */
export function truck(k = 1, color = 0xc9a227) {
  const g = new THREE.Group(), i = new THREE.Group(); i.scale.setScalar(k); g.add(i);
  i.add(box(1.5, 1.5, 2.2, paint(color, .45, .2), 2.6, 1.45), box(5, 1.9, 2.3, paint(0xd9d4c8, .7, 0), -.9, 1.75), box(7, .25, 1.6, MAT.band, 0, .7));
  for (const x of [2.6, -1.6, -2.8]) for (const z of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .35, 14), MAT.tyre); w.rotation.x = Math.PI / 2; w.position.set(x, .5, z); w.castShadow = true; i.add(w); }
  return g;
}

function abutments(g, L, H, w) { for (const s of [-1, 1]) g.add(box(1.6, H, w + .6, SM.concrete, s * (L / 2 + .45), H / 2, 0)); }

/**
 * A deck on n plate girders along x between two abutments. L, d (girder depth), gap (girder spacing), H (soffit height)
 * in page cm. Returns { g, span, mat, top, bend(f) }: bend sags the span by f(x); top is the road level above g's base.
 */
export function girderBridge({ L = 18, d = 1.1, n = 3, gap = 1.5, H = 2.4, bf = .5, seg = 36, abut = true } = {}) {
  const g = new THREE.Group(), span = new THREE.Group(), mat = paint(); span.position.y = H + .12; g.add(span);
  const tf = Math.max(.06, d * .07), w = gap * (n - 1) + bf + .9;
  for (let i = 0; i < n; i++) {
    const z = (i - (n - 1) / 2) * gap;
    span.add(box(L, tf, bf, mat, 0, tf / 2, z, seg), box(L, d - 2 * tf, .06, mat, 0, d / 2, z, seg), box(L, tf, bf, mat, 0, d - tf / 2, z, seg));
    for (const s of [-1, 1]) g.add(box(.4, .12, bf, SM.steel, s * (L / 2 - .25), H + .06, z));   // bearings
  }
  span.add(box(L + .5, .22, w, SM.concrete, 0, d + .11, 0, seg), box(L + .5, .08, w - .5, SM.asphalt, 0, d + .26, 0, seg));
  for (const s of [-1, 1]) span.add(box(L + .5, .34, .12, SM.concreteDark, 0, d + .39, s * (w / 2 - .06), seg));
  if (abut) abutments(g, L, H, w);
  return { g, span, mat, L, w, top: H + .12 + d + .3, bend: f => bend(span, f) };
}

/**
 * A through Pratt truss of n panels along x. pose(c) lifts every panel point by c(x), which is how it is cambered or
 * deflected. Returns { g, pose, top }: top is the deck level.
 */
export function truss({ L = 18, h = 3, n = 8, w = 2.6, t = .16, H = 2.4 } = {}) {
  const g = new THREE.Group(), span = new THREE.Group(), mat = paint(), p = L / n, mem = [], cross = []; span.position.y = H + .12; g.add(span);
  const bar = tt => { const m = box(1, tt, tt, mat); span.add(m); return m; };
  for (const z of [-w / 2, w / 2]) {
    for (let i = 0; i < n; i++) mem.push([bar(t * 1.25), [i, 0], [i + 1, 0], z]);                 // bottom chord
    for (let i = 1; i < n - 1; i++) mem.push([bar(t * 1.25), [i, 1], [i + 1, 1], z]);             // top chord
    mem.push([bar(t * 1.25), [0, 0], [1, 1], z], [bar(t * 1.25), [n, 0], [n - 1, 1], z]);         // end rakers
    for (let i = 1; i < n; i++) mem.push([bar(t), [i, 0], [i, 1], z]);                            // verticals
    for (let i = 1; i < n - 1; i++) { const left = i < n / 2; mem.push([bar(t * .8), left ? [i, 1] : [i, 0], left ? [i + 1, 0] : [i + 1, 1], z]); }   // diagonals, falling to mid-span
    for (const s of [-1, 1]) g.add(box(.4, .12, .4, SM.steel, s * (L / 2 - .2), H + .06, z));
  }
  for (let i = 0; i <= n; i++) { const m = box(t, t, w, mat); span.add(m); cross.push([m, [i, 0]]); }                 // cross girders
  for (let i = 1; i < n; i++) { const m = box(t * .8, t * .8, w, mat); span.add(m); cross.push([m, [i, 1]]); }        // top lateral struts
  const deck = box(L, .1, w - .4, SM.asphalt, 0, t + .05, 0, n * 3); span.add(deck);
  abutments(g, L, H, w);
  const pose = c => {
    const P = ([i, top]) => { const x = i * p - L / 2; return [x, (top ? h : 0) + c(x)]; };
    for (const [m, a, b, z] of mem) { const [ax, ay] = P(a), [bx, by] = P(b); m.position.set((ax + bx) / 2, (ay + by) / 2, z); m.scale.x = Math.hypot(bx - ax, by - ay); m.rotation.z = Math.atan2(by - ay, bx - ax); }
    for (const [m, a] of cross) { const [x, y] = P(a); m.position.set(x, y, 0); }
    bend(span, c);
  };
  pose(() => 0);
  return { g, span, mat, L, h, pose, top: H + .12 + t + .1 };
}

// ---- card text helpers (logical pixels; a 9.6 cm card is about 442 px wide)
export const head = (c, t) => { c.fillStyle = OXIDE; c.font = `700 15px ${F}`; c.fillText(t, 18, 28); };
export const foot = (c, H, t, col = DIMC) => { c.fillStyle = col; c.font = `500 12.5px ${F}`; c.fillText(t, 18, H - 15); };
/** Wrapped body text; returns the y of the next line. */
export function lines(c, text, x, y, maxW, lh = 20, col = INK, font = `500 15px ${F}`) {
  c.fillStyle = col; c.font = font; for (const l of wrapText(c, text, maxW)) { c.fillText(l, x, y); y += lh; } return y;
}
/** Label left, value right, one per row. rows: [label, value, colour?] */
export function kv(c, W, rows, y = 60, dy = 29) {
  rows.forEach(([a, b, col], i) => { const yy = y + i * dy; c.textAlign = 'left'; c.fillStyle = DIMC; c.font = `500 14px ${F}`; c.fillText(a, 18, yy); c.textAlign = 'right'; c.fillStyle = col || INK; c.font = `700 15px ${F}`; c.fillText(b, W - 18, yy); });
  c.textAlign = 'left'; return y + rows.length * dy;
}

const CAM = { tilt: .7, pos: [4.6, 26, 40], look: [4.6, 2.6, -1], portrait: { pos: [15, 50, 56], look: [12.3, 1, -3] } };

/**
 * One spread. def:
 *   init     starting state (also what Reset returns to)
 *   model    ({ ctx, holo, group, st, anims, say }) → { place(), update?(dt, t), debug?() }; place() redraws from st
 *   draw     (c, W, H, st) draws the readout card from st alone
 *   chips    [[key, values, value → label], …] one chip per value
 *   extra    ({ st, place, say }) → more actions
 *   slider   { key, name, label, values, at } a lever that steps st[key] through values, plus − / + chips
 *   river    true puts a river across the slab, for the spreads that stand a bridge on it
 *   steps    the guided steps (title, text, check)
 */
export function spread({ cam = CAM, init, model, draw, chips = [], extra, steps, slider, river = false, card: cs = [9.6, 6.8] }) {
  return {
    cam,
    build(ctx) {
      const { holo } = ctx, anims = new Anims(), group = new THREE.Group(), st = { ...init };
      group.add(diorama({ x0: -12.6, x1: 12.6, z0: -14, z1: 4, h: .5 }));
      if (river) { const w = box(9, .05, 17.9, paint(0x6f9fb8, .2, .1), 0, .52, -5); w.castShadow = false; group.add(w); }
      let guide = null; const say = t => guide?.say(t);
      const m = model({ ctx, holo, group, st, anims, say });
      const card = textPlane({ w: cs[0], h: cs[1], px: 46, draw: (c, W, H) => { cardBg(c, W, H, { stroke: 'rgba(138,63,28,.85)' }); c.textAlign = 'left'; draw(c, W, H, st); } });
      card.position.set(5.1, 2.7, 10.6); card.rotation.x = -.6; card.userData.zoom = true; group.add(card);
      const place = () => { m.place(); card.redraw(); };
      let actions = chips.flatMap(([key, vals, fmt]) => vals.map(v => ({ label: fmt(v), toggle: () => st[key] === v, run: () => { st[key] = v; place(); } })));
      if (extra) actions = actions.concat(extra({ st, place, say }));
      let knob = null, grip = null;
      const V = slider?.values, at = () => Math.max(0, V.indexOf(st[slider.key]));
      const go = i => { const v = V[Math.max(0, Math.min(V.length - 1, i))]; if (v !== st[slider.key]) { st[slider.key] = v; place(); } };
      if (slider) {
        knob = holo.handle(slider.key, { label: slider.label, kind: 'lever', r: .8 }); knob.position.set(...(slider.at || [-7.5, .5, -1])); group.add(knob);
        actions.push({ label: `${slider.name} −`, run: () => go(at() - 1) }, { label: `${slider.name} +`, run: () => go(at() + 1) });
      }
      const api = {
        group, targets: knob ? [knob] : [], actions, dragPlane: 'xz',
        press(hit) { grip = knob && tagged(hit.object, 'handle') ? at() : null; knob?.userData.setHot(grip != null); },
        drag({ dx }) { if (grip != null) go(grip + Math.round(dx / 26)); },
        release() { grip = null; knob?.userData.setHot(false); },
        tap(hit) { guide.tap(hit); },
        update(dt, t) {
          anims.tick(dt); m.update?.(dt, t);
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          card.position.x = tall ? 3.6 : 5.1; card.scale.setScalar(tall ? .82 : 1);
        },
        reset() { anims.clear(); Object.assign(st, init); place(); guide.reset(); },
        get debug() { return { ...st, ...(m.debug?.() || {}), guide: guide.debug }; },
      };
      api.a11y = actions.map(a => ({ label: a.label, run: a.run }));
      const all = actions.map(a => a.label);
      guide = makeGuide(ctx, { anchor: [-5.4, 2.2, 10.5], w: 10, h: 5, steps: steps.map(s => ({ show: all, ...s })) });
      guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card, card); api.guide = guide; api.actions = guide.wrap(api.actions);
      place();
      return api;
    },
  };
}
