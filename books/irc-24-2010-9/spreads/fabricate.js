// Chapter 9, spreads 1–5 · fabrication and erection (cl. 513, 514).
//   holes      (cl. 513.5.5)           drilled, punched, or sub-drilled and reamed
//   tighten    (cl. 513.5.6.1)         tightening bolts by the turn of the nut
//   tolerance  (Table 20, 513.5.14)    fabrication tolerances
//   heat       (cl. 513.4, 513.5.7.3, 513.5.9)  how hot steel may be made in the shop
//   erect      (cl. 514.4, 514.5)      erection: service bolts and drifts in a joint
import * as THREE from 'three';
import { SM } from '@engine/scene.js';
import { spread, box, cyl, bend, paint, dispose, head, foot, lines, kv, F, INK, OXIDE, DIMC, OK, BAD, OXIDE_HEX, TAG, DARK } from '../../_irc24/kit.js';
import { holeSize, holeMethod, turnOfNut, TOLERANCE } from '../../_irc24/steel.js';

export const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
export const mark = ok => ok ? '✓' : '✗';
export const GREEN = paint(0x2f8f55, .5, .2), REDP = paint(0xc23b2f, .5, .2);
export const GRADES = ['fy', [250, 300], v => `E ${v}`];
const table = (group, y = 2.6, tilt = .5, k = 1.15) => { const g = new THREE.Group(); g.position.set(0, y, -5); g.rotation.x = tilt; g.scale.setScalar(k); group.add(g); return g; };
const stand = (group, k = 1.2, ry = -.45) => { const g = new THREE.Group(); g.position.set(0, .5, -5); g.rotation.y = ry; g.scale.setScalar(k); group.add(g); return g; };
/** An I-beam along x on two supports; seg lets bend() bow it. */
export function beam(g, mat, seg = 1, L = 14, y = 3.6) {
  const b = new THREE.Group(); b.add(box(L, .2, 1.6, mat, 0, 1.1, 0, seg), box(L, 2, .14, mat, 0, 0, 0, seg), box(L, .2, 1.6, mat, 0, -1.1, 0, seg)); b.position.y = y; g.add(b);
  for (const s of [-1, 1]) g.add(box(1, y - 1.2, 2.2, SM.concrete, s * (L / 2 - .5), (y - 1.2) / 2, 0)); return b;
}

// ---------------------------------------------------------------- 1 · making holes
const HOW = { punch: ['May be punched', 'A secondary member not over 12 mm thick, of steel up to E 250: the hole may be punched full size.'], drill: ['Drill full size', 'All holes shall be drilled, except in secondary members such as floor plates and handrails.'],
  ream: ['Sub-drill 3 mm under, then ream', 'Through more than one thickness, or main material over 20 mm (E 250) or 16 mm (E 300 and above): sub-drilled or sub-punched 3 mm under size and reamed to full diameter, after assembly where there are several thicknesses.'] };
export const holes = spread({
  init: { t: 12, main: true, plies: 1, fy: 250, d: 20 },
  chips: [['main', [true, false], v => v ? 'Main member' : 'Secondary member'], ['plies', [1, 2, 3], v => v === 1 ? 'One thickness' : `${v} thicknesses`], ['d', [16, 20, 24, 27], v => `M${v}`], GRADES],
  slider: { key: 't', name: 't', label: 'thickness · drag', values: [6, 8, 10, 12, 16, 20, 25, 32], at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stand(group), m = paint(), parts = new THREE.Group(), bit = new THREE.Group(); g.add(parts, bit);
    bit.add(cyl(.32, 2.6, SM.steel, 0, 1.6, 0, 10)); const tip = new THREE.Mesh(new THREE.ConeGeometry(.32, .6, 10), SM.steel); tip.rotation.x = Math.PI; bit.add(tip);
    const tag = holo.label('', TAG); tag.position.set(0, 9.4, -5); group.add(tag); let top = 3;
    return {
      place() {
        dispose(parts); parts.clear(); const th = st.t * .05, how = holeMethod(st), r = holeSize(st.d) * .02;
        for (let i = 0; i < st.plies; i++) parts.add(box(7, th - .03, 4, i % 2 ? paint(0xb0732a) : m, 0, 2 + i * th + th / 2, 0));
        top = 2 + st.plies * th; parts.add(cyl(how === 'ream' ? r * .8 : r, .04, DARK, 0, top + .01, 0, 20));
        bit.visible = how !== 'punch'; tag.userData.setText(HOW[how][0].toLowerCase());
      },
      update(dt, t) { bit.position.y = top + .35 + .5 * Math.abs(Math.sin(t * 1.6)); bit.rotation.y = t * 9; },
      debug: () => ({ how: holeMethod(st), hole: holeSize(st.d) }),
    };
  },
  draw(c, W, H, st) {
    const how = holeMethod(st), d0 = holeSize(st.d);
    head(c, 'RIVET AND BOLT HOLES · cl. 513.5.5');
    c.fillStyle = OXIDE; c.font = `700 19px ${F}`; c.fillText(HOW[how][0], 18, 60);
    const y = lines(c, HOW[how][1], 18, 84, W - 36, 18, INK, `500 13.5px ${F}`);
    kv(c, W, [[`Hole for an M${st.d} bolt: ${st.d >= 25 ? '+ 2.0' : '+ 1.5'} mm`, `${d0} mm`], ['Sub-drilled size, where reamed', how === 'ream' ? `${d0 - 3} mm` : '—'], ['Close tolerance bolts: hole = shank', '+ 0.15, − 0.0 mm'], ['Friction grip bolts, up to three plies', 'drilled, + 1.5 mm']], y + 12, 26);
    foot(c, H, `${st.plies} × ${st.t} mm, ${st.main ? 'main' : 'secondary'} member, E ${st.fy}`);
  },
  steps: [
    { title: 'Drilled, not punched', text: 'Punching tears and hardens the steel round the hole. Main members are drilled. Switch to a secondary member and a thin plate.',
      check: { q: 'Holes may be punched only in secondary members not thicker than… (cl. 513.5.5.1)', options: ['12 mm, steel up to E 250', '25 mm', '6 mm'], answer: 0, why: 'All holes shall be drilled, except for secondary members and members that do not carry the main load, which can be punched if not over 12 mm thick, for steel up to Grade E 250 (cl. 513.5.5.1).' } },
    { title: 'Reamed after assembly', text: 'Add a second thickness, or drag to a thick plate. The hole is first made 3 mm small, then reamed true through the assembled parts.',
      check: { q: 'For E 250 steel, sub-drilling and reaming is required when the main material is thicker than…', options: ['20 mm', '12 mm', '40 mm'], answer: 0, why: 'Holes through more than one thickness, or where main material exceeds 20 mm (up to E 250) or 16 mm (E 300 and above), are sub-drilled or sub-punched 3 mm under and reamed (cl. 513.5.5.1).' } },
    { title: 'How large', text: 'The hole is a little larger than the bolt.',
      check: { q: 'The hole for a 20 mm bolt or rivet is… (cl. 513.5.5.1)', options: ['21.5 mm', '20 mm', '24 mm'], answer: 0, why: 'The diameter of holes is 1.5 mm larger for bolts and rivets up to 25 mm diameter, and 2.0 mm larger for 25 mm and above (cl. 513.5.5.1).' } },
  ],
});

// ---------------------------------------------------------------- 2 · tightening by the turn of the nut
const FR = v => v == null ? '—' : ({ [1 / 3]: '1/3', [1 / 2]: '1/2', [2 / 3]: '2/3', [5 / 6]: '5/6' })[v] + ' turn';
export const tighten = spread({
  init: { len: 5, sloped: false },
  chips: [['sloped', [false, true], v => v ? 'One face sloped under 1:20' : 'Both faces normal']],
  slider: { key: 'len', name: 'Length', label: 'bolt length · drag', values: range(2, 11, 1), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = stand(group, 1.3, -.4), m = paint(), parts = new THREE.Group(), nut = new THREE.Group(); g.add(parts, nut);
    nut.add(cyl(.95, .7, SM.steel, 0, 0, 0, 6), box(.16, .08, .5, REDP, 0, .39, .6));
    const tag = holo.label('', TAG); tag.position.set(0, 9.6, -5); group.add(tag); let turn = 1 / 3;
    return {
      place() {
        dispose(parts); parts.clear(); const L = st.len * .55, y0 = 2.2; turn = turnOfNut(st.len, st.sloped) ?? 0;
        parts.add(box(6, L / 2, 3.6, m, 0, y0 + L / 4, 0), box(6, L / 2, 3.6, paint(0xb0732a), 0, y0 + 3 * L / 4, 0), cyl(.5, L + 1.8, SM.steel, 0, y0 + L / 2, 0, 16), cyl(.95, .6, SM.steel, 0, y0 - .3, 0, 6), cyl(1.15, .12, SM.steel, 0, y0 + L + .06, 0, 20));
        nut.position.set(0, y0 + L + .47, 0); tag.userData.setText(`snug tight, then ${FR(turnOfNut(st.len, st.sloped))}`);
      },
      update(dt, t) { const p = (t * .35) % 1.6; nut.rotation.y = -Math.min(1, p) * turn * 2 * Math.PI; },
      debug: () => ({ turn: turnOfNut(st.len, st.sloped) }),
    };
  },
  draw(c, W, H, st) {
    const row = st.len <= 4 ? 0 : st.len <= 8 ? 1 : 2;
    head(c, 'BOLTED CONSTRUCTION · cl. 513.5.6.1');
    c.font = `600 12px ${F}`; c.fillStyle = DIMC; c.textAlign = 'right'; c.fillText('faces normal', W - 110, 50); c.fillText('one sloped', W - 18, 50); c.textAlign = 'left';
    [['Bolt length up to 4 diameters', '1/3 turn', '1/2'], ['Over 4, under 8 diameters', '1/2 turn', '2/3'], ['Over 8, under 12 diameters', '2/3 turn', '5/6']].forEach(([a, b, d], i) => {
      const y = 76 + i * 27; if (i === row) { c.fillStyle = 'rgba(138,63,28,.14)'; c.fillRect(10, y - 18, W - 20, 25); }
      c.fillStyle = INK; c.font = `500 14px ${F}`; c.fillText(a, 18, y); c.textAlign = 'right';
      [b, d].forEach((v, j) => { const on = i === row && (j === 1) === st.sloped; c.fillStyle = on ? OXIDE : DIMC; c.font = `${on ? 700 : 500} 15px ${F}`; c.fillText(v, j ? W - 18 : W - 110, y); }); c.textAlign = 'left';
    });
    const y = kv(c, W, [['Tightened to', '70 % of minimum tensile strength'], ['Slope under head or nut', '≤ 1 : 20, else a tapered washer'], ['A washer under', 'whichever is turned']], 172, 26);
    lines(c, 'Snug tight: the full effort of a man with an ordinary wrench, or a few impacts of an impact wrench.', 18, y + 2, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, `Bolt ${st.len} diameters long · rotation for guidance`);
  },
  steps: [
    { title: 'Snug, then a turn', text: 'First every bolt in the joint is made snug tight. Then each nut is turned a set amount more, which stretches the bolt to its tension. Watch the red mark.',
      check: { q: 'Each fastener is tightened to the specified value, or to… of its specified minimum tensile strength (cl. 513.5.6.1)', options: ['70 per cent', '100 per cent', '25 per cent'], answer: 0, why: 'Each fastener shall be tightened to the specified value or to 70 per cent of the specified minimum tensile strength, by the turn of nut method, calibrated wrenches or torque wrenches (cl. 513.5.6.1).' } },
    { title: 'Longer bolts turn further', text: 'Drag the bolt longer. A long bolt needs more rotation to reach the same stretch.',
      check: { q: 'A bolt up to 4 diameters long, both faces normal to its axis, is turned…', options: ['1/3 turn', '2/3 turn', 'one full turn'], answer: 0, why: 'Up to 4 diameters: 1/3 turn; over 4 and under 8: 1/2 turn; over 8 and under 12: 2/3 turn. With one face sloped under 1:20: 1/2, 2/3 and 5/6 (cl. 513.5.6.1).' } },
    { title: 'Sloping faces', text: 'Switch to one sloped face. More rotation is needed, and a steeper slope needs a tapered washer.',
      check: { q: 'The slope of surfaces in contact with the bolt head and nut shall not exceed…', options: ['1 : 20', '1 : 4', '1 : 100'], answer: 0, why: 'Not more than 1:20 in a plane normal to the bolt axis; otherwise a suitable tapered washer is used (cl. 513.5.6.1).' } },
  ],
});

// ---------------------------------------------------------------- 3 · fabrication tolerances
const ITEM = {
  length: ['Length of a member 10 m long', () => TOLERANCE.length(10000), 'Other members up to 12 m: ± 2 mm; over 12 m: ± 3.5 mm. Both ends finished for contact bearing: ± 1 mm (Table 20, 1).'],
  width: ['Width of a built-up girder', () => TOLERANCE.width(), 'Width of built-up girders: ± 3 mm. Members to be inserted in other members: 0, − 3 mm (Table 20, 2).'],
  depth: ['Depth of a girder', () => TOLERANCE.depth(), 'Depth of solid web and open web girders: + 3 mm, − 2 mm (Table 20, 3).'],
  column: ['Straightness of a column 3 m long', () => TOLERANCE.column(3000), 'Deviation from straightness of columns: L/300, subject to a maximum of 15 mm (Table 20, 4).'],
  web: ['Flatness of a web 1600 mm deep', () => TOLERANCE.web(1600), 'Flatness of plate webs, in a length equal to the depth: 0.005 d, to a maximum of 2 mm (Table 20, 6).'],
  tilt: ['Tilt of a flange 300 mm wide, at a splice', () => TOLERANCE.tilt(300), 'At splices, stiffeners, supports and bearings: 0.005 b, maximum 2 mm; elsewhere 0.015 b, maximum 4 mm (Table 20, 7).'],
  butt: ['Misalignment at a butt weld, 12 mm plate', () => TOLERANCE.butt(12), 'In welded butt joints: the lesser of 0.15 × the thinner part and 3 mm (cl. 513.5.14.2).'],
};
const tol = st => { const [lo, hi] = ITEM[st.item][1]().map(v => +v.toFixed(2)); return { lo, hi, ok: st.dev >= -lo - 1e-9 && st.dev <= hi + 1e-9 }; };
export const tolerance = spread({
  init: { item: 'length', dev: 1 },
  chips: [['item', Object.keys(ITEM), v => ({ length: 'Length', width: 'Width', depth: 'Depth', column: 'Column straightness', web: 'Web flatness', tilt: 'Flange tilt', butt: 'Butt joint' })[v]]],
  slider: { key: 'dev', name: 'Deviation', label: 'deviation · drag', values: range(-5, 12, .5), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.1); group.add(g);
    const m = paint(), b = beam(g, m, 30), tag = holo.label('', TAG); tag.position.set(0, 9, -5); group.add(tag);
    const ghost = holo.wireBox(14, 2.4, 1.6, holo.DIM); ghost.position.y = 3.6; g.add(ghost);   // the nominal outline, from the drawing
    return {
      place() { const r = tol(st); m.color.setHex(r.ok ? OXIDE_HEX : 0xc23b2f); bend(b, x => st.item === 'column' || st.item === 'web' ? st.dev * .1 * (1 - (2 * x / 14) ** 2) : 0); b.scale.x = 1 + (st.item === 'length' ? st.dev * .015 : 0); b.scale.y = 1 + (st.item === 'depth' ? st.dev * .05 : 0); b.scale.z = 1 + (st.item === 'width' ? st.dev * .06 : 0); b.rotation.x = st.item === 'tilt' ? st.dev * .06 : 0; tag.userData.setText(`${st.dev > 0 ? '+' : ''}${st.dev} mm ${r.ok ? 'within tolerance' : 'outside tolerance'}`); },   // deviations drawn far larger than true
      debug: () => tol(st),
    };
  },
  draw(c, W, H, st) {
    const r = tol(st), x0 = 30, w = W - 60, X = v => x0 + (Math.max(-5, Math.min(12, v)) + 5) / 17 * w;   // the scale runs from −5 to +12 mm; wider limits stop at its ends
    head(c, 'FABRICATION TOLERANCES · Table 20');
    c.fillStyle = INK; c.font = `700 16px ${F}`; c.fillText(ITEM[st.item][0], 18, 58);
    c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x0, 82, w, 16); c.fillStyle = 'rgba(31,122,69,.55)'; c.fillRect(X(-r.lo), 82, X(r.hi) - X(-r.lo), 16);
    c.fillStyle = r.ok ? INK : BAD; c.fillRect(X(st.dev) - 1.5, 76, 3, 28); c.fillStyle = DIMC; c.font = `500 11px ${F}`; c.fillText('0', X(0) - 3, 116); c.fillText(`−${r.lo}`, X(-r.lo) - 10, 116); c.fillText(`+${r.hi}`, X(r.hi) - 8, 116);
    c.fillStyle = r.ok ? OK : BAD; c.font = `700 16px ${F}`; c.fillText(`${mark(r.ok)} Deviation ${st.dev > 0 ? '+' : ''}${st.dev} mm · allowed −${r.lo} to +${r.hi} mm`, 18, 146);
    const y = lines(c, ITEM[st.item][2], 18, 172, W - 36, 18, INK, `500 13.5px ${F}`);
    lines(c, 'A machined bearing surface: within 0.25 mm over a square of side 0.5 m (513.5.13.2).', 18, y + 6, W - 36, 17, DIMC, `500 12.5px ${F}`);
    foot(c, H, 'Parts in an assembly shall fit together within these tolerances');
  },
  steps: [
    { title: 'Nothing is exact', text: 'No member comes out of the shop at exactly its drawn size. Drag the deviation: the green band is what the Code allows.',
      check: { q: 'The length of an ordinary member up to 12 m long may deviate by… (Table 20)', options: ['± 2 mm', '± 10 mm', '± 0.25 mm'], answer: 0, why: 'Other members: up to and including 12 m, ± 2 mm; over 12 m, ± 3.5 mm. Members with both ends finished for contact bearing: ± 1 mm (Table 20, 1).' } },
    { title: 'Shape as well as size', text: 'Pick the straightness of a column, the flatness of a web and the tilt of a flange.',
      check: { q: 'A plate web may be out of flat, in a length equal to its depth, by… (Table 20)', options: ['0.005 d, maximum 2 mm', '0.05 d', '10 mm'], answer: 0, why: 'Deviation from flatness of plate webs of built-up members in a length equal to the depth: 0.005 d to a maximum of 2 mm (Table 20, 6).' } },
    { title: 'Butt joints', text: 'Pick the butt joint. Plates that do not line up put a kink in the line of force.',
      check: { q: 'In a welded butt joint, misalignment shall not exceed… (cl. 513.5.14.2)', options: ['the lesser of 0.15 t and 3 mm', '0.5 t', '10 mm'], answer: 0, why: 'The lesser of 0.15 times the thickness of the thinner part or 3 mm; a larger step from rolling tolerances is smoothed to a slope not steeper than 1:4 (cl. 513.5.14.2).' } },
  ],
});

// ---------------------------------------------------------------- 4 · heat in the shop
const PROC = {
  straight: ['Straightening by heating', 0, 650, 'Under a controlled procedure; the temperature of the steel not more than 650 °C. Hammering is not permitted. No accelerated cooling without approval (513.4.1).'],
  curve: ['Heat curving', 0, 620, 'The steel shall not exceed 620 °C, and is not artificially cooled until it has fallen to 315 °C by natural cooling. Steel with a yield stress over 360 MPa is not heat curved (513.4.2).'],
  rivet: ['Heating mild steel rivets, hydraulic riveting', 650, 700, 'Heated uniformly to a light cherry red, 650 °C to 700 °C. High tensile rivets are heated up to 1100 °C. A rivet heated beyond the limit shall not be driven (513.5.7.3).'],
  relief: ['Stress relieving, holding temperature', 0, 600, 'Furnace not above 300 °C when the assembly goes in; held at a maximum of 600 °C, with no two points more than 80 °C apart; cooled in the closed furnace above 300 °C (513.5.9).'],
};
const ht = st => { const [, lo, hi] = PROC[st.proc]; return { lo, hi, ok: st.T >= lo && st.T <= hi }; };
export const heat = spread({
  init: { proc: 'straight', T: 500 },
  chips: [['proc', Object.keys(PROC), v => ({ straight: 'Straightening', curve: 'Heat curving', rivet: 'Rivets', relief: 'Stress relieving' })[v]]],
  slider: { key: 'T', name: 'T', label: 'temperature · drag', values: range(200, 1100, 50), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = new THREE.Group(); g.position.set(0, .5, -5); g.scale.setScalar(1.1); group.add(g);
    const m = new THREE.MeshStandardMaterial({ color: OXIDE_HEX, roughness: .5, metalness: .3, emissive: 0x000000 }), b = beam(g, m, 30), tag = holo.label('', TAG); tag.position.set(0, 9, -5); group.add(tag);
    const cold = new THREE.Color(0x000000), red = new THREE.Color(0xc02a10), yel = new THREE.Color(0xffb020);
    return {
      place() { const r = ht(st), k = Math.max(0, (st.T - 400) / 700); m.emissive.copy(k < .5 ? cold.clone().lerp(red, k * 2) : red.clone().lerp(yel, (k - .5) * 2)); bend(b, x => st.proc === 'curve' ? .5 * (1 - (2 * x / 14) ** 2) : 0); tag.userData.setText(`${st.T} °C ${r.ok ? 'allowed' : st.T > r.hi ? 'too hot' : 'not hot enough'}`); },
      debug: () => ht(st),
    };
  },
  draw(c, W, H, st) {
    const r = ht(st), [name, , , text] = PROC[st.proc], x0 = 30, w = W - 60, X = v => x0 + (v - 200) / 900 * w;
    head(c, 'HEAT IN THE SHOP · cl. 513.4, 513.5.7, 513.5.9');
    c.fillStyle = INK; c.font = `700 16px ${F}`; c.fillText(name, 18, 58);
    c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x0, 82, w, 16); c.fillStyle = 'rgba(31,122,69,.55)'; c.fillRect(X(Math.max(200, r.lo)), 82, X(r.hi) - X(Math.max(200, r.lo)), 16);
    c.fillStyle = r.ok ? INK : BAD; c.fillRect(X(st.T) - 1.5, 76, 3, 28); c.fillStyle = DIMC; c.font = `500 11px ${F}`; c.fillText(`${r.hi} °C`, X(r.hi) - 16, 116); if (r.lo) c.fillText(String(r.lo), X(r.lo) - 18, 116);
    c.fillStyle = r.ok ? OK : BAD; c.font = `700 16px ${F}`; c.fillText(`${mark(r.ok)} ${st.T} °C`, 18, 146);
    lines(c, text, 18, 172, W - 36, 18, INK, `500 13.5px ${F}`);
    foot(c, H, 'Heating and cooling rates to suit the steel, as agreed (513.4.1)');
  },
  steps: [
    { title: 'Heat changes steel', text: 'Heat lets steel be straightened and curved, but too much spoils it. Drag the temperature.',
      check: { q: 'When straightening by heating, the steel shall not be hotter than… (cl. 513.4.1)', options: ['650 °C', '1100 °C', '300 °C'], answer: 0, why: 'Straightening by heating is done under a controlled procedure, and the temperature of the steel shall not be more than 650 °C; hammering is not permitted (cl. 513.4.1).' } },
    { title: 'Curving a girder', text: 'Pick Heat curving. The limit is lower, and the girder must cool by itself for a while.',
      check: { q: 'Steel shall not be heat curved if its yield stress is more than… (cl. 513.4.2.1)', options: ['360 MPa', '250 MPa', '540 MPa'], answer: 0, why: 'Steel having a yield stress of more than 360 MPa shall not be heat curved; in heat bending the steel shall not exceed 620 °C (cl. 513.4.2.1, 513.4.2.3).' } },
    { title: 'Rivets', text: 'Pick Rivets. Here there is a lower limit too: a rivet must be hot enough to fill its hole.',
      check: { q: 'Mild steel rivets for hydraulic riveting are heated to… (cl. 513.5.7.3)', options: ['650 °C to 700 °C, light cherry red', '300 °C', '1500 °C'], answer: 0, why: 'A light cherry red colour between 650 °C and 700 °C for hydraulic riveting; high tensile steel rivets up to 1100 °C (cl. 513.5.7.3).' } },
  ],
});

// ---------------------------------------------------------------- 5 · erection
const NH = 20;
const er = st => { const n = Math.round(st.pct / 100 * NH), drifts = Math.round(n / 5); return { n, drifts, bolts: n - drifts, ok: st.pct >= 50 }; };
export const erect = spread({
  init: { pct: 50 },
  slider: { key: 'pct', name: 'Filled', label: 'holes filled · drag', values: range(10, 100, 10), at: [-9, .5, -.6] },
  model({ holo, group, st }) {
    const g = table(group, 2.6, .5, 1.2), m = paint(), parts = new THREE.Group(); g.add(box(7, .3, 5, m, -3.56, 0, 0), box(7, .3, 5, m, 3.56, 0, 0), box(7, .2, 5, GREEN, 0, .25, 0), parts);
    const tag = holo.label('', TAG); tag.position.set(0, 8.6, -5); group.add(tag);
    return {
      place() {
        dispose(parts); parts.clear(); const r = er(st); let k = 0;
        for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++, k++) {
          const x = (i < 3 ? -3.1 + i * 1.1 : .9 + (i - 3) * 1.1) + (i >= 3 ? .0 : 0), z = -1.65 + j * 1.1, idx = (k * 7) % NH;
          if (idx >= r.n) parts.add(cyl(.2, .03, DARK, x, .37, z, 14));
          else if (idx % 5 === 4) { const d = new THREE.Mesh(new THREE.ConeGeometry(.22, 1.2, 12), SM.steel); d.position.set(x, .8, z); d.rotation.x = Math.PI; parts.add(d); }
          else parts.add(cyl(.3, .3, r.ok ? SM.steel : REDP, x, .5, z, 6));
        }
        tag.userData.setText(`${st.pct} % of the holes filled ${mark(r.ok)}`);
      },
      debug: () => er(st),
    };
  },
  draw(c, W, H, st) {
    const r = er(st);
    head(c, 'ERECTION · cl. 514.4, 514.5');
    const y = kv(c, W, [[`Holes in the joint`, String(NH)], ['Filled with service bolts and drifts', `${r.n} · ${st.pct} %`], ['Not less than 50 per cent', mark(r.ok), r.ok ? OK : BAD], ['Service bolts to drifts, 4 : 1', `${r.bolts} bolts, ${r.drifts} drifts`]], 60, 28);
    lines(c, 'A joint to be riveted or bolted is held in close contact by service bolts, fully tightened, before the final connection. The steelwork is set out to line and level, and modules are trial assembled before erection (514.5.7, 514.5.8, 514.5.10).', 18, y + 6, W - 36, 18, INK, `500 13.5px ${F}`);
    foot(c, H, 'The erection scheme is checked for safety at every stage (514.4.5)');
  },
  steps: [
    { title: 'Holding a joint', text: 'Before a site joint is finally riveted or bolted, it is drawn up tight with service bolts and lined up with drifts. Drag how many holes are filled.',
      check: { q: 'A joint is made by filling not less than… of the holes with service bolts and drifts (cl. 514.5.10)', options: ['50 per cent', '10 per cent', '100 per cent'], answer: 0, why: 'Joints shall be made by filling not less than 50 per cent of the holes with service bolts and drifts in the ratio of 4:1 (cl. 514.5.10).' } },
    { title: 'A scheme for every stage', text: 'Erection is designed like the bridge itself: stage by stage, with calculations, drawings and working instructions.',
      check: { q: 'The erection scheme shall be checked to ensure… (cl. 514.4.5)', options: ['safety of the bridge at all stages of erection', 'only the final condition', 'the colour of the paint'], answer: 0, why: 'It shall be checked to ensure the adequacy of the affected components and the safety of the bridge at all stages of erection (cl. 514.4.5).' } },
    { title: 'Try it first', text: 'Modules are pre-assembled in a yard and matched with their neighbours by trial assembly before they are lifted.',
      check: { q: 'Before erection work starts, equipment, tackles and ropes are… (cl. 514.5.1)', options: ['tested to ensure their efficient working', 'painted', 'left as they are'], answer: 0, why: 'Prior to commencement of erection all equipment, machinery, tools, tackles and ropes need to be tested to ensure their efficient working (cl. 514.5.1).' } },
  ],
});
