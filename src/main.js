import * as THREE from 'three';
import { createStage } from './engine/stage.js';
import { Book } from './engine/book.js';
import { renderPage, renderCover, PAGE_W, PAGE_H } from './engine/page.js';
import { UI } from './engine/ui.js';
import * as holo from './engine/holo.js';
import * as sign from './sign/index.js';
import { BOOK, COVER, LESSONS, QUIZ } from './content/lessons.js';
import { SPREADS } from './spreads/index.js';
import { TIERS, measureFrameMs, pickTier } from './engine/quality.js';
import { initHero, makeHero } from './engine/hero.js';
import { Sound } from './engine/sound.js';
import { tagged } from './spreads/util.js';

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
const cover = renderCover((ctx, W, H) => {
  const c = document.createElement('canvas'); c.width = 450; c.height = 600; sign.drawFace(c, '42');
  const k = W / 1040; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40 * k; ctx.shadowOffsetY = 14 * k; ctx.drawImage(c, W / 2 - 170 * k, 520 * k, 340 * k, 453 * k); ctx.restore();
});
const insideBack = renderPage(COVER.insideBack);
const book = new Book({ cover, insideCover: renderPage(COVER.insideCover), insideBack, spreads: pages });
scene.add(book.group);

// ---- holograms -----------------------------------------------------------------------------------
const holoRoot = new THREE.Group(); holoRoot.position.set(PAGE_W / 2, book.pageTopAt(0) + .05, 0); scene.add(holoRoot);
const snd = new Sound();
const ui = new UI(document.getElementById('ui'), { title: BOOK.title, subtitle: BOOK.subtitle, count: N + 1, labels: { [N + 1]: 'Back page' }, onNav: (k, rel) => goTo(rel ? cur + k : k), onAgain: () => { built[cur]?.reset?.(); ui.refreshActions(); snd.play('tick'); }, muted: snd.muted, onMute: m => snd.setMuted(m) });
ui.onSheet = open => book.setLeftQuiet(open); book.setLeftQuiet(ui.sheetOpen);
const ctx = { THREE, holo, sign, ui, QUIZ, scene, camera, hero: makeHero, snd };
const heroReady = initHero();
const built = {};
/** Each spread gets a ui whose captions only land while that spread is current, so a delayed caption cannot leak. */
const scopedUI = k => Object.assign(Object.create(ui), { caption: (t, kicker, ms) => { if (cur === k) ui.caption(t, kicker, ms); } });
function inst(k) {
  if (!k || !SPREADS[k]) return null;
  if (!built[k]) { const i = SPREADS[k].build({ ...ctx, ui: scopedUI(k) }); i.group.visible = false; i.group.userData.pop = 0; holoRoot.add(i.group); built[k] = i; }
  return built[k];
}
// cover hologram: the shield outline, turning slowly over the closed book
const coverHolo = new THREE.Group();
{
  const S = .03, o = sign.shieldOutline().map(p => ({ x: p.x - 225, y: p.y - 300 }));
  const up = new THREE.Group(); up.position.y = 12;
  up.add(holo.outline(o, holo.CYAN, { scale: S }), holo.fillPoly(o, holo.CYAN, { scale: S, opacity: .08 }));
  const gc = document.createElement('canvas'); gc.width = 450; gc.height = 600; sign.drawFace(gc, '42', { yellow: 'rgba(0,0,0,0)', ink: '#9fe8ff', noBorder: true });
  const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace;
  up.add(new THREE.Mesh(new THREE.PlaneGeometry(450 * S, 600 * S), new THREE.MeshBasicMaterial({ map: gt, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })));
  coverHolo.add(holo.projector(11), up); coverHolo.userData.up = up; coverHolo.userData.pop = 0;
  coverHolo.position.set(PAGE_W + 1, -book.pageTopAt(0) - .05 - .9, 0);   // beside the closed book, standing on the desk, never on the cover's title
  holoRoot.add(coverHolo);
  heroReady.then(() => { const h = makeHero(7); h.position.set(-7.5, 0, 5); h.rotation.y = .6; coverHolo.add(h); });   // the surveyor, sizing up the shield
}

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
  if (camera.aspect < 1) {                                                   // portrait phones: frame the hologram page; the text is read in the sheet
    const cx = PAGE_W / 2 + 3; to.x += cx - at.x; at.x = cx; at.y -= 11;   // aim low: the hologram rises into the free top half, above the phone's bottom panels
    to.sub(at).multiplyScalar(2).add(at);
  }
  camT.to = { pos: to, look: at }; camT.t = 0; camT.dur = dur;
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
function endTour(interrupted) { if (!tour) return; const k = tour.k; tour = null; moveCam(SPREADS[k].cam || CAM.spread, interrupted ? .9 : 1.6); }
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
  moveCam(k ? (SPREADS[k]?.cam || CAM.spread) : CAM.cover);
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
  endTour(true); snd.unlock();
  const i = built[cur];
  if (!i || book.busy) { swipe = book.busy ? null : { x: e.clientX, y: e.clientY, t: performance.now() }; return; }   // the cover and the back page: a swipe is the only touch gesture
  const hit = pick(e, i.targets);
  if (!hit) { swipe = { x: e.clientX, y: e.clientY, t: performance.now() }; return; }   // empty canvas: maybe a page swipe
  canvas.setPointerCapture(e.pointerId);
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
let swipe = null;
canvas.addEventListener('pointerup', e => {
  if (!swipe) return; const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y, quick = performance.now() - swipe.t < 700; swipe = null;
  if (quick && Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx) * 1.4) goTo(cur - Math.sign(dy));
});
canvas.addEventListener('pointercancel', () => { swipe = null; });
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
    if (i && !i.group.visible) { i.group.visible = true; i.group.userData.pop = 0; i.enter?.(); snd.play('pop'); seen.add(cur); }
    if (cur === 0 && !coverHolo.visible) { coverHolo.visible = true; coverHolo.userData.pop = 0; }
  }
  if (tour && time >= tour.until) nextShot();
  for (const g of [i?.group, coverHolo]) if (g?.visible && g.userData.pop < 1) { g.userData.pop = Math.min(1, g.userData.pop + dt * 2.2); const k = 1 - Math.pow(1 - g.userData.pop, 3); g.scale.set(k, k, k); }
  if (coverHolo.visible) { coverHolo.userData.up.rotation.y = -.35 + Math.sin(time * .45) * .35; coverHolo.userData.up.position.y = 12 + Math.sin(time * 1.3) * .4; }   // sways, never shows its back
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
