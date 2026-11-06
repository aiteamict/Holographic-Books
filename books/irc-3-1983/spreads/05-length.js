// Spread 5 · How long? (cl. 1.1, 3.4, 5.3)
// A right-angle bend seen from above. Pick the 11 m truck, the 12 m bus, the 16 m semi-trailer rig or the 18 m
// truck-trailer and it drives round; drag it to drive it yourself. The rear wheels cut inside the front (off-tracking),
// and the strip each vehicle sweeps is drawn and kept for comparison. Kinematics: every following axle pursues the
// point ahead of it at a fixed distance (a tractrix), which is how real axles track; the widths are from this model.
import * as THREE from 'three';
import { tagged } from '@engine/util.js';
import { makeGuide } from '@engine/guide.js';
import { MAT, wheel } from '../vehicles.js';
import { SM } from '../scene.js';

const S = .45, R = 12, LANE = 3.5, Ri = R - LANE / 2, Ro = R + LANE * 1.5, L1 = 26, LA = R * Math.PI / 2, L2 = 12;
const OFF = new THREE.Vector3(-1.8, 0, -1);                       // where the bend's centre sits on the page (cm)
const HIT = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
const V = {
  truck: { label: 'Truck 11 m', len: 11, color: 0x2f9be0, css: '#1d6fa8', units: [{ p: 'F', q: 'R', fo: 1.4, ro: 2.6, cab: true }], wb: 7.0 },
  bus: { label: 'Bus 12 m', len: 12, color: 0xf08a3c, css: '#b0532a', units: [{ p: 'F', q: 'R', fo: 2.6, ro: 3.1, bus: true }], wb: 6.3 },
  semi: { label: 'Semi-trailer 16 m', len: 16, color: 0xb48be0, css: '#6a4a8c', units: [{ p: 'F', q: 'R', fo: 1.4, ro: 1.3, cab: true, frame: true }, { p: 'K', q: 'A', fo: .55, ro: 2.1 }], wb: 3.5, kp: .15, trl: 9.15 },
  tt: { label: 'Truck-trailer 18 m', len: 18, color: 0x4cc77f, css: '#2f7d4f', units: [{ p: 'F', q: 'R', fo: 1.4, ro: 1.8, cab: true }, { p: 'D', q: 'B', fo: 1.5, ro: 1.7, tarp: true }], wb: 5.4, hitch: 2.0, bar: 2.5, trl: 5.0 },
};
const NOUN = { truck: 'truck', bus: 'bus', semi: 'semi-trailer rig', tt: 'truck-trailer' };

/** the lane centreline, by distance travelled (metres; bend centre at the origin, x right, z toward the reader) */
function pathAt(s) {
  if (s < L1) return new THREE.Vector2(L1 - s, -R);
  if (s < L1 + LA) { const th = -Math.PI / 2 - (s - L1) / R; return new THREE.Vector2(R * Math.cos(th), R * Math.sin(th)); }
  return new THREE.Vector2(-R, s - L1 - LA);
}
const SEND = L1 + LA + L2 - 1;
const pursue = (lead, p, d) => { const v = p.clone().sub(lead); return lead.clone().add(v.setLength(d)); };

export default {
  cam: { pos: [6, 47, 24], look: [8, 0, -2], portrait: { pos: [12.6, 68, 26], look: [12.6, 0, 0] } },
  shots: [
    { pos: [11, 30, 10], look: [12, 0, -3], dur: 1.8, hold: 2.6, text: 'Watch the rear wheels: they cut inside the path of the front wheels, so every vehicle sweeps a strip wider than itself.' },
  ],
  build(ctx) {
    const { holo, ui } = ctx;
    const group = new THREE.Group(); group.position.copy(OFF);
    const inner = new THREE.Group(); inner.scale.setScalar(S); group.add(inner);

    // ---- the bend: two lanes, asphalt, edge lines and a dashed centre line
    const asphalt = SM.asphalt.clone(); asphalt.side = THREE.DoubleSide;
    const slab = (x0, x1, z0, z1) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, .06, z1 - z0), asphalt); m.position.set((x0 + x1) / 2, .03, (z0 + z1) / 2); m.receiveShadow = true; inner.add(m); };
    slab(0, L1, -Ro, -Ri); slab(-Ro, -Ri, 0, L2);
    const sh = new THREE.Shape(); const N = 40;
    for (let i = 0; i <= N; i++) { const th = -Math.PI / 2 - i / N * Math.PI / 2; const p = [Ro * Math.cos(th), Ro * Math.sin(th)]; i ? sh.lineTo(...p) : sh.moveTo(...p); }
    for (let i = N; i >= 0; i--) { const th = -Math.PI / 2 - i / N * Math.PI / 2; sh.lineTo(Ri * Math.cos(th), Ri * Math.sin(th)); }
    const arc = new THREE.Mesh(new THREE.ShapeGeometry(sh), asphalt); arc.rotation.x = Math.PI / 2; arc.position.y = .06; arc.receiveShadow = true; inner.add(arc);
    const ring = (r, i) => { const th = -Math.PI / 2 - i / N * Math.PI / 2; return [r * Math.cos(th) * S, .1, r * Math.sin(th) * S]; };
    const lineOf = r => [[L1 * S, .1, -r * S], ...Array.from({ length: N + 1 }, (_, i) => ring(r, i)), [-r * S, .1, L2 * S]];
    group.add(holo.polyline(lineOf(Ri), 0xf3f0e6, { width: .07, opacity: .95 }), holo.polyline(lineOf(Ro), 0xf3f0e6, { width: .07, opacity: .95 }));
    group.add(holo.polyline(lineOf(R + LANE / 2), 0xf3f0e6, { width: .05, opacity: .8, dashed: true }));
    const tag = holo.label('right-angle bend · lane centre R 12 m', { h: .6, color: '#5c6168' }); tag.position.set(-2.4, .3, 0); group.add(tag);

    // ---- vehicles: units placed between two tracked points, with front and rear overhangs
    const st = { kind: 'truck', s: 2, driving: false, pts: {}, out: [], inn: [], maxW: 0 };
    let units = [], bar = null, vehHit = null, liveOut = null, liveIn = null, ghosts = new THREE.Group(); group.add(ghosts);
    function unitMesh(u, len) {
      const g = new THREE.Group(), box = (x0, x1, y0, y1, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, 2.5), mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); m.castShadow = true; g.add(m); };
      const fx = len / 2;                                           // local +x is forward
      if (u.bus) box(-fx, fx, .45, 3.2, MAT.bus);
      else if (u.cab) { box(fx - 2.3, fx, 1, 3.05, MAT.cab); if (u.frame) box(-fx, fx - 2.3, .9, 1.3, MAT.chassis); else box(-fx, fx - 2.5, 1.15, 3.6, MAT.box); }
      else box(-fx, fx, 1.2, 3.6, u.tarp ? MAT.tarp : MAT.box);
      for (const lx of [fx - u.fo, -fx + u.ro]) for (const side of [-1, 1]) { const w = wheel(lx === fx - u.fo && (u.cab || u.bus) ? 's' : 'd'); w.position.set(lx, .5, side * (1.25 - w.userData.tw / 2)); g.add(w); }
      inner.add(g); return g;
    }
    function setKind(k) {
      st.kind = k; for (const u of units) inner.remove(u.g); if (bar) inner.remove(bar); units = [];
      const v = V[k];
      for (const u of v.units) { const d = u.p === 'F' ? v.wb : v.trl; units.push({ ...u, d, g: unitMesh(u, u.fo + d + u.ro) }); }
      bar = null; if (k === 'tt') { bar = new THREE.Mesh(new THREE.BoxGeometry(1, .12, .12), MAT.chassis); inner.add(bar); }
      if (vehHit) group.remove(vehHit); vehHit = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 6), HIT); vehHit.userData.veh = true; group.add(vehHit);
      restart(); ui.refreshActions?.();
    }
    function restart() {
      st.s = 2; st.out = []; st.inn = []; st.maxW = 0;
      const v = V[st.kind], F = pathAt(st.s), back = (p, d) => p.clone().add(new THREE.Vector2(d, 0));   // start on the straight, everything trailing in +x
      const P = { F }; P.R = back(F, v.wb);
      if (st.kind === 'semi') { P.K = back(P.R, -v.kp); P.A = back(P.K, v.trl); }
      if (st.kind === 'tt') { P.H = back(P.R, v.hitch); P.D = back(P.H, v.bar); P.B = back(P.D, v.trl); }
      st.pts = P; for (const l of [liveOut, liveIn]) if (l) group.remove(l); liveOut = liveIn = null; place();
    }
    function step(ds) {                                             // advance the front axle by ds along the lane; the rest pursue
      const v = V[st.kind], P = st.pts; st.s = Math.min(SEND, st.s + ds); P.F = pathAt(st.s);
      P.R = pursue(P.F, P.R, v.wb);
      const dir = P.F.clone().sub(P.R).normalize();
      if (st.kind === 'semi') { P.K = P.R.clone().add(dir.clone().multiplyScalar(v.kp)); P.A = pursue(P.K, P.A, v.trl); }
      if (st.kind === 'tt') { P.H = P.R.clone().sub(dir.clone().multiplyScalar(v.hitch)); P.D = pursue(P.H, P.D, v.bar); P.B = pursue(P.D, P.B, v.trl); }
    }
    function corners() {                                            // every body corner, for the swept path
      const out = [];
      for (const u of units) { const p = st.pts[u.p], q = st.pts[u.q], d = p.clone().sub(q).normalize(), n = new THREE.Vector2(-d.y, d.x).multiplyScalar(1.25), f = p.clone().add(d.clone().multiplyScalar(u.fo)), r = q.clone().sub(d.clone().multiplyScalar(u.ro)); out.push(f.clone().add(n), f.clone().sub(n), r.clone().add(n), r.clone().sub(n)); }
      return out;
    }
    function place() {
      for (const u of units) {
        const p = st.pts[u.p], q = st.pts[u.q], d = p.clone().sub(q).normalize(), mid = p.clone().add(d.clone().multiplyScalar(u.fo)).add(q.clone().sub(d.clone().multiplyScalar(u.ro))).multiplyScalar(.5);
        u.g.position.set(mid.x, 0, mid.y); u.g.rotation.y = Math.atan2(-d.y, d.x);
      }
      if (bar) { const h = st.pts.H, dd = st.pts.D, m = h.clone().add(dd).multiplyScalar(.5); bar.position.set(m.x, .9, m.y); bar.scale.x = h.distanceTo(dd); bar.rotation.y = Math.atan2(-(dd.y - h.y), dd.x - h.x); }
      const f = st.pts.F; vehHit.position.set(f.x * S, 1.5, f.y * S);
      // swept path: the outermost and innermost points of the whole vehicle, measured from the bend centre
      // offset across the road: |z| on the entry straight, |x| on the exit straight, the radius inside the bend
      const off = c => c.x > 0 ? -c.y : c.y > 0 ? -c.x : c.length();
      const cs = corners(); let o = cs[0], i = cs[0];
      for (const c of cs) { if (off(c) > off(o)) o = c; if (off(c) < off(i)) i = c; }
      const inArc = c => { const a = Math.atan2(c.y, c.x); return a <= -Math.PI / 2 + .02 && a >= -Math.PI - .02; };
      st.maxW = Math.max(st.maxW, off(o) - off(i));
      st.out.push([o.x * S, .14, o.y * S]); st.inn.push([i.x * S, .14, i.y * S]);
      if (st.out.length > 1) {
        const col = V[st.kind].color;
        if (!liveOut) { liveOut = holo.polyline(st.out, col, { width: .16 }); liveIn = holo.polyline(st.inn, col, { width: .16, dashed: true }); group.add(liveOut, liveIn); }
        else { holo.setPoints(liveOut, st.out); holo.setPoints(liveIn, st.inn); }
      }
    }
    function finish() {                                             // keep this run's path as a ghost, labelled with its swept width
      st.driving = false; if (!liveOut) return;
      const v = V[st.kind], g = new THREE.Group(); g.add(liveOut, liveIn); liveOut = liveIn = null; ghosts.add(g);
      const pos = []; for (let j = 0; j < st.out.length - 1; j++) pos.push(...st.out[j], ...st.inn[j], ...st.out[j + 1], ...st.inn[j], ...st.inn[j + 1], ...st.out[j + 1]);   // the swept strip as a tinted band
      const band = new THREE.BufferGeometry(); band.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      const bm = new THREE.MeshBasicMaterial({ color: v.color, transparent: true, opacity: .28, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }); const bandMesh = new THREE.Mesh(band, bm); bandMesh.position.y = -.02; bandMesh.renderOrder = 1; g.add(bandMesh);
      const l = holo.label(`${v.len} m · sweeps ${st.maxW.toFixed(1)} m`, { h: .75, color: v.css, weight: 700, bg: 'rgba(255,253,248,.92)' });
      l.position.set(L1 * S * .55, .5, -Ro * S - 1.4 - ghosts.children.length * 1.2); g.add(l);   // a legend above the straight
      ui.caption(`The ${v.len} m ${NOUN[st.kind]} swept ${st.maxW.toFixed(1)} m across the bend in this model; the vehicle itself is 2.5 m wide.`, 'Swept path', 6000);
    }
    const go = k => { setKind(k); st.driving = true; };

    let grip = null;
    const api = {
      group, dragPlane: 'xz',
      actions: [...Object.entries(V).map(([k, v]) => ({ label: v.label, run: () => go(k) })), { label: 'Clear paths', run: () => { group.remove(ghosts); ghosts = new THREE.Group(); group.add(ghosts); } }],
      press(hit) { grip = tagged(hit.object, 'veh') ? {} : null; if (grip) st.driving = false; },
      drag({ point }) {
        if (!grip) return;
        const m = new THREE.Vector2((point.x - OFF.x) / S, (point.z - OFF.z) / S);
        let best = st.s, bd = 1e9; for (let s = st.s; s <= Math.min(SEND, st.s + 8); s += .1) { const d = pathAt(s).distanceTo(m); if (d < bd) { bd = d; best = s; } }
        while (st.s < best - 1e-6) step(Math.min(.1, best - st.s));
        place(); if (st.s >= SEND) finish();
      },
      release() { grip = null; },
      tap(hit) { if (guide.tap(hit)) return; if (tagged(hit.object, 'veh')) { restart(); st.driving = true; } },
      a11y: Object.entries(V).map(([k, v]) => ({ label: `Drive the ${v.label}`, run: () => go(k) })),
      enter() { if (!ghosts.children.length) go(st.kind); },
      update(dt) {
        if (st.driving) { let ds = dt * 7; while (ds > 1e-6) { const d = Math.min(.1, ds); step(d); ds -= d; } place(); if (st.s >= SEND) finish(); }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -1.6 : -5.4; guide.card.scale.setScalar(tall ? .78 : 1);
      },
      reset() { group.remove(ghosts); ghosts = new THREE.Group(); group.add(ghosts); setKind('truck'); guide.reset(); },
      get debug() { return { kind: st.kind, s: +st.s.toFixed(1), driving: st.driving, maxW: +st.maxW.toFixed(2), ghosts: ghosts.children.length, guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5 - OFF.z], w: 10, h: 5,
      steps: [
        { title: 'Four lengths', show: Object.values(V).map(v => v.label),
          text: '11 m truck, 12 m bus, 16 m semi-trailer rig, 18 m truck-trailer (cl. 5.3). Pick one and watch it round the bend, or drag the vehicle to drive it yourself.' },
        { title: 'Why length', show: Object.values(V).map(v => v.label),
          check: { q: 'Why does the standard use overall length to design curves (cl. 1.1)?', options: ['the rear wheels cut inside the front', 'long vehicles are heavier', 'long vehicles are taller'], answer: 0, why: 'On a bend the rear wheels track inside the front ones, so a vehicle needs more width than its own 2.5 m; its length, and where it is coupled, set how much (cl. 1.1). Run the 16 m semi-trailer and the 18 m truck-trailer: the shorter one sweeps more.' } },
        { title: 'The limits', show: [...Object.values(V).map(v => v.label), 'Clear paths'],
          check: { q: 'What is the longest a truck-trailer combination may be?', options: ['16 m', '18 m', '20 m'], answer: 1, why: '18 m (cl. 5.3.4). A truck-tractor with a semi-trailer may be 16 m (cl. 5.3.3), a single unit truck 11 m and a bus 12 m.' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);

    setKind('truck');
    Object.defineProperty(api, 'targets', { get: () => [guide.card, vehHit] });
    return api;
  },
};
