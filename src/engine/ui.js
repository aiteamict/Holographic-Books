// The DOM layer over the canvas: title, step card, dots, actions, captions.
export class UI {
  constructor(root, { title, subtitle, count, labels = {}, onNav, onAgain, muted = false, onMute }) {
    this.root = root; this.count = count; this.onNav = onNav; this.onMute = onMute;
    root.innerHTML = `
      <div class="brand"><h1>${title}</h1><p>${subtitle}</p></div>
      <button class="mute glass" id="mute" aria-pressed="${muted}" aria-label="Sound on or off">${muted ? '🔇' : '🔊'}</button>
      <div class="step glass" id="step"><div class="n">00</div><div><b></b><span></span></div></div>
      <button class="again glass" id="again" aria-label="Reset this spread"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>AGAIN</button>
      <div class="actions" id="actions" role="group" aria-label="Things to try on this spread"></div>
      <nav class="dots glass" id="dots" aria-label="Spreads"></nav>
      <div class="caption glass" id="caption" aria-live="polite"><small id="capk"></small><div id="capt"></div></div>
      <div class="hint glass" id="hint"><b>Scroll</b> or <b>swipe</b> to open the book · drag the holograms · <b>←/→</b> turn pages</div>
      <div class="credit">© ${new Date().getFullYear()} · built from IRC : 2-1968</div>
      <div class="sr" id="mirror" role="group" aria-label="Keyboard controls for the hologram"></div>
      <section class="sheet glass" id="sheet" aria-label="Page text"></section>
      <button class="sheet-toggle glass" id="sheet-toggle" aria-expanded="false">Read the page</button>
      <div class="lens" id="lens" aria-hidden="true"><canvas width="416" height="416"></canvas></div>`;
    this.$ = id => root.querySelector('#' + id);
    const dots = this.$('dots');
    const up = document.createElement('button'); up.className = 'arrow'; up.textContent = '︿'; up.setAttribute('aria-label', 'Previous spread'); up.onclick = () => onNav(-1, true); dots.append(up);
    for (let i = 0; i <= count; i++) { const b = document.createElement('button'); b.setAttribute('aria-label', labels[i] ?? (i ? `Spread ${i}` : 'Cover')); b.onclick = () => onNav(i); dots.append(b); }
    const dn = document.createElement('button'); dn.className = 'arrow'; dn.textContent = '﹀'; dn.setAttribute('aria-label', 'Next spread'); dn.onclick = () => onNav(1, true); dots.append(dn);
    this.$('again').onclick = onAgain;
    this.muted = muted; this.$('mute').onclick = () => { this.setMuted(!this.muted); this.onMute?.(this.muted); };
    this.$('sheet-toggle').onclick = () => { const s = this.$('sheet'), open = !s.classList.contains('open'); s.classList.toggle('open', open); this.$('sheet-toggle').setAttribute('aria-expanded', String(open)); this.$('sheet-toggle').textContent = open ? 'Hide the page' : 'Read the page'; this.onSheet?.(open); };
    this.capTimer = 0;
  }
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
  setMuted(m) { this.muted = m; const b = this.$('mute'); b.textContent = m ? '🔇' : '🔊'; b.classList.toggle('off', m); b.setAttribute('aria-pressed', String(m)); }
  setStep(k, title, prompt) {
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
    this.refreshActions();
  }
  refreshActions() { for (const a of this.actions || []) if (a.el) { if (a.toggle) a.el.classList.toggle('on', !!a.toggle()); if (a.hidden) a.el.classList.toggle('hid', !!a.hidden()); } }
  /**
   * The phone mirror of the guide card: the step's text, the check's option buttons and a Next button, as DOM.
   * Hidden by CSS on wide screens, where the 3-D card is readable. info: guide.current or null; on: { pick(k), next() }.
   */
  setGuidePanel(info, on = {}) {
    let p = this.$('gpanel');
    if (!p) { p = document.createElement('section'); p.id = 'gpanel'; p.className = 'gpanel glass'; p.setAttribute('aria-live', 'polite'); this.root.append(p); this._glassEls = null; }
    p.textContent = ''; p.style.display = info ? '' : 'none'; if (!info) return;
    const h = document.createElement('small'); h.textContent = info.title; p.append(h);
    const t = document.createElement('p'); t.textContent = info.text; p.append(t);
    if (info.options) { const row = document.createElement('div'); row.className = 'opts'; info.options.forEach((o, k) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = o; if (info.picked === k) b.classList.add(k === info.answer ? 'ok' : 'bad'); b.onclick = () => on.pick?.(k); row.append(b); }); p.append(row); }
    if (info.canNext) { const n = document.createElement('button'); n.type = 'button'; n.className = 'next'; n.textContent = info.last ? 'Explore freely →' : 'Next step →'; n.onclick = () => on.next?.(); p.append(n); }
  }
  /** The guided-step strip: one chip per step plus Explore. items: [titles]; active: index (>= length = Explore). */
  setSteps(items = [], active = 0, onPick) {
    let s = this.$('steps');
    if (!s) { s = document.createElement('nav'); s.id = 'steps'; s.className = 'steps glass'; s.setAttribute('aria-label', 'Guided steps'); this.root.append(s); this._glassEls = null; }
    s.textContent = ''; s.style.display = items.length ? '' : 'none';
    [...items, 'Explore'].forEach((t, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = k < items.length ? `${k + 1} · ${t}` : t;
      b.classList.toggle('on', k === Math.min(active, items.length)); b.classList.toggle('done', k < active); b.onclick = () => onPick?.(k); s.append(b);
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
