// The shared book runtime: stage, pages, navigation, input, camera tours, quality tiers, loop.
// A book's main.js calls runBook({ BOOK, COVER, LESSONS, QUIZ, SPREADS, ... }); see books/_template/main.js.
import * as THREE from 'three';
import './book.css';
import { createStage } from './stage.js';
import { Book } from './book.js';
import { renderPage as rawPage, renderCover, PAGE_W, PAGE_H } from './page.js';
import { UI } from './ui.js';
import * as holo from './holo.js';
import { TIERS, measureFrameMs, pickTier } from './quality.js';
import { Sound } from './sound.js';
import { tagged } from './util.js';

/**
 * @param cfg.BOOK      { title, subtitle, credit?, foot?, cover: { title: [lines], kicker, foot: [lines] } }
 * @param cfg.COVER     { insideCover, insideBack } page specs
 * @param cfg.LESSONS   [null, { title, prompt, left, right }, ...] one per spread
 * @param cfg.SPREADS   [null, { build(ctx), cam?, shots? }, ...] same length as LESSONS
 * @param cfg.QUIZ      passed to spreads as ctx.QUIZ
 * @param cfg.ctx       extra fields merged into every spread's ctx (e.g. { sign, hero })
 * @param cfg.coverMark (ctx2d, W, H) => draws the artwork on the cover board
 * @param cfg.coverHolo ({ THREE, holo }) => Group shown beside the closed book; set userData.up on a child to make it sway
 */
export function runBook({ BOOK, COVER, LESSONS, QUIZ, SPREADS, ctx: extra = {}, coverMark, coverHolo: makeCoverHolo, fitPhone = false }) {
  const renderPage = s => rawPage({ foot: BOOK.foot, ...s });
  const canvas = document.getElementById('c');
  const stage = createStage(canvas);
  const { scene, camera } = stage;
  stage.onResize(holo.setResolution);
  let tierName = 'high', tier = TIERS.high;
  const N = LESSONS.length - 1;

  // ---- pages ---------------------------------------------------------------------------------------
  const pages = [null];
  // right pages are quiet (a plate reference by the page number) so the hologram never stands on words; left pages have a
  // quiet twin shown while the reading panel carries the text
  for (let k = 1; k <= N; k++) pages.push({
    left: renderPage({ ...LESSONS[k].left, side: 'left', pageNo: k * 2 - 1 }),
    leftQuiet: renderPage({ kicker: LESSONS[k].left.kicker, side: 'left', pageNo: k * 2 - 1 }),   // kicker only: nothing to bleed through the panel
    right: renderPage({ kicker: `${LESSONS[k].right.kicker} · ${LESSONS[k].right.title}`, side: 'right', pageNo: k * 2, quiet: true }),
  });
  const cover = renderCover(BOOK.cover || { title: [BOOK.title], kicker: BOOK.subtitle }, coverMark);
  const insideBack = renderPage(COVER.insideBack);
  const book = new Book({ cover, insideCover: renderPage(COVER.insideCover), insideBack, spreads: pages });
  scene.add(book.group);

  // ---- holograms -----------------------------------------------------------------------------------
  const holoRoot = new THREE.Group(); holoRoot.position.set(PAGE_W / 2, book.pageTopAt(0) + .05, 0); scene.add(holoRoot);
  const snd = new Sound();
  const ui = new UI(document.getElementById('ui'), { title: BOOK.title, subtitle: BOOK.subtitle, count: N + 1, labels: { [N + 1]: 'Back page' }, credit: BOOK.credit, titles: ['Cover', ...LESSONS.slice(1).map(l => l.title), COVER.insideBack.title], onNav: (k, rel) => goTo(rel ? cur + k : k), onAgain: () => { built[cur]?.reset?.(); ui.refreshActions(); snd.play('tick'); }, muted: snd.muted, onMute: m => snd.setMuted(m) });
  ui.onSheet = open => book.setLeftQuiet(open); book.setLeftQuiet(ui.sheetOpen);
  // phones (and any short, wide screen): the phone shell — one card, one toolbar, the hologram full-screen
  // narrow, or a touch screen held sideways; never a short laptop window
  const PHONE = matchMedia('(max-width: 820px), (pointer: coarse) and (max-height: 520px)').matches; ui.setPhone(PHONE); if (PHONE) book.setLeftQuiet(false);
  const ctx = { THREE, holo, ui, QUIZ, scene, camera, snd, ...extra };
  const built = {};
  /** Each spread gets a ui whose captions only land while that spread is current, so a delayed caption cannot leak. */
  const scopedUI = k => Object.assign(Object.create(ui), { caption: (t, kicker, ms) => { if (cur === k) ui.caption(t, kicker, ms); } });
  function inst(k) {
    if (!k || !SPREADS[k]) return null;
    if (!built[k]) { const i = SPREADS[k].build({ ...ctx, ui: scopedUI(k) }); i.group.visible = false; i.group.userData.pop = 0; holoRoot.add(i.group); built[k] = i; }
    return built[k];
  }
  // cover hologram: the book supplies it; it stands on the desk beside the closed book, never on the cover's title
  const coverHolo = makeCoverHolo ? makeCoverHolo({ THREE, holo }) : new THREE.Group();
  coverHolo.userData.pop = 0;
  coverHolo.position.set(PAGE_W + 1, -book.pageTopAt(0) - .05 - .9, 0);
  holoRoot.add(coverHolo);

  // ---- camera --------------------------------------------------------------------------------------
  // lower and closer, like a reader leaning over the book: ~30° elevation, the hologram filling most of the frame
  // the spread camera stands exactly over the spine (x = 0) and looks straight ahead: the spine is then a vertical line on
  // screen and nothing standing on the right page can ever project over the left page's text
  // cover camera: over the book's right edge (x = PAGE_W), so the closed cover with its title is left of centre and the
  // cover hologram, which stands on the desk beyond that edge, is right of it
  const CAM = { cover: { pos: [PAGE_W, 38, 58], look: [PAGE_W, 5, -2] }, spread: { pos: [0, 40, 52], look: [0, 8, -3] } };
  const look = new THREE.Vector3(...CAM.cover.look); camera.position.set(...CAM.cover.pos); camera.lookAt(look);
  const camT = { from: null, to: null, t: 1, dur: 1.4 };
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function moveCam(preset, dur = 1.5) {
    camT.from = { pos: camera.position.clone(), look: look.clone() };
    const to = new THREE.Vector3(...preset.pos), at = new THREE.Vector3(...preset.look);
    if (camera.aspect < 1 && preset.portrait) { to.set(...preset.portrait.pos); at.set(...preset.portrait.look); }   // a spread may frame itself for upright phones
    else if (camera.aspect < 1) {                                                   // portrait phones: frame the hologram page; the text is read in the sheet
      const cx = PAGE_W / 2 + 1.5; to.x += cx - at.x; at.x = cx; at.y -= 7;  // aim low: the hologram sits in the upper two thirds, above the card
      to.sub(at).multiplyScalar(2.05).add(at);
    }
    if (camera.aspect < 1 && preset.fit) fitPortrait(preset.fit, to, at);
    camT.to = { pos: to, look: at }; camT.t = 0; camT.dur = dur;
  }
  // upright phones: pan and pull back until everything the spread can show sits between the screen edges and above the
  // bottom bar. Measures the shown parts at full size (the group pops in from 0); hit meshes skipped.
  function fitPortrait(group, to, at) {
    const pts = [], v = new THREE.Vector3(), s0 = group.scale.clone(), vis = group.visible;
    group.scale.set(1, 1, 1); group.visible = true; group.updateMatrixWorld(true);
    group.traverseVisible(o => {                                         // hidden parts (labels, alternate insets) don't count
      if (!o.geometry || o.material?.opacity === 0 || o.material?.visible === false || o.userData.noFit) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; if (!b || b.isEmpty()) return;
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) pts.push(new THREE.Vector3(x, y, z).applyMatrix4(o.matrixWorld));
    });
    group.scale.copy(s0); group.visible = vis; group.updateMatrixWorld(true);
    if (!pts.length) return;
    const cam = camera.clone(), X = .94, TOP = .9, BOT = -.52;   // BOT clears the step peek and the control bar
    for (let n = 0; n < 4; n++) {
      cam.position.copy(to); cam.lookAt(at); cam.updateMatrixWorld();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const p of pts) { v.copy(p).project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
      if (n === 0 && x0 >= -X && x1 <= X && y0 >= BOT && y1 <= TOP) return;   // already fits: keep the authored framing
      const d = to.distanceTo(at), hy = d * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), hx = hy * cam.aspect;
      const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
      const pan = right.multiplyScalar((x0 + x1) / 2 * hx).add(up.multiplyScalar(((y0 + y1) / 2 - (TOP + BOT) / 2) * hy));
      to.add(pan); at.add(pan);
      const k = Math.max(1, (x1 - x0) / (2 * X), (y1 - y0) / (TOP - BOT));
      to.sub(at).multiplyScalar(k).add(at);
    }
  }

  // ---- camera tours: a short shot list per spread, played once on the first visit, stopped by any input ----------
  const seen = new Set(); let tour = null;
  function startTour(k) {
    const shots = SPREADS[k]?.shots; if (!shots?.length) return;
    tour = { k, i: -1, until: 0 }; nextShot();
  }
  function nextShot() {
    const shots = SPREADS[tour.k].shots; tour.i++;
    if (tour.i >= shots.length) { endTour(); return; }
    // shots were authored for the old, higher camera: bring each one down to ~70 % of its height above its look point
    // shots were authored for the old, higher camera: lower them to 70 % of their height and pull back 1.35× so a shot never crops the subject
    const s = shots[tour.i], L = s.look, p = [s.pos[0], L[1] + (s.pos[1] - L[1]) * .7, s.pos[2]];
    const shot = { ...s, pos: [L[0] + (p[0] - L[0]) * 1.35, L[1] + (p[1] - L[1]) * 1.35, L[2] + (p[2] - L[2]) * 1.35] };
    moveCam(shot, s.dur ?? 1.8); tour.until = time + (s.dur ?? 1.8) + (s.hold ?? 2.2); snd.play('ping');
    if (s.text) ui.caption(s.text, 'Watch', (s.hold ?? 2.2) * 1000 + 800);
  }
  function endTour(interrupted) { if (!tour) return; const k = tour.k; tour = null; moveCam({ ...(SPREADS[k].cam || CAM.spread), fit: fitPhone && built[k]?.group }, interrupted ? .9 : 1.6); }
  const watchAction = k => ({ label: '▶ Watch', run: () => startTour(k) });

  // ---- navigation ----------------------------------------------------------------------------------
  let cur = 0;
  function goTo(k) {
    k = THREE.MathUtils.clamp(k, 0, N + 1); if (k === cur) return;     // N + 1 is the back page: text only
    const prev = cur; cur = k; endTour(true);
    if (built[prev]) { built[prev].leave?.(); built[prev].group.visible = false; }
    coverHolo.visible = false;
    book.goTo(k); snd.play(Math.abs(k - prev) > 1 ? 'riffle' : 'page');
    const i = inst(k), back = k > N;
    ui.setStep(k, back ? COVER.insideBack.title : LESSONS[k]?.title ?? BOOK.title, back ? 'About this chapter and its sources. ← to go back.' : LESSONS[k]?.prompt ?? 'Scroll to open the book.');
    ui.setActions(i ? [...i.actions, ...(SPREADS[k].shots ? [watchAction(k)] : [])] : []); ui.hideCaption();
    ui.setMirror(i ? (i.a11y || []) : []); ui.setSheet(back ? COVER.insideBack : k ? LESSONS[k].left : COVER.insideCover);
    syncGuide(i);
    moveCam(k ? (SPREADS[k]?.cam || CAM.spread) : CAM.cover);   // upright phones refit once the hologram lands (frame loop)
    history.replaceState(null, '', k ? '#spread-' + k : location.pathname);
  }
  ui.setStep(0, BOOK.title, 'Scroll to open the book.');
  /** the guided-step strip follows the current spread's guide (if it has one) */
  function syncGuide(i) {
    const g = i?.guide;
    if (!g) { ui.setSteps([]); ui.setGuidePanel(null); return; }
    g.onChange = () => { ui.setSteps(g.titles, g.free ? g.titles.length : g.step, j => g.go(j)); ui.setGuidePanel(g.current, { pick: k => g.pick(k), next: () => g.next() }); ui.refreshActions(); };
    g.onChange();
  }

  // ---- input ---------------------------------------------------------------------------------------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const toNdc = e => { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
  const pick = (e, targets) => { if (!targets?.length) return null; toNdc(e); ray.setFromCamera(ndc, camera); return ray.intersectObjects(targets, true)[0] || null; };
  let drag = null, hoverObj = null;
  canvas.addEventListener('pointerdown', e => {
    endTour(true); snd.unlock(); if (PHONE) ui.openCard(false);   // a touch on the scene folds the card away
    const i = built[cur];
    if (!i || book.busy) { swipe = book.busy ? null : { x: e.clientX, y: e.clientY, t: performance.now() }; return; }   // the cover and the back page: a swipe is the only touch gesture
    const hit = pick(e, i.targets);
    if (!hit) { swipe = { x: e.clientX, y: e.clientY, t: performance.now() }; return; }   // empty canvas: maybe a page swipe
    try { canvas.setPointerCapture(e.pointerId); } catch { /* a pointer that is already gone (or synthetic) must not break the book */ }
    const n = i.dragPlane === 'xy' ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    const plane = new THREE.Plane(n, -n.dot(hit.point));
    drag = { i, hit, plane, start: hit.point.clone(), last: hit.point.clone(), moved: false, sx: e.clientX, sy: e.clientY };
    i.press?.(hit);
  });
  canvas.addEventListener('pointermove', e => {
    const i = built[cur]; if (!i) return;
    if (drag) {
      toNdc(e); ray.setFromCamera(ndc, camera); const p = new THREE.Vector3();
      if (!ray.ray.intersectPlane(drag.plane, p)) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy; if (Math.hypot(dx, dy) > 4) drag.moved = true;
      i.drag?.({ point: holoRoot.worldToLocal(p.clone()), world: p, delta: p.clone().sub(drag.last), hit: drag.hit, dx, dy }); drag.last.copy(p);
    } else {
      magnify(e);
      const hit = pick(e, i.targets);
      if ((hit?.object || null) !== hoverObj) {
        tagged(hoverObj, 'handle')?.userData.setHot?.(false); hoverObj = hit?.object || null; tagged(hoverObj, 'handle')?.userData.setHot?.(true);
        i.hover?.(hit);
      }
      const h = tagged(hit?.object, 'handle');
      canvas.style.cursor = hit ? (h ? (h.userData.kind === 'knob' ? 'pointer' : 'ew-resize') : i.drag ? 'grab' : 'pointer') : 'default';
    }
  });
  /** The magnifier over the left page: project the pointer onto the page plane and show that patch of the page canvas. */
  const pagePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pagePt = new THREE.Vector3();
  function magnify(e) {
    const src = cur > N ? insideBack.image : cur ? pages[cur].left.image : null;
    if (!src || e.pointerType === 'touch' || (ui.sheetOpen && cur <= N)) { ui.lens(false); return; }   // a finger is not a hover   // the lens reads the printed page; with the panel open the page is quiet
    toNdc(e); ray.setFromCamera(ndc, camera); pagePlane.constant = -book.pageTopAt(cur);
    if (!ray.ray.intersectPlane(pagePlane, pagePt) || pagePt.x < -PAGE_W || pagePt.x > 0 || Math.abs(pagePt.z) > PAGE_H / 2) { ui.lens(false); return; }
    ui.lens(true, e.clientX, e.clientY, src, (pagePt.x + PAGE_W) / PAGE_W, (pagePt.z + PAGE_H / 2) / PAGE_H);
  }
  canvas.addEventListener('pointerleave', () => ui.lens(false));
  // a quick vertical swipe on empty canvas turns the page (touch has no wheel and no dots)
  // Swipes are read on the whole window (a finger often starts on a panel, not the canvas); controls are excluded.
  // Up or left = next spread, down or right = previous.
  let swipe = null;
  const onControl = t => !!t.closest?.('button,a,input,select,textarea,.sheet,.opts');
  addEventListener('pointerdown', e => { if (e.target !== canvas && !onControl(e.target)) swipe = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { passive: true });
  addEventListener('pointerup', e => {
    if (!swipe) return; const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y, quick = performance.now() - swipe.t < 900; swipe = null;
    if (!quick || book.busy) return;
    if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx) * 1.2) goTo(cur - Math.sign(dy));
    else if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) goTo(cur - Math.sign(dx));
  });
  addEventListener('pointercancel', () => { swipe = null; });
  const endDrag = () => { if (!drag) return; drag.i.release?.(); if (!drag.moved) { drag.i.tap?.(drag.hit); snd.play(tagged(drag.hit.object, 'handle') ? 'tick' : 'step'); } drag = null; };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
  let wheelAcc = 0, wheelLock = 0;
  addEventListener('wheel', e => { if (e.target.closest?.('.actions,.dots')) return; const now = performance.now(); if (now < wheelLock) return; wheelAcc += e.deltaY; if (Math.abs(wheelAcc) > 70) { goTo(cur + Math.sign(wheelAcc)); wheelAcc = 0; wheelLock = now + 900; } }, { passive: true });
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Escape') { endTour(true); return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { goTo(cur + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { goTo(cur - 1); e.preventDefault(); }
    else if (e.key === 'Home') goTo(0);
    else built[cur]?.key?.(e);
  });
  // ---- quality: measure on the cover, before any spread is built, then lock the tier ----------------------------
  const forcedTier = new URLSearchParams(location.search).get('tier');
  let tierReady = false;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;   // phones and tablets: never start above medium
  async function settleQuality() {
    const ms = forcedTier ? 0 : await measureFrameMs(50);
    tierName = pickTier(ms, forcedTier); tier = TIERS[tierName];
    if (coarsePointer && !forcedTier) { tierName = ms <= 40 ? 'phone' : 'low'; tier = TIERS[tierName]; }   // touch devices: the phone tier, or low when even the cover is slow
    // the GL liquid-glass refraction costs ~85 % of a frame and smears what sits behind the UI; CSS glass is the default, ?fx=glass opts in
    const glassOn = (new URLSearchParams(location.search).get('fx') || '').split(',').includes('glass') && tierName !== 'low';
    stage.setTier(tier); holo.setThickLines(tier.thick); stage.fx.glassPass.enabled = glassOn; ui.setGlassFx(glassOn);
    if (!forcedTier && tierName !== 'low') { await measureFrameMs(30); }   // let the new settings settle before the first page turn
    tierReady = true; console.info(`[quality] ${ms.toFixed(1)} ms → ${tierName}`);
  }
  const enter = quiet => { const el = document.getElementById('enter'); el.style.opacity = 0; setTimeout(() => el.remove(), 650); canvas.focus(); if (quiet) snd.setMuted(true); snd.unlock(); ui.setMuted(snd.muted); settleQuality(); };
  document.getElementById('go').onclick = () => enter(false);
  document.getElementById('go-quiet').onclick = e => { e.preventDefault(); enter(true); };

  // ---- loop ----------------------------------------------------------------------------------------
  const clock = new THREE.Clock(); let time = 0;
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05); time += dt;
    book.update(dt);
    if (camT.t < 1) { camT.t = Math.min(1, camT.t + dt / camT.dur); const k = ease(camT.t); camera.position.lerpVectors(camT.from.pos, camT.to.pos, k); look.lerpVectors(camT.from.look, camT.to.look, k); camera.lookAt(look); }
    // show the spread's hologram once the page has landed, with a pop
    const i = built[cur];
    if (!book.busy) {
      // the overview is the default view; the close-up tour only plays from the ▶ Watch chip
      if (i && !i.group.visible) {
        i.group.visible = true; i.group.userData.pop = 0; i.enter?.(); snd.play('pop'); seen.add(cur);
        if (fitPhone && camera.aspect < 1 && !tour) moveCam({ ...(SPREADS[cur].cam || CAM.spread), fit: i.group }, Math.max(.6, (1 - camT.t) * camT.dur));   // retarget from where the camera is
      }
      if (cur === 0 && !coverHolo.visible) { coverHolo.visible = true; coverHolo.userData.pop = 0; }
    }
    if (tour && time >= tour.until) nextShot();
    for (const g of [i?.group, coverHolo]) if (g?.visible && g.userData.pop < 1) { g.userData.pop = Math.min(1, g.userData.pop + dt * 2.2); const k = 1 - Math.pow(1 - g.userData.pop, 3); g.scale.set(k, k, k); }
    if (coverHolo.visible && coverHolo.userData.up) { coverHolo.userData.up.rotation.y = -.35 + Math.sin(time * .45) * .35; coverHolo.userData.up.position.y = (coverHolo.userData.upY ??= coverHolo.userData.up.position.y) + Math.sin(time * 1.3) * .4; }   // sways, never shows its back
    holoRoot.position.y = book.pageTopAt(cur) + .05;
    holo.tickGlass(holoRoot, time);
    if (i?.group.visible) i.update?.(dt, time);
    // N8AO and depth-of-field both read the composer's depth texture and must not run in the same frame
    const dofOn = tier.dof && tierReady && cur === 0 && camT.t >= 1;
    stage.fx.dofPass.enabled = dofOn; stage.fx.ao.enabled = tier.ao && !dofOn;
    if (stage.fx.glassPass.enabled) stage.fx.glass.setRects(ui.rects(), stage.bufferScale());
    stage.render(dt);
  }
  frame();

  // deep link + debug handle
  const m = location.hash.match(/spread-(\d+)/); if (m) setTimeout(() => goTo(+m[1]), 300);
  window.__book = { goTo, book, built, inst, camera, stage, holoRoot, THREE, get cur() { return cur; }, get tier() { return { name: tierName, ...tier, ready: tierReady }; }, get tour() { return tour; }, startTour, endTour, ui };
}
