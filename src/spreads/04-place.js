// Spread 4 · Where it stands (cl. 3, Plate 2)
// One plan at one scale, with two framed insets above it: the driver's view (what the sign looks like at this distance)
// and the roadside section (the lateral clearance and the 2250 mm). A drive runs the whole thing.
import * as THREE from 'three';
import { tagged, textPlane } from './util.js';
import * as props from '../engine/props.js';
import { Anims, drive, pulse, linear } from '../engine/anim.js';
import { makeGuide } from '../engine/guide.js';

let V = 60 / 3.6;               // approach speed used for the timings, m/s; the speed picker changes it
const SPEEDS = [50, 65, 80];
const LEGIBLE = 90;             // m: 200 mm numerals read from about 30–40 ft per inch → 70–100 m; a rule of thumb, not IRC 2
const CHAIN = [25, 50, 75, 100, 125, 150];

export default {
  cam: { pos: [0, 50, 44], look: [0, 5, -4] },   // over the spine, like the default: the plan stays on the right page on screen
  shots: [
    { pos: [15, 28, 20], look: [13, 2, -2], dur: 1.8, hold: 2.6, text: 'The plan, at one scale: the junction at the top, the approach running toward you, chainage every 25 m.' },
    { pos: [4, 22, 16], look: [4, 14, -8], dur: 1.8, hold: 2.6, text: 'Three insets: what the driver sees, the roadside section with the clearances, and the long section with the sight line from a 1.2 m eye to the 2.25 m shield top.' },
  ],
  build(ctx) {
    const { holo, sign, ui } = ctx; const { SPEC } = sign;
    const M = .11;                                                    // cm per metre on the plan
    const group = new THREE.Group();
    const plan = new THREE.Group(); plan.position.set(2, .25, 0); group.add(plan);
    const hw = SPEC.props.carriageway.width / 2 * M, zJ = -7.5;       // junction centre
    const zEdge = zJ + hw;                                            // kerb line of the side road; chainage 0
    const zAt = m => zEdge + m * M;                                   // metres before the junction → plan z

    // road: edges, centre dashes, the junction box and the side road to the right
    plan.add(holo.segments([[-hw, 0, zJ - 7], [-hw, 0, zAt(185)], [hw, 0, zEdge], [hw, 0, zAt(185)], [hw, 0, zJ - hw], [hw, 0, zJ - 7], [hw, 0, zEdge], [9, 0, zEdge], [hw, 0, zJ - hw], [9, 0, zJ - hw]], holo.CYAN, .95, { width: .09 }));
    plan.add(holo.polyline([[0, 0, zAt(185)], [0, 0, zJ - 7]], holo.CYAN, { opacity: .35, width: .04, dashed: true }));
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, zAt(185) - (zJ - 7)), holo.glassMat(holo.CYAN, { opacity: .03, scan: 0 })); surf.rotation.x = -Math.PI / 2; surf.position.set(0, .01, (zAt(185) + zJ - 7) / 2); surf.userData.road = true; plan.add(surf);
    // chainage ticks on the near-side verge, every 25 m, labelled every 50
    const ticks = []; for (const m of CHAIN) ticks.push([hw + .2, 0, zAt(m)], [hw + .7, 0, zAt(m)]);
    plan.add(holo.segments(ticks, holo.DIM, .9, { width: .05 }));
    for (const m of [50, 100, 150]) { const l = holo.label(`${m} m`, { h: .75, color: '#7fb4c8' }); l.position.set(hw + 1.9, .3, zAt(m)); plan.add(l); }
    // the zones the standard allows: 100–150 m before (amber), 15–30 m after (green)
    const okA = holo.zone(hw + .55, zAt(100), zAt(150), .9, holo.AMBER, .09), okC = holo.zone(hw + .55, zJ - hw - 15 * M, zJ - hw - 30 * M, .9, holo.GREEN, .09); plan.add(okA, okC);
    plan.add(holo.tag('100–150 m before the junction · cl. 3.4', [hw + 1, 0, zAt(125)], [4.5, 2.2, 0], { accent: holo.AMBER }));
    plan.add(holo.tag('confirmatory · 15–30 m after · Plate 2', [hw + 1, 0, zJ - hw - 22 * M], [4.5, 2.2, 0], { accent: holo.GREEN }));
    const arrow = holo.label('↓ traffic', { h: .85, color: '#ffc98a' }); arrow.position.set(-2.2, .4, zAt(170)); plan.add(arrow);
    const jl = holo.label('junction', { h: .75, color: '#7fb4c8' }); jl.position.set(-2.4, .3, zJ); plan.add(jl);

    // markers as plan symbols: a disc you can drag, with the shield as its icon
    const mk = (name, kind) => { const g = new THREE.Group(); g.userData.marker = name; const d = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .1, 20), holo.glassMat(holo.AMBER, { opacity: .35, scan: 0 })); d.position.y = .05; g.add(d); const ic = holo.label(kind ? 'NH 42 ⬆' : 'NH 42', { h: .8, color: '#1a1200', bg: SPEC.colours.face.hex, weight: 800 }); ic.position.set(0, 1.1, 0); g.add(ic); return g; };
    const A = mk('A', true), Cf = mk('C', false); plan.add(A, Cf);
    const st = { d: 120, dc: 20, kerb: false, right: false, speed: 60, turn: 0 };   // turn: degrees the face is turned away from the road (cl. 3.3)
    let dimD = null, dimC = null;
    const swap = (old, make) => { if (old) plan.remove(old); const n = make(); plan.add(n); return n; };

    // ---- inset 1: the driver's view, drawn on a canvas from distance and lateral offset
    const faceC = sign.faceTexture('42').canvas, defC = document.createElement('canvas'); defC.width = 600; defC.height = 500; sign.drawDefinitionPlate(defC, 'ahead');
    const view = { dist: 150, legible: false };
    const screen = textPlane({ w: 10, h: 7, px: 44, draw: (c, W, H) => {
      c.fillStyle = '#071018'; c.fillRect(0, 0, W, H);
      const hz = H * .46, f = W * 1.15, eye = 1.2, lat = 3.5 + (st.kerb ? .6 : 2.5);   // m from lane centre to the post
      c.strokeStyle = 'rgba(79,216,255,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, hz); c.lineTo(W, hz); c.stroke();
      c.strokeStyle = 'rgba(79,216,255,.8)'; c.beginPath(); c.moveTo(W * .5 - f * 3.5 / 6, H); c.lineTo(W * .5 - f * 3.5 / 600, hz); c.moveTo(W * .5 + f * 3.5 / 6, H); c.lineTo(W * .5 + f * 3.5 / 600, hz); c.stroke();
      const d = Math.max(view.dist, 4), sx = W * .5 + (st.right ? -1 : 1) * f * lat / d, top = hz - f * (2.25 - eye) / d, hgt = f * .6 / d, wid = f * .45 / d;
      c.save(); c.filter = view.dist > LEGIBLE ? `blur(${Math.min(6, (view.dist - LEGIBLE) / 18)}px)` : 'none';
      c.drawImage(faceC, sx - wid / 2, top, wid, hgt); c.drawImage(defC, sx - wid / 3, top + hgt * 1.25, wid * .67, hgt * .42);
      c.fillStyle = '#222'; c.fillRect(sx - wid * .08, top + hgt, wid * .16, f * 1.25 / d); c.restore();
      c.fillStyle = '#e6f6ff'; c.font = '600 22px Inter, Segoe UI, Arial'; c.fillText(`${Math.round(view.dist)} m to the sign`, 16, 30);
      c.fillStyle = view.dist <= LEGIBLE ? '#9dffc2' : '#ffb27a'; c.font = '600 18px Inter, Segoe UI, Arial'; c.fillText(view.dist <= LEGIBLE ? 'numerals legible' : `legible from ≈ ${LEGIBLE} m (200 mm numerals)`, 16, 56);
      c.fillStyle = '#ffd7a8'; c.font = '600 18px Inter, Segoe UI, Arial'; c.fillText(`${st.speed} km/h · ${((view.dist + st.d) / V).toFixed(1)} s to the junction`, 16, 82);
      c.fillStyle = '#7fb4c8'; c.font = '500 14px Inter, Segoe UI, Arial'; c.fillText('eye 1.2 m · shield top 2.25 m', 16, H - 14);
    } });
    const inset1 = new THREE.Group(); inset1.position.set(-7, 12.5, -8); inset1.add(holo.frame(10, 7, 'Driver’s view'), screen); group.add(inset1);

    // ---- inset 2: the section, one scale (2.3 cm per m), looking along the road
    const s2 = 2.3, inset2 = new THREE.Group(); inset2.position.set(3.5, 12.5, -8); group.add(inset2);
    inset2.add(holo.frame(10, 7, 'Section · looking along the road'));
    { const stack = holo.label('2250 = 600 shield + 150 gap + 250 plate + 1250 post · Plate 2', { h: .5, color: '#ffd7a8' }); stack.position.set(0, 3.05, .1); inset2.add(stack); }
    const sec = new THREE.Group(); sec.position.set(-4.5, -3, .05); inset2.add(sec);
    sec.add(holo.segments([[0, 0, 0], [7.4 * s2 * .55, 0, 0]], holo.CYAN, .9, { width: .07 }));
    sec.add(holo.polyline([[0, .2, 0], [3.5 * s2 * .55, 0, 0]], holo.CYAN, { opacity: .7, width: .06 }));
    const secCar = props.car(s2 * .55, { nose: true }); secCar.position.set(1.75 * s2 * .55, 0, -(SPEC.props.car.length / 2) * s2 * .55 + .3); sec.add(secCar);
    const secKerb = props.kerb(s2 * .55, 1.4); secKerb.position.set((3.5 + .15) * s2 * .55, 0, 0); sec.add(secKerb);
    const secPost = sign.makeSign({ number: '42', kind: 'ahead', scale: .0126 }); secPost.group.rotation.y = -.3; sec.add(secPost.group);
    const secMan = ctx.hero(s2 * .55); secMan.position.set((3.5 + 1.1) * s2 * .55, 0, .5); sec.add(secMan);
    const secDims = new THREE.Group(); sec.add(secDims);
    const section = () => {
      const k = s2 * .55, edge = 3.5 * k, clear = st.kerb ? .6 : 2.5, px = (3.5 + clear) * k;
      secKerb.visible = st.kerb; secPost.group.position.x = px; secDims.clear();
      secDims.add(holo.dimension([edge + (st.kerb ? .3 * k : 0), .9, 0], [px, .9, 0], st.kerb ? '≥ 0.6 m from the kerb' : '2–3 m clear', { color: holo.GREEN, h: .8, tick: .25 }));
      secDims.add(holo.dimension([px + 1.1, 0, 0], [px + 1.1, 2.25 * k, 0], '2250 mm', { h: .8, tick: .25 }));
    };

    // ---- inset 4: plan view of the face turned slightly away (cl. 3.3): angle in = angle out, so 8° on the sign is 16° on the ray
    const turnPlane = textPlane({ w: 9, h: 7, px: 44, draw: (c, W, H) => {
      c.fillStyle = '#071018'; c.fillRect(0, 0, W, H);
      const lx = W * .34, lw = W * .3;                                            // the lane, running up the inset
      c.strokeStyle = 'rgba(79,216,255,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, 40); c.lineTo(lx, H - 10); c.moveTo(lx + lw, 40); c.lineTo(lx + lw, H - 10); c.stroke();
      c.setLineDash([6, 8]); c.strokeStyle = 'rgba(79,216,255,.3)'; c.beginPath(); c.moveTo(lx + lw / 2, 40); c.lineTo(lx + lw / 2, H - 10); c.stroke(); c.setLineDash([]);
      const Hx = lx + lw * .62, Hy = H - 60, Sx = lx + lw + 34, Sy = 92, th = st.turn * Math.PI / 180;   // headlamp, sign face centre
      // the face: a short bar on the verge, square to the lane then turned away from it
      c.save(); c.translate(Sx, Sy); c.rotate(-th); c.fillStyle = SPEC.colours.face.hex; c.fillRect(-22, -4, 44, 8); c.fillStyle = '#111'; c.fillRect(-22, -4, 44, 2); c.restore();
      const n = { x: -Math.sin(th), y: Math.cos(th) };                            // face normal, toward the traffic, turned by θ
      const il = Math.hypot(Sx - Hx, Sy - Hy), i = { x: (Sx - Hx) / il, y: (Sy - Hy) / il }, d = i.x * n.x + i.y * n.y, r = { x: i.x - 2 * d * n.x, y: i.y - 2 * d * n.y };
      c.strokeStyle = 'rgba(255,162,74,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(Hx, Hy); c.lineTo(Sx, Sy); c.stroke();
      c.strokeStyle = st.turn ? '#9dffc2' : '#ffd27a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(Sx, Sy); c.lineTo(Sx + r.x * 420, Sy + r.y * 420); c.stroke();
      c.fillStyle = '#fff3cc'; c.beginPath(); c.arc(Hx, Hy, 5, 0, 7); c.fill(); c.strokeStyle = '#e6f6ff'; c.lineWidth = 1.5; c.beginPath(); c.arc(Hx, Hy + 14, 7, 0, 7); c.stroke();
      c.fillStyle = '#e6f6ff'; c.font = '600 20px Inter, Segoe UI, Arial'; c.fillText(`turned ${st.turn}°`, 16, 30);
      c.fillStyle = st.turn ? '#9dffc2' : '#ffb27a'; c.font = '600 16px Inter, Segoe UI, Arial'; c.fillText(st.turn ? `reflected ray ${2 * st.turn}° wide of the eye` : 'reflected ray straight back into the eye', 16, 54);
      c.fillStyle = '#7fb4c8'; c.font = '500 13px Inter, Segoe UI, Arial'; c.fillText('plan · headlamp ● eye ○ · angle in = angle out', 16, H - 14);
    } });
    const inset4 = new THREE.Group(); inset4.position.set(13.5, 12.5, -8); inset4.add(holo.frame(9, 7, 'Turned slightly away · cl. 3.3'), turnPlane); group.add(inset4);
    const setTurn = deg => { const from = st.turn, to = deg; anims.stop('turn'); anims.add({ dur: .6, tag: 'turn', update: k => { st.turn = Math.round(from + (to - from) * k); turnPlane.redraw(); }, done: () => { st.turn = to; turnPlane.redraw(); } }); };

    // ---- inset 3: the long section, distances to scale along the strip, heights exaggerated; the sight line from the eye to the shield top
    const SPAN = 185, LW = 27.5, LH = 5.2, PXM = 44;
    const longSec = textPlane({ w: LW, h: LH, px: PXM, draw: (c, W, H) => {
      c.fillStyle = '#071018'; c.fillRect(0, 0, W, H);
      const x0 = 40, xj = W - 130, k = (xj - x0) / (SPAN + 60), vpm = 56, gy = H - 34;      // px per m along (junction at the right), px per m up, ground line
      c.font = '500 17px Inter, Segoe UI, Arial';
      const X = m => xj - m * k, Y = h => gy - h * vpm, d = Math.max(view.dist, 1), eyeH = 1.2, topH = 2.25, xs = X(st.d);
      c.strokeStyle = 'rgba(79,216,255,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(16, gy); c.lineTo(W - 16, gy); c.stroke();
      c.fillStyle = '#9fb0c4'; c.font = '500 17px Inter, Segoe UI, Arial'; c.textAlign = 'center'; c.fillText('junction', xj, gy + 22); c.fillRect(xj - 1, Y(2.8), 2, 2.8 * vpm);
      // the standard's window before the junction, and the legibility tick before the sign (rule of thumb)
      c.fillStyle = 'rgba(255,162,74,.25)'; c.fillRect(X(150), gy - 8, 50 * k, 8);
      c.fillStyle = '#ffb27a'; c.textAlign = 'left'; c.fillText('100–150 m · cl. 3.4', X(150), gy + 22);
      c.strokeStyle = '#9dffc2'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(X(st.d + LEGIBLE), gy); c.lineTo(X(st.d + LEGIBLE), Y(2.7)); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#9dffc2'; c.textAlign = 'right'; c.fillText(`legible from ≈ ${LEGIBLE} m before the sign`, X(st.d + LEGIBLE) - 6, Y(2.7) + 14);
      // the sign: post, shield at 2.25 m, definition plate
      c.fillStyle = '#222'; c.fillRect(xs - 2, Y(1.25), 4, 1.25 * vpm); c.fillStyle = SPEC.colours.face.hex; c.fillRect(xs - 7, Y(topH), 14, .6 * vpm); c.fillRect(xs - 5, Y(1.5), 10, .25 * vpm);
      c.fillStyle = '#9fb0c4'; c.textAlign = 'left'; c.fillText(`shield top 2.25 m · ${Math.round(st.d)} m out`, xs + 12, Y(topH) + 6);
      // the driver's eye and the sight line to the shield top
      const ex = X(st.d + d), ey = Y(eyeH), ang = THREE.MathUtils.radToDeg(Math.atan2(topH - eyeH, d));
      c.fillStyle = '#ffd27a'; c.fillRect(ex - 9, Y(.5), 18, .5 * vpm); c.beginPath(); c.arc(ex, ey, 4, 0, 7); c.fill();
      c.strokeStyle = d <= LEGIBLE ? '#9dffc2' : '#ffd27a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ex, ey); c.lineTo(xs, Y(topH)); c.stroke();
      c.fillStyle = '#e6f6ff'; c.font = '600 19px Inter, Segoe UI, Arial'; c.textAlign = ex < W / 2 ? 'left' : 'center'; c.fillText(`eye 1.2 m · ${Math.round(d)} m to the sign · sight line ${ang.toFixed(1)}° up`, ex < W / 2 ? ex - 9 : ex, ey - 14);
      c.fillStyle = '#7fb4c8'; c.font = '500 15px Inter, Segoe UI, Arial'; c.textAlign = 'right'; c.fillText(`distances to scale · heights × ${Math.round(vpm / k)}`, W - 16, 16);
    } });
    const inset3 = new THREE.Group(); inset3.position.set(2.25, 6.1, -8); inset3.add(holo.frame(LW, LH, 'Long section · the sight line'), longSec); group.add(inset3);

    const place = () => {
      const x = (st.right ? -1 : 1) * (hw + .55), zA = zAt(st.d), zC = zJ - hw - st.dc * M;
      A.position.set(x, 0, zA); Cf.position.set(x, 0, zC);
      const okD = st.d >= 100 && st.d <= 150 && !st.right, okC2 = st.dc >= 15 && st.dc <= 30;
      A.children[0].material.uniforms.uColor.value.setHex(okD ? holo.GREEN : holo.RED); Cf.children[0].material.uniforms.uColor.value.setHex(okC2 ? holo.GREEN : holo.RED);
      dimD = swap(dimD, () => holo.dimension([x - 1.4, .1, zEdge], [x - 1.4, .1, zA], `${Math.round(st.d)} m`, { color: okD ? holo.GREEN : holo.RED, h: .9, tick: .3 }));
      dimC = swap(dimC, () => holo.dimension([x - 1.4, .1, zJ - hw], [x - 1.4, .1, zC], `${Math.round(st.dc)} m`, { color: okC2 ? holo.GREEN : holo.RED, h: .85, tick: .3 }));
      okA.position.x = okC.position.x = x; section(); screen.redraw(); longSec.redraw();
    };

    // ---- the drive
    const anims = new Anims();
    const driver = new THREE.Group(); plan.add(driver); driver.visible = false;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.38, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffd27a, toneMapped: false })); dot.position.y = .35; driver.add(dot);
    const dring = holo.ring(.8, holo.AMBER, { width: .08 }); dring.position.y = .05; driver.add(dring);
    const dlab = holo.label(' ', { h: .8, color: '#ffd7a8' }); dlab.position.set(-2.6, 1.3, 0); driver.add(dlab);
    const driveIt = () => {
      anims.stop('drive'); const laneX = hw / 2, z0 = zAt(185), z1 = zJ - 6.5, dur = ((z0 - z1) / M) / V / 2, zA = zAt(st.d), zC = zJ - hw - st.dc * M;   // half real time: slow enough to read the captions
      driver.visible = true;
      drive(anims, driver, [[laneX, 0, z0], [laneX, 0, z1]], dur, { ease: linear, tag: 'drive',
        onProgress: (k, p) => { const toJ = (p.z - zEdge) / M; view.dist = Math.max(0, (p.z - zA) / M); screen.redraw(); longSec.redraw(); dlab.userData.setText(toJ > 0 ? `${Math.round(toJ)} m · ${(toJ / V).toFixed(1)} s` : 'through'); },
        onPass: [
          { at: (z0 - zA - LEGIBLE * M) / (z0 - z1), fn: () => ui.caption(`From about ${LEGIBLE} m the 200 mm numerals can be read: the driver now knows this is NH 42 with ${Math.round(st.d + LEGIBLE)} m to the junction, ${((st.d + LEGIBLE) / V).toFixed(0)} s at ${st.speed} km/h.`, 'Legibility', 4500) },
          { at: (z0 - zA) / (z0 - z1), fn: () => { pulse(anims, A, 1.6, .5); ui.caption(st.right ? 'Wrong side: the driver looks left for route markers (cl. 3.4).' : st.d < 100 ? `Passing the sign ${Math.round(st.d)} m out: ${(st.d / V).toFixed(1)} s left to decide. Too close (cl. 3.4 says 100 to 150 m).` : st.d > 150 ? `Passing the sign ${Math.round(st.d)} m out: long enough to forget before the turn. Too far (cl. 3.4).` : `Passing the sign ${Math.round(st.d)} m out: ${(st.d / V).toFixed(1)} s to decide. In range (cl. 3.4).`, 'Route marker', 4500); } },
          { at: (z0 - zC) / (z0 - z1), fn: () => { pulse(anims, Cf, 1.6, .5); ui.caption(st.dc >= 15 && st.dc <= 30 ? `${Math.round(st.dc)} m after the junction: confirmed, still on NH 42 (Plate 2).` : `The confirmatory marker belongs 15 to 30 m after the junction, not ${Math.round(st.dc)} m (Plate 2).`, 'Confirmatory', 4000); } },
        ], done: () => anims.after(.8, () => { driver.visible = false; }) });
    };

    let which = null;
    const api = {
      group, targets: [A, Cf, surf],
      enter() { anims.after(.8, driveIt); },
      tap(hit) { if (guide.tap(hit)) return; if (hit.object.userData.road) driveIt(); },
      actions: [
        { label: '▶ Drive it', run: driveIt },
        { label: 'Turn it 8° away', toggle: () => st.turn > 0, run: () => { setTurn(st.turn ? 0 : 8); ui.caption(st.turn ? 'Square to the lane: the enamel face is a mirror and the headlamp comes straight back (cl. 3.3 says turn it slightly away).' : 'Eight degrees on the sign is sixteen on the reflected ray: the hot spot misses the eye while the face still reads (cl. 3.3).', 'cl. 3.3', 5000); } },
        ...SPEEDS.map(s => ({ label: `${s} km/h`, toggle: () => st.speed === s, run: () => { st.speed = s; V = s / 3.6; place(); ui.caption(`At ${s} km/h, 100 m is ${(100 / V).toFixed(1)} s and 150 m is ${(150 / V).toFixed(1)} s. The standard fixes the distance; the speed decides how much time that buys.`, 'Time to act', 5000); } })),
        { label: 'Kerbed road', toggle: () => st.kerb, run: () => { st.kerb = !st.kerb; place(); ui.caption(st.kerb ? 'With kerbs the post stands not less than 60 cm from the kerb edge (Plate 2).' : 'Without kerbs leave 2 to 3 m between the post and the carriageway edge (cl. 3.3).', 'Lateral clearance'); } },
        { label: 'Put it at 120 m', run: () => { st.d = 120; st.dc = 20; st.right = false; place(); } },
        { label: 'Wrong side', toggle: () => st.right, run: () => { st.right = !st.right; place(); if (st.right) ui.caption('The marker is fixed on the left-hand side as one approaches the junction (cl. 3.4).', 'Side'); } },
      ],
      a11y: [[90, 'too close'], [120, 'in range'], [160, 'too far']].map(([d, w]) => ({ label: `Move the route marker to ${d} m before the junction (${w})`, run: () => { st.d = d; place(); which = 'A'; api.release(); } }))
        .concat([[10, 'too close'], [22, 'in range']].map(([d, w]) => ({ label: `Move the confirmatory marker to ${d} m after the junction (${w})`, run: () => { st.dc = d; place(); which = 'C'; api.release(); } }))),
      press(hit) { which = tagged(hit.object, 'marker')?.userData.marker; },
      drag(d) { if (which === 'A') st.d = THREE.MathUtils.clamp((d.point.z - 2 - zEdge) / M, 5, 180); else if (which === 'C') st.dc = THREE.MathUtils.clamp((zJ - hw - (d.point.z - 2)) / M, 2, 45); place(); },
      release() {
        if (which === 'A') ui.caption(st.d >= 100 && st.d <= 150 ? `${Math.round(st.d)} m: in range. 100 to 150 m before the junction (cl. 3.4).` : st.d < 100 ? `${Math.round(st.d)} m: too close. The driver needs 100 to 150 m of warning (cl. 3.4).` : `${Math.round(st.d)} m: too far. 100 to 150 m before the junction (cl. 3.4).`, 'Route marker');
        else if (which === 'C') ui.caption(st.dc >= 15 && st.dc <= 30 ? `${Math.round(st.dc)} m after: in range for the confirmatory marker (Plate 2).` : 'The confirmatory marker stands 15 to 30 m after the junction (Plate 2).', 'Confirmatory marker');
        which = null;
      },
      update(dt) { anims.tick(dt); },
      reset() { anims.clear(); driver.visible = false; st.d = 120; st.dc = 20; st.kerb = st.right = false; st.speed = 60; st.turn = 0; V = 60 / 3.6; view.dist = 150; place(); turnPlane.redraw(); guide.reset(); },
      get debug() { return { ...st, driving: driver.visible, viewDist: Math.round(view.dist), secondsFromMarker: +(st.d / V).toFixed(1), guide: guide.debug }; },
    };
    // guided sequence: set it out, read it in time, turn it away
    const guide = makeGuide(ctx, {
      anchor: [-7, 19.4, -8], w: 10, h: 5,
      steps: [
        { title: 'Setting out', show: ['Put it at 120 m', 'Kerbed road'], text: 'Drag the route marker along the approach: green between 100 and 150 m before the junction, on the left (cl. 3.4). The confirmatory marker belongs 15–30 m after it (Plate 2). Kerbed road changes the lateral rule.' },
        { title: 'Time to read', show: ['▶ Drive it', '50 km/h', '65 km/h', '80 km/h'],
          check: { q: 'At 80 km/h, how many seconds does 100 m give the driver?', options: ['2.5 s', '4.5 s', '7.2 s'], answer: 1, why: 'The standard fixes the distance; the speed decides the seconds (100 m ÷ 22.2 m/s). Pick 80 km/h and Drive it: the numerals read from about 90 m, and that is when the clock starts.' } },
        { title: 'Turned away', show: ['Turn it 8° away'], text: 'cl. 3.3: the face is turned slightly away from the road. In plan, angle in equals angle out: square to the lane a headlamp comes straight back into the eye; 8° on the sign sends it 16° wide.' },
      ],
    });
    group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    place(); return api;
  },
};
