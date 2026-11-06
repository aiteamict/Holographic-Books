// Spread 2 · Reading the code (cl. 2.2, 3.6, 3.10, 4, 5.3.5, Fig.)
// The code floats over the truck as tiles. Tap a tile and it changes: the truck is rebuilt and rolls back on, and the
// part that character names lights up. The Fig. of the standard stands behind as a row of silhouettes; tap one to load
// it. Hitching a third vehicle is refused (cl. 5.3.5).
import * as THREE from 'three';
import { textPlane, cardBg, tagged } from '@engine/util.js';
import { makeGuide } from '@engine/guide.js';
import { TYPES, FORM_NAME, makeRig, drawSilhouette } from '../vehicles.js';
import { road } from '../scene.js';

const S = 1.0, GY = .3, DRIVE_FROM = -22, F = 'Inter, Segoe UI, Arial';
const HIT = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const idOf = c => !c.hitch ? (c.a === 2 ? '2' : '3') : c.hitch === 'S' ? `${c.a}-S${c.n}` : `${c.a}-${c.n}`;
const codeOf = id => { const t = TYPES.find(t => t.id === id); return t.form === 'rigid' ? { a: +t.code, hitch: null, n: 0 } : t.form === 'semi' ? { a: +t.code[0], hitch: 'S', n: +t.code[3] } : { a: +t.code[0], hitch: 'T', n: +t.code[2] }; };
const FIG = ['2', '3', '2-S1', '2-S2', '3-S1', '3-S2', '2-2', '3-2', '2-3', '3-3'];   // the Figure of the standard, in its order

export default {
  cam: { pos: [2.5, 31, 41], look: [2.5, 4.5, -1], portrait: { pos: [15, 60, 56], look: [12.3, 0, 0] } },
  shots: [
    { pos: [13, 16, 26], look: [13, 9, 0], dur: 1.8, hold: 2.6, text: 'The code, character by character: axles on the truck, S for a semi-trailer, then the axles behind.' },
    { pos: [13, 14, 14], look: [13, 3, -7], dur: 1.8, hold: 2.6, text: 'Behind it, the Figure of the standard: every type the code can name. Tap one to load it.' },
  ],
  build(ctx) {
    const { holo, ui, camera } = ctx;
    const group = new THREE.Group(), rigRoot = new THREE.Group(); group.add(rigRoot);
    const rd = road(S, { len: 24 }); rd.position.y = GY; rigRoot.add(rd);
    const st = { c: codeOf('3-S2'), drive: DRIVE_FROM, hl: null, hlT: 0, refuse: 0 };
    let rig = null, tiles = [], tileRoot = new THREE.Group(), glow = null, ghost = null;
    group.add(tileRoot);
    const T = () => TYPES.find(t => t.id === idOf(st.c));

    // ---- the Figure, as a board of silhouettes at the back of the page
    const figHit = [];
    const fig = textPlane({ w: 21, h: 5.4, px: 44, draw: (c, W, H) => {
      cardBg(c, W, H, { stroke: 'rgba(42,109,104,.6)' });
      c.fillStyle = '#2a6d68'; c.font = `700 14px ${F}`; c.textAlign = 'left'; c.fillText('FIG. VEHICLE TYPES · IRC 3-1983 · TAP ONE TO LOAD IT', 16, 22);
      const cols = 5, cw = (W - 32) / cols, rh = (H - 34) / 2; figHit.length = 0;
      FIG.forEach((id, k) => {
        const t = TYPES.find(t => t.id === id), cx = 16 + (k % cols) * cw, cy = 34 + Math.floor(k / cols) * rh, on = idOf(st.c) === id;
        if (on) { c.fillStyle = 'rgba(201,122,16,.16)'; c.strokeStyle = '#c97a10'; c.lineWidth = 2; c.beginPath(); c.roundRect(cx + 3, cy + 2, cw - 6, rh - 6, 8); c.fill(); c.stroke(); }
        const m = Math.min((cw - 24) / { rigid: 11, semi: 16, trailer: 18 }[t.form], 9);
        drawSilhouette(c, t, cx + 12, cy + rh - 30, m, { lw: 1.6 });
        c.fillStyle = on ? '#8a4a08' : '#1f2328'; c.font = `700 15px ${F}`; c.textAlign = 'center'; c.fillText(`TYPE ${t.code}`, cx + cw / 2, cy + rh - 10);
        figHit.push({ id, u0: cx / W, u1: (cx + cw) / W, v0: 1 - (cy + rh) / H, v1: 1 - cy / H });
      });
    } });
    fig.position.set(0, 2.9, -9.5); fig.rotation.x = -.35; group.add(fig);

    // ---- the code tiles: one per character; tapping a tile changes that character
    const ROLE_TEXT = {
      truck: n => `${n}: the number of axles on the ${st.c.hitch === 'S' ? 'truck-tractor' : 'truck'} (cl. 4). Tap to switch between 2 and 3.`,
      dash: () => 'The dash separates the truck from what it pulls. Tap it to swap a semi-trailer for a full trailer.',
      S: () => 'S: a semi-trailer, resting part of its weight and load on the tractor (cl. 3.6). Tap to change the hitch.',
      n: n => st.c.hitch === 'S' ? `${n}: the axles on the semi-trailer (cl. 4). Tap to change.` : `${n}: the axles on the trailer, which carries all its weight on its own wheels (cl. 3.10). Tap to change.`,
      plus: () => 'Nothing hitched: a single unit truck. Tap + to hitch a semi-trailer.',
    };
    const PART = { truck: 'truck', dash: 'trailer', S: 'trailer', n: 'trailer', plus: null };
    function buildTiles() {
      group.remove(tileRoot); tileRoot = new THREE.Group(); group.add(tileRoot); tiles = [];
      const c = st.c, chars = !c.hitch ? [[String(c.a), 'truck'], ['+', 'plus']] : c.hitch === 'S' ? [[String(c.a), 'truck'], ['-', 'dash'], ['S', 'S'], [String(c.n), 'n']] : [[String(c.a), 'truck'], ['-', 'dash'], [String(c.n), 'n']];
      const ws = chars.map(([ch]) => ch === '-' ? 1.4 : 2.5), total = ws.reduce((a, b) => a + b, 0) + .4 * (ws.length - 1);
      let x = -total / 2;
      chars.forEach(([ch, role], k) => {
        const w = ws[k], tile = textPlane({ w, h: 3, px: 60, draw: (cc, W, H) => {
          const on = st.hl === role;
          cardBg(cc, W, H, { stroke: on ? 'rgba(201,122,16,.95)' : role === 'plus' ? 'rgba(92,97,104,.5)' : 'rgba(31,35,40,.55)' });
          cc.fillStyle = role === 'plus' ? '#5c6168' : on ? '#8a4a08' : '#1f2328'; cc.font = `800 ${ch === '-' ? 90 : 120}px ${F}`; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText(ch, W / 2, H / 2 + 6);
        } });
        tile.position.set(x + w / 2, 14.2, 0); tileRoot.add(tile);
        const hit = new THREE.Mesh(new THREE.BoxGeometry(w + .4, 3.6, 1.5), HIT); hit.position.copy(tile.position); hit.userData.tile = role; tileRoot.add(hit);
        tiles.push({ role, tile, hit }); x += w + .4;
      });
      const cap = holo.label(`${T().name} · ${FORM_NAME[T().form]} · ${T().gross} t in the Table`, { h: .7, color: '#5c6168' }); cap.position.set(0, 12.1, 0); tileRoot.add(cap);
    }
    const redrawTiles = () => tiles.forEach(t => t.tile.redraw());

    // ---- vehicle
    function setCode(c, { roll = true } = {}) {
      st.c = c; if (rig) rigRoot.remove(rig.group);
      rig = makeRig(T(), S); rig.group.position.set(roll ? DRIVE_FROM : 0, GY, 0); rigRoot.add(rig.group); st.drive = roll ? DRIVE_FROM : 0;
      buildTiles(); fig.redraw(); ui.refreshActions?.();
    }
    function highlight(role) {
      st.hl = role; st.hlT = 2.2; redrawTiles();
      if (glow) { rigRoot.remove(glow); glow = null; }
      const part = PART[role]; if (!part || !rig.parts[part].children.length) return;
      const b = new THREE.Box3().setFromObject(rig.parts[part]), size = b.getSize(new THREE.Vector3()), mid = b.getCenter(new THREE.Vector3());
      rigRoot.worldToLocal(mid);
      glow = holo.wireBox(size.x + .5, size.y + .5, size.z + .5, holo.AMBER, { fill: .12, width: .08 }); glow.position.copy(mid); glow.rotation.y = -rigRoot.rotation.y; rigRoot.add(glow);
    }
    function change(role) {
      const c = { ...st.c };
      if (role === 'truck') c.a = c.a === 2 ? 3 : 2;
      else if (role === 'plus') { c.hitch = 'S'; c.n = 2; }
      else if (role === 'dash' || role === 'S') { if (c.hitch === 'S') { c.hitch = 'T'; c.n = 2; } else { c.hitch = null; c.n = 0; } }
      else if (role === 'n') c.n = c.hitch === 'S' ? (c.n === 1 ? 2 : 1) : (c.n === 2 ? 3 : 2);
      setCode(c);
      const newRole = role === 'plus' ? 'S' : (role === 'S' || role === 'dash') && !c.hitch ? 'truck' : role;
      setTimeout(() => highlight(newRole), 900);
      const hill = c.hitch === 'T' ? ' In steep and mountainous terrain roads need not be designed for truck-trailers (cl. 2.2).' : '';
      ui.caption(ROLE_TEXT[newRole](newRole === 'truck' ? c.a : c.n) + hill, `Type ${T().code}`, 6500);
    }
    function refuseThird() {
      if (ghost) rigRoot.remove(ghost);
      const len = 8 * S, x0 = (rig.L * S) / 2 + .6;
      ghost = new THREE.Group(); ghost.add(holo.wireBox(len, 3.4 * S, 2.5 * S, holo.RED, { fill: .14, width: .08 }));
      const no = holo.label('✕ not allowed · cl. 5.3.5', { h: 1, color: '#c23b2f', weight: 700 }); no.position.y = 3.2; ghost.add(no);
      ghost.position.set(x0 + len / 2, GY + 1.9 * S, 0); rigRoot.add(ghost); st.refuse = 2.6;
      ui.caption('Refused: no combination of vehicles may comprise more than two vehicles (cl. 5.3.5).', 'A third vehicle?', 6000);
    }

    const api = {
      group,
      actions: [
        { label: 'Truck axles', run: () => change('truck') },
        { label: 'Hitch', run: () => change(st.c.hitch ? 'dash' : 'plus') },
        { label: 'Trailer axles', run: () => change('n'), hidden: () => !st.c.hitch },
        { label: 'Add a third vehicle', run: refuseThird },
      ],
      tap(hit) {
        if (guide.tap(hit)) return;
        const t = tagged(hit.object, 'tile'); if (t) { change(t.userData.tile); return; }
        if (hit.object === fig && hit.uv) { const f = figHit.find(f => hit.uv.x >= f.u0 && hit.uv.x <= f.u1 && hit.uv.y >= f.v0 && hit.uv.y <= f.v1); if (f) { setCode(codeOf(f.id)); ui.caption(`${T().name}: ${FORM_NAME[T().form]}.`, 'From the Figure', 4000); } }
      },
      get a11y() { return tiles.filter(t => t.role !== 'dash').map(t => ({ label: `Change "${t.role === 'plus' ? '+' : t.role === 'S' ? 'S' : t.role === 'truck' ? st.c.a : st.c.n}"`, run: () => change(t.role) })); },
      enter() { setCode(st.c); },
      update(dt) {
        if (st.drive < -.01) {
          const nx = st.drive * (1 - Math.min(1, dt * 2.4)), step = nx - st.drive; st.drive = Math.abs(nx) < .01 ? 0 : nx;
          rig.group.position.x = st.drive; for (const a of rig.groups) for (const w of a.wheels) w.rotation.y -= step / (.5 * S);
        }
        if (st.hlT > 0) { st.hlT -= dt; if (glow) glow.scale.setScalar(1 + Math.sin(st.hlT * 8) * .015); if (st.hlT <= 0) { st.hl = null; redrawTiles(); if (glow) { rigRoot.remove(glow); glow = null; } } }
        if (st.refuse > 0) { st.refuse -= dt; if (ghost) ghost.position.z = Math.sin(st.refuse * 30) * .15; if (st.refuse <= 0 && ghost) { rigRoot.remove(ghost); ghost = null; } }
        for (const t of tiles) t.tile.position.y = 14.2 + Math.sin(performance.now() / 600 + t.tile.position.x) * .08;   // tiles float gently
        const tall = camera.aspect < 1, want = tall ? -.55 : 0;
        tileRoot.position.y = tall ? 3.6 : 0;                         // upright phones: lift the code clear of the Figure board
        rigRoot.rotation.y += (want - rigRoot.rotation.y) * Math.min(1, dt * 5);
        guide.card.position.x = tall ? -4.5 : -5.4; guide.card.scale.setScalar(tall ? .86 : 1);
      },
      reset() { setCode(codeOf('3-S2')); guide.reset(); },
      get debug() { return { code: idOf(st.c), drive: +st.drive.toFixed(2), tiles: tiles.map(t => t.role), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Read it', show: [], enter: () => { if (idOf(st.c) !== '3-S2') setCode(codeOf('3-S2')); },
          text: 'This is a 3-S2. Tap each character above the truck: the part it names lights up, and the tap changes it. Tap a type on the Figure behind to load it.' },
        { title: 'Build one', show: ['Truck axles', 'Hitch', 'Trailer axles'],
          check: { q: 'Build a two-axle tractor pulling a two-axle semi-trailer. What is its code?', options: ['2-2', '2-S2', 'S2-2'], answer: 1, why: 'First the tractor’s axles, then S for a semi-trailer, then its axles: 2-S2 (cl. 4). A 2-2 is a truck with a full trailer.' } },
        { title: 'Trailers', show: ['Truck axles', 'Hitch', 'Trailer axles', 'Add a third vehicle'],
          check: { q: 'In a 2-3, what does the 3 count?', options: ['axles on the trailer', 'axles on a semi-trailer', 'vehicles'], answer: 0, why: 'A digit without an S in front counts the axles of a full trailer (cl. 4): a 2-3 is a two-axle truck with a three-axle trailer. And never more than two vehicles (cl. 5.3.5).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);

    setCode(st.c, { roll: false });
    Object.defineProperty(api, 'targets', { get: () => [guide.card, fig, ...tiles.map(t => t.hit)] });
    return api;
  },
};
