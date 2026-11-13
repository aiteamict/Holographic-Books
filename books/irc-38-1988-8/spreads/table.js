// One spread per design table (Appendices 2–5). The site model shows the curve the chips have picked, set out with pegs
// (and a theodolite with its sight lines where the table is for setting out); the card sets the printed table beside
// the exact formula and flags the cells confirmed as misprints on the page.
//
// cfg = { state, actions(st, refresh) → [{ label, run, toggle? }], curve(st) → [Δ°, Rc, Ls],
//         pegs?(st, L, k) → { pts: [[x, y]], at: index|null }, card(c, W, H, st), steps, debug(st), size? }
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { horizontalCurve } from '../../_irc38/curve.js';
import { makePlan } from '../../_irc38/plan.js';
import { diorama, trees, makeRoad, throughSlab, theodolite } from '../../_irc38/site.js';

export const F = 'Inter, Segoe UI, Arial';
const GROUND = .5, SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };
export const DEG = 180 / Math.PI;
export const dms = (d, p = 0) => { const s = Math.abs(d) * 3600, a = Math.floor(s / 3600 + 1e-9), m = Math.floor((s - a * 3600) / 60 + 1e-9), r = s - a * 3600 - m * 60; return `${a}°${m}′${r.toFixed(p)}″`; };

/** Card header: a kicker line and up to three lines of results. Returns the y below. */
export function head(c, W, kicker, lines) {
  c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 15px ${F}`; c.fillText(kicker, 16, 24);
  let y = 46; c.font = `600 14px ${F}`; c.fillStyle = '#14202b';
  for (const l of lines) { c.fillText(l, 16, y); y += 19; }
  return y + 4;
}
/** A small table: cols = [{ h, w }] (w = right edge as a fraction of the width), rows = [[cell]]; a cell is a string or
 *  { t, bad } (bad: printed value confirmed wrong, drawn red). sel = index of the highlighted row. */
export function table(c, W, y, cols, rows, { sel = -1, rh = 19, size = 13 } = {}) {
  const x = f => 16 + f * (W - 32);
  c.font = `600 11px ${F}`; c.fillStyle = '#5c6168'; c.textAlign = 'right';
  cols.forEach(col => c.fillText(col.h, x(col.w), y)); y += 6;
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(16, y, W - 32, 1.5); y += 4;
  rows.forEach((r, i) => {
    if (i === sel) { c.fillStyle = 'rgba(29,95,135,.12)'; c.fillRect(16, y, W - 32, rh); }
    r.forEach((cell, j) => {
      const t = typeof cell === 'object' && cell ? cell.t : cell ?? '—', bad = typeof cell === 'object' && cell?.bad;
      c.font = `${bad || j === 0 ? 700 : 500} ${size}px ${F}`; c.fillStyle = bad ? '#b3362b' : j === 0 ? '#14202b' : '#2b3036';
      c.fillText(String(t), x(cols[j].w), y + rh - 5);
    });
    y += rh;
  });
  c.textAlign = 'left'; return y + 4;
}
/** Grey footnote lines from the bottom of the card. */
export function foot(c, W, H, lines, color = '#5c6168') {
  c.textAlign = 'left'; c.font = `500 12px ${F}`; c.fillStyle = color;
  lines.forEach((l, i) => c.fillText(l, 16, H - 10 - (lines.length - 1 - i) * 16));
}

export function tableSpread(cfg) {
  return {
    cam: cfg.cam || { pos: [3, 41, 37], look: [3.5, 0, -2], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const st = structuredClone(cfg.state);
      const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
      const forest = trees(slab, 34, 43); group.add(forest);
      let plan = null, road = null;
      // set-out kit: a pool of pegs, the theodolite and its sight lines
      const pegMat = new THREE.MeshStandardMaterial({ color: 0xb0532a, roughness: .5 });
      const pool = Array.from({ length: 12 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.1, .13, .9, 8), pegMat); m.castShadow = true; group.add(m); return m; });
      const theo = theodolite(.9); group.add(theo);
      const rays = holo.segments([[0, 0, 0], [1, 0, 0]], holo.AMBER, .85, { width: .05 }); group.add(rays);

      const size = cfg.size || { w: 10, h: 7.6, px: 46 };
      const card = textPlane({ ...size, draw: (c, W, H) => { cardBg(c, W, H); cfg.card(c, W, H, st); } });
      card.position.set(5.1, 2.9 + Math.max(0, size.h - 7.6) * .42, 10.3); card.rotation.x = -.6; group.add(card);   // taller cards rise so their foot stays above the page

      function refresh() {
        const k = horizontalCurve(...cfg.curve(st));
        const S = Math.min(.14, 19 / (2 * k.Ts * Math.cos(k.delta / 2) + 40), 15 / (k.Es + k.Ts * Math.sin(k.delta / 2) * .3 + 30));
        if (plan) group.remove(plan.group); if (road) group.remove(road.group);
        plan = makePlan({ s: S, origin: [0, GROUND, -9 + Math.min(6, k.Es * S * .5)], ext: 0, show: { ribbon: false, radii: false, centre: false } }); group.add(plan.group);
        road = makeRoad(plan.P, S); group.add(road.group);
        plan.set(k); const through = throughSlab(plan.L, plan.P, SLAB); road.set(through.pts, { stones: [through.e1, through.e1 + k.length], side: 1 });
        const near = through.pts.filter((_, i) => i % 3 === 0).map(p => plan.P(p));
        forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.1));
        const pg = cfg.pegs?.(st, plan.L, k);
        pool.forEach((m, i) => { const q = pg?.pts[i]; m.visible = !!q; if (q) m.position.copy(plan.P(q, .45)); });
        theo.visible = rays.visible = pg?.at != null;
        if (pg?.at != null) {
          const o = pg.pts[pg.at]; theo.position.copy(plan.P(o, 0));
          const seg = []; pg.pts.forEach((q, i) => { if (i !== pg.at) seg.push(plan.P(o, 1.4), plan.P(q, .9)); });
          holo.setPoints(rays, seg);
        }
        card.redraw();
      }
      const actions = cfg.actions(st, refresh);
      const api = {
        group, targets: [], actions,
        tap(hit) { guide.tap(hit); },
        a11y: actions.map(a => ({ label: a.label, run: a.run })),
        update(dt) {
          anims.tick(dt);
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          card.position.x = tall ? 3.5 : 5.1; card.scale.setScalar(tall ? .8 : 1);
        },
        reset() { anims.clear(); Object.assign(st, structuredClone(cfg.state)); refresh(); guide.reset(); },
        get debug() { return { ...cfg.debug(st), guide: guide.debug }; },
      };
      const L = actions.map(a => a.label);
      const guide = makeGuide(ctx, { anchor: [-5.4, 2.2, 10.5], w: 10, h: 5, steps: cfg.steps.map(s => ({ show: L, ...s })) });
      guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
      card.userData.zoom = true; api.targets.push(card);
      refresh();
      return api;
    },
  };
}

/** Step through a list with − and + chips: returns two actions. */
export const stepper = (name, get, set, n, refresh) => [
  { label: `${name} −`, run: () => { set(Math.max(0, get() - 1)); refresh(); } },
  { label: `${name} +`, run: () => { set(Math.min(n - 1, get() + 1)); refresh(); } },
];
