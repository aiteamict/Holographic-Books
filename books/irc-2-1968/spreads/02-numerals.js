// Spread 2 · Letters and numbers (Fig. 1, Plate 5) — the sign-writer's layout board
// The sign on the left; Plate 5's two tables on the right with the cells in use lit. Between the numerals, physical
// spacer slugs drop in, each cut to the millimetres Plate 5 gives for that pair. A strip below shows the same number
// from 100 m, once with even gaps and once with Plate 5's: the even one is the one that looks wrong.
import * as THREE from 'three';
import { tagged, textPlane, cardBg } from '@engine/util.js';
import { Anims, pulse } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';

const PRESETS = ['1', '7', '42', '44', '47', '100', '744'];
const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const EVEN = 35; // the gap a sign-writer would pick if every pair got the same air

export default {
  cam: { pos: [4, 32, 48], look: [4.5, 8, -2], portrait: { pos: [14, 52, 62], look: [12.8, 4, 0] } },
  shots: [
    { pos: [8, 20, 24], look: [8, 11, 0], dur: 1.8, hold: 2.6, text: 'N H at 100 mm, the route number in 200 mm numerals (Fig. 1, Plate 5). The amber slugs are the spacers.' },
    // shots are in world space: the hologram root sits at world (13, 1.34, 0)
    { pos: [22, 21, 27], look: [22.2, 11.8, -1], dur: 1.8, hold: 2.8, text: 'Plate 5: the pair gives a code, the code gives the millimetres. The lit cells are the ones in use.' },
    { pos: [22, 12, 17], look: [22.2, 3, 2.6], dur: 1.6, hold: 2.8, text: 'From 100 m: even gaps look uneven, Plate 5 gaps look even. The ruler disagrees with the eye, so the standard follows the eye.' },
  ],
  build(ctx) {
    const { holo, sign, ui } = ctx; const { SPEC, groupOf } = sign; const S = .3;
    const group = new THREE.Group(); group.add(holo.projector(12));
    const sg = sign.makeSign({ number: '42', post: false, defPlate: false, scale: S });
    sg.group.position.set(-4.4, 11 - 195 * S, 0); sg.group.rotation.y = .06; group.add(sg.group); sg.plate.userData.plate = true;   // centred on the right page, clear of the spine
    const inSign = new THREE.Group(); sg.group.add(inSign);
    const pcy = 195, pz = 75 / 20 + .3 + .35;
    const Pt = (px, py) => [(px - 225) / 10, pcy + (300 - py) / 10, pz];
    // dimension labels are billboards: lift them well clear of the (slightly turned) plate so neither end sinks into it
    const lift = p => [p[0], p[1], p[2] + 2.5];
    const dim = (a, b, text, o = {}) => holo.dimension(lift(Pt(...a)), lift(Pt(...b)), text, { h: (o.h ?? 1) / S, tick: (o.tick ?? .3) / S, color: o.color });

    // Plate 5 as hologram tables
    let gaps = [], number = '744', even = false;      // 744 opens the page: two code-4 pairs, where Plate 5 is most visible
    const t1 = textPlane({ w: 9.6, h: 9.2, px: 48, draw: (c, W, Hh) => {
      cardBg(c, W, Hh); c.fillStyle = '#1d5f87'; c.font = '600 17px Inter, Segoe UI, Arial'; c.fillText('TABLE 1 · CODE NUMBER FOR THE PAIR (Plate 5)', 18, 30);
      const x0 = 18, y0 = 52, cw = [110, 72, 150, 72], rh = 32; const cols = ['preceding', '1, 5', '2 3 6 8 9 0', '4, 7'];
      c.font = '600 15px Inter, Segoe UI, Arial'; c.fillStyle = '#5c6168'; let x = x0; cols.forEach((h, i) => { c.fillText(h, x + 6, y0 + 20); x += cw[i]; });
      ROWS.forEach((r, ri) => { const y = y0 + rh * (ri + 1); x = x0; const used = gaps.filter(g => g.a === r);
        for (let ci = 0; ci < 4; ci++) { const lit = ci > 0 && used.some(g => groupOf(g.b) === SPEC.spacingGroups[ci - 1]);
          if (lit) { c.fillStyle = 'rgba(47,143,85,.22)'; c.fillRect(x + 1, y + 2, cw[ci] - 2, rh - 4); }
          c.fillStyle = lit ? '#1f7a45' : ci ? '#1f2328' : '#8a3f1c'; c.font = `${lit ? 800 : 500} 17px Inter, Segoe UI, Arial`;
          c.fillText(ci ? String(SPEC.spacingCode[r][ci - 1]) : r, x + (ci ? cw[ci] / 2 - 5 : 40), y + 23); x += cw[ci]; }
        c.strokeStyle = 'rgba(29,95,135,.18)'; c.beginPath(); c.moveTo(x0, y + rh); c.lineTo(x0 + 404, y + rh); c.stroke(); });
    } });
    t1.position.set(8.9, 9.2, -3.5); t1.rotation.y = -.12; group.add(t1);
    const t2 = textPlane({ w: 9.6, h: 3.6, px: 48, draw: (c, W, Hh) => {
      cardBg(c, W, Hh); c.fillStyle = '#1d5f87'; c.font = '600 17px Inter, Segoe UI, Arial'; c.fillText('TABLE 2 · SPACING FOR THE CODE', 18, 30);
      [[1, 47], [2, 38], [4, 13]].forEach(([code, mm], i) => { const y = 58 + i * 34, lit = !even && gaps.some(g => g.code === code); if (lit) { c.fillStyle = 'rgba(47,143,85,.22)'; c.fillRect(18, y - 24, 404, 32); }
        c.fillStyle = lit ? '#1f7a45' : '#1f2328'; c.font = `${lit ? 800 : 500} 18px Inter, Segoe UI, Arial`; c.fillText(`code ${code}`, 30, y); c.fillText(`${mm} mm`, 300, y); });
    } });
    t2.position.set(8.9, 2.4, -2.6); t2.rotation.y = -.12; group.add(t2);

    // the 100 m strip: the numeral band of two faces, even gaps above, Plate 5 below, slightly out of focus
    const faceA = document.createElement('canvas'), faceB = document.createElement('canvas'); faceA.width = faceB.width = 450; faceA.height = faceB.height = 600;
    const far = textPlane({ w: 9.6, h: 5.6, px: 48, draw: (c, W, Hh) => {
      cardBg(c, W, Hh); c.fillStyle = '#1d5f87'; c.font = '600 17px Inter, Segoe UI, Arial'; c.fillText('THE SAME NUMBER FROM 100 M · tap to swap', 18, 30);
      sign.drawFace(faceA, number, { even: EVEN }); sign.drawFace(faceB, number);
      const sy = sign.numeralsTop() - 10, sh = SPEC.numerals.h + 20, dw = 200, dh = dw * sh / 450;
      [[faceA, `even · ${EVEN} mm`, '#b3362b'], [faceB, 'Plate 5', '#1f7a45']].forEach(([cv, lbl, col], i) => {
        const y = 44 + i * (dh + 10);
        c.fillStyle = col; c.font = '700 16px Inter, Segoe UI, Arial'; c.fillText(lbl, 18, y + dh / 2 + 6);
        c.save(); c.filter = 'blur(1px)'; c.drawImage(cv, 0, sy, 450, sh, W - dw - 18, y, dw, dh); c.restore();
      });
    } });
    far.position.set(5, 2.6, 10.5); far.rotation.x = -.6; group.add(far);   // lies at the front right, like the other books’ readouts

    const marks = new THREE.Group(); inSign.add(marks);
    const letterDims = new THREE.Group(); letterDims.visible = false; inSign.add(letterDims);
    const numDims = new THREE.Group(); numDims.visible = false; inSign.add(numDims);   // numeral width and stroke, rebuilt with the number
    const x0 = (450 - (67 * 2 + 45)) / 2;
    letterDims.add(dim([x0 - 22, 87], [x0 - 22, 187], '100'), dim([x0 + 67, 72], [x0 + 67 + 45, 72], '45'), dim([x0, 202], [x0 + 67, 202], '67'), dim([x0 + 67 + 45, 202], [x0 + 67 + 45 + 16, 202], '16', { h: .8 }));
    const dial = holo.handle('number', { label: 'route number · drag', kind: 'dial' }); dial.position.set(.6, 0, 5.6); group.add(dial);
    let dialStart = 0, dialIdx = PRESETS.indexOf('744'); const anims = new Anims();
    function apply(n) {
      number = n; const lay = sg.setNumber(n, { even: even ? EVEN : 0 }); gaps = lay.gaps; marks.clear(); pulse(anims, sg.plate, 1.04, .35, 'stamp');
      const top = 262, bot = 462, mid = pcy + (300 - (top + bot) / 2) / 10;
      for (const g of lay.glyphs) marks.add(holo.outline([{ x: 225 + g.x0, y: top }, { x: 225 + g.x1, y: top }, { x: 225 + g.x1, y: bot }, { x: 225 + g.x0, y: bot }].map(p => ({ x: (p.x - 225) / 10, y: -(pcy + (300 - p.y) / 10) })), holo.WHITE, { closed: true, width: .04 / S, flipY: true }));
      lay.gaps.forEach((g, i) => {
        // a spacer slug cut to the gap, dropped in from above the plate
        const slug = new THREE.Mesh(new THREE.BoxGeometry(g.mm / 10, (bot - top) / 10, .5), holo.glassMat(even ? holo.RED : holo.AMBER, { opacity: .45, scan: 0 }));
        slug.position.set((g.x + g.mm / 2) / 10, mid + 9, pz + .25); marks.add(slug);
        const d = dim([225 + g.x, bot + 34], [225 + g.x + g.mm, bot + 34], even ? `${g.mm} mm · even` : `${g.mm} mm · code ${g.code}`, { color: even ? holo.RED : holo.GREEN, h: 1.1 }); d.scale.setScalar(.01); marks.add(d);
        anims.add({ dur: .45, delay: .1 + i * .18, update: k => { const e = 1 - (1 - k) * (1 - k); slug.position.y = mid + 9 * (1 - e); }, done: () => { pulse(anims, slug, 1.12, .25); anims.add({ dur: .35, update: k => d.scale.setScalar(.01 + .99 * k) }); } });
      });
      marks.children.forEach(m => { if (m.isLine2) m.position.z = pz; });
      numDims.clear();
      { const g = lay.glyphs.find(g => g.d !== '1') || lay.glyphs[0];   // a full-width numeral: most are 134 mm (Plate 5)
        numDims.add(dim([225 + g.x0, top - 30], [225 + g.x1, top - 30], `${Math.round(g.x1 - g.x0)} wide`, { h: .9 }));
        numDims.add(dim([225 + g.x0, top + 100], [225 + g.x0 + SPEC.numerals.stroke, top + 100], `${SPEC.numerals.stroke} stroke`, { h: .8, tick: .25 })); }
      t1.redraw(); t2.redraw(); far.redraw();
      if (even) ui.caption(`Every gap ${EVEN} mm. Open pairs like 4 7 now look loose and closed pairs like 1 1 look tight. Plate 5 cuts each slug to the pair.`, `NH ${n} · even spacing`, 6000);
      else ui.caption(lay.gaps.length ? lay.gaps.map(g => `${g.a} → ${g.b}: code ${g.code}, ${g.mm} mm`).join(' · ') : 'A single numeral sits centred in the 200 mm band; nothing to space.', `NH ${n}`, 5000);
    }
    const api = {
      group, targets: [dial, sg.plate, far],
      press() { dialStart = dialIdx = Math.max(0, PRESETS.indexOf(number)); },
      drag(d) { if (!tagged(d.hit.object, 'handle')) return; const i = THREE.MathUtils.clamp(dialStart + Math.round(d.dx / 45), 0, PRESETS.length - 1); if (i !== dialIdx) { dialIdx = i; apply(PRESETS[i]); } },
      tap(hit) { if (guide.tap(hit)) return; if (hit.object === far) { even = !even; apply(number); } else apply(PRESETS[(PRESETS.indexOf(number) + 1) % PRESETS.length]); },
      actions: PRESETS.map(n => ({ label: 'NH ' + n, toggle: () => number === n, run: () => apply(n) }))
        .concat([
          { label: 'Even spacing', toggle: () => even, run: () => { even = !even; apply(number); } },
          { label: 'Letter sizes', toggle: () => letterDims.visible, run: () => { letterDims.visible = numDims.visible = !letterDims.visible; if (letterDims.visible) ui.caption('N and H: 100 mm high, 16 mm stroke, 67 mm wide, 45 mm apart (Fig. 1). Numerals: 200 mm high, 31 mm stroke, most 134 mm wide (Plate 5).', 'Sizes', 6000); } },
        ]),
      key(e) { if (/^\d$/.test(e.key)) apply((number.length >= 3 || number === '0' ? '' : number) + e.key); else if (e.key === 'Backspace') apply(number.slice(0, -1) || '0'); },
      update(dt, t) { anims.tick(dt); sg.group.rotation.y = .06 + Math.sin(t * .5) * .03; },
      reset() { even = false; apply('744'); letterDims.visible = numDims.visible = false; guide.reset(); },
      get debug() { return { number, even, gaps: gaps.map(g => [g.a, g.b, g.code, g.mm]), guide: guide.debug }; },
    };
    // the guided sequence: pair → code, code → slug, the proof from 100 m; then everything is live
    const guide = makeGuide(ctx, {
      anchor: [-5.6, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'The pair', show: ['NH 47', 'NH 100', 'NH 744'], enter: () => { if (even) { even = false; apply(number); } },
          text: 'Numerals are spaced pair by pair. Table 1 reads the pair: a 4 after a 7 is code 4 (the lit cell). Pick another route and watch the lit cells move.' },
        { title: 'The slug', show: [],
          check: { q: 'Table 2 turns the code into millimetres. A 4 after a 7: how wide is the amber slug between them?', options: ['47 mm', '38 mm', '13 mm'], answer: 2, why: 'Two open shapes sit close. Table 1 gives code 4; Table 2 makes code 4 = 13 mm. A 1 after a 1 would get 47 mm.' } },
        { title: 'From 100 m', show: ['Even spacing'],
          text: 'The proof is under the tables: the same number from 100 m, even 35 mm gaps above, Plate 5 below. Switch Even spacing on and see the sign go wrong.' },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    apply('744'); return api;
  },
};
