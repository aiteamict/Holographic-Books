// Interaction check for every book: are the 3D controls easy to hit with a finger and with a mouse?
// Run against the dev server with a Playwright page: it is one async function taking `page`. Set BOOKS and MODE.
// For every spread it finds the objects the reader can press (drag handles and other draggable parts; the readout and
// step cards are left out) and samples the screen around each at 3 px steps, casting a ray at every point as the
// book's own press picking does (window.__book.pickAt, near-miss slop included). A point counts only if this object is the first thing the ray hits and the point is
// inside the visible 3D view. The tappable area is reported as an equivalent diameter in CSS pixels.
// Pass marks: phone 44 px (a fingertip), desktop 24 px. Also flagged: a spread whose drag has no button doing the same,
// A part whose centre is caught by a larger hit area
// (a wheel inside the box that drags the axle) is skipped: the finger still lands on something that does its job.
async (page) => {
  const BOOKS = ['irc-2-1968', 'irc-3-1983', ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => `irc-38-1988-${n}`), ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `irc-24-2010-${n}`)];
  const MODE = 'phone';   // 'phone' (390 × 844, touch) or 'desktop' (1400 × 900)
  const phone = MODE === 'phone', W = phone ? 390 : 1400, H = phone ? 844 : 900, NEED = phone ? 44 : 24;
  const cdp = await page.context().newCDPSession(page);
  await page.setViewportSize({ width: W, height: H });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: phone, maxTouchPoints: phone ? 5 : 1 });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: phone ? 2 : 1, mobile: phone });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  const rows = [], summary = {};
  for (const book of BOOKS) {
    await page.goto(`http://localhost:5173/${book}/${phone ? '?phone' : ''}`); await page.bringToFront();
    await page.evaluate(() => document.getElementById('go-quiet').click());
    await page.waitForFunction(() => window.__book?.built, null, { timeout: 30000 });
    let spreads = 0, small = 0;
    for (let k = 1; k <= 12; k++) {
      await page.evaluate(k => window.__book.goTo(k), k);
      if (!await page.evaluate(k => !!window.__book.built[k], k)) break;
      await page.waitForFunction(k => window.__book.built[k].group.visible, k, { timeout: 15000 }); await page.waitForTimeout(1600); spreads++;
      const r = await page.evaluate(({ k, NEED, PHONE }) => {
        const b = window.__book, i = b.built[k], T = b.THREE, cam = b.camera, cv = document.getElementById('c'), R = cv.getBoundingClientRect();
        const panel = document.getElementById('mshell'), P = panel && panel.offsetParent ? panel.getBoundingClientRect() : null;
        const guideCard = i.guide?.card, isCard = o => { for (let q = o; q; q = q.parent) if (q.userData?.zoom || q === guideCard) return true; return false; };
        const active = (i.targets || []).filter(t => t.visible !== false && !isCard(t));
        const ray = new T.Raycaster(), ndc = new T.Vector2(), out = [];
        for (const t of active) {
          t.updateMatrixWorld(true); const box = new T.Box3().setFromObject(t), c = box.getCenter(new T.Vector3()).project(cam);
          const cx = R.left + (c.x + 1) / 2 * R.width, cy = R.top + (1 - c.y) / 2 * R.height;
          let hits = 0; const S = 3, span = 90;
          for (let y = cy - span; y <= cy + span; y += S) for (let x = cx - span; x <= cx + span; x += S) {
            if (x < R.left || x > R.right || y < R.top || y > R.bottom) continue;
            if (P && x >= P.left && x <= P.right && y >= P.top && y <= P.bottom) continue;
            let o = b.pickAt(x, y, PHONE); while (o && o !== t) o = o.parent; if (o === t) hits++;   // the engine's own press picking, near-miss slop included
          }
          const d = 2 * Math.sqrt(hits * S * S / Math.PI);
          ndc.set(c.x, c.y); ray.setFromCamera(ndc, cam); const ch = ray.intersectObjects(i.targets, true)[0];   // a part inside a larger hit area that does its job is not too small
          let owner = ch && ch.object; while (owner && !active.includes(owner)) owner = owner.parent;
          if (d < NEED && owner && owner !== t) continue;
          const name = t.userData.handle || t.name || t.type;
          out.push({ name, d: Math.round(d), ok: d >= NEED, onScreen: cx > R.left && cx < R.right && cy > R.top && cy < (P ? P.top : R.bottom) });
        }
        const drags = !!i.drag, buttons = (i.a11y || i.actions || []).length;
        let zoom = false; i.group.traverse(o => { if (o.userData.zoom) zoom = true; });
        return { targets: out, drags, buttons, zoom };
      }, { k, NEED, PHONE: phone });
      const bad = r.targets.filter(t => !t.ok || !t.onScreen);
      const issues = bad.map(t => `${t.name} ${t.d}px${t.onScreen ? '' : ' off-screen'}`);
      if (r.drags && r.targets.length && !r.buttons) issues.push('drag has no button');

      if (bad.length) small++;
      if (issues.length) rows.push(`${book} ${k}: ${issues.join('; ')}`);
    }
    summary[book] = `${spreads} spreads, ${small} with a control under ${NEED} px`;
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride'); await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
  return { mode: MODE, need: NEED, errs: errs.slice(0, 5), summary, rows };
}
