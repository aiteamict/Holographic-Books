// The shared book runtime: stage, pages, navigation, input, camera tours, quality tiers, loop.
// A book's main.js calls runBook({ BOOK, COVER, LESSONS, QUIZ, SPREADS, ... }); see books/_template/main.js.
import * as THREE from 'three';
import './book.css';
import { createStage } from './stage.js';
import { Book } from './book.js';
import { renderPage as rawPage, renderCover, PAGE_W, PAGE_H, PHONE as TOUCH } from './page.js';
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
export function runBook({ BOOK, COVER, LESSONS, QUIZ, SPREADS, ctx: extra = {}, coverMark, coverHolo: makeCoverHolo, fitPhone = false, phoneLayout = 1, phoneZoom = false }) {
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
  const ui = new UI(document.getElementById('ui'), { title: BOOK.title, subtitle: BOOK.subtitle, home: BOOK.home || null, count: N + 1, labels: { [N + 1]: 'Back page' }, credit: BOOK.credit, titles: ['Cover', ...LESSONS.slice(1).map(l => l.title), COVER.insideBack.title], onNav: (k, rel) => goTo(rel ? cur + k : k), onAgain: () => { built[cur]?.reset?.(); ui.refreshActions(); snd.play('tick'); }, muted: snd.muted, onMute: m => snd.setMuted(m) });
  ui.onSheet = open => book.setLeftQuiet(open); book.setLeftQuiet(ui.sheetOpen);
  // phones (and any short, wide screen): the phone shell — one card, one toolbar, the hologram full-screen
  // narrow, or a touch screen held sideways; never a short laptop window
  // phone shell vs desktop panels follows the layout live: a tablet turned sideways, or a window resized, switches over
  const phoneMQ = matchMedia('(max-width: 820px), (pointer: coarse) and (max-height: 520px)');
  const applyPhone = () => { ui.setPhone(phoneMQ.matches); book.setLeftQuiet(phoneMQ.matches ? false : ui.sheetOpen); layoutCanvas(); };
  // phone layout 2 (opt-in per book): the canvas ends where the panel begins, so the scene renders only what can be seen
  ui.setLayout(phoneLayout);
  const p2 = () => phoneLayout === 2 && ui.phone;
  // the reader's view (pinch, two-finger drag, double-tap, both pages) comes with layout 2, or alone with phoneZoom
  const zoomOn = () => ui.phone && (phoneLayout === 2 || phoneZoom);
  ui.setZoom(phoneLayout !== 2 && phoneZoom);
  function layoutCanvas() {
    const s = canvas.style; let w = '', h = '';
    if (p2()) { const r = ui.$('mshell').getBoundingClientRect(), wide = innerWidth > innerHeight && innerHeight <= 520; w = wide ? Math.round(r.left) + 'px' : '100%'; h = wide ? '100%' : Math.round(r.top) + 'px'; }
    if (s.width !== w || s.height !== h) { s.width = w; s.height = h; dispatchEvent(new Event('resize')); }
    document.body.style.setProperty('--cw', (canvas.clientWidth || innerWidth) + 'px');   // captions centre on the canvas, not the window
  }
  if (typeof ResizeObserver === 'function') new ResizeObserver(layoutCanvas).observe(ui.$('mshell'));
  addEventListener('resize', layoutCanvas);
  applyPhone(); if (p2()) holo.setLabelScale(1.25);
  phoneMQ.addEventListener('change', () => { applyPhone(); syncGuide(built[cur]); });
  const ctx = { THREE, holo, ui, QUIZ, scene, camera, snd, renderer: stage.renderer, ...extra };   // renderer: for spreads that draw a second view (e.g. a driver's camera)
  const built = {};
  /** Each spread gets a ui whose captions only land while that spread is current, so a delayed caption cannot leak. */
  const scopedUI = k => Object.assign(Object.create(ui), { caption: (t, kicker, ms) => { if (cur === k) ui.caption(t, kicker, ms); } });
  function inst(k) {
    if (!k || !SPREADS[k]) return null;
    if (!built[k]) {
      const i = SPREADS[k].build({ ...ctx, ui: scopedUI(k) }); i.group.visible = false; i.group.userData.pop = 0; holoRoot.add(i.group); built[k] = i;
      if (p2()) {   // the panel carries the step text, so the card in the scene goes; readout cards say they open large
        const gc = i.guide?.card; if (gc) { gc.visible = false; i.targets = i.targets.filter(t => t !== gc); }
        for (const t of i.targets) if (t.userData.zoom && t.geometry?.parameters) { const m = holo.label('⤢ tap to enlarge', { h: .62, color: '#ffffff', bg: 'rgba(29,34,40,.86)', weight: 700 }); m.position.set(0, t.geometry.parameters.height / 2 + .5, .05); t.add(m); }
      }
    }
    return built[k];
  }
  /** Free a built spread's GPU memory. Shared materials and textures are safe to dispose: three re-uploads them on next use. */
  function drop(k) {
    const g = built[k].group; holoRoot.remove(g); delete built[k];
    g.traverse(o => {
      o.geometry?.dispose();
      for (const m of [o.material].flat()) if (m) { for (const v of Object.values(m)) if (v?.isTexture) v.dispose(); m.dispose(); }
    });
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
  // the camera the book asks for (bpos, look) and, on top of it, what the reader has done with two fingers:
  // view.s scales the distance (below 1 = closer), view.d moves the point looked at across the desk
  const bpos = camera.position.clone(), view = { s: 1, d: new THREE.Vector3() }, uLook = new THREE.Vector3();
  let vmode = "model";   // layout 2: "model" (the right page), "left" (the text page) or "book" (both pages)
  const camT = { from: null, to: null, t: 1, dur: 1.4 };
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function moveCam(preset, dur = 1.5) {
    camT.from = { pos: bpos.clone(), look: look.clone() };
    const to = new THREE.Vector3(...preset.pos), at = new THREE.Vector3(...preset.look);
    if (zoomOn() && preset !== CAM.cover && !tour && vmode !== "model") {   // layout 2: one page, or both, square to the reader
      const both = vmode === "book", half = both ? PAGE_W + 1.2 : PAGE_W / 2 + .9, e = both ? 1.08 : 1.3, t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dist = Math.max(half / (t * camera.aspect), (PAGE_H / 2 + 1) * Math.sin(e) / t) * 1.04;
      at.set(both ? 0 : -PAGE_W / 2, 0, 0); to.set(at.x, Math.sin(e) * dist, Math.cos(e) * dist);
      // then exactly: the page corners, and with both pages whatever of the hologram stands beyond them
      const y0 = holoRoot.position.y, xa = both ? -PAGE_W - .6 : -PAGE_W - .3, xb = both ? PAGE_W + .6 : .3, zh = PAGE_H / 2 + .6;
      // without layout 2 the card and toolbar lie over the canvas: fit into what they leave free (sideways, the right-hand part)
      const free = p2() ? null : innerWidth > innerHeight && innerHeight <= 520 ? [.02, .96, -.9, .9] : [-.94, .94, -.5, .88];
      fitPortrait(both && preset.fit ? preset.fit : null, to, at, true, [[xa, zh], [xb, zh], [xa, -zh], [xb, -zh]].map(([x, z]) => new THREE.Vector3(x, y0, z)), free);
      camT.to = { pos: to, look: at }; camT.t = 0; camT.dur = dur; return;
    }
    if (p2() && preset !== CAM.cover && !tour) {   // layout 2: look down steeply enough that the page's depth fills a tall canvas, then fit the hologram
      const e = Math.asin(THREE.MathUtils.clamp(25.2 / (camera.aspect * 29), .62, .9));
      at.set(PAGE_W / 2 + .2, 0, -1); to.set(at.x, Math.sin(e) * 70, at.z + Math.cos(e) * 70);
      if (preset.fit) fitPortrait(preset.fit, to, at, true);
      camT.to = { pos: to, look: at }; camT.t = 0; camT.dur = dur; return;
    }
    if (camera.aspect < 1 && preset.portrait) { to.set(...preset.portrait.pos); at.set(...preset.portrait.look); }   // a spread may frame itself for upright phones
    else if (camera.aspect < 1) {                                                   // portrait phones: frame the hologram page; the text is read in the sheet
      const cx = PAGE_W / 2 + 1.5; to.x += cx - at.x; at.x = cx; at.y -= 7;  // aim low: the hologram sits in the upper two thirds, above the card
      to.sub(at).multiplyScalar(2.05).add(at);
    }
    if (camera.aspect < 1 && preset.fit) fitPortrait(preset.fit, to, at);
    else if (camera.aspect >= 1 && preset !== CAM.cover && !tour) fitLandscape(to, at);
    camT.to = { pos: to, look: at }; camT.t = 0; camT.dur = dur;
  }
  // landscape: spreads aim at the right page so the hologram is large; on screens nearer 3:2 that pushed the start of
  // every line on the left page off the edge. Pan and pull back just enough to keep the left text margin and the right
  // page's edge on screen; wide screens that already show both keep the authored framing.
  function fitLandscape(to, at) {
    const pts = [[-PAGE_W + 1.8, 0, -PAGE_H / 2 + 2], [-PAGE_W + 1.8, 0, 8], [PAGE_W - .2, 0, -PAGE_H / 2 + 1], [PAGE_W - .2, 0, PAGE_H / 2 - 4]].map(p => new THREE.Vector3(...p));
    const cam = camera.clone(), v = new THREE.Vector3(), X = .97;
    for (let n = 0; n < 4; n++) {
      cam.position.copy(to); cam.lookAt(at); cam.updateMatrixWorld();
      let x0 = 1e9, x1 = -1e9; for (const p of pts) { v.copy(p).project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); }
      if (x0 >= -X && x1 <= X) return;
      const hx = to.distanceTo(at) * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect;
      const pan = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0).multiplyScalar((x0 + x1) / 2 * hx);
      to.add(pan); at.add(pan);
      to.sub(at).multiplyScalar(Math.max(1, (x1 - x0) / (2 * X))).add(at);
    }
  }
  // turning a phone between upright and sideways re-frames the current page (each has its own camera for each)
  let wasTall = camera.aspect < 1, rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => {
    const tall = camera.aspect < 1; if ((tall === wasTall && tall && !p2()) || tour) return; wasTall = tall;   // landscape refits on any resize (fitLandscape)
    const i = built[cur]; moveCam(cur ? { ...(SPREADS[cur]?.cam || CAM.spread), fit: fitPhone && i?.group.visible && i.group } : CAM.cover, .7);
  }, 250); });
  // upright phones: pan and pull back until everything the spread can show sits between the screen edges and above the
  // bottom bar. Measures the shown parts at full size (the group pops in from 0); hit meshes skipped.
  function fitPortrait(group, to, at, whole = false, extra = [], area = null) {   // area: [x0, x1, y0, y1] of the screen (−1..1) left free by the panels   // whole: the canvas is all the hologram's (layout 2), no bar to clear
    const pts = [...extra], v = new THREE.Vector3(), s0 = group?.scale.clone(), vis = group?.visible;   // extra: world points that must also be in view (page corners)
    if (group) { group.scale.set(1, 1, 1); group.visible = true; group.updateMatrixWorld(true); }
    group?.traverseVisible(o => {                                         // hidden parts (labels, alternate insets) don't count
      if (!o.geometry || o.material?.opacity === 0 || o.material?.visible === false || o.userData.noFit) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; if (!b || b.isEmpty()) return;
      for (let p = o; p && p !== group; p = p.parent) if (Math.max(p.scale.x, p.scale.y, p.scale.z) < .02) return;   // collapsed parts waiting to grow in sit at odd origins
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) pts.push(new THREE.Vector3(x, y, z).applyMatrix4(o.matrixWorld));
    });
    if (group) { group.scale.copy(s0); group.visible = vis; group.updateMatrixWorld(true); }
    if (!pts.length) return;
    const cam = camera.clone(), A = area || (whole ? [-.96, .96, -.95, .93] : [-.94, .94, -.52, .9]);   // by default the bottom clears the step peek and the control bar
    for (let n = 0; n < (whole ? 7 : 4); n++) {
      cam.position.copy(to); cam.lookAt(at); cam.updateMatrixWorld();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const p of pts) { v.copy(p).project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
      if (n === 0 && !whole && x0 >= A[0] && x1 <= A[1] && y0 >= A[2] && y1 <= A[3]) return;   // already fits: keep the authored framing
      const d = to.distanceTo(at), hy = d * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), hx = hy * cam.aspect;
      const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
      const pan = right.multiplyScalar(((x0 + x1) / 2 - (A[0] + A[1]) / 2) * hx).add(up.multiplyScalar(((y0 + y1) / 2 - (A[2] + A[3]) / 2) * hy));
      to.add(pan); at.add(pan);
      const k = Math.max(whole ? .2 : 1, (x1 - x0) / (A[1] - A[0]), (y1 - y0) / (A[3] - A[2]));   // layout 2 also moves in until the hologram fills the canvas
      to.sub(at).multiplyScalar(k).add(at);
    }
  }

  // ---- camera tours: a short shot list per spread, played once on the first visit, stopped by any input ----------
  const seen = new Set(); let tour = null;
  function startTour(k) {
    const shots = SPREADS[k]?.shots; if (!shots?.length) return;
    view.s = 1; view.d.set(0, 0, 0);
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
  let zoomTip = false;
  function goTo(k) {
    k = THREE.MathUtils.clamp(k, 0, N + 1); if (k === cur) return;     // N + 1 is the back page: text only
    unsharpen(); view.s = 1; view.d.set(0, 0, 0);
    vmode = !p2() ? "model" : k > N ? "left" : innerWidth > innerHeight ? "book" : "model";   // the back page is text; a phone held sideways has room for both pages
    ui.setViewLabel(vmode === "model" ? "Both pages" : "Model");
    const prev = cur; cur = k; endTour(true);
    if (drag) { drag.i.release?.(); drag = null; }   // a key or wheel turn mid-drag must not leave the old page grabbed
    if (built[prev]) { built[prev].leave?.(); built[prev].group.visible = false; }
    if (TOUCH) for (const j in built) if (Math.abs(j - k) > 1) drop(j);   // phones: keep only the neighbours; a revisit rebuilds
    coverHolo.visible = false;
    book.goTo(k); snd.play(Math.abs(k - prev) > 1 ? 'riffle' : 'page');
    const i = inst(k), back = k > N;
    ui.setStep(k, back ? COVER.insideBack.title : LESSONS[k]?.title ?? BOOK.title, back ? 'About this chapter and its sources. ← to go back.' : LESSONS[k]?.prompt ?? 'Scroll to open the book.');
    ui.setActions(i ? [...i.actions, ...(SPREADS[k].shots ? [watchAction(k)] : [])] : []); ui.hideCaption();
    ui.setMirror(i ? (i.a11y || []) : []); ui.setSheet(back ? COVER.insideBack : k ? LESSONS[k].left : COVER.insideCover);
    syncGuide(i);
    if (ui.phone && !zoomTip && i?.targets?.some(t => t.userData.zoom)) { zoomTip = true; setTimeout(() => ui.caption('Tap a card on the page to read it large.', 'Tip', p2() ? 3000 : 4500), 2600); }
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
    endTour(true); snd.unlock(); if (ui.phone) ui.openCard(false);   // a touch on the scene folds the card away
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
  // ---- layout 2: the reader moves the view. Pinch = closer or farther, two fingers dragged = across the desk,
  // double-tap a page = that page alone (again: both pages); one finger keeps turning pages and working the handles.
  let sharp = null;   // the left page being read, redrawn at full size: { k, old, tex }
  function sharpen() {
    if (!zoomOn() || sharp || cur < 1 || cur > N) return;
    const p = book.leftPages[cur - 1], tex = rawPage({ foot: BOOK.foot, ...LESSONS[cur].left, side: "left", pageNo: cur * 2 - 1 }, undefined, 56);
    sharp = { k: cur, old: p.full, tex }; p.full = tex; p.mesh.material.map = tex; p.mesh.material.needsUpdate = true;
  }
  function unsharpen() {
    if (!sharp) return; const p = book.leftPages[sharp.k - 1];
    p.full = sharp.old; p.mesh.material.map = sharp.old; p.mesh.material.needsUpdate = true; sharp.tex.dispose(); sharp = null;
  }
  function setView(mode) {
    if (!zoomOn() || !cur) return;
    vmode = mode; view.s = 1; view.d.set(0, 0, 0); ui.setViewLabel(mode === "model" ? "Both pages" : "Model");
    if (mode !== "model") sharpen();
    const i = built[cur]; moveCam({ ...(SPREADS[cur]?.cam || CAM.spread), fit: (p2() || fitPhone || mode !== "model") && i?.group.visible && i.group }, .7);   // "model" returns to the book's own framing
  }
  ui.onView = () => setView(vmode === "model" ? "book" : "model");
  const touches = new Map(); let pinch = null, lastTap = null;
  const two = () => { const [a, b] = [...touches.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
  canvas.addEventListener("pointerdown", e => {
    if (!zoomOn() || !cur) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now() });
    if (touches.size === 2) {   // a second finger: whatever the first one began (a drag, a swipe) is off
      if (drag) { drag.i.release?.(); drag = null; } swipe = null; sharpen();
      pinch = { ...two(), s: view.s, p: view.d.clone() };
    }
  });
  canvas.addEventListener("pointermove", e => {
    const t = touches.get(e.pointerId); if (!t) return; t.x = e.clientX; t.y = e.clientY;
    if (!pinch || touches.size < 2) return;
    const now = two(); view.s = THREE.MathUtils.clamp(pinch.s * pinch.d / now.d, .3, 2.4);
    // the page follows the fingers: screen pixels to desk centimetres at the distance looked at
    const dir = camera.getWorldDirection(new THREE.Vector3()), right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize();
    const fwd = new THREE.Vector3(dir.x, 0, dir.z).normalize(), wpp = 2 * bpos.distanceTo(look) * view.s * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / (canvas.clientHeight || 1);
    view.d.copy(pinch.p).addScaledVector(right, -(now.x - pinch.x) * wpp).addScaledVector(fwd, (now.y - pinch.y) * wpp / Math.max(.35, -dir.y));
    view.d.x = THREE.MathUtils.clamp(view.d.x, -34, 30); view.d.z = THREE.MathUtils.clamp(view.d.z, -22, 22);
  });
  const liftTouch = e => {
    const t = touches.get(e.pointerId); touches.delete(e.pointerId);
    if (pinch) { if (touches.size < 2) pinch = null; lastTap = null; return; }
    if (!t || !zoomOn() || !cur || e.type === "pointercancel") return;
    const now = performance.now(), still = Math.hypot(e.clientX - t.x0, e.clientY - t.y0) < 12 && now - t.t < 320;
    if (!still) { lastTap = null; return; }
    if (lastTap && now - lastTap.t < 340 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 40) {   // double-tap: which page is under the finger?
      lastTap = null; toNdc(e); ray.setFromCamera(ndc, camera);
      const hit = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -holoRoot.position.y), new THREE.Vector3());
      const page = hit && hit.x < 0 ? "left" : "model"; setView(vmode === page ? "book" : page);
    } else lastTap = { t: now, x: e.clientX, y: e.clientY };
  };
  canvas.addEventListener("pointerup", liftTouch); canvas.addEventListener("pointercancel", liftTouch);
  const endDrag = () => {
    if (!drag) return; drag.i.release?.();
    if (!drag.moved) {
      const z = ui.phone && tagged(drag.hit.object, 'zoom');   // phones: a readout card opens large instead of being tapped
      if (z) ui.zoomCard(z.material.map.image); else drag.i.tap?.(drag.hit);
      snd.play(tagged(drag.hit.object, 'handle') ? 'tick' : 'step');
    }
    drag = null;
  };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
  let wheelAcc = 0, wheelLock = 0;
  addEventListener('wheel', e => { if (e.target.closest?.('.actions,.dots,.sheet,.gpanel,.mbody,.mmenu,.steps')) return; const now = performance.now(); if (now < wheelLock) return; wheelAcc += e.deltaY; if (Math.abs(wheelAcc) > 70) { goTo(cur + Math.sign(wheelAcc)); wheelAcc = 0; wheelLock = now + 900; } }, { passive: true });   // scrolling a text panel must not turn the page
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if ((e.key === ' ' || e.key === 'Enter') && onControl(e.target)) return;   // Space/Enter on a focused button presses it, not the page
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
  // phone layout 2: if the phone cannot hold about 45 frames a second, give up pixels first, then shadow detail (three steps)
  let aLast = performance.now(), aN = 0, aSum = 0, aLevel = 0;
  function adapt() {
    const now = performance.now(), d = now - aLast; aLast = now;
    if (!p2() || !tierReady || book.busy || d > 250 || aLevel >= 3) return;   // page turns and a backgrounded tab do not count
    aN++; aSum += d; if (aN < 90) return;
    const avg = aSum / aN; aN = aSum = 0;
    if (avg > 22) { aLevel++; stage.setTier({ ...tier, dpr: [1, .8, .65][aLevel - 1], shadow: aLevel >= 2 ? 512 : tier.shadow }); console.info('[quality] ' + avg.toFixed(1) + ' ms a frame: phone step ' + aLevel); }
  }
  // ?fps: a frame meter for testing on a real phone: frames per second, the worst frame of the last second, the worst of the last page turn
  const meter = /[?&]fps\b/.test(location.search) ? (() => {
    const el = document.createElement('div'); el.style.cssText = 'position:fixed;left:6px;top:6px;z-index:80;padding:4px 8px;border-radius:8px;background:rgba(0,0,0,.72);color:#fff;font:600 12px/1.3 monospace;pointer-events:none'; document.body.append(el);
    let last = performance.now(), n = 0, acc = 0, worst = 0, turn = 0, wasBusy = false;
    return busy => {
      const now = performance.now(), d = now - last; last = now; n++; acc += d; worst = Math.max(worst, d);
      if (busy && !wasBusy) turn = 0; if (busy) turn = Math.max(turn, d); wasBusy = busy;
      if (acc >= 1000) { el.textContent = `${Math.round(n * 1000 / acc)} fps · worst ${worst.toFixed(0)} ms · turn ${turn.toFixed(0)} ms`; n = acc = worst = 0; }
    };
  })() : null;
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05); time += dt;
    if (ui.covered) return;   // the full-screen reader is open: nothing of the scene can be seen
    if (meter) meter(book.busy);
    adapt();
    book.update(dt);
    if (camT.t < 1) { camT.t = Math.min(1, camT.t + dt / camT.dur); const k = ease(camT.t); bpos.lerpVectors(camT.from.pos, camT.to.pos, k); look.lerpVectors(camT.from.look, camT.to.look, k); }
    uLook.copy(look).add(view.d); camera.position.copy(bpos).sub(look).multiplyScalar(view.s).add(uLook); camera.lookAt(uLook);
    // show the spread's hologram once the page has landed, with a pop
    const i = built[cur];
    if (!book.busy) {
      // the overview is the default view; the close-up tour only plays from the ▶ Watch chip
      if (i && !i.group.visible) {
        i.group.visible = true; i.group.userData.pop = 0; i.enter?.(); snd.play('pop'); seen.add(cur);
        if ((p2() || fitPhone && camera.aspect < 1) && !tour) i.update?.(0, time);   // let the spread place its phone layout before it is measured
        if ((p2() || fitPhone && camera.aspect < 1) && !tour) moveCam({ ...(SPREADS[cur].cam || CAM.spread), fit: i.group }, Math.max(.6, (1 - camT.t) * camT.dur));
        if (p2() && cur < N) (window.requestIdleCallback || setTimeout)(() => inst(cur + 1), { timeout: 1500 });   // build the next spread while idle, not during the page turn   // retarget from where the camera is
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
