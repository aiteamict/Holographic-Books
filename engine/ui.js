// The DOM layer over the canvas: title, step card, dots, actions, captions.
export class UI {
  constructor(root, { title, subtitle, credit = "", home = null, count, labels = {}, titles = [], onNav, onAgain, muted = false, onMute }) {
    this.root = root; this.home = home; this.count = count; this.onNav = onNav; this.onMute = onMute;
    root.innerHTML = `
      <div class="brand">${home ? `<a class="home" href="${home.href}">← ${home.label}</a>` : ''}<h1>${title}</h1><p>${subtitle}</p></div>
      <button class="mute glass" id="mute" aria-pressed="${muted}" aria-label="Sound on or off">${muted ? '🔇' : '🔊'}</button>
      <div class="step glass" id="step"><div class="n">00</div><div><b></b><span></span></div></div>
      <button class="again glass" id="again" aria-label="Reset this spread"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>AGAIN</button>
      <div class="actions" id="actions" role="group" aria-label="Things to try on this spread"></div>
      <nav class="dots glass" id="dots" aria-label="Spreads"></nav>
      <div class="caption glass" id="caption" aria-live="polite"><small id="capk"></small><div id="capt"></div></div>
      <div class="hint glass" id="hint"><b>Scroll</b> or <b>swipe</b> to open the book · drag the holograms · <b>←/→</b> turn pages</div>
      <div class="credit">© ${new Date().getFullYear()}${credit ? " · " + credit : ""}</div>
      <div class="sr" id="mirror" role="group" aria-label="Keyboard controls for the hologram"></div>
      <section class="sheet glass" id="sheet" aria-label="Page text"></section>
      <button class="sheet-toggle glass" id="sheet-toggle" aria-expanded="false">Read the page</button>
      <div class="lens" id="lens" aria-hidden="true"><canvas width="416" height="416"></canvas></div>
      <button class="viewbtn" id="m-view2" type="button">Both pages</button>
      <div class="mshell" id="mshell">
        <section class="mcard glass" id="mcard">
          <button class="mhead" id="mhead" aria-expanded="false"><span class="mt"><span id="mtitle"></span><small id="mpeek"></small></span><span class="chev">▲</span></button>
          <div class="mrow" id="mrow"><div id="mdots" role="group" aria-label="Guided steps"></div><button id="m-view" type="button">Both pages</button><button id="m-read" type="button">Read</button></div>
          <div class="mbody" id="mbody" data-tab="guide"><div class="mtabs"><button data-tab="guide" class="on">Steps</button><button data-tab="page">Page</button></div><div id="mslot"></div></div>
        </section>
        <nav class="mbar glass" id="mbar" aria-label="Book controls">
          <button id="m-menu" aria-label="Contents">☰</button><button id="m-prev" aria-label="Previous spread">‹</button><button id="m-watch" aria-label="Watch the tour">▶</button>
          <span id="m-where"></span>
          <button id="m-next" class="primary" aria-label="Next spread">›</button><button id="m-mute" aria-label="Sound">🔊</button><button id="m-again" aria-label="Reset this spread">↺</button>
        </nav>
        <div class="mmenu glass" id="mmenu" hidden></div>
      </div>`;
    this.$ = id => root.querySelector('#' + id);
    const dots = this.$('dots');
    const up = document.createElement('button'); up.className = 'arrow'; up.textContent = '︿'; up.setAttribute('aria-label', 'Previous spread'); up.onclick = () => onNav(-1, true); dots.append(up);
    for (let i = 0; i <= count; i++) { const b = document.createElement('button'); b.setAttribute('aria-label', labels[i] ?? (i ? `Spread ${i}` : 'Cover')); b.onclick = () => onNav(i); dots.append(b); }
    const dn = document.createElement('button'); dn.className = 'arrow'; dn.textContent = '﹀'; dn.setAttribute('aria-label', 'Next spread'); dn.onclick = () => onNav(1, true); dots.append(dn);
    this.$('again').onclick = onAgain;
    this.muted = muted; this.$('mute').onclick = () => { this.setMuted(!this.muted); this.onMute?.(this.muted); };
    this.$('sheet-toggle').onclick = () => { const s = this.$('sheet'), open = !s.classList.contains('open'); s.classList.toggle('open', open); this.$('sheet-toggle').setAttribute('aria-expanded', String(open)); this.$('sheet-toggle').textContent = open ? 'Hide the page' : 'Read the page'; this.onSheet?.(open); };
    this.capTimer = 0;
    // the phone shell: one collapsible card (steps / page text) and one toolbar; wired here, shown by setPhone()
    this.titles = titles; this.phone = false;
    this.$('mhead').onclick = () => this.openCard(!this.$('mcard').classList.contains('open'));
    this.$('mbody').querySelectorAll('.mtabs button').forEach(b => { b.onclick = () => { this.$('mbody').dataset.tab = b.dataset.tab; this.$('mbody').querySelectorAll('.mtabs button').forEach(x => x.classList.toggle('on', x === b)); }; });
    this.$('m-read').onclick = () => this.reader(true);
    this.$('m-view').onclick = () => this.onView?.(); this.$('m-view2').onclick = () => this.onView?.();
    this.$('m-prev').onclick = () => onNav(-1, true); this.$('m-next').onclick = () => onNav(1, true);
    this.$('m-again').onclick = onAgain; this.$('m-mute').onclick = () => this.$('mute').click();
    this.$('m-watch').onclick = () => { const w = (this.actions || []).find(a => a.label === '▶ Watch'); w?.run(); };
    this.$('m-menu').onclick = () => { const m = this.$('mmenu'); if (!m.hidden) { m.hidden = true; return; } m.textContent = ''; if (this.home) { const a = document.createElement('a'); a.className = 'home'; a.href = this.home.href; a.textContent = '← ' + this.home.label; m.append(a); } (this.titles || []).forEach((t, k) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = k ? `${k} · ${t}` : t; b.classList.toggle('on', k === this.cur); b.onclick = () => { m.hidden = true; onNav(k); }; m.append(b); }); m.hidden = false; };
  }
  /** Phone layout 2 (opt-in per book): a fixed panel under the canvas instead of a card over it. */
  setLayout(v) { this.p2 = v === 2; document.body.classList.toggle('p2', this.p2); }
  /** Layout 2: the left page's text as a full-screen reader. `covered` tells the frame loop it can rest. */
  reader(open) {
    let r = document.getElementById('reader');
    if (!r) { r = document.createElement('div'); r.id = 'reader'; r.hidden = true; r.setAttribute('role', 'dialog'); r.setAttribute('aria-label', 'Page text'); document.body.append(r); }
    this.covered = open; r.hidden = !open; if (!open) return;
    r.textContent = ''; const x = document.createElement('button'); x.type = 'button'; x.className = 'x'; x.textContent = 'Close ✕'; x.onclick = () => this.reader(false); r.append(x);
    for (const n of this.$('sheet').childNodes) r.append(n.cloneNode(true));
    r.scrollTop = 0;
  }
  /** Layout 2: the view button names the view it switches to. */
  setViewLabel(t) { this.$('m-view').textContent = t; this.$('m-view2').textContent = t; }
  /** The view button for books that take the zoom gestures without layout 2: it floats at the top right on phones. */
  setZoom(on) { document.body.classList.toggle('zoom', !!on); }
  /** Layout 2: with no guide and no controls (cover, back page) the panel shrinks to the toolbar. */
  _bare() { this.$('mshell').classList.toggle('bare', !!this.p2 && !this._hasGuide && !(this.actions || []).length); }
  /** switch the DOM into phone mode: the panels move into the card, the toolbar takes over navigation */
  setPhone(on) {
    if (on === this.phone) return;
    this.phone = on; document.body.classList.toggle('phone', on);
    if (!on) {   // back to desktop: the panels leave the card for their own places; the text sheet closes (the page shows it)
      for (const id of ['gpanel', 'actions', 'steps', 'mirror', 'sheet']) { const el = this.$(id); if (el) this.root.append(el); }
      this.$('sheet')?.classList.remove('open'); this.openCard(false); this.$('mmenu').hidden = true; this.$('mpeek').textContent = ''; return;
    }
    const slot = this.$('mslot'); for (const id of ['gpanel', 'actions', 'steps', 'mirror', 'sheet']) { const el = this.$(id); if (el) slot.append(el); }
    this.$('sheet').classList.add('open'); this.openCard(false);   // folded by default: the scene stays visible; the peek line says what to do
  }
  /** Phones: show a readout card's canvas full width, live, until tapped. */
  zoomCard(src) {
    let o = document.getElementById('zoomcard');
    if (!o) { o = document.createElement('div'); o.id = 'zoomcard'; o.innerHTML = '<canvas></canvas><small>tap anywhere to close</small>'; document.body.append(o); o.onclick = () => { o.hidden = true; }; }
    const c = o.querySelector('canvas'); c.width = src.width; c.height = src.height; o.hidden = false;
    const tick = () => { if (o.hidden) return; const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(src, 0, 0); requestAnimationFrame(tick); }; tick();
  }
  openCard(open) { const c = this.$('mcard'); c.classList.toggle('open', open); this.$('mhead').setAttribute('aria-expanded', String(open)); if (open) this.$('mmenu').hidden = true; }
  /** keep the card's panels in reading order whatever order they were created in */
  _order() { if (!this.phone) return; const slot = this.$('mslot'); for (const id of ['gpanel', 'actions', 'steps', 'mirror', 'sheet']   /* the live controls sit right under the question, within thumb reach */) { const el = this.$(id); if (el) slot.append(el); } }
  /**
   * The magnifier: a round lens up-right of the cursor showing the page canvas around (u, v) at about 3×.
   * lens(false) hides it. src: the page's canvas; u, v in 0..1 from the page's top-left.
   */
  lens(show, x = 0, y = 0, src = null, u = 0, v = 0) {
    const el = this.$('lens'); if (!show || !src) { el.style.display = 'none'; return; }
    const size = el.offsetWidth || 272, W = src.width, H = src.height, sw = W / 3;   // about three lines of body text per lens
    const sx = Math.min(Math.max(u * W - sw / 2, 0), W - sw), sy = Math.min(Math.max(v * H - sw / 2, 0), H - sw);
    const c = el.firstElementChild, g = c.getContext('2d'); g.fillStyle = '#f4efe6'; g.fillRect(0, 0, c.width, c.height); g.drawImage(src, sx, sy, sw, sw, 0, 0, c.width, c.height);
    const left = Math.min(x + 26, innerWidth - size - 8), top = Math.max(8, y - size - 26);
    el.style.display = 'block'; el.style.left = left + 'px'; el.style.top = top + 'px';
  }
  /** Hidden buttons mirroring drag/tap-only interactions, for keyboard and screen-reader users. items: [{label, run}] */
  setMirror(items = []) {
    const m = this.$('mirror'); m.textContent = '';
    for (const it of items) { const b = document.createElement('button'); b.type = 'button'; b.textContent = it.label; b.onclick = it.run; m.append(b); }
  }
  get sheetOpen() { return this.$('sheet').classList.contains('open'); }
  /** The left page's text as a reading panel (desktop) or bottom sheet (narrow screens). */
  setSheet(spec) {
    const s = this.$('sheet'); s.textContent = ''; if (!spec) return;
    const rich = t => t.split(/(\*\*[^*]+\*\*)/).map(p => p.startsWith('**') ? Object.assign(document.createElement('b'), { textContent: p.slice(2, -2) }) : document.createTextNode(p));
    if (spec.kicker) { const k = document.createElement('small'); k.textContent = spec.kicker; s.append(k); }
    if (spec.title) { const h = document.createElement('h3'); h.textContent = spec.title; s.append(h); }
    for (const t of [spec.lede, ...(spec.paras || []), ...(spec.notes || [])].filter(Boolean)) { const p = document.createElement('p'); p.append(...rich(t)); s.append(p); }
  }
  setMuted(m) { this.muted = m; const b = this.$('mute'); b.textContent = m ? '🔇' : '🔊'; b.classList.toggle('off', m); b.setAttribute('aria-pressed', String(m)); const mm = this.$('m-mute'); if (mm) mm.textContent = m ? '🔇' : '🔊'; }
  setStep(k, title, prompt) {
    this.cur = k; this.$('mtitle').textContent = k ? `${k}. ${title}` : title; { const w = this.$('m-where'); w.textContent = ''; if (k) { const n = document.createElement('b'); n.textContent = k; w.append(n); } w.append(title); }
    if (this.phone) { this.$('mpeek').textContent = ''; this.$('mbody').dataset.tab = 'guide'; this.$('mbody').querySelectorAll('.mtabs button').forEach(x => x.classList.toggle('on', x.dataset.tab === 'guide')); }
    const s = this.$('step');
    s.querySelector('.n').textContent = String(k).padStart(2, '0');
    s.querySelector('b').textContent = title; s.querySelector('span').textContent = prompt;
    [...this.$('dots').querySelectorAll('button:not(.arrow)')].forEach((b, i) => b.classList.toggle('on', i === k));
    this.$('hint').style.display = k === 0 ? '' : 'none';
    this.$('again').style.visibility = k === 0 ? 'hidden' : 'visible';
  }
  /** actions: [{ label, run, toggle?: () => bool }] */
  setActions(actions = []) {
    const box = this.$('actions'); box.textContent = ''; this.actions = actions;
    for (const a of actions) {
      const b = document.createElement('button'); b.textContent = a.label; b.type = 'button';
      b.onclick = () => { a.run(); this.refreshActions(); };
      box.append(b); a.el = b;
    }
    this.refreshActions(); this._bare();
  }
  refreshActions() { for (const a of this.actions || []) if (a.el) { if (a.toggle) a.el.classList.toggle('on', !!a.toggle()); if (a.hidden) a.el.classList.toggle('hid', !!a.hidden()); } }
  /**
   * The phone mirror of the guide card: the step's text, the check's option buttons and a Next button, as DOM.
   * Hidden by CSS on wide screens, where the 3-D card is readable. info: guide.current or null; on: { pick(k), next() }.
   */
  setGuidePanel(info, on = {}) {
    this._hasGuide = !!info; this._bare();
    if (this.phone) this.$('mpeek').textContent = info ? (info.free ? 'Explore · everything is live' : info.title) + ' · tap to open' : '';
    let p = this.$('gpanel');
    if (!p) { p = document.createElement('section'); p.id = 'gpanel'; p.className = 'gpanel glass'; p.setAttribute('aria-live', 'polite'); (this.phone ? this.$('mslot') : this.root).prepend(p); this._order(); this._glassEls = null; }
    p.textContent = ''; p.style.display = info ? '' : 'none'; if (!info) return;
    const h = document.createElement('small'); h.textContent = info.title; p.append(h);
    const t = document.createElement('p'); t.textContent = info.text; p.append(t);
    if (info.options) { const row = document.createElement('div'); row.className = 'opts'; info.options.forEach((o, k) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = o; if (info.picked === k) b.classList.add(k === info.answer ? 'ok' : 'bad'); b.onclick = () => on.pick?.(k); row.append(b); }); p.append(row); }
    if (info.canNext) { const n = document.createElement('button'); n.type = 'button'; n.className = 'next'; n.textContent = info.last ? 'Explore freely →' : 'Next step →'; n.onclick = () => on.next?.(); p.append(n); }
  }
  /** The guided-step strip: one chip per step plus Explore. items: [titles]; active: index (>= length = Explore). */
  setSteps(items = [], active = 0, onPick) {
    let s = this.$('steps');
    if (!s) { s = document.createElement('nav'); s.id = 'steps'; s.className = 'steps glass'; s.setAttribute('aria-label', 'Guided steps'); (this.phone ? this.$('mslot') : this.root).append(s); this._order(); this._glassEls = null; }
    s.textContent = ''; s.style.display = items.length ? '' : 'none';
    [...items, 'Explore'].forEach((t, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = k < items.length ? `${k + 1} · ${t}` : t;
      b.classList.toggle('on', k === Math.min(active, items.length)); b.classList.toggle('done', k < active); b.onclick = () => onPick?.(k); s.append(b);
    });
    // layout 2: the same steps as numbered dots in the panel's top row
    const d = this.$('mdots'); d.textContent = '';
    if (items.length) [...items, 'Explore'].forEach((t, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = k < items.length ? String(k + 1) : '∞'; b.setAttribute('aria-label', k < items.length ? `Step ${k + 1}: ${t}` : 'Explore freely');
      b.classList.toggle('on', k === Math.min(active, items.length)); b.classList.toggle('done', k < active); b.onclick = () => onPick?.(k); d.append(b);
    });
  }
  caption(text, kicker = '', ms = 6000) {
    const c = this.$('caption'); this.$('capk').textContent = kicker; this.$('capt').textContent = text; c.classList.add('show');
    clearTimeout(this.capTimer); if (ms) this.capTimer = setTimeout(() => c.classList.remove('show'), ms);
  }
  hideCaption() { this.$('caption').classList.remove('show'); }
  /** Rectangles of the glass UI (CSS px) for the liquid-glass pass. */
  rects() {
    if (!this._glassEls) this._glassEls = [...this.root.querySelectorAll('.glass')];
    const out = [];
    const push = (el, tint, strength, hi) => {
      if (!el.offsetParent && el.style.visibility !== 'visible') { /* display:none */ }
      const b = el.getBoundingClientRect(); if (b.width < 2 || b.height < 2) return;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) return;
      const r = parseFloat(cs.borderTopLeftRadius) || 0;
      out.push({ x: b.left, y: b.top, w: b.width, h: b.height, r: Math.min(r, b.width / 2, b.height / 2), tint, strength, hi });
    };
    for (const el of this._glassEls) push(el, .55, 1, 0);
    for (const b of this.$('actions').querySelectorAll('button')) push(b, .5, 1, b.classList.contains('on') ? 1 : 0);
    return out;
  }
  /** When the liquid-glass pass is on, the CSS glass becomes a thin tint so the shader does the work. */
  setGlassFx(on) { document.body.classList.toggle('fx', on); }
}
