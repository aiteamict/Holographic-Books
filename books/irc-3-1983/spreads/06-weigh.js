// Spread 6 · How heavy? (cl. 6.1–6.3, Table)
// A vehicle from the Table stands on a cut-away pavement. A load column rises over every axle (or tandem pair), with
// the legal limit as a dashed tick; the weighbridge ticket adds them up. Push the load past the Table and the columns
// turn red and the pavement surface dips harder under each axle.
import * as THREE from 'three';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { makeGuide } from '@engine/guide.js';
import { TYPES, KIND_NAME, INK, CSS, FORM_NAME, makeRig } from '../vehicles.js';

const S = 1.08;                   // world cm per real metre: the 18 m truck-trailer is 19.4 cm long
const GY = 3.2;                   // road surface height; the pavement layers fill 0..GY
const BAR0 = GY + 5.6, K = .3;    // load columns start above the roof (3.8 m = 4.6 cm), 0.3 cm per tonne
const LAYERS = [['surface', .45, 0x5a5f66], ['base', .85, 0x8a6d3b], ['sub-base', 1.0, 0x9c8a63], ['subgrade', .9, 0x7d8a6a]];
const F = 'Inter, Segoe UI, Arial';
const START = TYPES.findIndex(t => t.id === '3-S2');

export default {
  cam: { pos: [2.5, 37, 43], look: [2.5, 3, 1], portrait: { pos: [16, 62, 52], look: [13, -2, 2] } },   // closer and lower than the default: the scene fills the right page
  shots: [
    { pos: [13, 20, 30], look: [13, 9, 0], dur: 1.8, hold: 2.6, text: 'Each column is the load on one axle, or on a tandem pair. The dashed tick is the most the standard allows on it.' },
    { pos: [24, 10, 22], look: [13, 3, 2], dur: 1.8, hold: 2.6, text: 'The cut-away under the truck is the pavement. Overload an axle and the surface dips harder beneath it.' },
  ],
  build(ctx) {
    const { holo, ui, camera } = ctx;
    const group = new THREE.Group();
    const rigRoot = new THREE.Group(); group.add(rigRoot);   // truck, pavement and columns turn together on portrait phones
    const st = { i: START, f: 1 };
    let rig = null, bars = new THREE.Group(), bowls = null, man = null;
    rigRoot.add(bars);

    // ---- the pavement cut-away: four layers, front face toward the reader
    const PW = 20.5, PD = 5;
    let y = GY;
    for (const [name, t, col] of LAYERS) {
      const b = holo.wireBox(PW, t, PD, col, { fill: .14, width: .04, opacity: .6 }); b.position.set(0, y - t / 2, 0); rigRoot.add(b);
      const l = holo.label(name, { h: .5, color: '#5c6168' }); l.position.set(-PW / 2 + 1.5, y - t / 2, PD / 2 + .1); rigRoot.add(l);
      y -= t;
    }

    // ---- the weighbridge ticket
    const T = () => TYPES[st.i];
    const loads = () => rig.groups.map(a => +(a.limit * st.f).toFixed(1));
    const ticket = textPlane({ w: 9.8, h: 7.6, px: 50, draw: (c, W, H) => {
      if (!rig) return;                                             // first draw happens before the vehicle exists
      const t = T(), L = loads(), gross = +L.reduce((a, b) => a + b, 0).toFixed(1), over = st.f > 1.0001;
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
      // verdict stamp
      const msg = over ? `OVERLOADED +${+(gross - t.gross).toFixed(1)} t` : 'WITHIN THE TABLE', col = over ? CSS.over : '#2f8f55';
      c.save(); c.translate(W - 150, H - 40); c.rotate(-.06); c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(-128, -22, 256, 40);
      c.fillStyle = col; c.font = `800 18px ${F}`; c.textAlign = 'center'; c.fillText(msg, 0, 5); c.restore();
      c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; c.fillText(over ? `road wear ×${(st.f ** 4).toFixed(1)} per pass` : `load ${Math.round(st.f * 100)} % of the Table`, 22, H - 34);
    } });
    ticket.position.set(5, 2.6, 10.5); ticket.rotation.x = -.6; ticket.userData.ticket = true; group.add(ticket);   // cards lie in front of the truck, tilted to the reader: they never hide the columns

    // ---- build / rebuild
    function setType(i) {
      st.i = (i + TYPES.length) % TYPES.length;
      if (rig) rigRoot.remove(rig.group);
      rig = makeRig(T(), S); rig.group.position.y = GY; rigRoot.add(rig.group);
      if (man) rigRoot.remove(man);
      man = ctx.hero(S); man.position.set(-rig.L * S / 2 - 1.6, GY, 1.2); man.rotation.y = .5; rigRoot.add(man);
      refresh();
    }
    function refresh() {
      rigRoot.remove(bars); bars = new THREE.Group(); rigRoot.add(bars);
      const L = loads();
      rig.groups.forEach((a, k) => {
        const over = L[k] > a.limit + 1e-9, col = over ? INK.over : INK[a.kind], w = a.kind === 't' ? 2.1 : 1.1, h = Math.max(.05, L[k] * K);
        const col3 = holo.wireBox(w, h, 1.1, col, { fill: over ? .35 : .22, width: .06 }); col3.position.set(a.wx, BAR0 + h / 2, 0); col3.userData.axle = k; bars.add(col3);
        bars.add(holo.polyline([[a.wx - w / 2 - .5, BAR0 + a.limit * K, 0], [a.wx + w / 2 + .5, BAR0 + a.limit * K, 0]], holo.WHITE, { width: .07, dashed: true }));
        const lab = holo.label(`${L[k]} t`, { h: .95, color: over ? CSS.over : CSS[a.kind], weight: 700 }); lab.position.set(a.wx, BAR0 + h + .9, 0); bars.add(lab);
        bars.add(holo.segments([[a.wx, GY + 4.75, 0], [a.wx, BAR0, 0]], col, .35, { width: .03 }));   // leader from roof to column
      });
      // the pavement surface under load: a dip below each axle, deeper with load (drawn on the front face)
      if (bowls) rigRoot.remove(bowls);
      const pts = []; for (let x = -PW / 2; x <= PW / 2; x += .2) {
        let d = 0; rig.groups.forEach((a, k) => { d += .045 * L[k] * Math.exp(-(((x - a.wx) / (a.kind === 't' ? 1.6 : 1.1)) ** 2)); });
        pts.push([x, GY - d, PD / 2 + .02]);
      }
      bowls = holo.polyline(pts, st.f > 1.0001 ? INK.over : holo.CYAN, { width: .09 }); rigRoot.add(bowls);
      ticket.redraw(); ui.refreshActions?.();
    }
    const setLoad = f => {
      st.f = Math.round(THREE.MathUtils.clamp(f, .5, 1.4) * 100) / 100; refresh();
      const g = +loads().reduce((a, b) => a + b, 0).toFixed(1), t = T().gross;   // the ticket in words: on phones the card can cover the 3-D ticket
      ui.caption(st.f > 1.0001 ? `Gross ${g} t, ${+(g - t).toFixed(1)} t over the Table (${t} t). Road wear ×${(st.f ** 4).toFixed(1)}.` : `Gross ${g} t of ${t} t allowed: within the Table.`, `Load ${Math.round(st.f * 100)} %`, 5000);
    };
    function explain(k) {
      const a = rig.groups[k], L = loads()[k], cl = a.kind === 't' ? 'cl. 6.2' : 'cl. 6.1';
      ui.caption(`Axle ${k + 1}: ${KIND_NAME[a.kind]}. ${L} t on it; the standard allows ${a.limit} t (${cl}).`, 'Axle load', 6000);
    }
    const announce = () => ui.caption(`${T().name}: ${FORM_NAME[T().form]}, ${T().gross} t gross in the Table.`, 'Vehicle', 4000);

    const api = {
      group,
      actions: [
        { label: '◀ Vehicle', run: () => { setType(st.i - 1); announce(); } },
        { label: 'Vehicle ▶', run: () => { setType(st.i + 1); announce(); } },
        { label: 'Load −10 %', run: () => setLoad(st.f - .1) },
        { label: 'Load +10 %', run: () => setLoad(st.f + .1) },
        { label: 'Legal load', run: () => setLoad(1) },
      ],
      tap(hit) {
        if (guide.tap(hit)) return;
        const o = tagged(hit.object, 'axle'); if (o) explain(o.userData.axle);
      },
      get a11y() { return rig.groups.map((a, k) => ({ label: `Read axle ${k + 1}`, run: () => explain(k) })); },
      update(dt) {
        const want = camera.aspect < 1 ? -.55 : 0;                  // portrait: turn the rig so the long truck runs into the screen
        rigRoot.rotation.y += (want - rigRoot.rotation.y) * Math.min(1, dt * 4);
      },
      reset() { st.f = 1; setType(START); guide.reset(); },
      get debug() { const L = loads(); return { type: T().id, f: st.f, loads: L, gross: +L.reduce((a, b) => a + b, 0).toFixed(1), table: T().gross, guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Read the axles', show: [], enter: () => { if (st.i !== START || st.f !== 1) { st.f = 1; setType(START); } },
          text: 'The road feels axles, not trucks. Each column is the load on one axle: teal for single tyres (6 t), amber for dual tyres (10.2 t), purple for a tandem pair (18 t). Tap a column or a wheel.' },
        { title: 'Add it up', show: ['◀ Vehicle', 'Vehicle ▶'],
          check: { q: 'This 3-S2 has a 6 t front axle and two 18 t tandems. What may it weigh in all?', options: ['36 t', '42 t', '48 t'], answer: 1, why: 'The gross limit is the sum of the axle limits (cl. 6.3): 6 + 18 + 18 = 42 t, the Table value. Step through the other vehicles to see it hold.' } },
        { title: 'Overload it', show: ['Load −10 %', 'Load +10 %', 'Legal load'],
          check: { q: 'Push a tandem to 120 %: 21.6 t instead of 18 t. Roughly how much more wear on the road?', options: ['1.2×', 'about 2×', 'about 4×'], answer: 1, why: 'Wear grows with roughly the fourth power of axle load (AASHO Road Test): 1.2⁴ ≈ 2.1. A 20 % overload doubles the damage.' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);

    setType(START);
    // wheels and columns are rebuilt when the vehicle or load changes, so the tap targets are read live
    Object.defineProperty(api, 'targets', { get: () => [ticket, guide.card, ...bars.children.filter(o => o.userData.axle != null), ...rig.groups.flatMap(a => a.wheels)] });
    return api;
  },
};
