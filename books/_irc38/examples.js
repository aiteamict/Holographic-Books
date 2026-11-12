// The worked-examples spread for curve-geometry examples (Section 11). Pick an example: the site model sets up its curve,
// "Next step" walks through the book's working one line at a time, and the answer card sets every printed result beside
// the value computed by curve.js, with a tick, or a flag where the book has a misprint.
//
// example = {
//   id: '11.2', title, given: 'one line of data',
//   curve: [deltaDeg, Rc, Ls],                       // what the hologram shows
//   steps: [{ text, focus?: 'tp'|'pi'|'ct'|'lt' }],
//   answers: [{ label, book: number, value: k => number, unit, digits, tol, note? }],   // note: shown when book ≠ computed
// }
import * as THREE from 'three';
import { Anims, pulse } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg, wrapText } from '@engine/util.js';
import { horizontalCurve } from './curve.js';
import { makePlan } from './plan.js';
import { diorama, trees, makeRoad, throughSlab, car, VEH } from './site.js';

const F = 'Inter, Segoe UI, Arial', GROUND = .5;
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 };
const okOf = (a, v) => Math.abs(v - a.book) <= (a.tol ?? Math.pow(10, -(a.digits ?? 2)) * 1.5);

export function curveExamples({ examples, cam }) {
  return {
    cam: cam || { pos: [3, 41, 37], look: [3.5, 0, -2], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
    build(ctx) {
      const { holo } = ctx, anims = new Anims();
      const group = new THREE.Group();
      const st = { ex: 0, step: -1, carD: 0 };
      const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
      const forest = trees(slab, 34, 41); group.add(forest);
      let plan = null, road = null, S = .06;
      const auto = car(1, 0x24557a); group.add(auto);
      const lt = holo.segments([[0, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]], holo.WHITE, .8, { width: .06 }); group.add(lt);

      const E = () => examples[st.ex];
      const curve = () => horizontalCurve(...E().curve);
      // the working and the answers, on one card
      const card = textPlane({ w: 10, h: 7.6, px: 46, draw: (c, W, H) => {
        const ex = E(), k = curve(); cardBg(c, W, H); c.textAlign = 'left';
        c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText(`EXAMPLE ${ex.id}`, 18, 26);
        c.fillStyle = '#14202b'; c.font = `700 17px ${F}`; let y = 50; for (const l of wrapText(c, ex.title, W - 36).slice(0, 2)) { c.fillText(l, 18, y); y += 21; }
        c.fillStyle = '#5c6168'; c.font = `500 14px ${F}`; for (const l of wrapText(c, 'Given: ' + ex.given, W - 36).slice(0, 2)) { c.fillText(l, 18, y); y += 18; }
        y += 6;
        const shown = ex.steps.slice(0, st.step + 1);   // the last three lines of working
        c.font = `500 15px ${F}`;
        for (let i = Math.max(0, shown.length - 3); i < shown.length; i++) {
          c.fillStyle = i === st.step ? '#8a3f1c' : '#5c6168';
          for (const l of wrapText(c, `${i + 1}. ${shown[i].text}`, W - 36).slice(0, 2)) { c.fillText(l, 18, y); y += 18; }
          y += 3;
        }
        if (st.step < 0) { c.fillStyle = '#5c6168'; c.fillText('Press "Next step" to work it.', 18, y); }
        // answers: book against computed
        const done = st.step >= ex.steps.length - 1, top = H - 26 - ex.answers.length * 22;
        c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(18, top - 22, W - 36, 1.5);
        c.fillStyle = '#5c6168'; c.font = `600 12px ${F}`; c.fillText('RESULT', 18, top - 6); c.textAlign = 'right'; c.fillText('BOOK PRINTS', W - 150, top - 6); c.fillText('COMPUTED', W - 40, top - 6); c.textAlign = 'left';
        ex.answers.forEach((a, i) => {
          const yy = top + 16 + i * 22, v = a.value(k), ok = okOf(a, v);
          c.font = `500 14px ${F}`; c.fillStyle = '#14202b'; c.fillText(a.label, 18, yy);
          c.textAlign = 'right'; c.font = `700 14px ${F}`; c.fillStyle = ok || !done ? '#14202b' : '#b3362b'; c.fillText(`${a.book.toFixed(a.digits ?? 2)} ${a.unit || ''}`, W - 150, yy);
          c.fillStyle = done ? '#1f7a45' : '#c9ced3'; c.fillText(done ? `${v.toFixed(a.digits ?? 2)} ${a.unit || ''}` : '…', W - 40, yy);
          c.fillText(done ? (ok ? '✓' : '!') : '', W - 18, yy); c.textAlign = 'left';
        });
        const bad = done && ex.answers.find(a => !okOf(a, a.value(k)));
        if (bad?.note) { c.fillStyle = '#b3362b'; c.font = `600 12px ${F}`; c.fillText(bad.note, 18, H - 8); }
      } });
      card.position.set(5.1, 2.9, 10.3); card.rotation.x = -.6; group.add(card);

      function setup() {
        const k = curve();
        S = Math.min(.12, 19 / (2 * k.Ts * Math.cos(k.delta / 2) + 40));   // the whole curve fits the slab
        if (plan) group.remove(plan.group); if (road) group.remove(road.group);
        plan = makePlan({ s: S, origin: [0, GROUND, -9 + Math.min(6, k.Es * S * .5)], ext: 0, show: { ribbon: false, radii: false, centre: false } }); group.add(plan.group);
        road = makeRoad(plan.P, S); group.add(road.group);
        plan.set(k); const through = throughSlab(plan.L, plan.P, SLAB); road.set(through.pts, { stones: [through.e1, through.e1 + k.length], side: 1 });
        const near = through.pts.filter((_, i) => i % 3 === 0).map(p => plan.P(p));
        forest.userData.hide((x, z) => near.some(q => Math.hypot(q.x - x, q.z - z) < 1.1));
        auto.children[0].scale.setScalar(S * VEH);
        lt.visible = false; card.redraw();
      }
      function focus(f) {
        const L = plan.L, k = curve(); lt.visible = false;
        if (f === 'tp') pulse(anims, plan.pegs['T.P.'], 1.5, .5);
        if (f === 'ct') pulse(anims, plan.pegs['C.T.'], 1.5, .5);
        if (f === 'pi') pulse(anims, plan.pegs['P.I.'], 1.5, .5);
        if (f === 'lt' && k.Ls) {   // long tangent along the straight from T.P., short tangent back to C.T.
          const u = L.u1, lp = [L.TP[0] + u[0] * k.LT, L.TP[1] + u[1] * k.LT];
          holo.setPoints(lt, [plan.P(L.TP, .15), plan.P(lp, .15), plan.P(lp, .15), plan.P(L.CT, .15)]); lt.visible = true;
        }
      }
      const pick = i => { st.ex = i; st.step = -1; setup(); guide.say(`Example ${E().id}: ${E().title}.`); };
      const next = () => { const ex = E(); if (st.step < ex.steps.length - 1) { st.step++; focus(ex.steps[st.step].focus); card.redraw(); guide.say(ex.steps[st.step].text); ctx.snd?.play('tick'); } };
      const actions = [
        ...examples.map((ex, i) => ({ label: `Ex ${ex.id}`, toggle: () => st.ex === i, run: () => pick(i) })),
        { label: 'Next step', run: next },
        { label: 'Show all', run: () => { st.step = E().steps.length - 1; card.redraw(); } },
      ];
      const api = {
        group, targets: [], actions,
        tap(hit) { guide.tap(hit); },
        a11y: actions.map(a => ({ label: a.label, run: a.run })),
        update(dt) {
          anims.tick(dt);
          const T = road?.track;
          if (T) { st.carD = (st.carD + dt * 22) % T.length; const p = T.at(st.carD); auto.position.copy(plan.P([p.x - Math.sin(p.h) * 1.75, p.y + Math.cos(p.h) * 1.75], .01)); auto.rotation.y = p.h; }
          const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
          card.position.x = tall ? 3.5 : 5.1; card.scale.setScalar(tall ? .8 : 1);
        },
        reset() { anims.clear(); pick(0); guide.reset(); },
        get debug() { const k = curve(), ex = E(); return { ex: ex.id, step: st.step, answers: ex.answers.map(a => ({ label: a.label, book: a.book, computed: +a.value(k).toFixed(a.digits ?? 2), ok: okOf(a, a.value(k)) })), guide: guide.debug }; },
      };
      const ids = examples.map(e => e.id).join(', ');
      const guide = makeGuide(ctx, {
        anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
        steps: [
          { title: 'Pick one', show: examples.map(e => `Ex ${e.id}`), text: `Examples ${ids} from Section 11. Pick one: the site model is set to its data.` },
          { title: 'Work it', show: [...examples.map(e => `Ex ${e.id}`), 'Next step'], text: 'Press "Next step" to follow the book’s working, one line at a time. The hologram points at what each line finds.' },
          { title: 'Check it', show: [...examples.map(e => `Ex ${e.id}`), 'Next step', 'Show all'], text: 'At the end the card sets every printed answer beside the value computed from the geometry.',
            check: { q: 'The book and the geometry differ only in the last digit. Why, most often?', options: ['rounded constants', 'different formulas', 'the tables are wrong'], answer: 0, why: 'The book uses rounded constants, such as 28.65 for 180/2π, and table values to three places. A larger gap is a misprint, and the card flags it.' } },
        ],
      });
      guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
      card.userData.zoom = true; api.targets.push(card);
      setup();
      return api;
    },
  };
}
