// Spread 1 · The design speed (cl. 3.1–3.3). Traffic on a two-lane carriageway, each car at the speed its driver chooses;
// cars overtake slower ones. Set the design speed: cars faster than it turn amber, the chart shows the faster group and
// the reckless few. Speeds are an illustrative spread, not survey data.
import * as THREE from 'three';
import { Anims } from '@engine/anim.js';
import { makeGuide } from '@engine/guide.js';
import { textPlane, cardBg } from '@engine/util.js';
import { diorama, trees, makeRoad, car, VEH } from '../../_irc38/site.js';

const F = 'Inter, Segoe UI, Arial', S = .1, GROUND = .5, O = new THREE.Vector3(0, GROUND, -3);
const SLAB = { x0: -12.6, x1: 12.6, z0: -15.8, z1: 7.4 }, HALF = 122, N = 11;
const MIXES = { highway: { mean: 74, sd: 13, label: 'Highway traffic' }, village: { mean: 38, sd: 8, label: 'Village road' } };

export default {
  cam: { pos: [3, 36, 38], look: [3.5, 0, -2], portrait: { pos: [15, 60, 50], look: [12.3, 0, -3] } },
  build(ctx) {
    const { holo } = ctx, anims = new Anims();
    const group = new THREE.Group();
    const P = (xy, h = 0) => new THREE.Vector3(O.x + xy[0] * S, O.y + h, O.z - xy[1] * S);
    const st = { mix: 'highway', design: 80 };
    const slab = diorama({ ...SLAB, h: GROUND }); group.add(slab);
    const forest = trees(slab, 40, 9); group.add(forest);
    const road = makeRoad(P, S, { lane: 3.75 }); group.add(road.group); road.set([[-HALF, 0], [HALF, 0]]);
    forest.userData.hide((x, z) => Math.abs(z - O.z) < 1.2);

    // drivers: a seeded normal spread of chosen speeds; a large sample for the chart, N of them on the road
    let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
    let sample = [];
    const fleet = [], paint = [0x24557a, 0x6a4a8c, 0x2a6d68, 0x8a3f1c, 0x3d4248];
    for (let i = 0; i < N; i++) {
      const c = car(S * VEH, paint[i % paint.length]); group.add(c);
      const mat = c.userData.body.children[0].material;
      fleet.push({ c, mat, base: mat.color.clone(), x: -HALF + i * (2 * HALF / N), lane: i % 2, v: 60, cur: 60, mark: null });
    }
    for (const f of fleet) { f.mark = holo.label('', { h: .55, color: '#14202b', bg: 'rgba(255,253,248,.85)' }); group.add(f.mark); }
    const amber = new THREE.Color(0xd08a2a), red = new THREE.Color(0xc23b2f);
    const reckless = () => sample[Math.floor(sample.length * .97)];
    function paintCars() { const r = reckless(); for (const f of fleet) f.mat.color.copy(f.v > r ? red : f.v > st.design ? amber : f.base); }
    function draw() {
      const m = MIXES[st.mix]; seed = st.mix === 'highway' ? 5 : 11;
      sample = Array.from({ length: 400 }, () => Math.max(15, m.mean + m.sd * gauss())).sort((a, b) => a - b);
      fleet.forEach((f, i) => { f.v = sample[Math.floor((i + .5) / N * sample.length)]; f.cur = f.v; f.mark.userData.setText(`${Math.round(f.v)}`); });
      paintCars(); chart.redraw();
    }

    // the speed chart
    const chart = textPlane({ w: 9.6, h: 6.4, px: 46, draw: (c, W, H) => {
      cardBg(c, W, H); c.textAlign = 'left'; c.fillStyle = '#24557a'; c.font = `700 16px ${F}`; c.fillText(`SPEEDS DRIVERS CHOOSE · ${MIXES[st.mix].label.toLowerCase()}`, 18, 26);
      if (!sample.length) return;
      const x0 = 26, x1 = W - 22, y0 = 46, y1 = H - 86, lo = 10, hi = 120, X = v => x0 + (v - lo) / (hi - lo) * (x1 - x0);
      const bins = new Array(22).fill(0); for (const v of sample) bins[Math.min(21, Math.max(0, Math.floor((v - lo) / 5)))]++;
      const peak = Math.max(...bins), r = reckless();
      bins.forEach((n, i) => { const v = lo + i * 5, h = n / peak * (y1 - y0); c.fillStyle = v + 2.5 > r ? '#c23b2f' : v + 2.5 > st.design ? '#d08a2a' : '#8fb0c8'; c.fillRect(X(v) + 1, y1 - h, X(v + 5) - X(v) - 2, h); });
      c.strokeStyle = '#14202b'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(st.design), y0 - 4); c.lineTo(X(st.design), y1 + 4); c.stroke();
      c.fillStyle = '#14202b'; c.font = `700 15px ${F}`; c.textAlign = 'center'; c.fillText(`design speed ${st.design} km/h`, Math.min(x1 - 80, Math.max(x0 + 80, X(st.design))), y0 - 8);
      c.font = `500 12px ${F}`; c.fillStyle = '#5c6168'; for (let v = 20; v <= 120; v += 20) c.fillText(`${v}`, X(v), y1 + 16); c.textAlign = 'left';
      const above = sample.filter(v => v > st.design).length / sample.length * 100;
      c.font = `600 15px ${F}`; c.fillStyle = '#8a3f1c'; c.fillText(`${above.toFixed(0)} % of drivers choose more than ${st.design} km/h`, 18, H - 46);
      c.fillStyle = '#c23b2f'; c.fillText(`red: the reckless few, above ${Math.round(r)} km/h (top 3 %)`, 18, H - 22);
    } });
    chart.position.set(5.1, 2.7, 10.5); chart.rotation.x = -.6; group.add(chart);

    const setDesign = v => { st.design = Math.max(20, Math.min(120, v)); paintCars(); chart.redraw(); };
    const actions = [
      { label: '− 5 km/h', run: () => setDesign(st.design - 5) }, { label: '+ 5 km/h', run: () => setDesign(st.design + 5) },
      { label: 'Highway traffic', toggle: () => st.mix === 'highway', run: () => { st.mix = 'highway'; st.design = 80; draw(); } },
      { label: 'Village road', toggle: () => st.mix === 'village', run: () => { st.mix = 'village'; st.design = 40; draw(); } },
    ];
    const api = {
      group, targets: [], actions,
      tap(hit) { guide.tap(hit); },
      a11y: actions.map(a => ({ label: a.label, run: a.run })),
      update(dt) {
        anims.tick(dt);
        // traffic: each car keeps its chosen speed, overtakes a slower car when the other lane is clear, else follows it
        const k = 1 / 3.6 * 1.6;   // km/h → m/s, shown 1.6× faster
        const gap = (a, b) => ((b.x - a.x) % (2 * HALF) + 2 * HALF) % (2 * HALF);   // how far b is ahead of a
        for (const f of fleet) {
          const ahead = fleet.find(g => g !== f && g.lane === f.lane && gap(f, g) < 16);
          if (ahead) {
            const busy = fleet.some(g => g !== f && g.lane !== f.lane && (gap(f, g) < 14 || gap(g, f) < 10));
            if (!busy) f.lane = 1 - f.lane; else f.cur = Math.min(f.cur, ahead.cur);
          } else f.cur += (f.v - f.cur) * Math.min(1, dt * 1.5);
          f.x += f.cur * k * dt; if (f.x > HALF) f.x -= 2 * HALF;
          f.zOff = (f.zOff ?? (f.lane ? -1.9 : 1.9)); f.zOff += ((f.lane ? -1.9 : 1.9) - f.zOff) * Math.min(1, dt * 4);
          f.c.position.copy(P([f.x, f.zOff], .01)); f.c.visible = Math.abs(f.x) < HALF - 4;
          f.mark.position.copy(f.c.position).add(new THREE.Vector3(0, 1.3, 0)); f.mark.visible = f.c.visible;
        }
        const tall = ctx.camera.aspect < 1; guide.card.position.x = tall ? -3.4 : -5.4; guide.card.scale.setScalar(tall ? .82 : 1);
        chart.position.x = tall ? 3.6 : 5.1; chart.scale.setScalar(tall ? .82 : 1);
      },
      reset() { anims.clear(); st.mix = 'highway'; st.design = 80; draw(); guide.reset(); },
      get debug() { return { mix: st.mix, design: st.design, fleet: fleet.map(f => Math.round(f.v)), above: +(sample.filter(v => v > st.design).length / sample.length * 100).toFixed(1), guide: guide.debug }; },
    };
    const guide = makeGuide(ctx, {
      anchor: [-5.4, 2.2, 10.5], w: 10, h: 5,
      steps: [
        { title: 'Mixed speeds', show: [], text: 'Every driver picks a speed: the number over each car. Fast cars catch up, overtake when the other lane is clear, or wait behind.',
          check: { q: 'Why aim for one constant design speed within a section (cl. 3.1)?', options: ['drivers can anticipate others', 'it is the cheapest', 'it is the speed limit'], answer: 0, why: 'With a constant speed in any one section, drivers can anticipate the movements of other vehicles and adjust their own (cl. 3.1).' } },
        { title: 'Set it', show: ['− 5 km/h', '+ 5 km/h'], text: 'Move the design speed. Cars driving faster than it turn amber; the reckless few are red.',
          check: { q: 'The design speed is adopted by…', options: ['the faster group, not the reckless', 'the average driver', 'the fastest driver'], answer: 0, why: '"The maximum approximately uniform speed that will probably be adopted by the faster group of drivers but not necessarily by a small percentage of the reckless ones" (cl. 3.3).' } },
        { title: 'Class of road', show: ['− 5 km/h', '+ 5 km/h', 'Highway traffic', 'Village road'], text: 'Switch between highway traffic and a village road. The speeds people choose, and so the design speed, change with the road.',
          check: { q: 'Which justifies a higher design speed (cl. 3.2)?', options: ['an important, busy highway', 'a minor road', 'any road in hills'], answer: 0, why: 'On an important highway carrying a large volume of traffic, a higher design speed than on a less important road in similar topography is justified (cl. 3.2).' } },
      ],
    });
    guide.card.rotation.x = -.6; group.add(guide.card); api.targets.push(guide.card); api.guide = guide; api.actions = guide.wrap(api.actions);
    chart.userData.zoom = true; api.targets.push(chart);
    draw();
    return api;
  },
};
