// Spread 7 · Site inspection
// An installed sign with four planted defects. Each checklist card is one inspection item: tap it to read the verdict and
// the clause, and watch the defect get corrected on the sign. The quiz becomes an audit.
import * as THREE from 'three';
import * as props from '../engine/props.js';
import { textPlane, cardBg, wrapText } from './util.js';
import { Anims, pulse } from '../engine/anim.js';
import { makeGuide } from '../engine/guide.js';

export default {
  shots: [{ pos: [4, 18, 28], look: [8, 9, 0], dur: 2, hold: 2.6, text: 'A sign as found on site. Four things are wrong with it. Tick the checklist.' }],
  build(ctx) {
    const { holo, sign, ui } = ctx; const S = .065, anims = new Anims();
    const group = new THREE.Group();
    const proj = holo.projector(9); proj.position.x = -6; group.add(proj);
    const sg = sign.makeSign({ number: '44', kind: 'ahead', scale: S }); sg.group.position.x = -6; sg.group.rotation.y = -.2; group.add(sg.group);
    // the crossing route's shield, missing as found: added to the same post when that check is corrected (cl. 5.1)
    const sg2 = sign.makeSign({ number: '7', kind: 'both', post: false, scale: S }); sg2.plate.position.x -= 26; sg2.def.position.x -= 26; sg2.group.position.x = -6; sg2.group.visible = false; group.add(sg2.group);
    const pairUp = on => { sg2.group.visible = on; sg.plate.position.x = (on ? 26 : 0); sg.def.position.x = (on ? 26 : 0); };
    const man = ctx.hero(S * 100); man.position.set(-1.2, 0, -5); man.rotation.y = -.6;   // between the sign and the cards, behind both, clear of the tag labels group.add(man);
    // the site's measurements as floor dimensions beside the post: the kerb stands 0.35 m away as found, 0.60 m once corrected
    const sM = S * 100, kerb = props.kerb(sM, 9); group.add(kerb);
    const site = new THREE.Group(); group.add(site);
    const kerbX = d => -6 - d * sM - .15 * sM;
    const fixes = { kerb: false, dist: false };
    const measure = () => {
      site.clear(); const clear = fixes.kerb ? .6 : .35, dist = fixes.dist ? 120 : 90; kerb.position.x = kerbX(clear);
      site.add(holo.dimension([kerbX(clear) + .15 * sM, .3, 1.6], [-6, .3, 1.6], `${clear.toFixed(2)} m to the kerb${fixes.kerb ? ' ✓' : ''}`, { color: fixes.kerb ? holo.GREEN : holo.RED, h: .85, tick: .3 }));
      site.add(holo.dimension([-1.8, .3, 1.2], [-1.8, .3, -6.5], `${dist} m to the junction${fixes.dist ? ' ✓' : ''}`, { color: fixes.dist ? holo.GREEN : holo.RED, h: .85, tick: .3 }));
    };
    measure();
    // planted defects
    const LEMON = '#e9ff4a';
    sg.setBands(false); sg.setNumber('44', { yellow: LEMON });
    const ITEMS = [
      { q: 'Background colour: Canary Yellow, IS Colour No. 309?', verdict: 'FAIL · lemon yellow applied. Repaint to IS 309 (cl. 2.2).', fix: () => { sg.setNumber('44'); pulse(anims, sg.plate, 1.08, .5); } },
      { q: 'Post bands: 25 cm, alternately black and white, lowest band black?', verdict: 'FAIL · the band at the ground is white. Lowest band black (cl. 6).', fix: () => { sg.setBands(true); pulse(anims, sg.post, 1.06, .5); } },
      { q: 'Lateral clearance: not less than 60 cm from the kerb edge?', verdict: 'FAIL · 35 cm. Move the post out to at least 60 cm (cl. 3.3, Plate 2).', fix: () => { fixes.kerb = true; measure(); pulse(anims, kerb, 1.1, .4); } },
      { q: 'Distance before the junction: 100 to 150 m, on the left?', verdict: 'FAIL · 90 m. Re-erect between 100 and 150 m before the junction (cl. 3.4).', fix: () => { fixes.dist = true; measure(); pulse(anims, site, 1.05, .4); } },
      { q: 'Shield plate 450 × 600 mm, 10 mm black border, N H 100 mm, numerals 200 mm?', verdict: 'PASS · plate and lettering to Plate 1 and Plate 5.', fix: () => pulse(anims, sg.plate, 1.05, .4) },
      { q: 'Definition plate: 300 × 250 mm, the arrow true to the junction ahead?', verdict: 'PASS · straight-ahead arrow, 150 mm under the shield (cl. 4.1, Plate 3).', fix: () => pulse(anims, sg.def, 1.1, .4) },
      { q: 'Crossing route NH 7: its shield on the same post, with its own arrow?', verdict: 'FAIL · the crossing route has no shield here. Add NH 7 on the same post with a double-headed arrow (cl. 5.1, Plate 4).', fix: () => { pairUp(true); pulse(anims, sg2.plate, 1.1, .5); } },
    ];
    function paint(c, w, h, it, open) {
      const pass = open && it.verdict.startsWith('PASS');
      cardBg(c, w, h, open ? { stroke: pass ? 'rgba(125,255,176,.9)' : 'rgba(255,107,107,.9)' } : {});
      c.fillStyle = open ? (pass ? '#9dffc2' : '#ff9a9a') : '#58d6ff'; c.font = '600 17px Inter, Segoe UI, Arial'; c.fillText(open ? (pass ? '☑ PASS' : '☒ FAIL · corrected') : '☐ CHECK · tap to inspect', 20, 28);
      c.fillStyle = '#eef3f9'; c.font = `${open ? 500 : 600} ${open ? 19 : 20}px Inter, Segoe UI, Arial`;
      let y = 56; for (const line of wrapText(c, open ? it.verdict : it.q, w - 40)) { c.fillText(line, 20, y); y += open ? 23 : 25; }
    }
    const cards = ITEMS.map((it, i) => {
      const card = textPlane({ w: 11, h: 2.9, draw: (c, w, h) => paint(c, w, h, it, false) });
      card.position.set(7.3, 20 - i * 3.1, 0); card.userData.q = i; card.userData.open = false; group.add(card); return card;
    });
    const set = (card, open) => {
      if (card.userData.open === open) return; card.userData.open = open; anims.stop('card' + card.userData.q);
      anims.add({ dur: .2, tag: 'card' + card.userData.q, update: k => { card.scale.x = 1 - k; }, done: () => { card.redraw((c, w, h) => paint(c, w, h, ITEMS[card.userData.q], open)); anims.add({ dur: .2, tag: 'card' + card.userData.q, update: k => { card.scale.x = k; } }); } });
      if (open) ITEMS[card.userData.q].fix();
    };
    const score = () => { if (cards.every(c => c.userData.open)) ui.caption('Inspection complete: five defects found and corrected, two items passed. The post now complies with IRC : 2-1968.', 'Audit', 7000); };
    const api = {
      group, targets: [...cards, sg.group], dragPlane: 'xy',
      actions: [{ label: 'Inspect everything', run: () => cards.forEach((c, i) => anims.after(i * .25, () => { set(c, true); if (i === cards.length - 1) score(); })) }],
      tap(hit) { if (guide.tap(hit)) return; const card = cards.find(c => c === hit.object); if (card) { set(card, true); ui.caption(ITEMS[card.userData.q].verdict, 'Inspection', 6000); score(); } },
      a11y: ITEMS.map((it, i) => ({ label: `Inspect: ${it.q}`, run: () => { set(cards[i], true); ui.caption(it.verdict, 'Inspection', 6000); } })),
      update(dt, t) { anims.tick(dt); sg.group.rotation.y = sg2.group.rotation.y = -.2 + Math.sin(t * .4) * .04; cards.forEach((c, i) => { c.position.z = Math.sin(t * .8 + i) * .12; }); },
      reset() {
        anims.clear(); cards.forEach(c => { c.scale.x = 1; c.userData.open = false; c.redraw(); });
        sg.setBands(false); sg.setNumber('44', { yellow: LEMON }); pairUp(false);
        fixes.kerb = fixes.dist = false; measure(); guide.reset();
      },
      get debug() { return { open: cards.map(c => c.userData.open), guide: guide.debug }; },
    };
    // the capstone: inspect, then one last reasoning check before the full audit
    const guide = makeGuide(ctx, {
      anchor: [-6, 19.6, -2], w: 10, h: 4.8,
      steps: [
        { title: 'Inspect', show: [], text: 'A post as found on site, 100 m short of a crossroads with NH 7. Seven checks, one from each part of the standard: tap each, and a failed item names the clause it breaks and is corrected on the post as you watch.' },
        { title: 'Verdict', show: ['Inspect everything'],
          check: { q: 'This post stands 0.35 m from a kerb. How far must it stand?', options: ['35 cm is fine', 'at least 60 cm', '2 to 3 m'], answer: 1, why: 'With kerbs, not less than 60 cm from the kerb edge (cl. 3.3, Plate 2); 2–3 m is the rule for a road without kerbs. Inspect everything to finish the audit.' } },
      ],
    });
    group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    return api;
  },
};
