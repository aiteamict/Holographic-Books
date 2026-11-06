// Spread 6 · How heavy? (cl. 6.1–6.3, Table)
// A vehicle from the Table rolls onto a weighbridge over a cut-away pavement. A load column rises over every axle (or
// tandem pair), with the legal limit as a dashed tick; the ticket adds them up. Drag a column up or down to load the
// truck (or use the Load chips); drag the truck to turn it. Past the Table the columns turn red and the pavement
// surface dips harder under each axle.
import * as THREE from 'three';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { makeGuide } from '@engine/guide.js';
import { TYPES, KIND_NAME, INK, CSS, FORM_NAME, makeRig } from '../vehicles.js';

const S = 1.08;                   // world cm per real metre: the 18 m truck-trailer is 19.4 cm long
const GY = 3.2;                   // road surface height; the pavement layers fill 0..GY
const BAR0 = GY + 5.6, K = .3;    // load columns start above the roof (3.8 m = 4.1 cm), 0.3 cm per tonne
const LAYERS = [['surface', .45, 0x5a5f66], ['base', .85, 0x8a6d3b], ['sub-base', 1.0, 0x9c8a63], ['subgrade', .9, 0x7d8a6a]];
const PW = 20.5, PD = 5;          // pavement cut-away, cm
const F = 'Inter, Segoe UI, Arial';
const START = TYPES.findIndex(t => t.id === '3-S2');
const DRIVE_FROM = -24;           // cm: where the truck starts its roll onto the weighbridge
const HIT = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });   // invisible, fat touch areas

export default {
  cam: { pos: [2.5, 37, 43], look: [2.5, 3, 1], portrait: { pos: [15, 62, 54], look: [12.3, -2, 2] } },   // closer and lower than the default: the scene fills the right page
  shots: [
    { pos: [13, 20, 30], look: [13, 9, 0], dur: 1.8, hold: 2.6, text: 'Each column is the load on one axle, or on a tandem pair. The dashed tick is the most the standard allows on it.' },
    { pos: [24, 10, 22], look: [13, 3, 2], dur: 1.8, hold: 2.6, text: 'The cut-away under the truck is the pavement. Overload an axle and the surface dips harder beneath it.' },
  ],
  build(ctx) {
    const { holo, ui, camera } = ctx;
    const group = new THREE.Group();
    const rigRoot = new THREE.Group(); group.add(rigRoot);   // truck, pavement and columns turn together
    const st = { i: START, f: 1, fa: [], yaw: 0, drive: DRIVE_FROM, shown: [], dragged: false };   // fa: load factor per axle (1 = the Table)
    let rig = null, bars = [], barRoot = new THREE.Group(), bowls = null, man = null, turnHit = null, hint = null;
    rigRoot.add(barRoot);

    // ---- the pavement cut-away: four layers, front face toward the reader
    let y = GY;
    for (const [name, t, col] of LAYERS) {
      const b = holo.wireBox(PW, t, PD, col, { fill: .14, width: .04, opacity: .6 }); b.position.set(0, y - t / 2, 0); rigRoot.add(b);
      const l = holo.label(name, { h: .5, color: '#5c6168' }); l.position.set(-PW / 2 + 1.5, y - t / 2, PD / 2 + .1); rigRoot.add(l);
      y -= t;
    }
    const weighDeck = holo.wireBox(PW - 2, .12, PD - .6, holo.CYAN, { fill: .1, width: .05 }); weighDeck.position.y = GY + .06; rigRoot.add(weighDeck);

    const T = () => TYPES[st.i];
    const fa = k => st.fa[k] ?? st.f, worst = () => Math.max(...rig.groups.map((a, k) => fa(k))), anyOver = () => worst() > 1.0001;
    const target = k => +(rig.groups[k].limit * fa(k)).toFixed(1);
    const targets = () => rig.groups.map((a, k) => target(k));

    // ---- the weighbridge ticket
    const ticket = textPlane({ w: 9.8, h: 7.6, px: 50, draw: (c, W, H) => {
      if (!rig) return;                                             // first draw happens before the vehicle exists
      const t = T(), L = targets(), gross = +L.reduce((a, b) => a + b, 0).toFixed(1), over = anyOver();
      cardBg(c, W, H, { stroke: over ? 'rgba(194,59,47,.9)' : 'rgba(42,109,104,.85)' });
      c.textAlign = 'left'; c.fillStyle = '#2a6d68'; c.font = `700 15px ${F}`; c.fillText('WEIGHBRIDGE TICKET · IRC 3-1983, TABLE', 22, 30);
      c.fillStyle = '#1f2328'; c.font = `800 30px ${F}`; c.fillText(t.code === '2' ? t.name : `Type ${t.code}`, 22, 68);
      c.fillStyle = '#5c6168'; c.font = `500 15px ${F}`; c.fillText(FORM_NAME[t.form], 22, 90);
      let yy = 124;
      rig.groups.forEach((a, k) => {
        const bad = L[k] > a.limit + 1e-9;
        c.fillStyle = CSS[a.kind]; c.fillRect(22, yy - 13, 14, 14);
        c.fillStyle = '#1f2328'; c.font = `500 17px ${F}`; c.fillText(`Axle ${k + 1} · ${a.kind === 't' ? 'tandem' : a.kind === 'd' ? 'dual tyres' : 'single tyres'}`, 46, yy);
        c.textAlign = 'right'; c.fillStyle = bad ? CSS.over : '#1f2328'; c.font = `700 17px ${F}`; c.fillText(`${L[k]} t`, W - 120, yy);
        c.fillStyle = '#5c6168'; c.font = `500 15px ${F}`; c.fillText(`of ${a.limit}`, W - 22, yy); c.textAlign = 'left';
        yy += 30;
      });
      c.fillStyle = 'rgba(31,35,40,.25)'; c.fillRect(22, yy - 16, W - 44, 2); yy += 12;
      c.fillStyle = '#1f2328'; c.font = `800 22px ${F}`; c.fillText('Gross', 22, yy);
      c.textAlign = 'right'; c.fillStyle = over ? CSS.over : '#1f2328'; c.fillText(`${gross} t`, W - 120, yy);
      c.fillStyle = '#5c6168'; c.font = `500 15px ${F}`; c.fillText(`of ${t.gross}`, W - 22, yy); c.textAlign = 'left';
      const msg = over ? `OVERLOADED +${+(gross - t.gross).toFixed(1)} t` : 'WITHIN THE TABLE', col = over ? CSS.over : '#2f8f55';
      c.save(); c.translate(W - 150, H - 40); c.rotate(-.06); c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(-128, -22, 256, 40);
      c.fillStyle = col; c.font = `800 18px ${F}`; c.textAlign = 'center'; c.fillText(msg, 0, 5); c.restore();
      c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(over ? `worst axle wears the road ×${(worst() ** 4).toFixed(1)} per pass` : `every axle within the Table`, 22, H - 34);
    } });
    ticket.position.set(5, 2.6, 10.5); ticket.rotation.x = -.6; group.add(ticket);   // cards lie in front of the truck, tilted to the reader: they never hide the columns

    // ---- one load column per axle group: a unit box scaled to the load, so it can grow and shrink smoothly
    function columnBox(a, over) {
      const w = a.kind === 't' ? 2.1 : 1.1;
      return holo.wireBox(w, 1, 1.1, over ? INK.over : INK[a.kind], { fill: over ? .35 : .22, width: .06 });
    }
    function buildBars() {
      rigRoot.remove(barRoot); barRoot = new THREE.Group(); rigRoot.add(barRoot); bars = [];
      rig.groups.forEach((a, k) => {
        const g = new THREE.Group(); g.position.x = a.wx; barRoot.add(g);
        const w = a.kind === 't' ? 2.1 : 1.1, over = false;
        const box = columnBox(a, over); g.add(box);
        g.add(holo.polyline([[-w / 2 - .5, BAR0 + a.limit * K, 0], [w / 2 + .5, BAR0 + a.limit * K, 0]], holo.WHITE, { width: .07, dashed: true }));
        g.add(holo.segments([[0, GY + 4.4, 0], [0, BAR0, 0]], INK[a.kind], .35, { width: .03 }));
        const hit = new THREE.Mesh(new THREE.BoxGeometry(w + 2, 1, 3.5), HIT); hit.userData.axle = k; hit.userData.bar = true; g.add(hit);
        const label = holo.label('0 t', { h: .95, color: CSS[a.kind], weight: 700 }); g.add(label);
        bars.push({ a, g, box, hit, label, over, text: '' });
      });
      // a "drag me" hint over the last column until the reader has dragged once
      hint = holo.label('⇕ drag', { h: .8, color: '#b0532a', weight: 700 }); hint.visible = !st.dragged; bars[bars.length - 1].g.add(hint);
    }
    function placeBars() {
      bars.forEach((b, k) => {
        const v = st.shown[k] ?? 0, h = Math.max(.05, v * K), over = v > b.a.limit + .05;
        if (over !== b.over) { b.g.remove(b.box); b.box = columnBox(b.a, over); b.g.add(b.box); b.over = over; }
        b.box.scale.y = h; b.box.position.y = BAR0 + h / 2;
        b.hit.scale.y = h + 3; b.hit.position.y = BAR0 + h / 2;
        b.label.position.y = BAR0 + h + .9;
        const txt = `${(Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, '')} t`;
        if (txt !== b.text) { b.label.userData.setText(txt); b.text = txt; }
        if (hint && k === bars.length - 1) hint.position.y = BAR0 + h + 2.1;
      });
      // the pavement surface under load: a dip below each axle, deeper with load (drawn on the front face)
      const pts = []; for (let x = -PW / 2; x <= PW / 2; x += .2) {
        let d = 0; rig.groups.forEach((a, k) => { d += .045 * (st.shown[k] ?? 0) * Math.exp(-(((x - (a.wx + rig.group.position.x)) / (a.kind === 't' ? 1.6 : 1.1)) ** 2)); });
        pts.push([x, GY - d, PD / 2 + .02]);
      }
      const red = st.shown.some((v, k) => v > rig.groups[k].limit + .05);
      if (!bowls || bowls.userData.red !== red) { if (bowls) rigRoot.remove(bowls); bowls = holo.polyline(pts, red ? INK.over : holo.CYAN, { width: .09 }); bowls.userData.red = red; rigRoot.add(bowls); }
      else holo.setPoints(bowls, pts);
    }

    // ---- build / rebuild: a new vehicle rolls on from the left
    function setType(i) {
      st.i = (i + TYPES.length) % TYPES.length;
      if (rig) rigRoot.remove(rig.group);
      rig = makeRig(T(), S); rig.group.position.set(DRIVE_FROM, GY, 0); rigRoot.add(rig.group);
      st.drive = DRIVE_FROM; st.shown = rig.groups.map(() => 0); st.fa = rig.groups.map(() => st.f);
      if (turnHit) rigRoot.remove(turnHit);
      turnHit = new THREE.Mesh(new THREE.BoxGeometry(rig.L * S, 4.2 * S, 3.5), HIT); turnHit.position.y = GY + 2.1 * S; turnHit.userData.turn = true; rigRoot.add(turnHit);
      if (man) rigRoot.remove(man);
      man = ctx.hero(S); man.position.set(-PW / 2 - .6, GY, 1.6); man.rotation.y = .5; rigRoot.add(man);
      buildBars(); placeBars(); ticket.redraw(); ui.refreshActions?.();
    }
    const announce = () => ui.caption(`${T().name}: ${FORM_NAME[T().form]}, ${T().gross} t gross in the Table.`, 'Vehicle', 4000);
    function sayLoad() {
      const g = +targets().reduce((a, b) => a + b, 0).toFixed(1), t = T().gross;   // the ticket in words: on phones the card can cover the 3-D ticket
      const bad = rig.groups.map((a, k) => ({ a, k, v: target(k) })).filter(o => o.v > o.a.limit + 1e-9);
      ui.caption(bad.length ? `${bad.map(o => `Axle ${o.k + 1} carries ${o.v} t, over its ${o.a.limit} t`).join('; ')}. Gross ${g} t against ${t} t. Worst axle wears the road ×${(worst() ** 4).toFixed(1)}.` : `Gross ${g} t of ${t} t allowed: every axle within the Table.`, bad.length ? 'Overloaded' : 'Within the Table', 6000);
    }
    function setLoad(f, quiet) {
      const nf = Math.round(THREE.MathUtils.clamp(f, .5, 1.4) * 100) / 100; if (nf === st.f && quiet) return;
      st.f = nf; st.fa = rig.groups.map(() => nf); ticket.redraw(); if (!quiet) sayLoad();
    }
    function explain(k) {
      const a = rig.groups[k], cl = a.kind === 't' ? 'cl. 6.2' : 'cl. 6.1';
      ui.caption(`Axle ${k + 1}: ${KIND_NAME[a.kind]}. ${target(k)} t on it; the standard allows ${a.limit} t (${cl}).`, 'Axle load', 6000);
    }

    function setAxle(k, f) { st.fa[k] = Math.round(THREE.MathUtils.clamp(f, .5, 1.4) * 100) / 100; ticket.redraw(); }
    let grip = null;   // what a press grabbed: { mode: 'load' | 'turn', f0, yaw0, moved }
    const api = {
      group, dragPlane: 'xy',
      actions: [
        { label: '◀ Vehicle', run: () => { setType(st.i - 1); announce(); } },
        { label: 'Vehicle ▶', run: () => { setType(st.i + 1); announce(); } },
        { label: 'Load −10 %', run: () => setLoad(st.f - .1) },
        { label: 'Load +10 %', run: () => setLoad(st.f + .1) },
        { label: 'Legal load', run: () => setLoad(1) },
      ],
      press(hit) {
        const bar = tagged(hit.object, 'bar'); if (bar) grip = { mode: 'load', k: bar.userData.axle, f0: fa(bar.userData.axle), moved: false };
        else if (tagged(hit.object, 'turn') || tagged(hit.object, 'axle')) grip = { mode: 'turn', yaw0: st.yaw, moved: false };
        else grip = null;
      },
      drag({ dx, dy }) {
        if (!grip) return; grip.moved = true;
        if (grip.mode === 'load') { setAxle(grip.k, grip.f0 - dy / 240); if (!st.dragged) { st.dragged = true; if (hint) hint.visible = false; } }
        else st.yaw = THREE.MathUtils.clamp(grip.yaw0 + dx / 160, -1.3, 1.3);
      },
      release() { if (grip?.moved && grip.mode === 'load') sayLoad(); grip = null; },
      tap(hit) {
        if (guide.tap(hit)) return;
        const o = tagged(hit.object, 'axle'); if (o) explain(o.userData.axle);
      },
      get a11y() { return rig.groups.map((a, k) => ({ label: `Read axle ${k + 1}`, run: () => explain(k) })); },
      enter() { setType(st.i); },                                  // every visit: the truck rolls on and the columns rise
      update(dt) {
        // roll on: ease the truck from the left onto the deck, wheels turning with the distance travelled
        if (st.drive < -.01) {
          const nx = st.drive * (1 - Math.min(1, dt * 2.4)), step = nx - st.drive; st.drive = Math.abs(nx) < .01 ? 0 : nx;
          rig.group.position.x = st.drive;
          for (const a of rig.groups) for (const w of a.wheels) w.rotation.y -= step / (.5 * S);
        }
        // the columns follow the load once the truck is on the deck
        const on = st.drive > -.6; let moving = false;
        rig.groups.forEach((a, k) => {
          const goal = on ? a.limit * fa(k) : 0, v = st.shown[k] ?? 0, nv = v + (goal - v) * Math.min(1, dt * 6);
          if (Math.abs(nv - v) > 1e-3) moving = true; st.shown[k] = Math.abs(goal - nv) < .01 ? goal : nv;
        });
        if (moving || st.drive < 0) placeBars();
        // portrait phones turn the rig so the long truck runs into the screen; the reader's own turn adds on top
        const tall = camera.aspect < 1, want = (tall ? -.55 : 0) + st.yaw;
        // upright phones: the two cards move in and shrink a little so both stay on screen
        guide.card.position.x = tall ? -4.5 : -5.4; ticket.position.x = tall ? 4.5 : 5; guide.card.scale.setScalar(tall ? .86 : 1); ticket.scale.setScalar(tall ? .86 : 1);
        rigRoot.rotation.y += (want - rigRoot.rotation.y) * Math.min(1, dt * 5);
      },
      reset() { st.f = 1; st.fa = []; st.yaw = 0; setType(START); guide.reset(); },
      get debug() { const L = targets(); return { type: T().id, f: st.f, fa: rig.groups.map((a, k) => fa(k)), loads: L, shown: st.shown.map(v => +v.toFixed(2)), gross: +L.reduce((a, b) => a + b, 0).toFixed(1), table: T().gross, yaw: st.yaw, drive: +st.drive.toFixed(2), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Read the axles', show: [], enter: () => { if (st.i !== START || anyOver() || st.f !== 1) { st.f = 1; st.fa = []; setType(START); } },
          text: 'The road feels axles, not trucks. Each column is the load on one axle: teal single tyres (6 t), amber dual tyres (10.2 t), purple a tandem pair (18 t). Drag a column to load that axle; drag the truck to turn it.' },
        { title: 'Add it up', show: ['◀ Vehicle', 'Vehicle ▶'],
          check: { q: 'This 3-S2 has a 6 t front axle and two 18 t tandems. What may it weigh in all?', options: ['36 t', '42 t', '48 t'], answer: 1, why: 'The gross limit is the sum of the axle limits (cl. 6.3): 6 + 18 + 18 = 42 t, the Table value. Step through the other vehicles to see it hold.' } },
        { title: 'Overload it', show: ['Load −10 %', 'Load +10 %', 'Legal load'],
          enter: () => ui.caption('Drag any column up or down to load the truck, or use the Load buttons.', 'Try it', 6000),
          check: { q: 'Drag a tandem to 120 %: 21.6 t instead of 18 t. Roughly how much more wear on the road?', options: ['1.2×', 'about 2×', 'about 4×'], answer: 1, why: 'Wear grows with roughly the fourth power of axle load (AASHO Road Test): 1.2⁴ ≈ 2.1. A 20 % overload doubles the damage.' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);

    setType(START);
    // columns, wheels and the truck are rebuilt with the vehicle, so the tap targets are read live
    Object.defineProperty(api, 'targets', { get: () => [guide.card, ticket, ...bars.map(b => b.hit), ...rig.groups.flatMap(a => a.wheels), turnHit] });
    return api;
  },
};
