// Spread 1 · Drawing the shield (cl. 2.1, Plate 1) — the fabrication drawing on the sign-shop bench
// A drawing board tilted to the page. A pen draws the plate, then the shield, then the lettering; the dimension chain
// pops in afterwards. A 600 mm steel rule runs down the left; drag the cursor across the plate and it reads the height
// from the top and names the band. "Make it" paints the plate in shop order; "Wrong plate" squashes it onto 450 × 500.
import * as THREE from 'three';
import { roundedRectPts, tagged } from './util.js';
import * as props from '../engine/props.js';
import { Anims } from '../engine/anim.js';
import { makeGuide } from '../engine/guide.js';

export default {
  shots: [
    { pos: [14, 26, 22], look: [13, 10, -3], dur: 1.8, hold: 2.6, text: 'A shield on a 450 by 600 mm plate (cl. 2.1), drawn the way Plate 1 draws it, with a steel rule down the left.' },
    { pos: [22, 18, 8], look: [16, 10, -3], dur: 1.8, hold: 2.6, text: 'Down the right: 12, 75, 100, 75, 200, 126, 12. The bands add up to 600.' },
  ],
  build(ctx) {
    const { holo, sign, ui } = ctx; const { SPEC } = sign; const S = .036;   // cm per mm: the plate is 16 × 21.6 cm on the board
    const P = SPEC.plate, cx = P.w / 2, cy = P.h / 2;
    const C = pts => pts.map(p => ({ x: p.x - cx, y: p.y - cy }));
    const group = new THREE.Group(); group.add(holo.projector(12));
    const board = new THREE.Group(); board.position.set(0, 9.4, -5); board.rotation.x = -Math.PI / 2 + .95; group.add(board);  // 54° off the page; centred high enough that the plate's bottom edge clears the page
    const drawing = new THREE.Group(); board.add(drawing);   // everything that is the plate itself (squashed by the wrong-plate toggle)

    // the plate as a steel sheet, the two outlines, the lettering in cyan ink
    const slab = props.steelPlate(S); slab.position.z = -.6; drawing.add(slab);
    const plateLine = holo.outline(roundedRectPts(P.w, P.h, P.r), holo.CYAN, { scale: S, width: .09 });
    const shieldPts = C(sign.shieldOutline());
    const shieldLine = holo.outline(shieldPts, holo.WHITE, { scale: S, width: .11 });
    const fill = holo.fillPoly(shieldPts, holo.CYAN, { scale: S, opacity: .05 }); fill.position.z = -.03; fill.userData.shield = true;
    const gc = document.createElement('canvas'); gc.width = 900; gc.height = 1200; sign.drawFace(gc, '42', { yellow: 'rgba(0,0,0,0)', ink: '#9fe8ff', noBorder: true });
    const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace; gt.anisotropy = 8;
    const glyphs = new THREE.Mesh(new THREE.PlaneGeometry(P.w * S, P.h * S), new THREE.MeshBasicMaterial({ map: gt, transparent: true, opacity: .6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); glyphs.position.z = .02;
    drawing.add(plateLine, shieldLine, fill, glyphs);
    // the fabricated plate, painted in shop stages over the same sheet
    const madeC = document.createElement('canvas'); madeC.width = 900; madeC.height = 1200;
    const madeT = new THREE.CanvasTexture(madeC); madeT.colorSpace = THREE.SRGBColorSpace; madeT.anisotropy = 8;
    // hidden by visibility, not opacity: an invisible plane still writes depth and would hide the outlines behind it
    const made = new THREE.Mesh(new THREE.PlaneGeometry(P.w * S, P.h * S), new THREE.MeshBasicMaterial({ map: madeT, transparent: true })); made.position.z = .01; made.visible = false; drawing.add(made);
    const H = SPEC.holes;
    for (const [hx, hy] of [[-H.apart / 2, H.fromTop], [H.apart / 2, H.fromTop], [-H.apart / 2, P.h - H.fromBottom], [H.apart / 2, P.h - H.fromBottom]]) { const r = holo.ring(H.d / 2 * S, holo.WHITE, { width: .04 }); r.rotation.x = Math.PI / 2; r.position.set(hx * S, -(hy - cy) * S, .05); drawing.add(r); }
    const pen = new THREE.Mesh(new THREE.SphereGeometry(.32, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); pen.visible = false; pen.position.z = .3; board.add(pen);
    const plateV = roundedRectPts(P.w, P.h, P.r).map(p => new THREE.Vector3(p.x * S, -p.y * S, .3)), shieldV = shieldPts.map(p => new THREE.Vector3(p.x * S, -p.y * S, .3));

    // the bands: hover targets, tinted alternately when switched on
    const zones = sign.zoneTops(), quads = [];
    zones.forEach((z, i) => { const q = new THREE.Mesh(new THREE.PlaneGeometry((P.w - 24) * S, z.h * S), holo.glassMat(i % 2 ? holo.AMBER : holo.CYAN, { opacity: 0, scan: 0 })); q.position.set(0, -(z.top + z.h / 2 - cy) * S, .04); q.userData.zone = z; drawing.add(q); quads.push(q); });
    // dimensions: the chain down the right, 450 across the top, 600 down the left, the border called out
    const dims = new THREE.Group(); const xr = (cx + 34) * S;
    for (const z of zones) dims.add(holo.dimension([xr, -(z.top - cy) * S, 0], [xr, -(z.bottom - cy) * S, 0], String(z.h), { h: z.h <= 12 ? .8 : 1.15, tick: .4 }));
    dims.add(holo.dimension([-cx * S, (cy + 26) * S, 0], [cx * S, (cy + 26) * S, 0], '450', { h: 1.2 }));
    // the straight sides and the curved bottom: 360 + 215 below the 12 mm top margin (Plate 1)
    const xr2 = (cx + 86) * S;   // a second chain well outside the band chain, so its labels never sit on the band numbers
    dims.add(holo.dimension([xr2, -(12 - cy) * S, 0], [xr2, -(372 - cy) * S, 0], '360 straight', { h: .8, tick: .3, color: holo.AMBER }));
    dims.add(holo.dimension([xr2, -(372 - cy) * S, 0], [xr2, -(587 - cy) * S, 0], '215 curve', { h: .8, tick: .3, color: holo.AMBER }));
    dims.add(holo.tag('border 10 mm · 12 mm in from the edge', [-(cx - 17) * S, (cy - 40) * S, .1], [2, 5.8, 0]));   // label above the plate's top-left corner, a clear line above the 450 dim
    dims.add(holo.tag('13 mm holes for 10 mm bolts · Plate 2', [H.apart / 2 * S, -(H.fromTop - cy) * S, .1], [6.5, 1.6, 0]));
    board.add(dims);

    // the steel rule: 600 mm graduated from the top of the plate, and the cursor that slides across it
    // a real tape: numbers set along the rule every 100 mm, big enough to read from the overview; unlit so nothing glares
    const RW = 2.1, rc = document.createElement('canvas'); rc.width = 300; rc.height = 3200;
    { const g = rc.getContext('2d'); g.fillStyle = '#e8e4da'; g.fillRect(0, 0, rc.width, rc.height); g.fillStyle = '#15191e';
      const Y = mm => (mm + 10) / 620 * rc.height;
      for (let mm = 0; mm <= 600; mm += 10) { const len = mm % 100 ? mm % 50 ? 40 : 70 : 110; g.fillRect(rc.width - len, Y(mm) - 3, len, 6); }
      for (let mm = 0; mm <= 600; mm += 50) { const big = !(mm % 100); g.save(); g.translate(big ? 92 : 112, Y(mm) + (mm === 0 ? 70 : mm === 600 ? -20 : 0)); g.rotate(-Math.PI / 2); g.font = `800 ${big ? 128 : 76}px Inter, Segoe UI, Arial`; g.textAlign = 'center'; g.fillText(String(mm), 0, 0); g.restore(); }
      g.fillStyle = '#b8342f'; g.fillRect(0, 0, 14, rc.height); }   // the red edge of a surveyor's folding rule
    const rt = new THREE.CanvasTexture(rc); rt.colorSpace = THREE.SRGBColorSpace; rt.anisotropy = 16;
    const rule = new THREE.Mesh(new THREE.BoxGeometry(RW, 620 * S, .12), [steelSide(), steelSide(), steelSide(), steelSide(), new THREE.MeshBasicMaterial({ map: rt }), steelSide()]); rule.position.set(-(cx + 33) * S, 0, .08); board.add(rule);   // tight beside the plate: nothing of the drawing crosses the spine
    function steelSide() { return new THREE.MeshStandardMaterial({ color: '#cfd6dc', roughness: .5, metalness: .4 }); }
    const cursor = new THREE.Mesh(new THREE.BoxGeometry((P.w + 130) * S, .32, .1), holo.glassMat(holo.AMBER, { opacity: .55, scan: 0 })); cursor.position.set(-8 * S, -(262 - cy) * S, .2); cursor.userData.cursor = true; board.add(cursor);
    const readout = holo.label(' ', { h: 1, color: '#ffd7a8', bg: 'rgba(6,18,28,.84)', align: 'left' }); readout.position.z = .4; board.add(readout);
    const knob = holo.handle('build', { label: 'draw it', kind: 'knob' }); knob.position.set(-9.5, 0, 8.5); group.add(knob);

    // the shop sequence
    const STAGES = [
      { t: 'Blank sheet: 450 × 600 mm steel, corners R 12 (cl. 2.1, Plate 1).', opts: { yellow: '#8d949a', ink: 'rgba(0,0,0,0)', noBorder: true } },
      { t: 'First coat: Canary Yellow, IS Colour No. 309 (cl. 2.2).', opts: { ink: 'rgba(0,0,0,0)', noBorder: true } },
      { t: 'Border masked and painted: 10 mm black, 12 mm in from the edge (Plate 1).', opts: { noLetters: true, noNumerals: true } },
      { t: 'Letter stencils: N H, 100 mm high, 16 mm stroke, 45 mm apart (Fig. 1).', opts: { noNumerals: true } },
      { t: 'Numerals: 200 mm, spaced by Plate 5. Ready for the post.', opts: {} },
    ];
    let t = 99, building = false, bandsOn = false, hovered = null, stage = -1, wrong = false, lastMm = -1; const anims = new Anims();
    const setBand = (q, v) => { q.material.uniforms.uOpacity.value = v; };
    const along = (V, k) => V[Math.min(V.length - 1, Math.floor(THREE.MathUtils.clamp(k, 0, 1) * (V.length - 1)))];
    const toDrawing = () => { anims.stop('make'); stage = -1; made.visible = false; glyphs.visible = fill.visible = true; };
    const showStage = i => { stage = i; sign.drawFace(madeC, '42', STAGES[i].opts); madeT.needsUpdate = true; made.visible = true; glyphs.visible = fill.visible = false; ui.caption(STAGES[i].t, `Shop step ${i + 1} of ${STAGES.length}`, 3500); };
    const makeIt = () => { toDrawing(); building = false; pen.visible = false; holo.reveal(plateLine, 1); holo.reveal(shieldLine, 1); STAGES.forEach((_, i) => anims.after(.2 + i * 1.2, () => showStage(i), 'make')); };
    const buildIt = () => { if (building) return; toDrawing(); t = 0; building = true; pen.visible = true; dims.children.forEach(d => d.scale.setScalar(.01)); ui.caption('Plate first, then the shield, then the lettering, then the dimensions.', 'Plate 1'); };
    const setWrong = v => { wrong = v; drawing.scale.y = v ? 500 / 600 : 1; dims.visible = !v; ui.caption(v ? 'A 450 × 500 sheet with the same art squashed on: the numerals fall to 167 mm, the bands no longer add up and the shield loses its shape. The standard fixes the plate at 450 × 600 (cl. 2.1).' : 'Back on the 450 × 600 plate.', v ? 'Wrong plate' : 'cl. 2.1', 6000); };
    const readCursor = () => {
      const mm = THREE.MathUtils.clamp(Math.round(cy - cursor.position.y / S), 0, 600), inner = mm / (wrong ? 500 / 600 : 1);
      if (mm === lastMm) return; lastMm = mm;
      const z = zones.find(z => inner >= z.top && inner < z.bottom), outside = wrong && mm > 500;
      const text = outside ? `${mm} mm · off the 500 mm sheet` : z ? `${mm} mm · ${z.label}` : `${mm} mm from the top`;
      readout.userData.text = text; readout.userData.setText(text);
      readout.position.set((cx + 70) * S + readout.scale.x / 2, cursor.position.y, .4);
      quads.forEach(q => setBand(q, q.userData.zone === z ? .28 : bandsOn ? .1 : 0));
    };
    const api = {
      group, targets: [...quads, knob, fill, cursor], dragPlane: 'xy',
      enter() { anims.after(.5, buildIt); },
      tap(hit) { if (guide.tap(hit)) return; if (tagged(hit.object, 'handle') || hit.object.userData.shield) buildIt(); else if (hit.object.userData.zone) { cursor.position.y = -(hit.object.userData.zone.top + hit.object.userData.zone.h / 2 - cy) * S * drawing.scale.y; readCursor(); ui.caption(`${hit.object.userData.zone.h} mm · ${hit.object.userData.zone.label}`, 'Band', 2500); } },
      drag(d) { if (d.hit.object.userData.cursor) { const y = board.worldToLocal(d.world.clone()).y; cursor.position.y = THREE.MathUtils.clamp(y, -cy * S, cy * S); readCursor(); } },
      actions: [
        { label: 'Draw it', run: buildIt },
        { label: 'Make it', run: makeIt },
        { label: 'Tint the bands', toggle: () => bandsOn, run: () => { bandsOn = !bandsOn; lastMm = -1; readCursor(); if (bandsOn) ui.caption('12 + 75 + 100 + 75 + 200 + 126 + 12 = 600 mm.', 'The height adds up'); } },
        { label: 'Compass construction', toggle: () => radii.visible, run: () => { radii.visible = !radii.visible; if (radii.visible) ui.caption('The curved bottom is struck with R 318 arcs from two centres and a central R 132, joined to the straight sides with R 120 fillets (Plate 1).', 'Construction'); } },
        { label: 'Wrong plate (450 × 500)', toggle: () => wrong, run: () => { setWrong(!wrong); lastMm = -1; readCursor(); } },
      ],
      a11y: [{ label: 'Move the rule cursor down one band', run: () => { const mm = cy - cursor.position.y / S; const z = zones.find(z => z.top > mm + 1) || zones[0]; cursor.position.y = -(z.top + z.h / 2 - cy) * S; readCursor(); ui.caption(readout.userData.text || '', 'Rule', 3000); } }],
      hover(hit) {
        if (hovered && hovered !== hit?.object) { lastMm = -1; readCursor(); }
        hovered = hit?.object || null; const z = hovered?.userData.zone;
        if (z) { setBand(hovered, .28); ui.caption(`${z.h} mm · ${z.label}`, 'Band', 2500); }
      },
      update(dt) {
        anims.tick(dt);
        if (building) {
          t += dt;
          const k1 = t / 1.1, k2 = (t - 1.1) / 1.7, k3 = (t - 2.9) / .7, k4 = (t - 3.5);
          holo.reveal(plateLine, k1); holo.reveal(shieldLine, k2);
          pen.position.copy(k1 < 1 ? along(plateV, k1) : along(shieldV, k2)); pen.visible = k2 < 1;
          glyphs.material.opacity = .6 * THREE.MathUtils.clamp(k3, 0, 1); fill.visible = k3 > 0;
          dims.children.forEach((d, i) => d.scale.setScalar(THREE.MathUtils.clamp((k4 - i * .07) / .4, .01, 1)));
          if (t > 4.6) building = false;
        }
      },
      reset() { anims.clear(); toDrawing(); t = 99; building = false; pen.visible = false; holo.reveal(plateLine, 1); holo.reveal(shieldLine, 1); glyphs.material.opacity = .6; fill.visible = true; dims.children.forEach(d => d.scale.setScalar(1)); bandsOn = false; radii.visible = false; if (wrong) setWrong(false); cursor.position.y = -(262 - cy) * S; lastMm = -1; readCursor(); guide?.reset(); },
      get debug() { return { t, building, bandsOn, radii: radii.visible, stage, wrong, cursorMm: Math.round(cy - cursor.position.y / S), guide: guide?.debug }; },
    };
    // guided sequence: measure with the rule, add the bands up, then make it in the shop
    const guide = makeGuide(ctx, {
      anchor: [12.5, 20.5, -3], rotY: -.15, w: 10.5, h: 5,
      steps: [
        { title: 'The rule', show: ['Tint the bands'], text: 'A 600 mm steel rule runs down the left of the plate. Drag the amber cursor across it: the readout gives the height from the top and names the band you are in.' },
        { title: 'The bands', show: ['Tint the bands'], check: { q: 'From the top: 12 + 75 + 100 + 75 + 200 + 126 + 12. What does the plate add up to?', options: ['500 mm', '600 mm', '650 mm'], answer: 1, why: 'Exactly the 450 × 600 mm plate of cl. 2.1. Every band is fixed, so every shop in India draws the same shield.' } },
        { title: 'Make it', show: ['Make it', 'Wrong plate (450 × 500)'], text: 'Make it paints the plate in shop order: blank sheet, IS 309 coat, border, N H stencils, numerals. Then try Wrong plate: a 450 × 500 sheet squashes the whole design.' },
      ],
    });
    group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    // compass construction for the bottom (illustrative; labelled from the plate)
    const radii = new THREE.Group(); radii.visible = false;
    const arcPts = (ax, ay, r, a0, a1, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push({ x: ax + r * Math.cos(a) - cx, y: ay + r * Math.sin(a) - cy }); } return o; };
    radii.add(holo.outline(arcPts(cx + 100, 385, 318, Math.PI * .56, Math.PI * .96), holo.AMBER, { scale: S, closed: false, width: .05 }), holo.outline(arcPts(cx - 100, 385, 318, Math.PI * .04, Math.PI * .44), holo.AMBER, { scale: S, closed: false, width: .05 }), holo.outline(arcPts(cx, 588 - 132, 132, Math.PI * .12, Math.PI * .88), holo.AMBER, { scale: S, closed: false, width: .05 }));
    for (const [x, y] of [[cx + 100, 385], [cx - 100, 385], [cx, 456]]) { const c = holo.ring(.25, holo.AMBER, { width: .05 }); c.rotation.x = Math.PI / 2; c.position.set((x - cx) * S, -(y - cy) * S, .1); radii.add(c); }
    radii.add(holo.tag('R 318 from two centres · R 132 at the point · R 120 fillets', [(cx - 60 - cx) * S, -(560 - cy) * S, .1], [-7, -2.2, 0], { accent: holo.AMBER }));
    drawing.add(radii);
    api.reset(); return api;
  },
};
